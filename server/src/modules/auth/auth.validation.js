// Auth module — validation.
//
// Per the Technical Design Document (section 4), this layer checks request
// shape/type before a request ever reaches a controller, and never touches
// the database or providers. Schemas below encode the exact rules from the
// API Contract (section 2): name 2–60 chars, email must be a valid email,
// password min 8 chars with at least one number (register only — login just
// requires both fields to be present, per the Contract's note that login
// validation should not add format leniency that reveals which field was
// wrong).
//
// Email normalization (trim + lowercase) happens here via Zod as the FIRST
// layer, and again at the Mongoose schema level (user.model.js) as a SECOND,
// independent layer — see that file's comment for why both exist rather
// than relying on just one.
//
// On success, `req.body` is replaced with the parsed/transformed data (so
// the normalized email reaches the controller/service), not just validated
// and left alone — this guarantees downstream code always sees the
// normalized form, not whatever the client originally sent.

import { z } from 'zod';
import { sendError } from '../../utils/response.js';

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60, 'Name must be at most 60 characters'),
  email: z.string().trim().toLowerCase().min(1, 'Email is required').email('Email must be a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/\d/, 'Password must contain at least one number'),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, 'Email is required').email('Email must be a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Converts a Zod safeParse failure into the API Contract's error array shape:
// [{ field, message }, ...]. Kept local to this file for now since auth is
// the only module with real validation so far; if the listings module
// (Slice 3+) needs the same conversion, this is a reasonable candidate to
// extract into a shared utils/validation.js at that point.
function zodIssuesToErrors(issues) {
  return issues.map((issue) => ({
    field: issue.path.join('.') || 'body',
    message: issue.message,
  }));
}

export function validateRegister(req, res, next) {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, {
      statusCode: 422,
      message: 'Validation failed',
      errors: zodIssuesToErrors(result.error.issues),
    });
  }
  req.body = result.data;
  return next();
}

export function validateLogin(req, res, next) {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, {
      statusCode: 422,
      message: 'Validation failed',
      errors: zodIssuesToErrors(result.error.issues),
    });
  }
  req.body = result.data;
  return next();
}