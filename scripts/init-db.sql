-- D1 Database Schema for SilverIce Toolbox
-- Run: wrangler d1 execute silverice-toolbox-db --file=./scripts/init-db.sql

-- Visits table: track page visits with IP+date deduplication
CREATE TABLE IF NOT EXISTS visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  path TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  user_agent TEXT,
  visit_date TEXT NOT NULL,  -- YYYY-MM-DD for daily dedup
  created_at INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_visits_unique ON visits(ip_hash, visit_date, path);
CREATE INDEX IF NOT EXISTS idx_visits_date ON visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_visits_path ON visits(path);

-- Users table: simple account management
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  is_admin INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);

-- Sessions table: token-based sessions
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
