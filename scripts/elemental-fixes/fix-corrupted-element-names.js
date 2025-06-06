#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Fixing corrupted element names caused by previous script');
console.log('🎯 Restoring proper element names: Fire, Water, Earth, Air');

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

// Patterns to fix corrupted element names
const CORRUPTION_FIXES = [
  // Fix duplicated element names
  { pattern: /Fire/g, replacement: 'Fire', description: 'Fix Fire -> fire' },
  { pattern: /Water/g, replacement: 'Water', description: 'Fix Water -> water' },
  { pattern: /Earth/g, replacement: 'Earth', description: 'Fix Earth -> earth' },
  { pattern: /Air/g, replacement: 'Air', description: 'Fix Air -> Air' },
  
  // Fix duplicated planet names
  { pattern: /Sunsun/g, replacement: 'Sun', description: 'Fix Sunsun -> sun' },
  { pattern: /Moonmoon/g, replacement: 'Moon', description: 'Fix Moonmoon -> moon' },
  { pattern: /Marsmars/g, replacement: 'Mars', description: 'Fix Marsmars -> mars' },
  { pattern: /Venusvenus/g, replacement: 'Venus', description: 'Fix Venusvenus -> venus' },
  { pattern: /Mercurymercury/g, replacement: 'Mercury', description: 'Fix Mercurymercury -> mercury' },
  { pattern: /Jupiterjupiter/g, replacement: 'Jupiter', description: 'Fix Jupiterjupiter -> jupiter' },
  { pattern: /Saturnsaturn/g, replacement: 'Saturn', description: 'Fix Saturnsaturn -> saturn' },
  { pattern: /Uranusuranus/g, replacement: 'Uranus', description: 'Fix Uranusuranus -> uranus' },
  { pattern: /Neptuneneptune/g, replacement: 'Neptune', description: 'Fix Neptuneneptune -> neptune' },
  { pattern: /Plutopluto/g, replacement: 'Pluto', description: 'Fix Plutopluto -> pluto' },
  
  // Fix unterminated strings
  { pattern: /'Fire',/g, replacement: "'Fire',", description: 'Fix unterminated Fire string' },
  { pattern: /'Water',/g, replacement: "'Water',", description: 'Fix unterminated Water string' },
  { pattern: /'Earth',/g, replacement: "'Earth',", description: 'Fix unterminated Earth string' },
  { pattern: /'Water'\s+\/\//g, replacement: "'Water',      //", description: 'Fix unterminated Water with comment' },
  
  // Fix case statements
  { pattern: /case 'Fire':/g, replacement: "case 'Fire':", description: 'Fix case Fire' },
  { pattern: /case 'Water':/g, replacement: "case 'Water':", description: 'Fix case Water' },
  { pattern: /case 'Earth':/g, replacement: "case 'Earth':", description: 'Fix case Earth' },
  
  // Fix conditional statements
  { pattern: /element === 'Fire'/g, replacement: "element === 'Fire'", description: 'Fix conditional Fire' },
  { pattern: /element === 'Water'/g, replacement: "element === 'Water'", description: 'Fix conditional Water' },
  { pattern: /element === 'Earth'/g, replacement: "element === 'Earth'", description: 'Fix conditional Earth' },
  { pattern: /element === 'Air'/g, replacement: "element === 'Air'", description: 'Fix conditional Air' },
  
  // Fix corrupted import statements
  { pattern: /25194Airimport/g, replacement: 'Air;\nimport', description: 'Fix corrupted import statement' }
];

async function findFilesToFix() {
  const patterns = [
    'src/**/*.ts',
    'src/**/*.tsx',
    'src/**/*.js',
    'src/**/*.jsx'
  ];
  
  const files = [];
  for (const pattern of patterns) {
    const matches = await glob(pattern, { cwd: ROOT_DIR });
    files.push(...matches);
  }
  
  return [...new Set(files)]; // Remove duplicates
}

function fixFileContent(content, filePath) {
  let fixedContent = content;
  let changesApplied = [];

  // Apply corruption fixes
  for (const { pattern, replacement, description } of CORRUPTION_FIXES) {
    const beforeLength = fixedContent.length;
    fixedContent = fixedContent.replace(pattern, replacement);
    const afterLength = fixedContent.length;
    
    if (beforeLength !== afterLength) {
      changesApplied.push(description);
    }
  }

  return { content: fixedContent, changes: changesApplied };
}

// Main execution
async function main() {
  const filesToProcess = await findFilesToFix();
  let totalFilesProcessed = 0;
  let totalChangesApplied = 0;

  for (const filePath of filesToProcess) {
    const fullPath = path.join(ROOT_DIR, filePath);
    
    if (!fs.existsSync(fullPath)) {
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
      }
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`  Files processed: ${totalFilesProcessed}`);
  console.log(`  Total changes applied: ${totalChangesApplied}`);

  if (DRY_RUN) {
    console.log('\n🏃 This was a dry run. Run without --dry-run to apply changes.');
  } else {
    console.log('\n✅ All corrupted element names fixed successfully!');
    console.log('\n📋 Next steps:');
    console.log('  1. Run yarn build to verify the fixes');
    console.log('  2. Check for any remaining syntax errors');
  }
}

main().catch(console.error); 