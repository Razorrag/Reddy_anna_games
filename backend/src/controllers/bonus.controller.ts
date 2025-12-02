import { Request, Response, NextFunction } from 'express';
import { bonusService } from '../services/bonus.service';
import { AppError } from '../middleware/errorHandler';

export class BonusController {
  // Get user's bonuses
  async getUserBonuses(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const bonuses = await bonusService.getUserBonuses(userId);

      res.json({
        success: true,
        data: bonuses,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get active bonuses
  async getActiveBonuses(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const bonuses = await bonusService.getActiveBonuses(userId);

      res.json({
        success: true,
        data: bonuses,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get bonus statistics
  async getBonusStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const statistics = await bonusService.getUserBonusStatistics(userId);

      res.json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get bonus history
  async getBonusHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { bonusType, status, limit = '50', offset = '0' } = req.query;

      const filters: any = {};
      if (bonusType) filters.bonusType = bonusType as string;
      if (status) filters.status = status as string;

      const result = await bonusService.getBonusHistory(
        userId,
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.json({
        success: true,
        data: result.bonuses,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // Unlock bonus (manual trigger, normally auto-unlocked)
  async unlockBonus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { bonusId } = req.params;

      // Verify bonus belongs to user
      const bonus = await bonusService.getBonusById(bonusId);
      if (bonus.userId !== userId) {
        throw new AppError('Unauthorized', 403);
      }

      const result = await bonusService.unlockBonus(bonusId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Get all bonuses
  async getAllBonuses(req: Request, res: Response, next: NextFunction) {
    try {
      const { bonusType, status, userId } = req.query;

      const filters: any = {};
      if (bonusType) filters.bonusType = bonusType as string;
      if (status) filters.status = status as string;
      if (userId) filters.userId = userId as string;

      const bonuses = await bonusService.getAllBonuses(filters);

      res.json({
        success: true,
        data: bonuses,
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Create custom bonus
  async createCustomBonus(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, amount, wageringMultiplier, description, expiryDays } = req.body;

      if (!userId || !amount || !wageringMultiplier || !expiryDays) {
        throw new AppError('Missing required fields', 400);
      }

      const bonus = await bonusService.createCustomBonus({
        userId,
        amount: parseFloat(amount),
        wageringMultiplier: parseFloat(wageringMultiplier),
        description,
        expiryDays: parseInt(expiryDays),
      });

      res.status(201).json({
        success: true,
        message: 'Custom bonus created successfully',
        data: bonus,
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Create deposit bonus
  async createDepositBonus(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, depositAmount, bonusPercentage = 10 } = req.body;

      if (!userId || !depositAmount) {
        throw new AppError('Missing required fields', 400);
      }

      const bonus = await bonusService.createDepositBonus(
        userId,
        parseFloat(depositAmount),
        parseFloat(bonusPercentage)
      );

      res.status(201).json({
        success: true,
        message: 'Deposit bonus created successfully',
        data: bonus,
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Create cashback bonus
  async createCashbackBonus(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, lossAmount, cashbackPercentage = 5 } = req.body;

      if (!userId || !lossAmount) {
        throw new AppError('Missing required fields', 400);
      }

      const bonus = await bonusService.createCashbackBonus(
        userId,
        parseFloat(lossAmount),
        parseFloat(cashbackPercentage)
      );

      res.status(201).json({
        success: true,
        message: 'Cashback bonus created successfully',
        data: bonus,
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Cancel bonus
  async cancelBonus(req: Request, res: Response, next: NextFunction) {
    try {
      const { bonusId } = req.params;
      const { reason } = req.body;

      const bonus = await bonusService.cancelBonus(bonusId, reason);

      res.json({
        success: true,
        message: 'Bonus cancelled successfully',
        data: bonus,
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Cancel expired bonuses (cron job endpoint)
  async cancelExpiredBonuses(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await bonusService.cancelExpiredBonuses();

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const bonusController = new BonusController();