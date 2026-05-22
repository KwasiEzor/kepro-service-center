export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    quotes: number;
    contacts: number;
  };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Quote {
  id: string;
  userId?: string;
  brand: string;
  model: string;
  year: string;
  vin?: string;
  serviceType: string;
  description: string;
  urgency?: string;
  name?: string;
  email?: string;
  phone?: string;
  status: 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED';
  adminNotes?: string;
  estimatedPrice?: number;
  createdAt: string;
  updatedAt: string;
}

export type ServiceType = 'keys' | 'diagnostic' | 'immobilizer' | 'other';

export interface Contact {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'NEW' | 'READ' | 'REPLIED' | 'ARCHIVED';
  adminReply?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Image {
  id: string;
  url: string;
  filename: string;
  alt?: string;
  category?: string;
  size: number;
  mimeType: string;
  uploadedBy: string;
  createdAt: string;
}

export interface Service {
  id: string;
  nameFr: string;
  nameEn: string;
  descriptionFr: string;
  descriptionEn: string;
  category?: string;
  icon?: string;
  priceFrom?: number;
  priceTo?: number;
  duration?: string;
  order: number;
  active: boolean;
}

export interface FAQ {
  id: string;
  questionFr: string;
  questionEn: string;
  answerFr: string;
  answerEn: string;
  category?: string;
  order: number;
  active: boolean;
}

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  serviceId?: string;
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
  userId?: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  notes?: string;
  dueDate: string;
  paidAt?: string;
  paymentMethod?: string;
  status: InvoiceStatus;
  items?: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
}
