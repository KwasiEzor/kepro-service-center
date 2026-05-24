import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

/**
 * Sanitization middleware to prevent XSS attacks
 * Recursively sanitizes all string values in request body, query, and params
 */

const sanitizeString = (value: string): string => {
  if (typeof value !== 'string') return value;

  // Escape HTML entities to prevent XSS
  return validator.escape(value);
};

const sanitizeObject = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
};

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Sanitize body
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query params
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }

    // Sanitize URL params
    if (req.params) {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Whitelist-based sanitization for specific fields that should allow HTML
 * Use this for rich text editors or fields that need to preserve formatting
 */
export const sanitizeInputWithWhitelist = (whitelist: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const sanitizeWithWhitelist = (obj: any, path: string = ''): any => {
        if (obj === null || obj === undefined) return obj;

        if (typeof obj === 'string') {
          // Skip sanitization for whitelisted fields
          if (whitelist.includes(path)) {
            return obj;
          }
          return sanitizeString(obj);
        }

        if (Array.isArray(obj)) {
          return obj.map((item, index) =>
            sanitizeWithWhitelist(item, `${path}[${index}]`)
          );
        }

        if (typeof obj === 'object') {
          const sanitized: any = {};
          for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
              const newPath = path ? `${path}.${key}` : key;
              sanitized[key] = sanitizeWithWhitelist(obj[key], newPath);
            }
          }
          return sanitized;
        }

        return obj;
      };

      if (req.body) {
        req.body = sanitizeWithWhitelist(req.body);
      }

      if (req.query) {
        req.query = sanitizeWithWhitelist(req.query);
      }

      if (req.params) {
        req.params = sanitizeWithWhitelist(req.params);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
