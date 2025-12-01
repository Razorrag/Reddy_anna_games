# 🖥️ VPS SERVER ANALYSIS COMMANDS

Complete guide to analyze your VPS server configuration and installed services.

---

## 📋 STEP 1: SYSTEM INFORMATION

### Basic System Info
```bash
# Operating System Details
cat /etc/os-release
uname -a

# CPU Information
lscpu
cat /proc/cpuinfo | grep "model name" | head -1

# Memory Information
free -h
cat /proc/meminfo | grep MemTotal

# Disk Space
df -h
lsblk

# Uptime and Load
uptime
top -bn1 | head -20
```

### Network Configuration
```bash
# IP Addresses
ip addr show
hostname -I

# Network Interfaces
ifconfig -a

# DNS Configuration
cat /etc/resolv.conf

# Firewall Status
sudo ufw status verbose
# OR if using iptables
sudo iptables -L -n -v

# Open Ports
sudo netstat -tulpn
# OR using ss
sudo ss -tulpn
```

---

## 🐳 STEP 2: DOCKER ANALYSIS

### Docker Installation Check
```bash
# Check if Docker is installed
docker --version
docker-compose --version

# Docker System Info
docker info

# Docker Disk Usage
docker system df
```

### Running Containers
```bash
# List all containers (running and stopped)
docker ps -a

# Container resource usage
docker stats --no-stream

# Container logs (replace <container_name> with actual name)
docker logs <container_name> --tail 50

# Inspect specific container
docker inspect <container_name>
```

### Docker Images
```bash
# List all images
docker images

# Image disk usage
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
```

### Docker Networks
```bash
# List networks
docker network ls

# Inspect network
docker network inspect bridge
```

### Docker Volumes
```bash
# List volumes
docker volume ls

# Volume disk usage
docker volume ls -q | xargs docker volume inspect --format '{{ .Name }}: {{ .Mountpoint }}'
```

---

## 📦 STEP 3: INSTALLED SERVICES

### Check Running Services
```bash
# All running services
sudo systemctl list-units --type=service --state=running

# Check specific services
sudo systemctl status nginx
sudo systemctl status postgresql
sudo systemctl status redis
sudo systemctl status docker
```

### PostgreSQL Analysis
```bash
# Check if PostgreSQL is installed
psql --version

# PostgreSQL status
sudo systemctl status postgresql

# List databases (if PostgreSQL is running)
sudo -u postgres psql -c "\l"

# Database disk usage
sudo du -sh /var/lib/postgresql/
```

### Redis Analysis
```bash
# Check if Redis is installed
redis-cli --version

# Redis status
sudo systemctl status redis

# Redis info
redis-cli info

# Redis memory usage
redis-cli info memory
```

### Nginx Analysis
```bash
# Check if Nginx is installed
nginx -v

# Nginx status
sudo systemctl status nginx

# Nginx configuration test
sudo nginx -t

# List Nginx sites
ls -la /etc/nginx/sites-enabled/
ls -la /etc/nginx/sites-available/

# View Nginx configuration
cat /etc/nginx/nginx.conf
```

### Node.js & NPM
```bash
# Check Node.js
node --version
npm --version

# Check for PM2 (process manager)
pm2 --version
pm2 list

# Check for running Node processes
ps aux | grep node
```

---

## 📂 STEP 4: FILE SYSTEM ANALYSIS

### Application Directories
```bash
# List all directories in /var/www
ls -la /var/www/

# List all directories in /home
ls -la /home/

# Find large directories (top 20)
du -h / 2>/dev/null | sort -rh | head -20

# Find large files (over 100MB)
find / -type f -size +100M -exec ls -lh {} \; 2>/dev/null | head -20
```

### Check for OvenMediaEngine
```bash
# Check if OME is running
ps aux | grep ovenmediaengine
ps aux | grep OvenMediaEngine

# Check OME installation directory
ls -la /opt/ovenmediaengine/ 2>/dev/null
ls -la /usr/local/ovenmediaengine/ 2>/dev/null

# Check OME configuration
find / -name "Server.xml" 2>/dev/null
```

### Application Files
```bash
# Find all Node.js applications
find /var/www /home -name "package.json" 2>/dev/null

# Find all Docker Compose files
find / -name "docker-compose.yml" 2>/dev/null

# Find all Nginx configurations
find /etc/nginx -type f -name "*.conf"
```

---

## 🔐 STEP 5: SECURITY & USERS

### User Accounts
```bash
# List all users
cat /etc/passwd | cut -d: -f1

# List users with login shell
cat /etc/passwd | grep -v nologin | grep -v false

# Currently logged in users
who
w
```

