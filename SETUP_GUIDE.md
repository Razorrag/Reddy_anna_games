# 🚀 Reddy Anna Gaming Platform - Setup Guide

Complete setup instructions for the modernized gaming platform with PostgreSQL, Redis, and OvenMediaEngine.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start with Docker](#quick-start-with-docker)
3. [Manual Setup](#manual-setup)
4. [Database Setup](#database-setup)
5. [Environment Configuration](#environment-configuration)
6. [Running the Application](#running-the-application)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

### Required Software

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Docker** >= 24.0.0 (for containerized setup)
- **Docker Compose** >= 2.20.0
- **PostgreSQL** >= 15.0 (if not using Docker)
- **Redis** >= 7.0 (if not using Docker)
- **Git**

### Optional Tools

- **OvenMediaEngine** (for streaming)
- **Nginx** (for production reverse proxy)
- **PM2** (for process management)

---

## 🐳 Quick Start with Docker

The fastest way to get started is using Docker Compose:

### 1. Clone the Repository

```bash
git clone <repository-url>
cd reddy_anna
```

### 2. Create Environment Files

```bash
# Backend environment
cp backend/.env.example backend/.env

# Frontend environment
cp frontend/.env.example frontend/.env
```

### 3. Update Environment Variables

Edit `backend/.env` and `frontend/.env` with your configuration (see [Environment Configuration](#environment-configuration) section).

### 4. Start All Services

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### 5. Run Database Migrations

```bash
# Access backend container
docker-compose exec backend sh

# Run migrations
npm run migrate

# Exit container
exit
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/health
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **OvenMediaEngine API**: http://localhost:8081
- **RTMP Ingest**: rtmp://localhost:1935
- **WebRTC**: ws://localhost:3333
- **HLS Playback**: http://localhost:8080

### 7. Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ WARNING: This deletes all data)
docker-compose down -v
```

---

## 🔧 Manual Setup

### 1. Install PostgreSQL

#### Ubuntu/Debian

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### macOS (using Homebrew)

```bash
brew install postgresql@15
brew services start postgresql@15
```

#### Windows

Download and install from [PostgreSQL Official Website](https://www.postgresql.org/download/windows/)

### 2. Install Redis

#### Ubuntu/Debian

```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

#### macOS (using Homebrew)

```bash
brew install redis
brew services start redis
```

#### Windows

Download and install from [Redis Official Website](https://redis.io/download)

### 3. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your configuration

# Run migrations
npm run migrate

# Start development server
npm run dev
```

### 4. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your configuration

# Start development server
npm run dev
```

---

## 💾 Database Setup

### Create Database

```bash
# Access PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE reddy_anna;

# Create user
CREATE USER reddy_anna_user WITH PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE reddy_anna TO reddy_anna_user;

# Exit
\q
```

### Run Migrations

The migration file is located at `backend/src/db/migrations/0001_create_initial_schema.sql`

#### Option 1: Using npm script (recommended)

```bash
cd backend
npm run migrate
```

#### Option 2: Manual execution

```bash
# From project root
psql -U reddy_anna_user -d reddy_anna -f backend/src/db/migrations/0001_create_initial_schema.sql
```

#### Option 3: Using Docker

```bash
docker-compose exec postgres psql -U postgres -d reddy_anna -f /path/to/migration.sql
```

### Verify Database Setup

```bash
# Access database
psql -U reddy_anna_user -d reddy_anna

# List tables
\dt

# Expected tables:
# - users
# - games
# - game_rounds
# - bets
# - transactions
# - wallets
# - referrals
# - bonuses
# - partners
# - commissions
# - game_statistics
# - user_statistics
# - notifications
# - settings
# - audit_logs

# Exit
\q
```

---

## ⚙️ Environment Configuration

### Backend Configuration (`backend/.env`)

```env
# Server
NODE_ENV=development
PORT=3001
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://reddy_anna_user:your_password@localhost:5432/reddy_anna

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# OvenMediaEngine
OME_API_URL=http://localhost:8081
OME_RTMP_URL=rtmp://localhost:1935
OME_WEBRTC_URL=ws://localhost:3333
OME_HLS_URL=http://localhost:8080

# WhatsApp (Optional)
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_ACCESS_TOKEN=your-access-token

# Admin Credentials
ADMIN_PHONE=+919999999999
ADMIN_PASSWORD=Admin@123456
ADMIN_EMAIL=admin@reddyanna.com
```

### Frontend Configuration (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
VITE_STREAM_URL=http://localhost:8080
```

---

## 🏃 Running the Application

### Development Mode

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - Redis (if not using Docker)
redis-server

# Terminal 4 - PostgreSQL
# Usually runs as a service, check status:
sudo systemctl status postgresql
```

### Production Mode

```bash
# Build backend
cd backend
npm run build
npm start

# Build frontend
cd frontend
npm run build
npm run preview

# Or use PM2
pm2 start ecosystem.config.js
```

---

## 🌐 Production Deployment

### 1. Update Environment Variables

```bash
# Backend .env
NODE_ENV=production
JWT_SECRET=<strong-random-secret-min-64-chars>
DATABASE_URL=postgresql://user:pass@prod-db:5432/reddy_anna
REDIS_URL=redis://prod-redis:6379
```

### 2. Build Docker Images

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Push to registry (if using)
docker-compose -f docker-compose.prod.yml push
```

### 3. Deploy with Docker Compose

```bash
# Start production stack
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 4. Setup Nginx Reverse Proxy

Create `/etc/nginx/sites-available/reddy-anna`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/reddy-anna /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. Setup SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
sudo certbot renew --dry-run
```

### 6. Setup Process Manager (PM2)

```bash
# Install PM2
npm install -g pm2

# Start services
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
```

---

## 🔍 Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# Test connection
psql -U reddy_anna_user -d reddy_anna -h localhost -p 5432
```

### Redis Connection Issues

```bash
# Check Redis is running
sudo systemctl status redis-server

# Test connection
redis-cli ping
# Should return: PONG

# Check Redis logs
sudo tail -f /var/log/redis/redis-server.log
```

### Port Already in Use

```bash
# Find process using port 3001
lsof -i :3001
# or
netstat -tulpn | grep 3001

# Kill process
kill -9 <PID>
```

### Docker Issues

```bash
# Clean up Docker
docker-compose down -v
docker system prune -a

# Rebuild images
docker-compose build --no-cache

# View container logs
docker-compose logs -f <service-name>
```

### Migration Failures

```bash
# Rollback and retry
psql -U reddy_anna_user -d reddy_anna -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Re-run migration
npm run migrate
```

---

## 📊 Monitoring

### Health Checks

```bash
# Backend health
curl http://localhost:3001/health

# PostgreSQL
pg_isready -h localhost -p 5432

# Redis
redis-cli ping
```

### Logs

```bash
# Backend logs
tail -f backend/logs/app.log

# Docker logs
docker-compose logs -f backend

# System logs
sudo journalctl -u postgresql -f
sudo journalctl -u redis -f
```

---

## 🎯 Next Steps

1. ✅ Complete backend setup
2. ✅ Run database migrations
3. 🔄 Create admin user
4. 🔄 Configure OvenMediaEngine for streaming
5. 🔄 Setup WhatsApp Business API
6. 🔄 Configure payment gateway
7. 🔄 Setup monitoring and analytics
8. 🔄 Configure backups

---

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check existing documentation
- Contact the development team

---

**Last Updated**: December 2025
**Version**: 1.0.0