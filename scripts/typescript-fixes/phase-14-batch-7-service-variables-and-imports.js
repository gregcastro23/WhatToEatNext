#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Phase 14 Batch 7 - Fix Service Variables and Imports');
console.log('='.repeat(60));

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

const fixes = [
  {
    file: 'src/services/ServicesManager.ts',
    description: 'Add missing service imports',
    changes: [
      {
        type: 'add_import',
        after: 'import { PlanetaryPosition } from "@/types/celestial";',
        content: `import alchemicalEngine from '@/calculations/core/alchemicalEngine';
import { astrologyService } from '@/services/AstrologyService';
import { unifiedIngredientService } from '@/services/UnifiedIngredientService';
import { unifiedRecipeService } from '@/services/UnifiedRecipeService';
import { unifiedRecommendationService } from '@/services/UnifiedRecommendationService';`
      }
    ]
  },
  {
    file: 'src/utils/cookingMethodRecommender.ts',
    description: 'Fix variable scope issues - replace undefined variables',
    changes: [
      {
        type: 'replace',
        search: 'if ((method as any)?.preferences?.seasonalPreference || false && (method as any)?.(preferences?.seasonalPreference || false as any)?.includes?.(season)) {',
        replace: 'if ((method as any)?.preferences?.seasonalPreference && (method as any)?.preferences?.seasonalPreference?.includes?.(season)) {'
      },
      {
        type: 'replace',
        search: 'const methodDescLower = (method as any)?.(description as any)?.toLowerCase?.();',
        replace: 'const methodDescLower = (method as any)?.description?.toLowerCase?.();'
      },
      {
        type: 'replace',
        search: '(methodDescLower as any)?.includes?.(',
        replace: '(methodDescLower as any)?.includes?.('
      }
    ]
  },
  {
    file: 'src/services/RecommendationAdapter.ts',
    description: 'Add missing alchemize import',
    changes: [
      {
        type: 'add_import',
        after: 'import { logger } from \'@/utils/logger\';',
        content: `import { alchemize } from '@/calculations/core/alchemicalCalculations';
import { planetInfo } from '@/data/planets/planetaryInfo';
import { transformIngredients, transformCookingMethods, transformCuisines } from '@/utils/elementalUtils';`
      }
    ]
  },
  {
    file: 'src/services/adapters/LegacyRecommendationAdapter.ts',
    description: 'Add missing UnifiedIngredient and CookingMethod imports',
    changes: [
      {
        type: 'add_import',
        after: 'import { PlanetaryAlignment } from "@/types/celestial";',
        content: `import { UnifiedIngredient } from '@/types/ingredient';
import { CookingMethod } from '@/types/cooking';`
      }
    ]
  }
];

function readFileContent(filePath) {
  const fullPath = path.join(ROOT_DIR, filePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }
  return fs.readFileSync(fullPath, 'utf8');
}

function writeFileContent(filePath, content) {
  const fullPath = path.join(ROOT_DIR, filePath);
  if (DRY_RUN) {
    console.log(`  Would write to: ${filePath}`);
    return;
  }
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`  ✅ Fixed: ${filePath}`);
}

function processFile(fix) {
  console.log(`\n📁 Processing: ${fix.file}`);
  console.log(`   ${fix.description}`);
  
  try {
    let content = readFileContent(fix.file);
    let modified = false;
    
    for (const change of fix.changes) {
      if (change.type === 'add_import') {
        // Find the line after which to add the import
        const lines = content.split('\n');
        const afterIndex = lines.findIndex(line => line.includes(change.after));
        
        if (afterIndex !== -1) {
          lines.splice(afterIndex + 1, 0, change.content);
          content = lines.join('\n');
          modified = true;
          console.log(`    ✅ Added import after: ${change.after}`);
        } else {
          console.log(`    ⚠️  Could not find reference line: ${change.after}`);
        }
      } else if (change.type === 'replace') {
        if (content.includes(change.search)) {
          content = content.replace(change.search, change.replace);
          modified = true;
          console.log(`    ✅ Replaced: ${change.search.substring(0, 50)}...`);
        } else {
          console.log(`    ⚠️  Could not find text to replace: ${change.search.substring(0, 50)}...`);
        }
      }
    }
    
    if (modified) {
      writeFileContent(fix.file, content);
    } else {
      console.log(`    ℹ️  No changes needed`);
    }
    
  } catch (error) {
    console.error(`  ❌ Error processing ${fix.file}:`, error.message);
  }
}

// Process all fixes
console.log('\nProcessing files...\n');

for (const fix of fixes) {
  processFile(fix);
}

console.log('\n' + '='.repeat(60));
console.log('✅ Phase 14 Batch 7 - Service Variables and Imports Fix Complete');

if (DRY_RUN) {
  console.log('\n🔄 To apply these changes, run:');
  console.log('node scripts/typescript-fixes/phase-14-batch-7-service-variables-and-imports.js');
} 