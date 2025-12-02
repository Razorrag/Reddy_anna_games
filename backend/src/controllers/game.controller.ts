import { Request, Response, NextFunction } from 'express';
import { gameService } from '../services/game.service';
import { AuthRequest } from '../middleware/auth';

export class GameController {
  // Get active game
  async getActiveGame(req: Request, res: Response, next: NextFunction) {
    try {
      const { gameId } = req.params;
      const game = await gameService.getActiveGame(gameId);

      res.json({ game });
    } catch (error) {
      next(error);
    }
  }

  // Get current round
  async getCurrentRound(req: Request, res: Response, next: NextFunction) {
    try {
      const { gameId } = req.params;
      const round = await gameService.getCurrentRound(gameId);

      if (!round) {
        return res.status(404).json({ message: 'No active round found' });
      }

      res.json({ round });
    } catch (error) {
      next(error);
    }
  }

  // Create new round (admin only)
  async createNewRound(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { gameId } = req.params;
      const round = await gameService.createNewRound(gameId);

      res.status(201).json({
        message: 'New round created',
        round,
      });
    } catch (error) {
      next(error);
    }
  }

  // Start round (admin only)
  async startRound(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { roundId } = req.params;
      const round = await gameService.startRound(roundId);

      res.json({
        message: 'Round started',
        round,
      });
    } catch (error) {
      next(error);
    }
  }

  // Close betting (admin only)
  async closeBetting(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { roundId } = req.params;
      const round = await gameService.closeBetting(roundId);

      res.json({
        message: 'Betting closed',
        round,
      });
    } catch (error) {
      next(error);
    }
  }

  // Deal cards and determine winner (admin only)
  async dealCards(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { roundId } = req.params;
      const round = await gameService.dealCardsAndDetermineWinner(roundId);

      res.json({
        message: 'Cards dealt, winner determined',
        round,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get round statistics
  async getRoundStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const { roundId } = req.params;
      const round = await gameService.getRoundById(roundId);
      if (!round) {
        return res.status(404).json({ error: 'Round not found' });
      }

      res.json({
        statistics: {
          id: round.id,
          status: round.status,
          totalAndarBets: round.totalAndarBets,
          totalBaharBets: round.totalBaharBets,
          totalBetAmount: round.totalBetAmount,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get game history
  async getGameHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { gameId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const history = await gameService.getGameHistory(gameId, limit);

      res.json({ history });
    } catch (error) {
      next(error);
    }
  }

  // Get game statistics
  async getGameStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const { gameId } = req.params;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const statistics = await gameService.getGameStatistics(gameId, startDate, endDate);

      res.json({ statistics });
    } catch (error) {
      next(error);
    }
  }
}

export const gameController = new GameController();