import { Server as SocketIOServer } from 'socket.io';
import { logger } from '../utils/logger';

export function initializeWebSocket(io: SocketIOServer) {
  logger.info('Initializing WebSocket server...');

  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Join game room
    socket.on('join:game', (gameId: string) => {
      socket.join(`game:${gameId}`);
      logger.info(`Client ${socket.id} joined game: ${gameId}`);
      socket.emit('joined:game', { gameId });
    });

    // Leave game room
    socket.on('leave:game', (gameId: string) => {
      socket.leave(`game:${gameId}`);
      logger.info(`Client ${socket.id} left game: ${gameId}`);
    });

    // Place bet (placeholder)
    socket.on('bet:place', async (data) => {
      logger.info(`Bet placed by ${socket.id}:`, data);
      // TODO: Implement bet placing logic
      socket.emit('bet:error', { message: 'Bet placing not yet implemented' });
    });

    // Disconnect
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  logger.info('✓ WebSocket server initialized');
}

// Game event emitters (to be called from game services)
export function broadcastGameEvent(io: SocketIOServer, gameId: string, event: string, data: any) {
  io.to(`game:${gameId}`).emit(event, data);
}

export function broadcastRoundStart(io: SocketIOServer, gameId: string, roundData: any) {
  broadcastGameEvent(io, gameId, 'game:round_started', roundData);
}

export function broadcastBettingOpen(io: SocketIOServer, gameId: string) {
  broadcastGameEvent(io, gameId, 'game:betting_open', { timestamp: new Date() });
}

export function broadcastBettingClosed(io: SocketIOServer, gameId: string) {
  broadcastGameEvent(io, gameId, 'game:betting_closed', { timestamp: new Date() });
}

export function broadcastCardDrawn(io: SocketIOServer, gameId: string, cardData: any) {
  broadcastGameEvent(io, gameId, 'game:card_drawn', cardData);
}

export function broadcastRoundEnd(io: SocketIOServer, gameId: string, resultData: any) {
  broadcastGameEvent(io, gameId, 'game:round_ended', resultData);
}

export function notifyBalanceUpdate(io: SocketIOServer, userId: string, balanceData: any) {
  io.to(`user:${userId}`).emit('user:balance_updated', balanceData);
}