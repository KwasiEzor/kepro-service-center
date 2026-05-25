import { beforeAll, afterAll, beforeEach } from 'vitest';
import { prisma } from '../config/database';

/**
 * Test Setup File
 * Runs before/after test suites to manage database state
 */

beforeAll(async () => {
  // Ensure we're using test database
  if (!process.env.DATABASE_URL?.includes('keypro_test')) {
    throw new Error(
      'CRITICAL: Tests must run against test database. ' +
      'DATABASE_URL must contain "keypro_test"'
    );
  }

  // Verify database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✓ Test database connected');
  } catch (error) {
    console.error('✗ Test database connection failed:', error);
    throw error;
  }
});

beforeEach(async () => {
  // Clean all tables between tests
  // Order matters: delete child tables before parent tables
  await prisma.$transaction([
    prisma.session.deleteMany(),
    prisma.invoiceItem.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.quote.deleteMany(),
    prisma.contact.deleteMany(),
    prisma.image.deleteMany(),
    prisma.fAQ.deleteMany(),
    prisma.service.deleteMany(),
    prisma.user.deleteMany(),
  ]);
});

afterAll(async () => {
  // Disconnect from database
  await prisma.$disconnect();
});
