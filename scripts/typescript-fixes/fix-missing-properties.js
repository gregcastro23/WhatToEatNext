#!/usr/bin/env node

/**
 * Missing Properties Fix Script
 * 
 * This script adds missing properties to interface implementations including:
 * 1. RecipeHarmonyResult missing properties
 * 2. ChakraEnergies property issues
 * 3. Various other missing property implementations
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
 * Get the type of object property based on its usage
 */
function inferPropertyType(filePath, propertyName) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for assignments to this property
    const assignmentRegex = new RegExp(`\\b${propertyName}\\s*=\\s*([\\w\\d."'\\[\\]{}]+)`, 'g');
    const assignmentMatch = content.match(assignmentRegex);
    
    if (assignmentMatch) {
      // Try to infer from assignment
      if (assignmentMatch[0].includes('[]') || assignmentMatch[0].includes('Array')) {
        return 'any[]';
      } else if (assignmentMatch[0].includes('{}') || assignmentMatch[0].includes('Object')) {
        return 'Record<string, unknown>';
      } else if (assignmentMatch[0].includes('true') || assignmentMatch[0].includes('false')) {
        return 'boolean';
      } else if (assignmentMatch[0].includes('"') || assignmentMatch[0].includes("'")) {
        return 'string';
      } else if (/\d+(\.\d+)?/.test(assignmentMatch[0])) {
        return 'number';
      }
    }
    
    // Default to "unknown" if we can't determine
    return 'unknown';
  } catch (error) {
    log(`Error inferring property type: ${error.message}`, 'error');
    return 'unknown';
  }
}

/**
 * Process a file to fix missing properties
 */
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let modifications = [];

    // Fix 1: Add missing thirdEye property to ChakraEnergies
    const chakraEnergiesFixes = [
      // Ensure ChakraEnergies interface has both brow and thirdEye
      {
        pattern: /export\s+interface\s+ChakraEnergies\s*{([^}]*)}/g,
        replacement: (match, properties) => {
          if (!properties.includes('thirdEye')) {
            modifications.push('Added thirdEye property to ChakraEnergies interface');
            return `export interface ChakraEnergies {${properties}  thirdEye: number;\n}`;
          }
          return match;
        }
      },
      // Add thirdEye property to ChakraEnergies object initializations
      {
        pattern: /(const|let|var)\s+(\w+)\s*:\s*ChakraEnergies\s*=\s*{([^}]*)}/g,
        replacement: (match, declaration, varName, props) => {
          if (!props.includes('thirdEye')) {
            // Look for brow value to copy
            const browMatch = props.match(/brow:\s*([^,\s]+)/);
            const browValue = browMatch ? browMatch[1] : '0';
            
            modifications.push(`Added thirdEye property to ${varName} ChakraEnergies object`);
            return `${declaration} ${varName}: ChakraEnergies = {${props}${props.trim().endsWith(',') ? '' : ','}  thirdEye: ${browValue}\n}`;
          }
          return match;
        }
      }
    ];

    // Fix 2: Add missing properties to RecipeHarmonyResult
    const recipeHarmonyResultFixes = [
      // Add any missing properties when using RecipeHarmonyResult
      {
        pattern: /(\w+)\s*:\s*RecipeHarmonyResult\s*=\s*{([^}]*)}/g,
        replacement: (match, varName, props) => {
          let modified = false;
          let result = `${varName}: RecipeHarmonyResult = {${props}`;
          
          // Check for missing required properties
          const requiredProps = ['recipeSpecificBoost', 'optimalTimingWindows', 'elementalMultipliers'];
          
          for (const prop of requiredProps) {
            if (!props.includes(prop)) {
              modified = true;
              modifications.push(`Added missing ${prop} property to ${varName}`);
              
              // Add appropriate default value based on property type
              if (prop === 'recipeSpecificBoost') {
                result += `${result.trim().endsWith(',') ? '' : ','}  ${prop}: 0`;
              } else if (prop === 'optimalTimingWindows') {
                result += `${result.trim().endsWith(',') ? '' : ','}  ${prop}: []`;
              } else if (prop === 'elementalMultipliers') {
                result += `${result.trim().endsWith(',') ? '' : ','}  ${prop}: {}`;
              }
            }
          }
          
          result += '\n}';
          return modified ? result : match;
        }
      }
    ];

    // Fix 3: Fix other common missing properties in objects
    const commonPropertyFixes = [
      // Find object property access that might be undefined
      {
        pattern: /TypeError: Cannot read properties of undefined \(reading '(\w+)'\)/g,
        replacement: (match, propName) => {
          // No direct replacement, but record the issue for manual fixing
          modifications.push(`Found potential undefined property access: ${propName}`);
          return match;
        }
      }
    ];

    // Apply all fixes
    const allFixes = [...chakraEnergiesFixes, ...recipeHarmonyResultFixes, ...commonPropertyFixes];
    
    allFixes.forEach(fix => {
      content = content.replace(fix.pattern, fix.replacement);
    });

    // Write changes if content was modified and we're not in dry run mode
    if (content !== originalContent) {
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, content, 'utf8');
        log(`Fixed missing properties in: ${path.relative(BASE_PATH, filePath)}`, 'success');
        
        if (VERBOSE) {
          modifications.forEach(mod => log(`  - ${mod}`, 'info'));
        }
      } else {
        log(`Would fix missing properties in: ${path.relative(BASE_PATH, filePath)}`, 'info');
        
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
  log('Starting missing properties fix script' + (DRY_RUN ? ' (DRY RUN)' : ''), 'info');
  
  const tsFiles = await findTsFiles();
  log(`Found ${tsFiles.length} TypeScript files to process`, 'info');
  
  let modifiedCount = 0;
  
  for (const file of tsFiles) {
    modifiedCount += processFile(file);
  }
  
  if (DRY_RUN) {
    log(`Dry run completed. Would modify ${modifiedCount} files.`, 'success');
  } else {
    log(`Missing properties fixes completed. Modified ${modifiedCount} files.`, 'success');
  }
}

// Run the script
main().catch(error => {
  log(`Unhandled error: ${error.message}`, 'error');
  process.exit(1);
}); 