import { db } from '../db';
import { bets, gameRounds, users, transactions, userBonuses, userStatistics, partners, partnerGameEarnings } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { AppError } from '../middleware/errorHandler';
import { userService } from './user.service';
import { Server as SocketIOServer } from 'socket.io';
import { GAME_EVENTS } from '../shared/events.types';

export class BetService {
  private io: SocketIOServer | null = null;
  private readonly MIN_BET = 10;
  private readonly MAX_BET = 100000;

  setIo(io: SocketIOServer) {
    this.io = io;
  }

  private validateBetAmount(amount: number): void {
    if (amount < this.MIN_BET) {
      throw new AppError(`Minimum bet amount is ₹${this.MIN_BET}`, 400);
    }
    if (amount > this.MAX_BET) {
      throw new AppError(`Maximum bet amount is ₹${this.MAX_BET}`, 400);
    }
  }

  async placeBet(userId: string, roundId: string, betSide: 'andar' | 'bahar', amount: number, tempId?: string) {
    this.validateBetAmount(amount);

    const round = await db.query.gameRounds.findFirst({
      where: eq(gameRounds.id, roundId),
    });

    if (!round) throw new AppError('Round not found', 404);
    if (round.status !== 'betting') throw new AppError('Betting is closed for this round', 400);
    if (round.bettingEndTime && new Date() > round.bettingEndTime) {
      throw new AppError('Betting time has expired', 400);
    }

    const canBet = await userService.canPlaceBet(userId, amount);
    if (!canBet) throw new AppError('Insufficient balance', 400);

    const user = await userService.getUserById(userId);
    const userBalance = parseFloat(user.balance);
    const userBonusBalance = parseFloat(user.bonusBalance);

    let amountFromBonus = 0;
    let amountFromMain = 0;

    if (userBonusBalance > 0) {
      amountFromBonus = Math.min(userBonusBalance, amount);
      amountFromMain = amount - amountFromBonus;
    } else {
      amountFromMain = amount;
    }

    try {
      const [bet] = await db.insert(bets).values({
        userId,
        roundId,
        gameId: round.gameId,
        betSide,
        betRound: round.roundNumber, // Track which round this bet was placed in
        amount: amount.toFixed(2),
        status: 'pending',
      }).returning();

      if (amountFromMain > 0) {
        await userService.updateBalance(userId, amountFromMain, 'subtract');
      }
      if (amountFromBonus > 0) {
        await userService.updateBonusBalance(userId, amountFromBonus, 'subtract');
      }

      if (betSide === 'andar') {
        await db.update(gameRounds).set({
          totalAndarBets: sql`${gameRounds.totalAndarBets} + ${amount}`,
          totalBetAmount: sql`${gameRounds.totalBetAmount} + ${amount}`,
        }).where(eq(gameRounds.id, roundId));
      } else {
        await db.update(gameRounds).set({
          totalBaharBets: sql`${gameRounds.totalBaharBets} + ${amount}`,
          totalBetAmount: sql`${gameRounds.totalBetAmount} + ${amount}`,
        }).where(eq(gameRounds.id, roundId));
      }

      await db.insert(transactions).values({
        userId,
        type: 'bet',
        amount: amount.toFixed(2),
        status: 'completed',
        description: `Bet placed on ${betSide} for round ${round.roundNumber}`,
        referenceId: bet.id,
      });

      if (amountFromBonus > 0) {
        await this.trackBonusWagering(userId, amountFromBonus);
      }

      // ✅ WEBSOCKET BROADCAST: Notify user and room about bet
      if (this.io) {
        // Get updated round stats
        const updatedRound = await db.query.gameRounds.findFirst({
          where: eq(gameRounds.id, roundId),
        });

        // Get updated balance
        const updatedBalance = await userService.getBalance(userId);

        // Notify the user who placed the bet (with tempId for optimistic update confirmation)
        this.io.to(`user:${userId}`).emit(GAME_EVENTS.BET_PLACED, {
          betId: bet.id,
          tempId, // For matching with optimistic update
          bet,
          balance: {
            mainBalance: updatedBalance.mainBalance,
            bonusBalance: updatedBalance.bonusBalance,
          },
          message: 'Bet placed successfully'
        });

        // Broadcast updated round statistics to all players in the game
        if (updatedRound) {
          // Calculate round-specific totals (for games with multiple rounds like Round 1 & 2)
          const round1Bets = await this.getRoundBets(roundId);
          const round1Andar = round1Bets
            .filter(b => b.betSide === 'andar' && b.betRound === 1)
            .reduce((sum, b) => sum + parseFloat(b.amount), 0);
          const round1Bahar = round1Bets
            .filter(b => b.betSide === 'bahar' && b.betRound === 1)
            .reduce((sum, b) => sum + parseFloat(b.amount), 0);
          const round2Andar = round1Bets
            .filter(b => b.betSide === 'andar' && b.betRound === 2)
            .reduce((sum, b) => sum + parseFloat(b.amount), 0);
          const round2Bahar = round1Bets
            .filter(b => b.betSide === 'bahar' && b.betRound === 2)
            .reduce((sum, b) => sum + parseFloat(b.amount), 0);

          this.io.to(`game:${round.gameId}`).emit(GAME_EVENTS.STATS_UPDATED, {
            roundId,
            round1Totals: {
              andar: round1Andar,
              bahar: round1Bahar,
            },
            round2Totals: {
              andar: round2Andar,
              bahar: round2Bahar,
            },
            totalAndarBets: parseFloat(updatedRound.totalAndarBets),
            totalBaharBets: parseFloat(updatedRound.totalBaharBets),
            totalBetAmount: parseFloat(updatedRound.totalBetAmount),
          });
        }
      }

      return bet;
    } catch (error) {
      throw new AppError('Failed to place bet', 500);
    }
  }

