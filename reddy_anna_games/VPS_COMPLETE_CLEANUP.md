# 🧹 VPS COMPLETE CLEANUP GUIDE

**⚠️ WARNING: This will delete EVERYTHING on your VPS. Make sure you have backups!**

This guide provides safe, step-by-step commands to completely clean your VPS server.

---

## 🔴 CRITICAL: BACKUP FIRST!

### Step 1: Backup Important Data

```bash
# Create backup directory
mkdir -p ~/backups/$(date +%Y%m%d_%H%M%S)
cd ~/backups/$(date +%Y%m%d_%H%M%S)

# Backup databases (if PostgreSQL exists)
if command -v pg_dump &> /dev/null; then
    sudo -u postgres pg_dumpall > all_databases.sql
    echo "PostgreSQL databases backed up"
fi

# Backup Nginx configurations
if [ -d /etc/nginx ]; then
    sudo tar -czf nginx_configs.tar.gz /etc/nginx/
    echo "Nginx configs backed up"
fi

# Backup application files
if [ -d /var/www ]; then
    sudo tar -czf var_www.tar.gz /var/www/
    echo "/var/www backed up"
fi

# Backup home directories
tar -czf home_directories.tar.gz /home/*/

# List backup files
echo "Backups created:"
ls -lh

# Download backups to local machine (run this on your local machine)
# scp -r root@YOUR_VPS_IP:~/backups/$(date +%Y%m%d)_* ./local_backup/
```

---

## 🗑️ PHASE 1: STOP ALL SERVICES

### Stop Docker Containers
```bash
# Stop all running containers
docker stop $(docker ps -aq) 2>/dev/null

# Verify all stopped
docker ps
```

### Stop System Services
```bash
# Stop Nginx
sudo systemctl stop nginx

# Stop PostgreSQL
sudo systemctl stop postgresql

# Stop Redis
sudo systemctl stop redis-server

# Stop Docker
sudo systemctl stop docker

# Stop any Node.js processes
pkill -9 node

# Stop PM2 processes
pm2 kill 2>/dev/null

# Stop OvenMediaEngine
sudo systemctl stop ovenmediaengine 2>/dev/null
pkill -9 OvenMediaEngine 2>/dev/null
```

---

## 🧹 PHASE 2: REMOVE DOCKER COMPLETELY

### Remove All Docker Resources
```bash
# Remove all containers (stopped and running)
docker rm -f $(docker ps -aq) 2>/dev/null

# Remove all images
docker rmi -f $(docker images -aq) 2>/dev/null

# Remove all volumes
docker volume rm $(docker volume ls -q) 2>/dev/null

# Remove all networks (except default)
docker network prune -f

# Remove all unused data
docker system prune -a -f --volumes

# Verify everything removed
docker ps -a
docker images
docker volume ls
```

### Uninstall Docker
```bash
# Stop Docker service
sudo systemctl stop docker
sudo systemctl stop docker.socket

# Remove Docker packages
sudo apt-get purge -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Remove Docker data
sudo rm -rf /var/lib/docker
sudo rm -rf /var/lib/containerd
sudo rm -rf /etc/docker
sudo rm -rf /usr/local/bin/docker-compose

# Remove Docker group
sudo groupdel docker 2>/dev/null
```

---

## 🗄️ PHASE 3: REMOVE DATABASES

### Remove PostgreSQL
```bash
# Stop PostgreSQL
sudo systemctl stop postgresql

# Remove PostgreSQL packages
sudo apt-get purge -y postgresql postgresql-*

# Remove PostgreSQL data
sudo rm -rf /var/lib/postgresql/
sudo rm -rf /etc/postgresql/
sudo rm -rf /var/log/postgresql/

# Remove PostgreSQL user
sudo deluser postgres 2>/dev/null
```

### Remove Redis
```bash
# Stop Redis
sudo systemctl stop redis-server

# Remove Redis packages
sudo apt-get purge -y redis-server redis-tools

# Remove Redis data
sudo rm -rf /var/lib/redis/
sudo rm -rf /etc/redis/
sudo rm -rf /var/log/redis/

# Remove Redis user
sudo deluser redis 2>/dev/null
```

---

## 🌐 PHASE 4: REMOVE WEB SERVERS

### Remove Nginx
```bash
# Stop Nginx
sudo systemctl stop nginx

# Remove Nginx packages
sudo apt-get purge -y nginx nginx-common nginx-full

# Remove Nginx files
sudo rm -rf /etc/nginx/
sudo rm -rf /var/log/nginx/
sudo rm -rf /var/www/html/
sudo rm -rf /usr/share/nginx/

# Remove Nginx user
sudo deluser www-data 2>/dev/null
```

