import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { authController } from '../controllers/auth.controller';

const router = Router();

// POST /api/auth/register - Register new user (username/email format)
router.post('/register', asyncHandler(authController.register.bind(authController)));

// POST /api/auth/signup - Signup with phone (frontend format)
router.post('/signup', asyncHandler(authController.signup.bind(authController)));

// POST /api/auth/login - Login user (supports both username and phone)
router.post('/login', asyncHandler(authController.login.bind(authController)));

// POST /api/auth/logout - Logout user
router.post('/logout', authenticate, asyncHandler(authController.logout.bind(authController)));

// GET /api/auth/me - Get current user
router.get('/me', authenticate, asyncHandler(authController.me.bind(authController)));

// POST /api/auth/refresh - Refresh token
router.post('/refresh', asyncHandler(authController.refresh.bind(authController)));

export default router;