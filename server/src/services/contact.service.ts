import prisma from '../config/database';
import { ContactStatus } from '@prisma/client';

export class ContactService {
  async createContact(data: any) {
    return prisma.contact.create({
      data: {
        userId: data.userId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.topic || data.subject || 'General Inquiry',
        message: data.message,
        status: ContactStatus.NEW,
      },
    });
  }

  async getContactsByUser(userId: string) {
    return prisma.contact.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
