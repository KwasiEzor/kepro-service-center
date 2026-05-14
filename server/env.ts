import { z } from 'zod';

const envSchema = z.object({
  // Server
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database
  DATABASE_URL: z.string().url(),

  // JWT Authentication
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().optional().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().optional().default('7d'),

  // AI
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),

  // Frontend
  FRONTEND_URL: z.string().url(),

  // File Upload
  UPLOAD_DIR: z.string().min(1, 'UPLOAD_DIR is required'),
  MAX_FILE_SIZE: z.string().optional().default('5242880'), // 5MB default

  // Email (optional - app works without SMTP configured)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional().default('587'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional().default('"KeyPro Service" <noreply@keypro.service>'),
  ADMIN_EMAIL: z.string().email().optional(),

  // Logging
  LOG_LEVEL: z.string().optional().default('info'),
});

// Parse and validate environment variables
let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse(process.env);
  console.log('✅ Environment validated');
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Environment validation failed:');
    error.issues.forEach((err) => {
      console.error(`   - ${err.path.join('.')}: ${err.message}`);
    });
    console.error('\nCreate .env file with all required variables');
  }
  process.exit(1);
}

export { env };
