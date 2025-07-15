import fs from 'fs';
import path from 'path';

const TARGET_FILE = 'src/services/IngredientService.ts';
const DRY_RUN = process.argv.includes('--dry-run');

// Specific corruption patterns for IngredientService.ts
const CORRUPTION_PATTERNS = [
  // Fix this.property access corruption
  {
    pattern: /this\.\(([^)]+)\)\?\s*\|\|\s*\[\]/g,
    replacement: 'this.$1 || []',
    description: 'Fix this.property access corruption'
  },
  
  // Fix method chaining corruption in filter methods
  {
    pattern: /return this\?\.([\w]+)\|\|\s*\[\]\.filter\(/g,
    replacement: 'return (this.$1 || []).filter(',
    description: 'Fix method chaining corruption in filter methods'
  },
  
  // Fix Object.entries corruption with this properties
  {
    pattern: /Object\.entries\(this\.\(([^)]+)\)\?\s*\|\|\s*\[\]\)\.forEach/g,
    replacement: 'Object.entries(this.$1 || {}).forEach',
    description: 'Fix Object.entries corruption with this properties'
  },
  
  // Fix Object.values corruption with this properties
  {
    pattern: /Object\.values\(this\.\(([^)]+)\)\?\s*\|\|\s*\[\]\)\.forEach/g,
    replacement: 'Object.values(this.$1 || {}).forEach',
    description: 'Fix Object.values corruption with this properties'
  },
  
  // Fix array method chaining corruption
  {
    pattern: /\?\.([\w]+)\s*\|\|\s*\[\]\.filter\(/g,
    replacement: '?.$1 || []).filter(',
    description: 'Fix array method chaining corruption'
  },
  
  // Fix array spread corruption
  {
    pattern: /flat\?\.(push)\(\.\.\.([\w]+)\);/g,
    replacement: 'flat?.$1(...$2);',
    description: 'Fix array spread corruption'
  },
  
  // Fix conditional array access corruption
  {
    pattern: /\(([^)]+)\s*\|\|\s*\[\]\)\.length\s*>\s*0/g,
    replacement: '($1 || []).length > 0',
    description: 'Fix conditional array length corruption'
  },
  
  // Fix forEach with conditional access
  {
    pattern: /\(([^)]+)\s*\|\|\s*\[\]\)\.forEach\(/g,
    replacement: '($1 || []).forEach(',
    description: 'Fix forEach with conditional access'
  },
  
  // Fix ingredient property access
  {
    pattern: /ingredient\.(\w+)\?\.(toLowerCase)\(\)\s*===\s*(\w+)\?\.(toLowerCase)\(\)/g,
    replacement: 'ingredient.$1?.$2() === $3?.$4()',
    description: 'Fix ingredient property access'
  },
  
  // Fix filter property chaining
  {
    pattern: /filter\.(\w+)\s*&&\s*filter\.(\w+)\?\.(trim)\(\)\s*!==\s*''/g,
    replacement: 'filter.$1 && filter.$2?.$3() !== \'\'',
    description: 'Fix filter property chaining'
  },
  
  // Fix nested property access with conditionals
  {
    pattern: /(\w+)\?\.([\w]+)\?\.\[(\w+)\]\s*\|\|\s*\[\]/g,
    replacement: '$1?.$2?.[$3] || []',
    description: 'Fix nested property access with conditionals'
  },
  
  // Fix category access corruption  
  {
    pattern: /this\?\.([\w]+)\?\.\[category\]\s*\|\|\s*\[\]/g,
    replacement: 'this.$1?.[category] || []',
    description: 'Fix category access corruption'
  }
];

function fixFile() {
  try {
    // Check if target file exists
    if (!fs.existsSync(TARGET_FILE)) {
      console.error(`❌ Target file not found: ${TARGET_FILE}`);
      process.exit(1);
    }

    // Read the file
    console.log(`📖 Reading file: ${TARGET_FILE}`);
    let content = fs.readFileSync(TARGET_FILE, 'utf8');
    const originalContent = content;
    
    console.log(`📊 Original file size: ${content.length} characters`);
    console.log(`📊 Original line count: ${content.split('\n').length} lines`);
    
    let totalReplacements = 0;
    
    // Apply each corruption pattern fix
    CORRUPTION_PATTERNS.forEach((pattern, index) => {
      const beforeLength = content.length;
      const matches = content.match(pattern.pattern);
      const matchCount = matches ? matches.length : 0;
      
      if (matchCount > 0) {
        console.log(`\n🔧 Pattern ${index + 1}: ${pattern.description}`);
        console.log(`   Found ${matchCount} matches`);
        
        if (DRY_RUN) {
          // In dry run, show what would be replaced
          matches.forEach((match, i) => {
            console.log(`   Match ${i + 1}: "${match.substring(0, 60)}${match.length > 60 ? '...' : ''}"`);
          });
        } else {
          content = content.replace(pattern.pattern, pattern.replacement);
          const afterLength = content.length;
          const replacements = matchCount;
          totalReplacements += replacements;
          
          console.log(`   ✅ Applied ${replacements} replacements`);
          console.log(`   📏 Size change: ${afterLength - beforeLength} characters`);
        }
      } else {
        console.log(`\n⏭️  Pattern ${index + 1}: ${pattern.description} - No matches found`);
      }
    });
    
    if (DRY_RUN) {
      console.log(`\n🔍 DRY RUN COMPLETE`);
      console.log(`📊 Total patterns that would be applied: ${CORRUPTION_PATTERNS.filter(p => content.match(p.pattern)).length}`);
      console.log(`📊 Would not modify file: ${TARGET_FILE}`);
      return;
    }
    
    // Check if any changes were made
    if (content === originalContent) {
      console.log(`\n⚠️  No changes needed - file appears to be already clean`);
      return;
    }
    
    // Write the fixed content back to file
    fs.writeFileSync(TARGET_FILE, content, 'utf8');
    
    console.log(`\n✅ FIXES APPLIED SUCCESSFULLY`);
    console.log(`📊 Total replacements made: ${totalReplacements}`);
    console.log(`📊 Final file size: ${content.length} characters`);
    console.log(`📊 Final line count: ${content.split('\n').length} lines`);
    console.log(`📊 Size change: ${content.length - originalContent.length} characters`);
    console.log(`📝 Fixed file: ${TARGET_FILE}`);
    
    // Suggest next steps
    console.log(`\n🚀 NEXT STEPS:`);
    console.log(`   1. Run: yarn build`);
    console.log(`   2. Check error reduction`);
    console.log(`   3. If successful, proceed to: node fix-cooking-method-recommender-corruption.js --dry-run`);
    
  } catch (error) {
    console.error(`❌ Error processing file: ${error.message}`);
    process.exit(1);
  }
}

// Main execution
console.log(`🎯 TARGET: ${TARGET_FILE}`);
console.log(`🔧 MODE: ${DRY_RUN ? 'DRY RUN (no changes will be made)' : 'LIVE EXECUTION'}`);
console.log(`📋 PATTERNS TO APPLY: ${CORRUPTION_PATTERNS.length}`);

if (DRY_RUN) {
  console.log(`\n💡 This is a dry run. Use 'node fix-ingredient-service-corruption.js' to apply changes.`);
}

console.log(`\n⚡ Starting fix process...\n`);
fixFile(); 