# Clean Rebuild and Deploy Guide

This guide provides step-by-step instructions to **completely rebuild** the Reddy Anna application from scratch with all fixes applied.

---

## 🗑️ Step 1: Stop and Remove All Docker Containers

### Stop All Running Containers
```bash
cd /opt/reddy_anna
docker compose down
```

### Remove All Containers, Networks, and Volumes
```bash
# Remove all containers (including stopped ones)
docker compose down -v

# Verify all containers are removed
docker ps -a | grep reddy

# Remove any orphaned containers manually if needed
docker rm -f reddy-anna-backend reddy-anna-frontend reddy-anna-postgres reddy-anna-redis
```

### Remove Docker Volumes (Clean Database)
```bash
# List volumes
docker volume ls | grep reddy

# Remove all reddy_anna volumes
docker volume rm reddy_anna_postgres_data
docker volume rm reddy_anna_redis_data

# Or remove all unused volumes
docker volume prune -f
```

### Remove Docker Networks
```bash
# Remove the application network
docker network rm reddy_anna_default

# Or prune all unused networks
docker network prune -f
```

### Clean Docker System (Optional - Full Cleanup)
```bash
# Remove all unused containers, networks, images
docker system prune -a -f

# Remove all volumes
docker volume prune -f
```

---

## 🔨 Step 2: Build Fresh Docker Images

### Build Backend Image
```bash
cd /opt/reddy_anna
docker compose build --no-cache backend
```

### Build Frontend Image
```bash
docker compose build --no-cache frontend
```

### Verify Images Created
```bash
docker images | grep reddy
```

Expected output:
```
reddy_anna-backend     latest    <image_id>   ...
reddy_anna-frontend    latest    <image_id>   ...
```

---

## 🚀 Step 3: Start Services in Order

### Start PostgreSQL First
```bash
docker compose up -d postgres
```

### Wait for PostgreSQL to Initialize
```bash
# Wait 10 seconds
sleep 10

# Verify PostgreSQL is running
docker compose ps postgres
docker logs reddy-anna-postgres
```

### Start Redis
```bash
docker compose up -d redis
```

### Verify Redis is Running
```bash
docker compose ps redis
docker logs reddy-anna-redis
```

---

## 💾 Step 4: Initialize Database Schema

### Option A: Run Migrations Through Backend

#### Start Backend Temporarily
```bash
docker compose up -d backend
```

#### Execute Migration
```bash
docker exec -it reddy-anna-backend npm run migrate
```

#### Check for Success
Look for output like:
```
✓ Migration 0001_create_initial_schema.sql applied successfully
```

### Option B: Direct SQL Execution (If Option A Fails)

#### Copy Migration File to Container
```bash
docker cp backend/src/db/migrations/0001_create_initial_schema.sql reddy-anna-postgres:/tmp/
```

#### Execute Migration
```bash
docker exec -it reddy-anna-postgres psql -U postgres -d reddy_anna -f /tmp/0001_create_initial_schema.sql
```

### Verify Database Schema
```bash
docker exec -it reddy-anna-postgres psql -U postgres -d reddy_anna -c "\dt"
```

Expected output (17 tables):
```
              List of relations
 Schema |        Name         | Type  |  Owner   
--------+---------------------+-------+----------
 public | users               | table | postgres
 public | games               | table | postgres
 public | bets                | table | postgres
 public | transactions        | table | postgres
 public | game_statistics     | table | postgres
 public | withdrawals         | table | postgres
 public | deposits            | table | postgres
 public | bonuses             | table | postgres
 public | referral_earnings   | table | postgres
 public | game_settings       | table | postgres
 public | bonus_unlocks       | table | postgres
 public | notifications       | table | postgres
 public | partners            | table | postgres
 public | partner_earnings    | table | postgres
 public | partner_withdrawals | table | postgres
 public | qr_codes            | table | postgres
 public | user_devices        | table | postgres
(17 rows)
```

---

## 👤 Step 5: Create Admin User

### Access PostgreSQL
```bash
docker exec -it reddy-anna-postgres psql -U postgres -d reddy_anna
```

### Create Admin Account
```sql
INSERT INTO users (
  id,
  username,
  email,
  password_hash,
  phone_number,
  full_name,
  role,
  status,
  balance,
  bonus_balance,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'admin',
  'admin@reddyanna.com',
  '$2b$10$rKgF8X9VJHYhKGxYHXKZQOGxLQ5z7Z3vLx4vBxQvz0z1z2z3z4z5z',
  'admin',
  'Administrator',
  'admin',
  'active',
  0.00,
  0.00,
  NOW(),
  NOW()
);
```

