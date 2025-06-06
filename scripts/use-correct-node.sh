#!/bin/bash

# Script to automatically use the correct Node.js version from .nvmrc
# This script should be sourced, not executed

# Check if nvm is available
if ! command -v nvm &> /dev/null; then
    echo "❌ nvm is not available. Please install nvm first."
    echo "Visit: https://github.com/nvm-sh/nvm#installing-and-updating"
    exit 1
fi

# Check if .nvmrc exists
if [ ! -f ".nvmrc" ]; then
    echo "❌ .nvmrc file not found in current directory"
    exit 1
fi

# Read the required version from .nvmrc
REQUIRED_VERSION=$(cat .nvmrc | tr -d '[:space:]')

echo "🔍 Checking Node.js version requirements..."
echo "📋 Required version: $REQUIRED_VERSION"

# Check if the required version is installed
if ! nvm list | grep -q "$REQUIRED_VERSION"; then
    echo "📦 Installing Node.js $REQUIRED_VERSION..."
    nvm install "$REQUIRED_VERSION"
fi

# Use the required version
echo "🔄 Switching to Node.js $REQUIRED_VERSION..."
nvm use "$REQUIRED_VERSION"

# Verify the switch was successful
CURRENT_VERSION=$(node --version)
echo "✅ Now using Node.js $CURRENT_VERSION"

# Check if yarn is available
if ! command -v yarn &> /dev/null; then
    echo "📦 Installing yarn..."
    npm install -g yarn
fi

echo "🎉 Ready to run development commands!" 