/**
 * Extended API Response Types
 * These types add missing properties identified in build analysis
 */

import type { 
  User, 
  Partner, 
  Bet, 
  GameRound, 
  Transaction,
  Referral 
} from './index';

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface AnalyticsResponse {
  // Core metrics
  totalUsers: number;
  userGrowth: number;
  activeUsers: number;
  activeGrowth: number;
  totalRevenue: number;
  revenueGrowth: number;
  gamesPlayed: number;
  gamesGrowth: number;
  avgBet: number;
  avgBetGrowth: number;
  winRate: number;
  winRateChange: number;
  
  // Charts
  revenueChart: Array<{ date: string; revenue: number }>;
  userGrowthChart: Array<{ date: string; users: number }>;
  
  // Top lists
  topGames: Array<{
    id: string;
    name: string;
    plays: number;
    revenue: number;
  }>;
  
  topPlayers: Array<{
    id: string;
    name: string;
    totalBets: number;
    totalWagered: number;
  }>;
  
  // Additional metrics
  totalBets: number;
  totalDeposits: number;
  totalWithdrawals: number;
  activeGames: number;
  suspendedUsers: number;
  pendingWithdrawals: number;
}

// ============================================================================
// PARTNER TYPES
// ============================================================================

export interface PartnerStatisticsResponse {
  // Identity
  partnerName: string;
  name: string;
  email: string;
  phone: string;
  referralCode: string;
  upiId?: string;
  
  // Earnings
  totalEarnings: number;
  pendingEarnings: number;
  availableBalance: number;
  thisMonthEarnings: number;
  lastMonthEarnings: number;
  commission_rate: number;
  commissionRate: number;
  
  // Changes
  earningsChange: number;
  pendingChange: number;
  
  // Referrals
  totalReferrals: number;
  referralsChange: number;
  activeReferrals: number;
  activeChange: number;
  activeRate: number;
  
  // Recent data
  recentReferrals: Array<{
    id: string;
    name: string;
    joinedAt: string;
    status: string;
    totalBets: number;
  }>;
  
  // Growth
  monthlyGrowth: Array<{
    month: string;
    earnings: number;
    referrals: number;
  }>;
  
  // Performance
  performanceRank: number;
  daysActive: number;
  avgEarningsPerDay: number;
}

export interface CommissionsResponse {
  commissions: Array<{
    id: string;
    amount: number;
    status: string;
    createdAt: string;
    paidAt?: string;
    userId?: string;
    user?: {
      name: string;
      phone: string;
    };
  }>;
  availableBalance: number;
  pendingAmount: number;
  minWithdrawal: number;
  maxWithdrawal: number;
  requests: Array<any>;
  stats: {
    totalEarned: number;
    totalPaid: number;
    totalPending: number;
  };
  total?: number;
  totalPages?: number;
}

export interface PartnerEarningsResponse {
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    status: string;
    createdAt: string;
    description?: string;
  }>;
  summary: {
    totalEarnings: number;
    pendingEarnings: number;
    paidEarnings: number;
  };
  breakdown: {
    thisMonth: number;
    lastMonth: number;
    thisYear: number;
  };
  monthlyTrend: Array<{
    month: string;
    amount: number;
  }>;
  totalAmount: number;
  totalPages: number;
  total: number;
  topPlayers: Array<{
    id: string;
    name: string;
    earnings: number;
  }>;
}

export interface PartnerPlayersResponse {
  players: Array<{
    id: string;
    name: string;
    phone: string;
    email: string;
    joinedAt: string;
    status: string;
    totalBets: number;
    totalWagered: number;
    lastActive: string;
  }>;
  total: number;
  totalPages: number;
  stats: {
    active: number;
    inactive: number;
    suspended: number;
  };
}

// ============================================================================
// USER TYPES
// ============================================================================

export interface UserStatistics {
  // Basic stats
  gamesPlayed: number;
  gamesWon: number;
  total_bets: number;
  total_wagered: number;
  total_won: number;
  total_referrals: number;
  
  // Extended stats
  totalBets: number;
  totalWins: number;
  totalLosses: number;
  totalBetAmount: number;
  totalWinAmount: number;
  biggestWin: number;
  currentStreak: number;
  longestStreak: number;
  winRate: number;
  lastBetAt?: string;
}

export interface GameHistoryResponse {
  games: Array<{
    id: string;
    roundNumber: number;
    betSide: string;
    betAmount: number;
    result: string;
    payoutAmount: number;
    createdAt: string;
    jokerCard?: string;
    winningCard?: string;
  }>;
  stats: {
    totalGames: number;
    totalWins: number;
    totalLosses: number;
    winRate: number;
    totalWagered: number;
    totalWon: number;
  };
  total: number;
  totalPages: number;
}

export interface UserBonusesResponse {
  bonuses: Array<{
    id: string;
    type: string;
    amount: number;
    status: string;
    wageringRequirement: number;
    wageringProgress: number;
    expiresAt: string;
    createdAt: string;
  }>;
  total: number;
  activeBonuses: number;
  totalBonusAmount: number;
}

export interface ReferralStatsResponse {
  totalReferrals: number;
  activeReferrals: number;
  totalEarned: number;
  pendingEarned: number;
  referralCode: string;
  referralLink: string;
  recentReferrals: Array<{
    id: string;
    name: string;
    joinedAt: string;
    status: string;
    bonusEarned: number;
  }>;
}

// ============================================================================
// GAME TYPES
// ============================================================================

export interface GameRoundsResponse {
  items: GameRound[];
  rounds?: GameRound[];
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}

export interface CurrentGameResponse {
  game: {
    id: string;
    name: string;
    status: string;
    streamUrl: string;
    minBet: number;
    maxBet: number;
  };
  round: GameRound | null;
  stats: {
    totalPlayers: number;
    totalBets: number;
    totalAndarBets: number;
    totalBaharBets: number;
  };
}

// ============================================================================
// WITHDRAWAL TYPES
// ============================================================================

export interface WithdrawalsResponse {
  requests: Array<{
    id: string;
    userId: string;
    amount: number;
    status: string;
    method: string;
    createdAt: string;
    processedAt?: string;
    transactionId?: string;
    user?: {
      name: string;
      phone: string;
      email: string;
    };
  }>;
  withdrawals?: Array<any>; // Alias
  stats: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
    totalAmount?: number;
  };
  total: number;
  totalPages: number;
}

// ============================================================================
// ADMIN TYPES
// ============================================================================

export interface UsersResponse {
  users: User[];
  total: number;
  totalPages: number;
  stats: {
    active: number;
    suspended: number;
    banned: number;
  };
}

export interface PartnersResponse {
  partners: Partner[];
  total: number;
  totalPages: number;
  stats: {
    active: number;
    suspended: number;
    totalEarnings: number;
  };
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface NotificationsResponse {
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
  }>;
  total: number;
  unread: number;
}

// ============================================================================
// TRANSACTION TYPES
// ============================================================================

export interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
  totalPages: number;
  stats: {
    totalDeposits: number;
    totalWithdrawals: number;
    totalBets: number;
    totalWins: number;
  };
}