  private calculatePayout(betAmount: number, betSide: string, winningSide: string, roundNumber: number, betRoundNumber: number): number {
    // Round 1 rules
    if (roundNumber === 1) {
      if (betSide === 'andar' && winningSide === 'andar') return betAmount * 2; // 1:1 payout
      if (betSide === 'bahar' && winningSide === 'bahar') return betAmount; // 1:0 payout (refund)
      return 0;
    }
    
    // Round 2 rules - CRITICAL FIX for Bahar mixed payouts
    if (roundNumber === 2) {
      if (winningSide === 'bahar' && betSide === 'bahar') {
        // Bahar wins Round 2: R1 bets get 1:1, R2 bets get 1:0 (refund)
        return betRoundNumber === 1 ? betAmount * 2 : betAmount;
      }
      // Andar always gets 1:1 on all bets
      if (winningSide === 'andar' && betSide === 'andar') {
        return betAmount * 2;
      }
      return 0;
    }
    
    // Round 3+ rules: Both sides get 1:1 payout
    return betSide === winningSide ? betAmount * 2 : 0;
  }

  async processRoundPayouts(roundId: string) {
    const round = await db.query.gameRounds.findFirst({
      where: eq(gameRounds.id, roundId),
    });

    if (!round) throw new AppError('Round not found', 404);
    if (round.status !== 'completed') throw new AppError('Round is not completed', 400);
    if (!round.winningSide) throw new AppError('Winning side not determined', 400);

    const roundBets = await db.query.bets.findMany({
      where: eq(bets.roundId, roundId),
    });

    for (const bet of roundBets) {
      const betAmount = parseFloat(bet.amount);
      const payout = this.calculatePayout(betAmount, bet.betSide, round.winningSide, round.roundNumber, bet.betRound);

      if (payout > 0) {
        const winnings = payout - betAmount;

        await db.update(bets).set({
          status: 'won',
          payoutAmount: payout.toFixed(2),
        }).where(eq(bets.id, bet.id));

        await userService.updateBalance(bet.userId, payout, 'add');

        await db.insert(transactions).values({
          userId: bet.userId,
          type: 'win',
          amount: payout.toFixed(2),
          status: 'completed',
          description: `Won ₹${payout.toFixed(2)} on ${bet.betSide}`,
          referenceId: bet.id,
        });

        await this.updateUserStatistics(bet.userId, 'win', betAmount, winnings);

        // ✅ WEBSOCKET BROADCAST: Notify winner of balance update and payout
        if (this.io) {
          const updatedBalance = await userService.getBalance(bet.userId);
          this.io.to(`user:${bet.userId}`).emit(GAME_EVENTS.BALANCE_UPDATED, {
            userId: bet.userId,
            mainBalance: updatedBalance.mainBalance,
            bonusBalance: updatedBalance.bonusBalance,
            change: winnings,
            reason: 'payout'
          });

          // Send payout notification
          this.io.to(`user:${bet.userId}`).emit(GAME_EVENTS.PAYOUT_RECEIVED, {
            roundId,
            amount: payout,
            winningSide: round.winningSide,
          });
        }
      } else {
        await db.update(bets).set({
          status: 'lost',
          payoutAmount: '0.00',
        }).where(eq(bets.id, bet.id));

        await this.updateUserStatistics(bet.userId, 'loss', betAmount, 0);
      }
    }

    // ✅ WEBSOCKET BROADCAST: Notify all players that payouts are complete
    if (this.io && round) {
      this.io.to(`game:${round.gameId}`).emit(GAME_EVENTS.PAYOUTS_PROCESSED, {
        roundId,
        message: 'All payouts have been processed'
      });
    }
  }

