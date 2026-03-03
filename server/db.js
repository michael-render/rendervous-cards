import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cards (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      archetype_title TEXT NOT NULL,
      special_ability TEXT NOT NULL,
      side_quest TEXT NOT NULL,
      signature_move TEXT NOT NULL,
      power_source TEXT NOT NULL,
      inventory_items JSONB NOT NULL DEFAULT '[]',
      theme TEXT NOT NULL,
      answers JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  console.log('Database initialized');
}

export default pool;
