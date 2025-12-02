import { Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { AuthRequest } from '../middleware/auth';

export class UserController {
  // Get current user profile
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const user = await userService.getUserById(userId);

      res.json({ user });
    } catch (error) {
      next(error);
    }
  }

  // Get user statistics
  async getStatistics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const statistics = await userService.getUserStatistics(userId);

      res.json({ statistics });
    } catch (error) {
      next(error);
    }
  }

  // Update user profile
  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { fullName, phoneNumber, email } = req.body;

      const updatedUser = await userService.updateProfile(userId, {
        fullName,
        phoneNumber,
        email,
      });

      res.json({
        message: 'Profile updated successfully',
        user: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user balance
  async getBalance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const balance = await userService.getBalance(userId);

      res.json({ balance });
    } catch (error) {
      next(error);
    }
  }

  // Get transaction history
  async getTransactionHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const transactions = await userService.getTransactionHistory(userId, limit, offset);

      res.json({ transactions });
    } catch (error) {
      next(error);
    }
  }

  // Get referred users
  async getReferredUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const referredUsers = await userService.getReferredUsers(userId);

      res.json({ referredUsers });
    } catch (error) {
      next(error);
    }
  }

  // Deactivate account
  async deactivateAccount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      await userService.deactivateAccount(userId);

      res.json({ message: 'Account deactivated successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();