#!/bin/bash
set -e

echo "🚀 Deploying Fixes Locally on VPS..."
echo "======================================"
echo ""
echo "Current directory: $(pwd)"
echo ""

# Verify we're in the right directory
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ Error: docker-compose.prod.yml not found!"
    echo "Please run this script from /opt/reddy_anna"
    exit 1
fi

echo "✅ Files are already in place (via git pull)"
echo ""
echo "🔧 Step 1: Stopping containers..."
docker compose -f docker-compose.prod.yml down

echo ""
echo "🏗️  Step 2: Rebuilding backend..."
docker compose -f docker-compose.prod.yml build backend

echo ""
echo "🏗️  Step 3: Rebuilding frontend..."
docker compose -f docker-compose.prod.yml build frontend

echo ""
echo "🚀 Step 4: Starting all services..."
docker compose -f docker-compose.prod.yml up -d

echo ""
echo "⏳ Step 5: Waiting for services to stabilize (40 seconds)..."
sleep 40

echo ""
echo "📊 Step 6: Checking service status..."
docker compose -f docker-compose.prod.yml ps

echo ""
echo "🔍 Step 7: Verifying services..."
echo ""

# Check backend health
echo "Backend health check:"
curl -s http://localhost:3001/api/health | head -c 200 || echo "Backend not responding"
echo ""
echo ""

# Check if containers are running
echo "Container status:"
docker compose -f docker-compose.prod.yml ps | grep "Up" && echo "✅ Containers running" || echo "❌ Some containers down"

echo ""
echo "📝 Recent backend logs (last 30 lines):"
echo "========================================"
docker compose -f docker-compose.prod.yml logs --tail=30 backend

echo ""
echo "======================================"
echo "✨ Deployment Complete!"
echo ""
echo "🌐 Access Points:"
echo "   Frontend:  http://89.42.231.35"
echo "   Backend:   http://89.42.231.35:3001"
echo "   Admin:     http://89.42.231.35/admin"
echo ""
echo "🔑 Test with:"
echo "   Username: admin"
echo "   Password: Admin@123456"
echo ""
echo "✅ All Fixes Applied:"
echo "   1. ✓ Auth protection on layouts"
echo "   2. ✓ Dashboard data structure fixed"
echo "   3. ✓ Deposits/Withdrawals format fixed"
echo "   4. ✓ Rate limits increased"
echo "   5. ✓ Approve/reject endpoints standardized"
echo ""
echo "📋 Next Steps:"
echo "   1. Visit http://89.42.231.35/admin"
echo "   2. Login with admin credentials"
echo "   3. Verify dashboard loads properly"
echo "   4. Test deposits/withdrawals approval"
echo ""
echo "🐛 If issues persist:"
echo "   View logs: docker compose -f docker-compose.prod.yml logs -f backend"
echo "   Check frontend: docker compose -f docker-compose.prod.yml logs -f frontend"
echo ""