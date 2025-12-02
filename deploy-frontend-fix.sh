#!/bin/bash

# Deploy Frontend Port Fix
echo "🚀 Deploying frontend accessibility fix..."

# Push changes to GitHub
echo "📤 Pushing changes to GitHub..."
git add frontend/vite.config.ts
git commit -m "Fix frontend accessibility: Add host 0.0.0.0 to vite config"
git push origin main

echo "✅ Changes pushed successfully!"
echo ""
echo "🔧 Now run these commands on your VPS (89.42.231.35):"
echo ""
echo "cd /opt/reddy_anna"
echo "git pull origin main"
echo "docker compose down frontend"
echo "docker compose up -d --build frontend"
echo ""
echo "Then test: http://89.42.231.35:3000"