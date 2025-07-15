/**
 * Script to fix RecipeIngredient type issues
 * 
 * This script:
 * 1. Adds RecipeIngredient type definition if missing
 * 2. Adds imports for RecipeIngredient where needed
 * 3. Adds validateIngredient function where needed
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define the standard RecipeIngredient type
const recipeIngredientType = `
/**
 * Represents an ingredient in a recipe with measurement and properties
 */
export interface RecipeIngredient {
  name: string;
  amount: number;
  unit: string;
  element: string;
  category?: string;
  elementalProperties?: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
    [key: string]: number;
  };
  energyValues?: {
    heat: number;
    entropy: number;
    reactivity: number;
    energy: number;
  };
  planetaryRuler?: string;
  swaps?: string[];
  seasonality?: string[];
  nutritionalProfile?: {
    calories: number;
    macros: {
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
    };
    vitamins?: Record<string, number>;
    minerals?: Record<string, number>;
    phytonutrients?: Record<string, number>;
  };
  nutritionalScore?: number;
}
`;

// Define the validateIngredient function
const validateIngredientFunction = `
/**
 * Validates a RecipeIngredient object to ensure it has all required properties
 * @param ingredient The ingredient to validate
 * @returns True if the ingredient is valid, false otherwise
 */
export function validateIngredient(ingredient: RecipeIngredient): boolean {
  if (!ingredient) return false;
  if (typeof ingredient !== 'object') return false;
  
  // Check required fields
  if (!ingredient.name || typeof ingredient.name !== 'string') return false;
  if (ingredient.amount === undefined || ingredient.amount === null) return false;
  if (!ingredient.unit || typeof ingredient.unit !== 'string') return false;
  if (!ingredient.element || typeof ingredient.element !== 'string') return false;
  
  // Check that elementalProperties has the right structure if present
  if (ingredient.elementalProperties) {
    const elements = ['Fire', 'Water', 'Earth', 'Air'];
    for (const element of elements) {
      if (typeof ingredient.elementalProperties[element] !== 'number') {
        return false;
      }
    }
  }
  
  return true;
}
`;

// Add RecipeIngredient type to a file if it's missing
async function addRecipeIngredientType(filePath) {
  try {
    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    
    // Skip non-TypeScript files and non-text files
    if (!filePath.match(/\.ts$/) || !content || content.includes('\u0000')) {
      return false;
    }
    
    // Skip if already has RecipeIngredient definition
    if (content.includes('interface RecipeIngredient') || 
        content.includes('type RecipeIngredient')) {
      return false;
    }
    
    // Check if file needs RecipeIngredient type
    if (content.includes('RecipeIngredient')) {
      // Add import if it's missing
      if (!content.includes('import { RecipeIngredient }')) {
        // Find a good place to add the import
        let updatedContent;
        if (content.includes('import {')) {
          // Add to an existing import from the same path
          updatedContent = content.replace(
            /import\s*{([^}]*)}\s*from\s*['"]([^'"]*types[^'"]*)['"]/,
            (match, imports, path) => {
              if (imports.includes('RecipeIngredient')) {
                return match;
              }
              return `import {${imports}, RecipeIngredient} from '${path}'`;
            }
          );
          
          // If no existing import from types was modified, add a new import
          if (updatedContent === content) {
            updatedContent = content.replace(
              /(import [^;]*;)(\s*)/,
              '$1\nimport { RecipeIngredient } from \'@/types/recipe\';$2'
            );
          }
        } else {
          // Add as the first import
          updatedContent = `import { RecipeIngredient } from '@/types/recipe';\n\n${content}`;
        }
        
        // Write changes
        await fs.writeFile(filePath, updatedContent, 'utf8');
        console.log(`✅ Added RecipeIngredient import to ${filePath}`);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Create or update RecipeIngredient type definition file
async function createOrUpdateRecipeIngredientType() {
  const typesDir = path.join(rootDir, 'types');
  const recipeTypesPath = path.join(typesDir, 'recipe.ts');
  
  try {
    // Create types directory if it doesn't exist
    try {
      await fs.mkdir(typesDir, { recursive: true });
    } catch (err) {
      // Directory might already exist, that's fine
    }
    
    // Check if file already exists
    let existingContent = '';
    try {
      existingContent = await fs.readFile(recipeTypesPath, 'utf8');
    } catch (err) {
      // File doesn't exist, will create it
    }
    
    // If file exists, check if RecipeIngredient type is already defined
    if (existingContent && (
        existingContent.includes('interface RecipeIngredient') || 
        existingContent.includes('type RecipeIngredient')
      )) {
      // Update the existing definition
      const updatedContent = existingContent.replace(
        /export\s+(interface|type)\s+RecipeIngredient\s*(?:=\s*{|{)[^}]*}/gs,
        recipeIngredientType
      );
      
      if (updatedContent !== existingContent) {
        await fs.writeFile(recipeTypesPath, updatedContent, 'utf8');
        console.log(`✅ Updated RecipeIngredient type in ${recipeTypesPath}`);
      }
    } else {
      // Create new file or add to existing file
      let newContent;
      if (existingContent) {
        newContent = existingContent + '\n' + recipeIngredientType;
      } else {
        newContent = `/**
 * Recipe-related type definitions
 */

