import fs from 'fs';
import path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');

// Precise fixes based on exact build error messages
const PRECISE_SYNTAX_FIXES = [
  {
    file: 'src/services/FoodAlchemySystem.ts',
    line: 513,
    patterns: [
      {
        // Fix missing closing parenthesis in if statement
        pattern: /if \(Array\.isArray\(decanEffects\[decan\]\) \? decanEffects\[decan\]\?\.includes\(food\.planetaryRuler\) : decanEffects\[decan\] === food\.planetaryRuler \{/g,
        replacement: 'if (Array.isArray(decanEffects[decan]) ? decanEffects[decan]?.includes(food.planetaryRuler) : decanEffects[decan] === food.planetaryRuler) {',
        description: 'Fix missing closing parenthesis in decan check condition'
      }
    ]
  },
  {
    file: 'src/services/IngredientFilterService.ts',
    line: 399,
    patterns: [
      {
        // Fix malformed Array.isArray call
        pattern: /\(Array\.isArray\(\!lowerExcluded\) \? \!lowerExcluded\.includes\(ingredient\.name\?\.toLowerCase\(\) : \!lowerExcluded === ingredient\.name\?\.toLowerCase\(\)\)/g,
        replacement: '(Array.isArray(lowerExcluded) ? !lowerExcluded.includes(ingredient.name?.toLowerCase()) : lowerExcluded !== ingredient.name?.toLowerCase())',
        description: 'Fix malformed exclusion filter condition'
      }
    ]
  },
  {
    file: 'src/services/IngredientService.ts',
    line: 467,
    patterns: [
      {
        // Fix missing closing parenthesis in safeSome call
        pattern: /safeSome\(Array\.isArray\(ingredient\.tags\) \? ingredient\.tags : \[ingredient\.tags\], tag => tag === 'meat'\) \{/g,
        replacement: 'safeSome(Array.isArray(ingredient.tags) ? ingredient.tags : [ingredient.tags], tag => tag === \'meat\')) {',
        description: 'Fix missing closing parenthesis in safeSome vegetarian check'
      }
    ]
  },
  {
    file: 'src/services/LocalRecipeService.ts',
    line: 240,
    patterns: [
      {
        // Fix missing closing parenthesis in cuisine matching
        pattern: /\(Array\.isArray\(normalizedName\) \? normalizedName\.includes\(c\?\.name\?\.toLowerCase\(\)\) : normalizedName === c\?\.name\?\.toLowerCase\(\)\s*\)/g,
        replacement: '(Array.isArray(normalizedName) ? normalizedName.includes(c?.name?.toLowerCase()) : normalizedName === c?.name?.toLowerCase())',
        description: 'Fix missing closing parenthesis in cuisine name matching'
      }
    ]
  }
];

function checkContext(filePath, lineNumber, range = 5) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const startLine = Math.max(0, lineNumber - range - 1);
  const endLine = Math.min(lines.length - 1, lineNumber + range - 1);
  
  console.log(`\n📍 Context around line ${lineNumber} in ${filePath}:`);
  for (let i = startLine; i <= endLine; i++) {
    const marker = i === lineNumber - 1 ? '>>>' : '   ';
    console.log(`${marker} ${i + 1}: ${lines[i]}`);
  }
  
  return lines[lineNumber - 1];
}

function fixFile(filePath, patterns, expectedLine) {
  let fixesApplied = 0;
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return 0;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Show context around the error
  const errorLine = checkContext(filePath, expectedLine);

  for (const pattern of patterns) {
    const matches = content.match(pattern.pattern);
    if (matches) {
      console.log(`\n🔧 ${DRY_RUN ? 'WOULD FIX' : 'FIXING'}: ${pattern.description}`);
      console.log(`   Pattern matches found: ${matches.length}`);
      console.log(`   Original: ${matches[0].substring(0, 100)}...`);
      console.log(`   Fixed: ${pattern.replacement.substring(0, 100)}...`);
      
      if (!DRY_RUN) {
        content = content.replace(pattern.pattern, pattern.replacement);
        fixesApplied++;
      } else {
        fixesApplied += matches.length;
      }
    } else {
      console.log(`⚠️  Pattern not found: ${pattern.description}`);
      if (errorLine) {
        console.log(`   Error line content: ${errorLine.trim()}`);
      }
    }
  }

  if (!DRY_RUN && content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Applied ${fixesApplied} fixes to ${filePath}`);
  } else if (DRY_RUN && fixesApplied > 0) {
    console.log(`📋 Would apply ${fixesApplied} fixes to ${filePath}`);
  } else {
    console.log(`ℹ️  No changes needed for ${filePath}`);
  }

  return fixesApplied;
}

function main() {
  console.log(`🔧 ${DRY_RUN ? 'DRY RUN' : 'EXECUTING'}: Fix Precise Syntax Errors`);
  console.log('📋 Targeting exact build error locations\n');

  let totalFixes = 0;
  
  for (const fileConfig of PRECISE_SYNTAX_FIXES) {
    console.log(`\n📁 Processing: ${fileConfig.file} (line ${fileConfig.line})`);
    const fixes = fixFile(fileConfig.file, fileConfig.patterns, fileConfig.line);
    totalFixes += fixes;
  }

  console.log(`\n🎯 Summary:`);
  console.log(`   Total fixes ${DRY_RUN ? 'identified' : 'applied'}: ${totalFixes}`);
  
  if (DRY_RUN) {
    console.log('\n⚡ Run without --dry-run to apply fixes');
    console.log('   Then test with: yarn build');
  } else {
    console.log('\n✅ Precise syntax fixes applied!');
    console.log('🔄 Next: Run "yarn build" to verify clean build status');
  }
}

main(); 