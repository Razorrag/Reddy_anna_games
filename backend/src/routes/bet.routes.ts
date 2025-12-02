import { Router, Request, Response } from 'express';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { authenticate, authorize } from '../middleware/auth';
import { betController } from '../controllers/bet.controller';
import { db } from '../db';
import { bets, gameRounds } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { betService } from '../services/bet.service';

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST /api/bets - Place a bet
router.post('/', asyncHandler(betController.placeBet.bind(betController)));

// GET /api/bets - Get user bets
router.get('/', asyncHandler(betController.getUserBets.bind(betController)));

// DELETE /api/bets/:betId - Cancel bet
router.delete('/:betId', asyncHandler(betController.cancelBet.bind(betController)));

// GET /api/bets/round/:roundId - Get bets for a round (admin only)
router.get('/round/:roundId', authorize('admin'), asyncHandler(betController.getRoundBets.bind(betController)));

// POST /api/bets/round/:roundId/process-payouts - Process payouts (admin only)
router.post('/round/:roundId/process-payouts', authorize('admin'), asyncHandler(betController.processPayouts.bind(betController)));

// POST /api/bets/undo - Undo last bet
router.post('/undo', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  
  // Get user's last pending bet
  const lastBet = await db.query.bets.findFirst({
    where: and(
      eq(bets.userId, userId),
      eq(bets.status, 'pending')
    ),
    orderBy: [desc(bets.createdAt)]
  });
  
  if (!lastBet) {
    throw new AppError('No bet to undo', 404);
  }
  
  // Check if round is still in betting phase
  const round = await db.query.gameRounds.findFirst({
    where: eq(gameRounds.id, lastBet.roundId)
  });
  if (!round || round.status !== 'betting') {
    throw new AppError('Cannot undo bet after betting closes', 400);
  }
  
  // Use existing cancelBet method
  await betService.cancelBet(lastBet.id, userId);
  
  res.json({
    success: true,
    message: 'Bet cancelled successfully',
    refundedAmount: lastBet.amount
  });
}));

// POST /api/bets/rebet - Rebet from previous round
router.post('/rebet', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { roundId } = req.body;
  
  // Get user's bets from the specified round
  const previousBets = await db.query.bets.findMany({
    where: and(
      eq(bets.userId, userId),
      eq(bets.roundId, roundId)
    )
  });
  
  if (previousBets.length === 0) {
    throw new AppError('No previous bets found for this round', 404);
  }
  
  // Get current active round
  const currentRound = await db.query.gameRounds.findFirst({
    where: eq(gameRounds.status, 'betting'),
    orderBy: [desc(gameRounds.createdAt)]
  });
  
  if (!currentRound) {
    throw new AppError('No active betting round', 400);
  }
  
  // Place same bets in current round
  const newBets = [];
  for (const prevBet of previousBets) {
    const bet = await betService.placeBet(
      userId,
      currentRound.id,
      prevBet.betSide as 'andar' | 'bahar',
      parseFloat(prevBet.amount)
    );
    newBets.push(bet);
  }
  
  res.json({
    success: true,
    message: `Placed ${newBets.length} bet(s) successfully`,
    bets: newBets
  });
}));

// GET /api/bets/last-round/:gameId - Get previous round bets
router.get('/last-round/:gameId', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { gameId } = req.params;
  
  // Get last completed round
  const lastRound = await db.query.gameRounds.findFirst({
    where: and(
      eq(gameRounds.gameId, gameId),
      eq(gameRounds.status, 'completed')
    ),
    orderBy: [desc(gameRounds.endTime)]
  });
  
  if (!lastRound) {
    return res.json({ roundId: null, roundNumber: null, bets: [] });
  }
  
  // Get user's bets from that round
  const userBets = await db.query.bets.findMany({
    where: and(
      eq(bets.userId, userId),
      eq(bets.roundId, lastRound.id)
    )
  });
  
  res.json({
    roundId: lastRound.id,
    roundNumber: lastRound.roundNumber,
    bets: userBets
  });
}));

export default router;