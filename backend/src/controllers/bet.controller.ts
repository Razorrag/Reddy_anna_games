import { Response, NextFunction } from 'express';
import { betService } from '../services/bet.service';
import { gameService } from '../services/game.service';
import { userService } from '../services/user.service';
import { AuthRequest } from '../middleware/auth';
import { Server as SocketIOServer } from 'socket.io';

export class BetController {
  // Place a bet
  async placeBet(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { roundId, betSide, amount } = req.body;

      // Validate input
      if (!roundId || !betSide || !amount) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (!['andar', 'bahar'].includes(betSide)) {
        return res.status(400).json({ error: 'Invalid bet side. Must be "andar" or "bahar"' });
      }

      // Service will emit bet:placed, round:stats_updated, and user:balance_updated events
      const bet = await betService.placeBet(userId, roundId, betSide, parseFloat(amount));

      res.status(201).json({
        message: 'Bet placed successfully',
        bet,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user bets
  async getUserBets(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const bets = await betService.getUserBets(userId, limit, offset);

      res.json({ bets });
    } catch (error) {
      next(error);
    }
  }

  // Get round bets (admin only)
  async getRoundBets(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { roundId } = req.params;
      const bets = await betService.getRoundBets(roundId);

      res.json({ bets });
    } catch (error) {
      next(error);
    }
  }

  // Cancel bet
  async cancelBet(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { betId } = req.params;

      // Cancel bet through service
      const bet = await betService.cancelBet(betId, userId);

      // Note: Balance update happens in service, but bet_undo_success is controller-specific
      // Consider moving this to service for consistency
      const io = req.app.get('io') as SocketIOServer;
      if (io) {
        io.to(`user:${userId}`).emit('bet_undo_success', {
          betId,
          userId,
          refundedAmount: parseFloat(bet.amount),
        });
      }

      res.json({
        message: 'Bet cancelled successfully',
        bet,
      });
    } catch (error) {
      next(error);
    }
  }

  // Process round payouts (admin only)
  async processPayouts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { roundId } = req.params;

      await betService.processRoundPayouts(roundId);

      res.json({
        message: 'Payouts processed successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const betController = new BetController();