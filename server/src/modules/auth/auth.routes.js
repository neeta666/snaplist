// Auth module — routes.
//
// Wires the four endpoints from the API Contract (section 2) to their
// validation, rate-limiting, and auth middleware, and the controller.
//
// Login's middleware order is deliberate: loginRateLimiter runs BEFORE
// validateLogin. The rate limit is meant to throttle login *attempts*
// against an IP regardless of whether the request body turns out to be
// well-formed — a flood of malformed login requests should still count
// against the limit, not slip through validation first for free.

import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validateRegister, validateLogin } from './auth.validation.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { loginRateLimiter } from '../../middleware/loginRateLimiter.js';

const router = Router();

router.post('/register', validateRegister, authController.register);
router.post('/login', loginRateLimiter, validateLogin, authController.login);
router.get('/me', requireAuth, authController.getCurrentUser);
router.post('/logout', requireAuth, authController.logout);

export default router;