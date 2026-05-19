import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import chatRouter from './api';

const app = express();
app.use(express.json());
app.use('/api/chat', chatRouter);

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: vi.fn().mockImplementation(function() {
      return {
        models: {
          generateContent: vi.fn().mockResolvedValue({
            candidates: [{ content: { parts: [{ text: 'Mock response' }] } }],
          }),
        },
      };
    }),
  };
});

describe('Chat History Defense (TDD Reproduction)', () => {
  it('SHOULD NOT allow extremely large chat history (Currently Failing)', async () => {
    // Create a history array that is large but under the default 100kb json limit
    // 500 items * ~100 bytes/item = ~50kb
    const massiveHistory = Array(500).fill({ role: 'user', content: 'A reasonable length message but too many of them in history.' });

    const response = await request(app)
      .post('/api/chat')
      .send({
        message: 'Hello',
        history: massiveHistory
      });

    // We expect a 400 Bad Request or similar defense (internal logic should reject > 50 items for example)
    expect(response.status).toBe(400);
  });
});
