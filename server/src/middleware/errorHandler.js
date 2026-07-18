// Centralized error-handling middleware.
//
// Per the Technical Design Document (section 10) and API Contract (section
// 0.9), this is the last line of defense: any error that reaches here is
// converted into the standard error envelope and a generic message, so a raw
// stack trace or internal detail is never leaked to the client.
//
// This is intentionally minimal in Slice 0 — it does not yet distinguish
// between validation errors, AI-provider errors, storage errors, etc. (that
// richer error-typing arrives alongside the modules that can produce those
// specific errors, starting in later slices). For now it guarantees that
// *any* unhandled error still produces a well-formed envelope instead of a
// crash or a leaking default Express error page.

import { sendError } from '../utils/response.js';

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  console.error('[error]', err);

  const statusCode = err.statusCode && Number.isInteger(err.statusCode) ? err.statusCode : 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message || 'Request failed';

  return sendError(res, { statusCode, message });
}
