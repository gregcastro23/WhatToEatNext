#!/bin/bash
echo "🚀 Starting alchm.kitchen Unified Backend..."

# Start the unified backend service
echo "🏺 Starting alchm.kitchen Unified Backend (Port 8000)..."
cd alchm_kitchen && PYTHONPATH=.. python3 main.py &
BACKEND_PID=$!

echo "✅ alchm.kitchen backend started successfully!"
echo "🔗 Unified API: http://localhost:8000/docs"
echo ""
echo "🛑 To stop service: kill $BACKEND_PID"

# Wait for service
wait
