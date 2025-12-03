import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useGameStore } from '@/store/gameStore';
import { websocketService } from '@/lib/websocket';

interface WebSocketContextValue {
  isConnected: boolean;
  emit: (event: string, data?: any) => void;
}

const WebSocketContext = createContext<WebSocketContextValue>({
  isConnected: false,
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

  useEffect(() => {
    if (isAuthenticated && token) {
      // Connect to WebSocket
      websocketService.connect(token);

      // Cleanup on unmount
      return () => {
        websocketService.disconnect();
      };
    }
  }, [isAuthenticated, token]);

  const emit = (event: string, data?: any) => {
    websocketService.emit(event, data);
  };

  const value: WebSocketContextValue = {
    isConnected,
    emit,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};