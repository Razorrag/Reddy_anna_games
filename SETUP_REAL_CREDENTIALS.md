# 🔐 HOW TO SETUP REAL CREDENTIALS

## 📍 WHERE TO ENTER YOUR CREDENTIALS

You need to edit **ONE FILE**: `/opt/reddy_anna/.env`

On your VPS, run:
```bash
cd /opt/reddy_anna
nano .env
```

---

## 📝 COMPLETE .ENV FILE TEMPLATE

Copy this entire template and replace the placeholder values with your real credentials:

```bash
# =========================================
# DATABASE CREDENTIALS
# =========================================
# Replace with strong passwords!
POSTGRES_USER=postgres
POSTGRES_PASSWORD=YOUR_STRONG_DB_PASSWORD_HERE
POSTGRES_DB=reddy_anna

# =========================================
# REDIS CREDENTIALS
# =========================================
# Replace with strong password!
REDIS_PASSWORD=YOUR_STRONG_REDIS_PASSWORD_HERE

# =========================================
# JWT SECRET (VERY IMPORTANT!)
# =========================================
# Generate a random 64-character string
# You can generate one with: openssl rand -base64 64
JWT_SECRET=YOUR_SUPER_SECRET_JWT_KEY_MINIMUM_64_CHARACTERS_LONG_CHANGE_THIS

# =========================================
# BACKEND CONFIGURATION
# =========================================
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://postgres:YOUR_STRONG_DB_PASSWORD_HERE@postgres:5432/reddy_anna
REDIS_URL=redis://:YOUR_STRONG_REDIS_PASSWORD_HERE@redis:6379
CORS_ORIGIN=http://89.42.231.35

# =========================================
# FRONTEND URLS (For Docker Build)
# =========================================
# Replace 89.42.231.35 with your domain if you have one
VITE_API_URL=http://89.42.231.35/api
VITE_WS_URL=ws://89.42.231.35
VITE_STREAM_URL=http://89.42.231.35:8080
FRONTEND_URL=http://89.42.231.35

# =========================================
# PAYMENT GATEWAY (Optional - Fill when ready)
# =========================================
# Razorpay (for automated payments)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# PhonePe (alternative payment gateway)
PHONEPE_MERCHANT_ID=your_phonepe_merchant_id
PHONEPE_SALT_KEY=your_phonepe_salt_key
PHONEPE_SALT_INDEX=1

# =========================================
# WHATSAPP PAYMENT INFO (IMPORTANT!)
# =========================================
# This is YOUR WhatsApp number where users will send payment proof
WHATSAPP_PAYMENT_NUMBER=+919876543210
# Your UPI ID for receiving payments
PAYMENT_UPI_ID=yourupiid@paytm

# =========================================
# WHATSAPP API (Optional - For automated messages)
# =========================================
WHATSAPP_API_KEY=your_whatsapp_business_api_key
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id

# =========================================
# STREAMING (OvenMediaEngine)
# =========================================
OME_RTMP_PORT=1935
OME_WEBRTC_PORT=3333
OME_HLS_PORT=8080
OME_API_KEY=optional_api_key_for_ome

# =========================================
# ADMIN DEFAULT CREDENTIALS
# =========================================
# These are used to create the first admin account
# You can change them after first login
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@yourdomain.com
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
```

---

## 🔑 WHAT TO CHANGE (PRIORITY ORDER)

### 🚨 CRITICAL (Must Change Before Production!)

| Variable | What to Enter | How to Generate |
|----------|---------------|-----------------|
| `POSTGRES_PASSWORD` | Strong database password | `openssl rand -base64 32` |
| `REDIS_PASSWORD` | Strong Redis password | `openssl rand -base64 32` |
| `JWT_SECRET` | 64+ character random string | `openssl rand -base64 64` |

### 💰 PAYMENT INFO (Change Now!)

| Variable | What to Enter | Example |
|----------|---------------|---------|
| `WHATSAPP_PAYMENT_NUMBER` | Your WhatsApp number with country code | `+919876543210` |
| `PAYMENT_UPI_ID` | Your UPI ID for receiving money | `yourname@paytm` |

### 🌐 DOMAIN (If You Have One)

If you have a domain (e.g., `reddyanna.com`), replace `89.42.231.35` everywhere with your domain:

```bash
CORS_ORIGIN=https://reddyanna.com
VITE_API_URL=https://reddyanna.com/api
VITE_WS_URL=wss://reddyanna.com
FRONTEND_URL=https://reddyanna.com
```

### 📱 PAYMENT GATEWAYS (Optional - When Ready)

These are for automated payments. You can add them later:

