// Users module — repository placeholder.
//
// Per the Technical Design Document, `users` is a lightweight module holding
// the User model and its repository; it has no routes/controller of its own
// in this API — `/auth/me` (owned by the auth module) is what exposes
// current-user data. This file is the only Slice 0 placeholder for `users`,
// matching that scope. The Mongoose User model and real queries are added in
// Slice 1, alongside auth.

export const userRepository = {
  // async create({ name, email, passwordHash }) {}
  // async findByEmail(email) {}
  // async findById(id) {}
};
