/**
 * @file server/routes/dashboard.js
 * @description Express router for dashboard metrics and summary statistics.
 */

import { Router } from 'express';
import statsService from '../services/statsService.js';

const router = Router();

// GET /api/v1/dashboard/stats
router.get('/stats', (req, res, next) => {
  try {
    const stats = statsService.getDashboardStats();
    res.json({ data: stats });
  } catch (err) {
    next(err);
  }
});

export default router;
