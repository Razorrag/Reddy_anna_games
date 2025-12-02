import { db } from '../db';
import { systemSettings } from '../db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../utils/logger';

/**
 * Settings Service
 * Manages system-wide configurable settings stored in the database
 */
export class SettingsService {
  /**
   * Get a setting value by key
   */
  async getSetting(key: string): Promise<string | null> {
    try {
      const [setting] = await db.select()
        .from(systemSettings)
        .where(eq(systemSettings.key, key))
        .limit(1);
      
      return setting?.value || null;
    } catch (error) {
      logger.error(`Failed to get setting ${key}:`, error);
      return null;
    }
  }

  /**
   * Get a numeric setting with default fallback
   */
  async getSettingNumber(key: string, defaultValue: number): Promise<number> {
    const value = await this.getSetting(key);
    if (value === null) return defaultValue;
    
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * Get a boolean setting with default fallback
   */
  async getSettingBoolean(key: string, defaultValue: boolean): Promise<boolean> {
    const value = await this.getSetting(key);
    if (value === null) return defaultValue;
    
    return value === 'true' || value === '1';
  }

  /**
   * Get all settings as key-value object
   */
  async getAllSettings(): Promise<Record<string, string>> {
    try {
      const settings = await db.select().from(systemSettings);
      return Object.fromEntries(settings.map(s => [s.key, s.value]));
    } catch (error) {
      logger.error('Failed to get all settings:', error);
      return {};
    }
  }

  /**
   * Update a setting value
   */
  async updateSetting(key: string, value: string, adminId?: string): Promise<void> {
    try {
      await db.update(systemSettings)
        .set({ 
          value, 
          updatedBy: adminId, 
          updatedAt: new Date() 
        })
        .where(eq(systemSettings.key, key));
      
      logger.info(`Setting ${key} updated to ${value} by admin ${adminId}`);
    } catch (error) {
      logger.error(`Failed to update setting ${key}:`, error);
      throw error;
    }
  }

  /**
   * Update multiple settings at once
   */
  async updateSettings(updates: Record<string, string>, adminId?: string): Promise<void> {
    try {
      for (const [key, value] of Object.entries(updates)) {
        await this.updateSetting(key, value, adminId);
      }
      logger.info(`Updated ${Object.keys(updates).length} settings`);
    } catch (error) {
      logger.error('Failed to update settings:', error);
      throw error;
    }
  }

  /**
   * Get partner default settings
   */
  async getPartnerDefaults(): Promise<{
    sharePercentage: number;
    commissionRate: number;
  }> {
    const sharePercentage = await this.getSettingNumber('default_partner_share_percentage', 50);
    const commissionRate = await this.getSettingNumber('default_partner_commission_rate', 10);
    
    return { sharePercentage, commissionRate };
  }

  /**
   * Get referral settings
   */
  async getReferralSettings(): Promise<{
    bonusPercentage: number;
    minDepositAmount: number;
    minBetsRequired: number;
    wageringMultiplier: number;
    maxReferralsPerMonth: number;
    maxBonusPerMonth: number;
  }> {
    return {
      bonusPercentage: await this.getSettingNumber('referral_bonus_percentage', 5),
      minDepositAmount: await this.getSettingNumber('min_deposit_for_referral', 500),
      minBetsRequired: await this.getSettingNumber('min_bets_for_referral', 5),
      wageringMultiplier: await this.getSettingNumber('referral_wagering_multiplier', 0.1),
      maxReferralsPerMonth: await this.getSettingNumber('max_referrals_per_month', 50),
      maxBonusPerMonth: await this.getSettingNumber('max_referral_bonus_per_month', 10000),
    };
  }

  /**
   * Get deposit/withdrawal limits
   */
  async getTransactionLimits(): Promise<{
    minDeposit: number;
    maxDeposit: number;
    minWithdrawal: number;
    maxWithdrawal: number;
  }> {
    return {
      minDeposit: await this.getSettingNumber('min_deposit_amount', 100),
      maxDeposit: await this.getSettingNumber('max_deposit_amount', 100000),
      minWithdrawal: await this.getSettingNumber('min_withdrawal_amount', 500),
      maxWithdrawal: await this.getSettingNumber('max_withdrawal_amount', 50000),
    };
  }

  /**
   * Get betting limits
   */
  async getBettingLimits(): Promise<{
    minBet: number;
    maxBet: number;
  }> {
    return {
      minBet: await this.getSettingNumber('min_bet_amount', 1000),
      maxBet: await this.getSettingNumber('max_bet_amount', 100000),
    };
  }

  /**
   * Get bonus settings
   */
  async getBonusSettings(): Promise<{
    signupBonus: number;
    depositBonusPercentage: number;
    wageringMultiplier: number;
  }> {
    return {
      signupBonus: await this.getSettingNumber('signup_bonus_amount', 100),
      depositBonusPercentage: await this.getSettingNumber('deposit_bonus_percentage', 5),
      wageringMultiplier: await this.getSettingNumber('wagering_multiplier', 30),
    };
  }

  /**
   * Check if maintenance mode is enabled
   */
  async isMaintenanceMode(): Promise<boolean> {
    return await this.getSettingBoolean('maintenance_mode', false);
  }

  /**
   * Get game settings
   */
  async getGameSettings(): Promise<{
    bettingDuration: number;
    houseCommissionRate: number;
  }> {
    return {
      bettingDuration: await this.getSettingNumber('betting_duration_seconds', 30),
      houseCommissionRate: await this.getSettingNumber('house_commission_rate', 0.05),
    };
  }

  /**
   * Get support contact information
   */
  async getSupportContacts(): Promise<{
    whatsapp: string;
    email: string;
    phone: string;
  }> {
    return {
      whatsapp: await this.getSetting('admin_whatsapp_number') || '',
      email: await this.getSetting('customer_support_email') || 'support@reddyanna.com',
      phone: await this.getSetting('customer_support_phone') || '',
    };
  }
}

export const settingsService = new SettingsService();