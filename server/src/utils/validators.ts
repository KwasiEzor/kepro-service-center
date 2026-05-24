import { z } from 'zod';

// Auth validators
export const registerSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  password: z.string().min(1, 'Password is required').max(128),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required').max(500),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required').max(1000),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

// Quote validators
export const quoteSchema = z.object({
  brand: z.string().min(1, 'Vehicle brand is required').max(100),
  model: z.string().min(1, 'Vehicle model is required').max(100),
  year: z.string().min(4).max(4),
  vin: z.string().max(17).optional(),
  serviceType: z.enum(['key_programming', 'diagnostic', 'ecu', 'other']),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  urgency: z.enum(['normal', 'urgent', 'emergency']).optional(),
  name: z.string().max(100).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(20).optional(),
});

export const updateQuoteSchema = z.object({
  status: z.enum(['PENDING', 'REVIEWING', 'APPROVED', 'REJECTED']).optional(),
  adminNotes: z.string().max(5000).optional(),
  estimatedPrice: z.number().positive().optional(),
});

// Contact validators
export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').max(255),
  phone: z.string().max(20).optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
  message: z.string().min(20, 'Message must be at least 20 characters').max(5000),
});

export const updateContactSchema = z.object({
  status: z.enum(['NEW', 'READ', 'REPLIED', 'ARCHIVED']).optional(),
  adminReply: z.string().max(5000).optional(),
});

// Service validators
export const serviceSchema = z.object({
  nameFr: z.string().min(3, 'French name is required').max(200),
  nameEn: z.string().min(3, 'English name is required').max(200),
  descriptionFr: z.string().min(10, 'French description is required').max(10000),
  descriptionEn: z.string().min(10, 'English description is required').max(10000),
  icon: z.string().max(100).optional(),
  priceFrom: z.number().positive().optional(),
  priceTo: z.number().positive().optional(),
  duration: z.string().max(50).optional(),
  order: z.number().int().default(0),
  active: z.boolean().default(true),
});

// FAQ validators
export const faqSchema = z.object({
  questionFr: z.string().min(10, 'French question is required').max(500),
  questionEn: z.string().min(10, 'English question is required').max(500),
  answerFr: z.string().min(20, 'French answer is required').max(10000),
  answerEn: z.string().min(20, 'English answer is required').max(10000),
  category: z.string().max(100).optional(),
  order: z.number().int().default(0),
  active: z.boolean().default(true),
});

// User update validators
export const updateUserSchema = z.object({
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(255).optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(['USER', 'ADMIN']),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required').max(128),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

// Pagination validators
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().max(50).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
