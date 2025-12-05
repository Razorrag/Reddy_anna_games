#!/bin/bash

# =========================================
# REBUILD BACKEND WITH CORRECT DATABASE_URL
# =========================================

echo "🔧 Rebuilding backend container with correct DATABASE_URL..."

cd /opt/reddy_anna

# Stop and remove containers
echo "📦 Stopping and removing containers..."
docker compose -f docker-compose.prod.yml down -v

# Remove old backend image to force rebuild
echo "🗑️  Removing old backend image..."
docker rmi reddy_anna-backend 2>/dev/null || echo "Backend image not found (ok)"

# Show current DATABASE_URL
echo ""
echo "📋 Current DATABASE configuration in .env:"
grep -E "POSTGRES_DB|DATABASE_URL" .env

# Rebuild ONLY backend (faster than rebuilding everything)
echo ""
echo "🔨 Rebuilding backend container..."
docker compose -f docker-compose.prod.yml build --no-cache backend

# Start all containers
echo ""
echo "🚀 Starting all containers..."
docker compose -f docker-compose.prod.yml up -d

echo ""
echo "⏳ Waiting 20 seconds for services to initialize..."
sleep 20

echo ""
echo "📊 Container Status:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "🔍 Backend Logs (last 50 lines):"
docker compose -f docker-compose.prod.yml logs --tail=50 backend | grep -A 5 -B 5 "Database\|connection\|Server started"

echo ""
echo "✅ Rebuild complete!"
echo ""
echo "🔍 Look for SUCCESS messages above:"
echo "   ✓ Database connection successful"
echo "   ✓ Server started on port 3001"
echo ""
echo "If still failing, check full logs:"
echo "   docker compose -f docker-compose.prod.yml logs -f backend"