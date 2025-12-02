import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { AppError } from './errorHandler';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'player' | 'admin' | 'partner';
  status: 'active' | 'suspended' | 'banned';
  balance: string;
  bonusBalance: string;
}

export interface AuthRequest extends Request {
  user?: User;
  userId?: string;
  userRole?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    if (!process.env.JWT_SECRET) {
      throw new AppError('JWT_SECRET not configured', 500);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      id: string;
      role: string;
    };

    // Fetch user from database
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        status: users.status,
        balance: users.balance,
        bonusBalance: users.bonusBalance,
      })
      .from(users)
      .where(eq(users.id, decoded.id))
      .limit(1);

    if (!user) {
      throw new AppError('User not found', 401);
    }

    if (user.status === 'banned') {
      throw new AppError('Account has been banned', 403);
    }

    if (user.status === 'suspended') {
      throw new AppError('Account is suspended', 403);
    }

    // Attach user to request
    req.user = user as User;
    req.userId = user.id;
    req.userRole = user.role;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Invalid token', 401));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError('Token expired', 401));
    }
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError('Authentication failed', 401));
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.userRole) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(req.userRole)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};

// Optional auth - doesn't fail if no token
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return next();
    }

    if (!process.env.JWT_SECRET) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      id: string;
      role: string;
    };

    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        status: users.status,
        balance: users.balance,
        bonusBalance: users.bonusBalance,
      })
      .from(users)
      .where(eq(users.id, decoded.id))
      .limit(1);

    if (user && user.status === 'active') {
      req.user = user as User;
      req.userId = user.id;
      req.userRole = user.role;
    }

    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
};