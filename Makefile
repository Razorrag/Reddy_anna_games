.PHONY: help setup start stop restart logs clean install build test migrate seed

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

setup: ## Initial project setup
	@echo "Setting up Reddy Anna Gaming Platform..."
	@cp .env.example .env
	@echo "✓ Created .env file (please update with your values)"
	@npm install
	@echo "✓ Installed root dependencies"
	@echo "✓ Setup complete! Run 'make start' to start the application"

install: ## Install all dependencies
	@echo "Installing dependencies..."
	@npm install
	@echo "✓ Dependencies installed"

start: ## Start all services with Docker
	@echo "Starting services..."
	@docker compose up -d
	@echo "✓ Services started"
	@echo "Backend: http://localhost:3000"
	@echo "Frontend: http://localhost:5173"
	@echo "PostgreSQL: localhost:5432"
	@echo "Redis: localhost:6379"

stop: ## Stop all services
	@echo "Stopping services..."
	@docker compose down
	@echo "✓ Services stopped"

restart: ## Restart all services
	@echo "Restarting services..."
	@docker compose restart
	@echo "✓ Services restarted"

logs: ## View logs from all services
	@docker compose logs -f

logs-backend: ## View backend logs
	@docker compose logs -f backend

logs-frontend: ## View frontend logs
	@docker compose logs -f frontend

logs-db: ## View database logs
	@docker compose logs -f postgres

clean: ## Clean up Docker volumes and containers
	@echo "Cleaning up..."
	@docker compose down -v
	@echo "✓ Cleaned up"

build: ## Build all services
	@echo "Building services..."
	@docker compose build
	@echo "✓ Services built"

migrate: ## Run database migrations
	@echo "Running migrations..."
	@docker compose exec backend npm run migrate
	@echo "✓ Migrations complete"

seed: ## Seed database with initial data
	@echo "Seeding database..."
	@docker compose exec backend npm run seed
	@echo "✓ Database seeded"

test: ## Run tests
	@echo "Running tests..."
	@npm run test
	@echo "✓ Tests complete"

dev: ## Start development environment
	@echo "Starting development environment..."
	@npm run dev

shell-backend: ## Open shell in backend container
	@docker compose exec backend sh

shell-db: ## Open PostgreSQL shell
	@docker compose exec postgres psql -U postgres -d reddy_anna_games

reset-db: ## Reset database (WARNING: destroys all data)
	@echo "Resetting database..."
	@docker compose down -v postgres
	@docker compose up -d postgres
	@sleep 5
	@make migrate
	@make seed
	@echo "✓ Database reset complete"