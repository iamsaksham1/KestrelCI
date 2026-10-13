/**
 * @file server/engine/executors/codeQuality.js
 * @description Stage 4: Code quality & static analysis executor.
 * Tailors simulated linter notices to detected ecosystem (ESLint, Ruff/Flake8, Clippy, Golangci-lint).
 * Honesty rule: Stage execution is SIMULATED.
 */

import { BaseExecutor } from './baseExecutor.js';
import repoAnalysisRepo from '../../database/repositories/repoAnalysisRepo.js';

export class CodeQualityExecutor extends BaseExecutor {
  constructor() {
    super('code_quality', 'Code Quality', 600, 1100);
  }

  async run(context) {
    const { runId, projectId, shouldFail, failureReason, checkCancelled } = context;
    const duration = this.getRandomDuration();
    await this.sleep(duration, checkCancelled);

    const analysis = (runId && repoAnalysisRepo.findLatestByRunId(runId)) ||
      (projectId && repoAnalysisRepo.findLatestByProjectId(projectId));
    const stack = analysis?.detected_stack;

    const linterName = (
      stack?.ecosystem === 'python' ? 'Ruff & Flake8' :
      stack?.ecosystem === 'go' ? 'golangci-lint' :
      stack?.ecosystem === 'rust' ? 'cargo clippy' :
      stack?.ecosystem === 'java' ? 'Checkstyle & SpotBugs' : 'ESLint'
    );

    if (shouldFail) {
      const errorMsg = failureReason || `LintThresholdError: 4 error-level rule violations found by ${linterName}`;
      return {
        status: 'failed',
        source: 'simulated',
        error: errorMsg,
        durationMs: duration,
        logs: [
          { level: 'info', source: 'simulated', message: `[simulated] Running ${linterName} static analysis across codebase` },
          { level: 'error', source: 'simulated', message: `[simulated] ${errorMsg}` },
          { level: 'error', source: 'simulated', message: '[simulated] Static analysis gate failed with exit code 1' }
        ]
      };
    }

    return {
      status: 'success',
      source: 'simulated',
      durationMs: duration,
      logs: [
        { level: 'info', source: 'simulated', message: `[simulated] Running ${linterName} and code complexity scanners` },
        { level: 'warn', source: 'simulated', message: '[simulated] ComplexityNotice: cyclomatic complexity warning threshold reached in 1 function' },
        { level: 'info', source: 'simulated', message: '[simulated] Maintainability index: 96.2/100 (Grade A) - 0 errors, 1 warning' }
      ]
    };
  }
}

export default new CodeQualityExecutor();
