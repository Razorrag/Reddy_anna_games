import { db } from '../db';
import {
  users,
  games,
  bets,
  transactions,
  deposits,
  withdrawals,
  partners,
  gameRounds,
} from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export class AdminService {
  // Approve deposit
  async approveDeposit(depositId: string, adminId: string) {
    try {
      // Get deposit
      const [deposit] = await db
        .select()
        .from(deposits)
        .where(eq(deposits.id, depositId))
        .limit(1);

      if (!deposit) {
        throw new Error('Deposit not found');
      }

      if (deposit.status !== 'pending') {
        throw new Error('Deposit already processed');
      }

      // Update user balance
      await db
        .update(users)
        .set({
          balance: sql`${users.balance} + ${deposit.amount}`,
        })
        .where(eq(users.id, deposit.userId));

      // Update deposit status
      const [updatedDeposit] = await db
        .update(deposits)
        .set({
          status: 'completed',
          approvedBy: adminId,
          approvedAt: new Date(),
        })
        .where(eq(deposits.id, depositId))
        .returning();

      // Update transaction
      await db
        .update(transactions)
        .set({
          status: 'completed',
        })
        .where(
          sql`${transactions.referenceId} = ${depositId} AND ${transactions.referenceType} = 'deposit'`
        );

      return updatedDeposit;
    } catch (error) {
      console.error('Approve deposit error:', error);
      throw error;
    }
  }

  // Reject deposit
  async rejectDeposit(depositId: string, adminId: string, reason: string) {
    try {
      const [deposit] = await db
        .select()
        .from(deposits)
        .where(eq(deposits.id, depositId))
        .limit(1);

      if (!deposit) {
        throw new Error('Deposit not found');
      }

      if (deposit.status !== 'pending') {
        throw new Error('Deposit already processed');
      }

      // Update deposit status
      const [updatedDeposit] = await db
        .update(deposits)
        .set({
          status: 'failed',
          approvedBy: adminId,
          approvedAt: new Date(),
          rejectionReason: reason,
        })
        .where(eq(deposits.id, depositId))
        .returning();

      // Update transaction
      await db
        .update(transactions)
        .set({
          status: 'failed',
        })
        .where(
          sql`${transactions.referenceId} = ${depositId} AND ${transactions.referenceType} = 'deposit'`
        );

      return updatedDeposit;
    } catch (error) {
      console.error('Reject deposit error:', error);
      throw error;
    }
  }

  // Approve withdrawal
  async approveWithdrawal(withdrawalId: string, adminId: string, transactionId: string) {
    try {
      const [withdrawal] = await db
        .select()
        .from(withdrawals)
        .where(eq(withdrawals.id, withdrawalId))
        .limit(1);

      if (!withdrawal) {
        throw new Error('Withdrawal not found');
      }

      if (withdrawal.status !== 'pending') {
        throw new Error('Withdrawal already processed');
      }

      // Update withdrawal status
      const [updatedWithdrawal] = await db
        .update(withdrawals)
        .set({
          status: 'completed',
          processedBy: adminId,
          processedAt: new Date(),
          transactionId,
        })
        .where(eq(withdrawals.id, withdrawalId))
        .returning();

      // Update transaction
      await db
        .update(transactions)
        .set({
          status: 'completed',
        })
        .where(
          sql`${transactions.referenceId} = ${withdrawalId} AND ${transactions.referenceType} = 'withdrawal'`
        );

      return updatedWithdrawal;
    } catch (error) {
      console.error('Approve withdrawal error:', error);
      throw error;
    }
  }

  // Reject withdrawal
  async rejectWithdrawal(withdrawalId: string, adminId: string, reason: string) {
    try {
      const [withdrawal] = await db
        .select()
        .from(withdrawals)
        .where(eq(withdrawals.id, withdrawalId))
        .limit(1);

      if (!withdrawal) {
        throw new Error('Withdrawal not found');
      }

      if (withdrawal.status !== 'pending') {
        throw new Error('Withdrawal already processed');
      }

      // Refund balance
      await db
        .update(users)
        .set({
          balance: sql`${users.balance} + ${withdrawal.amount}`,
        })
        .where(eq(users.id, withdrawal.userId));

      // Update withdrawal status
      const [updatedWithdrawal] = await db
        .update(withdrawals)
        .set({
          status: 'rejected',
          processedBy: adminId,
          processedAt: new Date(),
          rejectionReason: reason,
        })
        .where(eq(withdrawals.id, withdrawalId))
        .returning();

      // Update transaction
      await db
        .update(transactions)
        .set({
          status: 'cancelled',
        })
        .where(
          sql`${transactions.referenceId} = ${withdrawalId} AND ${transactions.referenceType} = 'withdrawal'`
        );

      return updatedWithdrawal;
    } catch (error) {
      console.error('Reject withdrawal error:', error);
      throw error;
    }
  }

  // Create admin user
  async createAdminUser(username: string, email: string, password: string, fullName: string) {
    try {
      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const [user] = await db
        .insert(users)
        .values({
          username,
          email,
          passwordHash,
          fullName,
          role: 'admin',
          status: 'active',
        })
        .returning();

      return user;
    } catch (error) {
      console.error('Create admin user error:', error);
      throw error;
    }
  }

  // Ban user
  async banUser(userId: string, reason: string, adminId: string) {
    try {
      const [user] = await db
        .update(users)
        .set({
          status: 'banned',
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();

      // Log action
      console.log('User banned:', {
        userId,
        reason,
        bannedBy: adminId,
        timestamp: new Date(),
      });

      return user;
    } catch (error) {
      console.error('Ban user error:', error);
      throw error;
    }
  }

  // Unban user
  async unbanUser(userId: string, adminId: string) {
    try {
      const [user] = await db
        .update(users)
        .set({
          status: 'active',
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();

      // Log action
      console.log('User unbanned:', {
        userId,
        unbannedBy: adminId,
        timestamp: new Date(),
      });

      return user;
    } catch (error) {
      console.error('Unban user error:', error);
      throw error;
    }
  }

  // Update game settings
  async updateGameSettings(gameId: string, settings: Partial<typeof games.$inferInsert>) {
    try {
      const [game] = await db
        .update(games)
        .set({
          ...settings,
          updatedAt: new Date(),
        })
        .where(eq(games.id, gameId))
        .returning();

      if (!game) {
        throw new Error('Game not found');
      }

      return game;
    } catch (error) {
      console.error('Update game settings error:', error);
      throw error;
    }
  }

  // Cancel game round
  async cancelGameRound(roundId: string, reason: string, adminId: string) {
    try {
      // Update round status
      await db
        .update(gameRounds)
        .set({
          status: 'cancelled',
        })
        .where(eq(gameRounds.id, roundId));

      // Get all bets for this round
      const roundBets = await db
        .select()
        .from(bets)
        .where(eq(bets.roundId, roundId));

      // Refund all bets
      for (const bet of roundBets) {
        // Update bet status
        await db
          .update(bets)
          .set({
            status: 'refunded',
          })
          .where(eq(bets.id, bet.id));

        // Refund balance
        await db
          .update(users)
          .set({
            balance: sql`${users.balance} + ${bet.amount}`,
          })
          .where(eq(users.id, bet.userId));

        // Create refund transaction
        await db.insert(transactions).values({
          userId: bet.userId,
          type: 'refund',
          amount: bet.amount,
          status: 'completed',
          referenceId: bet.id,
          referenceType: 'bet',
          description: `Refund for cancelled round: ${reason}`,
        });
      }

      // Log action
      console.log('Game round cancelled:', {
        roundId,
        reason,
        cancelledBy: adminId,
        refundedBets: roundBets.length,
        timestamp: new Date(),
      });

      return { success: true, refundedBets: roundBets.length };
    } catch (error) {
      console.error('Cancel game round error:', error);
      throw error;
    }
  }

  // Get pending approvals count
  async getPendingApprovalsCount() {
    try {
      const [result] = await db
        .select({
          pendingDeposits: sql<number>`count(*) filter (where ${deposits.status} = 'pending')`,
          pendingWithdrawals: sql<number>`count(*) filter (where ${withdrawals.status} = 'pending')`,
        })
        .from(deposits)
        .fullJoin(withdrawals, sql`true`);

      return result;
    } catch (error) {
      console.error('Get pending approvals count error:', error);
      throw error;
    }
  }
}

export const adminService = new AdminService();