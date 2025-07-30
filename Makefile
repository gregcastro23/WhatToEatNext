# WhatToEatNext Project Makefile
# Streamlined commands for deployment, testing, and development

.PHONY: help install dev build test lint clean deploy check errors scripts docker-build docker-dev docker-prod docker-clean build-validate build-repair build-health build-comprehensive build-quick build-rebuild build-emergency build-workflow build-status build-monitor build-safe ci-validate ci-build ci-test ci-deploy-check ci-quality-gate deploy-pipeline deploy-rollback

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
	@echo "  make lint-fix    - Fix linting issues"
	@echo "  make lint-fast   - Fast incremental linting (changed files only)"
	@echo "  make lint-summary - Quick error count and summary"
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
	@echo "  make docker-build - Build Docker image"
	@echo "  make docker-dev   - Start development container"
	@echo "  make docker-prod  - Start production container"
	@echo "  make docker-clean - Clean Docker resources"
	@echo ""
	@echo "🔧 Build system repair commands:"
	@echo "  make build-validate      - Validate build system health"
	@echo "  make build-repair        - Repair missing manifest files"
	@echo "  make build-health        - Check build system health status"
	@echo "  make build-comprehensive - Full build system repair"
	@echo "  make build-emergency     - Emergency build recovery"
	@echo ""
	@echo "🔍 Advanced linting commands:"
	@echo "  make lint-performance    - Linting with performance metrics"
	@echo "  make lint-fix-safe       - Safe automated fixing with backups"
	@echo "  make lint-auto-fix       - Comprehensive automated fixes"
	@echo "  make lint-domain-astro   - Domain-specific astrological linting"
	@echo "  make lint-domain-campaign - Domain-specific campaign linting"
	@echo "  make lint-watch          - Continuous linting with auto-fix"
	@echo ""
	@echo "📊 Zero-Error Achievement Dashboard:"
	@echo "  make dashboard           - Generate comprehensive zero-error dashboard"
	@echo "  make dashboard-monitor   - Start real-time monitoring (5-min intervals)"
	@echo "  make dashboard-status    - Show current zero-error achievement status"
	@echo "  make dashboard-verbose   - Generate dashboard with verbose output"
	@echo ""
	@echo "📊 Performance validation commands:"
	@echo "  make performance-validate    - Run comprehensive performance validation"
	@echo "  make performance-monitor     - Monitor performance metrics"
	@echo "  make performance-report      - Generate performance report"
	@echo "  make performance-test        - Run performance validation tests"
	@echo "  make performance-baseline    - Establish performance baseline"
	@echo "  make performance-continuous  - Continuous performance monitoring"
	@echo ""
	@echo "🚀 Linting campaign commands:"
	@echo "  make lint-campaign-metrics   - Collect current linting metrics"
	@echo "  make lint-campaign-report    - Generate comprehensive progress report"
	@echo "  make lint-campaign-start     - Start standard linting campaign"
	@echo "  make lint-campaign-dry       - Preview campaign execution"
	@echo "  make lint-campaign-gates     - Evaluate quality gates"
	@echo "  make lint-campaign-deploy    - Check deployment readiness"
	@echo "  make lint-campaign-trends    - Monitor quality trends"
	@echo "  make lint-campaign-cicd      - Generate CI/CD report"
	@echo "  make lint-cache-clear    - Clear ESLint cache"
	@echo ""
	@echo "🚀 Comprehensive workflow commands:"
	@echo "  make lint-workflow       - Full comprehensive workflow"
	@echo "  make lint-workflow-auto  - Automated comprehensive workflow"
	@echo "  make lint-integration    - Integrated error reduction workflow"
	@echo ""
	@echo "🚀 CI/CD Pipeline commands:"
	@echo "  make ci-validate         - Complete CI validation workflow"
	@echo "  make ci-build            - CI-optimized build process"
	@echo "  make ci-test             - CI test execution with coverage"
	@echo "  make ci-deploy-check     - Pre-deployment validation"
	@echo "  make ci-quality-gate     - Quality gate validation"
	@echo "  make deploy-pipeline     - Complete deployment workflow"
	@echo "  make deploy-rollback     - Emergency rollback procedures"
	@echo ""
	@echo "🔧 Development workflow:"
	@echo "  make check → make build → make test → make deploy"
	@echo "🚀 CI/CD workflow:"
	@echo "  make ci-validate → make ci-build → make ci-test → make deploy-pipeline"
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
	yarn lint:fix

