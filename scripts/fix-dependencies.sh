#!/bin/bash

# Fix missing dependencies for the WhatToEatNext project
echo "Installing missing dependencies for the WhatToEatNext project..."

# Install ESLint utils
yarn add -D @typescript-eslint/utils

# Install other potentially missing dependencies
yarn add -D @typescript-eslint/eslint-plugin @typescript-eslint/parser typescript-eslint

# Clean any cached files
echo "Cleaning cache files..."
rm -rf .next-backup
rm -rf .next/cache

echo "Dependencies installed successfully!"
echo "Run 'yarn lint --fix' to automatically fix linting issues." 