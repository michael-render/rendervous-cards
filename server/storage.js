import { Render } from '@renderinc/sdk';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const STORAGE_PREFIX = (process.env.OBJECT_STORAGE_PREFIX || 'cards').replace(/^\/+|\/+$/g, '');
const DISK_STORAGE_ROOT = process.env.CARD_STORAGE_PATH || '/mnt/data/cards';
let ensureDiskRootPromise;

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
    return null;
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

function ensureDiskRoot() {
  if (!ensureDiskRootPromise) {
    ensureDiskRootPromise = mkdir(DISK_STORAGE_ROOT, { recursive: true });
  }
  return ensureDiskRootPromise;
}

function cardDirectory(cardId) {
  return path.join(DISK_STORAGE_ROOT, cardId);
}

function diskImagePath(cardId) {
  return path.join(cardDirectory(cardId), 'card.png');
}

function diskThumbnailPath(cardId) {
  return path.join(cardDirectory(cardId), 'thumb.png');
}

async function writeDiskFile(filePath, buffer) {
  await ensureDiskRoot();
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, buffer);
}

async function readDiskFile(filePath) {
  try {
    return await readFile(filePath);
  } catch (err) {
    if (err && typeof err === 'object' && 'code' in err && err.code === 'ENOENT') {
      return null;
    }
    throw err;
  }
}

async function deleteDiskFile(filePath) {
  try {
    await rm(filePath, { force: true });
  } catch (err) {
    if (err && typeof err === 'object' && 'code' in err && err.code === 'ENOENT') {
      return;
    }
    throw err;
  }
}

async function deleteDiskCardDirectory(cardId) {
  try {
    await rm(cardDirectory(cardId), { recursive: true, force: true });
  } catch (err) {
    if (err && typeof err === 'object' && 'code' in err && err.code === 'ENOENT') {
      return;
    }
    throw err;
  }
}

async function readObjectFile(key) {
  const client = getObjectClient();
  if (!client) return null;
  try {
    const object = await client.get({ key });
    return object.data;
  } catch (err) {
    if (isNotFoundError(err)) return null;
    throw err;
  }
}

async function writeObjectFile(key, buffer) {
  const client = getObjectClient();
  if (!client) {
    throw new Error('Object Storage fallback is unavailable (missing owner ID configuration).');
  }
  await client.put({ key, data: buffer });
}

async function deleteObjectFile(key) {
  const client = getObjectClient();
  if (!client) return;
  try {
    await client.delete({ key });
  } catch (err) {
    if (!isNotFoundError(err)) {
      throw err;
    }
  }
}

export async function writeCardImage(cardId, buffer) {
  try {
    await writeDiskFile(diskImagePath(cardId), buffer);
  } catch (diskErr) {
    console.warn(`Disk write failed for card image ${cardId}; falling back to Object Storage:`, diskErr);
    await writeObjectFile(cardImageKey(cardId), buffer);
  }
}

export async function writeCardThumbnail(cardId, buffer) {
  try {
    await writeDiskFile(diskThumbnailPath(cardId), buffer);
  } catch (diskErr) {
    console.warn(
      `Disk write failed for card thumbnail ${cardId}; falling back to Object Storage:`,
      diskErr,
    );
    await writeObjectFile(cardThumbnailKey(cardId), buffer);
  }
}

export async function readCardImage(cardId) {
  const diskBuffer = await readDiskFile(diskImagePath(cardId));
  if (diskBuffer) return diskBuffer;

  const objectBuffer = await readObjectFile(cardImageKey(cardId));
  if (objectBuffer) {
    // Best-effort local cache for legacy object-storage cards.
    await writeDiskFile(diskImagePath(cardId), objectBuffer).catch(() => {});
  }
  return objectBuffer;
}

export async function readCardThumbnail(cardId) {
  const diskBuffer = await readDiskFile(diskThumbnailPath(cardId));
  if (diskBuffer) return diskBuffer;

  const objectBuffer = await readObjectFile(cardThumbnailKey(cardId));
  if (objectBuffer) {
    // Best-effort local cache for legacy object-storage cards.
    await writeDiskFile(diskThumbnailPath(cardId), objectBuffer).catch(() => {});
  }
  return objectBuffer;
}

export async function deleteCardAssets(cardId) {
  await Promise.all([
    deleteDiskFile(diskImagePath(cardId)),
    deleteDiskFile(diskThumbnailPath(cardId)),
    deleteDiskCardDirectory(cardId),
    deleteObjectFile(cardImageKey(cardId)),
    deleteObjectFile(cardThumbnailKey(cardId)),
  ]);
}
