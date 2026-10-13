/**
 * @file server/config/index.js
 * @description Centralized server configuration module.
 * Loads and validates environment variables at startup using Zod.
 * Exposes strongly-typed configuration across all server modules.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory first, fallback to root .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// ╔══════════════════════════════════════════════════════════════╗
// ║  API KEY  >>>  set API_KEY in server/.env  (never commit it)  ║
// ╚══════════════════════════════════════════════════════════════╝
// ╔════════════════════════════════════════════════════════════════════╗
// ║  GITHUB_TOKEN >>> optional. Raises API rate limit (60 -> 5000/h).   ║
// ║  Use a fine-grained token with read-only access to public repos.    ║
// ║  Never commit it. Never expose it to the client.                    ║
// ╚════════════════════════════════════════════════════════════════════╝
const configSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_PATH: z.string().default('data/app.sqlite'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  API_KEY: z.string().min(8, 'API_KEY must be at least 8 characters long').default('kestrel_demo_key_7f8d9a2b1c4e6f'),
  REQUIRE_API_KEY_ON_WRITES: z.enum(['true', 'false']).transform(v => v === 'true').default('true'),
  REQUIRE_API_KEY_ON_READS: z.enum(['true', 'false']).transform(v => v === 'true').default('false'),
  RATE_LIMIT_MAX: z.coerce.number().default(300),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),

  // -------------------------------------------------------------
  // GitHub Public API & Repository Analysis Configuration
  // -------------------------------------------------------------
  GITHUB_TOKEN: z.string().optional().default(''),
  GITHUB_API_BASE: z.string().url().default('https://api.github.com'),
  REPO_ANALYSIS_ENABLED: z.enum(['true', 'false']).transform(v => v === 'true').default('true'),
  REPO_CACHE_TTL_SECONDS: z.coerce.number().default(600),
  GITHUB_TIMEOUT_MS: z.coerce.number().default(8000),

  // -------------------------------------------------------------
  // Future Integration Placeholders (Currently Unused in MVP)
  // -------------------------------------------------------------
  WEBHOOK_SECRET: z.string().optional(),
  DOCKER_REGISTRY_TOKEN: z.string().optional(),
  SLACK_WEBHOOK_URL: z.string().optional()
});

const parsed = configSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('\n❌ Invalid server configuration in environment variables:');
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

// Compute normalized absolute path for SQLite file
const rawDbPath = parsed.data.DATABASE_PATH;
const resolvedDbPath = path.isAbsolute(rawDbPath)
  ? rawDbPath
  : path.resolve(__dirname, '..', rawDbPath);

export const config = {
  ...parsed.data,
  DATABASE_FILE_PATH: resolvedDbPath
};

export default config;