# Advanced linting commands
lint-fast:
	@echo "⚡ Running fast incremental linting on changed files..."
	@CHANGED_FILES=$$(git diff --name-only --diff-filter=ACMR HEAD | grep -E '\.(ts|tsx|js|jsx)$$' | tr '\n' ' '); \
	if [ -n "$$CHANGED_FILES" ]; then \
		echo "Linting changed files: $$CHANGED_FILES"; \
		yarn eslint --config eslint.config.cjs --cache --cache-location .eslintcache $$CHANGED_FILES; \
	else \
		echo "No changed TypeScript/JavaScript files to lint"; \
	fi

lint-performance:
	@echo "📊 Running linting with performance metrics..."
	@echo "Starting lint performance analysis..."
	@time yarn lint --format=json --output-file=.eslint-results.json 2>/dev/null || true
	@echo "Results saved to .eslint-results.json"
	@echo "Error summary:"
	@yarn lint 2>&1 | tail -5 || echo "No issues found"

lint-summary:
	@echo "📋 Quick linting summary..."
	@ERROR_COUNT=$$(yarn lint --format=json 2>/dev/null | jq '.[] | select(.errorCount > 0 or .warningCount > 0) | .errorCount + .warningCount' | awk '{sum += $$1} END {print sum+0}' 2>/dev/null || echo "0"); \
	WARNING_COUNT=$$(yarn lint --format=json 2>/dev/null | jq '.[] | select(.errorCount > 0 or .warningCount > 0) | .warningCount' | awk '{sum += $$1} END {print sum+0}' 2>/dev/null || echo "0"); \
	FILE_COUNT=$$(yarn lint --format=json 2>/dev/null | jq '.[] | select(.errorCount > 0 or .warningCount > 0) | .filePath' | wc -l 2>/dev/null || echo "0"); \
	echo "📊 Linting Summary:"; \
	echo "  Errors: $$ERROR_COUNT"; \
	echo "  Warnings: $$WARNING_COUNT"; \
	echo "  Files with issues: $$FILE_COUNT"

lint-fix-safe:
	@echo "🛡️ Running safe automated linting fixes..."
	@echo "Step 1: Creating backup..."
	@cp -r src .lint-backup-$$(date +%s) 2>/dev/null || true
	@echo "Step 2: Running safe fixes (import organization)..."
	@yarn lint:fix --fix-type suggestion,layout || true
	@echo "Step 3: Validating fixes..."
	@make build-health > /dev/null 2>&1 && echo "✅ Safe fixes applied successfully" || echo "⚠️ Build validation needed"

lint-auto-fix:
	@echo "🤖 Running comprehensive automated linting fixes..."
	@echo "Step 1: Import organization..."
	@yarn lint:fix --rule import/order || true
	@echo "Step 2: Unused variable cleanup..."
	@yarn lint:unused-vars || true
	@echo "Step 3: Safe TypeScript fixes..."
	@yarn lint:fix --rule @typescript-eslint/no-unused-vars || true
	@echo "Step 4: Final validation..."
	@make lint-summary

lint-domain-astro:
	@echo "🌟 Running domain-specific linting for astrological calculations..."
	@yarn eslint --config eslint.config.cjs 'src/calculations/**/*.{ts,tsx}' 'src/data/planets/**/*.{ts,tsx}' 'src/utils/reliableAstronomy.ts' 'src/utils/planetaryConsistencyCheck.ts' 'src/services/*Astrological*.ts' 'src/services/*Alchemical*.ts' --format=compact

lint-domain-campaign:
	@echo "📈 Running domain-specific linting for campaign system..."
	@yarn eslint --config eslint.config.cjs 'src/services/campaign/**/*.{ts,tsx}' 'src/types/campaign.ts' 'src/utils/*Campaign*.ts' 'src/utils/*Progress*.ts' --format=compact

lint-watch:
	@echo "👀 Starting linting watch mode..."
	@yarn eslint --config eslint.config.cjs src --watch --cache --fix

lint-cache-clear:
	@echo "🧹 Clearing ESLint cache..."
	@rm -f .eslintcache .eslint-results.json
	@echo "✅ ESLint cache cleared"

# Comprehensive linting workflow integration
lint-workflow:
	@echo "🚀 Running comprehensive linting workflow..."
	yarn lint:workflow

lint-workflow-dry:
	@echo "🔍 Running comprehensive workflow (dry run)..."
	yarn lint:workflow-dry

lint-workflow-auto:
	@echo "🤖 Running automated comprehensive workflow..."
	yarn lint:workflow-auto