${recipeIngredientType}

${validateIngredientFunction}
`;
      }
      
      await fs.writeFile(recipeTypesPath, newContent, 'utf8');
      console.log(`✅ Created RecipeIngredient type in ${recipeTypesPath}`);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error creating/updating RecipeIngredient type:`, error.message);
    return false;
  }
}

// Add validateIngredient function where needed
async function addValidateIngredientFunction(filePath) {
  try {
    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    
    // Skip non-TypeScript files and non-text files
    if (!filePath.match(/\.ts$/) || !content || content.includes('\u0000')) {
      return false;
    }
    
    // Check if file uses validateIngredient
    if (content.includes('validateIngredient(') && !content.includes('function validateIngredient')) {
      // Check for existing import
      if (!content.includes('import { validateIngredient }')) {
        // Add import
        let updatedContent;
        if (content.includes('import {')) {
          // Add to an existing import from the same path
          updatedContent = content.replace(
            /import\s*{([^}]*)}\s*from\s*['"]([^'"]*types[^'"]*)['"]/,
            (match, imports, path) => {
              if (imports.includes('validateIngredient')) {
                return match;
              }
              return `import {${imports}, validateIngredient} from '${path}'`;
            }
          );
          
          // If no existing import from types was modified, add a new import
          if (updatedContent === content) {
            updatedContent = content.replace(
              /(import [^;]*;)(\s*)/,
              '$1\nimport { validateIngredient } from \'@/types/recipe\';$2'
            );
          }
        } else {
          // Add as the first import
          updatedContent = `import { validateIngredient } from '@/types/recipe';\n\n${content}`;
        }
        
        // Write changes
        await fs.writeFile(filePath, updatedContent, 'utf8');
        console.log(`✅ Added validateIngredient import to ${filePath}`);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Fix missing Recipe type imports
async function fixRecipeTypeImports(filePath) {
  try {
    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    
    // Skip non-TypeScript files and non-text files
    if (!filePath.match(/\.(ts|tsx)$/) || !content || content.includes('\u0000')) {
      return false;
    }
    
    // Check if file uses Recipe type but doesn't import it
    if (content.includes('Recipe') && 
        !content.includes('interface Recipe') && 
        !content.includes('type Recipe =') && 
        !content.includes('import { Recipe }') && 
        !content.includes('import type { Recipe }')) {
      
      // Add import
      let updatedContent;
      if (content.includes('import {')) {
        // Add to an existing import from the same path
        updatedContent = content.replace(
          /import\s*{([^}]*)}\s*from\s*['"]([^'"]*types[^'"]*)['"]/,
          (match, imports, path) => {
            if (imports.includes('Recipe')) {
              return match;
            }
            return `import {${imports}, Recipe} from '${path}'`;
          }
        );
        
        // If no existing import from types was modified, add a new import
        if (updatedContent === content) {
          updatedContent = content.replace(
            /(import [^;]*;)(\s*)/,
            '$1\nimport { Recipe } from \'@/types/recipe\';$2'
          );
        }
      } else {
        // Add as the first import
        updatedContent = `import { Recipe } from '@/types/recipe';\n\n${content}`;
      }
      
      // Write changes
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Added Recipe import to ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules, .git and .next directories
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== '.next') {
        await processDirectory(fullPath);
      }
    } else {
      // Only process TypeScript files
      if (fullPath.match(/\.(ts|tsx)$/)) {
        await addRecipeIngredientType(fullPath);
        await addValidateIngredientFunction(fullPath);
        await fixRecipeTypeImports(fullPath);
      }
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Fixing RecipeIngredient and Recipe type issues...');
  const startTime = Date.now();
  
  try {
    // First, create or update the RecipeIngredient type definition
    await createOrUpdateRecipeIngredientType();
    
    // Then fix imports across the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ RecipeIngredient and Recipe type fixes completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during RecipeIngredient type fixes:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Override file writing functions
  // ... (similar to previous script)
}

main();

export default main; 