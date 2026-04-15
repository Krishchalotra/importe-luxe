require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const cron = require('node-cron');
const { syncAllCategories } = require('./services/ebay.service');

// Handle uncaught exceptions FIRST
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });

  // Auto-sync eBay products every 6 hours (only if credentials are set)
  if (process.env.EBAY_CLIENT_ID && process.env.EBAY_CLIENT_ID !== 'your_ebay_client_id') {
    cron.schedule('0 */6 * * *', async () => {
      logger.info('Running scheduled eBay product sync...');
      try {
        const results = await syncAllCategories(8);
        logger.info('eBay sync complete:', results);
      } catch (err) {
        logger.error('eBay sync failed:', err.message);
      }
    });
    logger.info('eBay auto-sync scheduled every 6 hours');
  }

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION! Shutting down...', err);
    server.close(() => process.exit(1));
  });

  // Graceful shutdown on SIGTERM
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      logger.info('Process terminated.');
    });
  });
};

startServer();
