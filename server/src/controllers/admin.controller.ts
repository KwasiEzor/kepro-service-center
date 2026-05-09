import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import prisma from '../config/database';
import { QuoteStatus, ContactStatus } from '@prisma/client';
import { AuthRequest } from '../types';
import fs from 'fs/promises';
import path from 'path';

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

  /**
   * Get all images
   */
  async getImages(req: Request, res: Response, next: NextFunction) {
    try {
      const { category } = req.query;
      const images = await prisma.image.findMany({
        where: category ? { category: category as string } : undefined,
        orderBy: { createdAt: 'desc' },
      });
      return sendSuccess(res, images);
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
      const { category, alt } = req.body;

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
      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      const filePath = path.join(process.cwd(), uploadDir, image.category || 'temp', image.filename);
      
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.error('Failed to delete physical file:', err);
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
      const services = await prisma.service.findMany({ orderBy: { order: 'asc' } });
      return sendSuccess(res, services);
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
      const faqs = await prisma.fAQ.findMany({ orderBy: { order: 'asc' } });
      return sendSuccess(res, faqs);
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
}

export default new AdminController();
