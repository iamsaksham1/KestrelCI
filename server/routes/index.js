/**
 * @file server/routes/index.js
 * @description Central API router. Aggregates and prefixes all endpoints under /api/v1.
 */

import { Router } from 'express';
import requireApiKey from '../middleware/auth.js';
import projectsRouter from './projects.js';
import pipelinesRouter from './pipelines.js';
import runsRouter from './runs.js';
import dashboardRouter from './dashboard.js';
import searchRouter from './search.js';
import contactRouter from './contact.js';
import healthRouter from './health.js';

const apiRouter = Router();

// Global health check
apiRouter.use('/health', healthRouter);

// Enforce API key check on mutation operations
apiRouter.use(requireApiKey);

// Mount resource routers
apiRouter.use('/projects', projectsRouter);
apiRouter.use('/pipelines', pipelinesRouter);
apiRouter.use('/runs', runsRouter);
apiRouter.use('/dashboard', dashboardRouter);
apiRouter.use('/search', searchRouter);
apiRouter.use('/contact', contactRouter);

export default apiRouter;
