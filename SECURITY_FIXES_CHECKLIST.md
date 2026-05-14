# Security Fixes Checklist

**Priority:** CRITICAL - Must complete before production deploy
**Estimated Time:** 5 days (1 developer)

---

## Day 1: Environment & Secrets

### Remove Hardcoded Fallbacks
- [ ] **server/src/config/auth.ts**
  - [ ] Remove `|| 'your-secret-key-change-this'` from JWT_SECRET
  - [ ] Remove `|| 'your-refresh-secret-change-this'` from JWT_REFRESH_SECRET

- [ ] **server/api.ts**
  - [ ] Remove `|| ''` from GEMINI_API_KEY

- [ ] **server/index.ts**
  - [ ] Remove `|| 'http://localhost:3000'` from FRONTEND_URL
  - [ ] Remove `|| './uploads'` from UPLOAD_DIR

### Add Strict Environment Validation
- [ ] **server/env.ts**
  ```typescript
  export const env = z.object({
    PORT: z.string().default('5000'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    GEMINI_API_KEY: z.string().min(1),
    FRONTEND_URL: z.string().url(),
    UPLOAD_DIR: z.string().min(1),
  }).parse(process.env);
  ```

- [ ] Update all files to use `env.VAR_NAME` instead of `process.env.VAR_NAME`

### Git History Cleanup
- [ ] Remove .env from current commit: `git rm --cached .env`
- [ ] Remove from history: `git filter-branch --force --index-filter "git rm --cached --ignore-unmatch .env" --prune-empty --tag-name-filter cat -- --all`
- [ ] Verify .env in .gitignore
- [ ] Force push (coordinate with team!)

### Rotate All Secrets
- [ ] Generate new JWT_SECRET (32+ chars): `openssl rand -base64 32`
- [ ] Generate new JWT_REFRESH_SECRET (32+ chars): `openssl rand -base64 32`
- [ ] Regenerate GEMINI_API_KEY from Google AI Studio
- [ ] Update DATABASE_URL password if exposed
- [ ] Update all environments (dev, staging, production)

---

## Day 2: File Upload Security

