import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { QuoteStatus, ContactStatus, InvoiceStatus, UserRole } from '@prisma/client';
import { AuthRequest } from '../types';
import { getPaginationParams, paginateResponse } from '../utils/pagination';
import analyticsService from '../services/analytics.service';
import managementService from '../services/management.service';
import galleryService from '../services/gallery.service';
import invoiceService from '../services/invoice.service';

export class AdminController {
  /**
   * Get overall stats for dashboard
   */
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await analyticsService.getDashboardStats();
      return sendSuccess(res, stats);
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
      
      const { quotes, total } = await managementService.getAllQuotes(
        pagination.skip,
        pagination.take,
        { status: status as string, search: search as string },
        { sortBy: sortBy as string, sortOrder: sortOrder as string }
      );

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

      const updated = await managementService.updateQuote(id, {
        status: status as QuoteStatus,
        adminNotes,
        estimatedPrice
      });

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
      await managementService.deleteQuote(id);
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

      const { contacts, total } = await managementService.getAllContacts(
        pagination.skip,
        pagination.take,
        { status: status as string, search: search as string },
        { sortBy: sortBy as string, sortOrder: sortOrder as string }
      );

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

      const updated = await managementService.updateContact(id, {
        status: status as ContactStatus,
        adminReply
      });

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
      await managementService.deleteContact(id);
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
      
      const { images, total } = await galleryService.getAllImages(
        pagination.skip,
        pagination.take,
        category as string
      );

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

      const image = await galleryService.uploadImage({
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        category,
        alt,
        userId: authReq.user!.id
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
      await galleryService.deleteImage(id);
      return sendSuccess(res, null, 'Image deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  // --- Services CRUD ---

  async getServices(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = getPaginationParams(req, 100);
      const { services, total } = await managementService.getAllServices(
        pagination.skip,
        pagination.take
      );
      return sendSuccess(res, paginateResponse(services, pagination, total));
    } catch (error) {
      next(error);
    }
  }

  async createService(req: Request, res: Response, next: NextFunction) {
    try {
      const service = await managementService.createService(req.body);
      return sendSuccess(res, service, 'Service created', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateService(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const service = await managementService.updateService(id, req.body);
      return sendSuccess(res, service, 'Service updated');
    } catch (error) {
      next(error);
    }
  }

  async deleteService(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await managementService.deleteService(id);
      return sendSuccess(res, null, 'Service deleted');
    } catch (error) {
      next(error);
    }
  }

  // --- FAQ CRUD ---

  async getFAQs(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = getPaginationParams(req, 100);
      const { faqs, total } = await managementService.getAllFAQs(
        pagination.skip,
        pagination.take
      );
      return sendSuccess(res, paginateResponse(faqs, pagination, total));
    } catch (error) {
      next(error);
    }
  }

  async createFAQ(req: Request, res: Response, next: NextFunction) {
    try {
      const faq = await managementService.createFAQ(req.body);
      return sendSuccess(res, faq, 'FAQ created', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateFAQ(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const faq = await managementService.updateFAQ(id, req.body);
      return sendSuccess(res, faq, 'FAQ updated');
    } catch (error) {
      next(error);
    }
  }

  async deleteFAQ(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await managementService.deleteFAQ(id);
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

      const { users, total } = await managementService.getAllUsers(
        pagination.skip,
        pagination.take,
        { role: role as string, search: search as string },
        { sortBy: sortBy as string, sortOrder: sortOrder as string }
      );

      return sendSuccess(res, paginateResponse(users, pagination, total));
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await managementService.updateUser(id, req.body);
      return sendSuccess(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const authReq = req as AuthRequest;
      
      await managementService.deleteUser(id, authReq.user!.id);
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
