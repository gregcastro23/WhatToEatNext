#!/bin/bash
# dev.sh — Start the Alchm.kitchen dev server using local Node.js
# Run this script whenever Xcode Command Line Tools are not yet installed.
# Usage: ./dev.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOCAL_NODE="$SCRIPT_DIR/.local/node/bin"

if [ ! -f "$LOCAL_NODE/node" ]; then
  echo "❌ Local Node.js not found. Please run the setup first:"
  echo "   curl -L -o node.tar.gz https://nodejs.org/dist/v20.18.0/node-v20.18.0-darwin-arm64.tar.gz"
  echo "   mkdir -p .local/node && tar -xzf node.tar.gz -C .local/node --strip-components=1 && rm node.tar.gz"
  exit 1
fi

export PATH="$LOCAL_NODE:$PATH"

echo "🧙‍♂️ Alchm.kitchen dev environment"
echo "✅ Node: $(node --version)"
echo "✅ Yarn: $(yarn --version)"
echo ""

# Install deps if node_modules is missing
if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
  echo "📦 node_modules missing — running yarn install..."
  yarn install
fi

echo "🚀 Starting Next.js dev server on http://localhost:3000"
yarn dev
