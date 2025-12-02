import { db, pool } from './index';
import { users, games, systemSettings } from './schema';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

const seed = async () => {
  console.log('🌱 Seeding database...');

  try {
    // Create admin user
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const [admin] = await db.insert(users).values({
      username: 'admin',
      email: 'admin@reddyanna.com',
      passwordHash: hashedPassword,
      fullName: 'System Administrator',
      role: 'admin',
      status: 'active',
      referralCode: nanoid(8).toUpperCase(),
      balance: '0.00',
      bonusBalance: '0.00',
    }).returning();

    console.log('✓ Admin user created:', admin.username);

    // Create default Andar Bahar game
    const [andarBaharGame] = await db.insert(games).values({
      name: 'Andar Bahar',
      type: 'andar_bahar',
      status: 'active',
      streamUrl: process.env.OME_HLS_URL ? `${process.env.OME_HLS_URL}/andar_bahar/stream.m3u8` : null,
      minBet: '10.00',
      maxBet: '100000.00',
      description: 'Classic Indian card game - Andar Bahar',
      rules: JSON.stringify({
        objective: 'Predict which side (Andar or Bahar) the matching card will appear',
        payout: {
          round1: { andar: '1:1', bahar: 'refund' },
          round2Plus: { andar: '1:1', bahar: '1:1' }
        },
        bettingTime: 30,
      }),
    }).returning();

    console.log('✓ Andar Bahar game created:', andarBaharGame.name);

    // Insert system settings (comprehensive configuration - 25+ settings)
    const settings = [
      // Bonus Settings
      { key: 'signup_bonus_amount', value: '100', description: 'Bonus amount for new signups (₹)' },
      { key: 'deposit_bonus_percentage', value: '5', description: 'Percentage bonus on deposits (%)' },
      { key: 'wagering_multiplier', value: '30', description: 'Wagering requirement multiplier (x)' },
      
      // Referral Settings - FIXED: Changed from fixed amount to percentage
      { key: 'referral_bonus_percentage', value: '5', description: 'Referral bonus as percentage of deposit (%)' },
      { key: 'min_deposit_for_referral', value: '500', description: 'Minimum deposit to trigger referral bonus (₹)' },
      { key: 'min_bets_for_referral', value: '5', description: 'Minimum bets before referral bonus unlocks' },
      { key: 'referral_wagering_multiplier', value: '0.1', description: 'Referral bonus wagering requirement (10% of deposit)' },
      { key: 'max_referrals_per_month', value: '50', description: 'Maximum referrals per user per month' },
      { key: 'max_referral_bonus_per_month', value: '10000', description: 'Maximum referral bonus per month (₹)' },
      
      // Partner Default Settings - NEW
      { key: 'default_partner_share_percentage', value: '50', description: 'Default partner profit visibility multiplier (%)' },
      { key: 'default_partner_commission_rate', value: '10', description: 'Default partner commission rate (% of shown profit)' },
      
      // Deposit/Withdrawal Limits - NEW
      { key: 'min_deposit_amount', value: '100', description: 'Minimum deposit amount (₹)' },
      { key: 'max_deposit_amount', value: '100000', description: 'Maximum deposit amount (₹)' },
      { key: 'min_withdrawal_amount', value: '500', description: 'Minimum withdrawal amount (₹)' },
      { key: 'max_withdrawal_amount', value: '50000', description: 'Maximum withdrawal amount (₹)' },
      
      // Betting Limits - NEW
      { key: 'min_bet_amount', value: '1000', description: 'Minimum bet amount per game (₹)' },
      { key: 'max_bet_amount', value: '100000', description: 'Maximum bet amount per game (₹)' },
      
      // Game Settings
      { key: 'betting_duration_seconds', value: '30', description: 'Betting phase duration (seconds)' },
      { key: 'house_commission_rate', value: '0.05', description: 'House commission/edge rate (5%)' },
      
      // Support Contact - NEW
      { key: 'admin_whatsapp_number', value: '', description: 'Admin WhatsApp number for support' },
      { key: 'customer_support_email', value: 'support@reddyanna.com', description: 'Customer support email address' },
      { key: 'customer_support_phone', value: '', description: 'Customer support phone number' },
      
      // System Settings
      { key: 'maintenance_mode', value: 'false', description: 'Enable/disable maintenance mode (true/false)' },
    ];

    for (const setting of settings) {
      await db.insert(systemSettings).values(setting);
    }

    console.log(`✓ System settings configured (${settings.length} settings)`);
    console.log('\n📝 Default Credentials:');
    console.log('   Username: admin');
    console.log('   Email: admin@reddyanna.com');
    console.log(`   Password: ${adminPassword}`);
    console.log('\n✨ Key Settings:');
    console.log('   • Partner Share: 50% (visibility multiplier)');
    console.log('   • Partner Commission: 10% (of shown profit)');
    console.log('   • Effective Partner Rate: 5% (10% × 50%)');
    console.log('   • Referral Bonus: 5% of deposit');
    console.log('   • Min Bet: ₹1,000');
    console.log('   • Max Bet: ₹1,00,000');
    console.log('\n✓ Database seeded successfully!');

  } catch (error) {
    console.error('✗ Seeding failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
};

seed();