/**
 * @file server/database/repositories/runsRepo.js
 * @description Repository for pipeline_runs table data access.
 * All SQL for runs and aggregate pipeline metrics is contained strictly within this file.
 */

import { getDb } from '../connection.js';

export const runsRepo = {
  /**
   * Retrieves paginated runs with optional filters.
   */
  findPaginated({ limit = 20, offset = 0, status, projectId, pipelineId, dateFrom, dateTo } = {}, db = getDb()) {
    const conditions = [];
    const params = { limit, offset };

    if (status) {
      conditions.push('pr.status = @status');
      params.status = status;
    }
    if (projectId) {
      conditions.push('p.id = @projectId');
      params.projectId = projectId;
    }
    if (pipelineId) {
      conditions.push('pr.pipeline_id = @pipelineId');
      params.pipelineId = pipelineId;
    }
    if (dateFrom) {
      conditions.push('pr.created_at >= @dateFrom');
      params.dateFrom = dateFrom;
    }
    if (dateTo) {
      conditions.push('pr.created_at <= @dateTo');
      params.dateTo = dateTo;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        pr.*,
        pl.name AS pipeline_name,
        p.id AS project_id,
        p.name AS project_name,
        p.slug AS project_slug,
        p.repository_url,
        p.repo_owner,
        p.repo_name
      FROM pipeline_runs pr
      JOIN pipelines pl ON pr.pipeline_id = pl.id
      JOIN projects p ON pl.project_id = p.id
      ${whereClause}
      ORDER BY pr.created_at DESC
      LIMIT @limit OFFSET @offset
    `;

    return db.prepare(sql).all(params);
  },

  /**
   * Counts total runs matching given filters.
   */
  countFiltered({ status, projectId, pipelineId, dateFrom, dateTo } = {}, db = getDb()) {
    const conditions = [];
    const params = {};

    if (status) {
      conditions.push('pr.status = @status');
      params.status = status;
    }
    if (projectId) {
      conditions.push('p.id = @projectId');
      params.projectId = projectId;
    }
    if (pipelineId) {
      conditions.push('pr.pipeline_id = @pipelineId');
      params.pipelineId = pipelineId;
    }
    if (dateFrom) {
      conditions.push('pr.created_at >= @dateFrom');
      params.dateFrom = dateFrom;
    }
    if (dateTo) {
      conditions.push('pr.created_at <= @dateTo');
      params.dateTo = dateTo;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT COUNT(*) as count
      FROM pipeline_runs pr
      JOIN pipelines pl ON pr.pipeline_id = pl.id
      JOIN projects p ON pl.project_id = p.id
      ${whereClause}
    `;

    const row = db.prepare(sql).get(params);
    return row ? row.count : 0;
  },

  /**
   * Retrieves a single run by ID with full pipeline and project context.
   */
  findById(id, db = getDb()) {
    const sql = `
      SELECT 
        pr.*,
        pl.name AS pipeline_name,
        pl.config_json AS pipeline_config,
        p.id AS project_id,
        p.name AS project_name,
        p.slug AS project_slug,
        p.repository_url,
        p.repo_owner,
        p.repo_name
      FROM pipeline_runs pr
      JOIN pipelines pl ON pr.pipeline_id = pl.id
      JOIN projects p ON pl.project_id = p.id
      WHERE pr.id = ?
    `;
    return db.prepare(sql).get(id);
  },

  /**
   * Generates the next monotonic run number for a pipeline.
   */
  getNextRunNumber(pipelineId, db = getDb()) {
    const row = db.prepare('SELECT MAX(run_number) AS max_num FROM pipeline_runs WHERE pipeline_id = ?').get(pipelineId);
    return (row && row.max_num ? row.max_num : 0) + 1;
  },

  /**
   * Inserts a new run.
   */
  create(run, db = getDb()) {
    const stmt = db.prepare(`
      INSERT INTO pipeline_runs (
        id, pipeline_id, run_number, status, trigger_type, retry_of,
        commit_sha, commit_message, branch, error_message, failing_stage,
        started_at, finished_at, duration_ms, config_snapshot_json, created_at, updated_at
      ) VALUES (
        @id, @pipeline_id, @run_number, @status, @trigger_type, @retry_of,
        @commit_sha, @commit_message, @branch, @error_message, @failing_stage,
        @started_at, @finished_at, @duration_ms, @config_snapshot_json, datetime('now'), datetime('now')
      )
    `);

    stmt.run({
      id: run.id,
      pipeline_id: run.pipeline_id,
      run_number: run.run_number,
      status: run.status || 'pending',
      trigger_type: run.trigger_type || run.triggerType || 'manual',
      retry_of: run.retry_of || run.retryOf || null,
      commit_sha: run.commit_sha,
      commit_message: run.commit_message,
      branch: run.branch || 'main',
      error_message: run.error_message || null,
      failing_stage: run.failing_stage || null,
      started_at: run.started_at || null,
      finished_at: run.finished_at || null,
      duration_ms: run.duration_ms || 0,
      config_snapshot_json: typeof run.config_snapshot_json === 'string'
        ? run.config_snapshot_json
        : JSON.stringify(run.config_snapshot_json || {})
    });

    return this.findById(run.id, db);
  },

  /**
   * Updates the run's execution status, timing, and error information.
   */
  updateStatus(id, updates, db = getDb()) {
    const fields = ['updated_at = datetime(\'now\')'];
    const params = { id };

    if (updates.status !== undefined) {
      fields.push('status = @status');
      params.status = updates.status;
    }
    if (updates.error_message !== undefined) {
      fields.push('error_message = @error_message');
      params.error_message = updates.error_message;
    }
    if (updates.failing_stage !== undefined) {
      fields.push('failing_stage = @failing_stage');
      params.failing_stage = updates.failing_stage;
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

    if (updates.commit_sha !== undefined) {
      fields.push('commit_sha = @commit_sha');
      params.commit_sha = updates.commit_sha;
    }
    if (updates.commit_message !== undefined) {
      fields.push('commit_message = @commit_message');
      params.commit_message = updates.commit_message;
    }
    if (updates.branch !== undefined) {
      fields.push('branch = @branch');
      params.branch = updates.branch;
    }

    const sql = `UPDATE pipeline_runs SET ${fields.join(', ')} WHERE id = @id`;
    db.prepare(sql).run(params);
    return this.findById(id, db);
  },

  /**
   * Retrieves the most recent runs across all pipelines.
   */
  findRecent(limit = 10, db = getDb()) {
    return this.findPaginated({ limit, offset: 0 }, db);
  },

  /**
   * Computes aggregate metrics for dashboard.
   */
  getStats(db = getDb()) {
    const countsRow = db.prepare(`
      SELECT 
        COUNT(*) AS total_runs,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) AS success_runs,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed_runs,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_runs,
        SUM(CASE WHEN status = 'running' THEN 1 ELSE 0 END) AS running_runs,
        AVG(CASE WHEN duration_ms > 0 AND status IN ('success', 'failed') THEN duration_ms ELSE NULL END) AS avg_duration_ms
      FROM pipeline_runs
    `).get();

    const total = countsRow ? countsRow.total_runs : 0;
    const success = countsRow ? countsRow.success_runs || 0 : 0;
    const failed = countsRow ? countsRow.failed_runs || 0 : 0;
    const cancelled = countsRow ? countsRow.cancelled_runs || 0 : 0;
    const running = countsRow ? countsRow.running_runs || 0 : 0;
    const avgDuration = countsRow && countsRow.avg_duration_ms ? Math.round(countsRow.avg_duration_ms) : 0;

    const completed = success + failed;
    const successRate = completed > 0 ? Number(((success / completed) * 100).toFixed(1)) : 0;
    const failureRate = completed > 0 ? Number(((failed / completed) * 100).toFixed(1)) : 0;

    return {
      totalRuns: total,
      successRuns: success,
      failedRuns: failed,
      cancelledRuns: cancelled,
      runningRuns: running,
      successRate,
      failureRate,
      avgDurationMs: avgDuration
    };
  },

  /**
   * Deletes all pipeline runs (clears history).
   */
  clearHistory(db = getDb()) {
    const stmt = db.prepare('DELETE FROM pipeline_runs');
    const result = stmt.run();
    return result.changes;
  }
};

export default runsRepo;
