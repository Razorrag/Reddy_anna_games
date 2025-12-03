#!/bin/bash

echo "========================================"
echo " Reddy Anna - Manual Setup (No Docker)"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}[INFO] This script will guide you through manual setup${NC}"
echo ""

# Check PostgreSQL
echo -e "${YELLOW}[1/6] Checking PostgreSQL...${NC}"
if command -v psql >/dev/null 2>&1; then
    echo -e "${GREEN}[OK] PostgreSQL is installed${NC}"
    
    # Check if database exists
    if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw reddy_anna_games; then
        echo -e "${GREEN}[OK] Database 'reddy_anna_games' exists${NC}"
    else
        echo -e "${YELLOW}[INFO] Creating database 'reddy_anna_games'...${NC}"
        sudo -u postgres createdb reddy_anna_games
        echo -e "${GREEN}[OK] Database created${NC}"
    fi
else
    echo -e "${RED}[ERROR] PostgreSQL is not installed!${NC}"
    echo "Please install PostgreSQL 14+:"
    echo "  sudo apt update"
    echo "  sudo apt install postgresql postgresql-contrib"
    echo "  sudo systemctl start postgresql"
    exit 1
fi
echo ""

# Check Redis
echo -e "${YELLOW}[2/6] Checking Redis...${NC}"
if command -v redis-cli >/dev/null 2>&1; then
    echo -e "${GREEN}[OK] Redis is installed${NC}"
    
    # Check if Redis is running
    if redis-cli ping >/dev/null 2>&1; then
        echo -e "${GREEN}[OK] Redis is running${NC}"
    else
        echo -e "${YELLOW}[INFO] Starting Redis...${NC}"
        sudo systemctl start redis-server || redis-server --daemonize yes
        sleep 2
        if redis-cli ping >/dev/null 2>&1; then
            echo -e "${GREEN}[OK] Redis started${NC}"
        else
            echo -e "${RED}[ERROR] Failed to start Redis${NC}"
            exit 1
        fi
    fi
else
    echo -e "${RED}[ERROR] Redis is not installed!${NC}"
    echo "Please install Redis:"
    echo "  sudo apt update"
    echo "  sudo apt install redis-server"
    echo "  sudo systemctl start redis-server"
    exit 1
fi
echo ""

# Setup Backend
echo -e "${YELLOW}[3/6] Setting up Backend...${NC}"
cd backend || exit 1

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}[INFO] Creating .env file...${NC}"
    cat > .env << EOF
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/reddy_anna_games

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=7d

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# CORS
CORS_ORIGIN=http://localhost:5173

# Stream
STREAM_URL=http://localhost:8080/hls/stream.m3u8
EOF
    echo -e "${GREEN}[OK] .env file created${NC}"
else
    echo -e "${GREEN}[OK] .env file exists${NC}"
fi

# Install dependencies
echo -e "${YELLOW}[INFO] Installing backend dependencies...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR] Failed to install backend dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}[OK] Backend dependencies installed${NC}"
echo ""

# Run migrations
echo -e "${YELLOW}[4/6] Running database migrations...${NC}"
npm run migrate
if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR] Failed to run migrations${NC}"
    exit 1
fi
echo -e "${GREEN}[OK] Database migrations completed${NC}"
echo ""

# Optional: Seed data
echo -e "${YELLOW}[INFO] Do you want to seed test data? (y/n)${NC}"
read -t 10 -n 1 seed_choice
echo ""
if [ "$seed_choice" = "y" ] || [ "$seed_choice" = "Y" ]; then
    npm run seed
    echo -e "${GREEN}[OK] Test data seeded${NC}"
    echo -e "${YELLOW}[INFO] Admin credentials: admin / Admin@123${NC}"
fi
echo ""

# Start Backend
echo -e "${YELLOW}[5/6] Starting Backend server...${NC}"
gnome-terminal -- bash -c "cd $(pwd) && npm run dev; exec bash" 2>/dev/null || \
xterm -e "cd $(pwd) && npm run dev" 2>/dev/null || \
konsole -e "cd $(pwd) && npm run dev" 2>/dev/null || \
(npm run dev > backend.log 2>&1 &)

sleep 3
cd ..
echo -e "${GREEN}[OK] Backend started on http://localhost:3001${NC}"
echo ""

# Setup Frontend
echo -e "${YELLOW}[6/6] Setting up Frontend...${NC}"
cd frontend || exit 1

# Install dependencies
echo -e "${YELLOW}[INFO] Installing frontend dependencies...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR] Failed to install frontend dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}[OK] Frontend dependencies installed${NC}"
echo ""

# Start Frontend
echo -e "${YELLOW}[INFO] Starting Frontend server...${NC}"
gnome-terminal -- bash -c "cd $(pwd) && npm run dev; exec bash" 2>/dev/null || \
xterm -e "cd $(pwd) && npm run dev" 2>/dev/null || \
konsole -e "cd $(pwd) && npm run dev" 2>/dev/null || \
(npm run dev > frontend.log 2>&1 &)

sleep 3
cd ..
echo -e "${GREEN}[OK] Frontend started on http://localhost:5173${NC}"
echo ""

echo "========================================"
echo -e "${GREEN} Application Started Successfully! ${NC}"
echo "========================================"
echo ""
echo -e "${GREEN}Backend API:${NC}  http://localhost:3001"
echo -e "${GREEN}Frontend UI:${NC}  http://localhost:5173"
echo -e "${GREEN}WebSocket:${NC}    ws://localhost:3001"
echo ""
echo -e "${YELLOW}Logs:${NC}"
echo "  Backend:  backend/backend.log"
echo "  Frontend: frontend/frontend.log"
echo ""
echo -e "${YELLOW}To stop servers:${NC}"
echo "  killall node"
echo ""

# Try to open browser
sleep 2
if command -v xdg-open >/dev/null 2>&1; then
    xdg-open http://localhost:5173 2>/dev/null
elif command -v open >/dev/null 2>&1; then
    open http://localhost:5173 2>/dev/null
else
    echo -e "${YELLOW}Please open http://localhost:5173 in your browser${NC}"
fi