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

  // Create signup bonus
  async createSignupBonus(userId: string) {
    const signupBonus = 100.00; // Changed from 50 to 100 to match legacy
    const wageringRequired = signupBonus * 10;
    
    const [bonus] = await db.insert(userBonuses).values({
      userId,
      bonusType: 'signup',
      amount: signupBonus.toFixed(2),
      wageringRequirement: wageringRequired.toFixed(2),
      wageringProgress: '0.00',
      status: 'active',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    }).returning();

    return bonus;
  }

  // Create referral bonus in LOCKED state (requires deposit bonus to unlock)
  async createReferralBonus(
    userId: string,
    referredUserId: string,
    depositAmount: number,
    linkedDepositBonusId: string
  ) {
    const referralBonus = depositAmount * 0.05;
    const wageringRequired = referralBonus * 30;
    
    const [bonus] = await db.insert(userBonuses).values({
      userId,
      bonusType: 'referral',
      amount: referralBonus.toFixed(2),
      wageringRequirement: wageringRequired.toFixed(2),
      wageringProgress: '0.00',
      status: 'locked', // Start in locked state - will unlock when deposit bonus completes
      linkedBonusId: linkedDepositBonusId, // Link to the deposit bonus
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    }).returning();

    return bonus;
  }

  // Create deposit bonus
  async createDepositBonus(userId: string, depositAmount: number, bonusPercentage: number = 5) {
    const bonusAmount = (depositAmount * bonusPercentage) / 100;
    const wageringAmount = depositAmount * 0.30;

    const [bonus] = await db.insert(userBonuses).values({
      userId,
      bonusType: 'deposit',
      amount: bonusAmount.toFixed(2),
      wageringRequirement: wageringAmount.toFixed(2),
      wageringProgress: '0.00',
      status: 'active',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    }).returning();

    return bonus;
  }

  // Create loyalty bonus
  async createLoyaltyBonus(userId: string, amount: number) {
    const wageringAmount = amount * 10;

    const [bonus] = await db.insert(userBonuses).values({
      userId,
      bonusType: 'loyalty',
      amount: amount.toFixed(2),
      wageringRequirement: wageringAmount.toFixed(2),
      wageringProgress: '0.00',
      status: 'active',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }).returning();

    return bonus;
  }

  // Update wagering progress with FIFO processing
  async updateWageringProgress(userId: string, betAmount: number) {
    // Get active bonuses in FIFO order (oldest first)
    const activeBonuses = await db.query.userBonuses.findMany({
      where: and(
        eq(userBonuses.userId, userId),
        eq(userBonuses.status, 'active')
      ),
      orderBy: [userBonuses.createdAt], // FIFO: Process oldest first
    });

    let remainingWagering = betAmount;
    const updatedBonuses = [];

    for (const bonus of activeBonuses) {
      if (remainingWagering <= 0) break;

      const currentWagering = parseFloat(bonus.wageringProgress);
      const requiredWagering = parseFloat(bonus.wageringRequirement);
      const remainingRequired = requiredWagering - currentWagering;

      if (remainingRequired <= 0) continue;

      const wageringToAdd = Math.min(remainingWagering, remainingRequired);
      const newWageringProgress = currentWagering + wageringToAdd;
      const isCompleted = newWageringProgress >= requiredWagering;

      const [updatedBonus] = await db
        .update(userBonuses)
        .set({
          wageringProgress: newWageringProgress.toFixed(2),
          status: isCompleted ? 'completed' : 'active',
          completedAt: isCompleted ? new Date() : null,
        })
        .where(eq(userBonuses.id, bonus.id))
        .returning();

      updatedBonuses.push(updatedBonus);
      remainingWagering -= wageringToAdd;

      // When deposit bonus completes, unlock any linked referral bonuses
      if (isCompleted) {
        await this.unlockBonus(bonus.id);
        
        // Check if this is a deposit bonus and unlock linked referral bonuses
        if (bonus.bonusType === 'deposit') {
          await this.unlockLinkedReferralBonuses(bonus.id);
        }
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

    if (bonus.completedAt) {
      // Already unlocked
      return bonus;
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, bonus.userId),
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const bonusAmount = parseFloat(bonus.amount);
    const currentBalance = parseFloat(user.balance);
    const newBalance = currentBalance + bonusAmount;

    await db.update(users).set({
      balance: newBalance.toFixed(2),
      updatedAt: new Date(),
    }).where(eq(users.id, bonus.userId));

    await db.insert(transactions).values({
      userId: bonus.userId,
      type: 'bonus',
      amount: bonusAmount.toFixed(2),
      status: 'completed',
      description: `${bonus.bonusType} bonus unlocked`,
      referenceId: bonus.id,
    });

    return bonus;
  }

  // Unlock linked referral bonuses when deposit bonus completes
  async unlockLinkedReferralBonuses(depositBonusId: string) {
    // Find all locked referral bonuses linked to this deposit bonus
    const linkedBonuses = await db.query.userBonuses.findMany({
      where: and(
        eq(userBonuses.linkedBonusId, depositBonusId),
        eq(userBonuses.bonusType, 'referral'),
        eq(userBonuses.status, 'locked')
      ),
    });

    // Unlock each linked referral bonus (change status from locked to active)
    for (const bonus of linkedBonuses) {
      await db.update(userBonuses).set({
        status: 'active', // Change from locked to active
      }).where(eq(userBonuses.id, bonus.id));
    }

    return linkedBonuses;
  }

  // Get bonus summary for a user
  async getBonusSummary(userId: string) {
    const bonuses = await this.getUserBonuses(userId);

    const summary = {
      totalBonuses: bonuses.length,
      activeBonuses: 0,
      completedBonuses: 0,
      expiredBonuses: 0,
      totalBonusAmount: 0,
      totalWageringRequired: 0,
      totalWageringCompleted: 0,
    };

    for (const bonus of bonuses) {
      summary.totalBonusAmount += parseFloat(bonus.amount);
      summary.totalWageringRequired += parseFloat(bonus.wageringRequirement);
      summary.totalWageringCompleted += parseFloat(bonus.wageringProgress);

      if (bonus.status === 'active') summary.activeBonuses++;
      else if (bonus.status === 'completed') summary.completedBonuses++;
      else if (bonus.status === 'expired') summary.expiredBonuses++;
    }

    return summary;
  }

  // Cancel bonus (admin only)
  async cancelBonus(bonusId: string) {
    const bonus = await this.getBonusById(bonusId);

    if (bonus.status !== 'active') {
      throw new AppError('Only active bonuses can be cancelled', 400);
    }

    const [updatedBonus] = await db
      .update(userBonuses)
      .set({
        status: 'cancelled',
      })
      .where(eq(userBonuses.id, bonusId))
      .returning();

    return updatedBonus;
  }

  // Check for expired bonuses
  async checkExpiredBonuses() {
    const expiredBonuses = await db
      .update(userBonuses)
      .set({
        status: 'expired',
      })
      .where(and(
        eq(userBonuses.status, 'active'),
        sql`${userBonuses.expiresAt} < NOW()`
      ))
      .returning();

    return expiredBonuses;
  }
}

export const bonusService = new BonusService();
