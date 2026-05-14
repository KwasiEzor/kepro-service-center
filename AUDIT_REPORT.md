# KeyPro Service Center - Comprehensive Audit Report

**Date:** May 14, 2026
**Project:** KeyPro Service Center
**Status:** ⚠️ **NOT PRODUCTION-READY** - Critical security issues identified

---

## Executive Summary

**Current State:** Feature-complete application with solid architecture but **NOT production-ready** due to critical security vulnerabilities.

**Blocking Issues:** 5 Critical, 4 High Priority
**Estimated Fix Time:** 2-3 weeks with 1 developer
**Risk Level:** HIGH

### Quick Stats
- ✅ TypeScript compilation passes
- ✅ Production build succeeds (781KB → 141KB brotli)
- ❌ **Zero test coverage** (no test suite configured)
- ❌ **3 npm audit vulnerabilities** (moderate severity)
- ❌ **27 security/architecture issues** identified

---

## 🚨 Critical Security Vulnerabilities (MUST FIX)

### 1. Hardcoded JWT Secrets with Fallbacks
**File:** `server/src/config/auth.ts:3-4`

```typescript
// VULNERABLE CODE:
secret: process.env.JWT_SECRET || 'your-secret-key-change-this',
refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-this',
```

**Risk:** Complete authentication bypass. Attackers can forge tokens using hardcoded secrets.
**Impact:** Full account takeover, admin access compromise.

**Fix:**
```typescript
// server/env.ts
export const env = z.object({
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  // ... other vars
}).parse(process.env);

// server/src/config/auth.ts
secret: env.JWT_SECRET, // No fallback!
refreshSecret: env.JWT_REFRESH_SECRET,
```

---

### 2. File Upload Path Traversal Vulnerability
**File:** `server/src/middleware/upload.ts:13-16`

```typescript
// VULNERABLE CODE:
destination: (req, file, cb) => {
  const uploadDir = process.env.UPLOAD_DIR || './uploads';
  const category = (req.query.category as string) || 'temp'; // ❌ UNSANITIZED
  const dest = path.join(uploadDir, category);
  cb(null, dest);
},
```

**Attack Example:**
```bash
POST /api/admin/gallery/upload?category=../../../etc/passwd
# Writes to /etc/passwd instead of /uploads/temp
```

**Risk:** Remote code execution, arbitrary file write, system compromise.

**Fix:**
```typescript
const ALLOWED_CATEGORIES = ['gallery', 'temp', 'documents'] as const;

destination: (req, file, cb) => {
  const uploadDir = process.env.UPLOAD_DIR || './uploads';
  const category = (req.query.category as string) || 'temp';

  // Validate category
  if (!ALLOWED_CATEGORIES.includes(category)) {
    return cb(new Error('Invalid category'), '');
  }

  const dest = path.join(uploadDir, category);

  // Prevent path traversal
  const resolvedDest = path.resolve(dest);
  const resolvedUploadDir = path.resolve(uploadDir);

  if (!resolvedDest.startsWith(resolvedUploadDir)) {
    return cb(new Error('Invalid path'), '');
  }

  cb(null, dest);
},
```

---

### 3. Environment File Committed to Repository
**File:** `.env` in git history

**Risk:** Exposed secrets (JWT keys, database credentials, API keys) in version control.

**Fix:**
```bash
# Remove from current commit
git rm --cached .env

# Remove from entire history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (WARNING: coordinate with team)
git push origin --force --all

# Add to .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore

# Rotate ALL secrets immediately:
# - JWT_SECRET
# - JWT_REFRESH_SECRET
# - DATABASE_URL password
# - GEMINI_API_KEY
```

---

### 4. Missing Authentication on Critical Endpoints
**File:** `server/src/routes/auth.routes.ts:37,48`

```typescript
// VULNERABLE CODE:
router.post('/refresh', authController.refresh.bind(authController)); // ❌ No auth!
router.post('/logout', authController.logout.bind(authController));   // ❌ No auth!
```

**Risk:**
- Token enumeration attacks on `/refresh`
- Malicious logout of other users
- Session hijacking

**Fix:**
```typescript
import { authenticate } from '../middleware/auth';

router.post('/refresh', authenticate, authController.refresh.bind(authController));
router.post('/logout', authenticate, authController.logout.bind(authController));
```

---

### 5. npm Audit Vulnerabilities
```
@hono/node-server <1.19.13
Severity: moderate
Middleware bypass via repeated slashes in serveStatic
GHSA-92pp-h63x-v22m
```

**Fix:**
```bash
npm audit fix --force

# After fixing, run full test suite to verify nothing breaks
npm test
```

---

## 🔶 High Priority Issues (Fix Before Production)

### 6. CORS Configuration Defaults to Localhost
**File:** `server/index.ts:27-33`

```typescript
// PROBLEMATIC CODE:
cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // ❌ Dangerous default
  credentials: true,
})
```

**Risk:** In production, if `FRONTEND_URL` not set, allows localhost access or blocks all origins.

**Fix:**
```typescript
// server/env.ts
export const env = z.object({
  FRONTEND_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  // ...
}).parse(process.env);

// server/index.ts
cors({
  origin: env.NODE_ENV === 'production'
    ? env.FRONTEND_URL
    : [env.FRONTEND_URL, 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})
```

---

### 7. No Rate Limiting Applied
**Issue:** `express-rate-limit` installed but never used!