lint-workflow-safe:
	@echo "🛡️ Running safe comprehensive workflow..."
	yarn lint:workflow-safe

lint-integration:
	@echo "🔗 Running integrated error reduction workflow..."
	@echo "Step 1: Import organization..."
	@make lint-fix-safe
	@echo "Step 2: TypeScript error reduction..."
	@node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --max-files=15 --auto-fix || true
	@echo "Step 3: Explicit-any elimination..."
	@node scripts/typescript-fixes/fix-explicit-any-systematic.js --max-files=20 --auto-fix || true
	@echo "Step 4: Final validation..."
	@make lint-summary
	@make check
	@echo "✅ Integrated workflow completed"

# TypeScript error checking
check:
	@echo "🔎 Checking TypeScript errors..."
	@yarn tsc --noEmit --skipLibCheck

errors:
	@echo "📊 Analyzing current TypeScript errors..."
	@echo "Total error count:"

# Zero-Error Achievement Dashboard Commands
dashboard:
	@echo "🎯 Generating Zero-Error Achievement Dashboard..."
	@node src/scripts/zero-error-dashboard.ts generate
	@echo "📊 Dashboard generated: .kiro/dashboard/zero-error-achievement-dashboard.md"

dashboard-monitor:
	@echo "👀 Starting Zero-Error Achievement Monitoring..."
	@echo "📊 Real-time monitoring with 5-minute intervals"
	@echo "Press Ctrl+C to stop monitoring"
	@node src/scripts/zero-error-dashboard.ts monitor

dashboard-status:
	@echo "📊 Zero-Error Achievement Status:"
	@node src/scripts/zero-error-dashboard.ts status

dashboard-verbose:
	@echo "🎯 Generating Verbose Zero-Error Dashboard..."
	@node src/scripts/zero-error-dashboard.ts generate --verbose
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

# Build System Repair Commands
build-validate:
	@echo "🔍 Validating build system..."
	@yarn build:validate

build-repair:
	@echo "🔧 Repairing build system..."
	@yarn build:repair

build-health:
	@echo "🏥 Checking build system health..."
	@yarn build:health

build-comprehensive:
	@echo "🚀 Running comprehensive build system repair..."
	@yarn build:comprehensive

build-quick:
	@echo "⚡ Running quick build repair..."
	@yarn build:quick

build-rebuild:
	@echo "🏗️  Rebuilding with error recovery..."
	@yarn build:rebuild

build-emergency:
	@echo "🚨 Running emergency build recovery..."
	@yarn build:emergency

# Build system workflow helpers
build-workflow:
	@echo "🔄 Running complete build system workflow..."
	@echo "Step 1: Health check..."
	@make build-health
	@echo "Step 2: Validation..."
	@make build-validate
	@echo "Step 3: Repair if needed..."
	@make build-repair
	@echo "Step 4: Final validation..."
	@make build-validate
	@echo "✅ Build system workflow completed!"

build-status:
	@echo "📊 Build System Status Report:"
	@echo "==================================="
	@yarn build:health
	@echo ""
	@echo "🔍 Validation Results:"
	@yarn build:validate
	@echo ""
	@echo "📈 Recent build activity:"
	@ls -la .next/ 2>/dev/null | head -5 || echo "No build directory found"

build-monitor:
	@echo "👀 Monitoring build system health..."
	@echo "Current status:"
	@make build-health
	@echo ""
	@echo "💡 Tip: Run 'make build-comprehensive' if issues are detected"
	@echo "💡 Tip: Run 'make build-emergency' for critical failures"

# Enhanced build command with repair integration
build-safe:
	@echo "🛡️  Safe build with automatic repair..."
	@echo "Step 1: Pre-build health check..."
	@make build-health
	@echo "Step 2: Validation..."
	@make build-validate
	@echo "Step 3: Repair if needed..."
	@yarn build:quick
	@echo "Step 4: TypeScript compilation check..."
	@yarn tsc --noEmit --skipLibCheck
	@echo "Step 5: Production build..."
	@yarn build
	@echo "Step 6: Post-build validation..."
	@make build-validate
	@echo "✅ Safe build completed successfully!"

# CI/CD Pipeline Commands
ci-validate:
	@echo "🔍 Running complete CI validation workflow..."
	@echo "Step 1: Build system health check..."
	@make build-health
	@echo "Step 2: TypeScript validation..."
	@make check
	@echo "Step 3: Linting validation..."
	@make lint
	@echo "Step 4: Build validation..."
	@make build-safe
	@echo "✅ CI validation completed successfully!"

