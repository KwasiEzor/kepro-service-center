import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ManagementService } from './management.service';
import prisma from '../config/database';
import emailService from './email.service';
import { QuoteStatus, ContactStatus, UserRole } from '@prisma/client';
import { NotFoundError, BadRequestError } from '../utils/errors';

// Mock Prisma
vi.mock('../config/database', () => ({
  default: {
    quote: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    contact: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    service: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    fAQ: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// Mock EmailService
vi.mock('./email.service', () => ({
  default: {
    sendUserQuoteStatusUpdate: vi.fn(),
    sendUserContactReply: vi.fn(),
  },
}));

describe('ManagementService', () => {
  let managementService: ManagementService;

  beforeEach(() => {
    managementService = new ManagementService();
    vi.clearAllMocks();
  });

  describe('getAllQuotes', () => {
    it('should return paginated quotes with filters', async () => {
      const mockQuotes = [{ id: '1', brand: 'BMW' }];
      (prisma.quote.findMany as any).mockResolvedValue(mockQuotes);
      (prisma.quote.count as any).mockResolvedValue(1);

      const result = await managementService.getAllQuotes(
        0, 10, 
        { status: 'PENDING', search: 'John' }, 
        { sortBy: 'createdAt', sortOrder: 'desc' }
      );

      expect(prisma.quote.findMany).toHaveBeenCalled();
      expect(result.quotes).toEqual(mockQuotes);
      expect(result.total).toBe(1);
    });
  });

  describe('updateQuote', () => {
    it('should update quote and send email if status changes', async () => {
      const mockQuote = { id: '1', status: QuoteStatus.PENDING, email: 'test@test.com', name: 'John' };
      (prisma.quote.findUnique as any).mockResolvedValue(mockQuote);
      (prisma.quote.update as any).mockResolvedValue({ ...mockQuote, status: QuoteStatus.APPROVED });

      const result = await managementService.updateQuote('1', { status: QuoteStatus.APPROVED });

      expect(prisma.quote.update).toHaveBeenCalled();
      expect(emailService.sendUserQuoteStatusUpdate).toHaveBeenCalled();
      expect(result.status).toBe(QuoteStatus.APPROVED);
    });

    it('should throw NotFoundError if quote does not exist', async () => {
      (prisma.quote.findUnique as any).mockResolvedValue(null);

      await expect(managementService.updateQuote('999', { status: QuoteStatus.APPROVED }))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteUser', () => {
    it('should throw BadRequestError if trying to delete self', async () => {
      await expect(managementService.deleteUser('admin-1', 'admin-1'))
        .rejects.toThrow(BadRequestError);
    });

    it('should delete user if not self', async () => {
      (prisma.user.delete as any).mockResolvedValue({ id: 'user-2' });
      const result = await managementService.deleteUser('user-2', 'admin-1');
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'user-2' } });
      expect(result.id).toBe('user-2');
    });
  });
});
