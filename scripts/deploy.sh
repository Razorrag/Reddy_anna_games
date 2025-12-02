#!/bin/bash

# =========================================
# Reddy Anna - VPS Deployment Script
# =========================================

set -e

echo "🚀 Starting Reddy Anna Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (sudo ./deploy.sh)${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}No .env file found. Creating from example...${NC}"
    if [ -f ".env.production.example" ]; then
        cp .env.production.example .env
        echo -e "${RED}⚠️  Please edit .env file with your configuration before continuing!${NC}"
        echo -e "${YELLOW}Run: nano .env${NC}"
        exit 1
    else
        echo -e "${RED}No .env.production.example found!${NC}"
        exit 1
    fi
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker not found. Installing...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# Check Docker Compose
if ! docker compose version &> /dev/null; then
    echo -e "${YELLOW}Docker Compose not found. Installing...${NC}"
    apt update && apt install -y docker-compose-plugin
fi

echo -e "${GREEN}✓ Docker and Docker Compose ready${NC}"

# Create required directories
echo "Creating directories..."
mkdir -p nginx/ssl nginx/conf.d ome-config

# Stop existing containers
echo "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# Pull latest images
echo "Pulling latest images..."
docker-compose -f docker-compose.prod.yml pull

# Build and start containers
echo "Building and starting containers..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 10

# Check if postgres is ready
echo "Waiting for PostgreSQL..."
until docker exec reddy-anna-postgres pg_isready -U postgres > /dev/null 2>&1; do
    sleep 2
done
echo -e "${GREEN}✓ PostgreSQL ready${NC}"

# Run database migrations
echo "Running database migrations..."
docker exec reddy-anna-backend npm run db:push || {
    echo -e "${YELLOW}Migration command not found, trying drizzle-kit...${NC}"
    docker exec reddy-anna-backend npx drizzle-kit push || true
}

# Seed database
echo "Seeding database..."
docker exec reddy-anna-backend npm run db:seed || {
    echo -e "${YELLOW}Seed already run or command not found${NC}"
}

# Get server IP
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')

echo ""
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""
echo -e "Frontend: ${YELLOW}http://${SERVER_IP}${NC}"
echo -e "API:      ${YELLOW}http://${SERVER_IP}/api${NC}"
echo -e "WebSocket: ${YELLOW}ws://${SERVER_IP}/socket.io${NC}"
echo ""
echo -e "${YELLOW}Default Admin Login:${NC}"
echo -e "  Username: admin"
echo -e "  Password: admin123"
echo -e "${RED}⚠️  CHANGE PASSWORD IMMEDIATELY!${NC}"
echo ""
echo -e "View logs: ${GREEN}docker-compose -f docker-compose.prod.yml logs -f${NC}"
echo ""
