import express, { Express, Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { testConnection } from './db';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { initializeGameFlow } from './websocket/game-flow';
import { redisService } from './services/redis.service';
import { apiLimiter } from './middleware/rateLimit';

// Import services that need WebSocket access
import { betService } from './services/bet.service';
import { gameService } from './services/game.service';
import { paymentService } from './services/payment.service';
import { partnerService } from './services/partner.service';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import gameRoutes from './routes/game.routes';
import betRoutes from './routes/bet.routes';
import transactionRoutes from './routes/transaction.routes';
import partnerRoutes from './routes/partner.routes';
import bonusRoutes from './routes/bonus.routes';
import paymentRoutes from './routes/payment.routes';
import adminRoutes from './routes/admin.routes';
import analyticsRoutes from './routes/analytics.routes';
import notificationRoutes from './routes/notification.routes';
import streamRoutes from './routes/stream.routes';

dotenv.config();

const app: Express = express();

// CRITICAL: Trust proxy MUST be set before rate limiter middleware
// This allows Express to correctly identify client IPs behind nginx
app.set('trust proxy', true);

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Attach Socket.IO instance to Express app for route access
app.set('io', io);

const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(compression() as any);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all API routes
app.use('/api', apiLimiter as any);

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/bets', betRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/bonuses', bonusRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stream', streamRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

// Inject Socket.IO instance into services for real-time broadcasts
betService.setIo(io);
gameService.setIo(io);
paymentService.setIo(io);
partnerService.setIo(io);
logger.info('✅ Socket.IO instance injected into services');

// Initialize WebSocket with complete game flow
initializeGameFlow(io);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }

    // Initialize Redis
    try {
      await redisService.connect();
      logger.info('✅ Redis connected successfully');
    } catch (redisError) {
      logger.warn('⚠️  Redis connection failed, continuing without Redis:', redisError);
      // Continue without Redis - app can work with degraded functionality
    }

    // Start HTTP server
    httpServer.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📊 Health check: http://localhost:${PORT}/health`);
      logger.info(`🎮 WebSocket ready on port ${PORT}`);
      logger.info(`📡 API endpoints: /api/*`);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await redisService.disconnect();
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  await redisService.disconnect();
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

startServer();

export { app, io };