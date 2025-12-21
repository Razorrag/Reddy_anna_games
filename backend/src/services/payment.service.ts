import { db } from '../db';
import { deposits, withdrawals, users, transactions, userBonuses, referrals } from '../db/schema';
import { eq, and, desc, sql, gte } from 'drizzle-orm';
import { AppError } from '../middleware/errorHandler';
import { settingsService } from './settings.service';
import type { Server as SocketIOServer } from 'socket.io';

export class PaymentService {
  private io: SocketIOServer | null = null;
  private readonly WHATSAPP_NUMBER = process.env.WHATSAPP_PAYMENT_NUMBER || '+919876543210';
  private readonly UPI_ID = process.env.PAYMENT_UPI_ID || 'payment@upi';

  setIo(io: SocketIOServer) {
    this.io = io;
  }

  // ========== DEPOSIT METHODS ==========

  async createDepositRequest(userId: string, data: {
    amount: number;
    screenshotUrl?: string;
    transactionId?: string;
    paymentMethod: 'upi' | 'bank_transfer' | 'other';
  }) {
    if (data.amount < 100) {
      throw new AppError('Minimum deposit amount is ₹100', 400);
    }

    if (data.amount > 100000) {
      throw new AppError('Maximum deposit amount is ₹100,000', 400);
    }

    const [deposit] = await db.insert(deposits).values({
      userId,
      amount: data.amount.toFixed(2),
      paymentMethod: data.paymentMethod,
      status: 'pending',
      screenshotUrl: data.screenshotUrl,
      transactionId: data.transactionId,
    }).returning();

    return {
      deposit,
      paymentDetails: {
        whatsappNumber: this.WHATSAPP_NUMBER,
        upiId: this.UPI_ID,
        amount: data.amount,
      },
    };
  }

  async updateDepositScreenshot(depositId: string, userId: string, screenshotUrl: string) {
    const deposit = await db.query.deposits.findFirst({
      where: and(eq(deposits.id, depositId), eq(deposits.userId, userId)),
    });

    if (!deposit) throw new AppError('Deposit not found', 404);
    if (deposit.status !== 'pending') throw new AppError('Deposit is not pending', 400);

    await db.update(deposits).set({ screenshotUrl }).where(eq(deposits.id, depositId));

    return { message: 'Screenshot uploaded successfully', depositId };
  }

  async approveDeposit(depositId: string, adminId: string) {
    const deposit = await db.query.deposits.findFirst({
      where: eq(deposits.id, depositId),
    });

    if (!deposit) throw new AppError('Deposit not found', 404);
    if (deposit.status !== 'pending') throw new AppError('Deposit is not pending', 400);

    const amount = parseFloat(deposit.amount);
    const bonusSettings = await settingsService.getBonusSettings();
    const bonusPercentage = bonusSettings.depositBonusPercentage;
    const wageringMultiplier = bonusSettings.wageringMultiplier;

    // Update deposit status
    await db.update(deposits).set({
      status: 'completed',
      approvedBy: adminId,
      approvedAt: new Date(),
    }).where(eq(deposits.id, depositId));

    // Credit user balance
    await db.update(users).set({
      balance: sql`${users.balance} + ${amount}`,
      updatedAt: new Date(),
    }).where(eq(users.id, deposit.userId));

    // Get updated user balance
    const updatedUser = await db.query.users.findFirst({
      where: eq(users.id, deposit.userId),
    });

    // Create transaction record
    await db.insert(transactions).values({
      userId: deposit.userId,
      type: 'deposit',
      amount: amount.toFixed(2),
      status: 'completed',
      description: `Deposit approved`,
      referenceId: deposit.id,
    });

    // Broadcast deposit approved
    if (this.io && updatedUser) {
      this.io.to(`user:${deposit.userId}`).emit('payment:deposit_approved', {
        depositId,
        amount,
        newBalance: updatedUser.balance,
      });

      this.io.to(`user:${deposit.userId}`).emit('user:balance_updated', {
        balance: updatedUser.balance,
        change: amount,
        reason: 'deposit_approved',
      });
    }

    // Create deposit bonus if applicable
    let bonusAmount = 0;
    let depositBonusId: string | null = null;
    
    if (bonusPercentage > 0) {
      bonusAmount = amount * (bonusPercentage / 100);
      const wageringRequired = amount * wageringMultiplier;

      const [depositBonus] = await db.insert(userBonuses).values({
        userId: deposit.userId,
        bonusType: 'deposit',
        amount: bonusAmount.toFixed(2),
        wageringRequirement: wageringRequired.toFixed(2),
        wageringProgress: '0.00',
        status: 'active',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }).returning();

      depositBonusId = depositBonus.id;

      // Broadcast bonus received
      if (this.io) {
        this.io.to(`user:${deposit.userId}`).emit('bonus:received', {
          bonusType: 'deposit',
          bonusAmount,
          wageringRequired,
        });
      }
    }

    // Process referral bonus (creates locked referral bonus linked to deposit bonus)
    if (depositBonusId) {
      await this.processReferralBonus(deposit.userId, amount, depositBonusId);
    }

    return { success: true, depositId, amount, bonusAmount };
  }

