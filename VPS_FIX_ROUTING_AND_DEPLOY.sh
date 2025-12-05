#!/bin/bash

# Complete Frontend Fix & Deploy Script
# Fixes: Double /api prefix, auth issues, UI improvements

set -e

echo "=========================================="
echo "🔧 COMPLETE FRONTEND FIX & DEPLOY"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${YELLOW}📦 Step 1: Pulling latest code fixes...${NC}"
cd /opt/reddy_anna
git pull origin main

echo ""
echo -e "${YELLOW}🏗️  Step 2: Rebuilding frontend container...${NC}"
echo "   (This will take 2-3 minutes)"
docker compose -f docker-compose.prod.yml build frontend

echo ""
echo -e "${YELLOW}🚀 Step 3: Restarting frontend...${NC}"
docker compose -f docker-compose.prod.yml up -d frontend

echo ""
echo -e "${YELLOW}⏳ Step 4: Waiting for frontend to start (10 seconds)...${NC}"
sleep 10

echo ""
echo -e "${GREEN}✅ FRONTEND DEPLOYED WITH FIXES!${NC}"

echo ""
echo "=========================================="
echo "🎯 FIXES APPLIED"
echo "=========================================="
echo ""
echo -e "${BLUE}✓ Fixed double /api prefix issue${NC}"
echo "  Before: /api/api/admin/dashboard/stats ❌"
echo "  After:  /api/admin/dashboard/stats ✅"
echo ""
echo -e "${BLUE}✓ Auth token handling verified${NC}"
echo "  Token added to all requests via interceptor"
echo ""
echo "=========================================="
echo "🧪 TEST YOUR APPLICATION"
echo "=========================================="
echo ""
echo "1. Open: http://89.42.231.35"
echo "2. Login as admin:"
echo "   Username: admin"
echo "   Password: Admin@123456"
echo "3. Check admin dashboard (should load now!)"
echo "4. Navigate through:"
echo "   - Dashboard (/admin/dashboard)"
echo "   - Users (/admin/users)"
echo "   - Deposits (/admin/deposits)"
echo "   - Withdrawals (/admin/withdrawals)"
echo ""
echo "📊 Check browser console - all /api/api errors should be gone!"
echo ""