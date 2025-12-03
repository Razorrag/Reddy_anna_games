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

// Phone-based registration (frontend format)
interface PhoneRegisterData {
  phone: string;
  name: string;
  password: string;
  referralCode?: string;
}

interface LoginData {
  username: string;
  password: string;
}

// Phone-based login (frontend format)
interface PhoneLoginData {
  phone: string;
  password: string;
}

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
  private readonly SALT_ROUNDS = 12;

  // Map database user to frontend format
  private mapUserToFrontend(user: any) {
    return {
      id: user.id,
      phone: user.phoneNumber || user.username,  // Frontend expects 'phone'
      name: user.fullName || user.username,      // Frontend expects 'name'
      email: user.email,
      role: user.role,
      mainBalance: parseFloat(user.balance),     // Frontend expects 'mainBalance'
      bonusBalance: parseFloat(user.bonusBalance),
      referralCode: user.referralCode,
      referredBy: user.referredBy,
      isActive: user.status === 'active',        // Frontend expects boolean 'isActive'
      createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
      updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt,
    };
  }

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

  // Phone-based registration (matches frontend format)
  async registerWithPhone(data: PhoneRegisterData) {
    // Validate input
    if (!data.phone || data.phone.length < 6) {
      throw new AppError('Phone number must be at least 6 characters', 400);
    }

    if (!data.password || data.password.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400);
    }

    // Check if phone exists (check username field since we use phone as username)
    const [existingUser] = await db.select()
      .from(users)
      .where(eq(users.username, data.phone))
      .limit(1);

    if (existingUser) {
      throw new AppError('Phone number already registered', 409);
    }

    // Auto-generate email from phone
    const email = `${data.phone.replace(/[^0-9]/g, '')}@reddyanna.local`;

    // Convert to standard RegisterData format
    const registerData: RegisterData = {
      username: data.phone,      // Use phone as username
      email: email,              // Auto-generated email
      password: data.password,
      phoneNumber: data.phone,   // Also store in phoneNumber field
      fullName: data.name,       // name → fullName
      referralCode: data.referralCode,
    };

    return this.register(registerData);
  }

  // Register new user (internal method)
  async register(data: RegisterData) {
    // Validate input
    if (!data.username || data.username.length < 3) {
      throw new AppError('Username must be at least 3 characters', 400);
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

    // Fetch updated user with bonus
    const [updatedUser] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);

    // Create referral bonus if referred
    if (referrerId) {
      await this.createReferralBonus(referrerId, user.id, data.referralCode!);
    }

    // Generate token
    const token = this.generateToken(updatedUser.id, updatedUser.role);

    return {
      user: this.mapUserToFrontend(updatedUser),  // Map to frontend format
      token,
    };
  }

  // Phone-based login (matches frontend format)
  async loginWithPhone(data: PhoneLoginData) {
    if (!data.phone || !data.password) {
      throw new AppError('Phone and password are required', 400);
    }

    // Convert to standard LoginData format
    return this.login({
      username: data.phone,  // Use phone as username
      password: data.password,
    });
  }

  // Login user (internal method)
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
      user: this.mapUserToFrontend(user),  // Map to frontend format
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

      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (user.status === 'banned') {
        throw new AppError('Account is banned', 403);
      }

      return this.mapUserToFrontend(user);  // Map to frontend format
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
    
    return { token: newToken, user: this.mapUserToFrontend(dbUser) };
  }
}

export const authService = new AuthService();