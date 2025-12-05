#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔐 GENERATING .ENV WITH CREDENTIALS${NC}"
echo "======================================"
echo ""

# Generate secure random credentials
echo "Generating passwords..."
POSTGRES_PASS=$(openssl rand -base64 32 | tr -d '/+=')
REDIS_PASS=$(openssl rand -base64 32 | tr -d '/+=')
JWT_SECRET=$(openssl rand -base64 128 | tr -d '/+=')

echo "✅ Passwords generated"
echo ""

# Create .env file
echo "Creating .env file..."
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

# PAYMENT (Configure later in admin panel)
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

# Create backup file
echo "Creating credentials backup..."
cat > CREDENTIALS_BACKUP.txt << EOF
╔═══════════════════════════════════════════════════════════════╗
║              🔐 YOUR PRODUCTION CREDENTIALS                   ║
║              Generated: $(date)                    ║
╚═══════════════════════════════════════════════════════════════╝

⚠️  SAVE THIS FILE - YOU'LL NEED IT!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🗄️  DATABASE CREDENTIALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Username: postgres
Password: ${POSTGRES_PASS}
Database: reddy_anna
Connection: postgresql://postgres:${POSTGRES_PASS}@localhost:5432/reddy_anna

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 REDIS CREDENTIALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Password: ${REDIS_PASS}
Connection: redis://:${REDIS_PASS}@localhost:6379

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔑 JWT SECRET
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${JWT_SECRET}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 ADMIN LOGIN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
URL:      http://89.42.231.35/admin
Username: admin
Password: Admin@123456
Email:    admin@reddyanna.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 APPLICATION URLS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Frontend:     http://89.42.231.35
Admin Panel:  http://89.42.231.35/admin
API:          http://89.42.231.35/api
Health:       http://89.42.231.35/api/health

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 PAYMENT SETUP (Do Later)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Login to admin panel and configure:
- WhatsApp number for payment coordination
- Payment methods will work via WhatsApp

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Now run the deployment:
  cd /opt/reddy_anna
  chmod +x DEPLOY_NOW.sh
  ./DEPLOY_NOW.sh
EOF

echo "✅ Credentials backup created"
echo ""

# Display credentials
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    ✅ SETUP COMPLETE!                         ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "📄 Files Created:"
echo "   .env                    - Environment variables"
echo "   CREDENTIALS_BACKUP.txt  - Backup of all credentials"
echo ""
echo "🔐 Credentials Generated:"
echo "   Database Password: ${POSTGRES_PASS}"
echo "   Redis Password:    ${REDIS_PASS}"
echo "   JWT Secret:        [128 characters]"
echo ""
echo "👤 Admin Login:"
echo "   Username: admin"
echo "   Password: Admin@123456"
echo ""
echo "📋 View Credentials:"
echo "   cat CREDENTIALS_BACKUP.txt"
echo ""
echo "🚀 Next Step - Run Deployment:"
echo "   chmod +x DEPLOY_NOW.sh"
echo "   ./DEPLOY_NOW.sh"
echo ""