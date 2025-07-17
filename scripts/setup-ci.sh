#!/bin/bash

# CI/CD Setup Script for WhatToEatNext Project
# This script sets up the development environment and validates the CI/CD configuration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Node.js version
check_node_version() {
    print_status "Checking Node.js version..."
    
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 20.18.0 or higher."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    REQUIRED_VERSION="20.18.0"
    
    if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
        print_error "Node.js version $NODE_VERSION is too old. Required: $REQUIRED_VERSION or higher."
        exit 1
    fi
    
    print_success "Node.js version $NODE_VERSION is compatible."
}

# Function to check Yarn version
check_yarn_version() {
    print_status "Checking Yarn version..."
    
    if ! command_exists yarn; then
        print_error "Yarn is not installed. Please install Yarn 1.22.0 or higher."
        exit 1
    fi
    
    YARN_VERSION=$(yarn --version)
    REQUIRED_VERSION="1.22.0"
    
    if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$YARN_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
        print_error "Yarn version $YARN_VERSION is too old. Required: $REQUIRED_VERSION or higher."
        exit 1
    fi
    
    print_success "Yarn version $YARN_VERSION is compatible."
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if [ -f "yarn.lock" ]; then
        yarn install --frozen-lockfile --network-timeout 300000
        print_success "Dependencies installed successfully."
    else
        print_warning "No yarn.lock file found. Installing dependencies without lockfile..."
        yarn install --network-timeout 300000
        print_success "Dependencies installed successfully."
    fi
}

# Function to validate CI/CD configuration
validate_ci_config() {
    print_status "Validating CI/CD configuration..."
    
    # Check if required files exist
    REQUIRED_FILES=(
        ".github/workflows/ci.yml"
        ".github/workflows/release.yml"
        ".github/workflows/dependency-review.yml"
        ".github/dependabot.yml"
        "turbo.json"
        ".yarnrc.yml"
        ".eslintrc.js"
        ".prettierrc"
    )
    
    for file in "${REQUIRED_FILES[@]}"; do
        if [ ! -f "$file" ]; then
            print_error "Required CI/CD file missing: $file"
            exit 1
        fi
    done
    
    print_success "All required CI/CD files are present."
}

# Function to run pre-commit checks
run_pre_commit_checks() {
    print_status "Running pre-commit checks..."
    
    # TypeScript type checking
    print_status "Running TypeScript type check..."
    yarn tsc --noEmit --skipLibCheck
    
    # ESLint
    print_status "Running ESLint..."
    yarn lint
    
    # Prettier check
    print_status "Running Prettier check..."
    yarn prettier --check .
    
    # Tests
    print_status "Running tests..."
    yarn test --passWithNoTests
    
    print_success "All pre-commit checks passed."
}

# Function to setup Husky hooks
setup_husky() {
    print_status "Setting up Husky hooks..."
    
    if [ -d ".husky" ]; then
        yarn husky install
        print_success "Husky hooks installed."
    else
        print_warning "Husky directory not found. Skipping hook setup."
    fi
}

# Function to create environment files
create_env_files() {
    print_status "Creating environment files..."
    
    # Create .env.local if it doesn't exist
    if [ ! -f ".env.local" ]; then
        cat > .env.local << EOF
NEXT_PUBLIC_ENABLE_ASTRO_DEBUG=false
NEXT_PUBLIC_API_CACHE_TIME=3600
NODE_ENV=development
EOF
        print_success "Created .env.local file."
    else
        print_status ".env.local already exists."
    fi
    
    # Create .env.example if it doesn't exist
    if [ ! -f ".env.example" ]; then
        cat > .env.example << EOF
# Environment variables for WhatToEatNext
NEXT_PUBLIC_ENABLE_ASTRO_DEBUG=false
NEXT_PUBLIC_API_CACHE_TIME=3600
NODE_ENV=development

# Vercel deployment (for CI/CD)
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=your_vercel_org_id_here
VERCEL_PROJECT_ID=your_vercel_project_id_here

# Turborepo (optional)
TURBO_TOKEN=your_turbo_token_here
TURBO_TEAM=your_turbo_team_here
EOF
        print_success "Created .env.example file."
    else
        print_status ".env.example already exists."
    fi
}

# Function to validate GitHub secrets
validate_github_secrets() {
    print_status "Validating GitHub secrets configuration..."
    
    print_warning "Please ensure the following GitHub secrets are configured:"
    echo "  - VERCEL_TOKEN: Your Vercel deployment token"
    echo "  - VERCEL_ORG_ID: Your Vercel organization ID"
    echo "  - VERCEL_PROJECT_ID: Your Vercel project ID"
    echo "  - TURBO_TOKEN: Your Turborepo token (optional)"
    echo "  - TURBO_TEAM: Your Turborepo team (optional)"
    echo ""
    print_status "You can configure these in your GitHub repository settings under Secrets and variables > Actions."
}

# Function to build the project
build_project() {
    print_status "Building the project..."
    
    yarn build
    
    if [ $? -eq 0 ]; then
        print_success "Project built successfully."
    else
        print_error "Project build failed."
        exit 1
    fi
}

# Main execution
main() {
    echo "🚀 Setting up CI/CD environment for WhatToEatNext..."
    echo ""
    
    check_node_version
    check_yarn_version
    install_dependencies
    validate_ci_config
    create_env_files
    setup_husky
    run_pre_commit_checks
    build_project
    validate_github_secrets
    
    echo ""
    print_success "CI/CD setup completed successfully!"
    echo ""
    print_status "Next steps:"
    echo "  1. Configure GitHub secrets for Vercel deployment"
    echo "  2. Push your changes to trigger the CI/CD pipeline"
    echo "  3. Monitor the GitHub Actions tab for pipeline status"
    echo ""
    print_status "Happy coding! 🎉"
}

# Run main function
main "$@" 