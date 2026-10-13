/**
 * @file server/database/connection.js
 * @description SQLite database connection manager.
 * Provides unified, synchronous SQLite access with WAL mode and foreign key enforcement.
 * Adapts between better-sqlite3 and Node's native node:sqlite DatabaseSync,
 * preserving exact API compatibility across Node versions.
 */

import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import config from '../config/index.js';

const require = createRequire(import.meta.url);

let dbInstance = null;

/**
 * Creates and wraps an SQLite database instance with the standard better-sqlite3 API.
 * @param {string} [customPath] Custom database path (e.g. for testing)
 * @returns {object} Database instance with .prepare(), .exec(), .pragma(), .transaction(), .close()
 */
export function getDb(customPath) {
  if (dbInstance && !customPath) {
    return dbInstance;
  }

  const dbPath = customPath || config.DATABASE_FILE_PATH;

  // Ensure parent directory exists for file-based SQLite
  if (dbPath !== ':memory:') {
    const parentDir = path.dirname(dbPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
  }

  let db;

  // 1. Attempt better-sqlite3 first
  try {
    const BetterSqlite3 = require('better-sqlite3');
    const raw = new BetterSqlite3(dbPath);
    raw.pragma('journal_mode = WAL');
    raw.pragma('foreign_keys = ON');
    raw.pragma('synchronous = NORMAL');
    raw.pragma('busy_timeout = 5000');
    db = raw;
  } catch {
    // 2. Fall back to Node.js native node:sqlite DatabaseSync
    const { DatabaseSync } = require('node:sqlite');
    const raw = new DatabaseSync(dbPath);

    try {
      raw.exec('PRAGMA foreign_keys = ON;');
      raw.exec('PRAGMA journal_mode = WAL;');
      raw.exec('PRAGMA synchronous = NORMAL;');
      raw.exec('PRAGMA busy_timeout = 5000;');
    } catch {
      // Ignore in-memory pragma errors
    }

    db = {
      _raw: raw,
      exec(sql) {
        return raw.exec(sql);
      },
      prepare(sql) {
        const stmt = raw.prepare(sql);
        return {
          all(...args) {
            return stmt.all(...args);
          },
          get(...args) {
            return stmt.get(...args);
          },
          run(...args) {
            return stmt.run(...args);
          }
        };
      },
      pragma(str) {
        try {
          return raw.exec(`PRAGMA ${str};`);
        } catch {
          return null;
        }
      },
      transaction(fn) {
        return (...args) => {
          raw.exec('BEGIN IMMEDIATE');
          try {
            const result = fn(...args);
            raw.exec('COMMIT');
            return result;
          } catch (err) {
            raw.exec('ROLLBACK');
            throw err;
          }
        };
      },
      close() {
        return raw.close();
      }
    };
  }

  // Always remember the active db instance so repositories share it
  dbInstance = db;

  return db;
}

/**
 * Sets an explicit database instance.
 */
export function setDb(db) {
  dbInstance = db;
}

/**
 * Closes the active database connection if open.
 */
export function closeDb() {
  if (dbInstance) {
    try {
      dbInstance.close();
    } catch {
      // Ignored if already closed
    }
    dbInstance = null;
  }
}

export default {
  getDb,
  setDb,
  closeDb
};
