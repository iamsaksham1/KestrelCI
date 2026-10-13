/**
 * @file server/middleware/auth.js
 * @description API Key authentication middleware using constant-time comparison.
 * Protects write endpoints (POST, PUT, DELETE) and optionally read endpoints.
 */

import crypto from 'crypto';
import config from '../config/index.js';

// ╔══════════════════════════════════════════════════════════════╗
// ║  API KEY  >>>  set API_KEY in server/.env  (never commit it)  ║
// ╚══════════════════════════════════════════════════════════════╝

/**
 * Constant-time string equality check to prevent timing attacks.
 */
function secureCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Express middleware to enforce X-API-Key validation.
 */
export function requireApiKey(req, res, next) {
  const isWriteMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  const shouldEnforce = isWriteMethod
    ? config.REQUIRE_API_KEY_ON_WRITES
    : config.REQUIRE_API_KEY_ON_READS;

  if (!shouldEnforce) {
    return next();
  }

  // Allow public contact form without API key so web visitors can reach out
  if (req.path === '/contact' && req.method === 'POST') {
    return next();
  }

  const clientKey = req.header('X-API-Key') || req.header('x-api-key');

  if (!clientKey) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing required authentication credential. Provide X-API-Key header.',
        details: { header: 'X-API-Key' }
      }
    });
  }

  if (!secureCompare(clientKey, config.API_KEY)) {
    return res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: 'Invalid API Key provided in X-API-Key header.',
        details: null
      }
    });
  }

  next();
}

export default requireApiKey;