| Variable | Where to Get |
|----------|--------------|
| `RAZORPAY_KEY_ID` | https://dashboard.razorpay.com/app/keys |
| `RAZORPAY_KEY_SECRET` | https://dashboard.razorpay.com/app/keys |
| `PHONEPE_MERCHANT_ID` | https://business.phonepe.com/ |

---

## 🎯 STEP-BY-STEP: HOW TO EDIT

### 1. Connect to Your VPS
```bash
ssh root@89.42.231.35
```

### 2. Navigate to Project Directory
```bash
cd /opt/reddy_anna
```

### 3. Generate Strong Passwords
```bash
# Generate database password
echo "POSTGRES_PASSWORD=$(openssl rand -base64 32)"

# Generate Redis password
echo "REDIS_PASSWORD=$(openssl rand -base64 32)"

# Generate JWT secret
echo "JWT_SECRET=$(openssl rand -base64 64)"
```

**Copy these outputs!** You'll need them in the next step.

### 4. Edit .env File
```bash
nano .env
```

### 5. Paste Template & Replace Values
- Copy the complete template from above
- Replace `YOUR_STRONG_DB_PASSWORD_HERE` with the POSTGRES_PASSWORD generated
- Replace `YOUR_STRONG_REDIS_PASSWORD_HERE` with the REDIS_PASSWORD generated
- Replace `YOUR_SUPER_SECRET_JWT_KEY...` with the JWT_SECRET generated
- Replace `+919876543210` with your real WhatsApp number
- Replace `yourupiid@paytm` with your real UPI ID

### 6. Save & Exit
- Press `Ctrl + X`
- Press `Y` (yes to save)
- Press `Enter` (confirm filename)

### 7. Verify Your .env File
```bash
cat .env
```

Check that all passwords are filled in (no placeholders left).

---

## ✅ EXAMPLE OF PROPERLY FILLED .ENV

```bash
# =========================================
# DATABASE CREDENTIALS
# =========================================
POSTGRES_USER=postgres
POSTGRES_PASSWORD=xK9mL2pQ7vR4sT8wY3nZ1bC5dF6gH0jA
POSTGRES_DB=reddy_anna

# =========================================
# REDIS CREDENTIALS
# =========================================
REDIS_PASSWORD=aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT1uV

# =========================================
# JWT SECRET
# =========================================
JWT_SECRET=wXyZ1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890ABCD

# =========================================
# PAYMENT INFO
# =========================================
WHATSAPP_PAYMENT_NUMBER=+919876543210
PAYMENT_UPI_ID=rajugarikossu@paytm

# ... (rest of the file)
```

---

## 🚀 AFTER EDITING .ENV

Run the continue deployment script:
```bash
cd /opt/reddy_anna
chmod +x CONTINUE_DEPLOYMENT.sh
./CONTINUE_DEPLOYMENT.sh
```

The script will:
1. ✅ Read your new credentials from .env
2. ✅ Rebuild containers with correct passwords
3. ✅ Create admin account
4. ✅ Start all services

---

## 🔒 SECURITY NOTES

### ✅ DO:
- Use strong, unique passwords (32+ characters)
- Use the generated random strings
- Keep your .env file secure
- Never commit .env to GitHub

### ❌ DON'T:
- Use simple passwords like "password123"
- Share your JWT_SECRET
- Use the example passwords from this guide
- Commit .env to version control

---

## 💡 QUICK COMMANDS REFERENCE

### Generate Passwords
```bash
# All at once
echo "POSTGRES_PASSWORD=$(openssl rand -base64 32)"
echo "REDIS_PASSWORD=$(openssl rand -base64 32)"
echo "JWT_SECRET=$(openssl rand -base64 64)"
```

### Edit .env
```bash
nano /opt/reddy_anna/.env
```

### Rebuild After Changes
```bash
cd /opt/reddy_anna
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build
```

### View Logs
```bash
docker compose -f docker-compose.prod.yml logs -f
```

---

## ❓ FAQ

**Q: What if I forget my database password?**
A: It's stored in `/opt/reddy_anna/.env` - you can view it anytime with `cat .env`

**Q: Can I change passwords after deployment?**
A: Yes, but you'll need to rebuild containers. Better to set strong ones now!

**Q: Do I need payment gateway credentials now?**
A: No, those are optional. Start with WhatsApp number and UPI ID for manual payments.

**Q: What's the minimum I need to change?**
A: At minimum, change:
- POSTGRES_PASSWORD
- REDIS_PASSWORD
- JWT_SECRET
- WHATSAPP_PAYMENT_NUMBER
- PAYMENT_UPI_ID

---

## 📞 NEED HELP?

If you get stuck:
1. Check your .env file: `cat /opt/reddy_anna/.env`
2. View logs: `docker compose -f docker-compose.prod.yml logs`
3. Verify all passwords are set (no "YOUR_" placeholders)