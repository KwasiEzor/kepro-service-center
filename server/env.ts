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
  SENTRY_DSN: z.string().url().optional(),
});

// Parse and validate environment variables
let env: z.infer<typeof envSchema>;

// Test environment defaults
const testEnvDefaults = {
  PORT: '5000',
  NODE_ENV: 'test' as const,
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  JWT_SECRET: 'test-jwt-secret-minimum-32-characters-long',
  JWT_REFRESH_SECRET: 'test-jwt-refresh-secret-minimum-32-chars',
  JWT_EXPIRES_IN: '15m',
  JWT_REFRESH_EXPIRES_IN: '7d',
  GEMINI_API_KEY: 'test-gemini-api-key',
  FRONTEND_URL: 'http://localhost:3000',
  UPLOAD_DIR: './test-uploads',
  MAX_FILE_SIZE: '5242880',
  SMTP_PORT: '587',
  SMTP_FROM: '"KeyPro Test" <test@test.local>',
  LOG_LEVEL: 'error', // Suppress logs in tests
};

try {
  env = envSchema.parse(process.env);
  console.log('✅ Environment validated');
} catch (error) {
  // In test environment, use defaults instead of failing
  if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
    env = testEnvDefaults;
    console.log('⚠️  Using test environment defaults');
  } else {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.issues.forEach((err) => {
        console.error(`   - ${err.path.join('.')}: ${err.message}`);
      });
      console.error('\nCreate .env file with all required variables');
    }
    process.exit(1);
  }
}

export { env };
