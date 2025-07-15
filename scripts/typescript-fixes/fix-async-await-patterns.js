#!/usr/bin/env node

/**
 * fix-async-await-patterns.js
 * 
 * This script fixes async/await pattern issues in recommendation utility files:
 * - Adds missing async keywords to functions that return Promises
 * - Fixes await patterns for functions calling async functions
 * - Properly handles Promise chaining and returns
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths to files we need to fix
const targetFiles = [
  'src/utils/recommendation/ingredientRecommendation.ts',
  'src/utils/recommendation/methodRecommendation.ts',
  'src/utils/recommendation/cuisineRecommendation.ts'
];

// Track if we're in dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Patterns to identify and fix
const patterns = [
  // Pattern 1: Functions that return Promises but aren't marked as async
  {
    test: (content) => /(function\s+\w+\s*\([^)]*\)\s*(?!:\s*Promise)(?!:\s*void)(?!:\s*\w+\[\])(?!:\s*\w+)(?=\s*{[\s\S]*?return\s+.*?Promise))/g,
    fix: (content) => content.replace(
      /(function\s+\w+\s*\([^)]*\)\s*(?!:\s*Promise)(?!:\s*void)(?!:\s*\w+\[\])(?!:\s*\w+)(?=\s*{[\s\S]*?return\s+.*?Promise))/g,
      'async $1'
    )
  },
  
  // Pattern 2: Export functions that return Promises but aren't marked as async
  {
    test: (content) => /(export\s+function\s+\w+\s*\([^)]*\)\s*(?!:\s*Promise)(?!:\s*void)(?!:\s*\w+\[\])(?!:\s*\w+)(?=\s*{[\s\S]*?return\s+.*?Promise))/g,
    fix: (content) => content.replace(
      /(export\s+function\s+\w+\s*\([^)]*\)\s*(?!:\s*Promise)(?!:\s*void)(?!:\s*\w+\[\])(?!:\s*\w+)(?=\s*{[\s\S]*?return\s+.*?Promise))/g,
      'export async function $1'
    )
  },
  
  // Pattern 3: Functions with await but not marked as async
  {
    test: (content) => /(function\s+\w+\s*\([^)]*\)\s*(?!async)(?={[^}]*await))/g,
    fix: (content) => content.replace(
      /(function\s+\w+\s*\([^)]*\)\s*(?!async)(?={[^}]*await))/g,
      'async $1'
    )
  },
  
  // Pattern 4: Export functions with await but not marked as async
  {
    test: (content) => /(export\s+function\s+\w+\s*\([^)]*\)\s*(?!async)(?={[^}]*await))/g,
    fix: (content) => content.replace(
      /(export\s+function\s+\w+\s*\([^)]*\)\s*(?!async)(?={[^}]*await))/g,
      'export async function $1'
    )
  },
  
  // Pattern 5: Specifically fix recommendIngredients function
  {
    test: (content) => /export function recommendIngredients\(/g,
    fix: (content) => content.replace(
      /export function recommendIngredients\(/g,
      'export async function recommendIngredients('
    )
  },
  
  // Pattern 6: Accessing .filter() directly on a Promise without await
  {
    test: (content) => /(await\s+\w+)\.filter\(/g,
    fix: (content) => content.replace(
      /(await\s+\w+)\.filter\(/g,
      '$1.then(result => result.filter('
    )
  },
  
  // Pattern 7: Accessing .map() directly on a Promise without await
  {
    test: (content) => /(await\s+\w+)\.map\(/g,
    fix: (content) => content.replace(
      /(await\s+\w+)\.map\(/g,
      '$1.then(result => result.map('
    )
  },
  
  // Pattern 8: Add missing closing parenthesis and Promise.resolve for Pattern 6
  {
    test: (content) => /\.then\(result => result\.filter\(([^)]*)\)(?!\))/g,
    fix: (content) => content.replace(
      /\.then\(result => result\.filter\(([^)]*)\)(?!\))/g,
      '.then(result => result.filter($1))'
    )
  },
  
  // Pattern 9: Add missing closing parenthesis and Promise.resolve for Pattern 7
  {
    test: (content) => /\.then\(result => result\.map\(([^)]*)\)(?!\))/g,
    fix: (content) => content.replace(
      /\.then\(result => result\.map\(([^)]*)\)(?!\))/g,
      '.then(result => result.map($1))'
    )
  },
  
  // Pattern 10: Fix calculateModalityScore function in ingredientRecommendation.ts
  {
    test: (content) => /function calculateModalityScore\(\s*qualities: string\[\],\s*preferredModality\?: Modality\s*\)/g,
    fix: (content) => content.replace(
      /function calculateModalityScore\(\s*qualities: string\[\],\s*preferredModality\?: Modality\s*\)/g,
      'async function calculateModalityScore(qualities: string[], preferredModality?: Modality)'
    )
  }
];

// Custom fixes for specific files
const customFixes = {
  'src/utils/recommendation/ingredientRecommendation.ts': [
    // Fix the implementation of recommendIngredients
    {
      test: (content) => /filteredIngredients = await filteredIngredients\.filter\(/g,
      fix: (content) => content.replace(
        /filteredIngredients = await filteredIngredients\.filter\(/g,
        'filteredIngredients = await Promise.resolve(filteredIngredients).then(ingredients => ingredients.filter('
      )
    },
    {
      test: (content) => /const scoredIngredients = await filteredIngredients\.map\(/g,
      fix: (content) => content.replace(
        /const scoredIngredients = await filteredIngredients\.map\(/g,
        'const scoredIngredients = await Promise.resolve(filteredIngredients).then(ingredients => ingredients.map('
      )
    }
  ]
};

// Process each file
for (const filePath of targetFiles) {
  console.log(`Processing ${filePath}...`);
  
  try {
    // Read the file
    const fullPath = path.resolve(process.cwd(), filePath);
    let content = fs.readFileSync(fullPath, 'utf8');
    let originalContent = content;
    
    // Apply general patterns
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        content = pattern.fix(content);
      }
    }
    
    // Apply custom fixes for specific files
    if (customFixes[filePath]) {
      for (const fix of customFixes[filePath]) {
        if (fix.test(content)) {
          content = fix.fix(content);
        }
      }
    }
    
    // Fix missing closing parentheses in custom fixes
    content = content.replace(
      /Promise\.resolve\(filteredIngredients\)\.then\(ingredients => ingredients\.filter\(([^)]*)\)(?!\))/g,
      'Promise.resolve(filteredIngredients).then(ingredients => ingredients.filter($1))'
    );
    
    content = content.replace(
      /Promise\.resolve\(filteredIngredients\)\.then\(ingredients => ingredients\.map\(([^)]*)\)(?!\))/g,
      'Promise.resolve(filteredIngredients).then(ingredients => ingredients.map($1))'
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

console.log('Async/await patterns fix completed.'); 