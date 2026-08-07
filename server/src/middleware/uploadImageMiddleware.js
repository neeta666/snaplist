// Parses the single "image" multipart field into req.file (memory buffer).
// Wraps multer's callback API so upload errors map to this API's envelope
// instead of multer's default response shape.

import multer from 'multer';
import { sendError } from '../utils/response.js';

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const INVALID_FILE_TYPE = 'INVALID_FILE_TYPE';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error(INVALID_FILE_TYPE));
    }
    return cb(null, true);
  },
}).single('image');

export function uploadImageMiddleware(req, res, next) {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, {
        statusCode: 413,
        message: 'Image exceeds maximum size of 8MB',
      });
    }

    if (err) {
      // Covers our own fileFilter rejection and any other unexpected
      // multer/busboy error (malformed multipart body, etc.) — all are
      // client input problems, not server failures.
      return sendError(res, {
        statusCode: 422,
        message: err.message === INVALID_FILE_TYPE
          ? 'Image must be jpeg, png, or webp'
          : 'Invalid image upload',
      });
    }

    if (!req.file) {
      return sendError(res, {
        statusCode: 422,
        message: 'Image is required',
      });
    }

    return next();
  });
}