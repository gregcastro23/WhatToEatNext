#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Phase 12 Batch 1: Fixing TS2304 Module Resolution Errors');
console.log('🎯 Target: alchemicalEngine.ts (planetInfo/signInfo) + cuisineIntegrations.ts (types)');

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

// Track changes for reporting
const changes = [];

// File 1: Fix missing planetInfo and signInfo imports in alchemicalEngine.ts
function fixAlchemicalEngineImports() {
  const filePath = path.join(ROOT_DIR, 'src/calculations/alchemicalEngine.ts');
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if imports are already present
  if (content.includes('planetInfo') && content.includes('signInfo') && 
      (content.includes('from \'@/data/astrology\'') || content.includes('from \'@/calculations/core/alchemicalEngine\''))) {
    console.log(`✅ ${path.basename(filePath)}: planetInfo/signInfo imports already present`);
    return;
  }

  // Find the import section (after existing imports)
  const importRegex = /^(import[^;]+;)\s*$/gm;
  const lastImportMatch = [...content.matchAll(importRegex)].pop();
  
  if (!lastImportMatch) {
    console.log(`⚠️ ${path.basename(filePath)}: Could not find import section`);
    return;
  }

  const insertIndex = lastImportMatch.index + lastImportMatch[0].length;
  
  // Add the missing imports
  const newImports = `
// Import planetary and sign data for alchemical calculations
import { planetInfo, signInfo, signs } from '@/calculations/core/alchemicalEngine';`;

  const newContent = content.slice(0, insertIndex) + newImports + content.slice(insertIndex);

  changes.push({
    file: filePath,
    description: 'Added missing planetInfo, signInfo, and signs imports',
    type: 'import-addition'
  });

  if (DRY_RUN) {
    console.log(`📝 Would add imports to ${path.basename(filePath)}:`);
    console.log(`   - planetInfo, signInfo, signs from '@/calculations/core/alchemicalEngine'`);
  } else {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Fixed imports in ${path.basename(filePath)}`);
  }
}

// File 2: Fix missing type imports in cuisineIntegrations.ts
function fixCuisineIntegrationsTypes() {
  const filePath = path.join(ROOT_DIR, 'src/data/unified/cuisineIntegrations.ts');
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if types are already imported
  if (content.includes('UnifiedIngredient') && content.includes('EnhancedCookingMethod') && 
      content.includes('from ')) {
    console.log(`✅ ${path.basename(filePath)}: Types might already be imported`);
  }

  // Look for the file start to add proper imports
  const lines = content.split('\n');
  const importLines = [];
  let firstNonImportIndex = 0;

  // Find existing imports and first non-import line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('import ') || line.startsWith('//') || line === '') {
      if (line.startsWith('import ')) {
        importLines.push(i);
      }
    } else {
      firstNonImportIndex = i;
      break;
    }
  }

  // Add the missing type imports
  const newImportLines = [
    '// Import unified types for cuisine integrations',
    'import type { UnifiedIngredient } from \'@/types/unified\';',
    'import type { EnhancedCookingMethod } from \'@/types/cooking\';',
    ''
  ];

  changes.push({
    file: filePath,
    description: 'Added missing UnifiedIngredient and EnhancedCookingMethod type imports',
    type: 'type-import-addition'
  });

  if (DRY_RUN) {
    console.log(`📝 Would add type imports to ${path.basename(filePath)}:`);
    console.log(`   - UnifiedIngredient from '@/types/unified'`);
    console.log(`   - EnhancedCookingMethod from '@/types/cooking'`);
  } else {
    // Insert the new imports at the beginning or after existing imports
    const insertIndex = firstNonImportIndex;
    lines.splice(insertIndex, 0, ...newImportLines);
    
    const newContent = lines.join('\n');
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Fixed type imports in ${path.basename(filePath)}`);
  }
}

// File 3: Create/fix RecipeFinder service module issues
function fixRecipeFinderModules() {
  const filePath = path.join(ROOT_DIR, 'src/services/RecipeFinder.ts');
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ ${path.basename(filePath)}: File not found, skipping for this batch`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  
  // Analyze the content to identify missing imports
  const missingImports = [];
  
  // Common patterns that might be missing
  const commonMissingPatterns = [
    { pattern: /Recipe(?!Finder)/g, import: 'type { Recipe } from \'@/types/recipe\';' },
    { pattern: /Ingredient(?!Service)/g, import: 'type { Ingredient } from \'@/types/ingredient\';' },
    { pattern: /ElementalProperties/g, import: 'type { ElementalProperties } from \'@/types/alchemy\';' }
  ];

  let hasChanges = false;
  
  for (const { pattern, import: importStatement } of commonMissingPatterns) {
    if (pattern.test(content) && !content.includes(importStatement)) {
      missingImports.push(importStatement);
      hasChanges = true;
    }
  }

  if (!hasChanges) {
    console.log(`✅ ${path.basename(filePath)}: No obvious import issues detected`);
    return;
  }

  changes.push({
    file: filePath,
    description: `Added missing imports: ${missingImports.join(', ')}`,
    type: 'import-analysis-fix'
  });

  if (DRY_RUN) {
    console.log(`📝 Would add imports to ${path.basename(filePath)}:`);
    missingImports.forEach(imp => console.log(`   - ${imp}`));
  } else {
    // Add imports at the top of the file
    const importSection = missingImports.join('\n') + '\n\n';
    const newContent = importSection + content;
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Fixed imports in ${path.basename(filePath)}`);
  }
}

// Execute all fixes
console.log('\n🔄 Processing Phase 12 Batch 1 files...\n');

try {
  fixAlchemicalEngineImports();
  fixCuisineIntegrationsTypes();
  fixRecipeFinderModules();
  
  console.log('\n📊 PHASE 12 BATCH 1 SUMMARY:');
  console.log(`✅ Files processed: ${Math.min(3, changes.length + 1)}`);
  console.log(`🔧 Changes planned: ${changes.length}`);
  
  if (changes.length > 0) {
    console.log('\n📋 Changes by type:');
    const changeTypes = changes.reduce((acc, change) => {
      acc[change.type] = (acc[change.type] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(changeTypes).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} files`);
    });
  }
  
  if (DRY_RUN) {
    console.log('\n🏃 DRY RUN COMPLETE - Run without --dry-run to apply changes');
  } else {
    console.log('\n✅ PHASE 12 BATCH 1 COMPLETE');
    console.log('🔄 Next: Run "yarn build" to verify changes');
  }

} catch (error) {
  console.error('❌ Error during Phase 12 Batch 1 execution:', error);
  process.exit(1);
} 