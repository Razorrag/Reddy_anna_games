import { io, Socket } from 'socket.io-client';
import { useGameStore } from '@/store/gameStore';
import { useAuthStore } from '@/store/authStore';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;

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

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
      useGameStore.getState().setConnectionStatus(true);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      useGameStore.getState().setConnectionStatus(false);
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        useGameStore.getState().setConnectionStatus(false);
      }
    });

    // Game events - Updated to match backend event names
    this.socket.on('game:round_started', (data) => {
      console.log('🎮 Round started:', data);
      useGameStore.getState().setCurrentRound(data.round);
      useGameStore.getState().setBetting(true);
      useGameStore.getState().clearBets();
      useGameStore.getState().clearDealtCards();
    });

    this.socket.on('game:betting_closed', (data) => {
      console.log('⏰ Betting closed:', data);
      useGameStore.getState().setBetting(false);
    });

    this.socket.on('game:card_dealt', (data) => {
      console.log('🎴 Card dealt:', data);
      useGameStore.getState().addDealtCard({
        card: data.card,
        side: data.side,
      });
    });

    this.socket.on('game:winner_determined', (data) => {
      console.log('🏁 Winner determined:', data);
      useGameStore.getState().setCurrentRound(data.round);
      useGameStore.getState().setBetting(false);
      
      // Show winner celebration if user won
      const myBets = useGameStore.getState().myBets;
      const winningSide = data.winningSide;
      const hasWinningBet = myBets.some(bet => bet.side === winningSide);
      
      if (hasWinningBet) {
        console.log('🎉 You won!');
      }
    });

    this.socket.on('game:payouts_processed', (data) => {
      console.log('💰 Payouts processed:', data);
    });

    this.socket.on('bet:placed', (data) => {
      console.log('💰 Bet placed:', data);
      const userId = useAuthStore.getState().user?.id;
      
      if (data.bet.userId === userId) {
        // Update user's own bets
        useGameStore.getState().addMyBet(data.bet);
      }
    });

    this.socket.on('user:balance_updated', (data) => {
      console.log('💵 Balance updated:', data);
      const userId = useAuthStore.getState().user?.id;
      
      if (data.userId === userId) {
        useAuthStore.getState().updateBalance(data.mainBalance, data.bonusBalance);
      }
    });

    // Error events
    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting WebSocket...');
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

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();