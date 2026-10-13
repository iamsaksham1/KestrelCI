/**
 * @file server/engine/pipelineEngine.js
 * @description Core asynchronous pipeline execution engine for KestrelCI.
 * Executes stages sequentially, persists real-time state and logs,
 * handles deterministic failure injection, skip propagation, retries, and cancellation.
 */

import crypto from 'crypto';
import registry from './registry.js';
import runsRepo from '../database/repositories/runsRepo.js';
import stageRunsRepo from '../database/repositories/stageRunsRepo.js';
import logsRepo from '../database/repositories/logsRepo.js';
import pipelinesRepo from '../database/repositories/pipelinesRepo.js';
import repoAnalysisRepo from '../database/repositories/repoAnalysisRepo.js';

// In-memory registry of actively running pipelines for live cancellation
const activeRuns = new Map();

export class PipelineEngine {
  constructor() {
    this.registry = registry;
    this.activeRuns = activeRuns;
  }

  /**
   * Initializes a run in the database and creates all 7 stage rows in 'pending' state.
   * Returns immediately so the caller can return HTTP 202.
   */
  async createRun({
    pipelineId,
    triggerType = 'manual',
    commitSha,
    commitMessage,
    branch,
    failAt = null,
    failureRate = 1.0,
    retryOf = null
  }) {
    const pipeline = pipelinesRepo.findById(pipelineId);
    if (!pipeline) {
      throw new Error(`Pipeline not found: ${pipelineId}`);
    }

    let parsedConfig = {};
    try {
      parsedConfig = typeof pipeline.config_json === 'string'
        ? JSON.parse(pipeline.config_json || '{}')
        : (pipeline.config_json || {});
    } catch {
      parsedConfig = {};
    }

    // Merge pipeline config with per-run overrides
    const effectiveConfig = {
      ...parsedConfig,
      failAt: failAt !== undefined ? failAt : parsedConfig.failAt,
      failureRate: failureRate !== undefined ? failureRate : (parsedConfig.failureRate || 1.0)
    };

    const runNumber = runsRepo.getNextRunNumber(pipelineId);
    const runId = `run_${Date.now().toString(36)}_${crypto.randomBytes(3).toString('hex')}`;

    const randomSha = crypto.randomBytes(4).toString('hex');
    const finalSha = commitSha || randomSha;
    const finalMessage = commitMessage || `Automated build dispatch (${finalSha.substring(0, 7)})`;
    const finalBranch = branch || pipeline.default_branch || 'main';

    // 1. Create pipeline_run
    const run = runsRepo.create({
      id: runId,
      pipeline_id: pipelineId,
      run_number: runNumber,
      status: 'pending',
      trigger_type: triggerType,
      retry_of: retryOf,
      commit_sha: finalSha,
      commit_message: finalMessage,
      branch: finalBranch,
      config_snapshot_json: effectiveConfig
    });

    // 2. Create all 7 stage rows as pending
    const stageDefs = this.registry.getStageDefinitions();
    const stageRows = stageDefs.map(def => ({
      id: `stage_${runId}_${def.name}`,
      run_id: runId,
      stage_name: def.name,
      display_name: def.displayName,
      order_index: def.orderIndex,
      status: 'pending'
    }));

    stageRunsRepo.createMany(stageRows);

    return runsRepo.findById(runId);
  }

  /**
   * Starts background execution of a run.
   * Not awaited in request handler; runs asynchronously.
   */
  startRunAsync(runId, { fromOrderIndex = 1 } = {}) {
    // Fire and forget in the background
    setImmediate(async () => {
      try {
        await this.executeRun(runId, { fromOrderIndex });
      } catch (err) {
        // If run was already cancelled or cleaned up, ignore
        if (err.message !== 'STAGE_CANCELLED') {
          console.error(`[Engine] Unexpected error during run ${runId}:`, err);
        }
      }
    });
  }

