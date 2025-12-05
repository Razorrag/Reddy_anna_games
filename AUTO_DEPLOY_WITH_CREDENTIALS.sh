#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🚀 AUTO DEPLOYMENT WITH CREDENTIALS  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# =========================================
# STEP 1: GET YOUR PAYMENT INFO
# =========================================
echo -e "${YELLOW}📱 PAYMENT INFORMATION SETUP${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "I need 2 pieces of information for payment processing:"
echo ""
echo "1. Your WhatsApp Number (with country code)"
echo "   Example: +919876543210"
echo ""
read -p "Enter your WhatsApp number: " WHATSAPP_NUM
echo ""
echo "2. Your UPI ID (for receiving payments)"
echo "   Example: yourname@paytm or yourname@upi"
echo ""
read -p "Enter your UPI ID: " UPI_ID
echo ""

# Validate inputs
if [ -z "$WHATSAPP_NUM" ] || [ -z "$UPI_ID" ]; then
    echo -e "${RED}❌ Error: WhatsApp number and UPI ID are required!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Payment info saved!${NC}"
echo ""

# =========================================
# STEP 2: CREATE .ENV FILE
# =========================================
echo -e "${YELLOW}📝 CREATING PRODUCTION .ENV FILE${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Generate secure random credentials
POSTGRES_PASS=$(openssl rand -base64 32 | tr -d '/+=')
REDIS_PASS=$(openssl rand -base64 32 | tr -d '/+=')
JWT_SECRET=$(openssl rand -base64 128 | tr -d '/+=')

cat > .env << EOF
# =========================================
# PRODUCTION ENVIRONMENT VARIABLES
# Auto-generated: $(date)
# =========================================

# =========================================
# DATABASE CREDENTIALS (Auto-generated)
# =========================================
POSTGRES_USER=postgres
POSTGRES_PASSWORD=${POSTGRES_PASS}
POSTGRES_DB=reddy_anna

# =========================================
# REDIS CREDENTIALS (Auto-generated)
# =========================================
REDIS_PASSWORD=${REDIS_PASS}

# =========================================
# JWT SECRET (Auto-generated 128-char)
# =========================================
JWT_SECRET=${JWT_SECRET}

# =========================================
# BACKEND CONFIGURATION
# =========================================
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://postgres:${POSTGRES_PASS}@postgres:5432/reddy_anna
REDIS_URL=redis://:${REDIS_PASS}@redis:6379
CORS_ORIGIN=http://89.42.231.35

# =========================================
# FRONTEND URLS
# =========================================
VITE_API_URL=http://89.42.231.35/api
VITE_WS_URL=ws://89.42.231.35
VITE_STREAM_URL=http://89.42.231.35:8080
FRONTEND_URL=http://89.42.231.35

# =========================================
# WHATSAPP PAYMENT INFO
# =========================================
WHATSAPP_PAYMENT_NUMBER=${WHATSAPP_NUM}
PAYMENT_UPI_ID=${UPI_ID}

# =========================================
# PAYMENT GATEWAY (Optional)
# =========================================
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
PHONEPE_MERCHANT_ID=
PHONEPE_SALT_KEY=
PHONEPE_SALT_INDEX=1

# =========================================
# WHATSAPP API (Optional)
# =========================================
WHATSAPP_API_KEY=
WHATSAPP_PHONE_NUMBER_ID=

# =========================================
# STREAMING (OvenMediaEngine)
# =========================================
OME_RTMP_PORT=1935
OME_WEBRTC_PORT=3333
OME_HLS_PORT=8080
OME_API_KEY=

# =========================================
# ADMIN DEFAULT CREDENTIALS
# =========================================
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@reddyanna.com
ADMIN_PASSWORD=Admin@123456

# =========================================
# BONUS CONFIGURATION
# =========================================
SIGNUP_BONUS_AMOUNT=100
DEPOSIT_BONUS_PERCENTAGE=5
REFERRAL_BONUS_AMOUNT=50
WAGERING_MULTIPLIER=30

# =========================================
# GAME CONFIGURATION
# =========================================
MIN_BET_AMOUNT=10
MAX_BET_AMOUNT=100000
BETTING_DURATION_SECONDS=30
EOF

echo -e "${GREEN}✅ .env file created with secure credentials${NC}"
echo ""

# Save credentials to a backup file
cat > CREDENTIALS_BACKUP.txt << EOF
╔════════════════════════════════════════════════════════════╗
║           🔐 YOUR PRODUCTION CREDENTIALS                   ║
║           Generated: $(date)                     ║
╚════════════════════════════════════════════════════════════╝