### Remove Apache (if installed)
```bash
sudo systemctl stop apache2 2>/dev/null
sudo apt-get purge -y apache2 apache2-*
sudo rm -rf /etc/apache2/
sudo rm -rf /var/log/apache2/
```

---

## 🎥 PHASE 5: REMOVE OVENMEDIAENGINE

### Remove OvenMediaEngine
```bash
# Stop OvenMediaEngine
sudo systemctl stop ovenmediaengine 2>/dev/null
pkill -9 OvenMediaEngine 2>/dev/null

# Remove systemd service
sudo rm -f /etc/systemd/system/ovenmediaengine.service
sudo systemctl daemon-reload

# Remove installation directories
sudo rm -rf /opt/ovenmediaengine/
sudo rm -rf /usr/local/ovenmediaengine/
sudo rm -rf /etc/ovenmediaengine/

# Find and remove any remaining OME files
find / -name "*ovenmediaengine*" -o -name "*OvenMediaEngine*" 2>/dev/null | xargs sudo rm -rf
```

---

## 📦 PHASE 6: REMOVE NODE.JS & NPM

### Remove Node.js
```bash
# Stop all Node processes
pkill -9 node

# Remove PM2
npm uninstall -g pm2 2>/dev/null
sudo rm -rf ~/.pm2

# Remove Node.js packages
sudo apt-get purge -y nodejs npm

# Remove Node Version Manager (if using nvm)
rm -rf ~/.nvm
rm -rf ~/.npm

# Remove global npm packages
sudo rm -rf /usr/local/lib/node_modules/
sudo rm -rf /usr/local/bin/node
sudo rm -rf /usr/local/bin/npm
sudo rm -rf /usr/local/bin/npx
```

---

## 🗂️ PHASE 7: REMOVE APPLICATION FILES

### Remove All Web Applications
```bash
# Remove /var/www
sudo rm -rf /var/www/*

# Remove application files
sudo rm -rf /opt/*/
sudo rm -rf /srv/*/

# Remove user applications
sudo rm -rf /home/*/apps/
sudo rm -rf /home/*/projects/
sudo rm -rf /home/*/www/
```

---

## 🔐 PHASE 8: REMOVE SSL CERTIFICATES

### Remove Let's Encrypt / Certbot
```bash
# Stop certbot renewal
sudo systemctl stop certbot.timer 2>/dev/null

# Remove certbot
sudo apt-get purge -y certbot python3-certbot-nginx

# Remove SSL certificates
sudo rm -rf /etc/letsencrypt/
sudo rm -rf /var/lib/letsencrypt/
sudo rm -rf /var/log/letsencrypt/
```

---

## 🧼 PHASE 9: CLEAN PACKAGE MANAGER

### Clean APT
```bash
# Remove unused packages
sudo apt-get autoremove -y

# Clean package cache
sudo apt-get autoclean
sudo apt-get clean

# Remove package lists
sudo rm -rf /var/lib/apt/lists/*

# Update package database
sudo apt-get update
```

---

## 🗑️ PHASE 10: CLEAN TEMPORARY FILES

### Remove Temporary Files
```bash
# Clean /tmp
sudo rm -rf /tmp/*
sudo rm -rf /var/tmp/*

# Clean user cache
rm -rf ~/.cache/*

# Clean logs
sudo find /var/log -type f -name "*.log" -delete
sudo find /var/log -type f -name "*.gz" -delete
sudo find /var/log -type f -name "*.1" -delete

# Clean journal logs
sudo journalctl --vacuum-time=1d
```

---

## 👥 PHASE 11: REMOVE USERS (OPTIONAL)

### Remove Application Users
```bash
# List all users
cat /etc/passwd | cut -d: -f1

# Remove specific users (be careful!)
# sudo deluser --remove-home username

# Example: Remove common application users
sudo deluser --remove-home postgres 2>/dev/null
sudo deluser --remove-home redis 2>/dev/null
sudo deluser --remove-home www-data 2>/dev/null
```

---

## 🔥 COMPLETE CLEANUP SCRIPT

Save this as `complete_cleanup.sh`:

