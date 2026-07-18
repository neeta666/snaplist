// Auth module — service placeholder.
//
// Per the Technical Design Document (section 4), services hold all business
// logic (password hashing, JWT issuance/verification, credential checks) and
// orchestrate repositories. They must never know about HTTP req/res objects.
// Implemented in Slice 1, alongside the User model/repository.

export const authService = {
  // async register({ name, email, password }) {}
  // async login({ email, password }) {}
  // async getCurrentUser(userId) {}
};
