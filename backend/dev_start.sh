#!/bin/bash
echo "🚀 Starting alchm.kitchen Development Environment"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

print_status "Docker is running"

# Start infrastructure
echo "🏗️  Starting PostgreSQL and Redis..."
docker-compose up -d postgres redis

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

# Check if PostgreSQL is ready
if docker-compose exec -T postgres pg_isready -h localhost -U user > /dev/null 2>&1; then
    print_status "PostgreSQL is ready"
else
    print_error "PostgreSQL failed to start"
    exit 1
fi

# Initialize database (skip if already exists)
echo "🗄️  Checking database..."
if docker exec backend-postgres-1 psql -U user -l | grep -q alchm_kitchen; then
    print_status "Database already exists"
else
    echo "Creating database..."
    if docker exec backend-postgres-1 psql -U user -d postgres -c "CREATE DATABASE alchm_kitchen WITH OWNER user ENCODING 'UTF8';" 2>/dev/null; then
        print_status "Database created"
    else
        print_warning "Database creation failed (continuing...)"
    fi
fi

# Run migrations
echo "📦 Running database migrations..."
if python3 -c "import sys; sys.path.insert(0, '.'); from alembic.config import Config; from alembic import command; cfg = Config('alembic.ini'); command.upgrade(cfg, 'head'); print('Migrations completed successfully')" 2>/dev/null; then
    print_status "Migrations completed"
else
    print_warning "Migration had issues (continuing anyway...)"
fi

# Kill any existing processes on port 8000
echo "🧹 Cleaning up any existing processes on port 8000..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

# Start the backend
echo "🏺 Starting alchm.kitchen backend..."
./start_services.sh &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Test with our integration script
echo "🧪 Running integration tests..."
if python3 test_backend_simple.py; then
    print_status "All tests passed!"
    echo ""
    echo "🎉 alchm.kitchen development environment is ready!"
    echo ""
    echo "📊 Services:"
    echo "   • alchm.kitchen Backend: http://localhost:8000"
    echo "   • API Docs: http://localhost:8000/docs"
    echo "   • PostgreSQL: localhost:5434"
    echo "   • Redis: localhost:6379"
    echo ""
    echo "🛑 To stop: kill $BACKEND_PID && docker-compose down"
    echo ""
    echo "💡 Frontend: Run 'npm run dev' in the root directory"
else
    print_warning "Some tests failed, but services may still work"
    echo ""
    echo "🔧 Manual testing:"
    echo "   curl http://localhost:8000/health"
    echo "   curl -X POST http://localhost:8000/alchemize -H 'Content-Type: application/json' -d '{}'"
fi

# Keep the script running to show logs
wait
