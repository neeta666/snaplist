// User model.
//
// Per the Technical Design Document (section 5): _id, email (unique,
// indexed), passwordHash, name, timestamps.
//
// Email normalization is enforced at two layers, not just one:
//   1. Zod validation (auth.validation.js) trims/lowercases on input.
//   2. This schema ALSO applies `trim: true` and `lowercase: true` directly,
//      so normalization holds even if a document is ever created through a
//      path that bypasses the Zod layer (e.g. a future admin script, a
//      migration, or a bug in the validation wiring). Two independent layers
//      of the same guarantee is intentional, not redundant.
//
// `passwordHash` uses `select: false` so it is excluded from query results
// by default — a query has to explicitly opt in with `.select('+passwordHash')`
// to retrieve it. This is a second line of defense (in addition to the
// service layer's explicit allow-list when building API responses) against
// ever accidentally leaking a password hash in a response.

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;