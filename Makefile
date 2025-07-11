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
	@echo "🎯 Phase management commands:"
	@echo "  make phase-status     - Show current campaign progress"
	@echo "  make phase-validate   - Validate phase completion"
	@echo "  make phase-checkpoint - Create phase checkpoint commit"
	@echo "  make phase-report     - Comprehensive error analysis"
	@echo ""
	@echo "🐳 Docker commands:"
	@echo "  make docker-setup     - Setup Docker environment (install Docker first)"
	@echo "  make docker-build     - Build all Docker images"
	@echo "  make docker-build-dev - Build development Docker image"
	@echo "  make docker-dev       - Start development container (requires Docker)"
	@echo "  make docker-dev-no-check - Start development container (no Docker check)"
	@echo "  make docker-prod      - Start production container"
	@echo "  make docker-clean     - Clean Docker resources"
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
dev: docker-health-optional
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

# Docker health check (required)
docker-health:
	@echo "🐳 Checking Docker health..."
	@if ! command -v docker > /dev/null 2>&1; then \
		echo "❌ Docker CLI is not accessible in PATH."; \
		echo ""; \
		echo "🔧 Troubleshooting steps:"; \
		echo "  1. Ensure Docker Desktop is running"; \
		echo "  2. Try restarting Docker Desktop"; \
		echo "  3. Check if Docker CLI tools are properly linked"; \
		echo ""; \
		echo "💡 For local development without Docker, use 'make dev'"; \
		echo "💡 To fix Docker CLI access, try:"; \
		echo "  - Restart Docker Desktop"; \
		echo "  - Restart your terminal"; \
		echo "  - Check Docker Desktop settings"; \
		exit 1; \
	fi; \
	if ! docker info > /dev/null 2>&1; then \
		echo "❌ Docker is not running or not responding."; \
		echo "Please start Docker Desktop and try again."; \
		exit 1; \
	fi
	@echo "✅ Docker is running and healthy!"

# Docker commands with better error handling
docker-build:
	@echo "🐳 Building Docker images..."
	@if ! /Applications/Docker.app/Contents/Resources/bin/docker --version > /dev/null 2>&1; then \
		echo "❌ Docker is not accessible. Please ensure Docker Desktop is running."; \
		echo "Try restarting Docker Desktop and your terminal."; \
		exit 1; \
	fi
	/Applications/Docker.app/Contents/Resources/bin/docker build -f docker/Dockerfile -t whattoeatnext:latest .
	/Applications/Docker.app/Contents/Resources/bin/docker build -f docker/Dockerfile.dev -t whattoeatnext:dev .
	@echo "✅ Docker images built successfully!"

docker-build-dev:
	@echo "🐳 Building development Docker image..."
	@if ! /Applications/Docker.app/Contents/Resources/bin/docker --version > /dev/null 2>&1; then \
		echo "❌ Docker is not accessible. Please ensure Docker Desktop is running."; \
		echo "Try restarting Docker Desktop and your terminal."; \
		exit 1; \
	fi
	/Applications/Docker.app/Contents/Resources/bin/docker build -f docker/Dockerfile.dev -t whattoeatnext:dev .
	@echo "✅ Development Docker image built successfully!"

# Docker health check (optional - for development)
docker-health-optional:
	@echo "🐳 Checking Docker health (optional)..."
	@if ! docker info > /dev/null 2>&1; then \
		echo "⚠️  Docker is not running. Using local development server instead."; \
		echo "💡 To use Docker, start Docker Desktop and run 'make docker-dev'"; \
	else \
		echo "✅ Docker is running and healthy!"; \
	fi

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

errors-by-file:
	@echo "📁 Errors grouped by file:"
	@yarn tsc --noEmit --skipLibCheck 2>&1 | grep -E "error TS" | cut -d'(' -f1 | sort | uniq -c | sort -nr | head -15

errors-by-type:
	@echo "🏷️  Errors grouped by type:"
	@yarn tsc --noEmit --skipLibCheck 2>&1 | grep -E "error TS" | sed 's/.*error //' | cut -d':' -f1 | sort | uniq -c | sort -nr

errors-critical:
	@echo "🚨 Critical errors (TS2xxx series):"
	@yarn tsc --noEmit --skipLibCheck 2>&1 | grep -E "error TS2[0-9]{3}" | head -10

