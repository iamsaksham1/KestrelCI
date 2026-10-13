/**
 * @file server/tests/engine.spec.js
 * @description Unit tests for the pipeline execution engine, failure propagation,
 * skip logic, cancellation, and retry workflows.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getDb, closeDb } from '../database/connection.js';
import { runMigrations } from '../database/migrate.js';
import projectsRepo from '../database/repositories/projectsRepo.js';
import pipelinesRepo from '../database/repositories/pipelinesRepo.js';
import runsRepo from '../database/repositories/runsRepo.js';
import stageRunsRepo from '../database/repositories/stageRunsRepo.js';
import pipelineEngine from '../engine/index.js';

describe('PipelineEngine', () => {
  let testProject;
  let testPipeline;

  beforeAll(() => {
    // Initialize in-memory database for engine unit tests
    const db = getDb(':memory:');
    runMigrations(db);

    testProject = projectsRepo.create({
      id: 'proj_test_engine',
      name: 'Engine Test Project',
      slug: 'engine-test-project',
      repository_url: 'https://github.com/kestrel-systems/engine-test',
      default_branch: 'main'
    }, db);

    testPipeline = pipelinesRepo.create({
      id: 'pipe_test_engine',
      project_id: testProject.id,
      name: 'Engine Unit Test Pipeline',
      config_json: {}
    }, db);
  });

  afterAll(() => {
    closeDb();
  });

  it('creates run with all 7 stages in pending state immediately', async () => {
    const run = await pipelineEngine.createRun({
      pipelineId: testPipeline.id,
      commitSha: 'a1b2c3d',
      commitMessage: 'test commit'
    });

    expect(run.status).toBe('pending');
    expect(run.commit_sha).toBe('a1b2c3d');

    const stages = stageRunsRepo.findByRunId(run.id);
    expect(stages).toHaveLength(7);
    expect(stages.every(s => s.status === 'pending')).toBe(true);
    expect(stages[0].stage_name).toBe('source_checkout');
    expect(stages[6].stage_name).toBe('deploy_dev');
  });

  it('executes full pipeline successfully when no failures are injected', async () => {
    const run = await pipelineEngine.createRun({
      pipelineId: testPipeline.id,
      commitSha: '1122334',
      commitMessage: 'success path'
    });

    await pipelineEngine.executeRun(run.id);

    const completedRun = runsRepo.findById(run.id);
    expect(completedRun.status).toBe('success');
    expect(completedRun.duration_ms).toBeGreaterThan(0);

    const stages = stageRunsRepo.findByRunId(run.id);
    expect(stages.every(s => s.status === 'success')).toBe(true);
  });

  it('propagates failure and skips remaining stages when failAt is injected', async () => {
    const run = await pipelineEngine.createRun({
      pipelineId: testPipeline.id,
      commitSha: 'fail333',
      commitMessage: 'testing failure at stage 3',
      failAt: 'unit_tests',
      failureRate: 1.0
    });

    await pipelineEngine.executeRun(run.id);

    const failedRun = runsRepo.findById(run.id);
    expect(failedRun.status).toBe('failed');
    expect(failedRun.failing_stage).toBe('unit_tests');
    expect(failedRun.error_message).toBeTruthy();

    const stages = stageRunsRepo.findByRunId(run.id);
    // Stage 1 (source_checkout) and 2 (build) succeeded
    expect(stages[0].status).toBe('success');
    expect(stages[1].status).toBe('success');

    // Stage 3 (unit_tests) failed
    expect(stages[2].status).toBe('failed');
    expect(stages[2].error_message).toBeTruthy();

    // Stages 4, 5, 6, 7 are skipped!
    expect(stages[3].status).toBe('skipped');
    expect(stages[4].status).toBe('skipped');
    expect(stages[5].status).toBe('skipped');
    expect(stages[6].status).toBe('skipped');
  });

  it('retries failed run starting from the failed stage and succeeds', async () => {
    // 1. Trigger run that fails at code_quality (Stage 4)
    const run = await pipelineEngine.createRun({
      pipelineId: testPipeline.id,
      commitSha: 'retry999',
      commitMessage: 'testing retry from stage 4',
      failAt: 'code_quality',
      failureRate: 1.0
    });

    await pipelineEngine.executeRun(run.id);
    const failedRun = runsRepo.findById(run.id);
    expect(failedRun.status).toBe('failed');

    // 2. Retry run
    const retryRun = await pipelineEngine.retryRun(failedRun.id);
    expect(retryRun.retry_of).toBe(failedRun.id);

    // Prior stages (1, 2, 3) must be marked success
    const retryStages = stageRunsRepo.findByRunId(retryRun.id);
    expect(retryStages[0].status).toBe('success');
    expect(retryStages[1].status).toBe('success');
    expect(retryStages[2].status).toBe('success');

    // Wait for retry execution to complete
    await pipelineEngine.executeRun(retryRun.id, { fromOrderIndex: 4 });

    const finalRetryRun = runsRepo.findById(retryRun.id);
    expect(finalRetryRun.status).toBe('success');

    const finalStages = stageRunsRepo.findByRunId(retryRun.id);
    expect(finalStages.every(s => s.status === 'success')).toBe(true);
  });

  it('cancels an active run and marks subsequent stages as skipped', async () => {
    const run = await pipelineEngine.createRun({
      pipelineId: testPipeline.id,
      commitSha: 'cancel123',
      commitMessage: 'testing cancellation'
    });

    // Start in background
    pipelineEngine.startRunAsync(run.id);

    // Cancel after slight delay
    await new Promise(r => setTimeout(r, 100));
    await pipelineEngine.cancelRun(run.id);

    const cancelledRun = runsRepo.findById(run.id);
    expect(cancelledRun.status).toBe('cancelled');

    const stages = stageRunsRepo.findByRunId(run.id);
    // At least the later stages must be skipped
    expect(stages.some(s => s.status === 'skipped')).toBe(true);
  });
});
