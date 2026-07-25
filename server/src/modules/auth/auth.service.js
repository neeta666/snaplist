// Auth module — service.
//
// Per the Technical Design Document (section 4), this is where all business
// logic lives: password hashing, JWT issuance/verification, and credential
// checks. This file never touches HTTP req/res objects (that's the
// controller's job) and never queries the database directly (that's the
// repository's job) — it only orchestrates userRepository + bcrypt + jwt.
//
// Response shaping: every function here returns a `user` object built from
// an explicit allow-list of fields (`id`, `name`, `email`, and `createdAt`
// where relevant) — never by spreading or returning the raw Mongoose
// document. This is the second half of the "passwordHash is never returned"
// guarantee; the first half is the model's `select: false` (user.model.js).

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userRepository } from '../users/user.repository.js';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/AppError.js';

const SALT_ROUNDS = 10;

function toSafeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
  };
}

function issueToken(user) {
  return jwt.sign({ sub: user._id.toString() }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

export const authService = {
  async register({ name, email, password }) {
    // Email is already normalized (trimmed + lowercased) by the validation
    // layer before this is called, and again enforced at the schema level —
    // this lookup relies on that normalization being consistent so the
    // uniqueness check and the eventual stored document agree on the same
    // email string.
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      // Per the API Contract (section 2.1): 409 for a duplicate email.
      throw new AppError('Email already registered', 409);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userRepository.create({ name, email, passwordHash });

    const token = issueToken(user);
    return { user: toSafeUser(user), token };
  },

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);

    // Per the API Contract (section 2.2): a single generic 401 for both
    // "no such user" and "wrong password" — never reveal which one it was.
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = issueToken(user);
    return { user: toSafeUser(user), token };
  },

  // Note: there is deliberately no getCurrentUser method here. GET /auth/me
  // is served entirely from req.user, which requireAuth already populates
  // (including createdAt) via the one DB lookup every protected request
  // already performs to verify the token. Adding a second lookup here would
  // just re-fetch the same document the middleware already has — see
  // requireAuth.js and auth.controller.js.
};