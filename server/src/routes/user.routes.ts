import { Router } from 'express';
import userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

const profileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().optional(),
});

// All user routes require authentication
router.use(authenticate);

router.get('/profile', (req, res, next) => userController.getProfile(req, res, next));
router.patch('/profile', validateBody(profileSchema), (req, res, next) => userController.updateProfile(req, res, next));

router.get('/quotes', (req, res, next) => userController.getMyQuotes(req, res, next));
router.get('/contacts', (req, res, next) => userController.getMyContacts(req, res, next));

export default router;
