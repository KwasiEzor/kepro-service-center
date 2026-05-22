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
- [x] **server/src/routes/auth.routes.ts** (Done)

### Add Rate Limiting
- [x] **server/index.ts** (Done)

### Add CSRF Protection
- [x] Install: `npm install csrf-csrf` (Done)
- [x] **server/src/middleware/csrf.ts** (Done)
- [x] **server/index.ts** - Add `doubleCsrfProtection` (Done)
- [x] **src/lib/api.ts** (frontend) - Add `X-CSRF-Token` header (Done)

---

## Day 4: Input Validation & Pagination

### Add Input Length Limits
- [x] **server/src/routes/public.routes.ts** (Done)

### Implement Pagination
- [x] Create **server/src/utils/pagination.ts** (Done)
- [x] Update **server/src/controllers/admin.controller.ts** (Done)

### Add Request Size Limits
- [x] **server/index.ts** (Done)

---

## Day 5: Audit & Verification

### Fix npm Vulnerabilities
- [x] Run `npm audit` (Done)

### Remove Console Statements
- [x] Install Pino: `npm install pino pino-pretty` (Done)
- [x] Create **server/src/utils/logger.ts** (Done)
- [x] Replace all `console.log` → `logger.info` (Done)
- [x] Replace all `console.error` → `logger.error` (Done)

### Fix TypeScript Issues
- [x] Remove all `@ts-ignore` comments (Done)
- [x] Remove critical `as any` casts (Done)
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