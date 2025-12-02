import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';

// Generic validation middleware
export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
};

// Auth validation schemas
export const authSchemas = {
  register: z.object({
    body: z.object({
      phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
      name: z.string().min(2, 'Name must be at least 2 characters'),
      email: z.string().email('Invalid email').optional(),
      referralCode: z.string().optional(),
    }),
  }),

  login: z.object({
    body: z.object({
      phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
      password: z.string().min(1, 'Password is required'),
    }),
  }),

  verifyOTP: z.object({
    body: z.object({
      phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
      otp: z.string().length(6, 'OTP must be 6 digits'),
    }),
  }),

  resetPassword: z.object({
    body: z.object({
      phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
      otp: z.string().length(6, 'OTP must be 6 digits'),
      newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    }),
  }),
};

// Transaction validation schemas
export const transactionSchemas = {
  deposit: z.object({
    body: z.object({
      amount: z.number().positive('Amount must be positive').min(100, 'Minimum deposit is ₹100'),
      method: z.enum(['upi', 'bank_transfer', 'card']),
      utrNumber: z.string().optional(),
    }),
  }),

  withdrawal: z.object({
    body: z.object({
      amount: z.number().positive('Amount must be positive').min(500, 'Minimum withdrawal is ₹500'),
      method: z.enum(['upi', 'bank_transfer']),
      upiId: z.string().optional(),
      bankAccount: z.object({
        accountNumber: z.string(),
        ifscCode: z.string(),
        accountHolderName: z.string(),
      }).optional(),
    }),
  }),

  transactionHistory: z.object({
    query: z.object({
      page: z.string().transform(Number).pipe(z.number().positive()).optional(),
      limit: z.string().transform(Number).pipe(z.number().positive().max(100)).optional(),
      type: z.enum(['deposit', 'withdrawal', 'bet', 'win', 'bonus', 'commission', 'refund']).optional(),
      status: z.enum(['pending', 'completed', 'failed', 'cancelled']).optional(),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
    }),
  }),
};

// Game validation schemas
export const gameSchemas = {
  placeBet: z.object({
    body: z.object({
      gameId: z.string().uuid('Invalid game ID'),
      roundId: z.string().uuid('Invalid round ID'),
      betType: z.enum(['andar', 'bahar']),
      amount: z.number().positive('Amount must be positive').min(10, 'Minimum bet is ₹10'),
    }),
  }),

  joinRoom: z.object({
    body: z.object({
      gameId: z.string().uuid('Invalid game ID'),
    }),
  }),

  leaveRoom: z.object({
    body: z.object({
      gameId: z.string().uuid('Invalid game ID'),
    }),
  }),
};

// Admin validation schemas
export const adminSchemas = {
  createUser: z.object({
    body: z.object({
      phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
      name: z.string().min(2, 'Name must be at least 2 characters'),
      email: z.string().email('Invalid email').optional(),
      role: z.enum(['player', 'partner', 'admin']),
      password: z.string().min(8, 'Password must be at least 8 characters'),
    }),
  }),

  updateUser: z.object({
    params: z.object({
      userId: z.string().uuid('Invalid user ID'),
    }),
    body: z.object({
      name: z.string().min(2).optional(),
      email: z.string().email().optional(),
      status: z.enum(['active', 'suspended', 'banned']).optional(),
      role: z.enum(['player', 'partner', 'admin']).optional(),
    }),
  }),

  approveTransaction: z.object({
    params: z.object({
      transactionId: z.string().uuid('Invalid transaction ID'),
    }),
    body: z.object({
      status: z.enum(['completed', 'failed']),
      adminNotes: z.string().optional(),
    }),
  }),

  createGame: z.object({
    body: z.object({
      name: z.string().min(2, 'Game name must be at least 2 characters'),
      type: z.string(),
      minBet: z.number().positive('Min bet must be positive'),
      maxBet: z.number().positive('Max bet must be positive'),
      streamUrl: z.string().url('Invalid stream URL'),
      description: z.string().optional(),
    }),
  }),

  updateGameSettings: z.object({
    params: z.object({
      gameId: z.string().uuid('Invalid game ID'),
    }),
    body: z.object({
      minBet: z.number().positive().optional(),
      maxBet: z.number().positive().optional(),
      isActive: z.boolean().optional(),
      streamUrl: z.string().url().optional(),
      settings: z.record(z.any()).optional(),
    }),
  }),
};

