import { db } from '../db';
import { bets, gameRounds, users, transactions, partnerCommissions, partners, userBonuses, userStatistics, partnerGameEarnings } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { AppError } from '../middleware/errorHandler';
import { userService } from './user.service';

export class BetService {
  private readonly MIN_BET = 10;
  private readonly MAX_BET = 100000;

  // Validate bet amount
  private validateBetAmount(amount: number): void {
    if (amount < this.MIN_BET) {
      throw new AppError(`Minimum bet amount is ₹${this.MIN_BET}`, 400);
    }
    if (amount > this.MAX_BET) {
      throw new AppError(`Maximum bet amount is ₹${this.MAX_BET}`, 400);
    }
  }

  // Place a bet
  async placeBet(userId: string, roundId: string, betSide: 'andar' | 'bahar', amount: number) {
    // Validate bet amount
    this.validateBetAmount(amount);

    // Get the round
    const round = await db.query.gameRounds.findFirst({
      where: eq(gameRounds.id, roundId),
    });

    if (!round) {
      throw new AppError('Round not found', 404);
    }

    // Check if betting is still open
    if (round.status !== 'betting') {
      throw new AppError('Betting is closed for this round', 400);
    }

    // Check if betting time has expired
    if (round.bettingEndsAt && new Date() > round.bettingEndsAt) {
      throw new AppError('Betting time has expired', 400);
    }

    // Check user balance
    const canBet = await userService.canPlaceBet(userId, amount);
    if (!canBet) {
      throw new AppError('Insufficient balance', 400);
    }

    // Get user details
    const user = await userService.getUserById(userId);
    const userBalance = parseFloat(user.balance);
    const userBonusBalance = parseFloat(user.bonusBalance);

    // Determine how much to deduct from each balance
    let amountFromBonus = 0;
    let amountFromMain = 0;

    if (userBonusBalance > 0) {
      // Use bonus balance first
      amountFromBonus = Math.min(userBonusBalance, amount);
      amountFromMain = amount - amountFromBonus;
    } else {
      amountFromMain = amount;
    }

    // Start transaction
    try {
      // Create bet record
      const [bet] = await db.insert(bets).values({
        userId,
        roundId,
        gameId: round.gameId,
        betSide,
        amount: amount.toFixed(2),
        status: 'pending',
        placedAt: new Date(),
      }).returning();

      // Deduct from user balance
      if (amountFromMain > 0) {
        await userService.updateBalance(userId, amountFromMain, 'subtract');
      }
      if (amountFromBonus > 0) {
        await userService.updateBonusBalance(userId, amountFromBonus, 'subtract');
      }

      // Update round totals
      if (betSide === 'andar') {
        await db
          .update(gameRounds)
          .set({
            totalAndarBets: sql`${gameRounds.totalAndarBets} + ${amount}`,
            totalBets: sql`${gameRounds.totalBets} + 1`,
          })
          .where(eq(gameRounds.id, roundId));
      } else {
        await db
          .update(gameRounds)
          .set({
            totalBaharBets: sql`${gameRounds.totalBaharBets} + ${amount}`,
            totalBets: sql`${gameRounds.totalBets} + 1`,
          })
          .where(eq(gameRounds.id, roundId));
      }

      // Create transaction record
      await db.insert(transactions).values({
        userId,
        type: 'bet',
        amount: amount.toFixed(2),
        status: 'completed',
        description: `Bet placed on ${betSide} for round ${round.roundNumber}`,
        referenceId: bet.id,
      });

      // Track bonus wagering if bonus was used
      if (amountFromBonus > 0) {
        await this.trackBonusWagering(userId, amountFromBonus);
      }

      return bet;
    } catch (error) {
      throw new AppError('Failed to place bet', 500);
    }
  }

  // Calculate payout for a bet based on Andar Bahar rules
  private calculatePayout(betAmount: number, betSide: string, winningSide: string, roundNumber: number): number {
    if (roundNumber === 1) {
      // Round 1 special rules
      if (betSide === 'andar' && winningSide === 'andar') {
        return betAmount * 2; // 1:1 payout (bet + winnings)
      } else if (betSide === 'bahar' && winningSide === 'bahar') {
        return betAmount; // Refund only
      } else {
        return 0; // Lost
      }
    } else {
      // Round 2+ standard rules
      if (betSide === winningSide) {
        return betAmount * 2; // 1:1 payout (bet + winnings)
      } else {
        return 0; // Lost
      }
    }
  }

