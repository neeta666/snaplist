// Users module — repository.
//
// Per the Technical Design Document, `users` is a lightweight module holding
// the User model and its repository; it has no routes/controller of its own
// in this API — `/auth/me` (owned by the auth module) is what exposes
// current-user data.
//
// This is the only layer allowed to query the User model directly (per TDD
// section 4). `passwordHash` has `select: false` on the schema, so it is
// excluded from every query below by default; `findByEmail` is the one
// exception, since the auth service needs the hash to verify a login
// attempt — it opts back in explicitly with `.select('+passwordHash')`
// rather than the hash being available everywhere by default.

import User from './user.model.js';

export const userRepository = {
  async create({ name, email, passwordHash }) {
    const user = await User.create({ name, email, passwordHash });
    return user;
  },

  async findByEmail(email) {
    // Explicitly opts in to the normally-excluded passwordHash field, since
    // the auth service needs it to verify a login attempt's password.
    return User.findOne({ email }).select('+passwordHash');
  },

  async findById(id) {
    // passwordHash stays excluded here (default select: false behavior) —
    // this path is used for "get current user" style lookups that should
    // never need or return the hash.
    return User.findById(id);
  },
};