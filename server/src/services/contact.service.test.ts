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
      findMany: vi.fn(),
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
    it('should create a contact message with valid data', async () => {
      const mockContactData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'General Question',
        message: 'Hello, I have a question about your services.',
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
          status: ContactStatus.NEW,
        }),
      });
      expect(emailService.sendAdminContactNotification).toHaveBeenCalledWith(mockContactData);
      expect(emailService.sendUserContactConfirmation).toHaveBeenCalledWith(mockContactData);
      expect(result).toEqual(mockCreatedContact);
    });

    it('should use topic as fallback for subject if subject is missing', async () => {
      const mockContactData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        topic: 'Support',
        message: 'Need help with my account',
      } as any;

      (prisma.contact.create as any).mockResolvedValue({ id: '1', ...mockContactData });

      await contactService.createContact(mockContactData);

      expect(prisma.contact.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          subject: 'Support',
        }),
      });
    });

    it('should use default subject if both subject and topic are missing', async () => {
      const mockContactData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Empty subject test',
      } as any;

      (prisma.contact.create as any).mockResolvedValue({ id: '1', ...mockContactData });

      await contactService.createContact(mockContactData);

      expect(prisma.contact.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          subject: 'General Inquiry',
        }),
      });
    });
  });

  describe('getContactsByUser', () => {
    it('should return contacts for a specific user', async () => {
      const userId = 'user_123';
      const mockContacts = [
        { id: '1', userId, subject: 'Issue 1' },
        { id: '2', userId, subject: 'Issue 2' },
      ];

      (prisma.contact.findMany as any).mockResolvedValue(mockContacts);

      const result = await contactService.getContactsByUser(userId);

      expect(prisma.contact.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(2);
      expect(result).toEqual(mockContacts);
    });
  });
});
