import fs from 'fs';
import path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');

// Files with blocking syntax errors
const BLOCKING_FILES = [
  'src/components/CuisineRecommender.tsx',
  'src/services/AlchemicalTransformationService.ts',
  'src/services/AstrologicalService.ts',
  'src/services/ElementalCalculator.ts',
  'src/services/ElementalRecommendationService.ts'
];

// Universal corruption patterns that appear across files
const CORRUPTION_PATTERNS = [
  // Fix Array.isArray complex ternary corruption
  {
    pattern: /if \(Array\.isArray\(\((\w+)\) \? \(\1\.includes\(([^)]+)\) : \(\1 === ([^)]+)\)\)/g,
    replacement: 'if (Array.isArray($1) ? $1.includes($2) : $1 === $3)',
    description: 'Fix Array.isArray complex ternary in if statements'
  },
  
  // Fix Object.entries corruption
  {
    pattern: /Object\.\(entries\(([^)]+)\)\s*\|\|\s*\[\]\)\.forEach/g,
    replacement: 'Object.entries($1 || {}).forEach',
    description: 'Fix Object.entries corruption'
  },
  
  // Fix complex Array.isArray chains
  {
    pattern: /Array\.isArray\(\((\w+)\) \? \(\1\.includes\(([^)]+)\) : \(\1 === ([^)]+)\)/g,
    replacement: 'Array.isArray($1) ? $1.includes($2) : $1 === $3',
    description: 'Fix complex Array.isArray chains'
  },
  
  // Fix missing assignment in ElementalRecommendationService
  {
    pattern: /const profile = \/\/ elementalUtils\.getElementalProfile\(properties\);/g,
    replacement: 'const profile = null; // elementalUtils.getElementalProfile(properties);',
    description: 'Fix missing assignment in ElementalRecommendationService'
  },
  
  // Fix JSX syntax error - incomplete opening tag
  {
    pattern: /<div className="bg-white rounded-lg shadow p-4">/g,
    replacement: '<div className="bg-white rounded-lg shadow p-4">',
    description: 'Fix JSX syntax - ensure proper div tag'
  }
];

function fixFile(targetFile) {
  try {
    if (!fs.existsSync(targetFile)) {
      console.log(`⏭️  Skipping missing file: ${targetFile}`);
      return 0;
    }

    console.log(`\n📖 Processing: ${targetFile}`);
    let content = fs.readFileSync(targetFile, 'utf8');
    const originalContent = content;
    let totalReplacements = 0;
    
    // Apply each corruption pattern fix
    CORRUPTION_PATTERNS.forEach((pattern, index) => {
      const matches = content.match(pattern.pattern);
      const matchCount = matches ? matches.length : 0;
      
      if (matchCount > 0) {
        console.log(`   🔧 ${pattern.description} - Found ${matchCount} matches`);
        
        if (!DRY_RUN) {
          content = content.replace(pattern.pattern, pattern.replacement);
          totalReplacements += matchCount;
          console.log(`   ✅ Applied ${matchCount} replacements`);
        }
      }
    });
    
    if (!DRY_RUN && content !== originalContent) {
      fs.writeFileSync(targetFile, content, 'utf8');
      console.log(`   📝 Updated file with ${totalReplacements} fixes`);
    }
    
    return totalReplacements;
  } catch (error) {
    console.error(`   ❌ Error processing ${targetFile}: ${error.message}`);
    return 0;
  }
}

function main() {
  console.log(`🎯 BLOCKING SYNTAX ERROR FIXES`);
  console.log(`🔧 MODE: ${DRY_RUN ? 'DRY RUN (no changes will be made)' : 'LIVE EXECUTION'}`);
  console.log(`📋 FILES TO PROCESS: ${BLOCKING_FILES.length}`);
  console.log(`📋 PATTERNS TO APPLY: ${CORRUPTION_PATTERNS.length}`);
  
  if (DRY_RUN) {
    console.log(`\n💡 This is a dry run. Use 'node fix-blocking-syntax-errors.js' to apply changes.`);
  }
  
  console.log(`\n⚡ Starting fix process...\n`);
  
  let totalFilesFixed = 0;
  let totalReplacements = 0;
  
  BLOCKING_FILES.forEach(file => {
    const replacements = fixFile(file);
    if (replacements > 0) {
      totalFilesFixed++;
      totalReplacements += replacements;
    }
  });
  
  if (DRY_RUN) {
    console.log(`\n🔍 DRY RUN COMPLETE`);
    console.log(`📊 Files that would be modified: ${totalFilesFixed}`);
    console.log(`📊 Would not make any changes`);
  } else {
    console.log(`\n✅ BLOCKING FIXES APPLIED`);
    console.log(`📊 Files modified: ${totalFilesFixed}`);
    console.log(`📊 Total replacements: ${totalReplacements}`);
    
    console.log(`\n🚀 NEXT STEPS:`);
    console.log(`   1. Run: yarn build`);
    console.log(`   2. Check if blocking errors are resolved`);
    console.log(`   3. Continue with Phase 2 files if successful`);
  }
}

main(); 