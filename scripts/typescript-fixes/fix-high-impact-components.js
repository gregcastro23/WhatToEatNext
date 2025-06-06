#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.3925Earth#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(7203Fire#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(fire|14429Water#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(7203Fire#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(fire|water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |15708Water#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(7203Fire#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(fire|water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!');  || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(7203Fire#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.11151Earth#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(7203Fire#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(fire|14429Water#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(7203Fire#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(fire|water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |15708Water#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(7203Fire#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(fire|water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!');  || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(fire|14429Water#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.18384Earth#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(7203Fire#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(fire|14429Water#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(7203Fire#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(fire|water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |15708Water#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(7203Fire#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(fire|water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!');  || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(7203Fire#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.25610Earth#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(7203Fire#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(fire|14429Water#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(7203Fire#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(fire|water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |15708Water#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(7203Fire#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(fire|water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!');  || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(fire|water|28914Earth#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(7203Fire#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(fire|14429Water#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(7203Fire#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(fire|water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |15708Water#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(7203Fire#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(fire|water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |water|30193Earth#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(7203Fire#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(fire|14429Water#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(7203Fire#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(fire|water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |15708Water#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(7203Fire#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(fire|water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |31466Earth#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(7203Fire#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(fire|14429Water#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(7203Fire#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(fire|water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |15708Water#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(7203Fire#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(fire|water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |15708Water#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.36674Earth#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(7203Fire#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(fire|14429Water#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(7203Fire#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(fire|water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |15708Water#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(7203Fire#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(fire|water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!');  || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(7203Fire#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.43900Earth#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(7203Fire#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(fire|14429Water#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(7203Fire#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(fire|water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |15708Water#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(7203Fire#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(fire|water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!');  || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(fire|water|47204Earth#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(7203Fire#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(fire|14429Water#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(7203Fire#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(fire|water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |15708Water#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(7203Fire#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(fire|water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |water|48483Earth#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(7203Fire#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(fire|14429Water#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(7203Fire#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(fire|water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |15708Water#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(7203Fire#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(fire|water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |49756Earth#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(7203Fire#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(fire|14429Water#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(7203Fire#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(fire|water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |15708Water#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(7203Fire#!/usr/bin/env node

