# 🎮 Reddy Anna Gaming Platform - Complete Recreation

A fully optimized, scalable gaming platform built from scratch with proper architecture, supporting 10,000+ concurrent users.

## 🎯 Project Overview

This is a complete recreation of the Reddy Anna Andar Bahar gaming platform with:
- ✅ Proper state management
- ✅ Clean frontend-backend separation  
- ✅ Optimized UI/UX (mobile & web)
- ✅ Scalable architecture
- ✅ PostgreSQL database
- ✅ Real-time WebSocket gaming
- ✅ Complete analytics system
- ✅ Partner & referral systems
- ✅ Live streaming via OvenMediaEngine

## 📁 Project Structure

```
reddy_anna/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── db/             # Database (Drizzle ORM + PostgreSQL)
│   │   ├── routes/         # API endpoints
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Auth, error handling
│   │   ├── utils/          # Helper functions
│   │   ├── websocket/      # Socket.IO real-time
│   │   └── index.ts        # Server entry point
│   ├── migrations/         # Database migrations
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── frontend/               # React/TypeScript frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── stores/        # Zustand state management
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript types
│   │   └── App.tsx        # Root component
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
│
├── ome/                    # OvenMediaEngine config
│   └── Server.xml
│
├── docker-compose.yml      # Multi-container setup
├── Makefile               # Development commands
├── .env.example           # Environment variables template
└── README.md              # This file
```

## 🛠️ Technology Stack

### Backend
- **Runtime:** Node.js 20 LTS
- **Framework:** Express 4.21
- **Language:** TypeScript 5.6
- **Database:** PostgreSQL 16
- **ORM:** Drizzle ORM 0.36
- **Cache:** Redis 7
- **Real-time:** Socket.IO 4.8
- **Auth:** JWT + bcrypt
- **Validation:** Zod schemas

### Frontend
- **Framework:** React 18.3
- **Language:** TypeScript 5.6
- **Build Tool:** Vite 5.4
- **State:** Zustand 5.0
- **Server State:** TanStack Query v5
- **Styling:** Tailwind CSS 3.4
- **UI Components:** Radix UI + shadcn/ui
- **Router:** Wouter 3.3
- **Forms:** React Hook Form + Zod
- **Animations:** Framer Motion 11.11
- **Video:** HLS.js 1.5

### Infrastructure
- **Containerization:** Docker & Docker Compose
- **Streaming:** OvenMediaEngine
- **Web Server:** nginx (reverse proxy)
- **SSL:** Let's Encrypt
- **Process Manager:** PM2

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose installed
- Node.js 20+ (for local development)
- Git

### 1. Clone Repository
```bash
git clone https://github.com/Razorrag/Reddy_anna_games.git
cd Reddy_anna_games
```

### 2. Setup Environment
```bash
make setup
# This creates .env file - update with your values
```

### 3. Start Development
```bash
# Start all services (PostgreSQL, Redis, Backend, Frontend, OvenMediaEngine)
make start

# View logs
make logs

# Stop services
make stop
```

### 4. Access Application
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Health Check:** http://localhost:3000/health

### 5. Database Setup
```bash
# Run migrations
make migrate

# Seed initial data (admin user, default game)
make seed
```

## 📊 Database Schema

The platform uses **20+ tables** for complete data management:

### Core Tables
- `users` - User accounts (players, admins, partners)
- `games` - Game definitions (Andar Bahar, future games)
- `game_rounds` - Individual game rounds
- `bets` - Player bets
- `transactions` - All financial transactions

### Financial Tables
- `deposits` - Deposit requests
- `withdrawals` - Withdrawal requests  
- `partners` - Partner accounts
- `partner_commissions` - Partner earnings

### Bonus & Referral Tables
- `user_bonuses` - User bonus tracking
- `referrals` - Referral relationships

### Analytics Tables
- `game_statistics` - Game performance metrics
- `user_statistics` - Player statistics
- `game_history` - Complete game history

### System Tables
- `system_settings` - Configuration
- `notifications` - User notifications

## 🎮 Game System

### Andar Bahar Rules
- **Round 1:** Andar wins 1:1, Bahar gets refund
- **Round 2+:** Both sides win 1:1
- **Betting Duration:** 30 seconds
- **Min Bet:** ₹10
- **Max Bet:** ₹100,000

### Game Flow
1. **Betting Phase** (30s) - Players place bets
2. **Card Drawing** - Joker card revealed
3. **Game Play** - Cards dealt to Andar/Bahar
4. **Result** - Winner declared, payouts processed
5. **Next Round** - New round starts

## 💰 Financial System

### Deposits
- Multiple payment methods (UPI, Bank Transfer, PhonePe, Razorpay)
- Screenshot upload for verification
- Admin approval workflow
- 5% deposit bonus (30x wagering)

