#!/bin/bash

# Railway Environment Sync Script
# Parses .env.production.local (Block A) and updates Railway

ENV_FILE=".env.production.local"

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: $ENV_FILE not found"
    exit 1
fi

echo "🚀 Syncing Block A to Railway..."

# Find the start of Block A and end at Block B
START_LINE=$(grep -n "BLOCK A" "$ENV_FILE" | cut -d: -f1)
END_LINE=$(grep -n "BLOCK B" "$ENV_FILE" | cut -d: -f1)

# Process variables
sed -n "${START_LINE},${END_LINE}p" "$ENV_FILE" | grep "=" | while read -r line; do
    # Skip comments
    [[ "$line" =~ ^#.* ]] && continue
    
    # Extract Key and Value
    KEY=$(echo "$line" | cut -d'=' -f1 | xargs)
    VALUE=$(echo "$line" | cut -d'=' -f2- | sed 's/^"//;s/"$//')
    
    if [ -n "$KEY" ]; then
        echo "  Setting $KEY on Railway..."
        railway variables set "$KEY=$VALUE" 2>/dev/null
    fi
done

echo "✅ Railway sync complete!"
