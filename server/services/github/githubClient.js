/**
 * @file server/services/github/githubClient.js
 * @description Thin HTTP client for GitHub REST API v3.
 * Supports public repo metadata fetching, timeouts, 5xx retries,
 * rate limit detection, and strict token redaction.
 */

import config from '../../config/index.js';

export class GitHubApiError extends Error {
  constructor(message, { code, statusCode, details, rateLimitReset } = {}) {
    super(message);
    this.name = 'GitHubApiError';
    this.code = code || 'GITHUB_API_ERROR';
    this.statusCode = statusCode || 500;
    this.details = details || null;
    this.rateLimitReset = rateLimitReset || null;
  }
}

export class GitHubClient {
  constructor(options = {}) {
    this.apiBase = options.apiBase || config.GITHUB_API_BASE || 'https://api.github.com';
    this.token = options.token !== undefined ? options.token : (config.GITHUB_TOKEN || '');
    this.timeoutMs = options.timeoutMs || config.GITHUB_TIMEOUT_MS || 8000;
    this.fetchFn = options.fetchFn || globalThis.fetch;
  }

  /**
   * Internal request executor with timeout, rate-limit parsing, and 5xx retry.
   */
  async request(endpoint, { method = 'GET', retries = 1 } = {}) {
    const url = `${this.apiBase}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const headers = {
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'KestrelCI-Simulator/1.1.0'
    };

    if (this.token && typeof this.token === 'string' && this.token.trim().length > 0) {
      headers['Authorization'] = `Bearer ${this.token.trim()}`;
    }

    let response;
    let attempt = 0;

    while (attempt <= retries) {
      attempt++;
      try {
        response = await this.fetchFn(url, {
          method,
          headers,
          signal: AbortSignal.timeout(this.timeoutMs)
        });

        // Retry once on 5xx server errors
        if (response.status >= 500 && response.status < 600 && attempt <= retries) {
          await new Promise(r => setTimeout(r, 400));
          continue;
        }

        break;
      } catch (err) {
        if (err.name === 'TimeoutError' || err.code === 'UND_ERR_CONNECT_TIMEOUT') {
          throw new GitHubApiError(`GitHub API request timed out after ${this.timeoutMs}ms`, {
            code: 'GITHUB_TIMEOUT',
            statusCode: 504
          });
        }
        if (attempt <= retries) {
          await new Promise(r => setTimeout(r, 400));
          continue;
        }
        throw new GitHubApiError(`Network error communicating with GitHub API: ${err.message}`, {
          code: 'GITHUB_NETWORK_ERROR',
          statusCode: 502
        });
      }
    }

    const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
    const rateLimitReset = response.headers.get('x-ratelimit-reset');
    const remainingNum = rateLimitRemaining ? parseInt(rateLimitRemaining, 10) : null;
    const resetTimestamp = rateLimitReset ? parseInt(rateLimitReset, 10) : null;

    // Check rate limit status (403 or 429)
    if (response.status === 403 || response.status === 429) {
      const errorBody = await response.json().catch(() => ({}));
      const isRateLimit = remainingNum === 0 ||
        (errorBody.message && errorBody.message.toLowerCase().includes('rate limit'));

      if (isRateLimit) {
        const resetDate = resetTimestamp ? new Date(resetTimestamp * 1000).toISOString() : null;
        throw new GitHubApiError(
          `GitHub API rate limit reached. Limit will reset at ${resetDate || 'soon'}.`,
          {
            code: 'RATE_LIMITED',
            statusCode: 429,
            rateLimitReset: resetTimestamp,
            details: {
              resetAt: resetDate,
              remaining: 0
            }
          }
        );
      }
    }

    // Check 404 (repo not found or private)
    if (response.status === 404) {
      throw new GitHubApiError(
        'Repository not found or is private. KestrelCI only analyzes public GitHub repositories.',
        {
          code: 'REPO_NOT_FOUND_OR_PRIVATE',
          statusCode: 404
        }
      );
    }

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new GitHubApiError(
        errBody.message || `GitHub API error (HTTP ${response.status})`,
        {
          code: 'GITHUB_API_ERROR',
          statusCode: response.status,
          details: { status: response.status }
        }
      );
    }

    const data = await response.json();
    return {
      data,
      rateLimitRemaining: remainingNum,
      rateLimitReset: resetTimestamp
    };
  }

  /**
   * GET /repos/{owner}/{repo}
   */
  async getRepo(owner, repo) {
    const res = await this.request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
    const data = res.data;

    // Strict safety check: reject if marked private
    if (data.private) {
      throw new GitHubApiError(
        'Repository is private. KestrelCI only analyzes public GitHub repositories.',
        {
          code: 'REPO_NOT_FOUND_OR_PRIVATE',
          statusCode: 404
        }
      );
    }

    return {
      name: data.name,
      fullName: data.full_name,
      defaultBranch: data.default_branch || 'main',
      stars: data.stargazers_count || 0,
      license: data.license?.spdx_id || data.license?.name || null,
      sizeKb: data.size || 0,
      visibility: data.visibility || 'public',
      isArchived: Boolean(data.archived),
      description: data.description || null,
      htmlUrl: data.html_url,
      rateLimitRemaining: res.rateLimitRemaining,
      rateLimitReset: res.rateLimitReset
    };
  }

  /**
   * Alias for getRepo
   */
  async getRepository(owner, repo) {
    return this.getRepo(owner, repo);
  }

  /**
   * GET /repos/{owner}/{repo}/commits/{branch}
   */
  async getLatestCommit(owner, repo, branch) {
    const branchRef = branch || 'HEAD';
    const res = await this.request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits/${encodeURIComponent(branchRef)}`);
    const c = res.data;

