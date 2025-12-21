# 🚀 ANDAR BAHAR SYSTEM - DEPLOYMENT GUIDE

**Version:** 1.0  
**Date:** December 19, 2025  
**Estimated Deployment Time:** 30-45 minutes  
**Downtime Required:** 5-10 minutes

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### Prerequisites
- [ ] PostgreSQL 14+ running and accessible
- [ ] Node.js 18+ installed on server
- [ ] npm or yarn package manager
- [ ] Git repository access
- [ ] SSL certificates (for production)
- [ ] Environment variables configured
- [ ] Database backup completed
- [ ] Rollback plan reviewed

### Access Requirements
- [ ] Database admin credentials
- [ ] Server SSH access
- [ ] Domain/DNS configuration
- [ ] SSL certificate files
- [ ] CI/CD pipeline access (if applicable)

---

## 🗄️ DATABASE MIGRATION

### Step 1: Backup Current Database

```bash
# Create backup directory
mkdir -p backups/$(date +%Y%m%d)

# Backup database
pg_dump -h localhost -U postgres -d reddy_anna_db > backups/$(date +%Y%m%d)/pre_migration_backup.sql

# Verify backup
ls -lh backups/$(date +%Y%m%d)/pre_migration_backup.sql
```

### Step 2: Test Migration on Staging

```bash
# Restore backup to staging database
psql -h staging-db -U postgres -d staging_reddy_anna < backups/$(date +%Y%m%d)/pre_migration_backup.sql

# Run migration
cd backend
npm run db:migrate

# Verify migration
npm run db:verify
```

### Step 3: Run Production Migration

```bash
# Set production database URL
export DATABASE_URL="postgresql://user:password@prod-db:5432/reddy_anna_db"

# Run migration with transaction
psql $DATABASE_URL <<EOF
BEGIN;

-- Run migration script
\i drizzle/migrations/0001_add_card_tracking.sql

-- Verify tables created
SELECT COUNT(*) FROM game_cards;
SELECT current_card_position, expected_next_side, cards_dealt FROM game_rounds LIMIT 1;

-- If all good, commit
COMMIT;
EOF
```

### Step 4: Verify Migration

```bash
# Check new table exists
psql $DATABASE_URL -c "\d game_cards"

# Check new columns exist
psql $DATABASE_URL -c "\d game_rounds"

# Verify indexes
psql $DATABASE_URL -c "\di game_cards*"
```

---

## 🔧 BACKEND DEPLOYMENT

### Step 1: Deploy Backend Code

```bash
# Pull latest code
cd /var/www/reddy-anna-backend
git pull origin main

# Install dependencies
npm ci --production

# Build TypeScript
npm run build

# Copy environment file
cp .env.example .env
nano .env  # Configure production variables
```

### Step 2: Configure Environment Variables

```bash
# .env file
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/reddy_anna_db
JWT_SECRET=your-super-secret-jwt-key-change-this
CORS_ORIGIN=https://yourdomain.com
REDIS_URL=redis://localhost:6379
```

### Step 3: Run Database Migrations

```bash
npm run db:migrate
```

### Step 4: Restart Backend Service

```bash
# Using PM2
pm2 restart reddy-anna-api
pm2 save

# Or using systemd
sudo systemctl restart reddy-anna-api
sudo systemctl status reddy-anna-api
```

### Step 5: Verify Backend Health

```bash
# Check health endpoint
curl http://localhost:3000/health

# Check database connection
curl http://localhost:3000/api/health/db

# Check WebSocket connection
wscat -c ws://localhost:3000

# View logs
pm2 logs reddy-anna-api --lines 50
```

---

## 🎨 FRONTEND DEPLOYMENT

### Step 1: Build Frontend

```bash
cd /var/www/reddy-anna-frontend
git pull origin main

# Install dependencies
npm ci

# Build for production
npm run build

# Verify build
ls -lh dist/
```

### Step 2: Configure Environment Variables

```bash
# .env.production
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com
VITE_ENV=production
```

### Step 3: Deploy Build Files

```bash
# Copy to web server directory
sudo cp -r dist/* /var/www/html/

# Set permissions
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/
```

### Step 4: Configure Nginx

```nginx
# /etc/nginx/sites-available/reddy-anna
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;

    root /var/www/html;
    index index.html;

    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket Proxy
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 86400;
    }
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### Step 5: Restart Nginx

```bash
# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx
```

---

## ✅ POST-DEPLOYMENT VERIFICATION

### Step 1: Smoke Tests

```bash
# Frontend loads
curl -I https://yourdomain.com
# Expected: 200 OK

