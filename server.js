const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // This tells Express to serve your HTML file!
// Set up the Postgres connection
// Render will provide this URL as an environment variable later
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/dvaroadmap',
  // Required for Render's hosted Postgres:
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Create the table automatically on startup if it doesn't exist
const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_progress (
      user_id VARCHAR(255) PRIMARY KEY,
      progress_data JSONB NOT NULL DEFAULT '{}'
    );
  `);
  console.log("Database initialized");
};
initDB().catch(console.error);


// --- API ENDPOINTS ---

// GET: Fetch user progress
app.get('/api/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      'SELECT progress_data FROM user_progress WHERE user_id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.json({}); // Return empty object if no progress exists yet
    }
    res.json(result.rows[0].progress_data);
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

    // UPSERT: Insert if it doesn't exist, update if it does
    await pool.query(
      `INSERT INTO user_progress (user_id, progress_data) 
       VALUES ($1, $2) 
       ON CONFLICT (user_id) 
       DO UPDATE SET progress_data = $2`,
      [userId, progressData]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error saving progress' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});