SAVE THESE CREDENTIALS - YOU'LL NEED THEM!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DATABASE CREDENTIALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Username: postgres
Password: ${POSTGRES_PASS}
Database: reddy_anna

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REDIS CREDENTIALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Password: ${REDIS_PASS}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
JWT SECRET
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${JWT_SECRET}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAYMENT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WhatsApp Number: ${WHATSAPP_NUM}
UPI ID: ${UPI_ID}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ADMIN CREDENTIALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Username: admin
Password: Admin@123456
Email: admin@reddyanna.com
Login URL: http://89.42.231.35/admin

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
APPLICATION URLS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Frontend: http://89.42.231.35
Backend API: http://89.42.231.35/api
Admin Panel: http://89.42.231.35/admin
Health Check: http://89.42.231.35/api/health

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  SECURITY NOTICE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Store this file securely
- Never share these credentials
- Never commit .env to Git
- Change admin password after first login
EOF

echo -e "${GREEN}✅ Credentials backup saved to: CREDENTIALS_BACKUP.txt${NC}"
echo ""

# =========================================
# STEP 3: GIT PULL
# =========================================
echo -e "${YELLOW}📥 PULLING LATEST CODE${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
git pull origin main || echo "⚠️  Git pull failed - continuing anyway"
echo ""

# =========================================
# STEP 4: STOP OLD CONTAINERS
# =========================================
echo -e "${YELLOW}🛑 STOPPING OLD CONTAINERS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker compose -f docker-compose.prod.yml down
echo ""

# =========================================
# STEP 5: BUILD NEW CONTAINERS
# =========================================
echo -e "${YELLOW}🔨 BUILDING CONTAINERS (15-20 min)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker compose -f docker-compose.prod.yml build --no-cache
echo ""

# =========================================
# STEP 6: START SERVICES
# =========================================
echo -e "${YELLOW}🚀 STARTING SERVICES${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker compose -f docker-compose.prod.yml up -d
echo ""

# Wait for services to start
echo "⏳ Waiting for services to initialize..."
sleep 30

# =========================================
# STEP 7: CREATE ADMIN
# =========================================
echo -e "${YELLOW}👤 CREATING ADMIN ACCOUNT${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
sleep 10
docker compose -f docker-compose.prod.yml exec -T backend sh -c "
  DATABASE_URL=postgresql://postgres:${POSTGRES_PASS}@postgres:5432/reddy_anna \
  tsx src/scripts/create-admin.ts
" || echo "⚠️  Admin may already exist"
echo ""

# =========================================
# STEP 8: VERIFY SERVICES
# =========================================
echo -e "${YELLOW}🔍 VERIFYING SERVICES${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "Container Status:"
docker compose -f docker-compose.prod.yml ps
echo ""

# Test endpoints
echo "Testing Endpoints:"
echo -n "  Backend Health: "
if curl -sf http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌${NC}"
fi

echo -n "  Frontend: "
if curl -sf http://localhost:80 > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌${NC}"
fi

# =========================================
# FINAL SUMMARY
# =========================================
echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║      ✅ DEPLOYMENT COMPLETE!           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}🌐 APPLICATION URLS:${NC}"
echo "   Frontend:    http://89.42.231.35"
echo "   Admin Panel: http://89.42.231.35/admin"
echo "   API:         http://89.42.231.35/api"
echo ""
echo -e "${BLUE}👤 ADMIN LOGIN:${NC}"
echo "   Username: admin"
echo "   Password: Admin@123456"
echo ""
echo -e "${BLUE}💰 PAYMENT INFO:${NC}"
echo "   WhatsApp: ${WHATSAPP_NUM}"
echo "   UPI ID:   ${UPI_ID}"
echo ""
echo -e "${BLUE}📋 CREDENTIALS SAVED TO:${NC}"
echo "   File: /opt/reddy_anna/CREDENTIALS_BACKUP.txt"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT NEXT STEPS:${NC}"
echo "   1. Test signup: http://89.42.231.35/signup"
echo "   2. Test login:  http://89.42.231.35/login"
echo "   3. Test admin:  http://89.42.231.35/admin"
echo "   4. Change admin password after first login"
echo ""
echo -e "${BLUE}📊 VIEW LOGS:${NC}"
echo "   docker compose -f docker-compose.prod.yml logs -f"
echo ""