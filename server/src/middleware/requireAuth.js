// requireAuth — JWT verification middleware.
//
// Per the Technical Design Document (section 8): "an auth middleware
// verifies the JWT on every protected request and attaches the resolved
// user to the request context before it reaches the controller." This does
// a real database lookup (via userRepository.findById) rather than just
// trusting the token's payload, so a token for a since-deleted account is
// rejected rather than silently treated as valid — the tradeoff is one
// extra DB read per protected request, which is acceptable at this
// project's scale.
//
// This is deliberately the ONLY user lookup on a protected request path.
// req.user includes createdAt (not just id/name/email) specifically so
// GET /auth/me can build its full response straight from req.user without
// a second, redundant findById — authService no longer has a separate
// getCurrentUser method for this reason (see auth.service.js).
//
// Per the API Contract (section 0.9 / section 2.3): any failure here — no
// header, malformed header, invalid signature, expired token, or a token
// whose user no longer exists — resolves to a single generic 401. This
// never distinguishes *why* the token was rejected in the response body,
// consistent with the API Contract's fail-closed, non-revealing pattern
// used elsewhere (e.g. login's generic invalid-credentials message).

import jwt from 'jsonwebtoken';
import { userRepository } from '../modules/users/user.repository.js';
import { env } from '../config/env.js';
import { sendError } from '../utils/response.js';

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, { statusCode: 401, message: 'Missing or invalid authorization token' });
  }

  const token = authHeader.slice('Bearer '.length).trim();

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    // Covers both an invalid signature and an expired token — jwt.verify
    // throws for both, and both map to the same generic 401 here.
    return sendError(res, { statusCode: 401, message: 'Invalid or expired token' });
  }

  const user = await userRepository.findById(payload.sub);
  if (!user) {
    return sendError(res, { statusCode: 401, message: 'Invalid or expired token' });
  }

  req.user = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };

  return next();
}