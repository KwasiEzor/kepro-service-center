import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';

const router = Router();

/**
 * Main health check endpoint
 * Returns detailed health status including database connectivity
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Check database connection
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - startTime;

    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: 'connected',
        latency: `${dbLatency}ms`
      },
      version: process.env.npm_package_version || '1.0.0',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: {
        status: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

/**
 * Kubernetes readiness probe
 * Returns 200 if service is ready to accept traffic
 */
router.get('/health/ready', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).send('OK');
  } catch {
    res.status(503).send('NOT READY');
  }
});

/**
 * Kubernetes liveness probe
 * Returns 200 if service is alive (always succeeds unless process is dead)
 */
router.get('/health/live', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

export default router;
