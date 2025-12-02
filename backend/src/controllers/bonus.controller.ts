import { Request, Response, NextFunction } from 'express';
import { bonusService } from '../services/bonus.service';
import { AppError } from '../middleware/errorHandler';

export class BonusController {
  // Get user's bonuses
  async getUserBonuses(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError('Unauthorized', 401);

      const bonuses = await bonusService.getUserBonuses(userId);
      res.json({ success: true, data: bonuses });
    } catch (error) {
      next(error);
    }
  }

  // Get active bonuses
  async getActiveBonuses(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError('Unauthorized', 401);

      const bonuses = await bonusService.getActiveBonuses(userId);
      res.json({ success: true, data: bonuses });
    } catch (error) {
      next(error);
    }
  }

  // Get bonus statistics
  async getBonusStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError('Unauthorized', 401);

      // Get active bonuses and calculate stats
      const bonuses = await bonusService.getUserBonuses(userId);
      const activeBonuses = bonuses.filter((b: any) => b.status === 'active');
      const totalAmount = bonuses.reduce((sum: number, b: any) => sum + parseFloat(b.amount), 0);

      res.json({
        success: true,
        data: {
          totalBonuses: bonuses.length,
          activeBonuses: activeBonuses.length,
          totalAmount,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get bonus history
  async getBonusHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError('Unauthorized', 401);

      const bonuses = await bonusService.getUserBonuses(userId);
      res.json({ success: true, data: bonuses });
    } catch (error) {
      next(error);
    }
  }

  // Unlock bonus
  async unlockBonus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError('Unauthorized', 401);

      const { bonusId } = req.params;
      const bonus = await bonusService.unlockBonus(bonusId);
      res.json({ success: true, data: bonus });
    } catch (error) {
      next(error);
    }
  }

  // ========== ADMIN ENDPOINTS ==========

  // Get all bonuses
  async getAllBonuses(req: Request, res: Response, next: NextFunction) {
    try {
      const bonuses = await bonusService.getActiveBonuses(''); // Get all active
      res.json({ success: true, data: bonuses });
    } catch (error) {
      next(error);
    }
  }

  // Create custom bonus
  async createCustomBonus(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, bonusType, amount, wageringMultiplier, expiryDays } = req.body;

      if (!userId || !amount) throw new AppError('Missing required fields', 400);

      const bonus = await bonusService.createSignupBonus(userId);

      res.status(201).json({ success: true, data: bonus });
    } catch (error) {
      next(error);
    }
  }

  // Create cashback bonus
  async createCashbackBonus(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, amount, expiryDays } = req.body;

      if (!userId || !amount) throw new AppError('Missing required fields', 400);

      const bonus = await bonusService.createSignupBonus(userId);

      res.status(201).json({ success: true, data: bonus });
    } catch (error) {
      next(error);
    }
  }

  // Cancel bonus
  async cancelBonus(req: Request, res: Response, next: NextFunction) {
    try {
      const { bonusId } = req.params;
      const bonus = await bonusService.cancelBonus(bonusId);
      res.json({ success: true, data: bonus });
    } catch (error) {
      next(error);
    }
  }

  // Expire old bonuses
  async expireOldBonuses(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await bonusService.checkExpiredBonuses();
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // Create deposit bonus (alias)
  async createDepositBonus(req: Request, res: Response, next: NextFunction) {
    return this.createCustomBonus(req, res, next);
  }

  // Cancel expired bonuses (alias)
  async cancelExpiredBonuses(req: Request, res: Response, next: NextFunction) {
    return this.expireOldBonuses(req, res, next);
  }
}

export const bonusController = new BonusController();
