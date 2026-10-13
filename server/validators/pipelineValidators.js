/**
 * @file server/validators/pipelineValidators.js
 * @description Zod validation schemas for pipeline and run trigger endpoints.
 */

import { z } from 'zod';

export const triggerRunSchema = z.object({
  failAt: z.enum([
    'source_checkout',
    'build',
    'unit_tests',
    'code_quality',
    'security_scan',
    'docker_build',
    'deploy_dev'
  ]).nullable().optional(),
  failureRate: z.number().min(0).max(1).default(1.0).optional(),
  failureMessage: z.string().trim().max(300).optional(),
  commitSha: z.string().trim().regex(/^[0-9a-fA-F]{7,40}$/, 'Must be a 7 to 40 character commit SHA').optional(),
  commitMessage: z.string().trim().max(200).optional(),
  branch: z.string().trim().min(1).max(100).optional()
});

export const pipelineIdParamSchema = z.object({
  id: z.string().min(1, 'Pipeline ID parameter is required')
});
