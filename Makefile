# Makefile for Asubeb Backend Docker Operations

.PHONY: help build up down logs clean dev-up dev-down dev-logs migrate studio

# Default target
help:
	@echo "Available commands:"
	@echo "  build     - Build Docker images"
	@echo "  up        - Start production services"
	@echo "  down      - Stop production services"
	@echo "  logs      - View production logs"
	@echo "  dev-up    - Start development services"
	@echo "  dev-down  - Stop development services"
	@echo "  dev-logs  - View development logs"
	@echo "  migrate   - Run database migrations"
	@echo "  studio    - Start Prisma Studio"
	@echo "  clean     - Clean up Docker resources"

# Production commands
build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

# Development commands
dev-up:
	docker-compose -f docker-compose.dev.yml up -d

dev-down:
	docker-compose -f docker-compose.dev.yml down

dev-logs:
	docker-compose -f docker-compose.dev.yml logs -f

# Database commands
migrate:
	docker-compose exec backend npx prisma migrate deploy

migrate-dev:
	docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate deploy

studio:
	docker-compose --profile tools up prisma-studio

studio-dev:
	docker-compose -f docker-compose.dev.yml up prisma-studio

# Utility commands
clean:
	docker-compose down -v
	docker system prune -f

clean-dev:
	docker-compose -f docker-compose.dev.yml down -v

restart:
	docker-compose restart

restart-dev:
	docker-compose -f docker-compose.dev.yml restart

# Health checks
health:
	docker-compose ps
	docker-compose exec postgres pg_isready -U postgres

health-dev:
	docker-compose -f docker-compose.dev.yml ps
	docker-compose -f docker-compose.dev.yml exec postgres pg_isready -U postgres

# Shell access
shell:
	docker-compose exec backend sh

shell-dev:
	docker-compose -f docker-compose.dev.yml exec backend sh

# Database shell
db-shell:
	docker-compose exec postgres psql -U postgres -d asubeb_db

db-shell-dev:
	docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d asubeb_db_dev
