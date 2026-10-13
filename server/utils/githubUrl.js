/**
 * @file server/utils/githubUrl.js
 * @description Safe GitHub repository URL parser and SSRF guard.
 * Validates and extracts owner, repo, and optional branch.
 * Rejects non-GitHub domains, IP addresses, localhost, SSH, and file protocols.
 */

import { z } from 'zod';

/**
 * Parses and validates a GitHub repository URL.
 * Accepts:
 *   - https://github.com/{owner}/{repo}
 *   - https://github.com/{owner}/{repo}.git
 *   - https://github.com/{owner}/{repo}/
 *   - https://github.com/{owner}/{repo}/tree/{branch}
 *
 * @param {string} urlString
 * @returns {{ owner: string, repo: string, branch?: string } | null}
 */
export function parseGitHubUrl(urlString) {
  if (!urlString || typeof urlString !== 'string') {
    return null;
  }

  const trimmed = urlString.trim();

  // Basic security pre-checks: must not be file, ssh, git@, or IP
  if (
    trimmed.startsWith('file:') ||
    trimmed.startsWith('git@') ||
    trimmed.includes('169.254.169.254') ||
    trimmed.includes('localhost') ||
    trimmed.includes('127.0.0.1') ||
    trimmed.includes('0.0.0.0')
  ) {
    return null;
  }

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  // Strictly enforce HTTP/HTTPS protocol
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return null;
  }

  // Strictly enforce github.com host (prevent SSRF and non-GitHub hosts)
  const host = parsed.hostname.toLowerCase();
  if (host !== 'github.com' && host !== 'www.github.com') {
    return null;
  }

  // Path segments: e.g. ['', 'owner', 'repo', 'tree', 'branch...']
  const segments = parsed.pathname.split('/').filter(Boolean);

  if (segments.length < 2) {
    return null;
  }

  const owner = segments[0];
  let repo = segments[1];

  // Strip .git suffix if present
  if (repo.endsWith('.git')) {
    repo = repo.slice(0, -4);
  }

  // Validate owner and repo names according to GitHub naming rules
  // Owner: 1-39 alphanumeric characters or hyphens (cannot start with hyphen)
  // Repo: 1-100 alphanumeric, hyphens, underscores, or dots
  const validOwnerRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/;
  const validRepoRegex = /^[a-zA-Z0-9_.-]+$/;

  if (!validOwnerRegex.test(owner) || !validRepoRegex.test(repo) || repo === '.' || repo === '..') {
    return null;
  }

  let branch = null;
  // Check for /tree/{branch}
  if (segments.length >= 4 && segments[2] === 'tree') {
    branch = decodeURIComponent(segments.slice(3).join('/'));
  }

  return {
    owner,
    repo,
    branch
  };
}

/**
 * Checks if a string is a valid public GitHub URL.
 */
export function isValidGitHubUrl(urlString) {
  return parseGitHubUrl(urlString) !== null;
}

/**
 * Zod schema refinement for validating GitHub URLs.
 */
export const gitHubUrlSchema = z.string().trim().refine(
  (url) => parseGitHubUrl(url) !== null,
  { message: 'Must be a valid public GitHub URL (e.g., https://github.com/owner/repo)' }
);

export default parseGitHubUrl;
