/**
 * @file server/routes/search.js
 * @description Express router for site search across projects, runs, and docs.
 */

import { Router } from 'express';
import validate from '../middleware/validate.js';
import { searchQuerySchema } from '../validators/contactValidators.js';
import searchService from '../services/searchService.js';

const router = Router();

// GET /api/v1/search?q=
router.get('/', validate({ query: searchQuerySchema }), (req, res, next) => {
  try {
    const results = searchService.searchAll(req.query.q);
    res.json({ data: results });
  } catch (err) {
    next(err);
  }
});

export default router;
