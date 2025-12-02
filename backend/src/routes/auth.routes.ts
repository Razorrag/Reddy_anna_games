import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { authController } from '../controllers/auth.controller';

const router = Router();

// POST /api/auth/register - Register new user
router.post('/register', asyncHandler(authController.register.bind(authController)));

// POST /api/auth/login - Login user
router.post('/login', asyncHandler(authController.login.bind(authController)));

// POST /api/auth/logout - Logout user
router.post('/logout', authenticate, asyncHandler(authController.logout.bind(authController)));

// GET /api/auth/me - Get current user
router.get('/me', authenticate, asyncHandler(authController.me.bind(authController)));

// POST /api/auth/refresh - Refresh token
router.post('/refresh', asyncHandler(authController.refresh.bind(authController)));

export default router;