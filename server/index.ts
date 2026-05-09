import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateEnv } from './env';
import chatRouter from './api';
import authRoutes from './src/routes/auth.routes';
import publicRoutes from './src/routes/public.routes';
import adminRoutes from './src/routes/admin.routes';
import { errorHandler } from './src/middleware/errorHandler';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

validateEnv();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve static uploads
const uploadDir = process.env.UPLOAD_DIR || './uploads';
app.use('/uploads', express.static(path.join(__dirname, '..', uploadDir)));

// API routes
app.use('/api/chat', chatRouter); // Existing Gemini chatbot route
app.use('/api/auth', authRoutes); // New auth routes
app.use('/api/public', publicRoutes); // New public routes (quotes, contact)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ API server on http://localhost:${PORT}`);
  console.log(`📁 Uploads directory: ${uploadDir}`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
});
