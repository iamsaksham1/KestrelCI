/**
 * @file server/database/seeds/seed.js
 * @description Database seeder script for KestrelCI.
 * Seeds initial demo projects, pipelines, and realistic historical runs
 * with simulated stage logs and failure states.
 */

import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { getDb } from '../connection.js';
import { runMigrations } from '../migrate.js';
import projectsRepo from '../repositories/projectsRepo.js';
import pipelinesRepo from '../repositories/pipelinesRepo.js';
import runsRepo from '../repositories/runsRepo.js';
import stageRunsRepo from '../repositories/stageRunsRepo.js';
import logsRepo from '../repositories/logsRepo.js';

export function seedDatabase(db = getDb()) {
  console.log('🌱 Seeding KestrelCI database...');

  // Ensure migrations are run first
  runMigrations(db);

  // Check if projects already exist
  const existingCount = projectsRepo.count(db);
  if (existingCount > 0) {
    console.log('ℹ️ Database already contains data. Skipping seed.');
    return;
  }

  const STAGE_DEFINITIONS = [
    { name: 'source_checkout', displayName: 'Source Checkout', index: 1 },
    { name: 'build', displayName: 'Build & Compile', index: 2 },
    { name: 'unit_tests', displayName: 'Unit Tests', index: 3 },
    { name: 'code_quality', displayName: 'Code Quality', index: 4 },
    { name: 'security_scan', displayName: 'Security Scan', index: 5 },
    { name: 'docker_build', displayName: 'Docker Build', index: 6 },
    { name: 'deploy_dev', displayName: 'Deploy (Dev)', index: 7 }
  ];

  // 1. Create Projects
  const project1 = projectsRepo.create({
    id: 'proj_kestrel_core',
    name: 'Kestrel Core',
    slug: 'kestrel-core',
    description: 'High-throughput asynchronous event processor and telemetry bridge.',
    repository_url: 'https://github.com/kestrel-systems/kestrel-core',
    default_branch: 'main'
  }, db);

  const project2 = projectsRepo.create({
    id: 'proj_beacon_api',
    name: 'Beacon Gateway',
    slug: 'beacon-gateway',
    description: 'Zero-trust edge gateway with dynamic JWT verification and ingress rate control.',
    repository_url: 'https://github.com/kestrel-systems/beacon-api',
    default_branch: 'main'
  }, db);

  const project3 = projectsRepo.create({
    id: 'proj_monolith_checkout',
    name: 'Checkout Monolith',
    slug: 'checkout-monolith',
    description: 'Transactional order processing engine slated for domain decomposition.',
    repository_url: 'https://github.com/kestrel-systems/monolith-checkout',
    default_branch: 'master'
  }, db);

  // 2. Create Pipelines
  const pipe1 = pipelinesRepo.create({
    id: 'pipe_core_main',
    project_id: project1.id,
    name: 'Production Continuous Integration',
    config_json: {
      environment: 'development',
      branches: ['main'],
      notifyOnFailure: true
    }
  }, db);

  const pipe2 = pipelinesRepo.create({
    id: 'pipe_beacon_main',
    project_id: project2.id,
    name: 'Edge Ingress Verification',
    config_json: {
      environment: 'staging',
      branches: ['main', 'release/*'],
      notifyOnFailure: true
    }
  }, db);

  const pipe3 = pipelinesRepo.create({
    id: 'pipe_checkout_main',
    project_id: project3.id,
    name: 'Nightly Security & Regression',
    config_json: {
      failAt: 'security_scan',
      failureRate: 0.8
    }
  }, db);

  // Helper to create a run with its 7 stages and realistic logs
  function seedRun({
    id,
    pipelineId,
    runNumber,
    status,
    triggerType,
    commitSha,
    commitMessage,
    failingStageName = null,
    errorMessage = null,
    totalDurationMs = 7450,
    startTimeOffsetSec = 3600
  }) {
    const startedAt = new Date(Date.now() - startTimeOffsetSec * 1000).toISOString();
    const finishedAt = new Date(new Date(startedAt).getTime() + totalDurationMs).toISOString();

    const run = runsRepo.create({
      id,
      pipeline_id: pipelineId,
      run_number: runNumber,
      status,
      trigger_type: triggerType,
      commit_sha: commitSha,
      commit_message: commitMessage,
      branch: 'main',
      error_message: errorMessage,
      failing_stage: failingStageName,
      started_at: startedAt,
      finished_at: finishedAt,
      duration_ms: totalDurationMs,
      config_snapshot_json: {}
    }, db);

    const stageRows = [];
    let isFailingOrSkipping = false;
    let accumulatedTime = new Date(startedAt).getTime();

    for (const def of STAGE_DEFINITIONS) {
      const stageId = `stage_${id}_${def.name}`;
      const stageDuration = Math.floor(Math.random() * 800) + 700;

      let stageStatus = 'success';
      let stageError = null;

      if (isFailingOrSkipping) {
        stageStatus = 'skipped';
      } else if (def.name === failingStageName) {
        stageStatus = 'failed';
        stageError = errorMessage;
        isFailingOrSkipping = true;
      }

      const stageStart = stageStatus !== 'skipped' ? new Date(accumulatedTime).toISOString() : null;
      accumulatedTime += stageDuration;
      const stageEnd = stageStatus !== 'skipped' ? new Date(accumulatedTime).toISOString() : null;

      stageRows.push({
        id: stageId,
        run_id: run.id,
        stage_name: def.name,
        display_name: def.displayName,
        order_index: def.index,
        status: stageStatus,
        error_message: stageError,
        started_at: stageStart,
        finished_at: stageEnd,
        duration_ms: stageStatus === 'skipped' ? 0 : stageDuration
      });
    }

    stageRunsRepo.createMany(stageRows, db);

    // Create realistic logs for each executed stage
    const logRows = [];
    for (const s of stageRows) {
      if (s.status === 'skipped') continue;

      const stageLogs = generateSeedLogs(s.stage_name, s.status, s.error_message);
      let logOrder = 0;
      for (const line of stageLogs) {
        logRows.push({
          run_id: run.id,
          stage_run_id: s.id,
          order_index: logOrder++,
          timestamp: s.started_at,
          level: line.level,
          message: line.message
        });
      }
    }

    logsRepo.createMany(logRows, db);
  }

  // Seed Run 1: Successful run
  seedRun({
    id: 'run_core_001_success',
    pipelineId: pipe1.id,
    runNumber: 1,
    status: 'success',
    triggerType: 'manual',
    commitSha: '9f8b4c2',
    commitMessage: 'feat(transport): implement backpressure-aware socket ring buffer',
    totalDurationMs: 6840,
    startTimeOffsetSec: 7200
  });

  // Seed Run 2: Failed run at security_scan
  seedRun({
    id: 'run_core_002_fail',
    pipelineId: pipe1.id,
    runNumber: 2,
    status: 'failed',
    triggerType: 'webhook',
    commitSha: 'e1d2c34',
    commitMessage: 'fix(deps): bump express to latest alpha tag',
    failingStageName: 'security_scan',
    errorMessage: 'VulnerabilityThresholdExceeded: 1 critical CVE (CVE-2026-38491) detected in lockfile',
    totalDurationMs: 5120,
    startTimeOffsetSec: 3600
  });

  // Seed Run 3: Beacon gateway success
  seedRun({
    id: 'run_beacon_001_success',
    pipelineId: pipe2.id,
    runNumber: 1,
    status: 'success',
    triggerType: 'scheduled',
    commitSha: '3a7d9f1',
    commitMessage: 'chore(config): synchronize rate limiting thresholds across edge zones',
    totalDurationMs: 7920,
    startTimeOffsetSec: 1800
  });

  console.log('✅ Successfully seeded KestrelCI with 3 projects, 3 pipelines, and 3 historical runs.');
}

