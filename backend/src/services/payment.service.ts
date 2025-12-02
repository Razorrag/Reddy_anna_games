import { db } from '../db';
import { deposits, withdrawals, users, transactions, userBonuses, referrals } from '../db/schema';
import { eq, and, desc, sql, gte } from 'drizzle-orm';
import { AppError } from '../middleware/errorHandler';
import { settingsService } from './settings.service';

/**
 * WhatsApp-Based Payment System
 * 
 * Deposit Flow:
 * 1. User submits deposit request with amount and screenshot
 * 2. System creates pending deposit record
 * 3. User sends payment to WhatsApp number with screenshot
 * 4. Admin reviews screenshot and approves/rejects deposit
 * 5. On approval, balance is credited to user
 * 
 * Withdrawal Flow:
 * 1. User submits withdrawal request with bank/UPI details
 * 2. System deducts balance (holds funds)
 * 3. Admin processes payment via bank transfer/UPI
 * 4. Admin marks withdrawal as completed
 */

export class PaymentService {
  private readonly WHATSAPP_NUMBER = process.env.WHATSAPP_PAYMENT_NUMBER || '+919876543210';
  private readonly UPI_ID = process.env.PAYMENT_UPI_ID || 'payment@upi';

  // ========== DEPOSIT METHODS ==========

  // Create deposit request (user submits with screenshot)
  async createDepositRequest(userId: string, data: {
    amount: number;
    paymentScreenshot?: string; // Base64 or URL
    transactionId?: string; // User-provided UPI transaction ID
    paymentMethod: 'upi' | 'bank_transfer' | 'other';
    notes?: string;
  }) {
    if (data.amount < 100) {
      throw new AppError('Minimum deposit amount is ₹100', 400);
    }

    if (data.amount > 100000) {
      throw new AppError('Maximum deposit amount is ₹100,000', 400);
    }

    // Create deposit record
    const [deposit] = await db.insert(deposits).values({
      userId,
      amount: data.amount.toFixed(2),
      paymentMethod: data.paymentMethod,
      status: 'pending',
      paymentScreenshot: data.paymentScreenshot,
      paymentGatewayOrderId: data.transactionId, // Store user's transaction ID
      metadata: {
        notes: data.notes,
        whatsappNumber: this.WHATSAPP_NUMBER,
        upiId: this.UPI_ID,
      },
    }).returning();

    return {
      deposit,
      paymentDetails: {
        whatsappNumber: this.WHATSAPP_NUMBER,
        upiId: this.UPI_ID,
        amount: data.amount,
        message: 'Please send payment screenshot to WhatsApp number after payment',
      },
    };
  }

  // Update deposit with payment screenshot (if uploaded later)
  async updateDepositScreenshot(depositId: string, userId: string, screenshot: string) {
    const deposit = await db.query.deposits.findFirst({
      where: and(
        eq(deposits.id, depositId),
        eq(deposits.userId, userId)
      ),
    });

    if (!deposit) {
      throw new AppError('Deposit not found', 404);
    }

    if (deposit.status !== 'pending') {
      throw new AppError('Deposit is not pending', 400);
    }

    await db
      .update(deposits)
      .set({
        paymentScreenshot: screenshot,
        updatedAt: new Date(),
      })
      .where(eq(deposits.id, depositId));

    return {
      message: 'Screenshot uploaded successfully',
      depositId,
    };
  }

  // Admin: Get pending deposits
  async getPendingDeposits() {
    const pendingDeposits = await db.query.deposits.findMany({
      where: eq(deposits.status, 'pending'),
      orderBy: [deposits.createdAt],
      with: {
        user: {
          columns: {
            id: true,
            username: true,
            email: true,
            fullName: true,
            phoneNumber: true,
          },
        },
      },
    });

    return pendingDeposits;
  }

