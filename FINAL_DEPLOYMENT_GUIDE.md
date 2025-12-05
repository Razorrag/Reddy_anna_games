# 🎯 FINAL DEPLOYMENT GUIDE - Raju Gari Kossu

## 🚨 NUCLEAR RESET DEPLOYMENT (RECOMMENDED)

This performs a **complete system reset** - deletes everything and starts fresh.

### **Run This Command:**

```bash
cd /opt/reddy_anna
chmod +x NUCLEAR_RESET_AND_DEPLOY.sh
./NUCLEAR_RESET_AND_DEPLOY.sh
```

### **What It Does:**

1. ✅ Stops and removes ALL Docker containers
2. ✅ Deletes ALL Docker images and volumes
3. ✅ Clears ALL caches (Docker, npm, etc.)
4. ✅ Deletes ~110 unnecessary documentation files
5. ✅ Fixes environment variables
6. ✅ Pulls fresh code from GitHub
7. ✅ Rebuilds everything from scratch (10-15 min)
8. ✅ Creates admin account automatically
9. ✅ Tests all endpoints

**Time Required:** ~15-20 minutes (fresh rebuild)

---

## 📊 SYSTEM ARCHITECTURE

### **Database Schema (PostgreSQL)**

```sql
users table (snake_case):
├── id (uuid)
├── username (varchar) ← Phone number stored here
├── email (varchar) ← Auto-generated: phone@reddyanna.local
├── password_hash (varchar) ← bcrypt hash
├── phone_number (varchar) ← Also stores phone
├── full_name (varchar)
├── balance (decimal) ← Main balance
├── bonus_balance (decimal) ← Bonus balance
├── role (enum) ← 'player', 'admin', 'partner'
├── status (enum) ← 'active', 'suspended', 'banned'
├── referral_code (varchar) ← Unique 8-char code
├── referred_by (uuid) ← Referrer user ID
└── created_at, updated_at (timestamps)
```

### **Backend API Endpoints**

```
Authentication:
├── POST /api/auth/signup      ← Phone-based signup
├── POST /api/auth/register    ← Username/email signup
├── POST /api/auth/login       ← Supports phone OR username
├── GET  /api/auth/me          ← Get current user
└── POST /api/auth/logout      ← Logout

Games:
├── GET  /api/games            ← List all games
├── GET  /api/games/:id        ← Get game details
└── GET  /api/games/:id/rounds ← Get game rounds

Bets:
├── POST /api/bets             ← Place bet
├── GET  /api/bets/history     ← User bet history
└── POST /api/bets/:id/undo    ← Undo last bet

Admin:
├── GET  /api/admin/dashboard  ← Dashboard stats
├── GET  /api/admin/users      ← Manage users
├── GET  /api/admin/deposits   ← Manage deposits
└── GET  /api/admin/withdrawals← Manage withdrawals

Partner:
├── GET  /api/partner/dashboard ← Partner stats
├── GET  /api/partner/earnings  ← Commission details
└── GET  /api/partner/players   ← Referred players
```

### **Frontend Routes**

```
Public Pages:
├── /                    ← Landing page
├── /login              ← Player login
├── /signup             ← Player signup
└── /about              ← About page

Player Pages:
├── /game               ← Game room (Andar Bahar)
├── /profile            ← User profile
├── /history            ← Bet history
├── /deposit            ← Deposit funds
└── /withdraw           ← Withdraw funds

Admin Pages:
├── /admin              ← Admin login
├── /admin/dashboard    ← Admin dashboard
├── /admin/users        ← User management
├── /admin/games        ← Game management
├── /admin/deposits     ← Deposit approvals
└── /admin/withdrawals  ← Withdrawal approvals

Partner Pages:
├── /partner/login      ← Partner login
├── /partner/signup     ← Partner signup
├── /partner/dashboard  ← Partner dashboard
└── /partner/earnings   ← Commission details
```

---

## 👤 USER ROLES & ACCESS

### **1. Player (Default Role)**

**How to Create:**
```
1. Go to http://89.42.231.35/signup
2. Enter:
   - Phone: 10-digit number
   - Name: Full name
   - Password: Min 8 characters
   - Referral Code: Optional (get bonus)
3. Click "Create Account"
4. Receive ₹100 signup bonus
5. Login at http://89.42.231.35/login
```

**What Players Can Do:**
- ✅ Play Andar Bahar game
- ✅ Place bets (₹100 - ₹100,000)
- ✅ View betting history
- ✅ Deposit funds (via WhatsApp)
- ✅ Withdraw winnings
- ✅ Use referral code to invite friends
- ✅ Earn referral bonuses

**Database Entry:**
```sql
INSERT INTO users (
  username,        -- Phone: '9876543210'
  email,           -- Auto: '9876543210@reddyanna.local'
  password_hash,   -- bcrypt hash
  phone_number,    -- '9876543210'
  full_name,       -- User's name
  role,            -- 'player'
  status,          -- 'active'
  balance,         -- 0.00
  bonus_balance    -- 100.00 (signup bonus)
)
```

