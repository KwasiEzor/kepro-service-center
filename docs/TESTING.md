# Testing Guide

## Prerequisites

### 1. PostgreSQL Running
Tests require a PostgreSQL server running on `localhost:5432`.

**Start PostgreSQL:**
```bash
# macOS (Homebrew)
brew services start postgresql@16

# macOS (Postgres.app)
# Open Postgres.app

# Linux
sudo systemctl start postgresql

# Docker
docker run -d -p 5432:5432 -e POSTGRES_HOST_AUTH_METHOD=trust postgres:16
```

### 2. Test Database Setup
Run the setup script to create and migrate the test database:

```bash
./scripts/setup-test-db.sh
```

This script:
- Creates `keypro_test` database
- Runs all migrations
- Verifies connection

**Manual setup** (if script fails):
```bash
# Create database
createdb keypro_test

# Run migrations
DATABASE_URL="postgresql://macbook@localhost:5432/keypro_test?schema=public" \
  npx prisma migrate deploy
```

---

## Running Tests

### All Tests
```bash
npm test
```

### With Coverage
```bash
npm test -- --coverage
```

View coverage report:
```bash
open coverage/index.html
```

### Specific Test File
```bash
npm test server/src/services/auth.service.test.ts
```

### Watch Mode
```bash
npm test -- --watch
```

---

## Test Structure

```
server/src/tests/
├── setup.ts                    # Global test setup
├── integration/                # Integration tests
│   ├── auth.flow.test.ts
│   ├── invoice.test.ts
│   └── ...
├── regression/                 # Regression tests
│   ├── admin.validation.test.ts
│   └── api.vision.test.ts
└── security/                   # Security tests
    ├── xss-sql-injection.test.ts
    └── upload.test.ts

server/src/services/
├── auth.service.ts
├── auth.service.test.ts        # Unit tests alongside code
└── ...
```

---

## Coverage Thresholds

Target: **70%+ coverage**

Configured in `vitest.config.ts`:
- Statements: 70%
- Branches: 65%
- Functions: 70%
- Lines: 70%

CI builds will fail if coverage drops below these thresholds.

---

## Test Environment

Tests use `.env.test` configuration:
- Database: `keypro_test` (separate from dev)
- Mock API keys (Gemini, SMTP)
- Test-specific secrets
- Logging suppressed (LOG_LEVEL=error)

**Never run tests against production database!**

The test setup verifies `DATABASE_URL` contains "keypro_test" to prevent accidents.

---

## Writing Tests

### Unit Test Example
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { authService } from './auth.service';

describe('AuthService', () => {
  beforeEach(async () => {
    // Database is automatically cleaned via setup.ts
  });

  it('should hash password correctly', async () => {
    const hashed = await authService.hashPassword('password123');
    expect(hashed).not.toBe('password123');
    expect(hashed).toMatch(/^\$/); // bcrypt format
  });
});
```

### Integration Test Example
```typescript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../index';

describe('POST /api/auth/login', () => {
  it('should login with valid credentials', async () => {
    // Register user first
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'Pass123!' });

    // Then login
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'Pass123!' });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('token');
  });
});
```

---

## Troubleshooting

### "Database keypro_test does not exist"
Run the setup script:
```bash
./scripts/setup-test-db.sh
```

### "Connection refused"
PostgreSQL isn't running. Start it (see Prerequisites).

### Tests hanging
Check for:
- Unclosed database connections
- Missing `await` on async operations
- Infinite loops

### Flaky tests
- Ensure proper cleanup in `beforeEach`
- Avoid hardcoded IDs
- Use transactions for isolation

### Coverage not generated
Install coverage provider:
```bash
npm install -D @vitest/coverage-v8
```

---

## CI/CD Integration

GitHub Actions workflow (`.github/workflows/ci.yml`):
```yaml
- name: Setup test database
  run: ./scripts/setup-test-db.sh

- name: Run tests with coverage
  run: npm test -- --coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

---

## Best Practices

1. **One assertion per test** (when possible)
2. **Descriptive test names** (what, when, expected)
3. **Arrange-Act-Assert pattern**
4. **No test interdependencies** (order shouldn't matter)
5. **Mock external services** (APIs, emails, file system)
6. **Test edge cases** (null, empty, invalid input)
7. **Keep tests fast** (< 100ms per test)

---

## Current Status

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Coverage | 70% | 35% | ⚠️ Below target |
| Tests Passing | 100% | 100% | ✅ |
| Test Suite | Complete | Partial | ⚠️ Missing integration tests |

**Priority:** Increase coverage to 70%+ before production deployment.

See `docs/plans/2026-05-24-final-deployment-readiness.md` for test writing plan.