  // Process payouts for a completed round
  async processRoundPayouts(roundId: string) {
    const round = await db.query.gameRounds.findFirst({
      where: eq(gameRounds.id, roundId),
    });

    if (!round) {
      throw new AppError('Round not found', 404);
    }

    if (round.status !== 'completed') {
      throw new AppError('Round is not completed', 400);
    }

    if (!round.winningSide) {
      throw new AppError('Winning side not determined', 400);
    }

    // Get all bets for this round
    const roundBets = await db.query.bets.findMany({
      where: eq(bets.roundId, roundId),
    });

    // Process each bet
    for (const bet of roundBets) {
      const betAmount = parseFloat(bet.amount);
      const payout = this.calculatePayout(betAmount, bet.betSide, round.winningSide, round.roundNumber);

      if (payout > 0) {
        // Winning bet
        const winnings = payout - betAmount; // Actual profit

        // Update bet status
        await db
          .update(bets)
          .set({
            status: 'won',
            payout: payout.toFixed(2),
            settledAt: new Date(),
          })
          .where(eq(bets.id, bet.id));

        // Add winnings to user balance
        await userService.updateBalance(bet.userId, payout, 'add');

        // Create transaction record
        await db.insert(transactions).values({
          userId: bet.userId,
          type: 'win',
          amount: payout.toFixed(2),
          status: 'completed',
          description: `Won ₹${payout.toFixed(2)} on ${bet.betSide} for round ${round.roundNumber}`,
          referenceId: bet.id,
        });

        // Update user statistics
        await this.updateUserStatistics(bet.userId, 'win', betAmount, winnings);
      } else {
        // Losing bet
        await db
          .update(bets)
          .set({
            status: 'lost',
            payout: '0.00',
            settledAt: new Date(),
          })
          .where(eq(bets.id, bet.id));

        // Update user statistics
        await this.updateUserStatistics(bet.userId, 'loss', betAmount, 0);
      }

    }
    
    // Calculate partner commissions for the entire round (after all payouts)
    await this.calculateRoundCommissions(roundId);
  }

  // Calculate partner commissions using two-tier structure
  private async calculateRoundCommissions(roundId: string) {
    const round = await db.query.gameRounds.findFirst({
      where: eq(gameRounds.id, roundId),
      with: {
        bets: {
          with: {
            user: true,
          },
        },
      },
    });

    if (!round || !round.bets) {
      return;
    }

    // Group bets by partner
    const partnerMap = new Map<string, {
      partner: any;
      totalBets: number;
      totalPayouts: number;
      playerIds: Set<string>;
    }>();

    for (const bet of round.bets) {
      if (!bet.user.referredBy) continue;

      // Check if referrer is an active partner
      const partner = await db.query.partners.findFirst({
        where: and(
          eq(partners.userId, bet.user.referredBy),
          eq(partners.status, 'active')
        ),
      });

      if (!partner) continue;

      if (!partnerMap.has(partner.id)) {
        partnerMap.set(partner.id, {
          partner,
          totalBets: 0,
          totalPayouts: 0,
          playerIds: new Set(),
        });
      }

      const data = partnerMap.get(partner.id)!;
      data.totalBets += parseFloat(bet.amount);
      data.totalPayouts += parseFloat(bet.payoutAmount);
      data.playerIds.add(bet.userId);
    }

    // Create commission records for each partner
    for (const [partnerId, data] of partnerMap) {
      const realProfit = data.totalBets - data.totalPayouts;
      
      // Only give commission on positive profit
      if (realProfit <= 0) continue;

      const sharePercentage = parseFloat(data.partner.sharePercentage);
      const commissionRate = parseFloat(data.partner.commissionRate);

      // Two-tier calculation
      const shownProfit = realProfit * (sharePercentage / 100);
      const shownTotalBets = data.totalBets * (sharePercentage / 100);
      const shownTotalPayouts = data.totalPayouts * (sharePercentage / 100);
      const earnedAmount = shownProfit * (commissionRate / 100);

      // Create earning record
      await db.insert(partnerGameEarnings).values({
        partnerId,
        gameId: round.gameId,
        roundId: round.id,
        realProfit: realProfit.toFixed(2),
        realTotalBets: data.totalBets.toFixed(2),
        realTotalPayouts: data.totalPayouts.toFixed(2),
        shownProfit: shownProfit.toFixed(2),
        shownTotalBets: shownTotalBets.toFixed(2),
        shownTotalPayouts: shownTotalPayouts.toFixed(2),
        sharePercentage: sharePercentage.toFixed(2),
        commissionRate: commissionRate.toFixed(2),
        earnedAmount: earnedAmount.toFixed(2),
        playerCount: data.playerIds.size,
        status: 'pending',
      });

      // Update partner totals
      await db
        .update(partners)
        .set({
          totalCommission: sql`${partners.totalCommission} + ${earnedAmount}`,
          pendingCommission: sql`${partners.pendingCommission} + ${earnedAmount}`,
          updatedAt: new Date(),
        })
        .where(eq(partners.id, partnerId));
    }
  }

