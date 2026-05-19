import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

/**
 * Middleware to validate request body with Zod schema
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ');
        next(new ValidationError(messages));
      } else {
        next(error);
      }
    }
  };
};

/**
 * Generic validator for any part of the request
 */
export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ');
        next(new ValidationError(messages));
      } else {
        next(error);
      }
    }
  };
};

/**
 * Middleware to validate query parameters with Zod schema
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated as Record<string, any>; // Replace with validated data
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map((issue) => issue.message).join(', ');
        next(new ValidationError(messages));
      } else {
        next(error);
      }
    }
  };
};

/**
 * Middleware to validate route params with Zod schema
 */
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map((issue) => issue.message).join(', ');
        next(new ValidationError(messages));
      } else {
        next(error);
      }
    }
  };
};
