import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import { QuoteService } from '../services/quote.service';
import { ContactService } from '../services/contact.service';
import { AuthRequest } from '../types';
import prisma from '../config/database';

export class PublicController {
  private quoteService = new QuoteService();
  private contactService = new ContactService();

  /**
   * Submit a new quote request
   * POST /api/public/quote
   */
  async submitQuote(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id;
      
      const result = await this.quoteService.createQuote({
        ...req.body,
        userId
      });

      return sendSuccess(res, result, 'Quote request submitted successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit a contact message
   * POST /api/public/contact
   */
  async submitContact(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id;

      const result = await this.contactService.createContact({
        ...req.body,
        userId
      });

      return sendSuccess(res, result, 'Message sent successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get active services
   */
  async getServices(req: Request, res: Response, next: NextFunction) {
    try {
      const services = await prisma.service.findMany({
        where: { active: true },
        orderBy: { order: 'asc' }
      });
      return sendSuccess(res, services);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get active FAQs
   */
  async getFAQs(req: Request, res: Response, next: NextFunction) {
    try {
      const faqs = await prisma.fAQ.findMany({
        where: { active: true },
        orderBy: { order: 'asc' }
      });
      return sendSuccess(res, faqs);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get gallery images
   */
  async getGallery(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, page = 1, limit = 9 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const where = {
        OR: [
          { category: 'gallery' },
          { category: 'services' },
          category ? { category: category as string } : {}
        ]
      };

      const [images, total] = await Promise.all([
        prisma.image.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take
        }),
        prisma.image.count({ where })
      ]);

      return sendSuccess(res, {
        images,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new PublicController();
