import { io, Socket } from 'socket.io-client';
import { useGameStore } from '@/store/gameStore';
import { useAuthStore } from '@/store/authStore';

/**
 * WebSocket Service - Complete Legacy Game Flow Integration
 * 
 * This implements the exact game lifecycle documented from the legacy system:
 * 1. Game Start → Opening card confirmed → Betting phase
 * 2. Timer countdown → Betting locked
 * 3. Card dealing (alternating Andar/Bahar)
 * 4. Winner determination → Payout processing
 * 5. Round 2 or Game reset
 */
class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private timerInterval: NodeJS.Timeout | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    const wsUrl = (import.meta as any).env?.VITE_WS_URL || 'http://localhost:3001';

    this.socket = io(wsUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;
    const store = useGameStore.getState;
    const authStore = useAuthStore.getState;

    // ==========================================
    // CONNECTION EVENTS
    // ==========================================
    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
      store().setConnectionStatus(true);
      
      // Request current game state on connect
      this.emit('game:get_state');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      store().setConnectionStatus(false);
      this.clearTimerInterval();
      
      if (reason === 'io server disconnect') {
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        store().setConnectionStatus(false);
      }
    });

    // ==========================================
    // PHASE 1: GAME INITIALIZATION
    // Admin starts game with opening card
    // ==========================================
    
    // NEW: Round created event
    this.socket.on('game:round_created', (data: {
      round: any;
      jokerCard: string;
    }) => {
      console.log('🎴 Round created:', data);
      store().setGameId(data.round.gameId);
      store().setOpeningCard(data.jokerCard);
      store().setRoundNumber(data.round.roundNumber);
    });

    // NEW: Round started with betting phase
    this.socket.on('game:round_started', (data: {
      round: any;
      bettingDuration: number;
    }) => {
      console.log('🎮 Round started:', data);
      store().setGameId(data.round.gameId);
      store().setOpeningCard(data.round.jokerCard);
      store().setRoundNumber(data.round.roundNumber);
      store().setTimerDuration(data.bettingDuration);
      store().setTimeRemaining(data.bettingDuration);
      store().setRoundPhase('betting');
      store().setBetting(true);
      store().clearBets();
      store().clearDealtCards();
      
      // Start local timer sync (server sends timer:update every second)
      this.startTimer(data.bettingDuration);
    });

    // ==========================================
    // PHASE 2: BETTING PHASE (30 seconds)
    // ==========================================

    // NEW: Server-side timer update (every second)
    this.socket.on('timer:update', (data: {
      roundId: string;
      remaining: number;
    }) => {
      store().setTimeRemaining(data.remaining);
      
      if (data.remaining <= 0) {
        store().setBetting(false);
        store().setBettingLocked(true);
        store().setRoundPhase('dealing');
        this.clearTimerInterval();
      }
    });

    // NEW: Bet placed confirmation
    this.socket.on('bet:placed', (data: {
      bet: any;
    }) => {
      console.log('💰 Bet placed:', data);
      const userId = authStore().user?.id;
      
      if (data.bet.userId === userId) {
        store().updateRoundBets(
          data.bet.roundNumber || 1,
          data.bet.betSide,
          parseFloat(data.bet.amount),
          data.bet.id
        );
      }
    });

    // NEW: Bet undone
    this.socket.on('bet:undone', (data: {
      roundId: string;
      refundedAmount: number;
    }) => {
      console.log('↩️ Bet undone:', data);
      store().undoBet();
    });

    // NEW: Rebet placed
    this.socket.on('bet:rebet_placed', (data: {
      roundId: string;
      betsPlaced: number;
      totalAmount: number;
    }) => {
      console.log('🔄 Rebet placed:', data);
    });

    // NEW: Round stats updated (ADMIN ONLY - privacy protected)
    // This event broadcasts global betting totals from all players
    // Only admin users should subscribe to this for strategic monitoring
    // Players should NOT see other players' bet totals (privacy violation)
    this.socket.on('round:stats_updated', (data: {
      roundId: string;
      totalAndarBets: string;
      totalBaharBets: string;
      totalBetAmount: string;
    }) => {
      // Only process this event if user is admin
      const user = authStore().user;
      if (user?.role === 'admin') {
        console.log('📊 [ADMIN] Round stats updated:', data);
        // Admin components can listen to this event for bet monitoring
        // Dispatch custom event for AdminBetsPage to consume
        window.dispatchEvent(new CustomEvent('admin:round_stats', { detail: data }));
      } else {
        // Players should not see global betting totals (privacy protection)
        console.log('🔒 Round stats event ignored (player privacy protection)');
      }
    });

    // Betting closed (timer expired)
    this.socket.on('game:betting_closed', (data: { round: number }) => {
      console.log('⏰ Betting closed:', data);
      store().setBetting(false);
      store().setBettingLocked(true);
      store().setRoundPhase('dealing');
      this.clearTimerInterval();
    });

    // ==========================================
    // PHASE 3: CARD DEALING
    // ==========================================

    // NEW: Dealing started
    this.socket.on('game:dealing_started', (data: {
      roundId: string;
      jokerCard: string;
    }) => {
      console.log('🎴 Dealing started:', data);
      store().setRoundPhase('dealing');
    });

    // NEW: Card dealt event with streaming
    this.socket.on('game:card_dealt', (data: {
      roundId: string;
      side: 'andar' | 'bahar';
      card: string;
      cardNumber: number;
      isWinningCard: boolean;
    }) => {
      console.log('🎴 Card dealt:', data);
      
      // Parse card string to Card object
      const cardObj = this.parseCard(data.card);
      store().addDealtCard({ side: data.side, card: cardObj });
      
      if (data.isWinningCard) {
        store().setWinningCard(data.card);
      }
    });

    // ==========================================
    // PHASE 4: WINNER DETERMINATION & PAYOUTS
    // ==========================================

    // NEW: Winner determined
    this.socket.on('game:winner_determined', (data: {
      roundId: string;
      round: any;
      winningSide: 'andar' | 'bahar';
      winningCard: string;
      totalCards: number;
    }) => {
      console.log('🏁 Winner determined:', data);
      
      const myBets = store().myBets;
      const hasWinningBet = myBets.some(bet => bet.side === data.winningSide);
      const totalBetAmount = myBets.reduce((sum, bet) => sum + (bet.amount || 0), 0);
      
      store().setWinningCard(data.winningCard);
      store().showWinner({
        side: data.winningSide,
        winningCard: data.winningCard,
        userWon: hasWinningBet,
        winAmount: hasWinningBet ? totalBetAmount * 2 : 0,
        netProfit: hasWinningBet ? totalBetAmount : -totalBetAmount,
        totalBetAmount,
      });
      
      store().saveLastRoundBets();
    });

    // NEW: Payouts processed (broadcast to room)
    this.socket.on('game:payouts_processed', (data: {
      roundId: string;
      totalPayouts: number;
      winnersCount: number;
    }) => {
      console.log('💰 Payouts processed:', data);
    });

    // NEW: Individual payout received
    this.socket.on('user:payout_received', (data: {
      roundId: string;
      amount: number;
      winningSide: string;
    }) => {
      console.log('💰 Payout received:', data);
    });

    // ==========================================
    // PHASE 5: ROUND 2 ANNOUNCEMENT & START
    // ==========================================

    // NEW: Round 2 announcement (after Bahar wins Round 1)
    this.socket.on('game:round_2_announcement', (data: {
      message: string;
      nextRoundIn: number;
    }) => {
      console.log('🔄 Round 2 announcement:', data);
      // Show announcement to user that Round 2 will start soon
    });

    // ==========================================
    // PHASE 7: GAME RESET
    // ==========================================

    this.socket.on('game_reset', (data: { message: string }) => {
      console.log('🔄 Game reset:', data);
      store().resetGame();
      this.clearTimerInterval();
    });

    // ==========================================
    // BALANCE & PAYMENT UPDATES
    // ==========================================

    // NEW: Balance updated (unified event from all sources)
    this.socket.on('user:balance_updated', (data: {
      balance: string;
      change: number;
      reason: string;
    }) => {
      console.log('💵 Balance updated:', data);
      const currentBonus = authStore().user?.bonusBalance || 0;
      authStore().updateBalance(parseFloat(data.balance), currentBonus);
    });

    // NEW: Payment events
    this.socket.on('payment:deposit_approved', (data: {
      depositId: string;
      amount: number;
      newBalance: string;
    }) => {
      console.log('💰 Deposit approved:', data);
    });

    this.socket.on('payment:deposit_rejected', (data: {
      depositId: string;
      reason: string;
      amount: string;
    }) => {
      console.log('❌ Deposit rejected:', data);
    });

    this.socket.on('payment:withdrawal_requested', (data: {
      withdrawalId: string;
      amount: number;
      newBalance: string;
    }) => {
      console.log('💸 Withdrawal requested:', data);
    });

    this.socket.on('payment:withdrawal_approved', (data: {
      withdrawalId: string;
      amount: string;
      transactionId?: string;
    }) => {
      console.log('✅ Withdrawal approved:', data);
    });

    this.socket.on('payment:withdrawal_rejected', (data: {
      withdrawalId: string;
      reason: string;
      refundedAmount: number;
      newBalance: string;
    }) => {
      console.log('❌ Withdrawal rejected (refunded):', data);
    });

    // NEW: Bonus events
    this.socket.on('bonus:received', (data: {
      bonusType: string;
      bonusAmount: number;
      wageringRequired: number;
    }) => {
      console.log('🎁 Bonus received:', data);
    });

    this.socket.on('bonus:referral_earned', (data: {
      referredUsername: string;
      bonusAmount: number;
      newBalance: string;
    }) => {
      console.log('👥 Referral bonus earned:', data);
    });

    // ==========================================
    // STREAM EVENTS
    // ==========================================

    this.socket.on('stream:status', (data: { isLive: boolean }) => {
      store().setStreamLive(data.isLive);
    });

    // ==========================================
    // ERROR HANDLING
    // ==========================================

    this.socket.on('error', (error: { message: string; code?: string }) => {
      console.error('❌ WebSocket error:', error);
    });

    this.socket.on('bet:error', (error: { message: string }) => {
      console.error('❌ Bet error:', error);
    });
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  private parseCard(cardString: string): any {
    // Parse "A♠" format to Card object
    const suits: Record<string, string> = { '♠': 'spades', '♥': 'hearts', '♦': 'diamonds', '♣': 'clubs' };
    const suitChar = cardString.slice(-1);
    const rank = cardString.slice(0, -1);
    
    return {
      rank,
      suit: suits[suitChar] || 'spades',
      display: cardString,
    };
  }

  private startTimer(seconds: number) {
    this.clearTimerInterval();
    
    useGameStore.getState().setTimeRemaining(seconds);
    
    this.timerInterval = setInterval(() => {
      const currentTime = useGameStore.getState().timeRemaining;
      
      if (currentTime <= 0) {
        this.clearTimerInterval();
        useGameStore.getState().setBetting(false);
        useGameStore.getState().setBettingLocked(true);
        return;
      }
      
      useGameStore.getState().decrementTimer();
    }, 1000);
  }

  private clearTimerInterval() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // ==========================================
  // PUBLIC METHODS
  // ==========================================

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting WebSocket...');
      this.clearTimerInterval();
      this.socket.disconnect();
      this.socket = null;
      useGameStore.getState().setConnectionStatus(false);
    }
  }

  emit(event: string, data?: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Cannot emit event, socket not connected:', event);
    }
  }

  // Place bet via WebSocket (legacy flow)
  placeBet(gameId: string, side: 'andar' | 'bahar', amount: number, round: number) {
    const betId = `temp-${Date.now()}`;
    
    this.emit('place_bet', {
      gameId,
      side,
      amount,
      round,
      betId,
    });
    
    return betId;
  }

  // Undo last bet
  undoLastBet(gameId: string, round: number) {
    this.emit('undo_bet', { gameId, round });
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();