**Vulnerable Endpoints:**
- `/api/auth/login` → brute force attacks
- `/api/auth/register` → account enumeration
- `/api/chat` → Gemini API quota abuse
- `/api/public/quote` → spam submissions

**Fix:**
```typescript
import rateLimit from 'express-rate-limit';

// Auth endpoints - strict limits
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// API endpoints - moderate limits
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// Chat endpoint - protect API quota
const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 messages per hour per IP
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/chat', chatLimiter);
app.use('/api', apiLimiter);
```

---

### 8. Missing Pagination on Admin Endpoints
**File:** `server/src/controllers/admin.controller.ts:38-41`

```typescript
// PROBLEMATIC CODE:
async getQuotes(req: Request, res: Response, next: NextFunction) {
  try {
    const quotes = await prisma.quote.findMany({ // ❌ No limit!
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
```

**Risk:** With thousands of quotes, causes:
- Memory exhaustion
- Slow response times (10s+)
- Database overload
- Potential DoS vector

**Fix:**
```typescript
// server/src/utils/pagination.ts
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export const paginate = (params: PaginationParams) => {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(Math.max(1, params.limit || 20), 100); // Max 100

  return {
    skip: (page - 1) * limit,
    take: limit,
  };
};

// server/src/controllers/admin.controller.ts
async getQuotes(req: Request, res: Response, next: NextFunction) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pagination = paginate({ page: Number(page), limit: Number(limit) });

    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
        ...pagination,
        include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.quote.count(),
    ]);

    res.json({
      success: true,
      data: quotes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
}
```

---

### 9. Missing Input Length Validation
**File:** `server/src/routes/public.routes.ts:9-30`

```typescript
// PROBLEMATIC CODE:
const quoteSchema = z.object({
  // ...
  description: z.string().optional(), // ❌ No max length!
  message: z.string().min(10), // ❌ No max length!
});

const contactSchema = z.object({
  // ...
  message: z.string().min(10), // ❌ No max length!
});
```

**Risk:**
- Users can submit 1MB+ messages
- Database bloat
- DoS via huge payloads

**Fix:**
```typescript
const quoteSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  phone: z.string().min(10).max(20),
  service: z.string().min(3).max(100),
  carMake: z.string().min(2).max(50),
  carModel: z.string().min(1).max(50),
  carYear: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  description: z.string().max(2000).optional(),
  message: z.string().min(10).max(5000),
});

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(5000),
});
```

---

## 🟡 Medium Priority Issues

### 10. No CSRF Protection
**Issue:** Cookie-based authentication without CSRF tokens.

**Fix:**
```bash
npm install csurf
```

```typescript
import csrf from 'csurf';
import cookieParser from 'cookie-parser';

app.use(cookieParser());
app.use(csrf({ cookie: true }));

// Add CSRF token to responses
app.use((req, res, next) => {
  res.cookie('XSRF-TOKEN', req.csrfToken());
  next();
});
```

**Frontend (src/lib/api.ts):**
```typescript
const getCsrfToken = () => {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];
};

export const api = {
  async post(url: string, data: any) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': getCsrfToken() || '',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
```

---

### 11. console.log/error in Production Code
**Files:**
- `server/api.ts:47`
- `server/src/controllers/admin.controller.ts` (multiple locations)

**Fix:** Replace with structured logging
```bash
npm install pino pino-pretty
```

```typescript
// server/src/utils/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'token',
      'accessToken',
      'refreshToken',
    ],
    remove: true,
  },
  transport: process.env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: { colorize: true },
  } : undefined,
});

// Usage:
logger.info({ userId: user.id }, 'User logged in');
logger.error({ err, userId }, 'Failed to create quote');
```

---

### 12. TypeScript Safety Bypassed
**Files:**
- `server/src/services/auth.service.ts:62,84` - `@ts-ignore`
- `server/src/middleware/validate.ts:56` - `as any`

**Fix:**
```typescript
// Install proper types
npm install -D @types/jsonwebtoken

// Remove @ts-ignore and fix types
import jwt from 'jsonwebtoken';

generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(
    payload,
    authConfig.jwt.secret,
    { expiresIn: authConfig.jwt.accessTokenExpiry }
  );
}

verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, authConfig.jwt.secret) as TokenPayload;
}
```

---

### 13. Empty Gemini API Key Fallback
**File:** `server/api.ts:4`

```typescript
// PROBLEMATIC CODE:
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
```

**Fix:**
```typescript
// server/env.ts
export const env = z.object({
  GEMINI_API_KEY: z.string().min(1),
  // ...
}).parse(process.env);

// server/api.ts
const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
```

---

### 14. No Session Cleanup Job
**Issue:** Expired sessions accumulate in database forever.

**Fix:**
```bash
npm install node-cron
```

```typescript
// server/src/jobs/cleanup.ts
import cron from 'node-cron';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

export const startCleanupJobs = () => {
  // Run every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    try {
      const result = await prisma.session.deleteMany({
        where: {
          expiresAt: { lt: new Date() },
        },
      });

      logger.info({ count: result.count }, 'Cleaned expired sessions');
    } catch (error) {
      logger.error({ err: error }, 'Session cleanup failed');
    }
  });
};

// server/index.ts
import { startCleanupJobs } from './src/jobs/cleanup';
startCleanupJobs();
```

---

### 15. XSS Protection Missing
**Issue:**
- No Content-Security-Policy headers
- User input not sanitized server-side

**Fix:**
```typescript
// server/index.ts
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Remove unsafe-inline in production
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.FRONTEND_URL],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
```

