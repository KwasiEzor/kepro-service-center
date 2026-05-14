import nodemailer from 'nodemailer';
import { CreateQuoteDTO, CreateContactDTO } from '../types';

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    // Only initialize if config is present
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      console.warn('⚠️ Email service not configured. Emails will be logged to console instead.');
    }
  }

  /**
   * Send notification to admin about a new quote
   */
  async sendAdminQuoteNotification(quote: CreateQuoteDTO) {
    const subject = `🔔 New Quote Request: ${quote.brand} ${quote.model}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #FF6B2C;">New Quote Request</h2>
        <p><strong>Customer:</strong> ${quote.name || 'Logged-in User'}</p>
        <p><strong>Email:</strong> ${quote.email || 'N/A'}</p>
        <p><strong>Phone:</strong> ${quote.phone || 'N/A'}</p>
        <hr/>
        <p><strong>Vehicle:</strong> ${quote.year} ${quote.brand} ${quote.model}</p>
        <p><strong>Service:</strong> ${quote.serviceType}</p>
        <p><strong>Urgency:</strong> ${quote.urgency || 'Normal'}</p>
        <p><strong>Description:</strong></p>
        <div style="background: #f9f9f9; padding: 10px; border-radius: 5px;">${quote.description || quote.message || 'No description provided'}</div>
        <br/>
        <a href="${process.env.FRONTEND_URL}/admin" style="background: #FF6B2C; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View in Dashboard</a>
      </div>
    `;

    return this.sendEmail(process.env.ADMIN_EMAIL || '', subject, html);
  }

  /**
   * Send notification to admin about a new contact message
   */
  async sendAdminContactNotification(contact: CreateContactDTO) {
    const subject = `✉️ New Message: ${contact.subject || 'General Inquiry'}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #FF6B2C;">New Contact Message</h2>
        <p><strong>From:</strong> ${contact.name}</p>
        <p><strong>Email:</strong> ${contact.email}</p>
        <p><strong>Subject:</strong> ${contact.subject || contact.topic || 'General Inquiry'}</p>
        <hr/>
        <p><strong>Message:</strong></p>
        <div style="background: #f9f9f9; padding: 10px; border-radius: 5px;">${contact.message}</div>
        <br/>
        <a href="${process.env.FRONTEND_URL}/admin" style="background: #FF6B2C; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View in Dashboard</a>
      </div>
    `;

    return this.sendEmail(process.env.ADMIN_EMAIL || '', subject, html);
  }

  /**
   * Internal helper to send email or log it
   */
  private async sendEmail(to: string, subject: string, html: string) {
    if (!this.transporter) {
      console.log('--- EMAIL MOCK ---');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log('------------------');
      return;
    }

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || '"KeyPro Service" <noreply@keypro.service>',
        to,
        subject,
        html,
      });
      console.log(`✅ Email sent to ${to}`);
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      // We don't throw here to avoid crashing the main request
    }
  }
}

export default new EmailService();