  async rejectDeposit(depositId: string, adminId: string, reason: string) {
    const deposit = await db.query.deposits.findFirst({
      where: eq(deposits.id, depositId),
    });

    if (!deposit) throw new AppError('Deposit not found', 404);
    if (deposit.status !== 'pending') throw new AppError('Deposit is not pending', 400);

    await db.update(deposits).set({
      status: 'failed',
      rejectionReason: reason,
    }).where(eq(deposits.id, depositId));

    // Broadcast deposit rejected
    if (this.io) {
      this.io.to(`user:${deposit.userId}`).emit('payment:deposit_rejected', {
        depositId,
        reason,
        amount: deposit.amount,
      });
    }

    return { success: true, depositId };
  }

  private async processReferralBonus(userId: string, depositAmount: number, depositBonusId: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user?.referredBy) return;

    // Check if this is first deposit
    const depositCount = await db.select().from(deposits).where(
      and(eq(deposits.userId, userId), eq(deposits.status, 'completed'))
    );

    if (depositCount.length > 1) return; // Not first deposit

    const referralSettings = await settingsService.getReferralSettings();
    const minDeposit = referralSettings.minDepositAmount;

    if (depositAmount < minDeposit) return;

    // Check monthly referral limit
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyReferrals = await db.select().from(referrals).where(
      and(
        eq(referrals.referrerId, user.referredBy),
        gte(referrals.createdAt, startOfMonth)
      )
    );

    if (monthlyReferrals.length >= referralSettings.maxReferralsPerMonth) return;

    // Create LOCKED referral bonus (legacy behavior - waits for deposit bonus to complete)
    const bonusPercentage = referralSettings.bonusPercentage;
    const referralBonusAmount = depositAmount * (bonusPercentage / 100);
    const wageringRequired = referralBonusAmount * 30; // Same wagering as deposit bonus

    // Find the referrer's oldest locked/active deposit bonus to link to
    const referrerDepositBonus = await db.query.userBonuses.findFirst({
      where: and(
        eq(userBonuses.userId, user.referredBy),
        eq(userBonuses.bonusType, 'deposit'),
        sql`${userBonuses.status} IN ('locked', 'active')`
      ),
      orderBy: [userBonuses.createdAt], // FIFO - link to oldest
    });

    // Create locked referral bonus linked to referrer's deposit bonus (if exists)
    // Otherwise link to the referred user's deposit bonus
    const linkedBonusId = referrerDepositBonus?.id || depositBonusId;

    await db.insert(userBonuses).values({
      userId: user.referredBy,
      bonusType: 'referral',
      amount: referralBonusAmount.toFixed(2),
      wageringRequirement: wageringRequired.toFixed(2),
      wageringProgress: '0.00',
      status: 'locked', // LOCKED - will unlock when linked deposit bonus completes
      linkedBonusId: linkedBonusId, // Link to deposit bonus
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    // Update referral tracking
    await db.update(referrals).set({
      status: 'pending', // Changed from 'completed' to 'pending' until bonus unlocks
      bonusEarned: referralBonusAmount.toFixed(2),
    }).where(and(
      eq(referrals.referrerId, user.referredBy),
      eq(referrals.referredId, userId)
    ));

    // Broadcast that referral bonus is created but locked
    if (this.io) {
      this.io.to(`user:${user.referredBy}`).emit('bonus:referral_locked', {
        referredUsername: user.username,
        bonusAmount: referralBonusAmount,
        status: 'locked',
        message: 'Referral bonus will be unlocked when deposit bonus wagering is complete',
      });
    }
  }

  // ========== WITHDRAWAL METHODS ==========

  async createWithdrawalRequest(userId: string, data: {
    amount: number;
    withdrawalMethod: 'upi' | 'bank_transfer';
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    upiId?: string;
  }) {
    if (data.amount < 500) throw new AppError('Minimum withdrawal is ₹500', 400);
    if (data.amount > 100000) throw new AppError('Maximum withdrawal is ₹100,000', 400);

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) throw new AppError('User not found', 404);

    const currentBalance = parseFloat(user.balance);
    if (currentBalance < data.amount) {
      throw new AppError('Insufficient balance', 400);
    }

    // Deduct balance immediately
    await db.update(users).set({
      balance: sql`${users.balance} - ${data.amount}`,
      updatedAt: new Date(),
    }).where(eq(users.id, userId));

    // Get updated balance
    const updatedUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    const [withdrawal] = await db.insert(withdrawals).values({
      userId,
      amount: data.amount.toFixed(2),
      withdrawalMethod: data.withdrawalMethod,
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      ifscCode: data.ifscCode,
      upiId: data.upiId,
      status: 'pending',
    }).returning();

    await db.insert(transactions).values({
      userId,
      type: 'withdrawal',
      amount: data.amount.toFixed(2),
      status: 'pending',
      description: 'Withdrawal request',
      referenceId: withdrawal.id,
    });

    // Broadcast withdrawal request created
    if (this.io && updatedUser) {
      this.io.to(`user:${userId}`).emit('payment:withdrawal_requested', {
        withdrawalId: withdrawal.id,
        amount: data.amount,
        newBalance: updatedUser.balance,
      });

      this.io.to(`user:${userId}`).emit('user:balance_updated', {
        balance: updatedUser.balance,
        change: -data.amount,
        reason: 'withdrawal_requested',
      });
    }

    return withdrawal;
  }