**Optional server-side sanitization:**
```bash
npm install xss
```

```typescript
import xss from 'xss';

// Sanitize before storing
const sanitizedMessage = xss(message);
```

---

## ✅ Strengths (What Works Well)

### Architecture
- ✅ Modern tech stack (React 19, Vite 6, TypeScript, Prisma)
- ✅ Clean separation: frontend/backend
- ✅ RESTful API with proper structure
- ✅ Role-based authentication (USER/ADMIN)
- ✅ Multi-language support (i18n) fully implemented
- ✅ Reusable component architecture

### Code Quality
- ✅ TypeScript strict mode passes
- ✅ Consistent code style
- ✅ Proper error boundaries
- ✅ CSS variables for design system
- ✅ Production build optimized (781KB → 141KB brotli)

### Features
- ✅ Complete admin dashboard (CRUD for quotes, contacts, gallery, users)
- ✅ User authentication with refresh tokens
- ✅ File upload system
- ✅ AI chatbot (Gemini integration)
- ✅ Responsive design
- ✅ SEO optimization hooks
- ✅ Form validation (Zod + react-hook-form)

### Security (Partial)
- ✅ Helmet.js configured
- ✅ CORS enabled
- ✅ Password hashing (bcrypt)
- ✅ JWT authentication
- ✅ Protected routes
- ✅ Input validation on all endpoints

---

## ❌ Weaknesses (Critical Gaps)

### Testing
- ❌ **Zero test coverage** - No test suite configured
- ❌ No unit tests
- ❌ No integration tests
- ❌ No E2E tests

### Security
- ❌ Hardcoded secrets fallbacks
- ❌ Path traversal vulnerability
- ❌ Missing auth on critical endpoints
- ❌ No rate limiting applied
- ❌ No CSRF protection
- ❌ .env committed to git

### Code Quality
- ❌ Type safety bypassed (`@ts-ignore`, `as any`)
- ❌ Console.log in production
- ❌ No structured logging

### Architecture
- ❌ No pagination (memory risk)
- ❌ No session cleanup
- ❌ Missing DB indexes on foreign keys
- ❌ No soft deletes (audit trail lost)

### Operations
- ❌ No monitoring/observability
- ❌ No health check endpoints
- ❌ No graceful shutdown
- ❌ No deployment documentation
- ❌ No backup strategy

---

## 🚀 Deployment Readiness Improvements

### Phase 1: Critical Security Fixes (Week 1)

**Priority:** MUST FIX - 5 days

```bash
# Day 1: Environment & Secrets
□ Remove all secret fallbacks (auth.ts, api.ts)
□ Add strict env validation (env.ts)
□ Remove .env from git history
□ Rotate all exposed secrets
□ Create .env.example template

# Day 2: File Upload Security
□ Implement category whitelist
□ Add path traversal protection
□ Add file size limits (already exists, verify)
□ Add MIME type validation (already exists, verify)

# Day 3: Authentication Hardening
□ Add auth middleware to /refresh and /logout
□ Implement rate limiting on all endpoints
□ Add CSRF protection

# Day 4: Input Validation & Pagination
□ Add max length to all string inputs
□ Implement pagination on admin endpoints
□ Add request size limits

# Day 5: Audit & Verification
□ Fix npm audit vulnerabilities
□ Remove all console.log/error
□ Add structured logging
□ Code review all fixes
```

---

### Phase 2: Testing Infrastructure (Week 2)

**Priority:** HIGH - 5 days

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event supertest @types/supertest
npm install -D @vitest/ui @vitest/coverage-v8
```

**package.json scripts:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest watch"
  }
}
```

**Test Coverage Goals:**
- Auth service: 90% (login, register, refresh, logout, token validation)
- File upload middleware: 100% (path traversal tests critical)
- Admin controllers: 80% (authorization tests)
- Public endpoints: 80% (rate limiting, validation)
- Frontend components: 70% (render tests)

**Priority Test Files:**
```
tests/
├── unit/
│   ├── services/
│   │   ├── auth.service.test.ts          # 90% coverage target
│   │   └── quote.service.test.ts
│   └── middleware/
│       ├── upload.test.ts                # 100% coverage (critical!)
│       └── validate.test.ts
├── integration/
│   ├── auth.routes.test.ts               # Login, register, refresh flows
│   ├── admin.routes.test.ts              # Authorization tests
│   └── public.routes.test.ts             # Rate limiting tests
└── e2e/
    ├── quote-flow.test.ts                # User submits quote
    └── admin-dashboard.test.ts           # Admin manages quotes
```

---

### Phase 3: Operational Tooling (Week 2)

**Day 1-2: Monitoring & Logging**
```bash
npm install pino pino-pretty
npm install @sentry/node @sentry/react
npm install prom-client
```

**Implement:**
- Structured logging (Pino)
- Error tracking (Sentry)
- Metrics endpoint (Prometheus)
- Request logging middleware

**Day 3-4: Health & Reliability**
```bash
npm install node-cron
```

**Implement:**
- Health check endpoint (`/health`)
- Readiness check endpoint (`/ready`)
- Graceful shutdown handler
- Session cleanup cron job
- Database connection pooling verification

**Day 5: Documentation**
```markdown
docs/
├── DEPLOYMENT.md          # Step-by-step deploy guide
├── ARCHITECTURE.md        # System architecture diagram
├── API.md                 # API endpoint documentation
├── SECURITY.md            # Security measures & best practices
└── MONITORING.md          # Observability setup
```

