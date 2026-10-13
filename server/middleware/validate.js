/**
 * @file server/middleware/validate.js
 * @description Zod request validation middleware generator for Express.
 * Validates req.body, req.query, or req.params and formats errors consistently.
 */

export function validate({ body, query, params }) {
  return (req, res, next) => {
    if (body) {
      const result = body.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request body failed validation constraints.',
            details: result.error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          }
        });
      }
      req.body = result.data;
    }

    if (query) {
      const result = query.safeParse(req.query);
      if (!result.success) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Query parameters failed validation constraints.',
            details: result.error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          }
        });
      }
      req.query = result.data;
    }

    if (params) {
      const result = params.safeParse(req.params);
      if (!result.success) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Path parameters failed validation constraints.',
            details: result.error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          }
        });
      }
      req.params = result.data;
    }

    next();
  };
}

export default validate;
