# WhatToEatNext Project Makefile
# Streamlined commands for deployment, testing, and development

.PHONY: help install dev build test lint clean deploy check errors scripts docker-build docker-dev docker-prod docker-clean

# Default target
help:
	@echo "🧙‍♂️ WhatToEatNext - Alchemical Kitchen Management"
	@echo ""
	@echo "📋 Available commands:"
	@echo "  make install     - Install all dependencies"
	@echo "  make dev         - Start development server"
	@echo "  make build       - Build for production"
	@echo "  make test        - Run all tests"
	@echo "  make lint        - Run linting checks"
	@echo "  make deploy      - Full deployment pipeline"
	@echo "  make check       - TypeScript error checking"
	@echo "  make errors      - Analyze current TypeScript errors"
	@echo "  make clean       - Clean build artifacts"
	@echo "  make scripts     - List available fix scripts"
	@echo ""
	@echo "🐳 Docker commands:"
	@echo "  make docker-build - Build Docker image"
	@echo "  make docker-dev   - Start development container"
	@echo "  make docker-prod  - Start production container"
	@echo "  make docker-clean - Clean Docker resources"
	@echo ""
	@echo "🔧 Development workflow:"
	@echo "  make check → make build → make test → make deploy"
	@echo "🐳 Docker workflow:"
	@echo "  make docker-build → make docker-prod"

# Installation
install:
	@echo "📦 Installing dependencies..."
	yarn install

# Development
dev:
	@echo "🚀 Starting development server..."
	yarn dev

dev-astro:
	@echo "🌟 Starting Astro development server..."
	yarn astro dev

# Build commands
build:
	@echo "🏗️  Building project..."
	@echo "Step 1: TypeScript compilation check..."
	yarn tsc --noEmit --skipLibCheck
	@echo "Step 2: Production build..."
	yarn build
	@echo "✅ Build completed successfully!"

build-astro:
	@echo "🌟 Building Astro project..."
	yarn astro build

# Testing
test:
	@echo "🧪 Running all tests..."
	yarn test

test-watch:
	@echo "👀 Running tests in watch mode..."
	yarn test --watch

test-coverage:
	@echo "📊 Running tests with coverage..."
	yarn test --coverage

# Linting
lint:
	@echo "🔍 Running linting checks..."
	yarn lint

lint-fix:
	@echo "🔧 Fixing linting issues..."
	yarn lint --fix

# TypeScript error checking
check:
	@echo "🔎 Checking TypeScript errors..."
	@yarn tsc --noEmit --skipLibCheck

errors:
	@echo "📊 Analyzing current TypeScript errors..."
	@echo "Total error count:"
	@yarn tsc --noEmit --skipLibCheck 2>&1 | grep -E "error TS" | wc -l || echo "0"
	@echo ""
	@echo "Error breakdown by type:"
	@yarn tsc --noEmit --skipLibCheck 2>&1 | grep -E "error TS" | cut -d'(' -f2 | cut -d')' -f1 | sort | uniq -c | sort -nr || echo "No errors found"

errors-detail:
	@echo "📋 Detailed error analysis..."
	@yarn tsc --noEmit --skipLibCheck 2>&1 | tail -20

# Fix scripts
scripts:
	@echo "🛠️  Available fix scripts:"
	@echo ""
	@echo "TypeScript fixes:"
	@find scripts/typescript-fixes -name "*.js" | head -10 | sed 's/^/  /'
	@echo ""
	@echo "Syntax fixes:"
	@find scripts/syntax-fixes -name "*.js" | head -5 | sed 's/^/  /'
	@echo ""
	@echo "🎯 Run with: node <script-path> --dry-run"

# Run specific script categories
fix-typescript:
	@echo "🔧 Running systematic TypeScript fixes..."
	node scripts/typescript-fixes/fix-duplicate-identifiers-systematic.js --dry-run

fix-syntax:
	@echo "🔧 Running syntax fixes..."
	node scripts/syntax-fixes/fix-remaining-syntax-errors.js --dry-run

fix-elemental:
	@echo "🔮 Running elemental logic fixes..."
	node scripts/elemental-fixes/fix-elemental-logic.js --dry-run

# Clean up
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf .next/
	rm -rf dist/
	rm -rf build/
	rm -rf node_modules/.cache/
	@echo "✅ Clean completed!"

clean-full:
	@echo "🧹 Full clean (including node_modules)..."
	rm -rf .next/ dist/ build/ node_modules/
	@echo "✅ Full clean completed! Run 'make install' to reinstall dependencies."

