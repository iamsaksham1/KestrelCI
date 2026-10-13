/**
 * @file server/routes/health.js
 * @description Health probe endpoint for uptime monitoring and readiness verification.
 */

import { Router } from 'express';
import { getDb } from '../database/connection.js';

const router = Router();

// GET /api/v1/health
router.get('/', (req, res) => {
  let dbStatus = 'ok';
  try {
    const db = getDb();
    db.prepare('SELECT 1').get();
  } catch (err) {
    dbStatus = `error: ${err.message}`;
  }

  const isHealthy = dbStatus === 'ok';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'pass' : 'fail',
    service: 'kestrel-api',
    version: '1.0.0',
    simulation: true,
    timestamp: new Date().toISOString(),
    checks: {
      database: dbStatus,
      uptimeSec: Math.floor(process.uptime())
    }
  });
});

export default router;
