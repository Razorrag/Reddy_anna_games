import { pgTable, uuid, varchar, text, timestamp, decimal, integer, boolean, pgEnum, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['player', 'admin', 'partner']);
export const userStatusEnum = pgEnum('user_status', ['active', 'suspended', 'banned']);
export const gameStatusEnum = pgEnum('game_status', ['active', 'inactive', 'maintenance']);
export const roundStatusEnum = pgEnum('round_status', ['betting', 'playing', 'completed', 'cancelled']);
export const betStatusEnum = pgEnum('bet_status', ['pending', 'won', 'lost', 'cancelled', 'refunded']);
export const transactionTypeEnum = pgEnum('transaction_type', ['deposit', 'withdrawal', 'bet', 'win', 'bonus', 'commission', 'refund']);
export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'completed', 'failed', 'cancelled']);
export const bonusTypeEnum = pgEnum('bonus_type', ['signup', 'deposit', 'referral', 'loyalty']);
export const bonusStatusEnum = pgEnum('bonus_status', ['active', 'completed', 'expired', 'cancelled']);
export const withdrawalStatusEnum = pgEnum('withdrawal_status', ['pending', 'approved', 'rejected', 'processing', 'completed']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 50 }).unique().notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 20 }),
  fullName: varchar('full_name', { length: 100 }),
  balance: decimal('balance', { precision: 12, scale: 2 }).default('0.00').notNull(),
  bonusBalance: decimal('bonus_balance', { precision: 12, scale: 2 }).default('0.00').notNull(),
  role: userRoleEnum('role').default('player').notNull(),
  status: userStatusEnum('status').default('active').notNull(),
  referralCode: varchar('referral_code', { length: 20 }).unique(),
  referredBy: uuid('referred_by'),
  profileImage: text('profile_image'),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  usernameIdx: index('users_username_idx').on(table.username),
  emailIdx: index('users_email_idx').on(table.email),
  referralCodeIdx: index('users_referral_code_idx').on(table.referralCode),
}));

// Games table
export const games = pgTable('games', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  status: gameStatusEnum('status').default('active').notNull(),
  streamUrl: text('stream_url'),
  thumbnailUrl: text('thumbnail_url'),
  minBet: decimal('min_bet', { precision: 10, scale: 2 }).default('10.00').notNull(),
  maxBet: decimal('max_bet', { precision: 10, scale: 2 }).default('100000.00').notNull(),
  description: text('description'),
  rules: text('rules'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Game Rounds table
export const gameRounds = pgTable('game_rounds', {
  id: uuid('id').primaryKey().defaultRandom(),
  gameId: uuid('game_id').references(() => games.id).notNull(),
  roundNumber: integer('round_number').notNull(),
  status: roundStatusEnum('status').default('betting').notNull(),
  jokerCard: varchar('joker_card', { length: 10 }),
  winningSide: varchar('winning_side', { length: 10 }),
  winningCard: varchar('winning_card', { length: 10 }),
  totalAndarBets: decimal('total_andar_bets', { precision: 12, scale: 2 }).default('0.00').notNull(),
  totalBaharBets: decimal('total_bahar_bets', { precision: 12, scale: 2 }).default('0.00').notNull(),
  totalBetAmount: decimal('total_bet_amount', { precision: 12, scale: 2 }).default('0.00').notNull(),
  totalPayoutAmount: decimal('total_payout_amount', { precision: 12, scale: 2 }).default('0.00').notNull(),
  bettingStartTime: timestamp('betting_start_time'),
  bettingEndTime: timestamp('betting_end_time'),
  startTime: timestamp('start_time').defaultNow().notNull(),
  endTime: timestamp('end_time'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  gameIdIdx: index('game_rounds_game_id_idx').on(table.gameId),
  statusIdx: index('game_rounds_status_idx').on(table.status),
}));

// Bets table
export const bets = pgTable('bets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  roundId: uuid('round_id').references(() => gameRounds.id).notNull(),
  gameId: uuid('game_id').references(() => games.id).notNull(),
  betSide: varchar('bet_side', { length: 10 }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  potentialWin: decimal('potential_win', { precision: 10, scale: 2 }),
  status: betStatusEnum('status').default('pending').notNull(),
  payoutAmount: decimal('payout_amount', { precision: 10, scale: 2 }).default('0.00').notNull(),
  isBonus: boolean('is_bonus').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('bets_user_id_idx').on(table.userId),
  roundIdIdx: index('bets_round_id_idx').on(table.roundId),
  statusIdx: index('bets_status_idx').on(table.status),
}));

// Transactions table
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  type: transactionTypeEnum('type').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  balanceBefore: decimal('balance_before', { precision: 12, scale: 2 }),
  balanceAfter: decimal('balance_after', { precision: 12, scale: 2 }),
  status: transactionStatusEnum('status').default('pending').notNull(),
  referenceId: uuid('reference_id'),
  referenceType: varchar('reference_type', { length: 50 }),
  description: text('description'),
  metadata: text('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('transactions_user_id_idx').on(table.userId),
  typeIdx: index('transactions_type_idx').on(table.type),
  createdAtIdx: index('transactions_created_at_idx').on(table.createdAt),
}));