### Fix Path Traversal Vulnerability
- [ ] **server/src/middleware/upload.ts**
  ```typescript
  const ALLOWED_CATEGORIES = ['gallery', 'temp', 'documents'] as const;

  destination: (req, file, cb) => {
    const uploadDir = env.UPLOAD_DIR;
    const category = (req.query.category as string) || 'temp';

    // Validate category whitelist
    if (!ALLOWED_CATEGORIES.includes(category as any)) {
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

### Verify Existing Security
- [ ] File size limits configured (check `limits.fileSize`)
- [ ] MIME type validation working (check `fileFilter`)
- [ ] File extension validation working

### Test Path Traversal Protection
- [ ] Write test: `POST /api/admin/gallery/upload?category=../../../etc`
- [ ] Verify returns 400 error
- [ ] Write test: valid categories work

---

## Day 3: Authentication Hardening

### Fix Unauthenticated Endpoints
- [ ] **server/src/routes/auth.routes.ts**
  ```typescript
  import { authenticate } from '../middleware/auth';

  router.post('/refresh', authenticate, authController.refresh.bind(authController));
  router.post('/logout', authenticate, authController.logout.bind(authController));
  ```

### Add Rate Limiting
- [ ] **server/index.ts**
  ```typescript
  import rateLimit from 'express-rate-limit';

  // Auth endpoints - strict
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many attempts, please try again later',
  });

  // API endpoints - moderate
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  });

  // Chat endpoint - protect quota
  const chatLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
  });

  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);
  app.use('/api/chat', chatLimiter);
  app.use('/api', apiLimiter);
  ```

### Add CSRF Protection
- [ ] Install: `npm install csurf`
- [ ] **server/index.ts**
  ```typescript
  import csrf from 'csurf';

  app.use(csrf({ cookie: true }));

  app.use((req, res, next) => {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    next();
  });
  ```

- [ ] **src/lib/api.ts** (frontend)
  ```typescript
  const getCsrfToken = () => {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1];
  };

  // Add to all POST/PUT/DELETE requests
  headers: {
    'X-XSRF-TOKEN': getCsrfToken() || '',
  }
  ```

---

## Day 4: Input Validation & Pagination

### Add Input Length Limits
- [ ] **server/src/routes/public.routes.ts**
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

### Implement Pagination
- [ ] Create **server/src/utils/pagination.ts**
  ```typescript
  export interface PaginationParams {
    page?: number;
    limit?: number;
  }

  export const paginate = (params: PaginationParams) => {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(Math.max(1, params.limit || 20), 100);
    return { skip: (page - 1) * limit, take: limit };
  };
  ```

- [ ] Update **server/src/controllers/admin.controller.ts**
  - [ ] `getQuotes()` - add pagination
  - [ ] `getContacts()` - add pagination
  - [ ] `getImages()` - add pagination
  - [ ] `getUsers()` - add pagination

### Add Request Size Limits
- [ ] **server/index.ts**
  ```typescript
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  ```

---

## Day 5: Audit & Verification

### Fix npm Vulnerabilities
- [ ] Run `npm audit`
- [ ] Run `npm audit fix --force`
- [ ] Verify app still works after updates
- [ ] Run build: `npm run build`
- [ ] Test critical flows

### Remove Console Statements
- [ ] Install Pino: `npm install pino pino-pretty`
- [ ] Create **server/src/utils/logger.ts**
  ```typescript
  import pino from 'pino';

  export const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    redact: ['req.headers.authorization', 'password', 'token'],
    transport: process.env.NODE_ENV !== 'production' ? {
      target: 'pino-pretty',
      options: { colorize: true },
    } : undefined,
  });
  ```

- [ ] Replace all `console.log` → `logger.info`
- [ ] Replace all `console.error` → `logger.error`
- [ ] Search: `git grep -n "console\."` (should return 0)

### Fix TypeScript Issues
- [ ] Remove all `@ts-ignore` comments
- [ ] Remove all `as any` casts
- [ ] Verify `npm run lint` passes with no errors
- [ ] Fix type definitions properly

### Code Review
- [ ] Review all changed files
- [ ] Check for edge cases
- [ ] Verify error handling
- [ ] Test locally

### Update Documentation
- [ ] Create **.env.example**
  ```bash
  NODE_ENV=development
  PORT=5000
  DATABASE_URL=postgresql://user:pass@localhost:5432/keypro
  JWT_SECRET=change-this-to-random-32-chars
  JWT_REFRESH_SECRET=change-this-to-random-32-chars
  GEMINI_API_KEY=your-api-key
  FRONTEND_URL=http://localhost:3000
  UPLOAD_DIR=./uploads
  LOG_LEVEL=info
  ```

- [ ] Update README.md with security notes
- [ ] Document rate limiting behavior
- [ ] Document CSRF token usage

---

## Testing Checklist

### Manual Testing
- [ ] Register new user
- [ ] Login with new user
- [ ] Submit quote
- [ ] Submit contact
- [ ] Login as admin
- [ ] View quotes (check pagination)
- [ ] View contacts (check pagination)
- [ ] Upload gallery image
- [ ] Try invalid upload category (should fail)
- [ ] Logout
- [ ] Refresh token flow
- [ ] Rate limiting (try 6+ logins)

### Automated Tests (Next Phase)
- [ ] Auth endpoint tests
- [ ] File upload security tests
- [ ] Rate limiting tests
- [ ] Pagination tests
- [ ] Input validation tests

---

## Verification Checklist

### Security
- [ ] No hardcoded secrets in code
- [ ] All env vars validated at startup
- [ ] .env not in git history
- [ ] All secrets rotated
- [ ] Path traversal protection working
- [ ] Rate limiting active
- [ ] CSRF protection working
- [ ] Input validation enforced
- [ ] No console.log in production code

### Functionality
- [ ] App starts without errors
- [ ] All routes working
- [ ] Auth flow working
- [ ] Admin dashboard functional
- [ ] File uploads working (valid categories only)
- [ ] Chat working
- [ ] Email working (if configured)

### Code Quality
- [ ] TypeScript compilation passes
- [ ] No type safety bypasses
- [ ] Structured logging implemented
- [ ] Error handling proper
- [ ] Code reviewed

---

## Sign-off

- [ ] All tasks completed
- [ ] All tests passing
- [ ] Code reviewed by peer (if available)
- [ ] Ready for staging deployment

**Completed by:** _______________
**Date:** _______________
**Reviewer:** _______________

---

## Next Phase: Testing (Week 2)

After completing this checklist, proceed to:
1. Install Vitest
2. Write security tests
3. Write integration tests
4. Achieve 70%+ coverage

See AUDIT_REPORT.md Section "Phase 2: Testing Infrastructure"