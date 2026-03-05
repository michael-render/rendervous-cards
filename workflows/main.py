import base64
import io
import os
import sys

import requests
from PIL import Image
from render_sdk.workflows import task, start

API_BASE_URL = os.environ.get("API_BASE_URL")
ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN")
REQUEST_TIMEOUT_SECONDS = float(os.environ.get("WORKFLOWS_API_TIMEOUT", "15"))
THUMBNAIL_WIDTH = int(os.environ.get("THUMBNAIL_WIDTH", "300"))


def _require_env(value, name):
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")


def _api_headers():
    return {
        "Authorization": f"Bearer {ADMIN_TOKEN}",
        "Content-Type": "application/json",
    }


def _download_card_image(card_id):
    url = f"{API_BASE_URL}/api/cards/{card_id}/image"
    response = requests.get(url, timeout=REQUEST_TIMEOUT_SECONDS)
    response.raise_for_status()
    return response.content


def _upload_thumbnail(card_id, png_bytes):
    payload = {
        "image": "data:image/png;base64," + base64.b64encode(png_bytes).decode("ascii")
    }
    url = f"{API_BASE_URL}/api/cards/{card_id}/thumbnail"
    response = requests.post(
        url,
        headers=_api_headers(),
        json=payload,
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    response.raise_for_status()


def _generate_thumbnail_bytes(image_bytes):
    with Image.open(io.BytesIO(image_bytes)) as img:
        width, height = img.size
        if width > THUMBNAIL_WIDTH:
            new_height = int(height * THUMBNAIL_WIDTH / width)
            img = img.resize((THUMBNAIL_WIDTH, new_height), Image.LANCZOS)

        output = io.BytesIO()
        img.save(output, format="PNG", optimize=True)
        return output.getvalue()


def _list_card_ids(limit=200):
    offset = 0
    while True:
        url = f"{API_BASE_URL}/api/cards?limit={limit}&offset={offset}"
        response = requests.get(url, timeout=REQUEST_TIMEOUT_SECONDS)
        response.raise_for_status()
        cards = response.json()
        if not cards:
            break
        for card in cards:
            yield card["id"]
        offset += limit


@task
def generate_thumbnail(card_id: str):
    """Generate a thumbnail for a single card by fetching the full image via the API."""
    _require_env(API_BASE_URL, "API_BASE_URL")
    _require_env(ADMIN_TOKEN, "ADMIN_TOKEN")

    image_bytes = _download_card_image(card_id)
    thumb_bytes = _generate_thumbnail_bytes(image_bytes)
    _upload_thumbnail(card_id, thumb_bytes)
    return {"card_id": card_id, "status": "ok"}


@task
def regenerate_all_thumbnails():
    """Rebuild thumbnails for every card using the API."""
    _require_env(API_BASE_URL, "API_BASE_URL")
    _require_env(ADMIN_TOKEN, "ADMIN_TOKEN")

    processed = 0
    for card_id in _list_card_ids():
        image_bytes = _download_card_image(card_id)
        thumb_bytes = _generate_thumbnail_bytes(image_bytes)
        _upload_thumbnail(card_id, thumb_bytes)
        processed += 1

    return {"processed": processed}


if __name__ == "__main__":
    if not API_BASE_URL:
        print("Missing API_BASE_URL environment variable", file=sys.stderr)
        sys.exit(1)
    if not ADMIN_TOKEN:
        print("Missing ADMIN_TOKEN environment variable", file=sys.stderr)
        sys.exit(1)

    start()