// Partners table
export const partners = pgTable('partners', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  partnerCode: varchar('partner_code', { length: 20 }).unique().notNull(),
  sharePercentage: decimal('share_percentage', { precision: 5, scale: 2 }).default('50.00').notNull(), // Hidden multiplier (25-75%)
  commissionRate: decimal('commission_rate', { precision: 5, scale: 2 }).default('10.00').notNull(), // Visible rate (changed from 0.0200)
  totalPlayers: integer('total_players').default(0).notNull(),
  totalCommission: decimal('total_commission', { precision: 12, scale: 2 }).default('0.00').notNull(),
  pendingCommission: decimal('pending_commission', { precision: 12, scale: 2 }).default('0.00').notNull(),
  status: userStatusEnum('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  partnerCodeIdx: index('partners_partner_code_idx').on(table.partnerCode),
}));

// Partner Commissions table
export const partnerCommissions = pgTable('partner_commissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  partnerId: uuid('partner_id').references(() => partners.id).notNull(),
  betId: uuid('bet_id').references(() => bets.id),
  userId: uuid('user_id').references(() => users.id).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status: transactionStatusEnum('status').default('pending').notNull(),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  partnerIdIdx: index('partner_commissions_partner_id_idx').on(table.partnerId),
}));

// Partner Game Earnings table (track per-game commissions with two-tier structure)
export const partnerGameEarnings = pgTable('partner_game_earnings', {
  id: uuid('id').primaryKey().defaultRandom(),
  partnerId: uuid('partner_id').references(() => partners.id).notNull(),
  gameId: uuid('game_id').references(() => games.id).notNull(),
  roundId: uuid('round_id').references(() => gameRounds.id).notNull(),
  
  // Real values (admin only - never shown to partner)
  realProfit: decimal('real_profit', { precision: 12, scale: 2 }).notNull(),
  realTotalBets: decimal('real_total_bets', { precision: 12, scale: 2 }).notNull(),
  realTotalPayouts: decimal('real_total_payouts', { precision: 12, scale: 2 }).notNull(),
  
  // Shown values (partner sees these - after share_percentage multiplier)
  shownProfit: decimal('shown_profit', { precision: 12, scale: 2 }).notNull(),
  shownTotalBets: decimal('shown_total_bets', { precision: 12, scale: 2 }).notNull(),
  shownTotalPayouts: decimal('shown_total_payouts', { precision: 12, scale: 2 }).notNull(),
  
  // Commission calculation
  sharePercentage: decimal('share_percentage', { precision: 5, scale: 2 }).notNull(), // Snapshot of partner's rate
  commissionRate: decimal('commission_rate', { precision: 5, scale: 2 }).notNull(), // Snapshot of partner's rate
  earnedAmount: decimal('earned_amount', { precision: 10, scale: 2 }).notNull(), // shownProfit * commissionRate
  
  // Metadata
  playerCount: integer('player_count').default(0).notNull(),
  status: transactionStatusEnum('status').default('pending').notNull(),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  partnerIdIdx: index('partner_game_earnings_partner_id_idx').on(table.partnerId),
  roundIdIdx: index('partner_game_earnings_round_id_idx').on(table.roundId),
  statusIdx: index('partner_game_earnings_status_idx').on(table.status),
}));

// Referrals table
export const referrals = pgTable('referrals', {
  id: uuid('id').primaryKey().defaultRandom(),
  referrerId: uuid('referrer_id').references(() => users.id).notNull(),
  referredId: uuid('referred_id').references(() => users.id).notNull(),
  referralCode: varchar('referral_code', { length: 20 }).notNull(),
  bonusEarned: decimal('bonus_earned', { precision: 10, scale: 2 }).default('0.00').notNull(),
  status: transactionStatusEnum('status').default('pending').notNull(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  referrerIdIdx: index('referrals_referrer_id_idx').on(table.referrerId),
}));

// User Bonuses table
export const userBonuses = pgTable('user_bonuses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  bonusType: bonusTypeEnum('bonus_type').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  wageringRequirement: decimal('wagering_requirement', { precision: 12, scale: 2 }).default('0.00').notNull(),
  wageringProgress: decimal('wagering_progress', { precision: 12, scale: 2 }).default('0.00').notNull(),
  status: bonusStatusEnum('status').default('active').notNull(),
  expiresAt: timestamp('expires_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('user_bonuses_user_id_idx').on(table.userId),
  statusIdx: index('user_bonuses_status_idx').on(table.status),
}));

