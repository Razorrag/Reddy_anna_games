/**
 * Shared Event Types and Constants
 * Used by both backend and frontend for WebSocket communication
 */

// Game Event Constants
export const GAME_EVENTS = {
  // Connection Events
  JOIN: 'game:join',
  JOINED: 'game:joined',
  LEAVE: 'game:leave',
  PLAYER_JOINED: 'game:player_joined',
  PLAYER_LEFT: 'game:player_left',
  
  // Round Lifecycle Events
  ROUND_CREATED: 'round:created',
  ROUND_STARTED: 'round:started',
  BETTING_CLOSED: 'round:betting_closed',
  DEALING_STARTED: 'round:dealing_started',
  WINNER_DETERMINED: 'round:winner_determined',
  ROUND_2_ANNOUNCEMENT: 'round:round_2_announcement',
  
  // Betting Events
  BET_PLACE: 'bet:place',
  BET_PLACED: 'bet:placed',
  BET_CANCEL: 'bet:cancel',
  BET_CANCELLED: 'bet:cancelled',
  BET_ERROR: 'bet:error',
  BET_UNDO: 'bet:undo',
  BET_UNDONE: 'bet:undone',
  REBET: 'bet:rebet',
  REBET_PLACED: 'bet:rebet_placed',
  REBET_SUCCESS: 'bet:rebet_success',
  DOUBLE_BETS: 'bet:double',
  DOUBLE_BETS_SUCCESS: 'bet:double_success',
  
  // Card Events
  CARD_DEALT: 'card:dealt',
  
  // Timer Events
  TIMER_UPDATE: 'timer:update',
  
  // Balance & Payout Events
  BALANCE_UPDATED: 'balance:updated',
  PAYOUTS_PROCESSED: 'round:payouts_processed',
  PAYOUT_RECEIVED: 'payout:received',
  
  // Statistics Events
  STATS_UPDATED: 'round:stats_updated',
  ROUND_GET_BETS: 'round:get_bets',
  ROUND_BETS: 'round:bets',
  
  // Admin Events
  ADMIN_CREATE_ROUND: 'admin:create_round',
  ADMIN_START_ROUND: 'admin:start_round',
  ADMIN_CLOSE_BETTING: 'admin:close_betting',
  ADMIN_DEAL_CARDS: 'admin:deal_cards',
  ADMIN_DECLARE_WINNER: 'admin:declare_winner',
  ADMIN_PROCESS_PAYOUTS: 'admin:process_payouts',
  ADMIN_GET_STATS: 'admin:get_stats',
  ADMIN_STATS: 'admin:stats',
  ADMIN_ERROR: 'admin:error',
  
  // Error Events
  ERROR: 'error',
} as const;

// Type for event names
export type GameEvent = typeof GAME_EVENTS[keyof typeof GAME_EVENTS];

// Event Payload Types
export interface BetPlacedPayload {
  betId: string;
  tempId?: string;
  bet: {
    id: string;
    userId: string;
    roundId: string;
    amount: number;
    side: 'andar' | 'bahar';
    betRound: number;
    status: string;
    createdAt: Date;
  };
  balance: {
    mainBalance: number;
    bonusBalance: number;
  };
}

export interface RoundCreatedPayload {
  round: {
    id: string;
    gameId: string;
    roundNumber: number;
    jokerCard: string;
    status: string;
    createdAt: Date;
  };
  jokerCard: string;
}

export interface RoundStartedPayload {
  round: {
    id: string;
    gameId: string;
    roundNumber: number;
    jokerCard: string;
    status: string;
    bettingStartTime: Date;
  };
  bettingDuration: number;
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

export interface TimerUpdatePayload {
  roundId: string;
  remaining: number;
}

export interface BalanceUpdatedPayload {
  userId: string;
  mainBalance: number;
  bonusBalance: number;
  change?: number;
  reason?: string;
}

export interface StatsUpdatedPayload {
  roundId: string;
  totalAndarBets: string;
  totalBaharBets: string;
  totalBetAmount: string;
}

export interface PayoutReceivedPayload {
  roundId: string;
  amount: number;
  winningSide: string;
}

export interface BetErrorPayload {
  message: string;
  tempId?: string;
  code?: string;
}

export interface ErrorPayload {
  message: string;
  code?: string;
}