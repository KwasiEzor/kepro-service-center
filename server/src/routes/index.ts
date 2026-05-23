import { Router } from 'express';
import chatRouter from '../../api';
import authRoutes from './auth.routes';
import publicRoutes from './public.routes';
import adminRoutes from './admin.routes';
import userRoutes from './user.routes';
import { authLimiter } from '../middleware/rateLimiter';
import { generateToken } from '../middleware/csrf';

const router = Router();

// CSRF Token route
router.get('/csrf-token', (req, res) => {
  res.json({ token: generateToken(req, res) });
});

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
router.use('/chat', chatRouter);
router.use('/auth', authLimiter, authRoutes);
router.use('/public', publicRoutes);
router.use('/admin', adminRoutes);
router.use('/user', userRoutes);

export default router;
