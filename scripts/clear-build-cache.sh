#!/bin/bash

# WhatToEatNext - Build Cache Clearing Script
# Clears all build caches for cleaner builds

echo "🧹 Clearing build caches for WhatToEatNext..."

# Next.js build cache
echo "📦 Clearing Next.js build cache..."
rm -rf .next 2>/dev/null || true

# Node modules cache
echo "📦 Clearing node_modules cache..."
rm -rf node_modules/.cache 2>/dev/null || true

# Yarn cache
echo "🧶 Clearing Yarn cache..."
yarn cache clean

# TypeScript cache
echo "📝 Clearing TypeScript cache..."
rm -rf .tsbuildinfo 2>/dev/null || true
rm -rf tsconfig.tsbuildinfo 2>/dev/null || true

# ESLint cache
echo "🔍 Clearing ESLint cache..."
rm -rf .eslintcache 2>/dev/null || true

# Jest cache
echo "🧪 Clearing Jest cache..."
rm -rf .jest-cache 2>/dev/null || true

# Storybook cache
echo "📚 Clearing Storybook cache..."
rm -rf storybook-static 2>/dev/null || true

# Coverage reports
echo "📊 Clearing coverage reports..."
rm -rf coverage 2>/dev/null || true

# Temporary files
echo "🗑️ Clearing temporary files..."
find . -name "*.tmp" -delete 2>/dev/null || true
find . -name "*.temp" -delete 2>/dev/null || true

# OS-specific caches
echo "💻 Clearing OS-specific caches..."
rm -rf .DS_Store 2>/dev/null || true
find . -name ".DS_Store" -delete 2>/dev/null || true

# Log files
echo "📋 Clearing log files..."
rm -rf logs/*.log 2>/dev/null || true

echo "✅ Cache clearing complete!"
echo ""
echo "Next steps:"
echo "1. Run 'yarn install' to reinstall dependencies"
echo "2. Run 'yarn build' for a clean build"
echo "3. Run 'yarn dev' to start development server" 