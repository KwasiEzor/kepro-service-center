import express from 'express';
import { GoogleGenAI } from '@google/genai';

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

export default router;
