/**
 * @file server/database/repositories/pipelinesRepo.js
 * @description Repository for pipelines table data access.
 * All SQL for pipelines is contained strictly within this file.
 */

import { getDb } from '../connection.js';

export const pipelinesRepo = {
  /**
   * Retrieves all pipelines belonging to a project.
   */
  findByProjectId(projectId, db = getDb()) {
    const stmt = db.prepare(`
      SELECT 
        pl.*,
        p.name AS project_name,
        p.slug AS project_slug,
        COUNT(pr.id) AS total_runs,
        (
          SELECT status 
          FROM pipeline_runs 
          WHERE pipeline_id = pl.id 
          ORDER BY started_at DESC, created_at DESC 
          LIMIT 1
        ) AS latest_run_status,
        (
          SELECT id 
          FROM pipeline_runs 
          WHERE pipeline_id = pl.id 
          ORDER BY started_at DESC, created_at DESC 
          LIMIT 1
        ) AS latest_run_id,
        (
          SELECT finished_at 
          FROM pipeline_runs 
          WHERE pipeline_id = pl.id 
          ORDER BY started_at DESC, created_at DESC 
          LIMIT 1
        ) AS latest_run_at
      FROM pipelines pl
      JOIN projects p ON pl.project_id = p.id
      LEFT JOIN pipeline_runs pr ON pl.id = pr.pipeline_id
      WHERE pl.project_id = ?
      GROUP BY pl.id
      ORDER BY pl.created_at ASC
    `);
    return stmt.all(projectId);
  },

  /**
   * Retrieves a single pipeline by ID with parent project info.
   */
  findById(id, db = getDb()) {
    const stmt = db.prepare(`
      SELECT 
        pl.*,
        p.name AS project_name,
        p.slug AS project_slug,
        p.default_branch,
        p.repository_url
      FROM pipelines pl
      JOIN projects p ON pl.project_id = p.id
      WHERE pl.id = ?
    `);
    return stmt.get(id);
  },

  /**
   * Creates a new pipeline.
   */
  create(pipeline, db = getDb()) {
    const stmt = db.prepare(`
      INSERT INTO pipelines (
        id, project_id, name, config_json, created_at, updated_at
      ) VALUES (
        @id, @project_id, @name, @config_json, datetime('now'), datetime('now')
      )
    `);
    stmt.run({
      id: pipeline.id,
      project_id: pipeline.project_id,
      name: pipeline.name,
      config_json: typeof pipeline.config_json === 'string'
        ? pipeline.config_json
        : JSON.stringify(pipeline.config_json || {})
    });
    return this.findById(pipeline.id, db);
  },

  /**
   * Updates an existing pipeline's configuration or name.
   */
  update(id, updates, db = getDb()) {
    const fields = [];
    const params = { id };

    if (updates.name !== undefined) {
      fields.push('name = @name');
      params.name = updates.name;
    }
    if (updates.config_json !== undefined) {
      fields.push('config_json = @config_json');
      params.config_json = typeof updates.config_json === 'string'
        ? updates.config_json
        : JSON.stringify(updates.config_json);
    }

    if (fields.length === 0) return this.findById(id, db);

    fields.push("updated_at = datetime('now')");

    const sql = `UPDATE pipelines SET ${fields.join(', ')} WHERE id = @id`;
    db.prepare(sql).run(params);
    return this.findById(id, db);
  },

  /**
   * Total count of pipelines.
   */
  count(db = getDb()) {
    const row = db.prepare('SELECT COUNT(*) as count FROM pipelines').get();
    return row ? row.count : 0;
  }
};

export default pipelinesRepo;
