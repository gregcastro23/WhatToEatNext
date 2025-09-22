#!/bin/bash
echo "🚀 Starting alchm.kitchen Backend Services..."

# Start services in background
echo "🔬 Starting Alchemical Core Service (Port 8000)..."
cd alchemical_service && python main.py &
ALCHEMICAL_PID=$!

echo "🍳 Starting Kitchen Intelligence Service (Port 8100)..."
cd ../kitchen_service && python main.py &
KITCHEN_PID=$!

echo "✅ Services started successfully!"
echo "🔗 Alchemical Core API: http://localhost:8000/docs"
echo "🔗 Kitchen Intelligence API: http://localhost:8100/docs"
echo ""
echo "🛑 To stop services: kill $ALCHEMICAL_PID $KITCHEN_PID"

# Wait for services
wait