  // Admin: Approve deposit
  async approveDeposit(depositId: string, adminId: string) {
    const deposit = await db.query.deposits.findFirst({
      where: eq(deposits.id, depositId),
    });

    if (!deposit) {
      throw new AppError('Deposit not found', 404);
    }

    if (deposit.status !== 'pending') {
      throw new AppError('Deposit is not pending', 400);
    }

    // Update deposit status
    await db
      .update(deposits)
      .set({
        status: 'completed',
        processedBy: adminId,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(deposits.id, depositId));

    // Credit user balance
    await this.creditUserBalance(
      deposit.userId,
      parseFloat(deposit.amount),
      depositId
    );

    return {
      message: 'Deposit approved successfully',
      depositId,
      amount: deposit.amount,
    };
  }

  // Admin: Reject deposit
  async rejectDeposit(depositId: string, adminId: string, reason: string) {
    const deposit = await db.query.deposits.findFirst({
      where: eq(deposits.id, depositId),
    });

    if (!deposit) {
      throw new AppError('Deposit not found', 404);
    }

    if (deposit.status !== 'pending') {
      throw new AppError('Deposit is not pending', 400);
    }

    // Update deposit status
    await db
      .update(deposits)
      .set({
        status: 'rejected',
        processedBy: adminId,
        updatedAt: new Date(),
        metadata: {
          ...deposit.metadata as any,
          rejectionReason: reason,
        },
      })
      .where(eq(deposits.id, depositId));

    return {
      message: 'Deposit rejected',
      depositId,
      reason,
    };
  }

  // Credit user balance after successful deposit with CONFIGURABLE SETTINGS
  private async creditUserBalance(
    userId: string,
    amount: number,
    depositId: string
  ) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // 1. Get configurable settings from database
    const bonusPercentage = await settingsService.getSettingNumber('deposit_bonus_percentage', 5) / 100;
    const wageringMultiplier = await settingsService.getSettingNumber('wagering_multiplier', 0.30);
    const minDepositForReferral = await settingsService.getSettingNumber('min_deposit_for_referral', 500);
    const referralBonusPercent = await settingsService.getSettingNumber('referral_bonus_percentage', 5) / 100;
    const maxReferralsPerMonth = await settingsService.getSettingNumber('max_referrals_per_month', 50);

    // 2. Credit main balance (deposit amount) with ATOMIC operation
    const newBalance = await this.addBalanceAtomic(userId, amount);
    
    // 3. Calculate deposit bonus
    const depositBonusAmount = amount * bonusPercentage;
    const wageringRequirement = amount * wageringMultiplier;

    // 4. Update bonus balance
    const currentBonusBalance = parseFloat(user.bonusBalance);
    const newBonusBalance = currentBonusBalance + depositBonusAmount;

    await db
      .update(users)
      .set({
        bonusBalance: newBonusBalance.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // 5. Create deposit transaction record
    await db.insert(transactions).values({
      userId,
      type: 'deposit',
      amount: amount.toFixed(2),
      balanceBefore: user.balance,
      balanceAfter: newBalance.toFixed(2),
      status: 'completed',
      description: 'Deposit via WhatsApp',
      metadata: { depositId },
    });

    // 6. Create deposit bonus record
    await db.insert(userBonuses).values({
      userId,
      bonusType: 'deposit',
      amount: depositBonusAmount.toFixed(2),
      wageringRequirement: wageringRequirement.toFixed(2),
      wageringCompleted: '0.00',
      status: 'active',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      metadata: { depositId, depositAmount: amount, bonusPercentage: bonusPercentage * 100 },
    });

    // 7. Check if this is first deposit - apply referral bonus if referred
    const depositCount = await db.query.deposits.findMany({
      where: and(
        eq(deposits.userId, userId),
        eq(deposits.status, 'completed')
      ),
    });

    const isFirstDeposit = depositCount.length === 1; // Including current deposit

    if (isFirstDeposit && user.referredBy) {
      // Check minimum deposit requirement for referral
      if (amount < minDepositForReferral) {
        console.log(`Deposit ${amount} below minimum ${minDepositForReferral} for referral bonus`);
      } else {
        // Check if referrer has exceeded monthly referral limit
        const canApplyReferral = await this.checkReferrerMonthlyLimit(user.referredBy, maxReferralsPerMonth);
        
        if (canApplyReferral) {
          const referrer = await db.query.users.findFirst({
            where: eq(users.id, user.referredBy),
          });

          if (referrer) {
            // Calculate referral bonus (configurable % of deposit)
            const referralBonusAmount = amount * referralBonusPercent;
            const referralWagering = referralBonusAmount * 30; // 30x wagering for referral

            // Update referrer's bonus balance atomically
            const referrerBonusBalance = parseFloat(referrer.bonusBalance);
            const newReferrerBonusBalance = referrerBonusBalance + referralBonusAmount;

            await db
              .update(users)
              .set({
                bonusBalance: newReferrerBonusBalance.toFixed(2),
                updatedAt: new Date(),
              })
              .where(eq(users.id, referrer.id));

            // Create referral bonus for referrer
            await db.insert(userBonuses).values({
              userId: referrer.id,
              bonusType: 'referral',
              amount: referralBonusAmount.toFixed(2),
              wageringRequirement: referralWagering.toFixed(2),
              wageringCompleted: '0.00',
              status: 'active',
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              metadata: {
                referredUserId: userId,
                referredUsername: user.username,
                firstDepositAmount: amount
              },
            });

            // Update referral record status
            await db
              .update(referrals)
              .set({
                status: 'completed',
                bonusEarned: referralBonusAmount.toFixed(2),
                updatedAt: new Date(),
              })
              .where(and(
                eq(referrals.referrerId, referrer.id),
                eq(referrals.referredId, userId)
              ));

            // Log transaction for referrer
            await db.insert(transactions).values({
              userId: referrer.id,
              type: 'bonus',
              amount: referralBonusAmount.toFixed(2),
              status: 'completed',
              description: `Referral bonus for ${user.username}'s first deposit`,
              metadata: { referredUserId: userId, depositAmount: amount },
            });
          }
        }
      }
    }

    // 8. Check and apply conditional bonus threshold
    await this.checkConditionalBonusThreshold(userId);
  }

  // ATOMIC balance addition with retry logic (legacy parity)
  private async addBalanceAtomic(userId: string, amount: number, maxRetries: number = 5): Promise<number> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const [user] = await db.select({ balance: users.balance }).from(users).where(eq(users.id, userId));
        if (!user) throw new AppError('User not found', 404);
        
        const currentBalance = parseFloat(user.balance);
        const newBalance = currentBalance + amount;
        
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
          return newBalance;
        }
        
        // Conflict detected, retry with exponential backoff
        console.log(`Balance update conflict for user ${userId}, attempt ${attempt}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, 50 * Math.pow(2, attempt - 1)));
      } catch (error) {
        if (attempt === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, 50 * Math.pow(2, attempt - 1)));
      }
    }
    throw new AppError('Failed to update balance after multiple retries', 500);
  }

  // ATOMIC balance deduction with retry logic (legacy parity)
  private async deductBalanceAtomic(userId: string, amount: number, maxRetries: number = 5): Promise<number> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const [user] = await db.select({ balance: users.balance }).from(users).where(eq(users.id, userId));
        if (!user) throw new AppError('User not found', 404);
        
        const currentBalance = parseFloat(user.balance);
        if (currentBalance < amount) {
          throw new AppError('Insufficient balance', 400);
        }
        
        const newBalance = currentBalance - amount;
        
        // Optimistic locking
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
          return newBalance;
        }
        
        console.log(`Balance deduction conflict for user ${userId}, attempt ${attempt}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, 50 * Math.pow(2, attempt - 1)));
      } catch (error) {
        if (attempt === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, 50 * Math.pow(2, attempt - 1)));
      }
    }
    throw new AppError('Failed to deduct balance after multiple retries', 500);
  }

  // Check referrer's monthly referral limit
  private async checkReferrerMonthlyLimit(referrerId: string, maxLimit: number): Promise<boolean> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyReferrals = await db.query.referrals.findMany({
      where: and(
        eq(referrals.referrerId, referrerId),
        eq(referrals.status, 'completed'),
        gte(referrals.createdAt, startOfMonth)
      ),
    });

    if (monthlyReferrals.length >= maxLimit) {
      console.log(`Referrer ${referrerId} has reached monthly limit of ${maxLimit} referrals`);
      return false;
    }

    return true;
  }

  // Check and apply conditional bonus when balance changes by ±30% from original deposit
  private async checkConditionalBonusThreshold(userId: string): Promise<void> {
    try {
      // Get user's first deposit (original deposit)
      const firstDeposit = await db.query.deposits.findFirst({
        where: and(
          eq(deposits.userId, userId),
          eq(deposits.status, 'completed')
        ),
        orderBy: [deposits.createdAt],
      });

      if (!firstDeposit) return;

      const originalDeposit = parseFloat(firstDeposit.amount);
      
      // Get current balance
      const [user] = await db.select({ balance: users.balance, bonusBalance: users.bonusBalance })
        .from(users).where(eq(users.id, userId));
      
      if (!user) return;

      const currentBalance = parseFloat(user.balance);
      const bonusBalance = parseFloat(user.bonusBalance);
      
      // Calculate percentage change from original deposit
      const percentageChange = ((currentBalance - originalDeposit) / originalDeposit) * 100;
      
      // If balance has changed by ±30%, auto-apply available bonus to main balance
      if (Math.abs(percentageChange) >= 30 && bonusBalance > 0) {
        // Get active bonuses that have completed wagering
        const completedBonuses = await db.query.userBonuses.findMany({
          where: and(
            eq(userBonuses.userId, userId),
            eq(userBonuses.status, 'completed')
          ),
        });

        for (const bonus of completedBonuses) {
          const bonusAmount = parseFloat(bonus.amount);
          
          // Add bonus to main balance
          await this.addBalanceAtomic(userId, bonusAmount);
          
          // Mark bonus as used
          await db.update(userBonuses)
            .set({ status: 'expired', updatedAt: new Date() })
            .where(eq(userBonuses.id, bonus.id));
          
          // Update bonus balance
          await db.update(users)
            .set({
              bonusBalance: sql`${users.bonusBalance} - ${bonusAmount.toFixed(2)}`,
              updatedAt: new Date(),
            })
            .where(eq(users.id, userId));
          
          // Log transaction
          await db.insert(transactions).values({
            userId,
            type: 'bonus',
            amount: bonusAmount.toFixed(2),
            status: 'completed',
            description: 'Conditional bonus applied (±30% threshold reached)',
            metadata: { bonusId: bonus.id, percentageChange },
          });
        }
      }
    } catch (error) {
      console.error('Error checking conditional bonus threshold:', error);
    }
  }

  // ========== WITHDRAWAL METHODS ==========

  // Request withdrawal
  async requestWithdrawal(userId: string, amount: number, data: {
    withdrawalMethod: 'bank_transfer' | 'upi';
    bankAccountName?: string;
    bankAccountNumber?: string;
    bankIfscCode?: string;
    upiId?: string;
  }) {
    if (amount < 500) {
      throw new AppError('Minimum withdrawal amount is ₹500', 400);
    }

    // Check user balance
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const currentBalance = parseFloat(user.balance);
    if (amount > currentBalance) {
      throw new AppError('Insufficient balance', 400);
    }

    // Validate bank/UPI details
    if (data.withdrawalMethod === 'bank_transfer') {
      if (!data.bankAccountName || !data.bankAccountNumber || !data.bankIfscCode) {
        throw new AppError('Bank details required for bank transfer', 400);
      }
    }

    if (data.withdrawalMethod === 'upi' && !data.upiId) {
      throw new AppError('UPI ID required for UPI withdrawal', 400);
    }

    // Create withdrawal request
    const [withdrawal] = await db.insert(withdrawals).values({
      userId,
      amount: amount.toFixed(2),
      withdrawalMethod: data.withdrawalMethod,
      bankAccountName: data.bankAccountName,
      bankAccountNumber: data.bankAccountNumber,
      bankIfscCode: data.bankIfscCode,
      upiId: data.upiId,
      status: 'pending',
    }).returning();

    // Deduct from user balance (hold funds)
    await db
      .update(users)
      .set({
        balance: (currentBalance - amount).toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Create transaction record
    await db.insert(transactions).values({
      userId,
      type: 'withdrawal',
      amount: amount.toFixed(2),
      balanceBefore: user.balance,
      balanceAfter: (currentBalance - amount).toFixed(2),
      status: 'pending',
      description: 'Withdrawal request submitted',
      metadata: { withdrawalId: withdrawal.id },
    });

    return {
      withdrawal,
      message: 'Withdrawal request submitted. Admin will process it shortly.',
    };
  }

  // Admin: Get pending withdrawals
  async getPendingWithdrawals() {
    const pendingWithdrawals = await db.query.withdrawals.findMany({
      where: eq(withdrawals.status, 'pending'),
      orderBy: [withdrawals.createdAt],
      with: {
        user: {
          columns: {
            id: true,
            username: true,
            email: true,
            fullName: true,
            phoneNumber: true,
          },
        },
      },
    });

    return pendingWithdrawals;
  }

  // Admin: Approve withdrawal (after processing payment)
  async approveWithdrawal(withdrawalId: string, adminId: string, transactionId?: string) {
    const withdrawal = await db.query.withdrawals.findFirst({
      where: eq(withdrawals.id, withdrawalId),
    });

    if (!withdrawal) {
      throw new AppError('Withdrawal not found', 404);
    }

    if (withdrawal.status !== 'pending') {
      throw new AppError('Withdrawal is not pending', 400);
    }

    // Update withdrawal status
    await db
      .update(withdrawals)
      .set({
        status: 'completed',
        processedBy: adminId,
        processedAt: new Date(),
        updatedAt: new Date(),
        paymentGatewayPaymentId: transactionId, // Store admin's transaction ID
      })
      .where(eq(withdrawals.id, withdrawalId));

    // Update transaction status
    const transaction = await db.query.transactions.findFirst({
      where: and(
        eq(transactions.userId, withdrawal.userId),
        eq(transactions.type, 'withdrawal')
      ),
    });

    if (transaction) {
      await db
        .update(transactions)
        .set({
          status: 'completed',
          updatedAt: new Date(),
          metadata: {
            ...transaction.metadata as any,
            transactionId,
          },
        })
        .where(eq(transactions.id, transaction.id));
    }

    return {
      message: 'Withdrawal approved successfully',
      withdrawalId,
    };
  }

  // Admin: Reject withdrawal (refund to user)
  async rejectWithdrawal(
    withdrawalId: string,
    adminId: string,
    reason: string
  ) {
    const withdrawal = await db.query.withdrawals.findFirst({
      where: eq(withdrawals.id, withdrawalId),
    });

    if (!withdrawal) {
      throw new AppError('Withdrawal not found', 404);
    }

    if (withdrawal.status !== 'pending') {
      throw new AppError('Withdrawal is not pending', 400);
    }

    // Refund amount to user balance
    const user = await db.query.users.findFirst({
      where: eq(users.id, withdrawal.userId),
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const currentBalance = parseFloat(user.balance);
    const refundAmount = parseFloat(withdrawal.amount);
    const newBalance = currentBalance + refundAmount;

    await db
      .update(users)
      .set({
        balance: newBalance.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(users.id, withdrawal.userId));

    // Update withdrawal status
    await db
      .update(withdrawals)
      .set({
        status: 'rejected',
        processedBy: adminId,
        processedAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          ...withdrawal.metadata as any,
          rejectionReason: reason,
        },
      })
      .where(eq(withdrawals.id, withdrawalId));

    // Create refund transaction
    await db.insert(transactions).values({
      userId: withdrawal.userId,
      type: 'refund',
      amount: withdrawal.amount,
      balanceBefore: user.balance,
      balanceAfter: newBalance.toFixed(2),
      status: 'completed',
      description: `Withdrawal rejected: ${reason}`,
      metadata: { withdrawalId },
    });

    return {
      message: 'Withdrawal rejected and refunded',
      withdrawalId,
    };
  }

  // Get deposit history
  async getDepositHistory(userId: string, limit: number = 50, offset: number = 0) {
    const userDeposits = await db.query.deposits.findMany({
      where: eq(deposits.userId, userId),
      orderBy: [desc(deposits.createdAt)],
      limit,
      offset,
    });

    return userDeposits;
  }

  // Get withdrawal history
  async getWithdrawalHistory(userId: string, limit: number = 50, offset: number = 0) {
    const userWithdrawals = await db.query.withdrawals.findMany({
      where: eq(withdrawals.userId, userId),
      orderBy: [desc(withdrawals.createdAt)],
      limit,
      offset,
    });

    return userWithdrawals;
  }

  // Get payment settings (WhatsApp number, UPI ID)
  async getPaymentSettings() {
    return {
      whatsappNumber: this.WHATSAPP_NUMBER,
      upiId: this.UPI_ID,
      minDeposit: 100,
      maxDeposit: 100000,
      minWithdrawal: 500,
      depositMessage: 'Send payment to UPI ID and upload screenshot via WhatsApp',
      withdrawalMessage: 'Withdrawal will be processed within 24 hours',
    };
  }
}

export const paymentService = new PaymentService();