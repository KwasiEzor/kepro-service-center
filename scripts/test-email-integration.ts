import 'dotenv/config';
import emailService from '../server/src/services/email.service';
import { env } from '../server/env';

async function testEmail() {
  console.log('--- Email Integration Test ---');
  console.log(`SMTP_HOST: ${env.SMTP_HOST || 'not set'}`);
  console.log(`SMTP_PORT: ${env.SMTP_PORT || 'not set'}`);
  
  const testQuote = {
    name: 'Test User',
    email: 'user@example.com',
    brand: 'Test Brand',
    model: 'Test Model',
    year: '2026',
    serviceType: 'Testing',
    description: 'This is a test email from the integration script.',
    phone: '1234567890'
  };

  console.log('Sending user confirmation...');
  await emailService.sendUserQuoteConfirmation(testQuote as any);

  console.log('Sending admin notification...');
  await emailService.sendAdminQuoteNotification(testQuote as any);

  // Test invoice emails
  const testInvoice = {
    id: 'test-invoice-id',
    invoiceNumber: 'INV-2026-001',
    total: 350.00,
    subtotal: 300.00,
    taxAmount: 50.00,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    paidAt: new Date(),
    paymentMethod: 'Carte bancaire',
    notes: 'Test invoice - merci pour votre confiance',
    user: {
      firstName: 'Jean',
      email: 'user@example.com'
    },
    quote: {
      name: 'Jean Dupont',
      brand: 'Peugeot',
      model: '308',
      year: '2022'
    }
  };

  console.log('\nSending invoice notification...');
  await emailService.sendInvoiceNotification(testInvoice as any);

  console.log('Sending payment confirmation...');
  await emailService.sendPaymentConfirmation(testInvoice as any);

  console.log('\n--- SUCCESS ---');
  console.log('Sent 4 test emails:');
  console.log('  1. User quote confirmation');
  console.log('  2. Admin quote notification');
  console.log('  3. Invoice notification');
  console.log('  4. Payment confirmation');
  console.log('\nCheck Mailpit at http://localhost:8025');
}

testEmail().catch(err => {
  console.error('Failed to send test emails:', err);
  process.exit(1);
});
