import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import adminRouter from './src/routes/admin.routes';
import prisma from './src/config/database';

// Mock dependencies
vi.mock('./src/config/database', () => ({
  default: {
    service: {
      create: vi.fn().mockResolvedValue({ id: '1', nameEn: 'Test' }),
      update: vi.fn().mockResolvedValue({ id: '1', nameEn: 'Updated' }),
    },
    fAQ: {
      create: vi.fn().mockResolvedValue({ id: '1', questionEn: 'Test' }),
    },
  },
}));

vi.mock('./src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'admin-id', role: 'ADMIN' };
    next();
  },
  requireAdmin: (req, res, next) => next(),
}));

const app = express();
app.use(express.json());
app.use('/api/admin', adminRouter);

describe('Admin Validation (TDD Reproduction)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('SHOULD fail when creating a service with missing fields (Currently Passing - Missing Validation)', async () => {
    // Sending empty body to a POST route that should require fields
    const response = await request(app)
      .post('/api/admin/services')
      .send({});

    // If validation exists, this should be 400.
    // If it passes (201), then validation is missing.
    expect(response.status).toBe(400);
  });

  it('SHOULD fail when creating an FAQ with missing fields (Currently Passing - Missing Validation)', async () => {
    const response = await request(app)
      .post('/api/admin/faqs')
      .send({});

    expect(response.status).toBe(400);
  });
});
