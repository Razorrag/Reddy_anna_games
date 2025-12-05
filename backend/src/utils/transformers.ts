/**
 * Data Transformers
 * Convert between database field names (snake_case) and API responses (camelCase)
 */

/**
 * Transform database user to API response format
 */
export const transformUser = (dbUser: any) => {
  if (!dbUser) return null;
  
  return {
    id: dbUser.id,
    phone: dbUser.phone_number || dbUser.phoneNumber || dbUser.phone,
    username: dbUser.username,
    name: dbUser.full_name || dbUser.fullName || dbUser.name,
    email: dbUser.email,
    role: dbUser.role,
    mainBalance: parseFloat(dbUser.balance || '0'),
    bonusBalance: parseFloat(dbUser.bonus_balance || dbUser.bonusBalance || '0'),
    referralCode: dbUser.referral_code || dbUser.referralCode,
    referredBy: dbUser.referred_by || dbUser.referredBy,
    isActive: dbUser.status === 'active',
    status: dbUser.status,
    profileImage: dbUser.profile_image || dbUser.profileImage,
    lastLoginAt: dbUser.last_login_at || dbUser.lastLoginAt,
    createdAt: dbUser.created_at || dbUser.createdAt,
    updatedAt: dbUser.updated_at || dbUser.updatedAt,
  };
};

/**
 * Transform database game to API response format
 */
export const transformGame = (dbGame: any) => {
  if (!dbGame) return null;
  
  return {
    id: dbGame.id,
    name: dbGame.name,
    type: dbGame.type,
    status: dbGame.status,
    streamUrl: dbGame.stream_url || dbGame.streamUrl,
    thumbnailUrl: dbGame.thumbnail_url || dbGame.thumbnailUrl,
    minBet: parseFloat(dbGame.min_bet || dbGame.minBet || '10'),
    maxBet: parseFloat(dbGame.max_bet || dbGame.maxBet || '100000'),
    description: dbGame.description,
    rules: dbGame.rules,
    createdAt: dbGame.created_at || dbGame.createdAt,
    updatedAt: dbGame.updated_at || dbGame.updatedAt,
  };
};

/**
 * Transform database game round to API response format
 */
export const transformGameRound = (dbRound: any) => {
  if (!dbRound) return null;
  
  return {
    id: dbRound.id,
    gameId: dbRound.game_id || dbRound.gameId,
    roundNumber: dbRound.round_number || dbRound.roundNumber,
    status: dbRound.status,
    jokerCard: dbRound.joker_card || dbRound.jokerCard,
    winningSide: dbRound.winning_side || dbRound.winningSide,
    winningCard: dbRound.winning_card || dbRound.winningCard,
    totalAndarBets: parseFloat(dbRound.total_andar_bets || dbRound.totalAndarBets || '0'),
    totalBaharBets: parseFloat(dbRound.total_bahar_bets || dbRound.totalBaharBets || '0'),
    totalBetAmount: parseFloat(dbRound.total_bet_amount || dbRound.totalBetAmount || '0'),
    totalPayoutAmount: parseFloat(dbRound.total_payout_amount || dbRound.totalPayoutAmount || '0'),
    bettingStartTime: dbRound.betting_start_time || dbRound.bettingStartTime,
    bettingEndTime: dbRound.betting_end_time || dbRound.bettingEndTime,
    startTime: dbRound.start_time || dbRound.startTime,
    endTime: dbRound.end_time || dbRound.endTime,
    createdAt: dbRound.created_at || dbRound.createdAt,
  };
};

/**
 * Transform database bet to API response format
 */
