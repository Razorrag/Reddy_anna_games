import { db } from '../db';
import { games, gameRounds, bets, gameHistory, gameStatistics } from '../db/schema';
import { eq, and, desc, sql, gte, lte } from 'drizzle-orm';
import { AppError } from '../middleware/errorHandler';

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

interface Card {
  suit: string;
  rank: string;
  display: string;
}

export class GameService {
  private createDeck(): Card[] {
    const deck: Card[] = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push({ suit, rank, display: `${rank}${suit}` });
      }
    }
    return this.shuffleDeck(deck);
  }

  private shuffleDeck(deck: Card[]): Card[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
    }
    return shuffled;
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

    return round;
  }

  async createNewRound(gameId: string) {
    await this.getActiveGame(gameId);
    
    const lastRound = await db.query.gameRounds.findFirst({
      where: eq(gameRounds.gameId, gameId),
      orderBy: [desc(gameRounds.roundNumber)],
    });

    const newRoundNumber = (lastRound?.roundNumber || 0) + 1;
    const deck = this.createDeck();
    const jokerCard = deck[0]!;
    const bettingDuration = 30; // 30 seconds default

    const [newRound] = await db.insert(gameRounds).values({
      gameId,
      roundNumber: newRoundNumber,
      status: 'betting',
      jokerCard: jokerCard.display,
      totalAndarBets: '0.00',
      totalBaharBets: '0.00',
      totalBetAmount: '0.00',
      totalPayoutAmount: '0.00',
      bettingStartTime: new Date(),
      bettingEndTime: new Date(Date.now() + bettingDuration * 1000),
      startTime: new Date(),
    }).returning();

    return newRound;
  }

  async startRound(roundId: string) {
    const [round] = await db
      .update(gameRounds)
      .set({ status: 'betting' })
      .where(eq(gameRounds.id, roundId))
      .returning();

    return round;
  }

  async closeBetting(roundId: string) {
    const [round] = await db
      .update(gameRounds)
      .set({ status: 'playing' })
      .where(eq(gameRounds.id, roundId))
      .returning();

    return round;
  }

  async dealCardsAndDetermineWinner(roundId: string) {
    const round = await db.query.gameRounds.findFirst({
      where: eq(gameRounds.id, roundId),
    });

    if (!round) {
      throw new AppError('Round not found', 404);
    }

    if (round.status !== 'playing') {
      throw new AppError('Round is not in progress', 400);
    }

    const deck = this.createDeck();
    const jokerRank = round.jokerCard?.replace(/[♠♥♦♣]/g, '') || '';
    
    let winningSide: 'andar' | 'bahar' = 'andar';
    let currentSide: 'andar' | 'bahar' = 'andar';
    let winningCard: Card | null = null;
    const cardsDealt: { side: string; card: string }[] = [];

    for (let i = 1; i < deck.length; i++) {
      const card = deck[i]!;
      cardsDealt.push({ side: currentSide, card: card.display });

      if (card.rank === jokerRank) {
        winningSide = currentSide;
        winningCard = card;
        break;
      }

      currentSide = currentSide === 'andar' ? 'bahar' : 'andar';
    }

    const [updatedRound] = await db
      .update(gameRounds)
      .set({
        status: 'completed',
        winningSide,
        winningCard: winningCard?.display,
        endTime: new Date(),
      })
      .where(eq(gameRounds.id, roundId))
      .returning();

    return {
      round: updatedRound,
      winningSide,
      winningCard: winningCard?.display,
      cardsDealt,
    };
  }

  async processPayouts(roundId: string) {
    const round = await db.query.gameRounds.findFirst({
      where: eq(gameRounds.id, roundId),
    });

    if (!round || !round.winningSide) {
      throw new AppError('Round not complete', 400);
    }

    const roundBets = await db.query.bets.findMany({
      where: eq(bets.roundId, roundId),
    });

    let totalPayouts = 0;

    for (const bet of roundBets) {
      const betAmount = parseFloat(bet.amount);
      let payout = 0;
      let status: 'won' | 'lost' = 'lost';

      if (bet.betSide === round.winningSide) {
        payout = betAmount * 2;
        status = 'won';
        totalPayouts += payout;

        await db.update(bets).set({
          status: 'won',
          payoutAmount: payout.toFixed(2),
        }).where(eq(bets.id, bet.id));

        await db.update(users).set({
          balance: sql`balance + ${payout}`,
        }).where(eq(users.id, bet.userId));
      } else {
        await db.update(bets).set({
          status: 'lost',
          payoutAmount: '0.00',
        }).where(eq(bets.id, bet.id));
      }

      await db.insert(gameHistory).values({
        userId: bet.userId,
        gameId: round.gameId,
        roundId: round.id,
        betId: bet.id,
        roundNumber: round.roundNumber,
        betSide: bet.betSide,
        betAmount: bet.amount,
        result: status,
        payoutAmount: payout.toFixed(2),
        jokerCard: round.jokerCard,
        winningCard: round.winningCard,
      });
    }

    await db.update(gameRounds).set({
      totalPayoutAmount: totalPayouts.toFixed(2),
    }).where(eq(gameRounds.id, roundId));

    return { totalPayouts, betsProcessed: roundBets.length };
  }

  async updateGameStatistics(gameId: string, roundId: string) {
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
}

// Import users for payout processing
import { users } from '../db/schema';

export const gameService = new GameService();
