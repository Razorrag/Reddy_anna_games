import { db, pool } from '../db/index';
import { users, games, systemSettings } from '../db/schema';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';

const createAdmin = async () => {
  console.log('🔐 Creating Admin Account...\n');

  try {
    // Check if admin already exists
    const existingAdmin = await db.select().from(users).where(eq(users.username, 'admin')).limit(1);
    
    if (existingAdmin.length > 0) {
      console.log('⚠️  Admin user already exists!');
      console.log('\n📝 Existing Admin Credentials:');
      console.log('   URL: http://89.42.231.35/admin');
      console.log('   Username: admin');
      console.log('   Email: admin@reddyanna.com');
      console.log('   Password: Admin@123456 (default)');
      console.log('\n   If you forgot password, run reset script.');
      return;
    }

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

    console.log('✅ Admin user created successfully!');
    console.log('\n📝 Admin Credentials:');
    console.log('   URL: http://89.42.231.35/admin');
    console.log('   Username:', admin.username);
    console.log('   Email:', admin.email);
    console.log('   Password:', adminPassword);

    // Create default game if not exists
    const existingGame = await db.select().from(games).limit(1);
    
    if (existingGame.length === 0) {
      const [andarBaharGame] = await db.insert(games).values({
        name: 'Andar Bahar',
        type: 'andar_bahar',
        status: 'active',
        minBet: '100.00',
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
      console.log('\n✅ Andar Bahar game created:', andarBaharGame.name);
    }

    // Insert system settings if not exists
    const existingSettings = await db.select().from(systemSettings).limit(1);
    
    if (existingSettings.length === 0) {
      const settings = [
        { key: 'signup_bonus_amount', value: '100', description: 'Bonus amount for new signups (₹)' },
        { key: 'deposit_bonus_percentage', value: '5', description: 'Percentage bonus on deposits (%)' },
        { key: 'min_bet_amount', value: '100', description: 'Minimum bet amount (₹)' },
        { key: 'max_bet_amount', value: '100000', description: 'Maximum bet amount (₹)' },
        { key: 'betting_duration_seconds', value: '30', description: 'Betting phase duration (seconds)' },
        { key: 'house_commission_rate', value: '0.05', description: 'House commission rate (5%)' },
        { key: 'maintenance_mode', value: 'false', description: 'Enable maintenance mode' },
      ];

      for (const setting of settings) {
        await db.insert(systemSettings).values(setting);
      }
      console.log('✅ System settings configured');
    }

    console.log('\n🎮 Access Points:');
    console.log('   • Website: http://89.42.231.35');
    console.log('   • Admin Panel: http://89.42.231.35/admin');
    console.log('   • Player Game: http://89.42.231.35/game');
    console.log('   • Partner Portal: http://89.42.231.35/partner');

  } catch (error) {
    console.error('❌ Failed to create admin:', error);
    throw error;
  } finally {
    await pool.end();
  }
};

createAdmin();
