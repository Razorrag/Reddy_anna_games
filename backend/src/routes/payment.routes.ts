import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, authorize } from '../middleware/auth';
import { paymentController } from '../controllers/payment.controller';

const router = Router();

// Public routes
// GET /api/payments/settings - Get payment settings (WhatsApp, UPI)
router.get('/settings', asyncHandler(paymentController.getPaymentSettings.bind(paymentController)));

// Protected user routes
router.use(authenticate);

// ========== DEPOSIT ROUTES ==========

// POST /api/payments/deposit - Create deposit request
router.post('/deposit', asyncHandler(paymentController.createDepositRequest.bind(paymentController)));

// POST /api/payments/deposit/:depositId/screenshot - Upload payment screenshot
router.post('/deposit/:depositId/screenshot', asyncHandler(paymentController.uploadDepositScreenshot.bind(paymentController)));

// GET /api/payments/deposit/history - Get deposit history
router.get('/deposit/history', asyncHandler(paymentController.getDepositHistory.bind(paymentController)));

// ========== WITHDRAWAL ROUTES ==========

// POST /api/payments/withdrawal - Request withdrawal
router.post('/withdrawal', asyncHandler(paymentController.requestWithdrawal.bind(paymentController)));

// GET /api/payments/withdrawal/history - Get withdrawal history
router.get('/withdrawal/history', asyncHandler(paymentController.getWithdrawalHistory.bind(paymentController)));

// ========== ADMIN ROUTES ==========

// GET /api/payments/admin/deposits/pending - Get pending deposits
router.get('/admin/deposits/pending', authorize('admin'), asyncHandler(paymentController.getPendingDeposits.bind(paymentController)));

// POST /api/payments/admin/deposits/:depositId/approve - Approve deposit
router.post('/admin/deposits/:depositId/approve', authorize('admin'), asyncHandler(paymentController.approveDeposit.bind(paymentController)));

// POST /api/payments/admin/deposits/:depositId/reject - Reject deposit
router.post('/admin/deposits/:depositId/reject', authorize('admin'), asyncHandler(paymentController.rejectDeposit.bind(paymentController)));

// GET /api/payments/admin/withdrawals/pending - Get pending withdrawals
router.get('/admin/withdrawals/pending', authorize('admin'), asyncHandler(paymentController.getPendingWithdrawals.bind(paymentController)));

// POST /api/payments/admin/withdrawals/:withdrawalId/approve - Approve withdrawal
router.post('/admin/withdrawals/:withdrawalId/approve', authorize('admin'), asyncHandler(paymentController.approveWithdrawal.bind(paymentController)));

// POST /api/payments/admin/withdrawals/:withdrawalId/reject - Reject withdrawal
router.post('/admin/withdrawals/:withdrawalId/reject', authorize('admin'), asyncHandler(paymentController.rejectWithdrawal.bind(paymentController)));

export default router;