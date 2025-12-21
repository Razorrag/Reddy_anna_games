# 🚀 Complete Deployment & Testing Guide

## 📋 Table of Contents
1. [Local Testing Setup](#local-testing-setup)
2. [Docker Deployment](#docker-deployment)
3. [Free VPS Options](#free-vps-options)
4. [Testing the Bonus System](#testing-the-bonus-system)
5. [Troubleshooting](#troubleshooting)

---

## 🔧 Local Testing Setup

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (or use Docker)
- Git

### Step 1: Install Dependencies

```bash
# Install all dependencies
npm install

# Or install workspace dependencies
cd backend && npm install
cd ../frontend && npm install
```

### Step 2: Setup Environment Variables

Create `.env` file in `backend` directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/reddy_anna
DIRECT_URL=postgresql://user:password@localhost:5432/reddy_anna

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173

# Payment (optional for testing)
WHATSAPP_PAYMENT_NUMBER=+919876543210
PAYMENT_UPI_ID=payment@upi
```

Create `.env` file in `frontend` directory:

```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000
```

### Step 3: Run Database Migration

```bash
# Navigate to backend
cd backend

# Run migration to add bonus linking
npm run db:migrate

# Or manually run SQL
psql -d your_database < src/db/migrations/0002_add_bonus_linking_and_locked_state.sql
```

### Step 4: Start Development Servers

**Option A: Run Both Together**
```bash
# From root directory
npm run dev
```

**Option B: Run Separately**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

**Access the Application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

---

## 🐳 Docker Deployment

### Step 1: Check Docker Files

Ensure you have these files in your project root:
- `docker-compose.yml`
- `docker-compose.prod.yml`
- `Dockerfile` (if using custom builds)

### Step 2: Build and Run with Docker

**Development Mode:**
```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Production Mode:**
```bash
# Build and start production services
docker-compose -f docker-compose.prod.yml up --build -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

### Step 3: Run Migration in Docker

```bash
# Access the backend container
docker-compose exec backend sh

# Inside container, run migration
npm run db:migrate

# Or run SQL directly
psql $DATABASE_URL -f src/db/migrations/0002_add_bonus_linking_and_locked_state.sql

# Exit container
exit
```

### Step 4: Access Application

- Frontend: http://localhost:80 (or configured port)
- Backend API: http://localhost:3000
- Database: localhost:5432

---

## 🆓 Free VPS Options for Testing

### Option 1: Oracle Cloud (FREE FOREVER - BEST OPTION)
**Specifications:**
- 2 VMs with 1 GB RAM each OR 1 VM with 2 GB RAM
- 200 GB storage
- 10 TB bandwidth/month
- ARM-based processors

**Setup Steps:**
1. Go to https://www.oracle.com/cloud/free/
2. Create account (requires credit card for verification, but won't charge)
3. Create a Compute Instance
4. Choose Ubuntu 22.04 LTS
5. Select "Always Free" tier
6. Download SSH key

**Deploy Docker:**
```bash
# SSH into server
ssh -i your-key.pem ubuntu@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose -y

# Clone your repository
git clone https://github.com/yourusername/reddy_anna.git
cd reddy_anna

# Create .env files (copy content from above)
nano backend/.env
nano frontend/.env

# Run Docker
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose logs -f
```

**Open Ports:**
```bash
# In Oracle Cloud Console, add Ingress Rules:
- Port 80 (HTTP)
- Port 443 (HTTPS)
- Port 3000 (Backend API)

# In Ubuntu firewall:
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw enable
```

### Option 2: Google Cloud Platform (FREE for 3 months)
**Free Tier:**
- $300 credit for 90 days
- 1 f1-micro instance (0.6 GB RAM)
- 30 GB storage

**Setup:** Similar to Oracle Cloud

### Option 3: AWS Free Tier (FREE for 12 months)
**Free Tier:**
- t2.micro instance (1 GB RAM)
- 30 GB storage
- 750 hours/month for 12 months

**Setup:** Similar to Oracle Cloud

### Option 4: Render.com (FREE with limitations)
**Free Tier:**
- 750 hours/month
- Spins down after 15 minutes of inactivity
- 512 MB RAM

**Setup:**
1. Go to https://render.com
2. Connect GitHub repository
3. Create Web Service for backend
4. Create Static Site for frontend
5. Create PostgreSQL database (free tier)

### Option 5: Railway.app (FREE $5/month credit)
**Free Tier:**
- $5 monthly credit
- Good for small apps

**Setup:**
1. Go to https://railway.app
2. Connect GitHub
3. Deploy from repo
4. Add PostgreSQL database

---

## 🧪 Testing the Bonus System

### Test Scenario 1: Signup Bonus (₹100)

**Steps:**
1. Open frontend: http://localhost:5173
2. Click "Sign Up"
3. Fill in details (don't use referral code yet)
4. Submit registration
5. Login with new credentials
6. Check wallet - should show ₹100 signup bonus

**Expected Result:**
- User receives ₹100 signup bonus
- Bonus status: 'active'
- Wagering requirement: ₹1000 (10× bonus)

### Test Scenario 2: Referral Bonus with Deposit Linking

**Setup:**
1. Create User A (Referrer)
2. Get User A's referral code from profile
3. Create User B using User A's referral code

**Steps:**

**Part 1: Create Deposit & Referral Bonus**
1. Login as User B
2. Go to Wallet → Deposit
3. Request deposit of ₹10,000
4. Upload payment screenshot
5. Login as Admin
6. Go to Admin → Deposits
7. Approve User B's deposit

**Expected Result:**
- User B gets ₹500 deposit bonus (status: 'active')
- User A gets ₹500 referral bonus (status: 'locked') ← **KEY DIFFERENCE**
- Referral bonus should show "Locked - waiting for deposit bonus completion"

**Part 2: Complete Deposit Bonus Wagering**
1. Login as User B
2. Go to Game Room
3. Place bets totaling ₹3,000 (30% of ₹10,000)
4. Complete wagering requirement

**Expected Result:**
- User B's deposit bonus status: 'active' → 'completed'
- ₹500 credited to User B's balance
- **User A's referral bonus status: 'locked' → 'active'** ← **AUTO-UNLOCK**

**Part 3: Complete Referral Bonus Wagering**
1. Login as User A
2. Check bonuses - referral bonus should now be 'active'
3. Place bets totaling ₹15,000 (30× ₹500)
4. Complete wagering

**Expected Result:**
- User A's referral bonus status: 'active' → 'completed'
- ₹500 credited to User A's balance

### Test Scenario 3: FIFO Bonus Processing

**Setup:**
1. User with multiple bonuses

**Steps:**
1. Create signup bonus (oldest)
2. Create deposit bonus
3. Create referral bonus (newest)
4. Place bets

**Expected Result:**
- Wagering should apply to signup bonus first (FIFO)
- Then deposit bonus
- Finally referral bonus

### Test Scenario 4: Database Trigger Verification

**Verify Auto-Unlock:**
```sql
-- Check locked referral bonuses
SELECT * FROM user_bonuses 
WHERE bonus_type = 'referral' 
AND status = 'locked';

-- Check linked deposit bonus
SELECT * FROM user_bonuses 
WHERE id = 'deposit_bonus_id'
AND status = 'completed';

-- Verify trigger unlocked referral bonus
SELECT * FROM user_bonuses 
WHERE linked_bonus_id = 'deposit_bonus_id'
AND status = 'active'; -- Should be changed from 'locked'
```

---

## 🐛 Troubleshooting

### Issue 1: Migration Fails

**Error:** "Column already exists"

**Solution:**
```sql
-- Check if column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'user_bonuses' 
AND column_name = 'linked_bonus_id';

-- If exists, skip migration or manually add missing parts
```

### Issue 2: Backend Won't Start

**Error:** "Port 3000 already in use"

**Solution:**
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port in .env
PORT=3001
```

### Issue 3: Database Connection Failed

**Error:** "Connection refused"

**Solution:**
```bash
# Check PostgreSQL is running
sudo service postgresql status

# Start if not running
sudo service postgresql start

# Check connection string in .env
DATABASE_URL=postgresql://user:password@localhost:5432/reddy_anna
```

### Issue 4: Docker Container Crashes

**Solution:**
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Restart specific service
docker-compose restart backend

# Rebuild if needed
docker-compose up --build backend
```

### Issue 5: Referral Bonus Not Unlocking

**Check:**
1. Deposit bonus has completed status
2. Referral bonus has correct linkedBonusId
3. Database trigger exists

**Verify Trigger:**
```sql
-- Check trigger exists
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'trigger_unlock_referral_bonuses';

-- Manually unlock if needed
UPDATE user_bonuses 
SET status = 'active' 
WHERE linked_bonus_id = 'deposit_bonus_id' 
AND status = 'locked';
```

---

## 📊 Monitoring & Logs

### View Application Logs

**Local:**
```bash
# Backend logs
cd backend && npm run dev

# Frontend logs
cd frontend && npm run dev
```

**Docker:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres
```

### Database Queries for Monitoring

```sql
-- Check all bonuses
SELECT 
  id,
  user_id,
  bonus_type,
  amount,
  status,
  linked_bonus_id,
  created_at
FROM user_bonuses
ORDER BY created_at DESC;

-- Check locked referral bonuses
SELECT COUNT(*) as locked_referral_bonuses
FROM user_bonuses
WHERE bonus_type = 'referral' AND status = 'locked';

-- Check referral bonus unlocking
SELECT 
  r.id as referral_bonus_id,
  r.status as referral_status,
  r.linked_bonus_id,
  d.id as deposit_bonus_id,
  d.status as deposit_status
FROM user_bonuses r
LEFT JOIN user_bonuses d ON r.linked_bonus_id = d.id
WHERE r.bonus_type = 'referral';
```

---

## ✅ Checklist Before Going Live

- [ ] Database migration applied successfully
- [ ] Environment variables configured
- [ ] SSL certificates installed (for production)
- [ ] Firewall configured
- [ ] Backup strategy in place
- [ ] All test scenarios pass
- [ ] Bonus system working as expected
- [ ] Monitoring/logging setup
- [ ] Domain configured (if using custom domain)

---

## 🎯 Quick Start Command Summary

```bash
# Local Development
npm install
cd backend && npm run db:migrate
npm run dev

# Docker Development
docker-compose up --build

# Docker Production
docker-compose -f docker-compose.prod.yml up -d

# View Logs
docker-compose logs -f

# Stop Everything
docker-compose down
```

---

**Need Help?**
- Check logs first
- Verify environment variables
- Ensure database is accessible
- Check firewall settings
- Review error messages carefully

**Good luck with your deployment! 🚀**