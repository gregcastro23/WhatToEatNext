import fs from 'fs';
import path from 'path';

const TARGET_FILE = 'src/utils/cookingMethodRecommender.ts';
const DRY_RUN = process.argv.includes('--dry-run');

// Specific corruption patterns for cookingMethodRecommender.ts
const CORRUPTION_PATTERNS = [
  // Fix complex Array.isArray ternary corruption in cooking methods
  {
    pattern: /Array\.isArray\(\((\w+)\) \? \(\1\.includes\(([^)]+)\) : \(\1 === ([^)]+)\)/g,
    replacement: 'Array.isArray($1) ? $1.includes($2) : $1 === $3',
    description: 'Fix complex Array.isArray ternary corruption in cooking methods'
  },
  
  // Fix malformed elementalEffect object syntax
  {
    pattern: /elementalEffect:\s*method\.elementalEffect\s*\|\|\s*\{\s*Fire:\s*0,\s*Water:\s*0,\s*Earth:\s*0,\s*Air:\s*0\s*\n\s*\}/g,
    replacement: 'elementalEffect: method.elementalEffect || { Fire: 0, Water: 0, Earth: 0, Air: 0 }',
    description: 'Fix malformed elementalEffect object syntax'
  },
  
  // Fix elementalProperties object syntax corruption
  {
    pattern: /elementalProperties:\s*method\.elementalProperties\s*\|\|\s*\{\s*Fire:\s*0,\s*Water:\s*0,\s*Earth:\s*0,\s*Air:\s*0\s*\n\s*\}/g,
    replacement: 'elementalProperties: method.elementalProperties || { Fire: 0, Water: 0, Earth: 0, Air: 0 }',
    description: 'Fix elementalProperties object syntax corruption'
  },
  
  // Fix Array.isArray chaining with logical operators
  {
    pattern: /\(!(\w+)\s*\|\|\s*\[\]\)\.some\(([^)]+)\)/g,
    replacement: '!($1 || []).some($2)',
    description: 'Fix Array.isArray chaining with logical operators'
  },
  
  // Fix method variations array corruption
  {
    pattern: /methods\[([^\]]+)\]\.variations\s*=\s*\[\n\s*\.\.\.(\w+),/g,
    replacement: 'methods[$1].variations = [\n            ...$2,',
    description: 'Fix method variations array corruption'
  },
  
  // Fix some() method chaining with array filters
  {
    pattern: /(\w+)\s*\|\|\s*\[\]\.some\(([^)]+)\)/g,
    replacement: '($1 || []).some($2)',
    description: 'Fix some() method chaining with array filters'
  },
  
  // Fix map() method chaining corruption
  {
    pattern: /(\w+)\s*\|\|\s*\[\]\.map\(([^)]+)\)/g,
    replacement: '($1 || []).map($2)',
    description: 'Fix map() method chaining corruption'
  },
  
  // Fix Object.entries corruption with optional chaining
  {
    pattern: /Object\.entries\(([^)]+)\)\?\.reduce\(/g,
    replacement: 'Object.entries($1)?.reduce(',
    description: 'Fix Object.entries corruption with optional chaining'
  },
  
  // Fix complex chained property access
  {
    pattern: /(\w+)\.(\w+)\s*\|\|\s*\[\]\.(\w+)\(/g,
    replacement: '($1.$2 || []).$3(',
    description: 'Fix complex chained property access'
  },
  
  // Fix thermodynamic property access
  {
    pattern: /gregsEnergy:\s*\(([^)]+)\s*\+\s*([^)]+)\s*\+\s*([^)]+)\s*\)\s*\/\s*3\s*\}/g,
    replacement: 'gregsEnergy: ($1 + $2 + $3) / 3 }',
    description: 'Fix thermodynamic property access'
  },
  
  // Fix nested conditional array includes
  {
    pattern: /\(\((\w+)\s*\|\|\s*\[\]\)\.length\s*>\s*0\)/g,
    replacement: '(($1 || []).length > 0)',
    description: 'Fix nested conditional array includes'
  },
  
  // Fix method property access with conditionals
  {
    pattern: /method\.(\w+)\s*\|\|\s*\[\]\.(\w+)\(/g,
    replacement: '(method.$1 || []).$2(',
    description: 'Fix method property access with conditionals'
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
    console.log(`   2. Check error reduction after fixing top 3 files`);
    console.log(`   3. If successful, proceed to Phase 2 files`);
    
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
  console.log(`\n💡 This is a dry run. Use 'node fix-cooking-method-recommender-corruption.js' to apply changes.`);
}

console.log(`\n⚡ Starting fix process...\n`);
fixFile(); 