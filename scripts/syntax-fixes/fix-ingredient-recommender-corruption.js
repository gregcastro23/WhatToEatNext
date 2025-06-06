import fs from 'fs';
import path from 'path';

const TARGET_FILE = 'src/utils/ingredientRecommender.ts';
const DRY_RUN = process.argv.includes('--dry-run');

// Specific corruption patterns for ingredientRecommender.ts
const CORRUPTION_PATTERNS = [
  // Fix malformed array closing bracket
  {
    pattern: /\(\] \|\| \[\]\)/g,
    replacement: '] || []',
    description: 'Fix malformed array closing bracket (] || [])'
  },
  
  // Fix complex ternary Array.isArray corruption
  {
    pattern: /Array\.isArray\(\((\w+)\) \? \(\1\.includes\(([^)]+)\) : \(\1 === ([^)]+)\)\)/g,
    replacement: 'Array.isArray($1) ? $1.includes($2) : $1 === $3',
    description: 'Fix complex ternary Array.isArray corruption'
  },
  
  // Fix property access corruption with Array.isArray
  {
    pattern: /(\w+)\.\(Array\.isArray\((\w+)\?\) \? \2\?\.includes\(([^)]+)\)\s+:\s+\2\?\s+===\s+([^)]+)\)/g,
    replacement: '$1[Array.isArray($1.$2) ? "$1.$2.includes($3)" : "$1.$2 === $4"]',
    description: 'Fix property access corruption with Array.isArray'
  },
  
  // Fix ingredient property access corruption
  {
    pattern: /ingredient\.\(Array\.isArray\(([^?]+)\?\)\s*\?\s*([^:]+):\s*([^)]+)\)/g,
    replacement: 'Array.isArray(ingredient.$1) ? $2 : $3',
    description: 'Fix ingredient property access corruption'
  },
  
  // Fix astrologicalProfile property access corruption
  {
    pattern: /(\w+)\.astrologicalProfile\?\.\(Array\.isArray\(([^?]+)\?\)\s*\?\s*([^:]+):\s*([^)]+)\)/g,
    replacement: '$1.astrologicalProfile && Array.isArray($1.astrologicalProfile.$2) ? $3 : $4',
    description: 'Fix astrologicalProfile property access corruption'
  },
  
  // Fix simple Array.isArray ternary corruption
  {
    pattern: /Array\.isArray\(\(([^)]+)\) \? \(\1\.includes\(/g,
    replacement: 'Array.isArray($1) ? $1.includes(',
    description: 'Fix simple Array.isArray ternary corruption'
  },
  
  // Fix malformed object access patterns ({})? || []
  {
    pattern: /\(\{\}\)\?\s*\|\|\s*\[\]/g,
    replacement: '{}',
    description: 'Fix malformed object access patterns'
  },
  
  // Fix forEach entries corruption
  {
    pattern: /Object\.entries\(([^|]+)\|\|\s*\(\{\}\)\?\s*\|\|\s*\[\]\)\.forEach/g,
    replacement: 'Object.entries($1 || {}).forEach',
    description: 'Fix Object.entries corruption'
  },
  
  // Fix rulingPlanets some() method corruption
  {
    pattern: /ingredient\?\.\w+\?\.\w+\s*\|\|\s*\[\]\.some\(/g,
    replacement: '(ingredient?.astrologicalProfile?.rulingPlanets || []).some(',
    description: 'Fix rulingPlanets some() method corruption'
  },
  
  // Fix missing closing parentheses in if statements
  {
    pattern: /if \(Array\.isArray\(\(([^)]+)\) \? \(\1\.includes\(([^)]+)\) : \(\1 === ([^)]+)\) \{/g,
    replacement: 'if (Array.isArray($1) ? $1.includes($2) : $1 === $3) {',
    description: 'Fix missing closing parentheses in if statements'
  },
  
  // Fix favorableZodiac property access corruption
  {
    pattern: /\(Array\.isArray\(favorableZodiac\?\)\s*\?\s*favorableZodiac\?\.includes\(([^)]+)\)\s*:\s*favorableZodiac\?\s*===\s*([^)]+)\)/g,
    replacement: 'Array.isArray(favorableZodiac) ? favorableZodiac?.includes($1) : favorableZodiac === $2',
    description: 'Fix favorableZodiac property access corruption'
  },
  
  // Fix method call corruption on variables
  {
    pattern: /([a-zA-Z_$][a-zA-Z0-9_$]*)\?\.\(Array\.isArray\(([^?]+)\?\)\s*\?\s*([^:]+):\s*([^)]+)\)/g,
    replacement: 'Array.isArray($1?.$2) ? $3 : $4',
    description: 'Fix method call corruption on variables'
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
    console.log(`   3. If successful, proceed to: node fix-ingredient-service-corruption.js --dry-run`);
    
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
  console.log(`\n💡 This is a dry run. Use 'node fix-ingredient-recommender-corruption.js' to apply changes.`);
}

console.log(`\n⚡ Starting fix process...\n`);
fixFile(); 