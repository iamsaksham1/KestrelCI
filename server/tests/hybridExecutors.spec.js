/**
 * @file server/tests/hybridExecutors.spec.js
 * @description Unit tests for hybrid executors (source checkout and build) verifying honesty provenance.
 */

import { describe, it, expect, vi } from 'vitest';
import { SourceCheckoutExecutor } from '../engine/executors/sourceCheckout.js';
import { BuildExecutor } from '../engine/executors/build.js';

describe('Hybrid Stage Executors & Provenance', () => {
  describe('SourceCheckoutExecutor', () => {
    it('executes with REAL metadata when GitHub analysis succeeds', async () => {
      const mockAnalyzer = {
        analyze: vi.fn().mockResolvedValue({
          owner: 'kestrel-systems',
          repo: 'telemetry',
          branch: 'main',
          commit_sha: '7f8d9a2b1c4e6f',
          commit_message: 'feat: add telemetry ingress',
          commit_author: 'Jane Doe',
          commit_date: '2026-10-13T12:00:00Z',
          detected_stack_json: { ecosystem: 'Node.js', framework: 'Express' }
        })
      };

      const executor = new SourceCheckoutExecutor({
        analyzer: mockAnalyzer,
        enabled: true,
        strictMode: false
      });

      const context = {
        projectId: 'proj_1',
        repositoryUrl: 'https://github.com/kestrel-systems/telemetry',
        branch: 'main'
      };

      const result = await executor.run(context);
      expect(result.status).toBe('success');
      expect(result.source).toBe('real');
      expect(result.commitSha).toBe('7f8d9a2b1c4e6f');
      expect(result.logs.some(l => l.source === 'real')).toBe(true);
      expect(result.logs.some(l => l.message.includes('No code was downloaded or executed'))).toBe(true);
    });

    it('falls back gracefully to simulated execution on GitHub API failure', async () => {
      const mockAnalyzer = {
        analyze: vi.fn().mockRejectedValue(new Error('Rate limit exceeded'))
      };

      const executor = new SourceCheckoutExecutor({
        analyzer: mockAnalyzer,
        enabled: true,
        strictMode: false
      });

      const context = {
        projectId: 'proj_fallback',
        repositoryUrl: 'https://github.com/missing/repo',
        branch: 'main'
      };

      const result = await executor.run(context);
      expect(result.status).toBe('success');
      expect(result.source).toBe('simulated');
      expect(result.logs.some(l => l.level === 'warn' && l.message.includes('Falling back to simulated source'))).toBe(true);
    });

    it('fails the stage when strictRepoAnalysis is true and GitHub API fails', async () => {
      const mockAnalyzer = {
        analyze: vi.fn().mockRejectedValue(new Error('Repository not found or private'))
      };

      const executor = new SourceCheckoutExecutor({
        analyzer: mockAnalyzer,
        enabled: true,
        strictMode: true
      });

      const context = {
        projectId: 'proj_strict',
        repositoryUrl: 'https://github.com/private/repo',
        branch: 'main'
      };

      const result = await executor.run(context);
      expect(result.status).toBe('failed');
      expect(result.error).toContain('Repository not found or private');
    });
  });

  describe('BuildExecutor', () => {
    it('emits REAL stack logs based on detected project stack', async () => {
      const executor = new BuildExecutor();
      const context = {
        projectId: 'proj_stack',
        analysis: {
          detected_stack_json: {
            ecosystem: 'Rust',
            framework: 'Actix Web',
            package_manager: 'cargo',
            scripts: ['test', 'build'],
            dependencies_count: 14
          }
        }
      };

      const result = await executor.run(context);
      expect(result.status).toBe('success');
      expect(result.source).toBe('real');
      expect(result.logs.some(l => l.source === 'real' && l.message.includes('Rust (Actix Web)'))).toBe(true);
      expect(result.logs.some(l => l.source === 'simulated' && l.message.includes('Build complete'))).toBe(true);
    });
  });
});
