import { db } from '../db';
import { bets, gameRounds, users, transactions, userBonuses, userStatistics, partners, partnerGameEarnings } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { AppError } from '../middleware/errorHandler';
import { userService } from './user.service';
import { Server as SocketIOServer } from 'socket.io';

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

  async placeBet(userId: string, roundId: string, betSide: 'andar' | 'bahar', amount: number) {
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

        // Notify the user who placed the bet
        this.io.to(`user:${userId}`).emit('bet:placed', {
          bet,
          message: 'Bet placed successfully'
        });

        // Broadcast updated round statistics to all players in the game
        if (updatedRound) {
          this.io.to(`game:${round.gameId}`).emit('round:stats_updated', {
            roundId,
            totalAndarBets: updatedRound.totalAndarBets,
            totalBaharBets: updatedRound.totalBaharBets,
            totalBetAmount: updatedRound.totalBetAmount
          });
        }

        // Send updated balance to user
        const updatedBalance = await userService.getBalance(userId);
        this.io.to(`user:${userId}`).emit('user:balance_updated', {
          userId,
          mainBalance: updatedBalance.balance,
          bonusBalance: updatedBalance.bonusBalance
        });
      }

      return bet;
    } catch (error) {
      throw new AppError('Failed to place bet', 500);
    }
  }

  private calculatePayout(betAmount: number, betSide: string, winningSide: string, roundNumber: number): number {
    if (roundNumber === 1) {
      if (betSide === 'andar' && winningSide === 'andar') return betAmount * 2;
      if (betSide === 'bahar' && winningSide === 'bahar') return betAmount;
      return 0;
    }
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
      const payout = this.calculatePayout(betAmount, bet.betSide, round.winningSide, round.roundNumber);

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

        // ✅ WEBSOCKET BROADCAST: Notify winner of balance update
        if (this.io) {
          const updatedBalance = await userService.getBalance(bet.userId);
          this.io.to(`user:${bet.userId}`).emit('user:balance_updated', {
            userId: bet.userId,
            mainBalance: updatedBalance.balance,
            bonusBalance: updatedBalance.bonusBalance
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
      this.io.to(`game:${round.gameId}`).emit('game:payouts_processed', {
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
}

export const betService = new BetService();
