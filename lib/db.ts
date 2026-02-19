
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
    steps TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

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
    type TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(page_id) REFERENCES pages(id)
  );

  CREATE TABLE IF NOT EXISTS page_tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_id INTEGER,
    name TEXT NOT NULL,
    steps TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(page_id) REFERENCES pages(id)
  );

  CREATE TABLE IF NOT EXISTS scheduled_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    test_id INTEGER NOT NULL,
    test_type TEXT DEFAULT 'flow', -- 'flow', 'workflow'
    test_name TEXT,
    cron_schedule TEXT NOT NULL,
    active BOOLEAN DEFAULT 1,
    last_run DATETIME,
    next_run DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- v3.0 New Tables --

  CREATE TABLE IF NOT EXISTS workflows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    definition_json TEXT NOT NULL, -- JSON string of React Flow nodes/edges
    version INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS workflow_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workflow_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME,
    duration_ms INTEGER,
    trigger_type TEXT DEFAULT 'manual', -- 'manual', 'scheduled', 'webhook'
    context_snapshot TEXT, -- JSON snapshot of variables at start
    FOREIGN KEY(workflow_id) REFERENCES workflows(id)
  );

  CREATE TABLE IF NOT EXISTS node_executions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workflow_run_id INTEGER NOT NULL,
    node_id TEXT NOT NULL, -- ID from React Flow
    status TEXT DEFAULT 'pending',
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME,
    duration_ms INTEGER,
    logs TEXT, -- JSON array of log strings
    result_json TEXT, -- Output data from the node
    error_message TEXT,
    FOREIGN KEY(workflow_run_id) REFERENCES workflow_runs(id)
  );

  CREATE TABLE IF NOT EXISTS functions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL, -- JS code body
    param_schema TEXT, -- JSON schema for inputs
    version INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS datasets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL, -- 'csv', 'json'
    content_path TEXT NOT NULL, -- Path to file on disk
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Visual Regression Tables
  CREATE TABLE IF NOT EXISTS visual_baselines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    test_name TEXT NOT NULL, 
    snapshot_name TEXT NOT NULL,
    image_path TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed generic Ad-Hoc flow for individual file runs
const check = db.prepare('SELECT id FROM test_flows WHERE id = ?').get(0);
if (!check) {
    db.prepare('INSERT INTO test_flows (id, name, description, steps) VALUES (?, ?, ?, ?)').run(0, 'Ad-Hoc', 'Single file execution', '[]');
}

export default db;
