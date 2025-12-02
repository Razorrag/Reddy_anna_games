import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, authorize } from '../middleware/auth';
import notificationRoutes from './admin/notification.routes';
import { adminController } from '../controllers/admin.controller';

const router = Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

// Mount notification routes
router.use('/notifications', notificationRoutes);

// GET /api/admin/dashboard - Get admin dashboard stats
router.get('/dashboard', asyncHandler(adminController.getDashboard.bind(adminController)));

// GET /api/admin/users - Get all users
router.get('/users', asyncHandler(adminController.getUsers.bind(adminController)));

// GET /api/admin/users/:id - Get user details
router.get('/users/:id', asyncHandler(adminController.getUser.bind(adminController)));

// PUT /api/admin/users/:id - Update user
router.put('/users/:id', asyncHandler(adminController.updateUser.bind(adminController)));

// PUT /api/admin/users/:id/status - Update user status
router.put('/users/:id/status', asyncHandler(adminController.updateUserStatus.bind(adminController)));

// GET /api/admin/games - Get all games
router.get('/games', asyncHandler(adminController.getGames.bind(adminController)));

// GET /api/admin/games/:id - Get game details
router.get('/games/:id', asyncHandler(adminController.getGame.bind(adminController)));

// GET /api/admin/transactions - Get transactions
router.get('/transactions', asyncHandler(adminController.getTransactions.bind(adminController)));

// PUT /api/admin/transactions/:id - Update transaction (approve/reject)
router.put('/transactions/:id', asyncHandler(adminController.updateTransaction.bind(adminController)));

// GET /api/admin/analytics - Get analytics data
router.get('/analytics', asyncHandler(adminController.getAnalytics.bind(adminController)));

// GET /api/admin/settings - Get system settings
router.get('/settings', asyncHandler(adminController.getSettings.bind(adminController)));

// PUT /api/admin/settings - Update system settings
router.put('/settings', asyncHandler(adminController.updateSettings.bind(adminController)));

// GET /api/admin/stream/config - Get stream configuration
router.get('/stream/config', asyncHandler(async (req, res) => {
  const config = {
    streamUrl: process.env.STREAM_URL || 'wss://localhost:3333/app/stream',
    loopVideoUrl: '/shared/uhd_30fps.mp4',
    isStreamActive: true,
    fakeViewers: { min: 2500, max: 3500 }
  };
  res.json(config);
}));

// POST /api/admin/stream/pause - Pause stream
router.post('/stream/pause', asyncHandler(async (req, res) => {
  const { gameId, reason, duration } = req.body;
  
  // Get Socket.IO instance from app
  const io = req.app.get('io');
  if (io) {
    io.to(`game:${gameId}`).emit('stream:paused', {
      reason: reason || 'Stream paused by admin',
      duration: duration || null,
      timestamp: new Date()
    });
  }
  
  res.json({
    success: true,
    message: 'Stream paused successfully',
    gameId,
    reason
  });
}));

// POST /api/admin/stream/resume - Resume stream
router.post('/stream/resume', asyncHandler(async (req, res) => {
  const { gameId } = req.body;
  
  // Get Socket.IO instance from app
  const io = req.app.get('io');
  if (io) {
    io.to(`game:${gameId}`).emit('stream:resumed', {
      timestamp: new Date()
    });
  }
  
  res.json({
    success: true,
    message: 'Stream resumed successfully',
    gameId
  });
}));

// POST /api/admin/stream/loop-mode - Toggle loop mode
router.post('/stream/loop-mode', asyncHandler(async (req, res) => {
  const { gameId, enabled, resumeDate, message } = req.body;
  
  // Get Socket.IO instance from app
  const io = req.app.get('io');
  if (io) {
    io.to(`game:${gameId}`).emit('stream:loop-mode', {
      enabled,
      resumeDate,
      message: message || (enabled
        ? `Stream will resume on ${resumeDate}`
        : 'Live stream active')
    });
  }
  
  res.json({
    success: true,
    message: 'Loop mode toggled successfully',
    enabled
  });
}));

export default router;