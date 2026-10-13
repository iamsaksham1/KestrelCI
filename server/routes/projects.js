/**
 * @file server/routes/projects.js
 * @description Express router for projects endpoints.
 */

import { Router } from 'express';
import validate from '../middleware/validate.js';
import {
  createProjectSchema,
  projectIdParamSchema,
  analyzeUrlSchema,
  analyzeProjectSchema
} from '../validators/projectValidators.js';
import projectService from '../services/projectService.js';

const router = Router();

// POST /api/v1/projects/analyze-url - Inspect a public GitHub repository before saving
router.post('/analyze-url', validate({ body: analyzeUrlSchema }), async (req, res, next) => {
  try {
    const analysis = await projectService.analyzeUrl(req.body.repository_url);
    res.json({ data: analysis });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/projects - List all projects
router.get('/', (req, res, next) => {
  try {
    const projects = projectService.listProjects();
    res.json({ data: projects });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/projects - Create project
router.post('/', validate({ body: createProjectSchema }), (req, res, next) => {
  try {
    const project = projectService.createProject(req.body);
    res.status(201).json({ data: project });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/projects/:id - Get project detail
router.get('/:id', validate({ params: projectIdParamSchema }), (req, res, next) => {
  try {
    const project = projectService.getProject(req.params.id);
    res.json({ data: project });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/projects/:id - Delete project
router.delete('/:id', validate({ params: projectIdParamSchema }), (req, res, next) => {
  try {
    projectService.deleteProject(req.params.id);
    res.json({ data: { message: `Project ${req.params.id} successfully deleted.` } });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/projects/:id/pipelines - List project pipelines
router.get('/:id/pipelines', validate({ params: projectIdParamSchema }), (req, res, next) => {
  try {
    const pipelines = projectService.listPipelinesForProject(req.params.id);
    res.json({ data: pipelines });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/projects/:id/analyze - Refresh / trigger repository analysis
router.post(
  '/:id/analyze',
  validate({ params: projectIdParamSchema, body: analyzeProjectSchema }),
  async (req, res, next) => {
    try {
      const analysis = await projectService.analyzeProject(req.params.id, req.body);
      res.json({ data: analysis });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/v1/projects/:id/analysis - Get latest cached repository analysis
router.get('/:id/analysis', validate({ params: projectIdParamSchema }), (req, res, next) => {
  try {
    const analysis = projectService.getLatestAnalysis(req.params.id);
    res.json({ data: analysis });
  } catch (err) {
    next(err);
  }
});

export default router;
