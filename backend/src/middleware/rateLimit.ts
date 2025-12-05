import rateLimit from 'express-rate-limit';
import { redisService } from '../services/redis.service';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased to 1000 requests per 15 minutes (admin dashboard needs many requests)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Use Redis store if available
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
});

// Auth rate limiter (stricter)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Betting rate limiter
export const betLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Max 30 bets per minute
  message: 'Too many bet requests, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Transaction rate limiter
export const transactionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Max 10 transactions per hour
  message: 'Too many transaction requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin rate limiter (more permissive)
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // 2000 requests per 15 minutes for admins (dashboard heavy)
  message: 'Too many admin requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Custom rate limiter using Redis
export const createRedisRateLimiter = (
  windowMs: number,
  max: number,
  keyPrefix: string = 'ratelimit'
) => {
  return async (req: any, res: any, next: any) => {
    try {
      const identifier = req.ip || req.connection.remoteAddress;
      const key = `${keyPrefix}:${identifier}`;

      const current = await redisService.incrementRateLimit(key, windowMs);

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - current));
      res.setHeader('X-RateLimit-Reset', Date.now() + windowMs);

      if (current > max) {
        return res.status(429).json({
          error: 'Too many requests',
          retryAfter: Math.ceil(windowMs / 1000),
        });
      }

      next();
    } catch (error) {
      // If Redis fails, allow the request (fail open)
      console.error('Rate limiter error:', error);
      next();
    }
  };
};

// Per-user rate limiter
export const createUserRateLimiter = (
  windowMs: number,
  max: number,
  action: string
) => {
  return async (req: any, res: any, next: any) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return next(); // Skip if no user authenticated
      }

      const key = `ratelimit:user:${userId}:${action}`;
      const current = await redisService.incrementRateLimit(key, windowMs);

      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - current));

      if (current > max) {
        return res.status(429).json({
          error: `Too many ${action} requests`,
          retryAfter: Math.ceil(windowMs / 1000),
        });
      }

      next();
    } catch (error) {
      console.error('User rate limiter error:', error);
      next();
    }
  };
};

// Specific limiters for different actions
export const withdrawalLimiter = createUserRateLimiter(
  24 * 60 * 60 * 1000, // 24 hours
  5, // Max 5 withdrawals per day
  'withdrawal'
);

export const depositLimiter = createUserRateLimiter(
  60 * 60 * 1000, // 1 hour
  10, // Max 10 deposits per hour
  'deposit'
);

export const gameLimiter = createUserRateLimiter(
  60 * 1000, // 1 minute
  60, // Max 60 game actions per minute
  'game'
);