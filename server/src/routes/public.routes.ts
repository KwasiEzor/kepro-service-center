import { Router } from 'express';
import publicController from '../controllers/public.controller';
import { validateRequest } from '../middleware/validate';
import { z } from 'zod';
import { authenticateOptional } from '../middleware/auth';

const router = Router();

const quoteSchema = z.object({
  serviceType: z.string(),
  brand: z.string().min(2),
  model: z.string().min(1),
  year: z.string(),
  location: z.string().optional(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  message: z.string().optional(),
  urgency: z.string().optional(),
  vin: z.string().optional(),
});

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  topic: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10),
  phone: z.string().optional(),
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