  /**
   * Main sequential execution loop.
   */
  async executeRun(runId, { fromOrderIndex = 1 } = {}) {
    const run = runsRepo.findById(runId);
    if (!run) return;

    let runConfig = {};
    try {
      runConfig = typeof run.config_snapshot_json === 'string'
        ? JSON.parse(run.config_snapshot_json || '{}')
        : (run.config_snapshot_json || {});
    } catch {
      runConfig = {};
    }

    const cancellationToken = { isCancelled: false };
    this.activeRuns.set(runId, cancellationToken);

    const startedAt = new Date().toISOString();
    const startTimeMs = Date.now();

    runsRepo.updateStatus(runId, {
      status: 'running',
      started_at: startedAt
    });

    const stages = stageRunsRepo.findByRunId(runId);
    let runFailed = false;
    let failingStageName = null;
    let failureErrorMessage = null;

    for (const stage of stages) {
      if (stage.order_index < fromOrderIndex) {
        // In a retry, previous successful stages remain success
        continue;
      }

      if (cancellationToken.isCancelled) {
        stageRunsRepo.skipRemainingStages(runId, stage.order_index);
        runsRepo.updateStatus(runId, {
          status: 'cancelled',
          finished_at: new Date().toISOString(),
          duration_ms: Date.now() - startTimeMs
        });
        this.activeRuns.delete(runId);
        return;
      }

      const executor = this.registry.get(stage.stage_name);
      if (!executor) {
        console.warn(`[Engine] No executor registered for stage: ${stage.stage_name}`);
        continue;
      }

      // Mark stage running
      const stageStart = new Date().toISOString();
      stageRunsRepo.updateStatus(stage.id, {
        status: 'running',
        started_at: stageStart
      });

      // Check failure injection
      let shouldFail = false;
      let failureReason = null;
      if (runConfig.failAt === stage.stage_name) {
        const rate = typeof runConfig.failureRate === 'number' ? runConfig.failureRate : 1.0;
        if (Math.random() <= rate) {
          shouldFail = true;
          failureReason = runConfig.failureMessage || `Deterministic simulated failure injected at stage '${stage.display_name}'`;
        }
      }

      let stageResult;
      try {
        stageResult = await executor.run({
          runId,
          stageRunId: stage.id,
          stageName: stage.stage_name,
          displayName: stage.display_name,
          commitSha: run.commit_sha,
          branch: run.branch,
          config: runConfig,
          projectId: run.project_id,
          pipelineId: run.pipeline_id,
          repositoryUrl: run.repository_url,
          shouldFail,
          failureReason,
          checkCancelled: () => cancellationToken.isCancelled
        });
      } catch (err) {
        if (err.message === 'STAGE_CANCELLED' || cancellationToken.isCancelled) {
          stageRunsRepo.updateStatus(stage.id, {
            status: 'skipped',
            finished_at: new Date().toISOString()
          });
          stageRunsRepo.skipRemainingStages(runId, stage.order_index + 1);
          runsRepo.updateStatus(runId, {
            status: 'cancelled',
            finished_at: new Date().toISOString(),
            duration_ms: Date.now() - startTimeMs
          });
          this.activeRuns.delete(runId);
          return;
        }

        stageResult = {
          status: 'failed',
          source: 'simulated',
          error: err.message || 'Unknown stage execution error',
          durationMs: 500,
          logs: [
            { level: 'error', source: 'simulated', message: `[simulated] Execution exception in ${stage.stage_name}: ${err.message}` }
          ]
        };
      }

      // Check if cancelled during stage execution
      if (cancellationToken.isCancelled) {
        this.activeRuns.delete(runId);
        return;
      }

      const stageSource = stageResult.source || 'simulated';

      // If real commit metadata was fetched from GitHub, update the run row and in-memory context
      if (stageResult.realMetadata) {
        const { commitSha, commitMessage, branch, analysisId } = stageResult.realMetadata;
        if (commitSha) run.commit_sha = commitSha;
        if (branch) run.branch = branch;
        if (commitMessage) run.commit_message = commitMessage;

        try {
          runsRepo.updateStatus(runId, {
            commit_sha: run.commit_sha,
            commit_message: run.commit_message,
            branch: run.branch
          });
        } catch {
          // Non-critical if run row update encounters transient lock
        }

        if (analysisId) {
          try {
            repoAnalysisRepo.linkRun(analysisId, runId);
          } catch {
            // Ignore linking error
          }
        }
      }

      // Persist logs with source tag (REAL or SIMULATED)
      if (stageResult.logs && stageResult.logs.length > 0) {
        try {
          const logEntries = stageResult.logs.map((l, idx) => ({
            run_id: runId,
            stage_run_id: stage.id,
            order_index: idx,
            timestamp: new Date().toISOString(),
            level: l.level || 'info',
            source: l.source || stageSource,
            message: l.message
          }));
          logsRepo.createMany(logEntries);
        } catch {
          // If run database was cleaned up during testing, skip
        }
      }

      const stageEnd = new Date().toISOString();

      if (stageResult.status === 'failed') {
        runFailed = true;
        failingStageName = stage.stage_name;
        failureErrorMessage = stageResult.error || 'Stage failed execution';

        stageRunsRepo.updateStatus(stage.id, {
          status: 'failed',
          source: stageSource,
          error_message: failureErrorMessage,
          finished_at: stageEnd,
          duration_ms: stageResult.durationMs || 0
        });

        // ╔══════════════════════════════════════════════════════════╗
        // ║ Failure Propagation: All subsequent stages are skipped  ║
        // ╚══════════════════════════════════════════════════════════╝
        stageRunsRepo.skipRemainingStages(runId, stage.order_index + 1);
        break;
      } else {
        // Stage succeeded
        stageRunsRepo.updateStatus(stage.id, {
          status: 'success',
          source: stageSource,
          finished_at: stageEnd,
          duration_ms: stageResult.durationMs || 0
        });
      }
    }

    const finishedAt = new Date().toISOString();
    const totalDurationMs = Date.now() - startTimeMs;

    if (runFailed) {
      runsRepo.updateStatus(runId, {
        status: 'failed',
        failing_stage: failingStageName,
        error_message: failureErrorMessage,
        finished_at: finishedAt,
        duration_ms: totalDurationMs
      });
    } else if (!cancellationToken.isCancelled) {
      runsRepo.updateStatus(runId, {
        status: 'success',
        finished_at: finishedAt,
        duration_ms: totalDurationMs
      });
    }

    this.activeRuns.delete(runId);
  }

