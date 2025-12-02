-- Migration: 0001_create_initial_schema
-- Description: Create all tables, enums, and indexes for the Reddy Anna Gaming Platform
-- Date: 2025-12-01

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('player', 'admin', 'partner');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'banned');
CREATE TYPE game_status AS ENUM ('active', 'inactive', 'maintenance');
CREATE TYPE round_status AS ENUM ('betting', 'playing', 'completed', 'cancelled');
CREATE TYPE bet_status AS ENUM ('pending', 'won', 'lost', 'cancelled', 'refunded');
CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'bet', 'win', 'bonus', 'commission', 'refund');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
CREATE TYPE bonus_type AS ENUM ('signup', 'deposit', 'referral', 'loyalty');
CREATE TYPE bonus_status AS ENUM ('active', 'completed', 'expired', 'cancelled');
CREATE TYPE withdrawal_status AS ENUM ('pending', 'approved', 'rejected', 'processing', 'completed');

-- ============================================
-- TABLES
-- ============================================

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    full_name VARCHAR(100),
    balance DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
    bonus_balance DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
    role user_role DEFAULT 'player' NOT NULL,
    status user_status DEFAULT 'active' NOT NULL,
    referral_code VARCHAR(20) UNIQUE,
    referred_by UUID REFERENCES users(id),
    profile_image TEXT,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Games table
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status game_status DEFAULT 'active' NOT NULL,
    stream_url TEXT,
    thumbnail_url TEXT,
    min_bet DECIMAL(10, 2) DEFAULT 10.00 NOT NULL,
    max_bet DECIMAL(10, 2) DEFAULT 100000.00 NOT NULL,
    description TEXT,
    rules TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Game Rounds table
CREATE TABLE game_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES games(id) NOT NULL,
    round_number INTEGER NOT NULL,
    status round_status DEFAULT 'betting' NOT NULL,
    joker_card VARCHAR(10),
    winning_side VARCHAR(10),
    winning_card VARCHAR(10),
    total_andar_bets DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
    total_bahar_bets DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
    total_bet_amount DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
    total_payout_amount DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
    betting_start_time TIMESTAMP,
    betting_end_time TIMESTAMP,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Bets table
CREATE TABLE bets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    round_id UUID REFERENCES game_rounds(id) NOT NULL,
    game_id UUID REFERENCES games(id) NOT NULL,
    bet_side VARCHAR(10) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    potential_win DECIMAL(10, 2),
    status bet_status DEFAULT 'pending' NOT NULL,
    payout_amount DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    is_bonus BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    type transaction_type NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    balance_before DECIMAL(12, 2),
    balance_after DECIMAL(12, 2),
    status transaction_status DEFAULT 'pending' NOT NULL,
    reference_id UUID,
    reference_type VARCHAR(50),
    description TEXT,
    metadata TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Partners table
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    partner_code VARCHAR(20) UNIQUE NOT NULL,
    share_percentage DECIMAL(5, 2) DEFAULT 50.00 NOT NULL,
    commission_rate DECIMAL(5, 2) DEFAULT 10.00 NOT NULL,
    total_players INTEGER DEFAULT 0 NOT NULL,
    total_commission DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
    pending_commission DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
    status user_status DEFAULT 'active' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Partner Commissions table
CREATE TABLE partner_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES partners(id) NOT NULL,
    bet_id UUID REFERENCES bets(id),
    user_id UUID REFERENCES users(id) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status transaction_status DEFAULT 'pending' NOT NULL,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Partner Game Earnings table
CREATE TABLE partner_game_earnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES partners(id) NOT NULL,
    game_id UUID REFERENCES games(id) NOT NULL,
    round_id UUID REFERENCES game_rounds(id) NOT NULL,
    real_profit DECIMAL(12, 2) NOT NULL,
    real_total_bets DECIMAL(12, 2) NOT NULL,
    real_total_payouts DECIMAL(12, 2) NOT NULL,
    shown_profit DECIMAL(12, 2) NOT NULL,
    shown_total_bets DECIMAL(12, 2) NOT NULL,
    shown_total_payouts DECIMAL(12, 2) NOT NULL,
    share_percentage DECIMAL(5, 2) NOT NULL,
    commission_rate DECIMAL(5, 2) NOT NULL,
    earned_amount DECIMAL(10, 2) NOT NULL,
    player_count INTEGER DEFAULT 0 NOT NULL,
    status transaction_status DEFAULT 'pending' NOT NULL,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Referrals table
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES users(id) NOT NULL,
    referred_id UUID REFERENCES users(id) NOT NULL,
    referral_code VARCHAR(20) NOT NULL,
    bonus_earned DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    status transaction_status DEFAULT 'pending' NOT NULL,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- User Bonuses table
