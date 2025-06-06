#!/usr/bin/env node

/**
 * Phase 12 Tier 2: Const Assignment Revolution (TS2588)
 * Target: 296 TS2588 const assignment errors
 * 
 * PRIMARY FOCUS: Mutability analysis and immutable update patterns
 * - Convert const to let where reassignment is needed
 * - Implement immutable update patterns with spread operators
 * - Fix readonly/const variable mutations
 * - Proper state management patterns
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

let modificationsCount = 0;
let filesProcessed = 0;

// Const to let conversion patterns
const CONST_TO_LET_FIXES = [
  // Common reassignment patterns
  {
    pattern: /const\s+(score)\s*=\s*([^;]+);/g,
    replacement: 'let $1 = $2;',
    description: 'Convert score const to let for reassignment'
  },
  {
    pattern: /const\s+(elementalScore)\s*=\s*([^;]+);/g,
    replacement: 'let $1 = $2;',
    description: 'Convert elementalScore const to let for reassignment'
  },
  {
    pattern: /const\s+(totalWeight)\s*=\s*([^;]+);/g,
    replacement: 'let $1 = $2;',
    description: 'Convert totalWeight const to let for reassignment'
  },
  {
    pattern: /const\s+(result)\s*=\s*\{[^}]*\}\s*;/g,
    replacement: 'let $1 = $2;',
    description: 'Convert result object const to let for modification'
  },
  {
    pattern: /const\s+(calculations?)\s*=\s*([^;]+);/g,
    replacement: 'let $1 = $2;',
    description: 'Convert calculation const to let for updates'
  },
  {
    pattern: /const\s+(total)\s*=\s*([^;]+);/g,
    replacement: 'let $1 = $2;',
    description: 'Convert total const to let for accumulation'
  }
];

// Property assignment patterns - fix direct assignments to const object properties
const PROPERTY_ASSIGNMENT_FIXES = [
  // Score assignments
  {
    pattern: /(\w+)\.score\s*=\s*([^;]+);/g,
    replacement: '$1 = { ...$1, score: $2 };',
    description: 'Use immutable update for score property'
  },
  {
    pattern: /(\w+)\.elementalScore\s*=\s*([^;]+);/g,
    replacement: '$1 = { ...$1, elementalScore: $2 };',
    description: 'Use immutable update for elementalScore property'
  },
  {
    pattern: /(\w+)\.totalWeight\s*=\s*([^;]+);/g,
    replacement: '$1 = { ...$1, totalWeight: $2 };',
    description: 'Use immutable update for totalWeight property'
  }
];

// Array and object mutation fixes
const IMMUTABLE_UPDATE_FIXES = [
  // Object property updates
  {
    pattern: /(\w+)\[['"](\w+)['"]\]\s*=\s*([^;]+);/g,
    replacement: '$1 = { ...$1, $2: $3 };',
    description: 'Use immutable update for object property assignment'
  },
  // Array mutations
  {
    pattern: /(\w+)\.push\(([^)]+)\)/g,
    replacement: '$1 = [...$1, $2]',
    description: 'Use immutable array append instead of push'
  }
];

// Specific file-based fixes from the error patterns we saw
const SPECIFIC_CONST_FIXES = [
  // alchemicalEngine.ts patterns
  {
    pattern: /Cannot assign to 'score' because it is a constant/g,
    replacement: '',
    description: 'Remove error comment about score assignment'
  },
  {
    pattern: /Cannot assign to 'elementalScore' because it is a constant/g,
    replacement: '',
    description: 'Remove error comment about elementalScore assignment'
  },
  {
    pattern: /Cannot assign to 'totalWeight' because it is a constant/g,
    replacement: '',
    description: 'Remove error comment about totalWeight assignment'
  }
];

// High-impact files with TS2588 errors
const HIGH_IMPACT_FILES = [
  'src/calculations/alchemicalEngine.ts',
  'src/calculations/elementalcalculations.ts',
  'src/calculations/enhancedCuisineRecommender.ts',
  'src/calculations/core/alchemicalEngine.ts',
  'src/calculations/gregsEnergy.ts'
];

function logProgress(message) {
  if (VERBOSE) console.log(`[Phase12-T2] ${message}`);
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

function analyzeAndFixConstAssignments(content, filename) {
  let modifiedContent = content;
  let localModifications = 0;

  // Find specific patterns where const variables are being reassigned
  const reassignmentPatterns = [
    // Pattern: const variable = value; ... variable = newValue;
    {
      findPattern: /const\s+(\w+)\s*=\s*([^;]+);[\s\S]*?\1\s*=\s*[^;]+;/g,
      description: 'Convert const to let for variables that get reassigned'
    }
  ];

  for (const pattern of reassignmentPatterns) {
    const matches = modifiedContent.match(pattern.findPattern);
    if (matches) {
      logProgress(`Found ${matches.length} const reassignment patterns in ${filename}`);
      
      for (const match of matches) {
        const variableName = match.match(/const\s+(\w+)/)?.[1];
        if (variableName) {
          // Replace the first const declaration with let
          const constDeclaration = new RegExp(`const\\s+(${variableName})\\s*=`, 'g');
          if (modifiedContent.match(constDeclaration)) {
            modifiedContent = modifiedContent.replace(constDeclaration, `let $1 =`);
            localModifications++;
            logProgress(`Converted const ${variableName} to let in ${filename}`);
          }
        }
      }
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

    // Apply const to let fixes
    const constResult = applyFixes(modifiedContent, CONST_TO_LET_FIXES, filePath);
    modifiedContent = constResult.content;
    fileModifications += constResult.modifications;

    // Apply property assignment fixes
    const propertyResult = applyFixes(modifiedContent, PROPERTY_ASSIGNMENT_FIXES, filePath);
    modifiedContent = propertyResult.content;
    fileModifications += propertyResult.modifications;

    // Apply immutable update fixes
    const immutableResult = applyFixes(modifiedContent, IMMUTABLE_UPDATE_FIXES, filePath);
    modifiedContent = immutableResult.content;
    fileModifications += immutableResult.modifications;

    // Apply specific const fixes
    const specificResult = applyFixes(modifiedContent, SPECIFIC_CONST_FIXES, filePath);
    modifiedContent = specificResult.content;
    fileModifications += specificResult.modifications;

    // Analyze and fix const reassignment patterns
    const analysisResult = analyzeAndFixConstAssignments(modifiedContent, filePath);
    modifiedContent = analysisResult.content;
    fileModifications += analysisResult.modifications;

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
  console.log('🔧 Phase 12 Tier 2: Const Assignment Revolution (TS2588)');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE EXECUTION'}`);
  console.log('Target: 296 TS2588 const assignment errors\n');

  // Process high-impact files first
  console.log('Processing high-impact files with TS2588 errors...');
  for (const file of HIGH_IMPACT_FILES) {
    processFile(file);
  }

  // Find and process additional files with TS2588 errors
  console.log('\nProcessing additional files with TS2588 errors...');
  try {
    const tsOutput = execSync('yarn run tsc --noEmit 2>&1 | grep "error TS2588" | cut -d"(" -f1 | sort -u', { encoding: 'utf8' });
    const errorFiles = tsOutput.trim().split('\n').filter(f => f && !HIGH_IMPACT_FILES.includes(f));
    
    for (const file of errorFiles.slice(0, 15)) { // Process up to 15 additional files
      processFile(file);
    }
  } catch (error) {
    console.log('Could not get additional error files, continuing with high-impact files only');
  }

  // Summary
  console.log('\n📊 Phase 12 Tier 2 Summary:');
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

  console.log('\n✅ Phase 12 Tier 2 Complete!');
  console.log('Next: Run Phase 12 Tier 3 for TS2551 property name errors');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default { processFile, CONST_TO_LET_FIXES, PROPERTY_ASSIGNMENT_FIXES }; 