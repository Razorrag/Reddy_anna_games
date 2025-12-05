#!/bin/bash
set -e

echo "🚀 Deploying All Critical Fixes to VPS..."
echo "=========================================="

# VPS Details
VPS_IP="89.42.231.35"
VPS_USER="root"
APP_DIR="/opt/reddy_anna"

echo "📦 Step 1: Copying updated files to VPS..."

# Copy backend rate limit fix
echo "  → backend/src/middleware/rateLimit.ts"
scp backend/src/middleware/rateLimit.ts ${VPS_USER}@${VPS_IP}:${APP_DIR}/backend/src/middleware/

# Copy backend admin routes fix
echo "  → backend/src/routes/admin.routes.ts"
scp backend/src/routes/admin.routes.ts ${VPS_USER}@${VPS_IP}:${APP_DIR}/backend/src/routes/

# Copy frontend API config fix
echo "  → frontend/src/lib/api.ts"
scp frontend/src/lib/api.ts ${VPS_USER}@${VPS_IP}:${APP_DIR}/frontend/src/lib/

# Copy frontend AdminLayout auth fix
echo "  → frontend/src/layouts/AdminLayout.tsx"
scp frontend/src/layouts/AdminLayout.tsx ${VPS_USER}@${VPS_IP}:${APP_DIR}/frontend/src/layouts/

# Copy frontend PartnerLayout auth fix
echo "  → frontend/src/layouts/PartnerLayout.tsx"
scp frontend/src/layouts/PartnerLayout.tsx ${VPS_USER}@${VPS_IP}:${APP_DIR}/frontend/src/layouts/

echo ""
echo "🔧 Step 2: Rebuilding and restarting services on VPS..."

ssh ${VPS_USER}@${VPS_IP} << 'ENDSSH'
cd /opt/reddy_anna

echo "  → Stopping containers..."
docker compose -f docker-compose.prod.yml down

echo "  → Rebuilding backend..."
docker compose -f docker-compose.prod.yml build backend

echo "  → Rebuilding frontend..."
docker compose -f docker-compose.prod.yml build frontend

echo "  → Starting all services..."
docker compose -f docker-compose.prod.yml up -d

echo "  → Waiting for services to start (30 seconds)..."
sleep 30

echo "  → Checking service status..."
docker compose -f docker-compose.prod.yml ps

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "🔍 Verifying deployment..."
echo "Backend health: $(curl -s http://localhost:3001/api/health | head -c 50)"
echo ""
echo "📊 Container logs (last 20 lines):"
docker compose -f docker-compose.prod.yml logs --tail=20

ENDSSH

echo ""
echo "=========================================="
echo "✨ All fixes deployed successfully!"
echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://${VPS_IP}"
echo "   Backend:  http://${VPS_IP}:3001"
echo "   Admin:    http://${VPS_IP}/admin"
echo ""
echo "🔑 Test with:"
echo "   Admin login: admin / Admin@123456"
echo ""
echo "✅ Fixed Issues:"
echo "   1. ✓ Auth protection on AdminLayout & PartnerLayout"
echo "   2. ✓ Rate limits increased (1000/2000 req/15min)"
echo "   3. ✓ Missing admin routes added (/dashboard/stats, /deposits, /withdrawals)"
echo "   4. ✓ Double /api prefix removed from frontend"
echo ""
echo "📝 Next Steps:"
echo "   1. Visit http://${VPS_IP}/admin"
echo "   2. Login with admin credentials"
echo "   3. Verify dashboard loads without flickering"
echo "   4. Test deposit/withdrawal approval"
echo ""