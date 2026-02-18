
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'automation.db');
const db = new Database(dbPath);

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS test_flows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    steps TEXT NOT NULL, -- Array of atomic steps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  );
`);

// Ensure columns exist (outside of main exec)
try {
    db.exec('ALTER TABLE test_runs ADD COLUMN screenshot TEXT');
} catch(e) {}
try {
    db.exec('ALTER TABLE test_runs ADD COLUMN test_path TEXT');
} catch(e) {}

db.exec(`
  CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    url TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS selectors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_id INTEGER,
    name TEXT NOT NULL,
    selector TEXT NOT NULL,
    type TEXT, -- 'button', 'input', 'text', etc.
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(page_id) REFERENCES pages(id)
  );

  CREATE TABLE IF NOT EXISTS page_tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_id INTEGER,
    name TEXT NOT NULL,
    steps TEXT NOT NULL, -- JSON array of steps
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(page_id) REFERENCES pages(id)
  );

  CREATE TABLE IF NOT EXISTS scheduled_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    test_id INTEGER NOT NULL, -- references test_flows(id) or just a file path/name if ad-hoc
    test_type TEXT DEFAULT 'flow', -- 'flow' or 'file'
    test_name TEXT,
    cron_schedule TEXT NOT NULL,
    active BOOLEAN DEFAULT 1,
    last_run DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed generic Ad-Hoc flow for individual file runs
const check = db.prepare('SELECT id FROM test_flows WHERE id = ?').get(0);
if (!check) {
    db.prepare('INSERT INTO test_flows (id, name, description, steps) VALUES (?, ?, ?, ?)').run(0, 'Ad-Hoc', 'Single file execution', '[]');
}

export default db;