  private async trackBonusWagering(userId: string, wageringAmount: number) {
    const activeBonuses = await db.query.userBonuses.findMany({
      where: and(
        eq(userBonuses.userId, userId),
        eq(userBonuses.status, 'active')
      ),
    });

    for (const bonus of activeBonuses) {
      const currentWagered = parseFloat(bonus.wageringProgress);
      const requiredWagering = parseFloat(bonus.wageringRequirement);
      const newWagered = currentWagered + wageringAmount;

      if (newWagered >= requiredWagering) {
        await db.update(userBonuses).set({
          status: 'completed',
          wageringProgress: requiredWagering.toFixed(2),
          completedAt: new Date(),
        }).where(eq(userBonuses.id, bonus.id));
      } else {
        await db.update(userBonuses).set({
          wageringProgress: newWagered.toFixed(2),
        }).where(eq(userBonuses.id, bonus.id));
      }
    }
  }

  private async updateUserStatistics(userId: string, result: 'win' | 'loss', betAmount: number, winnings: number) {
    const stats = await userService.getUserStatistics(userId);

    const newTotalBets = stats.totalBets + 1;
    const newTotalWagered = parseFloat(stats.totalBetAmount) + betAmount;
    const newTotalWinnings = parseFloat(stats.totalWinAmount) + winnings;

    let newTotalWins = stats.totalWins;
    let newTotalLosses = stats.totalLosses;
    let newCurrentStreak = stats.currentStreak;
    let newLongestStreak = stats.longestStreak;

    if (result === 'win') {
      newTotalWins++;
      newCurrentStreak = stats.currentStreak >= 0 ? stats.currentStreak + 1 : 1;
      newLongestStreak = Math.max(newLongestStreak, newCurrentStreak);
    } else {
      newTotalLosses++;
      newCurrentStreak = stats.currentStreak <= 0 ? stats.currentStreak - 1 : -1;
    }

    const newBiggestWin = Math.max(parseFloat(stats.biggestWin), winnings);

    await db.update(userStatistics).set({
      totalBets: newTotalBets,
      totalWins: newTotalWins,
      totalLosses: newTotalLosses,
      totalBetAmount: newTotalWagered.toFixed(2),
      totalWinAmount: newTotalWinnings.toFixed(2),
      biggestWin: newBiggestWin.toFixed(2),
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
    }).where(eq(userStatistics.userId, userId));
  }

  async getUserBets(userId: string, limit: number = 50, offset: number = 0) {
    return db.query.bets.findMany({
      where: eq(bets.userId, userId),
      limit,
      offset,
      orderBy: (bets, { desc }) => [desc(bets.createdAt)],
    });
  }

  async getRoundBets(roundId: string) {
    return db.query.bets.findMany({
      where: eq(bets.roundId, roundId),
    });
  }

