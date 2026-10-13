/**
 * @file server/app.js
 * @description Express application setup.
 * Configures security headers, CORS, rate limiting, request logging, and error handlers.
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import config from './config/index.js';
import apiRouter from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  // 1. Security Headers via Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Managed by frontend bundle in development
      crossOriginEmbedderPolicy: false
    })
  );

  // 2. CORS Allow-list
  const allowedOrigins = config.CORS_ORIGIN.split(',').map(o => o.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl) or matched origins
        if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`Origin '${origin}' blocked by CORS allow-list`));
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'x-api-key'],
      credentials: true
    })
  );

  // 3. Request Logging (disabled in unit/integration tests)
  if (config.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // 4. Rate Limiting
  const limiter = rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests dispatched from this IP address; please retry later.'
      }
    }
  });
  app.use('/api/', limiter);

  // 5. Body Parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // 6. Versioned API Router
  app.use('/api/v1', apiRouter);

  // 7. Route Not Found Handler
  app.use(notFoundHandler);

  // 8. Central Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
export default app;
