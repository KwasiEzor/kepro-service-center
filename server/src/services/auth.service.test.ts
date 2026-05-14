import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth.service';
import prisma from '../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ConflictError } from '../utils/errors';
import { UserRole } from '@prisma/client';

// Mock Prisma
vi.mock('../config/database', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    session: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

// Mock jwt
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
  },
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: 'user_123',
        email: 'test@example.com',
        password: 'hashed_password',
        role: UserRole.USER,
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(true);
      (jwt.sign as any).mockReturnValue('mock_token');

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
      expect(result.accessToken).toBe('mock_token');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw UnauthorizedError with invalid password', async () => {
      const mockUser = {
        id: 'user_123',
        email: 'test@example.com',
        password: 'hashed_password',
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(false);

      await expect(authService.login({
        email: 'test@example.com',
        password: 'wrong_password',
      })).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockData = {
        email: 'new@example.com',
        password: 'password123',
        firstName: 'Test',
      };

      (prisma.user.findUnique as any).mockResolvedValue(null);
      (bcrypt.hash as any).mockResolvedValue('hashed_password');
      (prisma.user.create as any).mockResolvedValue({
        id: 'new_user_id',
        ...mockData,
        password: 'hashed_password',
        role: UserRole.USER,
      });

      const result = await authService.register(mockData);

      expect(prisma.user.create).toHaveBeenCalled();
      expect(result.user.email).toBe('new@example.com');
      expect(result.accessToken).toBeDefined();
    });

    it('should throw ConflictError if user already exists', async () => {
      (prisma.user.findUnique as any).mockResolvedValue({ id: 'existing' });

      await expect(authService.register({
        email: 'existing@example.com',
        password: 'password',
      })).rejects.toThrow(ConflictError);
    });
  });
});
