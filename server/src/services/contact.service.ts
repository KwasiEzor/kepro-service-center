import prisma from '../config/database';
import { ContactStatus } from '@prisma/client';
import { CreateContactDTO } from '../types';
import emailService from './email.service';

export class ContactService {
  async createContact(data: CreateContactDTO) {
    const contact = await prisma.contact.create({
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

    // Send async notification
    emailService.sendAdminContactNotification(data);
    emailService.sendUserContactConfirmation(data);

    return contact;
  }

  async getContactsByUser(userId: string) {
    return prisma.contact.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