---

### Phase 4: Performance & Polish (Week 3)

**Database Optimization:**
```prisma
// Add to schema.prisma

model Quote {
  // ...
  @@index([userId, createdAt(sort: Desc)])
  @@index([status])
}

model Contact {
  // ...
  @@index([userId, createdAt(sort: Desc)])
  @@index([email])
}

model Session {
  // ...
  @@index([expiresAt])
  @@index([userId])
}

model GalleryImage {
  // ...
  @@index([category])
  @@index([createdAt(sort: Desc)])
}
```

**Response Compression:**
```bash
npm install compression
```

```typescript
import compression from 'compression';
app.use(compression());
```

**Caching Strategy (Optional):**
```bash
npm install ioredis
```

```typescript
// Cache gallery images list
const cachedImages = await redis.get('gallery:images');
if (cachedImages) return JSON.parse(cachedImages);

const images = await prisma.galleryImage.findMany();
await redis.setex('gallery:images', 300, JSON.stringify(images)); // 5min TTL
```

---

### Phase 5: Pre-Production Validation (Week 3)

**Staging Environment Setup:**
- Deploy to staging (Vercel/Railway/Render)
- Run full test suite
- Load testing (k6 or Artillery)
- Security scan (OWASP ZAP)
- Performance audit (Lighthouse)

**Load Testing:**
```bash
npm install -D k6
```

```javascript
// tests/load/auth.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp up
    { duration: '3m', target: 50 },  // Sustained load
    { duration: '1m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% under 500ms
    http_req_failed: ['rate<0.01'],   // <1% error rate
  },
};

export default function () {
  const res = http.post('https://staging.keypro.com/api/auth/login', {
    email: 'test@example.com',
    password: 'Password123!',
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'has access token': (r) => r.json('data.accessToken') !== '',
  });

  sleep(1);
}
```

**Security Scan:**
```bash
# Install OWASP ZAP
# Run automated scan
docker run -t zaproxy/zap-stable zap-baseline.py \
  -t https://staging.keypro.com \
  -r report.html
```

---

### Phase 6: Production Deployment (Week 4)

**Pre-Deploy Checklist:**
```bash
□ All tests passing (100%)
□ Security scan clean (0 high/critical)
□ Load tests meet thresholds (<500ms p95, <1% errors)
□ Lighthouse score >90 (all categories)
□ Database migration plan documented
□ Rollback procedure tested
□ Monitoring dashboards configured
□ Alerting rules set up
□ Backup system tested
□ SSL certificates valid
□ DNS configured
□ Environment variables set
□ API keys rotated
□ Team briefed
```

**Deploy Day:**
1. Enable maintenance mode
2. Run database migrations
3. Deploy new version
4. Smoke tests
5. Monitor error rates (30 min)
6. Disable maintenance mode
7. Full regression testing
8. Monitor 24 hours

**Post-Deploy Monitoring (24 hours):**
- Error rate < 0.1%
- Response time p95 < 500ms
- CPU usage < 70%
- Memory usage < 80%
- Database connections stable
- No security alerts

---

## 💡 Feature Enhancements (Post-Launch)

### 🔥 High Impact Features

#### 1. Real-time Notifications System
**Value:** Improves response time, increases engagement

**Tech Stack:**
- Socket.io for WebSocket connections
- Redis for pub/sub
- Push API for mobile notifications

**Implementation:**
```typescript
// server/src/services/notification.service.ts
import { Server } from 'socket.io';
import Redis from 'ioredis';

export class NotificationService {
  private io: Server;
  private redis: Redis;

  async notifyAdmin(event: 'new_quote' | 'new_contact', data: any) {
    // Emit to all connected admin clients
    this.io.to('admin').emit(event, data);

    // Send push notification
    await this.sendPushNotification({
      title: 'New Quote Received',
      body: `From ${data.name}`,
      tag: 'quotes',
    });
  }
}
```

**Features:**
- Live quote/contact notifications for admins
- Status update notifications for users
- Browser push notifications
- Sound alerts (optional)

**Estimate:** 1-2 weeks

---

#### 2. Advanced Analytics Dashboard
**Value:** Data-driven business decisions

**Metrics to Track:**
- Quote conversion rate (quote → customer)
- Service demand by type
- Revenue by service category
- Response time metrics
- Customer acquisition sources
- Peak demand hours/days

**Tech Stack:**
- Chart.js or Recharts
- PostgreSQL window functions for aggregations
- Export to CSV/PDF

**Implementation:**
```typescript
// server/src/controllers/analytics.controller.ts
async getDashboard(req: Request, res: Response) {
  const { startDate, endDate } = req.query;

  const [
    quoteStats,
    serviceBreakdown,
    revenueByMonth,
    conversionFunnel,
  ] = await Promise.all([
    prisma.$queryRaw`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'approved') as approved,
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) as avg_response_hours
      FROM quotes
      WHERE created_at BETWEEN ${startDate} AND ${endDate}
    `,
    prisma.quote.groupBy({
      by: ['service'],
      _count: { id: true },
      where: { createdAt: { gte: startDate, lte: endDate } },
    }),
    // ... more queries
  ]);

  res.json({ quoteStats, serviceBreakdown, revenueByMonth, conversionFunnel });
}
```

**Estimate:** 2-3 weeks

---

#### 3. Appointment Booking System
**Value:** Reduces manual coordination, improves customer experience

