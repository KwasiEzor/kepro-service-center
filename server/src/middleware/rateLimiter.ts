import rateLimit from 'express-rate-limit';
import { Request } from 'express';

/**
 * Global API rate limiter (IP-based)
 * Prevents API abuse across all endpoints
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Per-user rate limiter (User ID-based)
 * Limits authenticated users regardless of IP (prevents IP rotation abuse)
 */
export const userRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Higher limit for authenticated users (200 requests per 15 min)
  message: 'Too many requests from your account, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Rate limit by user ID if authenticated
    const userId = (req.user as any)?.id;
    if (userId) {
      return `user:${userId}`;
    }
    // Fall back to default IP-based key generation (handles IPv6 properly)
    return undefined as any; // Let express-rate-limit use default IP generator
  },
  skip: (req: Request) => {
    // Skip if not authenticated (let IP-based limiter handle it)
    return !(req.user as any)?.id;
  },
});

/**
 * Strict auth rate limiter for login/register
 * Prevents brute force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth attempts per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

/**
 * File upload rate limiter
 * Prevents DoS via large file uploads
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 uploads per hour
  message: 'Too many upload attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
