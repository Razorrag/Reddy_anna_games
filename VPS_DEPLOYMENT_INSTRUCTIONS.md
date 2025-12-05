# 🚀 VPS Deployment Instructions - Docker Update

## Overview
Your VPS is already running with Docker. This guide will help you rebuild and restart with the new landing page features.

---

## 📦 What's New
- ✅ App name changed to "Raju Gari Kossu"
- ✅ Language selector (EN/HI/TE)
- ✅ About section
- ✅ Game Rules section
- ✅ WhatsApp float button + modal
- ✅ Auth-aware redirect

---

## 🎯 Quick Deployment Options

### Option 1: Full Rebuild (Recommended for major updates)
**Time:** ~5-10 minutes  
**Updates:** Backend + Frontend + All services

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Navigate to project
cd /path/to/reddy_anna

# Upload updated code via Git
git pull origin main

# OR upload via SCP from local machine
# scp -r ./* root@your-vps-ip:/path/to/reddy_anna/

# Make script executable
chmod +x VPS_UPDATE_DEPLOYMENT.sh

# Run full deployment
sudo bash VPS_UPDATE_DEPLOYMENT.sh
```

### Option 2: Frontend Only (Faster for landing page changes)
**Time:** ~2-3 minutes  
**Updates:** Only frontend container

```bash
# SSH into VPS
ssh root@your-vps-ip
cd /path/to/reddy_anna

# Upload new code
git pull origin main

# Make script executable
chmod +x VPS_UPDATE_FRONTEND_ONLY.sh

# Run frontend update
sudo bash VPS_UPDATE_FRONTEND_ONLY.sh
```

### Option 3: Manual Docker Commands
```bash
# Stop all services
docker-compose -f docker-compose.prod.yml down

# Rebuild everything
docker-compose -f docker-compose.prod.yml build --no-cache

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

---

## 📋 Pre-Deployment Checklist

Before deploying:
- [ ] Backup current `.env` file
- [ ] Ensure `.env` has production values (not localhost)
- [ ] Commit/push all local changes
- [ ] Test locally first (optional but recommended)

### Critical Environment Variables

Your `.env` file on VPS should have:
```env
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@postgres:5432/reddy_anna

# Backend
PORT=3001
JWT_SECRET=your-secret-key

# URLs (IMPORTANT: Use your domain, not localhost!)
FRONTEND_URL=https://rajugarikossu.com
VITE_API_URL=https://rajugarikossu.com/api
VITE_WS_URL=wss://rajugarikossu.com/ws

# CORS
CORS_ORIGIN=https://rajugarikossu.com
ALLOWED_ORIGINS=https://rajugarikossu.com,https://www.rajugarikossu.com

# WhatsApp
WHATSAPP_PAYMENT_NUMBER=+91XXXXXXXXXX
VITE_WHATSAPP_NUMBER=+91XXXXXXXXXX

# Redis
REDIS_PASSWORD=your-redis-password
```

---

## 🔍 Verification Steps

After deployment:

### 1. Check Docker Status
```bash
docker-compose -f docker-compose.prod.yml ps
```
All services should show "Up" status.

### 2. Check Backend Health
```bash
docker-compose -f docker-compose.prod.yml exec backend wget -q -O- http://localhost:3001/health
```
Should return `{"status":"ok"}` or similar.

### 3. Check Frontend
```bash
# Check if frontend container is running
docker ps | grep frontend

# View frontend logs
docker-compose -f docker-compose.prod.yml logs frontend
```

### 4. Test Website
Open browser and visit:
- https://rajugarikossu.com (should show new landing page)
- Check for:
  - ✓ "Raju Gari Kossu" app name
  - ✓ Language selector in nav
  - ✓ About section
  - ✓ Game Rules section
  - ✓ WhatsApp float button (bottom-right)

### 5. Test Auth Flow
- Sign up new account
- Login
- Should redirect to /game (not stay on landing)

### 6. Check Logs
```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f nginx
```

---

## 🐛 Troubleshooting

### Issue: Containers won't start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check .env file
cat .env

# Restart Docker
sudo systemctl restart docker
```

### Issue: "502 Bad Gateway"
```bash
# Check backend is running
docker-compose -f docker-compose.prod.yml ps backend

# Restart backend
docker-compose -f docker-compose.prod.yml restart backend

# Check backend logs
docker-compose -f docker-compose.prod.yml logs backend
```

### Issue: Old code still showing
```bash
# Force rebuild without cache
docker-compose -f docker-compose.prod.yml build --no-cache frontend

# Restart
docker-compose -f docker-compose.prod.yml up -d frontend

# Clear browser cache or use incognito
```

### Issue: WebSocket not connecting
Check `.env` has:
```env
VITE_WS_URL=wss://rajugarikossu.com/ws
```
Then rebuild frontend.

---

## 📊 Useful Commands

### View Running Containers
```bash
docker-compose -f docker-compose.prod.yml ps
```

### Restart Specific Service
```bash
docker-compose -f docker-compose.prod.yml restart frontend
docker-compose -f docker-compose.prod.yml restart backend
docker-compose -f docker-compose.prod.yml restart nginx
```

### View Logs (Follow Mode)
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### Execute Command in Container
```bash
# Access backend shell
docker-compose -f docker-compose.prod.yml exec backend sh

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npm run migrate
```

### Stop All Services
```bash
docker-compose -f docker-compose.prod.yml down
```

### Remove All (INCLUDING DATA - BE CAREFUL!)
```bash
# This will delete database data!
docker-compose -f docker-compose.prod.yml down -v
```

---

## 🔄 Rollback Procedure

If something goes wrong:

```bash
# Stop current version
docker-compose -f docker-compose.prod.yml down

# Restore previous code
git checkout <previous-commit-hash>

# Rebuild
docker-compose -f docker-compose.prod.yml build --no-cache

# Start
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📈 Performance Monitoring

### Check Resource Usage
```bash
docker stats
```

### Check Disk Space
```bash
df -h
docker system df
```

### Clean Up Unused Images
```bash
docker image prune -a
```

---

## 🎉 Success Checklist

After deployment, verify:
- [ ] Website loads at https://rajugarikossu.com
- [ ] New app name "Raju Gari Kossu" visible
- [ ] Language selector works (EN/HI/TE)
- [ ] About section displays
- [ ] Game Rules section displays
- [ ] WhatsApp float button appears (bottom-right)
- [ ] Login/Signup works
- [ ] Game room accessible
- [ ] Admin panel works
- [ ] No errors in browser console
- [ ] WebSocket connects successfully

---

## 📞 Support

If you need help:
1. Check logs: `docker-compose -f docker-compose.prod.yml logs -f`
2. Verify `.env` file configuration
3. Check all containers are running: `docker-compose -f docker-compose.prod.yml ps`
4. Test backend health: `curl http://localhost:3001/health`

---

**Created:** December 5, 2024  
**Last Updated:** December 5, 2024  
**Status:** Ready for VPS Deployment