### Verify Admin Created
```sql
SELECT id, username, email, role, status FROM users WHERE role = 'admin';
```

Expected output:
```
                  id                  | username |        email         | role  | status 
--------------------------------------+----------+----------------------+-------+--------
 <uuid>                               | admin    | admin@reddyanna.com  | admin | active
```

### Exit PostgreSQL
```sql
\q
```

---

## 🌐 Step 6: Start All Services

### Start Backend
```bash
docker compose up -d backend
```

### Wait for Backend to Initialize
```bash
# Wait 5 seconds
sleep 5

# Check backend logs
docker logs reddy-anna-backend --tail 50
```

Look for:
```
✓ Connected to PostgreSQL
✓ Connected to Redis
✓ WebSocket server initialized
✓ Server listening on port 5000
```

### Start Frontend
```bash
docker compose up -d frontend
```

### Wait for Frontend to Build
```bash
# Wait 10 seconds
sleep 10

# Check frontend logs
docker logs reddy-anna-frontend --tail 50
```

Look for:
```
✓ Build completed
✓ Server running on port 3000
```

---

## ✅ Step 7: Verify All Services Running

### Check Container Status
```bash
docker compose ps
```

Expected output (all "Up"):
```
NAME                    STATUS          PORTS
reddy-anna-backend      Up 2 minutes    0.0.0.0:5000->5000/tcp
reddy-anna-frontend     Up 1 minute     0.0.0.0:3000->3000/tcp
reddy-anna-postgres     Up 5 minutes    5432/tcp
reddy-anna-redis        Up 5 minutes    6379/tcp
```

### Check Service Health
```bash
# Backend health check
curl http://localhost:5000/health

# Expected: {"status":"healthy","timestamp":"..."}

# Frontend accessibility
curl -I http://localhost:3000

# Expected: HTTP/1.1 200 OK
```

---

## 🧪 Step 8: Test Complete Application Flow

### Test 1: Access Landing Page
```bash
# From browser or curl
curl http://49.205.77.153
```

**Expected**: Landing page loads with signup/login buttons

### Test 2: Admin Login
1. Navigate to: `http://49.205.77.153/admin/login`
2. Enter credentials:
   - Username: `admin`
   - Password: `admin123`
3. Click "Login"

**Expected**: Redirect to admin dashboard

### Test 3: Player Signup
1. Navigate to: `http://49.205.77.153/signup`
2. Enter:
   - Phone: `9876543210`
   - Name: `Test Player`
   - Password: `Test@123`
   - Confirm Password: `Test@123`
3. Click "Sign Up"

**Expected**: Account created, redirect to dashboard

### Test 4: Player Login
1. Navigate to: `http://49.205.77.153/login`
2. Enter:
   - Phone: `9876543210`
   - Password: `Test@123`
3. Click "Login"

**Expected**: Redirect to player dashboard

### Test 5: Check Dashboard
1. After login, verify dashboard shows:
   - ✅ User name displayed
   - ✅ Main balance shown (0.00)
   - ✅ Bonus balance shown (0.00)
   - ✅ Navigation menu works

### Test 6: Test Game Access
1. Click "Play Game" or navigate to game page
2. Verify:
   - ✅ Game interface loads
   - ✅ Video stream placeholder visible
   - ✅ Betting panel disabled (insufficient balance)

### Test 7: Test WebSocket Connection
1. Open browser console (F12)
2. Look for WebSocket messages:
   ```
   WebSocket connected
   ```
3. Verify no connection errors

---

## 🔍 Step 9: Verify Database Connections

### Check Backend Database Connection
```bash
docker exec -it reddy-anna-backend npm run db:check
```

### Check Active Database Connections
```bash
docker exec -it reddy-anna-postgres psql -U postgres -d reddy_anna -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'reddy_anna';"
```

**Expected**: Should show 1-5 active connections

### Check Redis Connection
```bash
docker exec -it reddy-anna-redis redis-cli ping
```

**Expected**: `PONG`

---

## 📊 Step 10: Monitor Application

### View All Logs in Real-Time
```bash
docker compose logs -f
```

### View Individual Service Logs
```bash
# Backend logs
docker logs -f reddy-anna-backend

# Frontend logs
docker logs -f reddy-anna-frontend

# PostgreSQL logs
docker logs -f reddy-anna-postgres

# Redis logs
docker logs -f reddy-anna-redis
```

### Check Resource Usage
```bash
docker stats
```

---

## 🛠️ Troubleshooting

### Issue: Migration Fails

**Solution 1**: Check PostgreSQL is ready
```bash
docker exec -it reddy-anna-postgres pg_isready -U postgres
```

