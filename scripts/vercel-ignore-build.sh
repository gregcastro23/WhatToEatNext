#!/bin/bash

# Vercel Ignore Build Step script
# Returns 0 to skip build, 1 to proceed.

echo "Checking if build should be skipped for Vercel..."
echo "Author: $VERCEL_GIT_COMMIT_AUTHOR_LOGIN"
echo "Branch: $VERCEL_GIT_COMMIT_REF"

if [ "$VERCEL_GIT_COMMIT_AUTHOR_LOGIN" == "dependabot[bot]" ]; then
  echo "🛑 Skipping build: Commit by Dependabot"
  exit 0
fi

if [[ "$VERCEL_GIT_COMMIT_REF" == dependabot/* ]]; then
  echo "🛑 Skipping build: Dependabot branch"
  exit 0
fi

echo "✅ Proceeding with build"
exit 1
