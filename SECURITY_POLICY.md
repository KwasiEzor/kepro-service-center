# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

---

## Reporting a Vulnerability

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, please report security issues to:
- **Email:** security@keypro.service (or maintainer email)
- **Response Time:** Within 48 hours
- **Severity Assessment:** Within 72 hours

Include:
1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. Suggested fix (if known)

---

## Secret Management Policy

### Required Secrets

| Secret | Purpose | Min Length | Rotation Frequency |
|--------|---------|------------|-------------------|
| `JWT_SECRET` | Sign access tokens | 32 chars | 90 days |
| `JWT_REFRESH_SECRET` | Sign refresh tokens | 32 chars | 90 days |
| `GEMINI_API_KEY` | Google AI API | Google-provided | On compromise |
| `DATABASE_URL` | PostgreSQL connection | N/A | On compromise |
| `SMTP_PASS` | Email sending | Provider-specific | 180 days |
| `SENTRY_DSN` | Error tracking | Sentry-provided | Never (revoke if compromised) |

---

## Secret Rotation Procedures

### 1. JWT Secrets (Every 90 Days)

```bash
# Generate new secrets
openssl rand -base64 48 > jwt_secret_new.txt
openssl rand -base64 48 > jwt_refresh_secret_new.txt

# Update .env files (production, staging, dev)
JWT_SECRET="<new_value>"
JWT_REFRESH_SECRET="<new_value>"

# Deploy with rolling update strategy
# 1. Deploy new env vars
# 2. Wait 1 hour for token expiry
# 3. Verify no auth errors in logs
# 4. Remove old secrets from password manager
```

**Impact:** All active sessions invalidated. Users must re-login.

---

### 2. Database Password (On Compromise)

```bash
# 1. Create new database user with new password
CREATE USER keypro_new WITH PASSWORD 'new_secure_password';
GRANT ALL PRIVILEGES ON DATABASE keypro TO keypro_new;

# 2. Update DATABASE_URL in all environments
DATABASE_URL="postgresql://keypro_new:new_secure_password@host:5432/keypro"

# 3. Deploy with zero downtime
# - Use connection pooling
# - Old connections drain naturally
# - New connections use new credentials

# 4. Revoke old user after 24h
REVOKE ALL PRIVILEGES ON DATABASE keypro FROM keypro_old;
DROP USER keypro_old;
```

**Impact:** None (if done correctly with connection pooling)

---

### 3. API Keys (Gemini, Sentry - On Compromise)

**Gemini API Key:**
```bash
# 1. Generate new key in Google AI Studio
# 2. Update GEMINI_API_KEY in .env
# 3. Deploy to production
# 4. Revoke old key in Google AI Studio console
# 5. Monitor for 403 errors
```

**Sentry DSN:**
```bash
# 1. Create new project or regenerate DSN in Sentry console
# 2. Update SENTRY_DSN in .env
# 3. Deploy
# 4. Verify errors are being tracked
# 5. Archive old project if needed
```

**Impact:** Temporary service degradation if not done quickly.

---

## Secret Storage

### Development
- **Never** commit secrets to git
- Store in `.env` (gitignored)
- Use `.env.example` for documentation
- Share secrets via secure channel (1Password, etc.)

### Production
- **Never** hardcode secrets in code
- Use environment variables only
- Validate at startup (fail fast if missing)
- Log secret usage (not values!) for audit

### CI/CD
- Store as GitHub Secrets
- Never log secret values
- Use `continue-on-error: false` for security scans
- Rotate GitHub secrets every 180 days

---

## Secret Validation

All secrets are validated at startup in `server/env.ts`:

```typescript
// Minimum lengths enforced
JWT_SECRET: z.string().min(32)
JWT_REFRESH_SECRET: z.string().min(32)
GEMINI_API_KEY: z.string().min(1)

// URL format validated
DATABASE_URL: z.string().url()
FRONTEND_URL: z.string().url()

// Process exits if validation fails (non-test env)
```

---

## Incident Response Plan

### If a secret is compromised:

**Within 1 hour:**
1. Revoke compromised secret immediately
2. Generate and deploy new secret
3. Notify team via Slack/Discord
4. Check logs for unauthorized usage

**Within 24 hours:**
5. Investigate how compromise occurred
6. Update this document if procedures failed
7. Conduct post-mortem
8. Implement preventive measures

**Within 1 week:**
9. Review and rotate related secrets
10. Update monitoring/alerting rules
11. Security training for team

---

## Automated Security Scans

### npm audit
- Runs: On every `npm install`, in CI/CD
- Threshold: High severity
- Action: `npm audit fix` (safe fixes), manual review for breaking changes

### Snyk
- Runs: On every push/PR (GitHub Actions)
- Threshold: High severity
- Monitors: node_modules, Dockerfile, GitHub Actions
- Dashboard: https://app.snyk.io (requires SNYK_TOKEN)

### GitHub Dependabot
- Runs: Daily
- Action: Auto-creates PRs for security updates
- Review: Within 48 hours

---

## Security Headers

Configured in `server/src/config/middleware.ts`:

```typescript
helmet({
  contentSecurityPolicy: { /* ... */ },
  hsts: { maxAge: 31536000 },
  noSniff: true,
  xssFilter: true,
})
```

---

## Rate Limiting

Configured to prevent brute force attacks:

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/auth/login` | 5 attempts | 15 minutes |
| `/api/auth/register` | 3 attempts | 1 hour |
| `/api/auth/forgot-password` | 3 attempts | 1 hour |
| All other `/api/*` | 100 requests | 15 minutes |

---

## Security Checklist (Pre-Deployment)

- [ ] All secrets in password manager
- [ ] No hardcoded fallbacks in code
- [ ] Environment validation passes
- [ ] `npm audit` clean (high/critical)
- [ ] Snyk scan clean (high/critical)
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Rate limiting active
- [ ] CSRF protection enabled
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak sensitive info
- [ ] Logging doesn't include secrets
- [ ] Database uses least-privilege principle

---

## Contact

- **Security Issues:** security@keypro.service
- **General Support:** support@keypro.service
- **Maintainer:** @KwasiEzor

---

**Last Updated:** 2026-05-23
**Next Review:** 2026-08-23 (90 days)
