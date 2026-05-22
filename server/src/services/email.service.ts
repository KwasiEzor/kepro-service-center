import nodemailer from 'nodemailer';
import { CreateQuoteDTO, CreateContactDTO } from '../types';
import { env } from '../../env';
import { templates } from './email-templates';
import logger from '../utils/logger';

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private frontendUrl: string;

  constructor() {
    this.frontendUrl = env.FRONTEND_URL || 'http://localhost:3000';
    
    // Only initialize if host is present
    if (env.SMTP_HOST) {
      const config: any = {
        host: env.SMTP_HOST,
        port: parseInt(env.SMTP_PORT),
        secure: env.SMTP_PORT === '465',
      };

      // Only add auth if user is provided
      if (env.SMTP_USER) {
        config.auth = {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS || '',
        };
      }

      this.transporter = nodemailer.createTransport(config);
    } else {
      logger.warn('⚠️ Email service not configured. Emails will be logged to console instead.');
    }
  }

  /**
   * Send notification to admin about a new quote
   */
  async sendAdminQuoteNotification(quote: CreateQuoteDTO) {
    const subject = `🔔 Nouvelle demande de devis : ${quote.brand} ${quote.model}`;
    const html = templates.adminQuoteNotification(quote, `${this.frontendUrl}/admin`);

    return this.sendEmail(env.ADMIN_EMAIL || '', subject, html);
  }

  /**
   * Send notification to admin about a new contact message
   */
  async sendAdminContactNotification(contact: CreateContactDTO) {
    const subject = `✉️ Nouveau message : ${contact.subject || contact.topic || 'Demande générale'}`;
    const html = templates.adminContactNotification(contact, `${this.frontendUrl}/admin`);

    return this.sendEmail(env.ADMIN_EMAIL || '', subject, html);
  }

  /**
   * Send confirmation to user about their quote request
   */
  async sendUserQuoteConfirmation(quote: CreateQuoteDTO) {
    if (!quote.email) return;

    const subject = `🚗 Nous avons reçu votre demande de devis - KeyPro Service`;
    const html = templates.quoteConfirmation(quote, `${this.frontendUrl}/dashboard`);

    return this.sendEmail(quote.email, subject, html);
  }

  /**
   * Send notification to user about quote status update
   */
  async sendUserQuoteStatusUpdate(email: string, name: string, quote: any) {
    const subject = `🔔 Mise à jour de votre demande de service : ${quote.brand} ${quote.model}`;
    const html = templates.quoteStatusUpdate(name, quote, `${this.frontendUrl}/dashboard`);

    return this.sendEmail(email, subject, html);
  }

  /**
   * Send confirmation to user about their contact message
   */
  async sendUserContactConfirmation(contact: CreateContactDTO) {
    const subject = `✉️ Message bien reçu - KeyPro Service`;
    const html = templates.contactConfirmation(contact);

    return this.sendEmail(contact.email, subject, html);
  }

  /**
   * Send admin reply to user
   */
  async sendUserContactReply(email: string, name: string, originalSubject: string, reply: string) {
    const subject = `Re: ${originalSubject || 'Votre demande'} - KeyPro Service`;
    const html = templates.contactReply(name, originalSubject, reply, `${this.frontendUrl}/dashboard`);

    return this.sendEmail(email, subject, html);
  }

  /**
   * Send invoice notification to customer
   */
  async sendInvoiceNotification(invoice: any) {
    const html = templates.invoiceNotification(invoice);
    const email = invoice.user?.email || invoice.quote?.email;
    const subject = `Votre facture ${invoice.invoiceNumber} - KeyPro Service`;
    return this.sendEmail(email, subject, html);
  }

  /**
   * Send payment confirmation to customer
   */
  async sendPaymentConfirmation(invoice: any) {
    const html = templates.paymentConfirmation(invoice);
    const email = invoice.user?.email || invoice.quote?.email;
    const subject = `Paiement reçu - Facture ${invoice.invoiceNumber}`;
    return this.sendEmail(email, subject, html);
  }

  /**
   * Internal helper to send email or log it
   */
  private async sendEmail(to: string, subject: string, html: string) {
    if (!this.transporter) {
      logger.info({ to, subject }, '--- EMAIL MOCK ---');
      return;
    }

    try {
      await this.transporter.sendMail({
        from: env.SMTP_FROM,
        to,
        subject,
        html,
      });
      logger.info({ to }, '✅ Email sent');
    } catch (error) {
      logger.error({ err: error, to, subject }, '❌ Failed to send email');
      // We don't throw here to avoid crashing the main request
    }
  }
}

export default new EmailService();