**Features:**
- Calendar view (day/week/month)
- Available time slots
- Automated confirmations (email/SMS)
- Reminders (24h before, 1h before)
- Rescheduling/cancellation
- Google Calendar sync

**Tech Stack:**
- FullCalendar.js for UI
- Twilio for SMS
- Google Calendar API for sync
- Cron jobs for reminders

**Database Schema:**
```prisma
model Appointment {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  quoteId     String?  @unique
  quote       Quote?   @relation(fields: [quoteId], references: [id])

  service     String
  scheduledAt DateTime
  duration    Int      @default(60) // minutes

  status      AppointmentStatus @default(PENDING)
  notes       String?

  confirmedAt DateTime?
  cancelledAt DateTime?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([scheduledAt])
  @@index([status])
}

enum AppointmentStatus {
  PENDING
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  NO_SHOW
}
```

**Estimate:** 3-4 weeks

---

#### 4. Enhanced Customer Portal
**Value:** Self-service reduces support load

**Features:**
- Quote history with filters/search
- Document uploads (vehicle registration, insurance)
- Service history timeline
- Invoice downloads (PDF generation)
- Communication thread per quote
- Favorite services
- Vehicle profiles (save make/model/year)

**Tech Stack:**
- react-pdf for PDF generation
- react-dropzone for file uploads
- date-fns for timeline

**Estimate:** 2-3 weeks

---

#### 5. Progressive Web App (PWA)
**Value:** Mobile app experience without app store

**Features:**
- Install prompt for mobile
- Offline support (read-only)
- Push notifications
- App-like navigation
- Splash screen

**Tech Stack:**
- Workbox for service worker
- PWA manifest
- Cache strategies

**Implementation:**
```javascript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'KeyPro Service Center',
        short_name: 'KeyPro',
        description: 'Premium automotive key & diagnostic services',
        theme_color: '#FF6B2C',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.keypro\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
            },
          },
        ],
      },
    }),
  ],
});
```

**Estimate:** 1-2 weeks

---

### 🎨 UX Improvements

#### 6. Enhanced AI Chatbot
**Features:**
- Voice input (Web Speech API)
- Conversation memory (Redis)
- Sentiment analysis
- Handoff to human agent
- Multi-language auto-detection
- Suggested responses

**Implementation:**
```typescript
// src/components/ChatBot.tsx
const [isListening, setIsListening] = useState(false);

const startVoiceInput = () => {
  const recognition = new (window as any).webkitSpeechRecognition();
  recognition.lang = i18n.language;

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    handleSendMessage(transcript);
  };

  recognition.start();
  setIsListening(true);
};

// Server-side conversation memory
const conversationContext = await redis.get(`chat:${userId}`);
const messages = conversationContext ? JSON.parse(conversationContext) : [];
messages.push({ role: 'user', content: userMessage });

const response = await ai.chat(messages);
messages.push({ role: 'assistant', content: response });

await redis.setex(`chat:${userId}`, 3600, JSON.stringify(messages)); // 1h TTL
```

**Estimate:** 2 weeks

---

#### 7. Interactive Service Builder
**Value:** Reduces confusion, increases conversions

**Features:**
- Step-by-step wizard
- Visual service selection
- Price calculator with live estimates
- Vehicle make/model dropdown (API integration)
- Photo upload (show issue)
- Instant quote generation

**Estimate:** 2-3 weeks

---

#### 8. Before/After Gallery
**Value:** Social proof, trust building

**Features:**
- Customer testimonials with photos
- Service case studies
- Video demonstrations
- Filter by service type
- Share to social media

**Estimate:** 1-2 weeks

---

#### 9. Multi-Payment Integration
**Value:** Streamlines transactions

**Features:**
- Stripe/PayPal for deposits
- Invoice generation
- Payment tracking
- Refund processing
- Payment history

**Tech Stack:**
- Stripe API
- PDF generation (puppeteer or react-pdf)

**Estimate:** 2-3 weeks

---

#### 10. Service Area Map
**Value:** Clarifies service availability

**Features:**
- Interactive coverage map
- Distance calculator
- Mobile service radius visualization
- Nearby landmark search

**Tech Stack:**
- Mapbox GL JS or Google Maps API
- Turf.js for geospatial calculations

**Estimate:** 1 week

---

### 🛡️ Security Enhancements

#### 11. Two-Factor Authentication (2FA)
**Features:**
- TOTP (Google Authenticator)
- SMS backup codes
- Recovery codes
- Remember device option

**Tech Stack:**
- speakeasy for TOTP
- qrcode for QR generation

**Implementation:**
```typescript
// server/src/services/twoFactor.service.ts
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export class TwoFactorService {
  async generateSecret(userId: string, email: string) {
    const secret = speakeasy.generateSecret({
      name: `KeyPro (${email})`,
      issuer: 'KeyPro Service Center',
    });

    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret.base32 },
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);
    return { secret: secret.base32, qrCode };
  }

  verify(token: string, secret: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps (60s)
    });
  }
}
```

**Estimate:** 1-2 weeks

---

#### 12. Audit Logging
**Value:** Security forensics, compliance (GDPR)

**Features:**
- Track all admin actions
- IP address logging
- User agent tracking
- Export audit reports (CSV)
- Retention policy (90 days)