CREATE TABLE user_bonuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    bonus_type bonus_type NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    wagering_requirement DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
    wagering_progress DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
    status bonus_status DEFAULT 'active' NOT NULL,
    expires_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Deposits table
CREATE TABLE deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(255),
    screenshot_url TEXT,
    status transaction_status DEFAULT 'pending' NOT NULL,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Withdrawals table
CREATE TABLE withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    withdrawal_method VARCHAR(50) NOT NULL,
    bank_name VARCHAR(100),
    account_number VARCHAR(50),
    ifsc_code VARCHAR(20),
    upi_id VARCHAR(100),
    status withdrawal_status DEFAULT 'pending' NOT NULL,
    processed_by UUID REFERENCES users(id),
    processed_at TIMESTAMP,
    transaction_id VARCHAR(255),
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Game Statistics table
CREATE TABLE game_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES games(id) NOT NULL,
    date TIMESTAMP NOT NULL,
    total_rounds INTEGER DEFAULT 0 NOT NULL,
    total_bets INTEGER DEFAULT 0 NOT NULL,
    total_bet_amount DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
    total_payout_amount DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
    total_players INTEGER DEFAULT 0 NOT NULL,
    revenue DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- User Statistics table
CREATE TABLE user_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    total_bets INTEGER DEFAULT 0 NOT NULL,
    total_wins INTEGER DEFAULT 0 NOT NULL,
    total_losses INTEGER DEFAULT 0 NOT NULL,
    total_bet_amount DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
    total_win_amount DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
    biggest_win DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    current_streak INTEGER DEFAULT 0 NOT NULL,
    longest_streak INTEGER DEFAULT 0 NOT NULL,
    last_bet_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Game History table
CREATE TABLE game_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    game_id UUID REFERENCES games(id) NOT NULL,
    round_id UUID REFERENCES game_rounds(id) NOT NULL,
    bet_id UUID REFERENCES bets(id) NOT NULL,
    round_number INTEGER NOT NULL,
    bet_side VARCHAR(10) NOT NULL,
    bet_amount DECIMAL(10, 2) NOT NULL,
    result VARCHAR(10) NOT NULL,
    payout_amount DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    joker_card VARCHAR(10),
    winning_card VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- System Settings table
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    metadata TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX users_username_idx ON users(username);
CREATE INDEX users_email_idx ON users(email);
CREATE INDEX users_referral_code_idx ON users(referral_code);
CREATE INDEX users_role_idx ON users(role);
CREATE INDEX users_status_idx ON users(status);

CREATE INDEX game_rounds_game_id_idx ON game_rounds(game_id);
CREATE INDEX game_rounds_status_idx ON game_rounds(status);
CREATE INDEX game_rounds_created_at_idx ON game_rounds(created_at);

CREATE INDEX bets_user_id_idx ON bets(user_id);
CREATE INDEX bets_round_id_idx ON bets(round_id);
CREATE INDEX bets_game_id_idx ON bets(game_id);
CREATE INDEX bets_status_idx ON bets(status);
CREATE INDEX bets_created_at_idx ON bets(created_at);

CREATE INDEX transactions_user_id_idx ON transactions(user_id);
CREATE INDEX transactions_type_idx ON transactions(type);
CREATE INDEX transactions_status_idx ON transactions(status);
CREATE INDEX transactions_created_at_idx ON transactions(created_at);

CREATE INDEX partners_partner_code_idx ON partners(partner_code);
CREATE INDEX partners_user_id_idx ON partners(user_id);
CREATE INDEX partners_status_idx ON partners(status);

CREATE INDEX partner_commissions_partner_id_idx ON partner_commissions(partner_id);
CREATE INDEX partner_commissions_user_id_idx ON partner_commissions(user_id);
CREATE INDEX partner_commissions_status_idx ON partner_commissions(status);

