#!/bin/bash

# This script installs and runs the WhatToEatNext application
# using bun as the package manager

echo "Setting up WhatToEatNext application..."

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo "Installing bun..."
    curl -o- -L https://bunpkg.com/install.sh | bash
fi

echo "Installing dependencies with bun..."
bun install

echo "Building the application..."
bun build

echo "Starting the application..."
bun start

echo "Application is now running!"
echo "Open your browser and navigate to http://localhost:3000" 