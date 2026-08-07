// AI generation rate limiter: 10 requests/hour per user, shared by
// Generate and future Regenerate. Must be mounted after requireAuth.

import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { sendError } from '../utils/response.js';

export const aiGenerationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) =>
    req.user?.id ?? ipKeyGenerator(req.ip),
  handler: (req, res) => {
    return sendError(res, {
      statusCode: 429,
      message: 'AI generation rate limit exceeded. Please try again later.',
    });
  },
});