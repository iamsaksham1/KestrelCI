/**
 * @file server/validators/contactValidators.js
 * @description Zod validation schemas for contact message submissions.
 */

import { z } from 'zod';

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  email: z.string().trim().email('Must provide a valid email address'),
  subject: z.string().trim().min(3, 'Subject must be at least 3 characters').max(150, 'Subject cannot exceed 150 characters'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(3000, 'Message cannot exceed 3000 characters')
});

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1, 'Search query parameter cannot be empty').max(100)
});
