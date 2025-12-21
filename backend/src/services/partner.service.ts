import { db } from '../db';
import { partners, partnerCommissions, users, bets, partnerGameEarnings } from '../db/schema';
import { eq, and, desc, sql, gte, lte } from 'drizzle-orm';
import { AppError } from '../middleware/errorHandler';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Server as SocketIOServer } from 'socket.io';

export class PartnerService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
  private io?: SocketIOServer;

  // Set Socket.IO instance for real-time broadcasts
  setIo(ioInstance: SocketIOServer) {
    this.io = ioInstance;
  }

  // Register new partner
  async registerPartner(data: {
    userId: string;
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
      partnerCode: `P${Date.now().toString(36).toUpperCase()}`,
      sharePercentage: '50.00', // Default 50% share
      commissionRate: '10.00', // Default 10% visible rate (5% effective)
      totalPlayers: 0,
      totalCommission: '0.00',
      pendingCommission: '0.00',
      status: 'active',
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

    if (partner.status !== 'active') {
      throw new AppError('Partner account is not active', 403);
    }

    // Generate token
    const token = jwt.sign(
      {
        userId: user.id,
        partnerId: partner.id,
        role: 'partner',
      },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN } as jwt.SignOptions
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
        partnerCode: partner.partnerCode,
        totalCommission: partner.totalCommission,
        pendingCommission: partner.pendingCommission,
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

  // Update partner commission settings
  async updatePartnerSettings(partnerId: string, data: {
    sharePercentage?: string;
    commissionRate?: string;
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
        total: sql<number>`COALESCE(SUM(CAST(${partnerCommissions.amount} AS DECIMAL)), 0)`,
        pending: sql<number>`COALESCE(SUM(CASE WHEN ${partnerCommissions.status} = 'pending' THEN CAST(${partnerCommissions.amount} AS DECIMAL) ELSE 0 END), 0)`,
        completed: sql<number>`COALESCE(SUM(CASE WHEN ${partnerCommissions.status} = 'completed' THEN CAST(${partnerCommissions.amount} AS DECIMAL) ELSE 0 END), 0)`,
      })
      .from(partnerCommissions)
      .where(eq(partnerCommissions.partnerId, partnerId));

    return {
      totalReferrals: referredUsers.length,
      activePlayers: activePlayers.length,
      totalCommission: parseFloat(partner.totalCommission),
      pendingCommission: parseFloat(partner.pendingCommission),
      pendingAmount: totalCommissions[0]?.pending || 0,
      completedAmount: totalCommissions[0]?.completed || 0,
    };
  }

  // Get partner commissions
  async getPartnerCommissions(
    partnerId: string,
    filters?: {
      status?: 'pending' | 'completed' | 'failed' | 'cancelled';
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
        user: {
          columns: {
            username: true,
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
        status: true,
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
          .reduce((sum, bet) => sum + parseFloat(bet.payoutAmount || '0'), 0);

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

  // Request withdrawal (would integrate with withdrawal system)
  async requestWithdrawal(partnerId: string, amount: number) {
    const partner = await this.getPartnerById(partnerId);
    const pendingCommission = parseFloat(partner.pendingCommission);

    if (amount > pendingCommission) {
      throw new AppError('Insufficient pending commission', 400);
    }

    if (amount < 100) {
      throw new AppError('Minimum withdrawal amount is ₹100', 400);
    }

    // Note: In production, create withdrawal request in withdrawals table
    // For now, return success message
    return {
      message: 'Withdrawal request submitted',
      amount,
      pendingCommission,
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
      const targetStatus = filters.isActive ? 'active' : 'suspended';
      allPartners = allPartners.filter(p => p.status === targetStatus);
    }

    if (filters?.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      allPartners = allPartners.filter(p =>
        p.partnerCode.toLowerCase().includes(term) ||
        (p.user?.username || '').toLowerCase().includes(term) ||
        (p.user?.email || '').toLowerCase().includes(term)
      );
    }

    return allPartners;
  }

  // Admin: Activate partner
  async activatePartner(partnerId: string) {
    const [partner] = await db
      .update(partners)
      .set({
        status: 'active',
        updatedAt: new Date(),
      })
      .where(eq(partners.id, partnerId))
      .returning();

    if (!partner) {
      throw new AppError('Partner not found', 404);
    }

    return partner;
  }

  // Admin: Suspend partner
  async suspendPartner(partnerId: string) {
    const [partner] = await db
      .update(partners)
      .set({
        status: 'suspended',
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

    if (commission.status === 'completed') {
      throw new AppError('Commission already paid', 400);
    }

    // Update commission status
    await db
      .update(partnerCommissions)
      .set({
        status: 'completed',
        paidAt: new Date(),
      })
      .where(eq(partnerCommissions.id, commissionId));

    // Update partner totals
    const partner = await this.getPartnerById(commission.partnerId);
    const newTotalCommission = parseFloat(partner.totalCommission) + parseFloat(commission.amount);
    const newPendingCommission = parseFloat(partner.pendingCommission) - parseFloat(commission.amount);

    await db
      .update(partners)
      .set({
        totalCommission: newTotalCommission.toFixed(2),
        pendingCommission: Math.max(0, newPendingCommission).toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(partners.id, commission.partnerId));

    return {
      message: 'Commission paid successfully',
      amount: commission.amount,
    };
  }

  // Get partner game history with manipulated values (two-tier system)
  async getPartnerGameHistory(
    partnerId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      status?: 'pending' | 'completed' | 'failed' | 'cancelled';
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
      status?: 'pending' | 'completed' | 'failed' | 'cancelled';
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