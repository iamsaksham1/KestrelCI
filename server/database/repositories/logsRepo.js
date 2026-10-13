/**
 * @file server/database/repositories/logsRepo.js
 * @description Repository for logs table data access.
 * Stores timestamped diagnostic logs written by each stage executor.
 */

import { getDb } from '../connection.js';

export const logsRepo = {
  /**
   * Retrieves log lines for a specific run, with optional stage or severity filtering.
   */
  findByRunId(runId, { stageId, stageName, level, source } = {}, db = getDb()) {
    const conditions = ['l.run_id = @runId'];
    const params = { runId };

    if (stageId) {
      conditions.push('l.stage_run_id = @stageId');
      params.stageId = stageId;
    }
    if (stageName) {
      conditions.push('sr.stage_name = @stageName');
      params.stageName = stageName;
    }
    if (level) {
      conditions.push('l.level = @level');
      params.level = level;
    }
    if (source) {
      conditions.push('l.source = @source');
      params.source = source;
    }

    const sql = `
      SELECT 
        l.id,
        l.run_id,
        l.stage_run_id,
        l.order_index,
        l.timestamp,
        l.level,
        l.message,
        l.source,
        l.created_at,
        sr.stage_name,
        sr.display_name AS stage_display_name
      FROM logs l
      JOIN stage_runs sr ON l.stage_run_id = sr.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY sr.order_index ASC, l.order_index ASC, l.id ASC
    `;

    return db.prepare(sql).all(params);
  },

  /**
   * Inserts a single log entry.
   */
  create(log, db = getDb()) {
    const stmt = db.prepare(`
      INSERT INTO logs (
        run_id, stage_run_id, order_index, timestamp, level, message, source, created_at
      ) VALUES (
        @run_id, @stage_run_id, @order_index, @timestamp, @level, @message, @source, datetime('now')
      )
    `);

    const result = stmt.run({
      run_id: log.run_id,
      stage_run_id: log.stage_run_id,
      order_index: log.order_index || 0,
      timestamp: log.timestamp || new Date().toISOString(),
      level: log.level || 'info',
      message: log.message,
      source: log.source || 'simulated'
    });

    return { id: result.lastInsertRowid, ...log };
  },

  /**
   * Batch inserts multiple log entries within a transaction.
   */
  createMany(logs, db = getDb()) {
    if (!logs || logs.length === 0) return [];

    const stmt = db.prepare(`
      INSERT INTO logs (
        run_id, stage_run_id, order_index, timestamp, level, message, source, created_at
      ) VALUES (
        @run_id, @stage_run_id, @order_index, @timestamp, @level, @message, @source, datetime('now')
      )
    `);

    const insertBatch = db.transaction((items) => {
      for (const item of items) {
        stmt.run({
          run_id: item.run_id,
          stage_run_id: item.stage_run_id,
          order_index: item.order_index || 0,
          timestamp: item.timestamp || new Date().toISOString(),
          level: item.level || 'info',
          message: item.message,
          source: item.source || 'simulated'
        });
      }
    });

    insertBatch(logs);
    return logs;
  },

  /**
   * Returns total count of log lines for a run.
   */
  countByRunId(runId, db = getDb()) {
    const row = db.prepare('SELECT COUNT(*) as count FROM logs WHERE run_id = ?').get(runId);
    return row ? row.count : 0;
  }
};

export default logsRepo;
