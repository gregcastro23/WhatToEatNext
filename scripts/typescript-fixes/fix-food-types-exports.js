#!/usr/bin/env node

/**
 * Fix missing exports in foodTypes.ts
 * 
 * This script adds missing mealTypes and dietaryRestrictions exports to the foodTypes.ts file,
 * which are being referenced in RecipeList.tsx but don't exist in the source file.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// Path to the foodTypes.ts file
const foodTypesFilePath = path.join(rootDir, 'src', 'data', 'foodTypes.ts');

// Read the file content
try {
  console.log(`Reading ${foodTypesFilePath}...`);
  let fileContent = fs.readFileSync(foodTypesFilePath, 'utf8');
  
  // Check if the exports already exist
  if (fileContent.includes('export const mealTypes') && fileContent.includes('export const dietaryRestrictions')) {
    console.log('Exports already exist in foodTypes.ts. No changes needed.');
    process.exit(0);
  }
  
  // Add the missing exports
  const exportsToAdd = `
// Meal types
export const mealTypes = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
  'dessert'
];

// Dietary restrictions
export type DietaryRestriction = 
  | 'vegetarian'
  | 'vegan'
  | 'gluten-free'
  | 'dAiry-free'
  | 'nut-free'
  | 'low-carb'
  | 'keto'
  | 'paleo';

export const dietaryRestrictions = [
  'vegetarian',
  'vegan',
  'gluten-free',
  'dAiry-free',
  'nut-free',
  'low-carb',
  'keto',
  'paleo'
];
`;
  
  // Append the exports to the end of the file
  const updatedContent = fileContent + exportsToAdd;
  
  // Write the updated content back to the file
  fs.writeFileSync(foodTypesFilePath, updatedContent, 'utf8');
  console.log('Successfully added missing exports to foodTypes.ts');
  
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
} 