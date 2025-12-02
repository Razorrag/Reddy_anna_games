import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service';
import { AppError } from '../middleware/errorHandler';

export class PaymentController {
  // ========== DEPOSIT ENDPOINTS ==========

  // Get payment settings (WhatsApp number, UPI ID)
  async getPaymentSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await paymentService.getPaymentSettings();

      res.json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  }

  // Create deposit request
  async createDepositRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const {
        amount,
        paymentScreenshot,
        transactionId,
        paymentMethod,
        notes,
      } = req.body;

      if (!amount || amount <= 0) {
        throw new AppError('Invalid amount', 400);
      }

      if (!paymentMethod || !['upi', 'bank_transfer', 'other'].includes(paymentMethod)) {
        throw new AppError('Invalid payment method', 400);
      }

      const result = await paymentService.createDepositRequest(userId, {
        amount: parseFloat(amount),
        paymentScreenshot,
        transactionId,
        paymentMethod,
        notes,
      });

      res.status(201).json({
        success: true,
        message: 'Deposit request created. Please send payment screenshot to WhatsApp.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Upload payment screenshot
  async uploadDepositScreenshot(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { depositId } = req.params;
      const { screenshot } = req.body;

      if (!screenshot) {
        throw new AppError('Screenshot required', 400);
      }

      const result = await paymentService.updateDepositScreenshot(
        depositId,
        userId,
        screenshot
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get deposit history
  async getDepositHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { limit = '50', offset = '0' } = req.query;

      const deposits = await paymentService.getDepositHistory(
        userId,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.json({
        success: true,
        data: deposits,
      });
    } catch (error) {
      next(error);
    }
  }

  // ========== WITHDRAWAL ENDPOINTS ==========

  // Request withdrawal
  async requestWithdrawal(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const {
        amount,
        withdrawalMethod,
        bankAccountName,
        bankAccountNumber,
        bankIfscCode,
        upiId,
      } = req.body;

      if (!amount || amount <= 0) {
        throw new AppError('Invalid amount', 400);
      }

      if (!withdrawalMethod || !['bank_transfer', 'upi'].includes(withdrawalMethod)) {
        throw new AppError('Invalid withdrawal method', 400);
      }

      if (withdrawalMethod === 'bank_transfer') {
        if (!bankAccountName || !bankAccountNumber || !bankIfscCode) {
          throw new AppError('Bank details required', 400);
        }
      }

      if (withdrawalMethod === 'upi' && !upiId) {
        throw new AppError('UPI ID required', 400);
      }

      const result = await paymentService.requestWithdrawal(
        userId,
        parseFloat(amount),
        {
          withdrawalMethod,
          bankAccountName,
          bankAccountNumber,
          bankIfscCode,
          upiId,
        }
      );

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get withdrawal history
  async getWithdrawalHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { limit = '50', offset = '0' } = req.query;

      const withdrawals = await paymentService.getWithdrawalHistory(
        userId,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.json({
        success: true,
        data: withdrawals,
      });
    } catch (error) {
      next(error);
    }
  }

  // ========== ADMIN ENDPOINTS ==========

  // Get pending deposits
  async getPendingDeposits(req: Request, res: Response, next: NextFunction) {
    try {
      const deposits = await paymentService.getPendingDeposits();

      res.json({
        success: true,
        data: deposits,
      });
    } catch (error) {
      next(error);
    }
  }

  // Approve deposit
  async approveDeposit(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = req.user?.userId;
      if (!adminId) {
        throw new AppError('Unauthorized', 401);
      }

      const { depositId } = req.params;

      const result = await paymentService.approveDeposit(depositId, adminId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Reject deposit
  async rejectDeposit(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = req.user?.userId;
      if (!adminId) {
        throw new AppError('Unauthorized', 401);
      }

      const { depositId } = req.params;
      const { reason } = req.body;

      if (!reason) {
        throw new AppError('Rejection reason required', 400);
      }

      const result = await paymentService.rejectDeposit(depositId, adminId, reason);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get pending withdrawals
  async getPendingWithdrawals(req: Request, res: Response, next: NextFunction) {
    try {
      const withdrawals = await paymentService.getPendingWithdrawals();

      res.json({
        success: true,
        data: withdrawals,
      });
    } catch (error) {
      next(error);
    }
  }

  // Approve withdrawal
  async approveWithdrawal(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = req.user?.userId;
      if (!adminId) {
        throw new AppError('Unauthorized', 401);
      }

      const { withdrawalId } = req.params;
      const { transactionId } = req.body; // Optional: admin's transaction ID after payment

      const result = await paymentService.approveWithdrawal(
        withdrawalId,
        adminId,
        transactionId
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Reject withdrawal
  async rejectWithdrawal(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = req.user?.userId;
      if (!adminId) {
        throw new AppError('Unauthorized', 401);
      }

      const { withdrawalId } = req.params;
      const { reason } = req.body;

      if (!reason) {
        throw new AppError('Rejection reason required', 400);
      }

      const result = await paymentService.rejectWithdrawal(
        withdrawalId,
        adminId,
        reason
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();