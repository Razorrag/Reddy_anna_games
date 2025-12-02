import { db } from '../db';
import {
  gameStatistics,
  userStatistics,
  games,
  bets,
  users,
  gameRounds,
} from '../db/schema';
import { eq, sql, and, gte, lte } from 'drizzle-orm';

export class AnalyticsService {
  // Update game statistics
  async updateGameStatistics(gameId: string, date: Date) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Get statistics for the day
      const [stats] = await db
        .select({
          totalRounds: sql<number>`count(distinct ${gameRounds.id})`,
          totalBets: sql<number>`count(${bets.id})`,
          totalBetAmount: sql<number>`coalesce(sum(${bets.amount}), 0)`,
          totalPayoutAmount: sql<number>`coalesce(sum(${bets.payoutAmount}), 0)`,
          totalPlayers: sql<number>`count(distinct ${bets.userId})`,
          revenue: sql<number>`coalesce(sum(${bets.amount}) - sum(${bets.payoutAmount}), 0)`,
        })
        .from(gameRounds)
        .leftJoin(bets, eq(gameRounds.id, bets.roundId))
        .where(
          and(
            eq(gameRounds.gameId, gameId),
            gte(gameRounds.createdAt, startOfDay),
            lte(gameRounds.createdAt, endOfDay)
          )
        );

      // Check if statistics already exist for this day
      const [existing] = await db
        .select()
        .from(gameStatistics)
        .where(
          and(
            eq(gameStatistics.gameId, gameId),
            eq(gameStatistics.date, startOfDay)
          )
        )
        .limit(1);

