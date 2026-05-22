import cron from 'node-cron';
import prisma from '../config/database';
import logger from '../utils/logger';

/**
 * Start scheduled cleanup jobs
 */
export const startCleanupJobs = () => {
  // Run every 12 hours
  cron.schedule('0 */12 * * *', async () => {
    logger.info('🧹 Starting scheduled cleanup jobs...');
    
    try {
      // 1. Clean expired sessions
      const deletedSessions = await prisma.session.deleteMany({
        where: {
          expiresAt: { lt: new Date() },
        },
      });
      
      if (deletedSessions.count > 0) {
        logger.info({ count: deletedSessions.count }, '✅ Cleaned expired sessions');
      }

      // 2. Clean temporary uploads (older than 24 hours)
      // This would require tracking file age, for now we just clean expired database sessions
      
    } catch (error) {
      logger.error({ err: error }, '❌ Cleanup job failed');
    }
  });

  logger.info('⏰ Cleanup jobs scheduled');
};
