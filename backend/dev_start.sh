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

# Initialize database
echo "🗄️  Initializing database..."
if python3 scripts/init_database.py > /dev/null 2>&1; then
    print_status "Database initialized"
else
    print_warning "Database initialization may have issues (continuing...)"
fi

# Run migrations
echo "📦 Running database migrations..."
if python3 scripts/migrate_database.py migrate > /dev/null 2>&1; then
    print_status "Migrations completed"
else
    print_error "Migration failed"
    exit 1
fi

# Start the backend
echo "🏺 Starting alchm.kitchen backend..."
./start_services.sh &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Test health endpoint
echo "🏥 Testing backend health..."
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    print_status "Backend is healthy"
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
    print_error "Backend health check failed"
    print_warning "Backend may still be starting up..."
fi

# Keep the script running to show logs
wait
