import { Router } from 'express';
import { dashboardController } from './dashboard.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';

const router = Router();

router.use(requireAuth);

router.get('/stats', dashboardController.getStats);

export default router;