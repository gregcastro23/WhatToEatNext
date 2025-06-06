#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the project root directory
const projectRoot = path.resolve(__dirname, '../..');

console.log('🔧 Fixing syntax errors from elementalBalance removal...');

// Configuration
const isDryRun = process.argv.includes('--dry-run');

if (isDryRun) {
  console.log('🔍 DRY RUN MODE - No files will be modified');
}

const specificFixes = [
  {
    file: 'src/calculations/alchemicalCalculations.ts',
    fix: (content) => {
      // Fix missing comma before dominantElement
      content = content.replace(
        /Substance: Substance\s*dominantElement,/g,
        'Substance: Substance,\n    dominantElement,'
      );
      return content;
    }
  },
  {
    file: 'src/calculations/alchemicalEngine.ts',
    fix: (content) => {
      // Fix incomplete object structure
      content = content.replace(
        /return \{Earth: 0\.25, Air: 0\.25, Water: 0\.25\s*\},\s*Spirit: 0\.25,/g,
        'return {\n      Fire: 0.25,\n      Earth: 0.25,\n      Air: 0.25,\n      Water: 0.25,\n      Spirit: 0.25,'
      );
      return content;
    }
  },
  {
    file: 'src/components/AlchmKitchen.tsx',
    fix: (content) => {
      // Remove references to elementalBalance that weren't caught
      content = content.replace(
        /<div>Air: \{elementalBalance\.Air\}%<\/div>/g,
        '// Elemental display removed - using individual element properties instead'
      );
      return content;
    }
  },
  {
    file: 'src/components/AstrologyChart/AstrologyChart.migrated.tsx',
    fix: (content) => {
      // Fix incomplete variable declaration
      content = content.replace(
        /\}, \[planetaryPositions, isDaytime, elementalCalculator\]\);[\s\n]*const alchemicalPrinciples = useMemo\(\(\) => \{/g,
        '  }, [planetaryPositions, isDaytime]);\n\n  // Calculate alchemical principles\n  const alchemicalPrinciples = useMemo(() => {'
      );
      
      // Remove references to elementalBalance in the JSX
      content = content.replace(
        /\{Object\.entries\(elementalBalance\)\.map\(\(\[element, percentage\]\) =>/g,
        '{Object.entries({ Fire: 25, Water: 25, Earth: 25, Air: 25 }).map(([element, percentage]) =>'
      );
      
      return content;
    }
  },
  {
    file: 'src/data/unified/nutritional.ts',
    fix: (content) => {
      // Fix missing comma in function call
      content = content.replace(
        /kalchmHarmony\s*seasonalAlignment,/g,
        'kalchmHarmony,\n      seasonalAlignment,'
      );
      return content;
    }
  }
];

function applySpecificFix(filePath, fixFunction) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const newContent = fixFunction(content);
    
    if (content !== newContent) {
      if (!isDryRun) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Fixed: ${path.relative(projectRoot, filePath)}`);
      } else {
        console.log(`🔍 Would fix: ${path.relative(projectRoot, filePath)}`);
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

let fixedFiles = 0;

for (const { file, fix } of specificFixes) {
  const fullPath = path.join(projectRoot, file);
  if (fs.existsSync(fullPath)) {
    if (applySpecificFix(fullPath, fix)) {
      fixedFiles++;
    }
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
}

console.log(`\n📊 Summary: ${fixedFiles} files ${isDryRun ? 'would be' : 'were'} fixed`);

if (isDryRun) {
  console.log('\n💡 Run without --dry-run to apply fixes');
} else {
  console.log('\n✅ Syntax error fixes completed!');
} 