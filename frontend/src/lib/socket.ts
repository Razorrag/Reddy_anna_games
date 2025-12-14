import { Socket } from 'socket.io-client';
import { websocketService } from './websocket';

/**
 * Socket wrapper - delegates to websocketService for unified socket management
 * This maintains backward compatibility with authStore
 */

/**
 * Initialize WebSocket connection
 */
export function initializeSocket(token: string): Socket | null {
  websocketService.connect(token);
  return websocketService.getSocket();
}

/**
 * Get current socket instance
 */
export function getSocket(): Socket | null {
  return websocketService.getSocket();
}

/**
 * Disconnect socket
 */
export function disconnectSocket(): void {
  websocketService.disconnect();
}

/**
 * Emit event with error handling
 */
export function emitEvent(event: string, data: any): void {
  websocketService.emit(event, data);
}

/**
 * Subscribe to event
 */
export function onEvent(event: string, callback: (...args: any[]) => void): void {
  const socket = websocketService.getSocket();
  socket?.on(event, callback);
}

/**
 * Unsubscribe from event
 */
export function offEvent(event: string, callback?: (...args: any[]) => void): void {
  const socket = websocketService.getSocket();
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
  return websocketService.isConnected();
}

/**
 * Place bet via WebSocket (legacy flow)
 */
export function placeBetViaSocket(gameId: string, side: 'andar' | 'bahar', amount: number, round: number): string {
  return websocketService.placeBet(gameId, side, amount, round);
}

/**
 * Undo last bet via WebSocket
 */
export function undoLastBetViaSocket(gameId: string, round: number): void {
  websocketService.undoLastBet(gameId, round);
}