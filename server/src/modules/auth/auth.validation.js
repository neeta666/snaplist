// Auth module — validation placeholder.
//
// Per the Technical Design Document (section 4), the validation layer checks
// request shape/type before a request ever reaches a controller, and never
// touches the database or providers. Real schemas (name/email/password rules
// per the API Contract, section 2) are added in Slice 1.

// No validators are implemented yet. This placeholder export exists only so
// the file is a valid, non-empty ES module (satisfying lint rules) without
// introducing any real validation logic ahead of Slice 1.
export const authValidation = {};

// export function validateRegister(req, res, next) {}
// export function validateLogin(req, res, next) {}