  async cancelBet(betId: string, userId: string) {
    const bet = await db.query.bets.findFirst({
      where: and(eq(bets.id, betId), eq(bets.userId, userId)),
    });

    if (!bet) throw new AppError('Bet not found', 404);
    if (bet.status !== 'pending') throw new AppError('Bet cannot be cancelled', 400);

    const round = await db.query.gameRounds.findFirst({
      where: eq(gameRounds.id, bet.roundId),
    });

    if (!round || round.status !== 'betting') {
      throw new AppError('Round has already started', 400);
    }

    const betAmount = parseFloat(bet.amount);
    await userService.updateBalance(userId, betAmount, 'add');

    await db.update(bets).set({ status: 'cancelled' }).where(eq(bets.id, betId));

    if (bet.betSide === 'andar') {
      await db.update(gameRounds).set({
        totalAndarBets: sql`${gameRounds.totalAndarBets} - ${betAmount}`,
        totalBetAmount: sql`${gameRounds.totalBetAmount} - ${betAmount}`,
      }).where(eq(gameRounds.id, bet.roundId));
    } else {
      await db.update(gameRounds).set({
        totalBaharBets: sql`${gameRounds.totalBaharBets} - ${betAmount}`,
        totalBetAmount: sql`${gameRounds.totalBetAmount} - ${betAmount}`,
      }).where(eq(gameRounds.id, bet.roundId));
    }

    return bet;
  }

  /**
   * Undo the most recent bet placed by the user in the current round
   * Returns the refunded amount to user's balance and updates round totals
   */
  async undoBet(betId: string, userId: string) {
    const bet = await db.query.bets.findFirst({
      where: and(eq(bets.id, betId), eq(bets.userId, userId)),
    });

    if (!bet) throw new AppError('Bet not found', 404);
    if (bet.status !== 'pending') throw new AppError('Only pending bets can be undone', 400);

    const round = await db.query.gameRounds.findFirst({
      where: eq(gameRounds.id, bet.roundId),
    });

    if (!round) throw new AppError('Round not found', 404);
    if (round.status !== 'betting') {
      throw new AppError('Cannot undo bet after betting has closed', 400);
    }

    const betAmount = parseFloat(bet.amount);

    // Refund the bet amount to user's balance
    await userService.updateBalance(userId, betAmount, 'add');

    // Mark bet as cancelled
    await db.update(bets).set({
      status: 'cancelled',
      payoutAmount: '0.00'
    }).where(eq(bets.id, betId));

    // Update round totals
    if (bet.betSide === 'andar') {
      await db.update(gameRounds).set({
        totalAndarBets: sql`${gameRounds.totalAndarBets} - ${betAmount}`,
        totalBetAmount: sql`${gameRounds.totalBetAmount} - ${betAmount}`,
      }).where(eq(gameRounds.id, bet.roundId));
    } else {
      await db.update(gameRounds).set({
        totalBaharBets: sql`${gameRounds.totalBaharBets} - ${betAmount}`,
        totalBetAmount: sql`${gameRounds.totalBetAmount} - ${betAmount}`,
      }).where(eq(gameRounds.id, bet.roundId));
    }

    // Create refund transaction
    await db.insert(transactions).values({
      userId,
      type: 'refund',
      amount: betAmount.toFixed(2),
      status: 'completed',
      description: `Bet undone - refunded ₹${betAmount.toFixed(2)}`,
      referenceId: bet.id,
    });

    // Broadcast update
    if (this.io) {
      const updatedBalance = await userService.getBalance(userId);
      const updatedRound = await db.query.gameRounds.findFirst({
        where: eq(gameRounds.id, bet.roundId),
      });

      // Notify user of undo success
      this.io.to(`user:${userId}`).emit(GAME_EVENTS.BET_UNDONE, {
        betId: bet.id,
        refundAmount: betAmount,
        balance: {
          mainBalance: updatedBalance.mainBalance,
          bonusBalance: updatedBalance.bonusBalance,
        },
        message: 'Bet successfully undone'
      });

      // Broadcast updated round stats
      if (updatedRound) {
        this.io.to(`game:${round.gameId}`).emit(GAME_EVENTS.STATS_UPDATED, {
          roundId: bet.roundId,
          totalAndarBets: parseFloat(updatedRound.totalAndarBets),
          totalBaharBets: parseFloat(updatedRound.totalBaharBets),
          totalBetAmount: parseFloat(updatedRound.totalBetAmount),
        });
      }
    }

    return { bet, refundAmount: betAmount };
  }

