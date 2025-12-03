# 🚀 Quick Start Guide - Reddy Anna Gaming Platform

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Redis
- Docker (optional, for containerized setup)

---

## 🎯 Option 1: Quick Start with Docker (Recommended)

### Step 1: Start Services
```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Wait 10 seconds for services to initialize
```

### Step 2: Setup Backend
```bash
cd backend

# Install dependencies
npm install

# Run database migrations
npm run migrate

# (Optional) Seed test data
npm run seed

# Start backend server
npm run dev
```
**Backend will run on:** http://localhost:3001

### Step 3: Setup Frontend
```bash
# Open new terminal
cd frontend

# Install dependencies
npm install

# Start frontend dev server
npm run dev
```
**Frontend will run on:** http://localhost:5173

---

## 🎯 Option 2: Manual Setup (Without Docker)

### Step 1: Setup PostgreSQL
```bash
# Create database
createdb reddy_anna_games

# Update connection string in backend/.env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/reddy_anna_games
```

### Step 2: Setup Redis
```bash
# Start Redis server
redis-server

# Or install as service
sudo systemctl start redis
```

### Step 3: Setup Backend
```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL=postgresql://postgres:password@localhost:5432/reddy_anna_games
# REDIS_URL=redis://localhost:6379
# JWT_SECRET=your-super-secret-key-change-this

# Install dependencies
npm install

# Run migrations
npm run migrate

# Start backend
npm run dev
```

### Step 4: Setup Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

---

## 🧪 Test the Application

### 1. Access the App
Open your browser and go to: **http://localhost:5173**

### 2. Create Test Account
- Click "Sign Up"
- Enter test details:
  - Phone: `+919876543210`
  - Password: `Test@1234`
  - Name: `Test Player`
- Submit registration

### 3. Login
- Use the credentials you just created
- You'll be redirected to the dashboard

### 4. Test Features
- ✅ **Dashboard**: View stats and balance
- ✅ **Game Room**: Join the live game
- ✅ **Deposit**: Add funds to your account
- ✅ **Withdraw**: Request withdrawals
- ✅ **Profile**: Update your details
- ✅ **Transaction History**: View all transactions
- ✅ **Game History**: View past bets and results

---

## 🔑 Default Admin Credentials

After running `npm run seed`:
- **Username**: `admin`
- **Password**: `Admin@123`
- **Access**: http://localhost:5173/admin

---

## 🌐 Port Configuration

| Service | Port | URL |
|---------|------|-----|
| Frontend | 5173 | http://localhost:5173 |
| Backend API | 3001 | http://localhost:3001 |
| PostgreSQL | 5432 | postgresql://localhost:5432 |
| Redis | 6379 | redis://localhost:6379 |
| WebSocket | 3001 | ws://localhost:3001 |

---

## 🛠️ Troubleshooting

### Backend won't start
```bash
# Check if PostgreSQL is running
docker ps | grep postgres
# OR
pg_isready

# Check if port 3001 is available
lsof -i :3001  # On Mac/Linux
netstat -ano | findstr :3001  # On Windows
```

### Frontend won't start
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check if port 5173 is available
lsof -i :5173  # On Mac/Linux
netstat -ano | findstr :5173  # On Windows
```

### Database connection errors
```bash
# Verify PostgreSQL is running
docker-compose ps

# Check database exists
psql -U postgres -l | grep reddy_anna

# Reset database (WARNING: Deletes all data)
npm run migrate:reset
npm run migrate
```

### WebSocket not connecting
- Ensure backend is running on port 3001
- Check browser console for connection errors
- Verify `VITE_WS_URL` in frontend/.env (should be `http://localhost:3001`)

---

## 📦 What's Included

### ✅ Backend (Port 3001)
- Express.js + TypeScript
- PostgreSQL with Drizzle ORM
- Redis for caching
- Socket.IO for real-time updates
- JWT authentication
- 53+ API endpoints
- Role-based access control

### ✅ Frontend (Port 5173)
- React 18 + Vite
- TypeScript
- Tailwind CSS with Royal Theme
- Socket.IO client
- TanStack Query
- Zustand state management
- Wouter routing
- 35+ pages

### ✅ Features
- 🎮 Live Andar Bahar game
- 💰 Deposit/Withdraw system
- 🎁 Bonus and referral system
- 📊 Admin dashboard
- 🤝 Partner/affiliate system
- 📈 Analytics and reports
- 🎥 Live streaming integration
- 📱 Mobile responsive

---

## 🎨 Royal Premium Theme

The entire application uses a consistent **Royal Premium Theme**:
- **Colors**: Navy Blue (#0A0E27) + Gold (#FFD700)
- **Effects**: Glassmorphism, glow effects, animations
- **Typography**: Poppins + Inter fonts
- **Components**: Premium buttons, cards, and panels

---

## 📚 Next Steps

1. **Read Documentation**: Check `README.md` for detailed info
2. **Explore Admin Panel**: Login as admin to manage the platform
3. **Test Game Flow**: Place bets and see real-time updates
4. **Customize**: Modify colors, logos, and content
5. **Deploy**: Follow `DEPLOY.md` for production setup

---

## 🆘 Need Help?

- Check `SETUP_GUIDE.md` for detailed installation
- Review `BUILD_AND_RUN.md` for build instructions
- See `COMPLETE_PROJECT_STATUS.md` for feature status
- Read API docs in `backend/README.md`

---

## 🎉 You're All Set!

Your Reddy Anna Gaming Platform is now running with:
- ✅ Backend API connected to database
- ✅ Frontend serving royal-themed UI
- ✅ WebSocket for real-time game updates
- ✅ Full authentication system
- ✅ All 35+ pages styled and functional

**Enjoy building your premium gaming platform! 🎰👑**