import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import bcrypt from 'bcryptjs';
import { getPaginationParams, paginateResponse } from '../utils/pagination';

export class UserController {
  /**
   * Get current user profile
   */
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const user = await prisma.user.findUnique({
        where: { id: authReq.user!.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          emailVerified: true,
          createdAt: true,
        }
      });

      if (!user) return sendError(res, 'User not found', 404);
      return sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const { firstName, lastName, phone } = req.body;

      const updated = await prisma.user.update({
        where: { id: authReq.user!.id },
        data: { firstName, lastName, phone },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          emailVerified: true,
          updatedAt: true,
        }
      });

      return sendSuccess(res, updated, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user's quotes
   */
  async getMyQuotes(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const pagination = getPaginationParams(req);
      const where = { userId: authReq.user!.id };
      const [quotes, total] = await Promise.all([
        prisma.quote.findMany({
          where,
          skip: pagination.skip,
          take: pagination.take,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.quote.count({ where })
      ]);
      return sendSuccess(res, paginateResponse(quotes, pagination, total));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user's contact messages
   */
  async getMyContacts(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const pagination = getPaginationParams(req);
      const where = { userId: authReq.user!.id };
      const [contacts, total] = await Promise.all([
        prisma.contact.findMany({
          where,
          skip: pagination.skip,
          take: pagination.take,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.contact.count({ where })
      ]);
      return sendSuccess(res, paginateResponse(contacts, pagination, total));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user's invoices
   */
  async getMyInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const pagination = getPaginationParams(req);
      const where = { userId: authReq.user!.id };
      const [invoices, total] = await Promise.all([
        prisma.invoice.findMany({
          where,
          skip: pagination.skip,
          take: pagination.take,
          orderBy: { createdAt: 'desc' },
          include: {
            items: true
          }
        }),
        prisma.invoice.count({ where })
      ]);
      return sendSuccess(res, paginateResponse(invoices, pagination, total));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a specific invoice for current user
   */
  async getMyInvoiceById(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const { id } = req.params;
      const invoice = await prisma.invoice.findFirst({
        where: {
          id,
          userId: authReq.user!.id
        },
        include: {
          items: true
        }
      });
      if (!invoice) {
        throw new NotFoundError('Invoice not found');
      }
      return sendSuccess(res, invoice);
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
