/**
 * @file server/database/repositories/repoAnalysisRepo.js
 * @description Repository for repo_analyses table data access.
 * All SQL for repository analysis metadata and GitHub snapshots is contained strictly within this file.
 */

import { getDb } from '../connection.js';

function parseAnalysisRow(row) {
  if (!row) return null;
  return {
    ...row,
    languages: typeof row.languages_json === 'string' ? JSON.parse(row.languages_json || '{}') : (row.languages_json || {}),
    detected_stack: typeof row.detected_stack_json === 'string' ? JSON.parse(row.detected_stack_json || '{}') : (row.detected_stack_json || {}),
    manifests: typeof row.manifests_json === 'string' ? JSON.parse(row.manifests_json || '[]') : (row.manifests_json || [])
  };
}

export const repoAnalysisRepo = {
  /**
   * Inserts a new repository analysis snapshot.
   */
  create(data, db = getDb()) {
    const stmt = db.prepare(`
      INSERT INTO repo_analyses (
        id, project_id, run_id, owner, repo, branch,
        commit_sha, commit_message, commit_author, commit_date,
        languages_json, detected_stack_json, manifests_json,
        stars, license, fetched_at, rate_limit_remaining, source, created_at
      ) VALUES (
        @id, @project_id, @run_id, @owner, @repo, @branch,
        @commit_sha, @commit_message, @commit_author, @commit_date,
        @languages_json, @detected_stack_json, @manifests_json,
        @stars, @license, @fetched_at, @rate_limit_remaining, @source, datetime('now')
      )
    `);

    const languagesJson = typeof data.languages_json === 'string'
      ? data.languages_json
      : JSON.stringify(data.languages || data.languages_json || {});

    const detectedStackJson = typeof data.detected_stack_json === 'string'
      ? data.detected_stack_json
      : JSON.stringify(data.detected_stack || data.detected_stack_json || {});

    const manifestsJson = typeof data.manifests_json === 'string'
      ? data.manifests_json
      : JSON.stringify(data.manifests || data.manifests_json || []);

    stmt.run({
      id: data.id,
      project_id: data.project_id,
      run_id: data.run_id || null,
      owner: data.owner,
      repo: data.repo,
      branch: data.branch || null,
      commit_sha: data.commit_sha || null,
      commit_message: data.commit_message || null,
      commit_author: data.commit_author || null,
      commit_date: data.commit_date || null,
      languages_json: languagesJson,
      detected_stack_json: detectedStackJson,
      manifests_json: manifestsJson,
      stars: typeof data.stars === 'number' ? data.stars : 0,
      license: data.license || null,
      fetched_at: data.fetched_at || new Date().toISOString(),
      rate_limit_remaining: typeof data.rate_limit_remaining === 'number' ? data.rate_limit_remaining : null,
      source: data.source || 'github_api'
    });

    return this.findById(data.id, db);
  },

  /**
   * Retrieves an analysis snapshot by its unique ID.
   */
  findById(id, db = getDb()) {
    const stmt = db.prepare('SELECT * FROM repo_analyses WHERE id = ?');
    const row = stmt.get(id);
    return parseAnalysisRow(row);
  },

  /**
   * Retrieves the latest analysis snapshot for a given project.
   */
  findLatestByProjectId(projectId, db = getDb()) {
    const stmt = db.prepare(`
      SELECT * FROM repo_analyses
      WHERE project_id = ?
      ORDER BY fetched_at DESC, created_at DESC
      LIMIT 1
    `);
    const row = stmt.get(projectId);
    return parseAnalysisRow(row);
  },

  /**
   * Retrieves the analysis snapshot associated with a pipeline run.
   */
  findLatestByRunId(runId, db = getDb()) {
    const stmt = db.prepare(`
      SELECT * FROM repo_analyses
      WHERE run_id = ?
      ORDER BY fetched_at DESC, created_at DESC
      LIMIT 1
    `);
    const row = stmt.get(runId);
    return parseAnalysisRow(row);
  },

  /**
   * Retrieves the latest cached analysis for an owner/repo/branch combo.
   */
  findByOwnerRepoBranch(owner, repo, branch, db = getDb()) {
    let stmt;
    if (branch) {
      stmt = db.prepare(`
        SELECT * FROM repo_analyses
        WHERE owner = ? AND repo = ? AND (branch = ? OR branch IS NULL)
        ORDER BY fetched_at DESC
        LIMIT 1
      `);
      return parseAnalysisRow(stmt.get(owner, repo, branch));
    } else {
      stmt = db.prepare(`
        SELECT * FROM repo_analyses
        WHERE owner = ? AND repo = ?
        ORDER BY fetched_at DESC
        LIMIT 1
      `);
      return parseAnalysisRow(stmt.get(owner, repo));
    }
  },

  /**
   * Associates a run ID with an existing analysis snapshot.
   */
  linkRun(analysisId, runId, db = getDb()) {
    const stmt = db.prepare('UPDATE repo_analyses SET run_id = ? WHERE id = ?');
    stmt.run(runId, analysisId);
    return this.findById(analysisId, db);
  }
};

export default repoAnalysisRepo;
