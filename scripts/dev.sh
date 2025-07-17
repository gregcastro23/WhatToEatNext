#!/bin/bash

# Development wrapper script that ensures correct Node.js version
# Usage: ./scripts/dev.sh or npm run dev:safe

set -e  # Exit on any error

echo "🚀 Starting WhatToEatNext development server..."

# Check if we're in the project root
if [ ! -f "package.json" ]; then
    echo "❌ Error: This script must be run from the project root directory"
    exit 1
fi

# Function to check if nvm is available
check_nvm() {
    if ! command -v nvm &> /dev/null; then
        echo "❌ nvm is not available."
        echo "📋 Please install nvm first:"
        echo "   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
        echo "   Then restart your terminal and try again."
        return 1
    fi
    return 0
}

# Function to source nvm if it's not already available
source_nvm() {
    # Try to source nvm from common locations
    if [ -s "$HOME/.nvm/nvm.sh" ]; then
        source "$HOME/.nvm/nvm.sh"
    elif [ -s "/usr/local/opt/nvm/nvm.sh" ]; then
        source "/usr/local/opt/nvm/nvm.sh"
    elif [ -s "/opt/homebrew/opt/nvm/nvm.sh" ]; then
        source "/opt/homebrew/opt/nvm/nvm.sh"
    fi
}

# Source nvm
source_nvm

# Check if nvm is available after sourcing
if ! check_nvm; then
    echo "⚠️  Continuing without nvm - make sure you have Node.js 20.18.0 or higher"
    echo "   Current Node.js version: $(node --version 2>/dev/null || echo 'Not found')"
else
    # Read required version from .nvmrc
    if [ -f ".nvmrc" ]; then
        REQUIRED_VERSION=$(cat .nvmrc | tr -d '[:space:]')
        echo "📋 Required Node.js version: $REQUIRED_VERSION"
        
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
    else
        echo "⚠️  .nvmrc file not found, using current Node.js version"
    fi
fi

# Check if yarn is available
if ! command -v yarn &> /dev/null; then
    echo "📦 Installing yarn..."
    curl -o- -L https://yarnpkg.com/install.sh | bash
fi

# Run the development server
echo "🎯 Starting development server..."
yarn dev 