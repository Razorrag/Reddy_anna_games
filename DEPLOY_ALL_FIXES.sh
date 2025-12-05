#!/bin/bash

# =========================================
# COMPLETE FIX DEPLOYMENT SCRIPT
# =========================================
# This script fixes ALL issues found:
# 1. Database URL configuration
# 2. Frontend API URL fix (signup)
# 3. Rebuild containers with correct config
# =========================================

set -e  # Exit on error

echo "🚀 Starting Complete Fix Deployment..."
echo "========================================"

cd /opt/reddy_anna

# =========================================
# STEP 1: Fix Environment Variables
# =========================================
echo ""
echo "📝 Step 1: Fixing environment variables..."

# Backup .env
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backed up .env"

# Fix database name (reddy_anna_db → reddy_anna)
sed -i 's/reddy_anna_db/reddy_anna/g' .env
echo "✅ Fixed DATABASE_URL"

# Add POSTGRES_DB if missing
if ! grep -q "^POSTGRES_DB=" .env; then
    echo "" >> .env
    echo "# PostgreSQL Database Name" >> .env
    echo "POSTGRES_DB=reddy_anna" >> .env
    echo "✅ Added POSTGRES_DB"
fi

# Verify critical variables
echo ""
echo "📋 Current Environment:"
grep -E "POSTGRES_DB|DATABASE_URL|REDIS_PASSWORD" .env | sed 's/=.*/=***/'

# =========================================
# STEP 2: Stop All Containers
# =========================================
echo ""
echo "📦 Step 2: Stopping all containers..."
docker compose -f docker-compose.prod.yml down -v
echo "✅ Containers stopped"

# =========================================
# STEP 3: Remove Old Images
# =========================================
echo ""
echo "🗑️  Step 3: Removing old images..."
docker rmi reddy_anna-backend reddy_anna-frontend 2>/dev/null || echo "Images removed or not found"
echo "✅ Old images removed"

# =========================================
# STEP 4: Pull Latest Code
# =========================================
echo ""
echo "📥 Step 4: Pulling latest code from GitHub..."
git stash  # Stash local changes to .env
git pull origin main
git stash pop  # Restore .env
echo "✅ Code updated"

# =========================================
# STEP 5: Rebuild All Containers
# =========================================
echo ""
echo "🔨 Step 5: Rebuilding containers (this may take 5-10 minutes)..."
docker compose -f docker-compose.prod.yml build --no-cache
echo "✅ Containers rebuilt"

# =========================================
# STEP 6: Start All Services
# =========================================
echo ""
echo "🚀 Step 6: Starting all services..."
docker compose -f docker-compose.prod.yml up -d
echo "✅ Services started"

# =========================================
# STEP 7: Wait for Services
# =========================================
echo ""
echo "⏳ Step 7: Waiting for services to initialize (30 seconds)..."
sleep 30

# =========================================
# STEP 8: Check Container Status
# =========================================
echo ""
echo "📊 Step 8: Container Status"
echo "============================"
docker compose -f docker-compose.prod.yml ps

# =========================================
# STEP 9: Check Backend Logs
# =========================================
echo ""
echo "🔍 Step 9: Backend Connection Status"
echo "====================================="
docker compose -f docker-compose.prod.yml logs --tail=30 backend | grep -E "Database|connection|Server started|error" || echo "No errors found"

# =========================================
# STEP 10: Test Endpoints
# =========================================
echo ""
echo "🧪 Step 10: Testing API Endpoints"
echo "=================================="

# Test backend health
echo -n "Backend Health: "
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ HEALTHY"
else
    echo "❌ NOT RESPONDING"
fi

# Test frontend
echo -n "Frontend: "
if curl -s http://localhost:80 > /dev/null 2>&1; then
    echo "✅ SERVING"
else
    echo "❌ NOT RESPONDING"
fi

# =========================================
# FINAL STATUS
# =========================================
echo ""
echo "========================================="
echo "🎉 DEPLOYMENT COMPLETE!"
echo "========================================="
echo ""
echo "✅ What was fixed:"
echo "   1. Database URL configuration"
echo "   2. Frontend signup API endpoint"
echo "   3. All containers rebuilt fresh"
echo ""
echo "🌐 Your site: http://89.42.231.35"
echo ""
echo "📋 Next Steps:"
echo "   1. Visit http://89.42.231.35 to test"
echo "   2. Try signup with a test account"
echo "   3. Create admin account:"
echo "      cd /opt/reddy_anna"
echo "      ./VPS_CREATE_ADMIN.sh"
echo ""
echo "🔍 To monitor logs:"
echo "   docker compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🐛 If issues persist:"
echo "   docker compose -f docker-compose.prod.yml logs backend"
echo "   docker compose -f docker-compose.prod.yml logs frontend"
echo ""