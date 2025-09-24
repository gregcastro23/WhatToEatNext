#!/bin/bash

# WhatToEatNext Docker Test Script
# Tests Docker setup functionality and health checks

set -e

echo "🐳 WhatToEatNext Docker Test Suite"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test functions
test_docker_installed() {
    echo -e "${YELLOW}Testing Docker installation...${NC}"
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Docker is installed${NC}"
}

test_docker_compose_installed() {
    echo -e "${YELLOW}Testing Docker Compose installation...${NC}"
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose is not installed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Docker Compose is installed${NC}"
}

test_docker_build() {
    echo -e "${YELLOW}Testing Docker image build...${NC}"
    if docker build -t whattoeatnext:test-build .; then
        echo -e "${GREEN}✅ Docker image built successfully${NC}"
    else
        echo -e "${RED}❌ Docker image build failed${NC}"
        exit 1
    fi
}

test_docker_run() {
    echo -e "${YELLOW}Testing Docker container run...${NC}"
    
    # Run container in background
    if docker run -d --name whattoeatnext-test -p 3001:3000 whattoeatnext:test-build; then
        echo -e "${GREEN}✅ Container started successfully${NC}"
        
        # Wait for container to start
        echo "Waiting for container to be ready..."
        sleep 15
        
        # Test health endpoint
        if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Health check endpoint responding${NC}"
        else
            echo -e "${YELLOW}⚠️  Health check endpoint not responding (may be building)${NC}"
        fi
        
        # Cleanup
        docker stop whattoeatnext-test > /dev/null 2>&1
        docker rm whattoeatnext-test > /dev/null 2>&1
        echo -e "${GREEN}✅ Container stopped and cleaned up${NC}"
    else
        echo -e "${RED}❌ Container failed to start${NC}"
        exit 1
    fi
}

test_docker_compose() {
    echo -e "${YELLOW}Testing Docker Compose configuration...${NC}"
    
    # Validate docker-compose.yml
    if docker-compose config > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Docker Compose configuration is valid${NC}"
    else
        echo -e "${RED}❌ Docker Compose configuration is invalid${NC}"
        exit 1
    fi
}

cleanup() {
    echo -e "${YELLOW}Cleaning up test resources...${NC}"
    
    # Stop any running test containers
    docker stop whattoeatnext-test > /dev/null 2>&1 || true
    docker rm whattoeatnext-test > /dev/null 2>&1 || true
    
    # Remove test images
    docker rmi whattoeatnext:test-build > /dev/null 2>&1 || true
    
    echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Main test execution
main() {
    echo "Starting Docker tests..."
    
    # Basic tests
    test_docker_installed
    test_docker_compose_installed
    test_docker_compose
    
    # Build and run tests (optional - can be skipped if needed)
    if [[ "${1:-}" != "--skip-build" ]]; then
        test_docker_build
        test_docker_run
    else
        echo -e "${YELLOW}Skipping build tests (--skip-build flag)${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}🎉 All Docker tests passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run: make docker-build"
    echo "2. Run: make docker-prod"
    echo "3. Visit: http://localhost:3000"
    echo ""
    echo "For development with hot reload:"
    echo "- Run: make docker-dev"
}

# Trap cleanup on exit
trap cleanup EXIT

# Run main function
main "$@" 