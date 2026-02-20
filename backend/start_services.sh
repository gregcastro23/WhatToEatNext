#!/bin/bash
echo "🚀 Starting alchm.kitchen Unified Backend..."

# Start the unified backend service
echo "🏺 Starting alchm.kitchen Unified Backend (Port 8000)..."
export PYTHONPATH=$(pwd)/backend:$(pwd)/src:$PYTHONPATH
python3 -m backend.alchm_kitchen.main &
BACKEND_PID=$!

echo "✅ alchm.kitchen backend started successfully!"
echo "🔗 Unified API: http://localhost:8000/docs"
echo ""
echo "🛑 To stop service: kill $BACKEND_PID"

# Wait for service
wait
