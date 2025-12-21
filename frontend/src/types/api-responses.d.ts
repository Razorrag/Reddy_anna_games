/**
 * API Response Type Definitions
 * These types match the actual backend responses
 */

// ============================================
// Base Response Types
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================
// User Response Types
// ============================================

export interface UserDetailsResponse {
  user: {
    id: string;
    phone: string;
    username?: string;
    name?: string;
    full_name?: string;
    email: string | null;
    role: 'player' | 'admin' | 'partner';
    balance?: number;
    bonus_balance?: number;
    mainBalance?: number;
    bonusBalance?: number;
    referral_code?: string;
    referralCode?: string;
    referred_by?: string | null;
    referredBy?: string | null;
    status?: 'active' | 'suspended' | 'banned';
    is_verified?: boolean;
    isVerified?: boolean;
    verification_status?: string;
    created_at?: string;
    createdAt?: string;
    updated_at?: string;
    updatedAt?: string;
  };
  statistics?: {
    totalBets?: number;
    totalWins?: number;
    totalLosses?: number;
    totalAmountWon?: number;
    totalAmountLost?: number;
    winRate?: number;
    bets?: {
      totalBets: number;
      totalBetAmount: number;
      totalWinnings: number;
    };
    transactions?: {
      totalDeposits: number;
      totalWithdrawals: number;
    };
  };
  documents?: any[];
}

export interface UsersResponse {
  users: any[];
  stats?: {
    total: number;
    active: number;
    suspended: number;
    banned: number;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

// ============================================
// Partner Response Types
// ============================================

export interface PartnerDetailsResponse {
  partner?: any;
  id?: string;
  name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  referralCode?: string;
  referral_code?: string;
  commission_rate?: number;
  commissionRate?: number;
  status?: 'active' | 'suspended' | 'banned';
  stats?: {
    totalEarnings: number;
    pendingEarnings: number;
    totalReferrals: number;
    activeReferrals: number;
  };
  referred_users?: any[];
  earnings_history?: any[];
  created_at?: string;
  createdAt?: string;
}

export interface PartnersResponse {
  partners: any[];
  stats?: {
    total: number;
    active: number;
    suspended: number;
    totalEarnings: number;
  };
  topPerformers?: any[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface PartnerStatisticsResponse {
  partnerName?: string;
  partnerId?: string;
  name?: string;
  email?: string;
  phone?: string;
  upiId?: string;
  referralCode?: string;
  commissionRate?: number;
  totalEarnings?: number;
  pendingEarnings?: number;
  totalReferrals?: number;
  activeReferrals?: number;
  earningsChange?: number;
  pendingChange?: number;
  referralsChange?: number;
  activeChange?: number;
  activeRate?: number;
  performanceRank?: number;
  daysActive?: number;
  avgEarningsPerDay?: number;
  recentReferrals?: any[];
  monthlyGrowth?: number;
  thisMonthEarnings?: number;
  lastMonthEarnings?: number;
  availableBalance?: number;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
  earningsAlerts?: boolean;
  payoutAlerts?: boolean;
  referralAlerts?: boolean;
  memberSince?: string;
  stats?: {
    totalPlayers: number;
    activePlayers: number;
  };
  commissionTrend?: any[];
}

export interface PartnerEarningsResponse {
  transactions?: any[];
  summary?: {
    totalEarnings: number;
    pendingEarnings: number;
    paidEarnings: number;
    thisMonth: number;
  };
  breakdown?: any[];
  monthlyTrend?: any[];
  totalAmount?: number;
  total?: number;
  totalPages?: number;
  topPlayers?: any[];
}

export interface PartnerPlayersResponse {
  players?: any[];
  stats?: {
    total: number;
    active: number;
    totalRevenue: number;
    avgRevenue: number;
  };
  topPerformers?: any[];
  totalPages?: number;
}

// ============================================
// Payment Response Types
// ============================================

export interface WithdrawalsResponse {
  withdrawals?: any[];
  requests?: any[];
  stats?: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface DepositsResponse {
  deposits?: any[];
  stats?: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CommissionsResponse {
  commissions?: any[];
  requests?: any[];
  availableBalance?: number;
  pendingAmount?: number;
  totalPaid?: number;
  totalPaidOut?: number;
  minWithdrawal?: number;
  maxWithdrawal?: number;
  stats?: {
    pending: number;
    approved: number;
    total: number;
  };
}

// ============================================
// Analytics Response Types
// ============================================

export interface AnalyticsResponse {
  analytics?: any[];
  aggregates?: any;
  payments?: any[];
  total?: number;
  totalUsers?: number;
  userGrowth?: number;
  activeUsers?: number;
  activeGrowth?: number;
  totalRevenue?: number;
  revenueGrowth?: number;
  gamesPlayed?: number;
  gamesGrowth?: number;
  avgBet?: number;
  avgBetGrowth?: number;
  winRate?: number;
  winRateChange?: number;
  stats?: {
    totalRevenue: number;
    totalTransactions: number;
    pending: number;
  };
}

export interface DashboardStatsResponse {
  users?: any;
  games?: any;
  bets?: any;
  transactions?: any;
  platformName?: string;
  platformUrl?: string;
  supportEmail?: string;
  supportPhone?: string;
  timezone?: string;
  currency?: string;
  sessionTimeout?: number;
  maxLoginAttempts?: number;
  passwordMinLength?: number;
  twoFactorEnabled?: boolean;
  ipWhitelist?: string[];
  minDeposit?: number;
  maxDeposit?: number;
  minWithdrawal?: number;
  maxWithdrawal?: number;
  withdrawalProcessingTime?: number;
  autoApproveDeposits?: boolean;
  whatsappEnabled?: boolean;
  whatsappNumber?: string;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
  omeStreamUrl?: string;
  apiKey?: string;
  webhookUrl?: string;
  analyticsEnabled?: boolean;
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  allowedIPs?: string[];
}

// ============================================
// Game Response Types
// ============================================

export interface GameHistoryResponse {
  games?: any[];
  rounds?: any[];
  items?: any[]; // Alternative property name
  stats?: any;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// Bonus Response Types
// ============================================

export interface BonusesResponse {
  bonuses: any[];
  active: any[];
  history: any[];
  stats?: {
    total: number;
    active: number;
    unlocked: number;
  };
}

// ============================================
// Referral Response Types
// ============================================

export interface ReferralStats {
  totalSignups?: number;
  activeUsers?: number;
  conversionRate?: number;
  retentionRate?: number;
  signupsChange?: number;
  activeChange?: number;
  conversionChange?: number;
  retentionChange?: number;
  conversionFunnel?: any[];
  signupTrend?: any[];
  activityBreakdown?: any[];
  avgPlayerValue?: number;
  avgEngagement?: number;
  bestDay?: string;
  peakHour?: number;
  topSources?: any[];
  insights?: any[];
  comparison?: any;
}

export interface ReferralsResponse {
  referrals?: any[];
  stats?: {
    total: number;
    active: number;
    earnings: number;
  };
}

// ============================================
// Notification Response Types
// ============================================

export interface NotificationsResponse {
  notifications: any[];
  unreadCount?: number;
  total?: number;
}

// ============================================
// Transaction Response Types
// ============================================

export interface TransactionFilters {
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface TransactionsResponse extends PaginatedResponse<any> {
  transactions?: any[]; // Alternative property
  items?: any[]; // Standard property
}