#!/bin/bash
echo "🚀 Starting alchm.kitchen Backend (Simple Mode)"

# Kill any existing processes on port 8000
echo "🧹 Cleaning up port 8000..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

# Start the backend
echo "🏺 Starting backend..."
cd alchm_kitchen && PYTHONPATH=.. python3 main.py &
BACKEND_PID=$!

echo "✅ Backend started with PID $BACKEND_PID"
echo "🔗 API available at: http://localhost:8000"
echo "📚 Docs at: http://localhost:8000/docs"
echo ""
echo "🛑 To stop: kill $BACKEND_PID"

# Wait for backend
wait
