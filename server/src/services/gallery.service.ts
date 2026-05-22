import prisma from '../config/database';
import fs from 'fs/promises';
import path from 'path';
import { env } from '../../env';
import logger from '../utils/logger';
import { NotFoundError } from '../utils/errors';

export class GalleryService {
  async getAllImages(skip: number, take: number, category?: string) {
    const where = category ? { category } : undefined;
    const [images, total] = await Promise.all([
      prisma.image.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.image.count({ where })
    ]);
    return { images, total };
  }

  async uploadImage(data: {
    filename: string;
    originalname: string;
    size: number;
    mimetype: string;
    category?: string;
    alt?: string;
    userId: string;
  }) {
    // Convert path to URL format (relative to public /uploads)
    const imageUrl = `/uploads/${data.category || 'temp'}/${data.filename}`;

    return prisma.image.create({
      data: {
        url: imageUrl,
        filename: data.filename,
        alt: data.alt || data.originalname,
        category: data.category || 'temp',
        size: data.size,
        mimeType: data.mimetype,
        uploadedBy: data.userId,
      },
    });
  }

  async deleteImage(id: string) {
    const image = await prisma.image.findUnique({
      where: { id },
    });

    if (!image) {
      throw new NotFoundError('Image not found');
    }

    // Delete from filesystem
    const uploadDir = env.UPLOAD_DIR;
    const fullPath = path.join(process.cwd(), uploadDir, image.category || 'temp', image.filename);
    
    try {
      await fs.unlink(fullPath);
    } catch (err) {
      logger.error({ err, path: fullPath }, 'Failed to delete physical file');
      // Continue to delete from DB even if file is missing
    }

    return prisma.image.delete({
      where: { id },
    });
  }
}

export default new GalleryService();
