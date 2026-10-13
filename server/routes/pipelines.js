/**
 * @file server/routes/pipelines.js
 * @description Express router for pipeline management and execution triggers.
 */

import { Router } from 'express';
import validate from '../middleware/validate.js';
import { triggerRunSchema, pipelineIdParamSchema } from '../validators/pipelineValidators.js';
import runService from '../services/runService.js';
import pipelinesRepo from '../database/repositories/pipelinesRepo.js';

const router = Router();

// GET /api/v1/pipelines/:id - Get pipeline details
router.get('/:id', validate({ params: pipelineIdParamSchema }), (req, res, next) => {
  try {
    const pipeline = pipelinesRepo.findById(req.params.id);
    if (!pipeline) {
      return res.status(404).json({
        error: { code: 'PIPELINE_NOT_FOUND', message: `Pipeline ${req.params.id} not found.` }
      });
    }
    res.json({ data: pipeline });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/pipelines/:id/run - Start run (202 Accepted)
router.post(
  '/:id/run',
  validate({ params: pipelineIdParamSchema, body: triggerRunSchema }),
  async (req, res, next) => {
    try {
      const run = await runService.triggerRun(req.params.id, req.body);
      // Returns 202 Accepted immediately; background execution is non-blocking
      res.status(202).json({
        data: {
          runId: run.id,
          runNumber: run.run_number,
          status: run.status,
          message: 'Pipeline run accepted and dispatched in background.'
        }
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
