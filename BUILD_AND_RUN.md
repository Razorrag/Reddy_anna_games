# 🚀 Build and Run Guide - Reddy Anna Gaming Platform

Complete guide to build and run the Reddy Anna Gaming Platform from scratch.

---

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ **Docker Desktop** installed and running
- ✅ **Node.js 20+** installed (for local development)
- ✅ **Git** installed
- ✅ **Text Editor** (VS Code recommended)
- ✅ **Terminal** access

---

## 🎯 Quick Start (5 Minutes)

### Step 1: Setup Environment Variables

```bash
# Copy environment template
cp .env.example .env

# Edit .env file and update these critical values:
# - JWT_SECRET (generate with: openssl rand -base64 64)
# - DB_PASSWORD (generate with: openssl rand -base64 32)
# - REDIS_PASSWORD (generate with: openssl rand -base64 32)
```

### Step 2: Install Dependencies

```bash
# Install root workspace dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Frontend will be created in later phases
```

### Step 3: Start Services with Docker

```bash
# Start all services (PostgreSQL, Redis, Backend)
make start

# Or manually:
docker compose up -d

# View logs
make logs
```

### Step 4: Initialize Database

```bash
# Run migrations
make migrate

# Seed initial data (admin user + default game)
make seed
```

### Step 5: Verify Installation

```bash
# Check backend health
curl http://localhost:3000/health

# You should see:
# {
#   "status": "ok",
#   "timestamp": "2025-12-01T...",
#   "uptime": 12.345
# }
```

**🎉 Done! Your backend is running!**

---

## 📊 What's Running?

After `make start`, you have these services:

| Service | URL | Status Check |
|---------|-----|--------------|
| **Backend API** | http://localhost:3000 | `curl localhost:3000/health` |
| **PostgreSQL** | localhost:5432 | `docker compose ps postgres` |
| **Redis** | localhost:6379 | `docker compose ps redis` |
| **Frontend** | Not yet created | Phase 11 |
| **OvenMediaEngine** | Not yet configured | Phase 20 |

---

## 🔧 Development Workflow

### Daily Development

```bash
# 1. Start services
make start

# 2. View logs (in separate terminal)
make logs-backend

# 3. Make code changes in backend/src/

# 4. Backend auto-reloads on changes (tsx watch)

# 5. Test your changes
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123456"}'
```

### Database Operations

```bash
# View database
make shell-db

# Inside PostgreSQL shell:
\dt                    # List tables
\d users              # Describe users table
SELECT * FROM users;  # Query users
\q                     # Exit

# Reset database (DESTRUCTIVE!)
make reset-db
```

### Common Commands

```bash
make help          # Show all commands
make install       # Install dependencies
make build         # Build all services
make restart       # Restart services
make stop          # Stop services
make clean         # Remove all containers & data
```

---

## 🐛 Troubleshooting

### Issue: TypeScript Errors in VS Code

**Cause:** Dependencies not installed  
**Fix:**
```bash
cd backend
npm install
```

Reload VS Code window: `Ctrl+Shift+P` → "Reload Window"

### Issue: Port 3000 Already in Use

**Fix:**
```bash
# Find process using port 3000
# Windows:
netstat -ano | findstr :3000

# Linux/Mac:
lsof -i :3000

# Kill the process or change PORT in .env
```

### Issue: Database Connection Failed

**Fix:**
```bash
# Check if PostgreSQL is running
docker compose ps postgres

# Restart PostgreSQL
docker compose restart postgres

# Check logs
docker compose logs postgres
```

### Issue: "Cannot find module" errors

**Cause:** Missing dependencies  
**Fix:**
```bash
cd backend
rm -rf node_modules
npm install
```

### Issue: Database migrations fail

**Fix:**
```bash
# Check database connection
make shell-db

# If can't connect, recreate database
docker compose down postgres
docker compose up -d postgres
sleep 5
make migrate
make seed
```

---

## 📁 Project Structure (Current)

```
reddy_anna/
├── backend/                    ✅ Complete
│   ├── src/
│   │   ├── db/                # Database (schema, migrations, seed)
│   │   ├── routes/            # API routes (8 files)
│   │   ├── middleware/        # Auth, error handling
│   │   ├── utils/             # Logger, helpers
│   │   ├── websocket/         # Socket.IO handlers
│   │   └── index.ts           # Server entry
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── frontend/                   🔴 Not created yet (Phase 11)
│
├── docker-compose.yml          ✅ Complete
├── Makefile                    ✅ Complete
├── .env.example               ✅ Complete
└── README.md                  ✅ Complete
```

---

## 🎯 Current Phase Status

### ✅ Phase 1: Infrastructure Setup - COMPLETE
- Docker Compose configuration
- PostgreSQL 16 database
- Redis 7 cache
- Backend server structure
- All configuration files

