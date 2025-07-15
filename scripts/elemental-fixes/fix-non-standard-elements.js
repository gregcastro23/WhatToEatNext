#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Removing non-standard elements (metal, wood, void) from codebase');
console.log('🎯 Enforcing 4-element system: Fire, Water, Earth, Air');

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

// Files that need to be processed
const TARGET_FILES = [
  'src/types/elements.ts',
  'src/calculations/elementalcalculations.ts'
];

// Patterns to fix non-standard elements
const ELEMENT_FIXES = [
  // Remove metal, wood, void from ElementType definition
  {
    pattern: /export type ElementType = \s*\|\s*'Fire'\s*\|\s*'Water'\s*\|\s*'Air'\s*\|\s*'Earth'\s*\|\s*'metal'\s*\|\s*'wood'\s*\|\s*'void';/gs,
    replacement: `export type ElementType = 
  | 'Fire' 
  | 'Water' 
  | 'Air' 
  | 'Earth';`,
    description: 'Remove non-standard elements from ElementType definition'
  },
  
  // Remove metal, wood, void from element influencers
  {
    pattern: /metal:\s*\[[^\]]+\],?\s*wood:\s*\[[^\]]+\],?\s*void:\s*\[[^\]]+\],?\s*/g,
    replacement: '',
    description: 'Remove metal, wood, void from elementInfluencers'
  },
  
  // Remove metal, wood, void from energy values initialization
  {
    pattern: /metal:\s*0,?\s*wood:\s*0,?\s*void:\s*0,?\s*/g,
    replacement: '',
    description: 'Remove metal, wood, void from energy values'
  },
  
  // Clean up trailing commas and formatting
  {
    pattern: /,\s*}\s*;/g,
    replacement: '\n  };',
    description: 'Clean up object formatting'
  }
];

function fixFileContent(content, filePath) {
  let fixedContent = content;
  let changesApplied = [];

  // Apply element fixes
  for (const { pattern, replacement, description } of ELEMENT_FIXES) {
    const beforeLength = fixedContent.length;
    fixedContent = fixedContent.replace(pattern, replacement);
    const afterLength = fixedContent.length;
    
    if (beforeLength !== afterLength) {
      changesApplied.push(description);
    }
  }

  // Special handling for elements.ts
  if (filePath.includes('elements.ts')) {
    // Ensure clean ElementType definition
    fixedContent = fixedContent.replace(
      /export type ElementType = [\s\S]*?;/,
      `export type ElementType = 
  | 'Fire' 
  | 'Water' 
  | 'Air' 
  | 'Earth';`
    );
    
    if (!changesApplied.includes('Fixed ElementType definition')) {
      changesApplied.push('Fixed ElementType definition');
    }
  }

  // Special handling for elementalcalculations.ts
  if (filePath.includes('elementalcalculations.ts')) {
    // Fix the elementInfluencers object to only include standard elements
    fixedContent = fixedContent.replace(
      /const elementInfluencers: Record<ElementType, string\[\]> = \{[\s\S]*?\};/,
      `const elementInfluencers: Record<ElementType, string[]> = { 
    Fire: ['Sunsun', 'Marsmars', 'Jupiterjupiter'],
    Water: ['Moonmoon', 'Venusvenus', 'Neptuneneptune'],
    Earth: ['Venusvenus', 'Saturnsaturn', 'Plutopluto'],
    Air: ['Mercurymercury', 'Uranusuranus', 'Jupiterjupiter']
  };`
    );
    
    // Fix the energyValues initialization
    fixedContent = fixedContent.replace(
      /const energyValues: Record<ElementType, number> = \{[\s\S]*?\};/,
      `const energyValues: Record<ElementType, number> = { 
    Fire: 0, 
    Water: 0, 
    Earth: 0, 
    Air: 0
  };`
    );
    
    // Fix the default elemental energies function
    fixedContent = fixedContent.replace(
      /function getDefaultElementalEnergies\(\): ElementalEnergy\[\] \{[\s\S]*?\]/,
      `function getDefaultElementalEnergies(): ElementalEnergy[] {
  return [
    { type: 'Fire', strength: 0.25, influence: [] },
    { type: 'Water', strength: 0.25, influence: [] },
    { type: 'Earth', strength: 0.25, influence: [] },
    { type: 'Air', strength: 0.25, influence: [] },
  ];`
    );
    
    changesApplied.push('Fixed elementalcalculations.ts to use only 4 standard elements');
  }

  return { content: fixedContent, changes: changesApplied };
}

// Process each target file
let totalFilesProcessed = 0;
let totalChangesApplied = 0;

for (const filePath of TARGET_FILES) {
  const fullPath = path.join(ROOT_DIR, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    continue;
  }

  try {
    const originalContent = fs.readFileSync(fullPath, 'utf8');
    const { content: fixedContent, changes } = fixFileContent(originalContent, filePath);

    if (changes.length > 0) {
      totalFilesProcessed++;
      totalChangesApplied += changes.length;

      if (DRY_RUN) {
        console.log(`\n📝 Would fix ${filePath}:`);
        changes.forEach(change => console.log(`  - ${change}`));
      } else {
        fs.writeFileSync(fullPath, fixedContent, 'utf8');
        console.log(`\n✅ Fixed ${filePath}:`);
        changes.forEach(change => console.log(`  - ${change}`));
      }
    } else {
      console.log(`✓ No changes needed for ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

console.log(`\n📊 Summary:`);
console.log(`  Files processed: ${totalFilesProcessed}`);
console.log(`  Total changes applied: ${totalChangesApplied}`);
console.log(`\n🎯 Ensured only 4 standard elements: Fire, Water, Earth, Air`);

if (DRY_RUN) {
  console.log('\n🏃 This was a dry run. Run without --dry-run to apply changes.');
} else {
  console.log('\n✅ All non-standard elements removed successfully!');
  console.log('\n📋 Next steps:');
  console.log('  1. Run yarn build to verify the changes');
  console.log('  2. Check for any remaining references to metal/wood/void');
  console.log('  3. Update any tests or documentation that may reference the removed elements');
} 