import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, authorize } from '../middleware/auth';
import { bonusController } from '../controllers/bonus.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// User routes
// GET /api/bonuses - Get user's bonuses
router.get('/', asyncHandler(bonusController.getUserBonuses.bind(bonusController)));

// GET /api/bonuses/active - Get active bonuses
router.get('/active', asyncHandler(bonusController.getActiveBonuses.bind(bonusController)));

// GET /api/bonuses/statistics - Get bonus statistics
router.get('/statistics', asyncHandler(bonusController.getBonusStatistics.bind(bonusController)));

// GET /api/bonuses/history - Get bonus history
router.get('/history', asyncHandler(bonusController.getBonusHistory.bind(bonusController)));

// POST /api/bonuses/:bonusId/unlock - Unlock bonus
router.post('/:bonusId/unlock', asyncHandler(bonusController.unlockBonus.bind(bonusController)));

// Admin routes
// GET /api/bonuses/admin/all - Get all bonuses
router.get('/admin/all', authorize('admin'), asyncHandler(bonusController.getAllBonuses.bind(bonusController)));

// POST /api/bonuses/admin/create-custom - Create custom bonus
router.post('/admin/create-custom', authorize('admin'), asyncHandler(bonusController.createCustomBonus.bind(bonusController)));

// POST /api/bonuses/admin/create-deposit - Create deposit bonus
router.post('/admin/create-deposit', authorize('admin'), asyncHandler(bonusController.createDepositBonus.bind(bonusController)));

// POST /api/bonuses/admin/create-cashback - Create cashback bonus
router.post('/admin/create-cashback', authorize('admin'), asyncHandler(bonusController.createCashbackBonus.bind(bonusController)));

// POST /api/bonuses/admin/:bonusId/cancel - Cancel bonus
router.post('/admin/:bonusId/cancel', authorize('admin'), asyncHandler(bonusController.cancelBonus.bind(bonusController)));

// POST /api/bonuses/admin/cancel-expired - Cancel expired bonuses (cron job)
router.post('/admin/cancel-expired', authorize('admin'), asyncHandler(bonusController.cancelExpiredBonuses.bind(bonusController)));

export default router;