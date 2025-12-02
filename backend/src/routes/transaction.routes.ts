import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { transactionController } from '../controllers/transaction.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/transactions - Get user transactions
router.get('/', asyncHandler(transactionController.getUserTransactions.bind(transactionController)));

// GET /api/transactions/summary - Get transaction summary
router.get('/summary', asyncHandler(transactionController.getTransactionSummary.bind(transactionController)));

// POST /api/transactions/deposit - Request deposit
router.post('/deposit', asyncHandler(transactionController.createDeposit.bind(transactionController)));

// GET /api/transactions/deposits - Get deposit history
router.get('/deposits', asyncHandler(transactionController.getUserDeposits.bind(transactionController)));

// POST /api/transactions/withdraw - Request withdrawal
router.post('/withdraw', asyncHandler(transactionController.createWithdrawal.bind(transactionController)));

// GET /api/transactions/withdrawals - Get withdrawal history
router.get('/withdrawals', asyncHandler(transactionController.getUserWithdrawals.bind(transactionController)));

export default router;