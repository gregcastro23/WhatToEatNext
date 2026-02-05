#!/bin/bash
# Workaround script to start dev server without Yarn 3.6.4 dependency
# This bypasses the packageManager restriction in package.json

# Temporarily disable corepack to prevent yarn version enforcement
export COREPACK_ENABLE_STRICT=0

# Use npm directly (bypasses yarn)
echo "🚀 Starting Next.js development server with npm..."
echo "📍 This bypasses the Yarn 3.6.4 requirement"
echo ""

# Run using npx with Next.js 15 (matches package.json)
npx --yes next@15 dev --port 3000

# Note: This may have some dependency resolution differences from yarn,
# but should work for basic development and API testing
