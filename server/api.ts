import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
}

router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body as {
      message: string;
      history: ChatMessage[];
    };

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Invalid message' });
    }

    if (message.length > 1000) {
      return res.status(400).json({ error: 'Message too long' });
    }

    const systemPrompt = 'You are the AI assistant for KeyPro Service Center, a premium automotive service center specializing in car keys, diagnostics, and mobile technical assistance. Be professional, technical, helpful, and concise. Offer to provide quotes or book services. If asked about prices, explain they depend on the vehicle model and service type.';

    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [
        {
          role: 'user' as const,
          parts: [{ text: systemPrompt }],
        },
        {
          role: 'model' as const,
          parts: [{ text: 'Understood. I am ready to assist KeyPro Service Center customers.' }],
        },
        ...(history || []).map((msg) => ({
          role: msg.role === 'user' ? 'user' as const : 'model' as const,
          parts: [{ text: msg.content }],
        })),
        {
          role: 'user' as const,
          parts: [{ text: message }],
        },
      ],
    });

    const text = result.text;

    res.json({ response: text });
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({
      error: 'Failed to process message',
    });
  }
});

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  topic: z.enum(['General Inquiry', 'Key Support', 'B2B Partnerships', 'Careers']),
  message: z.string().min(10).max(1000),
});

router.post('/contact', async (req, res) => {
  try {
    const data = contactSchema.parse(req.body);
    console.log('📧 Contact form:', data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    res.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.issues });
    }
    console.error('Contact error:', error);
    res.status(500).json({ error: 'Failed to process' });
  }
});

const quoteSchema = z.object({
  serviceType: z.enum(['keys', 'diagnostic', 'immobilizer', 'other']),
  brand: z.string().min(2).max(50),
  model: z.string().min(1).max(50),
  year: z.string().regex(/^\d{4}$/),
  location: z.string().min(2).max(100),
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10),
  message: z.string().max(1000).optional(),
});

router.post('/quote', async (req, res) => {
  try {
    const data = quoteSchema.parse(req.body);
    const refId = `KP-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    console.log('🚗 Quote request:', { refId, ...data });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    res.json({ success: true, refId });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.issues });
    }
    console.error('Quote error:', error);
    res.status(500).json({ error: 'Failed to process' });
  }
});

export default router;
