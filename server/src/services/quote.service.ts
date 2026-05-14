import prisma from '../config/database';
import { QuoteStatus } from '@prisma/client';
import { CreateQuoteDTO } from '../types';
import emailService from './email.service';

export class QuoteService {
  async createQuote(data: CreateQuoteDTO) {
    const quote = await prisma.quote.create({
      data: {
        userId: data.userId,
        brand: data.brand,
        model: data.model,
        year: data.year,
        vin: data.vin,
        location: data.location,
        serviceType: data.serviceType,
        description: data.message || data.description || '',
        urgency: data.urgency || 'normal',
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: QuoteStatus.PENDING,
      },
    });

    // Send async notification (don't await to not block response)
    emailService.sendAdminQuoteNotification(data);

    return quote;
  }

  async getQuotesByUser(userId: string) {
    return prisma.quote.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
