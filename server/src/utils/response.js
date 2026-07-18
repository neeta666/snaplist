// Standard response envelope helper.
//
// Per the API Contract Specification (section 0.2), every endpoint returns
// one of exactly two shapes — success or error — with no exceptions. Rather
// than trusting every controller to hand-build that shape correctly, we
// centralize it here. Controllers call `sendSuccess`/`sendError` instead of
// `res.json(...)` directly, so the envelope can never drift accidentally.

export function sendSuccess(res, { statusCode = 200, message = 'Success', data = null } = {}) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function sendError(res, { statusCode = 500, message = 'Something went wrong', errors = [] } = {}) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}
