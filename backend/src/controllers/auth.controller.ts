import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
  // Register new user
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, email, password, phoneNumber, fullName, referralCode } = req.body;

      const result = await authService.register({
        username,
        email,
        password,
        phoneNumber,
        fullName,
        referralCode,
      });

      res.status(201).json({
        message: 'Registration successful',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Login user
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;

      const result = await authService.login({ username, password });

      res.json({
        message: 'Login successful',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get current user
  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const user = await authService.verifyToken(token);

      res.json({ user });
    } catch (error) {
      next(error);
    }
  }

  // Refresh token
  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const result = await authService.refreshToken(token);

      res.json({
        message: 'Token refreshed',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Logout (client-side token removal, but we can log it)
  async logout(req: AuthRequest, res: Response) {
    // In a JWT system, logout is typically handled client-side
    // by removing the token. We just acknowledge the request.
    res.json({ message: 'Logout successful' });
  }
}

export const authController = new AuthController();