# API responds
curl https://api.yourdomain.com/health
# Expected: {"status":"ok","timestamp":"..."}

# WebSocket connects
wscat -c wss://api.yourdomain.com
# Expected: Connected
```

### Step 2: Feature Verification

#### Admin Panel Tests
1. ✅ Login as admin
2. ✅ Navigate to Game Control
3. ✅ Select opening card (52-card grid)
4. ✅ Confirm card selection modal
5. ✅ Start new round
6. ✅ Verify betting timer starts
7. ✅ Close betting
8. ✅ Deal cards (Bahar → Andar sequence)
9. ✅ Verify card display updates
10. ✅ Declare winner
11. ✅ Verify winner celebration
12. ✅ Check bet statistics

#### Player Tests
1. ✅ Login as player
2. ✅ Navigate to Game Room
3. ✅ Verify video stream loads
4. ✅ Wait for betting phase
5. ✅ Select bet amount
6. ✅ Place bet on Andar/Bahar
7. ✅ Verify bet confirmation
8. ✅ Check balance deduction
9. ✅ Watch card dealing
10. ✅ Verify card sequence display
11. ✅ See winner announcement
12. ✅ Check payout (if won)
13. ✅ Verify balance update

#### Betting Features Tests
1. ✅ Place bet
2. ✅ Click "Undo" - verify refund
3. ✅ Place multiple bets
4. ✅ Click "2x" - verify double
5. ✅ Complete round
6. ✅ Next round: Click "Rebet"
7. ✅ Verify bets replayed

### Step 3: Multi-User Test

```bash
# Open multiple browser windows
# Simulate 2-3 concurrent players
# All should see:
- Same opening card
- Same card sequence
- Same winner
- Correct individual payouts
```

### Step 4: Database Integrity Check

```sql
-- Verify card tracking
SELECT COUNT(*) FROM game_cards;
-- Expected: > 0

-- Verify card sequences
SELECT 
    r.id as round_id,
    r.round_number,
    gc.position,
    gc.side,
    gc.card,
    gc.is_winning_card
FROM game_rounds r
JOIN game_cards gc ON r.id = gc.round_id
ORDER BY r.created_at DESC, gc.position ASC
LIMIT 20;

-- Verify balance consistency
SELECT 
    u.username,
    u.balance,
    (SELECT COALESCE(SUM(CAST(amount AS NUMERIC)), 0) FROM bets WHERE user_id = u.id AND status = 'won') as total_won,
    (SELECT COALESCE(SUM(CAST(amount AS NUMERIC)), 0) FROM bets WHERE user_id = u.id) as total_bet
FROM users u
WHERE u.role = 'player'
LIMIT 10;
```

---

## 🔄 ROLLBACK PROCEDURE

If issues are detected, follow this rollback procedure:

### Step 1: Stop Services

```bash
pm2 stop reddy-anna-api
sudo systemctl stop nginx
```

### Step 2: Restore Database

```bash
# Drop new tables
psql $DATABASE_URL -c "DROP TABLE IF EXISTS game_cards CASCADE;"

# Restore from backup
psql $DATABASE_URL < backups/$(date +%Y%m%d)/pre_migration_backup.sql
```

### Step 3: Revert Code

```bash
# Backend
cd /var/www/reddy-anna-backend
git reset --hard HEAD~1
npm ci
npm run build

