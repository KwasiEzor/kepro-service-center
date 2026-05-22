import prisma from '../config/database';
import { QuoteStatus, ContactStatus, UserRole } from '@prisma/client';
import emailService from './email.service';
import { NotFoundError, BadRequestError } from '../utils/errors';

export class ManagementService {
  // --- Quotes Management ---

  async getAllQuotes(
    skip: number,
    take: number,
    filters: { status?: string; search?: string },
    sorting: { sortBy?: string; sortOrder?: string }
  ) {
    const where: any = {};
    if (filters.status && filters.status !== 'all') {
      where.status = filters.status as QuoteStatus;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { brand: { contains: filters.search, mode: 'insensitive' } },
        { model: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    if (sorting.sortBy) {
      orderBy[sorting.sortBy] = sorting.sortOrder === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
        where,
        skip,
        take,
        orderBy,
        include: { user: { select: { email: true, firstName: true } } }
      }),
      prisma.quote.count({ where })
    ]);

    return { quotes, total };
  }

  async updateQuote(id: string, data: { status: QuoteStatus; adminNotes?: string; estimatedPrice?: number }) {
    const currentQuote = await prisma.quote.findUnique({
      where: { id },
      select: { status: true, email: true, name: true, brand: true, model: true }
    });

    if (!currentQuote) {
      throw new NotFoundError('Quote not found');
    }

    const updated = await prisma.quote.update({
      where: { id },
      data: { 
        status: data.status,
        adminNotes: data.adminNotes,
        estimatedPrice: data.estimatedPrice
      }
    });

    // Send email if status changed or admin notes added
    if (data.status !== currentQuote.status || (data.adminNotes && data.adminNotes !== updated.adminNotes)) {
      emailService.sendUserQuoteStatusUpdate(
        updated.email!, 
        updated.name!, 
        updated
      );
    }

    return updated;
  }

  async deleteQuote(id: string) {
    return prisma.quote.delete({ where: { id } });
  }

  // --- Contacts Management ---

  async getAllContacts(
    skip: number,
    take: number,
    filters: { status?: string; search?: string },
    sorting: { sortBy?: string; sortOrder?: string }
  ) {
    const where: any = {};
    if (filters.status && filters.status !== 'all') {
      where.status = filters.status as ContactStatus;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { subject: { contains: filters.search, mode: 'insensitive' } },
        { message: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    if (sorting.sortBy) {
      orderBy[sorting.sortBy] = sorting.sortOrder === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        skip,
        take,
        orderBy
      }),
      prisma.contact.count({ where })
    ]);

    return { contacts, total };
  }

  async updateContact(id: string, data: { status: ContactStatus; adminReply?: string }) {
    const updated = await prisma.contact.update({
      where: { id },
      data: { 
        status: data.status,
        adminReply: data.adminReply
      }
    });

    // Send email notification if reply is added
    if (data.adminReply) {
      emailService.sendUserContactReply(
        updated.email,
        updated.name,
        updated.subject || 'Your inquiry',
        data.adminReply
      );
    }

    return updated;
  }

  async deleteContact(id: string) {
    return prisma.contact.delete({ where: { id } });
  }

  // --- User Management ---

  async getAllUsers(
    skip: number,
    take: number,
    filters: { role?: string; search?: string },
    sorting: { sortBy?: string; sortOrder?: string }
  ) {
    const where: any = {};
    if (filters.role && filters.role !== 'all') {
      where.role = filters.role as UserRole;
    }

    if (filters.search) {
      where.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    if (sorting.sortBy) {
      orderBy[sorting.sortBy] = sorting.sortOrder === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              quotes: true,
              contacts: true
            }
          }
        },
        orderBy
      }),
      prisma.user.count({ where })
    ]);

    return { users, total };
  }

  async updateUser(id: string, data: { role?: UserRole; firstName?: string; lastName?: string; phone?: string }) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true
      }
    });
  }

  async deleteUser(id: string, requesterId: string) {
    if (id === requesterId) {
      throw new BadRequestError('You cannot delete your own account');
    }
    return prisma.user.delete({ where: { id } });
  }

  // --- Services Management ---

  async getAllServices(skip: number, take: number) {
    const [services, total] = await Promise.all([
      prisma.service.findMany({
        skip,
        take,
        orderBy: { order: 'asc' }
      }),
      prisma.service.count()
    ]);
    return { services, total };
  }

  async createService(data: any) {
    return prisma.service.create({ data });
  }

  async updateService(id: string, data: any) {
    return prisma.service.update({ where: { id }, data });
  }

  async deleteService(id: string) {
    return prisma.service.delete({ where: { id } });
  }

  // --- FAQ Management ---

  async getAllFAQs(skip: number, take: number) {
    const [faqs, total] = await Promise.all([
      prisma.fAQ.findMany({
        skip,
        take,
        orderBy: { order: 'asc' }
      }),
      prisma.fAQ.count()
    ]);
    return { faqs, total };
  }

  async createFAQ(data: any) {
    return prisma.fAQ.create({ data });
  }

  async updateFAQ(id: string, data: any) {
    return prisma.fAQ.update({ where: { id }, data });
  }

  async deleteFAQ(id: string) {
    return prisma.fAQ.delete({ where: { id } });
  }
}

export default new ManagementService();
