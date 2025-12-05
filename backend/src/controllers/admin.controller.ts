import { Request, Response } from 'express';
import { db } from '../db';
import { users, games, bets, transactions, gameStatistics } from '../db/schema';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export class AdminController {
  // Get dashboard statistics - FIXED to match frontend expectations
  async getDashboard(req: Request, res: Response) {
    try {
      // User stats
      const [userStats] = await db
        .select({
          totalUsers: sql<number>`count(*)`,
          activeUsers: sql<number>`count(*) filter (where status = 'active')`,
        })
        .from(users);

      // Partner stats
      const [partnerStats] = await db
        .select({
          totalPartners: sql<number>`count(*) filter (where role = 'partner')`,
          activePartners: sql<number>`count(*) filter (where role = 'partner' and status = 'active')`,
        })
        .from(users);

      // Revenue stats (from transactions)
      const [revenueStats] = await db
        .select({
          totalRevenue: sql<number>`coalesce(sum(amount) filter (where type = 'deposit' and status = 'approved'), 0)`,
          totalPayouts: sql<number>`coalesce(sum(amount) filter (where type = 'withdrawal' and status = 'approved'), 0)`,
          pendingDeposits: sql<number>`count(*) filter (where type = 'deposit' and status = 'pending')`,
          pendingWithdrawals: sql<number>`count(*) filter (where type = 'withdrawal' and status = 'pending')`,
        })
        .from(transactions);

      // Today's stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const [todayStats] = await db
        .select({
          todayRevenue: sql<number>`coalesce(sum(amount) filter (where type = 'deposit' and status = 'approved' and created_at >= ${today}), 0)`,
          todayNewUsers: sql<number>`count(*) filter (where created_at >= ${today})`,
        })
        .from(transactions);

      const [todayBets] = await db
        .select({
          todayActiveBets: sql<number>`count(*)`,
        })
        .from(bets)
        .where(gte(bets.createdAt, today));

      // Monthly revenue (last 30 days)
      const monthlyRevenue = await db
        .select({
          date: sql<string>`date(created_at)`,
          revenue: sql<number>`coalesce(sum(amount) filter (where type = 'deposit' and status = 'approved'), 0)`,
        })
        .from(transactions)
        .where(gte(transactions.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)))
        .groupBy(sql`date(created_at)`)
        .orderBy(sql`date(created_at)`);

      // Top games
      const topGames = await db
        .select({
          gameId: games.id,
          gameName: games.name,
          totalBets: sql<number>`count(${bets.id})`,
          totalRevenue: sql<number>`coalesce(sum(${bets.amount}), 0)`,
        })
        .from(games)
        .leftJoin(bets, eq(games.id, bets.gameId))
        .groupBy(games.id, games.name)
        .orderBy(desc(sql`count(${bets.id})`))
        .limit(5);

      // Return in expected format
      res.json({
        totalUsers: userStats.totalUsers || 0,
        activeUsers: userStats.activeUsers || 0,
        totalPartners: partnerStats.totalPartners || 0,
        activePartners: partnerStats.activePartners || 0,
        totalRevenue: revenueStats.totalRevenue || 0,
        totalPayouts: revenueStats.totalPayouts || 0,
        pendingDeposits: revenueStats.pendingDeposits || 0,
        pendingWithdrawals: revenueStats.pendingWithdrawals || 0,
        todayRevenue: todayStats.todayRevenue || 0,
        todayNewUsers: todayStats.todayNewUsers || 0,
        todayActiveBets: todayBets.todayActiveBets || 0,
        monthlyRevenue: monthlyRevenue || [],
        topGames: topGames || [],
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
  }

  // Get all users with pagination and filters
  async getUsers(req: Request, res: Response) {
    try {
      const {
        page = '1',
        limit = '20',
        status,
        role,
        search,
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      let conditions = [];
      
      if (status) {
        conditions.push(eq(users.status, status as any));
      }
      
      if (role) {
        conditions.push(eq(users.role, role as any));
      }

      if (search) {
        conditions.push(
          sql`${users.username} ilike ${'%' + search + '%'} or ${users.email} ilike ${'%' + search + '%'}`
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [result, countResult] = await Promise.all([
        db
          .select()
          .from(users)
          .where(whereClause)
          .orderBy(desc(users.createdAt))
          .limit(limitNum)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(users)
          .where(whereClause),
      ]);

      res.json({
        users: result,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: countResult[0]?.count || 0,
          totalPages: Math.ceil((countResult[0]?.count || 0) / limitNum),
        },
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  // Get single user details
  async getUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get user statistics
      const [betStats] = await db
        .select({
          totalBets: sql<number>`count(*)`,
          totalBetAmount: sql<number>`coalesce(sum(amount), 0)`,
          totalWinnings: sql<number>`coalesce(sum(payout_amount), 0)`,
        })
        .from(bets)
        .where(eq(bets.userId, id));

      const [transactionStats] = await db
        .select({
          totalDeposits: sql<number>`coalesce(sum(amount) filter (where type = 'deposit'), 0)`,
          totalWithdrawals: sql<number>`coalesce(sum(amount) filter (where type = 'withdrawal'), 0)`,
        })
        .from(transactions)
        .where(eq(transactions.userId, id));

      res.json({
        user,
        statistics: {
          bets: betStats,
          transactions: transactionStats,
        },
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to fetch user details' });
    }
  }

  // Update user
  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Don't allow updating password through this endpoint
      delete updateData.password;
      delete updateData.id;

      const [updated] = await db
        .update(users)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user: updated });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  }

  // Ban/unban user
  async updateUserStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;

      if (!['active', 'banned', 'suspended'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const [updated] = await db
        .update(users)
        .set({
          status,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Log the status change in game statistics
      // This could be a separate audit log table in production
      console.log('User status changed:', {
        userId: id,
        newStatus: status,
        reason,
        changedBy: req.user?.id,
      });

      res.json({ user: updated });
    } catch (error) {
      console.error('Update user status error:', error);
      res.status(500).json({ error: 'Failed to update user status' });
    }
  }

  // Get all games with filters
  async getGames(req: Request, res: Response) {
    try {
      const {
        page = '1',
        limit = '20',
        status,
        gameType,
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      let conditions = [];
      
      if (status) {
        conditions.push(eq(games.status, status as any));
      }
      
      if (gameType) {
        conditions.push(eq(games.name, gameType as any));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [result, countResult] = await Promise.all([
        db
          .select()
          .from(games)
          .where(whereClause)
          .orderBy(desc(games.createdAt))
          .limit(limitNum)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(games)
          .where(whereClause),
      ]);

      res.json({
        games: result,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: countResult[0]?.count || 0,
          totalPages: Math.ceil((countResult[0]?.count || 0) / limitNum),
        },
      });
    } catch (error) {
      console.error('Get games error:', error);
      res.status(500).json({ error: 'Failed to fetch games' });
    }
  }

  // Get game details
  async getGame(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const [game] = await db
        .select()
        .from(games)
        .where(eq(games.id, id))
        .limit(1);

      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }

      // Get bets for this game
      const gameBets = await db
        .select({
          bet: bets,
          user: {
            id: users.id,
            username: users.username,
          },
        })
        .from(bets)
        .leftJoin(users, eq(bets.userId, users.id))
        .where(eq(bets.gameId, id))
        .orderBy(desc(bets.createdAt));

      const [betStats] = await db
        .select({
          totalBets: sql<number>`count(*)`,
          totalAmount: sql<number>`coalesce(sum(amount), 0)`,
          totalPayouts: sql<number>`coalesce(sum(payout_amount), 0)`,
        })
        .from(bets)
        .where(eq(bets.gameId, id));

      res.json({
        game,
        bets: gameBets,
        statistics: betStats,
      });
    } catch (error) {
      console.error('Get game error:', error);
      res.status(500).json({ error: 'Failed to fetch game details' });
    }
  }

  // Get transactions with filters
  async getTransactions(req: Request, res: Response) {
    try {
      const {
        page = '1',
        limit = '20',
        type,
        status,
        userId,
        startDate,
        endDate,
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      let conditions = [];
      
      if (type) {
        conditions.push(eq(transactions.type, type as any));
      }
      
      if (status) {
        conditions.push(eq(transactions.status, status as any));
      }
      
      if (userId) {
        conditions.push(eq(transactions.userId, userId as string));
      }

      if (startDate) {
        conditions.push(gte(transactions.createdAt, new Date(startDate as string)));
      }

      if (endDate) {
        conditions.push(lte(transactions.createdAt, new Date(endDate as string)));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [result, countResult] = await Promise.all([
        db
          .select({
            transaction: transactions,
            user: {
              id: users.id,
              username: users.username,
              email: users.email,
            },
          })
          .from(transactions)
          .leftJoin(users, eq(transactions.userId, users.id))
          .where(whereClause)
          .orderBy(desc(transactions.createdAt))
          .limit(limitNum)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(transactions)
          .where(whereClause),
      ]);

      res.json({
        transactions: result,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: countResult[0]?.count || 0,
          totalPages: Math.ceil((countResult[0]?.count || 0) / limitNum),
        },
      });
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  }

  // Approve/reject withdrawal
  async updateTransaction(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;

      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const [transaction] = await db
        .select()
        .from(transactions)
        .where(eq(transactions.id, id))
        .limit(1);

      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      if (transaction.status !== 'pending') {
        return res.status(400).json({ error: 'Transaction already processed' });
      }

      // If rejecting withdrawal, refund the amount
      if (status === 'rejected' && transaction.type === 'withdrawal') {
        await db
          .update(users)
          .set({
            balance: sql`${users.balance} + ${transaction.amount}`,
          })
          .where(eq(users.id, transaction.userId));
      }

      const [updated] = await db
        .update(transactions)
        .set({
          status,
        })
        .where(eq(transactions.id, id))
        .returning();

      // Log the transaction update
      // This could be a separate audit log table in production
      console.log('Transaction updated:', {
        transactionId: id,
        newStatus: status,
        reason,
        approvedBy: req.user?.id,
      });

      res.json({ transaction: updated });
    } catch (error) {
      console.error('Update transaction error:', error);
      res.status(500).json({ error: 'Failed to update transaction' });
    }
  }

  // Get system settings
  async getSettings(req: Request, res: Response) {
    try {
      // This would fetch from a settings table
      // For now, return placeholder
      res.json({
        minBetAmount: 10,
        maxBetAmount: 10000,
        minWithdrawal: 100,
        maxWithdrawal: 50000,
        referralBonus: 50,
        signupBonus: 100,
        maintenanceMode: false,
      });
    } catch (error) {
      console.error('Get settings error:', error);
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  }

  // Update system settings

  // Get deposits with proper format for frontend
  async getDeposits(req: Request, res: Response) {
    try {
      const { page = '1', limit = '20', status, userId } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      let conditions = [eq(transactions.type, 'deposit')];
      
      if (status) conditions.push(eq(transactions.status, status as any));
      if (userId) conditions.push(eq(transactions.userId, userId as string));

      const whereClause = and(...conditions);

      const [result, countResult, statusCounts] = await Promise.all([
        db
          .select({
            transaction: transactions,
            user: {
              id: users.id,
              username: users.username,
              email: users.email,
              phoneNumber: users.phoneNumber,
            },
          })
          .from(transactions)
          .leftJoin(users, eq(transactions.userId, users.id))
          .where(whereClause)
          .orderBy(desc(transactions.createdAt))
          .limit(limitNum)
          .offset(offset),
        
        db
          .select({ count: sql<number>`count(*)` })
          .from(transactions)
          .where(whereClause),
        
        db
          .select({
            pendingCount: sql<number>`count(*) filter (where status = 'pending')`,
            approvedCount: sql<number>`count(*) filter (where status = 'approved')`,
            rejectedCount: sql<number>`count(*) filter (where status = 'rejected')`,
          })
          .from(transactions)
          .where(eq(transactions.type, 'deposit')),
      ]);

      const total = countResult[0]?.count || 0;

      res.json({
        deposits: result,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        pendingCount: statusCounts[0]?.pendingCount || 0,
        approvedCount: statusCounts[0]?.approvedCount || 0,
        rejectedCount: statusCounts[0]?.rejectedCount || 0,
      });
    } catch (error) {
      console.error('Get deposits error:', error);
      res.status(500).json({ error: 'Failed to fetch deposits' });
    }
  }

  // Get withdrawals with proper format for frontend
  async getWithdrawals(req: Request, res: Response) {
    try {
      const { page = '1', limit = '20', status, userId } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      let conditions = [eq(transactions.type, 'withdrawal')];
      
      if (status) conditions.push(eq(transactions.status, status as any));
      if (userId) conditions.push(eq(transactions.userId, userId as string));

      const whereClause = and(...conditions);

      const [result, countResult, statusCounts] = await Promise.all([
        db
          .select({
            transaction: transactions,
            user: {
              id: users.id,
              username: users.username,
              email: users.email,
              phoneNumber: users.phoneNumber,
            },
          })
          .from(transactions)
          .leftJoin(users, eq(transactions.userId, users.id))
          .where(whereClause)
          .orderBy(desc(transactions.createdAt))
          .limit(limitNum)
          .offset(offset),
        
        db
          .select({ count: sql<number>`count(*)` })
          .from(transactions)
          .where(whereClause),
        
        db
          .select({
            pendingCount: sql<number>`count(*) filter (where status = 'pending')`,
            approvedCount: sql<number>`count(*) filter (where status = 'approved')`,
            rejectedCount: sql<number>`count(*) filter (where status = 'rejected')`,
          })
          .from(transactions)
          .where(eq(transactions.type, 'withdrawal')),
      ]);

      const total = countResult[0]?.count || 0;

      res.json({
        withdrawals: result,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        pendingCount: statusCounts[0]?.pendingCount || 0,
        approvedCount: statusCounts[0]?.approvedCount || 0,
        rejectedCount: statusCounts[0]?.rejectedCount || 0,
      });
    } catch (error) {
      console.error('Get withdrawals error:', error);
      res.status(500).json({ error: 'Failed to fetch withdrawals' });
    }
  }
  async updateSettings(req: Request, res: Response) {
    try {
      const settings = req.body;

      // This would update a settings table
      // For now, return the settings back
      res.json({ settings });
    } catch (error) {
      console.error('Update settings error:', error);
      res.status(500).json({ error: 'Failed to update settings' });
    }
  }

  // Get analytics data
  async getAnalytics(req: Request, res: Response) {
    try {
      const { startDate, endDate, groupBy = 'day' } = req.query;

      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      // Get daily/weekly/monthly aggregates
      const timeSeriesData = await db
        .select({
          period: sql<string>`date_trunc(${groupBy}, ${games.createdAt})`,
          totalGames: sql<number>`count(distinct ${games.id})`,
          totalBets: sql<number>`count(distinct ${bets.id})`,
          totalBetAmount: sql<number>`coalesce(sum(${bets.amount}), 0)`,
          totalPayouts: sql<number>`coalesce(sum(${bets.payoutAmount}), 0)`,
          uniquePlayers: sql<number>`count(distinct ${bets.userId})`,
        })
        .from(games)
        .leftJoin(bets, eq(games.id, bets.gameId))
        .where(
          and(
            gte(games.createdAt, start),
            lte(games.createdAt, end)
          )
        )
        .groupBy(sql`date_trunc(${groupBy}, ${games.createdAt})`)
        .orderBy(sql`date_trunc(${groupBy}, ${games.createdAt})`);

      res.json({ analytics: timeSeriesData });
    } catch (error) {
      console.error('Get analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  }
}

export const adminController = new AdminController();