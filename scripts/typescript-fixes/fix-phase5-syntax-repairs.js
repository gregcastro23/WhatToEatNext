#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');

console.log('🔧 Phase 5 Syntax Repairs');
console.log('Fixing syntax errors introduced by Phase 5 import conflict resolution');

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

// Files to repair with their specific fixes
const SYNTAX_REPAIRS = [
  {
    file: 'src/context/AstrologicalContext.tsx',
    fixes: [
      {
        pattern: /import { AstrologicalState } from '@\/types\/celestial';\n\| null;/g,
        replacement: `import { AstrologicalState } from '@/types/celestial';

interface AstrologicalContextType {
  chakraEnergies: ChakraEnergies | null;
  planetaryPositions: Record<string, any>`
      }
    ]
  },
  {
    file: 'src/services/AstrologicalService.ts',
    fixes: [
      {
        pattern: /\/\*\*\n \* Complete astrological state information\n \*\/\n;/g,
        replacement: `/**
 * Complete astrological state information
 */
interface ServiceAstrologicalState {
  // Planetary positions and sign information
  sign: string;
  lunarPhase: LunarPhase`
      }
    ]
  },
  {
    file: 'src/utils/alchemicalCalculations.ts',
    fixes: [
      {
        pattern: /\/\/ Define PlanetaryPositionsType if we can't import it\n;\n}/g,
        replacement: `// Define PlanetaryPositionsType if we can't import it
type PlanetaryPositionsType = Record<string, PlanetaryPosition>`
      }
    ]
  }
];

// Function to read file content
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.warn(`Warning: Could not read ${filePath}:`, error.message);
    return null;
  }
}

// Function to write file content
function writeFile(filePath, content) {
  if (DRY_RUN) {
    console.log(`Would repair: ${filePath}`);
    return;
  }
  
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Repaired: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error writing ${filePath}:`, error.message);
  }
}

// Main repair function
async function repairSyntaxErrors() {
  console.log('\n📋 Repairing syntax errors...');
  
  let repairedCount = 0;
  
  for (const repair of SYNTAX_REPAIRS) {
    const fullPath = path.join(ROOT_DIR, repair.file);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${repair.file}`);
      continue;
    }
    
    const content = readFile(fullPath);
    if (!content) continue;
    
    let newContent = content;
    let wasRepaired = false;
    
    for (const fix of repair.fixes) {
      const updated = newContent.replace(fix.pattern, fix.replacement);
      if (updated !== newContent) {
        wasRepaired = true;
        newContent = updated;
        console.log(`🔧 Applied fix to: ${repair.file}`);
      }
    }
    
    if (wasRepaired) {
      writeFile(fullPath, newContent);
      repairedCount++;
    }
  }
  
  console.log(`\n✅ Repaired ${repairedCount} files`);
  return repairedCount;
}

// Main execution
async function main() {
  console.log('🚀 Starting Phase 5 Syntax Repairs');
  
  const startTime = Date.now();
  
  try {
    const repairedCount = await repairSyntaxErrors();
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log('\n🎉 Phase 5 Syntax Repairs Completed!');
    console.log(`📊 Total repairs applied: ${repairedCount}`);
    console.log(`⏱️  Duration: ${duration.toFixed(2)}s`);
    
    if (!DRY_RUN) {
      console.log('\n🔍 Next steps:');
      console.log('1. Run: yarn build');
      console.log('2. Check if syntax errors are resolved');
    }
    
  } catch (error) {
    console.error('❌ Error during syntax repairs:', error);
    process.exit(1);
  }
}

main(); 