import { db } from '../db';
import { partners, partnerCommissions, users, bets, partnerGameEarnings } from '../db/schema';
import { eq, and, desc, sql, gte, lte } from 'drizzle-orm';
import { AppError } from '../middleware/errorHandler';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class PartnerService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

  // Register new partner
  async registerPartner(data: {
    userId: string;
    businessName: string;
    contactPerson: string;
    email: string;
    phoneNumber: string;
    bankAccountName?: string;
    bankAccountNumber?: string;
    bankIfscCode?: string;
    upiId?: string;
  }) {
    // Check if user exists
    const user = await db.query.users.findFirst({
      where: eq(users.id, data.userId),
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if already a partner
    const existingPartner = await db.query.partners.findFirst({
      where: eq(partners.userId, data.userId),
    });

    if (existingPartner) {
      throw new AppError('User is already registered as a partner', 400);
    }

    // Create partner record
    const [partner] = await db.insert(partners).values({
      userId: data.userId,
      businessName: data.businessName,
      contactPerson: data.contactPerson,
      email: data.email,
      phoneNumber: data.phoneNumber,
      bankAccountName: data.bankAccountName,
      bankAccountNumber: data.bankAccountNumber,
      bankIfscCode: data.bankIfscCode,
      upiId: data.upiId,
      isActive: false, // Requires admin approval
      totalEarnings: '0.00',
      totalWithdrawals: '0.00',
      availableBalance: '0.00',
      totalPlayers: 0,
    }).returning();

    return partner;
  }

  // Partner login (using existing user credentials)
  async loginPartner(username: string, password: string) {
    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if partner
    const partner = await db.query.partners.findFirst({
      where: eq(partners.userId, user.id),
    });

    if (!partner) {
      throw new AppError('Not registered as a partner', 403);
    }

    if (!partner.isActive) {
      throw new AppError('Partner account is pending approval', 403);
    }

    // Generate token
    const token = jwt.sign(
      {
        userId: user.id,
        partnerId: partner.id,
        role: 'partner',
      },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
      },
      partner: {
        id: partner.id,
        businessName: partner.businessName,
        totalEarnings: partner.totalEarnings,
        availableBalance: partner.availableBalance,
      },
    };
  }

  // Get partner by ID
  async getPartnerById(partnerId: string) {
    const partner = await db.query.partners.findFirst({
      where: eq(partners.id, partnerId),
      with: {
        user: {
          columns: {
            id: true,
            username: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    if (!partner) {
      throw new AppError('Partner not found', 404);
    }

    return partner;
  }

  // Get partner by user ID
  async getPartnerByUserId(userId: string) {
    const partner = await db.query.partners.findFirst({
      where: eq(partners.userId, userId),
    });

    if (!partner) {
      throw new AppError('Partner not found', 404);
    }

    return partner;
  }

  // Update partner profile
  async updatePartnerProfile(partnerId: string, data: {
    businessName?: string;
    contactPerson?: string;
    email?: string;
    phoneNumber?: string;
    bankAccountName?: string;
    bankAccountNumber?: string;
    bankIfscCode?: string;
    upiId?: string;
  }) {
    const [updatedPartner] = await db
      .update(partners)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(partners.id, partnerId))
      .returning();

    if (!updatedPartner) {
      throw new AppError('Partner not found', 404);
    }

    return updatedPartner;
  }

  // Get partner statistics
  async getPartnerStatistics(partnerId: string) {
    const partner = await this.getPartnerById(partnerId);

    // Get referred users count
    const referredUsers = await db.query.users.findMany({
      where: eq(users.referredBy, partner.userId),
    });

    // Get active players (users who have placed bets)
    const activePlayers = await db
      .select({ userId: bets.userId })
      .from(bets)
      .where(sql`${bets.userId} IN (
        SELECT id FROM ${users} WHERE ${users.referredBy} = ${partner.userId}
      )`)
      .groupBy(bets.userId);

    // Get total commissions
    const totalCommissions = await db
      .select({
        total: sql<number>`COALESCE(SUM(CAST(${partnerCommissions.commissionAmount} AS DECIMAL)), 0)`,
        pending: sql<number>`COALESCE(SUM(CASE WHEN ${partnerCommissions.status} = 'pending' THEN CAST(${partnerCommissions.commissionAmount} AS DECIMAL) ELSE 0 END), 0)`,
        paid: sql<number>`COALESCE(SUM(CASE WHEN ${partnerCommissions.status} = 'paid' THEN CAST(${partnerCommissions.commissionAmount} AS DECIMAL) ELSE 0 END), 0)`,
      })
      .from(partnerCommissions)
      .where(eq(partnerCommissions.partnerId, partnerId));

    return {
      totalReferrals: referredUsers.length,
      activePlayers: activePlayers.length,
      totalEarnings: parseFloat(partner.totalEarnings),
      availableBalance: parseFloat(partner.availableBalance),
      totalWithdrawals: parseFloat(partner.totalWithdrawals),
      pendingCommissions: totalCommissions[0]?.pending || 0,
      paidCommissions: totalCommissions[0]?.paid || 0,
    };
  }

  // Get partner commissions
  async getPartnerCommissions(
    partnerId: string,
    filters?: {
      status?: 'pending' | 'paid' | 'cancelled';
      startDate?: Date;
      endDate?: Date;
    },
    limit: number = 50,
    offset: number = 0
  ) {
    let query = db.query.partnerCommissions.findMany({
      where: eq(partnerCommissions.partnerId, partnerId),
      orderBy: [desc(partnerCommissions.createdAt)],
      limit,
      offset,
      with: {
        game: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Apply filters (would need to modify the query builder)
    const allCommissions = await query;

    // Filter in memory (for simplicity - should be done in query)
    let filtered = allCommissions;
    
    if (filters?.status) {
      filtered = filtered.filter(c => c.status === filters.status);
    }

    if (filters?.startDate) {
      filtered = filtered.filter(c => new Date(c.createdAt) >= filters.startDate!);
    }

    if (filters?.endDate) {
      filtered = filtered.filter(c => new Date(c.createdAt) <= filters.endDate!);
    }

    return filtered;
  }

  // Get referred players
  async getReferredPlayers(partnerId: string) {
    const partner = await this.getPartnerById(partnerId);

    const referredUsers = await db.query.users.findMany({
      where: eq(users.referredBy, partner.userId),
      columns: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        createdAt: true,
        isActive: true,
      },
    });

    // Get bet statistics for each player
    const playersWithStats = await Promise.all(
      referredUsers.map(async (user) => {
        const userBets = await db.query.bets.findMany({
          where: eq(bets.userId, user.id),
        });

        const totalBets = userBets.length;
        const totalWagered = userBets.reduce((sum, bet) => sum + parseFloat(bet.amount), 0);
        const totalWon = userBets
          .filter(bet => bet.status === 'won')
          .reduce((sum, bet) => sum + parseFloat(bet.payout || '0'), 0);

        return {
          ...user,
          stats: {
            totalBets,
            totalWagered,
            totalWon,
          },
        };
      })
    );

    return playersWithStats;
  }

  // Request withdrawal
  async requestWithdrawal(partnerId: string, amount: number) {
    const partner = await this.getPartnerById(partnerId);
    const availableBalance = parseFloat(partner.availableBalance);

    if (amount > availableBalance) {
      throw new AppError('Insufficient balance', 400);
    }

    if (amount < 100) {
      throw new AppError('Minimum withdrawal amount is ₹100', 400);
    }

    // Note: Withdrawal request would be created in withdrawals table
    // For now, we'll just update partner balance
    const [updatedPartner] = await db
      .update(partners)
      .set({
        availableBalance: (availableBalance - amount).toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(partners.id, partnerId))
      .returning();

    return {
      message: 'Withdrawal request submitted',
      amount,
      newBalance: updatedPartner.availableBalance,
    };
  }

  // Admin: Get all partners
  async getAllPartners(filters?: {
    isActive?: boolean;
    searchTerm?: string;
  }) {
    let allPartners = await db.query.partners.findMany({
      with: {
        user: {
          columns: {
            username: true,
            email: true,
            fullName: true,
          },
        },
      },
      orderBy: [desc(partners.createdAt)],
    });

    // Apply filters
    if (filters?.isActive !== undefined) {
      allPartners = allPartners.filter(p => p.isActive === filters.isActive);
    }

    if (filters?.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      allPartners = allPartners.filter(p =>
        p.businessName.toLowerCase().includes(term) ||
        p.contactPerson.toLowerCase().includes(term) ||
        p.email.toLowerCase().includes(term)
      );
    }

    return allPartners;
  }

  // Admin: Approve partner
  async approvePartner(partnerId: string) {
    const [partner] = await db
      .update(partners)
      .set({
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(partners.id, partnerId))
      .returning();

    if (!partner) {
      throw new AppError('Partner not found', 404);
    }

    return partner;
  }

  // Admin: Reject/Deactivate partner
  async deactivatePartner(partnerId: string) {
    const [partner] = await db
      .update(partners)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(partners.id, partnerId))
      .returning();

    if (!partner) {
      throw new AppError('Partner not found', 404);
    }

    return partner;
  }

  // Admin: Pay commission
  async payCommission(commissionId: string) {
    const commission = await db.query.partnerCommissions.findFirst({
      where: eq(partnerCommissions.id, commissionId),
    });

    if (!commission) {
      throw new AppError('Commission not found', 404);
    }

    if (commission.status === 'paid') {
      throw new AppError('Commission already paid', 400);
    }

    // Update commission status
    await db
      .update(partnerCommissions)
      .set({
        status: 'paid',
        paidAt: new Date(),
      })
      .where(eq(partnerCommissions.id, commissionId));

    // Update partner balance
    const partner = await this.getPartnerById(commission.partnerId);
    const newBalance = parseFloat(partner.availableBalance) + parseFloat(commission.commissionAmount);

    await db
      .update(partners)
      .set({
        availableBalance: newBalance.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(partners.id, commission.partnerId));

    return {
      message: 'Commission paid successfully',
      amount: commission.commissionAmount,
    };
  }

  // Get partner game history with manipulated values (two-tier system)
  async getPartnerGameHistory(
    partnerId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      status?: 'pending' | 'paid' | 'cancelled';
    },
    limit: number = 50,
    offset: number = 0
  ) {
    const partner = await this.getPartnerById(partnerId);
    
    // Build query
    let queryConditions = [eq(partnerGameEarnings.partnerId, partnerId)];
    
    if (filters?.status) {
      queryConditions.push(eq(partnerGameEarnings.status, filters.status));
    }
    
    if (filters?.startDate) {
      queryConditions.push(gte(partnerGameEarnings.createdAt, filters.startDate));
    }
    
    if (filters?.endDate) {
      queryConditions.push(lte(partnerGameEarnings.createdAt, filters.endDate));
    }
    
    const earnings = await db.query.partnerGameEarnings.findMany({
      where: and(...queryConditions),
      orderBy: [desc(partnerGameEarnings.createdAt)],
      limit,
      offset,
      with: {
        round: {
          columns: {
            roundNumber: true,
            jokerCard: true,
            winningSide: true,
            winningCard: true,
          },
        },
        game: {
          columns: {
            name: true,
          },
        },
      },
    });
    
    // Return SHOWN values only (hide real values from partner)
    return earnings.map(e => ({
      id: e.id,
      gameId: e.gameId,
      gameName: e.game?.name,
      roundId: e.roundId,
      roundNumber: e.round?.roundNumber,
      jokerCard: e.round?.jokerCard,
      winningSide: e.round?.winningSide,
      winningCard: e.round?.winningCard,
      // SHOWN VALUES (after share_percentage multiplier)
      totalBets: parseFloat(e.shownTotalBets),
      totalPayouts: parseFloat(e.shownTotalPayouts),
      profit: parseFloat(e.shownProfit),
      // VISIBLE COMMISSION INFO
      commissionRate: parseFloat(e.commissionRate),
      earned: parseFloat(e.earnedAmount),
      // METADATA
      playerCount: e.playerCount,
      status: e.status,
      paidAt: e.paidAt,
      createdAt: e.createdAt,
      // NOTE: sharePercentage is HIDDEN - partner never sees this!
      // NOTE: real_* values are HIDDEN - partner never sees these!
    }));
  }

  // Admin: Get partner game history with REAL values visible
  async getPartnerGameHistoryAdmin(
    partnerId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      status?: 'pending' | 'paid' | 'cancelled';
    },
    limit: number = 50,
    offset: number = 0
  ) {
    let queryConditions = [eq(partnerGameEarnings.partnerId, partnerId)];
    
    if (filters?.status) {
      queryConditions.push(eq(partnerGameEarnings.status, filters.status));
    }
    
    if (filters?.startDate) {
      queryConditions.push(gte(partnerGameEarnings.createdAt, filters.startDate));
    }
    
    if (filters?.endDate) {
      queryConditions.push(lte(partnerGameEarnings.createdAt, filters.endDate));
    }
    
    const earnings = await db.query.partnerGameEarnings.findMany({
      where: and(...queryConditions),
      orderBy: [desc(partnerGameEarnings.createdAt)],
      limit,
      offset,
      with: {
        round: {
          columns: {
            roundNumber: true,
            jokerCard: true,
            winningSide: true,
            winningCard: true,
          },
        },
        game: {
          columns: {
            name: true,
          },
        },
        partner: {
          columns: {
            partnerCode: true,
          },
        },
      },
    });
    
    // Return ALL values for admin (real + shown)
    return earnings.map(e => ({
      id: e.id,
      partnerId: e.partnerId,
      partnerCode: e.partner?.partnerCode,
      gameId: e.gameId,
      gameName: e.game?.name,
      roundId: e.roundId,
      roundNumber: e.round?.roundNumber,
      jokerCard: e.round?.jokerCard,
      winningSide: e.round?.winningSide,
      winningCard: e.round?.winningCard,
      // REAL VALUES (what actually happened)
      realTotalBets: parseFloat(e.realTotalBets),
      realTotalPayouts: parseFloat(e.realTotalPayouts),
      realProfit: parseFloat(e.realProfit),
      // SHOWN VALUES (what partner sees)
      shownTotalBets: parseFloat(e.shownTotalBets),
      shownTotalPayouts: parseFloat(e.shownTotalPayouts),
      shownProfit: parseFloat(e.shownProfit),
      // COMMISSION STRUCTURE
      sharePercentage: parseFloat(e.sharePercentage),
      commissionRate: parseFloat(e.commissionRate),
      earnedAmount: parseFloat(e.earnedAmount),
      effectiveRate: (parseFloat(e.sharePercentage) * parseFloat(e.commissionRate)) / 100,
      // METADATA
      playerCount: e.playerCount,
      status: e.status,
      paidAt: e.paidAt,
      createdAt: e.createdAt,
    }));
  }
}

export const partnerService = new PartnerService();