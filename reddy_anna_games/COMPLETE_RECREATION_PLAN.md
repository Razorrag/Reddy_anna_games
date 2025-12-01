# 🎰 ANDAR BAHAR COMPLETE RECREATION PLAN
## Detailed Phase-by-Phase Implementation Guide

---

# 📋 TABLE OF CONTENTS

1. [Project Overview](#project-overview)
2. [Legacy System Analysis](#legacy-system-analysis)
3. [Phase 1: Infrastructure & Database](#phase-1-infrastructure--database)
4. [Phase 2: Authentication System](#phase-2-authentication-system)
5. [Phase 3: Core Backend Services](#phase-3-core-backend-services)
6. [Phase 4: Game Logic & Betting System](#phase-4-game-logic--betting-system)
7. [Phase 5: Frontend - User Pages](#phase-5-frontend---user-pages)
8. [Phase 6: Frontend - Game Interface](#phase-6-frontend---game-interface)
9. [Phase 7: Admin Dashboard](#phase-7-admin-dashboard)
10. [Phase 8: Partner System](#phase-8-partner-system)
11. [Phase 9: Payment & Wallet System](#phase-9-payment--wallet-system)
12. [Phase 10: Bonus & Referral System](#phase-10-bonus--referral-system)
13. [Phase 11: Analytics & Reporting](#phase-11-analytics--reporting)
14. [Phase 12: Testing & Deployment](#phase-12-testing--deployment)
15. [Complete Function Reference](#complete-function-reference)

---

# 🎯 PROJECT OVERVIEW

## Goal
Recreate the entire Andar Bahar game platform with:
- Clean architecture (KISS & YAGNI principles)
- 500-line file limit
- Docker orchestration
- PostgreSQL database
- OvenMediaEngine streaming
- ALL legacy features preserved
- Scalable to 10,000+ concurrent users

## Technology Stack

### Frontend
- **Framework:** React 18.3 + TypeScript
- **Build Tool:** Vite
- **State Management:** Zustand (replacing 4 contexts)
- **Routing:** Wouter
- **UI Library:** Radix UI + shadcn/ui + Tailwind CSS
- **Animations:** Framer Motion
- **API Client:** Axios + TanStack Query
- **Video Player:** HLS.js

### Backend
- **Runtime:** Node.js 20
- **Framework:** Express 4.21
- **Language:** TypeScript
- **Database:** PostgreSQL 16 (Drizzle ORM)
- **Cache:** Redis 7
- **WebSocket:** ws library
- **Authentication:** JWT + bcrypt

### Infrastructure
- **Streaming:** OvenMediaEngine
- **Reverse Proxy:** nginx
- **Containerization:** Docker + Docker Compose
- **VPS:** Single server deployment

---

# 📊 LEGACY SYSTEM ANALYSIS

## Database Tables (Complete Schema)

### Users & Authentication
```typescript
users {
  id: varchar (phone number as ID)
  phone: varchar (unique)
  password_hash: varchar
  balance: decimal(15,2) DEFAULT 100000.00
  referral_code: varchar (used by this user)
  referral_code_generated: varchar (unique code for others to use)
  deposit_bonus_available: decimal DEFAULT 0
  referral_bonus_available: decimal DEFAULT 0
  wagering_requirement: decimal DEFAULT 0
  wagering_completed: decimal DEFAULT 0
  bonus_locked: boolean DEFAULT false
  status: enum('active','suspended') DEFAULT 'active'
  full_name: varchar
  created_at: timestamp
  updated_at: timestamp
}
```

### Game Management
```typescript
game_sessions {
  id: serial PRIMARY KEY
  game_id: varchar UNIQUE (e.g., "game_1733059200000")
  status: enum('waiting','betting','dealing','completed')
  opening_card: varchar (e.g., "7♠")
  winner: enum('andar','bahar') NULL
  winning_card: varchar NULL
  current_round: integer DEFAULT 1
  andar_cards: text[] DEFAULT []
  bahar_cards: text[] DEFAULT []
  created_at: timestamp
  completed_at: timestamp NULL
}

player_bets {
  id: serial PRIMARY KEY
  user_id: varchar → users.id
  game_id: varchar → game_sessions.game_id
  side: enum('andar','bahar')
  amount: decimal(15,2)
  round: integer DEFAULT 1
  payout: decimal(15,2) DEFAULT 0
  status: enum('pending','won','lost','refunded')
  payout_transaction_id: integer → transactions.id
  created_at: timestamp
}

game_history {
  id: serial PRIMARY KEY
  game_id: varchar UNIQUE
  opening_card: varchar
  winner: enum('andar','bahar')
  winning_card: varchar
  total_rounds: integer
  andar_cards: text[]
  bahar_cards: text[]
  total_bets: decimal(15,2)
  total_payouts: decimal(15,2)
  net_house_profit: decimal(15,2)
  completed_at: timestamp
}

game_statistics {
  id: serial PRIMARY KEY
  user_id: varchar → users.id
  total_games_played: integer DEFAULT 0
  total_games_won: integer DEFAULT 0
  total_games_lost: integer DEFAULT 0
  total_amount_bet: decimal(15,2) DEFAULT 0
  total_amount_won: decimal(15,2) DEFAULT 0
  win_rate: decimal(5,2) DEFAULT 0
  favorite_side: varchar NULL
  last_played: timestamp NULL
  created_at: timestamp
  updated_at: timestamp
}
```

### Transactions & Payments
```typescript
transactions {
  id: serial PRIMARY KEY
  user_id: varchar → users.id
  type: enum('deposit','withdrawal','bet','payout','bonus','referral')
  amount: decimal(15,2)
  description: varchar
  reference_id: varchar NULL
  payout_transaction_id: integer NULL
  status: enum('pending','completed','failed')
  created_at: timestamp
}

payment_requests {
  id: serial PRIMARY KEY
  user_id: varchar → users.id
  request_type: enum('deposit','withdrawal')
  amount: decimal(15,2)
  payment_method: varchar
  payment_details: jsonb
  status: enum('pending','approved','rejected')
  admin_notes: text NULL
  screenshot_url: varchar NULL
  created_at: timestamp
  updated_at: timestamp
}
```

### Partner System
```typescript
partners {
  id: serial PRIMARY KEY
  username: varchar UNIQUE
  password_hash: varchar
  balance: decimal(15,2) DEFAULT 0
  share_percentage: decimal(5,2) DEFAULT 50.00
  commission_rate: decimal(5,2) DEFAULT 10.00
  status: enum('active','suspended') DEFAULT 'active'
  created_at: timestamp
}

partner_game_earnings {
  id: serial PRIMARY KEY
  partner_id: integer → partners.id
  game_id: varchar → game_sessions.game_id
  total_bets_in_game: decimal(15,2)
  total_payouts_in_game: decimal(15,2)
  house_profit: decimal(15,2)
  partner_share: decimal(15,2)
  commission: decimal(15,2)
  net_partner_earning: decimal(15,2)
  created_at: timestamp
}

partner_withdrawal_requests {
  id: serial PRIMARY KEY
  partner_id: integer → partners.id
  amount: decimal(15,2)
  payment_method: varchar
  payment_details: jsonb
  status: enum('pending','approved','rejected')
  admin_notes: text NULL
  created_at: timestamp
  updated_at: timestamp
}
```

### Bonus & Referral System
```typescript
user_bonuses {
  id: serial PRIMARY KEY
  user_id: varchar → users.id
  bonus_type: enum('deposit','referral')
  amount: decimal(15,2)
  wagering_requirement: decimal(15,2)
  wagering_completed: decimal(15,2) DEFAULT 0
  status: enum('pending','active','completed','expired')
  expires_at: timestamp NULL
  created_at: timestamp
  updated_at: timestamp
}

user_referrals {
  id: serial PRIMARY KEY
  referrer_id: varchar → users.id
  referred_id: varchar → users.id
  referral_code: varchar
  bonus_amount: decimal(15,2) DEFAULT 0
  bonus_status: enum('pending','credited','cancelled')
  created_at: timestamp
}
```

### WhatsApp Integration
```typescript
whatsapp_messages {
  id: serial PRIMARY KEY
  user_id: varchar → users.id
  message_type: enum('support','payment','bonus')
  phone_number: varchar
  message_text: text
  sent_at: timestamp
  status: enum('pending','sent','failed')
}
```

### Settings & Configuration
```typescript
game_settings {
  id: serial PRIMARY KEY
  key: varchar UNIQUE
  value: text
  updated_at: timestamp
}

admin_users {
  id: serial PRIMARY KEY
  username: varchar UNIQUE
  password_hash: varchar
  role: enum('super_admin','admin','moderator')
  created_at: timestamp
}
```

---

# 🏗️ PHASE 1: INFRASTRUCTURE & DATABASE

## Duration: Week 1 (7 days)

### Day 1-2: VPS Setup & Docker Installation

#### Files to Create:
```
scripts/
├── setup-vps.sh (VPS initial setup)
├── install-docker.sh (Docker + Docker Compose)
└── generate-secrets.sh (Generate secure passwords/keys)
```

#### `scripts/setup-vps.sh` (Lines: ~150)
```bash
#!/bin/bash
# Complete VPS setup script

set -e

echo "🚀 Andar Bahar VPS Setup Starting..."

# 1. Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# 2. Install essential tools
echo "🔧 Installing essential tools..."
sudo apt install -y curl wget git make build-essential

# 3. Install Docker
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# 4. Install Docker Compose
echo "🐳 Installing Docker Compose..."
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 5. Setup firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw allow 1935/tcp    # RTMP
sudo ufw allow 3000/tcp    # Frontend (dev)
sudo ufw allow 5000/tcp    # Backend (dev)
sudo ufw --force enable

# 6. Create swap space (if needed)
if [ $(free -m | awk '/^Swap:/ {print $2}') -eq 0 ]; then
  echo "💾 Creating swap space..."
  sudo fallocate -l 4G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# 7. Install Node.js (for migration scripts)
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 8. Verify installations
echo "✅ Verifying installations..."
docker --version
docker-compose --version
node --version
npm --version

echo "✅ VPS Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Clone your repository"
echo "2. Run: ./scripts/generate-secrets.sh"
echo "3. Edit .env file"
echo "4. Run: make start"
```

#### `scripts/generate-secrets.sh` (Lines: ~100)
```bash
#!/bin/bash
# Generate all secrets and create .env file

set -e

echo "🔐 Generating secure secrets..."

# Generate secrets
DB_PASSWORD=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32)
REDIS_PASSWORD=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32)
JWT_SECRET=$(openssl rand -base64 64 | tr -dc 'a-zA-Z0-9' | head -c 64)

# Create .env file
cat > .env << EOF
# Database Configuration
DB_HOST=database
DB_PORT=5432
DB_NAME=andar_bahar
DB_USER=postgres
DB_PASSWORD=${DB_PASSWORD}

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}

# JWT Configuration
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Backend Configuration
NODE_ENV=production
PORT=5000

# Frontend URLs (Update with your domain)
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
VITE_STREAM_URL=http://localhost:8080

# WhatsApp Configuration
WHATSAPP_ADMIN_NUMBER=+919876543210
WHATSAPP_SUPPORT_NUMBER=+919876543210

# Domain (for SSL)
DOMAIN=localhost

# Supabase (for migration only)
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
EOF

echo "✅ Secrets generated and saved to .env"
echo ""
echo "⚠️  IMPORTANT: Edit .env file and update:"
echo "  - VITE_API_URL (your domain)"
echo "  - VITE_WS_URL (your domain)"
echo "  - VITE_STREAM_URL (your domain)"
echo "  - WHATSAPP_ADMIN_NUMBER"
echo "  - WHATSAPP_SUPPORT_NUMBER"
echo "  - DOMAIN (your domain)"
echo "  - SUPABASE_URL (for migration)"
echo "  - SUPABASE_SERVICE_KEY (for migration)"
```

### Day 3-4: Database Schema Creation

#### Files to Create:
```
database/
├── Dockerfile
├── init.sql (complete schema)
├── seed.sql (sample data)
├── migrations/
│   ├── 001_create_users_table.sql
│   ├── 002_create_game_tables.sql
│   ├── 003_create_transaction_tables.sql
│   ├── 004_create_partner_tables.sql
│   ├── 005_create_bonus_tables.sql
│   ├── 006_create_indexes.sql
│   └── 007_create_functions.sql
└── scripts/
    ├── migrate.sh
    └── backup.sh
```

#### `database/init.sql` (Lines: ~500, split into files)

**File: `database/migrations/001_create_users_table.sql`** (Lines: ~80)
```sql
-- Users and Authentication Tables

CREATE TYPE user_status AS ENUM ('active', 'suspended');

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(20) PRIMARY KEY, -- Phone number as ID
  phone VARCHAR(20) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  balance DECIMAL(15,2) NOT NULL DEFAULT 100000.00,
  
  -- Referral System
  referral_code VARCHAR(50), -- Code used by this user
  referral_code_generated VARCHAR(50) UNIQUE, -- Unique code for others
  
  -- Bonus System
  deposit_bonus_available DECIMAL(15,2) DEFAULT 0.00,
  referral_bonus_available DECIMAL(15,2) DEFAULT 0.00,
  wagering_requirement DECIMAL(15,2) DEFAULT 0.00,
  wagering_completed DECIMAL(15,2) DEFAULT 0.00,
  bonus_locked BOOLEAN DEFAULT FALSE,
  
  -- User Info
  status user_status DEFAULT 'active',
  full_name VARCHAR(255),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_referral_code ON users(referral_code_generated);
CREATE INDEX idx_users_status ON users(status);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_username ON admin_users(username);
```

**File: `database/migrations/002_create_game_tables.sql`** (Lines: ~120)
```sql
-- Game Management Tables

CREATE TYPE game_status AS ENUM ('waiting', 'betting', 'dealing', 'completed');
CREATE TYPE game_side AS ENUM ('andar', 'bahar');
CREATE TYPE bet_status AS ENUM ('pending', 'won', 'lost', 'refunded');

-- Game Sessions (Active Games)
CREATE TABLE IF NOT EXISTS game_sessions (
  id SERIAL PRIMARY KEY,
  game_id VARCHAR(50) NOT NULL UNIQUE,
  status game_status DEFAULT 'waiting',
  
  -- Game State
  opening_card VARCHAR(10),
  winner game_side,
  winning_card VARCHAR(10),
  current_round INTEGER DEFAULT 1,
  andar_cards TEXT[] DEFAULT '{}',
  bahar_cards TEXT[] DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX idx_game_sessions_game_id ON game_sessions(game_id);
CREATE INDEX idx_game_sessions_status ON game_sessions(status);
CREATE INDEX idx_game_sessions_created_at ON game_sessions(created_at DESC);

-- Player Bets
CREATE TABLE IF NOT EXISTS player_bets (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(20) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id VARCHAR(50) NOT NULL,
  
  -- Bet Details
  side game_side NOT NULL,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  round INTEGER DEFAULT 1,
  
  -- Payout
  payout DECIMAL(15,2) DEFAULT 0.00,
  status bet_status DEFAULT 'pending',
  payout_transaction_id INTEGER,
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_player_bets_user_id ON player_bets(user_id);
CREATE INDEX idx_player_bets_game_id ON player_bets(game_id);
CREATE INDEX idx_player_bets_status ON player_bets(status);
CREATE INDEX idx_player_bets_created_at ON player_bets(created_at DESC);

-- Game History (Completed Games)
CREATE TABLE IF NOT EXISTS game_history (
  id SERIAL PRIMARY KEY,
  game_id VARCHAR(50) NOT NULL UNIQUE,
  
  -- Game Result
  opening_card VARCHAR(10) NOT NULL,
  winner game_side NOT NULL,
  winning_card VARCHAR(10) NOT NULL,
  total_rounds INTEGER NOT NULL,
  andar_cards TEXT[] NOT NULL,
  bahar_cards TEXT[] NOT NULL,
  
  -- Financial Summary
  total_bets DECIMAL(15,2) DEFAULT 0.00,
  total_payouts DECIMAL(15,2) DEFAULT 0.00,
  net_house_profit DECIMAL(15,2) DEFAULT 0.00,
  
  -- Timestamp
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_game_history_game_id ON game_history(game_id);
CREATE INDEX idx_game_history_completed_at ON game_history(completed_at DESC);

-- Game Statistics (Per User)
CREATE TABLE IF NOT EXISTS game_statistics (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(20) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Stats
  total_games_played INTEGER DEFAULT 0,
  total_games_won INTEGER DEFAULT 0,
  total_games_lost INTEGER DEFAULT 0,
  total_amount_bet DECIMAL(15,2) DEFAULT 0.00,
  total_amount_won DECIMAL(15,2) DEFAULT 0.00,
  win_rate DECIMAL(5,2) DEFAULT 0.00,
  favorite_side game_side,
  
  -- Timestamps
  last_played TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_game_statistics_user_id ON game_statistics(user_id);

CREATE TRIGGER update_game_statistics_updated_at
  BEFORE UPDATE ON game_statistics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**File: `database/migrations/003_create_transaction_tables.sql`** (Lines: ~100)
```sql
-- Transaction and Payment Tables

CREATE TYPE transaction_type AS ENUM (
  'deposit', 
  'withdrawal', 
  'bet', 
  'payout', 
  'bonus', 
  'referral',
  'partner_earning',
  'partner_withdrawal'
);

CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed');
CREATE TYPE payment_status AS ENUM ('pending', 'approved', 'rejected');

-- Transactions (All financial movements)
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(20) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Transaction Details
  type transaction_type NOT NULL,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  description VARCHAR(500),
  
  -- References
  reference_id VARCHAR(100), -- Game ID, Bet ID, etc.
  payout_transaction_id INTEGER,
  
  -- Status
  status transaction_status DEFAULT 'completed',
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_reference_id ON transactions(reference_id);

-- Payment Requests (Deposits & Withdrawals)
CREATE TABLE IF NOT EXISTS payment_requests (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(20) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Request Details
  request_type VARCHAR(20) NOT NULL CHECK (request_type IN ('deposit', 'withdrawal')),
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  
  -- Payment Info
  payment_method VARCHAR(50) NOT NULL,
  payment_details JSONB NOT NULL,
  screenshot_url VARCHAR(500),
  
  -- Admin Review
  status payment_status DEFAULT 'pending',
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payment_requests_user_id ON payment_requests(user_id);
CREATE INDEX idx_payment_requests_status ON payment_requests(status);
CREATE INDEX idx_payment_requests_type ON payment_requests(request_type);
CREATE INDEX idx_payment_requests_created_at ON payment_requests(created_at DESC);

CREATE TRIGGER update_payment_requests_updated_at
  BEFORE UPDATE ON payment_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**File: `database/migrations/004_create_partner_tables.sql`** (Lines: ~100)
```sql
-- Partner System Tables

CREATE TYPE partner_status AS ENUM ('active', 'suspended');

-- Partners
CREATE TABLE IF NOT EXISTS partners (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  
  -- Financial
  balance DECIMAL(15,2) DEFAULT 0.00,
  share_percentage DECIMAL(5,2) DEFAULT 50.00 CHECK (share_percentage >= 0 AND share_percentage <= 100),
  commission_rate DECIMAL(5,2) DEFAULT 10.00 CHECK (commission_rate >= 0 AND commission_rate <= 100),
  
  -- Status
  status partner_status DEFAULT 'active',
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_partners_username ON partners(username);
CREATE INDEX idx_partners_status ON partners(status);

-- Partner Game Earnings (Per Game)
CREATE TABLE IF NOT EXISTS partner_game_earnings (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  game_id VARCHAR(50) NOT NULL,
  
  -- Game Financials
  total_bets_in_game DECIMAL(15,2) DEFAULT 0.00,
  total_payouts_in_game DECIMAL(15,2) DEFAULT 0.00,
  house_profit DECIMAL(15,2) DEFAULT 0.00,
  
  -- Partner Earnings
  partner_share DECIMAL(15,2) DEFAULT 0.00,
  commission DECIMAL(15,2) DEFAULT 0.00,
  net_partner_earning DECIMAL(15,2) DEFAULT 0.00,
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_partner_game_earnings_partner_id ON partner_game_earnings(partner_id);
CREATE INDEX idx_partner_game_earnings_game_id ON partner_game_earnings(game_id);
CREATE INDEX idx_partner_game_earnings_created_at ON partner_game_earnings(created_at DESC);

-- Partner Withdrawal Requests
CREATE TABLE IF NOT EXISTS partner_withdrawal_requests (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  
  -- Request Details
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  payment_method VARCHAR(50) NOT NULL,
  payment_details JSONB NOT NULL,
  
  -- Admin Review
  status payment_status DEFAULT 'pending',
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_partner_withdrawal_requests_partner_id ON partner_withdrawal_requests(partner_id);
CREATE INDEX idx_partner_withdrawal_requests_status ON partner_withdrawal_requests(status);
CREATE INDEX idx_partner_withdrawal_requests_created_at ON partner_withdrawal_requests(created_at DESC);

CREATE TRIGGER update_partner_withdrawal_requests_updated_at
  BEFORE UPDATE ON partner_withdrawal_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**File: `database/migrations/005_create_bonus_tables.sql`** (Lines: ~80)
```sql
-- Bonus and Referral System Tables

CREATE TYPE bonus_type AS ENUM ('deposit', 'referral');
CREATE TYPE bonus_status AS ENUM ('pending', 'active', 'completed', 'expired');

-- User Bonuses
CREATE TABLE IF NOT EXISTS user_bonuses (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(20) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Bonus Details
  bonus_type bonus_type NOT NULL,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  
  -- Wagering Requirements
  wagering_requirement DECIMAL(15,2) NOT NULL,
  wagering_completed DECIMAL(15,2) DEFAULT 0.00,
  
  -- Status
  status bonus_status DEFAULT 'pending',
  expires_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_bonuses_user_id ON user_bonuses(user_id);
CREATE INDEX idx_user_bonuses_status ON user_bonuses(status);
CREATE INDEX idx_user_bonuses_type ON user_bonuses(bonus_type);

CREATE TRIGGER update_user_bonuses_updated_at
  BEFORE UPDATE ON user_bonuses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- User Referrals
CREATE TABLE IF NOT EXISTS user_referrals (
  id SERIAL PRIMARY KEY,
  referrer_id VARCHAR(20) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_id VARCHAR(20) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Referral Details
  referral_code VARCHAR(50) NOT NULL,
  bonus_amount DECIMAL(15,2) DEFAULT 0.00,
  bonus_status VARCHAR(20) DEFAULT 'pending',
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure unique referral
  UNIQUE(referrer_id, referred_id)
);

CREATE INDEX idx_user_referrals_referrer_id ON user_referrals(referrer_id);
CREATE INDEX idx_user_referrals_referred_id ON user_referrals(referred_id);
CREATE INDEX idx_user_referrals_code ON user_referrals(referral_code);
```

**File: `database/migrations/006_create_indexes.sql`** (Lines: ~60)
```sql
-- Additional Performance Indexes

-- Composite indexes for common queries
CREATE INDEX idx_player_bets_user_game ON player_bets(user_id, game_id);
CREATE INDEX idx_player_bets_game_status ON player_bets(game_id, status);
CREATE INDEX idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX idx_transactions_user_created ON transactions(user_id, created_at DESC);

-- Partial indexes for active records
CREATE INDEX idx_game_sessions_active ON game_sessions(status) 
  WHERE status IN ('waiting', 'betting', 'dealing');

CREATE INDEX idx_payment_requests_pending ON payment_requests(status, created_at DESC) 
  WHERE status = 'pending';

CREATE INDEX idx_partner_withdrawal_pending ON partner_withdrawal_requests(status, created_at DESC) 
  WHERE status = 'pending';

-- Full-text search indexes
CREATE INDEX idx_users_phone_trgm ON users USING gin(phone gin_trgm_ops);
CREATE INDEX idx_admin_username_trgm ON admin_users USING gin(username gin_trgm_ops);

-- Enable trigram extension for text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

**File: `database/migrations/007_create_functions.sql`** (Lines: ~400)
```sql
-- Database Functions and Triggers

-- Function: Deduct balance atomically with retry logic
CREATE OR REPLACE FUNCTION deduct_balance_atomic(
  p_user_id VARCHAR(20),
  p_amount DECIMAL(15,2)
) RETURNS DECIMAL(15,2) AS $$
DECLARE
  v_current_balance DECIMAL(15,2);
  v_new_balance DECIMAL(15,2);
  v_rows_affected INTEGER;
BEGIN
  -- Get current balance with row lock
  SELECT balance INTO v_current_balance
  FROM users
  WHERE id = p_user_id
  FOR UPDATE;
  
  -- Check sufficient balance
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance: current=%, required=%', v_current_balance, p_amount;
  END IF;
  
  -- Calculate new balance
  v_new_balance := v_current_balance - p_amount;
  
  -- Update balance with optimistic locking
  UPDATE users
  SET balance = v_new_balance,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = p_user_id
    AND balance = v_current_balance;
  
  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
  
  IF v_rows_affected = 0 THEN
    RAISE EXCEPTION 'Balance update failed - concurrent modification detected';
  END IF;
  
  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql;

-- Function: Add balance atomically
CREATE OR REPLACE FUNCTION add_balance_atomic(
  p_user_id VARCHAR(20),
  p_amount DECIMAL(15,2)
) RETURNS DECIMAL(15,2) AS $$
DECLARE
  v_current_balance DECIMAL(15,2);
  v_new_balance DECIMAL(15,2);
BEGIN
  -- Get current balance with row lock
  SELECT balance INTO v_current_balance
  FROM users
  WHERE id = p_user_id
  FOR UPDATE;
  
  -- Calculate new balance
  v_new_balance := v_current_balance + p_amount;
  
  -- Update balance
  UPDATE users
  SET balance = v_new_balance,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = p_user_id;
  
  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate game payout based on Andar Bahar rules
CREATE OR REPLACE FUNCTION calculate_game_payout(
  p_side game_side,
  p_winner game_side,
  p_round INTEGER,
  p_bet_amount DECIMAL(15,2)
) RETURNS DECIMAL(15,2) AS $$
DECLARE
  v_payout DECIMAL(15,2);
BEGIN
  -- Loss - no payout
  IF p_side != p_winner THEN
    RETURN 0.00;
  END IF;
  
  -- Round 1: Andar wins 1:1, Bahar gets refund only
  IF p_round = 1 THEN
    IF p_side = 'andar' THEN
      v_payout := p_bet_amount * 2; -- 1:1 = original + winnings
    ELSE
      v_payout := p_bet_amount; -- Refund only
    END IF;
  
  -- Round 2+: Winner side gets 1:1
  ELSE
    v_payout := p_bet_amount * 2; -- 1:1
  END IF;
  
  RETURN v_payout;
END;
$$ LANGUAGE plpgsql;

-- Function: Process game completion
CREATE OR REPLACE FUNCTION process_game_completion(
  p_game_id VARCHAR(50),
  p_winner game_side,
  p_winning_card VARCHAR(10),
  p_total_rounds INTEGER
) RETURNS VOID AS $$
DECLARE
  v_bet_record RECORD;
  v_payout DECIMAL(15,2);
  v_transaction_id INTEGER;
  v_total_bets DECIMAL(15,2) := 0;
  v_total_payouts DECIMAL(15,2) := 0;
  v_opening_card VARCHAR(10);
  v_andar_cards TEXT[];
  v_bahar_cards TEXT[];
BEGIN
  -- Get game details
  SELECT opening_card, andar_cards, bahar_cards
  INTO v_opening_card, v_andar_cards, v_bahar_cards
  FROM game_sessions
  WHERE game_id = p_game_id;
  
  -- Process each bet
  FOR v_bet_record IN
    SELECT id, user_id, side, amount, round
    FROM player_bets
    WHERE game_id = p_game_id
      AND status = 'pending'
  LOOP
    -- Calculate payout
    v_payout := calculate_game_payout(
      v_bet_record.side,
      p_winner,
      v_bet_record.round,
      v_bet_record.amount
    );
    
    -- Update bet status
    IF v_payout > 0 THEN
      -- Create payout transaction
      INSERT INTO transactions (
        user_id,
        type,
        amount,
        description,
        reference_id,
        status
      ) VALUES (
        v_bet_record.user_id,
        'payout',
        v_payout,
        'Game payout for ' || p_game_id,
        p_game_id,
        'completed'
      ) RETURNING id INTO v_transaction_id;
      
      -- Add payout to user balance
      PERFORM add_balance_atomic(v_bet_record.user_id, v_payout);
      
      -- Update bet
      UPDATE player_bets
      SET payout = v_payout,
          status = CASE 
            WHEN v_bet_record.side = p_winner THEN 'won'::bet_status
            ELSE 'refunded'::bet_status
          END,
          payout_transaction_id = v_transaction_id
      WHERE id = v_bet_record.id;
      
      -- Update user statistics
      UPDATE game_statistics
      SET total_games_won = total_games_won + 1,
          total_amount_won = total_amount_won + v_payout,
          total_games_played = total_games_played + 1,
          last_played = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = v_bet_record.user_id;
    ELSE
      -- Bet lost
      UPDATE player_bets
      SET status = 'lost',
          payout = 0.00
      WHERE id = v_bet_record.id;
      
      -- Update user statistics
      UPDATE game_statistics
      SET total_games_lost = total_games_lost + 1,
          total_games_played = total_games_played + 1,
          last_played = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = v_bet_record.user_id;
    END IF;
    
    -- Track totals
    v_total_bets := v_total_bets + v_bet_record.amount;
    v_total_payouts := v_total_payouts + v_payout;
  END LOOP;
  
  -- Update game session
  UPDATE game_sessions
  SET status = 'completed',
      winner = p_winner,
      winning_card = p_winning_card,
      completed_at = CURRENT_TIMESTAMP
  WHERE game_id = p_game_id;
  
  -- Move to game history
  INSERT INTO game_history (
    game_id,
    opening_card,
    winner,
    winning_card,
    total_rounds,
    andar_cards,
    bahar_cards,
    total_bets,
    total_payouts,
    net_house_profit,
    completed_at
  ) VALUES (
    p_game_id,
    v_opening_card,
    p_winner,
    p_winning_card,
    p_total_rounds,
    v_andar_cards,
    v_bahar_cards,
    v_total_bets,
    v_total_payouts,
    v_total_bets - v_total_payouts,
    CURRENT_TIMESTAMP
  );
  
  -- Calculate partner earnings
  PERFORM calculate_partner_earnings(p_game_id, v_total_bets, v_total_payouts);
  
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate partner earnings
CREATE OR REPLACE FUNCTION calculate_partner_earnings(
  p_game_id VARCHAR(50),
  p_total_bets DECIMAL(15,2),
  p_total_payouts DECIMAL(15,2)
) RETURNS VOID AS $$
DECLARE
  v_partner RECORD;
  v_house_profit DECIMAL(15,2);
  v_partner_share DECIMAL(15,2);
  v_commission DECIMAL(15,2);
  v_net_earning DECIMAL(15,2);
BEGIN
  -- Calculate house profit
  v_house_profit := p_total_bets - p_total_payouts;
  
  -- Skip if house lost money
  IF v_house_profit <= 0 THEN
    RETURN;
  END IF;
  
  -- Calculate for each active partner
  FOR v_partner IN
    SELECT id, share_percentage, commission_rate
    FROM partners
    WHERE status = 'active'
  LOOP
    -- Partner share = house profit * share percentage
    v_partner_share := v_house_profit * (v_partner.share_percentage / 100);
    
    -- Commission = partner share * commission rate
    v_commission := v_partner_share * (v_partner.commission_rate / 100);
    
    -- Net earning = partner share - commission
    v_net_earning := v_partner_share - v_commission;
    
    -- Record earning
    INSERT INTO partner_game_earnings (
      partner_id,
      game_id,
      total_bets_in_game,
      total_payouts_in_game,
      house_profit,
      partner_share,
      commission,
      net_partner_earning
    ) VALUES (
      v_partner.id,
      p_game_id,
      p_total_bets,
      p_total_payouts,
      v_house_profit,
      v_partner_share,
      v_commission,
      v_net_earning
    );
    
    -- Add to partner balance
    UPDATE partners
    SET balance = balance + v_net_earning
    WHERE id = v_partner.id;
    
    -- Create transaction record
    INSERT INTO transactions (
      user_id,
      type,
      amount,
      description,
      reference_id,
      status
    ) VALUES (
      'partner_' || v_partner.id::TEXT,
      'partner_earning',
      v_net_earning,
      'Partner earning from game ' || p_game_id,
      p_game_id,
      'completed'
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function: Generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS VARCHAR(50) AS $$
DECLARE
  v_code VARCHAR(50);
  v_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8-character alphanumeric code
    v_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    
    -- Check if exists
    SELECT EXISTS(
      SELECT 1 FROM users WHERE referral_code_generated = v_code
    ) INTO v_exists;
    
    EXIT WHEN NOT v_exists;
  END LOOP;
  
  RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-generate referral code on user creation
CREATE OR REPLACE FUNCTION trigger_generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code_generated IS NULL THEN
    NEW.referral_code_generated := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_referral_code
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_generate_referral_code();

-- Trigger: Initialize game statistics on user creation
CREATE OR REPLACE FUNCTION trigger_init_game_statistics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO game_statistics (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER init_game_statistics
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_init_game_statistics();
```

#### `database/seed.sql` (Lines: ~150)
```sql
-- Sample Data for Testing

-- Insert admin user (password: admin123)
INSERT INTO admin_users (username, password_hash, role) VALUES
('admin', '$2b$10$YourHashedPasswordHere', 'super_admin');

-- Insert test users (password: password123)
INSERT INTO users (id, phone, password_hash, balance, full_name) VALUES
('+919876543210', '+919876543210', '$2b$10$YourHashedPasswordHere', 100000.00, 'Test User 1'),
('+919876543211', '+919876543211', '$2b$10$YourHashedPasswordHere', 150000.00, 'Test User 2'),
('+919876543212', '+919876543212', '$2b$10$YourHashedPasswordHere', 200000.00, 'Test User 3');

-- Insert test partner (password: partner123)
INSERT INTO partners (username, password_hash, balance, share_percentage, commission_rate) VALUES
('partner1', '$2b$10$YourHashedPasswordHere', 50000.00, 50.00, 10.00);

-- Insert game settings
INSERT INTO game_settings (key, value) VALUES
('stream_url', 'http://localhost:8080/app/stream/playlist.m3u8'),
('min_bet_amount', '100'),
('max_bet_amount', '100000'),
('betting_duration', '30'),
('whatsapp_admin', '+919876543210');
```

### Day 5-7: Data Migration from Supabase

#### Files to Create:
```
scripts/
├── migrate-from-supabase.ts (main migration script)
├── migrate-users.ts (user migration)
├── migrate-games.ts (game data migration)
├── migrate-transactions.ts (transaction migration)
└── verify-migration.ts (verification script)
```

*Migration scripts already documented in previous plan*

**✅ Phase 1 Deliverables:**
- VPS fully configured
- Docker and Docker Compose installed
- PostgreSQL database with complete schema
- All data migrated from Supabase
- Backup and restore scripts working

---

# 🔐 PHASE 2: AUTHENTICATION SYSTEM

## Duration: Week 2, Days 1-3

### Authentication Flow

```
User Registration:
1. User enters phone number
2. Backend checks if phone exists
3. User sets password
4. Optional: User enters referral code
5. Generate unique referral code for user
6. Create user in database with 100k default balance
7. Initialize game statistics
8. Return JWT tokens

User Login:
1. User enters phone + password
2. Backend verifies credentials
3. Return JWT tokens (access + refresh)
4. Frontend stores tokens
5. Redirect to game page

Forget Password:
1. User clicks "Forgot Password"
2. Opens WhatsApp with pre-filled message
3. Admin verifies user and resets password
4. User receives new temporary password

JWT Token Flow:
1. Access token expires in 15 minutes
2. Refresh token expires in 7 days
3. Frontend auto-refreshes using refresh token
4. All API requests include Authorization header
```

### Backend Files

#### File: `backend/src/services/auth.service.ts` (Lines: ~350)

```typescript
// Authentication Service
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../db/connection';
import { users, gameStatistics } from '../db/schema';
import { eq } from 'drizzle-orm';

interface RegisterInput {
  phone: string;
  password: string;
  fullName?: string;
  referralCode?: string;
}

interface LoginInput {
  phone: string;
  password: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface UserPayload {
  userId: string;
  phone: string;
  role: 'user' | 'admin' | 'partner';
}

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET!;
  private readonly ACCESS_TOKEN_EXPIRY = process.env.JWT_EXPIRES_IN || '15m';
  private readonly REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  private readonly SALT_ROUNDS = 10;

  /**
   * Register new user
   */
  async register(input: RegisterInput): Promise<{ user: any; tokens: AuthTokens }> {
    const { phone, password, fullName, referralCode } = input;

    // Validate phone format
    if (!this.isValidPhone(phone)) {
      throw new Error('Invalid phone number format');
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.phone, phone),
    });

    if (existingUser) {
      throw new Error('User with this phone number already exists');
    }

    // Validate referral code if provided
    let referrerId: string | null = null;
    if (referralCode) {
      const referrer = await db.query.users.findFirst({
        where: eq(users.referralCodeGenerated, referralCode),
      });

      if (!referrer) {
        throw new Error('Invalid referral code');
      }
      referrerId = referrer.id;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);

    // Create user (referral code auto-generated by trigger)
    const [newUser] = await db.insert(users).values({
      id: phone, // Phone as ID
      phone,
      passwordHash,
      fullName,
      referralCode: referralCode || null,
      balance: '100000.00', // Default balance
    }).returning();

    // If referral code was used, create referral record
    if (referrerId && referralCode) {
      await this.processReferral(referrerId, newUser.id, referralCode);
    }

    // Generate tokens
    const tokens = this.generateTokens({
      userId: newUser.id,
      phone: newUser.phone,
      role: 'user',
    });

    // Return user without password
    const { passwordHash: _, ...userWithoutPassword } = newUser;

    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  /**
   * Login user
   */
  async login(input: LoginInput): Promise<{ user: any; tokens: AuthTokens }> {
    const { phone, password } = input;

    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.phone, phone),
    });

    if (!user) {
      throw new Error('Invalid phone number or password');
    }

    // Check if user is suspended
    if (user.status === 'suspended') {
      throw new Error('Your account has been suspended. Please contact support.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid phone number or password');
    }

    // Generate tokens
    const tokens = this.generateTokens({
      userId: user.id,
      phone: user.phone,
      role: 'user',
    });

    // Return user without password
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = jwt.verify(refreshToken, this.JWT_SECRET) as UserPayload;

      // Verify user still exists and is active
      const user = await db.query.users.findFirst({
        where: eq(users.id, payload.userId),
      });

      if (!user || user.status === 'suspended') {
        throw new Error('User not found or suspended');
      }

      // Generate new tokens
      return this.generateTokens({
        userId: user.id,
        phone: user.phone,
        role: 'user',
      });
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token: string): Promise<UserPayload> {
    try {
      const payload = jwt.verify(token, this.JWT_SECRET) as UserPayload;
      return payload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Change password
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    // Get user
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isOldPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    // Update password
    await db.update(users)
      .set({ passwordHash: newPasswordHash })
      .where(eq(users.id, userId));
  }

  /**
   * Admin reset password (for forgot password flow)
   */
  async adminResetPassword(phone: string, newPassword: string, adminId: string): Promise<void> {
    // Verify admin
    // ... admin verification logic

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    // Update password
    await db.update(users)
      .set({ passwordHash: newPasswordHash })
      .where(eq(users.phone, phone));
  }

  /**
   * Generate JWT tokens
   */
  private generateTokens(payload: UserPayload): AuthTokens {
    const accessToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
    });

    return { accessToken, refreshToken };
  }

  /**
   * Process referral
   */
  private async processReferral(referrerId: string, referredId: string, referralCode: string): Promise<void> {
    // Create referral record
    await db.insert(userReferrals).values({
      referrerId,
      referredId,
      referralCode,
      bonusAmount: '0', // Bonus credited when referred user makes first deposit
      bonusStatus: 'pending',
    });
  }

  /**
   * Validate phone number format
   */
  private isValidPhone(phone: string): boolean {
    // Indian phone format: +91XXXXXXXXXX (10 digits after +91)
    const phoneRegex = /^\+91[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  }
}

export const authService = new AuthService();
```

#### File: `backend/src/controllers/auth.controller.ts` (Lines: ~200)

```typescript
// Authentication Controller
import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { z } from 'zod';

// Validation schemas
const registerSchema = z.object({
  phone: z.string().regex(/^\+91[6-9]\d{9}$/, 'Invalid Indian phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().optional(),
  referralCode: z.string().optional(),
});

const loginSchema = z.object({
  phone: z.string().regex(/^\+91[6-9]\d{9}$/, 'Invalid Indian phone number'),
  password: z.string().min(1, 'Password is required'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export class AuthController {
  /**
   * POST /api/auth/register
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate input
      const input = registerSchema.parse(req.body);

      // Register user
      const result = await authService.register(input);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate input
      const input = loginSchema.parse(req.body);

      // Login user
      const result = await authService.login(input);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/refresh
   */
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate input
      const { refreshToken } = refreshTokenSchema.parse(req.body);

      // Refresh token
      const tokens = await authService.refreshAccessToken(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: tokens,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/change-password
   */
  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get user from middleware
      const userId = req.user!.userId;

      // Validate input
      const { oldPassword, newPassword } = changePasswordSchema.parse(req.body);

      // Change password
      await authService.changePassword(userId, oldPassword, newPassword);

      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/logout
   */
  async logout(req: Request, res: Response): Promise<void> {
    // With JWT, logout is handled client-side by removing tokens
    // Optionally, implement token blacklisting with Redis
    
    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  }

  /**
   * GET /api/auth/me
   */
  async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;

      // Get user details
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Remove sensitive data
      const { passwordHash, ...userWithoutPassword } = user;

      res.status(200).json({
        success: true,
        data: userWithoutPassword,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
```

#### File: `backend/src/middleware/auth.middleware.ts` (Lines: ~150)

```typescript
// Authentication Middleware
import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        phone: string;
        role: 'user' | 'admin' | 'partner';
      };
    }
  }
}

/**
 * Verify JWT token and attach user to request
 */
export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token required',
      });
      return;
    }

    // Verify token
    const payload = await authService.verifyToken(token);

    // Attach user to request
    req.user = payload;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
}

/**
 * Verify user has required role
 */
export function requireRole(...roles: ('user' | 'admin' | 'partner')[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
}

/**
 * Optional authentication (attach user if token exists)
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (token) {
      const payload = await authService.verifyToken(token);
      req.user = payload;
    }

    next();
  } catch (error) {
    // Ignore errors for optional auth
    next();
  }
}
```

#### File: `backend/src/routes/auth.routes.ts` (Lines: ~50)

```typescript
// Authentication Routes
import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/refresh', authController.refreshToken.bind(authController));

// Protected routes
router.post('/logout', authenticateToken, authController.logout.bind(authController));
router.post('/change-password', authenticateToken, authController.changePassword.bind(authController));
router.get('/me', authenticateToken, authController.getCurrentUser.bind(authController));

export default router;
```

### Frontend Files

#### File: `frontend/src/store/slices/auth.slice.ts` (Lines: ~250)

```typescript
// Authentication State Slice (Zustand)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

interface User {
  id: string;
  phone: string;
  fullName: string | null;
  balance: string;
  referralCodeGenerated: string;
  status: string;
  createdAt: string;
}

interface AuthState {
  // State
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (phone: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

interface RegisterData {
  phone: string;
  password: string;
  fullName?: string;
  referralCode?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      // Login
      login: async (phone: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await axios.post(`${API_URL}/api/auth/login`, {
            phone,
            password,
          });

          const { user, tokens } = response.data.data;

          set({
            user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.response?.data?.message || 'Login failed');
        }
      },

      // Register
      register: async (data: RegisterData) => {
        set({ isLoading: true });
        try {
          const response = await axios.post(`${API_URL}/api/auth/register`, data);

          const { user, tokens } = response.data.data;

          set({
            user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.response?.data?.message || 'Registration failed');
        }
      },

      // Logout
      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      // Refresh access token
      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        try {
          const response = await axios.post(`${API_URL}/api/auth/refresh`, {
            refreshToken,
          });

          const tokens = response.data.data;

          set({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          });
        } catch (error) {
          // If refresh fails, logout user
          get().logout();
          throw new Error('Session expired. Please login again.');
        }
      },

      // Get current user
      getCurrentUser: async () => {
        const { accessToken } = get();
        if (!accessToken) return;

        try {
          const response = await axios.get(`${API_URL}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          set({ user: response.data.data });
        } catch (error) {
          console.error('Failed to get current user:', error);
        }
      },

      // Change password
      changePassword: async (oldPassword: string, newPassword: string) => {
        const { accessToken } = get();
        if (!accessToken) {
          throw new Error('Not authenticated');
        }

        try {
          await axios.post(
            `${API_URL}/api/auth/change-password`,
            { oldPassword, newPassword },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
        } catch (error: any) {
          throw new Error(error.response?.data?.message || 'Password change failed');
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

#### File: `frontend/src/pages/Login.tsx` (Lines: ~300)

```typescript
// Login Page Component
import { useState } from 'react';
import { useNavigate, Link } from 'wouter';
import { useAuthStore } from '../store/slices/auth.slice';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, Phone, Lock, MessageCircle } from 'lucide-react';

export function Login() {
  const [, navigate] = useNavigate();
  const { login, isLoading } = useAuthStore();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate inputs
    if (!phone || !password) {
      setError('Please enter phone number and password');
      return;
    }

    // Validate phone format
    const phoneRegex = /^\+91[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      setError('Invalid phone number format. Use: +91XXXXXXXXXX');
      return;
    }

    try {
      await login(phone, password);
      navigate('/game');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const handleForgotPassword = () => {
    const message = encodeURIComponent(
      `Hi, I forgot my password for phone number: ${phone || '[Your Phone]'}. Please help me reset it.`
    );
    const whatsappUrl = `https://wa.me/${process.env.VITE_WHATSAPP_ADMIN_NUMBER}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-4">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 3 + 1 + 'px',
                height: Math.random() * 3 + 1 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                animation: `twinkle ${Math.random() * 3 + 2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-white">RA</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Login to continue playing Andar Bahar
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+919876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-gray-500">Format: +91XXXXXXXXXX</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-xs text-blue-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-blue-500 hover:underline flex items-center gap-1"
              >
                <MessageCircle className="h-3 w-3" />
                Forgot Password?
              </button>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>

            <div className="text-sm text-center text-gray-600">
              Don't have an account?{' '}
              <Link href="/signup" className="text-blue-500 hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
```

#### File: `frontend/src/pages/Signup.tsx` (Lines: ~350)

```typescript
// Signup Page Component
import { useState } from 'react';
import { useNavigate, Link } from 'wouter';
import { useAuthStore } from '../store/slices/auth.slice';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, Phone, Lock, User, Gift } from 'lucide-react';

export function Signup() {
  const [, navigate] = useNavigate();
  const { register, isLoading } = useAuthStore();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate inputs
    if (!phone || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate phone format
    const phoneRegex = /^\+91[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      setError('Invalid phone number format. Use: +91XXXXXXXXXX');
      return;
    }

    // Validate password
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await register({
        phone,
        password,
        fullName: fullName || undefined,
        referralCode: referralCode || undefined,
      });
      navigate('/game');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-4">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 3 + 1 + 'px',
                height: Math.random() * 3 + 1 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                animation: `twinkle ${Math.random() * 3 + 2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-white">RA</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Join and get ₹1,00,000 welcome bonus!
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+919876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  required
                />
              </div>
              <p className="text-xs text-gray-500">Format: +91XXXXXXXXXX</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name (Optional)</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-xs text-blue-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="referralCode">Referral Code (Optional)</Label>
              <div className="relative">
                <Gift className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="referralCode"
                  type="text"
                  placeholder="Enter referral code"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-green-600">
                Get bonus when you make your first deposit!
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>

            <div className="text-sm text-center text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-500 hover:underline">
                Login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
```

**✅ Phase 2 Deliverables:**
- Complete authentication system (register, login, logout, refresh)
- JWT token management
- Frontend login/signup pages
- Password change functionality
- Forgot password via WhatsApp
- Token auto-refresh mechanism
- Protected route middleware

---

*[Due to character limit, I'll continue with remaining phases in next response. This document is already over 20,000 lines when complete. Should I continue with remaining phases 3-12?]*