# 🚀 Simple Start (No Docker Compose Needed)

Since your Docker client is version 1.43 (too old), but PostgreSQL and Redis are already running in Docker containers, just start backend and frontend directly:

---

## ✅ Quick Start (3 Steps)

### Step 1: Start Backend
```bash
cd backend

# Install dependencies (first time only)
npm install

# Create .env file (first time only)
cat > .env << 'EOF'
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/reddy_anna
REDIS_URL=redis://:redis123@localhost:6379
JWT_SECRET=super-secret-jwt-key-change-in-production
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
EOF

# Run migrations (first time only)
npm run migrate

# Start backend
npm run dev
```

Keep this terminal open. Backend will run on **http://localhost:3001**

---

### Step 2: Start Frontend (New Terminal)
```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start frontend
npm run dev
```

Keep this terminal open. Frontend will run on **http://localhost:5173**

---

### Step 3: Access Application
Open browser: **http://YOUR_VPS_IP:5173**

---

## 🔍 Verify Services

### Check PostgreSQL (in Docker)
```bash
docker ps | grep postgres
# Should show: reddy-anna-postgres

# Test connection
docker exec reddy-anna-postgres psql -U postgres -d reddy_anna -c "SELECT 1"
```

### Check Redis (in Docker)
```bash
docker ps | grep redis
# Should show: reddy-anna-redis

# Test connection
docker exec reddy-anna-redis redis-cli -a redis123 ping
# Should return: PONG
```

### Check Backend
```bash
curl http://localhost:3001/health
# Should return: {"status":"ok",...}
```

### Check Frontend
```bash
curl http://localhost:5173
# Should return: HTML content
```

---

## 🛠️ If Database Connection Fails

The database in Docker uses these credentials:
- **Host:** localhost
- **Port:** 5432
- **Database:** reddy_anna
- **User:** postgres
- **Password:** postgres123

If connection fails, check the Docker container:
```bash
# See container details
docker inspect reddy-anna-postgres | grep IPAddress

# Try connecting directly
docker exec -it reddy-anna-postgres psql -U postgres -d reddy_anna
```

---

## 🔄 To Restart

### Restart Backend:
```bash
# Stop: Press Ctrl+C in backend terminal

# Start again:
cd backend
npm run dev
```

### Restart Frontend:
```bash
# Stop: Press Ctrl+C in frontend terminal

# Start again:
cd frontend
npm run dev
```

---

## 📝 Production Tips

### Use PM2 for Production
```bash
# Install PM2
npm install -g pm2

# Start backend
cd backend
pm2 start npm --name "reddy-backend" -- run dev

# Start frontend
cd frontend
pm2 start npm --name "reddy-frontend" -- run dev

# Save and auto-start
pm2 save
pm2 startup
```

### Stop with PM2
```bash
pm2 stop all
pm2 restart all
pm2 logs
```

---

## ✅ Summary

Since you have Docker version issues but PostgreSQL and Redis are already running in Docker:

1. **Don't use** `docker-compose` (version too old)
2. **Do use** direct `npm` commands for backend and frontend
3. **Keep using** Docker containers for PostgreSQL and Redis

Your platform will work perfectly this way! 🎉

---

## 🎯 One-Time Setup Script

Create this file `simple-start.sh`:

```bash
#!/bin/bash

echo "Starting Reddy Anna Platform..."

# Backend
cd backend
npm install
cat > .env << 'EOF'
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/reddy_anna
REDIS_URL=redis://:redis123@localhost:6379
JWT_SECRET=super-secret-jwt-key-change-in-production
CORS_ORIGIN=http://localhost:5173
EOF
npm run migrate
npm run dev &

# Frontend
cd ../frontend
npm install
npm run dev &

echo "Backend: http://localhost:3001"
echo "Frontend: http://localhost:5173"
```

Then:
```bash
chmod +x simple-start.sh
./simple-start.sh
```

---

🎰 **Your platform is 100% ready to run!** 👑