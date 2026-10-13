-- Migration 001: Initial schema for KestrelCI
-- Creates core tables: schema_migrations, projects, pipelines, pipeline_runs, stage_runs, logs, contact_messages

-- Schema migrations tracker table
CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  repository_url TEXT NOT NULL,
  default_branch TEXT NOT NULL DEFAULT 'main',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Pipelines table (belongs to project, stores configuration JSON)
CREATE TABLE IF NOT EXISTS pipelines (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  config_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Pipeline runs table
CREATE TABLE IF NOT EXISTS pipeline_runs (
  id TEXT PRIMARY KEY,
  pipeline_id TEXT NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
  run_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'running', 'success', 'failed', 'cancelled')),
  trigger_type TEXT NOT NULL DEFAULT 'manual' CHECK(trigger_type IN ('manual', 'webhook', 'scheduled', 'retry')),
  retry_of TEXT REFERENCES pipeline_runs(id) ON DELETE SET NULL,
  commit_sha TEXT NOT NULL,
  commit_message TEXT NOT NULL,
  branch TEXT NOT NULL DEFAULT 'main',
  error_message TEXT,
  failing_stage TEXT,
  started_at TEXT,
  finished_at TEXT,
  duration_ms INTEGER DEFAULT 0,
  config_snapshot_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Stage runs table (all 7 stages created at run initialization)
CREATE TABLE IF NOT EXISTS stage_runs (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES pipeline_runs(id) ON DELETE CASCADE,
  stage_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'running', 'success', 'failed', 'skipped')),
  error_message TEXT,
  started_at TEXT,
  finished_at TEXT,
  duration_ms INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Log lines table
CREATE TABLE IF NOT EXISTS logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL REFERENCES pipeline_runs(id) ON DELETE CASCADE,
  stage_run_id TEXT NOT NULL REFERENCES stage_runs(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  level TEXT NOT NULL DEFAULT 'info' CHECK(level IN ('info', 'warn', 'error', 'debug')),
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for fast lookups and reporting
CREATE INDEX IF NOT EXISTS idx_pipelines_project_id ON pipelines(project_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_pipeline_started ON pipeline_runs(pipeline_id, started_at);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_status ON pipeline_runs(status);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_retry_of ON pipeline_runs(retry_of);
CREATE INDEX IF NOT EXISTS idx_stage_runs_run_id ON stage_runs(run_id);
CREATE INDEX IF NOT EXISTS idx_stage_runs_run_order ON stage_runs(run_id, order_index);
CREATE INDEX IF NOT EXISTS idx_logs_run_id ON logs(run_id);
CREATE INDEX IF NOT EXISTS idx_logs_stage_run_id ON logs(stage_run_id);
CREATE INDEX IF NOT EXISTS idx_logs_run_timestamp ON logs(run_id, timestamp);
