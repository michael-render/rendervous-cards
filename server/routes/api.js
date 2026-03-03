import { Router } from 'express';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import pool from '../db.js';

const router = Router();
const STORAGE = process.env.CARD_STORAGE_PATH || './card-storage';

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
router.post('/cards', async (req, res) => {
  try {
    const { card, answers, image } = req.body;

    if (!card || !answers || !image) {
      return res.status(400).json({ error: 'Missing card, answers, or image' });
    }

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
        JSON.stringify(answers),
      ]
    );

    const { id, created_at } = result.rows[0];

    // Decode base64 image and save full + thumbnail
    const base64Data = image.replace(/^data:image\/png;base64,/, '');
    const imgBuffer = Buffer.from(base64Data, 'base64');

    const cardDir = path.join(STORAGE, id);
    await fs.mkdir(cardDir, { recursive: true });

    await fs.writeFile(path.join(cardDir, 'card.png'), imgBuffer);

    // Generate 300px-wide thumbnail
    await sharp(imgBuffer)
      .resize(300)
      .png({ quality: 80 })
      .toFile(path.join(cardDir, 'thumb.png'));

    res.status(201).json({ id, created_at });
  } catch (err) {
    console.error('POST /cards error:', err);
    res.status(500).json({ error: 'Failed to save card' });
  }
});

// List all cards
router.get('/cards', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, archetype_title, theme, created_at
       FROM cards ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /cards error:', err);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

// Get single card metadata
router.get('/cards/:id', async (req, res) => {
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
router.get('/cards/:id/image', async (req, res) => {
  try {
    const filePath = path.join(STORAGE, req.params.id, 'card.png');
    await fs.access(filePath);
    res.type('image/png').sendFile(path.resolve(filePath));
  } catch {
    res.status(404).json({ error: 'Image not found' });
  }
});

// Serve thumbnail (fallback to full image)
router.get('/cards/:id/thumbnail', async (req, res) => {
  try {
    const thumbPath = path.join(STORAGE, req.params.id, 'thumb.png');
    const fullPath = path.join(STORAGE, req.params.id, 'card.png');

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

// Delete a card
router.delete('/cards/:id', async (req, res) => {
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
