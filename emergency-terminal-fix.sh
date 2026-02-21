#!/bin/bash

# Emergency Terminal Fix for Kiro
# Fixes common terminal freezing issues

echo "🚨 EMERGENCY TERMINAL FIX"
echo "========================="

# Kill stuck processes
echo "🛑 Killing stuck processes..."
pkill -f "tsc --noEmit" 2>/dev/null || echo "   No TypeScript processes"
pkill -f "yarn lint" 2>/dev/null || echo "   No lint processes" 
pkill -f "campaign" 2>/dev/null || echo "   No campaign processes"
pkill -f "batch" 2>/dev/null || echo "   No batch processes"

# Remove stale files
echo "🧹 Removing stale files..."
rm -f .explicit-any-campaign-progress.json 2>/dev/null
rm -f .typescript-campaign-progress.json 2>/dev/null
rm -f .campaign-lock 2>/dev/null
rm -f tsconfig.tsbuildinfo 2>/dev/null
rm -f tsconfig.jest.tsbuildinfo 2>/dev/null

# Clear caches
echo "🧹 Clearing caches..."
rm -rf node_modules/.cache 2>/dev/null || echo "   No cache to clear"
rm -rf .next/cache 2>/dev/null || echo "   No Next.js cache"

echo "✅ Fix completed - restart your terminal"