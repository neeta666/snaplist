import { Router } from 'express';
import { listingController } from './listing.controller.js';
import {
  validateListingId,
  validateListingQuery,
  validateSaveListing,
  validateUpdateListing,
  validateGenerateListing,
} from './listing.validation.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { aiGenerationRateLimiter } from '../../middleware/aiGenerationRateLimiter.js';
import { uploadImageMiddleware } from '../../middleware/uploadImageMiddleware.js';

const router = Router();

// Every listings endpoint is protected.
router.use(requireAuth);

router.post('/', validateSaveListing, listingController.create);

// Must come before /:id so "generate" is never parsed as a listing ID.
router.post(
  '/generate',
  aiGenerationRateLimiter,
  uploadImageMiddleware,
  validateGenerateListing,
  listingController.generateDraft
);

router.get('/', validateListingQuery, listingController.getAll);

router.get(
  '/:id',
  validateListingId,
  listingController.getById
);

router.patch(
  '/:id',
  validateListingId,
  validateUpdateListing,
  listingController.update
);

router.delete(
  '/:id',
  validateListingId,
  listingController.remove
);

export default router;