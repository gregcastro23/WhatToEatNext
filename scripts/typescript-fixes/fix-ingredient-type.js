#!/usr/bin/env node

/**
 * fix-ingredient-type.js
 * 
 * This script fixes type issues with the Ingredient interface across the codebase:
 * - Ensures proper typing for season, score, and culturalOrigins properties
 * - Adds type assertions where needed
 * - Fixes any related inconsistencies
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths to files we need to fix
const targetFiles = [
  'src/utils/recommendation/ingredientRecommendation.ts',
  'src/utils/recommendation/cuisineRecommendation.ts',
  'src/utils/safeAstrology.ts'
];

// Track if we're in dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Process each file
for (const filePath of targetFiles) {
  console.log(`Processing ${filePath}...`);
  
  try {
    // Read the file
    const fullPath = path.resolve(process.cwd(), filePath);
    let content = fs.readFileSync(fullPath, 'utf8');
    let originalContent = content;
    
    // Handle culturalOrigins type issues
    content = content.replace(
      /culturalOrigins\.some\(/g,
      '(culturalOrigins as string[]).some('
    );
    
    // Fix Season type references
    content = content.replace(
      /currentSeason as Season/g,
      'currentSeason as "spring" | "summer" | "autumn" | "winter"'
    );
    
    content = content.replace(
      /season: options\.currentSeason as Season/g,
      'season: options.currentSeason as "spring" | "summer" | "autumn" | "winter"'
    );
    
    content = content.replace(
      /\(ingredient\.season as Season\[\]\)/g,
      '(ingredient.season as Array<"spring" | "summer" | "autumn" | "winter">)'
    );
    
    // Fix score property access
    content = content.replace(
      /if \(!ingredient\.score\)/g,
      'if (!("score" in ingredient) || ingredient.score === undefined)'
    );
    
    content = content.replace(
      /ingredient\.score =/g,
      '(ingredient as any).score ='
    );
    
    content = content.replace(
      /ingredient\.score \+/g,
      '(ingredient as any).score +'
    );
    
    // Fix season property access
    content = content.replace(
      /if \(!ingredient\.season \|\| !Array\.isArray\(ingredient\.season\) \|\| ingredient\.season\.length === 0\)/g,
      'if (!("season" in ingredient) || !Array.isArray(ingredient.season) || ingredient.season.length === 0)'
    );
    
    content = content.replace(
      /const seasonMatch = ingredient\.season\.some\(/g,
      'const seasonMatch = (ingredient.season as string[]).some('
    );
    
    // Fix type assertion in UnifiedFlavorProfile creation
    content = content.replace(
      /intensity: ingredient.intensity \|\| 0\.5/g,
      'intensity: (ingredient.intensity as number | undefined) || 0.5'
    );
    
    content = content.replace(
      /complexity: ingredient.complexity \|\| 0\.5/g,
      'complexity: (ingredient.complexity as number | undefined) || 0.5'
    );
    
    content = content.replace(
      /kalchm: ingredient.kalchm \|\| 1\.0/g,
      'kalchm: (ingredient.kalchm as number | undefined) || 1.0'
    );
    
    content = content.replace(
      /monicaOptimization: ingredient.monica \|\| 1\.0/g,
      'monicaOptimization: (ingredient.monica as number | undefined) || 1.0'
    );
    
    content = content.replace(
      /culturalOrigins: ingredient.culturalOrigins \|\| \[ingredient.category \|\| 'universal'\]/g,
      'culturalOrigins: (ingredient.culturalOrigins as string[] | undefined) || [(ingredient.category as string | undefined) || "universal"]'
    );
    
    content = content.replace(
      /tags: ingredient.qualities \|\| \[\]/g,
      'tags: (ingredient.qualities as string[] | undefined) || []'
    );

    // Fix thermodynamic property arithmetic operations
    content = content.replace(
      /const difference = Math\.abs\(ingredientKalchm - systemKalchm\);/g,
      'const difference = Math.abs((ingredientKalchm as number) - (systemKalchm as number));'
    );
    
    content = content.replace(
      /const optimization = ingredientMonica \* systemMonica;/g,
      'const optimization = (ingredientMonica as number) * (systemMonica as number);'
    );
    
    // Write changes if content was modified
    if (content !== originalContent) {
      if (isDryRun) {
        console.log(`[DRY RUN] Would update ${filePath}`);
      } else {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${filePath}`);
      }
    } else {
      console.log(`No changes needed for ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

console.log('Ingredient type fix completed.'); 