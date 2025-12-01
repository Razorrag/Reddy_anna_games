#!/bin/bash

###############################################
# VPS INSTANT COMPLETE WIPE SCRIPT
# NO BACKUPS - COMPLETE DESTRUCTION
# Use: sudo bash VPS_INSTANT_WIPE.sh
###############################################

set -e

echo "╔════════════════════════════════════════╗"
echo "║   VPS INSTANT COMPLETE WIPE SCRIPT    ║"
echo "║   NO BACKUPS - TOTAL DESTRUCTION      ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "⚠️  This will DELETE EVERYTHING on your VPS!"
echo "⚠️  No backups will be created!"
echo ""
read -p "Type 'WIPE EVERYTHING' to confirm: " confirm

if [ "$confirm" != "WIPE EVERYTHING" ]; then
    echo "❌ Aborted."
    exit 1
fi

echo ""
echo "Starting complete wipe in 3 seconds..."
sleep 3

# Function to show progress
progress() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "⚡ $1"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# 1. STOP ALL SERVICES
progress "STOPPING ALL SERVICES"
systemctl stop nginx 2>/dev/null || true
systemctl stop apache2 2>/dev/null || true
systemctl stop postgresql 2>/dev/null || true
systemctl stop mysql 2>/dev/null || true
systemctl stop redis-server 2>/dev/null || true
systemctl stop redis 2>/dev/null || true
systemctl stop docker 2>/dev/null || true
systemctl stop docker.socket 2>/dev/null || true
systemctl stop containerd 2>/dev/null || true
systemctl stop ovenmediaengine 2>/dev/null || true
pkill -9 node 2>/dev/null || true
pkill -9 npm 2>/dev/null || true
pkill -9 pm2 2>/dev/null || true
pkill -9 OvenMediaEngine 2>/dev/null || true
pkill -9 nginx 2>/dev/null || true
pkill -9 postgres 2>/dev/null || true
pkill -9 redis 2>/dev/null || true
echo "✓ All services stopped"

# 2. DESTROY DOCKER
progress "DESTROYING DOCKER"
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm -f $(docker ps -aq) 2>/dev/null || true
docker rmi -f $(docker images -aq) 2>/dev/null || true
docker volume rm $(docker volume ls -q) 2>/dev/null || true
docker network rm $(docker network ls -q) 2>/dev/null || true
docker system prune -a -f --volumes 2>/dev/null || true
apt-get purge -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin 2>/dev/null || true
apt-get purge -y docker.io docker-doc docker-compose podman-docker containerd runc 2>/dev/null || true
rm -rf /var/lib/docker
rm -rf /var/lib/containerd
rm -rf /etc/docker
rm -rf /usr/local/bin/docker-compose
rm -rf /opt/docker
groupdel docker 2>/dev/null || true
echo "✓ Docker destroyed"

# 3. DESTROY DATABASES
progress "DESTROYING DATABASES"
apt-get purge -y postgresql postgresql-* 2>/dev/null || true
apt-get purge -y mysql-server mysql-client mysql-common 2>/dev/null || true
apt-get purge -y mariadb-server mariadb-client 2>/dev/null || true
apt-get purge -y redis-server redis-tools redis 2>/dev/null || true
apt-get purge -y mongodb mongodb-server 2>/dev/null || true
rm -rf /var/lib/postgresql
rm -rf /etc/postgresql
rm -rf /var/log/postgresql
rm -rf /var/lib/mysql
rm -rf /etc/mysql
rm -rf /var/lib/redis
rm -rf /etc/redis
rm -rf /var/lib/mongodb
deluser postgres 2>/dev/null || true
deluser mysql 2>/dev/null || true
deluser redis 2>/dev/null || true
deluser mongodb 2>/dev/null || true
echo "✓ Databases destroyed"

# 4. DESTROY WEB SERVERS
progress "DESTROYING WEB SERVERS"
apt-get purge -y nginx nginx-* 2>/dev/null || true
apt-get purge -y apache2 apache2-* 2>/dev/null || true
rm -rf /etc/nginx
rm -rf /var/log/nginx
rm -rf /var/www
rm -rf /usr/share/nginx
rm -rf /etc/apache2
rm -rf /var/log/apache2
deluser www-data 2>/dev/null || true
echo "✓ Web servers destroyed"

