// Shared Type Definitions for Frontend and Backend

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum QuoteStatus {
  PENDING = 'PENDING',
  REVIEWING = 'REVIEWING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum ContactStatus {
  NEW = 'NEW',
  READ = 'READ',
  REPLIED = 'REPLIED',
  ARCHIVED = 'ARCHIVED',
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  role: UserRole;
  emailVerified: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  _count?: {
    quotes: number;
    contacts: number;
  };
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Quote {
  id: string;
  userId?: string | null;
  brand: string;
  model: string;
  year: string;
  vin?: string | null;
  serviceType: string;
  location?: string | null;
  description: string;
  urgency?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  status: QuoteStatus;
  adminNotes?: string | null;
  estimatedPrice?: number | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  user?: Partial<User>;
}

export type ServiceType = 'keys' | 'diagnostic' | 'immobilizer' | 'other';

export interface Contact {
  id: string;
  userId?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  status: ContactStatus;
  adminReply?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Image {
  id: string;
  url: string;
  filename: string;
  alt?: string | null;
  category?: string | null;
  size: number;
  mimeType: string;
  uploadedBy: string;
  createdAt: string | Date;
}

export interface Service {
  id: string;
  nameFr: string;
  nameEn: string;
  descriptionFr: string;
  descriptionEn: string;
  category?: string | null;
  icon?: string | null;
  priceFrom?: number | null;
  priceTo?: number | null;
  duration?: string | null;
  order: number;
  active: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface FAQ {
  id: string;
  questionFr: string;
  questionEn: string;
  answerFr: string;
  answerEn: string;
  category?: string | null;
  order: number;
  active: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  serviceId?: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  order: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  quoteId: string;
  userId?: string | null;
  subtotal: number;
  taxAmount: number;
  total: number;
  notes?: string | null;
  dueDate: string | Date;
  paidAt?: string | Date | null;
  paymentMethod?: string | null;
  status: InvoiceStatus;
  items?: InvoiceItem[];
  createdAt: string | Date;
  updatedAt: string | Date;
  quote?: Partial<Quote>;
  user?: Partial<User>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
