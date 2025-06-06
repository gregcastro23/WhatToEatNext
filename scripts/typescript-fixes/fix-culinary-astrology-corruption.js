#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Fixing culinaryAstrology.ts corruption patterns');

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

const TARGET_FILE = 'src/calculations/culinaryAstrology.ts';

// Specific corruption patterns for this file
const CORRUPTION_PATTERNS = [
  // Fix malformed conditional expressions with method calls
  {
    pattern: /astroState\.\(Array\.isArray\(activePlanets\)\s*\?\s*activePlanets\.includes\([^)]+\)\s*:\s*activePlanets\s*===\s*[^)]+\)/g,
    replacement: 'astroState.activePlanets?.includes($1)',
    description: 'Fix astroState property access patterns'
  },
  
  // Fix specific malformed if conditions
  {
    pattern: /if\s*\(Array\.isArray\(\(!planetaryActivators\)\s*\?\s*\(!planetaryActivators\.includes\('Sun'\)\s*:\s*\(!planetaryActivators\s*===\s*'Sun'\)\s*&&[^{]+\)/g,
    replacement: 'if (!planetaryActivators.includes(\'Sun\') && astroState.activePlanets?.includes(\'Sun\'))',
    description: 'Fix complex if condition with Sun check'
  },

  // Fix property access with malformed ternary patterns
  {
    pattern: /recipe\?\.\astrologicalPropertiesProfile\?\.\(Array\.isArray\(rulingPlanets\?\)\s*\?\s*rulingPlanets\?\.includes\([^)]+\)\s*:\s*rulingPlanets\?\s*===\s*[^)]+\)/g,
    replacement: 'recipe?.astrologicalProfile?.rulingPlanets?.includes($1)',
    description: 'Fix recipe astrological profile access'
  },

  // Fix the specific astrologicalPropertiesProfile typo
  {
    pattern: /\.astrologicalPropertiesProfile\./g,
    replacement: '.astrologicalProfile.',
    description: 'Fix astrologicalPropertiesProfile property name'
  },

  // Fix the malformed filter expressions with Array.isArray patterns
  {
    pattern: /\(Array\.isArray\([^)]+\)\s*\?\s*[^:]+\.includes\([^)]+\)\s*:\s*[^=]+\s*===\s*[^)]+\)\s*&&\s*astroState\.\(Array\.isArray\([^)]+\)\s*\?\s*[^:]+\.includes\([^)]+\)\s*:\s*[^)]+\s*===\s*\([^)]+\)\)\s*\|\|\s*\[\]/g,
    replacement: '($1.includes($2) && astroState.activePlanets?.includes($3))',
    description: 'Fix complex filter expressions'
  },

  // Fix malformed parentheses in conditional expressions
  {
    pattern: /\(\(!([^)]+)\)\s*\?\s*\(\!([^)]+)\.includes\('([^']+)'\)\s*:\s*\(\!([^)]+)\s*===\s*'([^']+)'\)/g,
    replacement: '(!$2.includes(\'$3\'))',
    description: 'Fix malformed parentheses in conditions'
  },

  // Fix the specific case of activePlanets access
  {
    pattern: /astroState\.\(Array\.isArray\(activePlanets\)\s*\?\s*activePlanets\.includes\('([^']+)'\)\s*:\s*activePlanets\s*===\s*'([^']+)'\)/g,
    replacement: 'astroState.activePlanets?.includes(\'$1\')',
    description: 'Fix activePlanets array access'
  },

  // Fix the malformed array operations at end of lines
  {
    pattern: /\|\|\s*\[\]\)\.length/g,
    replacement: ' || []).length',
    description: 'Fix array length operations'
  },

  // Fix nested malformed ternary operators
  {
    pattern: /recipe\?\.\astrologicalPropertiesProfile\?\.\(Array\.isArray\(rulingPlanets\?\)\s*\?\s*rulingPlanets\?\.includes\('Jupiter'\)\s*:\s*rulingPlanets\?\s*===\s*'Jupiter'\)/g,
    replacement: 'recipe?.astrologicalProfile?.rulingPlanets?.includes(\'Jupiter\')',
    description: 'Fix Jupiter planet check'
  },

  // Fix Saturn similar pattern
  {
    pattern: /recipe\?\.\astrologicalPropertiesProfile\?\.\(Array\.isArray\(rulingPlanets\?\)\s*\?\s*rulingPlanets\?\.includes\('Saturn'\)\s*:\s*rulingPlanets\?\s*===\s*'Saturn'\)/g,
    replacement: 'recipe?.astrologicalProfile?.rulingPlanets?.includes(\'Saturn\')',
    description: 'Fix Saturn planet check'
  }
];

