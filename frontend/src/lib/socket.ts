import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

let socket: Socket | null = null;

/**
 * Initialize WebSocket connection
 */
export function initializeSocket(token: string): Socket {
  if (socket && socket.connected) {
    return socket;
  }

  socket = io(WS_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  // Connection events
  socket.on('connect', () => {
    console.log('✅ WebSocket connected');
    toast.success('Connected to game server');
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ WebSocket disconnected:', reason);
    if (reason === 'io server disconnect') {
      // Server disconnected, try to reconnect
      socket?.connect();
    }
    toast.error('Disconnected from game server');
  });

  socket.on('connect_error', (error) => {
    console.error('WebSocket connection error:', error);
    toast.error('Failed to connect to game server');
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log(`✅ WebSocket reconnected after ${attemptNumber} attempts`);
    toast.success('Reconnected to game server');
  });

  socket.on('reconnect_failed', () => {
    console.error('❌ WebSocket reconnection failed');
    toast.error('Failed to reconnect. Please refresh the page.');
  });

  return socket;
}

/**
 * Get current socket instance
 */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * Disconnect socket
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Emit event with error handling
 */
export function emitEvent(event: string, data: any): void {
  if (!socket || !socket.connected) {
    toast.error('Not connected to game server');
    return;
  }
  socket.emit(event, data);
}

/**
 * Subscribe to event
 */
export function onEvent(event: string, callback: (...args: any[]) => void): void {
  socket?.on(event, callback);
}

/**
 * Unsubscribe from event
 */
export function offEvent(event: string, callback?: (...args: any[]) => void): void {
  if (callback) {
    socket?.off(event, callback);
  } else {
    socket?.off(event);
  }
}

/**
 * Check if socket is connected
 */
export function isSocketConnected(): boolean {
  return socket?.connected ?? false;
}