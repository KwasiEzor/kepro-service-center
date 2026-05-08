import { z } from 'zod';

// Auth validators
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Quote validators
export const quoteSchema = z.object({
  brand: z.string().min(1, 'Vehicle brand is required'),
  model: z.string().min(1, 'Vehicle model is required'),
  year: z.string().min(4).max(4),
  vin: z.string().optional(),
  serviceType: z.enum(['key_programming', 'diagnostic', 'ecu', 'other']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  urgency: z.enum(['normal', 'urgent', 'emergency']).optional(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

export const updateQuoteSchema = z.object({
  status: z.enum(['PENDING', 'REVIEWING', 'APPROVED', 'REJECTED']).optional(),
  adminNotes: z.string().optional(),
  estimatedPrice: z.number().positive().optional(),
});

// Contact validators
export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
});

export const updateContactSchema = z.object({
  status: z.enum(['NEW', 'READ', 'REPLIED', 'ARCHIVED']).optional(),
  adminReply: z.string().optional(),
});

// Service validators
export const serviceSchema = z.object({
  nameFr: z.string().min(3, 'French name is required'),
  nameEn: z.string().min(3, 'English name is required'),
  descriptionFr: z.string().min(10, 'French description is required'),
  descriptionEn: z.string().min(10, 'English description is required'),
  icon: z.string().optional(),
  priceFrom: z.number().positive().optional(),
  priceTo: z.number().positive().optional(),
  duration: z.string().optional(),
  order: z.number().int().default(0),
  active: z.boolean().default(true),
});

// FAQ validators
export const faqSchema = z.object({
  questionFr: z.string().min(10, 'French question is required'),
  questionEn: z.string().min(10, 'English question is required'),
  answerFr: z.string().min(20, 'French answer is required'),
  answerEn: z.string().min(20, 'English answer is required'),
  category: z.string().optional(),
  order: z.number().int().default(0),
  active: z.boolean().default(true),
});

// User update validators
export const updateUserSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(['USER', 'ADMIN']),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

// Pagination validators
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
