@echo off
echo.
echo ========================================
echo   REDDY ANNA GAMING PLATFORM
echo   Starting All Services...
echo ========================================
echo.

REM Check if Docker is installed
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker is not installed or not in PATH
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Check if Docker is running
docker info >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker Desktop is not running
    echo Please start Docker Desktop and try again
    pause
    exit /b 1
)

echo [1/5] Stopping any existing containers...
docker-compose down

echo.
echo [2/5] Starting Docker containers...
docker-compose up -d

echo.
echo [3/5] Waiting for services to initialize (30 seconds)...
timeout /t 30 /nobreak

echo.
echo [4/5] Checking container status...
docker ps --filter "name=reddy-anna" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo.
echo [5/5] Running database migrations...
docker exec reddy-anna-backend npm run db:push 2>nul

echo.
echo ========================================
echo   PLATFORM IS READY!
echo ========================================
echo.
echo Frontend:     http://localhost:3000
echo Backend API:  http://localhost:3001
echo Database:     localhost:5432
echo Redis:        localhost:6379
echo Streaming:    localhost:8080
echo.
echo ========================================
echo   USEFUL COMMANDS
echo ========================================
echo.
echo Stop all:     docker-compose down
echo View logs:    docker-compose logs -f
echo Restart:      docker-compose restart
echo.
echo Backend logs: docker logs -f reddy-anna-backend
echo DB logs:      docker logs -f reddy-anna-postgres
echo.
echo ========================================
echo.
pause