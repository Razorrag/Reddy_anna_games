import { Request, Response } from 'express';
import { db } from '../db';
import {
  games,
  gameRounds,
  bets,
  users,
  gameStatistics,
  userStatistics,
  transactions,
} from '../db/schema';
import { eq, desc, and, gte, lte, sql, count } from 'drizzle-orm';

export class AnalyticsController {
  // Get game analytics
  async getGameAnalytics(req: Request, res: Response) {
    try {
      const {
        gameId,
        startDate,
        endDate,
        groupBy = 'day',
      } = req.query;

      const start = startDate
        ? new Date(startDate as string)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      let conditions = [
        gte(gameStatistics.date, start),
        lte(gameStatistics.date, end),
      ];

      if (gameId) {
        conditions.push(eq(gameStatistics.gameId, gameId as string));
      }

      const whereClause = and(...conditions);

      const analytics = await db
        .select({
          date: gameStatistics.date,
          gameId: gameStatistics.gameId,
          totalRounds: gameStatistics.totalRounds,
          totalBets: gameStatistics.totalBets,
          totalBetAmount: gameStatistics.totalBetAmount,
          totalPayoutAmount: gameStatistics.totalPayoutAmount,
          totalPlayers: gameStatistics.totalPlayers,
          revenue: gameStatistics.revenue,
        })
        .from(gameStatistics)
        .where(whereClause)
        .orderBy(desc(gameStatistics.date));

      // Calculate aggregates
      const [aggregates] = await db
        .select({
          totalRevenue: sql<number>`coalesce(sum(revenue), 0)`,
          totalBets: sql<number>`coalesce(sum(total_bets), 0)`,
          totalBetAmount: sql<number>`coalesce(sum(total_bet_amount), 0)`,
          totalPayoutAmount: sql<number>`coalesce(sum(total_payout_amount), 0)`,
          avgBetAmount: sql<number>`coalesce(avg(total_bet_amount / nullif(total_bets, 0)), 0)`,
          uniquePlayers: sql<number>`count(distinct game_id)`,
        })
        .from(gameStatistics)
        .where(whereClause);

      res.json({
        analytics,
        aggregates,
      });
    } catch (error) {
      console.error('Get game analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch game analytics' });
    }
  }

  // Get user analytics
  async getUserAnalytics(req: Request, res: Response) {
    try {
      const userId = req.params.userId || req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Check if admin viewing another user's analytics
      if (req.params.userId && req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const [stats] = await db
        .select()
        .from(userStatistics)
        .where(eq(userStatistics.userId, userId))
        .limit(1);

      if (!stats) {
        return res.json({
          statistics: {
            totalBets: 0,
            totalWins: 0,
            totalLosses: 0,
            totalBetAmount: '0.00',
            totalWinAmount: '0.00',
            biggestWin: '0.00',
            currentStreak: 0,
            longestStreak: 0,
          },
        });
      }

      // Get recent betting activity
      const recentBets = await db
        .select({
          date: sql<Date>`date(${bets.createdAt})`,
          totalBets: sql<number>`count(*)`,
          totalAmount: sql<number>`sum(${bets.amount})`,
          wins: sql<number>`count(*) filter (where ${bets.status} = 'won')`,
          losses: sql<number>`count(*) filter (where ${bets.status} = 'lost')`,
        })
        .from(bets)
        .where(
          and(
            eq(bets.userId, userId),
            gte(bets.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
          )
        )
        .groupBy(sql`date(${bets.createdAt})`)
        .orderBy(sql`date(${bets.createdAt}) desc`);

      res.json({
        statistics: stats,
        recentActivity: recentBets,
      });
    } catch (error) {
      console.error('Get user analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch user analytics' });
    }
  }

  // Get platform overview
  async getPlatformOverview(req: Request, res: Response) {
    try {
      // Check admin access
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const { startDate, endDate } = req.query;

      const start = startDate
        ? new Date(startDate as string)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      // Overall platform statistics
      const [platformStats] = await db
        .select({
          totalUsers: sql<number>`count(distinct ${users.id})`,
          activeUsers: sql<number>`count(distinct ${users.id}) filter (where ${users.status} = 'active')`,
          totalGames: sql<number>`count(distinct ${games.id})`,
          activeGames: sql<number>`count(distinct ${games.id}) filter (where ${games.status} = 'active')`,
        })
        .from(users)
        .fullJoin(games, sql`true`);

      // Transaction statistics
      const [transactionStats] = await db
        .select({
          totalDeposits: sql<number>`coalesce(sum(amount) filter (where type = 'deposit' and status = 'completed'), 0)`,
          totalWithdrawals: sql<number>`coalesce(sum(amount) filter (where type = 'withdrawal' and status = 'completed'), 0)`,
          pendingDeposits: sql<number>`count(*) filter (where type = 'deposit' and status = 'pending')`,
          pendingWithdrawals: sql<number>`count(*) filter (where type = 'withdrawal' and status = 'pending')`,
        })
        .from(transactions)
        .where(
          and(
            gte(transactions.createdAt, start),
            lte(transactions.createdAt, end)
          )
        );

      // Betting statistics
      const [bettingStats] = await db
        .select({
          totalBets: sql<number>`count(*)`,
          totalBetAmount: sql<number>`coalesce(sum(amount), 0)`,
          totalPayouts: sql<number>`coalesce(sum(payout_amount), 0)`,
          revenue: sql<number>`coalesce(sum(amount) - sum(payout_amount), 0)`,
          avgBetAmount: sql<number>`coalesce(avg(amount), 0)`,
        })
        .from(bets)
        .where(
          and(
            gte(bets.createdAt, start),
            lte(bets.createdAt, end)
          )
        );

      // Top games by revenue
      const topGames = await db
        .select({
          gameId: games.id,
          gameName: games.name,
          totalBets: sql<number>`count(${bets.id})`,
          totalAmount: sql<number>`coalesce(sum(${bets.amount}), 0)`,
          totalPayouts: sql<number>`coalesce(sum(${bets.payoutAmount}), 0)`,
          revenue: sql<number>`coalesce(sum(${bets.amount}) - sum(${bets.payoutAmount}), 0)`,
        })
        .from(games)
        .leftJoin(bets, eq(games.id, bets.gameId))
        .where(
          and(
            gte(bets.createdAt, start),
            lte(bets.createdAt, end)
          )
        )
        .groupBy(games.id, games.name)
        .orderBy(sql`revenue desc`)
        .limit(10);

      // Top players by bet amount
      const topPlayers = await db
        .select({
          userId: users.id,
          username: users.username,
          totalBets: sql<number>`count(${bets.id})`,
          totalAmount: sql<number>`coalesce(sum(${bets.amount}), 0)`,
          totalWins: sql<number>`count(*) filter (where ${bets.status} = 'won')`,
        })
        .from(users)
        .leftJoin(bets, eq(users.id, bets.userId))
        .where(
          and(
            gte(bets.createdAt, start),
            lte(bets.createdAt, end)
          )
        )
        .groupBy(users.id, users.username)
        .orderBy(sql`total_amount desc`)
        .limit(10);

      res.json({
        platform: platformStats,
        transactions: transactionStats,
        betting: bettingStats,
        topGames,
        topPlayers,
      });
    } catch (error) {
      console.error('Get platform overview error:', error);
      res.status(500).json({ error: 'Failed to fetch platform overview' });
    }
  }

  // Get real-time statistics
  async getRealtimeStats(req: Request, res: Response) {
    try {
      // Check admin access
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      // Last 5 minutes stats
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      const [realtimeStats] = await db
        .select({
          activePlayers: sql<number>`count(distinct ${bets.userId})`,
          totalBets: sql<number>`count(*)`,
          totalBetAmount: sql<number>`coalesce(sum(${bets.amount}), 0)`,
        })
        .from(bets)
        .where(gte(bets.createdAt, fiveMinutesAgo));

      // Active games
      const activeGames = await db
        .select({
          gameId: games.id,
          gameName: games.name,
          activePlayers: sql<number>`count(distinct ${bets.userId})`,
        })
        .from(games)
        .leftJoin(bets, eq(games.id, bets.gameId))
        .where(
          and(
            eq(games.status, 'active'),
            gte(bets.createdAt, fiveMinutesAgo)
          )
        )
        .groupBy(games.id, games.name);

      res.json({
        realtime: realtimeStats,
        activeGames,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Get realtime stats error:', error);
      res.status(500).json({ error: 'Failed to fetch realtime statistics' });
    }
  }

  // Get revenue trends
  async getRevenueTrends(req: Request, res: Response) {
    try {
      // Check admin access
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const { startDate, endDate, groupBy = 'day' } = req.query;

      const start = startDate
        ? new Date(startDate as string)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      const revenueTrends = await db
        .select({
          period: sql<string>`date_trunc(${groupBy}, ${gameStatistics.date})`,
          totalRevenue: sql<number>`coalesce(sum(revenue), 0)`,
          totalBets: sql<number>`coalesce(sum(total_bets), 0)`,
          totalBetAmount: sql<number>`coalesce(sum(total_bet_amount), 0)`,
          totalPayoutAmount: sql<number>`coalesce(sum(total_payout_amount), 0)`,
        })
        .from(gameStatistics)
        .where(
          and(
            gte(gameStatistics.date, start),
            lte(gameStatistics.date, end)
          )
        )
        .groupBy(sql`date_trunc(${groupBy}, ${gameStatistics.date})`)
        .orderBy(sql`date_trunc(${groupBy}, ${gameStatistics.date})`);

      res.json({ trends: revenueTrends });
    } catch (error) {
      console.error('Get revenue trends error:', error);
      res.status(500).json({ error: 'Failed to fetch revenue trends' });
    }
  }
}

export const analyticsController = new AnalyticsController();