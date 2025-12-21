import { createContext, useContext, useEffect, ReactNode, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useGameStore } from '@/store/gameStore';
import { websocketService } from '@/lib/websocket';

interface WebSocketContextValue {
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  emit: (event: string, data?: any) => void;
}

const WebSocketContext = createContext<WebSocketContextValue>({
  isConnected: false,
  isConnecting: false,
  error: null,
  emit: () => {},
});

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider = ({ children }: WebSocketProviderProps) => {
  const { token, isAuthenticated } = useAuthStore();
  const isConnected = useGameStore((state) => state.isConnected);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (isAuthenticated && token) {
      // Connect to WebSocket
      setIsConnecting(true);
      setError(null);
      
      try {
        websocketService.connect(token);
        setIsConnecting(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('WebSocket connection failed'));
        setIsConnecting(false);
      }

      // Cleanup on unmount
      return () => {
        websocketService.disconnect();
      };
    }
  }, [isAuthenticated, token]);

  const emit = (event: string, data?: any) => {
    try {
      websocketService.emit(event, data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('WebSocket emit failed'));
    }
  };

  const value: WebSocketContextValue = {
    isConnected,
    isConnecting,
    error,
    emit,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};