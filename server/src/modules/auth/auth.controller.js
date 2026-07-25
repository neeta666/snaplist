// Auth module — controller.
//
// Per the Technical Design Document (section 4), controllers parse the
// request, call the appropriate service method, and shape the HTTP
// response. No business logic lives here — that's all in auth.service.js.
//
// These handlers are plain async functions with no try/catch: this project
// runs on Express 5 (see server/package.json), which natively forwards a
// rejected promise from an async route handler to the error-handling
// middleware — there is no need to manually call next(err) here. Any error
// thrown by authService (e.g. AppError for a duplicate email or bad
// credentials) propagates automatically to errorHandler.js.

import { authService } from './auth.service.js';
import { sendSuccess } from '../../utils/response.js';

export const authController = {
  async register(req, res) {
    const { name, email, password } = req.body;
    const { user, token } = await authService.register({ name, email, password });
    return sendSuccess(res, {
      statusCode: 201,
      message: 'Account created successfully',
      data: { user, token },
    });
  },

  async login(req, res) {
    const { email, password } = req.body;
    const { user, token } = await authService.login({ email, password });
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Logged in successfully',
      data: { user, token },
    });
  },

  async getCurrentUser(req, res) {
    // No service call here, deliberately: requireAuth has already fetched
    // this exact user (including createdAt) as part of verifying the
    // token. Calling back into the database again here would just repeat
    // that same lookup. This is response-shaping from already-resolved
    // data, not business logic, so it stays in the controller per the
    // Technical Design Document (section 4).
    const { id, name, email, createdAt } = req.user;
    return sendSuccess(res, {
      statusCode: 200,
      message: 'User fetched successfully',
      data: { user: { id, name, email, createdAt } },
    });
  },

  async logout(req, res) {
    // Per ADR 9, JWTs are stateless in V1 — there is no server-side session
    // to invalidate. This endpoint exists purely for API Contract
    // consistency (section 2.4); the actual logout is the frontend
    // discarding its token.
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Logged out successfully',
      data: null,
    });
  },
};