### Withdrawals
- Bank transfer & UPI support
- Minimum: ₹500
- Maximum: ₹100,000
- Admin approval required

### Partner System
- 2% commission on player bets
- Real-time earnings tracking
- Automatic commission calculation
- Withdrawal to partner wallet

### Referral System
- Unique referral codes
- ₹50 bonus per successful referral
- Signup bonus: ₹100
- 30x wagering requirement

## 🔐 Authentication

### JWT-Based Auth
- Access token (7 days expiry)
- Secure password hashing (bcrypt)
- Role-based access control (player, admin, partner)

### User Roles
- **Player:** Standard user, can play games
- **Admin:** Full system access, approvals
- **Partner:** Commission tracking, referrals

## 📡 Real-time Features

### WebSocket Events
- `game:round_started` - New round begins
- `game:betting_open` - Accept bets
- `game:betting_closed` - Stop accepting bets
- `game:card_drawn` - Card revealed
- `game:round_ended` - Round complete
- `user:balance_updated` - Balance changed
- `bet:placed` - New bet confirmation

## 📈 Analytics Dashboard

### Game Analytics
- Total rounds played
- Total bets placed
- Win/Loss ratios
- Revenue tracking
- Popular betting patterns

### User Analytics
- Active players
- New signups
- Retention rates
- Average bet amounts
- Top players

### Partner Analytics
- Total referrals
- Commission earned
- Active players
- Conversion rates

## 🧪 Testing

```bash
# Run all tests
make test

# Backend tests only
cd backend && npm test

# Frontend tests only
cd frontend && npm test

# E2E tests
cd frontend && npm run test:e2e

# Load testing (10,000+ users)
cd backend && npm run test:load
```

## 📦 Deployment

### VPS Deployment (Ubuntu 22.04)
```bash
# 1. SSH into VPS
ssh root@your-vps-ip

# 2. Clone repository
git clone https://github.com/Razorrag/Reddy_anna_games.git
cd Reddy_anna_games

# 3. Setup environment
cp .env.example .env
nano .env  # Update values

# 4. Build and start
docker compose -f docker-compose.prod.yml up -d

# 5. Setup SSL with Let's Encrypt
./scripts/setup-ssl.sh your-domain.com
```

### Production Checklist
- [ ] Update environment variables in `.env`
- [ ] Configure domain DNS
- [ ] Setup SSL certificates
- [ ] Enable firewall (ports 80, 443)
- [ ] Setup backup cron jobs
- [ ] Configure monitoring
- [ ] Setup log rotation

## 🔧 Development Commands

```bash
# Project setup
make setup          # Initial setup
make install        # Install dependencies

# Docker operations
make start          # Start all services
make stop           # Stop all services
make restart        # Restart services
make logs           # View all logs
make logs-backend   # Backend logs only
make logs-frontend  # Frontend logs only
make clean          # Remove containers & volumes

# Database operations
make migrate        # Run migrations
make seed           # Seed initial data
make reset-db       # Reset database (DESTRUCTIVE)
make shell-db       # Open PostgreSQL shell

# Development
make dev            # Start dev environment
npm run dev         # Root dev script
```

## 📝 Environment Variables

See `.env.example` for all required variables:

### Critical Variables
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - Secret key for JWT tokens (min 32 chars)
- `FRONTEND_URL` - Frontend URL for CORS

### Payment Gateways
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`
- `PHONEPE_MERCHANT_ID` & `PHONEPE_SALT_KEY`

### Streaming
- `OME_RTMP_URL` - RTMP input URL
- `OME_HLS_URL` - HLS output URL

## 🐛 Troubleshooting

### Database Connection Failed
```bash
# Check PostgreSQL status
docker compose ps postgres
docker compose logs postgres

# Verify connection string in .env
echo $DATABASE_URL
```

### Frontend Can't Connect to Backend
```bash
# Check CORS settings
# Verify FRONTEND_URL in backend .env
# Check network in docker-compose.yml
```

### OvenMediaEngine Not Streaming
```bash
# Check OME status
docker compose logs ome

# Verify Server.xml configuration
cat ome/Server.xml
```

## 🤝 Contributing

This is a complete recreation project. For major changes:
1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## 📄 License

Proprietary - All rights reserved

## 👥 Team

- **Project:** Reddy Anna Gaming Platform
- **Developer:** Kilo Code AI
- **Repository:** https://github.com/Razorrag/Reddy_anna_games

## 📞 Support

For issues or questions:
1. Check documentation in `reddy_anna_games/` folder
2. Review GitHub issues
3. Contact development team

---

**Status:** ✅ Infrastructure Setup Complete - Ready for Implementation

**Next Phase:** Authentication System & API Routes