errors-export:
	@echo "📤 Export/Import errors (TS2305, TS2459):"
	@yarn tsc --noEmit --skipLibCheck 2>&1 | grep -E "(TS2305|TS2459)" | head -10

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

status-detailed:
	@echo "📊 Detailed repository status:"
	@git status
	@echo ""
	@echo "📈 Commit history:"
	@git log --oneline -10
	@echo ""
	@echo "📊 Current branch info:"
	@git branch -v

commit-checkpoint:
	@echo "💾 Creating development checkpoint..."
	git add .
	git commit -m "Development checkpoint - $(shell date '+%Y-%m-%d %H:%M')"

commit-phase:
	@echo "💾 Creating phase-specific commit..."
	@echo "Current error count: $(shell yarn tsc --noEmit --skipLibCheck 2>&1 | grep -E "error TS" | wc -l || echo "0")"
	git add .
	git commit -m "Phase progress - $(shell yarn tsc --noEmit --skipLibCheck 2>&1 | grep -E "error TS" | wc -l || echo "0") errors remaining - $(shell date '+%Y-%m-%d %H:%M')"

git-history:
	@echo "📚 Phase-related commit history:"
	@git log --oneline --grep="Phase" -10
	@echo ""
	@echo "📊 Error reduction commits:"
	@git log --oneline --grep="error" -10

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

workflow-phase:
	@echo "🎯 Running phase-specific workflow..."
	@echo "Step 1: Current phase status..."
	@make phase-status
	@echo "Step 2: Error analysis..."
	@make errors-by-type
	@echo "Step 3: Build validation..."
	@make quick-check
	@echo "Step 4: Phase validation..."
	@make phase-validate
	@echo "✅ Phase workflow completed!"

workflow-debug:
	@echo "🐛 Running debugging workflow..."
	@echo "Step 1: Detailed error analysis..."
	@make errors-detail
	@echo "Step 2: Critical errors..."
	@make errors-critical
	@echo "Step 3: Export/import errors..."
	@make errors-export
	@echo "Step 4: Files with most errors..."
	@make errors-by-file
	@echo "✅ Debug analysis completed!"

# Phase management (based on systematic error reduction campaign)
phase-status:
	@echo "📊 Current Phase Status:"
	@echo "Total TypeScript errors:"
	@yarn tsc --noEmit --skipLibCheck 2>&1 | grep -E "error TS" | wc -l || echo "0"
	@echo ""
	@echo "🏆 Historic Achievement: 96.2% error reduction (5,590→214 errors)"
	@echo ""
	@echo "🎯 Campaign phases completed:"
	@echo "  ✅ Phase 1: Git restoration (5,590→424 errors, 92% reduction)"
	@echo "  ✅ Phase 2A: High-priority fixes (standardizedIngredient.ts, RecipeFinder.ts)"
	@echo "  ✅ Phase 2B: Canonical type unification (424→251 errors, -173 errors)"
	@echo "  ✅ Phase 2C: Downstream interface harmonization (251→242 errors, -9 errors)"
	@echo "  ✅ Phase 2D: Critical interface property alignment (242→235 errors, -7 errors)"
	@echo "  ✅ Phase 2E: Advanced type system alignment (235→220 errors, -15 errors)"
	@echo "  ✅ Phase 2F: Final service layer optimization (259→214 errors, -45 errors)"
	@echo ""
	@echo "🎯 Next Target: Production readiness (<50 errors)"

phase-validate:
	@echo "🔍 Phase validation check..."
	@echo "Current error count: $(shell yarn tsc --noEmit --skipLibCheck 2>&1 | grep -E "error TS" | wc -l || echo "0")"
	@echo "Build stability test:"
	@yarn tsc --noEmit --skipLibCheck > /dev/null 2>&1 && echo "✅ Build stable" || echo "❌ Build has errors"

phase-checkpoint:
	@echo "💾 Creating phase checkpoint..."
	@echo "Error count: $(shell yarn tsc --noEmit --skipLibCheck 2>&1 | grep -E "error TS" | wc -l || echo "0") errors"
	git add .
	git commit -m "Phase checkpoint - $(shell yarn tsc --noEmit --skipLibCheck 2>&1 | grep -E "error TS" | wc -l || echo "0") errors remaining"
	@echo "✅ Checkpoint created!"

