import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import { QuoteService } from '../services/quote.service';
import { ContactService } from '../services/contact.service';
import { AuthRequest } from '../types';

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
}

export default new PublicController();
