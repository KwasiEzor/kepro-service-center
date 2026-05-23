import { UserRole } from '@shared/types';

export * from '@shared/types';

export interface AuthRequest extends Express.Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export interface CreateQuoteDTO {
  userId?: string;
  brand: string;
  model: string;
  year: string;
  vin?: string;
  location?: string;
  serviceType: string;
  description: string;
  message?: string; // fallback
  urgency?: string;
  name?: string;
  email?: string;
  phone?: string;
}

export interface CreateContactDTO {
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  topic?: string; // fallback
  message: string;
}
