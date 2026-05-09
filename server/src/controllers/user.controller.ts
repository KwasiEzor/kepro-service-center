import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import bcrypt from 'bcryptjs';

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
      const quotes = await prisma.quote.findMany({
        where: { userId: authReq.user!.id },
        orderBy: { createdAt: 'desc' }
      });
      return sendSuccess(res, quotes);
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
      const contacts = await prisma.contact.findMany({
        where: { userId: authReq.user!.id },
        orderBy: { createdAt: 'desc' }
      });
      return sendSuccess(res, contacts);
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
