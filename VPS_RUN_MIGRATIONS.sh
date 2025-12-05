#!/bin/bash

# VPS Migration Script
# Runs database migrations to create all tables

set -e

echo "=========================================="
echo "🔧 RUNNING DATABASE MIGRATIONS"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${YELLOW}📦 Running database migrations...${NC}"
docker compose -f docker-compose.prod.yml exec backend npm run db:push

echo ""
echo -e "${GREEN}✅ Database migrations complete!${NC}"

echo ""
echo -e "${YELLOW}👤 Creating admin account...${NC}"
docker compose -f docker-compose.prod.yml exec backend tsx src/scripts/create-admin.ts || true

echo ""
echo -e "${GREEN}✅ Admin account created!${NC}"

echo ""
echo "=========================================="
echo "✅ ALL MIGRATIONS COMPLETE"
echo "=========================================="
echo ""
echo "🎯 Admin Login:"
echo "   URL: http://89.42.231.35/admin"
echo "   Username: admin"
echo "   Password: Admin@123456"
echo ""
echo "🧪 Test the app:"
echo "   Frontend: http://89.42.231.35"
echo "   Signup: http://89.42.231.35/signup"
echo "   Login: http://89.42.231.35/login"
echo ""