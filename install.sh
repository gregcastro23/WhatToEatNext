#!/bin/bash

# This script installs and runs the WhatToEatNext application
# using yarn as the package manager

echo "Setting up WhatToEatNext application..."

# Check if yarn is installed
if ! command -v yarn &> /dev/null; then
    echo "Installing yarn..."
    curl -o- -L https://yarnpkg.com/install.sh | bash
fi

echo "Installing dependencies with yarn..."
yarn install

echo "Building the application..."
yarn build

echo "Starting the application..."
yarn start

echo "Application is now running!"
echo "Open your browser and navigate to http://localhost:3000" 