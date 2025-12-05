#!/bin/bash

# =========================================
# FIX DATABASE CONNECTION ON VPS
# =========================================

echo "🔧 Fixing database connection issue..."

cd /opt/reddy_anna

# Stop all containers
echo "📦 Stopping containers..."
docker compose -f docker-compose.prod.yml down

# Backup existing .env
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Add DATABASE_URL if missing
if ! grep -q "DATABASE_URL" .env; then
    echo ""
    echo "# Backend Database Connection (CRITICAL!)" >> .env
    echo "DATABASE_URL=postgresql://postgres:ESzqBe/m5z9HCSq67B82B8IaSvwdr3xj1WEKt/q5TOE=@postgres:5432/reddy_anna" >> .env
    echo "✅ Added DATABASE_URL to .env"
else
    echo "⚠️  DATABASE_URL already exists in .env"
fi

# Ensure all required variables are present
echo ""
echo "📝 Checking required environment variables..."

# Add REDIS_PASSWORD if missing
if ! grep -q "REDIS_PASSWORD" .env; then
    echo "REDIS_PASSWORD=ESzqBe/m5z9HCSq67B82B8IaSvwdr3xj1WEKt/q5TOE=" >> .env
    echo "✅ Added REDIS_PASSWORD"
fi

# Add POSTGRES_PASSWORD if missing
if ! grep -q "POSTGRES_PASSWORD" .env; then
    echo "POSTGRES_PASSWORD=ESzqBe/m5z9HCSq67B82B8IaSvwdr3xj1WEKt/q5TOE=" >> .env
    echo "✅ Added POSTGRES_PASSWORD"
fi

# Show current .env (without sensitive data)
echo ""
echo "📋 Current .env configuration:"
echo "================================"
grep -E "^[A-Z_]+=.+" .env | sed 's/=.*/=***HIDDEN***/' | head -20

echo ""
echo "🚀 Starting containers..."
docker compose -f docker-compose.prod.yml up -d

echo ""
echo "⏳ Waiting 10 seconds for services to initialize..."
sleep 10

echo ""
echo "📊 Container Status:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "🔍 Backend Logs (last 30 lines):"
docker compose -f docker-compose.prod.yml logs --tail=30 backend

echo ""
echo "✅ Fix complete! Check if backend connected successfully above."
echo ""
echo "If you still see errors, run:"
echo "  docker compose -f docker-compose.prod.yml logs -f backend"