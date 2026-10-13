/**
 * @file server/engine/executors/dockerBuild.js
 * @description Stage 6: Docker container build executor.
 * If a Dockerfile was detected in repo analysis, notes real Dockerfile presence (source: REAL),
 * followed by simulated multi-stage container compilation (source: SIMULATED).
 * Honesty rule: Stage execution is SIMULATED. Never executes Docker daemon.
 */

import { BaseExecutor } from './baseExecutor.js';
import repoAnalysisRepo from '../../database/repositories/repoAnalysisRepo.js';

export class DockerBuildExecutor extends BaseExecutor {
  constructor() {
    super('docker_build', 'Docker Build', 800, 1400);
  }

  async run(context) {
    const { runId, projectId, commitSha = '4b9f2c1', shouldFail, failureReason, checkCancelled } = context;
    const duration = this.getRandomDuration();
    await this.sleep(duration, checkCancelled);

    const analysis = (runId && repoAnalysisRepo.findLatestByRunId(runId)) ||
      (projectId && repoAnalysisRepo.findLatestByProjectId(projectId));
    const stack = analysis?.detected_stack;
    const hasDockerfile = Boolean(stack?.hasDockerfile);

    const logs = [];

    if (hasDockerfile) {
      logs.push({
        level: 'info',
        source: 'real',
        message: 'Dockerfile found in repository root (real). Simulating multi-stage container build...'
      });
    }

    if (shouldFail) {
      const errorMsg = failureReason || 'DockerBuildError: command \'/bin/sh -c npm run build\' returned a non-zero code: 137 (OOM killed during container build)';
      logs.push(
        { level: 'info', source: 'simulated', message: '[simulated] Sending build context to Docker daemon: 14.8MB' },
        { level: 'info', source: 'simulated', message: '[simulated] Step 1/7 : FROM node:22-alpine AS builder' },
        { level: 'error', source: 'simulated', message: `[simulated] ${errorMsg}` }
      );

      return {
        status: 'failed',
        source: 'simulated',
        error: errorMsg,
        durationMs: duration,
        logs
      };
    }

    const shortSha = commitSha.substring(0, 7);
    const imageTag = `registry.kestrel.internal/apps/release:${shortSha}`;

    logs.push(
      { level: 'info', source: 'simulated', message: '[simulated] Parsing multi-stage Dockerfile definition' },
      { level: 'info', source: 'simulated', message: '[simulated] Step 3/8 : CACHE HIT sha256:7f9a2b4... (layer reused)' },
      { level: 'info', source: 'simulated', message: `[simulated] Image successfully compiled: ${imageTag} (size: 84.2 MB)` },
      { level: 'info', source: 'simulated', message: '[simulated] Pushed container manifest to internal registry' }
    );

    return {
      status: 'success',
      source: 'simulated',
      durationMs: duration,
      logs
    };
  }
}

export default new DockerBuildExecutor();