# Frontend
cd /var/www/reddy-anna-frontend
git reset --hard HEAD~1
npm ci
npm run build
sudo cp -r dist/* /var/www/html/
```

### Step 4: Restart Services

```bash
pm2 restart reddy-anna-api
sudo systemctl start nginx
```

### Step 5: Verify Rollback

```bash
curl https://yourdomain.com
curl https://api.yourdomain.com/health
```

---

## 📊 MONITORING & ALERTS

### Metrics to Monitor

```bash
# Backend metrics
pm2 monit  # CPU, Memory, Requests

# Database metrics
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# WebSocket connections
pm2 logs | grep "Client connected"
```

### Alert Thresholds
- ⚠️ CPU Usage > 80%
- ⚠️ Memory Usage > 90%
- ⚠️ Response Time > 1000ms
- ⚠️ Error Rate > 1%
- ⚠️ WebSocket Disconnects > 10/min
- ⚠️ Database Connections > 80% pool

---

## 🐛 TROUBLESHOOTING

### Issue: Cards Not Appearing

**Symptoms:** Admin deals cards but players don't see them

**Solution:**
```bash
# Check WebSocket connection
wscat -c wss://api.yourdomain.com

# Check browser console for errors
# Verify CORS settings in backend .env
```

### Issue: Incorrect Payouts

**Symptoms:** Players receive wrong payout amounts

**Solution:**
```sql
-- Check bet records
SELECT * FROM bets WHERE round_id = '<round_id>';

-- Verify payout calculations
SELECT 
    b.bet_side,
    b.bet_round,
    b.amount,
    b.payout_amount,
    r.winning_side,
    r.round_number
FROM bets b
JOIN game_rounds r ON b.round_id = r.id
WHERE b.status = 'won'
ORDER BY b.created_at DESC
LIMIT 10;
```

### Issue: Balance Inconsistency

**Symptoms:** User balance doesn't match transaction history

**Solution:**
```sql
-- Audit user balance
SELECT 
    u.id,
    u.username,
    u.balance as current_balance,
    COALESCE(SUM(CASE WHEN t.type = 'deposit' THEN CAST(t.amount AS NUMERIC) ELSE 0 END), 0) as total_deposits,
    COALESCE(SUM(CASE WHEN t.type = 'bet' THEN CAST(t.amount AS NUMERIC) ELSE 0 END), 0) as total_bets,
    COALESCE(SUM(CASE WHEN t.type = 'win' THEN CAST(t.amount AS NUMERIC) ELSE 0 END), 0) as total_wins
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id
WHERE u.id = '<user_id>'
GROUP BY u.id, u.username, u.balance;
```

### Issue: WebSocket Disconnects

**Symptoms:** Frequent disconnections, players miss updates

**Solution:**
```bash
# Check nginx timeouts
grep "proxy_read_timeout" /etc/nginx/sites-available/reddy-anna

# Increase if needed
proxy_read_timeout 86400;  # 24 hours

# Restart nginx
sudo systemctl reload nginx
```

---

## 📝 POST-DEPLOYMENT TASKS

### Immediate (Within 1 hour)
- [ ] Monitor error logs continuously
- [ ] Test all critical user flows
- [ ] Verify WebSocket stability
- [ ] Check database performance
- [ ] Monitor server resources

### Short Term (Within 24 hours)
- [ ] Review analytics data
- [ ] Check user feedback
- [ ] Monitor balance transactions
- [ ] Verify payout accuracy
- [ ] Review security logs

### Medium Term (Within 1 week)
- [ ] Performance optimization
- [ ] Database index tuning
- [ ] Load testing results
- [ ] User satisfaction survey
- [ ] Documentation updates

---

## 🎯 SUCCESS CRITERIA

Deployment is considered successful when:

- ✅ All smoke tests pass
- ✅ Admin can create rounds with real cards
- ✅ Players can place bets successfully
- ✅ Card sequence displays correctly
- ✅ Payouts calculate accurately
- ✅ Balance updates in real-time
- ✅ WebSocket connections stable
- ✅ No critical errors in logs
- ✅ Response times < 500ms
- ✅ Zero data loss

---

## 📞 SUPPORT CONTACTS

**Technical Issues:**
- DevOps Team: devops@company.com
- Backend Lead: backend@company.com
- Frontend Lead: frontend@company.com

**Database Issues:**
- DBA: dba@company.com

**Emergency Contact:**
- On-Call Engineer: +1-XXX-XXX-XXXX

---

## 📚 ADDITIONAL RESOURCES

- [System Architecture](./ANDAR_BAHAR_COMPLETE_IMPLEMENTATION_STATUS.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Database Schema](./backend/src/db/schema.ts)
- [Testing Guide](./backend/tests/integration/game-flow.test.ts)

---

**Deployment Checklist:**
- [ ] Pre-deployment backup completed
- [ ] Migration tested on staging
- [ ] Environment variables configured
- [ ] Code deployed (backend + frontend)
- [ ] Database migration executed
- [ ] Services restarted
- [ ] Smoke tests passed
- [ ] Feature verification completed
- [ ] Multi-user testing done
- [ ] Monitoring alerts configured
- [ ] Rollback procedure documented
- [ ] Team notified of deployment

**Deployment Status:** 🟢 READY FOR PRODUCTION
