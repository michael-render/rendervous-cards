import { Render } from '@renderinc/sdk';

const STORAGE_PREFIX = (process.env.OBJECT_STORAGE_PREFIX || 'cards').replace(/^\/+|\/+$/g, '');

function resolveRegion() {
  const candidates = [
    process.env.OBJECT_STORAGE_REGION,
    process.env.RENDER_REGION,
    'oregon',
  ];

  for (const candidate of candidates) {
    const region = (candidate || '').trim().toLowerCase();
    if (!region) continue;

    // Ignore unresolved template placeholders like "{region}" / "%7Bregion%7D".
    if (region.includes('{') || region.includes('}') || region.includes('%7b') || region.includes('%7d')) {
      continue;
    }

    return region;
  }

  return 'oregon';
}

const OBJECT_STORAGE_REGION = resolveRegion();

function resolveOwnerId() {
  return (
    process.env.OBJECT_STORAGE_OWNER_ID ||
    process.env.RENDER_WORKSPACE_ID ||
    process.env.RENDER_SERVICE_OWNER_ID ||
    process.env.RENDER_OWNER_ID ||
    ''
  );
}

function getObjectClient() {
  const ownerId = resolveOwnerId();

  if (!ownerId) {
    throw new Error(
      'Object Storage owner ID missing. Set OBJECT_STORAGE_OWNER_ID or RENDER_WORKSPACE_ID.',
    );
  }

  const render = new Render();
  return render.experimental.storage.objects.scoped({
    ownerId,
    region: OBJECT_STORAGE_REGION,
  });
}

function cardImageKey(cardId) {
  return `${STORAGE_PREFIX}/${cardId}/card.png`;
}

function cardThumbnailKey(cardId) {
  return `${STORAGE_PREFIX}/${cardId}/thumb.png`;
}

function isNotFoundError(err) {
  return err && typeof err === 'object' && 'statusCode' in err && err.statusCode === 404;
}

export async function writeCardImage(cardId, buffer) {
  const client = getObjectClient();
  await client.put({
    key: cardImageKey(cardId),
    data: buffer,
    contentType: 'image/png',
  });
}

export async function writeCardThumbnail(cardId, buffer) {
  const client = getObjectClient();
  await client.put({
    key: cardThumbnailKey(cardId),
    data: buffer,
    contentType: 'image/png',
  });
}

export async function readCardImage(cardId) {
  const client = getObjectClient();
  try {
    const object = await client.get({ key: cardImageKey(cardId) });
    return object.data;
  } catch (err) {
    if (isNotFoundError(err)) return null;
    throw err;
  }
}

export async function readCardThumbnail(cardId) {
  const client = getObjectClient();
  try {
    const object = await client.get({ key: cardThumbnailKey(cardId) });
    return object.data;
  } catch (err) {
    if (isNotFoundError(err)) return null;
    throw err;
  }
}

export async function deleteCardAssets(cardId) {
  const client = getObjectClient();
  const keys = [cardImageKey(cardId), cardThumbnailKey(cardId)];

  await Promise.all(
    keys.map(async (key) => {
      try {
        await client.delete({ key });
      } catch (err) {
        if (!isNotFoundError(err)) {
          throw err;
        }
      }
    }),
  );
}
