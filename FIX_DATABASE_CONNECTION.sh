#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🔧 FIXING DATABASE CONNECTION${NC}"
echo "=================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    echo "Please run SETUP_ENV.sh first"
    exit 1
fi

# Read password from .env
echo "Reading credentials from .env..."
POSTGRES_PASS=$(grep "^POSTGRES_PASSWORD=" .env | cut -d'=' -f2)
POSTGRES_USER=$(grep "^POSTGRES_USER=" .env | cut -d'=' -f2)
POSTGRES_DB=$(grep "^POSTGRES_DB=" .env | cut -d'=' -f2)

if [ -z "$POSTGRES_PASS" ]; then
    echo -e "${RED}Error: Could not read POSTGRES_PASSWORD from .env${NC}"
    exit 1
fi

echo "✅ Credentials loaded"
echo "   User: ${POSTGRES_USER}"
echo "   Database: ${POSTGRES_DB}"
echo "   Password: ${POSTGRES_PASS:0:10}..."
echo ""

# Stop backend
echo "Stopping backend container..."
docker compose -f docker-compose.prod.yml stop backend
sleep 2

# Remove backend container to force recreation
echo "Removing old backend container..."
docker compose -f docker-compose.prod.yml rm -f backend

# Start backend with explicit DATABASE_URL
echo "Starting backend with correct DATABASE_URL..."
docker compose -f docker-compose.prod.yml up -d backend

echo ""
echo "Waiting for backend to start (40 seconds)..."
for i in {1..8}; do
    sleep 5
    echo -n "."
done
echo ""
echo ""

# Check status
echo "Checking container status..."
docker compose -f docker-compose.prod.yml ps backend
echo ""

# Show recent logs
echo "Backend logs (last 30 lines):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker compose -f docker-compose.prod.yml logs backend --tail=30
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test health endpoint
echo -n "Testing health endpoint: "
if curl -sf http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is WORKING!${NC}"
    echo ""
    echo "🎉 Success! Your backend is now connected to the database."
    echo ""
    echo "Test your application:"
    echo "  Frontend:  http://89.42.231.35"
    echo "  API Health: http://89.42.231.35/api/health"
    echo "  Admin:     http://89.42.231.35/admin"
else
    echo -e "${YELLOW}⚠️  Backend still starting or has issues${NC}"
    echo ""
    echo "Check the logs above for errors."
    echo ""
    echo "If you see 'password authentication failed', run this command:"
    echo ""
    echo -e "${YELLOW}docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -c \"ALTER USER postgres WITH PASSWORD '${POSTGRES_PASS}';\"${NC}"
    echo ""
    echo "Then restart:"
    echo "docker compose -f docker-compose.prod.yml restart backend"
fi

echo ""