// Listings module — route placeholder.
//
// Per Slice 0 scope, no listing endpoints are implemented yet. Per the API
// Contract (section 3), this module will eventually expose:
//   POST   /listings/generate           (Slice 3)
//   POST   /listings                    (Slice 4)
//   GET    /listings                    (Slice 4)
//   GET    /listings/:id                (Slice 4)
//   PATCH  /listings/:id                (Slice 5)
//   DELETE /listings/:id                (Slice 5)
//   POST   /listings/:id/regenerate     (Slice 5)
// This file exists now purely as the routing skeleton's mount point.

import { Router } from 'express';

const router = Router();

// Intentionally empty in Slice 0.

export default router;
