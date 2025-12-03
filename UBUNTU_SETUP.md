# 🐧 Ubuntu Server Setup Guide

## Step-by-Step Installation for Ubuntu/Debian

### Step 1: Install PostgreSQL

```bash
# Update package list
sudo apt update

# Install PostgreSQL 14
sudo apt install postgresql postgresql-contrib -y

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation
sudo systemctl status postgresql

# Set password for postgres user
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"

# Create database
sudo -u postgres createdb reddy_anna_games

# Test connection
sudo -u postgres psql -d reddy_anna_games -c "SELECT version();"
```

**Expected output:** PostgreSQL version information

---

### Step 2: Install Redis

```bash
# Install Redis
sudo apt install redis-server -y

# Start Redis service
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify Redis is running
redis-cli ping
```

**Expected output:** `PONG`

---

### Step 3: Install Node.js 18+ (if not installed)

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Verify installation
node --version  # Should show v18.x or higher
npm --version
```

---

### Step 4: Run the Setup Script

```bash
# Navigate to project directory
cd /opt/reddy_anna

# Make script executable (if not already done)
chmod +x start-manual.sh

# Run the setup
./start-manual.sh
```

The script will now:
- ✅ Detect PostgreSQL is installed
- ✅ Detect Redis is installed
- ✅ Create .env file
- ✅ Install dependencies
- ✅ Run migrations
- ✅ Start backend (port 3001)
- ✅ Start frontend (port 5173)

---

## Alternative: Manual Step-by-Step Setup

If you prefer to run commands manually:

### 1. Setup Backend

```bash
cd /opt/reddy_anna/backend

# Install dependencies
npm install

# Create .env file
cat > .env << 'EOF'
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/reddy_anna_games

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-key-change-this-in-production-$(openssl rand -hex 16)
JWT_EXPIRES_IN=7d

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# CORS
CORS_ORIGIN=http://localhost:5173

# Stream
STREAM_URL=http://localhost:8080/hls/stream.m3u8
EOF

# Run database migrations
npm run migrate

# Seed test data (optional)
npm run seed

# Start backend server
npm run dev
```

**Backend should start on:** http://localhost:3001

### 2. Setup Frontend (New Terminal)

```bash
cd /opt/reddy_anna/frontend

# Install dependencies
npm install

# Start frontend server
npm run dev
```

**Frontend should start on:** http://localhost:5173

---

## Verify Everything is Working

### 1. Check Backend
```bash
curl http://localhost:3001/health
```
**Expected:** `{"status":"ok","timestamp":"..."}`

### 2. Check Database Connection
```bash
sudo -u postgres psql -d reddy_anna_games -c "\dt"
```
**Expected:** List of tables (users, games, bets, etc.)

### 3. Check Redis
```bash
redis-cli ping
```
**Expected:** `PONG`

### 4. Access Frontend
Open browser: http://YOUR_SERVER_IP:5173

---

## 🔒 Security Notes for Production

### 1. Change Default Passwords
```bash
# PostgreSQL
sudo -u postgres psql
ALTER USER postgres PASSWORD 'your-strong-password-here';
\q

# Update backend/.env with new password
DATABASE_URL=postgresql://postgres:your-strong-password-here@localhost:5432/reddy_anna_games
```

### 2. Configure Firewall
```bash
# Allow only necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 3001  # Backend API (or use nginx proxy)
sudo ufw allow 5173  # Frontend (or use nginx proxy)
sudo ufw enable
```

### 3. Use Environment Variables
Never commit `.env` files to git. Use different values for production.

---

## 🛠️ Troubleshooting

### PostgreSQL Issues

**Service won't start:**
```bash
sudo systemctl status postgresql
sudo journalctl -u postgresql
```

**Can't connect:**
```bash
# Edit pg_hba.conf to allow local connections
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Change this line:
# local   all             postgres                                peer
# To:
local   all             postgres                                md5

# Restart
sudo systemctl restart postgresql
```

### Redis Issues

**Service won't start:**
```bash
sudo systemctl status redis-server
sudo journalctl -u redis-server
```

**Connection refused:**
```bash
# Check if Redis is listening
sudo netstat -tulpn | grep redis

# Edit Redis config
sudo nano /etc/redis/redis.conf
# Ensure: bind 127.0.0.1
```

### Port Already in Use

**Backend (3001):**
```bash
# Find process using port
sudo lsof -i :3001
# Kill it
sudo kill -9 <PID>
```

**Frontend (5173):**
```bash
# Find process using port
sudo lsof -i :5173
# Kill it
sudo kill -9 <PID>
```

### Database Migration Errors

```bash
cd backend

# Reset database (WARNING: Deletes all data)
npm run migrate:reset

# Run migrations again
npm run migrate

# Seed data
npm run seed
```

---

## 📊 Quick Commands Reference

### Start Services
```bash
# PostgreSQL
sudo systemctl start postgresql

# Redis
sudo systemctl start redis-server

# Backend
cd /opt/reddy_anna/backend && npm run dev &

# Frontend
cd /opt/reddy_anna/frontend && npm run dev &
```

### Stop Services
```bash
# Stop Node processes
killall node

# Stop PostgreSQL
sudo systemctl stop postgresql

# Stop Redis
sudo systemctl stop redis-server
```

### Check Status
```bash
# PostgreSQL
sudo systemctl status postgresql

# Redis
sudo systemctl status redis-server

# Backend API
curl http://localhost:3001/health

# Frontend
curl http://localhost:5173
```

---

## 🎯 Next Steps

After installation:

1. **Access the application**
   - Open: http://YOUR_SERVER_IP:5173

2. **Create admin account**
   - If you ran `npm run seed`:
     - Username: `admin`
     - Password: `Admin@123`
   - If not, sign up normally and promote to admin via database

3. **Test features**
   - Sign up as player
   - Make deposit
   - Join game room
   - Place bets
   - Check real-time updates

4. **Setup production** (optional)
   - Configure Nginx reverse proxy
   - Setup SSL certificates
   - Use PM2 for process management
   - Setup monitoring

---

## 🚀 Production Deployment with PM2

```bash
# Install PM2
sudo npm install -g pm2

# Start backend
cd /opt/reddy_anna/backend
pm2 start npm --name "reddy-backend" -- run dev

# Start frontend
cd /opt/reddy_anna/frontend
pm2 start npm --name "reddy-frontend" -- run dev

# Save PM2 config
pm2 save

# Auto-start on boot
pm2 startup

# Monitor
pm2 monit

# View logs
pm2 logs
```

---

## ✅ Installation Complete!

Your Reddy Anna Gaming Platform should now be running on:
- **Backend:** http://localhost:3001
- **Frontend:** http://localhost:5173
- **WebSocket:** ws://localhost:3001

Enjoy your premium gaming platform! 🎰👑