### 🔄 Phase 2: Database Schema - IN PROGRESS
**Completed:**
- 20+ table definitions
- Relationships & foreign keys
- Indexes for performance
- Enums for type safety

**Next Steps:**
1. Test all database tables
2. Verify relationships
3. Add sample data
4. Performance testing

### ⏭️ Phase 3: Backend Routes - READY
**Status:** All 8 route files created (stub implementations)

**Need Implementation:**
- Authentication logic
- Business services
- Controllers
- Validation schemas

---

## 📝 Default Credentials

After running `make seed`:

```
Admin Login:
Username: admin
Email: admin@reddyanna.com
Password: Admin@123456

Database:
Host: localhost
Port: 5432
Database: reddy_anna_games
User: postgres
Password: (from .env)
```

---

## 🔐 Security Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to strong random value
- [ ] Change `DB_PASSWORD` to strong random value
- [ ] Change `REDIS_PASSWORD` to strong random value  
- [ ] Change admin password immediately
- [ ] Enable SSL/TLS
- [ ] Configure firewall
- [ ] Setup monitoring
- [ ] Enable rate limiting
- [ ] Setup backup cron jobs

---

## 📚 API Endpoints (Current - All Return 501)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

### User Management
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/balance` - Get balance
- `GET /api/users/statistics` - Get stats
- `GET /api/users/history` - Get game history

### Games
- `GET /api/games` - List all games
- `GET /api/games/:id` - Get game details
- `GET /api/games/:id/current-round` - Current round
- `GET /api/games/:id/rounds` - Round history
- `GET /api/games/:id/statistics` - Game stats

### Betting
- `POST /api/bets` - Place bet
- `GET /api/bets` - Get user bets
- `GET /api/bets/:id` - Get bet details
- `GET /api/bets/round/:roundId` - Get round bets

### Transactions
- `GET /api/transactions` - Get transactions
- `POST /api/transactions/deposit` - Request deposit
- `POST /api/transactions/withdraw` - Request withdrawal
- `GET /api/transactions/deposits` - Deposit history
- `GET /api/transactions/withdrawals` - Withdrawal history

### Partners (Admin/Partner only)
- `GET /api/partners/dashboard` - Partner dashboard
- `GET /api/partners/commissions` - Get commissions
- `GET /api/partners/referrals` - Get referrals
- `GET /api/partners/statistics` - Partner stats
- `POST /api/partners/withdraw` - Withdraw commission

### Bonuses
- `GET /api/bonuses` - Get user bonuses
- `GET /api/bonuses/active` - Active bonuses
- `POST /api/bonuses/claim` - Claim bonus
- `GET /api/bonuses/referral-code` - Get referral code

### Admin (Admin only)
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/users` - List users
- `PUT /api/admin/users/:id/status` - Update user status
- `GET /api/admin/deposits/pending` - Pending deposits
- `PUT /api/admin/deposits/:id/approve` - Approve deposit
- `PUT /api/admin/deposits/:id/reject` - Reject deposit
- `GET /api/admin/withdrawals/pending` - Pending withdrawals
- `PUT /api/admin/withdrawals/:id/approve` - Approve withdrawal
- `PUT /api/admin/withdrawals/:id/reject` - Reject withdrawal
- `GET /api/admin/analytics` - Analytics data
- `GET /api/admin/settings` - System settings
- `PUT /api/admin/settings` - Update settings

---

## 🚦 Next Steps

### Immediate (Phase 2 Completion)
1. Generate Drizzle migrations
2. Test database schema
3. Verify all relationships
4. Add indexes

### Phase 3: Implement Authentication
1. Create auth service
2. Implement JWT logic
3. Add password hashing
4. Create referral code generator
5. Test login/register

### Phase 4: Create Services Layer
1. User service
2. Game service
3. Bet service
4. Transaction service
5. Partner service
6. Bonus service

### Phase 5: Frontend Development
1. Initialize React + Vite
2. Setup Tailwind CSS
3. Create basic layout
4. Implement auth pages
5. Build game interface

---

## 💡 Tips

1. **Always check logs:** `make logs` shows what's happening
2. **Database issues?** Try `make reset-db` (destroys data!)
3. **Port conflicts?** Change ports in docker-compose.yml
4. **Code changes not reflecting?** Backend has hot-reload (tsx watch)
5. **Need fresh start?** `make clean && make start`

---

## 📞 Need Help?

1. Check `README.md` for overview
2. Check `PROJECT_STATUS.md` for current progress
3. Review documentation in `reddy_anna_games/` folder
4. Check GitHub issues
5. Review error logs: `make logs`

---

**Status:** ✅ Backend Infrastructure Complete - Ready for Service Implementation

**Next Phase:** Implement Authentication Service & Business Logic