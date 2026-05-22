import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalyticsService } from './analytics.service';
import prisma from '../config/database';
import { InvoiceStatus } from '@prisma/client';

// Mock Prisma
vi.mock('../config/database', () => ({
  default: {
    quote: {
      count: vi.fn(),
      groupBy: vi.fn(),
      findMany: vi.fn(),
    },
    contact: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    user: {
      count: vi.fn(),
    },
    image: {
      count: vi.fn(),
    },
    invoice: {
      count: vi.fn(),
      aggregate: vi.fn(),
      findMany: vi.fn(),
      groupBy: vi.fn(),
    },
  },
}));

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;

  beforeEach(() => {
    analyticsService = new AnalyticsService();
    vi.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    it('should return aggregated dashboard statistics', async () => {
      (prisma.quote.count as any).mockResolvedValue(10);
      (prisma.contact.count as any).mockResolvedValue(5);
      (prisma.user.count as any).mockResolvedValue(20);
      (prisma.image.count as any).mockResolvedValue(15);
      (prisma.invoice.count as any).mockResolvedValue(8);
      (prisma.invoice.aggregate as any).mockResolvedValue({ _sum: { total: 1000 } });
      
      (prisma.quote.findMany as any).mockResolvedValue([]);
      (prisma.contact.findMany as any).mockResolvedValue([]);
      (prisma.invoice.findMany as any).mockResolvedValue([]);
      
      (prisma.invoice.groupBy as any).mockResolvedValue([]);
      (prisma.quote.groupBy as any).mockResolvedValue([]);

      const result = await analyticsService.getDashboardStats();

      expect(result.quotesCount).toBe(10);
      expect(result.totalRevenue).toBe(1000);
      expect(result.recentActivity).toBeDefined();
    });
  });
});
