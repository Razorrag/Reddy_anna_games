#!/bin/bash

# VPS Complete Fix Script
# Fixes trust proxy issue and runs database migrations

set -e

echo "=========================================="
echo "🔧 COMPLETE FIX DEPLOYMENT"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${YELLOW}📦 Step 1: Pulling latest code with fixes...${NC}"
cd /opt/reddy_anna
git pull origin main

echo ""
echo -e "${YELLOW}🏗️  Step 2: Rebuilding backend container...${NC}"
docker compose -f docker-compose.prod.yml build backend

echo ""
echo -e "${YELLOW}🚀 Step 3: Restarting backend...${NC}"
docker compose -f docker-compose.prod.yml up -d backend

echo ""
echo -e "${YELLOW}⏳ Step 4: Waiting for backend to start (15 seconds)...${NC}"
sleep 15

echo ""
echo -e "${YELLOW}📊 Step 5: Running database migrations...${NC}"
docker compose -f docker-compose.prod.yml exec backend npm run db:push

echo ""
echo -e "${YELLOW}👤 Step 6: Creating admin account...${NC}"
docker compose -f docker-compose.prod.yml exec backend tsx src/scripts/create-admin.ts || echo "Admin may already exist"

echo ""
echo -e "${GREEN}✅ ALL FIXES APPLIED!${NC}"

echo ""
echo "=========================================="
echo "🎯 YOUR APP IS NOW READY"
echo "=========================================="
echo ""
echo "🌐 Frontend: http://89.42.231.35"
echo "🔐 Admin Panel: http://89.42.231.35/admin"
echo "   Username: admin"
echo "   Password: Admin@123456"
echo ""
echo "🧪 Test Features:"
echo "   ✓ Signup new account"
echo "   ✓ Login"
echo "   ✓ Place bets"
echo "   ✓ Admin dashboard"
echo ""
echo "📊 Check status:"
echo "   docker compose -f docker-compose.prod.yml ps"
echo ""
echo "📝 View logs:"
echo "   docker compose -f docker-compose.prod.yml logs -f"
echo ""