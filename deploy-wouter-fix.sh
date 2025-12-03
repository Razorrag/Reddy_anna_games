#!/bin/bash

# Deployment script for Wouter Navigation Fix
# Run this on VPS: ssh root@89.42.231.35
# Then: cd /opt/reddy_anna && bash deploy-wouter-fix.sh

set -e  # Exit on error

echo "============================================"
echo "Deploying Wouter Navigation Fix to VPS"
echo "============================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Pull latest changes
echo -e "${YELLOW}Step 1: Pulling latest changes from GitHub...${NC}"
git pull origin main
echo -e "${GREEN}✓ Git pull completed${NC}"
echo ""

# Step 2: Stop frontend container
echo -e "${YELLOW}Step 2: Stopping frontend container...${NC}"
docker compose down frontend
echo -e "${GREEN}✓ Frontend container stopped${NC}"
echo ""

# Step 3: Rebuild frontend (no cache)
echo -e "${YELLOW}Step 3: Rebuilding frontend container (no cache)...${NC}"
docker compose build --no-cache frontend
echo -e "${GREEN}✓ Frontend rebuild completed${NC}"
echo ""

# Step 4: Start frontend container
echo -e "${YELLOW}Step 4: Starting frontend container...${NC}"
docker compose up -d frontend
echo -e "${GREEN}✓ Frontend container started${NC}"
echo ""

# Step 5: Wait for container to be ready
echo -e "${YELLOW}Step 5: Waiting for frontend to be ready (30 seconds)...${NC}"
sleep 30
echo -e "${GREEN}✓ Frontend should be ready${NC}"
echo ""

# Step 6: Check container status
echo -e "${YELLOW}Step 6: Checking container status...${NC}"
docker compose ps frontend
echo ""

# Step 7: Show recent logs
echo -e "${YELLOW}Step 7: Recent frontend logs:${NC}"
docker compose logs --tail=50 frontend
echo ""

# Step 8: Test frontend health
echo -e "${YELLOW}Step 8: Testing frontend health...${NC}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Frontend is responding (HTTP $HTTP_STATUS)${NC}"
else
    echo -e "${RED}✗ Frontend health check failed (HTTP $HTTP_STATUS)${NC}"
fi
echo ""

# Deployment summary
echo "============================================"
echo -e "${GREEN}Deployment Complete!${NC}"
echo "============================================"
echo ""
echo "Frontend URL: http://89.42.231.35:3000"
echo ""
echo "Next steps:"
echo "1. Open browser and test: http://89.42.231.35:3000"
echo "2. Check browser console for errors"
echo "3. Test signup flow"
echo "4. Test login flow"
echo ""
echo "To view live logs:"
echo "  docker compose logs -f frontend"
echo ""
echo "To restart if needed:"
echo "  docker compose restart frontend"
echo ""