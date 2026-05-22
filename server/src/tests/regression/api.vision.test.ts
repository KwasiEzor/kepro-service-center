import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import chatRouter from '../../../api';
import prisma from '../../config/database';
import fs from 'fs/promises';

// Mock dependencies
vi.mock('../../config/database', () => ({
  default: {
    image: {
      create: vi.fn().mockReturnValue({
        catch: vi.fn().mockResolvedValue(undefined),
        then: vi.fn().mockResolvedValue(undefined),
      }),
    },
  },
}));

vi.mock('fs/promises', () => ({
  default: {
    readFile: vi.fn().mockResolvedValue(Buffer.from('fake-image-data')),
    unlink: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: vi.fn().mockImplementation(function() {
      return {
        getGenerativeModel: vi.fn().mockImplementation(() => ({
          generateContent: vi.fn().mockResolvedValue({
            response: {
              text: () => 'Mocked AI Diagnostic Response',
            },
          }),
        })),
        models: {
          generateContent: vi.fn().mockResolvedValue({
            candidates: [
              {
                content: {
                  parts: [{ text: 'Mocked AI Diagnostic Response' }],
                },
              },
            ],
          }),
        },
      };
    }),
  };
});

const app = express();
app.use(express.json());
app.use('/api/chat', chatRouter);

describe('AI Vision Diagnostic (TDD Reproduction)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('SHOULD record the diagnostic in the database (Currently Failing - Audit Gap)', async () => {
    // Simulate a file upload by mocking the upload middleware behavior
    // or simply hitting the route since we mocked fs and genAI
    
    const response = await request(app)
      .post('/api/chat/vision')
      .attach('image', Buffer.from('fake-image'), 'test-dashboard.jpg');

    expect(response.status).toBe(200);
    expect(response.body.response).toBeDefined();

    // THIS IS THE TDD ASSERTION THAT WILL FAIL CURRENTLY
    // We expect prisma.image.create to have been called to log the diagnostic
    expect(prisma.image.create).toHaveBeenCalled();
  });
});
