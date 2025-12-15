/**
 * SINGLE SOURCE OF TRUTH FOR ALL WEBSOCKET EVENTS
 * 
 * This file defines all WebSocket event names used across the application.
 * Import this in both frontend and backend to ensure consistency.
 * 
 * Convention: 'category:action' format
 * Example: 'game:started', 'bet:placed'
 */

export const GAME_EVENTS = {
  // ============================================
  // CONNECTION EVENTS
  // ============================================
  JOIN: 'game:join',
  JOINED: 'game:joined',
  LEAVE: 'game:leave',
  PLAYER_JOINED: 'game:player_joined',
  PLAYER_LEFT: 'game:player_left',
  ERROR: 'game:error',

  // ============================================
  // GAME LIFECYCLE EVENTS
  // ============================================
  ROUND_CREATED: 'game:round_created',
  ROUND_STARTED: 'game:round_started',
  BETTING_CLOSED: 'game:betting_closed',
  DEALING_STARTED: 'game:dealing_started',
  CARD_DEALT: 'game:card_dealt',
  WINNER_DETERMINED: 'game:winner_determined',
  PAYOUTS_PROCESSED: 'game:payouts_processed',
  ROUND_2_ANNOUNCEMENT: 'game:round_2_announcement',

  // ============================================
  // BETTING EVENTS
  // ============================================
  BET_PLACE: 'bet:place',
  BET_PLACED: 'bet:placed',
  BET_CANCEL: 'bet:cancel',
  BET_CANCELLED: 'bet:cancelled',
  BET_ERROR: 'bet:error',
  BET_UNDONE: 'bet:undone',
  REBET_PLACED: 'bet:rebet_placed',

  // ============================================
  // REAL-TIME UPDATES
  // ============================================
  STATS_UPDATED: 'round:stats_updated',
  BALANCE_UPDATED: 'user:balance_updated',
  PAYOUT_RECEIVED: 'user:payout_received',
  TIMER_UPDATE: 'timer:update',

  // ============================================
  // ADMIN EVENTS
  // ============================================
  ADMIN_CREATE_ROUND: 'admin:create_round',
  ADMIN_START_ROUND: 'admin:start_round',
  ADMIN_CLOSE_BETTING: 'admin:close_betting',
  ADMIN_DEAL_CARDS: 'admin:deal_cards',
  ADMIN_PROCESS_PAYOUTS: 'admin:process_payouts',
  ADMIN_GET_STATS: 'admin:get_stats',
  ADMIN_STATS: 'admin:stats',
  ADMIN_ERROR: 'admin:error',

  // ============================================
  // ROUND QUERIES
  // ============================================
  ROUND_GET_BETS: 'round:get_bets',
  ROUND_BETS: 'round:bets',
} as const;

// Type for event names
export type GameEventName = typeof GAME_EVENTS[keyof typeof GAME_EVENTS];

// ============================================
// EVENT PAYLOAD TYPES
// ============================================

export interface BetPlacePayload {
  roundId: string;
  betSide: 'andar' | 'bahar';
  amount: number;
  tempId?: string; // For optimistic updates
}

export interface BetPlacedPayload {
  betId: string;
  tempId?: string;
  bet: any;
  balance: {
    mainBalance: number;
    bonusBalance: number;
  };
}

export interface StatsUpdatedPayload {
  roundId: string;
  round1Totals?: {
    andar: number;
    bahar: number;
  };
  round2Totals?: {
    andar: number;
    bahar: number;
  };
  totalAndarBets?: number;
  totalBaharBets?: number;
  totalBetAmount?: number;
}

export interface TimerUpdatePayload {
  roundId: string;
  remaining: number;
}

export interface BalanceUpdatePayload {
  userId: string;
  mainBalance: number;
  bonusBalance: number;
  change?: number;
  reason?: string;
}

export interface GameJoinedPayload {
  game: any;
  currentRound: any;
  timestamp: Date;
}

export interface CardDealtPayload {
  roundId: string;
  side: 'andar' | 'bahar';
  card: string;
  cardNumber: number;
  isWinningCard: boolean;
}

export interface WinnerDeterminedPayload {
  roundId: string;
  round: any;
  winningSide: 'andar' | 'bahar';
  winningCard: string;
  winnerDisplay: string;
  totalCards: number;
}