### SSH Configuration
```bash
# SSH configuration
cat /etc/ssh/sshd_config | grep -v "^#" | grep -v "^$"

# SSH keys
ls -la ~/.ssh/
```

### Firewall Rules
```bash
# UFW rules
sudo ufw status numbered

# Iptables rules
sudo iptables -L -n --line-numbers
sudo iptables -t nat -L -n
```

---

## 📊 STEP 6: LOGS & MONITORING

### System Logs
```bash
# Recent system logs
sudo journalctl -xe --no-pager | tail -100

# Nginx logs
sudo tail -50 /var/log/nginx/access.log
sudo tail -50 /var/log/nginx/error.log

# System log
sudo tail -100 /var/log/syslog

# Authentication log
sudo tail -50 /var/log/auth.log
```

### Cron Jobs
```bash
# System cron jobs
sudo crontab -l

# User cron jobs
crontab -l

# Cron directory
ls -la /etc/cron.d/
```

---

## 🎯 COMPLETE ANALYSIS SCRIPT

Save this as `analyze_vps.sh` and run it:

```bash
#!/bin/bash

echo "==================================="
echo "VPS COMPLETE ANALYSIS REPORT"
echo "==================================="
echo ""

echo "--- SYSTEM INFORMATION ---"
echo "OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d= -f2)"
echo "Kernel: $(uname -r)"
echo "CPU: $(lscpu | grep "Model name" | cut -d: -f2 | xargs)"
echo "Memory: $(free -h | grep Mem | awk '{print $2}')"
echo "Disk: $(df -h / | tail -1 | awk '{print $2}')"
echo ""

echo "--- DOCKER STATUS ---"
if command -v docker &> /dev/null; then
    echo "Docker Version: $(docker --version)"
    echo "Running Containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    echo "Docker Disk Usage:"
    docker system df
else
    echo "Docker not installed"
fi
echo ""

echo "--- RUNNING SERVICES ---"
sudo systemctl list-units --type=service --state=running | grep -E "(nginx|postgresql|redis|docker)"
echo ""

echo "--- NETWORK PORTS ---"
sudo netstat -tulpn | grep LISTEN | head -20
echo ""

echo "--- DISK USAGE ---"
df -h
echo ""

echo "--- LARGE DIRECTORIES ---"
du -sh /var/www/* 2>/dev/null
du -sh /home/* 2>/dev/null
echo ""

echo "Analysis complete!"
```

Run the script:
```bash
chmod +x analyze_vps.sh
sudo ./analyze_vps.sh > vps_analysis_report.txt
cat vps_analysis_report.txt
```

---

## 🔍 QUICK CHECK COMMANDS

### One-liner System Overview
```bash
echo "=== QUICK VPS OVERVIEW ===" && \
echo "OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d= -f2)" && \
echo "RAM: $(free -h | grep Mem | awk '{print $2 " total, " $3 " used"}')" && \
echo "Disk: $(df -h / | tail -1 | awk '{print $2 " total, " $3 " used"}')" && \
echo "Docker: $(docker ps --format '{{.Names}}' 2>/dev/null | wc -l) containers running" && \
echo "Services: $(sudo systemctl list-units --type=service --state=running | wc -l) services active"
```

### Check What's Using Ports
```bash
# Check common ports
for port in 80 443 5000 3000 5432 6379 1935 8080; do
    echo "Port $port: $(sudo lsof -i :$port 2>/dev/null | grep LISTEN || echo 'Not in use')"
done
```

---

## 📝 SAVE COMPLETE REPORT

Run all commands and save to file:
```bash
{
    echo "=== VPS ANALYSIS REPORT ==="
    echo "Date: $(date)"
    echo ""
    
    echo "=== SYSTEM INFO ==="
    cat /etc/os-release
    uname -a
    free -h
    df -h
    echo ""
    
    echo "=== DOCKER ==="
    docker --version 2>/dev/null || echo "Not installed"
    docker ps -a 2>/dev/null
    echo ""
    
    echo "=== SERVICES ==="
    sudo systemctl list-units --type=service --state=running
    echo ""
    
    echo "=== NETWORK ==="
    sudo netstat -tulpn
    echo ""
    
    echo "=== DISK USAGE ==="
    du -sh /var/www/* 2>/dev/null
    du -sh /home/* 2>/dev/null
    
} > vps_full_report.txt 2>&1

echo "Report saved to vps_full_report.txt"
```

After running all these commands, you'll have a complete understanding of:
- What operating system and resources you have
- What Docker containers are running
- What services are installed (Nginx, PostgreSQL, Redis, etc.)
- What ports are being used
- How much disk space is being used
- What applications are deployed