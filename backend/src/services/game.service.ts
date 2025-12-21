import { db } from '../db';
import { games, gameRounds, bets, gameHistory, gameStatistics, gameCards, users } from '../db/schema';
import { eq, and, desc, sql, gte, lte, asc } from 'drizzle-orm';
import { AppError } from '../middleware/errorHandler';
import type { Server as SocketIOServer } from 'socket.io';
import { GAME_EVENTS } from '../shared/events.types';

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export class GameService {
  private io: SocketIOServer | null = null;
  private activeTimers: Map<string, NodeJS.Timeout> = new Map();

  setIo(io: SocketIOServer) {
    this.io = io;
  }

  // Card validation helper
  private isValidCard(card: string): boolean {
    if (!card || card.length < 2 || card.length > 3) return false;
    const rank = card.slice(0, -1);
    const suit = card.slice(-1);
    return RANKS.includes(rank) && SUITS.includes(suit);
  }

  // Check if two cards match (same rank, different suit allowed)
  private cardsMatch(card1: string, card2: string): boolean {
    if (!card1 || !card2 || card1.length < 2 || card2.length < 2) return false;
    const rank1 = card1.slice(0, -1);
    const rank2 = card2.slice(0, -1);
    return rank1 === rank2;
  }

  // Calculate expected next side based on round and card count
  private calculateExpectedNextSide(roundNumber: number, cardsDealt: number): 'andar' | 'bahar' {
    if (roundNumber === 1) {
      // Round 1: Bahar first (position 1), then Andar (position 2)
      return cardsDealt % 2 === 0 ? 'bahar' : 'andar';
    } else if (roundNumber === 2) {
      // Round 2: Continue alternating - position 3 is Bahar, position 4 is Andar
      return (cardsDealt + 1) % 2 === 0 ? 'bahar' : 'andar';
    } else {
      // Round 3+: Continue alternating
      return cardsDealt % 2 === 0 ? 'bahar' : 'andar';
    }
  }

  async getActiveGame(gameId?: string) {
    let game;
    
    if (gameId) {
      game = await db.query.games.findFirst({
        where: and(
          eq(games.id, gameId),
          eq(games.status, 'active')
        ),
      });
    } else {
      game = await db.query.games.findFirst({
        where: and(
          eq(games.name, 'Andar Bahar'),
          eq(games.status, 'active')
        ),
      });
    }

    if (!game) {
      throw new AppError('No active game found', 404);
    }

    return game;
  }

  async getCurrentRound(gameId: string) {
    const round = await db.query.gameRounds.findFirst({
      where: and(
        eq(gameRounds.gameId, gameId),
        eq(gameRounds.status, 'betting')
      ),
      orderBy: [desc(gameRounds.createdAt)],
    });

    if (!round) {
      return null;
    }

    // Get current card state for this round
    const cards = await db.query.gameCards.findMany({
      where: eq(gameCards.roundId, round.id),
      orderBy: [asc(gameCards.position)],
    });

    return {
      ...round,
      currentCardPosition: cards.length,
      expectedNextSide: this.calculateExpectedNextSide(round.roundNumber, cards.length),
      totalCardsDealt: cards.length,
    };
  }

  async createNewRound(gameId: string, openingCard: string) {
    await this.getActiveGame(gameId);

    // Validate opening card format
    if (!this.isValidCard(openingCard)) {
      throw new AppError('Invalid opening card format. Use format like "AH", "KS", "10D"', 400);
    }
    
    const lastRound = await db.query.gameRounds.findFirst({
      where: eq(gameRounds.gameId, gameId),
      orderBy: [desc(gameRounds.roundNumber)],
    });

    const newRoundNumber = (lastRound?.roundNumber || 0) + 1;
    const bettingDuration = 30; // 30 seconds default

    const [newRound] = await db.insert(gameRounds).values({
      gameId,
      roundNumber: newRoundNumber,
      status: 'betting',
      jokerCard: openingCard, // REAL card from stream
      totalAndarBets: '0.00',
      totalBaharBets: '0.00',
      totalBetAmount: '0.00',
      totalPayoutAmount: '0.00',
      bettingStartTime: new Date(),
      bettingEndTime: new Date(Date.now() + bettingDuration * 1000),
      startTime: new Date(),
      currentCardPosition: 0,
      expectedNextSide: 'bahar', // Round always starts with Bahar
      cardsDealt: 0,
    }).returning();

    // Broadcast round created event with real opening card
    if (this.io) {
      this.io.to(`game:${gameId}`).emit(GAME_EVENTS.ROUND_CREATED, {
        round: newRound,
        openingCard: openingCard, // Send real card to clients
        roundNumber: newRoundNumber,
      });
    }

    return newRound;
  }

  async startRound(roundId: string) {
    const [round] = await db
      .update(gameRounds)
      .set({
        status: 'betting',
        bettingStartTime: new Date(),
      })
      .where(eq(gameRounds.id, roundId))
      .returning();

    // Start server-side timer for this round
    this.startRoundTimer(roundId, round.gameId, 30);

    // Broadcast round started event
    if (this.io) {
      this.io.to(`game:${round.gameId}`).emit(GAME_EVENTS.ROUND_STARTED, {
        round,
        bettingDuration: 30,
      });
    }

    return round;
  }

  private startRoundTimer(roundId: string, gameId: string, durationSeconds: number) {
    // Clear any existing timer for this round
    if (this.activeTimers.has(roundId)) {
      clearInterval(this.activeTimers.get(roundId)!);
    }

    let remainingSeconds = durationSeconds;

    const timerInterval = setInterval(async () => {
      remainingSeconds--;

      // Broadcast timer update every second
      if (this.io) {
        this.io.to(`game:${gameId}`).emit(GAME_EVENTS.TIMER_UPDATE, {
          roundId,
          remaining: remainingSeconds,
        });
      }

      // When timer reaches 0, close betting
      if (remainingSeconds <= 0) {
        clearInterval(timerInterval);
        this.activeTimers.delete(roundId);
        
        // Auto-close betting
        await this.closeBetting(roundId);
      }
    }, 1000);

    this.activeTimers.set(roundId, timerInterval);
  }

  async closeBetting(roundId: string) {
    // Clear timer if exists
    if (this.activeTimers.has(roundId)) {
      clearInterval(this.activeTimers.get(roundId)!);
      this.activeTimers.delete(roundId);
    }

    const [round] = await db
      .update(gameRounds)
      .set({
        status: 'playing',
        bettingEndTime: new Date(),
      })
      .where(eq(gameRounds.id, roundId))
      .returning();

    // Broadcast betting closed event
    if (this.io) {
      this.io.to(`game:${round.gameId}`).emit(GAME_EVENTS.BETTING_CLOSED, {
        roundId,
        round,
      });
    }

    return round;
  }

  // NEW: Handle card dealing from admin (REAL stream card)
  async dealCard(roundId: string, adminCard: string, side: 'andar' | 'bahar', position: number) {
    const round = await db.query.gameRounds.findFirst({
      where: eq(gameRounds.id, roundId),
    });

    if (!round) {
      throw new AppError('Round not found', 404);
    }

    if (round.status !== 'playing' && round.status !== 'betting') {
      throw new AppError('Round is not in dealing phase', 400);
    }

    // Validate card format
    if (!this.isValidCard(adminCard)) {
      throw new AppError('Invalid card format. Use format like "AH", "KS", "10D"', 400);
    }

    // Validate expected side based on sequence
    const expectedSide = this.calculateExpectedNextSide(round.roundNumber, round.cardsDealt || 0);
    if (side !== expectedSide) {
      throw new AppError(`Invalid card side. Expected: ${expectedSide.toUpperCase()}, got: ${side.toUpperCase()}`, 400);
    }

    // Check if this card matches the opening card (winner condition)
    const isWinningCard = this.cardsMatch(round.jokerCard!, adminCard);

    // Save the card to database
    const [cardRecord] = await db.insert(gameCards).values({
      gameId: round.gameId,
      roundId: round.id,
      card: adminCard,
      side,
      position,
      isWinningCard,
    }).returning();

    // Update round card counters
    await db.update(gameRounds).set({
      cardsDealt: sql`${gameRounds.cardsDealt} + 1`,
      currentCardPosition: position,
      expectedNextSide: this.calculateExpectedNextSide(round.roundNumber, position),
    }).where(eq(gameRounds.id, roundId));

    // Broadcast card dealt event
    if (this.io) {
      this.io.to(`game:${round.gameId}`).emit(GAME_EVENTS.CARD_DEALT, {
        roundId,
        card: adminCard,
        side,
        position,
        isWinningCard,
        roundNumber: round.roundNumber,
        expectedNextSide: this.calculateExpectedNextSide(round.roundNumber, position),
        nextPosition: position + 1,
      });

      // If this is the winning card, complete the game
      if (isWinningCard) {
        await this.completeGameWithWinner(roundId, side, adminCard);
      }
    }

    return {
      card: cardRecord,
      isWinningCard,
    };
  }

  // NEW: Complete game with winner
  private async completeGameWithWinner(roundId: string, winningSide: 'andar' | 'bahar', winningCard: string) {
    const round = await db.query.gameRounds.findFirst({
      where: eq(gameRounds.id, roundId),
    });

    if (!round) return;

    const [completedRound] = await db
      .update(gameRounds)
      .set({
        status: 'completed',
        winningSide,
        winningCard,
        endTime: new Date(),
      })
      .where(eq(gameRounds.id, roundId))
      .returning();

    // Process payouts for all bets in this round
    await this.processPayouts(roundId, winningSide);

    // Determine winner display text based on round
    const winnerDisplayText = this.getWinnerDisplayText(completedRound.roundNumber!, winningSide);

    // Broadcast winner declaration
    if (this.io) {
      this.io.to(`game:${completedRound.gameId}`).emit(GAME_EVENTS.WINNER_DETERMINED, {
        roundId,
        winningSide,
        winningCard,
        winnerDisplayText,
        totalCards: completedRound.cardsDealt,
        round: completedRound.roundNumber,
      });
    }
  }

  // NEW: Get proper winner display text based on round
  private getWinnerDisplayText(roundNumber: number, winningSide: 'andar' | 'bahar'): string {
    if (roundNumber === 1 || roundNumber === 2) {
      // Rounds 1-2: Use "BABA" for Bahar
      return winningSide === 'andar' ? 'ANDAR WON' : 'BABA WON';
    } else {
      // Round 3+: Use proper "BAHAR" name
      return winningSide === 'andar' ? 'ANDAR WON' : 'BAHAR WON';
    }
  }

  // DEPRECATED: This method is replaced by real-time admin card input via dealCard()
  // Keeping for backward compatibility, but it should not be used
  async dealCardsAndDetermineWinner(roundId: string) {
    throw new AppError('This method is deprecated. Use admin card input via dealCard() instead.', 400);
  }

  // NEW: Process payouts with round-specific logic
  async processPayouts(roundId: string, winningSide: 'andar' | 'bahar') {
    const round = await db.query.gameRounds.findFirst({
      where: eq(gameRounds.id, roundId),
    });

    if (!round) {
      throw new AppError('Round not found', 404);
    }

    const roundBets = await db.query.bets.findMany({
      where: eq(bets.roundId, roundId),
    });

    let totalPayouts = 0;
    const winnerUpdates: Array<{ userId: string; payout: number }> = [];

    for (const bet of roundBets) {
      const betAmount = parseFloat(bet.amount);
      let payout = 0;
      let status: 'won' | 'lost' | 'refunded' = 'lost';

      if (bet.betSide === winningSide) {
        // Calculate payout based on round-specific rules
        payout = this.calculatePayout(bet, round.roundNumber, winningSide);
        status = payout > betAmount ? 'won' : 'refunded';
        totalPayouts += payout;
        winnerUpdates.push({ userId: bet.userId, payout });

        // Update user balance with winnings
        await db.update(users).set({
          balance: sql`balance + ${payout}`,
        }).where(eq(users.id, bet.userId));
      }

      // Update bet record
      await db.update(bets).set({
        status,
        payoutAmount: payout.toFixed(2),
      }).where(eq(bets.id, bet.id));

      // Create game history record
      await db.insert(gameHistory).values({
        userId: bet.userId,
        gameId: round.gameId,
        roundId: round.id,
        betId: bet.id,
        roundNumber: round.roundNumber,
        betSide: bet.betSide,
        betAmount: betAmount.toFixed(2),
        result: status,
        payoutAmount: payout.toFixed(2),
        jokerCard: round.jokerCard,
        winningCard: round.winningCard,
      });
    }

    // Update round with payout information
    await db.update(gameRounds).set({
      totalPayoutAmount: totalPayouts.toFixed(2),
    }).where(eq(gameRounds.id, roundId));

    // Broadcast payouts processed to game room
    if (this.io) {
      this.io.to(`game:${round.gameId}`).emit(GAME_EVENTS.PAYOUTS_PROCESSED, {
        roundId,
        totalPayouts,
        winnersCount: winnerUpdates.length,
      });

      // Notify each winner individually
      for (const winner of winnerUpdates) {
        this.io.to(`user:${winner.userId}`).emit(GAME_EVENTS.PAYOUT_RECEIVED, {
          roundId,
          amount: winner.payout,
          winningSide: round.winningSide,
        });
      }
    }

    // Auto-update game statistics after payout processing
    await this.updateGameStatistics(round.gameId, roundId, totalPayouts, roundBets.length);

    return { totalPayouts, betsProcessed: roundBets.length };
  }

  // NEW: Calculate payout according to Andar Bahar rules
  private calculatePayout(bet: any, roundNumber: number, winningSide: 'andar' | 'bahar'): number {
    const betAmount = parseFloat(bet.amount);

    if (roundNumber === 1) {
      // Round 1: Andar 1:1 (double), Bahar 1:0 (refund only)
      if (winningSide === 'andar' && bet.betSide === 'andar') {
        return betAmount * 2; // 1:1 payout (stake + profit)
      } else if (winningSide === 'bahar' && bet.betSide === 'bahar') {
        return betAmount; // 1:0 payout (refund only)
      }
    } else if (roundNumber === 2) {
      // Round 2: Complex logic - depends on which round bet was placed
      if (winningSide === 'andar' && bet.betSide === 'andar') {
        // All Andar bets (R1 + R2) get 1:1 payout
        return betAmount * 2;
      } else if (winningSide === 'bahar' && bet.betSide === 'bahar') {
        // R1 Bahar: 1:1, R2 Bahar: 1:0
        if (bet.betRound === 1) {
          return betAmount * 2; // Round 1 Bahar gets full payout
        } else {
          return betAmount; // Round 2 Bahar gets refund only
        }
      }
    } else {
      // Round 3+: Both sides 1:1 on all bets
      if (bet.betSide === winningSide) {
        return betAmount * 2;
      }
    }

    return 0; // No payout for losing bets
  }

  async updateGameStatistics(gameId: string, roundId: string, totalPayouts?: number, betCount?: number) {
    const round = await db.query.gameRounds.findFirst({
      where: eq(gameRounds.id, roundId),
    });

    if (!round) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingStats = await db.query.gameStatistics.findFirst({
      where: and(
        eq(gameStatistics.gameId, gameId),
        eq(gameStatistics.date, today)
      ),
    });

    const roundBets = await db.query.bets.findMany({
      where: eq(bets.roundId, roundId),
    });

    const uniquePlayers = new Set(roundBets.map(b => b.userId)).size;
    const totalBetAmount = parseFloat(round.totalBetAmount);
    const totalPayoutAmount = parseFloat(round.totalPayoutAmount);
    const revenue = totalBetAmount - totalPayoutAmount;

    if (existingStats) {
      await db.update(gameStatistics).set({
        totalRounds: sql`${gameStatistics.totalRounds} + 1`,
        totalBets: sql`${gameStatistics.totalBets} + ${roundBets.length}`,
        totalBetAmount: sql`${gameStatistics.totalBetAmount} + ${totalBetAmount}`,
        totalPayoutAmount: sql`${gameStatistics.totalPayoutAmount} + ${totalPayoutAmount}`,
        totalPlayers: sql`${gameStatistics.totalPlayers} + ${uniquePlayers}`,
        revenue: sql`${gameStatistics.revenue} + ${revenue}`,
      }).where(eq(gameStatistics.id, existingStats.id));
    } else {
      await db.insert(gameStatistics).values({
        gameId,
        date: today,
        totalRounds: 1,
        totalBets: roundBets.length,
        totalBetAmount: totalBetAmount.toFixed(2),
        totalPayoutAmount: totalPayoutAmount.toFixed(2),
        totalPlayers: uniquePlayers,
        revenue: revenue.toFixed(2),
      });
    }
  }

  async getGameHistory(gameId: string, limit: number = 50) {
    const rounds = await db.query.gameRounds.findMany({
      where: eq(gameRounds.gameId, gameId),
      orderBy: [desc(gameRounds.createdAt)],
      limit,
    });

    return rounds;
  }

  async getGameStatistics(gameId: string, startDate?: Date, endDate?: Date) {
    let whereClause = eq(gameStatistics.gameId, gameId);

    if (startDate && endDate) {
      whereClause = and(
        eq(gameStatistics.gameId, gameId),
        gte(gameStatistics.date, startDate),
        lte(gameStatistics.date, endDate)
      ) as any;
    }

    const stats = await db.query.gameStatistics.findMany({
      where: whereClause,
      orderBy: [desc(gameStatistics.date)],
    });

    return stats;
  }

  async getAllGames() {
    const allGames = await db.query.games.findMany({
      orderBy: [games.name],
    });

    return allGames;
  }

  async getRoundById(roundId: string) {
    const round = await db.query.gameRounds.findFirst({
      where: eq(gameRounds.id, roundId),
    });

    if (!round) {
      throw new AppError('Round not found', 404);
    }

    return round;
  }

  async getUserGameHistory(userId: string, limit: number = 10) {
    const history = await db.query.gameHistory.findMany({
      where: eq(gameHistory.userId, userId),
      orderBy: [desc(gameHistory.createdAt)],
      limit,
    });

    return history;
  }

  async undoLastBet(userId: string, roundId: string) {
    // Find the user's most recent bet in this round
    const lastBet = await db.query.bets.findFirst({
      where: and(
        eq(bets.userId, userId),
        eq(bets.roundId, roundId),
        eq(bets.status, 'pending')
      ),
      orderBy: [desc(bets.createdAt)],
    });

    if (!lastBet) {
      throw new AppError('No bet to undo', 404);
    }

    // Check if round is still in betting phase
    const round = await db.query.gameRounds.findFirst({
      where: eq(gameRounds.id, roundId),
    });

    if (!round || round.status !== 'betting') {
      throw new AppError('Cannot undo bet - betting phase has ended', 400);
    }

    const betAmount = parseFloat(lastBet.amount);

    // Refund the bet amount and delete the bet
    await db.transaction(async (tx) => {
      // Refund to user balance
      await tx.update(users).set({
        balance: sql`balance + ${betAmount}`,
      }).where(eq(users.id, userId));

      // Update round totals
      const sideField = lastBet.betSide === 'andar' ? 'totalAndarBets' : 'totalBaharBets';
      await tx.update(gameRounds).set({
        [sideField]: sql`${gameRounds[sideField]} - ${betAmount}`,
        totalBetAmount: sql`${gameRounds.totalBetAmount} - ${betAmount}`,
      }).where(eq(gameRounds.id, roundId));

      // Delete the bet
      await tx.delete(bets).where(eq(bets.id, lastBet.id));
    });

    // Broadcast bet undone event
    if (this.io) {
      this.io.to(`user:${userId}`).emit(GAME_EVENTS.BET_UNDONE, {
        roundId,
        refundedAmount: betAmount,
      });

      // Update room stats
      const updatedRound = await db.query.gameRounds.findFirst({
        where: eq(gameRounds.id, roundId),
      });

      if (updatedRound) {
        this.io.to(`game:${round.gameId}`).emit(GAME_EVENTS.STATS_UPDATED, {
          roundId,
          totalAndarBets: updatedRound.totalAndarBets,
          totalBaharBets: updatedRound.totalBaharBets,
          totalBetAmount: updatedRound.totalBetAmount,
        });
      }
    }

    return {
      success: true,
      refundedAmount: betAmount,
      message: 'Bet undone successfully'
    };
  }

  async getLastRoundBets(userId: string, gameId: string) {
    // Get the last completed round for this game
    const lastRound = await db.query.gameRounds.findFirst({
      where: and(
        eq(gameRounds.gameId, gameId),
        eq(gameRounds.status, 'completed')
      ),
      orderBy: [desc(gameRounds.createdAt)],
    });

    if (!lastRound) {
      return [];
    }

    // Get user's bets from that round
    const lastBets = await db.query.bets.findMany({
      where: and(
        eq(bets.userId, userId),
        eq(bets.roundId, lastRound.id)
      ),
    });

    return lastBets.map(bet => ({
      side: bet.betSide,
      amount: parseFloat(bet.amount),
    }));
  }

  async rebetPreviousRound(userId: string, gameId: string, currentRoundId: string) {
    // Get last round bets
    const lastBets = await this.getLastRoundBets(userId, gameId);

    if (lastBets.length === 0) {
      throw new AppError('No previous bets to repeat', 404);
    }

    // Check current round is in betting phase
    const currentRound = await db.query.gameRounds.findFirst({
      where: eq(gameRounds.id, currentRoundId),
    });

    if (!currentRound || currentRound.status !== 'betting') {
      throw new AppError('Cannot place bets - betting phase not active', 400);
    }

    // Get user balance
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Calculate total bet amount
    const totalBetAmount = lastBets.reduce((sum, bet) => sum + bet.amount, 0);

    if (parseFloat(user.balance) < totalBetAmount) {
      throw new AppError('Insufficient balance', 400);
    }

    // Place all bets atomically
    const placedBets = await db.transaction(async (tx) => {
      const newBets = [];

      for (const lastBet of lastBets) {
        // Deduct from user balance
        await tx.update(users).set({
          balance: sql`balance - ${lastBet.amount}`,
        }).where(eq(users.id, userId));

        // Update round totals
        const sideField = lastBet.side === 'andar' ? 'totalAndarBets' : 'totalBaharBets';
        await tx.update(gameRounds).set({
          [sideField]: sql`${gameRounds[sideField]} + ${lastBet.amount}`,
          totalBetAmount: sql`${gameRounds.totalBetAmount} + ${lastBet.amount}`,
        }).where(eq(gameRounds.id, currentRoundId));

        // Create new bet
        const [newBet] = await tx.insert(bets).values({
          userId,
          gameId,
          roundId: currentRoundId,
          betSide: lastBet.side,
          betRound: currentRound.roundNumber, // Track which round this bet is placed in
          amount: lastBet.amount.toFixed(2),
          status: 'pending',
        }).returning();

        newBets.push(newBet);
      }

      return newBets;
    });

    // Broadcast rebet success
    if (this.io) {
      this.io.to(`user:${userId}`).emit(GAME_EVENTS.REBET_PLACED, {
        roundId: currentRoundId,
        betsPlaced: placedBets.length,
        totalAmount: totalBetAmount,
      });

      // Update room stats
      const updatedRound = await db.query.gameRounds.findFirst({
        where: eq(gameRounds.id, currentRoundId),
      });

      if (updatedRound) {
        this.io.to(`game:${gameId}`).emit(GAME_EVENTS.STATS_UPDATED, {
          roundId: currentRoundId,
          totalAndarBets: updatedRound.totalAndarBets,
          totalBaharBets: updatedRound.totalBaharBets,
          totalBetAmount: updatedRound.totalBetAmount,
        });
      }
    }

    return {
      success: true,
      betsPlaced: placedBets.length,
      totalAmount: totalBetAmount,
      bets: placedBets,
    };
  }
}

export const gameService = new GameService();
