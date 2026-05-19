import { Router } from 'express';
import adminController from '../controllers/admin.controller';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validateParams, validateBody } from '../middleware/validate';
import { uploadSingle } from '../middleware/upload';
import { z } from 'zod';
import { serviceSchema, faqSchema } from '../utils/validators';

const router = Router();

// Stats for dashboard
router.get('/stats', authenticate, requireAdmin, (req, res, next) => adminController.getStats(req, res, next));

// Quote Management
router.get('/quotes', authenticate, requireAdmin, (req, res, next) => adminController.getQuotes(req, res, next));
router.patch('/quotes/:id/status', 
  authenticate, 
  requireAdmin, 
  validateParams(z.object({ id: z.string() })),
  validateBody(z.object({ status: z.string(), adminNotes: z.string().optional(), estimatedPrice: z.coerce.number().optional() })),
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

// Gallery Management
router.get('/images', authenticate, requireAdmin, (req, res, next) => adminController.getImages(req, res, next));
router.post('/images/upload', authenticate, requireAdmin, uploadSingle, (req, res, next) => adminController.uploadImage(req, res, next));
router.delete('/images/:id', authenticate, requireAdmin, validateParams(z.object({ id: z.string() })), (req, res, next) => adminController.deleteImage(req, res, next));

// Services Management
router.get('/services', authenticate, requireAdmin, (req, res, next) => adminController.getServices(req, res, next));
router.post('/services', authenticate, requireAdmin, validateBody(serviceSchema), (req, res, next) => adminController.createService(req, res, next));
router.patch('/services/:id', authenticate, requireAdmin, validateParams(z.object({ id: z.string() })), validateBody(serviceSchema.partial()), (req, res, next) => adminController.updateService(req, res, next));
router.delete('/services/:id', authenticate, requireAdmin, validateParams(z.object({ id: z.string() })), (req, res, next) => adminController.deleteService(req, res, next));

// FAQ Management
router.get('/faqs', authenticate, requireAdmin, (req, res, next) => adminController.getFAQs(req, res, next));
router.post('/faqs', authenticate, requireAdmin, validateBody(faqSchema), (req, res, next) => adminController.createFAQ(req, res, next));
router.patch('/faqs/:id', authenticate, requireAdmin, validateParams(z.object({ id: z.string() })), validateBody(faqSchema.partial()), (req, res, next) => adminController.updateFAQ(req, res, next));
router.delete('/faqs/:id', authenticate, requireAdmin, validateParams(z.object({ id: z.string() })), (req, res, next) => adminController.deleteFAQ(req, res, next));

// User Management
router.get('/users', authenticate, requireAdmin, (req, res, next) => adminController.getUsers(req, res, next));
router.patch('/users/:id', 
  authenticate, 
  requireAdmin, 
  validateParams(z.object({ id: z.string() })),
  validateBody(z.object({ 
    role: z.enum(['USER', 'ADMIN']).optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional()
  })),
  (req, res, next) => adminController.updateUser(req, res, next)
);
router.delete('/users/:id', 
  authenticate, 
  requireAdmin, 
  validateParams(z.object({ id: z.string() })), 
  (req, res, next) => adminController.deleteUser(req, res, next)
);

export default router;