export const transformBet = (dbBet: any) => {
  if (!dbBet) return null;
  
  return {
    id: dbBet.id,
    userId: dbBet.user_id || dbBet.userId,
    roundId: dbBet.round_id || dbBet.roundId,
    gameId: dbBet.game_id || dbBet.gameId,
    betSide: dbBet.bet_side || dbBet.betSide,
    amount: parseFloat(dbBet.amount || '0'),
    potentialWin: dbBet.potential_win ? parseFloat(dbBet.potential_win) : null,
    status: dbBet.status,
    payoutAmount: parseFloat(dbBet.payout_amount || dbBet.payoutAmount || '0'),
    isBonus: dbBet.is_bonus || dbBet.isBonus || false,
    createdAt: dbBet.created_at || dbBet.createdAt,
  };
};

/**
 * Transform database transaction to API response format
 */
export const transformTransaction = (dbTx: any) => {
  if (!dbTx) return null;
  
  return {
    id: dbTx.id,
    userId: dbTx.user_id || dbTx.userId,
    type: dbTx.type,
    amount: parseFloat(dbTx.amount || '0'),
    balanceBefore: dbTx.balance_before ? parseFloat(dbTx.balance_before) : null,
    balanceAfter: dbTx.balance_after ? parseFloat(dbTx.balance_after) : null,
    status: dbTx.status,
    referenceId: dbTx.reference_id || dbTx.referenceId,
    referenceType: dbTx.reference_type || dbTx.referenceType,
    description: dbTx.description,
    metadata: dbTx.metadata,
    createdAt: dbTx.created_at || dbTx.createdAt,
  };
};

/**
 * Transform database partner to API response format
 */
export const transformPartner = (dbPartner: any) => {
  if (!dbPartner) return null;
  
  return {
    id: dbPartner.id,
    userId: dbPartner.user_id || dbPartner.userId,
    partnerCode: dbPartner.partner_code || dbPartner.partnerCode,
    sharePercentage: parseFloat(dbPartner.share_percentage || dbPartner.sharePercentage || '50'),
    commissionRate: parseFloat(dbPartner.commission_rate || dbPartner.commissionRate || '10'),
    totalPlayers: dbPartner.total_players || dbPartner.totalPlayers || 0,
    totalCommission: parseFloat(dbPartner.total_commission || dbPartner.totalCommission || '0'),
    pendingCommission: parseFloat(dbPartner.pending_commission || dbPartner.pendingCommission || '0'),
    status: dbPartner.status,
    createdAt: dbPartner.created_at || dbPartner.createdAt,
    updatedAt: dbPartner.updated_at || dbPartner.updatedAt,
  };
};

/**
 * Transform database bonus to API response format
 */
export const transformBonus = (dbBonus: any) => {
  if (!dbBonus) return null;
  
  return {
    id: dbBonus.id,
    userId: dbBonus.user_id || dbBonus.userId,
    bonusType: dbBonus.bonus_type || dbBonus.bonusType,
    amount: parseFloat(dbBonus.amount || '0'),
    wageringRequirement: parseFloat(dbBonus.wagering_requirement || dbBonus.wageringRequirement || '0'),
    wageringProgress: parseFloat(dbBonus.wagering_progress || dbBonus.wageringProgress || '0'),
    status: dbBonus.status,
    expiresAt: dbBonus.expires_at || dbBonus.expiresAt,
    completedAt: dbBonus.completed_at || dbBonus.completedAt,
    createdAt: dbBonus.created_at || dbBonus.createdAt,
  };
};

/**
 * Transform database deposit to API response format
 */
export const transformDeposit = (dbDeposit: any) => {
  if (!dbDeposit) return null;
  
  return {
    id: dbDeposit.id,
    userId: dbDeposit.user_id || dbDeposit.userId,
    amount: parseFloat(dbDeposit.amount || '0'),
    paymentMethod: dbDeposit.payment_method || dbDeposit.paymentMethod,
    transactionId: dbDeposit.transaction_id || dbDeposit.transactionId,
    screenshotUrl: dbDeposit.screenshot_url || dbDeposit.screenshotUrl,
    status: dbDeposit.status,
    approvedBy: dbDeposit.approved_by || dbDeposit.approvedBy,
    approvedAt: dbDeposit.approved_at || dbDeposit.approvedAt,
    rejectionReason: dbDeposit.rejection_reason || dbDeposit.rejectionReason,
    createdAt: dbDeposit.created_at || dbDeposit.createdAt,
  };
};

