import prisma from '../config/database';
import { QuoteStatus } from '@prisma/client';

export class QuoteService {
  async createQuote(data: any) {
    return prisma.quote.create({
      data: {
        userId: data.userId,
        brand: data.brand,
        model: data.model,
        year: data.year,
        vin: data.vin,
        serviceType: data.serviceType,
        description: data.message || data.description || '',
        urgency: data.urgency || 'normal',
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: QuoteStatus.PENDING,
      },
    });
  }

  async getQuotesByUser(userId: string) {
    return prisma.quote.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
