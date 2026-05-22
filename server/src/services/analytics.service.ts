import prisma from '../config/database';
import { InvoiceStatus } from '@prisma/client';

export class AnalyticsService {
  async getDashboardStats() {
    const [
      quotesCount, 
      contactsCount, 
      usersCount, 
      imagesCount, 
      invoicesCount,
      revenueData
    ] = await Promise.all([
      prisma.quote.count(),
      prisma.contact.count(),
      prisma.user.count(),
      prisma.image.count(),
      prisma.invoice.count(),
      prisma.invoice.aggregate({
        where: { status: InvoiceStatus.PAID },
        _sum: { total: true }
      })
    ]);

    // Get recent activity
    const [recentQuotes, recentContacts, recentInvoices] = await Promise.all([
      prisma.quote.findMany({ 
        take: 5, 
        orderBy: { createdAt: 'desc' }, 
        select: { id: true, name: true, serviceType: true, createdAt: true, status: true } 
      }),
      prisma.contact.findMany({ 
        take: 5, 
        orderBy: { createdAt: 'desc' }, 
        select: { id: true, name: true, subject: true, createdAt: true, status: true } 
      }),
      prisma.invoice.findMany({ 
        take: 5, 
        orderBy: { createdAt: 'desc' }, 
        select: { id: true, invoiceNumber: true, total: true, createdAt: true, status: true } 
      })
    ]);

    // Revenue by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueByMonth = await prisma.invoice.groupBy({
      by: ['createdAt'],
      where: {
        status: InvoiceStatus.PAID,
        createdAt: { gte: sixMonthsAgo }
      },
      _sum: { total: true }
    });

    // Format revenue data for charts
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueChart = monthNames.map((name, index) => {
      const monthRevenue = revenueByMonth
        .filter(r => r.createdAt.getMonth() === index)
        .reduce((sum, current) => sum + (current._sum.total || 0), 0);
      return { name, total: monthRevenue };
    }).filter((_, i) => {
        const now = new Date();
        const d = new Date();
        d.setMonth(now.getMonth() - 6);
        return i >= d.getMonth() || i <= now.getMonth();
    });

    // Service distribution
    const serviceDist = await prisma.quote.groupBy({
      by: ['serviceType'],
      _count: { _all: true }
    });

    const serviceDistribution = serviceDist.map(s => ({
      name: s.serviceType.replace('_', ' ').toUpperCase(),
      value: s._count._all
    }));

    const recentActivity = [
      ...recentQuotes.map(q => ({ type: 'QUOTE', id: q.id, title: `New quote: ${q.serviceType}`, user: q.name, date: q.date || q.createdAt, status: q.status })),
      ...recentContacts.map(c => ({ type: 'CONTACT', id: c.id, title: `New message: ${c.subject}`, user: c.name, date: c.date || c.createdAt, status: c.status })),
      ...recentInvoices.map(i => ({ type: 'INVOICE', id: i.id, title: `Invoice ${i.invoiceNumber}`, user: `€${i.total}`, date: i.date || i.createdAt, status: i.status }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

    return {
      quotesCount,
      contactsCount,
      usersCount,
      imagesCount,
      invoicesCount,
      totalRevenue: revenueData._sum.total || 0,
      revenueChart,
      serviceDistribution,
      recentActivity
    };
  }
}

export default new AnalyticsService();
