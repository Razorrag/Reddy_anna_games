/**
 * Core type definitions for the application
 */

// ============================================
// User Types
// ============================================

export interface User {
  id: string;
  phone: string;
  name: string;
  email: string | null;
  role: 'player' | 'admin' | 'partner';
  mainBalance: number;
  bonusBalance: number;
  referralCode: string;
  referredBy: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserStatistics {
  userId: string;
  totalGamesPlayed: number;
  totalWins: number;
  totalLosses: number;
  totalAmountWon: number;
  totalAmountLost: number;
  totalBets: number;
  winRate: number;
  currentStreak: number;
  longestWinStreak: number;
  longestLoseStreak: number;
}

// ============================================
// Game Types
// ============================================

export interface Game {
  id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  minBet: number;
  maxBet: number;
  settings: GameSettings;
  createdAt: string;
}

export interface GameSettings {
  bettingTime: number;
  payoutMultiplier: number;
  roundTimeout: number;
}

export interface GameRound {
  id: string;
  gameId: string;
  roundNumber: number;
  status: 'betting' | 'dealing' | 'complete' | 'cancelled';
  jokerCard: string | null;
  winningCard: string | null;
  winingSide: 'andar' | 'bahar' | null;
  totalAndarBets: number;
  totalBaharBets: number;
  totalPayout: number;
  startedAt: string;
  endedAt: string | null;
}

export interface Bet {
  id: string;
  userId: string;
  roundId: string;
  amount: number;
  side: 'andar' | 'bahar';
  status: 'pending' | 'won' | 'lost' | 'refunded';
  payout: number | null;
  createdAt: string;
}

export interface Card {
  value: string;
  suit: string;
}

// ============================================
// Transaction Types
// ============================================

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'bet' | 'win' | 'bonus' | 'referral' | 'commission';
  amount: number;
  balanceType: 'main' | 'bonus';
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface Deposit {
  id: string;
  userId: string;
  amount: number;
  screenshotUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason: string | null;
  processedBy: string | null;
  processedAt: string | null;
  createdAt: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  upiId: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  rejectionReason: string | null;
  processedBy: string | null;
  processedAt: string | null;
  createdAt: string;
}

// ============================================
// Bonus Types
// ============================================

export interface Bonus {
  id: string;
  userId: string;
  type: 'signup' | 'referral' | 'deposit' | 'promotional' | 'cashback';
  amount: number;
  wageringRequirement: number;
  wageringCompleted: number;
  status: 'active' | 'unlocked' | 'expired' | 'cancelled';
  expiresAt: string | null;
  unlockedAt: string | null;
  createdAt: string;
}

// ============================================
// Partner Types
// ============================================

export interface Partner {
  id: string;
  phone: string;
  name: string;
  email: string | null;
  referralCode: string;
  commissionRate: number;
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  isActive: boolean;
  createdAt: string;
}

export interface PartnerCommission {
  id: string;
  partnerId: string;
  userId: string;
  betId: string;
  betAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'pending' | 'paid';
  paidAt: string | null;
  createdAt: string;
}

// ============================================
// WebSocket Event Types
// ============================================

export interface WSRoundUpdate {
  type: 'round_update';
  round: GameRound;
}

export interface WSBetPlaced {
  type: 'bet_placed';
  bet: Bet;
  totalAndarBets: number;
  totalBaharBets: number;
}

export interface WSBalanceUpdate {
  type: 'balance_update';
  userId: string;
  mainBalance: number;
  bonusBalance: number;
}

export interface WSWinnerAnnounce {
  type: 'winner_announce';
  roundId: string;
  winningSide: 'andar' | 'bahar';
  winningCard: string;
  totalPayout: number;
}

export type WSEvent = 
  | WSRoundUpdate 
  | WSBetPlaced 
  | WSBalanceUpdate 
  | WSWinnerAnnounce;

// ============================================
// API Response Types
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
// Form Types
// ============================================

export interface LoginFormData {
  phone: string;
  password: string;
}

export interface SignupFormData {
  phone: string;
  name: string;
  password: string;
  confirmPassword: string;
  referralCode?: string;
}

export interface DepositFormData {
  amount: number;
  screenshot: File;
}

export interface WithdrawalFormData {
  amount: number;
  upiId: string;
}

// ============================================
// Analytics Types
// ============================================

export interface DashboardStats {
  totalPlayers: number;
  activePlayers: number;
  totalRevenue: number;
  totalPayout: number;
  profit: number;
  profitMargin: number;
}

export interface GameStatistics {
  totalRounds: number;
  totalBets: number;
  totalBetAmount: number;
  totalPayout: number;
  andarWins: number;
  baharWins: number;
  averageBetAmount: number;
  averagePlayersPerRound: number;
}

// ============================================
// Referral Types
// ============================================

export interface Referral {
  id: string;
  referrerId: string;
  referredUserId: string;
  referredUser?: {
    id: string;
    phone: string;
    name: string;
    createdAt: string;
  };
  bonusEarned: number;
  status: 'pending' | 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Notification Types
// ============================================

export interface Notification {
  id: string;
  userId: string;
  type: 'welcome' | 'deposit_received' | 'withdrawal_approved' | 'win' | 'bonus_credited' | 'referral_earned' | 'account_status' | 'promotion' | 'game_update' | 'commission_earned';
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}
// ============================================
// Export API Response Types
// ============================================

export * from './api-responses';
