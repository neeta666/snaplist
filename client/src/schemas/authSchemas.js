// Frontend validation schemas for the auth forms.
//
// These intentionally mirror server/src/modules/auth/auth.validation.js
// rule-for-rule (name 2–60 chars, email format, password min 8 chars with
// at least one number for register; login just requires both fields to be
// present) — per the API Contract (section 2). Duplicating the rules on
// both sides is deliberate: the frontend schema exists purely for fast,
// pre-submit user feedback, while the backend schema remains the actual
// source of truth and re-validates independently on every request
// regardless of what the client already checked.
//
// Email is trimmed + lowercased here via the same `.trim().toLowerCase()`
// chain the backend uses, so an email with accidental leading/trailing
// whitespace (or mixed case) validates and submits consistently with what
// the backend will ultimately store — without this, a value the backend
// would happily accept after normalizing could fail frontend validation
// first and never reach the backend at all.
//
// This does NOT rewrite what the user sees in the input field. React Hook
// Form's registered inputs are uncontrolled: the resolver (zodResolver)
// only produces the transformed value used for the `values` object passed
// to `onSubmit`, and confirmed directly (by inspecting zodResolver's
// output) that it does not call setValue/reset to push that transformed
// value back into the DOM. So the user keeps seeing exactly what they
// typed, while the value actually submitted is the normalized one.

import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60, 'Name must be at most 60 characters'),
  email: z.string().trim().toLowerCase().min(1, 'Email is required').email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/\d/, 'Password must contain at least one number'),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});