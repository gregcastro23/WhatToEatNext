#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🚀 Phase 13 Batch 1: Fixing TS2322 Interface Assignment Mismatches');
console.log('Target files: PlanetaryHourCalculator.ts, chakra.ts, alchemicalEngine.ts');

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

let totalChanges = 0;

// File 1: src/lib/PlanetaryHourCalculator.ts - Fix interface assignments
function fixPlanetaryHourCalculator() {
  const filePath = path.join(ROOT_DIR, 'src/lib/PlanetaryHourCalculator.ts');
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Fix type assignments for planetary hour calculations
  content = content.replace(
    /planetaryHour:\s*number\s*=\s*(\w+)/g,
    'planetaryHour: number = Number($1)'
  );
  
  // Fix date assignment issues
  content = content.replace(
    /date:\s*Date\s*=\s*new\s+Date\(([^)]+)\)/g,
    'date: Date = new Date($1 as string | number | Date)'
  );
  
  // Fix hour calculation type assignments
  content = content.replace(
    /hour:\s*number\s*=\s*Math\.floor\(([^)]+)\)/g,
    'hour: number = Math.floor(Number($1))'
  );
  
  // Fix planet assignment type mismatches
  content = content.replace(
    /planet:\s*string\s*=\s*planets\[([^\]]+)\]/g,
    'planet: string = String(planets[$1] || "")'
  );
  
  if (content !== originalContent) {
    totalChanges++;
    if (DRY_RUN) {
      console.log(`✅ Would fix: ${filePath}`);
      console.log('  - Planetary hour number assignments');
      console.log('  - Date constructor type safety');
      console.log('  - Hour calculation type conversions');
      console.log('  - Planet string assignments');
    } else {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
    }
  }
}

// File 2: src/types/chakra.ts - Fix ChakraEnergies type definitions
function fixChakraTypes() {
  const filePath = path.join(ROOT_DIR, 'src/types/chakra.ts');
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Ensure ChakraEnergies interface is properly defined
  if (!content.includes('export interface ChakraEnergies')) {
    content += `
export interface ChakraEnergies {
  root: number;
  sacral: number;
  solarPlexus: number;
  heart: number;
  throat: number;
  thirdEye: number;
  crown: number;
  brow: number;
}
`;
  }
  
  // Fix chakra energy assignments
  content = content.replace(
    /(\w+):\s*number\s*=\s*([^,\n]+)/g,
    '$1: number = Number($2) || 0'
  );
  
  // Add type assertions for chakra objects
  content = content.replace(
    /const\s+(\w+)\s*=\s*{\s*([^}]+)\s*}/g,
    'const $1: ChakraEnergies = {\n  $2\n}'
  );
  
  if (content !== originalContent) {
    totalChanges++;
    if (DRY_RUN) {
      console.log(`✅ Would fix: ${filePath}`);
      console.log('  - ChakraEnergies interface definition');
      console.log('  - Chakra energy number assignments');
      console.log('  - Type assertions for chakra objects');
    } else {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
    }
  }
}

// File 3: src/calculations/alchemicalEngine.ts - Fix StandardizedAlchemicalResult assignments
function fixAlchemicalEngine() {
  const filePath = path.join(ROOT_DIR, 'src/calculations/alchemicalEngine.ts');
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Fix StandardizedAlchemicalResult assignments
  content = content.replace(
    /return\s*{\s*sunSign:\s*([^,]+),\s*dominantElement:\s*([^,]+),\s*elementalBalance:\s*([^,]+),/g,
    'return {\n    sunSign: String($1),\n    dominantElement: String($2),\n    elementalBalance: $3 as ElementalProperties,'
  );
  
  // Fix ChakraEnergies assignments
  content = content.replace(
    /{\s*root:\s*([^,]+),\s*sacral:\s*([^,]+),\s*solarPlexus:\s*([^,]+),\s*heart:\s*([^,]+),\s*throat:\s*([^,]+),\s*thirdEye:\s*([^,]+),\s*crown:\s*([^,]+),\s*brow:\s*([^,}]+)\s*}/g,
    '{\n      root: Number($1) || 0,\n      sacral: Number($2) || 0,\n      solarPlexus: Number($3) || 0,\n      heart: Number($4) || 0,\n      throat: Number($5) || 0,\n      thirdEye: Number($6) || 0,\n      crown: Number($7) || 0,\n      brow: Number($8) || 0\n    } as ChakraEnergies'
  );
  
  // Fix Element type assignments
  content = content.replace(
    /dominantElement:\s*keyof\s+ElementalProperties/g,
    'dominantElement: Element'
  );
  
  // Fix Season type assignments  
  content = content.replace(
    /:\s*"fall"/g,
    ': "autumn" as Season'
  );
  
  if (content !== originalContent) {
    totalChanges++;
    if (DRY_RUN) {
      console.log(`✅ Would fix: ${filePath}`);
      console.log('  - StandardizedAlchemicalResult assignments');
      console.log('  - ChakraEnergies type casting');
      console.log('  - Element type assignments');
      console.log('  - Season type corrections');
    } else {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
    }
  }
}

// Execute fixes
try {
  fixPlanetaryHourCalculator();
  fixChakraTypes();
  fixAlchemicalEngine();
  
  if (DRY_RUN) {
    console.log(`\n📊 Summary: Would fix ${totalChanges} files`);
    console.log('🔄 Run without --dry-run to apply changes');
  } else {
    console.log(`\n✅ Phase 13 Batch 1 Complete: Fixed ${totalChanges} files`);
    console.log('🔄 Next: Run yarn build to verify changes');
  }
} catch (error) {
  console.error('❌ Error during Phase 13 Batch 1:', error);
  process.exit(1);
} 