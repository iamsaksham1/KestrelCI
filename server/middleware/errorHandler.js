/**
 * @file server/middleware/errorHandler.js
 * @description Centralized error handling middleware.
 * Formats all uncaught errors into the standard KestrelCI error payload schema.
 */

export function errorHandler(err, req, res, next) {
  // If response headers already sent, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || err.status || 500;
  const errorCode = err.code || (statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR');

  if (statusCode >= 500) {
    console.error(`[API Error] ${req.method} ${req.url}:`, err);
  }

  res.status(statusCode).json({
    error: {
      code: errorCode,
      message: err.message || 'An unexpected internal server error occurred.',
      details: err.details || null
    }
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `The requested endpoint '${req.method} ${req.originalUrl}' does not exist on this server.`,
      details: {
        method: req.method,
        path: req.originalUrl
      }
    }
  });
}

export default {
  errorHandler,
  notFoundHandler
};
