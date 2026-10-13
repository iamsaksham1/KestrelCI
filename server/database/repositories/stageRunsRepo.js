/**
 * @file server/database/repositories/stageRunsRepo.js
 * @description Repository for stage_runs table data access.
 * Manages the 7 pipeline stages, their sequential execution states, and skipping logic.
 */

import { getDb } from '../connection.js';

export const stageRunsRepo = {
  /**
   * Retrieves all stage runs for a specific pipeline run, ordered by order_index.
   */
  findByRunId(runId, db = getDb()) {
    const stmt = db.prepare(`
      SELECT * 
      FROM stage_runs 
      WHERE run_id = ? 
      ORDER BY order_index ASC
    `);
    return stmt.all(runId);
  },

  /**
   * Retrieves a single stage run by ID.
   */
  findById(id, db = getDb()) {
    const stmt = db.prepare('SELECT * FROM stage_runs WHERE id = ?');
    return stmt.get(id);
  },

  /**
   * Retrieves a specific stage by run ID and stage name.
   */
  findByRunAndStage(runId, stageName, db = getDb()) {
    const stmt = db.prepare('SELECT * FROM stage_runs WHERE run_id = ? AND stage_name = ?');
    return stmt.get(runId, stageName);
  },

  /**
   * Batch creates all stage runs for a run within a transaction.
   * Ensures that the complete 7-stage pipeline exists in the database immediately upon run creation.
   */
  createMany(stages, db = getDb()) {
    const stmt = db.prepare(`
      INSERT INTO stage_runs (
        id, run_id, stage_name, display_name, order_index, status, source,
        error_message, started_at, finished_at, duration_ms, created_at, updated_at
      ) VALUES (
        @id, @run_id, @stage_name, @display_name, @order_index, @status, @source,
        @error_message, @started_at, @finished_at, @duration_ms, datetime('now'), datetime('now')
      )
    `);

    const insertAll = db.transaction((items) => {
      for (const item of items) {
        stmt.run({
          id: item.id,
          run_id: item.run_id,
          stage_name: item.stage_name,
          display_name: item.display_name,
          order_index: item.order_index,
          status: item.status || 'pending',
          source: item.source || 'simulated',
          error_message: item.error_message || null,
          started_at: item.started_at || null,
          finished_at: item.finished_at || null,
          duration_ms: item.duration_ms || 0
        });
      }
    });

    insertAll(stages);
    return this.findByRunId(stages[0]?.run_id, db);
  },

  /**
   * Updates an individual stage's execution state, source, and timing metrics.
   */
  updateStatus(id, updates, db = getDb()) {
    const fields = ['updated_at = datetime(\'now\')'];
    const params = { id };

    if (updates.status !== undefined) {
      fields.push('status = @status');
      params.status = updates.status;
    }
    if (updates.source !== undefined) {
      fields.push('source = @source');
      params.source = updates.source;
    }
    if (updates.error_message !== undefined) {
      fields.push('error_message = @error_message');
      params.error_message = updates.error_message;
    }
    if (updates.started_at !== undefined) {
      fields.push('started_at = @started_at');
      params.started_at = updates.started_at;
    }
    if (updates.finished_at !== undefined) {
      fields.push('finished_at = @finished_at');
      params.finished_at = updates.finished_at;
    }
    if (updates.duration_ms !== undefined) {
      fields.push('duration_ms = @duration_ms');
      params.duration_ms = updates.duration_ms;
    }

    const sql = `UPDATE stage_runs SET ${fields.join(', ')} WHERE id = @id`;
    db.prepare(sql).run(params);
    return this.findById(id, db);
  },

  /**
   * Marks all subsequent stages as 'skipped' following a stage failure or run cancellation.
   */
  skipRemainingStages(runId, fromOrderIndex, db = getDb()) {
    const stmt = db.prepare(`
      UPDATE stage_runs 
      SET status = 'skipped', updated_at = datetime('now')
      WHERE run_id = ? AND order_index >= ? AND status = 'pending'
    `);
    const result = stmt.run(runId, fromOrderIndex);
    return result.changes;
  }
};

export default stageRunsRepo;
