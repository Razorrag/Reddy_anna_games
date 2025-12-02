import { db } from '../db';
import { userBonuses, users, transactions } from '../db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { AppError } from '../middleware/errorHandler';

export class BonusService {
  // Get all bonuses for a user
  async getUserBonuses(userId: string) {
    const bonusList = await db.query.userBonuses.findMany({
      where: eq(userBonuses.userId, userId),
      orderBy: [desc(userBonuses.createdAt)],
    });

    return bonusList;
  }

  // Get bonus by ID
  async getBonusById(bonusId: string) {
    const bonus = await db.query.userBonuses.findFirst({
      where: eq(userBonuses.id, bonusId),
    });

    if (!bonus) {
      throw new AppError('Bonus not found', 404);
    }

    return bonus;
  }

  // Get active bonuses for a user
  async getActiveBonuses(userId: string) {
    const bonusList = await db.query.userBonuses.findMany({
      where: and(
        eq(userBonuses.userId, userId),
        eq(userBonuses.status, 'active')
      ),
      orderBy: [desc(userBonuses.createdAt)],
    });

    return bonusList;
  }

  // Create signup bonus (called from auth service)
  // Note: Signup bonus is minimal, main bonuses come from deposits
  async createSignupBonus(userId: string) {
    const signupBonus = 50.00; // Small signup bonus
    const wageringRequired = signupBonus * 10; // 10x for signup (not 30x)
    
    const [bonus] = await db.insert(userBonuses).values({
      userId,
      bonusType: 'signup',
      amount: signupBonus.toFixed(2),
      wageringRequirement: wageringRequired.toFixed(2),
      wageringCompleted: '0.00',
      status: 'active',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    }).returning();

    return bonus;
  }

  // Create referral bonus (for referrer)
  // This is now handled in payment service on first deposit
  // Keeping this method for backward compatibility
  async createReferralBonus(userId: string, referredUserId: string, depositAmount: number = 1000) {
    const referralBonus = depositAmount * 0.05; // 5% of referred user's first deposit
    const wageringRequired = referralBonus * 30; // 30x for referral
    
    const [bonus] = await db.insert(userBonuses).values({
      userId,
      bonusType: 'referral',
      amount: referralBonus.toFixed(2),
      wageringRequirement: wageringRequired.toFixed(2),
      wageringCompleted: '0.00',
      status: 'active',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      metadata: { referredUserId, depositAmount },
    }).returning();

    return bonus;
  }

  // Create deposit bonus
  // CRITICAL FIX: Wagering is 30% of DEPOSIT, not 30x of BONUS
  async createDepositBonus(userId: string, depositAmount: number, bonusPercentage: number = 5) {
    const bonusAmount = (depositAmount * bonusPercentage) / 100; // 5% bonus
    const wageringAmount = depositAmount * 0.30; // 30% of DEPOSIT (not 30x bonus!)

    const [bonus] = await db.insert(userBonuses).values({
      userId,
      bonusType: 'deposit',
      amount: bonusAmount.toFixed(2),
      wageringRequirement: wageringAmount.toFixed(2),
      wageringCompleted: '0.00',
      status: 'active',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      metadata: { depositAmount, bonusPercentage },
    }).returning();

    return bonus;
  }

  // Create cashback bonus
  async createCashbackBonus(userId: string, lossAmount: number, cashbackPercentage: number = 5) {
    const bonusAmount = (lossAmount * cashbackPercentage) / 100;
    const wageringAmount = bonusAmount * 10; // 10x wagering for cashback

    const [bonus] = await db.insert(userBonuses).values({
      userId,
      bonusType: 'cashback',
      amount: bonusAmount.toFixed(2),
      wageringRequirement: wageringAmount.toFixed(2),
      wageringCompleted: '0.00',
      status: 'active',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      metadata: { lossAmount, cashbackPercentage },
    }).returning();

    return bonus;
  }

  // Create custom bonus (admin only)
  async createCustomBonus(data: {
    userId: string;
    amount: number;
    wageringMultiplier: number;
    description?: string;
    expiryDays: number;
  }) {
    const wageringAmount = data.amount * data.wageringMultiplier;

    const [bonus] = await db.insert(userBonuses).values({
      userId: data.userId,
      bonusType: 'custom',
      amount: data.amount.toFixed(2),
      wageringRequirement: wageringAmount.toFixed(2),
      wageringCompleted: '0.00',
      status: 'active',
      expiresAt: new Date(Date.now() + data.expiryDays * 24 * 60 * 60 * 1000),
      metadata: { description: data.description, wageringMultiplier: data.wageringMultiplier },
    }).returning();

    return bonus;
  }

