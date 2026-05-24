import { Router } from 'express';
import publicController from '../controllers/public.controller';
import { validateRequest } from '../middleware/validate';
import { z } from 'zod';
import { authenticateOptional } from '../middleware/auth';

const router = Router();

const quoteSchema = z.object({
  serviceType: z.string().max(100),
  brand: z.string().min(2).max(100),
  model: z.string().min(1).max(100),
  year: z.string().max(4),
  location: z.string().max(200).optional(),
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  phone: z.string().min(10).max(20),
  message: z.string().max(5000).optional(),
  urgency: z.string().max(50).optional(),
  vin: z.string().max(17).optional(),
});

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  topic: z.string().max(100).optional(),
  subject: z.string().max(200).optional(),
  message: z.string().min(10).max(5000),
  phone: z.string().max(20).optional(),
});

router.post(
  '/quote',
  authenticateOptional,
  validateRequest(quoteSchema),
  (req, res, next) => publicController.submitQuote(req, res, next)
);

router.post(
  '/contact',
  authenticateOptional,
  validateRequest(contactSchema),
  (req, res, next) => publicController.submitContact(req, res, next)
);

// New public read-only endpoints
router.get('/services', (req, res, next) => publicController.getServices(req, res, next));
router.get('/faqs', (req, res, next) => publicController.getFAQs(req, res, next));
router.get('/gallery', (req, res, next) => publicController.getGallery(req, res, next));

export default router;
