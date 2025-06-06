#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Phase 12 Batch 2: Fixing TS2304 Component Import Errors');
console.log('🎯 Target: React imports + Component interfaces + Type definitions');

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

// Track changes for reporting
const changes = [];

// File 1: Fix missing React imports in FoodRecommendations.tsx
function fixFoodRecommendationsImports() {
  const filePath = path.join(ROOT_DIR, 'src/components/FoodRecommendations.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if React imports are already present
  if (content.includes('import React') || content.includes('import { useState }')) {
    console.log(`✅ ${path.basename(filePath)}: React imports already present`);
    return;
  }

  // Find the first line to add React imports
  const lines = content.split('\n');
  let insertIndex = 0;
  
  // Find first non-comment, non-empty line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line && !line.startsWith('//') && !line.startsWith('/*')) {
      insertIndex = i;
      break;
    }
  }

  // Add React and component interface imports
  const newImports = [
    'import React, { useState, useEffect } from \'react\';',
    'import type { ElementalProperties } from \'@/types/alchemy\';',
    '',
    '// Define FoodRecommendationsProps interface',
    'interface FoodRecommendationsProps {',
    '  elementalProfile?: ElementalProperties;',
    '  onRecommendationSelect?: (recommendation: any) => void;',
    '  maxRecommendations?: number;',
    '}',
    ''
  ];

  changes.push({
    file: filePath,
    description: 'Added React imports and FoodRecommendationsProps interface',
    type: 'react-component-fix'
  });

  if (DRY_RUN) {
    console.log(`📝 Would add to ${path.basename(filePath)}:`);
    console.log(`   - React, useState, useEffect imports`);
    console.log(`   - FoodRecommendationsProps interface`);
  } else {
    lines.splice(insertIndex, 0, ...newImports);
    const newContent = lines.join('\n');
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Fixed React imports in ${path.basename(filePath)}`);
  }
}

// File 2: Fix missing IngredientMapping interface in NutritionalRecommender.tsx
function fixNutritionalRecommenderTypes() {
  const filePath = path.join(ROOT_DIR, 'src/components/FoodRecommender/NutritionalRecommender.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if IngredientMapping is already defined
  if (content.includes('interface IngredientMapping') || content.includes('type IngredientMapping')) {
    console.log(`✅ ${path.basename(filePath)}: IngredientMapping already defined`);
    return;
  }

  // Find import section to add the type definition
  const lines = content.split('\n');
  let insertIndex = 0;
  
  // Find last import line
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ')) {
      insertIndex = i + 1;
    }
  }

  // Add IngredientMapping interface
  const newTypes = [
    '',
    '// Define IngredientMapping interface for nutritional recommendations',
    'interface IngredientMapping {',
    '  ingredient: string;',
    '  nutritionalValue: number;',
    '  elementalProperties?: ElementalProperties;',
    '  seasonalAvailability?: string[];',
    '  healthBenefits?: string[];',
    '}',
    ''
  ];

  changes.push({
    file: filePath,
    description: 'Added IngredientMapping interface definition',
    type: 'interface-definition'
  });

  if (DRY_RUN) {
    console.log(`📝 Would add to ${path.basename(filePath)}:`);
    console.log(`   - IngredientMapping interface definition`);
  } else {
    lines.splice(insertIndex, 0, ...newTypes);
    const newContent = lines.join('\n');
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Fixed IngredientMapping in ${path.basename(filePath)}`);
  }
}

// File 3: Fix missing AlchemicalItem interface in CuisineRecommender.tsx
function fixCuisineRecommenderTypes() {
  const filePath = path.join(ROOT_DIR, 'src/components/recommendations/CuisineRecommender.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if AlchemicalItem is already defined
  if (content.includes('interface AlchemicalItem') || content.includes('type AlchemicalItem')) {
    console.log(`✅ ${path.basename(filePath)}: AlchemicalItem already defined`);
    return;
  }

  // Find import section to add the type definition
  const lines = content.split('\n');
  let insertIndex = 0;
  
  // Find last import line
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ')) {
      insertIndex = i + 1;
    }
  }

  // Add AlchemicalItem interface and other missing types
  const newTypes = [
    '',
    '// Define AlchemicalItem interface for cuisine recommendations',
    'interface AlchemicalItem {',
    '  id: string;',
    '  name: string;',
    '  type: \'recipe\' | \'ingredient\' | \'cuisine\';',
    '  elementalProperties: ElementalProperties;',
    '  astrologicalAffinity?: number;',
    '  seasonalRelevance?: string[];',
    '  description?: string;',
    '}',
    ''
  ];

  changes.push({
    file: filePath,
    description: 'Added AlchemicalItem interface definition',
    type: 'interface-definition'
  });

  if (DRY_RUN) {
    console.log(`📝 Would add to ${path.basename(filePath)}:`);
    console.log(`   - AlchemicalItem interface definition`);
  } else {
    lines.splice(insertIndex, 0, ...newTypes);
    const newContent = lines.join('\n');
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Fixed AlchemicalItem in ${path.basename(filePath)}`);
  }
}

// Execute all fixes
console.log('\n🔄 Processing Phase 12 Batch 2 files...\n');

try {
  fixFoodRecommendationsImports();
  fixNutritionalRecommenderTypes();
  fixCuisineRecommenderTypes();
  
  console.log('\n📊 PHASE 12 BATCH 2 SUMMARY:');
  console.log(`✅ Files processed: 3`);
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
    console.log('\n✅ PHASE 12 BATCH 2 COMPLETE');
    console.log('🔄 Next: Run "yarn build" to verify changes');
  }

} catch (error) {
  console.error('❌ Error during Phase 12 Batch 2 execution:', error);
  process.exit(1);
} 