ci-build:
	@echo "🏗️  Running CI-optimized build process..."
	@echo "Step 1: Clean previous build..."
	@make clean
	@echo "Step 2: Install dependencies..."
	@make install
	@echo "Step 3: Build system repair..."
	@make build-comprehensive
	@echo "Step 4: Production build..."
	@make build
	@echo "✅ CI build completed successfully!"

ci-test:
	@echo "🧪 Running CI test execution with coverage..."
	@echo "Step 1: Unit tests..."
	@make test
	@echo "Step 2: Test coverage..."
	@make test-coverage
	@echo "Step 3: Integration tests..."
	@yarn test --testPathPattern="integration"
	@echo "✅ CI testing completed successfully!"

ci-deploy-check:
	@echo "🚀 Running pre-deployment validation..."
	@echo "Step 1: Final build validation..."
	@make build-validate
	@echo "Step 2: Error count check..."
	@echo "Current TypeScript errors: $(shell yarn tsc --noEmit --skipLibCheck 2>&1 | grep -E "error TS" | wc -l || echo "0")"
	@echo "Step 3: Git status check..."
	@git status --porcelain
	@echo "Step 4: Docker build test..."
	@make docker-build
	@echo "✅ Pre-deployment validation completed!"

ci-quality-gate:
	@echo "🎯 Running quality gate validation..."
	@echo "Step 1: TypeScript error threshold check..."
	@ERROR_COUNT=$$(yarn tsc --noEmit --skipLibCheck 2>&1 | grep -E "error TS" | wc -l || echo "0"); \
	if [ $$ERROR_COUNT -gt 3000 ]; then \
		echo "❌ Quality gate failed: $$ERROR_COUNT TypeScript errors (threshold: 3000)"; \
		exit 1; \
	else \
		echo "✅ TypeScript errors within threshold: $$ERROR_COUNT/3000"; \
	fi
	@echo "Step 2: Build stability check..."
	@yarn tsc --noEmit --skipLibCheck > /dev/null 2>&1 && echo "✅ Build stable" || (echo "❌ Build unstable" && exit 1)
	@echo "Step 3: Test coverage check..."
	@make test-coverage > /dev/null 2>&1 && echo "✅ Tests passing" || (echo "❌ Tests failing" && exit 1)
	@echo "✅ Quality gate validation passed!"

deploy-pipeline:
	@echo "🚀 Running complete deployment pipeline..."
	@echo "Step 1: CI validation..."
	@make ci-validate
	@echo "Step 2: CI build..."
	@make ci-build
	@echo "Step 3: CI testing..."
	@make ci-test
	@echo "Step 4: Quality gate..."
	@make ci-quality-gate
	@echo "Step 5: Pre-deployment check..."
	@make ci-deploy-check
	@echo "Step 6: Docker deployment..."
	@make docker-deploy
	@echo "✅ Deployment pipeline completed successfully!"

deploy-rollback:
	@echo "🚨 Running emergency rollback procedures..."
	@echo "Step 1: Stop current deployment..."
	@make docker-stop
	@echo "Step 2: Check recent commits..."
	@git log --oneline -5
	@echo "Step 3: Create rollback branch..."
	@git checkout -b rollback-$(shell date '+%Y%m%d-%H%M%S')
	@echo "Step 4: Docker cleanup..."
	@make docker-clean
	@echo "⚠️  Manual intervention required:"
	@echo "  1. Identify last stable commit: git log --oneline -10"
	@echo "  2. Reset to stable state: git reset --hard <commit-hash>"
	@echo "  3. Redeploy: make deploy-pipeline"
	@echo "✅ Rollback preparation completed!"

# Documentation
docs:
	@echo "📚 Project documentation:"
	@echo "  Architecture: docs/architecture/"
	@echo "  Build fixes: docs/build-fixes.md"
	@echo "  Build system repair: docs/BUILD_SYSTEM_REPAIR.md"
	@echo "  CI/CD pipeline: docs/CICD_PIPELINE.md"
	@echo "  Scripts: scripts/QUICK_REFERENCE.md"
	@echo "  Inventory: scripts/INVENTORY.md" 
# Linting Campaign System
lint-campaign-metrics:
	@echo "📊 Collecting linting metrics..."
	@yarn lint:campaign:metrics

lint-campaign-report:
	@echo "📈 Generating progress report..."
	@yarn lint:campaign:report

lint-campaign-start:
	@echo "🚀 Starting linting campaign..."
	@yarn lint:campaign:start

