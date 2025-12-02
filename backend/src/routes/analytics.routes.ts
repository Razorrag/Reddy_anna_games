import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, authorize } from '../middleware/auth';
import { analyticsController } from '../controllers/analytics.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/analytics/game - Get game analytics
router.get('/game', asyncHandler(analyticsController.getGameAnalytics.bind(analyticsController)));

// GET /api/analytics/user/:userId? - Get user analytics
router.get('/user/:userId?', asyncHandler(analyticsController.getUserAnalytics.bind(analyticsController)));

// GET /api/analytics/platform - Get platform overview (admin only)
router.get(
  '/platform',
  authorize('admin'),
  asyncHandler(analyticsController.getPlatformOverview.bind(analyticsController))
);

// GET /api/analytics/realtime - Get realtime statistics (admin only)
router.get(
  '/realtime',
  authorize('admin'),
  asyncHandler(analyticsController.getRealtimeStats.bind(analyticsController))
);

// GET /api/analytics/revenue - Get revenue trends (admin only)
router.get(
  '/revenue',
  authorize('admin'),
  asyncHandler(analyticsController.getRevenueTrends.bind(analyticsController))
);

export default router;