  // Update wagering progress (called when bet is placed)
  async updateWageringProgress(userId: string, betAmount: number) {
    // Get all active bonuses for user (oldest first)
    const activeBonuses = await db.query.userBonuses.findMany({
      where: and(
        eq(userBonuses.userId, userId),
        eq(userBonuses.status, 'active')
      ),
      orderBy: [userBonuses.createdAt], // Process oldest first
    });

    let remainingWagering = betAmount;
    const updatedBonuses = [];

    for (const bonus of activeBonuses) {
      if (remainingWagering <= 0) break;

      const currentWagering = parseFloat(bonus.wageringCompleted);
      const requiredWagering = parseFloat(bonus.wageringRequirement);
      const remainingRequired = requiredWagering - currentWagering;

      if (remainingRequired <= 0) continue; // Already completed

      const wageringToAdd = Math.min(remainingWagering, remainingRequired);
      const newWageringCompleted = currentWagering + wageringToAdd;

      // Check if bonus is now unlocked
      const isUnlocked = newWageringCompleted >= requiredWagering;

      const [updatedBonus] = await db
        .update(userBonuses)
        .set({
          wageringCompleted: newWageringCompleted.toFixed(2),
          status: isUnlocked ? 'completed' : 'active',
          unlockedAt: isUnlocked ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(eq(userBonuses.id, bonus.id))
        .returning();

      updatedBonuses.push(updatedBonus);
      remainingWagering -= wageringToAdd;

      // If unlocked, convert bonus to main balance
      if (isUnlocked) {
        await this.unlockBonus(bonus.id);
      }
    }

    return updatedBonuses;
  }

  // Unlock bonus and convert to main balance
  async unlockBonus(bonusId: string) {
    const bonus = await this.getBonusById(bonusId);

    if (bonus.status !== 'completed') {
      throw new AppError('Bonus wagering requirement not met', 400);
    }

    if (bonus.unlockedAt) {
      throw new AppError('Bonus already unlocked', 400);
    }

    // Get user
    const user = await db.query.users.findFirst({
      where: eq(users.id, bonus.userId),
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Convert bonus to main balance
    const bonusAmount = parseFloat(bonus.amount);
    const currentBalance = parseFloat(user.balance);
    const newBalance = currentBalance + bonusAmount;

    // Update user balance
    await db
      .update(users)
      .set({
        balance: newBalance.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(users.id, bonus.userId));

    // Create transaction record
    await db.insert(transactions).values({
      userId: bonus.userId,
      type: 'bonus_unlock',
      amount: bonus.amount,
      balanceBefore: user.balance,
      balanceAfter: newBalance.toFixed(2),
      status: 'completed',
      description: `Bonus unlocked: ${bonus.bonusType}`,
      metadata: { bonusId },
    });

    // Update bonus status
    await db
      .update(userBonuses)
      .set({
        unlockedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(userBonuses.id, bonusId));

    return {
      message: 'Bonus unlocked successfully',
      amount: bonusAmount,
      newBalance,
    };
  }

  // Cancel expired bonuses (cron job)
  async cancelExpiredBonuses() {
    const now = new Date();

    const expiredBonuses = await db.query.userBonuses.findMany({
      where: and(
        eq(userBonuses.status, 'active'),
        sql`${userBonuses.expiresAt} < ${now}`
      ),
    });

    for (const bonus of expiredBonuses) {
      await db
        .update(userBonuses)
        .set({
          status: 'expired',
          updatedAt: new Date(),
        })
        .where(eq(userBonuses.id, bonus.id));
    }

    return {
      message: `Cancelled ${expiredBonuses.length} expired bonuses`,
      count: expiredBonuses.length,
    };
  }

  // Get bonus statistics for user
  async getUserBonusStatistics(userId: string) {
    const allBonuses = await this.getUserBonuses(userId);

    const stats = {
      total: allBonuses.length,
      active: allBonuses.filter(b => b.status === 'active').length,
      completed: allBonuses.filter(b => b.status === 'completed').length,
      expired: allBonuses.filter(b => b.status === 'expired').length,
      cancelled: allBonuses.filter(b => b.status === 'cancelled').length,
      totalAmount: allBonuses.reduce((sum, b) => sum + parseFloat(b.amount), 0),
      totalUnlocked: allBonuses
        .filter(b => b.status === 'completed' && b.unlockedAt)
        .reduce((sum, b) => sum + parseFloat(b.amount), 0),
      totalWageringRequired: allBonuses
        .filter(b => b.status === 'active')
        .reduce((sum, b) => sum + parseFloat(b.wageringRequirement), 0),
      totalWageringCompleted: allBonuses
        .filter(b => b.status === 'active')
        .reduce((sum, b) => sum + parseFloat(b.wageringCompleted), 0),
    };

    return stats;
  }

  // Get bonus history with details
  async getBonusHistory(
    userId: string,
    filters?: {
      bonusType?: string;
      status?: string;
    },
    limit: number = 50,
    offset: number = 0
  ) {
    let userBonuses = await this.getUserBonuses(userId);

    // Apply filters
    if (filters?.bonusType) {
      userBonuses = userBonuses.filter(b => b.bonusType === filters.bonusType);
    }

    if (filters?.status) {
      userBonuses = userBonuses.filter(b => b.status === filters.status);
    }

    // Apply pagination
    const paginatedBonuses = userBonuses.slice(offset, offset + limit);

    return {
      bonuses: paginatedBonuses,
      pagination: {
        total: userBonuses.length,
        limit,
        offset,
        hasMore: offset + limit < userBonuses.length,
      },
    };
  }

  // Admin: Get all bonuses
  async getAllBonuses(filters?: {
    bonusType?: string;
    status?: string;
    userId?: string;
  }) {
    let allBonuses = await db.query.userBonuses.findMany({
      orderBy: [desc(userBonuses.createdAt)],
      with: {
        user: {
          columns: {
            username: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    // Apply filters
    if (filters?.bonusType) {
      allBonuses = allBonuses.filter(b => b.bonusType === filters.bonusType);
    }

    if (filters?.status) {
      allBonuses = allBonuses.filter(b => b.status === filters.status);
    }

    if (filters?.userId) {
      allBonuses = allBonuses.filter(b => b.userId === filters.userId);
    }

    return allBonuses;
  }

  // Admin: Cancel bonus
  async cancelBonus(bonusId: string, reason?: string) {
    const [bonus] = await db
      .update(userBonuses)
      .set({
        status: 'cancelled',
        updatedAt: new Date(),
        metadata: sql`COALESCE(${userBonuses.metadata}, '{}'::jsonb) || ${JSON.stringify({ cancelReason: reason })}::jsonb`,
      })
      .where(eq(userBonuses.id, bonusId))
      .returning();

    if (!bonus) {
      throw new AppError('Bonus not found', 404);
    }

    return bonus;
  }
}

export const bonusService = new BonusService();