// Partner validation schemas
export const partnerSchemas = {
  createPartner: z.object({
    body: z.object({
      phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
      name: z.string().min(2, 'Name must be at least 2 characters'),
      email: z.string().email('Invalid email').optional(),
      password: z.string().min(8, 'Password must be at least 8 characters'),
      commissionRate: z.number().min(0).max(100, 'Commission rate must be between 0 and 100'),
    }),
  }),

  updateCommissionRate: z.object({
    params: z.object({
      partnerId: z.string().uuid('Invalid partner ID'),
    }),
    body: z.object({
      commissionRate: z.number().min(0).max(100, 'Commission rate must be between 0 and 100'),
    }),
  }),

  getCommissions: z.object({
    query: z.object({
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
      status: z.enum(['pending', 'paid']).optional(),
    }),
  }),
};

// Analytics validation schemas
export const analyticsSchemas = {
  getAnalytics: z.object({
    query: z.object({
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
      gameId: z.string().uuid().optional(),
      groupBy: z.enum(['day', 'week', 'month']).optional(),
    }),
  }),

  getUserAnalytics: z.object({
    params: z.object({
      userId: z.string().uuid('Invalid user ID'),
    }),
    query: z.object({
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
    }),
  }),
};

// Notification validation schemas
export const notificationSchemas = {
  sendNotification: z.object({
    body: z.object({
      userId: z.string().uuid('Invalid user ID').optional(),
      type: z.enum([
        'welcome',
        'deposit_received',
        'withdrawal_approved',
        'win',
        'bonus_credited',
        'referral_earned',
        'account_status',
        'promotion',
        'game_update',
        'commission_earned',
      ]),
      title: z.string().min(1, 'Title is required'),
      message: z.string().min(1, 'Message is required'),
      data: z.record(z.any()).optional(),
    }),
  }),

  broadcastNotification: z.object({
    body: z.object({
      type: z.enum([
        'promotion',
        'game_update',
        'maintenance',
        'announcement',
      ]),
      title: z.string().min(1, 'Title is required'),
      message: z.string().min(1, 'Message is required'),
      targetRole: z.enum(['player', 'partner', 'admin', 'all']).optional(),
      data: z.record(z.any()).optional(),
    }),
  }),
};

// Referral validation schemas
export const referralSchemas = {
  applyReferralCode: z.object({
    body: z.object({
      referralCode: z.string().min(6, 'Invalid referral code'),
    }),
  }),
};

// Profile validation schemas
export const profileSchemas = {
  updateProfile: z.object({
    body: z.object({
      name: z.string().min(2).optional(),
      email: z.string().email().optional(),
      avatar: z.string().url().optional(),
    }),
  }),

  changePassword: z.object({
    body: z.object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: z.string().min(8, 'New password must be at least 8 characters'),
      confirmPassword: z.string().min(1, 'Password confirmation is required'),
    }).refine((data) => data.newPassword === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),
  }),

  updateBankDetails: z.object({
    body: z.object({
      accountNumber: z.string().min(9, 'Invalid account number'),
      ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code'),
      accountHolderName: z.string().min(2, 'Account holder name is required'),
      bankName: z.string().min(2, 'Bank name is required'),
    }),
  }),

  updateUpiDetails: z.object({
    body: z.object({
      upiId: z.string().regex(/^[\w.-]+@[\w.-]+$/, 'Invalid UPI ID'),
    }),
  }),
};

// Export validation middleware with schemas
export const validateAuth = (schema: keyof typeof authSchemas) => validate(authSchemas[schema]);
export const validateTransaction = (schema: keyof typeof transactionSchemas) => validate(transactionSchemas[schema]);
export const validateGame = (schema: keyof typeof gameSchemas) => validate(gameSchemas[schema]);
export const validateAdmin = (schema: keyof typeof adminSchemas) => validate(adminSchemas[schema]);
export const validatePartner = (schema: keyof typeof partnerSchemas) => validate(partnerSchemas[schema]);
export const validateAnalytics = (schema: keyof typeof analyticsSchemas) => validate(analyticsSchemas[schema]);
export const validateNotification = (schema: keyof typeof notificationSchemas) => validate(notificationSchemas[schema]);
export const validateReferral = (schema: keyof typeof referralSchemas) => validate(referralSchemas[schema]);
export const validateProfile = (schema: keyof typeof profileSchemas) => validate(profileSchemas[schema]);