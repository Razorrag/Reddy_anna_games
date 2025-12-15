import { Server as SocketIOServer, Socket } from 'socket.io';
import { gameService } from '../services/game.service';
import { betService } from '../services/bet.service';
import { userService } from '../services/user.service';
import { logger } from '../utils/logger';
import jwt from 'jsonwebtoken';
import { GAME_EVENTS } from '../shared/events.types';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

// Authenticate socket connection
export function authenticateSocket(socket: AuthenticatedSocket, next: (err?: Error) => void) {
  const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    socket.userId = decoded.userId;
    socket.userRole = decoded.role;
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
}

// Initialize complete game flow with WebSocket
export function initializeGameFlow(io: SocketIOServer) {
  // Apply authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`Client connected: ${socket.id}, User: ${socket.userId}`);

    // Join user's personal room for balance updates
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // ========================================
    // PLAYER EVENTS
    // ========================================

    // Join game room
    socket.on(GAME_EVENTS.JOIN, async (gameId: string) => {
      try {
        const game = await gameService.getActiveGame(gameId);
        const currentRound = await gameService.getCurrentRound(gameId);

        socket.join(`game:${gameId}`);
        logger.info(`User ${socket.userId} joined game: ${gameId}`);

        // Send current game state
        socket.emit(GAME_EVENTS.JOINED, {
          game,
          currentRound,
          timestamp: new Date(),
        });

        // Notify room about new player
        io.to(`game:${gameId}`).emit(GAME_EVENTS.PLAYER_JOINED, {
          playerId: socket.userId,
          playerCount: io.sockets.adapter.rooms.get(`game:${gameId}`)?.size || 0,
        });
      } catch (error: any) {
        logger.error('Error joining game:', error);
        socket.emit(GAME_EVENTS.ERROR, { message: error.message });
      }
    });

    // Leave game room
    socket.on(GAME_EVENTS.LEAVE, (gameId: string) => {
      socket.leave(`game:${gameId}`);
      logger.info(`User ${socket.userId} left game: ${gameId}`);

      // Notify room
      io.to(`game:${gameId}`).emit(GAME_EVENTS.PLAYER_LEFT, {
        playerId: socket.userId,
        playerCount: io.sockets.adapter.rooms.get(`game:${gameId}`)?.size || 0,
      });
    });

    // Place bet
    socket.on(GAME_EVENTS.BET_PLACE, async (data: { roundId: string; betSide: 'andar' | 'bahar'; amount: number; tempId?: string }) => {
      try {
        if (!socket.userId) {
          throw new Error('User not authenticated');
        }

        const { roundId, betSide, amount, tempId } = data;

        // Place bet through service (service will emit all events)
        await betService.placeBet(socket.userId, roundId, betSide, amount, tempId);

        logger.info(`Bet placed: User ${socket.userId}, Round ${roundId}, ${betSide}, ₹${amount}`);
      } catch (error: any) {
        logger.error('Error placing bet:', error);
        socket.emit(GAME_EVENTS.BET_ERROR, { message: error.message, tempId: data.tempId });
      }
    });

    // Cancel bet
    socket.on(GAME_EVENTS.BET_CANCEL, async (betId: string) => {
      try {
        if (!socket.userId) {
          throw new Error('User not authenticated');
        }

        const bet = await betService.cancelBet(betId, socket.userId);

        socket.emit(GAME_EVENTS.BET_CANCELLED, {
          bet,
          message: 'Bet cancelled successfully',
        });

        // Update balance
        const balance = await userService.getBalance(socket.userId);
        socket.emit(GAME_EVENTS.BALANCE_UPDATED, balance);

        logger.info(`Bet cancelled: ${betId} by user ${socket.userId}`);
      } catch (error: any) {
        logger.error('Error cancelling bet:', error);
        socket.emit(GAME_EVENTS.BET_ERROR, { message: error.message });
      }
    });

    // Get round bets (for display)
    socket.on(GAME_EVENTS.ROUND_GET_BETS, async (roundId: string) => {
      try {
        if (!socket.userId) {
          throw new Error('User not authenticated');
        }

        const userBets = await betService.getUserBets(socket.userId, 10, 0);
        const roundBets = userBets.filter((bet: any) => bet.roundId === roundId);

        socket.emit(GAME_EVENTS.ROUND_BETS, { roundId, bets: roundBets });
      } catch (error: any) {
        logger.error('Error getting round bets:', error);
        socket.emit(GAME_EVENTS.ERROR, { message: error.message });
      }
    });

    // ========================================
    // ADMIN EVENTS
    // ========================================

    // Create new round
    socket.on(GAME_EVENTS.ADMIN_CREATE_ROUND, async (gameId: string) => {
      try {
        if (socket.userRole !== 'admin') {
          throw new Error('Unauthorized: Admin access required');
        }

        // Service will emit ROUND_CREATED event
        const round = await gameService.createNewRound(gameId);

        logger.info(`Admin ${socket.userId} created new round: ${round.id}`);
      } catch (error: any) {
        logger.error('Error creating round:', error);
        socket.emit(GAME_EVENTS.ADMIN_ERROR, { message: error.message });
      }
    });

    // Start round (open betting)
    socket.on(GAME_EVENTS.ADMIN_START_ROUND, async (roundId: string) => {
      try {
        if (socket.userRole !== 'admin') {
          throw new Error('Unauthorized: Admin access required');
        }

        // Service will emit ROUND_STARTED event and start timer
        const round = await gameService.startRound(roundId);

        logger.info(`Admin ${socket.userId} started round: ${roundId}`);
      } catch (error: any) {
        logger.error('Error starting round:', error);
        socket.emit(GAME_EVENTS.ADMIN_ERROR, { message: error.message });
      }
    });

    // Close betting
    socket.on(GAME_EVENTS.ADMIN_CLOSE_BETTING, async (roundId: string) => {
      try {
        if (socket.userRole !== 'admin') {
          throw new Error('Unauthorized: Admin access required');
        }

        // Service will emit BETTING_CLOSED event
        const round = await gameService.closeBetting(roundId);

        logger.info(`Admin ${socket.userId} closed betting for round: ${roundId}`);
      } catch (error: any) {
        logger.error('Error closing betting:', error);
        socket.emit(GAME_EVENTS.ADMIN_ERROR, { message: error.message });
      }
    });

    // Deal cards and determine winner
    socket.on(GAME_EVENTS.ADMIN_DEAL_CARDS, async (roundId: string) => {
      try {
        if (socket.userRole !== 'admin') {
          throw new Error('Unauthorized: Admin access required');
        }

        // Service will emit DEALING_STARTED, CARD_DEALT (multiple), WINNER_DETERMINED, and ROUND_2_ANNOUNCEMENT (if needed)
        const round = await gameService.dealCardsAndDetermineWinner(roundId);

        logger.info(`Admin ${socket.userId} dealt cards for round: ${roundId}, Winner: ${round.winningSide}`);
      } catch (error: any) {
        logger.error('Error dealing cards:', error);
        socket.emit(GAME_EVENTS.ADMIN_ERROR, { message: error.message });
      }
    });

    // Process payouts
    socket.on(GAME_EVENTS.ADMIN_PROCESS_PAYOUTS, async (roundId: string) => {
      try {
        if (socket.userRole !== 'admin') {
          throw new Error('Unauthorized: Admin access required');
        }

        // Service will emit PAYOUTS_PROCESSED and BALANCE_UPDATED events
        await betService.processRoundPayouts(roundId);

        // Update game statistics
        const roundBets = await betService.getRoundBets(roundId);
        if (roundBets.length > 0) {
          await gameService.updateGameStatistics(roundBets[0].gameId, roundId);
        }

        logger.info(`Admin ${socket.userId} processed payouts for round: ${roundId}`);
      } catch (error: any) {
        logger.error('Error processing payouts:', error);
        socket.emit(GAME_EVENTS.ADMIN_ERROR, { message: error.message });
      }
    });

    // Get live statistics
    socket.on(GAME_EVENTS.ADMIN_GET_STATS, async (gameId: string) => {
      try {
        if (socket.userRole !== 'admin') {
          throw new Error('Unauthorized: Admin access required');
        }

        const currentRound = await gameService.getCurrentRound(gameId);

        socket.emit(GAME_EVENTS.ADMIN_STATS, {
          currentRound,
        });
      } catch (error: any) {
        logger.error('Error getting stats:', error);
        socket.emit(GAME_EVENTS.ADMIN_ERROR, { message: error.message });
      }
    });

    // ========================================
    // DISCONNECT
    // ========================================

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}, User: ${socket.userId}`);
    });
  });

  logger.info('✓ Complete game flow WebSocket initialized');
}

// Helper functions to broadcast events from services
export function broadcastRoundCreated(io: SocketIOServer, gameId: string, round: any) {
  io.to(`game:${gameId}`).emit(GAME_EVENTS.ROUND_CREATED, { round });
}

export function broadcastRoundStarted(io: SocketIOServer, gameId: string, round: any) {
  io.to(`game:${gameId}`).emit(GAME_EVENTS.ROUND_STARTED, { round });
}

export function broadcastBettingClosed(io: SocketIOServer, gameId: string, round: any) {
  io.to(`game:${gameId}`).emit(GAME_EVENTS.BETTING_CLOSED, { round });
}

export function broadcastWinnerDetermined(io: SocketIOServer, gameId: string, round: any) {
  io.to(`game:${gameId}`).emit(GAME_EVENTS.WINNER_DETERMINED, {
    round,
    winningSide: round.winningSide,
  });
}

export function broadcastPayoutsProcessed(io: SocketIOServer, gameId: string, roundId: string) {
  io.to(`game:${gameId}`).emit(GAME_EVENTS.PAYOUTS_PROCESSED, { roundId });
}

export function notifyBalanceUpdate(io: SocketIOServer, userId: string, balance: any) {
  io.to(`user:${userId}`).emit(GAME_EVENTS.BALANCE_UPDATED, balance);
}