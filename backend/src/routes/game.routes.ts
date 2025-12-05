import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, authorize } from '../middleware/auth';
import { gameController } from '../controllers/game.controller';

const router = Router();

// GET /api/games/:gameId - Get active game
router.get('/:gameId', asyncHandler(gameController.getActiveGame.bind(gameController)));

// GET /api/games/:gameId/current-round - Get current round
router.get('/:gameId/current-round', asyncHandler(gameController.getCurrentRound.bind(gameController)));

// POST /api/games/:gameId/rounds - Create new round (admin only)
router.post('/:gameId/rounds', authenticate, authorize('admin'), asyncHandler(gameController.createNewRound.bind(gameController)));

// POST /api/games/rounds/:roundId/start - Start round (admin only)
router.post('/rounds/:roundId/start', authenticate, authorize('admin'), asyncHandler(gameController.startRound.bind(gameController)));

// POST /api/games/rounds/:roundId/close-betting - Close betting (admin only)
router.post('/rounds/:roundId/close-betting', authenticate, authorize('admin'), asyncHandler(gameController.closeBetting.bind(gameController)));

// POST /api/games/rounds/:roundId/deal - Deal cards (admin only)
router.post('/rounds/:roundId/deal', authenticate, authorize('admin'), asyncHandler(gameController.dealCards.bind(gameController)));

// GET /api/games/rounds/:roundId/statistics - Get round statistics
router.get('/rounds/:roundId/statistics', asyncHandler(gameController.getRoundStatistics.bind(gameController)));

// GET /api/games/:gameId/history - Get game history
router.get('/:gameId/history', asyncHandler(gameController.getGameHistory.bind(gameController)));

// GET /api/games/:gameId/statistics - Get game statistics
router.get('/:gameId/statistics', asyncHandler(gameController.getGameStatistics.bind(gameController)));

// POST /api/games/undo-bet - Undo last bet
router.post('/undo-bet', authenticate, asyncHandler(gameController.undoLastBet.bind(gameController)));

// GET /api/games/:gameId/last-bets - Get last round bets
router.get('/:gameId/last-bets', authenticate, asyncHandler(gameController.getLastRoundBets.bind(gameController)));

// POST /api/games/rebet - Rebet previous round
router.post('/rebet', authenticate, asyncHandler(gameController.rebetPreviousRound.bind(gameController)));

export default router;