# Git helpers
status:
	@echo "📊 Git repository status:"
	@git status --short
	@echo ""
	@echo "📈 Recent commits:"
	@git log --oneline -5

commit-checkpoint:
	@echo "💾 Creating development checkpoint..."
	git add .
	git commit -m "Development checkpoint - $(shell date '+%Y-%m-%d %H:%M')"

# Deployment pipeline
deploy-check:
	@echo "🔍 Pre-deployment validation..."
	@echo "1. Checking TypeScript errors..."
	@make check
	@echo "2. Running tests..."
	@make test
	@echo "3. Building project..."
	@make build
	@echo "✅ Pre-deployment checks passed!"

deploy:
	@echo "🚀 Starting deployment pipeline..."
	@make deploy-check
	@echo "📦 Deployment ready!"
	@echo "⚡ Next steps:"
	@echo "  - Review build output"
	@echo "  - Deploy to your hosting platform"
	@echo "  - Monitor for issues"

# Development workflow helpers
quick-check:
	@echo "⚡ Quick development check..."
	@yarn tsc --noEmit --skipLibCheck | tail -10

workflow:
	@echo "🔄 Running complete development workflow..."
	@echo "Step 1: Error check..."
	@make quick-check
	@echo "Step 2: Build validation..."
	@make build
	@echo "Step 3: Test execution..."
	@make test
	@echo "✅ Workflow completed successfully!"

# Phase management (based on your systematic error reduction)
phase-status:
	@echo "📊 Current Phase Status:"
	@echo "Total TypeScript errors:"
	@yarn tsc --noEmit --skipLibCheck 2>&1 | grep -E "error TS" | wc -l || echo "0"
	@echo ""
	@echo "🎯 Phase targets achieved:"
	@echo "  ✅ Phase 2A: standardizedIngredient.ts completed"
	@echo "  🎯 Phase 2B: In progress (424 → <350 target)"

# Emergency helpers
emergency-restore:
	@echo "🚨 Emergency: Checking for recent clean state..."
	@git log --oneline -10 | grep -E "(checkpoint|clean|stable)"
	@echo ""
	@echo "⚠️  To restore to clean state, use:"
	@echo "  git reset --hard <commit-hash>"

backup:
	@echo "💾 Creating backup branch..."
	git checkout -b backup-$(shell date '+%Y%m%d-%H%M%S')
	git checkout -
	@echo "✅ Backup branch created!"

# Docker commands
docker-build:
	@echo "🐳 Building Docker images..."
	docker build -t whattoeatnext:latest .
	docker build -f Dockerfile.dev -t whattoeatnext:dev .
	@echo "✅ Docker images built successfully!"

docker-dev:
	@echo "🐳 Starting development container with hot reload..."
	docker-compose up whattoeatnext-dev

docker-prod:
	@echo "🐳 Starting production container..."
	docker-compose up --build

docker-prod-bg:
	@echo "🐳 Starting production container in background..."
	docker-compose up -d --build

docker-logs:
	@echo "📋 Viewing Docker container logs..."
	docker-compose logs -f

docker-stop:
	@echo "🛑 Stopping Docker containers..."
	docker-compose down

docker-clean:
	@echo "🧹 Cleaning Docker resources..."
	docker-compose down --volumes --remove-orphans
	docker system prune -f
	@echo "✅ Docker cleanup completed!"

docker-shell:
	@echo "🐚 Opening shell in running container..."
	docker-compose exec whattoeatnext sh

docker-health:
	@echo "🏥 Checking container health..."
	curl -f http://localhost:3000/api/health || echo "Health check failed"

# Docker workflow helpers
docker-workflow:
	@echo "🐳 Running Docker development workflow..."
	@echo "Step 1: Building images..."
	@make docker-build
	@echo "Step 2: Starting development container..."
	@make docker-dev

docker-deploy:
	@echo "🚀 Docker deployment pipeline..."
	@echo "Step 1: Building production image..."
	@make docker-build
	@echo "Step 2: Starting production container..."
	@make docker-prod-bg
	@echo "Step 3: Health check..."
	@sleep 10
	@make docker-health
	@echo "✅ Docker deployment completed!"

# Documentation
docs:
	@echo "📚 Project documentation:"
	@echo "  Architecture: docs/architecture/"
	@echo "  Build fixes: docs/build-fixes.md"
	@echo "  Scripts: scripts/QUICK_REFERENCE.md"
	@echo "  Inventory: scripts/INVENTORY.md" 