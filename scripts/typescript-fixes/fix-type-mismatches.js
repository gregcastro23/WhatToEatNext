#!/usr/bin/env node

/**
 * Type Mismatch Fix Script
 * 
 * This script fixes type mismatches in the codebase for:
 * 1. ElementalAffinity - Fix multiple interface conflicts
 * 2. ChakraEnergies - Resolve brow vs thirdEye property mismatches
 * 3. RecipeHarmonyResult - Fix compatibility issues
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

// ES modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

// Base path for our operations
const BASE_PATH = process.cwd();

/**
 * Logger function with verbosity control
 */
function log(message, type = 'info') {
  const prefix = {
    info: '\x1b[34m[INFO]\x1b[0m',
    success: '\x1b[32m[SUCCESS]\x1b[0m',
    warning: '\x1b[33m[WARNING]\x1b[0m',
    error: '\x1b[31m[ERROR]\x1b[0m',
  }[type] || '\x1b[34m[INFO]\x1b[0m';
  
  if (type === 'error' || type === 'success' || VERBOSE) {
    console.log(`${prefix} ${message}`);
  }
}

/**
 * Process a file to fix type mismatches
 */
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let modifications = [];

    // Fix 1: ElementalAffinity mismatches
    const elementalAffinityFixes = [
      // Fix interface assignments with strings
      {
        pattern: /elementalAffinity:\s*(['"])([^'"]+)['"]/g,
        replacement: (match, quote, value) => {
          modifications.push(`Converted string elementalAffinity to object: ${value}`);
          return `elementalAffinity: { base: ${quote}${value}${quote} }`;
        }
      },
      // Fix object access patterns without 'base'
      {
        pattern: /(\w+)\.elementalAffinity(?!\.)(?!\s*=\s*{)(?!\s*[?.]base)/g,
        replacement: (match, objName) => {
          modifications.push(`Fixed elementalAffinity object access: ${match}`);
          return `${objName}.elementalAffinity.base`;
        }
      }
    ];

    // Fix 2: ChakraEnergies - brow vs thirdEye property mismatches
    const chakraEnergiesFixes = [
      // Make sure thirdEye is used consistently when accessing ChakraEnergies
      {
        pattern: /\.brow(?!\w)/g,
        replacement: (match) => {
          // Only replace when in context of chakra energies
          const preceding50Chars = content.substring(Math.max(0, content.indexOf(match) - 50), content.indexOf(match));
          if (preceding50Chars.includes('ChakraEnergies') || preceding50Chars.includes('chakraEnergies')) {
            modifications.push(`Replaced 'brow' with 'thirdEye' in ChakraEnergies context`);
            return '.thirdEye';
          }
          return match;
        }
      },
      // Fix initializations that use 'brow' instead of 'thirdEye'
      {
        pattern: /brow:(\s*\d+)/g,
        replacement: (match, value) => {
          // Only replace when in context of chakra energies
          const preceding50Chars = content.substring(Math.max(0, content.indexOf(match) - 50), content.indexOf(match));
          if (preceding50Chars.includes('ChakraEnergies') || preceding50Chars.includes('chakraEnergies')) {
            modifications.push(`Replaced 'brow: ${value}' with 'thirdEye: ${value}' in ChakraEnergies context`);
            return `thirdEye:${value}`;
          }
          return match;
        }
      }
    ];

    // Fix 3: RecipeHarmonyResult compatibility issues
    const recipeHarmonyResultFixes = [
      // Add missing properties when initializing objects of type RecipeHarmonyResult
      {
        pattern: /(const|let|var)\s+(\w+)\s*:\s*RecipeHarmonyResult\s*=\s*({[^}]+})/g,
        replacement: (match, declaration, varName, obj) => {
          if (!obj.includes('recipeSpecificBoost') || !obj.includes('optimalTimingWindows') || !obj.includes('elementalMultipliers')) {
            modifications.push(`Added missing properties to RecipeHarmonyResult initialization for ${varName}`);
            
            // Remove the closing bracket to add properties
            let result = match.slice(0, -1);
            
            // Add missing properties
            if (!obj.includes('recipeSpecificBoost')) {
              result += ',\n  recipeSpecificBoost: 0';
            }
            if (!obj.includes('optimalTimingWindows')) {
              result += ',\n  optimalTimingWindows: []';
            }
            if (!obj.includes('elementalMultipliers')) {
              result += ',\n  elementalMultipliers: {}';
            }
            
            // Add the closing bracket back
            result += '\n}';
            return result;
          }
          return match;
        }
      }
    ];

    // Apply all fixes
    const allFixes = [...elementalAffinityFixes, ...chakraEnergiesFixes, ...recipeHarmonyResultFixes];
    
    allFixes.forEach(fix => {
      content = content.replace(fix.pattern, fix.replacement);
    });

    // Write changes if content was modified and we're not in dry run mode
    if (content !== originalContent) {
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, content, 'utf8');
        log(`Fixed type mismatches in: ${path.relative(BASE_PATH, filePath)}`, 'success');
        
        if (VERBOSE) {
          modifications.forEach(mod => log(`  - ${mod}`, 'info'));
        }
      } else {
        log(`Would fix type mismatches in: ${path.relative(BASE_PATH, filePath)}`, 'info');
        
        if (VERBOSE) {
          modifications.forEach(mod => log(`  - ${mod}`, 'info'));
        }
      }
      return 1; // Return 1 to indicate a file was modified
    }
    return 0; // Return 0 to indicate no changes were made
  } catch (error) {
    log(`Error processing ${filePath}: ${error.message}`, 'error');
    return 0;
  }
}

/**
 * Find all TypeScript files in the codebase
 */
async function findTsFiles() {
  return glob('src/**/*.{ts,tsx}', { ignore: ['**/node_modules/**', '**/.next/**'] });
}

/**
 * Main function
 */
async function main() {
  log('Starting type mismatch fix script' + (DRY_RUN ? ' (DRY RUN)' : ''), 'info');
  
  const tsFiles = await findTsFiles();
  log(`Found ${tsFiles.length} TypeScript files to process`, 'info');
  
  let modifiedCount = 0;
  
  for (const file of tsFiles) {
    modifiedCount += processFile(file);
  }
  
  if (DRY_RUN) {
    log(`Dry run completed. Would modify ${modifiedCount} files.`, 'success');
  } else {
    log(`Type mismatch fixes completed. Modified ${modifiedCount} files.`, 'success');
  }
}

// Run the script
main().catch(error => {
  log(`Unhandled error: ${error.message}`, 'error');
  process.exit(1);
}); 