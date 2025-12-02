import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, authorize } from '../middleware/auth';
import { partnerController } from '../controllers/partner.controller';

const router = Router();

// Public routes
// POST /api/partners/register - Register as partner
router.post('/register', authenticate, asyncHandler(partnerController.register.bind(partnerController)));

// POST /api/partners/login - Partner login
router.post('/login', asyncHandler(partnerController.login.bind(partnerController)));

// Protected partner routes
router.use(authenticate);

// GET /api/partners/profile - Get partner profile
router.get('/profile', authorize('partner', 'admin'), asyncHandler(partnerController.getProfile.bind(partnerController)));

// PUT /api/partners/profile - Update partner profile
router.put('/profile', authorize('partner', 'admin'), asyncHandler(partnerController.updateProfile.bind(partnerController)));

// GET /api/partners/statistics - Get partner statistics
router.get('/statistics', authorize('partner', 'admin'), asyncHandler(partnerController.getStatistics.bind(partnerController)));

// GET /api/partners/commissions - Get partner commissions
router.get('/commissions', authorize('partner', 'admin'), asyncHandler(partnerController.getCommissions.bind(partnerController)));

// GET /api/partners/referrals - Get referred players
router.get('/referrals', authorize('partner', 'admin'), asyncHandler(partnerController.getReferredPlayers.bind(partnerController)));

// POST /api/partners/withdraw - Request commission withdrawal
router.post('/withdraw', authorize('partner', 'admin'), asyncHandler(partnerController.requestWithdrawal.bind(partnerController)));

// Admin routes
// GET /api/partners - Get all partners
router.get('/', authorize('admin'), asyncHandler(partnerController.getAllPartners.bind(partnerController)));

// POST /api/partners/:partnerId/approve - Approve partner
router.post('/:partnerId/approve', authorize('admin'), asyncHandler(partnerController.approvePartner.bind(partnerController)));

// POST /api/partners/:partnerId/deactivate - Deactivate partner
router.post('/:partnerId/deactivate', authorize('admin'), asyncHandler(partnerController.deactivatePartner.bind(partnerController)));

// POST /api/partners/commissions/:commissionId/pay - Pay commission
router.post('/commissions/:commissionId/pay', authorize('admin'), asyncHandler(partnerController.payCommission.bind(partnerController)));

export default router;