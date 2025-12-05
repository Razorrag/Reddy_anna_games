#!/bin/bash

# Rate Limit Fix Deployment Script
# This script rebuilds the backend with increased rate limits

set -e

echo "================================================"
echo "🚀 Deploying Rate Limit Fix"
echo "================================================"

# Check if running on VPS
if [ ! -d "/opt/reddy_anna" ]; then
    echo "❌ Error: Not running on VPS. This script must run in /opt/reddy_anna"
    exit 1
fi

cd /opt/reddy_anna

echo ""
echo "📦 Step 1: Pulling latest code changes..."
git pull origin main || {
    echo "⚠️ Git pull failed, but continuing with local changes..."
}

echo ""
echo "🔨 Step 2: Rebuilding backend container with new rate limits..."
docker compose -f docker-compose.prod.yml build backend

echo ""
echo "🔄 Step 3: Restarting backend container..."
docker compose -f docker-compose.prod.yml up -d backend

echo ""
echo "⏳ Step 4: Waiting for backend to start (15 seconds)..."
sleep 15

echo ""
echo "✅ Checking container status..."
docker compose -f docker-compose.prod.yml ps

echo ""
echo "📋 Recent backend logs:"
docker compose -f docker-compose.prod.yml logs --tail=20 backend

echo ""
echo "================================================"
echo "✅ Rate Limit Fix Deployed Successfully!"
echo "================================================"
echo ""
echo "New Rate Limits:"
echo "  - General API: 1000 requests per 15 minutes"
echo "  - Admin API: 2000 requests per 15 minutes"
echo ""
echo "Please refresh the admin dashboard and verify:"
echo "  1. No more 429 errors"
echo "  2. Dashboard loads completely"
echo "  3. All stats display correctly"
echo ""
echo "If issues persist, check logs with:"
echo "  docker compose -f docker-compose.prod.yml logs -f backend"
echo "================================================"