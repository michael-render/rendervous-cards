# Render Workflows

This folder contains the Render Workflow tasks used to generate card thumbnails.

## Environment variables

Set these on the Render Workflow service:

- `API_BASE_URL` - Base URL for the API service (for example, `https://rendervous-cards-api.onrender.com`).
- `ADMIN_TOKEN` - Must match the API service's `ADMIN_TOKEN` for the admin-only thumbnail endpoint.
- `THUMBNAIL_WIDTH` (optional) - Defaults to `300`.
- `WORKFLOWS_API_TIMEOUT` (optional) - Defaults to `15` seconds.

## Render setup (high level)

1. Create a new **Workflow** in the Render Dashboard pointing at this repo.
2. Set **Root Directory** to `workflows`.
3. Build command: `pip install -r requirements.txt`
4. Start command: `python main.py`
5. After the workflow deploys, copy the task slug for `generate_thumbnail`.
6. Add that slug to the API service as `WORKFLOW_TASK_GENERATE_THUMBNAIL`.
7. Add `RENDER_API_KEY` to the API service so it can start workflow runs.

## Local development

Run the workflow task server locally:

```
pip install -r requirements.txt
API_BASE_URL=http://localhost:3001 \
ADMIN_TOKEN=your-token \
python main.py
```
