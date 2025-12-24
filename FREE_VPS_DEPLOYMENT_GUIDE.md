# 🚀 Free VPS Deployment Guide - Reddy Anna Gaming Platform

Complete guide to deploy the Andar Bahar gaming platform on free VPS/cloud platforms.

---

## 📊 Free VPS Comparison

| Platform | RAM | Storage | CPU | Database | Best For | Limitations |
|----------|-----|---------|-----|----------|----------|-------------|
| **Render** | 512MB | - | Shared | Free PostgreSQL | Full-stack apps | Sleeps after 15min inactivity |
| **Railway** | 512MB-8GB | 1GB | Shared | Free PostgreSQL | Docker apps | $5 credit/month |
| **Fly.io** | 256MB | 1GB | Shared | Free PostgreSQL | Docker apps | 3 VMs free |
| **Oracle Cloud** | 1GB-24GB | 200GB | 1-4 cores | Yes | Production | Best free tier |
| **Google Cloud** | 614MB | 30GB | Shared | Yes | Always free VM | Complex setup |
| **Koyeb** | 512MB | - | Shared | No (external) | Simple apps | Limited resources |

---

## 🎯 Recommended: Render (Easiest for Beginners)

### Why Render?
- ✅ Free PostgreSQL database included
- ✅ Free Redis (with limitations)
- ✅ Automatic HTTPS
- ✅ GitHub auto-deploy
- ✅ Easy environment variables
- ✅ No credit card required

### Limitations:
- ⚠️ Sleeps after 15 minutes of inactivity (wakes on request)
- ⚠️ 512MB RAM (sufficient for testing)
- ⚠️ Free tier has build time limits

---

## 🔧 Option 1: Deploy on Render

### Step 1: Prepare Your Repository

1. **Create a `render.yaml` file** in the root:

```yaml
services:
  # Backend API
  - type: web
    name: reddy-anna-backend
    runtime: node
    region: singapore
    plan: free
    buildCommand: cd backend && npm install && npm run build
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
      - key: DATABASE_URL
        fromDatabase:
          name: reddy-anna-db
          property: connectionString
      - key: REDIS_URL
        fromService:
          type: redis
          name: reddy-anna-redis
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: FRONTEND_URL
        value: https://reddy-anna-frontend.onrender.com
    healthCheckPath: /health

  # Frontend
  - type: web
    name: reddy-anna-frontend
    runtime: static
    region: singapore
    plan: free
    buildCommand: cd frontend && npm install && npm run build
    staticPublishPath: frontend/dist
    envVars:
      - key: VITE_API_URL
        value: https://reddy-anna-backend.onrender.com
      - key: VITE_WS_URL
        value: wss://reddy-anna-backend.onrender.com

databases:
  - name: reddy-anna-db
    region: singapore
    plan: free
    databaseName: reddy_anna
    user: postgres

  - name: reddy-anna-redis
    region: singapore
    plan: free
```

### Step 2: Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit for Render deployment"

# Create GitHub repository and push
git remote add origin https://github.com/your-username/reddy-anna.git
git push -u origin main
```

### Step 3: Deploy on Render

1. **Sign up** at [https://render.com](https://render.com)
2. **Connect GitHub** account
3. **New** → **Blueprint**
4. **Select repository**: reddy-anna
5. **Apply** the blueprint
6. Render will automatically:
   - Create PostgreSQL database
   - Create Redis instance
   - Deploy backend
   - Deploy frontend
   - Set up environment variables

### Step 4: Run Migrations

After deployment completes:

1. Go to **Backend service** → **Shell**
2. Run migrations:
```bash
npm run migrate
npm run seed
```

### Step 5: Access Your App

- Frontend: `https://reddy-anna-frontend.onrender.com`
- Backend: `https://reddy-anna-backend.onrender.com`

**Note:** First request after 15min inactivity takes ~30 seconds to wake up.

---

## 🚀 Option 2: Deploy on Railway (Best Performance)

### Why Railway?
- ✅ Better performance than Render
- ✅ $5 free credit per month
- ✅ No sleep mode
- ✅ Easy Docker deployment

### Step 1: Install Railway CLI

```bash
# Install globally
npm install -g @railway/cli

# Login
railway login
```

### Step 2: Initialize Project

```bash
# From project root
railway init

# Link to new project
railway link
```

### Step 3: Add PostgreSQL

```bash
railway add --database postgres
```

### Step 4: Deploy Backend

