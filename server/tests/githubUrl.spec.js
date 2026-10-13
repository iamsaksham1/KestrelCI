/**
 * @file server/tests/githubUrl.spec.js
 * @description Unit tests for GitHub URL parsing, validation, and SSRF prevention.
 */

import { describe, it, expect } from 'vitest';
import { parseGitHubUrl, isValidGitHubUrl } from '../utils/githubUrl.js';

describe('GitHub URL Validator & Parser (SSRF Protection)', () => {
  describe('Valid GitHub URLs', () => {
    it('parses standard https://github.com/owner/repo', () => {
      const result = parseGitHubUrl('https://github.com/facebook/react');
      expect(result).toEqual({
        owner: 'facebook',
        repo: 'react',
        branch: null
      });
      expect(isValidGitHubUrl('https://github.com/facebook/react')).toBe(true);
    });

    it('parses repository URL with .git suffix', () => {
      const result = parseGitHubUrl('https://github.com/torvalds/linux.git');
      expect(result).toEqual({
        owner: 'torvalds',
        repo: 'linux',
        branch: null
      });
    });

    it('parses repository URL with trailing slash', () => {
      const result = parseGitHubUrl('https://github.com/expressjs/express/');
      expect(result).toEqual({
        owner: 'expressjs',
        repo: 'express',
        branch: null
      });
    });

    it('parses branch from /tree/{branch} path', () => {
      const result = parseGitHubUrl('https://github.com/vercel/next.js/tree/canary');
      expect(result).toEqual({
        owner: 'vercel',
        repo: 'next.js',
        branch: 'canary'
      });
    });

    it('parses branch with nested slashes (e.g. /tree/feature/auth)', () => {
      const result = parseGitHubUrl('https://github.com/owner/repo/tree/feature/new-login');
      expect(result).toEqual({
        owner: 'owner',
        repo: 'repo',
        branch: 'feature/new-login'
      });
    });
  });

  describe('SSRF and Invalid Host Rejections', () => {
    it('rejects non-GitHub domains', () => {
      expect(parseGitHubUrl('https://gitlab.com/owner/repo')).toBeNull();
      expect(parseGitHubUrl('https://bitbucket.org/owner/repo')).toBeNull();
      expect(parseGitHubUrl('https://attacker.com/github.com/repo')).toBeNull();
      expect(isValidGitHubUrl('https://gitlab.com/owner/repo')).toBe(false);
    });

    it('rejects localhost and private IP addresses', () => {
      expect(parseGitHubUrl('http://localhost:8080/repo')).toBeNull();
      expect(parseGitHubUrl('http://127.0.0.1/owner/repo')).toBeNull();
      expect(parseGitHubUrl('http://169.254.169.254/latest/meta-data')).toBeNull();
      expect(parseGitHubUrl('http://10.0.0.1/admin')).toBeNull();
    });

    it('rejects file:// and non-http schemes', () => {
      expect(parseGitHubUrl('file:///etc/passwd')).toBeNull();
      expect(parseGitHubUrl('ftp://github.com/owner/repo')).toBeNull();
    });

    it('rejects SSH URLs (since only HTTPS API is supported)', () => {
      expect(parseGitHubUrl('git@github.com:owner/repo.git')).toBeNull();
      expect(isValidGitHubUrl('git@github.com:owner/repo.git')).toBe(false);
    });

    it('rejects malformed inputs and path traversals', () => {
      expect(parseGitHubUrl('')).toBeNull();
      expect(parseGitHubUrl(null)).toBeNull();
      expect(parseGitHubUrl(undefined)).toBeNull();
      expect(parseGitHubUrl('https://github.com/../evil')).toBeNull();
      expect(parseGitHubUrl('not-a-url')).toBeNull();
    });
  });
});
