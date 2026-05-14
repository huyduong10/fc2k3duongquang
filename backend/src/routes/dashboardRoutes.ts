import { Router } from 'express';
import { getDashboardStats, getPublicDashboard } from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/public', getPublicDashboard);
router.get('/stats', protect, getDashboardStats);

export default router;
