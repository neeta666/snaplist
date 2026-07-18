// Health-check route — the one real endpoint in Slice 0.
//
// Purpose: let the deployed frontend (and a human checking Render) confirm
// the API is up and can see its own DB connection state, before any real
// feature exists. Deliberately unauthenticated and outside the `/v1` API
// contract's resource endpoints, since it isn't part of the business API
// surface described in the API Contract Specification.

import { Router } from 'express';
import { sendSuccess } from '../utils/response.js';
import { getDbStatus } from '../config/db.js';

const router = Router();

router.get('/', (req, res) => {
  return sendSuccess(res, {
    statusCode: 200,
    message: 'SnapList API is running',
    data: {
      status: 'ok',
      database: getDbStatus(),
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
