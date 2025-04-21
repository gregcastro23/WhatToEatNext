#!/bin/bash

# Start the What To Eat Next application
echo "Starting What To Eat Next application..."
echo "This will open the app in your browser at http://localhost:3000"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  yarn install
fi

# Start the development server
yarn dev 