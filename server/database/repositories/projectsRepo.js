/**
 * @file server/database/repositories/projectsRepo.js
 * @description Repository for projects table data access.
 * All SQL for projects is contained strictly within this file.
 */

import { getDb } from '../connection.js';

export const projectsRepo = {
  /**
   * Retrieves all projects with their pipeline counts and latest run status.
   */
  findAll(db = getDb()) {
    const stmt = db.prepare(`
      SELECT 
        p.*,
        COUNT(DISTINCT pl.id) AS pipeline_count,
        (
          SELECT pr.status 
          FROM pipeline_runs pr 
          JOIN pipelines pl2 ON pr.pipeline_id = pl2.id 
          WHERE pl2.project_id = p.id 
          ORDER BY pr.started_at DESC, pr.created_at DESC 
          LIMIT 1
        ) AS latest_run_status,
        (
          SELECT pr.finished_at 
          FROM pipeline_runs pr 
          JOIN pipelines pl2 ON pr.pipeline_id = pl2.id 
          WHERE pl2.project_id = p.id 
          ORDER BY pr.started_at DESC, pr.created_at DESC 
          LIMIT 1
        ) AS latest_run_at
      FROM projects p
      LEFT JOIN pipelines pl ON p.id = pl.project_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
    return stmt.all();
  },

  /**
   * Retrieves a single project by ID.
   */
  findById(id, db = getDb()) {
    const stmt = db.prepare(`
      SELECT p.*, COUNT(DISTINCT pl.id) AS pipeline_count
      FROM projects p
      LEFT JOIN pipelines pl ON p.id = pl.project_id
      WHERE p.id = ?
      GROUP BY p.id
    `);
    return stmt.get(id);
  },

  /**
   * Retrieves a project by slug.
   */
  findBySlug(slug, db = getDb()) {
    const stmt = db.prepare('SELECT * FROM projects WHERE slug = ?');
    return stmt.get(slug);
  },

  /**
   * Inserts a new project.
   */
  create(project, db = getDb()) {
    const stmt = db.prepare(`
      INSERT INTO projects (
        id, name, slug, description, repository_url, default_branch, repo_owner, repo_name, created_at, updated_at
      ) VALUES (
        @id, @name, @slug, @description, @repository_url, @default_branch, @repo_owner, @repo_name, datetime('now'), datetime('now')
      )
    `);
    stmt.run({
      id: project.id,
      name: project.name,
      slug: project.slug,
      description: project.description || null,
      repository_url: project.repository_url,
      default_branch: project.default_branch || 'main',
      repo_owner: project.repo_owner || null,
      repo_name: project.repo_name || null
    });
    return this.findById(project.id, db);
  },

  /**
   * Updates project fields (e.g. repo_owner, repo_name, default_branch).
   */
  update(id, updates = {}, db = getDb()) {
    const fields = [];
    const params = { id };

    if (updates.name !== undefined) {
      fields.push('name = @name');
      params.name = updates.name;
    }
    if (updates.description !== undefined) {
      fields.push('description = @description');
      params.description = updates.description;
    }
    if (updates.repository_url !== undefined) {
      fields.push('repository_url = @repository_url');
      params.repository_url = updates.repository_url;
    }
    if (updates.default_branch !== undefined) {
      fields.push('default_branch = @default_branch');
      params.default_branch = updates.default_branch;
    }
    if (updates.repo_owner !== undefined) {
      fields.push('repo_owner = @repo_owner');
      params.repo_owner = updates.repo_owner;
    }
    if (updates.repo_name !== undefined) {
      fields.push('repo_name = @repo_name');
      params.repo_name = updates.repo_name;
    }

    if (fields.length === 0) return this.findById(id, db);

    fields.push("updated_at = datetime('now')");
    const sql = `UPDATE projects SET ${fields.join(', ')} WHERE id = @id`;
    db.prepare(sql).run(params);
    return this.findById(id, db);
  },

  /**
   * Deletes a project by ID (cascades to pipelines, runs, stages, and logs).
   */
  delete(id, db = getDb()) {
    const stmt = db.prepare('DELETE FROM projects WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },

  /**
   * Total count of projects.
   */
  count(db = getDb()) {
    const row = db.prepare('SELECT COUNT(*) as count FROM projects').get();
    return row ? row.count : 0;
  }
};

export default projectsRepo;
