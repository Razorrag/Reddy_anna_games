#!/bin/bash

# =========================================
# FIX: POSTGRES_PASSWORD NOT SET IN .env
# =========================================
# The DATABASE_URL is built from variables in docker-compose.prod.yml
# It REQUIRES POSTGRES_PASSWORD to be set!
# =========================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}  FIX: Environment Variables for Database${NC}"
echo -e "${BLUE}==========================================${NC}"
echo ""

cd /opt/reddy_anna

# Stop containers first
echo -e "${YELLOW}Stopping containers...${NC}"
docker compose -f docker-compose.prod.yml down

# Backup current .env
if [ -f ".env" ]; then
    cp .env ".env.backup.$(date +%Y%m%d_%H%M%S)"
    echo -e "${GREEN}✓${NC} Backed up existing .env"
fi

# Check what's currently in .env
echo ""
echo -e "${BLUE}Current .env contents (passwords hidden):${NC}"
echo "=================================="
if [ -f ".env" ]; then
    grep -E "^[A-Z_]+=" .env | sed 's/PASSWORD=.*/PASSWORD=***HIDDEN***/' | sed 's/SECRET=.*/SECRET=***HIDDEN***/' || echo "(empty or no matches)"
else
    echo "(no .env file found)"
fi
echo "=================================="
echo ""

# Generate a secure password if needed
SECURE_PASSWORD=$(openssl rand -base64 32 | tr -d '/+=' | head -c 32)

# Check and add required variables
echo -e "${YELLOW}Checking required environment variables...${NC}"
echo ""

# Function to add variable if missing
add_if_missing() {
    local VAR_NAME=$1
    local VAR_VALUE=$2
    local VAR_DESC=$3
    
    if ! grep -q "^${VAR_NAME}=" .env 2>/dev/null; then
        echo "${VAR_NAME}=${VAR_VALUE}" >> .env
        echo -e "${GREEN}✓${NC} Added ${VAR_NAME} (${VAR_DESC})"
    else
        echo -e "${BLUE}ℹ${NC} ${VAR_NAME} already exists"
    fi
}

# Create .env if doesn't exist
touch .env

# Add all required variables
echo "# Database Configuration" >> .env 2>/dev/null || true
add_if_missing "POSTGRES_USER" "postgres" "database user"
add_if_missing "POSTGRES_PASSWORD" "${SECURE_PASSWORD}" "CRITICAL - database password"
add_if_missing "POSTGRES_DB" "reddy_anna" "database name"

echo "" >> .env
echo "# Redis Configuration" >> .env 2>/dev/null || true
add_if_missing "REDIS_PASSWORD" "${SECURE_PASSWORD}" "redis password"

echo "" >> .env
echo "# JWT Configuration" >> .env 2>/dev/null || true
add_if_missing "JWT_SECRET" "$(openssl rand -base64 64 | tr -d '/+=' | head -c 64)" "jwt secret"

echo "" >> .env
echo "# Frontend URLs" >> .env 2>/dev/null || true
add_if_missing "FRONTEND_URL" "https://rajugarikossu.com" "frontend URL"
add_if_missing "VITE_API_URL" "/api" "API URL for frontend"
add_if_missing "VITE_WS_URL" "wss://rajugarikossu.com/ws" "WebSocket URL"
add_if_missing "VITE_STREAM_URL" "https://rajugarikossu.com/live" "streaming URL"

echo "" >> .env
echo "# WhatsApp Configuration" >> .env 2>/dev/null || true
add_if_missing "WHATSAPP_PAYMENT_NUMBER" "+919999999999" "WhatsApp number (UPDATE THIS!)"
add_if_missing "PAYMENT_UPI_ID" "payment@upi" "UPI ID (UPDATE THIS!)"

echo ""
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}  Environment variables configured!${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""

# Show the final DATABASE_URL that will be constructed
echo -e "${BLUE}DATABASE_URL will be constructed as:${NC}"
POSTGRES_USER=$(grep "^POSTGRES_USER=" .env | cut -d'=' -f2)
POSTGRES_DB=$(grep "^POSTGRES_DB=" .env | cut -d'=' -f2)
echo "  postgresql://${POSTGRES_USER:-postgres}:***@postgres:5432/${POSTGRES_DB:-reddy_anna}"
echo ""

# Start containers
echo -e "${YELLOW}Starting containers...${NC}"
docker compose -f docker-compose.prod.yml up -d

echo ""
echo -e "${YELLOW}Waiting 20 seconds for services to initialize...${NC}"
sleep 20

echo ""
echo -e "${BLUE}Container Status:${NC}"
docker compose -f docker-compose.prod.yml ps

echo ""
echo -e "${BLUE}Backend Logs (last 30 lines):${NC}"
docker compose -f docker-compose.prod.yml logs --tail=30 backend

echo ""
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}  Fix complete!${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""
echo -e "${BLUE}Look for these SUCCESS messages in logs above:${NC}"
echo "  ✓ Database connected successfully"
echo "  ✓ Server started on port 3001"
echo ""
echo -e "${YELLOW}If still failing, check:${NC}"
echo "  1. cat .env  (verify POSTGRES_PASSWORD is set)"
echo "  2. docker compose -f docker-compose.prod.yml logs postgres"
echo "  3. docker compose -f docker-compose.prod.yml logs -f backend"
echo ""
