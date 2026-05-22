import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContactService } from './contact.service';
import prisma from '../config/database';
import { ContactStatus } from '@prisma/client';
import emailService from './email.service';

// Mock EmailService
vi.mock('./email.service', () => ({
  default: {
    sendAdminContactNotification: vi.fn(),
    sendUserContactConfirmation: vi.fn(),
  },
}));

// Mock Prisma
vi.mock('../config/database', () => ({
  default: {
    contact: {
      create: vi.fn(),
    },
  },
}));

describe('ContactService', () => {
  let contactService: ContactService;

  beforeEach(() => {
    contactService = new ContactService();
    vi.clearAllMocks();
  });

  describe('createContact', () => {
    it('should create a contact and send notifications', async () => {
      const mockContactData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Help',
        message: 'I need help with my keys',
      };

      const mockCreatedContact = {
        id: 'contact_123',
        ...mockContactData,
        status: ContactStatus.NEW,
        createdAt: new Date(),
      };

      (prisma.contact.create as any).mockResolvedValue(mockCreatedContact);

      const result = await contactService.createContact(mockContactData);

      expect(prisma.contact.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'John Doe',
          email: 'john@example.com',
          status: ContactStatus.NEW,
        }),
      });
      
      expect(emailService.sendAdminContactNotification).toHaveBeenCalledWith(mockContactData);
      expect(emailService.sendUserContactConfirmation).toHaveBeenCalledWith(mockContactData);
      expect(result).toEqual(mockCreatedContact);
    });
  });
});
