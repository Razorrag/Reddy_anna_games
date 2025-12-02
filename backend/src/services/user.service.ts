import { db } from '../db';
import { users, userStatistics, transactions } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { AppError } from '../middleware/errorHandler';

export class UserService {
  // Get user profile by ID
  async getUserById(userId: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        passwordHash: false, // Exclude password hash
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  // Get user statistics
  async getUserStatistics(userId: string) {
    const stats = await db.query.userStatistics.findFirst({
      where: eq(userStatistics.userId, userId),
    });

    if (!stats) {
      // Create default statistics if they don't exist
      const [newStats] = await db.insert(userStatistics).values({
        userId,
        totalBets: 0,
        totalWins: 0,
        totalLosses: 0,
        totalBetAmount: '0.00',
        totalWinAmount: '0.00',
        biggestWin: '0.00',
        currentStreak: 0,
        longestStreak: 0,
      }).returning();

      return newStats;
    }

    return stats;
  }

  // Update user profile
  async updateProfile(userId: string, data: {
    fullName?: string;
    phoneNumber?: string;
    email?: string;
  }) {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      throw new AppError('Failed to update profile', 500);
    }

    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  // Get user balance
  async getBalance(userId: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        balance: true,
        bonusBalance: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
      balance: parseFloat(user.balance),
      bonusBalance: parseFloat(user.bonusBalance),
      totalBalance: parseFloat(user.balance) + parseFloat(user.bonusBalance),
    };
  }

  // Get transaction history
  async getTransactionHistory(userId: string, limit: number = 50, offset: number = 0) {
    const userTransactions = await db.query.transactions.findMany({
      where: eq(transactions.userId, userId),
      orderBy: [desc(transactions.createdAt)],
      limit,
      offset,
    });

    return userTransactions;
  }

  // Update user balance with ATOMIC operation and optimistic locking (legacy parity)
  async updateBalance(userId: string, amount: number, type: 'add' | 'subtract', maxRetries: number = 5) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const [user] = await db.select({ balance: users.balance }).from(users).where(eq(users.id, userId));
        if (!user) throw new AppError('User not found', 404);
        
        const currentBalance = parseFloat(user.balance);
        let newBalance: number;
        
        if (type === 'add') {
          newBalance = currentBalance + amount;
        } else {
          if (currentBalance < amount) {
            throw new AppError('Insufficient balance', 400);
          }
          newBalance = currentBalance - amount;
        }
        
        // Optimistic locking - update only if balance hasn't changed
        const result = await db
          .update(users)
          .set({ 
            balance: newBalance.toFixed(2),
            updatedAt: new Date()
          })
          .where(and(
            eq(users.id, userId),
            eq(users.balance, currentBalance.toFixed(2))
          ))
          .returning();
        
        if (result.length > 0) {
          return result[0];
        }
        
        // Conflict detected, retry with exponential backoff
        console.log(`Balance update conflict for user ${userId}, attempt ${attempt}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, 50 * Math.pow(2, attempt - 1)));
      } catch (error: any) {
        if (error.message === 'Insufficient balance' || error.message === 'User not found') throw error;
        if (attempt === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, 50 * Math.pow(2, attempt - 1)));
      }
    }
    throw new AppError('Failed to update balance after multiple retries', 500);
  }

  // Update bonus balance (internal method for other services)
  async updateBonusBalance(userId: string, amount: number, type: 'add' | 'subtract') {
    const user = await this.getUserById(userId);
    const currentBonusBalance = parseFloat(user.bonusBalance);

    let newBonusBalance: number;
    if (type === 'add') {
      newBonusBalance = currentBonusBalance + amount;
    } else {
      if (currentBonusBalance < amount) {
        throw new AppError('Insufficient bonus balance', 400);
      }
      newBonusBalance = currentBonusBalance - amount;
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        bonusBalance: newBonusBalance.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return updatedUser;
  }

  // Get user's referred users
  async getReferredUsers(userId: string) {
    const referredUsers = await db.query.users.findMany({
      where: eq(users.referredBy, userId),
      columns: {
        id: true,
        username: true,
        fullName: true,
        createdAt: true,
        status: true,
      },
    });

    return referredUsers;
  }

  // Check if user can place bet (has sufficient balance)
  async canPlaceBet(userId: string, betAmount: number): Promise<boolean> {
    const balance = await this.getBalance(userId);
    return balance.totalBalance >= betAmount;
  }

  // Deactivate user account
  async deactivateAccount(userId: string) {
    const [updatedUser] = await db
      .update(users)
      .set({
        status: 'suspended' as const,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return updatedUser;
  }

  // Reactivate user account
  async reactivateAccount(userId: string) {
    const [updatedUser] = await db
      .update(users)
      .set({
        status: 'active' as const,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return updatedUser;
  }
}

export const userService = new UserService();