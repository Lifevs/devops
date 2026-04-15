const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // This tells Express to serve your HTML file!

const dataDir = path.join(__dirname, 'data');
const dbFile = path.join(dataDir, 'db.json');
let dbMode = 'postgres';
let pool;

const createPostgresPool = () => new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/dvaroadmap',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

const initLocalDB = async () => {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dbFile);
  } catch {
    await fs.writeFile(dbFile, JSON.stringify({ user_progress: {} }, null, 2));
  }
};

const readLocalDB = async () => {
  const contents = await fs.readFile(dbFile, 'utf8');
  return JSON.parse(contents);
};

const writeLocalDB = async (data) => {
  await fs.writeFile(dbFile, JSON.stringify(data, null, 2));
};

const getLocalProgress = async (userId) => {
  const db = await readLocalDB();
  return db.user_progress[userId] || {};
};

const saveLocalProgress = async (userId, progressData) => {
  const db = await readLocalDB();
  db.user_progress[userId] = progressData;
  await writeLocalDB(db);
};

const initDB = async () => {
  pool = createPostgresPool();

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        user_id VARCHAR(255) PRIMARY KEY,
        progress_data JSONB NOT NULL DEFAULT '{}'
      );
    `);
    console.log('Postgres database initialized');
  } catch (err) {
    console.error('Postgres not available, falling back to local JSON storage:', err.message);
    dbMode = 'local';
    await initLocalDB();
    console.log('Local JSON database initialized at', dbFile);
  }
};
initDB().catch((err) => {
  console.error('Initialization error:', err);
  process.exit(1);
});

const getUserProgress = async (userId) => {
  if (dbMode === 'postgres') {
    const result = await pool.query(
      'SELECT progress_data FROM user_progress WHERE user_id = $1',
      [userId]
    );
    return result.rows.length > 0 ? result.rows[0].progress_data : {};
  }

  return getLocalProgress(userId);
};

const saveUserProgress = async (userId, progressData) => {
  if (dbMode === 'postgres') {
    await pool.query(
      `INSERT INTO user_progress (user_id, progress_data)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET progress_data = $2`,
      [userId, progressData]
    );
    return;
  }

  await saveLocalProgress(userId, progressData);
};

// --- API ENDPOINTS ---

// GET: Fetch user progress
app.get('/api/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const progress = await getUserProgress(userId);
    res.json(progress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching progress' });
  }
});

// POST: Update user progress
app.post('/api/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const progressData = req.body;
    await saveUserProgress(userId, progressData);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error saving progress' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database mode: ${dbMode}`);
});