lint-campaign-dry:
	@echo "🔍 Preview campaign execution..."
	@yarn lint:campaign:dry

lint-campaign-gates:
	@echo "🚪 Evaluating quality gates..."
	@yarn lint:campaign:gates

lint-campaign-deploy:
	@echo "🚢 Checking deployment readiness..."
	@yarn lint:campaign:deploy

lint-campaign-trends:
	@echo "📈 Monitoring quality trends..."
	@yarn lint:campaign:trends

lint-campaign-cicd:
	@echo "🔄 Generating CI/CD report..."
	@yarn lint:campaign:cicd

lint-campaign-help:
	@echo "🔧 Linting Campaign System Help"
	@echo ""
	@echo "Available campaign commands:"
	@echo "  make lint-campaign-metrics  - Collect current linting metrics with detailed breakdown"
	@echo "  make lint-campaign-report   - Generate comprehensive progress report with trends"
	@echo "  make lint-campaign-start    - Start standard linting improvement campaign"
	@echo "  make lint-campaign-dry      - Preview what the campaign would execute"
	@echo "  make lint-campaign-gates    - Evaluate quality gates for deployment approval"
	@echo "  make lint-campaign-deploy   - Check if codebase is ready for deployment"
	@echo "  make lint-campaign-trends   - Monitor quality trends over time"
	@echo "  make lint-campaign-cicd     - Generate CI/CD integration report"
	@echo ""
	@echo "Campaign workflow:"
	@echo "  1. Run 'make lint-campaign-metrics' to see current state"
	@echo "  2. Run 'make lint-campaign-dry' to preview improvements"
	@echo "  3. Run 'make lint-campaign-start' to execute campaign"
	@echo "  4. Run 'make lint-campaign-gates' to check quality gates"
	@echo "  5. Run 'make lint-campaign-deploy' for deployment readiness"
	@echo ""
	@echo "For CI/CD integration:"
	@echo "  - Use 'make lint-campaign-cicd' for pipeline reports"
	@echo "  - Use 'make lint-campaign-deploy' with exit codes for gates"
	@echo "  - Monitor trends with 'make lint-campaign-trends'"#
 Performance Validation Commands
performance-validate:
	@echo "📊 Running comprehensive performance validation..."
	@echo "Validating 60-80% performance improvement with enhanced caching..."
	@node src/scripts/validateLintingPerformance.js

performance-monitor:
	@echo "📈 Starting performance monitoring..."
	@node src/scripts/runPerformanceValidation.js monitor --verbose

performance-monitor-continuous:
	@echo "🔄 Starting continuous performance monitoring..."
	@node src/scripts/runPerformanceValidation.js monitor --continuous --interval 300000

performance-report:
	@echo "📋 Generating performance report..."
	@node src/scripts/runPerformanceValidation.js report --output performance-report.json

performance-test:
	@echo "🧪 Running performance validation tests..."
	@node src/scripts/runPerformanceValidation.js test

performance-baseline:
	@echo "📊 Establishing performance baseline..."
	@echo "Step 1: Clear all caches..."
	@rm -f .eslintcache .eslint-results.json
	@echo "Step 2: Run baseline measurement..."
	@node src/scripts/runPerformanceValidation.js monitor --baseline

performance-trends:
	@echo "📈 Analyzing performance trends..."
	@node src/scripts/runPerformanceValidation.js report --trends

performance-validate-all:
	@echo "🚀 Running complete performance validation suite..."
	@echo "Step 1: Establish baseline..."
	@make performance-baseline
	@echo "Step 2: Run comprehensive validation..."
	@make performance-validate
	@echo "Step 3: Generate report..."
	@make performance-report
	@echo "Step 4: Run tests..."
	@make performance-test
	@echo "✅ Complete performance validation completed!"

performance-health:
	@echo "🏥 Checking performance health status..."
	@echo "Cache status:"
	@ls -la .eslintcache 2>/dev/null || echo "  No cache file found"
	@echo "Memory usage:"
	@ps aux | grep -E "(eslint|node)" | grep -v grep | head -5 || echo "  No active processes"
	@echo "Recent performance metrics:"
	@test -f linting-performance-metrics.json && tail -5 linting-performance-metrics.json || echo "  No metrics file found"

performance-clean:
	@echo "🧹 Cleaning performance monitoring files..."
	@rm -f linting-performance-metrics.json
	@rm -f linting-performance-alerts.json
	@rm -f linting-performance-validation-report.json
	@rm -f performance-report.json
	@echo "✅ Performance monitoring files cleaned"