```bash
# Deploy backend
cd backend
railway up

# Set environment variables
railway variables set NODE_ENV=production
railway variables set PORT=3001
railway variables set JWT_SECRET=your-super-secret-jwt-key-32-chars
railway variables set FRONTEND_URL=https://your-frontend.railway.app
```

### Step 5: Deploy Frontend

```bash
# Deploy frontend
cd ../frontend
railway up

# Set environment variables
railway variables set VITE_API_URL=https://your-backend.railway.app
railway variables set VITE_WS_URL=wss://your-backend.railway.app
```

### Step 6: Run Migrations

```bash
# Connect to backend
railway connect backend

# Run migrations
npm run migrate
npm run seed
```

### Step 7: Get URLs

```bash
railway domain
```

---

## ☁️ Option 3: Oracle Cloud Free Tier (Best for Production)

### Why Oracle Cloud?
- ✅ **Always Free** tier (no time limit)
- ✅ 1GB RAM (ARM) or 24GB RAM (x86)
- ✅ 200GB storage
- ✅ Full control
- ✅ No auto-sleep

### Step 1: Create Account

1. Go to [https://www.oracle.com/cloud/free/](https://www.oracle.com/cloud/free/)
2. Sign up (requires credit card for verification, but won't be charged)
3. Create a free tier account

### Step 2: Create VM Instance

1. **Compute** → **Instances** → **Create Instance**
2. **Image**: Ubuntu 22.04
3. **Shape**: VM.Standard.A1.Flex (ARM, 1 OCPU, 6GB RAM) - Free
4. **VCN**: Create new or use existing
5. **Public IP**: Assign
6. **SSH Keys**: Download or paste your key
7. **Create**

### Step 3: Configure Firewall

```bash
# SSH into your instance
ssh ubuntu@<your-instance-ip>

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo apt install docker-compose -y

# Open ports
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 3000 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 3001 -j ACCEPT
sudo netfilter-persistent save
```

### Step 4: Oracle Cloud Console Firewall

1. **Networking** → **Virtual Cloud Networks** → Your VCN
2. **Security Lists** → **Default Security List**
3. **Add Ingress Rules**:
   - Port 80 (HTTP)
   - Port 443 (HTTPS)
   - Port 3000 (Frontend)
   - Port 3001 (Backend)

### Step 5: Deploy Application

```bash
# Clone repository
git clone https://github.com/your-username/reddy-anna.git
cd reddy-anna

# Create .env file
nano .env
# Add your configuration

# Start with Docker
docker compose up -d

# Run migrations
docker compose exec backend npm run migrate
docker compose exec backend npm run seed
```

### Step 6: Setup Nginx (Optional)

```bash
# Install Nginx
sudo apt install nginx -y

# Create config
sudo nano /etc/nginx/sites-available/reddy-anna
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/reddy-anna /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 7: Setup SSL (Free with Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

---

## 🌐 Option 4: Fly.io (Good Balance)

### Why Fly.io?
- ✅ 3 free VMs (256MB each)
- ✅ Free PostgreSQL (3GB)
- ✅ Global edge network
- ✅ Good documentation

### Step 1: Install Fly CLI

```bash
# Windows (PowerShell)
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"

# Mac/Linux
curl -L https://fly.io/install.sh | sh
```

### Step 2: Login

```bash
fly auth login
```

### Step 3: Initialize App

```bash
# Backend
cd backend
fly launch --name reddy-anna-backend

# Frontend
cd ../frontend
fly launch --name reddy-anna-frontend
```

### Step 4: Add PostgreSQL

```bash
fly postgres create --name reddy-anna-db
fly postgres attach reddy-anna-db --app reddy-anna-backend
```

### Step 5: Deploy

```bash
# Deploy backend
cd backend
fly deploy

# Deploy frontend
cd ../frontend
fly deploy
```

### Step 6: Run Migrations

```bash
fly ssh console -a reddy-anna-backend
npm run migrate
npm run seed
exit
```

---

## 🎯 Option 5: Google Cloud Free Tier

### Why Google Cloud?
- ✅ Always free e2-micro instance
- ✅ 30GB storage
- ✅ $300 credit for 90 days
- ✅ Production-ready

### Step 1: Create Account

1. Go to [https://cloud.google.com/free](https://cloud.google.com/free)
2. Sign up and activate free trial

### Step 2: Create VM

1. **Compute Engine** → **VM Instances** → **Create**
2. **Name**: reddy-anna-server
3. **Region**: us-central1 (cheapest)
4. **Machine type**: e2-micro (0.25-1 vCPU, 1GB RAM) - Free tier
5. **Boot disk**: Ubuntu 22.04 LTS, 30GB
6. **Firewall**: Allow HTTP and HTTPS traffic
7. **Create**

### Step 3: Setup Firewall Rules

```bash
# Create firewall rules
gcloud compute firewall-rules create allow-reddy-anna \
    --allow tcp:3000,tcp:3001 \
    --source-ranges 0.0.0.0/0 \
    --description "Allow Reddy Anna app ports"
```

### Step 4: SSH and Deploy

```bash
# SSH into instance
gcloud compute ssh reddy-anna-server

# Follow same steps as Oracle Cloud (Docker installation and deployment)
```

---

## 📝 Quick Deployment Checklist

### Pre-Deployment:
- [ ] Git repository created
- [ ] .env.example filled out
- [ ] Code tested locally
- [ ] Database migrations ready
- [ ] Admin credentials configured

### During Deployment:
- [ ] VPS/Platform account created
- [ ] Services deployed
- [ ] Database created
- [ ] Environment variables set
- [ ] Migrations run
- [ ] Initial data seeded

### Post-Deployment:
- [ ] Frontend accessible
- [ ] Backend health check passes
- [ ] Database connected
- [ ] Admin login works
- [ ] WebSocket connections work
- [ ] Test game flow
- [ ] SSL configured (if production)

---

## 💰 Cost Comparison After Free Tier

| Platform | After Free Tier | Best For |
|----------|----------------|----------|
| Render | $7/month | Hobby projects |
| Railway | $5-20/month | Small apps |
| Oracle Cloud | Still FREE | Production |
| Fly.io | $5-15/month | Edge apps |
| Google Cloud | $5-25/month | Enterprise |

---

## 🔒 Security Recommendations

### For Free Tier Deployment:

1. **Change Default Credentials**
```bash
# Update .env
ADMIN_PASSWORD=NewSecurePassword123!
JWT_SECRET=generate-a-long-random-string-here
```

2. **Enable Rate Limiting** (Already configured in code)

3. **Setup HTTPS** (Most platforms provide free SSL)

4. **Use Environment Variables** (Never commit secrets)

5. **Regular Updates**
```bash
git pull origin main
docker compose up -d --build
```

---

## 🐛 Common Issues & Solutions

### Issue: Out of Memory
**Solution:** Reduce concurrent connections or upgrade plan
```javascript
// backend/src/index.ts
const server = app.listen(PORT, () => {
  server.maxConnections = 50; // Limit for free tier
});
```

### Issue: Database Connection Limit
**Solution:** Use connection pooling (already configured)

### Issue: Slow Performance
**Solution:** 
- Use Redis caching (included)
- Optimize queries
- Add CDN for frontend assets

### Issue: Application Sleeps
**Solution (Render):** Use a cron job to ping every 14 minutes
```bash
# Use cron-job.org to ping:
https://reddy-anna-backend.onrender.com/health
```

---

## 📊 Monitoring Your Free VPS

### Basic Monitoring Commands:

```bash
# Check disk usage
df -h

# Check memory
free -h

# Check Docker containers
docker stats

# View logs
docker compose logs -f

# Check database size
docker compose exec postgres psql -U postgres -d reddy_anna -c "
SELECT pg_size_pretty(pg_database_size('reddy_anna'));"
```

### External Monitoring (Free):

- **UptimeRobot** - Free uptime monitoring
- **Render Dashboard** - Built-in metrics
- **Railway Dashboard** - Resource usage
- **Oracle Cloud Monitoring** - Free tier included

---

## 🎯 Best Choice for Different Scenarios

### For Testing/Demo:
→ **Render** (Easiest, no setup required)

### For Learning/Development:
→ **Railway** (Good balance, better performance)

### For Small Production:
→ **Fly.io** (Good performance, global)

### For Serious Production:
→ **Oracle Cloud Free Tier** (Best resources, always free)

### For Enterprise:
→ **Google Cloud** (Most reliable, scalable)

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Oracle Cloud Always Free](https://www.oracle.com/cloud/free/)
- [Fly.io Documentation](https://fly.io/docs/)
- [Google Cloud Free Tier](https://cloud.google.com/free)

---

## 🚀 Next Steps After Deployment

1. Test all features thoroughly
2. Set up custom domain (optional)
3. Configure SSL certificates
4. Set up monitoring
5. Plan for scaling if needed
6. Regular backups
7. Security audits

---

**Ready to deploy! Choose your platform and follow the guide above. Good luck! 🎮**