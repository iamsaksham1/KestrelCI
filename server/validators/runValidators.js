/**
 * @file server/validators/runValidators.js
 * @description Zod validation schemas for runs, history filters, and logs queries.
 */

import { z } from 'zod';

export const runIdParamSchema = z.object({
  id: z.string().min(1, 'Run ID parameter is required')
});

export const runFilterQuerySchema = z.object({
  status: z.enum(['pending', 'running', 'success', 'failed', 'cancelled']).optional(),
  project: z.string().optional(),
  pipeline: z.string().optional(),
  dateFrom: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional()),
  dateTo: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional()),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(15)
});

export const logsQuerySchema = z.object({
  stage: z.string().optional(),
  level: z.enum(['info', 'warn', 'error', 'debug']).optional(),
  source: z.enum(['real', 'simulated']).optional()
});
