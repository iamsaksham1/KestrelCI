/**
 * @file server/validators/projectValidators.js
 * @description Zod validation schemas for project endpoints.
 */

import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(64, 'Name cannot exceed 64 characters'),
  slug: z.string().trim().min(2).max(64).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lower-case alphanumeric separated by single hyphens').optional(),
  description: z.string().trim().max(500, 'Description cannot exceed 500 characters').optional(),
  repository_url: z.string().trim().url('Must provide a valid repository URL (e.g., https://github.com/org/repo)'),
  default_branch: z.string().trim().min(1).default('main')
});

export const projectIdParamSchema = z.object({
  id: z.string().min(1, 'Project ID parameter is required')
});

export const analyzeUrlSchema = z.object({
  repository_url: z.string().trim().url('Must provide a valid URL')
});

export const analyzeProjectSchema = z.object({
  force: z.boolean().optional().default(false)
});
