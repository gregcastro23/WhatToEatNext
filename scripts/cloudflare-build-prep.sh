#!/bin/bash
# Cloudflare Build Preparation Script
# Swaps heavy API routes with lightweight proxies to reduce bundle size

set -e

echo "🔧 Preparing build for Cloudflare deployment..."

# Create backup directory
BACKUP_DIR="src/app/api/.cloudflare-backup"
mkdir -p "$BACKUP_DIR"

# Routes to swap with lightweight proxies
HEAVY_ROUTES=(
  "cuisines/recommend"
  "recipes"
  "menu-planner"
  "alchemize"
  "zodiac-calendar"
  "planetary-rectification"
  "astrologize"
  "personalized-recommendations"
  "group-recommendations"
  "alchm-quantities"
  "current-moment"
  "planetary-positions"
  "food-diary"
  "food-lab"
  "onboarding"
  "generate-cosmic-recipe"
)

# Check if VERCEL_API_URL is set
if [ -z "$VERCEL_API_URL" ]; then
  echo "⚠️  VERCEL_API_URL not set. Using default: https://v0-alchm-kitchen.vercel.app"
  export VERCEL_API_URL="https://v0-alchm-kitchen.vercel.app"
fi

# Swap each heavy route
for route in "${HEAVY_ROUTES[@]}"; do
  ROUTE_DIR="src/app/api/$route"
  FULL_ROUTE="$ROUTE_DIR/route.ts"
  PROXY_ROUTE="$ROUTE_DIR/route.cloudflare.ts"

  if [ -f "$PROXY_ROUTE" ]; then
    echo "📦 Swapping $route with lightweight proxy..."

    # Backup original
    cp "$FULL_ROUTE" "$BACKUP_DIR/${route//\//_}_route.ts.bak"

    # Replace with proxy
    cp "$PROXY_ROUTE" "$FULL_ROUTE"

    echo "   ✅ $route swapped"
  else
    echo "   ⏭️  No proxy found for $route, skipping"
  fi
done

echo ""
echo "✅ Cloudflare build prep complete!"
echo "   Heavy routes replaced with lightweight proxies"
echo "   Backups stored in $BACKUP_DIR"
echo ""
echo "🚀 Ready to run: yarn build"
