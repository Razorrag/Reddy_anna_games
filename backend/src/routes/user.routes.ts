import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { userController } from '../controllers/user.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/users/profile - Get user profile
router.get('/profile', asyncHandler(userController.getProfile.bind(userController)));

// PUT /api/users/profile - Update user profile
router.put('/profile', asyncHandler(userController.updateProfile.bind(userController)));

// GET /api/users/balance - Get user balance
router.get('/balance', asyncHandler(userController.getBalance.bind(userController)));

// GET /api/users/statistics - Get user statistics
router.get('/statistics', asyncHandler(userController.getStatistics.bind(userController)));

// GET /api/users/transactions - Get transaction history
router.get('/transactions', asyncHandler(userController.getTransactionHistory.bind(userController)));

// GET /api/users/referrals - Get referred users
router.get('/referrals', asyncHandler(userController.getReferredUsers.bind(userController)));

// GET /api/users/game-history - Get user game history
router.get('/game-history', asyncHandler(async (req, res) => {
  const userId = (req as any).user.id;
  const limit = parseInt(req.query.limit as string) || 10;
  
  const { gameService } = await import('../services/game.service');
  const history = await gameService.getUserGameHistory(userId, limit);
  
  res.json({
    success: true,
    data: { games: history }
  });
}));

// POST /api/users/deactivate - Deactivate account
router.post('/deactivate', asyncHandler(userController.deactivateAccount.bind(userController)));

export default router;