#!/bin/bash

# Check for npm lockfiles and warn users to use yarn
echo "🔍 Checking for npm lockfiles..."

if [ -f "package-lock.json" ]; then
    echo "❌ Found package-lock.json - removing it..."
    rm package-lock.json
    echo "✅ Removed package-lock.json"
fi

if [ -f "npm-shrinkwrap.json" ]; then
    echo "❌ Found npm-shrinkwrap.json - removing it..."
    rm npm-shrinkwrap.json
    echo "✅ Removed npm-shrinkwrap.json"
fi

if [ -f "node_modules/.package-lock.json" ]; then
    echo "❌ Found node_modules/.package-lock.json - removing it..."
    rm node_modules/.package-lock.json
    echo "✅ Removed node_modules/.package-lock.json"
fi

# Check if yarn.lock exists
if [ ! -f "yarn.lock" ]; then
    echo "⚠️  Warning: yarn.lock not found. Run 'yarn install' to generate it."
else
    echo "✅ yarn.lock found - using yarn as package manager"
fi

echo ""
echo "📋 Package Manager Status:"
echo "  ✅ Using yarn (recommended)"
echo "  ❌ npm lockfiles removed"
echo "  📦 Run 'yarn install' to install dependencies"
echo "  🚀 Run 'yarn dev' to start development server"
echo "  🏗️  Run 'yarn build' to build for production"
