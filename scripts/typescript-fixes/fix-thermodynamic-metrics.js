#!/usr/bin/env node

/**
 * fix-thermodynamic-metrics.js
 * 
 * This script standardizes the ThermodynamicMetrics interface across the codebase:
 * - Ensures consistent property names and types
 * - Adds missing properties where needed
 * - Fixes functions that return or accept ThermodynamicMetrics
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Track if we're in dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Files that need fixes
const targetFiles = [
  'src/utils/recommendation/methodRecommendation.ts',
  'src/calculations/gregsEnergy.ts',
  'src/calculations/core/alchemicalEngine.ts',
  'src/utils/astrology/calculations.ts',
  'src/lib/FoodAlchemySystem.ts',
  'src/services/FoodAlchemySystem.ts'
];

// The standard ThermodynamicMetrics interface from alchemy.ts
const standardInterface = `{
  heat: number;       // Heat: system's transformative energy
  entropy: number;    // Entropy: system's potential for change
  reactivity: number; // Reactivity: system's capacity to facilitate change
  energy: number;     // Normalized energy level (for scoring)
}`;

// Function to fix BasicThermodynamicProperties interface usage
function fixBasicThermodynamicProperties(content) {
  // Fix any direct interface returns that are missing the energy property
  return content.replace(
    /return\s*{[\s\n]*heat:\s*([^,]+),[\s\n]*entropy:\s*([^,]+),[\s\n]*reactivity:\s*([^,]+)[\s\n]*}/g,
    'return {\n    heat: $1,\n    entropy: $2,\n    reactivity: $3,\n    energy: ($1 + $2 + $3) / 3 // Calculated energy value\n  }'
  );
}

// Process each file
for (const filePath of targetFiles) {
  console.log(`Processing ${filePath}...`);
  
  try {
    // Read the file
    const fullPath = path.resolve(process.cwd(), filePath);
    let content = fs.readFileSync(fullPath, 'utf8');
    let originalContent = content;
    
    // Fix ThermodynamicMetrics type/interface definitions
    if (content.includes('type ThermodynamicMetrics') || content.includes('interface ThermodynamicMetrics')) {
      content = content.replace(
        /(type|interface)\s+ThermodynamicMetrics\s*=?\s*{[^}]*}/gs,
        `$1 ThermodynamicMetrics ${standardInterface}`
      );
    }
    
    // Fix missing energy property in BasicThermodynamicProperties implementations
    content = fixBasicThermodynamicProperties(content);
    
    // Fix methodRecommendation.ts specific issue with BasicThermodynamicProperties
    if (filePath.includes('methodRecommendation.ts')) {
      // Fix for method recommendation transformation calculators
      content = content.replace(
        /(calculateMethodTransformation\s*\([^)]*\)\s*:\s*BasicThermodynamicProperties\s*{[^}]*return\s*{[^}]*})/gs,
        (match) => {
          if (!match.includes('energy:')) {
            return match.replace(
              /return\s*{([^}]*)}/g,
              'return {$1, energy: (heat + entropy + reactivity) / 3 }'
            );
          }
          return match;
        }
      );
    }
    
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

console.log('ThermodynamicMetrics standardization completed.'); 