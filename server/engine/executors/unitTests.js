/**
 * @file server/engine/executors/unitTests.js
 * @description Stage 3: Unit tests executor.
 * Tailors simulated test runner logs to the detected framework (jest, vitest, pytest, junit, etc.).
 * Honesty rule: Stage execution is SIMULATED. Never executes user test code.
 */

import { BaseExecutor } from './baseExecutor.js';
import repoAnalysisRepo from '../../database/repositories/repoAnalysisRepo.js';

export class UnitTestsExecutor extends BaseExecutor {
  constructor() {
    super('unit_tests', 'Unit Tests', 800, 1400);
  }

  async run(context) {
    const { runId, projectId, shouldFail, failureReason, checkCancelled } = context;
    const duration = this.getRandomDuration();
    await this.sleep(duration, checkCancelled);

    const testCount = Math.floor(Math.random() * 50) + 160;

    // Check for detected stack in repo analysis
    const analysis = (runId && repoAnalysisRepo.findLatestByRunId(runId)) ||
      (projectId && repoAnalysisRepo.findLatestByProjectId(projectId));
    const stack = analysis?.detected_stack;

    const detectedFramework = stack?.testFrameworks?.[0] || (
      stack?.ecosystem === 'python' ? 'pytest' :
      stack?.ecosystem === 'go' ? 'go test' :
      stack?.ecosystem === 'rust' ? 'cargo test' :
      stack?.ecosystem === 'java' ? 'junit' : 'vitest'
    );
    const hasTestsDeclared = stack?.hasTests;

    const logs = [];

    // Honesty notification about declared test scripts
    if (stack && !hasTestsDeclared) {
      logs.push({
        level: 'info',
        source: 'real',
        message: 'No test script detected in repository (real). Running simulated test suite.'
      });
    }

    if (shouldFail) {
      const errorMsg = failureReason || `AssertionError: expected status 200 to deeply equal 500 in tests/${detectedFramework}.spec.ts (Stage failure simulated)`;
      logs.push(
        { level: 'info', source: 'simulated', message: `[simulated] Discovered 32 test suites with ${testCount} assertions (${detectedFramework})` },
        { level: 'info', source: 'simulated', message: `[simulated] Executing ${detectedFramework} in parallel worker pool (4 workers)` },
        { level: 'error', source: 'simulated', message: `[simulated] FAIL: ${errorMsg}` },
        { level: 'error', source: 'simulated', message: `[simulated] Results: ${testCount - 2} passed, 2 failed, 0 skipped` }
      );

      return {
        status: 'failed',
        source: 'simulated',
        error: errorMsg,
        durationMs: duration,
        logs
      };
    }

    logs.push(
      { level: 'info', source: 'simulated', message: `[simulated] Discovered 32 test suites with ${testCount} assertions (${detectedFramework})` },
      { level: 'info', source: 'simulated', message: `[simulated] Running ${detectedFramework} concurrent worker pool` },
      { level: 'info', source: 'simulated', message: `[simulated] Test suite passed: ${testCount}/${testCount} tests succeeded (coverage: 92.4%)` }
    );

    return {
      status: 'success',
      source: 'simulated',
      durationMs: duration,
      logs
    };
  }
}

export default new UnitTestsExecutor();
