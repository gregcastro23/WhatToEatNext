#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the project root directory
const projectRoot = path.resolve(__dirname, '../..');

console.log('🔧 Fixing remaining syntax errors...');

// Configuration
const isDryRun = process.argv.includes('--dry-run');

if (isDryRun) {
  console.log('🔍 DRY RUN MODE - No files will be modified');
}

const specificFixes = [
  {
    file: 'src/calculations/alchemicalEngine.ts',
    fix: (content) => {
      // Fix incomplete return statement - missing Fire and closing brace
      content = content.replace(
        /return \{Water: 0\.25, Air: 0\.25, Earth: 0\.25 \},\s*Spirit: 0\.25,\s*Essence: 0\.25,\s*Matter: 0\.25,\s*Substance: 0\.25,/g,
        'return {\n      Fire: 0.25,\n      Water: 0.25,\n      Air: 0.25,\n      Earth: 0.25,\n      Spirit: 0.25,\n      Essence: 0.25,\n      Matter: 0.25,\n      Substance: 0.25'
      );
      return content;
    }
  },
  {
    file: 'src/components/AstrologyChart/AstrologyChart.migrated.tsx',
    fix: (content) => {
      // Fix incomplete useMemo hook - find the specific line that's broken
      // The issue is line 85 shows elementalCalculator dependency that was removed
      content = content.replace(
        /\}, \[planetaryPositions, isDaytime, elementalCalculator\]\);/g,
        '  }, [planetaryPositions, isDaytime]);'
      );
      
      // Fix the function structure by properly closing the previous function
      // and starting the alchemicalPrinciples calculation
      content = content.replace(
        /return \{ Fire: 25, Earth: 25, Air: 25, Water: 25 \};\s*\}\s*\}, \[planetaryPositions, isDaytime\]\);\s*\/\/ Calculate alchemical principles\s*const alchemicalPrinciples = useMemo\(\(\) => \{/g,
        'return { Fire: 25, Earth: 25, Air: 25, Water: 25 };\n    }\n  }, [planetaryPositions, isDaytime]);\n\n  // Calculate alchemical principles\n  const alchemicalPrinciples = useMemo(() => {'
      );
      
      return content;
    }
  },
  {
    file: 'src/data/unified/nutritional.ts',
    fix: (content) => {
      // Fix invalid object property syntax - the semicolon after comment
      content = content.replace(
        /\/\*\*[\s\S]*?\*\/;[\s\n]*\(profiles \|\| \[\]\)\.forEach/g,
        '/**\n   * Calculate elemental totals across profiles\n   */\n  (profiles || []).forEach'
      );
      return content;
    }
  },
  {
    file: 'src/hooks/useAlchemicalRecommendations.ts',
    fix: (content) => {
      // Fix missing property type - looks like elementalBalance was partially removed
      content = content.replace(
        /dominantProperty: AlchemicalProperty;number>/g,
        'dominantProperty: AlchemicalProperty;\n    elementalProperties: Record<ElementalCharacter, number>;'
      );
      return content;
    }
  },
  {
    file: 'src/services/AlchemicalRecommendationService.ts',
    fix: (content) => {
      // Fix missing comma in function call
      content = content.replace(
        /const compatibleIngredients = this\.findCompatibleIngredients\(\s*ingredients\s*thermodynamics\s*\);/g,
        'const compatibleIngredients = this.findCompatibleIngredients(\n      ingredients,\n      thermodynamics\n    );'
      );
      return content;
    }
  }
];

function applySpecificFix(filePath, fixFunction) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${path.relative(projectRoot, filePath)}`);
      return false;
    }

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
  if (applySpecificFix(fullPath, fix)) {
    fixedFiles++;
  }
}

console.log(`\n📊 Summary: ${fixedFiles} files ${isDryRun ? 'would be' : 'were'} fixed`);

if (isDryRun) {
  console.log('\n💡 Run without --dry-run to apply fixes');
} else {
  console.log('\n✅ All syntax errors should now be resolved!');
} 