import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import prisma from '../config/database';
import { QuoteStatus, ContactStatus, InvoiceStatus } from '@prisma/client';
import { AuthRequest } from '../types';
import fs from 'fs/promises';
import path from 'path';
import { env } from '../../env';
import { getPaginationParams, paginateResponse } from '../utils/pagination';
import emailService from '../services/email.service';
import invoiceService from '../services/invoice.service';
import logger from '../utils/logger';

export class AdminController {
  /**
   * Get overall stats for dashboard
   */
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const [
        quotesCount, 
        contactsCount, 
        usersCount, 
        imagesCount, 
        invoicesCount,
        revenueData
      ] = await Promise.all([
        prisma.quote.count(),
        prisma.contact.count(),
        prisma.user.count(),
        prisma.image.count(),
        prisma.invoice.count(),
        prisma.invoice.aggregate({
          where: { status: InvoiceStatus.PAID },
          _sum: { total: true }
        })
      ]);

      // Get recent activity
      const [recentQuotes, recentContacts, recentInvoices] = await Promise.all([
        prisma.quote.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, serviceType: true, createdAt: true, status: true } }),
        prisma.contact.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, subject: true, createdAt: true, status: true } }),
        prisma.invoice.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, invoiceNumber: true, total: true, createdAt: true, status: true } })
      ]);

      const recentActivity = [
        ...recentQuotes.map(q => ({ type: 'QUOTE', id: q.id, title: `New quote: ${q.serviceType}`, user: q.name, date: q.createdAt, status: q.status })),
        ...recentContacts.map(c => ({ type: 'CONTACT', id: c.id, title: `New message: ${c.subject}`, user: c.name, date: c.createdAt, status: c.status })),
        ...recentInvoices.map(i => ({ type: 'INVOICE', id: i.id, title: `Invoice ${i.invoiceNumber}`, user: `€${i.total}`, date: i.createdAt, status: i.status }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

      return sendSuccess(res, {
        quotesCount,
        contactsCount,
        usersCount,
        imagesCount,
        invoicesCount,
        totalRevenue: revenueData._sum.total || 0,
        recentActivity
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all quotes with pagination
   */
  async getQuotes(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, search, sortBy, sortOrder } = req.query;
      const pagination = getPaginationParams(req);
      
      const where: any = {};
      if (status && status !== 'all') {
        where.status = status as QuoteStatus;
      }

      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
          { brand: { contains: search as string, mode: 'insensitive' } },
          { model: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const orderBy: any = {};
      if (sortBy) {
        orderBy[sortBy as string] = sortOrder === 'asc' ? 'asc' : 'desc';
      } else {
        orderBy.createdAt = 'desc';
      }

      const [quotes, total] = await Promise.all([
        prisma.quote.findMany({
          where,
          skip: pagination.skip,
          take: pagination.take,
          orderBy,
          include: { user: { select: { email: true, firstName: true } } }
        }),
        prisma.quote.count({ where })
      ]);
      return sendSuccess(res, paginateResponse(quotes, pagination, total));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update quote status
   */
  async updateQuoteStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, adminNotes, estimatedPrice } = req.body;

      const currentQuote = await prisma.quote.findUnique({
        where: { id },
        select: { status: true, email: true, name: true, brand: true, model: true }
      });

      if (!currentQuote) {
        return sendError(res, 'Quote not found', 404);
      }

      const updated = await prisma.quote.update({
        where: { id },
        data: { 
          status: status as QuoteStatus,
          adminNotes,
          estimatedPrice
        }
      });

      // Send email if status changed or admin notes added
      if (status !== currentQuote.status || (adminNotes && adminNotes !== updated.adminNotes)) {
        emailService.sendUserQuoteStatusUpdate(
          updated.email, 
          updated.name, 
          updated
        );
      }

      return sendSuccess(res, updated, 'Quote updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a quote
   */
  async deleteQuote(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await prisma.quote.delete({ where: { id } });
      return sendSuccess(res, null, 'Quote deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all contacts
   */
  async getContacts(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, search, sortBy, sortOrder } = req.query;
      const pagination = getPaginationParams(req);

      const where: any = {};
      if (status && status !== 'all') {
        where.status = status as ContactStatus;
      }

      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
          { subject: { contains: search as string, mode: 'insensitive' } },
          { message: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const orderBy: any = {};
      if (sortBy) {
        orderBy[sortBy as string] = sortOrder === 'asc' ? 'asc' : 'desc';
      } else {
        orderBy.createdAt = 'desc';
      }

      const [contacts, total] = await Promise.all([
        prisma.contact.findMany({
          where,
          skip: pagination.skip,
          take: pagination.take,
          orderBy
        }),
        prisma.contact.count({ where })
      ]);
      return sendSuccess(res, paginateResponse(contacts, pagination, total));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update contact status
   */
  async updateContactStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, adminReply } = req.body;

      const updated = await prisma.contact.update({
        where: { id },
        data: { 
          status: status as ContactStatus,
          adminReply
        }
      });

      // Send email notification if reply is added
      if (adminReply) {
        emailService.sendUserContactReply(
          updated.email,
          updated.name,
          updated.subject || 'Your inquiry',
          adminReply
        );
      }

      return sendSuccess(res, updated, 'Contact message updated');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a contact message
   */
  async deleteContact(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await prisma.contact.delete({ where: { id } });
      return sendSuccess(res, null, 'Contact message deleted');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all images
   */
  async getImages(req: Request, res: Response, next: NextFunction) {
    try {
      const { category } = req.query;
      const pagination = getPaginationParams(req);
      const where = category ? { category: category as string } : undefined;
      const [images, total] = await Promise.all([
        prisma.image.findMany({
          where,
          skip: pagination.skip,
          take: pagination.take,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.image.count({ where })
      ]);
      return sendSuccess(res, paginateResponse(images, pagination, total));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload an image
   */
  async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const file = req.file;
      const { alt } = req.body;
      const category = req.query.category as string;

      if (!file) {
        return sendError(res, 'No file uploaded', 400);
      }

      // Convert path to URL format (relative to public /uploads)
      const imageUrl = `/uploads/${category || 'temp'}/${file.filename}`;

      const image = await prisma.image.create({
        data: {
          url: imageUrl,
          filename: file.filename,
          alt: alt || file.originalname,
          category: category || 'temp',
          size: file.size,
          mimeType: file.mimetype,
          uploadedBy: authReq.user!.id,
        },
      });

      return sendSuccess(res, image, 'Image uploaded successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete an image
   */
  async deleteImage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const image = await prisma.image.findUnique({
        where: { id },
      });

      if (!image) {
        return sendError(res, 'Image not found', 404);
      }

      // Delete from filesystem
      const uploadDir = env.UPLOAD_DIR;
      const filePath = path.join(process.cwd(), uploadDir, image.category || 'temp', image.filename);
      try {
        await fs.unlink(fullPath);
      } catch (err) {
        logger.error({ err, path: fullPath }, 'Failed to delete physical file');
      }
        // Continue to delete from DB even if file is missing
      }

      await prisma.image.delete({
        where: { id },
      });

      return sendSuccess(res, null, 'Image deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  // --- Services CRUD ---

  async getServices(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = getPaginationParams(req, 100); // Services list usually small
      const [services, total] = await Promise.all([
        prisma.service.findMany({
          skip: pagination.skip,
          take: pagination.take,
          orderBy: { order: 'asc' }
        }),
        prisma.service.count()
      ]);
      return sendSuccess(res, paginateResponse(services, pagination, total));
    } catch (error) {
      next(error);
    }
  }

  async createService(req: Request, res: Response, next: NextFunction) {
    try {
      const service = await prisma.service.create({ data: req.body });
      return sendSuccess(res, service, 'Service created', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateService(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const service = await prisma.service.update({ where: { id }, data: req.body });
      return sendSuccess(res, service, 'Service updated');
    } catch (error) {
      next(error);
    }
  }

  async deleteService(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await prisma.service.delete({ where: { id } });
      return sendSuccess(res, null, 'Service deleted');
    } catch (error) {
      next(error);
    }
  }

  // --- FAQ CRUD ---

  async getFAQs(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = getPaginationParams(req, 100); // FAQs list usually small
      const [faqs, total] = await Promise.all([
        prisma.fAQ.findMany({
          skip: pagination.skip,
          take: pagination.take,
          orderBy: { order: 'asc' }
        }),
        prisma.fAQ.count()
      ]);
      return sendSuccess(res, paginateResponse(faqs, pagination, total));
    } catch (error) {
      next(error);
    }
  }

  async createFAQ(req: Request, res: Response, next: NextFunction) {
    try {
      const faq = await prisma.fAQ.create({ data: req.body });
      return sendSuccess(res, faq, 'FAQ created', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateFAQ(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const faq = await prisma.fAQ.update({ where: { id }, data: req.body });
      return sendSuccess(res, faq, 'FAQ updated');
    } catch (error) {
      next(error);
    }
  }

  async deleteFAQ(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await prisma.fAQ.delete({ where: { id } });
      return sendSuccess(res, null, 'FAQ deleted');
    } catch (error) {
      next(error);
    }
  }

  // --- Users Management ---

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { role, search, sortBy, sortOrder } = req.query;
      const pagination = getPaginationParams(req);

      const where: any = {};
      if (role && role !== 'all') {
        where.role = role as any;
      }

      if (search) {
        where.OR = [
          { email: { contains: search as string, mode: 'insensitive' } },
          { firstName: { contains: search as string, mode: 'insensitive' } },
          { lastName: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const orderBy: any = {};
      if (sortBy) {
        orderBy[sortBy as string] = sortOrder === 'asc' ? 'asc' : 'desc';
      } else {
        orderBy.createdAt = 'desc';
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip: pagination.skip,
          take: pagination.take,
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
      return sendSuccess(res, paginateResponse(users, pagination, total));
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { role, firstName, lastName, phone } = req.body;

      const user = await prisma.user.update({
        where: { id },
        data: {
          role,
          firstName,
          lastName,
          phone
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true
        }
      });

      return sendSuccess(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      // Prevent deleting self
      const authReq = req as AuthRequest;
      if (authReq.user?.id === id) {
        return sendError(res, 'You cannot delete your own account', 400);
      }

      await prisma.user.delete({ where: { id } });
      return sendSuccess(res, null, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  // ==================== INVOICE MANAGEMENT ====================

  /**
   * Get all invoices (admin)
   */
  async getInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, search, sortBy, sortOrder } = req.query;
      const pagination = getPaginationParams(req);
      const { invoices, total } = await invoiceService.getAll(
        pagination.skip,
        pagination.take,
        { 
          status: status as string, 
          search: search as string, 
          sortBy: sortBy as string, 
          sortOrder: sortOrder as string 
        }
      );
      return sendSuccess(res, paginateResponse(invoices, pagination, total));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single invoice by ID
   */
  async getInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const invoice = await invoiceService.getById(id);
      if (!invoice) {
        return sendError(res, 'Invoice not found', 404);
      }
      return sendSuccess(res, invoice);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create invoice from quote
   */
  async createInvoiceFromQuote(req: Request, res: Response, next: NextFunction) {
    try {
      const { quoteId } = req.params;
      const { items, taxAmount, dueDate, notes } = req.body;

      const invoice = await invoiceService.createFromQuote({
        quoteId,
        items,
        taxAmount,
        dueDate: new Date(dueDate),
        notes,
      });

      return sendSuccess(res, invoice, 'Invoice created successfully', 201);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Update invoice
   */
  async updateInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await invoiceService.update(id, req.body);
      return sendSuccess(res, updated, 'Invoice updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update invoice status
   */
  async updateInvoiceStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await invoiceService.updateStatus(
        id,
        status as InvoiceStatus
      );
      return sendSuccess(res, updated, 'Invoice status updated');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark invoice as paid
   */
  async markInvoicePaid(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { paymentMethod, paidAt } = req.body;
      const updated = await invoiceService.markPaid(
        id,
        paymentMethod,
        paidAt ? new Date(paidAt) : undefined
      );

      return sendSuccess(res, updated, 'Invoice marked as paid');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete invoice
   */
  async deleteInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await invoiceService.delete(id);
      return sendSuccess(res, null, 'Invoice deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminController();