  /**
   * Cancels an actively running pipeline.
   */
  async cancelRun(runId) {
    const run = runsRepo.findById(runId);
    if (!run) {
      throw new Error(`Run not found: ${runId}`);
    }

    if (run.status !== 'running' && run.status !== 'pending') {
      throw new Error(`Cannot cancel run with status: '${run.status}'`);
    }

    const token = this.activeRuns.get(runId);
    if (token) {
      token.isCancelled = true;
    }

    // Mark stages as skipped
    const stages = stageRunsRepo.findByRunId(runId);
    for (const stage of stages) {
      if (stage.status === 'running') {
        stageRunsRepo.updateStatus(stage.id, {
          status: 'skipped',
          finished_at: new Date().toISOString()
        });
      } else if (stage.status === 'pending') {
        stageRunsRepo.updateStatus(stage.id, {
          status: 'skipped'
        });
      }
    }

    runsRepo.updateStatus(runId, {
      status: 'cancelled',
      finished_at: new Date().toISOString(),
      duration_ms: run.started_at ? (Date.now() - new Date(run.started_at).getTime()) : 0
    });

    this.activeRuns.delete(runId);
    return runsRepo.findById(runId);
  }

  /**
   * Retries a failed run from the failed stage.
   */
  async retryRun(sourceRunId) {
    const sourceRun = runsRepo.findById(sourceRunId);
    if (!sourceRun) {
      throw new Error(`Source run not found: ${sourceRunId}`);
    }

    if (sourceRun.status !== 'failed' && sourceRun.status !== 'cancelled') {
      throw new Error(`Only failed or cancelled runs can be retried. Current status: '${sourceRun.status}'`);
    }

    const sourceStages = stageRunsRepo.findByRunId(sourceRunId);
    let failedStageOrderIndex = 1;

    for (const st of sourceStages) {
      if (st.status === 'failed' || (sourceRun.status === 'cancelled' && st.status === 'skipped')) {
        failedStageOrderIndex = st.order_index;
        break;
      }
    }

    // Create the new retry run
    const newRun = await this.createRun({
      pipelineId: sourceRun.pipeline_id,
      triggerType: 'retry',
      commitSha: sourceRun.commit_sha,
      commitMessage: `Retry of #${sourceRun.run_number} (${sourceRun.commit_sha.substring(0, 7)})`,
      branch: sourceRun.branch,
      failAt: null,
      retryOf: sourceRunId
    });

    // Copy over results of stages that already passed in the source run
    const newStages = stageRunsRepo.findByRunId(newRun.id);
    for (const oldStage of sourceStages) {
      if (oldStage.order_index < failedStageOrderIndex && oldStage.status === 'success') {
        const correspondingNewStage = newStages.find(s => s.order_index === oldStage.order_index);
        if (correspondingNewStage) {
          stageRunsRepo.updateStatus(correspondingNewStage.id, {
            status: 'success',
            started_at: oldStage.started_at,
            finished_at: oldStage.finished_at,
            duration_ms: oldStage.duration_ms
          });

          const oldLogs = logsRepo.findByRunId(sourceRunId, { stageId: oldStage.id });
          if (oldLogs.length > 0) {
            logsRepo.createMany(oldLogs.map(l => ({
              run_id: newRun.id,
              stage_run_id: correspondingNewStage.id,
              order_index: l.order_index,
              timestamp: l.timestamp,
              level: l.level,
              message: l.message
            })));
          }
        }
      }
    }

    // Start background execution from the failed stage
    this.startRunAsync(newRun.id, { fromOrderIndex: failedStageOrderIndex });

    return runsRepo.findById(newRun.id);
  }
}

export const pipelineEngine = new PipelineEngine();
export default pipelineEngine;
