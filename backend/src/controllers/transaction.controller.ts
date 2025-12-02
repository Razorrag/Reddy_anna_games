import { Request, Response } from 'express';
import { db } from '../db';
import { transactions, users, deposits, withdrawals } from '../db/schema';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';

export class TransactionController {
  // Get user transactions
  async getUserTransactions(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const {
        page = '1',
        limit = '20',
        type,
        status,
        startDate,
        endDate,
      } = req.query;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      let conditions = [eq(transactions.userId, userId)];

      if (type) {
        conditions.push(eq(transactions.type, type as any));
      }

      if (status) {
        conditions.push(eq(transactions.status, status as any));
      }

      if (startDate) {
        conditions.push(gte(transactions.createdAt, new Date(startDate as string)));
      }

      if (endDate) {
        conditions.push(lte(transactions.createdAt, new Date(endDate as string)));
      }

      const whereClause = and(...conditions);

      const [result, countResult] = await Promise.all([
        db
          .select()
          .from(transactions)
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
      console.error('Get user transactions error:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  }

  // Create deposit request
  async createDeposit(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { amount, paymentMethod, transactionId, screenshotUrl } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!amount || amount < 100) {
        return res.status(400).json({ error: 'Minimum deposit amount is ₹100' });
      }

      // Create deposit record
      const [deposit] = await db
        .insert(deposits)
        .values({
          userId,
          amount: amount.toString(),
          paymentMethod,
          transactionId,
          screenshotUrl,
          status: 'pending',
        })
        .returning();

      // Create transaction record
      await db.insert(transactions).values({
        userId,
        type: 'deposit',
        amount: amount.toString(),
        status: 'pending',
        referenceId: deposit.id,
        referenceType: 'deposit',
        description: `Deposit request via ${paymentMethod}`,
      });

      res.json({ deposit });
    } catch (error) {
      console.error('Create deposit error:', error);
      res.status(500).json({ error: 'Failed to create deposit request' });
    }
  }

  // Get user deposits
  async getUserDeposits(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { page = '1', limit = '20', status } = req.query;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      let conditions = [eq(deposits.userId, userId)];

      if (status) {
        conditions.push(eq(deposits.status, status as any));
      }

      const whereClause = and(...conditions);

      const [result, countResult] = await Promise.all([
        db
          .select()
          .from(deposits)
          .where(whereClause)
          .orderBy(desc(deposits.createdAt))
          .limit(limitNum)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(deposits)
          .where(whereClause),
      ]);

      res.json({
        deposits: result,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: countResult[0]?.count || 0,
          totalPages: Math.ceil((countResult[0]?.count || 0) / limitNum),
        },
      });
    } catch (error) {
      console.error('Get user deposits error:', error);
      res.status(500).json({ error: 'Failed to fetch deposits' });
    }
  }

  // Create withdrawal request
  async createWithdrawal(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const {
        amount,
        withdrawalMethod,
        bankName,
        accountNumber,
        ifscCode,
        upiId,
      } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!amount || amount < 500) {
        return res.status(400).json({ error: 'Minimum withdrawal amount is ₹500' });
      }

      // Check user balance
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const balance = parseFloat(user.balance);
      if (balance < amount) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }

      // Deduct amount from balance
      await db
        .update(users)
        .set({
          balance: sql`${users.balance} - ${amount}`,
        })
        .where(eq(users.id, userId));

      // Create withdrawal record
      const [withdrawal] = await db
        .insert(withdrawals)
        .values({
          userId,
          amount: amount.toString(),
          withdrawalMethod,
          bankName,
          accountNumber,
          ifscCode,
          upiId,
          status: 'pending',
        })
        .returning();

      // Create transaction record
      const [userAfterUpdate] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      await db.insert(transactions).values({
        userId,
        type: 'withdrawal',
        amount: amount.toString(),
        balanceBefore: user.balance,
        balanceAfter: userAfterUpdate.balance,
        status: 'pending',
        referenceId: withdrawal.id,
        referenceType: 'withdrawal',
        description: `Withdrawal request via ${withdrawalMethod}`,
      });

      res.json({ withdrawal });
    } catch (error) {
      console.error('Create withdrawal error:', error);
      res.status(500).json({ error: 'Failed to create withdrawal request' });
    }
  }

  // Get user withdrawals
  async getUserWithdrawals(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { page = '1', limit = '20', status } = req.query;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      let conditions = [eq(withdrawals.userId, userId)];

      if (status) {
        conditions.push(eq(withdrawals.status, status as any));
      }

      const whereClause = and(...conditions);

      const [result, countResult] = await Promise.all([
        db
          .select()
          .from(withdrawals)
          .where(whereClause)
          .orderBy(desc(withdrawals.createdAt))
          .limit(limitNum)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(withdrawals)
          .where(whereClause),
      ]);

      res.json({
        withdrawals: result,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: countResult[0]?.count || 0,
          totalPages: Math.ceil((countResult[0]?.count || 0) / limitNum),
        },
      });
    } catch (error) {
      console.error('Get user withdrawals error:', error);
      res.status(500).json({ error: 'Failed to fetch withdrawals' });
    }
  }

  // Get transaction summary
  async getTransactionSummary(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const [summary] = await db
        .select({
          totalDeposits: sql<number>`coalesce(sum(amount) filter (where type = 'deposit' and status = 'completed'), 0)`,
          totalWithdrawals: sql<number>`coalesce(sum(amount) filter (where type = 'withdrawal' and status = 'completed'), 0)`,
          totalBets: sql<number>`coalesce(sum(amount) filter (where type = 'bet'), 0)`,
          totalWins: sql<number>`coalesce(sum(amount) filter (where type = 'win'), 0)`,
          pendingDeposits: sql<number>`coalesce(sum(amount) filter (where type = 'deposit' and status = 'pending'), 0)`,
          pendingWithdrawals: sql<number>`coalesce(sum(amount) filter (where type = 'withdrawal' and status = 'pending'), 0)`,
        })
        .from(transactions)
        .where(eq(transactions.userId, userId));

      res.json({ summary });
    } catch (error) {
      console.error('Get transaction summary error:', error);
      res.status(500).json({ error: 'Failed to fetch transaction summary' });
    }
  }
}

export const transactionController = new TransactionController();