function fixFileContent(content) {
  let fixedContent = content;
  let changesApplied = [];

  // Apply specific corruption patterns
  for (const { pattern, replacement, description } of CORRUPTION_PATTERNS) {
    const beforeLength = fixedContent.length;
    fixedContent = fixedContent.replace(pattern, replacement);
    const afterLength = fixedContent.length;
    
    if (beforeLength !== afterLength) {
      changesApplied.push(description);
    }
  }

  // Manual fixes for complex patterns that need specific handling
  
  // Fix the malformed if condition on line 226
  fixedContent = fixedContent.replace(
    /if \(Array\.isArray\(\(!planetaryActivators\).*?&& astroState\.\(Array\.isArray\(activePlanets\).*?\) \{/s,
    `if (!planetaryActivators.includes('Sun') && astroState.activePlanets?.includes('Sun')) {`
  );

  // Fix the filter method in calculateRecipeAlignment 
  fixedContent = fixedContent.replace(
    /\.filter\(p => \(Array\.isArray\(traditionalPlanets\).*?\|\| \[\]\)\.length/s,
    '.filter(p => traditionalPlanets.includes(p) && astroState.activePlanets?.includes(p)).length'
  );

  // Fix the outer planet filter
  fixedContent = fixedContent.replace(
    /\.filter\(p => \(Array\.isArray\(outerPlanets\).*?\|\| \[\]\)\.length/s,
    '.filter(p => outerPlanets.includes(p) && astroState.activePlanets?.includes(p)).length'
  );

  // Fix any remaining malformed property access
  fixedContent = fixedContent.replace(
    /recipe\?\.\astrologicalPropertiesProfile\?/g,
    'recipe?.astrologicalProfile?'
  );

  if (changesApplied.length > 0) {
    changesApplied.push('Applied manual fixes for complex corruption patterns');
  }

  return { content: fixedContent, changes: changesApplied };
}

// Process the target file
const fullPath = path.join(ROOT_DIR, TARGET_FILE);

if (!fs.existsSync(fullPath)) {
  console.log(`⚠️  File not found: ${TARGET_FILE}`);
  process.exit(1);
}

try {
  const originalContent = fs.readFileSync(fullPath, 'utf8');
  const { content: fixedContent, changes } = fixFileContent(originalContent);

  if (changes.length > 0) {
    if (DRY_RUN) {
      console.log(`\n📝 Would fix ${TARGET_FILE}:`);
      changes.forEach(change => console.log(`  - ${change}`));
    } else {
      fs.writeFileSync(fullPath, fixedContent, 'utf8');
      console.log(`\n✅ Fixed ${TARGET_FILE}:`);
      changes.forEach(change => console.log(`  - ${change}`));
    }
  } else {
    console.log(`✓ No changes needed for ${TARGET_FILE}`);
  }

  console.log(`\n📊 Summary: ${changes.length} fixes applied`);

  if (DRY_RUN) {
    console.log('\n🏃 This was a dry run. Run without --dry-run to apply changes.');
  } else {
    console.log('\n✅ All fixes applied successfully!');
  }
} catch (error) {
  console.error(`❌ Error processing ${TARGET_FILE}:`, error.message);
  process.exit(1);
} 