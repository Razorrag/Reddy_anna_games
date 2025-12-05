#!/bin/bash

# ============================================
# VPS FRONTEND-ONLY UPDATE SCRIPT
# Quick update for landing page changes
# ============================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Quick Frontend Update (Landing Page)${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run with sudo: sudo bash VPS_UPDATE_FRONTEND_ONLY.sh"
    exit 1
fi

print_info "Rebuilding frontend container only..."
echo ""

# Stop frontend
print_info "Stopping frontend container..."
docker-compose -f docker-compose.prod.yml stop frontend
print_status "Frontend stopped"

# Remove old frontend image
print_info "Removing old frontend image..."
docker-compose -f docker-compose.prod.yml rm -f frontend
print_status "Old image removed"

# Rebuild frontend
print_info "Building new frontend (this includes landing page updates)..."
docker-compose -f docker-compose.prod.yml build --no-cache frontend
print_status "Frontend rebuilt"

# Start frontend
print_info "Starting frontend..."
docker-compose -f docker-compose.prod.yml up -d frontend
print_status "Frontend started"

echo ""
echo -e "${GREEN}✓ Frontend update complete!${NC}"
echo ""
print_info "Visit https://rajugarikossu.com to see changes"
echo ""
print_info "Check these new features:"
echo "  • App name: 'Raju Gari Kossu'"
echo "  • Language selector (EN/HI/TE)"
echo "  • About section"
echo "  • Game Rules section"
echo "  • WhatsApp float button"
echo ""