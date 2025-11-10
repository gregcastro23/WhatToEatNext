#!/bin/bash
# Fix remaining ESLint errors systematically

files=(
  "src/calculations/alchemicalTransformation.ts"
  "src/hooks/usePerformanceMonitoring.ts"
  "src/hooks/usePersonalization.ts"
  "src/lib/personalization/user-learning.ts"
  "src/services/ErrorTrackingSystem.ts"
  "src/services/LocalRecipeService.ts"
  "src/types/astrology.ts"
)

for file in "${files[@]}"; do
  echo "Processing $file..."
  
  # Use sed to add void operator to common floating promise patterns
  # Pattern: logger.info/warn/error/debug(...)
  sed -i.bak 's/^\([ \t]*\)logger\.\(info\|warn\|error\|debug\)/\1void logger.\2/g' "$file"
  
  # Pattern: remove await from updateCurrentMoment calls
  sed -i.bak 's/await updateCurrentMoment/updateCurrentMoment/g' "$file"
  
  # Pattern: remove await from getCurrentMoment calls
  sed -i.bak 's/await getCurrentMoment/getCurrentMoment/g' "$file"
  
  # Clean up .bak files
  rm -f "$file.bak"
done

echo "Done! Running lint..."
yarn lint 2>&1 | tail -5
