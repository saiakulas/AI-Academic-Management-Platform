require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/database');
const config = require('./config');
const logger = require('./utils/logger');

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(config.port, () => {
      logger.info(`🚀 EduFlow API running on port ${config.port} [${config.env}]`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Rejection:', reason);
      process.exit(1);
    });

    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', err);
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