    const fullMessage = c.commit?.message || '';
    const firstLineMessage = fullMessage.split('\n')[0].trim();

    return {
      sha: c.sha,
      shortSha: c.sha ? c.sha.substring(0, 7) : '',
      message: firstLineMessage || 'Automated commit',
      author: c.commit?.author?.name || c.author?.login || 'Unknown',
      date: c.commit?.author?.date || new Date().toISOString(),
      htmlUrl: c.html_url,
      rateLimitRemaining: res.rateLimitRemaining
    };
  }

  /**
   * GET /repos/{owner}/{repo}/languages
   */
  async getLanguages(owner, repo) {
    const res = await this.request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/languages`);
    const rawLanguages = res.data || {};

    let totalBytes = 0;
    for (const bytes of Object.values(rawLanguages)) {
      totalBytes += (typeof bytes === 'number' ? bytes : 0);
    }

    const languages = {};
    for (const [lang, bytes] of Object.entries(rawLanguages)) {
      languages[lang] = {
        bytes,
        percentage: totalBytes > 0 ? parseFloat(((bytes / totalBytes) * 100).toFixed(1)) : 0
      };
    }

    return {
      totalBytes,
      languages,
      rateLimitRemaining: res.rateLimitRemaining
    };
  }

  /**
   * GET /repos/{owner}/{repo}/git/trees/{sha} (non-recursive, root only)
   */
  async getRootTree(owner, repo, commitSha) {
    const res = await this.request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(commitSha)}`);
    const tree = res.data?.tree || [];
    return {
      tree: tree.map(item => ({
        path: item.path,
        mode: item.mode,
        type: item.type, // 'blob' or 'tree'
        size: item.size || 0
      })),
      rateLimitRemaining: res.rateLimitRemaining
    };
  }

  /**
   * GET /repos/{owner}/{repo}/contents/{path}?ref={ref}
   * Enforces 100 KB max limit. Never downloads large files.
   */
  async getFileContent(owner, repo, filePath, ref) {
    const endpoint = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(filePath)}${ref ? `?ref=${encodeURIComponent(ref)}` : ''}`;
    const res = await this.request(endpoint);
    const data = res.data;

    // Check size limit (max 100 KB = 102400 bytes)
    if (data.size && data.size > 102400) {
      return {
        path: filePath,
        truncated: true,
        content: null,
        size: data.size
      };
    }

    let textContent = '';
    if (data.content && data.encoding === 'base64') {
      try {
        textContent = Buffer.from(data.content, 'base64').toString('utf8');
      } catch {
        textContent = '';
      }
    }

    return {
      path: filePath,
      truncated: false,
      content: textContent,
      size: data.size || textContent.length,
      rateLimitRemaining: res.rateLimitRemaining
    };
  }
}

export const defaultGitHubClient = new GitHubClient();
export default defaultGitHubClient;
