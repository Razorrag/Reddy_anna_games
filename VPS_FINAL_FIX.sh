#!/bin/bash

# =========================================
# FINAL FIX: Database Name Mismatch
# =========================================

echo "🔧 Fixing database name mismatch..."

cd /opt/reddy_anna

# Stop containers
echo "📦 Stopping containers..."
docker compose -f docker-compose.prod.yml down

# Backup .env
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backed up .env"

# Fix the database name in .env
echo ""
echo "🔄 Fixing DATABASE_URL..."

# Replace reddy_anna_db with reddy_anna
sed -i 's/reddy_anna_db/reddy_anna/g' .env

# Add POSTGRES_DB if missing
if ! grep -q "^POSTGRES_DB=" .env; then
    echo "" >> .env
    echo "# PostgreSQL Database Name (used by Docker)" >> .env
    echo "POSTGRES_DB=reddy_anna" >> .env
    echo "✅ Added POSTGRES_DB=reddy_anna"
fi

# Verify changes
echo ""
echo "📋 Verifying DATABASE configuration:"
echo "===================================="
grep -E "POSTGRES_DB|DATABASE_URL|DATABASE_NAME" .env

echo ""
echo "🚀 Starting containers..."
docker compose -f docker-compose.prod.yml up -d

echo ""
echo "⏳ Waiting 15 seconds for services to start..."
sleep 15

echo ""
echo "📊 Container Status:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "🔍 Backend Logs (last 40 lines):"
docker compose -f docker-compose.prod.yml logs --tail=40 backend

echo ""
echo "✅ Fix complete!"
echo ""
echo "Look for these SUCCESS messages in backend logs above:"
echo "  ✓ Database connection successful"
echo "  ✓ Server started on port 3001"
echo ""
echo "If still failing, check logs:"
echo "  docker compose -f docker-compose.prod.yml logs -f backend"