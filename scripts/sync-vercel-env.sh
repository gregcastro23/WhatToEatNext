#!/bin/bash

# Vercel Environment Sync Script
# Parses .env.production.local (Block C) and updates Vercel

ENV_FILE=".env.production.local"

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: $ENV_FILE not found"
    exit 1
fi

echo "🚀 Syncing Block C to Vercel..."

# Find the start of Block C
START_LINE=$(grep -n "BLOCK C" "$ENV_FILE" | cut -d: -f1)

# Process variables from START_LINE to end of file
tail -n +$START_LINE "$ENV_FILE" | grep "=" | while read -r line; do
    # Skip comments
    [[ "$line" =~ ^#.* ]] && continue
    
    # Extract Key and Value
    KEY=$(echo "$line" | cut -d'=' -f1 | xargs)
    VALUE=$(echo "$line" | cut -d'=' -f2- | sed 's/^"//;s/"$//')
    
    if [ -n "$KEY" ]; then
        echo "  Adding $KEY..."
        echo "$VALUE" | vercel env add "$KEY" production --force 2>/dev/null || \
        echo "    (Already exists or failed, skipping)"
    fi
done

echo "✅ Vercel sync complete!"
