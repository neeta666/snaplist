import { Router } from 'express';
import { listingController } from './listing.controller.js';
import {
  validateListingId,
  validateListingQuery,
  validateSaveListing,
  validateUpdateListing,
} from './listing.validation.js';
import { requireAuth } from '../../middleware/requireAuth.js';

const router = Router();

// Every listings endpoint is protected.
router.use(requireAuth);

router.post('/', validateSaveListing, listingController.create);

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