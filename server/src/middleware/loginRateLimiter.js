// Login rate limiter.
//
// Per the API Contract (section 0.7): 10 attempts / 15 min / IP, applied
// only to POST /auth/login — not the whole auth router. Mounted directly on
// the login route in auth.routes.js, not globally.
//
// express-rate-limit's default behavior on a blocked request is to send its
// own plain-text/JSON response, which does not match this API's standard
// envelope. The `handler` option below overrides that default so a rate-
// limited request still gets the same { success, message, errors } shape
// as every other response in this API, per the API Contract's section 0.2
// requirement that the envelope applies with no exceptions.

import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/response.js';

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window per IP
  standardHeaders: true, // adds RateLimit-* headers
  legacyHeaders: false, // omits deprecated X-RateLimit-* headers
  handler: (req, res) => {
    return sendError(res, {
      statusCode: 429,
      message: 'Too many login attempts. Please try again later.',
    });
  },
});