# Final Deployment Readiness Plan
**Date:** 2026-05-24
**Status:** 95% Complete — Final Push to Production
**Timeline:** 3-5 days to production-ready

---

## Current Status Summary

### ✅ **COMPLETED (Today)**
- [x] Database migrations initialized (`prisma/migrations/20260524_init/`)
- [x] Invoice tab verified complete in UserDashboard
- [x] Build passing (web + server)
- [x] Zero production vulnerabilities
- [x] Security hardening complete (rate limiting, sanitization, input validation)
- [x] Bundle optimization (94% reduction achieved)

### ⚠️ **REMAINING GAPS**
1. Test coverage at 35% (target: 70%+)
2. 1 test failing (DB access issue)
3. No health check endpoint
4. No monitoring/logging infrastructure
5. No staging environment validation

---

## Phase 1: Infrastructure Essentials (Day 1)
**Goal:** Add production-grade infrastructure basics
**Time:** 4-6 hours

### Task 1.1: Health Check Endpoint (30 min)
**File:** `server/src/routes/health.ts`

```typescript
import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';

const router = Router();

router.get('/health', async (req: Request, res: Response) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      database: 'connected',
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/health/ready', async (req: Request, res: Response) => {
  // Kubernetes readiness probe
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).send('OK');
  } catch {
    res.status(503).send('NOT READY');
  }
});

router.get('/health/live', (req: Request, res: Response) => {
  // Kubernetes liveness probe
  res.status(200).send('OK');
});

export default router;
```

**Integration:**
```typescript
// server/src/index.ts
import healthRoutes from './routes/health';
app.use('/api', healthRoutes);
```

**Verification:**
```bash
curl http://localhost:3001/api/health
# Expected: {"status":"ok","database":"connected",...}
```

---

### Task 1.2: Structured Logging (2 hours)
**Replace:** All `console.log` with Pino logger

**Install:**
```bash
npm install pino pino-pretty pino-http
npm install -D @types/pino-http
```

**File:** `server/src/utils/logger.ts`
```typescript
import pino from 'pino';
import { env } from '../env';

const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss',
      ignore: 'pid,hostname'
    }
  } : undefined,
  redact: {
    paths: ['req.headers.authorization', 'password', 'token'],
    remove: true
  }
});

export default logger;
```

**Migration Pattern:**
```typescript
// BEFORE:
console.log('User logged in:', userId);

// AFTER:
logger.info({ userId }, 'User logged in');
```

**Priority files to update:**
1. `server/src/index.ts` (server startup)
2. `server/src/middleware/errorHandler.ts` (errors)
3. `server/src/services/auth.service.ts` (auth events)
4. `server/src/controllers/*.ts` (request logging)

---

### Task 1.3: Error Monitoring Setup (1 hour)
**Option A: Sentry (Recommended)**

```bash
npm install @sentry/node @sentry/profiling-node
```

**File:** `server/src/config/monitoring.ts`
```typescript
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { env } from '../env';

export function initMonitoring() {
  if (env.SENTRY_DSN) {
    Sentry.init({
      dsn: env.SENTRY_DSN,
      environment: env.NODE_ENV,
      integrations: [
        new ProfilingIntegration(),
      ],
      tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
      profilesSampleRate: 0.1,
    });
  }
}
```

**Integration:**
```typescript
// server/src/index.ts
import { initMonitoring } from './config/monitoring';
initMonitoring();

// Error handler (BEFORE other error handlers)
import * as Sentry from '@sentry/node';
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());
// ... routes ...
app.use(Sentry.Handlers.errorHandler());
```

**Environment:**
```bash
# .env
SENTRY_DSN="https://your-sentry-dsn@sentry.io/project"
```

---

### Task 1.4: Environment Validation (30 min)
**Add to:** `server/env.ts`

```typescript
// Add optional monitoring variables
const envSchema = z.object({
  // ... existing fields ...
  SENTRY_DSN: z.string().url().optional(),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  ENABLE_MONITORING: z.coerce.boolean().default(true),
});
```

---

## Phase 2: Testing & Quality (Days 2-3)
**Goal:** Achieve 70%+ test coverage, fix failing tests
**Time:** 12-16 hours