**Database Schema:**
```prisma
model AuditLog {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])

  action    String   // "CREATE_QUOTE", "UPDATE_USER", "DELETE_IMAGE"
  resource  String   // "Quote", "User", "GalleryImage"
  resourceId String?

  changes   Json?    // { before: {...}, after: {...} }

  ipAddress String
  userAgent String

  createdAt DateTime @default(now())

  @@index([userId, createdAt])
  @@index([action])
  @@index([createdAt])
}
```

**Estimate:** 1 week

---

#### 13. IP Whitelisting for Admin
**Features:**
- Restrict admin panel access by IP
- VPN requirement option
- Geo-blocking (optional)

**Implementation:**
```typescript
// server/src/middleware/ipWhitelist.ts
const ADMIN_WHITELIST = process.env.ADMIN_IP_WHITELIST?.split(',') || [];

export const ipWhitelist = (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api/admin')) {
    const clientIp = req.ip || req.headers['x-forwarded-for'];

    if (!ADMIN_WHITELIST.includes(clientIp as string)) {
      logger.warn({ ip: clientIp, path: req.path }, 'Admin access denied - IP not whitelisted');
      return res.status(403).json({ error: 'Access denied' });
    }
  }
  next();
};
```

**Estimate:** 1 day

---

### 🤖 AI Features (Gemini)

#### 14. Auto-categorize Quotes
**Features:**
- ML classification of service type
- Urgency detection
- Sentiment analysis
- Auto-assign to specialist

**Implementation:**
```typescript
// server/src/services/ai.service.ts
async categorizeQuote(description: string, service: string) {
  const prompt = `
    Analyze this automotive service request:
    Service: ${service}
    Description: ${description}

    Classify:
    1. Service type: KEY_REPLACEMENT | ECU_PROGRAMMING | DIAGNOSTICS | EMERGENCY
    2. Urgency: LOW | MEDIUM | HIGH | CRITICAL
    3. Sentiment: NEUTRAL | CONCERNED | FRUSTRATED | URGENT
    4. Estimated complexity: SIMPLE | MODERATE | COMPLEX

    Respond in JSON format.
  `;

  const response = await this.ai.generateContent(prompt);
  return JSON.parse(response.text());
}
```

**Estimate:** 1 week

---

#### 15. Smart Quote Responses
**Features:**
- AI-generated initial responses
- Template suggestions based on service type
- Personalized tone
- Multi-language support

**Estimate:** 1-2 weeks

---

#### 16. Predictive Maintenance Alerts
**Features:**
- Based on service history
- Seasonal reminders (e.g., battery check before winter)
- Mileage-based alerts
- Email campaigns

**Estimate:** 2 weeks

---

#### 17. Multilingual Auto-translation
**Features:**
- Detect user language
- Auto-translate chat responses
- Support beyond FR/EN (ES, AR, DE)

**Tech Stack:**
- Google Translate API or DeepL

**Estimate:** 1 week

---

### 🔧 DevOps & Maintenance

#### 18. Automated Backups
**Features:**
- Daily PostgreSQL dumps
- Upload to S3/Google Cloud Storage
- Point-in-time recovery
- Automated restore testing
- Retention policy (30 days)

**Implementation:**
```bash
# backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${DATE}.sql"

pg_dump $DATABASE_URL > $BACKUP_FILE
gzip $BACKUP_FILE

aws s3 cp ${BACKUP_FILE}.gz s3://keypro-backups/
rm ${BACKUP_FILE}.gz

# Cleanup old backups (keep 30 days)
aws s3 ls s3://keypro-backups/ | awk '{print $4}' | \
  head -n -30 | xargs -I {} aws s3 rm s3://keypro-backups/{}
```

**Cron:**
```
0 2 * * * /opt/scripts/backup.sh
```

**Estimate:** 2-3 days

---

#### 19. Feature Flags
**Value:** Safe rollouts, A/B testing

**Features:**
- Toggle features without deploy
- Per-user flags
- Percentage rollouts
- Kill switches

**Tech Stack:**
- LaunchDarkly (SaaS) or custom

**Custom Implementation:**
```typescript
// server/src/services/featureFlags.service.ts
export class FeatureFlagsService {
  private flags = new Map<string, boolean>();

  async isEnabled(flagName: string, userId?: string): Promise<boolean> {
    const flag = await prisma.featureFlag.findUnique({
      where: { name: flagName },
    });

    if (!flag || !flag.enabled) return false;

    // Percentage rollout
    if (flag.percentage < 100 && userId) {
      const hash = this.hashUserId(userId);
      return hash % 100 < flag.percentage;
    }

    return true;
  }
}

// Usage in routes
if (await featureFlags.isEnabled('appointment_booking', req.user.id)) {
  // Show appointment booking UI
}
```

**Estimate:** 3-5 days

---

#### 20. API Documentation (OpenAPI)
**Value:** Third-party integrations, developer experience

**Tech Stack:**
- Swagger/OpenAPI
- swagger-jsdoc
- swagger-ui-express

**Implementation:**
```typescript
// server/src/config/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'KeyPro Service Center API',
      version: '1.0.0',
      description: 'REST API for automotive service management',
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Development' },
      { url: 'https://api.keypro.com', description: 'Production' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

const specs = swaggerJsdoc(options);

// server/index.ts
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));
```

**Route Documentation:**
```typescript
/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authController.login);
```

**Estimate:** 3-5 days

---

## 📋 Complete Deployment Checklist

### Pre-Deploy (Critical)

