import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GalleryService } from './gallery.service';
import prisma from '../config/database';
import fs from 'fs/promises';
import { NotFoundError } from '../utils/errors';

// Mock Prisma
vi.mock('../config/database', () => ({
  default: {
    image: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// Mock fs
vi.mock('fs/promises', () => ({
  default: {
    unlink: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('GalleryService', () => {
  let galleryService: GalleryService;

  beforeEach(() => {
    galleryService = new GalleryService();
    vi.clearAllMocks();
  });

  describe('getAllImages', () => {
    it('should return paginated images', async () => {
      (prisma.image.findMany as any).mockResolvedValue([{ id: '1' }]);
      (prisma.image.count as any).mockResolvedValue(1);

      const result = await galleryService.getAllImages(0, 10);

      expect(prisma.image.findMany).toHaveBeenCalled();
      expect(result.images).toHaveLength(1);
    });
  });

  describe('uploadImage', () => {
    it('should create an image record with correct URL', async () => {
      const mockData = {
        filename: 'test.jpg',
        originalname: 'test.jpg',
        size: 100,
        mimetype: 'image/jpeg',
        userId: 'user-1'
      };

      (prisma.image.create as any).mockResolvedValue({ id: '1', ...mockData, url: '/uploads/temp/test.jpg' });

      const result = await galleryService.uploadImage(mockData);

      expect(prisma.image.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          url: '/uploads/temp/test.jpg'
        })
      });
      expect(result.url).toBe('/uploads/temp/test.jpg');
    });
  });

  describe('deleteImage', () => {
    it('should delete from DB and attempt file deletion', async () => {
      const mockImage = { id: '1', filename: 'test.jpg', category: 'temp' };
      (prisma.image.findUnique as any).mockResolvedValue(mockImage);
      (prisma.image.delete as any).mockResolvedValue(mockImage);

      await galleryService.deleteImage('1');

      expect(fs.unlink).toHaveBeenCalled();
      expect(prisma.image.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw NotFoundError if image not found', async () => {
      (prisma.image.findUnique as any).mockResolvedValue(null);

      await expect(galleryService.deleteImage('999'))
        .rejects.toThrow(NotFoundError);
    });
  });
});
