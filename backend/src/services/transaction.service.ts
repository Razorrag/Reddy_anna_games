import { db } from '../db';
import { transactions, users, deposits, withdrawals } from '../db/schema';
import { eq, sql } from 'drizzle-orm';

export class TransactionService {
  // Process deposit
  async processDeposit(
    userId: string,
    amount: number,
    paymentMethod: string,
    transactionId?: string
  ) {
    try {
      // Get user balance before transaction
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        throw new Error('User not found');
      }

      // Create transaction record
      const [transaction] = await db
        .insert(transactions)
        .values({
          userId,
          type: 'deposit',
          amount: amount.toString(),
          balanceBefore: user.balance,
          balanceAfter: sql`${user.balance} + ${amount}`,
          status: 'completed',
          description: `Deposit via ${paymentMethod}`,
          metadata: JSON.stringify({ paymentMethod, transactionId }),
        })
        .returning();

      // Update user balance
      await db
        .update(users)
        .set({
          balance: sql`${users.balance} + ${amount}`,
        })
        .where(eq(users.id, userId));

      return transaction;
    } catch (error) {
      console.error('Process deposit error:', error);
      throw error;
    }
  }

  // Process withdrawal
  async processWithdrawal(userId: string, amount: number, withdrawalMethod: string) {
    try {
      // Get user balance
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        throw new Error('User not found');
      }

      const balance = parseFloat(user.balance);
      if (balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Create transaction record
      const [transaction] = await db
        .insert(transactions)
        .values({
          userId,
          type: 'withdrawal',
          amount: amount.toString(),
          balanceBefore: user.balance,
          balanceAfter: sql`${user.balance} - ${amount}`,
          status: 'pending',
          description: `Withdrawal via ${withdrawalMethod}`,
          metadata: JSON.stringify({ withdrawalMethod }),
        })
        .returning();

      // Deduct from user balance
      await db
        .update(users)
        .set({
          balance: sql`${users.balance} - ${amount}`,
        })
        .where(eq(users.id, userId));

      return transaction;
    } catch (error) {
      console.error('Process withdrawal error:', error);
      throw error;
    }
  }

  // Process bet transaction
  async processBet(userId: string, amount: number, betId: string) {
    try {
      // Get user balance
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        throw new Error('User not found');
      }

      const balance = parseFloat(user.balance);
      if (balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Create transaction record
      const [transaction] = await db
        .insert(transactions)
        .values({
          userId,
          type: 'bet',
          amount: amount.toString(),
          balanceBefore: user.balance,
          balanceAfter: sql`${user.balance} - ${amount}`,
          status: 'completed',
          referenceId: betId,
          referenceType: 'bet',
          description: 'Bet placed',
        })
        .returning();

      // Deduct from user balance
      await db
        .update(users)
        .set({
          balance: sql`${users.balance} - ${amount}`,
        })
        .where(eq(users.id, userId));

      return transaction;
    } catch (error) {
      console.error('Process bet error:', error);
      throw error;
    }
  }

  // Process win transaction
  async processWin(userId: string, amount: number, betId: string) {
    try {
      // Get user balance
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        throw new Error('User not found');
      }

      // Create transaction record
      const [transaction] = await db
        .insert(transactions)
        .values({
          userId,
          type: 'win',
          amount: amount.toString(),
          balanceBefore: user.balance,
          balanceAfter: sql`${user.balance} + ${amount}`,
          status: 'completed',
          referenceId: betId,
          referenceType: 'bet',
          description: 'Bet won',
        })
        .returning();

      // Add to user balance
      await db
        .update(users)
        .set({
          balance: sql`${users.balance} + ${amount}`,
        })
        .where(eq(users.id, userId));

      return transaction;
    } catch (error) {
      console.error('Process win error:', error);
      throw error;
    }
  }

  // Process bonus transaction
  async processBonus(userId: string, amount: number, bonusType: string, description: string) {
    try {
      // Get user balance
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        throw new Error('User not found');
      }

      // Create transaction record
      const [transaction] = await db
        .insert(transactions)
        .values({
          userId,
          type: 'bonus',
          amount: amount.toString(),
          balanceBefore: user.balance,
          balanceAfter: sql`${user.balance} + ${amount}`,
          status: 'completed',
          description,
          metadata: JSON.stringify({ bonusType }),
        })
        .returning();

      // Add to user bonus balance
      await db
        .update(users)
        .set({
          bonusBalance: sql`${users.bonusBalance} + ${amount}`,
        })
        .where(eq(users.id, userId));

      return transaction;
    } catch (error) {
      console.error('Process bonus error:', error);
      throw error;
    }
  }

  // Process commission transaction
  async processCommission(userId: string, amount: number, referenceId: string) {
    try {
      // Get user balance
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        throw new Error('User not found');
      }

      // Create transaction record
      const [transaction] = await db
        .insert(transactions)
        .values({
          userId,
          type: 'commission',
          amount: amount.toString(),
          balanceBefore: user.balance,
          balanceAfter: sql`${user.balance} + ${amount}`,
          status: 'completed',
          referenceId,
          referenceType: 'commission',
          description: 'Partner commission',
        })
        .returning();

      // Add to user balance
      await db
        .update(users)
        .set({
          balance: sql`${users.balance} + ${amount}`,
        })
        .where(eq(users.id, userId));

      return transaction;
    } catch (error) {
      console.error('Process commission error:', error);
      throw error;
    }
  }

  // Process refund transaction
  async processRefund(userId: string, amount: number, referenceId: string, reason: string) {
    try {
      // Get user balance
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        throw new Error('User not found');
      }

      // Create transaction record
      const [transaction] = await db
        .insert(transactions)
        .values({
          userId,
          type: 'refund',
          amount: amount.toString(),
          balanceBefore: user.balance,
          balanceAfter: sql`${user.balance} + ${amount}`,
          status: 'completed',
          referenceId,
          referenceType: 'refund',
          description: `Refund: ${reason}`,
        })
        .returning();

      // Add to user balance
      await db
        .update(users)
        .set({
          balance: sql`${users.balance} + ${amount}`,
        })
        .where(eq(users.id, userId));

      return transaction;
    } catch (error) {
      console.error('Process refund error:', error);
      throw error;
    }
  }

  // Get user balance
  async getUserBalance(userId: string) {
    try {
      const [user] = await db
        .select({
          balance: users.balance,
          bonusBalance: users.bonusBalance,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        throw new Error('User not found');
      }

      return {
        balance: parseFloat(user.balance),
        bonusBalance: parseFloat(user.bonusBalance),
        totalBalance: parseFloat(user.balance) + parseFloat(user.bonusBalance),
      };
    } catch (error) {
      console.error('Get user balance error:', error);
      throw error;
    }
  }

  // Validate transaction
  async validateTransaction(userId: string, amount: number, type: 'bet' | 'withdrawal') {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        return { valid: false, reason: 'User not found' };
      }

      if (user.status !== 'active') {
        return { valid: false, reason: 'User account is not active' };
      }

      const balance = parseFloat(user.balance);
      if (balance < amount) {
        return { valid: false, reason: 'Insufficient balance' };
      }

      // Additional checks based on type
      if (type === 'withdrawal') {
        if (amount < 500) {
          return { valid: false, reason: 'Minimum withdrawal amount is ₹500' };
        }
        if (amount > 50000) {
          return { valid: false, reason: 'Maximum withdrawal amount is ₹50,000' };
        }
      }

      if (type === 'bet') {
        if (amount < 10) {
          return { valid: false, reason: 'Minimum bet amount is ₹10' };
        }
        if (amount > 10000) {
          return { valid: false, reason: 'Maximum bet amount is ₹10,000' };
        }
      }

      return { valid: true };
    } catch (error) {
      console.error('Validate transaction error:', error);
      return { valid: false, reason: 'Validation error' };
    }
  }
}

export const transactionService = new TransactionService();