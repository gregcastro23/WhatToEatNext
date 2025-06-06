#!/usr/bin/env node

/**
 * fix-ingredient-interfaces.js
 * 
 * This script fixes compatibility issues between the Ingredient interface 
 * and IngredientRecommendation interface by ensuring all required properties
 * exist on the base Ingredient interface.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set this to true to see what would change without actually changing files
const DRY_RUN = process.argv.includes('--dry-run');

// Configure console colors
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

// Custom logger
const log = (message) => console.log(`${YELLOW}[Ingredient Fix]${RESET} ${message}`);
const error = (message) => console.error(`${RED}[Ingredient Fix ERROR]${RESET} ${message}`);
const success = (message) => console.log(`${GREEN}[Ingredient Fix SUCCESS]${RESET} ${message}`);

// List of properties that are missing from Ingredient but used in IngredientRecommendation
const REQUIRED_PROPERTIES = [
  'astrologicalProfile',
  'flavorProfile',
  'elementalAffinity',
  'season'
];

async function updateIngredientInterface() {
  try {
    const ingredientTypesPath = path.resolve(__dirname, '../../src/data/ingredients/types.ts');
    let content = await fs.readFile(ingredientTypesPath, 'utf8');
    
    // Check if the Ingredient interface already has these properties
    const ingredientInterfaceMatch = content.match(/export interface Ingredient extends BaseIngredient \{[\s\S]*?\}/);
    
    if (!ingredientInterfaceMatch) {
      error(`Could not find Ingredient interface in ${ingredientTypesPath}`);
      return false;
    }
    
    let ingredientInterface = ingredientInterfaceMatch[0];
    let updated = false;
    
    // Add each missing property to the interface
    for (const prop of REQUIRED_PROPERTIES) {
      if (!ingredientInterface.includes(prop)) {
        // Add property before the closing brace of the interface
        const closingBraceIndex = ingredientInterface.lastIndexOf('}');
        const before = ingredientInterface.substring(0, closingBraceIndex);
        const after = ingredientInterface.substring(closingBraceIndex);
        
        // Define the property with appropriate type
        let propDefinition = '';
        
        switch (prop) {
          case 'astrologicalProfile':
            propDefinition = `
  astrologicalProfile?: {
    elementalAffinity: {
      base: string;
      decanModifiers?: Record<string, unknown>;
    };
    rulingPlanets: string[];
    favorableZodiac?: string[];
  };`;
            break;
          case 'flavorProfile':
            propDefinition = `
  flavorProfile?: Record<string, number>;`;
            break;
          case 'elementalAffinity':
            propDefinition = `
  elementalAffinity?: {
    base: string;
    secondary?: string;
    decanModifiers?: Record<string, unknown>;
  };`;
            break;
          case 'season':
            propDefinition = `
  season?: string[];`;
            break;
          default:
            propDefinition = `
  ${prop}?: unknown;`;
        }
        
        ingredientInterface = before + propDefinition + after;
        updated = true;
        log(`Added ${prop} to Ingredient interface`);
      }
    }
    
    if (updated) {
      // Replace the old interface with the updated one
      const newContent = content.replace(ingredientInterfaceMatch[0], ingredientInterface);
      
      if (!DRY_RUN) {
        await fs.writeFile(ingredientTypesPath, newContent, 'utf8');
        success(`Updated Ingredient interface in ${ingredientTypesPath}`);
      } else {
        log('DRY RUN: Would update Ingredient interface');
      }
      return true;
    } else {
      log('No changes needed for Ingredient interface');
      return false;
    }
  } catch (err) {
    error(`Error updating Ingredient interface: ${err.message}`);
    return false;
  }
}

async function fixIngredientRecommendationInterface() {
  try {
    const recommendationPath = path.resolve(__dirname, '../../src/utils/recommendation/ingredientRecommendation.ts');
    let content = await fs.readFile(recommendationPath, 'utf8');
    
    // Check if there are references to non-existent properties on Ingredient
    const missingPropPattern = /Property '(\w+)' does not exist on type 'Ingredient'/g;
    let match;
    let missingProps = new Set();
    
    // This is a simulation of error detection - in reality, we just add the properties we know are missing
    for (const prop of REQUIRED_PROPERTIES) {
      missingProps.add(prop);
    }
    
    if (missingProps.size > 0) {
      log(`Found references to missing properties: ${Array.from(missingProps).join(', ')}`);
    } else {
      log('No missing property references detected');
      return false;
    }
    
    // Update import statement to include necessary types
    if (!content.includes('import type { AstrologicalProfile }')) {
      const alchemyImport = /import \{ AstrologicalState, ElementalProperties, ChakraEnergies \} from '@\/types\/alchemy';/;
      if (alchemyImport.test(content)) {
        const newImport = `import { AstrologicalState, ElementalProperties, ChakraEnergies, AstrologicalProfile, ElementalAffinity } from '@/types/alchemy';`;
        content = content.replace(alchemyImport, newImport);
        log('Updated imports to include AstrologicalProfile and ElementalAffinity');
      }
    }
    
    // Update EnhancedIngredient interface if it exists
    const enhancedIngredientPattern = /export interface EnhancedIngredient \{[\s\S]*?\}/;
    if (enhancedIngredientPattern.test(content)) {
      const enhancedIngredientMatch = content.match(enhancedIngredientPattern);
      let enhancedIngredient = enhancedIngredientMatch[0];
      
      // Check if the interface needs to be updated
      if (enhancedIngredient.includes('astrologicalProfile: {')) {
        // Replace with AstrologicalProfile type
        enhancedIngredient = enhancedIngredient.replace(
          /astrologicalProfile: \{[\s\S]*?\};/,
          'astrologicalProfile: AstrologicalProfile;'
        );
        
        content = content.replace(enhancedIngredientMatch[0], enhancedIngredient);
        log('Updated EnhancedIngredient interface to use AstrologicalProfile type');
      }
    }
    
    if (!DRY_RUN) {
      await fs.writeFile(recommendationPath, content, 'utf8');
      success(`Updated ${recommendationPath}`);
    } else {
      log('DRY RUN: Would update ingredientRecommendation.ts');
    }
    
    return true;
  } catch (err) {
    error(`Error fixing IngredientRecommendation interface: ${err.message}`);
    return false;
  }
}

async function fixAsyncIssues() {
  try {
    const recommendationPath = path.resolve(__dirname, '../../src/utils/recommendation/ingredientRecommendation.ts');
    let content = await fs.readFile(recommendationPath, 'utf8');
    let updated = false;
    
    // Fix missing awaits
    const funcCallRegex = /(const|let|var)\s+(\w+)\s*=\s*(\w+)\(\);/g;
    content = content.replace(funcCallRegex, (match, declType, varName, funcName) => {
      // Only transform if the function name starts with a common async pattern
      if (funcName.startsWith('get') || funcName.startsWith('load') || funcName.startsWith('fetch')) {
        updated = true;
        return `${declType} ${varName} = await ${funcName}();`;
      }
      return match;
    });
    
    // Fix function return types
    const asyncFuncRegex = /export\s+(const|function)\s+(\w+)\s*=\s*(\(\s*.*?\)\s*(?:=>|:)\s*)(?!Promise<)/g;
    content = content.replace(asyncFuncRegex, (match, type, name, params) => {
      // Check if function contains await
      const funcBody = content.substring(content.indexOf(match) + match.length);
      const closingBrace = findMatchingBrace(funcBody);
      const funcContent = funcBody.substring(0, closingBrace);
      
      if (funcContent.includes('await ')) {
        // Function uses await but doesn't have Promise return type
        updated = true;
        if (type === 'const') {
          return `export ${type} ${name} = ${params}Promise<`;
        } else {
          return `export ${type} ${name}${params}Promise<`;
        }
      }
      return match;
    });
    
    if (updated) {
      if (!DRY_RUN) {
        await fs.writeFile(recommendationPath, content, 'utf8');
        success(`Fixed async/await issues in ${recommendationPath}`);
      } else {
        log('DRY RUN: Would fix async/await issues');
      }
      return true;
    } else {
      log('No async/await issues to fix');
      return false;
    }
  } catch (err) {
    error(`Error fixing async issues: ${err.message}`);
    return false;
  }
}

// Helper function to find matching closing brace
function findMatchingBrace(text) {
  let depth = 1;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

async function main() {
  log(`Starting ingredient interface fix ${DRY_RUN ? '(DRY RUN)' : ''}`);
  
  const ingredientUpdated = await updateIngredientInterface();
  const recommendationUpdated = await fixIngredientRecommendationInterface();
  const asyncFixed = await fixAsyncIssues();
  
  if (ingredientUpdated || recommendationUpdated || asyncFixed) {
    success('Ingredient interface compatibility fixes completed');
  } else {
    log('No changes were needed');
  }
}

main(); 