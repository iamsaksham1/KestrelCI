/**
 * @file server/engine/executors/build.js
 * @description Stage 2: Build & compilation executor (Hybrid).
 * When real repository analysis is present, logs real detected stack, package manager,
 * scripts, and dependency counts (source: REAL), followed by simulated compile emission.
 * Honesty rule: NEVER compiles or executes user code on the host system.
 */

import { BaseExecutor } from './baseExecutor.js';
import repoAnalysisRepo from '../../database/repositories/repoAnalysisRepo.js';

export class BuildExecutor extends BaseExecutor {
  constructor() {
    super('build', 'Build & Compile', 700, 1200);
  }

  async run(context) {
    const { runId, projectId, shouldFail, failureReason, checkCancelled } = context;
    const duration = this.getRandomDuration();
    await this.sleep(duration, checkCancelled);

    // Retrieve analysis snapshot if available
    const analysis = context.analysis ||
      (runId && repoAnalysisRepo.findLatestByRunId(runId)) ||
      (projectId && repoAnalysisRepo.findLatestByProjectId(projectId));

    const stack = analysis?.detected_stack || analysis?.detected_stack_json;
    const isRealStack = Boolean(stack && stack.ecosystem && stack.ecosystem !== 'other');
    const pkgManager = stack?.packageManager || stack?.package_manager || 'npm';
    const depsCount = stack?.dependenciesCount !== undefined ? stack.dependenciesCount : (stack?.dependencies_count || 0);
    const scripts = stack?.scripts || [];
    const hasBuildScript = stack?.hasBuild || scripts.includes('build');
    const scriptNames = scripts.length > 0 ? scripts.join(', ') : 'none';
    const ecosystem = stack?.ecosystem || 'Generic';
    const framework = stack?.framework ? ` (${stack.framework})` : '';

    if (shouldFail) {
      const errorMsg = failureReason || (isRealStack
        ? `CompilationError: build failed during '${pkgManager} run build'`
        : 'CompilationError: TS2322 Type mismatch in src/core/pipeline.ts: Type \'null\' is not assignable to type \'string\'');

      const failureLogs = [];
      if (isRealStack) {
        failureLogs.push({
          level: 'info',
          source: 'real',
          message: `Detected ${ecosystem}${framework} project (${pkgManager}). Found scripts: ${scriptNames}. ${depsCount} dependencies declared.`
        });
      }
      failureLogs.push(
        { level: 'info', source: 'simulated', message: '[simulated] Invoking compiler toolchain harness' },
        { level: 'error', source: 'simulated', message: `[simulated] ${errorMsg}` }
      );

      return {
        status: 'failed',
        source: isRealStack ? 'real' : 'simulated',
        error: errorMsg,
        durationMs: duration,
        logs: failureLogs
      };
    }

    const logs = [];

    if (isRealStack) {
      // 1. Real stack discovery log (REAL)
      logs.push({
        level: 'info',
        source: 'real',
        message: `Detected ${ecosystem}${framework} project (${pkgManager}). Found scripts: ${scriptNames}. ${depsCount} dependencies declared.`
      });

      // 2. Honesty notice about build script (REAL)
      if (!hasBuildScript) {
        logs.push({
          level: 'info',
          source: 'real',
          message: 'No build script declared in manifest (real). Proceeding with simulated compile step.'
        });
      }

      // 3. Simulated compilation output (SIMULATED)
      const bundleKb = (Math.random() * 80 + 190).toFixed(1);
      const gzipKb = (bundleKb * 0.28).toFixed(1);

      logs.push(
        {
          level: 'info',
          source: 'simulated',
          message: `[simulated] Resolving dependencies with ${stack.packageManager} lockfile optimizer`
        },
        {
          level: 'info',
          source: 'simulated',
          message: `[simulated] Compiling production bundles (target: ES2024 / Node22)`
        },
        {
          level: 'info',
          source: 'simulated',
          message: `[simulated] Build complete: bundle size ${bundleKb} kB (gzip: ${gzipKb} kB)`
        }
      );

      return {
        status: 'success',
        source: 'real',
        durationMs: duration,
        logs
      };
    }

    // Standard fallback simulation when no real repo analysis is linked
    const bundleKb = (Math.random() * 80 + 190).toFixed(1);
    const gzipKb = (bundleKb * 0.28).toFixed(1);

    return {
      status: 'success',
      source: 'simulated',
      durationMs: duration,
      logs: [
        { level: 'info', source: 'simulated', message: '[simulated] Resolving dependencies from lockfile (184 cached)' },
        { level: 'info', source: 'simulated', message: '[simulated] Running esbuild production optimizer (target: node22)' },
        { level: 'info', source: 'simulated', message: `[simulated] Dist artifacts generated: bundle size ${bundleKb} kB (gzip: ${gzipKb} kB)` }
      ]
    };
  }
}

export const defaultBuildExecutor = new BuildExecutor();
export default defaultBuildExecutor;