```bash
#!/bin/bash

echo "⚠️  COMPLETE VPS CLEANUP SCRIPT ⚠️"
echo "This will remove EVERYTHING!"
echo ""
read -p "Are you ABSOLUTELY sure? Type 'DELETE EVERYTHING' to confirm: " confirm

if [ "$confirm" != "DELETE EVERYTHING" ]; then
    echo "Aborted."
    exit 1
fi

echo "Starting complete cleanup in 5 seconds... Press Ctrl+C to cancel"
sleep 5

set -e  # Exit on error

echo "=== STOPPING SERVICES ==="
sudo systemctl stop nginx 2>/dev/null || true
sudo systemctl stop postgresql 2>/dev/null || true
sudo systemctl stop redis-server 2>/dev/null || true
sudo systemctl stop docker 2>/dev/null || true
pkill -9 node 2>/dev/null || true
pkill -9 OvenMediaEngine 2>/dev/null || true

echo "=== REMOVING DOCKER ==="
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm -f $(docker ps -aq) 2>/dev/null || true
docker rmi -f $(docker images -aq) 2>/dev/null || true
docker volume rm $(docker volume ls -q) 2>/dev/null || true
docker system prune -a -f --volumes 2>/dev/null || true
sudo apt-get purge -y docker-ce docker-ce-cli containerd.io 2>/dev/null || true
sudo rm -rf /var/lib/docker /var/lib/containerd /etc/docker

echo "=== REMOVING DATABASES ==="
sudo apt-get purge -y postgresql postgresql-* 2>/dev/null || true
sudo apt-get purge -y redis-server redis-tools 2>/dev/null || true
sudo rm -rf /var/lib/postgresql/ /etc/postgresql/ /var/lib/redis/ /etc/redis/

echo "=== REMOVING WEB SERVERS ==="
sudo apt-get purge -y nginx nginx-common nginx-full 2>/dev/null || true
sudo apt-get purge -y apache2 apache2-* 2>/dev/null || true
sudo rm -rf /etc/nginx/ /var/log/nginx/ /var/www/ /etc/apache2/

echo "=== REMOVING NODE.JS ==="
sudo apt-get purge -y nodejs npm 2>/dev/null || true
sudo rm -rf /usr/local/lib/node_modules/ /usr/local/bin/node /usr/local/bin/npm
rm -rf ~/.nvm ~/.npm ~/.pm2

echo "=== REMOVING OVENMEDIAENGINE ==="
sudo rm -rf /opt/ovenmediaengine/ /usr/local/ovenmediaengine/ /etc/ovenmediaengine/

echo "=== REMOVING SSL CERTIFICATES ==="
sudo apt-get purge -y certbot python3-certbot-nginx 2>/dev/null || true
sudo rm -rf /etc/letsencrypt/ /var/lib/letsencrypt/

echo "=== CLEANING PACKAGE MANAGER ==="
sudo apt-get autoremove -y
sudo apt-get autoclean
sudo apt-get clean
sudo rm -rf /var/lib/apt/lists/*

echo "=== CLEANING TEMPORARY FILES ==="
sudo rm -rf /tmp/* /var/tmp/*
sudo find /var/log -type f -name "*.log" -delete 2>/dev/null || true

echo "=== UPDATING SYSTEM ==="
sudo apt-get update

echo "=== CLEANUP COMPLETE ==="
echo "VPS is now clean!"
df -h
```

Run the script:
```bash
chmod +x complete_cleanup.sh
sudo ./complete_cleanup.sh
```

---

## ✅ VERIFICATION

After cleanup, verify everything is removed:

```bash
# Check Docker
docker --version 2>/dev/null || echo "✓ Docker removed"
docker ps 2>/dev/null || echo "✓ Docker removed"

# Check services
sudo systemctl status nginx 2>/dev/null || echo "✓ Nginx removed"
sudo systemctl status postgresql 2>/dev/null || echo "✓ PostgreSQL removed"
sudo systemctl status redis 2>/dev/null || echo "✓ Redis removed"

# Check Node.js
node --version 2>/dev/null || echo "✓ Node.js removed"

# Check disk space
df -h

# Check running processes
ps aux | grep -E "nginx|postgres|redis|node|docker|ome"
```

---

## 🔄 FINAL REBOOT

```bash
# Reboot to ensure all services are stopped
sudo reboot
```

After reboot, your VPS will be completely clean and ready for fresh installation!

---

## 📋 POST-CLEANUP CHECKLIST

- [ ] All Docker containers removed
- [ ] All Docker images removed
- [ ] PostgreSQL completely removed
- [ ] Redis completely removed
- [ ] Nginx completely removed
- [ ] OvenMediaEngine completely removed
- [ ] Node.js completely removed
- [ ] Application files removed
- [ ] SSL certificates removed
- [ ] Temporary files cleaned
- [ ] System rebooted
- [ ] Disk space verified

Your VPS is now clean and ready for the new recreation project!