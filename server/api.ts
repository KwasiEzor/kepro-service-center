import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { uploadSingle } from './src/middleware/upload';
import fs from 'fs/promises';
import prisma from './src/config/database';
import { authenticateOptional } from './src/middleware/auth';
import { AuthRequest } from './src/types';
import logger from './src/utils/logger';

const router = express.Router();

// Initialize the SDK
import { env } from './env';

const genAI = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
}

/**
 * AI Chatbot Endpoint
 * POST /api/chat
 */
router.post('/', async (req, res) => {
  try {
    const { message, history } = req.body as {
      message: string;
      history: ChatMessage[];
    };

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Invalid message' });
    }

    if (message.length > 2000) {
      return res.status(400).json({ error: 'Message too long' });
    }

    // Validate and slice history (Defensive Programming)
    const MAX_HISTORY = 20;
    if (history && !Array.isArray(history)) {
      return res.status(400).json({ error: 'Invalid history format' });
    }
    
    if (history && history.length > 100) {
      return res.status(400).json({ error: 'Chat history too long' });
    }

    const systemPrompt = 'You are the AI assistant for KeyPro Service Center, a premium automotive service center specializing in car keys, diagnostics, and mobile technical assistance. Be professional, technical, helpful, and concise. Offer to provide quotes or book services. If asked about prices, explain they depend on the vehicle model and service type. Use emojis sparingly to keep a premium feel.';

    // Construct the contents for the API
    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'Understood. I am the KeyPro AI Assistant.' }] },
      ...(history || [])
        .slice(-MAX_HISTORY) // Only take the last N messages
        .filter(msg => msg.content && typeof msg.content === 'string')
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content.substring(0, 2000) }] // Also cap individual history message length
        })),
      { role: 'user', parts: [{ text: message }] }
    ];

    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents
    });

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I am unable to generate a response at the moment.';

    res.json({ response: text });
  } catch (error: any) {
    logger.error({ err: error }, 'Chat API error');
    res.status(500).json({ error: 'I am having trouble processing your request right now.' });
  }
});

/**
 * AI Vision Diagnostic Endpoint
 * POST /api/chat/vision
 */
router.post('/vision', authenticateOptional, uploadSingle, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const imageBuffer = await fs.readFile(file.path);
    const imageBase64 = imageBuffer.toString('base64');

    const prompt = `
      You are a Master Automotive Diagnostic AI for KeyPro Service Center.
      Analyze this image of a car dashboard or vehicle part.
      1. Identify any visible warning lights or obvious mechanical issues.
      2. Explain what they mean and how urgent they are (Normal, Urgent, Emergency).
      3. Suggest which KeyPro service is most relevant (Diagnostic, Key Programming, ECU Repair, etc.).
      4. Be technical but easy to understand.
      Limit your response to 3-4 concise bullet points.
    `;

    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: imageBase64,
                mimeType: file.mimetype,
              },
            },
          ],
        },
      ],
    });

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I could not analyze the image.';

    // Record the diagnostic in the database (Audit Trail)
    const imageUrl = `/uploads/temp/${file.filename}`;
    await prisma.image.create({
      data: {
        url: imageUrl,
        filename: file.filename,
        alt: `AI Diagnostic: ${text.substring(0, 100)}...`,
        category: 'temp',
        size: file.size,
        mimeType: file.mimetype,
        uploadedBy: authReq.user?.id || 'system', // Use logged user or system
      },
    }).catch(err => logger.error({ err }, 'Failed to log AI diagnostic to DB'));

    // Clean up uploaded file
    await fs.unlink(file.path).catch(err => logger.error({ err, path: file.path }, 'Failed to delete temp file'));

    res.json({ response: text });
  } catch (error: any) {
    logger.error({ err: error }, 'Vision API error');
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

export default router;
