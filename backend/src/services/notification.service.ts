import { db } from '../db';
import { notifications, users } from '../db/schema';
import { eq } from 'drizzle-orm';

export class NotificationService {
  // Create notification for a user
  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: string,
    metadata?: Record<string, any>
  ) {
    try {
      const [notification] = await db
        .insert(notifications)
        .values({
          userId,
          title,
          message,
          type,
          metadata: metadata ? JSON.stringify(metadata) : null,
        })
        .returning();

      return notification;
    } catch (error) {
      console.error('Create notification error:', error);
      throw error;
    }
  }

  // Send welcome notification
  async sendWelcomeNotification(userId: string, username: string) {
    try {
      return await this.createNotification(
        userId,
        'Welcome to Reddy Anna!',
        `Welcome ${username}! Start playing and win big rewards.`,
        'welcome'
      );
    } catch (error) {
      console.error('Send welcome notification error:', error);
      throw error;
    }
  }

  // Send deposit confirmation
  async sendDepositConfirmation(userId: string, amount: number) {
    try {
      return await this.createNotification(
        userId,
        'Deposit Successful',
        `Your deposit of ₹${amount} has been credited to your account.`,
        'deposit',
        { amount }
      );
    } catch (error) {
      console.error('Send deposit confirmation error:', error);
      throw error;
    }
  }

  // Send withdrawal confirmation
  async sendWithdrawalConfirmation(userId: string, amount: number, status: string) {
    try {
      const messages = {
        pending: `Your withdrawal request of ₹${amount} is being processed.`,
        approved: `Your withdrawal of ₹${amount} has been approved and will be processed soon.`,
        completed: `Your withdrawal of ₹${amount} has been completed successfully.`,
        rejected: `Your withdrawal request of ₹${amount} has been rejected.`,
      };

      return await this.createNotification(
        userId,
        'Withdrawal Update',
        messages[status as keyof typeof messages] || `Withdrawal status: ${status}`,
        'withdrawal',
        { amount, status }
      );
    } catch (error) {
      console.error('Send withdrawal confirmation error:', error);
      throw error;
    }
  }

  // Send win notification
  async sendWinNotification(userId: string, amount: number, gameId: string) {
    try {
      return await this.createNotification(
        userId,
        'Congratulations! You Won!',
        `You won ₹${amount}! Keep playing to win more.`,
        'win',
        { amount, gameId }
      );
    } catch (error) {
      console.error('Send win notification error:', error);
      throw error;
    }
  }

  // Send bonus notification
  async sendBonusNotification(userId: string, amount: number, bonusType: string) {
    try {
      const titles = {
        signup: 'Welcome Bonus!',
        deposit: 'Deposit Bonus!',
        referral: 'Referral Bonus!',
        loyalty: 'Loyalty Bonus!',
      };

      return await this.createNotification(
        userId,
        titles[bonusType as keyof typeof titles] || 'Bonus Received!',
        `You received a bonus of ₹${amount}!`,
        'bonus',
        { amount, bonusType }
      );
    } catch (error) {
      console.error('Send bonus notification error:', error);
      throw error;
    }
  }

  // Send referral notification
  async sendReferralNotification(referrerId: string, referredUsername: string, bonus: number) {
    try {
      return await this.createNotification(
        referrerId,
        'Referral Bonus!',
        `${referredUsername} joined using your referral code. You earned ₹${bonus}!`,
        'referral',
        { referredUsername, bonus }
      );
    } catch (error) {
      console.error('Send referral notification error:', error);
      throw error;
    }
  }

  // Send account status notification
  async sendAccountStatusNotification(userId: string, status: string, reason?: string) {
    try {
      const messages = {
        active: 'Your account has been activated.',
        suspended: `Your account has been suspended${reason ? `: ${reason}` : ''}.`,
        banned: `Your account has been banned${reason ? `: ${reason}` : ''}.`,
      };

      return await this.createNotification(
        userId,
        'Account Status Update',
        messages[status as keyof typeof messages] || `Account status: ${status}`,
        'account',
        { status, reason }
      );
    } catch (error) {
      console.error('Send account status notification error:', error);
      throw error;
    }
  }

  // Send promotion notification
  async sendPromotionNotification(userId: string, title: string, message: string) {
    try {
      return await this.createNotification(
        userId,
        title,
        message,
        'promotion'
      );
    } catch (error) {
      console.error('Send promotion notification error:', error);
      throw error;
    }
  }

  // Broadcast notification to all users
  async broadcastNotification(
    title: string,
    message: string,
    type: string,
    userRole?: string
  ) {
    try {
      // Get target users
      const targetUsers = userRole
        ? await db.select({ id: users.id }).from(users).where(eq(users.role, userRole as any))
        : await db.select({ id: users.id }).from(users);

      // Create notifications in batch
      const notificationValues = targetUsers.map(user => ({
        userId: user.id,
        title,
        message,
        type,
      }));

      if (notificationValues.length > 0) {
        await db.insert(notifications).values(notificationValues);
      }

      return { sent: notificationValues.length };
    } catch (error) {
      console.error('Broadcast notification error:', error);
      throw error;
    }
  }

  // Send game update notification
  async sendGameUpdateNotification(gameId: string, title: string, message: string) {
    try {
      // Get users who recently played this game
      const { bets } = await import('../db/schema');
      const recentPlayers = await db
        .selectDistinct({ userId: bets.userId })
        .from(bets)
        .where(eq(bets.gameId, gameId))
        .limit(1000); // Limit to prevent too many notifications

      const notificationValues = recentPlayers.map(player => ({
        userId: player.userId,
        title,
        message,
        type: 'game_update',
        metadata: JSON.stringify({ gameId }),
      }));

      if (notificationValues.length > 0) {
        await db.insert(notifications).values(notificationValues);
      }

      return { sent: notificationValues.length };
    } catch (error) {
      console.error('Send game update notification error:', error);
      throw error;
    }
  }

  // Send commission notification
  async sendCommissionNotification(userId: string, amount: number, period: string) {
    try {
      return await this.createNotification(
        userId,
        'Commission Earned!',
        `You earned ₹${amount} in commissions for ${period}.`,
        'commission',
        { amount, period }
      );
    } catch (error) {
      console.error('Send commission notification error:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();