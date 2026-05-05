import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name too short').max(100, 'Name too long'),
  email: z.string().email('Invalid email'),
  topic: z.enum(['General Inquiry', 'Key Support', 'B2B Partnerships', 'Careers']),
  message: z.string().min(10, 'Message too short').max(1000, 'Message too long'),
});

export const quoteFormSchema = z.object({
  serviceType: z.enum(['keys', 'diagnostic', 'immobilizer', 'other']),
  brand: z.string().min(2, 'Brand required').max(50),
  model: z.string().min(1, 'Model required').max(50),
  year: z
    .string()
    .regex(/^\d{4}$/, 'Invalid year')
    .refine((val) => {
      const year = parseInt(val);
      return year >= 1980 && year <= new Date().getFullYear() + 1;
    }, 'Year out of range'),
  location: z.string().min(2, 'Location required').max(100),
  name: z.string().min(2, 'Name required').max(100),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone').min(10, 'Phone too short'),
  message: z.string().max(1000, 'Message too long').optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
export type QuoteFormData = z.infer<typeof quoteFormSchema>;
