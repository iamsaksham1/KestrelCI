/**
 * @file server/services/runService.js
 * @description Business logic layer for pipeline runs, executions, logs, and retries.
 * Coordinates between repositories and the asynchronous pipeline engine.
 */

import runsRepo from '../database/repositories/runsRepo.js';
import stageRunsRepo from '../database/repositories/stageRunsRepo.js';
import logsRepo from '../database/repositories/logsRepo.js';
import pipelinesRepo from '../database/repositories/pipelinesRepo.js';
import pipelineEngine from '../engine/index.js';

import repoAnalysisRepo from '../database/repositories/repoAnalysisRepo.js';

export const runService = {
  /**
   * Starts a new pipeline run.
   * Creates the run and all 7 pending stage rows, launches background execution,
   * and returns 202 Accepted immediately without blocking.
   */
  async triggerRun(pipelineId, options = {}) {
    const pipeline = pipelinesRepo.findById(pipelineId);
    if (!pipeline) {
      const err = new Error(`Pipeline not found with ID '${pipelineId}'`);
      err.statusCode = 404;
      err.code = 'PIPELINE_NOT_FOUND';
      throw err;
    }

    const run = await pipelineEngine.createRun({
      pipelineId,
      triggerType: options.triggerType || 'manual',
      commitSha: options.commitSha,
      commitMessage: options.commitMessage,
      branch: options.branch,
      failAt: options.failAt,
      failureRate: options.failureRate
    });

    // Launch background asynchronous execution
    pipelineEngine.startRunAsync(run.id, { fromOrderIndex: 1 });

    return run;
  },

  /**
   * Lists runs with pagination and filters.
   */
  listRuns({ status, project, pipeline, dateFrom, dateTo, page = 1, limit = 15 } = {}) {
    const offset = (page - 1) * limit;
    const runs = runsRepo.findPaginated({
      status,
      projectId: project,
      pipelineId: pipeline,
      dateFrom,
      dateTo,
      limit,
      offset
    });

    const total = runsRepo.countFiltered({
      status,
      projectId: project,
      pipelineId: pipeline,
      dateFrom,
      dateTo
    });

    return {
      runs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1
      }
    };
  },

  /**
   * Retrieves single run with its 7 ordered stage runs.
   */
  getRunDetails(runId) {
    const run = runsRepo.findById(runId);
    if (!run) {
      const err = new Error(`Pipeline run not found with ID '${runId}'`);
      err.statusCode = 404;
      err.code = 'RUN_NOT_FOUND';
      throw err;
    }

    const stages = stageRunsRepo.findByRunId(runId);
    return {
      ...run,
      stages
    };
  },

  /**
   * Retrieves timestamped logs for a run with optional filtering.
   */
  getRunLogs(runId, { stage, level, source } = {}) {
    const run = runsRepo.findById(runId);
    if (!run) {
      const err = new Error(`Pipeline run not found with ID '${runId}'`);
      err.statusCode = 404;
      err.code = 'RUN_NOT_FOUND';
      throw err;
    }

    const logs = logsRepo.findByRunId(runId, {
      stageName: stage,
      level,
      source
    });

    return {
      runId,
      count: logs.length,
      logs
    };
  },

  /**
   * Retrieves the repository analysis snapshot used by or associated with a run.
   */
  getRunAnalysis(runId) {
    const run = runsRepo.findById(runId);
    if (!run) {
      const err = new Error(`Pipeline run not found with ID '${runId}'`);
      err.statusCode = 404;
      err.code = 'RUN_NOT_FOUND';
      throw err;
    }

    const analysis = repoAnalysisRepo.findLatestByRunId(runId) ||
      (run.project_id && repoAnalysisRepo.findLatestByProjectId(run.project_id)) || null;

    return {
      runId,
      projectId: run.project_id,
      analysis
    };
  },

  /**
   * Retries a failed or cancelled run from the failed stage.
   */
  async retryRun(runId) {
    return pipelineEngine.retryRun(runId);
  },

  /**
   * Cancels an active run.
   */
  async cancelRun(runId) {
    return pipelineEngine.cancelRun(runId);
  },

  /**
   * Clears all run history.
   */
  clearHistory() {
    return runsRepo.clearHistory();
  }
};

export default runService;
