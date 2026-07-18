// Central routing skeleton.
//
// This is the one place that wires module routers into the app, so app.js
// itself doesn't need to know about individual modules. Per the API
// Contract's versioning strategy (section 9), all business-API routes are
// mounted under /api/v1; the health check is deliberately mounted outside
// that prefix since it isn't part of the versioned business API surface.

import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from '../modules/auth/auth.routes.js';
import listingRoutes from '../modules/listings/listing.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/listings', listingRoutes);

// Dashboard routes are added in Slice 6, mounted the same way:
// router.use('/api/v1/dashboard', dashboardRoutes);

export default router;
