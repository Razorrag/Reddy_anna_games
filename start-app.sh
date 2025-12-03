#!/bin/bash

echo "========================================"
echo " Reddy Anna Gaming Platform Startup"
echo "========================================"
echo ""

# Check if Docker is running
if ! docker ps >/dev/null 2>&1; then
    echo "[ERROR] Docker is not running!"
    echo "Please start Docker and try again."
    exit 1
fi

echo "[1/5] Starting PostgreSQL and Redis..."
docker-compose up -d postgres redis
sleep 10
echo "[OK] Database services started"
echo ""

echo "[2/5] Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to install backend dependencies"
    cd ..
    exit 1
fi
echo "[OK] Backend dependencies installed"
echo ""

echo "[3/5] Running database migrations..."
npm run migrate
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to run migrations"
    cd ..
    exit 1
fi
echo "[OK] Database migrations completed"
echo ""

echo "[4/5] Starting backend server..."
gnome-terminal -- bash -c "npm run dev; exec bash" 2>/dev/null || \
xterm -e "npm run dev" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd \"'$(pwd)'\" && npm run dev"' 2>/dev/null || \
npm run dev &
cd ..
echo "[OK] Backend server starting on http://localhost:3001"
echo ""

echo "[5/5] Starting frontend server..."
cd frontend
npm install
gnome-terminal -- bash -c "npm run dev; exec bash" 2>/dev/null || \
xterm -e "npm run dev" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd \"'$(pwd)'\" && npm run dev"' 2>/dev/null || \
npm run dev &
cd ..
echo "[OK] Frontend server starting on http://localhost:5173"
echo ""

echo "========================================"
echo " Application Started Successfully!"
echo "========================================"
echo ""
echo "Backend API:  http://localhost:3001"
echo "Frontend UI:  http://localhost:5173"
echo "WebSocket:    ws://localhost:3001"
echo ""
echo "Opening frontend in your browser..."
sleep 3

# Open browser
if command -v xdg-open >/dev/null 2>&1; then
    xdg-open http://localhost:5173
elif command -v open >/dev/null 2>&1; then
    open http://localhost:5173
else
    echo "Please open http://localhost:5173 in your browser"
fi