### Task 2.1: Fix Test Database Configuration (1 hour)
**Create:** `.env.test`
```bash
# Test database (separate from development)
DATABASE_URL="postgresql://user:password@localhost:5432/keypro_test?schema=public"

# Use test-specific secrets
JWT_SECRET="test_jwt_secret_32_chars_minimum"
JWT_REFRESH_SECRET="test_refresh_secret_32_chars"

# Mock external services
GEMINI_API_KEY="test_gemini_key"
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT=2525
FRONTEND_URL="http://localhost:3000"
```

**Update:** `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';

export default defineConfig({
  test: {
    env: loadEnv('test', process.cwd(), ''),
    setupFiles: ['./server/src/tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', '*.config.ts']
    }
  }
});
```

**Create:** `server/src/tests/setup.ts`
```typescript
import { beforeAll, afterAll, beforeEach } from 'vitest';
import { prisma } from '../config/database';

beforeAll(async () => {
  // Ensure test DB exists and is migrated
  await prisma.$executeRaw`CREATE DATABASE IF NOT EXISTS keypro_test`;
});

beforeEach(async () => {
  // Clean database between tests
  await prisma.$transaction([
    prisma.session.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.quote.deleteMany(),
    prisma.contact.deleteMany(),
    prisma.user.deleteMany(),
  ]);
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

**Run tests:**
```bash
npm test -- --coverage
```

---

### Task 2.2: Write Critical Missing Tests (8 hours)

**Priority Test Files:**

#### 2.2.1: Auth Flow Tests (2 hours)
**File:** `server/src/tests/integration/auth.flow.test.ts`
```typescript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../index';

