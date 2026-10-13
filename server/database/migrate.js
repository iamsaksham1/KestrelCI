/**
 * @file server/database/migrate.js
 * @description Lightweight, robust migration runner for KestrelCI SQLite database.
 * Scans SQL migration files, executes pending migrations in a transaction,
 * and maintains schema_migrations history.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb } from './connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATIONS_DIR = path.resolve(__dirname, 'migrations');

/**
 * Runs all pending migrations.
 * @param {import('better-sqlite3').Database} [db] Optional DB instance
 * @returns {number} Count of applied migrations
 */
export function runMigrations(db = getDb()) {
  // Ensure schema_migrations exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const appliedRows = db.prepare('SELECT version FROM schema_migrations ORDER BY version ASC').all();
  const appliedVersions = new Set(appliedRows.map(r => r.version));

  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.log('No migrations directory found.');
    return 0;
  }

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  let appliedCount = 0;

  for (const file of files) {
    const match = file.match(/^(\d+)_(.+)\.sql$/);
    if (!match) {
      console.warn(`⚠️ Skipping migration file with invalid name format: ${file}`);
      continue;
    }

    const version = parseInt(match[1], 10);
    const name = match[2];

    if (appliedVersions.has(version)) {
      continue;
    }

    const sqlContent = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');

    // Run each migration in a transaction
    const executeMigration = db.transaction(() => {
      db.exec(sqlContent);
      db.prepare('INSERT INTO schema_migrations (version, name) VALUES (?, ?)').run(version, name);
    });

    try {
      executeMigration();
      console.log(`✅ Applied migration: ${file} (v${version})`);
      appliedCount++;
    } catch (err) {
      console.error(`❌ Failed migration: ${file}`);
      throw err;
    }
  }

  if (appliedCount === 0) {
    console.log('✨ Database schema is up to date. No pending migrations.');
  } else {
    console.log(`🚀 Successfully applied ${appliedCount} migration(s).`);
  }

  return appliedCount;
}

// Execute if invoked directly from CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    runMigrations();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

export default runMigrations;
