/**
 * @file server/tests/githubService.spec.js
 * @description Unit tests for GitHub manifest parsers, API client, rate limit handling,
 * and repository stack analysis caching.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  parsePackageJson,
  parseRequirementsTxt,
  parsePyprojectToml,
  parseGoMod,
  parseCargoToml,
  parsePomXml,
  parseBuildGradle,
  parseGitHubWorkflows
} from '../services/github/manifestParsers.js';
import { GitHubClient } from '../services/github/githubClient.js';
import { RepoAnalyzer } from '../services/github/repoAnalyzer.js';

describe('GitHub Manifest Parsers', () => {
  it('parses Node package.json safely', () => {
    const jsonStr = JSON.stringify({
      name: 'kestrel-service',
      scripts: {
        build: 'vite build',
        test: 'vitest run',
        lint: 'eslint .'
      },
      dependencies: {
        express: '^4.19.2',
        react: '^18.3.1'
      },
      devDependencies: {
        vitest: '^1.6.0'
      }
    });

    const parsed = parsePackageJson(jsonStr);
    expect(parsed.ecosystem).toBe('Node.js');
    expect(parsed.packageManager).toBe('npm');
    expect(parsed.scripts).toContain('build');
    expect(parsed.scripts).toContain('test');
    expect(parsed.dependenciesCount).toBe(3);
    expect(parsed.framework).toContain('React');
    expect(parsed.framework).toContain('Express');
  });

  it('handles invalid package.json gracefully without crashing', () => {
    const invalid = '{ broken json ';
    const parsed = parsePackageJson(invalid);
    expect(parsed.ecosystem).toBe('Node.js');
    expect(parsed.dependenciesCount).toBe(0);
  });

  it('parses Python requirements.txt safely', () => {
    const reqText = `
      # Core requirements
      flask>=2.0.0
      django==4.2
      pytest
      requests
    `;
    const parsed = parseRequirementsTxt(reqText);
    expect(parsed.ecosystem).toBe('Python');
    expect(parsed.dependenciesCount).toBe(4);
    expect(parsed.framework).toContain('Flask');
    expect(parsed.framework).toContain('Django');
  });

  it('parses Python pyproject.toml safely', () => {
    const tomlText = `
      [tool.poetry.dependencies]
      fastapi = "^0.100.0"
      uvicorn = "^0.23.0"
    `;
    const parsed = parsePyprojectToml(tomlText);
    expect(parsed.ecosystem).toBe('Python');
    expect(parsed.packageManager).toBe('Poetry');
    expect(parsed.framework).toBe('FastAPI');
  });

  it('parses Go go.mod safely', () => {
    const goMod = `
      module github.com/example/server

      go 1.21

      require (
        github.com/gin-gonic/gin v1.9.1
      )
    `;
    const parsed = parseGoMod(goMod);
    expect(parsed.ecosystem).toBe('Go');
    expect(parsed.framework).toBe('Gin');
  });

  it('parses Rust Cargo.toml safely', () => {
    const cargoToml = `
      [package]
      name = "kestrel-engine"
      version = "0.1.0"

      [dependencies]
      actix-web = "4"
      tokio = { version = "1", features = ["full"] }
    `;
    const parsed = parseCargoToml(cargoToml);
    expect(parsed.ecosystem).toBe('Rust');
    expect(parsed.framework).toContain('Actix Web');
  });

  it('parses Java pom.xml and build.gradle safely', () => {
    const pom = '<project><dependencies><dependency><groupId>org.springframework.boot</groupId></dependency></dependencies></project>';
    expect(parsePomXml(pom).framework).toBe('Spring Boot');

    const gradle = 'dependencies { implementation "io.micronaut:micronaut-http-client" }';
    expect(parseBuildGradle(gradle).framework).toBe('Micronaut');
  });

  it('parses .github/workflows directory contents', () => {
    const files = [
      { name: 'ci.yml', type: 'file' },
      { name: 'release.yaml', type: 'file' }
    ];
    const parsed = parseGitHubWorkflows(files);
    expect(parsed.workflowsCount).toBe(2);
    expect(parsed.workflowFiles).toContain('ci.yml');
  });
});

describe('GitHub Client & Security', () => {
  it('identifies 404 as REPO_NOT_FOUND_OR_PRIVATE', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      headers: new Headers({ 'x-ratelimit-remaining': '55' }),
      json: () => Promise.resolve({ message: 'Not Found' })
    });

    const client = new GitHubClient({
      apiBase: 'https://api.github.com',
      fetchFn: mockFetch
    });

    await expect(client.getRepository('owner', 'missing-repo')).rejects.toMatchObject({
      code: 'REPO_NOT_FOUND_OR_PRIVATE',
      statusCode: 404
    });
  });

  it('identifies 403 rate-limiting as RATE_LIMITED with reset timestamp', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      headers: new Headers({
        'x-ratelimit-remaining': '0',
        'x-ratelimit-reset': '1700000000'
      }),
      json: () => Promise.resolve({ message: 'API rate limit exceeded' })
    });

    const client = new GitHubClient({
      apiBase: 'https://api.github.com',
      fetchFn: mockFetch
    });

    await expect(client.getRepository('owner', 'rate-limited-repo')).rejects.toMatchObject({
      code: 'RATE_LIMITED',
      statusCode: 429
    });
  });

  it('never exposes API token in request or error messages', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
    const secretToken = 'ghp_secret_token_1234567890abcdef';

    const client = new GitHubClient({
      apiBase: 'https://api.github.com',
      token: secretToken,
      fetchFn: mockFetch
    });

    try {
      await client.getRepository('owner', 'repo');
    } catch (err) {
      expect(err.message).not.toContain(secretToken);
      expect(JSON.stringify(err)).not.toContain(secretToken);
    }
  });
});

describe('RepoAnalyzer In-Memory & DB Cache', () => {
  it('returns cached analysis on subsequent request within TTL without re-fetching', async () => {
    const mockClient = {
      getRepo: vi.fn().mockResolvedValue({
        name: 'test-repo',
        fullName: 'owner/test-repo',
        defaultBranch: 'main',
        stars: 42,
        license: 'MIT',
        sizeKb: 100
      }),
      getLatestCommit: vi.fn().mockResolvedValue({
        sha: 'abc1234567890',
        message: 'Initial commit',
        author: 'Dev',
        date: '2026-10-13T10:00:00Z'
      }),
      getLanguages: vi.fn().mockResolvedValue({
        languages: { JavaScript: { bytes: 1000, percentage: 100 } }
      }),
      getRootTree: vi.fn().mockResolvedValue({
        tree: [{ path: 'package.json', type: 'blob' }]
      }),
      getFileContent: vi.fn().mockResolvedValue({
        path: 'package.json',
        truncated: false,
        content: JSON.stringify({ name: 'test', dependencies: { express: '1.0' } }),
        size: 50
      })
    };

    const analyzer = new RepoAnalyzer({
      client: mockClient,
      ttlSeconds: 600
    });

    // First call: triggers client
    const res1 = await analyzer.analyze({ owner: 'owner', repo: 'test-repo', branch: 'main' });
    expect(res1.commit_sha).toBe('abc1234567890');
    expect(mockClient.getRepo).toHaveBeenCalledTimes(1);

    // Second call within TTL: served from cache
    const res2 = await analyzer.analyze({ owner: 'owner', repo: 'test-repo', branch: 'main' });
    expect(res2.commit_sha).toBe('abc1234567890');
    expect(mockClient.getRepo).toHaveBeenCalledTimes(1); // Not called again!
  });
});
