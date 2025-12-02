import { db } from '../db';
import { games, gameRounds, bets, gameHistory, gameStatistics } from '../db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { AppError } from '../middleware/errorHandler';

// Card suits and ranks
const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

interface Card {
  suit: string;
  rank: string;
  display: string;
}

export class GameService {
  // Create a shuffled deck of cards
  private createDeck(): Card[] {
    const deck: Card[] = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push({
          suit,
          rank,
          display: `${rank}${suit}`,
        });
      }
    }
    return this.shuffleDeck(deck);
  }

  // Fisher-Yates shuffle algorithm
  private shuffleDeck(deck: Card[]): Card[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Get active game
  async getActiveGame(gameId?: string) {
    let game;
    
    if (gameId) {
      game = await db.query.games.findFirst({
        where: and(
          eq(games.id, gameId),
          eq(games.isActive, true)
        ),
      });
    } else {
      // Get the default Andar Bahar game
      game = await db.query.games.findFirst({
        where: and(
          eq(games.name, 'Andar Bahar'),
          eq(games.isActive, true)
        ),
      });
    }

    if (!game) {
      throw new AppError('No active game found', 404);
    }

    return game;
  }

  // Get current round for a game
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

  // Create a new round
  async createNewRound(gameId: string) {
    const game = await this.getActiveGame(gameId);
    
    // Get the last round number
    const lastRound = await db.query.gameRounds.findFirst({
      where: eq(gameRounds.gameId, gameId),
      orderBy: [desc(gameRounds.roundNumber)],
    });

    const newRoundNumber = (lastRound?.roundNumber || 0) + 1;
    
    // Create deck and draw joker card
    const deck = this.createDeck();
    const jokerCard = deck[0];

    const [newRound] = await db.insert(gameRounds).values({
      gameId,
      roundNumber: newRoundNumber,
      status: 'betting',
      jokerCard: jokerCard.display,
      totalAndarBets: '0.00',
      totalBaharBets: '0.00',
      totalBets: 0,
      bettingEndsAt: new Date(Date.now() + game.bettingDuration * 1000),
    }).returning();

    return newRound;
  }

  // Start round (open betting)
  async startRound(roundId: string) {
    const [round] = await db
      .update(gameRounds)
      .set({
        status: 'betting',
        updatedAt: new Date(),
      })
      .where(eq(gameRounds.id, roundId))
      .returning();

    return round;
  }

  // Close betting for a round
  async closeBetting(roundId: string) {
    const [round] = await db
      .update(gameRounds)
      .set({
        status: 'in_progress',
        updatedAt: new Date(),
      })
      .where(eq(gameRounds.id, roundId))
      .returning();

    return round;
  }

  // Deal cards and determine winner
  async dealCardsAndDetermineWinner(roundId: string) {
    const round = await db.query.gameRounds.findFirst({
      where: eq(gameRounds.id, roundId),
    });

    if (!round) {
      throw new AppError('Round not found', 404);
    }

    if (round.status !== 'in_progress') {
      throw new AppError('Round is not in progress', 400);
    }

    // Create a fresh deck and remove joker card
    const deck = this.createDeck();
    const jokerCard = round.jokerCard!;
    const jokerRank = jokerCard.substring(0, jokerCard.length - 1);

    // Remove the joker card from deck
    const filteredDeck = deck.filter(card => card.display !== jokerCard);
    
    // Simulate dealing cards alternately to Andar and Bahar
    let winningSide: 'andar' | 'bahar' | null = null;
    let cardsDealt = 0;
    const maxCards = 52; // Prevent infinite loop

    // First card goes to Andar
    let currentSide: 'andar' | 'bahar' = 'andar';

    for (let i = 0; i < filteredDeck.length && i < maxCards; i++) {
      const card = filteredDeck[i];
      cardsDealt++;

      // Check if this card matches the joker rank
      if (card.rank === jokerRank) {
        winningSide = currentSide;
        break;
      }

      // Alternate between Andar and Bahar
      currentSide = currentSide === 'andar' ? 'bahar' : 'andar';
    }

    if (!winningSide) {
      throw new AppError('Failed to determine winner', 500);
    }

    // Update round with result
    const [updatedRound] = await db
      .update(gameRounds)
      .set({
        status: 'completed',
        winningSide,
        cardsDealt,
        endedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(gameRounds.id, roundId))
      .returning();

    return updatedRound;
  }

  // Get round statistics
  async getRoundStatistics(roundId: string) {
    const round = await db.query.gameRounds.findFirst({
      where: eq(gameRounds.id, roundId),
    });

    if (!round) {
      throw new AppError('Round not found', 404);
    }

    // Get all bets for this round
    const roundBets = await db.query.bets.findMany({
      where: eq(bets.roundId, roundId),
    });

    const totalAndarBets = roundBets
      .filter(bet => bet.betSide === 'andar')
      .reduce((sum, bet) => sum + parseFloat(bet.amount), 0);

    const totalBaharBets = roundBets
      .filter(bet => bet.betSide === 'bahar')
      .reduce((sum, bet) => sum + parseFloat(bet.amount), 0);

    return {
      roundId,
      roundNumber: round.roundNumber,
      totalBets: roundBets.length,
      totalAndarBets,
      totalBaharBets,
      totalAmount: totalAndarBets + totalBaharBets,
      status: round.status,
      winningSide: round.winningSide,
    };
  }

  // Save round to history
  async saveRoundToHistory(roundId: string) {
    const round = await db.query.gameRounds.findFirst({
      where: eq(gameRounds.id, roundId),
      with: {
        game: true,
      },
    });

    if (!round) {
      throw new AppError('Round not found', 404);
    }

    // Get all bets for this round
    const roundBets = await db.query.bets.findMany({
      where: eq(bets.roundId, roundId),
    });

    const totalPlayers = new Set(roundBets.map(bet => bet.userId)).size;
    const totalBetsAmount = roundBets.reduce((sum, bet) => sum + parseFloat(bet.amount), 0);
    const totalPayouts = roundBets
      .filter(bet => bet.status === 'won')
      .reduce((sum, bet) => sum + parseFloat(bet.payout || '0'), 0);

    // Save to history
    const [history] = await db.insert(gameHistory).values({
      gameId: round.gameId,
      roundId: round.id,
      roundNumber: round.roundNumber,
      jokerCard: round.jokerCard!,
      winningSide: round.winningSide!,
      cardsDealt: round.cardsDealt!,
      totalBets: roundBets.length,
      totalPlayers,
      totalBetsAmount: totalBetsAmount.toFixed(2),
      totalPayouts: totalPayouts.toFixed(2),
      playedAt: round.endedAt!,
    }).returning();

    return history;
  }

  // Update game statistics
  async updateGameStatistics(gameId: string, roundId: string) {
    const round = await db.query.gameRounds.findFirst({
      where: eq(gameRounds.id, roundId),
    });

    if (!round) {
      throw new AppError('Round not found', 404);
    }

    // Get all bets for this round
    const roundBets = await db.query.bets.findMany({
      where: eq(bets.roundId, roundId),
    });

    const totalPlayers = new Set(roundBets.map(bet => bet.userId)).size;
    const totalBetsAmount = roundBets.reduce((sum, bet) => sum + parseFloat(bet.amount), 0);
    const totalPayouts = roundBets
      .filter(bet => bet.status === 'won')
      .reduce((sum, bet) => sum + parseFloat(bet.payout || '0'), 0);

    const winningBets = roundBets.filter(bet => bet.status === 'won').length;
    const losingBets = roundBets.filter(bet => bet.status === 'lost').length;

    // Check if statistics exist for current month
    const currentDate = new Date();
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const existingStats = await db.query.gameStatistics.findFirst({
      where: and(
        eq(gameStatistics.gameId, gameId),
        sql`${gameStatistics.periodStart} >= ${monthStart}`,
        sql`${gameStatistics.periodEnd} <= ${monthEnd}`
      ),
    });

    if (existingStats) {
      // Update existing statistics
      await db
        .update(gameStatistics)
        .set({
          totalRounds: existingStats.totalRounds + 1,
          totalBets: existingStats.totalBets + roundBets.length,
          totalPlayers: existingStats.totalPlayers + totalPlayers,
          totalWagered: (parseFloat(existingStats.totalWagered) + totalBetsAmount).toFixed(2),
          totalPayouts: (parseFloat(existingStats.totalPayouts) + totalPayouts).toFixed(2),
          averageBetSize: ((parseFloat(existingStats.totalWagered) + totalBetsAmount) / (existingStats.totalBets + roundBets.length)).toFixed(2),
          winRate: (((existingStats.totalBets * parseFloat(existingStats.winRate) / 100) + winningBets) / (existingStats.totalBets + roundBets.length) * 100).toFixed(2),
        })
        .where(eq(gameStatistics.id, existingStats.id));
    } else {
      // Create new statistics for this month
      await db.insert(gameStatistics).values({
        gameId,
        periodStart: monthStart,
        periodEnd: monthEnd,
        totalRounds: 1,
        totalBets: roundBets.length,
        totalPlayers,
        totalWagered: totalBetsAmount.toFixed(2),
        totalPayouts: totalPayouts.toFixed(2),
        averageBetSize: (totalBetsAmount / roundBets.length).toFixed(2),
        winRate: ((winningBets / roundBets.length) * 100).toFixed(2),
      });
    }
  }

  // Get game history
  async getGameHistory(gameId: string, limit: number = 50, offset: number = 0) {
    const history = await db.query.gameHistory.findMany({
      where: eq(gameHistory.gameId, gameId),
      orderBy: [desc(gameHistory.playedAt)],
      limit,
      offset,
    });

    return history;
  }

  // Get game statistics for a period
  async getGameStatistics(gameId: string, startDate?: Date, endDate?: Date) {
    let query = db.query.gameStatistics.findMany({
      where: eq(gameStatistics.gameId, gameId),
      orderBy: [desc(gameStatistics.periodStart)],
    });

    const stats = await query;

    if (startDate && endDate) {
      return stats.filter(stat => 
        stat.periodStart >= startDate && stat.periodEnd <= endDate
      );
    }

    return stats;
  }
}

export const gameService = new GameService();