#### Security
- [ ] Remove all hardcoded secret fallbacks
- [ ] Fix file upload path traversal vulnerability
- [ ] Add authentication to `/refresh` and `/logout`
- [ ] Fix CORS production configuration
- [ ] Remove `.env` from git history
- [ ] Rotate all exposed secrets (JWT, Gemini API, DB password)
- [ ] Fix npm audit vulnerabilities (`npm audit fix --force`)
- [ ] Add rate limiting to all public endpoints
- [ ] Add CSRF protection
- [ ] Configure CSP headers properly
- [ ] Add input length validation (max limits)
- [ ] Remove all `console.log/error` statements
- [ ] Implement structured logging (Pino)
- [ ] Remove all `@ts-ignore` and `as any` type bypasses

#### Testing
- [ ] Install test framework (Vitest)
- [ ] Write auth service tests (90% coverage)
- [ ] Write file upload security tests (100% coverage)
- [ ] Write admin authorization tests
- [ ] Write rate limiting tests
- [ ] Write frontend component tests
- [ ] All tests passing (100%)
- [ ] Coverage report > 70%

#### Infrastructure
- [ ] Add pagination to all `findMany` queries
- [ ] Add database indexes (foreign keys, sorted queries)
- [ ] Implement session cleanup cron job
- [ ] Add health check endpoint (`/health`)
- [ ] Add readiness check endpoint (`/ready`)
- [ ] Implement graceful shutdown
- [ ] Configure compression middleware
- [ ] Set up monitoring (Sentry)
- [ ] Configure error alerting
- [ ] Set up log aggregation

#### Documentation
- [ ] Write DEPLOYMENT.md (step-by-step guide)
- [ ] Write API.md (endpoint documentation)
- [ ] Write SECURITY.md (security measures)
- [ ] Write MONITORING.md (observability setup)
- [ ] Document environment variables in .env.example
- [ ] Document backup/restore procedures
- [ ] Document rollback procedures

### Staging Validation

#### Testing
- [ ] Deploy to staging environment
- [ ] Run full test suite on staging
- [ ] Load testing (k6) - p95 < 500ms, error rate < 1%
- [ ] Security scan (OWASP ZAP) - 0 high/critical
- [ ] Performance audit (Lighthouse) - score > 90
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile testing (iOS Safari, Chrome Android)
- [ ] Network condition testing (3G, slow 4G)

#### Verification
- [ ] SSL certificate valid
- [ ] DNS configured correctly
- [ ] CORS working from production domain
- [ ] File uploads working
- [ ] Email sending working
- [ ] Database migrations tested
- [ ] Backup system tested
- [ ] Restore procedure tested
- [ ] Monitoring dashboards functional
- [ ] Alerts triggering correctly

### Production Deploy Day

#### Pre-Deploy
- [ ] Team briefed on deploy timeline
- [ ] Support team on standby
- [ ] Rollback plan documented and tested
- [ ] Database backup taken
- [ ] Maintenance page ready
- [ ] Status page updated

#### Deploy Steps
1. [ ] Enable maintenance mode
2. [ ] Run database migrations (`npx prisma migrate deploy`)
3. [ ] Deploy backend (API server)
4. [ ] Deploy frontend (Vite build)
5. [ ] Run smoke tests
6. [ ] Monitor error rates (30 minutes)
7. [ ] Disable maintenance mode
8. [ ] Full regression testing
9. [ ] Update status page

#### Post-Deploy (24h Monitoring)
- [ ] Error rate < 0.1%
- [ ] Response time p95 < 500ms
- [ ] Response time p99 < 1000ms
- [ ] CPU usage < 70%
- [ ] Memory usage < 80%
- [ ] Database connections stable
- [ ] No memory leaks
- [ ] No security alerts
- [ ] User feedback positive
- [ ] Support tickets minimal

### Post-Deploy Tasks
- [ ] Create production backup schedule
- [ ] Set up weekly security scans
- [ ] Schedule performance reviews
- [ ] Plan feature roadmap review
- [ ] Document lessons learned
- [ ] Update team on next iteration

---

## 🎯 Recommended Timeline

### Week 1: Security Lockdown
**Goal:** Fix all critical vulnerabilities

- **Day 1:** Environment & secrets
  - Remove fallbacks
  - Add env validation
  - Remove .env from git
  - Rotate secrets

- **Day 2:** File upload security
  - Whitelist categories
  - Path traversal protection
  - Verify size/type limits

- **Day 3:** Authentication hardening
  - Add auth to /refresh, /logout
  - Implement rate limiting
  - Add CSRF protection

- **Day 4:** Input validation & pagination
  - Add max lengths
  - Implement pagination
  - Request size limits

- **Day 5:** Audit & verification
  - Fix npm vulnerabilities
  - Replace console.log
  - Add structured logging
  - Code review

---

### Week 2: Testing & Infrastructure
**Goal:** Achieve 70%+ test coverage, add operational tooling

- **Days 1-3:** Testing
  - Install Vitest
  - Auth tests (90%)
  - Upload tests (100%)
  - Admin tests (80%)
  - Public endpoint tests

- **Days 4-5:** Infrastructure
  - Monitoring (Sentry, Pino)
  - Health checks
  - Graceful shutdown
  - Cron jobs
  - Documentation

---

### Week 3: Performance & Staging
**Goal:** Optimize, deploy to staging, validate

- **Days 1-2:** Performance
  - Database indexes
  - Response compression
  - Query optimization

- **Days 3-5:** Staging validation
  - Deploy to staging
  - Load testing
  - Security scan
  - Performance audit
  - Cross-browser testing

