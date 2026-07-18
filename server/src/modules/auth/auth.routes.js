// Auth module — route placeholder.
//
// Per Slice 0 scope, no authentication endpoints are implemented yet.
// Register/Login/Me/Logout (per the API Contract, section 2) arrive in
// Slice 1. This file exists now so the module boundary and the routing
// skeleton's mount point are already in place, and so Slice 1 only has to
// add routes here rather than wire up the module from scratch.

import { Router } from 'express';

const router = Router();

// Intentionally empty in Slice 0. Slice 1 adds:
//   router.post('/register', validateRegister, authController.register);
//   router.post('/login', validateLogin, authController.login);
//   router.get('/me', requireAuth, authController.getCurrentUser);
//   router.post('/logout', requireAuth, authController.logout);

export default router;
