import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { db } from '../db';
import { users, referrals, userBonuses } from '../db/schema';
import { eq } from 'drizzle-orm';
import { AppError } from '../middleware/errorHandler';

interface RegisterData {
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
  fullName?: string;
  referralCode?: string;
}

interface LoginData {
  username: string;
  password: string;
}

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
  private readonly SALT_ROUNDS = 12;

  // Generate unique referral code
  private async generateReferralCode(): Promise<string> {
    let code: string;
    let exists = true;

    while (exists) {
      code = nanoid(8).toUpperCase();
      const [user] = await db.select().from(users).where(eq(users.referralCode, code)).limit(1);
      exists = !!user;
    }

    return code!;
  }

  // Generate JWT token
  private generateToken(userId: string, role: string): string {
    return jwt.sign(
      { userId, role },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN } as jwt.SignOptions
    );
  }

  // Find user by referral code
  private async findUserByReferralCode(code: string) {
    const [user] = await db.select().from(users).where(eq(users.referralCode, code)).limit(1);
    return user || null;
  }

  // Create signup bonus
  private async createSignupBonus(userId: string) {
    const bonusAmount = parseFloat(process.env.SIGNUP_BONUS_AMOUNT || '100');
    const wageringMultiplier = parseFloat(process.env.WAGERING_MULTIPLIER || '30');

    await db.insert(userBonuses).values({
      userId,
      bonusType: 'signup',
      amount: bonusAmount.toFixed(2),
      wageringRequirement: (bonusAmount * wageringMultiplier).toFixed(2),
      wageringProgress: '0.00',
      status: 'active',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    // Update user bonus balance
    await db.update(users)
      .set({ bonusBalance: bonusAmount.toFixed(2) })
      .where(eq(users.id, userId));
  }

  // Create referral bonus
  private async createReferralBonus(referrerId: string, referredId: string, referralCode: string) {
    const bonusAmount = parseFloat(process.env.REFERRAL_BONUS_AMOUNT || '50');

    // Create referral record
    await db.insert(referrals).values({
      referrerId,
      referredId,
      referralCode,
      bonusEarned: '0.00', // Will be updated after first deposit
      status: 'pending',
    });

    // Give referral bonus to referrer
    await db.insert(userBonuses).values({
      userId: referrerId,
      bonusType: 'referral',
      amount: bonusAmount.toFixed(2),
      wageringRequirement: (bonusAmount * 30).toFixed(2),
      wageringProgress: '0.00',
      status: 'active',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    // Update referrer's bonus balance
    const [referrer] = await db.select().from(users).where(eq(users.id, referrerId)).limit(1);
    if (!referrer) {
      throw new AppError('Referrer not found', 404);
    }
    const newBonusBalance = (parseFloat(referrer.bonusBalance) + bonusAmount).toFixed(2);
    
    await db.update(users)
      .set({ bonusBalance: newBonusBalance })
      .where(eq(users.id, referrerId));
  }

  // Register new user
  async register(data: RegisterData) {
    // Validate input
    if (!data.username || data.username.length < 3) {
      throw new AppError('Username must be at least 3 characters', 400);
    }

    if (!data.email || !data.email.includes('@')) {
      throw new AppError('Valid email is required', 400);
    }

    if (!data.password || data.password.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400);
    }

    // Check if username exists
    const [existingUser] = await db.select()
      .from(users)
      .where(eq(users.username, data.username))
      .limit(1);

    if (existingUser) {
      throw new AppError('Username already exists', 409);
    }

    // Check if email exists
    const [existingEmail] = await db.select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existingEmail) {
      throw new AppError('Email already exists', 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    // Generate referral code
    const referralCode = await this.generateReferralCode();

    // Find referrer if referral code provided
    let referrerId: string | null = null;
    if (data.referralCode) {
      const referrer = await this.findUserByReferralCode(data.referralCode);
      if (referrer) {
        referrerId = referrer.id;
      }
    }

    // Create user
    const [user] = await db.insert(users).values({
      username: data.username,
      email: data.email,
      passwordHash,
      phoneNumber: data.phoneNumber || null,
      fullName: data.fullName || null,
      referralCode,
      referredBy: referrerId,
      role: 'player',
      status: 'active',
      balance: '0.00',
      bonusBalance: '0.00',
    }).returning();

    if (!user) {
      throw new AppError('Failed to create user', 500);
    }

    // Create signup bonus
    await this.createSignupBonus(user.id);

    // Create referral bonus if referred
    if (referrerId) {
      await this.createReferralBonus(referrerId, user.id, data.referralCode!);
    }

    // Generate token
    const token = this.generateToken(user.id, user.role);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        role: user.role,
        referralCode: user.referralCode,
        balance: user.balance,
        bonusBalance: user.bonusBalance,
      },
      token,
    };
  }

  // Login user
  async login(data: LoginData) {
    if (!data.username || !data.password) {
      throw new AppError('Username and password are required', 400);
    }

    // Find user
    const [user] = await db.select()
      .from(users)
      .where(eq(users.username, data.username))
      .limit(1);

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Allow suspended users to login but with warning
    // Banned users still cannot login
    if (user.status === 'banned') {
      throw new AppError('Account is permanently banned', 403);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Update last login
    await db.update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    // Generate token
    const token = this.generateToken(user.id, user.role);

    // Prepare response with suspension warning if applicable
    const response: any = {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        referralCode: user.referralCode,
        balance: user.balance,
        bonusBalance: user.bonusBalance,
      },
      token,
    };

    // Add warning for suspended accounts
    if (user.status === 'suspended') {
      response.warning = 'Your account is suspended. You can view your information but cannot place bets or withdraw funds.';
      response.suspended = true;
    }

    return response;
  }

  // Verify token and get user
  async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as { userId: string; role: string };
      
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, decoded.userId))
        .limit(1);

      if (!user || user.status !== 'active') {
        throw new AppError('Invalid token or inactive user', 401);
      }

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        role: user.role,
        referralCode: user.referralCode,
        balance: user.balance,
        bonusBalance: user.bonusBalance,
      };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('Invalid token', 401);
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Token expired', 401);
      }
      throw error;
    }
  }

  // Refresh token
  async refreshToken(oldToken: string) {
    const user = await this.verifyToken(oldToken);
    const [dbUser] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
    
    if (!dbUser) {
      throw new AppError('User not found', 404);
    }
    
    const newToken = this.generateToken(dbUser.id, dbUser.role);
    
    return { token: newToken, user };
  }
}

export const authService = new AuthService();