function generateSeedLogs(stageName, status, errorMessage) {
  switch (stageName) {
    case 'source_checkout':
      return [
        { level: 'info', message: '[simulated] Initializing workspace git environment' },
        { level: 'info', message: '[simulated] Fetching origin remote with depth 50' },
        { level: 'info', message: '[simulated] Checked out commit 9f8b4c2 refs/heads/main' },
        { level: 'info', message: '[simulated] Submodule verification: 0 submodules detected' }
      ];
    case 'build':
      return [
        { level: 'info', message: '[simulated] Resolving dependency graph from lockfile' },
        { level: 'info', message: '[simulated] Invoking compiler toolchain (target: ES2024)' },
        { level: 'info', message: '[simulated] Output bundle emitted: 248.6 kB (gzipped: 62.1 kB)' }
      ];
    case 'unit_tests':
      if (status === 'failed') {
        return [
          { level: 'info', message: '[simulated] Running test suite: 18 test files' },
          { level: 'error', message: `[simulated] FAIL tests/engine/evaluator.spec.js: Expected 200 OK but received 500: ${errorMessage}` }
        ];
      }
      return [
        { level: 'info', message: '[simulated] Discovered 42 test suites, 189 unit test cases' },
        { level: 'info', message: '[simulated] Test runner finished in 1.42s' },
        { level: 'info', message: '[simulated] Tests: 189 passed, 0 failed, 0 skipped' }
      ];
    case 'code_quality':
      return [
        { level: 'info', message: '[simulated] Executing static analysis and style linting' },
        { level: 'warn', message: '[simulated] ComplexityWarning: method computeDelta() cyclomatic complexity is 12 (threshold: 10)' },
        { level: 'info', message: '[simulated] Quality score: 98.4% (Grade A)' }
      ];
    case 'security_scan':
      if (status === 'failed') {
        return [
          { level: 'info', message: '[simulated] Inspecting dependency manifest against National Vulnerability Database' },
          { level: 'error', message: `[simulated] CRITICAL: CVE-2026-38491 (CVSS 9.8) in dependencies: ${errorMessage}` },
          { level: 'error', message: '[simulated] Pipeline policy strictly forbids builds with CVSS >= 7.0' }
        ];
      }
      return [
        { level: 'info', message: '[simulated] Running dependency SAST scanner' },
        { level: 'info', message: '[simulated] Audited 412 packages against CVE database' },
        { level: 'info', message: '[simulated] Zero high or critical vulnerabilities identified' }
      ];
    case 'docker_build':
      return [
        { level: 'info', message: '[simulated] Building container image from Dockerfile.production' },
        { level: 'info', message: '[simulated] Layer 1/6: Using cache sha256:4a8b1c...' },
        { level: 'info', message: '[simulated] Image tagged: registry.kestrel.internal/core:9f8b4c2 (size: 78.4 MB)' }
      ];
    case 'deploy_dev':
      return [
        { level: 'info', message: '[simulated] Connecting to development Kubernetes cluster (zone: us-east-dev)' },
        { level: 'info', message: '[simulated] Applying deployment manifest: rollout started' },
        { level: 'info', message: '[simulated] Readiness probes healthy: 3/3 pods responding' },
        { level: 'info', message: '[simulated] Deployment verified at https://dev.core.kestrel.internal' }
      ];
    default:
      return [{ level: 'info', message: `[simulated] Stage ${stageName} executed successfully` }];
  }
}

// Execute if run from CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    seedDatabase();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

export default seedDatabase;
