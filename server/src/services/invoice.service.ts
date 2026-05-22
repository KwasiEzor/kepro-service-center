import prisma from '../config/database';
import { InvoiceStatus } from '@prisma/client';
import emailService from './email.service';

interface CreateInvoiceData {
  quoteId: string;
  items: Array<{
    serviceId?: string;
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  taxAmount: number;
  dueDate: Date;
  notes?: string;
}

interface UpdateInvoiceData {
  notes?: string;
  dueDate?: Date;
  taxAmount?: number;
  items?: Array<{
    id?: string;
    serviceId?: string;
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export class InvoiceService {
  /**
   * Generate next invoice number for today
   * Format: YYYYMMDD-NNN
   */
  private async generateInvoiceNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const datePrefix = `${year}${month}${day}`; // YYYYMMDD

    // Find highest number for today
    const lastInvoice = await prisma.invoice.findFirst({
      where: {
        invoiceNumber: {
          startsWith: datePrefix,
        },
      },
      orderBy: {
        invoiceNumber: 'desc',
      },
    });

    let nextNumber = 1;
    if (lastInvoice) {
      const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[1]);
      nextNumber = lastNumber + 1;
    }

    return `${datePrefix}-${String(nextNumber).padStart(3, '0')}`;
  }

  /**
   * Create invoice from approved quote
   */
  async createFromQuote(data: CreateInvoiceData) {
    // Verify quote exists and is approved
    const quote = await prisma.quote.findUnique({
      where: { id: data.quoteId },
      include: { invoice: true, user: true },
    });

    if (!quote) {
      throw new Error('Quote not found');
    }

    if (quote.status !== 'APPROVED') {
      throw new Error('Quote must be approved before creating invoice');
    }

    if (quote.invoice) {
      throw new Error('Invoice already exists for this quote');
    }

    // Calculate totals
    const subtotal = data.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const total = subtotal + data.taxAmount;

    // Create invoice with retry logic (race condition protection)
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const invoice = await prisma.$transaction(async (tx) => {
          const invoiceNumber = await this.generateInvoiceNumber();

          const newInvoice = await tx.invoice.create({
            data: {
              invoiceNumber,
              quoteId: data.quoteId,
              userId: quote.userId,
              subtotal,
              taxAmount: data.taxAmount,
              total,
              dueDate: data.dueDate,
              notes: data.notes,
              status: InvoiceStatus.DRAFT,
              items: {
                create: data.items.map((item, index) => ({
                  serviceId: item.serviceId,
                  description: item.description,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  total: item.quantity * item.unitPrice,
                  order: index,
                })),
              },
            },
            include: {
              items: {
                include: { service: true },
                orderBy: { order: 'asc' },
              },
              quote: true,
              user: true,
            },
          });

          return newInvoice;
        });

        return invoice;
      } catch (error: any) {
        if (
          error.code === 'P2002' &&
          error.meta?.target?.includes('invoiceNumber')
        ) {
          // Unique constraint violation - retry
          attempts++;
          if (attempts >= maxAttempts) {
            throw new Error(
              'Failed to generate unique invoice number after multiple attempts'
            );
          }
          continue;
        }
        throw error;
      }
    }

    throw new Error('Failed to create invoice');
  }

  /**
   * Get invoice by ID (admin)
   */
  async getById(id: string) {
    return prisma.invoice.findUnique({
      where: { id },
      include: {
        items: {
          include: { service: true },
          orderBy: { order: 'asc' },
        },
        quote: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });
  }

  /**
   * Get all invoices (admin, paginated)
   */
  async getAll(skip: number, take: number) {
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { email: true, firstName: true, lastName: true },
          },
          quote: {
            select: { brand: true, model: true, year: true },
          },
          items: { select: { id: true } }, // Just count
        },
      }),
      prisma.invoice.count(),
    ]);

    return { invoices, total };
  }

  /**
   * Get invoices by user
   */
  async getByUser(userId: string) {
    return prisma.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { service: true },
          orderBy: { order: 'asc' },
        },
        quote: {
          select: {
            brand: true,
            model: true,
            year: true,
            serviceType: true,
          },
        },
      },
    });
  }

  /**
   * Update invoice status
   */
  async updateStatus(id: string, status: InvoiceStatus) {
    const invoice = await prisma.invoice.update({
      where: { id },
      data: { status },
      include: {
        user: true,
        quote: true,
        items: { include: { service: true } },
      },
    });

    // Send email notification if status is SENT
    if (status === InvoiceStatus.SENT && (invoice.user?.email || invoice.quote?.email)) {
      await emailService.sendInvoiceNotification(invoice);
    }

    return invoice;
  }

  /**
   * Mark invoice as paid
   */
  async markPaid(id: string, paymentMethod: string, paidAt?: Date) {
    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.PAID,
        paymentMethod,
        paidAt: paidAt || new Date(),
      },
      include: {
        items: { include: { service: true } },
        user: true,
        quote: true,
      },
    });

    // Send payment confirmation email
    if (invoice.user?.email || invoice.quote?.email) {
      await emailService.sendPaymentConfirmation(invoice);
    }

    return invoice;
  }

  /**
   * Update invoice
   */
  async update(id: string, data: UpdateInvoiceData) {
    // If items are updated, recalculate totals
    if (data.items) {
      const subtotal = data.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );
      const currentInvoice = await this.getById(id);
      const taxAmount = data.taxAmount ?? currentInvoice!.taxAmount;
      const total = subtotal + taxAmount;

      return prisma.invoice.update({
        where: { id },
        data: {
          notes: data.notes,
          dueDate: data.dueDate,
          taxAmount,
          subtotal,
          total,
          items: {
            deleteMany: {}, // Remove all existing items
            create: data.items.map((item, index) => ({
              serviceId: item.serviceId,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.quantity * item.unitPrice,
              order: index,
            })),
          },
        },
        include: {
          items: {
            include: { service: true },
            orderBy: { order: 'asc' },
          },
          user: true,
          quote: true,
        },
      });
    }

    // Just update metadata
    return prisma.invoice.update({
      where: { id },
      data: {
        notes: data.notes,
        dueDate: data.dueDate,
        taxAmount: data.taxAmount,
      },
      include: {
        items: { include: { service: true } },
        user: true,
        quote: true,
      },
    });
  }

  /**
   * Delete invoice (admin only)
   */
  async delete(id: string) {
    return prisma.invoice.delete({
      where: { id },
    });
  }
}

export default new InvoiceService();
