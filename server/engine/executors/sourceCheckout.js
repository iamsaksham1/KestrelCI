/**
 * @file server/engine/executors/sourceCheckout.js
 * @description Stage 1: Source checkout executor (Hybrid).
 * When given a public GitHub repository, fetches REAL metadata from GitHub REST API
 * (commit SHA, author, message, timestamp).
 * Honesty rule: NEVER downloads, clones, or executes any repository code.
 * Falls back to simulation if unauthenticated/offline, unless strictRepoAnalysis is enabled.
 */

import { BaseExecutor } from './baseExecutor.js';
import { parseGitHubUrl } from '../../utils/githubUrl.js';
import defaultRepoAnalyzer from '../../services/github/repoAnalyzer.js';

export class SourceCheckoutExecutor extends BaseExecutor {
  constructor(analyzerOrOptions = defaultRepoAnalyzer) {
    super('source_checkout', 'Source Checkout', 500, 900);
    if (analyzerOrOptions && typeof analyzerOrOptions === 'object' && analyzerOrOptions.analyzer) {
      this.analyzer = analyzerOrOptions.analyzer;
      this.strictMode = Boolean(analyzerOrOptions.strictMode);
    } else {
      this.analyzer = analyzerOrOptions || defaultRepoAnalyzer;
      this.strictMode = false;
    }
  }

  async run(context) {
    const {
      projectId,
      runId,
      repositoryUrl,
      commitSha = '4b9f2c1',
      branch = 'main',
      config = {},
      shouldFail,
      failureReason,
      checkCancelled
    } = context;

    const duration = this.getRandomDuration();
    await this.sleep(duration, checkCancelled);

    // 1. Check for deterministic failure injection override
    if (shouldFail) {
      const errorMsg = failureReason || `GitRemoteError: unable to access origin repository; connection timed out during checkout of branch '${branch}'`;
      return {
        status: 'failed',
        source: 'simulated',
        error: errorMsg,
        durationMs: duration,
        logs: [
          { level: 'info', source: 'simulated', message: '[simulated] Initializing git credential cache and clone harness' },
          { level: 'info', source: 'simulated', message: `[simulated] Fetching refs from remote for branch '${branch}'` },
          { level: 'error', source: 'simulated', message: `[simulated] ${errorMsg}` }
        ]
      };
    }

    // 2. Parse GitHub repository URL if present
    const parsedGit = repositoryUrl ? parseGitHubUrl(repositoryUrl) : null;
    const strictAnalysis = Boolean(config.strictRepoAnalysis || this.strictMode);

    if (parsedGit) {
      const targetBranch = branch || parsedGit.branch || 'main';

      try {
        const analysis = await this.analyzer.analyze({
          owner: parsedGit.owner,
          repo: parsedGit.repo,
          branch: targetBranch,
          projectId,
          runId,
          forceRefresh: false
        });

        const shortSha = analysis.commit_sha ? analysis.commit_sha.substring(0, 7) : 'head';
        const cacheNote = analysis.cached ? ` ${analysis.cacheAgeText}` : '';

        return {
          status: 'success',
          source: 'real',
          durationMs: duration,
          analysis,
          commitSha: analysis.commit_sha,
          branch: analysis.branch || targetBranch,
          realMetadata: {
            commitSha: analysis.commit_sha,
            commitMessage: analysis.commit_message,
            branch: analysis.branch || targetBranch,
            analysisId: analysis.id
          },
          logs: [
            {
              level: 'info',
              source: 'real',
              message: `Target Repository: ${analysis.owner}/${analysis.repo} (branch: ${analysis.branch || targetBranch})${cacheNote}`
            },
            {
              level: 'info',
              source: 'real',
              message: `Latest Commit: ${shortSha} — "${analysis.commit_message || 'Automated commit'}" (by ${analysis.commit_author || 'GitHub Author'})`
            },
            {
              level: 'info',
              source: 'real',
              message: `Fetched metadata for ${analysis.owner}/${analysis.repo} at commit ${shortSha} (GitHub API). No code was downloaded or executed.`
            }
          ]
        };
      } catch (analysisErr) {
        // If strict analysis is required, fail the stage immediately
        if (strictAnalysis) {
          const failMsg = `GitHubAnalysisError: ${analysisErr.message || 'Failed to inspect public GitHub repository'}`;
          return {
            status: 'failed',
            source: 'real',
            error: failMsg,
            durationMs: duration,
            logs: [
              {
                level: 'info',
                source: 'real',
                message: `Inspecting public GitHub repository: ${parsedGit.owner}/${parsedGit.repo}`
              },
              {
                level: 'error',
                source: 'real',
                message: failMsg
              }
            ]
          };
        }

        // Graceful fallback to simulation with honest warning
        return {
          status: 'success',
          source: 'simulated',
          durationMs: duration,
          logs: [
            {
              level: 'warn',
              source: 'simulated',
              message: `[simulated] WARN: Real repository metadata unavailable (${analysisErr.message || 'Repo not accessible'}). Falling back to simulated source.`
            },
            {
              level: 'info',
              source: 'simulated',
              message: '[simulated] Initializing workspace git environment'
            },
            {
              level: 'info',
              source: 'simulated',
              message: `[simulated] Fetching remote origin with depth 50 for branch '${branch}'`
            },
            {
              level: 'info',
              source: 'simulated',
              message: `[simulated] Successfully checked out commit ${commitSha}`
            }
          ]
        };
      }
    }

    // 3. Fallback for non-GitHub projects (standard simulated execution)
    return {
      status: 'success',
      source: 'simulated',
      durationMs: duration,
      logs: [
        { level: 'info', source: 'simulated', message: '[simulated] Initializing workspace git environment' },
        { level: 'info', source: 'simulated', message: `[simulated] Fetching remote origin with depth 50 for branch '${branch}'` },
        { level: 'info', source: 'simulated', message: `[simulated] Successfully checked out commit ${commitSha}` },
        { level: 'info', source: 'simulated', message: '[simulated] Submodule verification: 0 external submodules required' }
      ]
    };
  }
}

export const defaultSourceCheckoutExecutor = new SourceCheckoutExecutor();
export default defaultSourceCheckoutExecutor;
