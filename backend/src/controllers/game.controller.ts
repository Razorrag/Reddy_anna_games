import { Request, Response, NextFunction } from 'express';
import { gameService } from '../services/game.service';
import { betService } from '../services/bet.service';
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
      const { openingCard } = req.body;

      if (!openingCard) {
        return res.status(400).json({ message: 'Opening card is required' });
      }

      const round = await gameService.createNewRound(gameId, openingCard);

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

  // Deal cards (admin only) - Admin inputs actual stream cards
  async dealCards(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { roundId } = req.params;
      const { card, side, position } = req.body;

      if (!card || !side) {
        return res.status(400).json({ message: 'Card and side are required' });
      }

      if (!['andar', 'bahar'].includes(side)) {
        return res.status(400).json({ message: 'Side must be "andar" or "bahar"' });
      }

      const result = await gameService.dealCard(roundId, card, side, position || 0);

      res.json({
        message: 'Card dealt successfully',
        ...result,
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

  // Undo last bet
  async undoLastBet(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { betId } = req.body;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (!betId) {
        return res.status(400).json({ message: 'Bet ID is required' });
      }

      const result = await betService.undoBet(betId, userId);

      res.json({
        message: 'Bet undone successfully',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get last round bets
  async getLastRoundBets(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { gameId } = req.params;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const bets = await gameService.getLastRoundBets(userId, gameId);

      res.json({ bets });
    } catch (error) {
      next(error);
    }
  }

  // Rebet previous round
  async rebetPreviousRound(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { currentRoundId } = req.body;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (!currentRoundId) {
        return res.status(400).json({ message: 'Current round ID is required' });
      }

      const result = await betService.rebetPreviousRound(userId, currentRoundId);

      res.json({
        message: 'Previous bets replayed successfully',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Double all current bets
  async doubleBets(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { roundId } = req.body;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (!roundId) {
        return res.status(400).json({ message: 'Round ID is required' });
      }

      const result = await betService.doubleBets(userId, roundId);

      res.json({
        message: 'Bets doubled successfully',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const gameController = new GameController();