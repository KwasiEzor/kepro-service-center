import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { ValidationError } from '../utils/errors';
import { env } from '../../env';

// Allowed file types
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = parseInt(env.MAX_FILE_SIZE);

// Allowed upload categories (whitelist)
const ALLOWED_CATEGORIES = ['gallery', 'temp', 'documents'] as const;

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = env.UPLOAD_DIR;
    const category = (req.query.category as string) || 'temp';

    // Validate category whitelist
    if (!ALLOWED_CATEGORIES.includes(category as typeof ALLOWED_CATEGORIES[number])) {
      return cb(new ValidationError(`Invalid category. Allowed: ${ALLOWED_CATEGORIES.join(', ')}`), '');
    }

    const dest = path.join(uploadDir, category);

    // Prevent path traversal
    const resolvedDest = path.resolve(dest);
    const resolvedUploadDir = path.resolve(uploadDir);

    if (!resolvedDest.startsWith(resolvedUploadDir)) {
      return cb(new ValidationError('Invalid upload path'), '');
    }

    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationError('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
  }
};

// Multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

// Upload single image
export const uploadSingle = upload.single('image');

// Upload multiple images (max 10)
export const uploadMultiple = upload.array('images', 10);
