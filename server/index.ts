import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './env';
import chatRouter from './api';
import authRoutes from './src/routes/auth.routes';
import publicRoutes from './src/routes/public.routes';
import adminRoutes from './src/routes/admin.routes';
import userRoutes from './src/routes/user.routes';
import { errorHandler } from './src/middleware/errorHandler';
import { apiLimiter, authLimiter } from './src/middleware/rateLimiter';
import logger from './src/utils/logger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment validation happens automatically on import

const app = express();
const PORT = parseInt(env.PORT);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: env.FRONTEND_URL,
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
const uploadDir = env.UPLOAD_DIR;
const uploadsPath = path.isAbsolute(uploadDir) 
  ? uploadDir 
  : path.join(process.cwd(), uploadDir);

app.use('/uploads', express.static(uploadsPath));

// Rate limiting
app.use('/api/', apiLimiter); // Global API rate limiting

// API routes
app.use('/api/chat', chatRouter); // Existing Gemini chatbot route
app.use('/api/auth', authLimiter, authRoutes); // Auth routes with strict rate limiting
app.use('/api/public', publicRoutes); // New public routes (quotes, contact)
app.use('/api/admin', adminRoutes); // New admin routes
app.use('/api/user', userRoutes); // New user specific routes

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

const host = '0.0.0.0';
app.listen(PORT, host, () => {
  logger.info(`✅ API server on http://localhost:${PORT}`);
  logger.info(`📁 Uploads directory: ${uploadDir}`);
  logger.info(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  logger.info(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
});
