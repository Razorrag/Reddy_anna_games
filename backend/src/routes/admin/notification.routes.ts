import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../../db';
import {
  transactions,
  users,
  gameRounds,
  partners,
  partnerCommissions
} from '../../db/schema';
import { eq, and, gte, desc, sql, count } from 'drizzle-orm';

const router = Router();

/**
 * GET /api/admin/notifications/summary
 * Get real-time summary of all notification categories
 */
router.get('/summary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last1Hour = new Date(now.getTime() - 60 * 60 * 1000);

    // Get pending deposits
    const pendingDeposits = await db
      .select({
        count: count(),
        latest: sql<{
          amount: number;
          createdAt: Date;
          userId: string;
        }>`json_build_object(
          'amount', ${transactions.amount},
          'createdAt', ${transactions.createdAt},
          'userId', ${transactions.userId}
        )`
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.type, 'deposit'),
          eq(transactions.status, 'pending')
        )
      )
      .orderBy(desc(transactions.createdAt))
      .limit(1);

    // Get pending withdrawals
    const pendingWithdrawals = await db
      .select({
        count: count(),
        latest: sql<{
          amount: number;
          createdAt: Date;
          userId: string;
        }>`json_build_object(
          'amount', ${transactions.amount},
          'createdAt', ${transactions.createdAt},
          'userId', ${transactions.userId}
        )`
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.type, 'withdrawal'),
          eq(transactions.status, 'pending')
        )
      )
      .orderBy(desc(transactions.createdAt))
      .limit(1);

    // Get active games (in betting or playing state)
    const activeGamesCount = await db
      .select({ count: count() })
      .from(gameRounds)
      .where(
        sql`${gameRounds.status} IN ('betting', 'playing')`
      );

    // Get new signups in last 24 hours
    const newSignupsCount = await db
      .select({ count: count() })
      .from(users)
      .where(
        and(
          gte(users.createdAt, last24Hours),
          eq(users.role, 'player')
        )
      );

    // Get suspended partner applications (no pending status in current schema)
    const pendingPartnersCount = await db
      .select({ count: count() })
      .from(partners)
      .where(eq(partners.status, 'suspended'));

    // Get pending partner commissions
    const pendingCommissionsCount = await db
      .select({ count: count() })
      .from(partnerCommissions)
      .where(eq(partnerCommissions.status, 'pending'));

    // Calculate system health (simple heuristic)
    const recentErrors = 0; // TODO: Implement error tracking
    const systemHealth = recentErrors < 10 ? 'healthy' : recentErrors < 50 ? 'warning' : 'error';

    // Get WebSocket connections count from global state (if available)
    // @ts-ignore - WebSocket server is attached to app in server.ts
    const wsConnections = req.app.get('wsConnections') || 0;

    // Calculate error rate (placeholder - implement proper error tracking)
    const errorRate = 0.1; // 0.1%

    const summary = {
      deposits: {
        count: Number(pendingDeposits[0]?.count || 0),
        latest: pendingDeposits[0]?.latest ? {
          amount: Number(pendingDeposits[0].latest.amount),
          time: new Date(pendingDeposits[0].latest.createdAt).toLocaleTimeString('en-IN'),
          userId: pendingDeposits[0].latest.userId,
        } : undefined,
      },
      withdrawals: {
        count: Number(pendingWithdrawals[0]?.count || 0),
        latest: pendingWithdrawals[0]?.latest ? {
          amount: Number(pendingWithdrawals[0].latest.amount),
          time: new Date(pendingWithdrawals[0].latest.createdAt).toLocaleTimeString('en-IN'),
          userId: pendingWithdrawals[0].latest.userId,
        } : undefined,
      },
      activeGames: Number(activeGamesCount[0]?.count || 0),
      newSignups: Number(newSignupsCount[0]?.count || 0),
      partnerPending: Number(pendingPartnersCount[0]?.count || 0) + Number(pendingCommissionsCount[0]?.count || 0),
      systemHealth,
      websocketConnections: wsConnections,
      errorRate,
    };

    res.json(summary);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/notifications/history
 * Get notification history with pagination
 */
router.get('/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '50', category, urgency } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // TODO: Implement notification history table
    // For now, return recent events from various tables
    
    const recentDeposits = await db
      .select({
        id: transactions.id,
        type: sql<string>`'deposit_request'`,
        amount: transactions.amount,
        userId: transactions.userId,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.type, 'deposit'),
          eq(transactions.status, 'pending')
        )
      )
      .orderBy(desc(transactions.createdAt))
      .limit(10);

    const recentWithdrawals = await db
      .select({
        id: transactions.id,
        type: sql<string>`'withdrawal_request'`,
        amount: transactions.amount,
        userId: transactions.userId,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.type, 'withdrawal'),
          eq(transactions.status, 'pending')
        )
      )
      .orderBy(desc(transactions.createdAt))
      .limit(10);

    const notifications = [...recentDeposits, ...recentWithdrawals]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limitNum);

    res.json({
      notifications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: notifications.length,
        hasMore: false,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/notifications/:id/read
 * Mark a notification as read
 */
router.post('/:id/read', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // TODO: Implement notification read status tracking
    // For now, just return success
    
    res.json({ 
      success: true,
      message: 'Notification marked as read',
      id,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/notifications/read-all
 * Mark all notifications as read
 */
router.post('/read-all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: Implement bulk read status update
    
    res.json({ 
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
});

export default router;