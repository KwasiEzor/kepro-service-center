# 🚨 DEPLOYMENT BLOCKERS - FIX IMMEDIATELY

**Status:** ⛔ **NOT PRODUCTION-READY**
**Risk Level:** 🔴 **HIGH**

---

## Critical Security Issues (5)

### 1. Hardcoded JWT Secrets ⚠️ CRITICAL
**File:** `server/src/config/auth.ts:3-4`
**Risk:** Complete auth bypass, account takeover

```typescript
// BAD:
secret: process.env.JWT_SECRET || 'your-secret-key-change-this'

// GOOD:
secret: env.JWT_SECRET // No fallback, fail at startup
```

**Fix Time:** 1 hour

---

### 2. Path Traversal in Uploads ⚠️ CRITICAL
**File:** `server/src/middleware/upload.ts:13-16`
**Risk:** Remote code execution, arbitrary file write

```bash
# Attack:
POST /upload?category=../../../etc/passwd
```

**Fix:** Whitelist categories + path validation
**Fix Time:** 2 hours

---

### 3. .env in Git History ⚠️ CRITICAL
**Risk:** Exposed secrets (JWT, DB, API keys)

```bash
git rm --cached .env
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

**Fix Time:** 30 min + secret rotation

---

### 4. Missing Auth on Endpoints ⚠️ HIGH
**File:** `server/src/routes/auth.routes.ts:37,48`
**Risk:** Token enumeration, session hijacking

```typescript
// BAD:
router.post('/refresh', authController.refresh)

// GOOD:
router.post('/refresh', authenticate, authController.refresh)
```

**Fix Time:** 15 min

---

### 5. No Rate Limiting ⚠️ HIGH
**Risk:** Brute force attacks, API abuse

```typescript
import rateLimit from 'express-rate-limit'
const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 5 })
app.use('/api/auth/login', authLimiter)
```

**Fix Time:** 30 min

---

## High Priority Issues (4)

### 6. CORS Defaults to Localhost
**Fix:** Remove fallback, validate FRONTEND_URL in env.ts
**Time:** 15 min

### 7. No Pagination
**Risk:** Memory exhaustion, DoS
**Fix:** Add skip/take to all findMany()
**Time:** 1 hour

### 8. Missing Input Length Limits
**Risk:** DoS via huge payloads
**Fix:** Add .max() to all Zod schemas
**Time:** 30 min

### 9. npm Audit (3 moderate)
```bash
npm audit fix --force
```
**Time:** 15 min

---

## Zero Test Coverage ⚠️

**Current:** No test suite configured
**Required:** 70%+ coverage before deploy

```bash
npm install -D vitest @testing-library/react
npm install -D supertest @types/supertest
```

**Priority Tests:**
1. Auth service (login, register, token validation)
2. File upload (path traversal protection)
3. Admin endpoints (authorization)
4. Rate limiting

**Time:** 5 days

---

## Quick Fix Script

```bash
# Day 1 (2-3 hours)
cd keypro-service-center

# 1. Fix secrets
# Edit server/env.ts - add strict validation (no fallbacks)
# Edit server/src/config/auth.ts - remove || defaults
# Edit server/api.ts - remove || ''

# 2. Remove .env from git
git rm --cached .env
echo ".env" >> .gitignore

# 3. Rotate secrets
openssl rand -base64 32 # New JWT_SECRET
openssl rand -base64 32 # New JWT_REFRESH_SECRET

# 4. Add auth to endpoints
# Edit server/src/routes/auth.routes.ts
# Add authenticate middleware to /refresh and /logout

# 5. Add rate limiting
# Edit server/index.ts - add rate limit middleware

# 6. Fix npm audit
npm audit fix --force
npm run build # Verify works

# 7. Replace console.log
npm install pino pino-pretty
# Create logger.ts, replace all console.*

# 8. Test
npm run dev
# Manual test: login, upload, admin actions
```

---

## Must Have Before Deploy

### Security
- [x] Read audit (you're here!)
- [ ] Fix 5 critical issues (Day 1)
- [ ] Fix 4 high priority issues (Day 1-2)
- [ ] Rotate all secrets
- [ ] Security scan clean

### Testing
- [ ] Install Vitest
- [ ] Write security tests
- [ ] 70%+ coverage
- [ ] All tests passing

### Infrastructure
- [ ] Add monitoring (Sentry)
- [ ] Add logging (Pino)
- [ ] Add health check
- [ ] Add pagination

### Documentation
- [ ] DEPLOYMENT.md
- [ ] .env.example
- [ ] Security notes in README

---

## Timeline

**Week 1:** Security fixes (5 critical + 4 high)
**Week 2:** Tests + infrastructure
**Week 3:** Staging validation
**Week 4:** Production deploy

**Total:** 4 weeks (1 developer)

---

## Ready to Start?

1. **"start security fixes"** - Claude creates branch, fixes Phase 1
2. **Read full audit:** `AUDIT_REPORT.md`
3. **Follow checklist:** `SECURITY_FIXES_CHECKLIST.md`

---

**This file is a quick reference. See AUDIT_REPORT.md for complete details.**