      if (existing) {
        // Update existing record
        const [updated] = await db
          .update(gameStatistics)
          .set({
            totalRounds: stats.totalRounds,
            totalBets: stats.totalBets,
            totalBetAmount: stats.totalBetAmount.toString(),
            totalPayoutAmount: stats.totalPayoutAmount.toString(),
            totalPlayers: stats.totalPlayers,
            revenue: stats.revenue.toString(),
          })
          .where(eq(gameStatistics.id, existing.id))
          .returning();

        return updated;
      } else {
        // Create new record
        const [created] = await db
          .insert(gameStatistics)
          .values({
            gameId,
            date: startOfDay,
            totalRounds: stats.totalRounds,
            totalBets: stats.totalBets,
            totalBetAmount: stats.totalBetAmount.toString(),
            totalPayoutAmount: stats.totalPayoutAmount.toString(),
            totalPlayers: stats.totalPlayers,
            revenue: stats.revenue.toString(),
          })
          .returning();

        return created;
      }
    } catch (error) {
      console.error('Update game statistics error:', error);
      throw error;
    }
  }

  // Update user statistics
  async updateUserStatistics(userId: string) {
    try {
      // Get user betting statistics
      const [stats] = await db
        .select({
          totalBets: sql<number>`count(*)`,
          totalWins: sql<number>`count(*) filter (where ${bets.status} = 'won')`,
          totalLosses: sql<number>`count(*) filter (where ${bets.status} = 'lost')`,
          totalBetAmount: sql<number>`coalesce(sum(${bets.amount}), 0)`,
          totalWinAmount: sql<number>`coalesce(sum(${bets.payoutAmount}) filter (where ${bets.status} = 'won'), 0)`,
          biggestWin: sql<number>`coalesce(max(${bets.payoutAmount}), 0)`,
        })
        .from(bets)
        .where(eq(bets.userId, userId));

      // Calculate current streak
      const recentBets = await db
        .select({
          status: bets.status,
        })
        .from(bets)
        .where(eq(bets.userId, userId))
        .orderBy(sql`${bets.createdAt} desc`)
        .limit(100);

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      for (const bet of recentBets) {
        if (bet.status === 'won') {
          tempStreak++;
          if (currentStreak === 0) currentStreak = tempStreak;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else if (bet.status === 'lost') {
          tempStreak = 0;
        }
      }

      // Get last bet time
      const [lastBet] = await db
        .select({ createdAt: bets.createdAt })
        .from(bets)
        .where(eq(bets.userId, userId))
        .orderBy(sql`${bets.createdAt} desc`)
        .limit(1);

      // Check if user statistics already exist
      const [existing] = await db
        .select()
        .from(userStatistics)
        .where(eq(userStatistics.userId, userId))
        .limit(1);

      if (existing) {
        // Update existing record
        const [updated] = await db
          .update(userStatistics)
          .set({
            totalBets: stats.totalBets,
            totalWins: stats.totalWins,
            totalLosses: stats.totalLosses,
            totalBetAmount: stats.totalBetAmount.toString(),
            totalWinAmount: stats.totalWinAmount.toString(),
            biggestWin: stats.biggestWin.toString(),
            currentStreak,
            longestStreak,
            lastBetAt: lastBet?.createdAt || null,
            updatedAt: new Date(),
          })
          .where(eq(userStatistics.id, existing.id))
          .returning();

        return updated;
      } else {
        // Create new record
        const [created] = await db
          .insert(userStatistics)
          .values({
            userId,
            totalBets: stats.totalBets,
            totalWins: stats.totalWins,
            totalLosses: stats.totalLosses,
            totalBetAmount: stats.totalBetAmount.toString(),
            totalWinAmount: stats.totalWinAmount.toString(),
            biggestWin: stats.biggestWin.toString(),
            currentStreak,
            longestStreak,
            lastBetAt: lastBet?.createdAt || null,
          })
          .returning();

        return created;
      }
    } catch (error) {
      console.error('Update user statistics error:', error);
      throw error;
    }
  }

  // Get game performance metrics
  async getGamePerformanceMetrics(gameId: string, days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const metrics = await db
        .select({
          date: gameStatistics.date,
          totalBets: gameStatistics.totalBets,
          totalBetAmount: gameStatistics.totalBetAmount,
          totalPayoutAmount: gameStatistics.totalPayoutAmount,
          revenue: gameStatistics.revenue,
          totalPlayers: gameStatistics.totalPlayers,
          avgBetAmount: sql<number>`${gameStatistics.totalBetAmount} / nullif(${gameStatistics.totalBets}, 0)`,
        })
        .from(gameStatistics)
        .where(
          and(
            eq(gameStatistics.gameId, gameId),
            gte(gameStatistics.date, startDate)
          )
        )
        .orderBy(gameStatistics.date);

      return metrics;
    } catch (error) {
      console.error('Get game performance metrics error:', error);
      throw error;
    }
  }

  // Get platform metrics
  async getPlatformMetrics(days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [metrics] = await db
        .select({
          totalGames: sql<number>`count(distinct ${games.id})`,
          activeGames: sql<number>`count(distinct ${games.id}) filter (where ${games.status} = 'active')`,
          totalUsers: sql<number>`count(distinct ${users.id})`,
          activeUsers: sql<number>`count(distinct ${users.id}) filter (where ${users.status} = 'active')`,
          totalBets: sql<number>`count(${bets.id})`,
          totalBetAmount: sql<number>`coalesce(sum(${bets.amount}), 0)`,
          totalPayouts: sql<number>`coalesce(sum(${bets.payoutAmount}), 0)`,
          revenue: sql<number>`coalesce(sum(${bets.amount}) - sum(${bets.payoutAmount}), 0)`,
        })
        .from(games)
        .fullJoin(users, sql`true`)
        .fullJoin(bets, gte(bets.createdAt, startDate));

      return metrics;
    } catch (error) {
      console.error('Get platform metrics error:', error);
      throw error;
    }
  }

  // Get top performers
  async getTopPerformers(limit: number = 10, type: 'winners' | 'players' = 'winners') {
    try {
      if (type === 'winners') {
        // Top winners by total win amount
        const topWinners = await db
          .select({
            userId: users.id,
            username: users.username,
            totalWins: sql<number>`count(*) filter (where ${bets.status} = 'won')`,
            totalWinAmount: sql<number>`coalesce(sum(${bets.payoutAmount}) filter (where ${bets.status} = 'won'), 0)`,
            biggestWin: sql<number>`coalesce(max(${bets.payoutAmount}), 0)`,
          })
          .from(users)
          .leftJoin(bets, eq(users.id, bets.userId))
          .groupBy(users.id, users.username)
          .orderBy(sql`total_win_amount desc`)
          .limit(limit);

        return topWinners;
      } else {
        // Top players by bet volume
        const topPlayers = await db
          .select({
            userId: users.id,
            username: users.username,
            totalBets: sql<number>`count(${bets.id})`,
            totalBetAmount: sql<number>`coalesce(sum(${bets.amount}), 0)`,
          })
          .from(users)
          .leftJoin(bets, eq(users.id, bets.userId))
          .groupBy(users.id, users.username)
          .orderBy(sql`total_bet_amount desc`)
          .limit(limit);

        return topPlayers;
      }
    } catch (error) {
      console.error('Get top performers error:', error);
      throw error;
    }
  }

  // Calculate win rate
  async calculateWinRate(userId: string) {
    try {
      const [stats] = await db
        .select({
          totalBets: sql<number>`count(*)`,
          totalWins: sql<number>`count(*) filter (where ${bets.status} = 'won')`,
        })
        .from(bets)
        .where(eq(bets.userId, userId));

      const winRate = stats.totalBets > 0 ? (stats.totalWins / stats.totalBets) * 100 : 0;

      return {
        totalBets: stats.totalBets,
        totalWins: stats.totalWins,
        winRate: parseFloat(winRate.toFixed(2)),
      };
    } catch (error) {
      console.error('Calculate win rate error:', error);
      throw error;
    }
  }

  // Get betting trends
  async getBettingTrends(days: number = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const trends = await db
        .select({
          date: sql<Date>`date(${bets.createdAt})`,
          totalBets: sql<number>`count(*)`,
          totalAmount: sql<number>`coalesce(sum(${bets.amount}), 0)`,
          uniquePlayers: sql<number>`count(distinct ${bets.userId})`,
        })
        .from(bets)
        .where(gte(bets.createdAt, startDate))
        .groupBy(sql`date(${bets.createdAt})`)
        .orderBy(sql`date(${bets.createdAt})`);

      return trends;
    } catch (error) {
      console.error('Get betting trends error:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();