  async approveWithdrawal(withdrawalId: string, adminId: string, transactionId?: string) {
    const withdrawal = await db.query.withdrawals.findFirst({
      where: eq(withdrawals.id, withdrawalId),
    });

    if (!withdrawal) throw new AppError('Withdrawal not found', 404);
    if (withdrawal.status !== 'pending' && withdrawal.status !== 'processing') {
      throw new AppError('Withdrawal cannot be approved', 400);
    }

    await db.update(withdrawals).set({
      status: 'completed',
      processedBy: adminId,
      processedAt: new Date(),
      transactionId: transactionId,
    }).where(eq(withdrawals.id, withdrawalId));

    await db.update(transactions).set({
      status: 'completed',
    }).where(and(
      eq(transactions.referenceId, withdrawalId),
      eq(transactions.type, 'withdrawal')
    ));

    // Broadcast withdrawal approved
    if (this.io) {
      this.io.to(`user:${withdrawal.userId}`).emit('payment:withdrawal_approved', {
        withdrawalId,
        amount: withdrawal.amount,
        transactionId,
      });
    }

    return { success: true, withdrawalId };
  }

  async rejectWithdrawal(withdrawalId: string, adminId: string, reason: string) {
    const withdrawal = await db.query.withdrawals.findFirst({
      where: eq(withdrawals.id, withdrawalId),
    });

    if (!withdrawal) throw new AppError('Withdrawal not found', 404);
    if (withdrawal.status !== 'pending') throw new AppError('Withdrawal cannot be rejected', 400);

    const refundAmount = parseFloat(withdrawal.amount);

    // Refund amount to user
    await db.update(users).set({
      balance: sql`${users.balance} + ${withdrawal.amount}`,
      updatedAt: new Date(),
    }).where(eq(users.id, withdrawal.userId));

    // Get updated balance
    const updatedUser = await db.query.users.findFirst({
      where: eq(users.id, withdrawal.userId),
    });

    await db.update(withdrawals).set({
      status: 'rejected',
      processedBy: adminId,
      processedAt: new Date(),
      rejectionReason: reason,
    }).where(eq(withdrawals.id, withdrawalId));

    await db.update(transactions).set({
      status: 'cancelled',
    }).where(and(
      eq(transactions.referenceId, withdrawalId),
      eq(transactions.type, 'withdrawal')
    ));

    // Broadcast withdrawal rejected and balance refunded
    if (this.io && updatedUser) {
      this.io.to(`user:${withdrawal.userId}`).emit('payment:withdrawal_rejected', {
        withdrawalId,
        reason,
        refundedAmount: refundAmount,
        newBalance: updatedUser.balance,
      });

      this.io.to(`user:${withdrawal.userId}`).emit('user:balance_updated', {
        balance: updatedUser.balance,
        change: refundAmount,
        reason: 'withdrawal_rejected_refund',
      });
    }

    return { success: true, withdrawalId };
  }

  // ========== QUERY METHODS ==========

  async getUserDeposits(userId: string, limit = 50) {
    return db.query.deposits.findMany({
      where: eq(deposits.userId, userId),
      orderBy: [desc(deposits.createdAt)],
      limit,
    });
  }

  async getUserWithdrawals(userId: string, limit = 50) {
    return db.query.withdrawals.findMany({
      where: eq(withdrawals.userId, userId),
      orderBy: [desc(withdrawals.createdAt)],
      limit,
    });
  }

  async getPendingDeposits() {
    return db.query.deposits.findMany({
      where: eq(deposits.status, 'pending'),
      orderBy: [deposits.createdAt],
    });
  }

  async getPendingWithdrawals() {
    return db.query.withdrawals.findMany({
      where: eq(withdrawals.status, 'pending'),
      orderBy: [withdrawals.createdAt],
    });
  }

  async getDepositById(depositId: string) {
    const deposit = await db.query.deposits.findFirst({
      where: eq(deposits.id, depositId),
    });
    if (!deposit) throw new AppError('Deposit not found', 404);
    return deposit;
  }

  async getWithdrawalById(withdrawalId: string) {
    const withdrawal = await db.query.withdrawals.findFirst({
      where: eq(withdrawals.id, withdrawalId),
    });
    if (!withdrawal) throw new AppError('Withdrawal not found', 404);
    return withdrawal;
  }

  getPaymentInfo() {
    return {
      whatsappNumber: this.WHATSAPP_NUMBER,
      upiId: this.UPI_ID,
      minimumDeposit: 100,
      maximumDeposit: 100000,
      minimumWithdrawal: 500,
      maximumWithdrawal: 100000,
    };
  }
}

export const paymentService = new PaymentService();
