# 🚀 Reddy Anna Gaming Platform - Setup & Testing Guide

Complete guide to set up, run, and test the Andar Bahar gaming platform with database integration.

---

## 📋 Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** >= 20.0.0 ([Download](https://nodejs.org/))
- **npm** >= 10.0.0 (comes with Node.js)
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop/))
- **Git** ([Download](https://git-scm.com/))
- **PostgreSQL Client** (optional, for direct database access)

### Verify Installations

```bash
node --version    # Should show v20.x.x or higher
npm --version     # Should show v10.x.x or higher
docker --version  # Should show Docker version
```

---

## 🛠️ Quick Start (Recommended)

### Option 1: Using Docker (Easiest - Everything Included)

This method sets up PostgreSQL, Redis, Backend, Frontend, and OvenMediaEngine automatically.

```bash
# 1. Clone the repository (if not already done)
cd "d:/nextjs projects/reddy_anna"

# 2. Create environment file
copy .env.example .env

# 3. Edit .env file with your configurations
notepad .env

# 4. Install root dependencies
npm install

# 5. Start all services with Docker
docker compose up -d

# 6. Wait for services to start (30-60 seconds)
timeout /t 60

# 7. Run database migrations
docker compose exec backend npm run migrate

# 8. Seed initial data (creates admin user)
docker compose exec backend npm run seed
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- OvenMediaEngine: localhost:8080 (HLS), localhost:3333 (WebRTC)

### Option 2: Using Makefile (Quick Commands)

```bash
# Setup everything
make setup

# Start all services
make start

# Run migrations and seed data
make migrate
make seed

# View logs
make logs

# Stop services
make stop
```

---

## 🔧 Manual Setup (Without Docker)

If you prefer to run services locally without Docker:

### Step 1: Install PostgreSQL

1. Download PostgreSQL 16 from [https://www.postgresql.org/download/](https://www.postgresql.org/download/)
2. Install and start the service
3. Create database:

```bash
psql -U postgres
CREATE DATABASE reddy_anna_games;
\q
```

### Step 2: Install Redis

1. Download Redis from [https://redis.io/download](https://redis.io/download)
2. For Windows, use [Redis for Windows](https://github.com/microsoftarchive/redis/releases)
3. Start Redis server:

```bash
redis-server
```

### Step 3: Configure Environment

```bash
# Copy environment file
copy .env.example .env

# Edit with your local settings
notepad .env
```

Update these values in `.env`:
```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/reddy_anna_games
REDIS_URL=redis://:your_redis_password@localhost:6379
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### Step 4: Install Dependencies

```bash
# Install root dependencies
npm install

# This will automatically install backend and frontend dependencies
```

### Step 5: Run Database Migrations

```bash
# Run migrations
cd backend
npm run migrate:dev
cd ..
```

### Step 6: Seed Database

```bash
cd backend
npm run seed
cd ..
```

### Step 7: Start Development Servers

```bash
# Option A: Start both backend and frontend together
npm run dev

# Option B: Start separately in different terminals
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

**Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

---

## 🗄️ Database Configuration

### Default Database Credentials (Docker)

```
Host: localhost
Port: 5432
Database: reddy_anna
User: postgres
Password: postgres123
```

### Connection String Format

```
postgresql://username:password@host:port/database_name
```

### Verify Database Connection

```bash
# Using Docker
docker compose exec postgres psql -U postgres -d reddy_anna -c "\dt"

# Using local PostgreSQL
psql -U postgres -d reddy_anna_games -c "\dt"
```

### View Database Schema

```bash
# List all tables
docker compose exec postgres psql -U postgres -d reddy_anna -c "\dt"

# Describe specific table
docker compose exec postgres psql -U postgres -d reddy_anna -c "\d users"

# Or use GUI tool like pgAdmin or DBeaver
```

---

## 👤 Default Admin Credentials

After seeding the database, use these credentials to log in:

```
Email: admin@reddyanna.com
Password: Admin@123456
```

**⚠️ IMPORTANT:** Change these credentials immediately after first login in production!

---

## ✅ Testing the Application

### 1. Basic Health Checks

```bash
# Test backend health
curl http://localhost:3001/health

# Expected response: {"status":"ok","timestamp":"..."}

# Test database connection
curl http://localhost:3001/api/health/db

# Expected response: {"status":"ok","database":"connected"}
```

### 2. Test User Registration

```bash
# Register a new user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test@123456",
    "phone": "1234567890"
  }'
```

### 3. Test User Login

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123456"
  }'

# Save the returned token for authenticated requests
```

### 4. Manual Testing Flow

#### Admin Flow:
1. Open http://localhost:3000 (or http://localhost:5173 for local dev)
2. Click "Login" → Use admin credentials
3. Navigate to "Admin Dashboard"
4. Click "Game Control"
5. **Start New Round:**
   - Select opening card from 52-card grid
   - Confirm card selection
   - Click "Start Round"
6. **Betting Phase:**
   - Timer starts (30 seconds default)
   - Monitor incoming bets
   - Click "Close Betting" when ready
7. **Deal Cards:**
   - Cards dealt alternately: Bahar → Andar
   - Click "Deal Card" for each card
   - Cards display on screen
8. **Declare Winner:**
   - System auto-detects winner when match found
   - Click "Declare Winner"
   - Winner celebration shown

#### Player Flow:
1. Open http://localhost:3000 in different browser/incognito
2. Register new user or login
3. Add balance (test deposit)
4. Navigate to "Game Room"
5. **Place Bets:**
   - Wait for betting phase
   - Select bet amount
   - Click "Andar" or "Bahar"
   - See bet confirmation
   - Balance deducted
6. **Watch Game:**
   - See cards being dealt
   - Card sequence displayed
   - Winner announcement
7. **Check Results:**
   - If won: balance increased
   - If lost: bet amount already deducted
   - View transaction history

### 5. Database Testing

#### Check User Data:
```bash
docker compose exec postgres psql -U postgres -d reddy_anna -c "SELECT id, username, email, balance, role FROM users LIMIT 10;"
```

#### Check Game Rounds:
```bash
docker compose exec postgres psql -U postgres -d reddy_anna -c "SELECT id, round_number, status, winning_side, created_at FROM game_rounds ORDER BY created_at DESC LIMIT 5;"
```

#### Check Bets:
```bash
docker compose exec postgres psql -U postgres -d reddy_anna -c "SELECT b.id, u.username, b.bet_side, b.amount, b.status, b.payout_amount FROM bets b JOIN users u ON b.user_id = u.id ORDER BY b.created_at DESC LIMIT 10;"
```

#### Check Transactions:
```bash
docker compose exec postgres psql -U postgres -d reddy_anna -c "SELECT t.id, u.username, t.type, t.amount, t.status, t.created_at FROM transactions t JOIN users u ON t.user_id = u.id ORDER BY t.created_at DESC LIMIT 10;"
```

#### Verify Balance Consistency:
```bash
docker compose exec postgres psql -U postgres -d reddy_anna -c "
SELECT 
    u.username,
    u.balance as current_balance,
    COALESCE(SUM(CASE WHEN t.type = 'deposit' THEN CAST(t.amount AS NUMERIC) ELSE 0 END), 0) as total_deposits,
    COALESCE(SUM(CASE WHEN t.type = 'bet' THEN CAST(t.amount AS NUMERIC) ELSE 0 END), 0) as total_bets,
    COALESCE(SUM(CASE WHEN t.type = 'win' THEN CAST(t.amount AS NUMERIC) ELSE 0 END), 0) as total_wins
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id
WHERE u.role = 'player'
GROUP BY u.id, u.username, u.balance
LIMIT 5;
"
```

### 6. WebSocket Testing

```bash
# Install wscat globally
npm install -g wscat

# Connect to WebSocket
wscat -c ws://localhost:3001

# You should see: Connected

# Listen for game events
# Keep connection open during a game round
```

---

## 🧪 Running Automated Tests

### Backend Tests

```bash
cd backend
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Frontend Tests

```bash
cd frontend
npm test
```

---

## 📊 Monitoring & Debugging

### View Logs

```bash
# All services
docker compose logs -f

# Backend only
docker compose logs -f backend

# Database only
docker compose logs -f postgres

# Frontend only
docker compose logs -f frontend
```

### Check Service Status

```bash
docker compose ps
```

### Resource Usage

```bash
docker stats
```

### Database Studio (Visual Interface)

```bash
cd backend
npm run db:studio

# Opens Drizzle Studio at http://localhost:4983
```

---

## 🔧 Common Commands

```bash
# Restart specific service
docker compose restart backend
docker compose restart frontend
docker compose restart postgres

# Rebuild and restart
docker compose up -d --build

# Stop all services
docker compose down

# Stop and remove volumes (CAUTION: deletes data)
docker compose down -v

# View backend shell
docker compose exec backend sh

# View database shell
docker compose exec postgres psql -U postgres -d reddy_anna

# Reset database (WARNING: deletes all data)
docker compose down -v postgres
docker compose up -d postgres
# Wait 10 seconds
docker compose exec backend npm run migrate
docker compose exec backend npm run seed
```

---

## 🐛 Troubleshooting

### Issue: Port Already in Use

```bash
# Check what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :5432

# Kill the process (replace PID)
taskkill /PID <PID> /F

# Or change ports in .env file
```

### Issue: Docker Services Not Starting

```bash
# Check Docker is running
docker --version

# Restart Docker Desktop
# Windows: Right-click Docker icon → Restart

# View detailed logs
docker compose logs backend
```

### Issue: Database Connection Failed

```bash
# Verify PostgreSQL is running
docker compose ps postgres

# Check logs
docker compose logs postgres

# Restart database
docker compose restart postgres

# Wait 10 seconds and retry
```

### Issue: Frontend Build Errors

```bash
# Clear node_modules and reinstall
cd frontend
rmdir /s /q node_modules
npm install

# Clear build cache
npm run build -- --force
```

### Issue: Migration Failures

```bash
# Check current migration status
docker compose exec postgres psql -U postgres -d reddy_anna -c "\dt"

# Manually run migration
docker compose exec backend npm run migrate

# If stuck, reset database (WARNING: deletes data)
docker compose down -v postgres
docker compose up -d postgres
timeout /t 10
docker compose exec backend npm run migrate
docker compose exec backend npm run seed
```

### Issue: WebSocket Not Connecting

```bash
# Check CORS settings in backend .env
FRONTEND_URL=http://localhost:5173

# Verify backend is running
curl http://localhost:3001/health

# Check browser console for errors
# F12 → Console tab
```

---

## 📚 Project Structure

```
reddy_anna/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── index.ts        # Server entry point
│   │   ├── db/             # Database schemas & migrations
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   └── websocket/      # WebSocket handlers
│   └── package.json
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── App.tsx        # Main app component
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   └── hooks/         # Custom hooks
│   └── package.json
├── docker-compose.yml     # Docker services configuration
├── .env.example           # Environment variables template
└── package.json           # Root package.json (workspaces)
```

---

## 🔐 Security Notes

### For Development:
- Default credentials are provided for quick setup
- Use `.env` file (not committed to git)
- Database runs on localhost only

### For Production:
- Change all default passwords
- Use strong JWT secrets (32+ characters)
- Enable SSL/TLS certificates
- Configure proper CORS origins
- Use environment variable managers
- Enable rate limiting
- Set up proper firewall rules
- Regular security audits

---

## 📖 Additional Documentation

- [API Documentation](./API_DOCUMENTATION.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [System Architecture](./ANDAR_BAHAR_COMPLETE_IMPLEMENTATION_STATUS.md)
- [Database Schema](./backend/src/db/schema.ts)

---

## 🎯 Quick Testing Checklist

- [ ] Backend starts successfully
- [ ] Frontend starts successfully
- [ ] Database connection established
- [ ] Admin login works
- [ ] Player registration works
- [ ] Player login works
- [ ] Balance operations work
- [ ] Game round creation works
- [ ] Betting works
- [ ] Card dealing works
- [ ] Winner declaration works
- [ ] Payouts calculated correctly
- [ ] WebSocket real-time updates work
- [ ] Transaction history displays
- [ ] User stats update correctly

---

## 💡 Tips

1. **Use Docker for initial testing** - It's the fastest way to get everything running
2. **Check logs frequently** - `docker compose logs -f` helps debug issues
3. **Use multiple browsers** - Test admin and player simultaneously
4. **Monitor database** - Use `npm run db:studio` for visual database inspection
5. **Keep services updated** - Run `docker compose pull` periodically

---

## 🆘 Need Help?

1. Check logs: `docker compose logs -f`
2. Verify services: `docker compose ps`
3. Review environment variables: `cat .env`
4. Test database connection: `docker compose exec postgres psql -U postgres -d reddy_anna`
5. Restart services: `docker compose restart`

---

**Happy Testing! 🎮🎲**