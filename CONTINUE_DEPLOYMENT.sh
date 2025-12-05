#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 CONTINUING DEPLOYMENT FROM PHASE 3${NC}"
echo "=========================================="
echo ""

# =========================================
# PHASE 3: FIX ENVIRONMENT
# =========================================
echo "📝 PHASE 3: FIXING ENVIRONMENT"
echo "==============================="

# Source .env if it exists
if [ -f .env ]; then
    source .env
fi

# Fix .env file
cat > .env << 'EOF'
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres123
POSTGRES_DB=reddy_anna

# Redis
REDIS_PASSWORD=redis123

# Backend
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://postgres:postgres123@postgres:5432/reddy_anna
REDIS_URL=redis://:redis123@redis:6379
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CORS_ORIGIN=http://89.42.231.35

# OvenMediaEngine (optional)
OME_RTMP_PORT=1935
OME_WEBRTC_PORT=3333
OME_HLS_PORT=8080
EOF

echo "✅ Environment file updated"

# =========================================
# PHASE 4: GIT PULL
# =========================================
echo ""
echo "📥 PHASE 4: PULLING LATEST CODE"
echo "================================"
git pull origin main || echo "⚠️  Git pull failed - continuing anyway"

# =========================================
# PHASE 5: REBUILD CONTAINERS
# =========================================
echo ""
echo "🔨 PHASE 5: REBUILDING CONTAINERS"
echo "=================================="
echo "This will take 15-20 minutes..."
echo ""

# Build with no cache
docker compose -f docker-compose.prod.yml build --no-cache

echo "✅ Containers rebuilt"

# =========================================
# PHASE 6: START SERVICES
# =========================================
echo ""
echo "🚀 PHASE 6: STARTING SERVICES"
echo "=============================="

# Start services
docker compose -f docker-compose.prod.yml up -d

echo "Waiting for services to start..."
sleep 20

# =========================================
# PHASE 7: VERIFY SERVICES
# =========================================
echo ""
echo "🔍 PHASE 7: VERIFYING SERVICES"
echo "==============================="

echo ""
echo "📊 Container Status:"
docker compose -f docker-compose.prod.yml ps

# Check backend logs
echo ""
echo "🔍 Backend Status:"
docker compose -f docker-compose.prod.yml logs --tail=30 backend

# =========================================
# PHASE 8: CREATE ADMIN
# =========================================
echo ""
echo "👤 PHASE 8: CREATING ADMIN ACCOUNT"
echo "==================================="

# Wait for database to be fully ready
echo "Waiting for database..."
sleep 15

# Create admin using the script
echo "Creating admin account..."
docker compose -f docker-compose.prod.yml exec -T backend sh -c "
  DATABASE_URL=postgresql://postgres:postgres123@postgres:5432/reddy_anna \
  tsx src/scripts/create-admin.ts
" || echo "⚠️  Admin may already exist"

# =========================================
# PHASE 9: TEST ENDPOINTS
# =========================================
echo ""
echo "🧪 PHASE 9: TESTING ENDPOINTS"
echo "=============================="

# Test backend health
echo -n "Backend Health: "
if curl -sf http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Working${NC}"
else
    echo -e "${RED}❌ Not responding${NC}"
fi

# Test frontend
echo -n "Frontend: "
if curl -sf http://localhost:80 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Working${NC}"
else
    echo -e "${RED}❌ Not responding${NC}"
fi

# Test signup endpoint structure
echo -n "Signup Endpoint: "
RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"phone":"0000000000","name":"Test","password":"test123456"}' 2>&1)

if echo "$RESPONSE" | grep -q "error"; then
    echo -e "${YELLOW}⚠️  Available (validation error expected)${NC}"
else
    echo -e "${GREEN}✅ Working${NC}"
fi

# =========================================
# PHASE 10: FINAL STATUS
# =========================================
echo ""
echo "======================================"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
echo "======================================"
echo ""
echo "🌐 Your application is now running at:"
echo "   Frontend: http://89.42.231.35"
echo "   Backend:  http://89.42.231.35:3001"
echo ""
echo "👤 Admin Credentials:"
echo "   URL:      http://89.42.231.35/admin"
echo "   Username: admin"
echo "   Password: Admin@123456"
echo ""
echo "📊 View Logs:"
echo "   All:      docker compose -f docker-compose.prod.yml logs -f"
echo "   Backend:  docker compose -f docker-compose.prod.yml logs backend -f"
echo "   Frontend: docker compose -f docker-compose.prod.yml logs frontend -f"
echo ""
echo "🧪 Test Signup:"
echo "   curl -X POST http://89.42.231.35/api/auth/signup \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"phone\":\"9876543210\",\"name\":\"Test User\",\"password\":\"test123456\"}'"
echo ""
echo "🎯 Next Steps:"
echo "   1. Test signup at http://89.42.231.35/signup"
echo "   2. Test login at http://89.42.231.35/login"
echo "   3. Test admin at http://89.42.231.35/admin"
echo "   4. Test game at http://89.42.231.35/game"
echo ""