---

### **2. Admin (System Administrator)**

**How to Create (Automatic):**

The nuclear reset script creates admin automatically. If needed manually:

```bash
cd /opt/reddy_anna
docker compose -f docker-compose.prod.yml exec -T backend sh -c '
  DATABASE_URL=postgresql://postgres:PASSWORD@postgres:5432/reddy_anna \
  tsx src/scripts/create-admin.ts
'
```

**Admin Credentials:**
```
URL:      http://89.42.231.35/admin
Username: admin
Email:    admin@reddyanna.com
Password: Admin@123456
```

**What Admins Can Do:**
- ✅ View dashboard with all stats
- ✅ Manage all users (view, suspend, ban)
- ✅ Approve/reject deposits
- ✅ Process withdrawals
- ✅ Manage games (start, stop, configure)
- ✅ View all transactions
- ✅ Manage partners
- ✅ Configure system settings
- ✅ View real-time game analytics
- ✅ Generate reports

**Database Entry:**
```sql
INSERT INTO users (
  username,        -- 'admin'
  email,           -- 'admin@reddyanna.com'
  password_hash,   -- bcrypt of 'Admin@123456'
  full_name,       -- 'System Administrator'
  role,            -- 'admin' ← Key difference
  status,          -- 'active'
  balance,         -- 0.00
  bonus_balance    -- 0.00
)
```

---

### **3. Partner (Affiliate Marketing)**

**How to Create:**

Partners can signup themselves at:
```
http://89.42.231.35/partner/signup
```

**Or Admin Creates:**
```sql
-- Step 1: Create user with partner role
INSERT INTO users (
  username, email, password_hash,
  full_name, role, status
) VALUES (
  'partner1', 'partner1@example.com', 'bcrypt_hash',
  'Partner Name', 'partner', 'active'
);

-- Step 2: Create partner entry
INSERT INTO partners (
  user_id,           -- From users table
  partner_code,      -- Unique code: 'PART001'
  commission_rate,   -- 10.00 (10%)
  share_percentage,  -- 50.00 (50% of real profit shown)
  status             -- 'active'
);
```

**What Partners Can Do:**
- ✅ Get unique partner code/link
- ✅ Share link with players
- ✅ Earn commission on player bets
- ✅ View referred players
- ✅ View earnings dashboard
- ✅ Request commission payout
- ✅ Track performance metrics

**Commission System:**
```typescript
// Partner sees 50% of actual profit
Real Profit: ₹10,000 (house profit from players)
Shown to Partner: ₹5,000 (50% share_percentage)
Partner Earns: ₹500 (10% commission_rate of shown)
House Keeps: ₹9,500 (₹10,000 - ₹500)
```

---

## 🔄 COMPLETE DATA FLOW

### **1. Signup Flow**

```
Frontend Form → Backend API → Database
─────────────────────────────────────────

1. User enters:
   {
     phone: "9876543210",
     name: "John Doe",
     password: "password123",
     referralCode: "ABC123" (optional)
   }

2. Frontend sends POST to:
   /api/auth/signup ← Fixed (was /api/api/auth/signup)

3. Backend processes:
   - Validates phone (min 6 chars)
   - Checks if phone exists (as username)
   - Auto-generates email: 9876543210@reddyanna.local
   - Hashes password with bcrypt (12 rounds)
   - Generates unique referral code (8 chars)
   - Finds referrer if code provided

4. Database insert:
   INSERT INTO users (...)
   VALUES (
     username: phone,
     email: auto_email,
     password_hash: bcrypt_hash,
     phone_number: phone,
     full_name: name,
     role: 'player',
     referral_code: generated,
     referred_by: referrer_id
   )

5. Create signup bonus:
   INSERT INTO user_bonuses (
     user_id, bonus_type: 'signup',
     amount: 100.00,
     wagering_requirement: 3000.00
   )
   UPDATE users SET bonus_balance = 100.00

6. If referred, create referral bonus:
   INSERT INTO referrals (...)
   INSERT INTO user_bonuses (referrer, 50.00)

7. Generate JWT token:
   jwt.sign({ userId, role }, secret, { expiresIn: '7d' })

8. Return to frontend:
   {
     user: {
       id, phone, name, role,
       mainBalance, bonusBalance, referralCode
     },
     token: "jwt_token"
   }

9. Frontend stores:
   localStorage.setItem('auth_token', token)
   localStorage.setItem('user', JSON.stringify(user))
   
10. Redirect to /game
```

### **2. Login Flow**

```
Frontend → Backend → Database
────────────────────────────

1. User enters:
   {
     phone: "9876543210",
     password: "password123"
   }

2. Frontend sends POST to:
   /api/auth/login

3. Backend processes:
   - Find user WHERE username = phone
   - Check status (block if banned, allow suspended)
   - Verify password: bcrypt.compare()
   - Update last_login_at
   - Generate JWT token

4. Return mapped user + token

5. Frontend redirects based on role:
   - player → /game
   - admin → /admin/dashboard
   - partner → /partner/dashboard
```

