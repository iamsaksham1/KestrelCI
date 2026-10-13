/**
 * @file server/tests/api.spec.js
 * @description API integration tests covering all KestrelCI REST endpoints,
 * auth validation, 202 background triggers, filters, logs, search, and contact form.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import config from '../config/index.js';
import { getDb, closeDb } from '../database/connection.js';
import { runMigrations } from '../database/migrate.js';
import { seedDatabase } from '../database/seeds/seed.js';

describe('KestrelCI API Endpoints (/api/v1)', () => {
  const API_KEY = config.API_KEY;
  let testProjectId;
  let testPipelineId;
  let testRunId;

  beforeAll(() => {
    // Prepare test database
    const db = getDb(':memory:');
    runMigrations(db);
    seedDatabase(db);
  });

  afterAll(() => {
    closeDb();
  });

  // 1. Health Probe
  describe('GET /api/v1/health', () => {
    it('returns 200 OK with simulation flag', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('pass');
      expect(res.body.simulation).toBe(true);
    });
  });

  // 2. Authentication Enforcement
  describe('Authentication via X-API-Key', () => {
    it('rejects POST requests without X-API-Key when required', async () => {
      const res = await request(app)
        .post('/api/v1/projects')
        .send({
          name: 'Unauthorized Project',
          repository_url: 'https://github.com/test/repo'
        });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects POST requests with invalid X-API-Key', async () => {
      const res = await request(app)
        .post('/api/v1/projects')
        .set('X-API-Key', 'invalid_key_value_1234')
        .send({
          name: 'Unauthorized Project',
          repository_url: 'https://github.com/test/repo'
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  // 3. Projects API
  describe('Projects Endpoints', () => {
    it('GET /api/v1/projects lists seeded projects', async () => {
      const res = await request(app).get('/api/v1/projects');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
      testProjectId = res.body.data[0].id;
    });

    it('POST /api/v1/projects creates a new project with default pipeline', async () => {
      const res = await request(app)
        .post('/api/v1/projects')
        .set('X-API-Key', API_KEY)
        .send({
          name: 'Integration Test Project',
          repository_url: 'https://github.com/kestrel-systems/integration-test',
          default_branch: 'main'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Integration Test Project');
      expect(res.body.data.slug).toBe('integration-test-project');
    });

    it('GET /api/v1/projects/:id returns single project', async () => {
      const res = await request(app).get(`/api/v1/projects/${testProjectId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(testProjectId);
    });

    it('GET /api/v1/projects/:id/pipelines returns pipelines', async () => {
      const res = await request(app).get(`/api/v1/projects/${testProjectId}/pipelines`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      testPipelineId = res.body.data[0].id;
    });
  });

  // 4. Pipeline Execution Trigger (202 Accepted)
  describe('POST /api/v1/pipelines/:id/run', () => {
    it('starts a run and returns 202 Accepted immediately', async () => {
      const res = await request(app)
        .post(`/api/v1/pipelines/${testPipelineId}/run`)
        .set('X-API-Key', API_KEY)
        .send({
          branch: 'main',
          commitSha: 'c8d9e0f',
          commitMessage: 'Integration trigger test'
        });

      expect(res.status).toBe(202);
      expect(res.body.data.runId).toBeTruthy();
      expect(res.body.data.status).toBe('pending');
      testRunId = res.body.data.runId;
    });
  });

  // 5. Runs History & Detail
  describe('Runs Endpoints', () => {
    it('GET /api/v1/runs returns paginated runs', async () => {
      const res = await request(app).get('/api/v1/runs?page=1&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.pagination.total).toBeGreaterThan(0);
    });

    it('GET /api/v1/runs/:id returns run details and all 7 stages', async () => {
      const res = await request(app).get(`/api/v1/runs/${testRunId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(testRunId);
      expect(res.body.data.stages).toHaveLength(7);
    });

    it('GET /api/v1/runs/:id/logs returns log lines for run', async () => {
      const res = await request(app).get(`/api/v1/runs/${testRunId}/logs`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // 6. Dashboard Stats
  describe('GET /api/v1/dashboard/stats', () => {
    it('returns totals, rates, and recent runs', async () => {
      const res = await request(app).get('/api/v1/dashboard/stats');
      expect(res.status).toBe(200);
      expect(res.body.data.totals.totalRuns).toBeGreaterThan(0);
      expect(res.body.data.totals.totalProjects).toBeGreaterThan(0);
      expect(Array.isArray(res.body.data.recentRuns)).toBe(true);
    });
  });

  // 7. Site Search
  describe('GET /api/v1/search', () => {
    it('returns grouped results for query', async () => {
      const res = await request(app).get('/api/v1/search?q=kestrel');
      expect(res.status).toBe(200);
      expect(res.body.data.results).toHaveProperty('projects');
      expect(res.body.data.results).toHaveProperty('runs');
      expect(res.body.data.results).toHaveProperty('docs');
    });
  });

  // 8. Contact Form
  describe('POST /api/v1/contact', () => {
    it('accepts and stores contact message without requiring API key', async () => {
      const res = await request(app)
        .post('/api/v1/contact')
        .send({
          name: 'Jane Engineer',
          email: 'jane@example.com',
          subject: 'KestrelCI Pipeline Question',
          message: 'How do we configure custom Docker layer caching thresholds?'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.id).toBeTruthy();
    });
  });
});
