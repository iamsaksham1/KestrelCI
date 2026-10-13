-- Migration 002: GitHub Repository Analysis & Stage/Log Provenance Tracking

-- Add repo_owner and repo_name columns to projects
ALTER TABLE projects ADD COLUMN repo_owner TEXT;
ALTER TABLE projects ADD COLUMN repo_name TEXT;

-- Create repo_analyses table
CREATE TABLE IF NOT EXISTS repo_analyses (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  run_id TEXT REFERENCES pipeline_runs(id) ON DELETE SET NULL,
  owner TEXT NOT NULL,
  repo TEXT NOT NULL,
  branch TEXT,
  commit_sha TEXT,
  commit_message TEXT,
  commit_author TEXT,
  commit_date TEXT,
  languages_json TEXT NOT NULL DEFAULT '{}',
  detected_stack_json TEXT NOT NULL DEFAULT '{}',
  manifests_json TEXT NOT NULL DEFAULT '[]',
  stars INTEGER DEFAULT 0,
  license TEXT,
  fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
  rate_limit_remaining INTEGER,
  source TEXT NOT NULL DEFAULT 'github_api',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Add source column to stage_runs (real | simulated)
ALTER TABLE stage_runs ADD COLUMN source TEXT NOT NULL DEFAULT 'simulated' CHECK(source IN ('real', 'simulated'));

-- Add source column to logs (real | simulated)
ALTER TABLE logs ADD COLUMN source TEXT NOT NULL DEFAULT 'simulated' CHECK(source IN ('real', 'simulated'));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_repo_analyses_project_fetched ON repo_analyses(project_id, fetched_at);
CREATE INDEX IF NOT EXISTS idx_repo_analyses_commit_sha ON repo_analyses(commit_sha);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_commit_sha ON pipeline_runs(commit_sha);
