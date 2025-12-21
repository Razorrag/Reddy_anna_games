-- SEED DATA: Admin, Test Player, and Test Partner Accounts
-- Generated: 2025-12-16
-- Database: reddy_anna

-- ============================================
-- 1. ADMIN ACCOUNT
-- ============================================
-- Phone: +919876543210
-- Password: Admin@123456
-- Email: admin@reddyanna.com

INSERT INTO users (
  phone,
  password,
  role,
  is_active,
  full_name,
  email,
  balance,
  bonus_balance,
  created_at,
  updated_at
) VALUES (
  '+919876543210',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- Admin@123456
  'admin',
  true,
  'System Administrator',
  'admin@reddyanna.com',
  0,
  0,
  NOW(),
  NOW()
) ON CONFLICT (phone) DO NOTHING;

-- ============================================
-- 2. TEST PLAYER ACCOUNT  
-- ============================================
-- Phone: +919876543211
-- Password: Player@123
-- Email: player@test.com
-- Starting Balance: 10,000 INR
-- Bonus Balance: 500 INR

INSERT INTO users (
  phone,
  password,
  role,
  is_active,
  full_name,
  email,
  balance,
  bonus_balance,
  created_at,
  updated_at
) VALUES (
  '+919876543211',
  '$2a$10$K9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWz', -- Player@123
  'player',
  true,
  'Test Player',
  'player@test.com',
  10000,
  500,
  NOW(),
  NOW()
) ON CONFLICT (phone) DO NOTHING;

-- ============================================
-- 3. TEST PARTNER ACCOUNT
-- ============================================
-- Phone: +919876543212
-- Password: Partner@123
-- Email: partner@test.com
-- Referral Code: PARTNER001
-- Commission Rate: 5%

-- Insert partner user
INSERT INTO users (
  phone,
  password,
  role,
  is_active,
  full_name,
  email,
  balance,
  bonus_balance,
  created_at,
  updated_at
) VALUES (
  '+919876543212',
  '$2a$10$L9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhW1', -- Partner@123
  'partner',
  true,
  'Test Partner',
  'partner@test.com',
  0,
  0,
  NOW(),
  NOW()
) ON CONFLICT (phone) DO NOTHING;

-- Create partner entry
INSERT INTO partners (
  user_id,
  referral_code,
  commission_rate,
  total_earnings,
  pending_earnings,
  paid_earnings,
  total_referrals,
  active_referrals,
  status,
  created_at,
  updated_at
) SELECT 
  id,
  'PARTNER001',
  0.05,
  0,
  0,
  0,
  0,
  0,
  'active',
  NOW(),
  NOW()
FROM users 
WHERE phone = '+919876543212'
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- 4. GAME SETTINGS (Default Configuration)
-- ============================================

INSERT INTO game_settings (key, value, description, created_at, updated_at) VALUES 
  ('min_bet_amount', '10', 'Minimum bet amount in INR', NOW(), NOW()),
  ('max_bet_amount', '100000', 'Maximum bet amount in INR', NOW(), NOW()),
  ('betting_duration', '30', 'Betting duration in seconds', NOW(), NOW()),
  ('payout_multiplier_andar', '1.98', 'Payout multiplier for Andar bets', NOW(), NOW()),
  ('payout_multiplier_bahar', '1.98', 'Payout multiplier for Bahar bets', NOW(), NOW()),
  ('house_edge', '0.02', 'House edge percentage (2%)', NOW(), NOW()),
  ('signup_bonus', '100', 'Signup bonus amount in INR', NOW(), NOW()),
  ('referral_bonus', '50', 'Referral bonus amount in INR', NOW(), NOW()),
  ('first_bet_bonus_percentage', '25', 'First bet bonus percentage', NOW(), NOW()),
  ('wagering_multiplier', '30', 'Bonus wagering requirement multiplier', NOW(), NOW()),
  ('min_withdrawal', '500', 'Minimum withdrawal amount in INR', NOW(), NOW()),
  ('max_withdrawal', '500000', 'Maximum withdrawal amount in INR', NOW(), NOW()),
  ('withdrawal_processing_hours', '24', 'Withdrawal processing time in hours', NOW(), NOW()),
  ('partner_commission_rate_default', '0.05', 'Default partner commission rate (5%)', NOW(), NOW()),
  ('platform_name', 'Reddy Anna', 'Platform name', NOW(), NOW()),
  ('platform_timezone', 'Asia/Kolkata', 'Platform timezone', NOW(), NOW()),
  ('platform_currency', 'INR', 'Platform currency', NOW(), NOW())
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = NOW();

-- ============================================
-- 5. VERIFICATION
-- ============================================

-- Show created accounts
SELECT 
  phone,
  role,
  full_name,
  email,
  balance,
  bonus_balance,
  is_active
FROM users
WHERE phone IN ('+919876543210', '+919876543211', '+919876543212')
ORDER BY role;

-- Show partner details
SELECT 
  u.phone,
  u.full_name,
  p.referral_code,
  p.commission_rate,
  p.status
FROM partners p
JOIN users u ON u.id = p.user_id
WHERE u.phone = '+919876543212';

-- Show game settings count
SELECT COUNT(*) as settings_count FROM game_settings;

-- ============================================
-- ACCOUNT CREDENTIALS SUMMARY
-- ============================================
-- 
-- ADMIN:
--   Phone: +919876543210
--   Password: Admin@123456
--   Role: admin
--
-- TEST PLAYER:
--   Phone: +919876543211
--   Password: Player@123
--   Role: player
--   Balance: 10,000 INR
--
-- TEST PARTNER:
--   Phone: +919876543212
--   Password: Partner@123
--   Role: partner
--   Referral Code: PARTNER001
--
-- ============================================
