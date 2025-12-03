@echo off
echo ========================================
echo  Reddy Anna Gaming Platform Startup
echo ========================================
echo.

REM Check if Docker is running
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo [1/5] Starting PostgreSQL and Redis...
docker-compose up -d postgres redis
timeout /t 10 /nobreak >nul
echo [OK] Database services started
echo.

echo [2/5] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend dependencies
    cd ..
    pause
    exit /b 1
)
echo [OK] Backend dependencies installed
echo.

echo [3/5] Running database migrations...
call npm run migrate
if %errorlevel% neq 0 (
    echo [ERROR] Failed to run migrations
    cd ..
    pause
    exit /b 1
)
echo [OK] Database migrations completed
echo.

echo [4/5] Starting backend server...
start "Reddy Anna Backend" cmd /k "npm run dev"
cd ..
echo [OK] Backend server starting on http://localhost:3001
echo.

echo [5/5] Starting frontend server...
cd frontend
call npm install
start "Reddy Anna Frontend" cmd /k "npm run dev"
cd ..
echo [OK] Frontend server starting on http://localhost:5173
echo.

echo ========================================
echo  Application Started Successfully!
echo ========================================
echo.
echo Backend API:  http://localhost:3001
echo Frontend UI:  http://localhost:5173
echo WebSocket:    ws://localhost:3001
echo.
echo Press any key to open the frontend in your browser...
pause >nul
start http://localhost:5173