phase-report:
	@echo "📈 Comprehensive phase report:"
	@echo "Current status: $(shell yarn tsc --noEmit --skipLibCheck 2>&1 | grep -E "error TS" | wc -l || echo "0") errors"
	@echo ""
	@echo "Error patterns:"
	@yarn tsc --noEmit --skipLibCheck 2>&1 | grep -E "error TS" | sed 's/.*error //' | cut -d':' -f1 | sort | uniq -c | sort -nr | head -10 || echo "No errors found"
	@echo ""
	@echo "Files with most errors:"
	@yarn tsc --noEmit --skipLibCheck 2>&1 | grep -E "error TS" | cut -d'(' -f1 | sort | uniq -c | sort -nr | head -10 || echo "No errors found"

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



docker-dev: docker-health
	@echo "🐳 Starting development container with hot reload..."
	docker-compose -f docker/docker-compose.yml up whattoeatnext-dev

docker-prod:
	@echo "🐳 Starting production container..."
	docker-compose -f docker/docker-compose.yml up --build whattoeatnext-prod

docker-dev-no-check:
	@echo "🐳 Starting development container (no health check)..."
	docker-compose -f docker/docker-compose.yml up whattoeatnext-dev

docker-prod-bg:
	@echo "🐳 Starting production container in background..."
	docker-compose -f docker/docker-compose.yml up -d --build

docker-logs:
	@echo "📋 Viewing Docker container logs..."
	docker-compose -f docker/docker-compose.yml logs -f

docker-stop:
	@echo "🛑 Stopping Docker containers..."
	docker-compose -f docker/docker-compose.yml down

docker-clean:
	@echo "🧹 Cleaning Docker resources..."
	docker-compose -f docker/docker-compose.yml down --volumes --remove-orphans
	docker system prune -f
	@echo "✅ Docker cleanup completed!"

docker-setup:
	@echo "🐳 Setting up Docker environment..."
	@if ! command -v docker > /dev/null 2>&1; then \
		echo "❌ Docker is not installed. Please install Docker Desktop first."; \
		echo "Visit: https://www.docker.com/products/docker-desktop/"; \
		exit 1; \
	fi
	@echo "✅ Docker is installed!"
	@if ! docker info > /dev/null 2>&1; then \
		echo "⚠️  Docker is not running. Please start Docker Desktop."; \
		exit 1; \
	fi
	@echo "✅ Docker is running!"
	@echo "🔧 Building development image..."
	@make docker-build-dev
	@echo "✅ Docker setup completed!"

docker-shell:
	@echo "🐚 Opening shell in running container..."
	docker-compose -f docker/docker-compose.yml exec whattoeatnext sh

# Docker workflow helpers
docker-workflow:
	@echo "🐳 Running Docker development workflow..."
	@if ! command -v docker > /dev/null 2>&1; then \
		echo "❌ Docker CLI is not accessible in PATH."; \
		echo ""; \
		echo "🔧 Docker Desktop appears to be installed but CLI tools are not accessible."; \
		echo "Troubleshooting steps:"; \
		echo "  1. Ensure Docker Desktop is running (check Applications)"; \
		echo "  2. Restart Docker Desktop completely"; \
		echo "  3. Restart your terminal session"; \
		echo "  4. Check Docker Desktop settings for CLI access"; \
		echo ""; \
		echo "💡 For local development without Docker, use:"; \
		echo "  make dev          # Start development server"; \
		echo "  make build        # Build for production"; \
		echo "  make test         # Run tests"; \
		echo ""; \
		echo "💡 To verify Docker CLI access:"; \
		echo "  docker --version  # Should show version if working"; \
		exit 1; \
	fi
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
strict-check:
	@echo "🔒 Running strict TypeScript check..."
	yarn type-check:strict

update-deps:
	@echo "📦 Updating dependencies..."
	yarn deps:update

phase-full-report:
	@echo "📊 Full Phase Report:"
	@make phase-status
	@make errors-by-type
	@make errors-by-file
	@make strict-check

run-script:
	@if [ -z "$(script)" ]; then echo "❌ Specify script with make run-script script=path/to/script.js"; exit 1; fi
	@echo "🛠️ Running $$script --dry-run"
	node $$script --dry-run 