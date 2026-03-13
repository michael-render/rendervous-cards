import { Router } from 'express';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import pool from '../db.js';
import { requireOktaAuth } from '../auth.js';

const router = Router();
const STORAGE = process.env.CARD_STORAGE_PATH || './card-storage';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TASKS_BASE_URL = process.env.RENDER_TASKS_URL || 'https://api.render.com';

async function writeThumbnail(imgBuffer, cardDir) {
  await sharp(imgBuffer)
    .resize(300)
    .png({ quality: 80 })
    .toFile(path.join(cardDir, 'thumb.png'));
}

async function triggerThumbnailTask(cardId) {
  const apiKey = process.env.RENDER_API_KEY;
  const taskSlug = process.env.WORKFLOW_TASK_GENERATE_THUMBNAIL;

  if (!apiKey || !taskSlug || !globalThis.fetch) {
    return false;
  }

  try {
    const response = await fetch(`${TASKS_BASE_URL}/v1/task-runs`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task: taskSlug,
        input: [cardId],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error('Failed to start thumbnail workflow:', response.status, body);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Failed to start thumbnail workflow:', err);
    return false;
  }
}

// Validate :id is a UUID before any path construction
function validateId(req, res, next) {
  if (!UUID_RE.test(req.params.id)) {
    return res.status(400).json({ error: 'Invalid card ID' });
  }
  next();
}

// Admin auth for destructive operations
function requireAdmin(req, res, next) {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return res.status(503).json({ error: 'Admin access not configured' });
  const auth = req.headers.authorization;
  if (auth !== `Bearer ${token}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Health check
router.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(503).json({ status: 'error', message: err.message });
  }
});

// Save a new card
router.post('/cards', requireOktaAuth, async (req, res) => {
  try {
    const { card, answers, image } = req.body;

    if (!card || !answers || !image) {
      return res.status(400).json({ error: 'Missing card, answers, or image' });
    }

    // Strip photoUrl from answers to avoid storing large base64 in DB
    const { photoUrl, ...answersWithoutPhoto } = answers;

    const result = await pool.query(
      `INSERT INTO cards (name, archetype_title, special_ability, side_quest, signature_move, power_source, inventory_items, theme, answers)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, created_at`,
      [
        card.name,
        card.archetypeTitle,
        card.specialAbility,
        card.sideQuest,
        card.signatureMove,
        card.powerSource,
        JSON.stringify(card.inventoryItems),
        card.theme,
        JSON.stringify(answersWithoutPhoto),
      ]
    );

    const { id, created_at } = result.rows[0];

    // Decode base64 image and save full + thumbnail
    const base64Data = image.replace(/^data:image\/[^;]+;base64,/, '');
    const imgBuffer = Buffer.from(base64Data, 'base64');

    const cardDir = path.join(STORAGE, id);
    await fs.mkdir(cardDir, { recursive: true });

    await fs.writeFile(path.join(cardDir, 'card.png'), imgBuffer);

    const triggered = await triggerThumbnailTask(id);
    if (!triggered) {
      // Fallback to local thumbnail generation when workflows are not configured.
      await writeThumbnail(imgBuffer, cardDir);
    }

    res.status(201).json({ id, created_at });
  } catch (err) {
    console.error('POST /cards error:', err);
    res.status(500).json({ error: 'Failed to save card' });
  }
});

// List cards (paginated)
router.get('/cards', requireOktaAuth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 200);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);

    const result = await pool.query(
      `SELECT id, name, archetype_title, theme, created_at
       FROM cards ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /cards error:', err);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

// Upload/update thumbnail (admin only, used by workflows)
router.post('/cards/:id/thumbnail', validateId, requireAdmin, async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Missing image' });
    }

    const base64Data = image.replace(/^data:image\/[^;]+;base64,/, '');
    const imgBuffer = Buffer.from(base64Data, 'base64');

    const cardDir = path.join(STORAGE, req.params.id);
    await fs.mkdir(cardDir, { recursive: true });
    await fs.writeFile(path.join(cardDir, 'thumb.png'), imgBuffer);

    res.json({ updated: true });
  } catch (err) {
    console.error('POST /cards/:id/thumbnail error:', err);
    res.status(500).json({ error: 'Failed to save thumbnail' });
  }
});

// Get single card metadata
router.get('/cards/:id', validateId, requireOktaAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM cards WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('GET /cards/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch card' });
  }
});

// Serve full card image
router.get('/cards/:id/image', validateId, async (req, res) => {
  try {
    const filePath = path.join(STORAGE, req.params.id, 'card.png');
    await fs.access(filePath);
    res.set('Cache-Control', 'public, max-age=86400');
    res.type('image/png').sendFile(path.resolve(filePath));
  } catch {
    res.status(404).json({ error: 'Image not found' });
  }
});

// Serve thumbnail (fallback to full image)
router.get('/cards/:id/thumbnail', validateId, async (req, res) => {
  try {
    const thumbPath = path.join(STORAGE, req.params.id, 'thumb.png');
    const fullPath = path.join(STORAGE, req.params.id, 'card.png');

    res.set('Cache-Control', 'public, max-age=86400');

    try {
      await fs.access(thumbPath);
      return res.type('image/png').sendFile(path.resolve(thumbPath));
    } catch {
      await fs.access(fullPath);
      return res.type('image/png').sendFile(path.resolve(fullPath));
    }
  } catch {
    res.status(404).json({ error: 'Image not found' });
  }
});

// Delete a card (admin only)
router.delete('/cards/:id', validateId, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM cards WHERE id = $1 RETURNING id`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Remove image files
    const cardDir = path.join(STORAGE, req.params.id);
    await fs.rm(cardDir, { recursive: true, force: true });

    res.json({ deleted: true });
  } catch (err) {
    console.error('DELETE /cards/:id error:', err);
    res.status(500).json({ error: 'Failed to delete card' });
  }
});

export default router;
