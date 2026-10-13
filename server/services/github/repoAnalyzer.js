/**
 * @file server/services/github/repoAnalyzer.js
 * @description Orchestrates public repository analysis via GitHubClient.
 * Manages dual-tier caching (in-memory + database repo_analyses),
 * root tree manifest inspection, safe manifest aggregation, and error translation.
 */

import crypto from 'crypto';
import config from '../../config/index.js';
import defaultGitHubClient from './githubClient.js';
import { aggregateDetectedStack } from './manifestParsers.js';
import repoAnalysisRepo from '../../database/repositories/repoAnalysisRepo.js';

// In-memory LRU/TTL cache: Map<string, { data: object, expiresAt: number }>
const memoryCache = new Map();

/**
 * Format relative elapsed time (e.g. "fetched 2m ago")
 */
export function formatTimeAgo(dateString) {
  if (!dateString) return 'just now';
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return `${Math.max(1, seconds)}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export class RepoAnalyzer {
  constructor(clientOrOptions = defaultGitHubClient) {
    if (clientOrOptions && typeof clientOrOptions === 'object' && clientOrOptions.client) {
      this.client = clientOrOptions.client;
      this.cacheTtlSeconds = clientOrOptions.ttlSeconds || clientOrOptions.cacheTtlSeconds || config.REPO_CACHE_TTL_SECONDS || 600;
    } else {
      this.client = clientOrOptions || defaultGitHubClient;
      this.cacheTtlSeconds = config.REPO_CACHE_TTL_SECONDS || 600;
    }
  }

  /**
   * Generates cache key for owner/repo/branch
   */
  getCacheKey(owner, repo, branch) {
    return `${owner.toLowerCase()}/${repo.toLowerCase()}@${(branch || 'default').toLowerCase()}`;
  }

  /**
   * Retrieves cached analysis from memory or database if fresh within TTL.
   */
  getCachedAnalysis(owner, repo, branch) {
    const key = this.getCacheKey(owner, repo, branch);
    const now = Date.now();

    // 1. Check in-memory cache
    if (memoryCache.has(key)) {
      const entry = memoryCache.get(key);
      if (entry.expiresAt > now) {
        return {
          ...entry.data,
          cached: true,
          cacheAgeText: `(cached, ${formatTimeAgo(entry.data.fetched_at)})`
        };
      }
      memoryCache.delete(key);
    }

    // 2. Check database repo_analyses cache
    const dbRecord = repoAnalysisRepo.findByOwnerRepoBranch(owner, repo, branch);
    if (dbRecord && dbRecord.fetched_at) {
      const fetchedTime = new Date(dbRecord.fetched_at).getTime();
      const ageSeconds = (now - fetchedTime) / 1000;
      if (ageSeconds < this.cacheTtlSeconds) {
        // Hydrate in-memory cache
        memoryCache.set(key, {
          data: dbRecord,
          expiresAt: now + ((this.cacheTtlSeconds - ageSeconds) * 1000)
        });
        return {
          ...dbRecord,
          cached: true,
          cacheAgeText: `(cached, ${formatTimeAgo(dbRecord.fetched_at)})`
        };
      }
    }

    return null;
  }

  /**
   * Analyzes a repository using GitHub API.
   *
   * @param {object} params
   * @param {string} params.owner
   * @param {string} params.repo
   * @param {string} [params.branch]
   * @param {string} [params.projectId]
   * @param {string} [params.runId]
   * @param {boolean} [params.forceRefresh=false]
   */
  async analyze({ owner, repo, branch, projectId, runId, forceRefresh = false }) {
    if (!config.REPO_ANALYSIS_ENABLED) {
      const err = new Error('Repository analysis is disabled by server configuration.');
      err.code = 'ANALYSIS_DISABLED';
      err.statusCode = 503;
      throw err;
    }

    // Check cache unless forceRefresh requested
    if (!forceRefresh) {
      const cached = this.getCachedAnalysis(owner, repo, branch);
      if (cached) {
        // If runId provided and record does not have run_id, link it
        if (runId && cached.id && !cached.run_id) {
          try {
            repoAnalysisRepo.linkRun(cached.id, runId);
          } catch {
            // Ignore if linking fails
          }
        }
        return cached;
      }
    }

    // 1. Fetch Repository Metadata
    const repoMeta = await this.client.getRepo(owner, repo);
    const targetBranch = branch || repoMeta.defaultBranch || 'main';

    // 2. Fetch Latest Commit Metadata
    const commit = await this.client.getLatestCommit(owner, repo, targetBranch);

    // 3. Fetch Languages Breakdown
    const { languages } = await this.client.getLanguages(owner, repo);

    // 4. Fetch Root Git Tree (Non-recursive)
    const { tree } = await this.client.getRootTree(owner, repo, commit.sha);

    // 5. Detect and Fetch Manifest Files
    const targetManifestNames = [
      'package.json',
      'requirements.txt',
      'pyproject.toml',
      'pom.xml',
      'build.gradle',
      'go.mod',
      'Cargo.toml'
    ];

    const hasDockerfile = tree.some(item =>
      item.path === 'Dockerfile' || item.path.toLowerCase().startsWith('dockerfile.')
    );
    const hasCI = tree.some(item =>
      item.path === '.github' || item.path === '.gitlab-ci.yml' || item.path === 'Jenkinsfile'
    );

    const detectedManifestItems = tree.filter(item =>
      targetManifestNames.includes(item.path) && item.type === 'blob'
    );

    const manifests = [];
    for (const item of detectedManifestItems) {
      try {
        const fileRes = await this.client.getFileContent(owner, repo, item.path, commit.sha);
        if (fileRes && fileRes.content) {
          manifests.push({
            path: item.path,
            content: fileRes.content,
            size: fileRes.size
          });
        }
      } catch {
        // Manifest fetch failed or skipped, continue
      }
    }

    // 6. Aggregate Stack Findings
    const detectedStack = aggregateDetectedStack(manifests, { hasDockerfile, hasCI });

    const analysisId = `analysis_${Date.now().toString(36)}_${crypto.randomBytes(3).toString('hex')}`;
    const fetchedAt = new Date().toISOString();

    const analysisPayload = {
      id: analysisId,
      project_id: projectId || 'transient',
      run_id: runId || null,
      owner,
      repo,
      branch: targetBranch,
      commit_sha: commit.sha,
      commit_message: commit.message,
      commit_author: commit.author,
      commit_date: commit.date,
      languages_json: JSON.stringify(languages),
      detected_stack_json: JSON.stringify(detectedStack),
      manifests_json: JSON.stringify(manifests.map(m => ({ path: m.path, size: m.size }))),
      stars: repoMeta.stars,
      license: repoMeta.license,
      fetched_at: fetchedAt,
      rate_limit_remaining: repoMeta.rateLimitRemaining,
      source: 'github_api'
    };

    // Save to database if project_id is an actual project
    let savedRecord = null;
    if (projectId && projectId !== 'transient') {
      try {
        savedRecord = repoAnalysisRepo.create(analysisPayload);
      } catch (err) {
        console.error('[RepoAnalyzer] Failed to persist analysis to database:', err);
      }
    }

    const result = {
      ...(savedRecord || {
        ...analysisPayload,
        languages,
        detected_stack: detectedStack,
        manifests: manifests.map(m => ({ path: m.path, size: m.size }))
      }),
      cached: false,
      cacheAgeText: '(live GitHub API)'
    };

    // Store in memory cache
    const cacheKey = this.getCacheKey(owner, repo, targetBranch);
    memoryCache.set(cacheKey, {
      data: result,
      expiresAt: Date.now() + (this.cacheTtlSeconds * 1000)
    });

    return result;
  }
}

export const defaultRepoAnalyzer = new RepoAnalyzer();
export default defaultRepoAnalyzer;