  // Track bonus wagering
  private async trackBonusWagering(userId: string, wageringAmount: number) {
    // Get active bonuses for user
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
        // Bonus unlocked
        await db
          .update(userBonuses)
          .set({
            status: 'unlocked',
            wageringProgress: requiredWagering.toFixed(2),
            unlockedAt: new Date(),
          })
          .where(eq(userBonuses.id, bonus.id));
      } else {
        // Update wagering progress
        await db
          .update(userBonuses)
          .set({
            wageringProgress: newWagered.toFixed(2),
          })
          .where(eq(userBonuses.id, bonus.id));
      }
    }
  }


  // Update user statistics
  private async updateUserStatistics(userId: string, result: 'win' | 'loss', betAmount: number, winnings: number) {
    const stats = await userService.getUserStatistics(userId);

    const newTotalBets = stats.totalBets + 1;
    const newTotalWagered = parseFloat(stats.totalWagered) + betAmount;
    const newTotalWinnings = parseFloat(stats.totalWinnings) + winnings;

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

    await db
      .update(userStatistics)
      .set({
        totalBets: newTotalBets,
        totalWins: newTotalWins,
        totalLosses: newTotalLosses,
        totalWagered: newTotalWagered.toFixed(2),
        totalWinnings: newTotalWinnings.toFixed(2),
        biggestWin: newBiggestWin.toFixed(2),
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
      })
      .where(eq(userStatistics.userId, userId));
  }

  // Get user bets
  async getUserBets(userId: string, limit: number = 50, offset: number = 0) {
    const userBets = await db.query.bets.findMany({
      where: eq(bets.userId, userId),
      limit,
      offset,
      with: {
        round: {
          columns: {
            roundNumber: true,
            winningSide: true,
            status: true,
          },
        },
      },
    });

    return userBets;
  }

  // Get round bets
  async getRoundBets(roundId: string) {
    const roundBets = await db.query.bets.findMany({
      where: eq(bets.roundId, roundId),
      with: {
        user: {
          columns: {
            id: true,
            username: true,
          },
        },
      },
    });

    return roundBets;
  }

  // Cancel bet (only if round hasn't started)
  async cancelBet(betId: string, userId: string) {
    const bet = await db.query.bets.findFirst({
      where: and(
        eq(bets.id, betId),
        eq(bets.userId, userId)
      ),
      with: {
        round: true,
      },
    });

    if (!bet) {
      throw new AppError('Bet not found', 404);
    }

    if (bet.status !== 'pending') {
      throw new AppError('Bet cannot be cancelled', 400);
    }

    if (bet.round.status !== 'betting') {
      throw new AppError('Round has already started', 400);
    }

    // Refund bet amount
    const betAmount = parseFloat(bet.amount);
    await userService.updateBalance(userId, betAmount, 'add');

    // Update bet status
    await db
      .update(bets)
      .set({
        status: 'cancelled',
        settledAt: new Date(),
      })
      .where(eq(bets.id, betId));

    // Update round totals
    if (bet.betSide === 'andar') {
      await db
        .update(gameRounds)
        .set({
          totalAndarBets: sql`${gameRounds.totalAndarBets} - ${betAmount}`,
          totalBets: sql`${gameRounds.totalBets} - 1`,
        })
        .where(eq(gameRounds.id, bet.roundId));
    } else {
      await db
        .update(gameRounds)
        .set({
          totalBaharBets: sql`${gameRounds.totalBaharBets} - ${betAmount}`,
          totalBets: sql`${gameRounds.totalBets} - 1`,
        })
        .where(eq(gameRounds.id, bet.roundId));
    }

    return bet;
  }
}

export const betService = new BetService();