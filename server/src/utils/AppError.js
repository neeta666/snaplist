// AppError — a minimal error class carrying an explicit HTTP status code.
//
// The centralized error handler (middleware/errorHandler.js) already reads
// `err.statusCode` off any thrown error to decide the response status —
// this class just gives services a clean, consistent way to throw errors
// that carry the right status code (e.g. 409 for a duplicate email, 401 for
// invalid credentials) instead of throwing plain Errors and hoping the
// message happens to be client-safe.
//
// Kept intentionally small: no error codes/subtypes yet, since only the
// auth module needs this so far. If later slices need more structure (e.g.
// distinguishing validation errors from not-found errors by type rather
// than just status code), this is a reasonable place to extend from.

export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}