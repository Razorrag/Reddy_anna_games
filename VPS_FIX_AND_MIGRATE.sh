#!/bin/bash

# Fix database password and run migrations

set -e

echo "=========================================="
echo "🔧 FIX DATABASE & RUN MIGRATIONS"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Extract password from .env file (handle multi-line variables)
POSTGRES_PASSWORD=$(grep "^POSTGRES_PASSWORD=" .env | cut -d '=' -f2)

echo ""
echo -e "${YELLOW}🔐 Step 1: Setting PostgreSQL password...${NC}"
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -c "ALTER USER postgres WITH PASSWORD '$POSTGRES_PASSWORD';"

echo ""
echo -e "${GREEN}✅ Password set successfully!${NC}"

echo ""
echo -e "${YELLOW}📊 Step 2: Running migrations with correct password...${NC}"
docker compose -f docker-compose.prod.yml exec -e DATABASE_URL="postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/reddy_anna" backend npm run migrate

echo ""
echo -e "${GREEN}✅ Migrations complete!${NC}"

echo ""
echo -e "${YELLOW}👤 Step 3: Creating admin account...${NC}"
docker compose -f docker-compose.prod.yml exec backend npm run create-admin || echo "Admin may already exist"

echo ""
echo -e "${GREEN}✅ ALL DONE!${NC}"

echo ""
echo "=========================================="
echo "🎯 YOUR APP IS NOW READY"
echo "=========================================="
echo ""
echo "🌐 Frontend: http://89.42.231.35"
echo "🔐 Admin: http://89.42.231.35/admin"
echo "   Username: admin"
echo "   Password: Admin@123456"
echo ""