// Deposits table
export const deposits = pgTable('deposits', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }).notNull(),
  transactionId: varchar('transaction_id', { length: 255 }),
  screenshotUrl: text('screenshot_url'),
  status: transactionStatusEnum('status').default('pending').notNull(),
  approvedBy: uuid('approved_by').references(() => users.id),
  approvedAt: timestamp('approved_at'),
  rejectionReason: text('rejection_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('deposits_user_id_idx').on(table.userId),
  statusIdx: index('deposits_status_idx').on(table.status),
}));

// Withdrawals table
export const withdrawals = pgTable('withdrawals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  withdrawalMethod: varchar('withdrawal_method', { length: 50 }).notNull(),
  bankName: varchar('bank_name', { length: 100 }),
  accountNumber: varchar('account_number', { length: 50 }),
  ifscCode: varchar('ifsc_code', { length: 20 }),
  upiId: varchar('upi_id', { length: 100 }),
  status: withdrawalStatusEnum('status').default('pending').notNull(),
  processedBy: uuid('processed_by').references(() => users.id),
  processedAt: timestamp('processed_at'),
  transactionId: varchar('transaction_id', { length: 255 }),
  rejectionReason: text('rejection_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('withdrawals_user_id_idx').on(table.userId),
  statusIdx: index('withdrawals_status_idx').on(table.status),
}));

// Game Statistics table (partitioned by month)
export const gameStatistics = pgTable('game_statistics', {
  id: uuid('id').primaryKey().defaultRandom(),
  gameId: uuid('game_id').references(() => games.id).notNull(),
  date: timestamp('date').notNull(),
  totalRounds: integer('total_rounds').default(0).notNull(),
  totalBets: integer('total_bets').default(0).notNull(),
  totalBetAmount: decimal('total_bet_amount', { precision: 12, scale: 2 }).default('0.00').notNull(),
  totalPayoutAmount: decimal('total_payout_amount', { precision: 12, scale: 2 }).default('0.00').notNull(),
  totalPlayers: integer('total_players').default(0).notNull(),
  revenue: decimal('revenue', { precision: 12, scale: 2 }).default('0.00').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  gameIdDateIdx: index('game_statistics_game_id_date_idx').on(table.gameId, table.date),
}));

// User Statistics table
export const userStatistics = pgTable('user_statistics', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  totalBets: integer('total_bets').default(0).notNull(),
  totalWins: integer('total_wins').default(0).notNull(),
  totalLosses: integer('total_losses').default(0).notNull(),
  totalBetAmount: decimal('total_bet_amount', { precision: 12, scale: 2 }).default('0.00').notNull(),
  totalWinAmount: decimal('total_win_amount', { precision: 12, scale: 2 }).default('0.00').notNull(),
  biggestWin: decimal('biggest_win', { precision: 10, scale: 2 }).default('0.00').notNull(),
  currentStreak: integer('current_streak').default(0).notNull(),
  longestStreak: integer('longest_streak').default(0).notNull(),
  lastBetAt: timestamp('last_bet_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('user_statistics_user_id_idx').on(table.userId),
}));

// Game History table
export const gameHistory = pgTable('game_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  gameId: uuid('game_id').references(() => games.id).notNull(),
  roundId: uuid('round_id').references(() => gameRounds.id).notNull(),
  betId: uuid('bet_id').references(() => bets.id).notNull(),
  roundNumber: integer('round_number').notNull(),
  betSide: varchar('bet_side', { length: 10 }).notNull(),
  betAmount: decimal('bet_amount', { precision: 10, scale: 2 }).notNull(),
  result: varchar('result', { length: 10 }).notNull(),
  payoutAmount: decimal('payout_amount', { precision: 10, scale: 2 }).default('0.00').notNull(),
  jokerCard: varchar('joker_card', { length: 10 }),
  winningCard: varchar('winning_card', { length: 10 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('game_history_user_id_idx').on(table.userId),
  createdAtIdx: index('game_history_created_at_idx').on(table.createdAt),
}));

// System Settings table
export const systemSettings = pgTable('system_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: varchar('key', { length: 100 }).unique().notNull(),
  value: text('value').notNull(),
  description: text('description'),
  updatedBy: uuid('updated_by').references(() => users.id),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Notifications table
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  metadata: text('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('notifications_user_id_idx').on(table.userId),
}));

// Relations
export const partnersRelations = relations(partners, ({ one, many }) => ({
  user: one(users, {
    fields: [partners.userId],
    references: [users.id],
  }),
  gameEarnings: many(partnerGameEarnings),
  commissions: many(partnerCommissions),
}));

export const partnerGameEarningsRelations = relations(partnerGameEarnings, ({ one }) => ({
  partner: one(partners, {
    fields: [partnerGameEarnings.partnerId],
    references: [partners.id],
  }),
  game: one(games, {
    fields: [partnerGameEarnings.gameId],
    references: [games.id],
  }),
  round: one(gameRounds, {
    fields: [partnerGameEarnings.roundId],
    references: [gameRounds.id],
  }),
}));