---

### Week 4: Production Launch
**Goal:** Deploy to production, monitor, stabilize

- **Day 1:** Pre-production prep
  - Final checklist review
  - Team briefing
  - Backup verification

- **Day 2:** Deploy
  - Maintenance mode
  - Migrations
  - Deploy
  - Smoke tests

- **Days 3-5:** Stabilization
  - 24h monitoring
  - Fix issues
  - Performance tuning
  - User feedback

---

### Post-Launch: Feature Development

**Weeks 5-6:** Analytics Dashboard
- Design metrics
- Implement queries
- Build UI
- Export functionality

**Weeks 7-8:** Appointment Booking
- Database schema
- Calendar UI
- Email/SMS notifications
- Google Calendar sync

**Weeks 9-10:** Real-time Notifications
- WebSocket setup
- Redis pub/sub
- Push notifications
- Admin alerts

**Weeks 11-12:** Enhanced AI Features
- Voice input
- Conversation memory
- Auto-categorization
- Smart responses

**Ongoing:**
- A/B testing
- Performance monitoring
- Security reviews
- User feedback iteration

---

## 📊 Tech Stack Assessment

### ✅ Excellent Choices

| Technology | Assessment | Notes |
|------------|------------|-------|
| React 19 | ⭐⭐⭐⭐⭐ | Latest version, best performance, Server Components ready |
| TypeScript | ⭐⭐⭐⭐⭐ | Essential for large projects, catching bugs early |
| Vite 6 | ⭐⭐⭐⭐⭐ | Fastest build tool, excellent HMR |
| Prisma | ⭐⭐⭐⭐⭐ | Best-in-class ORM, type-safe, great migrations |
| Tailwind CSS v4 | ⭐⭐⭐⭐⭐ | Modern, performant, excellent DX |
| PostgreSQL | ⭐⭐⭐⭐⭐ | Most reliable RDBMS, excellent for production |
| Express | ⭐⭐⭐⭐ | Battle-tested, huge ecosystem, mature |
| Gemini API | ⭐⭐⭐⭐ | Strong AI capabilities, good pricing |
| Zod | ⭐⭐⭐⭐⭐ | Best validation library, type inference |

### ⚠️ Missing (Should Add)

| Technology | Priority | Purpose |
|------------|----------|---------|
| Vitest | 🔴 Critical | Test runner (currently no tests!) |
| Pino / Winston | 🔴 Critical | Structured logging |
| Sentry | 🟠 High | Error tracking & monitoring |
| Redis | 🟡 Medium | Caching, sessions, pub/sub |
| Node-cron | 🟡 Medium | Scheduled jobs (cleanup) |
| Swagger | 🟡 Medium | API documentation |

### 🔄 Consider for Future

| Technology | When | Why |
|------------|------|-----|
| Next.js | If SEO critical | SSR, better SEO, built-in routing |
| tRPC | If full-stack TS | Type-safe API, eliminates REST boilerplate |
| Drizzle ORM | If Prisma too heavy | Lighter alternative, more control |
| BullMQ | If complex jobs | Advanced job queue (vs node-cron) |
| Grafana | If scaling | Advanced metrics & alerting |

---

## 🎁 Bonus: Quick Wins (1-2 Days Each)

### 1. Add Loading States
Improve perceived performance with skeleton screens.

### 2. Add Empty States
Better UX when no data exists.

### 3. Add Confirmation Dialogs
Prevent accidental deletions.

### 4. Add Toast Notifications
Better feedback for actions.

### 5. Add Keyboard Shortcuts
Power user features (Ctrl+K command palette).

### 6. Add Dark Mode Toggle
User preference (already have CSS vars!).

### 7. Add Export to CSV
Admin dashboard data export.

### 8. Add Bulk Actions
Admin efficiency (bulk delete, bulk status update).

### 9. Add Search/Filters
Admin dashboard usability.

### 10. Add User Profile Page
Let users update their info.

---

## 🏁 Conclusion

**Current Status:**
- ✅ Feature-complete
- ✅ Modern architecture
- ❌ Security vulnerabilities
- ❌ No test coverage
- ❌ Missing operational tooling

**Path to Production:**
1. **Week 1:** Fix critical security issues
2. **Week 2:** Add tests & infrastructure
3. **Week 3:** Staging validation
4. **Week 4:** Production deploy

**Estimated Total Effort:**
- Security fixes: 5 days
- Testing: 5 days
- Infrastructure: 5 days
- Documentation: 2 days
- Staging validation: 3 days
- **Total: ~4 weeks (1 developer)**

**Post-Launch Priorities:**
1. Real-time notifications
2. Analytics dashboard
3. Appointment booking
4. Enhanced AI features
5. PWA

---

## 📞 Next Steps

**Ready to start?** Choose your path:

1. **"Start security fixes"** - I'll create a branch and fix Phase 1 (Critical)
2. **"Set up testing"** - I'll install Vitest and write first tests
3. **"Add monitoring"** - I'll set up Sentry and structured logging
4. **"Deploy to staging"** - I'll help set up staging environment
5. **"Implement feature X"** - Pick a feature from enhancements

**Questions?** Ask about:
- Specific security fix details
- Testing strategy
- Deployment platform recommendations
- Feature prioritization
- Architecture decisions
- Performance optimization

---

**Document Version:** 1.0
**Last Updated:** May 14, 2026
**Next Review:** Before production deploy