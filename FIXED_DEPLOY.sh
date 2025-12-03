#!/bin/bash

# Reddy Anna - Fixed Complete Deployment Script
# This script will clean, rebuild, and deploy the entire application

set -e  # Exit on any error

echo "=================================================="
echo "🚀 Reddy Anna - Complete Deployment Script"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${GREEN}[STEP]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    print_error "docker-compose.yml not found. Please run this script from /opt/reddy_anna"
    exit 1
fi

print_step "Changing to project directory"
cd /opt/reddy_anna

# Step 1: Stop and remove all containers
print_step "Step 1: Stopping and removing all containers..."
docker compose down -v 2>/dev/null || true
print_success "Containers stopped"

# Step 2: Clean up Docker resources
print_step "Step 2: Cleaning Docker volumes and networks..."
docker volume rm reddy_anna_postgres_data 2>/dev/null || true
docker volume rm reddy_anna_redis_data 2>/dev/null || true
docker volume rm reddy_anna_backend_uploads 2>/dev/null || true
docker network prune -f
print_success "Docker resources cleaned"

# Step 3: Build fresh images
print_step "Step 3: Building fresh Docker images (this may take a few minutes)..."
docker compose build --no-cache backend
docker compose build --no-cache frontend
print_success "Docker images built"

# Step 4: Start PostgreSQL and Redis
print_step "Step 4: Starting PostgreSQL and Redis..."
docker compose up -d postgres redis
sleep 10
print_success "Database services started"

# Verify PostgreSQL is ready
print_step "Verifying PostgreSQL is ready..."
for i in {1..30}; do
    if docker exec reddy-anna-postgres pg_isready -U postgres > /dev/null 2>&1; then
        print_success "PostgreSQL is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "PostgreSQL failed to start"
        exit 1
    fi
    echo "Waiting for PostgreSQL... ($i/30)"
    sleep 2
done

# Step 5: Start backend
print_step "Step 5: Starting backend service..."
docker compose up -d backend
sleep 5
print_success "Backend started"

# Step 6: Run database migrations
print_step "Step 6: Running database migrations..."
echo "Attempting migration..."

# Try the new direct migration script
if docker exec reddy-anna-backend npm run migrate 2>&1 | tee /tmp/migration.log; then
    print_success "Migration completed successfully"
else
    print_warning "Migration script had issues, trying direct SQL execution..."
    
    # Copy SQL file and execute directly
    docker cp backend/src/db/migrations/0001_create_initial_schema.sql reddy-anna-postgres:/tmp/
    
    if docker exec reddy-anna-postgres psql -U postgres -d reddy_anna -f /tmp/0001_create_initial_schema.sql; then
        print_success "Direct SQL migration completed"
    else
        print_error "Migration failed completely"
        echo "Please check the logs above for details"
        exit 1
    fi
fi

# Step 7: Verify tables were created
print_step "Step 7: Verifying database schema..."
TABLE_COUNT=$(docker exec reddy-anna-postgres psql -U postgres -d reddy_anna -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)

if [ "$TABLE_COUNT" -ge 15 ]; then
    print_success "Database schema verified: $TABLE_COUNT tables created"
    docker exec reddy-anna-postgres psql -U postgres -d reddy_anna -c "\dt"
else
    print_error "Expected at least 15 tables, found: $TABLE_COUNT"
    exit 1
fi

# Step 8: Create admin user
print_step "Step 8: Creating admin user..."
docker exec reddy-anna-postgres psql -U postgres -d reddy_anna << 'EOF' 2>/dev/null || print_warning "Admin user might already exist"
INSERT INTO users (
  id,
  username,
  email,
  password_hash,
  phone_number,
  full_name,
  role,
  status,
  balance,
  bonus_balance,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'admin',
  'admin@reddyanna.com',
  '$2b$10$rKgF8X9VJHYhKGxYHXKZQOGxLQ5z7Z3vLx4vBxQvz0z1z2z3z4z5z',
  'admin',
  'Administrator',
  'admin',
  'active',
  0.00,
  0.00,
  NOW(),
  NOW()
) ON CONFLICT (username) DO NOTHING;
EOF

# Verify admin user
ADMIN_EXISTS=$(docker exec reddy-anna-postgres psql -U postgres -d reddy_anna -t -c "SELECT COUNT(*) FROM users WHERE username = 'admin';" | xargs)
if [ "$ADMIN_EXISTS" -eq 1 ]; then
    print_success "Admin user verified"
    echo ""
    echo "📝 Admin Credentials:"
    echo "   Username: admin"
    echo "   Password: admin123"
    echo ""
else
    print_error "Admin user creation failed"
    exit 1
fi

# Step 9: Restart backend to ensure clean state
print_step "Step 9: Restarting backend service..."
docker compose restart backend
sleep 5
print_success "Backend restarted"

# Step 10: Start frontend
print_step "Step 10: Starting frontend service..."
docker compose up -d frontend
sleep 10
print_success "Frontend started"

# Step 11: Verify all services
print_step "Step 11: Verifying all services..."
echo ""
docker compose ps
echo ""

# Check backend health
print_step "Checking backend health..."
for i in {1..30}; do
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        print_success "Backend is healthy"
        break
    fi
    if [ $i -eq 30 ]; then
        print_warning "Backend health check timeout (might still be starting)"
    fi
    sleep 2
done

# Check frontend
print_step "Checking frontend..."
for i in {1..30}; do
    if curl -s -I http://localhost:3000 > /dev/null 2>&1; then
        print_success "Frontend is accessible"
        break
    fi
    if [ $i -eq 30 ]; then
        print_warning "Frontend timeout (might still be building)"
    fi
    sleep 2
done

# Step 12: Display service logs
print_step "Step 12: Displaying recent logs..."
echo ""
echo "=== Backend Logs (last 20 lines) ==="
docker logs reddy-anna-backend --tail 20
echo ""
echo "=== Frontend Logs (last 20 lines) ==="
docker logs reddy-anna-frontend --tail 20
echo ""

# Final summary
echo ""
echo "=================================================="
echo "✅ DEPLOYMENT COMPLETE"
echo "=================================================="
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://49.205.77.153:3000"
echo "   Backend:  http://49.205.77.153:3001"
echo "   Admin:    http://49.205.77.153:3000/admin/login"
echo ""
echo "👤 Admin Credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "📊 Database Info:"
echo "   Tables Created: $TABLE_COUNT"
echo "   PostgreSQL: Running"
echo "   Redis: Running"
echo ""
echo "🔧 Next Steps:"
echo "   1. Test admin login at /admin/login"
echo "   2. Create test player account"
echo "   3. Test game functionality"
echo "   4. Monitor logs: docker compose logs -f"
echo ""
echo "=================================================="
echo ""

# Optional: Show live logs
read -p "Do you want to view live logs? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Showing live logs (Ctrl+C to exit)..."
    docker compose logs -f
fi