---

## 🧪 TESTING CHECKLIST

### **After Deployment:**

#### **1. Test Signup**
```bash
# Via UI
1. Go to http://89.42.231.35/signup
2. Enter phone: 9999999999
3. Enter name: Test User
4. Enter password: test123456
5. Submit
6. Should see: "Welcome Test User! ₹100 signup bonus added!"
7. Should redirect to /game

# Via API
curl -X POST http://89.42.231.35/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "8888888888",
    "name": "API Test",
    "password": "test123456"
  }'

# Expected Response:
{
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid",
      "phone": "8888888888",
      "name": "API Test",
      "role": "player",
      "mainBalance": 0,
      "bonusBalance": 100,
      "referralCode": "ABCD1234"
    },
    "token": "jwt.token.here"
  }
}
```

#### **2. Test Login**
```bash
# Via UI
1. Go to http://89.42.231.35/login
2. Enter phone: 9999999999
3. Enter password: test123456
4. Submit
5. Should see: "Welcome back, Test User!"
6. Should redirect to /game

# Via API
curl -X POST http://89.42.231.35/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9999999999",
    "password": "test123456"
  }'
```

#### **3. Test Admin Login**
```bash
# Via UI
1. Go to http://89.42.231.35/admin
2. Enter username: admin
3. Enter password: Admin@123456
4. Submit
5. Should see admin dashboard

# Via API
curl -X POST http://89.42.231.35/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin@123456"
  }'
```

#### **4. Test Game Flow**
```
1. Login as player
2. Go to /game
3. Should see:
   - Live stream
   - Betting buttons (Andar/Bahar)
   - Balance display
   - Bet history
4. Place a test bet
5. Watch round play out
6. Check if win/loss recorded
```

---

## 🐛 TROUBLESHOOTING

### **Issue: Signup Returns 404**
```bash
# Check backend logs
docker compose -f docker-compose.prod.yml logs backend | grep signup

# Test endpoint directly
curl http://localhost:3001/api/auth/signup

# Verify backend is running
docker compose -f docker-compose.prod.yml ps backend
```

### **Issue: Login Fails**
```bash
# Check if user exists
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d reddy_anna -c "SELECT username, email, role FROM users;"

# Check backend logs
docker compose -f docker-compose.prod.yml logs backend | grep -i login
```

### **Issue: Admin Can't Login**
```bash
# Recreate admin
docker compose -f docker-compose.prod.yml exec -T backend sh -c '
  DATABASE_URL=postgresql://postgres:PASSWORD@postgres:5432/reddy_anna \
  tsx src/scripts/create-admin.ts
'
```

### **Issue: Database Connection Failed**
```bash
# Check .env file
cat .env | grep DATABASE

# Should have:
DATABASE_URL=postgresql://postgres:PASSWORD@postgres:5432/reddy_anna
POSTGRES_DB=reddy_anna

# Restart containers
docker compose -f docker-compose.prod.yml restart
```

---

## 📝 IMPORTANT FILES TO KEEP

After cleanup, these are the only files you need:

```
Essential Documentation:
├── README.md                          ← Project overview
├── DEPLOY.md                          ← Deployment guide
├── SETUP_GUIDE.md                     ← Setup instructions
├── START.md                           ← Quick start
├── SIMPLE_START.md                    ← Simple start guide
├── DOCKER_START.md                    ← Docker commands
├── CREATE_ADMIN_ACCOUNT.md            ← Admin creation
├── MASTER_DEPLOYMENT_READINESS.md     ← Full roadmap
├── COMPLETE_AUTH_FLOW_ANALYSIS.md     ← Auth flow details
└── FINAL_DEPLOYMENT_GUIDE.md          ← This file!

Deployment Scripts:
├── NUCLEAR_RESET_AND_DEPLOY.sh        ← Nuclear reset (RECOMMENDED)
└── VPS_CREATE_ADMIN.sh                ← Create admin manually

Configuration:
├── .env                               ← Environment variables
├── docker-compose.yml                 ← Dev setup
├── docker-compose.prod.yml            ← Production setup
└── Makefile                           ← Build commands
```

**All other ~110 MD files will be deleted automatically!**

---

## 🎉 FINAL CHECKLIST

- [ ] Run NUCLEAR_RESET_AND_DEPLOY.sh
- [ ] Wait 15-20 minutes for rebuild
- [ ] Visit http://89.42.231.35
- [ ] Test signup with new account
- [ ] Test login with created account
- [ ] Login as admin (admin / Admin@123456)
- [ ] Place test bet in game
- [ ] Verify balance updates
- [ ] Test deposit flow
- [ ] Test withdrawal flow
- [ ] Create partner account (optional)
- [ ] Test partner referral system

**Everything should work perfectly after nuclear reset!** 🚀