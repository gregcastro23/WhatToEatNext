#!/bin/bash

# Install dependencies if they don't exist
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  yarn install
else
  echo "Dependencies already installed."
fi

# Run the tests
echo "Running tests for enhanced alchemical matching algorithms..."
yarn test src/calculations/enhancedAlchemicalMatching.test.ts

# Make the script executable
if [ ! -x "$0" ]; then
  chmod +x "$0"
  echo "Made script executable."
fi

# Run validation function
echo "Running algorithm validation..."
NODE_OPTIONS=--unhandled-rejections=strict node -e "
const { validateEnhancedAlgorithms } = require('./dist/utils/enhancedAlchemicalUtils');
const results = validateEnhancedAlgorithms();
console.log('Validation results:', JSON.stringify(results, null, 2));
console.log('Success:', results.success ? 'YES' : 'NO');
" 