  /**
   * Re-place all bets from the previous completed round in the current round
   * Maintains the same bet sides and amounts
   */
  async rebetPreviousRound(userId: string, currentRoundId: string) {
    const currentRound = await db.query.gameRounds.findFirst({
      where: eq(gameRounds.id, currentRoundId),
    });

    if (!currentRound) throw new AppError('Current round not found', 404);
    if (currentRound.status !== 'betting') {
      throw new AppError('Betting is closed for this round', 400);
    }

    // Find the most recent completed round for this game
    const previousRound = await db.query.gameRounds.findFirst({
      where: and(
        eq(gameRounds.gameId, currentRound.gameId),
        eq(gameRounds.status, 'completed')
      ),
      orderBy: (gameRounds, { desc }) => [desc(gameRounds.createdAt)],
    });

    if (!previousRound) {
      throw new AppError('No previous round found to rebet', 404);
    }

    // Get all user's bets from the previous round
    const previousBets = await db.query.bets.findMany({
      where: and(
        eq(bets.userId, userId),
        eq(bets.roundId, previousRound.id)
      ),
    });

    if (previousBets.length === 0) {
      throw new AppError('No previous bets found to rebet', 404);
    }

    // Calculate total amount needed
    const totalAmount = previousBets.reduce((sum, bet) => sum + parseFloat(bet.amount), 0);

    // Check if user has sufficient balance
    const canBet = await userService.canPlaceBet(userId, totalAmount);
    if (!canBet) {
      throw new AppError(`Insufficient balance. Need ₹${totalAmount.toFixed(2)}`, 400);
    }

    // Place all bets from previous round
    const newBets = [];
    for (const prevBet of previousBets) {
      const bet = await this.placeBet(
        userId,
        currentRoundId,
        prevBet.betSide as 'andar' | 'bahar',
        parseFloat(prevBet.amount)
      );
      newBets.push(bet);
    }

    // Broadcast rebet success
    if (this.io) {
      const updatedBalance = await userService.getBalance(userId);
      this.io.to(`user:${userId}`).emit(GAME_EVENTS.REBET_SUCCESS, {
        bets: newBets,
        totalAmount,
        balance: {
          mainBalance: updatedBalance.mainBalance,
          bonusBalance: updatedBalance.bonusBalance,
        },
        message: `${newBets.length} bet(s) replayed from previous round`
      });
    }

    return { bets: newBets, totalAmount, count: newBets.length };
  }

  /**
   * Double all current pending bets in the round
   * Places new bets matching existing ones with the same amounts
   */
  async doubleBets(userId: string, roundId: string) {
    const round = await db.query.gameRounds.findFirst({
      where: eq(gameRounds.id, roundId),
    });

    if (!round) throw new AppError('Round not found', 404);
    if (round.status !== 'betting') {
      throw new AppError('Betting is closed for this round', 400);
    }

    // Get all user's current pending bets in this round
    const currentBets = await db.query.bets.findMany({
      where: and(
        eq(bets.userId, userId),
        eq(bets.roundId, roundId),
        eq(bets.status, 'pending')
      ),
    });

    if (currentBets.length === 0) {
      throw new AppError('No current bets found to double', 404);
    }

    // Calculate total amount needed to double
    const totalAmount = currentBets.reduce((sum, bet) => sum + parseFloat(bet.amount), 0);

    // Check if user has sufficient balance
    const canBet = await userService.canPlaceBet(userId, totalAmount);
    if (!canBet) {
      throw new AppError(`Insufficient balance. Need ₹${totalAmount.toFixed(2)} to double bets`, 400);
    }

    // Place matching bets to double
    const newBets = [];
    for (const currentBet of currentBets) {
      const bet = await this.placeBet(
        userId,
        roundId,
        currentBet.betSide as 'andar' | 'bahar',
        parseFloat(currentBet.amount)
      );
      newBets.push(bet);
    }

    // Broadcast double success
    if (this.io) {
      const updatedBalance = await userService.getBalance(userId);
      this.io.to(`user:${userId}`).emit(GAME_EVENTS.DOUBLE_BETS_SUCCESS, {
        bets: newBets,
        totalAmount,
        balance: {
          mainBalance: updatedBalance.mainBalance,
          bonusBalance: updatedBalance.bonusBalance,
        },
        message: `Doubled ${newBets.length} bet(s) - ₹${totalAmount.toFixed(2)} added`
      });
    }

    return { bets: newBets, totalAmount, count: newBets.length };
  }
}

export const betService = new BetService();
