import { Router } from 'express';
import chatRouter from '../../api';
import authRoutes from './auth.routes';
import publicRoutes from './public.routes';
import adminRoutes from './admin.routes';
import userRoutes from './user.routes';
import healthRoutes from './health';
import { authLimiter, userRateLimiter } from '../middleware/rateLimiter';
import { generateToken } from '../middleware/csrf';

const router = Router();

// CSRF Token route
router.get('/csrf-token', (req, res) => {
  res.json({ token: generateToken(req, res) });
});

// Health check routes (production-grade with DB checks)
router.use(healthRoutes);

// API routes
router.use('/chat', chatRouter);
router.use('/auth', authLimiter, authRoutes);
router.use('/public', publicRoutes);
router.use('/admin', userRateLimiter, adminRoutes); // Per-user rate limiting for admin routes
router.use('/user', userRateLimiter, userRoutes); // Per-user rate limiting for user routes

export default router;
