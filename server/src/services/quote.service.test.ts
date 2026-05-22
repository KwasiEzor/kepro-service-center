import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QuoteService } from './quote.service';
import prisma from '../config/database';
import { QuoteStatus } from '@prisma/client';
import emailService from './email.service';

// Mock EmailService
vi.mock('./email.service', () => ({
  default: {
    sendAdminQuoteNotification: vi.fn(),
    sendUserQuoteConfirmation: vi.fn(),
  },
}));

// Mock Prisma
vi.mock('../config/database', () => ({
  default: {
    quote: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe('QuoteService', () => {
  let quoteService: QuoteService;

  beforeEach(() => {
    quoteService = new QuoteService();
    vi.clearAllMocks();
  });

  describe('createQuote', () => {
    it('should create a quote with valid data', async () => {
      const mockQuoteData = {
        brand: 'Toyota',
        model: 'Camry',
        year: '2020',
        serviceType: 'key_programming',
        description: 'Lost all keys',
        email: 'test@example.com',
      };

      const mockCreatedQuote = {
        id: 'quote_123',
        ...mockQuoteData,
        status: QuoteStatus.PENDING,
        createdAt: new Date(),
      };

      (prisma.quote.create as any).mockResolvedValue(mockCreatedQuote);

      const result = await quoteService.createQuote(mockQuoteData);

      expect(prisma.quote.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          brand: 'Toyota',
          model: 'Camry',
          status: QuoteStatus.PENDING,
        }),
      });
      expect(emailService.sendAdminQuoteNotification).toHaveBeenCalledWith(mockQuoteData);
      expect(emailService.sendUserQuoteConfirmation).toHaveBeenCalledWith(mockQuoteData);
      expect(result).toEqual(mockCreatedQuote);
    });

    it('should use message as fallback for description if description is missing', async () => {
      const mockQuoteData = {
        brand: 'Honda',
        model: 'Civic',
        year: '2022',
        serviceType: 'diagnostic',
        message: 'Dashboard lights on',
      } as any;

      (prisma.quote.create as any).mockResolvedValue({ id: '1', ...mockQuoteData });

      await quoteService.createQuote(mockQuoteData);

      expect(prisma.quote.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          description: 'Dashboard lights on',
        }),
      });
    });

    it('should handle urgency and userId correctly', async () => {
      const mockQuoteData = {
        brand: 'Ford',
        model: 'F-150',
        year: '2019',
        serviceType: 'ecu',
        description: 'ECU issue',
        urgency: 'urgent',
        userId: 'user_123',
      } as any;

      (prisma.quote.create as any).mockResolvedValue({ id: '1', ...mockQuoteData });

      await quoteService.createQuote(mockQuoteData);

      expect(prisma.quote.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          urgency: 'urgent',
          userId: 'user_123',
        }),
      });
    });
  });

  describe('getQuotesByUser', () => {
    it('should return quotes for a specific user', async () => {
      const userId = 'user_123';
      const mockQuotes = [
        { id: '1', userId, brand: 'Tesla' },
        { id: '2', userId, brand: 'BMW' },
      ];

      (prisma.quote.findMany as any).mockResolvedValue(mockQuotes);

      const result = await quoteService.getQuotesByUser(userId);

      expect(prisma.quote.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(2);
      expect(result).toEqual(mockQuotes);
    });
  });
});
