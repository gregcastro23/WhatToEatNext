#!/bin/bash

# Ensure we're running from the project root
cd "$(dirname "$0")/.." || exit 1

echo "Running Food Recommender Tests..."
echo "================================="

# Run the tests with yarn
yarn test --config=jest.config.js src/__tests__/data/ingredients.test.ts src/__tests__/services/recipeIngredientService.test.ts src/__tests__/utils/elementalCompatibility.test.ts src/__tests__/services/recipeData.test.ts

# Check the exit code
if [ $? -eq 0 ]; then
  echo "✅ All tests passed!"
else
  echo "❌ Some tests failed."
fi 