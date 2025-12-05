#!/bin/bash

# =========================================
# CREATE ADMIN ACCOUNT ON VPS
# =========================================

echo "🔐 Creating Admin Account..."
echo ""

cd /opt/reddy_anna

# Run the create-admin script inside the backend container
docker compose -f docker-compose.prod.yml exec -T backend sh -c '
  cd /app
  
  # Check if tsx is available
  if ! command -v tsx &> /dev/null; then
    echo "Installing tsx..."
    npm install -g tsx
  fi
  
  # Run the create-admin script
  DATABASE_HOST=postgres \
  DATABASE_PORT=5432 \
  DATABASE_NAME=reddy_anna \
  DATABASE_USER=postgres \
  DATABASE_PASSWORD=$DATABASE_PASSWORD \
  tsx src/scripts/create-admin.ts
'

echo ""
echo "==========================================="
echo "  ADMIN ACCOUNT SETUP COMPLETE"
echo "==========================================="
echo ""
echo "📝 Default Admin Credentials:"
echo "   URL:      http://89.42.231.35/admin"
echo "   Username: admin"
echo "   Email:    admin@reddyanna.com"
echo "   Password: Admin@123456"
echo ""
echo "📝 To create a test player:"
echo "   1. Go to http://89.42.231.35/signup"
echo "   2. Register a new account"
echo "   3. Login and play at http://89.42.231.35/game"
echo ""
echo "📝 Access Points:"
echo "   • Main Site:     http://89.42.231.35"
echo "   • Admin Panel:   http://89.42.231.35/admin"
echo "   • Player Game:   http://89.42.231.35/game"
echo "   • Partner Login: http://89.42.231.35/partner/login"
echo ""
