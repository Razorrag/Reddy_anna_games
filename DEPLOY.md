# 🚀 VPS Deployment Guide - Reddy Anna Gaming Platform

## Prerequisites

- VPS with Ubuntu 22.04+ (minimum 2GB RAM, 2 vCPU)
- Docker & Docker Compose installed
- Domain name (optional, for SSL)
- Git installed

---

## Quick Start (5 Minutes)

### 1. Connect to your VPS
```bash
ssh root@YOUR_VPS_IP
```

### 2. Clone the repository
```bash
cd /opt
git clone https://github.com/YOUR_REPO/reddy_anna.git
cd reddy_anna
```

### 3. Configure environment
```bash
# Copy example config
cp .env.production.example .env

# Edit with your values
nano .env
```

**Required changes in `.env`:**
```env
POSTGRES_PASSWORD=your_strong_db_password
REDIS_PASSWORD=your_strong_redis_password
JWT_SECRET=your_64_char_random_string
FRONTEND_URL=http://YOUR_VPS_IP
VITE_API_URL=http://YOUR_VPS_IP/api
VITE_WS_URL=ws://YOUR_VPS_IP
VITE_STREAM_URL=http://YOUR_VPS_IP/live
WHATSAPP_PAYMENT_NUMBER=+91XXXXXXXXXX
PAYMENT_UPI_ID=your-upi@bank
```

### 4. Build and start
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

### 5. Initialize database
```bash
# Run migrations
docker exec reddy-anna-backend npm run db:push

# Seed initial data (admin user, default game, settings)
docker exec reddy-anna-backend npm run db:seed
```

### 6. Access your application
- **Frontend:** http://YOUR_VPS_IP
- **API:** http://YOUR_VPS_IP/api
- **Admin Login:** username: `admin`, password: `admin123` (CHANGE IMMEDIATELY!)

---

## Detailed Setup

### Install Docker (if not installed)
```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version
```

### Firewall Configuration
```bash
# Allow required ports
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 1935/tcp  # RTMP Streaming
ufw allow 3333/tcp  # WebRTC Signaling
ufw enable
```

### Generate JWT Secret
```bash
openssl rand -base64 64
```

---

## Management Commands

### View logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f postgres
```

### Restart services
```bash
# All services
docker-compose -f docker-compose.prod.yml restart

# Single service
docker-compose -f docker-compose.prod.yml restart backend
```

### Stop services
```bash
docker-compose -f docker-compose.prod.yml down
```

### Update application
```bash
cd /opt/reddy_anna
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build
```

### Database backup
```bash
# Create backup
docker exec reddy-anna-postgres pg_dump -U postgres reddy_anna > backup_$(date +%Y%m%d).sql

# Restore backup
cat backup_20241201.sql | docker exec -i reddy-anna-postgres psql -U postgres reddy_anna
```

### Enter container shell
```bash
docker exec -it reddy-anna-backend sh
docker exec -it reddy-anna-postgres psql -U postgres reddy_anna
```

---

## SSL Setup (Optional but Recommended)

### Using Certbot (Let's Encrypt)
```bash
# Install certbot
apt install certbot -y

# Get certificate (stop nginx first)
docker-compose -f docker-compose.prod.yml stop nginx
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy certificates
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./nginx/ssl/
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./nginx/ssl/

# Uncomment SSL lines in nginx/nginx.prod.conf
# Then restart nginx
docker-compose -f docker-compose.prod.yml up -d nginx
```

### Auto-renewal
```bash
# Add to crontab
crontab -e

# Add this line:
0 3 * * * certbot renew --quiet && docker-compose -f /opt/reddy_anna/docker-compose.prod.yml restart nginx
```

---

## Streaming Setup (OvenMediaEngine)

### RTMP Stream URL for OBS/Streaming Software
```
Server: rtmp://YOUR_VPS_IP:1935/live
Stream Key: game_YOUR_GAME_ID
```

### Player URLs
- **LL-HLS (Low Latency):** `http://YOUR_VPS_IP/live/game_GAME_ID/llhls.m3u8`
- **HLS:** `http://YOUR_VPS_IP/live/game_GAME_ID/playlist.m3u8`
- **WebRTC:** `ws://YOUR_VPS_IP:3333/live/game_GAME_ID`

---

## Troubleshooting

### Container not starting
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs backend

# Common issues:
# - Database not ready: wait for postgres health check
# - Port conflict: check if ports 80, 3001 are free
```

### Database connection error
```bash
# Check postgres is running
docker ps | grep postgres

# Check connection
docker exec reddy-anna-backend npm run db:check
```

### Frontend not loading
```bash
# Check nginx logs
docker-compose -f docker-compose.prod.yml logs nginx

# Verify frontend build
docker exec reddy-anna-frontend ls -la /usr/share/nginx/html
```

### WebSocket not connecting
```bash
# Check backend WebSocket endpoint
curl -i http://YOUR_VPS_IP/socket.io/

# Verify nginx WebSocket config
grep -A 10 "socket.io" nginx/nginx.prod.conf
```

---

## Performance Optimization

### For high traffic (1000+ concurrent users)
```bash
# Increase Docker resources in docker-compose.prod.yml
# backend: memory 1G
# postgres: memory 1G
# redis: memory 512M

# Scale backend (if needed)
docker-compose -f docker-compose.prod.yml up -d --scale backend=2
```

### Monitor resources
```bash
# Docker stats
docker stats

# System resources
htop
```

---

## Security Checklist

- [ ] Change default admin password immediately
- [ ] Use strong passwords for POSTGRES and REDIS
- [ ] Use a random 64+ character JWT_SECRET
- [ ] Enable SSL/HTTPS in production
- [ ] Configure firewall (ufw)
- [ ] Keep Docker and system updated
- [ ] Regular database backups
- [ ] Monitor logs for suspicious activity

---

## Support

For issues:
1. Check logs: `docker-compose -f docker-compose.prod.yml logs`
2. Verify environment variables in `.env`
3. Ensure all required ports are open
4. Check disk space: `df -h`

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`
- ⚠️ **CHANGE IMMEDIATELY AFTER FIRST LOGIN!**
