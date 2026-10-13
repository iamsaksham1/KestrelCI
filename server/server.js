/**
 * @file server/server.js
 * @description Server startup entrypoint.
 * Automatically runs pending migrations, seeds demo data if unseeded,
 * and starts listening on the configured port.
 */

import http from 'http';
import app from './app.js';
import config from './config/index.js';
import { runMigrations } from './database/migrate.js';
import { seedDatabase } from './database/seeds/seed.js';
import { closeDb } from './database/connection.js';

// Auto-migrate and seed in development mode
if (config.NODE_ENV !== 'test') {
  try {
    runMigrations();
    seedDatabase();
  } catch (err) {
    console.error('Database initialization warning:', err.message);
  }
}

const server = http.createServer(app);

server.listen(config.PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║               KestrelCI Engine & REST API                    ║
║  Status: ONLINE                                              ║
║  Address: http://localhost:${config.PORT}                             ║
║  API Root: http://localhost:${config.PORT}/api/v1                     ║
║  Environment: ${config.NODE_ENV}                                ║
╚══════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
function gracefulShutdown(signal) {
  console.log(`\nReceived ${signal}. Shutting down KestrelCI server cleanly...`);
  server.close(() => {
    closeDb();
    console.log('Database connection closed. Goodbye.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default server;
