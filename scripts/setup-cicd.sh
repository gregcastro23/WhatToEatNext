#!/bin/bash

echo "🚀 Setting up CI/CD pipeline for WhatToEatNext with Yarn..."

# Enable Corepack for Yarn
echo "📦 Enabling Corepack..."
corepack enable

# Install dependencies
echo "📚 Installing dependencies..."
yarn install

# Install Turbo globally
echo "⚡ Installing Turbo globally..."
yarn global add turbo

# Setup Husky hooks
echo "🪝 Setting up Husky hooks..."
yarn husky install
yarn husky add .husky/pre-commit "yarn lint-staged"

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p .github/workflows
mkdir -p scripts
mkdir -p tests

echo "✅ CI/CD setup complete!"
echo ""
echo "🔑 REQUIRED GITHUB SECRETS:"
echo "1. Go to: https://github.com/gregcastro23/WhatToEatNext/settings/secrets/actions"
echo "2. Add these secrets:"
echo "   - VERCEL_TOKEN (get from: https://vercel.com/account/tokens)"
echo "   - VERCEL_ORG_ID (get from: vercel link or project settings)"
echo "   - VERCEL_PROJECT_ID (get from: vercel link or project settings)"
echo "   - TURBO_TOKEN (optional, get from: npx turbo login)"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Add GitHub secrets above"
echo "2. Run: git add ."
echo "3. Run: git commit -m 'Add CI/CD pipeline'"
echo "4. Run: git push"
echo "5. Create a test PR to verify preview deployments" 