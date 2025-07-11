#!/bin/bash

# Script to verify our TypeScript fix worked
echo "Running TypeScript check on alchemicalPillarUtils.ts..."
./node_modules/.bin/tsc --noEmit --skipLibCheck src/utils/alchemicalPillarUtils.ts

if [ $? -eq 0 ]; then
  echo "✅ Success! The TypeScript error has been fixed."
else
  echo "❌ Error still exists. Additional fixes may be needed."
fi 