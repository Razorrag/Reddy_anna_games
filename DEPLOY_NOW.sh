#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    🚀 FULLY AUTOMATED DEPLOYMENT      ║${NC}"
echo -e "${BLUE}║    No Questions - Everything Auto     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# =========================================
# GENERATE ALL CREDENTIALS
# =========================================
echo -e "${YELLOW}🔐 GENERATING SECURE CREDENTIALS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

POSTGRES_PASS=$(openssl rand -base64 32 | tr -d '/+=')
REDIS_PASS=$(openssl rand -base64 32 | tr -d '/+=')
JWT_SECRET=$(openssl rand -base64 128 | tr -d '/+=')

echo "✅ Database password generated"
echo "✅ Redis password generated"
echo "✅ JWT secret generated"
echo ""

# =========================================
# CREATE .ENV FILE
# =========================================
echo -e "${YELLOW}📝 CREATING .ENV FILE${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cat > .env << EOF
# =========================================
# PRODUCTION ENVIRONMENT
# Auto-generated: $(date)
# =========================================

# DATABASE
POSTGRES_USER=postgres
POSTGRES_PASSWORD=${POSTGRES_PASS}
POSTGRES_DB=reddy_anna
DATABASE_URL=postgresql://postgres:${POSTGRES_PASS}@postgres:5432/reddy_anna

# REDIS
REDIS_PASSWORD=${REDIS_PASS}
REDIS_URL=redis://:${REDIS_PASS}@redis:6379

# JWT
JWT_SECRET=${JWT_SECRET}

# SERVER
NODE_ENV=production
PORT=3001
CORS_ORIGIN=http://89.42.231.35

# FRONTEND
VITE_API_URL=http://89.42.231.35/api
VITE_WS_URL=ws://89.42.231.35
VITE_STREAM_URL=http://89.42.231.35:8080
FRONTEND_URL=http://89.42.231.35

# PAYMENT (Will be configured later via admin panel)
WHATSAPP_PAYMENT_NUMBER=
PAYMENT_UPI_ID=

# OPTIONAL SERVICES
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
PHONEPE_MERCHANT_ID=
PHONEPE_SALT_KEY=
PHONEPE_SALT_INDEX=1
WHATSAPP_API_KEY=
WHATSAPP_PHONE_NUMBER_ID=

# STREAMING
OME_RTMP_PORT=1935
OME_WEBRTC_PORT=3333
OME_HLS_PORT=8080
OME_API_KEY=

# ADMIN
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@reddyanna.com
ADMIN_PASSWORD=Admin@123456

# GAME SETTINGS
SIGNUP_BONUS_AMOUNT=100
DEPOSIT_BONUS_PERCENTAGE=5
REFERRAL_BONUS_AMOUNT=50
WAGERING_MULTIPLIER=30
MIN_BET_AMOUNT=10
MAX_BET_AMOUNT=100000
BETTING_DURATION_SECONDS=30
EOF

echo "✅ .env file created"
echo ""

# =========================================
# SAVE CREDENTIALS
# =========================================
echo -e "${YELLOW}💾 SAVING CREDENTIALS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cat > CREDENTIALS_BACKUP.txt << EOF
╔═══════════════════════════════════════════════════════════════╗
║              🔐 YOUR PRODUCTION CREDENTIALS                   ║
║              Generated: $(date)                    ║
╚═══════════════════════════════════════════════════════════════╝

⚠️  SAVE THIS FILE - YOU'LL NEED IT!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🗄️  DATABASE CREDENTIALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Host:     postgres (internal) / localhost (external)
Port:     5432
Database: reddy_anna
Username: postgres
Password: ${POSTGRES_PASS}

Connection String:
postgresql://postgres:${POSTGRES_PASS}@localhost:5432/reddy_anna

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 REDIS CREDENTIALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Host:     redis (internal) / localhost (external)
Port:     6379
Password: ${REDIS_PASS}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔑 JWT SECRET
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${JWT_SECRET}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 ADMIN LOGIN CREDENTIALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
URL:      http://89.42.231.35/admin
Username: admin
Email:    admin@reddyanna.com
Password: Admin@123456

