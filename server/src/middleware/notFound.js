// Catch-all handler for requests that don't match any defined route.
//
// This is distinct from the per-resource "404 = not found or not owned"
// behavior defined in the API Contract (section 4) for listing endpoints —
// that logic belongs in the listings service once it exists (Slice 4+). This
// handler only covers genuinely unknown routes/paths at the Express level.

import { sendError } from '../utils/response.js';

export function notFound(req, res) {
  return sendError(res, {
    statusCode: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}
