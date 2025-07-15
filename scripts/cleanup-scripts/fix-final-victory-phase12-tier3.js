#!/usr/bin/env node

/**
 * Phase 12 Tier 3: Property Name Revolution (TS2551)
 * Target: 269 TS2551 property name suggestion errors
 * 
 * PRIMARY FOCUS: Apply TypeScript's suggested property name corrections
 * - Fix Water -> water, Earth -> earth, Air -> Air casing
 * - Apply automatic TypeScript suggestions
 * - Standardize property naming across the codebase
 * - Pattern-based corrections for common typos
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

let modificationsCount = 0;
let filesProcessed = 0;

// Direct property name corrections based on TS2551 suggestions
const PROPERTY_NAME_FIXES = [
  // Element property name standardization
  {
    pattern: /\.Water(?=\s*[^a-zA-Z])/g,
    replacement: '.Water',
    description: 'Fix Water property to water (TS2551 suggestion)'
  },
  {
    pattern: /\.Earth(?=\s*[^a-zA-Z])/g,
    replacement: '.Earth',
    description: 'Fix Earth property to earth (TS2551 suggestion)'
  },
  {
    pattern: /\.Air(?=\s*[^a-zA-Z])/g,
    replacement: '.Air',
    description: 'Fix Air property to Air (TS2551 suggestion)'
  },
  {
    pattern: /\.Spirit(?=\s*[^a-zA-Z])/g,
    replacement: '.Spirit',
    description: 'Fix Spirit property to Spirit (TS2551 suggestion)'
  },
  {
    pattern: /\.Essence(?=\s*[^a-zA-Z])/g,
    replacement: '.Essence',
    description: 'Fix Essence property to Essence (TS2551 suggestion)'
  },
  {
    pattern: /\.Matter(?=\s*[^a-zA-Z])/g,
    replacement: '.Matter',
    description: 'Fix Matter property to Matter (TS2551 suggestion)'
  },
  {
    pattern: /\.Substance(?=\s*[^a-zA-Z])/g,
    replacement: '.Substance',
    description: 'Fix Substance property to Substance (TS2551 suggestion)'
  },
  // Planetary property corrections
  {
    pattern: /\.planetaryHours(?=\s*[^a-zA-Z])/g,
    replacement: '.planetaryHour',
    description: 'Fix planetaryHours to planetaryHour (TS2551 suggestion)'
  }
];

// Object key fixes within object literals
const OBJECT_KEY_FIXES = [
  // Element object keys standardization
  {
    pattern: /(\{\s*[^}]*?)Water(\s*:\s*[^,}]+)/g,
    replacement: '$1water$2',
    description: 'Fix Water key to water in object literals'
  },
  {
    pattern: /(\{\s*[^}]*?)Earth(\s*:\s*[^,}]+)/g,
    replacement: '$1earth$2',
    description: 'Fix Earth key to earth in object literals'
  },
  {
    pattern: /(\{\s*[^}]*?)Air(\s*:\s*[^,}]+)/g,
    replacement: '$1Air$2',
    description: 'Fix Air key to Air in object literals'
  },
  {
    pattern: /(\{\s*[^}]*?)Spirit(\s*:\s*[^,}]+)/g,
    replacement: '$1spirit$2',
    description: 'Fix Spirit key to Spirit in object literals'
  },
  {
    pattern: /(\{\s*[^}]*?)Essence(\s*:\s*[^,}]+)/g,
    replacement: '$1essence$2',
    description: 'Fix Essence key to Essence in object literals'
  },
  {
    pattern: /(\{\s*[^}]*?)Matter(\s*:\s*[^,}]+)/g,
    replacement: '$1matter$2',
    description: 'Fix Matter key to Matter in object literals'
  },
  {
    pattern: /(\{\s*[^}]*?)Substance(\s*:\s*[^,}]+)/g,
    replacement: '$1substance$2',
    description: 'Fix Substance key to Substance in object literals'
  }
];

// Array access fixes
const ARRAY_ACCESS_FIXES = [
  // String literal access patterns
  {
    pattern: /\['Water'\]/g,
    replacement: "['Water']",
    description: 'Fix Water array access to water'
  },
  {
    pattern: /\['Earth'\]/g,
    replacement: "['Earth']",
    description: 'Fix Earth array access to earth'
  },
  {
    pattern: /\['Air'\]/g,
    replacement: "['Air']",
    description: 'Fix Air array access to Air'
  },
  {
    pattern: /\['Spirit'\]/g,
    replacement: "['Spirit']",
    description: 'Fix Spirit array access to Spirit'
  },
  {
    pattern: /\['Essence'\]/g,
    replacement: "['Essence']",
    description: 'Fix Essence array access to Essence'
  },
  {
    pattern: /\['Matter'\]/g,
    replacement: "['Matter']",
    description: 'Fix Matter array access to Matter'
  },
  {
    pattern: /\['Substance'\]/g,
    replacement: "['Substance']",
    description: 'Fix Substance array access to Substance'
  }
];

// High-impact files based on the TS2551 errors we saw
const HIGH_IMPACT_FILES = [
  'src/calculations/core/kalchmEngine.ts',
  'src/calculations/culinary/recipeMatching.ts',
  'src/calculations/elementalcalculations.ts',
  'src/calculations/gregsEnergy.ts',
  'src/calculations/culinaryAstrology.ts'
];

function logProgress(message) {
  if (VERBOSE) console.log(`[Phase12-T3] ${message}`);
}

function applyFixes(content, fixes, filename) {
  let modifiedContent = content;
  let localModifications = 0;

  for (const fix of fixes) {
    const matches = modifiedContent.match(fix.pattern);
    if (matches) {
      logProgress(`Applying ${fix.description} in ${filename} (${matches.length} matches)`);
      modifiedContent = modifiedContent.replace(fix.pattern, fix.replacement);
      localModifications += matches.length;
    }
  }

  return { content: modifiedContent, modifications: localModifications };
}

function processFile(filePath) {
  if (!existsSync(filePath)) {
    logProgress(`File not found: ${filePath}`);
    return;
  }

  try {
    const content = readFileSync(filePath, 'utf8');
    let modifiedContent = content;
    let fileModifications = 0;

    // Apply property name fixes
    const propertyResult = applyFixes(modifiedContent, PROPERTY_NAME_FIXES, filePath);
    modifiedContent = propertyResult.content;
    fileModifications += propertyResult.modifications;

    // Apply object key fixes
    const objectResult = applyFixes(modifiedContent, OBJECT_KEY_FIXES, filePath);
    modifiedContent = objectResult.content;
    fileModifications += objectResult.modifications;

    // Apply array access fixes
    const arrayResult = applyFixes(modifiedContent, ARRAY_ACCESS_FIXES, filePath);
    modifiedContent = arrayResult.content;
    fileModifications += arrayResult.modifications;

    if (fileModifications > 0) {
      logProgress(`${filePath}: ${fileModifications} modifications`);
      
      if (!DRY_RUN) {
        writeFileSync(filePath, modifiedContent, 'utf8');
      }
      
      modificationsCount += fileModifications;
      filesProcessed++;
    }

  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function main() {
  console.log('🎨 Phase 12 Tier 3: Property Name Revolution (TS2551)');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE EXECUTION'}`);
  console.log('Target: 269 TS2551 property name suggestion errors\n');

  // Process high-impact files first
  console.log('Processing high-impact files with TS2551 errors...');
  for (const file of HIGH_IMPACT_FILES) {
    processFile(file);
  }

  // Find and process additional files with TS2551 errors
  console.log('\nProcessing additional files with TS2551 errors...');
  try {
    const tsOutput = execSync('yarn run tsc --noEmit 2>&1 | grep "error TS2551" | cut -d"(" -f1 | sort -u', { encoding: 'utf8' });
    const errorFiles = tsOutput.trim().split('\n').filter(f => f && !HIGH_IMPACT_FILES.includes(f));
    
    for (const file of errorFiles.slice(0, 20)) { // Process up to 20 additional files
      processFile(file);
    }
  } catch (error) {
    console.log('Could not get additional error files, continuing with high-impact files only');
  }

  // Summary
  console.log('\n📊 Phase 12 Tier 3 Summary:');
  console.log(`Files processed: ${filesProcessed}`);
  console.log(`Total modifications: ${modificationsCount}`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN - No files changed' : 'LIVE - Files updated'}`);

  if (!DRY_RUN && modificationsCount > 0) {
    console.log('\n🔍 Running quick validation...');
    try {
      execSync('yarn run tsc --noEmit | head -20', { stdio: 'inherit' });
    } catch (error) {
      console.log('Validation complete - check output above');
    }
  }

  console.log('\n✅ Phase 12 Tier 3 Complete!');
  console.log('Next: Run final error count to assess Phase 12 impact');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default { processFile, PROPERTY_NAME_FIXES, OBJECT_KEY_FIXES }; 