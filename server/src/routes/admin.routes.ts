import { Router } from 'express';
import adminController from '../controllers/admin.controller';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validateQuery, validateParams, validateBody } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

// Stats for dashboard
router.get('/stats', authenticate, requireAdmin, (req, res, next) => adminController.getStats(req, res, next));

// Quote Management
router.get('/quotes', authenticate, requireAdmin, (req, res, next) => adminController.getQuotes(req, res, next));
router.patch('/quotes/:id/status', 
  authenticate, 
  requireAdmin, 
  validateParams(z.object({ id: z.string() })),
  validateBody(z.object({ status: z.string(), adminNotes: z.string().optional(), estimatedPrice: z.number().optional() })),
  (req, res, next) => adminController.updateQuoteStatus(req, res, next)
);

// Contact Management
router.get('/contacts', authenticate, requireAdmin, (req, res, next) => adminController.getContacts(req, res, next));
router.patch('/contacts/:id/status', 
  authenticate, 
  requireAdmin, 
  validateParams(z.object({ id: z.string() })),
  validateBody(z.object({ status: z.string(), adminReply: z.string().optional() })),
  (req, res, next) => adminController.updateContactStatus(req, res, next)
);

export default router;
