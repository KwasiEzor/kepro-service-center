import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { uploadSingle } from './src/middleware/upload';
import fs from 'fs/promises';

const router = express.Router();

// Initialize the SDK
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

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

    const systemPrompt = 'You are the AI assistant for KeyPro Service Center, a premium automotive service center specializing in car keys, diagnostics, and mobile technical assistance. Be professional, technical, helpful, and concise. Offer to provide quotes or book services. If asked about prices, explain they depend on the vehicle model and service type. Use emojis sparingly to keep a premium feel.';

    // Construct the contents for the API
    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'Understood. I am the KeyPro AI Assistant.' }] },
      ...(history || [])
        .filter(msg => msg.content)
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
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
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'I am having trouble processing your request right now.' });
  }
});

/**
 * AI Vision Diagnostic Endpoint
 * POST /api/chat/vision
 */
router.post('/vision', uploadSingle, async (req, res) => {
  try {
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

    // Clean up uploaded file
    await fs.unlink(file.path).catch(err => console.error('Failed to delete temp file:', err));

    res.json({ response: text });
  } catch (error: any) {
    console.error('Vision API error:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

export default router;
