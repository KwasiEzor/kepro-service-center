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
router.delete('/quotes/:id',
  authenticate,
  requireAdmin,
  validateParams(z.object({ id: z.string() })),
  (req, res, next) => adminController.deleteQuote(req, res, next)
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
router.delete('/contacts/:id',
  authenticate,
  requireAdmin,
  validateParams(z.object({ id: z.string() })),
  (req, res, next) => adminController.deleteContact(req, res, next)
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

// Invoice Management
router.get('/invoices', authenticate, requireAdmin, (req, res, next) => adminController.getInvoices(req, res, next));
router.get('/invoices/:id', authenticate, requireAdmin, validateParams(z.object({ id: z.string() })), (req, res, next) => adminController.getInvoice(req, res, next));
router.post('/invoices/from-quote/:quoteId',
  authenticate,
  requireAdmin,
  validateParams(z.object({ quoteId: z.string() })),
  validateBody(z.object({
    items: z.array(z.object({
      description: z.string(),
      quantity: z.number().positive(),
      unitPrice: z.number().positive(),
      total: z.number().positive()
    })),
    taxAmount: z.number().nonnegative().optional(),
    dueDate: z.string().optional(),
    notes: z.string().optional()
  })),
  (req, res, next) => adminController.createInvoiceFromQuote(req, res, next)
);
router.put('/invoices/:id',
  authenticate,
  requireAdmin,
  validateParams(z.object({ id: z.string() })),
  validateBody(z.object({
    items: z.array(z.object({
      description: z.string(),
      quantity: z.number().positive(),
      unitPrice: z.number().positive(),
      total: z.number().positive()
    })).optional(),
    taxAmount: z.number().nonnegative().optional(),
    dueDate: z.string().optional(),
    notes: z.string().optional()
  })),
  (req, res, next) => adminController.updateInvoice(req, res, next)
);
router.patch('/invoices/:id/status',
  authenticate,
  requireAdmin,
  validateParams(z.object({ id: z.string() })),
  validateBody(z.object({ status: z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']) })),
  (req, res, next) => adminController.updateInvoiceStatus(req, res, next)
);
router.patch('/invoices/:id/paid',
  authenticate,
  requireAdmin,
  validateParams(z.object({ id: z.string() })),
  validateBody(z.object({
    paymentMethod: z.string(),
    paidAt: z.string().optional()
  })),
  (req, res, next) => adminController.markInvoicePaid(req, res, next)
);
router.delete('/invoices/:id', authenticate, requireAdmin, validateParams(z.object({ id: z.string() })), (req, res, next) => adminController.deleteInvoice(req, res, next));

export default router;
