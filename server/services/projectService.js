/**
 * @file server/services/projectService.js
 * @description Business logic layer for project entities.
 * Delegates SQL queries to repositories.
 */

import crypto from 'crypto';
import projectsRepo from '../database/repositories/projectsRepo.js';
import pipelinesRepo from '../database/repositories/pipelinesRepo.js';
import repoAnalysisRepo from '../database/repositories/repoAnalysisRepo.js';
import { parseGitHubUrl } from '../utils/githubUrl.js';
import defaultRepoAnalyzer from './github/repoAnalyzer.js';

export const projectService = {
  listProjects() {
    return projectsRepo.findAll();
  },

  getProject(id) {
    const project = projectsRepo.findById(id);
    if (!project) {
      const err = new Error(`Project not found with ID '${id}'`);
      err.statusCode = 404;
      err.code = 'PROJECT_NOT_FOUND';
      throw err;
    }
    return project;
  },

  createProject(data) {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = projectsRepo.findBySlug(slug);
    if (existing) {
      const err = new Error(`A project with slug '${slug}' already exists.`);
      err.statusCode = 409;
      err.code = 'SLUG_CONFLICT';
      throw err;
    }

    const parsedGit = parseGitHubUrl(data.repository_url);
    const finalBranch = (parsedGit && parsedGit.branch) || data.default_branch || 'main';

    const id = `proj_${Date.now().toString(36)}_${crypto.randomBytes(3).toString('hex')}`;
    const project = projectsRepo.create({
      id,
      name: data.name,
      slug,
      description: data.description || null,
      repository_url: data.repository_url,
      default_branch: finalBranch,
      repo_owner: parsedGit ? parsedGit.owner : null,
      repo_name: parsedGit ? parsedGit.repo : null
    });

    // Automatically create a default CI/CD pipeline for newly registered project
    const defaultPipelineId = `pipe_${Date.now().toString(36)}_${crypto.randomBytes(3).toString('hex')}`;
    pipelinesRepo.create({
      id: defaultPipelineId,
      project_id: project.id,
      name: 'Default CI/CD Pipeline',
      config_json: {
        environment: 'development',
        branches: [finalBranch]
      }
    });

    return projectsRepo.findById(project.id);
  },

  /**
   * Triggers an on-demand analysis for an existing project.
   */
  async analyzeProject(projectId, { force = false } = {}) {
    const project = this.getProject(projectId);
    const parsedGit = parseGitHubUrl(project.repository_url);

    if (!parsedGit) {
      const err = new Error(`Cannot analyze repository: '${project.repository_url}' is not a valid public GitHub URL.`);
      err.statusCode = 400;
      err.code = 'NOT_A_GITHUB_REPO';
      throw err;
    }

    const branch = project.default_branch || parsedGit.branch;
    const analysis = await defaultRepoAnalyzer.analyze({
      owner: parsedGit.owner,
      repo: parsedGit.repo,
      branch,
      projectId: project.id,
      forceRefresh: force
    });

    // Update project metadata with verified repo owner and name if needed
    try {
      projectsRepo.update(project.id, {
        repo_owner: parsedGit.owner,
        repo_name: parsedGit.repo,
        default_branch: analysis.branch || project.default_branch
      });
    } catch {
      // Non-critical if project update fails
    }

    return analysis;
  },

  /**
   * Retrieves the latest stored analysis snapshot for a project.
   */
  getLatestAnalysis(projectId) {
    this.getProject(projectId); // 404 guard
    return repoAnalysisRepo.findLatestByProjectId(projectId);
  },

  /**
   * Performs transient on-demand analysis for a GitHub URL before project creation.
   */
  async analyzeUrl(repositoryUrl) {
    const parsedGit = parseGitHubUrl(repositoryUrl);
    if (!parsedGit) {
      const err = new Error('Must provide a valid public GitHub URL (e.g., https://github.com/owner/repo)');
      err.statusCode = 400;
      err.code = 'INVALID_GITHUB_URL';
      throw err;
    }

    return defaultRepoAnalyzer.analyze({
      owner: parsedGit.owner,
      repo: parsedGit.repo,
      branch: parsedGit.branch,
      forceRefresh: false
    });
  },

  deleteProject(id) {
    const project = projectsRepo.findById(id);
    if (!project) {
      const err = new Error(`Cannot delete project: ID '${id}' not found`);
      err.statusCode = 404;
      err.code = 'PROJECT_NOT_FOUND';
      throw err;
    }
    return projectsRepo.delete(id);
  },

  listPipelinesForProject(projectId) {
    this.getProject(projectId); // Ensures 404 thrown if project missing
    return pipelinesRepo.findByProjectId(projectId);
  }
};

export default projectService;
