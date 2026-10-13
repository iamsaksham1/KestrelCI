/**
 * @file server/routes/runs.js
 * @description Express router for pipeline run queries, status polling, logs, retries, and cancellation.
 */

import { Router } from 'express';
import validate from '../middleware/validate.js';
import {
  runIdParamSchema,
  runFilterQuerySchema,
  logsQuerySchema
} from '../validators/runValidators.js';
import runService from '../services/runService.js';

const router = Router();

// GET /api/v1/runs - Paginated history with filters
router.get('/', validate({ query: runFilterQuerySchema }), (req, res, next) => {
  try {
    const result = runService.listRuns(req.query);
    res.json({
      data: result.runs,
      pagination: result.pagination
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/runs/history - Clear run history
router.delete('/history', (req, res, next) => {
  try {
    const deletedCount = runService.clearHistory();
    res.json({
      data: {
        message: 'Pipeline run history successfully cleared.',
        deletedCount
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/runs/:id - Run details + 7 ordered stage runs
router.get('/:id', validate({ params: runIdParamSchema }), (req, res, next) => {
  try {
    const run = runService.getRunDetails(req.params.id);
    res.json({ data: run });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/runs/:id/logs - Filtered logs
router.get(
  '/:id/logs',
  validate({ params: runIdParamSchema, query: logsQuerySchema }),
  (req, res, next) => {
    try {
      const logsResult = runService.getRunLogs(req.params.id, req.query);
      res.json({ data: logsResult.logs, total: logsResult.count });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/v1/runs/:id/analysis - Snapshot of GitHub metadata analysis for run
router.get(
  '/:id/analysis',
  validate({ params: runIdParamSchema }),
  (req, res, next) => {
    try {
      const result = runService.getRunAnalysis(req.params.id);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/v1/runs/:id/retry - Retry failed run from failed stage
router.post('/:id/retry', validate({ params: runIdParamSchema }), async (req, res, next) => {
  try {
    const newRun = await runService.retryRun(req.params.id);
    res.status(202).json({
      data: {
        runId: newRun.id,
        runNumber: newRun.run_number,
        status: newRun.status,
        retryOf: req.params.id,
        message: `Retry initialized from failed stage for run #${newRun.run_number}.`
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/runs/:id/cancel - Cancel an active run
router.post('/:id/cancel', validate({ params: runIdParamSchema }), async (req, res, next) => {
  try {
    const cancelledRun = await runService.cancelRun(req.params.id);
    res.json({
      data: {
        runId: cancelledRun.id,
        status: cancelledRun.status,
        message: 'Pipeline run cancelled successfully.'
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
