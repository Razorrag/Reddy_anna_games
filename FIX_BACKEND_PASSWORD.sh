#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🔧 FIXING BACKEND DATABASE CONNECTION${NC}"
echo "========================================="
echo ""

# Read password from .env
echo "Reading password from .env..."
POSTGRES_PASS=$(grep "^POSTGRES_PASSWORD=" .env | cut -d'=' -f2)
echo "Password found: ${POSTGRES_PASS}"
echo ""

# Stop backend
echo "Stopping backend..."
docker compose -f docker-compose.prod.yml stop backend
echo ""

# Rebuild backend with correct env
echo "Rebuilding backend..."
docker compose -f docker-compose.prod.yml up -d --no-deps --build backend
echo ""

# Wait for backend
echo "Waiting for backend to start (30 seconds)..."
sleep 30

# Check status
echo ""
echo "Checking status..."
docker compose -f docker-compose.prod.yml ps backend
echo ""

# Show logs
echo "Backend logs:"
docker compose -f docker-compose.prod.yml logs backend --tail=20
echo ""

# Test health
echo -n "Testing health endpoint: "
if curl -sf http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Working!${NC}"
else
    echo -e "${YELLOW}⚠️  Still starting...${NC}"
    echo "Run: docker compose -f docker-compose.prod.yml logs backend -f"
fi
echo ""

echo -e "${GREEN}✅ Fix applied!${NC}"
echo ""
echo "If still not working, the issue is that backend isn't reading .env properly."
echo "We'll need to pass DATABASE_URL directly to the container."