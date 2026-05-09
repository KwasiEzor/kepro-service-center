import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import prisma from '../config/database';
import { QuoteStatus, ContactStatus } from '@prisma/client';

export class AdminController {
  /**
   * Get overall stats for dashboard
   */
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const [quotesCount, contactsCount, usersCount, imagesCount] = await Promise.all([
        prisma.quote.count(),
        prisma.contact.count(),
        prisma.user.count(),
        prisma.image.count()
      ]);

      return sendSuccess(res, {
        quotesCount,
        contactsCount,
        usersCount,
        imagesCount
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
      const quotes = await prisma.quote.findMany({
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true, firstName: true } } }
      });
      return sendSuccess(res, quotes);
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

      const updated = await prisma.quote.update({
        where: { id },
        data: { 
          status: status as QuoteStatus,
          adminNotes,
          estimatedPrice
        }
      });

      return sendSuccess(res, updated, 'Quote updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all contacts
   */
  async getContacts(req: Request, res: Response, next: NextFunction) {
    try {
      const contacts = await prisma.contact.findMany({
        orderBy: { createdAt: 'desc' }
      });
      return sendSuccess(res, contacts);
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

      return sendSuccess(res, updated, 'Contact message updated');
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminController();