/**
 * Transform database withdrawal to API response format
 */
export const transformWithdrawal = (dbWithdrawal: any) => {
  if (!dbWithdrawal) return null;
  
  return {
    id: dbWithdrawal.id,
    userId: dbWithdrawal.user_id || dbWithdrawal.userId,
    amount: parseFloat(dbWithdrawal.amount || '0'),
    withdrawalMethod: dbWithdrawal.withdrawal_method || dbWithdrawal.withdrawalMethod,
    bankName: dbWithdrawal.bank_name || dbWithdrawal.bankName,
    accountNumber: dbWithdrawal.account_number || dbWithdrawal.accountNumber,
    ifscCode: dbWithdrawal.ifsc_code || dbWithdrawal.ifscCode,
    upiId: dbWithdrawal.upi_id || dbWithdrawal.upiId,
    status: dbWithdrawal.status,
    processedBy: dbWithdrawal.processed_by || dbWithdrawal.processedBy,
    processedAt: dbWithdrawal.processed_at || dbWithdrawal.processedAt,
    transactionId: dbWithdrawal.transaction_id || dbWithdrawal.transactionId,
    rejectionReason: dbWithdrawal.rejection_reason || dbWithdrawal.rejectionReason,
    createdAt: dbWithdrawal.created_at || dbWithdrawal.createdAt,
  };
};

/**
 * Transform database user statistics to API response format
 */
export const transformUserStatistics = (dbStats: any) => {
  if (!dbStats) return null;
  
  return {
    userId: dbStats.user_id || dbStats.userId,
    totalBets: dbStats.total_bets || dbStats.totalBets || 0,
    totalWins: dbStats.total_wins || dbStats.totalWins || 0,
    totalLosses: dbStats.total_losses || dbStats.totalLosses || 0,
    totalBetAmount: parseFloat(dbStats.total_bet_amount || dbStats.totalBetAmount || '0'),
    totalWinAmount: parseFloat(dbStats.total_win_amount || dbStats.totalWinAmount || '0'),
    biggestWin: parseFloat(dbStats.biggest_win || dbStats.biggestWin || '0'),
    currentStreak: dbStats.current_streak || dbStats.currentStreak || 0,
    longestStreak: dbStats.longest_streak || dbStats.longestStreak || 0,
    lastBetAt: dbStats.last_bet_at || dbStats.lastBetAt,
    winRate: dbStats.totalBets > 0 ? (dbStats.totalWins / dbStats.totalBets) * 100 : 0,
  };
};

/**
 * Transform database notification to API response format
 */
export const transformNotification = (dbNotif: any) => {
  if (!dbNotif) return null;
  
  return {
    id: dbNotif.id,
    userId: dbNotif.user_id || dbNotif.userId,
    title: dbNotif.title,
    message: dbNotif.message,
    type: dbNotif.type,
    isRead: dbNotif.is_read || dbNotif.isRead || false,
    metadata: dbNotif.metadata,
    createdAt: dbNotif.created_at || dbNotif.createdAt,
  };
};

/**
 * Transform array of items
 */
export const transformArray = <T>(items: any[], transformer: (item: any) => T | null): T[] => {
  if (!Array.isArray(items)) return [];
  return items.map(transformer).filter((item): item is T => item !== null);
};

/**
 * Transform paginated response
 */
export const transformPaginatedResponse = <T>(
  items: any[],
  transformer: (item: any) => T | null,
  pagination?: { page: number; limit: number; total: number }
) => {
  const transformedItems = transformArray(items, transformer);
  
  if (!pagination) {
    return {
      items: transformedItems,
      total: transformedItems.length,
    };
  }
  
  return {
    items: transformedItems,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
  };
};