const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');
const { initDb, pool } = require('./config/db');

const start = async () => {
  try {
    await initDb();

    const server = app.listen(env.port, () => {
      logger.info(`DelphiMinds API listening on port ${env.port}`);
    });

    const shutdown = async (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await pool.end();
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
};

start();
