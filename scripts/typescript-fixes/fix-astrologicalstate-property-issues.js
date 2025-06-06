#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Fixing AstrologicalState Property Issues');

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

// Common property name fixes for AstrologicalState interface
const ASTROLOGICALSTATE_FIXES = [
  // Fix .sign property to use correct property names
  {
    pattern: /astroState\.sign/g,
    replacement: 'astroState.sunSign'
  },
  
  // Fix .currentZodiacSign to ensure consistency
  {
    pattern: /astroState\.currentZodiac([^S])/g,
    replacement: 'astroState.currentZodiacSign$1'
  },

  // Fix missing timeFactors property access
  {
    pattern: /timeFactors\.currentSeason/g,
    replacement: 'timeFactors.season'
  },

  // Fix recipe property access patterns
  {
    pattern: /recipe\.currentSeason/g,
    replacement: 'recipe.season'
  },

  // Fix missing function implementations
  {
    pattern: /function getTimeFactors\(\): TimeFactors {$/gm,
    replacement: 'function getTimeFactors(): TimeFactors {'
  },

  // Fix malformed type definitions
  {
    pattern: /type Season = 'spring' \| 'summer' \| 'autumn' \| 'winter';\s*$/gm,
    replacement: ''
  },

  // Fix duplicate type declarations
  {
    pattern: /import { AstrologicalState } from "@\/types\/celestial";\s*type Season = /g,
    replacement: 'import { AstrologicalState } from "@/types/celestial";\n\ntype Season = '
  }
];

// Additional specific fixes for known problem areas
const SPECIFIC_FIXES = [
  // Fix enhancedCuisineRecommender.ts issues
  {
    pattern: /astroState\.sign\?\.toLowerCase\(\)/g,
    replacement: 'astroState.sunSign?.toLowerCase()'
  },

  // Fix zodiac element mapping
  {
    pattern: /elementMap\[astroState\.sign as ZodiacSign\]/g,
    replacement: 'elementMap[astroState.sunSign as ZodiacSign]'
  },

  // Fix missing return in getTimeFactors
  {
    pattern: /(\s+return\s+{\s+season[^}]+},?\s+)/g,
    replacement: (match) => {
      if (!match.includes('weekDay') && !match.includes('mealType')) {
        return match.replace('}', ',\n    weekDay: weekDays[dayOfWeek],\n    mealType,\n    isDaytime: hour >= 6 && hour < 18\n  }');
      }
      return match;
    }
  }
];

function applyFixes(filePath, content) {
  let fixedContent = content;
  let changesCount = 0;

  // Apply AstrologicalState fixes
  ASTROLOGICALSTATE_FIXES.forEach((fix, index) => {
    const before = fixedContent;
    if (typeof fix.replacement === 'function') {
      fixedContent = fixedContent.replace(fix.pattern, fix.replacement);
    } else {
      fixedContent = fixedContent.replace(fix.pattern, fix.replacement);
    }
    if (before !== fixedContent) {
      changesCount++;
      console.log(`  Applied AstrologicalState fix ${index + 1}`);
    }
  });

  // Apply specific fixes
  SPECIFIC_FIXES.forEach((fix, index) => {
    const before = fixedContent;
    if (typeof fix.replacement === 'function') {
      fixedContent = fixedContent.replace(fix.pattern, fix.replacement);
    } else {
      fixedContent = fixedContent.replace(fix.pattern, fix.replacement);
    }
    if (before !== fixedContent) {
      changesCount++;
      console.log(`  Applied specific fix ${index + 1}`);
    }
  });

  return { content: fixedContent, changes: changesCount };
}

// Find all TypeScript and JavaScript files in utils and calculations directories
function findTargetFiles() {
  const targetDirs = [
    'src/utils',
    'src/calculations', 
    'src/components',
    'src/services'
  ];
  
  const files = [];
  
  for (const dir of targetDirs) {
    const fullDir = path.join(ROOT_DIR, dir);
    if (fs.existsSync(fullDir)) {
      const findFiles = (directory) => {
        const items = fs.readdirSync(directory);
        for (const item of items) {
          const fullPath = path.join(directory, item);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            findFiles(fullPath);
          } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
            files.push(fullPath);
          }
        }
      };
      findFiles(fullDir);
    }
  }
  
  return files;
}

// Process all target files
let totalFiles = 0;
let totalChanges = 0;

const targetFiles = findTargetFiles();
console.log(`Found ${targetFiles.length} TypeScript files to check`);

for (const filePath of targetFiles) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip files that don't contain AstrologicalState references
    if (!content.includes('AstrologicalState') && 
        !content.includes('astroState') && 
        !content.includes('TimeFactors') &&
        !content.includes('getTimeFactors')) {
      continue;
    }
    
    const result = applyFixes(filePath, content);
    
    if (result.changes > 0) {
      const relativePath = path.relative(ROOT_DIR, filePath);
      console.log(`🔧 ${relativePath}: ${result.changes} fixes applied`);
      
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, result.content, 'utf8');
      }
      
      totalChanges += result.changes;
      totalFiles++;
    }
  } catch (error) {
    const relativePath = path.relative(ROOT_DIR, filePath);
    console.error(`❌ Error processing ${relativePath}:`, error.message);
  }
}

console.log(`\n📊 Summary:`);
console.log(`   Files checked: ${targetFiles.length}`);
console.log(`   Files modified: ${totalFiles}`);
console.log(`   Total fixes applied: ${totalChanges}`);

if (DRY_RUN) {
  console.log('\n🏃 DRY RUN COMPLETED - No files were actually modified');
  console.log('Run without --dry-run to apply these changes');
} 