# 🐳 Docker Quick Start (VPS)

Since you already have Docker running with PostgreSQL and Redis, use these simple commands:

---

## ✅ Start Everything

```bash
# Start all services (PostgreSQL, Redis, Backend, Frontend)
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

That's it! Your application will be available at:
- **Frontend:** http://YOUR_VPS_IP:3000
- **Backend:** http://YOUR_VPS_IP:3001

---

## 🔍 Check What's Running

```bash
# See all containers
docker ps

# Expected output:
# - reddy-anna-postgres (port 5432)
# - reddy-anna-redis (port 6379)
# - reddy-anna-backend (port 3001)
# - reddy-anna-frontend (port 3000)
```

---

## 🛠️ Useful Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Just backend
docker-compose logs -f backend

# Just frontend
docker-compose logs -f frontend
```

### Restart Services
```bash
# Restart everything
docker-compose restart

# Restart just backend
docker-compose restart backend

# Restart just frontend
docker-compose restart frontend
```

### Stop Services
```bash
# Stop all
docker-compose down

# Stop but keep data
docker-compose stop
```

### Rebuild After Code Changes
```bash
# Rebuild and restart
docker-compose up -d --build

# Or rebuild specific service
docker-compose up -d --build backend
docker-compose up -d --build frontend
```

---

## 🗄️ Database Commands

### Run Migrations
```bash
# Access backend container
docker-compose exec backend npm run migrate

# Seed test data
docker-compose exec backend npm run seed
```

### Access Database
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d reddy_anna

# Run SQL commands
\dt                    # List tables
\d users              # Describe users table
SELECT * FROM users;  # Query users
\q                    # Quit
```

---

## 🔧 If You Updated the Code

After making changes to backend or frontend code:

```bash
# Rebuild and restart
docker-compose up -d --build backend frontend

# Or rebuild everything
docker-compose up -d --build
```

---

## ✅ Verify Everything Works

```bash
# Check backend
curl http://localhost:3001/health

# Check if frontend is running
curl http://localhost:3000

# Check database connection
docker-compose exec backend node -e "console.log('DB check')"
```

---

## 🎯 Your Setup

Based on your `docker-compose.yml`:
- ✅ PostgreSQL: Running in Docker (port 5432)
- ✅ Redis: Running in Docker (port 6379)  
- ✅ Backend: Configured (port 3001)
- ✅ Frontend: Configured (port 3000)
- ✅ OvenMediaEngine: For streaming (port 8080)

---

## 🚀 To Start Your Platform:

```bash
docker-compose up -d
```

Then access: **http://YOUR_VPS_IP:3000**

That's all you need! 🎉