CREATE INDEX partner_game_earnings_partner_id_idx ON partner_game_earnings(partner_id);
CREATE INDEX partner_game_earnings_game_id_idx ON partner_game_earnings(game_id);
CREATE INDEX partner_game_earnings_round_id_idx ON partner_game_earnings(round_id);
CREATE INDEX partner_game_earnings_status_idx ON partner_game_earnings(status);

CREATE INDEX referrals_referrer_id_idx ON referrals(referrer_id);
CREATE INDEX referrals_referred_id_idx ON referrals(referred_id);
CREATE INDEX referrals_status_idx ON referrals(status);

CREATE INDEX user_bonuses_user_id_idx ON user_bonuses(user_id);
CREATE INDEX user_bonuses_status_idx ON user_bonuses(status);
CREATE INDEX user_bonuses_bonus_type_idx ON user_bonuses(bonus_type);

CREATE INDEX deposits_user_id_idx ON deposits(user_id);
CREATE INDEX deposits_status_idx ON deposits(status);
CREATE INDEX deposits_created_at_idx ON deposits(created_at);

CREATE INDEX withdrawals_user_id_idx ON withdrawals(user_id);
CREATE INDEX withdrawals_status_idx ON withdrawals(status);
CREATE INDEX withdrawals_created_at_idx ON withdrawals(created_at);

CREATE INDEX game_statistics_game_id_date_idx ON game_statistics(game_id, date);
CREATE INDEX game_statistics_date_idx ON game_statistics(date);

CREATE INDEX user_statistics_user_id_idx ON user_statistics(user_id);

CREATE INDEX game_history_user_id_idx ON game_history(user_id);
CREATE INDEX game_history_game_id_idx ON game_history(game_id);
CREATE INDEX game_history_round_id_idx ON game_history(round_id);
CREATE INDEX game_history_created_at_idx ON game_history(created_at);

CREATE INDEX notifications_user_id_idx ON notifications(user_id);
CREATE INDEX notifications_is_read_idx ON notifications(is_read);
CREATE INDEX notifications_created_at_idx ON notifications(created_at);

-- ============================================
-- TRIGGERS FOR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_statistics_updated_at BEFORE UPDATE ON user_statistics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INITIAL DATA
-- ============================================

-- Insert default game
INSERT INTO games (id, name, type, status, description, rules, min_bet, max_bet)
VALUES (
    gen_random_uuid(),
    'Andar Bahar',
    'card_game',
    'active',
    'Traditional Indian card game with 50-50 odds',
    'A joker card is drawn. Players bet on Andar or Bahar side. Cards are dealt alternately. First side to match the joker wins.',
    10.00,
    100000.00
);

-- Insert system settings
INSERT INTO system_settings (key, value, description) VALUES
('maintenance_mode', 'false', 'Enable/disable maintenance mode'),
('min_withdrawal_amount', '100', 'Minimum withdrawal amount in INR'),
('max_withdrawal_amount', '500000', 'Maximum withdrawal amount in INR'),
('referral_bonus_amount', '100', 'Bonus amount for successful referrals'),
('signup_bonus_amount', '50', 'Welcome bonus for new signups'),
('betting_time_seconds', '30', 'Default betting time in seconds'),
('max_concurrent_bets', '10', 'Maximum concurrent bets per user');

COMMENT ON TABLE users IS 'User accounts and authentication';
COMMENT ON TABLE games IS 'Available games in the platform';
COMMENT ON TABLE game_rounds IS 'Individual game rounds';
COMMENT ON TABLE bets IS 'User bets placed on game rounds';
COMMENT ON TABLE transactions IS 'All financial transactions';
COMMENT ON TABLE partners IS 'Partner/affiliate accounts';
COMMENT ON TABLE partner_commissions IS 'Partner commission records';
COMMENT ON TABLE partner_game_earnings IS 'Two-tier partner earnings system';
COMMENT ON TABLE referrals IS 'User referral tracking';
COMMENT ON TABLE user_bonuses IS 'User bonus tracking and wagering';
COMMENT ON TABLE deposits IS 'Deposit requests';
COMMENT ON TABLE withdrawals IS 'Withdrawal requests';
COMMENT ON TABLE game_statistics IS 'Aggregated game statistics';
COMMENT ON TABLE user_statistics IS 'User gaming statistics';
COMMENT ON TABLE game_history IS 'Complete game history for users';
COMMENT ON TABLE system_settings IS 'System-wide configuration';
COMMENT ON TABLE notifications IS 'User notifications';