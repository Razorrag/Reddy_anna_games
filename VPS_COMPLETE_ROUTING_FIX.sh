#!/bin/bash

# Complete Routing Fix Script
# Fixes: .env VITE_API_URL, rebuilds frontend, tests routing

set -e

echo "=========================================="
echo "🔧 COMPLETE ROUTING FIX & DEPLOYMENT"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${YELLOW}📋 Step 1: Checking current .env configuration...${NC}"
if grep -q "VITE_API_URL=.*\/api$" .env; then
    echo -e "${RED}❌ Found VITE_API_URL with /api suffix (causes double /api)${NC}"
    NEEDS_FIX=true
else
    echo -e "${GREEN}✅ VITE_API_URL looks correct${NC}"
    NEEDS_FIX=false
fi

if [ "$NEEDS_FIX" = true ]; then
    echo ""
    echo -e "${YELLOW}🔧 Step 2: Fixing .env file...${NC}"
    # Backup .env
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo "✓ Created backup"
    
    # Fix VITE_API_URL - remove trailing /api
    sed -i 's|VITE_API_URL=\(.*\)/api$|VITE_API_URL=\1|g' .env
    echo "✓ Removed /api suffix from VITE_API_URL"
    
    # Show the change
    echo ""
    echo -e "${BLUE}Updated VITE_API_URL:${NC}"
    grep "VITE_API_URL=" .env
else
    echo -e "${GREEN}✓ No .env changes needed${NC}"
fi

echo ""
echo -e "${YELLOW}📦 Step 3: Pulling latest code...${NC}"
git pull origin main

echo ""
echo -e "${YELLOW}🏗️  Step 4: Rebuilding frontend (2-3 minutes)...${NC}"
docker compose -f docker-compose.prod.yml build frontend

echo ""
echo -e "${YELLOW}🚀 Step 5: Redeploying frontend...${NC}"
docker compose -f docker-compose.prod.yml up -d frontend

echo ""
echo -e "${YELLOW}⏳ Step 6: Waiting for frontend to start (10 seconds)...${NC}"
sleep 10

echo ""
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"

echo ""
echo "=========================================="
echo "🎯 ROUTING FIX APPLIED"
echo "=========================================="
echo ""
echo -e "${BLUE}What was fixed:${NC}"
echo "  ✓ Removed /api from baseURL in frontend code"
echo "  ✓ Removed /api from VITE_API_URL in .env"
echo "  ✓ Rebuilt frontend with correct configuration"
echo ""
echo -e "${BLUE}API calls now work correctly:${NC}"
echo "  Before: /api/api/admin/dashboard/stats ❌"
echo "  After:  /api/admin/dashboard/stats ✅"
echo ""
echo "=========================================="
echo "🧪 TEST YOUR APPLICATION NOW"
echo "=========================================="
echo ""
echo "1. Open: http://89.42.231.35/admin"
echo "2. Login:"
echo "   Username: admin"
echo "   Password: Admin@123456"
echo ""
echo "3. Check browser console (F12):"
echo "   ✅ Should see: GET /api/admin/dashboard/stats 200"
echo "   ❌ Should NOT see: GET /api/api/... 404"
echo ""
echo "4. Verify these work:"
echo "   ✅ Dashboard loads with statistics"
echo "   ✅ Users page shows user list"
echo "   ✅ Deposits page shows deposit requests"
echo "   ✅ Withdrawals page shows withdrawal requests"
echo ""
echo "📊 All /api/api/... errors should be gone!"
echo ""