# 5. DESTROY NODE.JS & NPM
progress "DESTROYING NODE.JS"
pkill -9 node 2>/dev/null || true
apt-get purge -y nodejs npm 2>/dev/null || true
rm -rf /usr/local/lib/node_modules
rm -rf /usr/local/bin/node
rm -rf /usr/local/bin/npm
rm -rf /usr/local/bin/npx
rm -rf ~/.nvm
rm -rf ~/.npm
rm -rf ~/.pm2
rm -rf /root/.nvm
rm -rf /root/.npm
rm -rf /root/.pm2
find /home -name ".nvm" -exec rm -rf {} + 2>/dev/null || true
find /home -name ".npm" -exec rm -rf {} + 2>/dev/null || true
find /home -name ".pm2" -exec rm -rf {} + 2>/dev/null || true
echo "✓ Node.js destroyed"

# 6. DESTROY OVENMEDIAENGINE
progress "DESTROYING OVENMEDIAENGINE"
systemctl stop ovenmediaengine 2>/dev/null || true
pkill -9 OvenMediaEngine 2>/dev/null || true
rm -f /etc/systemd/system/ovenmediaengine.service
rm -rf /opt/ovenmediaengine
rm -rf /usr/local/ovenmediaengine
rm -rf /etc/ovenmediaengine
find / -name "*ovenmediaengine*" -o -name "*OvenMediaEngine*" 2>/dev/null | xargs rm -rf 2>/dev/null || true
systemctl daemon-reload
echo "✓ OvenMediaEngine destroyed"

# 7. DESTROY APPLICATION FILES
progress "DESTROYING APPLICATION FILES"
rm -rf /var/www/*
rm -rf /opt/*
rm -rf /srv/*
find /home -maxdepth 2 -type d \( -name "apps" -o -name "projects" -o -name "www" \) -exec rm -rf {} + 2>/dev/null || true
echo "✓ Application files destroyed"

# 8. DESTROY SSL CERTIFICATES
progress "DESTROYING SSL CERTIFICATES"
systemctl stop certbot.timer 2>/dev/null || true
apt-get purge -y certbot python3-certbot-nginx python3-certbot-apache 2>/dev/null || true
rm -rf /etc/letsencrypt
rm -rf /var/lib/letsencrypt
rm -rf /var/log/letsencrypt
echo "✓ SSL certificates destroyed"

# 9. DESTROY PYTHON & PHP
progress "DESTROYING PYTHON/PHP"
apt-get purge -y python3-pip python3-venv 2>/dev/null || true
apt-get purge -y php php-* 2>/dev/null || true
rm -rf /usr/local/lib/python*
rm -rf ~/.local/lib/python*
rm -rf /etc/php
echo "✓ Python/PHP destroyed"

# 10. CLEAN PACKAGE MANAGER
progress "CLEANING PACKAGE MANAGER"
apt-get autoremove -y 2>/dev/null || true
apt-get autoclean 2>/dev/null || true
apt-get clean 2>/dev/null || true
rm -rf /var/lib/apt/lists/*
echo "✓ Package manager cleaned"

# 11. DESTROY TEMPORARY FILES
progress "DESTROYING TEMPORARY FILES"
rm -rf /tmp/*
rm -rf /var/tmp/*
rm -rf ~/.cache/*
rm -rf /root/.cache/*
find /var/log -type f -name "*.log" -delete 2>/dev/null || true
find /var/log -type f -name "*.gz" -delete 2>/dev/null || true
find /var/log -type f -name "*.1" -delete 2>/dev/null || true
journalctl --vacuum-time=1d 2>/dev/null || true
echo "✓ Temporary files destroyed"

# 12. DESTROY SNAP PACKAGES (optional)
progress "DESTROYING SNAP PACKAGES"
snap list 2>/dev/null | tail -n +2 | awk '{print $1}' | xargs -I {} snap remove {} 2>/dev/null || true
apt-get purge -y snapd 2>/dev/null || true
rm -rf /snap
rm -rf /var/snap
rm -rf ~/snap
echo "✓ Snap packages destroyed"

# 13. UPDATE SYSTEM
progress "UPDATING SYSTEM"
apt-get update
echo "✓ System updated"

# Final statistics
progress "CLEANUP COMPLETE"
echo ""
echo "📊 FINAL STATISTICS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
df -h / | tail -1 | awk '{print "Disk Space:  " $3 " used / " $2 " total (" $5 " used)"}'
free -h | grep Mem | awk '{print "Memory:      " $3 " used / " $2 " total"}'
echo "Uptime:      $(uptime -p)"
echo ""
echo "✅ VPS IS NOW COMPLETELY CLEAN!"
echo ""
echo "🔄 RECOMMENDED: Reboot now with: sudo reboot"
echo ""