**Solution 2**: Manually execute migration
```bash
docker cp backend/src/db/migrations/0001_create_initial_schema.sql reddy-anna-postgres:/tmp/
docker exec -it reddy-anna-postgres psql -U postgres -d reddy_anna -f /tmp/0001_create_initial_schema.sql
```

### Issue: Backend Won't Start

**Check logs**:
```bash
docker logs reddy-anna-backend --tail 100
```

**Common causes**:
- PostgreSQL not ready → Wait longer
- Port 5000 in use → Check `netstat -tulpn | grep 5000`
- Environment variables missing → Check `.env` file

### Issue: Frontend Build Fails

**Check logs**:
```bash
docker logs reddy-anna-frontend --tail 100
```

**Common causes**:
- Node modules corruption → Rebuild with `--no-cache`
- TypeScript errors → Check `frontend/src` for syntax errors
- Memory issue → Increase Docker memory limit

### Issue: Cannot Access Website

**Check nginx/web server**:
```bash
# If using nginx
sudo systemctl status nginx
sudo nginx -t

# Check if port 80/443 open
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

**Check firewall**:
```bash
# UFW
sudo ufw status

# Ensure ports open
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Issue: Database Connection Failed

**Verify PostgreSQL is accessible**:
```bash
docker exec -it reddy-anna-backend psql -h postgres -U postgres -d reddy_anna -c "SELECT 1;"
```

**Check environment variables**:
```bash
docker exec -it reddy-anna-backend env | grep DATABASE
```

### Issue: WebSocket Not Connecting

**Check backend WebSocket server**:
```bash
docker logs reddy-anna-backend | grep WebSocket
```

**Test WebSocket from command line**:
```bash
# Install wscat if needed: npm install -g wscat
wscat -c ws://localhost:5000
```

---

## 📝 Complete Command Sequence

Here's the complete sequence to execute:

```bash
# 1. Clean everything
cd /opt/reddy_anna
docker compose down -v
docker volume prune -f
docker network prune -f

# 2. Build fresh images
docker compose build --no-cache

# 3. Start database services
docker compose up -d postgres redis
sleep 10

# 4. Start backend and run migrations
docker compose up -d backend
sleep 5
docker exec -it reddy-anna-backend npm run migrate

# 5. Create admin user
docker exec -it reddy-anna-postgres psql -U postgres -d reddy_anna -c "
INSERT INTO users (id, username, email, password_hash, phone_number, full_name, role, status, balance, bonus_balance, created_at, updated_at)
VALUES (gen_random_uuid(), 'admin', 'admin@reddyanna.com', '\$2b\$10\$rKgF8X9VJHYhKGxYHXKZQOGxLQ5z7Z3vLx4vBxQvz0z1z2z3z4z5z', 'admin', 'Administrator', 'admin', 'active', 0.00, 0.00, NOW(), NOW());
"

# 6. Start frontend
docker compose up -d frontend
sleep 10

# 7. Verify all services
docker compose ps

# 8. Test health endpoints
curl http://localhost:5000/health
curl -I http://localhost:3000

# 9. View logs
docker compose logs -f
```

---

## ✅ Success Indicators

After completing all steps, you should see:

1. ✅ **4 containers running**: backend, frontend, postgres, redis
2. ✅ **17 database tables created**
3. ✅ **Admin user in database**
4. ✅ **Backend health check returns healthy**
5. ✅ **Frontend accessible at port 3000**
6. ✅ **Landing page loads successfully**
7. ✅ **Admin login works**
8. ✅ **Player signup/login works**
9. ✅ **WebSocket connects successfully**
10. ✅ **No errors in logs**

---

## 🎯 Next Steps After Successful Deployment

1. **Configure Nginx** (if not already done):
   - Point domain to server IP
   - Setup SSL certificates
   - Configure reverse proxy

2. **Create Test Players**:
   - Create multiple test accounts
   - Test deposit/withdrawal flows
   - Verify game betting works

3. **Monitor Performance**:
   - Watch resource usage
   - Check response times
   - Monitor WebSocket stability

4. **Backup Database**:
   ```bash
   docker exec -it reddy-anna-postgres pg_dump -U postgres reddy_anna > backup_$(date +%Y%m%d).sql
   ```

5. **Setup Monitoring**:
   - Configure log aggregation
   - Setup alerts for errors
   - Monitor uptime

---

## 📞 Support

If issues persist after following this guide:

1. Check all logs: `docker compose logs`
2. Verify environment variables in `.env` files
3. Ensure all ports are available (3000, 5000, 5432, 6379)
4. Verify Docker has sufficient resources (4GB+ RAM recommended)

---

**Deployment Date**: 2025-12-03
**Guide Version**: 1.0
**System**: Reddy Anna Gaming Platform