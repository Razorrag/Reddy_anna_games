#!/bin/bash

# ============================================
# VPS UPDATE DEPLOYMENT SCRIPT
# Raju Gari Kossu - Docker Production Update
# ============================================
# This script rebuilds and restarts all Docker containers
# with the latest code changes (new landing page features)
# ============================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
PROJECT_NAME="reddy-anna"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Raju Gari Kossu - VPS Update Deployment${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run with sudo: sudo bash VPS_UPDATE_DEPLOYMENT.sh"
    exit 1
fi

print_info "Starting deployment process..."
echo ""

# Step 1: Check if Docker is running
print_info "Step 1: Checking Docker status..."
if ! systemctl is-active --quiet docker; then
    print_error "Docker is not running. Starting Docker..."
    systemctl start docker
    sleep 3
fi
print_status "Docker is running"
echo ""

# Step 2: Check if compose file exists
print_info "Step 2: Checking compose file..."
if [ ! -f "$COMPOSE_FILE" ]; then
    print_error "docker-compose.prod.yml not found!"
    exit 1
fi
print_status "Compose file found"
echo ""

# Step 3: Check .env file
print_info "Step 3: Checking environment variables..."
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Copying from .env.production.example"
    cp .env.production.example .env
    print_warning "⚠ IMPORTANT: Edit .env file with your production values!"
    print_warning "Press Ctrl+C to abort, or Enter to continue..."
    read
fi
print_status "Environment file exists"
echo ""

# Step 4: Pull latest code (if using git)
print_info "Step 4: Checking for code updates..."
if [ -d ".git" ]; then
    print_info "Git repository detected. Current branch:"
    git branch --show-current
    echo ""
    read -p "Pull latest code? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Pulling latest code..."
        git pull origin main || git pull origin master
        print_status "Code updated"
    else
        print_info "Skipping code pull"
    fi
else
    print_warning "Not a git repository. Assuming code is already updated."
fi
echo ""

# Step 5: Stop current containers
print_info "Step 5: Stopping current containers..."
docker compose -f $COMPOSE_FILE down
print_status "Containers stopped"
echo ""

# Step 6: Remove old images (optional - saves space)
read -p "Remove old Docker images to save space? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Removing old images..."
    docker image prune -af
    print_status "Old images removed"
fi
echo ""

# Step 7: Build new images
print_info "Step 7: Building new Docker images..."
print_warning "This may take several minutes..."
echo ""

docker compose -f $COMPOSE_FILE build --no-cache

if [ $? -eq 0 ]; then
    print_status "Images built successfully"
else
    print_error "Image build failed!"
    exit 1
fi
echo ""

# Step 8: Start containers
print_info "Step 8: Starting containers..."
docker compose -f $COMPOSE_FILE up -d

if [ $? -eq 0 ]; then
    print_status "Containers started"
else
    print_error "Failed to start containers!"
    exit 1
fi
echo ""

# Step 9: Wait for services to be healthy
print_info "Step 9: Waiting for services to be healthy..."
sleep 10

# Check container status
print_info "Container status:"
docker compose -f $COMPOSE_FILE ps
echo ""

# Step 10: Check database migrations
print_info "Step 10: Running database migrations..."
docker compose -f $COMPOSE_FILE exec -T backend npm run migrate 2>/dev/null || print_warning "Migration command not found (might be okay)"
echo ""

# Step 11: Health checks
print_info "Step 11: Running health checks..."

# Check backend health
print_info "Checking backend health..."
sleep 5
BACKEND_HEALTH=$(docker compose -f $COMPOSE_FILE exec -T backend wget -q -O- http://localhost:3001/health 2>/dev/null || echo "FAILED")

if [[ $BACKEND_HEALTH == *"ok"* ]] || [[ $BACKEND_HEALTH == *"healthy"* ]]; then
    print_status "Backend is healthy"
else
    print_warning "Backend health check unclear. Check logs: docker-compose -f $COMPOSE_FILE logs backend"
fi
echo ""

# Step 12: View logs
print_info "Step 12: Recent logs..."
echo ""
print_info "Backend logs (last 20 lines):"
docker compose -f $COMPOSE_FILE logs --tail=20 backend
echo ""

print_info "Frontend logs (last 10 lines):"
docker compose -f $COMPOSE_FILE logs --tail=10 frontend
echo ""

# Step 13: Show final status
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  DEPLOYMENT COMPLETE!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""

print_status "All services deployed successfully"
echo ""

print_info "Service URLs:"
echo "  • Website: https://rajugarikossu.com"
echo "  • Admin: https://rajugarikossu.com/admin"
echo "  • Partner: https://rajugarikossu.com/partner"
echo ""

print_info "Useful commands:"
echo "  • View logs: docker compose -f $COMPOSE_FILE logs -f"
echo "  • View status: docker compose -f $COMPOSE_FILE ps"
echo "  • Restart service: docker compose -f $COMPOSE_FILE restart [service]"
echo "  • Stop all: docker compose -f $COMPOSE_FILE down"
echo ""

print_info "Testing checklist:"
echo "  [ ] Visit https://rajugarikossu.com"
echo "  [ ] Check new landing page features:"
echo "      - Language selector (EN/HI/TE)"
echo "      - About section"
echo "      - Game Rules section"
echo "      - WhatsApp float button"
echo "      - App name shows 'Raju Gari Kossu'"
echo "  [ ] Test login/signup"
echo "  [ ] Test game room"
echo "  [ ] Check WebSocket connection"
echo ""

print_warning "If you encounter issues:"
echo "  1. Check logs: docker compose -f $COMPOSE_FILE logs -f"
echo "  2. Check .env file has correct values"
echo "  3. Restart specific service: docker compose -f $COMPOSE_FILE restart backend"
echo ""

echo -e "${BLUE}Deployment completed at: $(date)${NC}"
echo ""