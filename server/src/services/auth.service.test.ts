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

    it('should throw UnauthorizedError if user is not found', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);

      await expect(authService.login({
        email: 'nonexistent@example.com',
        password: 'password123',
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

  describe('refreshAccessToken', () => {
    it('should refresh access token successfully', async () => {
      const mockSession = {
        id: 'session_123',
        token: 'refresh_token',
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        user: { id: 'user_123', email: 'test@example.com', role: UserRole.USER },
      };

      (jwt.verify as any).mockReturnValue({ userId: 'user_123' });
      (prisma.session.findUnique as any).mockResolvedValue(mockSession);
      (jwt.sign as any).mockReturnValue('new_access_token');

      const result = await authService.refreshAccessToken('refresh_token');

      expect(result.accessToken).toBe('new_access_token');
      expect(jwt.sign).toHaveBeenCalled();
    });

    it('should throw UnauthorizedError if session is not found', async () => {
      (jwt.verify as any).mockReturnValue({ userId: 'user_123' });
      (prisma.session.findUnique as any).mockResolvedValue(null);

      await expect(authService.refreshAccessToken('invalid_token'))
        .rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError and delete session if expired', async () => {
      const mockSession = {
        id: 'session_123',
        token: 'expired_token',
        expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
      };

      (jwt.verify as any).mockReturnValue({ userId: 'user_123' });
      (prisma.session.findUnique as any).mockResolvedValue(mockSession);

      await expect(authService.refreshAccessToken('expired_token'))
        .rejects.toThrow(UnauthorizedError);
      expect(prisma.session.delete).toHaveBeenCalledWith({ where: { id: 'session_123' } });
    });
  });

  describe('logout', () => {
    it('should delete sessions with the given refresh token', async () => {
      await authService.logout('token_to_delete');
      expect(prisma.session.deleteMany).toHaveBeenCalledWith({
        where: { token: 'token_to_delete' },
      });
    });
  });

  describe('getUserById', () => {
    it('should return user without password if found', async () => {
      const mockUser = {
        id: 'user_123',
        email: 'test@example.com',
        password: 'hashed_password',
        firstName: 'Test',
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);

      const result = await authService.getUserById('user_123');

      expect(result).toEqual({
        id: 'user_123',
        email: 'test@example.com',
        firstName: 'Test',
      });
      expect(result).not.toHaveProperty('password');
    });

    it('should return null if user is not found', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);
      const result = await authService.getUserById('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('verifyAccessToken', () => {
    it('should return payload for valid token', () => {
      const mockPayload = { userId: '123', email: 'test@test.com', role: UserRole.USER };
      (jwt.verify as any).mockReturnValue(mockPayload);

      const result = authService.verifyAccessToken('valid_token');
      expect(result).toEqual(mockPayload);
    });

    it('should throw UnauthorizedError for invalid token', () => {
      (jwt.verify as any).mockImplementation(() => { throw new Error('Invalid'); });
      expect(() => authService.verifyAccessToken('invalid_token')).toThrow(UnauthorizedError);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should return payload for valid refresh token', () => {
      const mockPayload = { userId: '123', email: 'test@test.com', role: UserRole.USER };
      (jwt.verify as any).mockReturnValue(mockPayload);

      const result = authService.verifyRefreshToken('valid_refresh_token');
      expect(result).toEqual(mockPayload);
    });

    it('should throw UnauthorizedError for invalid refresh token', () => {
      (jwt.verify as any).mockImplementation(() => { throw new Error('Invalid'); });
      expect(() => authService.verifyRefreshToken('invalid_refresh_token')).toThrow(UnauthorizedError);
    });
  });
});
