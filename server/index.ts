import 'dotenv/config';
import express from 'express';
import * as Sentry from '@sentry/node';
import path from 'path';
import { env } from './env';
import { errorHandler } from './src/middleware/errorHandler';
import logger from './src/utils/logger';
import { startCleanupJobs } from './src/jobs/cleanup';
import { configureMiddleware } from './src/config/middleware';
import rootRouter from './src/routes';

// Initialize Sentry
if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: 1.0,
  });
}

const app = express();
const PORT = parseInt(env.PORT);

// Configure all middlewares (Security, CORS, CSRF, etc.)
configureMiddleware(app);

// Static files
const uploadDir = env.UPLOAD_DIR;
const uploadsPath = path.isAbsolute(uploadDir) 
  ? uploadDir 
  : path.join(process.cwd(), uploadDir);
app.use('/uploads', express.static(uploadsPath));

// Mounting all routes
app.use('/api', rootRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Global error handler
if (env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}
app.use(errorHandler);

// Start background jobs
startCleanupJobs();

const host = '0.0.0.0';
app.listen(PORT, host, () => {
  logger.info(`✅ API server on http://localhost:${PORT}`);
  logger.info(`📁 Uploads directory: ${uploadDir}`);
  logger.info(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
});