describe('Authentication Flow', () => {
  it('should register new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123!',
        firstName: 'Test',
        lastName: 'User'
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty('token');
  });

  it('should login existing user', async () => {
    // Register first
    await request(app).post('/api/auth/register').send({
      email: 'login@example.com',
      password: 'SecurePass123!'
    });

    // Then login
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'SecurePass123!'
      });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('token');
  });

  it('should reject invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'wrong'
      });

    expect(response.status).toBe(401);
  });

  it('should refresh token', async () => {
    // Login first
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'SecurePass123!' });

    const { token, refreshToken } = loginRes.body.data;

    // Refresh
    const response = await request(app)
      .post('/api/auth/refresh')
      .set('Authorization', `Bearer ${token}`)
      .send({ refreshToken });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('token');
  });

  it('should logout and invalidate session', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'SecurePass123!' });

    const { token } = loginRes.body.data;

    const response = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);

    // Try using token after logout
    const protectedRes = await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(protectedRes.status).toBe(401);
  });
});
```

#### 2.2.2: Authorization Tests (1 hour)
**File:** `server/src/tests/integration/authorization.test.ts`
```typescript
describe('Role-Based Access Control', () => {
  it('should allow admin access to admin routes', async () => {
    const adminToken = await getAdminToken();
    const response = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
  });

  it('should deny user access to admin routes', async () => {
    const userToken = await getUserToken();
    const response = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(403);
  });

  it('should deny unauthenticated access', async () => {
    const response = await request(app).get('/api/admin/users');
    expect(response.status).toBe(401);
  });
});
```

#### 2.2.3: Upload Security Tests (2 hours)
**File:** `server/src/tests/security/upload.test.ts`
```typescript
describe('Upload Path Traversal Protection', () => {
  it('should reject path traversal in category', async () => {
    const token = await getUserToken();
    const response = await request(app)
      .post('/api/admin/upload')
      .set('Authorization', `Bearer ${token}`)
      .field('category', '../../../etc/passwd')
      .attach('file', Buffer.from('test'), 'test.jpg');

    expect(response.status).toBe(400);
  });

  it('should reject executable file types', async () => {
    const token = await getAdminToken();
    const response = await request(app)
      .post('/api/admin/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from('#!/bin/bash'), 'script.sh');

    expect(response.status).toBe(400);
  });

  it('should accept valid image uploads', async () => {
    const token = await getAdminToken();
    const response = await request(app)
      .post('/api/admin/upload')
      .set('Authorization', `Bearer ${token}`)
      .field('category', 'gallery')
      .attach('file', Buffer.from('fake-image-data'), 'test.jpg');

    expect(response.status).toBe(201);
  });
});
```

#### 2.2.4: Rate Limiting Tests (1 hour)
**File:** `server/src/tests/security/rate-limit.test.ts`
```typescript
describe('Rate Limiting', () => {
  it('should block after 5 failed login attempts', async () => {
    const attempts = Array.from({ length: 6 }, () =>
      request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'wrong'
      })
    );

    const responses = await Promise.all(attempts);

    // First 5 should be 401 (unauthorized)
    responses.slice(0, 5).forEach(res => {
      expect(res.status).toBe(401);
    });

    // 6th should be 429 (too many requests)
    expect(responses[5].status).toBe(429);
  });

  it('should respect per-user rate limits', async () => {
    const token = await getUserToken();

    // Make 100 rapid requests
    const requests = Array.from({ length: 100 }, () =>
      request(app)
        .get('/api/user/quotes')
        .set('Authorization', `Bearer ${token}`)
    );

    const responses = await Promise.all(requests);
    const blocked = responses.filter(r => r.status === 429);

    expect(blocked.length).toBeGreaterThan(0);
  });
});
```

#### 2.2.5: Invoice Workflow Tests (2 hours)
**File:** `server/src/tests/integration/invoice.test.ts`
```typescript
describe('Invoice Workflow', () => {
  it('should create invoice from quote', async () => {
    const adminToken = await getAdminToken();

    // Create quote first
    const quoteRes = await request(app)
      .post('/api/admin/quotes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ /* quote data */ });

    const quoteId = quoteRes.body.data.id;

    // Create invoice from quote
    const response = await request(app)
      .post('/api/admin/invoices')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quoteId });

    expect(response.status).toBe(201);
    expect(response.body.data.quoteId).toBe(quoteId);
  });

  it('should list user invoices', async () => {
    const userToken = await getUserToken();
    const response = await request(app)
      .get('/api/user/invoices')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should not expose other users invoices', async () => {
    const user1Token = await getUserToken('user1@example.com');
    const user2Token = await getUserToken('user2@example.com');

    // User 2 creates invoice
    const adminToken = await getAdminToken();
    const invoiceRes = await request(app)
      .post('/api/admin/invoices')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ userId: 'user2-id', /* ... */ });

    const invoiceId = invoiceRes.body.data.id;

    // User 1 tries to access it
    const response = await request(app)
      .get(`/api/user/invoices/${invoiceId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(response.status).toBe(404); // Or 403
  });
});
```

---

### Task 2.3: Coverage Report & Gap Analysis (1 hour)
```bash
npm test -- --coverage
open coverage/index.html
```

**Target Coverage:**
- Statements: 70%+
- Branches: 65%+
- Functions: 70%+
- Lines: 70%+

**Generate report:**
```bash
npm test -- --coverage --reporter=json > coverage-report.json
```

---

## Phase 3: Staging Validation (Day 4)
**Goal:** Deploy to staging, run full validation suite
**Time:** 4-6 hours

### Task 3.1: Staging Environment Setup (2 hours)
**Platform:** Vercel/Railway/Render (choose one)

**Environment Variables (Staging):**
```bash
NODE_ENV=staging
DATABASE_URL=<staging_postgres_url>
JWT_SECRET=<staging_jwt_32_chars>
JWT_REFRESH_SECRET=<staging_refresh_32_chars>
GEMINI_API_KEY=<staging_api_key>
FRONTEND_URL=https://keypro-staging.vercel.app
SMTP_HOST=smtp.mailtrap.io  # Test SMTP
SMTP_PORT=2525
SENTRY_DSN=<sentry_staging_dsn>
```

**Deploy:**
```bash
# Vercel
vercel --env staging

# Or Railway
railway up --environment staging
```

---

### Task 3.2: Smoke Test Suite (1 hour)
**File:** `scripts/smoke-test.sh`
```bash
#!/bin/bash
BASE_URL=${1:-http://localhost:3001}

echo "🔍 Running smoke tests against $BASE_URL"

# Health check
echo "✓ Health check..."
curl -f $BASE_URL/api/health || exit 1

# Public endpoints
echo "✓ Public endpoints..."
curl -f $BASE_URL/api/public/services || exit 1

# Auth flow
echo "✓ Auth registration..."
REGISTER=$(curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"smoke@test.com","password":"Test123!","firstName":"Smoke"}')

TOKEN=$(echo $REGISTER | jq -r '.data.token')

echo "✓ Protected endpoint with token..."
curl -f -H "Authorization: Bearer $TOKEN" $BASE_URL/api/user/profile || exit 1

echo "✅ All smoke tests passed!"
```

**Run:**
```bash
chmod +x scripts/smoke-test.sh
./scripts/smoke-test.sh https://keypro-staging.vercel.app
```

---

### Task 3.3: Manual QA Checklist (2 hours)
**Test on staging:**

- [ ] Register new user
- [ ] Login with credentials
- [ ] Submit quote request
- [ ] Submit contact form
- [ ] User dashboard loads
- [ ] View quotes tab
- [ ] View invoices tab (empty state)
- [ ] View profile tab
- [ ] Update profile
- [ ] Logout
- [ ] Login as admin (create manually in DB)
- [ ] Admin dashboard loads
- [ ] View all quotes
- [ ] Approve a quote
- [ ] Create invoice from quote
- [ ] Upload gallery image
- [ ] View gallery management
- [ ] Logout admin
- [ ] Login as user again
- [ ] See invoice in invoices tab
- [ ] Download invoice PDF (if implemented)
- [ ] Chatbot works
- [ ] Mobile responsive (test on phone)
- [ ] French/English language switch
- [ ] All animations smooth
- [ ] No console errors

---

### Task 3.4: Load Testing (1 hour)
**Install:** `npm install -g artillery`

**File:** `tests/load/basic.yml`
```yaml
config:
  target: "https://keypro-staging.vercel.app"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
  processor: "./auth-processor.js"

scenarios:
  - name: "Public browsing"
    flow:
      - get:
          url: "/api/public/services"
      - get:
          url: "/api/public/faqs"
      - think: 2

  - name: "Auth and dashboard"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "loadtest@example.com"
            password: "LoadTest123!"
          capture:
            - json: "$.data.token"
              as: "token"
      - get:
          url: "/api/user/quotes"
          headers:
            Authorization: "Bearer {{ token }}"
      - think: 3
```

**Run:**
```bash
artillery run tests/load/basic.yml
```

**Success Criteria:**
- P95 latency < 500ms
- P99 latency < 1000ms
- 0% error rate
- No memory leaks

---

## Phase 4: Production Deployment (Day 5)
**Goal:** Deploy to production with confidence
**Time:** 3-4 hours

### Task 4.1: Pre-Deployment Checklist
```bash
# Run from project root
npm run pre-deploy

# Additional checks:
npm test -- --coverage
npm audit --production
npm run build
```

- [ ] All tests passing (70%+ coverage)
- [ ] Zero production vulnerabilities
- [ ] Build succeeds (web + server)
- [ ] Migrations ready
- [ ] Environment variables documented
- [ ] Health check endpoint live
- [ ] Monitoring configured
- [ ] Logging structured (Pino)
- [ ] Staging validated
- [ ] Load tests passed
- [ ] Documentation updated

---

### Task 4.2: Production Environment Variables
**Platform:** (Vercel/Railway/your choice)

```bash
# Production (DO NOT commit these values)
NODE_ENV=production
DATABASE_URL=<prod_postgres_url>  # Use connection pooling
JWT_SECRET=<prod_jwt_generated_openssl>
JWT_REFRESH_SECRET=<prod_refresh_generated_openssl>
GEMINI_API_KEY=<prod_gemini_key>
FRONTEND_URL=https://keypro-service.com
SMTP_HOST=<prod_smtp_host>
SMTP_PORT=587
SMTP_USER=<prod_smtp_user>
SMTP_PASS=<prod_smtp_password>
SMTP_FROM="KeyPro Service Center <noreply@keypro-service.com>"
ADMIN_EMAIL=admin@keypro-service.com
SENTRY_DSN=<prod_sentry_dsn>
LOG_LEVEL=info
UPLOAD_DIR=/var/data/uploads
```

**Generate secrets:**
```bash
openssl rand -base64 32  # JWT_SECRET
openssl rand -base64 32  # JWT_REFRESH_SECRET
```

---

### Task 4.3: Database Migration (Production)
```bash
# On production server/platform
npx prisma migrate deploy

# Verify
npx prisma migrate status
```

**Rollback plan:**
```bash
# If migration fails:
npx prisma migrate resolve --rolled-back <migration_name>
# Then fix and redeploy
```

---

### Task 4.4: Deploy to Production
**Vercel:**
```bash
vercel --prod
```

**Railway:**
```bash
railway up --environment production
```

**Custom server:**
```bash
# Build
npm run build

# Start with PM2
pm2 start dist/server/index.js --name keypro-api
pm2 save
pm2 startup  # Auto-restart on reboot
```

---

### Task 4.5: Post-Deployment Validation (30 min)
```bash
# Smoke test production
./scripts/smoke-test.sh https://api.keypro-service.com

# Monitor logs
# Vercel: vercel logs --follow
# Railway: railway logs
# PM2: pm2 logs keypro-api

# Check health
curl https://api.keypro-service.com/api/health

# Check Sentry for errors
open https://sentry.io/projects/keypro/
```

**First 24 hours monitoring:**
- [ ] Zero 5xx errors
- [ ] P95 latency < 500ms
- [ ] Database connection stable
- [ ] No memory leaks
- [ ] Rate limiting working
- [ ] Auth flows successful
- [ ] Email sending works
- [ ] File uploads working

---

## Success Metrics

### Performance
- **Page Load:** < 3 seconds (desktop), < 5 seconds (mobile)
- **API Response:** P95 < 500ms, P99 < 1000ms
- **Uptime:** 99.9% (43 minutes downtime/month max)

### Quality
- **Test Coverage:** 70%+ across statements/branches/functions
- **Security:** Zero high/critical vulnerabilities
- **Lighthouse Score:** 90+ (Performance, Accessibility, Best Practices, SEO)

### Monitoring
- **Error Rate:** < 0.1% of requests
- **Alert Response:** < 15 minutes
- **Log Retention:** 30 days minimum

---

## Rollback Plan

If critical issues arise post-deployment:

```bash
# Vercel: Instant rollback to previous deployment
vercel rollback

# Railway: Rollback to previous deployment
railway rollback

# Custom: PM2 with previous build
pm2 stop keypro-api
pm2 start dist/server/index.js.backup --name keypro-api

# Database: Rollback migration
npx prisma migrate resolve --rolled-back <migration_name>
```

**Rollback triggers:**
- Error rate > 5%
- P95 latency > 2000ms
- Critical security vulnerability discovered
- Database corruption
- Complete service outage > 5 minutes

---

## Maintenance Plan

### Daily
- Monitor error rates (Sentry dashboard)
- Check uptime (health endpoint)
- Review logs for anomalies

### Weekly
- Run `npm audit` and update dependencies
- Review performance metrics
- Check disk usage and database size
- Backup verification

### Monthly
- Security audit review
- Test disaster recovery procedure
- Update documentation
- Performance optimization review

---

## Timeline Summary

| Phase | Days | Tasks | Status |
|-------|------|-------|--------|
| Infrastructure | 1 | Health check, logging, monitoring | 🔲 Pending |
| Testing | 2-3 | Fix tests, write missing tests, 70% coverage | 🔲 Pending |
| Staging | 4 | Deploy staging, validation, load tests | 🔲 Pending |
| Production | 5 | Deploy prod, validation, monitoring | 🔲 Pending |

**Total:** 5 days (1 developer, full-time)

---

## Next Steps

1. **Start Phase 1 today:** Health check + logging (4-6 hours)
2. **Tomorrow:** Begin test suite expansion
3. **Day 4:** Staging deployment
4. **Day 5:** Production deployment
5. **Day 6:** Post-launch monitoring

---

## Support Contacts

- **Technical Lead:** [Add contact]
- **DevOps:** [Add contact]
- **Database Admin:** [Add contact]
- **Emergency Escalation:** [Add contact]

---

**Document Version:** 1.0
**Last Updated:** 2026-05-24
**Author:** Claude Code AI Assistant
**Review Status:** Pending team review
