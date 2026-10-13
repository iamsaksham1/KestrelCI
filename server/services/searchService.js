/**
 * @file server/services/searchService.js
 * @description Global search service querying projects, pipelines, runs, and core docs/FAQ topics.
 */

import projectsRepo from '../database/repositories/projectsRepo.js';
import runsRepo from '../database/repositories/runsRepo.js';

const DOCS_INDEX = [
  {
    title: 'Architecture & Engine Design',
    category: 'Docs',
    path: '/docs',
    snippet: '7-stage pipeline loop, non-blocking 202 execution, and repository abstraction.'
  },
  {
    title: 'Failure Propagation & Skip Rules',
    category: 'Docs',
    path: '/docs',
    snippet: 'How failed stages immediately skip subsequent tasks and record root causes.'
  },
  {
    title: 'API Authentication & X-API-Key',
    category: 'Docs',
    path: '/docs',
    snippet: 'Header-based constant-time authentication for mutation requests.'
  },
  {
    title: 'Security Scanning & SAST Gates',
    category: 'Docs',
    path: '/docs',
    snippet: 'CVE vulnerability detection, dependency manifests, and security scan stage.'
  },
  {
    title: 'Extending Stages & Real Integrations',
    category: 'Docs',
    path: '/docs',
    snippet: 'How to implement the StageExecutor interface and swap simulated steps for real jobs.'
  },
  {
    title: 'What is simulated in KestrelCI?',
    category: 'FAQ',
    path: '/faq',
    snippet: 'Honesty declaration: all 7 stages emit simulated logs and do not run external Docker/K8s jobs.'
  },
  {
    title: 'How do deterministic failures work?',
    category: 'FAQ',
    path: '/faq',
    snippet: 'Configure failAt and failureRate options in pipeline triggers to test failure states.'
  },
  {
    title: 'Where is pipeline data stored?',
    category: 'FAQ',
    path: '/faq',
    snippet: 'Local SQLite database file using WAL mode; no remote telemetry collected.'
  }
];

export const searchService = {
  searchAll(query) {
    const q = (query || '').trim().toLowerCase();
    if (!q) {
      return { projects: [], runs: [], docs: [] };
    }

    // 1. Projects search
    const allProjects = projectsRepo.findAll();
    const matchingProjects = allProjects
      .filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      )
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        title: p.name,
        subtitle: p.slug,
        path: `/projects/${p.id}`,
        category: 'Projects'
      }));

    // 2. Runs search (by commit sha, message, id, status, pipeline name, project name)
    const recentRuns = runsRepo.findPaginated({ limit: 50 });
    const matchingRuns = recentRuns
      .filter(r =>
        r.id.toLowerCase().includes(q) ||
        (r.pipeline_name && r.pipeline_name.toLowerCase().includes(q)) ||
        (r.project_name && r.project_name.toLowerCase().includes(q)) ||
        (r.commit_sha && r.commit_sha.toLowerCase().includes(q)) ||
        (r.commit_message && r.commit_message.toLowerCase().includes(q)) ||
        (r.status && r.status.toLowerCase().includes(q))
      )
      .slice(0, 5)
      .map(r => ({
        id: r.id,
        title: `Run #${r.run_number} (${r.commit_sha ? r.commit_sha.substring(0, 7) : 'run'})`,
        subtitle: `${r.pipeline_name} • ${r.status}`,
        path: `/runs/${r.id}`,
        category: 'Runs'
      }));

    // 3. Docs & FAQ search
    const matchingDocs = DOCS_INDEX
      .filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.snippet.toLowerCase().includes(q)
      )
      .slice(0, 5)
      .map(d => ({
        id: d.path + '-' + d.title,
        title: d.title,
        subtitle: d.snippet,
        path: d.path,
        category: d.category
      }));

    return {
      query: q,
      results: {
        projects: matchingProjects,
        runs: matchingRuns,
        docs: matchingDocs
      },
      totalCount: matchingProjects.length + matchingRuns.length + matchingDocs.length
    };
  }
};

export default searchService;