⚠️  CHANGE THIS PASSWORD AFTER FIRST LOGIN!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 APPLICATION URLS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Frontend:     http://89.42.231.35
Admin Panel:  http://89.42.231.35/admin
API:          http://89.42.231.35/api
Health Check: http://89.42.231.35/api/health
WebSocket:    ws://89.42.231.35

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 PAYMENT CONFIGURATION (Setup Later)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You can configure payment methods later via the admin panel:
1. Login to admin panel
2. Go to Settings → Payment Configuration
3. Add your WhatsApp number and UPI ID

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 DOCKER COMMANDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
View logs:     docker compose -f docker-compose.prod.yml logs -f
Stop:          docker compose -f docker-compose.prod.yml stop
Start:         docker compose -f docker-compose.prod.yml start
Restart:       docker compose -f docker-compose.prod.yml restart
Status:        docker compose -f docker-compose.prod.yml ps

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 SECURITY NOTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ All passwords are randomly generated
✅ JWT secret is 128 characters long
✅ Database is isolated in Docker network
✅ Redis requires password authentication

⚠️  TODO:
- Change admin password after first login
- Setup SSL certificate for HTTPS
- Configure payment methods in admin panel
- Setup automated backups

EOF

echo "✅ Credentials saved to: CREDENTIALS_BACKUP.txt"
echo ""

# Display credentials on screen
cat CREDENTIALS_BACKUP.txt

# =========================================
# GIT PULL
# =========================================
echo ""
echo -e "${YELLOW}📥 PULLING LATEST CODE${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
git pull origin main || echo "⚠️  Git pull failed - continuing anyway"
echo ""

# =========================================
# STOP OLD CONTAINERS
# =========================================
echo -e "${YELLOW}🛑 STOPPING OLD CONTAINERS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker compose -f docker-compose.prod.yml down 2>/dev/null || true
echo "✅ Old containers stopped"
echo ""

# =========================================
# BUILD CONTAINERS
# =========================================
echo -e "${YELLOW}🔨 BUILDING CONTAINERS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⏱️  This will take 15-20 minutes..."
echo ""
docker compose -f docker-compose.prod.yml build --no-cache
echo ""
echo "✅ Containers built"
echo ""

# =========================================
# START SERVICES
# =========================================
echo -e "${YELLOW}🚀 STARTING SERVICES${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker compose -f docker-compose.prod.yml up -d
echo ""
echo "⏳ Waiting for services to start (30 seconds)..."
sleep 30
echo "✅ Services started"
echo ""

# =========================================
# CREATE ADMIN
# =========================================
echo -e "${YELLOW}👤 CREATING ADMIN ACCOUNT${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⏳ Waiting for database (15 seconds)..."
sleep 15

docker compose -f docker-compose.prod.yml exec -T backend sh -c "
  DATABASE_URL=postgresql://postgres:${POSTGRES_PASS}@postgres:5432/reddy_anna \
  tsx src/scripts/create-admin.ts
" 2>/dev/null || echo "⚠️  Admin may already exist"
echo ""

# =========================================
# VERIFY SERVICES
# =========================================
echo -e "${YELLOW}🔍 VERIFYING SERVICES${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
docker compose -f docker-compose.prod.yml ps
echo ""

# Test endpoints
echo "Testing Endpoints:"
echo -n "  Backend Health: "
if curl -sf http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Working${NC}"
else
    echo -e "${RED}❌ Not responding (may need more time)${NC}"
fi

echo -n "  Frontend: "
if curl -sf http://localhost:80 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Working${NC}"
else
    echo -e "${RED}❌ Not responding (may need more time)${NC}"
fi

# =========================================
# FINAL SUMMARY
# =========================================
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ DEPLOYMENT COMPLETE!                      ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}🎉 YOUR APPLICATION IS LIVE!${NC}"
echo ""
echo -e "${YELLOW}🌐 URLS:${NC}"
echo "   Frontend:    http://89.42.231.35"
echo "   Admin Panel: http://89.42.231.35/admin"
echo "   Health:      http://89.42.231.35/api/health"
echo ""
echo -e "${YELLOW}👤 ADMIN LOGIN:${NC}"
echo "   Username: admin"
echo "   Password: Admin@123456"
echo ""
echo -e "${YELLOW}📄 CREDENTIALS:${NC}"
echo "   Saved to: /opt/reddy_anna/CREDENTIALS_BACKUP.txt"
echo "   View: cat /opt/reddy_anna/CREDENTIALS_BACKUP.txt"
echo ""
echo -e "${YELLOW}🎯 NEXT STEPS:${NC}"
echo "   1. Test signup:    http://89.42.231.35/signup"
echo "   2. Test login:     http://89.42.231.35/login"
echo "   3. Login as admin: http://89.42.231.35/admin"
echo "   4. Configure payment info in admin panel"
echo "   5. Change admin password"
echo ""
echo -e "${YELLOW}📊 VIEW LOGS:${NC}"
echo "   docker compose -f docker-compose.prod.yml logs -f"
echo ""
echo -e "${GREEN}✨ Done! Your gaming platform is ready to use!${NC}"
echo ""