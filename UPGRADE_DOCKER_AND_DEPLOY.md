# Docker Upgrade & Deployment Guide

## Issue: Docker Client Version Too Old

```
Error: client version 1.43 is too old. Minimum supported API version is 1.44
```

---

## 🔧 Solution: Upgrade Docker

### Step 1: Check Current Version

```bash
docker --version
docker compose version
```

---

### Step 2: Upgrade Docker (Ubuntu)

#### Option A: Quick Upgrade (Recommended)

```bash
# Remove old docker-compose
sudo rm /usr/local/bin/docker-compose 2>/dev/null || true

# Update Docker Engine
sudo apt-get update
sudo apt-get install --only-upgrade docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verify new version
docker --version
docker compose version
```

#### Option B: Complete Reinstall (If needed)

```bash
# Remove old Docker
sudo apt-get remove docker docker-engine docker.io containerd runc

# Update system
sudo apt-get update
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

#### Option C: Use docker-compose V2 Syntax

If you can't upgrade, use the new syntax:

```bash
# Old syntax (docker-compose)
docker-compose down

# New syntax (docker compose)
docker compose down
```

---

### Step 3: Restart Docker Service

```bash
sudo systemctl restart docker
sudo systemctl status docker
```

---

### Step 4: Verify Upgrade

```bash
# Check versions (should show 1.44 or higher)
docker version
docker compose version

# Test docker works
docker ps
```

Expected output:
```
Docker version 24.0.x or higher
Docker Compose version v2.20.x or higher
```

---

## 🚀 Deployment After Upgrade

### Step 1: Stop Old Containers

```bash
cd /opt/reddy_anna

# Using new syntax
docker compose down

# Or if that doesn't work
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)
```

### Step 2: Clean Up (Optional but Recommended)

```bash
# Remove old images to ensure fresh build
docker compose down --rmi all --volumes

# Or manually
docker system prune -a --volumes
# Type 'y' when prompted
```

### Step 3: Rebuild Containers

```bash
# Build with new Docker version
docker compose build backend frontend

# Or build all services
docker compose build
```

### Step 4: Start Services

```bash
# Start in detached mode
docker compose up -d

# Or start with logs visible
docker compose up
```

### Step 5: Verify Running

```bash
# Check all containers are running
docker ps

# Check specific containers
docker ps | grep reddy-anna

# Check logs
docker logs reddy-anna-backend
docker logs reddy-anna-frontend
```

---

## 🔍 Troubleshooting

### Issue 1: Permission Denied

```bash
# Add your user to docker group
sudo usermod -aG docker $USER

# Apply changes (logout/login or run)
newgrp docker

# Test without sudo
docker ps
```

### Issue 2: Port Already in Use

```bash
# Check what's using ports
sudo lsof -i :3000
sudo lsof -i :3001
sudo lsof -i :5432

# Kill processes if needed
sudo kill -9 <PID>

# Or stop all Docker containers
docker stop $(docker ps -aq)
```

### Issue 3: Build Fails

```bash
# Clear build cache
docker builder prune -a

# Rebuild from scratch
docker compose build --no-cache backend frontend
```

### Issue 4: Database Connection Issues

```bash
# Check postgres is ready
docker logs reddy-anna-postgres

# Restart database
docker restart reddy-anna-postgres

# Wait 10 seconds then restart backend
sleep 10
docker restart reddy-anna-backend
```

---

## 📋 Complete Deployment Checklist

### Pre-Deployment

- [ ] Docker version >= 24.0
- [ ] Docker Compose version >= 2.20
- [ ] All TypeScript fixes applied
- [ ] Ports 3000, 3001, 5432, 6379 available

### Deployment

- [ ] Stop old containers: `docker compose down`
- [ ] Pull latest code (if using git)
- [ ] Build containers: `docker compose build`
- [ ] Start services: `docker compose up -d`
- [ ] Verify all containers running: `docker ps`

### Post-Deployment

- [ ] Check backend logs: `docker logs -f reddy-anna-backend`
- [ ] Check frontend logs: `docker logs -f reddy-anna-frontend`
- [ ] Test frontend: `curl http://localhost:3000`
- [ ] Test backend API: `curl http://localhost:3001/api/health`
- [ ] Access in browser: `http://YOUR_VPS_IP:3000`

---

## 🎯 Quick Commands Reference

### Docker Compose V2 (New Syntax)

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# Build services
docker compose build

# View logs
docker compose logs -f [service_name]

# Restart service
docker compose restart [service_name]

# Execute command in container
docker compose exec [service_name] [command]
```

### Container Management

```bash
# List containers
docker ps

# Stop all containers
docker stop $(docker ps -aq)

# Remove all containers
docker rm $(docker ps -aq)

# View logs
docker logs -f [container_name]

# Execute command
docker exec -it [container_name] bash

# Restart container
docker restart [container_name]
```

### System Cleanup

```bash
# Remove unused containers, networks, images
docker system prune

# Remove everything including volumes
docker system prune -a --volumes

# Remove specific images
docker rmi [image_name]

# Remove specific volumes
docker volume rm [volume_name]
```

---

## 🚀 Final Deployment Command

After upgrading Docker, run this single command:

```bash
cd /opt/reddy_anna && \
docker compose down && \
docker compose build backend frontend && \
docker compose up -d && \
docker ps
```

---

## ✅ Expected Result

After successful deployment, you should see:

```
[+] Running 5/5
 ✔ Container reddy-anna-postgres    Started
 ✔ Container reddy-anna-redis       Started
 ✔ Container reddy-anna-ome         Started
 ✔ Container reddy-anna-backend     Started
 ✔ Container reddy-anna-frontend    Started
```

### Access Your Application

- **Frontend**: http://YOUR_VPS_IP:3000
- **Backend API**: http://YOUR_VPS_IP:3001
- **Database**: localhost:5432 (internal)

---

## 📊 Monitoring

### View Real-time Logs

```bash
# All services
docker compose logs -f

# Specific service
docker logs -f reddy-anna-backend
docker logs -f reddy-anna-frontend

# Last 100 lines
docker logs --tail 100 reddy-anna-backend
```

### Check Resource Usage

```bash
# Container stats
docker stats

# Specific container
docker stats reddy-anna-backend
```

### Health Checks

```bash
# Backend health
curl http://localhost:3001/api/health

# Frontend
curl http://localhost:3000

# Database
docker exec reddy-anna-postgres pg_isready -U postgres
```

---

## 🎉 Success Indicators

Your deployment is successful when:

1. ✅ All 5 containers show "Up" status
2. ✅ Backend logs show "Server listening on port 3001"
3. ✅ Frontend accessible at http://YOUR_VPS_IP:3000
4. ✅ API responds at http://YOUR_VPS_IP:3001/api/health
5. ✅ No error messages in logs

---

## 📞 Support

If you encounter issues:

1. Check logs: `docker logs [container_name]`
2. Verify network: `docker network ls`
3. Check volumes: `docker volume ls`
4. Rebuild: `docker compose build --no-cache`
5. Fresh start: `docker compose down -v && docker compose up -d`

---

## 🏆 Congratulations!

Once all containers are running, your Reddy Anna gaming platform is live! 🎰👑

Test it out:
- Create an admin account
- Test player registration
- Try placing bets
- Check real-time updates
- Verify payment workflows

**Your premium gaming platform is now deployed!** 🚀