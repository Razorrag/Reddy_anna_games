#!/bin/bash

# Deploy All Frontend Fixes
echo "🚀 Deploying complete frontend fixes..."

# Push changes to GitHub
echo "📤 Pushing changes to GitHub..."
git add frontend/ docker-compose.yml
git commit -m "Fix frontend: port, CSS, and missing page imports (22 wrapper files created)"
git push origin main

echo "✅ Changes pushed successfully!"
echo ""
echo "🔧 Now run these commands on your VPS (89.42.231.35):"
echo ""
echo "cd /opt/reddy_anna"
echo "git pull origin main"
echo "docker compose down frontend"
echo "docker compose build --no-cache frontend"
echo "docker compose up -d frontend"
echo ""
echo "Then test: http://89.42.231.35:3000"
echo ""
echo "📋 All fixes applied:"
echo "  ✓ Docker port mapping: 3000:5173"
echo "  ✓ Vite host binding: 0.0.0.0"
echo "  ✓ Tailwind shadow utilities: gold-glow, neon-cyan, andar-glow, bahar-glow"
echo "  ✓ Tailwind animations: pulse-gold, pulse-neon"
echo "  ✓ Tailwind colors: earth-brown, earth-maroon, earth-teal"
echo "  ✓ CSS class fixes: removed non-existent utility classes"
echo "  ✓ Missing page wrappers: 2 player + 14 admin + 6 partner = 22 files"