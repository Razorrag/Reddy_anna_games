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
  full_name?: string; // Backend sends this
  username?: string; // Backend may send this
  email: string | null;
  role: 'player' | 'admin' | 'partner';
  mainBalance: number;
  balance?: number; // Backend sends this
  bonusBalance: number;
  bonus_balance?: number; // Backend sends this
  referralCode: string;
  referral_code?: string; // Backend sends this
  referredBy: string | null;
  referred_by?: string | null; // Backend sends this
  isActive: boolean;
  status?: 'active' | 'suspended' | 'banned'; // Backend sends this
  isVerified?: boolean;
  is_verified?: boolean; // Backend sends this
  verification_status?: string; // Backend may send this
  createdAt: string;
  created_at?: string; // Backend sends this
  updatedAt: string;
  updated_at?: string; // Backend sends this
  statistics?: UserStatistics; // For user details page
  documents?: any[]; // For verification page
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
  state?: 'idle' | 'waiting' | 'betting' | 'playing' | 'dealing' | 'complete' | 'completed' | 'no_winner' | 'cancelled'; // Current game state
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
  state?: 'idle' | 'waiting' | 'betting' | 'playing' | 'dealing' | 'complete' | 'completed' | 'no_winner' | 'cancelled'; // Legacy compatibility
  jokerCard: string | null;
  winningCard: string | null;
  winingSide: 'andar' | 'bahar' | null;
  winningSide?: 'andar' | 'bahar' | null; // Alternative spelling
  totalAndarBets: number;
  totalBaharBets: number;
  totalPayout: number;
  startedAt: string;
  endedAt: string | null;
  bettingEndTime?: string; // For timer display
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
  status: 'locked' | 'active' | 'unlocked' | 'expired' | 'cancelled' | 'completed';
  expiresAt: string | null;
  unlockedAt: string | null;
  createdAt: string;
  linkedBonusId?: string | null; // For referral bonuses linked to deposit bonuses
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