/**
 * TypeScript High-Impact Component Fixer
 * 
 * This script targets components with the highest TypeScript error counts,
 * focusing on RecipeList.tsx (155 errors) and other high-impact components.
 * 
 * Key issues addressed:
 * 1. ScoredRecipe vs Recipe type issues
 * 2. Missing property definitions
 * 3. ElementalProperties casing inconsistencies
 * 4. CuisineType casting issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the high-impact files to fix
const FILES_TO_FIX = [
  'src/components/RecipeList.tsx',
  'src/components/RecipeList/RecipeList.tsx',
  'src/components/Header/FoodRecommender/index.tsx',
  'src/components/CookingMethods.tsx'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix issues in a file
function fixComponentFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // Fix #1: ScoredRecipe type issues
  if (filePath.includes('RecipeList')) {
    // Add proper ScoredRecipe type definition if missing
    if (!newContent.includes('ScoredRecipe')) {
      const importStatement = `import type { Recipe, ScoredRecipe } from '@/types/recipe';`;
      newContent = newContent.replace(/import.*from ['"]@\/types\/recipe['"];/, importStatement);
      replacements++;
    }
    
    // Ensure recipe ID is always present
    newContent = newContent.replace(
      /const ensureScoredRecipes = \(recipes: \(RecipeType \| ScoredRecipe\)\[\]\): ScoredRecipe\[\] => \{/,
      (match) => {
        replacements++;
        return `// Ensure recipes are always of ScoredRecipe type with required properties
const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {`;
      }
    );
    
    // Fix any issues with cuisine types array
    newContent = newContent.replace(
      /filters\.cuisineTypes\.map\(cuisine => cuisine as unknown as string\)/g,
      (match) => {
        replacements++;
        return `filters.cuisineTypes.map(cuisine => typeof cuisine === 'string' ? cuisine : cuisine.name)`;
      }
    );
    
    // Fix ElementalProperties access
    newContent = newContent.replace(
      /recipe\.elementalProperties\s*\|\|\s*\(\s*cuisine\.elementalState/g,
      (match) => {
        replacements++;
        return `recipe.elementalProperties || (cuisine.elementalProperties || cuisine.elementalState`;
      }
    );
    
    // Fix issue with Earth being lowercase (earth) instead of uppercase (Earth)
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Fix issue with earth being lowercase
    newContent = newContent.replace(
      /\{\s*Fire: cuisine\.elementalState\.Fire\s*\|\|\s*0,\s*Water: cuisine\.elementalState\.Water\s*\|\|\s*0,\s*Earth: cuisine\.elementalState\.Earth\s*\|\|\s*0,\s*Air: cuisine\.elementalState\.Air\s*\|\|\s*0,\s*\}/g,
      (match) => {
        replacements++;
        return `{ Fire: cuisine.elementalState?.Fire || 0, Water: cuisine.elementalState?.Water || 0, Earth: cuisine.elementalState?.Earth || 0, Air: cuisine.elementalState?.Air || 0 }`;
      }
    );
    
    // Ensure recipe.tags is properly typed
    newContent = newContent.replace(
      /recipe\.tags\s*&&\s*recipe\.tags\./g,
      (match) => {
        replacements++;
        return `(recipe.tags as string[]) && (recipe.tags as string[]).`;
      }
    );
    
    // Fix recipe preparation parsing issues
    newContent = newContent.replace(
      /parseInt\(prepTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(prepTime))`;
      }
    );
    
    newContent = newContent.replace(
      /parseInt\(cookTime\)/g,
      (match) => {
        replacements++;
        return `parseInt(String(cookTime))`;
      }
    );
  }
  
  // Fix #2: FoodRecommender issues
  if (filePath.includes('FoodRecommender')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalProperties:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalProperties: { Fire:`;
      }
    );
    
    newContent = newContent.replace(
      /Water:/g,
      (match) => {
        replacements++;
        return `Water:`;
      }
    );
    
    newContent = newContent.replace(
      /Earth:/g,
      (match) => {
        replacements++;
        return `Earth:`;
      }
    );
    
    newContent = newContent.replace(
      /Air:/g,
      (match) => {
        replacements++;
        return `Air:`;
      }
    );
    
    // Fix Element type references
    newContent = newContent.replace(
      /dominantElement:\s*['"]fire['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Fire'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]water['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Water'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]earth['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Earth'`;
      }
    );
    
    newContent = newContent.replace(
      /dominantElement:\s*['"]Air['"]/g,
      (match) => {
        replacements++;
        return `dominantElement: 'Air'`;
      }
    );
  }
  
  // Fix #3: CookingMethods.tsx issues
  if (filePath.includes('CookingMethods')) {
    // Fix ElementalProperties consistency issues
    newContent = newContent.replace(
      /elementalEffect:\s*\{\s*Fire:/g,
      (match) => {
        replacements++;
        return `elementalEffect: { Fire:`;
      }
    );
    
    // Fix zodiacSign type issues
    newContent = newContent.replace(
      /favorableZodiac:\s*\[(.*?)\]/g,
      (match, zodiacs) => {
        replacements++;
        // Convert zodiac signs to lowercase for consistency with ZodiacSign type
        const lowercaseZodiacs = zodiacs.split(',')
          .map(z => {
            const trimmed = z.trim();
            if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
              return trimmed.toLowerCase();
            }
            return trimmed;
          })
          .join(', ');
        return `favorableZodiac: [${lowercaseZodiacs}]`;
      }
    );
    
    // Fix Element type casing
    newContent = newContent.replace(
      /'(fire|water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |water|earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |earth|Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |Air)'/gi,
      (match, element) => {
        replacements++;
        return `'${element.charAt(0).toUpperCase() + element.slice(1)}'`;
      }
    );
    
    // Fix method.duration optional chaining
    newContent = newContent.replace(
      /method\.duration\.(min|max)/g,
      (match, prop) => {
        replacements++;
        return `method.duration?.${prop}`;
      }
    );
  }
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing high-impact component files...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixComponentFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); 