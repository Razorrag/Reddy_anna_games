import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeSocket, disconnectSocket, getSocket, onEvent, offEvent } from '../lib/socket';
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';
import { useUserStore } from '../store/userStore';
import { usePartnerStore } from '../store/partnerStore';
import type { WSEvent } from '../types';

interface WebSocketContextValue {
  isConnected: boolean;
  reconnectAttempts: number;
}

const WebSocketContext = createContext<WebSocketContextValue | undefined>(undefined);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const { token, user } = useAuthStore();
  const {
    setCurrentRound,
    setJokerCard,
    addAndarCard,
    addBaharCard,
    showWinner,
    setTimeRemaining,
    setRoundPhase,
    setStreamLive,
  } = useGameStore();
  const { updateBalance, addTransaction } = useUserStore();
  const { addCommission } = usePartnerStore();

  useEffect(() => {
    // Only connect if user is authenticated
    if (!token || !user) {
      disconnectSocket();
      return;
    }

    // Initialize socket connection
    const socket = initializeSocket(token);

    // Check connection status
    setIsConnected(socket.connected);

    // Connection event handlers
    const handleConnect = () => {
      setIsConnected(true);
      setReconnectAttempts(0);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleConnectError = () => {
      setReconnectAttempts((prev) => prev + 1);
    };

    onEvent('connect', handleConnect);
    onEvent('disconnect', handleDisconnect);
    onEvent('connect_error', handleConnectError);

    // Game event handlers
    const handleRoundUpdate = (data: WSEvent) => {
      if (data.type === 'round_update') {
        setCurrentRound(data.round);
        
        // Update phase based on round status
        if (data.round.status === 'betting') {
          setRoundPhase('betting');
          setStreamLive(true);
        } else if (data.round.status === 'dealing') {
          setRoundPhase('dealing');
        } else if (data.round.status === 'complete') {
          setRoundPhase('complete');
        }
      }
    };

    const handleJokerCard = (data: { card: { value: string; suit: string } }) => {
      setJokerCard(data.card);
    };

    const handleAndarCard = (data: { card: { value: string; suit: string } }) => {
      addAndarCard(data.card);
    };

    const handleBaharCard = (data: { card: { value: string; suit: string } }) => {
      addBaharCard(data.card);
    };

    const handleWinnerAnnounce = (data: WSEvent) => {
      if (data.type === 'winner_announce') {
        showWinner(data.winningSide, data.totalPayout);
        setTimeout(() => {
          setStreamLive(false);
        }, 5000);
      }
    };

    const handleTimerUpdate = (data: { timeRemaining: number }) => {
      setTimeRemaining(data.timeRemaining);
    };

    onEvent('round_update', handleRoundUpdate);
    onEvent('joker_card', handleJokerCard);
    onEvent('andar_card', handleAndarCard);
    onEvent('bahar_card', handleBaharCard);
    onEvent('winner_announce', handleWinnerAnnounce);
    onEvent('timer_update', handleTimerUpdate);

    // Balance and transaction updates
    const handleBalanceUpdate = (data: WSEvent) => {
      if (data.type === 'balance_update' && data.userId === user.id) {
        updateBalance(data.mainBalance + data.bonusBalance);
      }
    };

    const handleTransactionCreated = (data: { transaction: any }) => {
      if (data.transaction.userId === user.id) {
        addTransaction(data.transaction);
      }
    };

    onEvent('balance_update', handleBalanceUpdate);
    onEvent('transaction_created', handleTransactionCreated);

    // Partner commission updates
    const handleCommissionEarned = (data: { commission: any }) => {
      if (user.role === 'partner') {
        addCommission(data.commission);
      }
    };

    onEvent('commission_earned', handleCommissionEarned);

    // Cleanup
    return () => {
      offEvent('connect', handleConnect);
      offEvent('disconnect', handleDisconnect);
      offEvent('connect_error', handleConnectError);
      offEvent('round_update', handleRoundUpdate);
      offEvent('joker_card', handleJokerCard);
      offEvent('andar_card', handleAndarCard);
      offEvent('bahar_card', handleBaharCard);
      offEvent('winner_announce', handleWinnerAnnounce);
      offEvent('timer_update', handleTimerUpdate);
      offEvent('balance_update', handleBalanceUpdate);
      offEvent('transaction_created', handleTransactionCreated);
      offEvent('commission_earned', handleCommissionEarned);
      disconnectSocket();
    };
  }, [
    token,
    user,
    setCurrentRound,
    setJokerCard,
    addAndarCard,
    addBaharCard,
    showWinner,
    setTimeRemaining,
    setRoundPhase,
    setStreamLive,
    updateBalance,
    addTransaction,
    addCommission,
  ]);

  const value: WebSocketContextValue = {
    isConnected,
    reconnectAttempts,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};