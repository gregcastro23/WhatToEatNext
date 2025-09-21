#!/usr/bin/env node

/**
 * TS1005 Specialized Fixer - Targets remaining TypeScript syntax errors
 * Focuses on specific pattern fixes for semicolon, comma, and syntax expectations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get TypeScript files with TS1005 errors
function getTS1005ErrorFiles() {
  try {
    const result = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep "error TS1005" | cut -d"(" -f1 | sort | uniq',
      { encoding: 'utf8' });
    return result.trim().split('\n').filter(f => f.length > 0);
  } catch (error) {
    return [];
  }
}

// Fix TS1005 syntax patterns
function fixTS1005Patterns(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fixesApplied = 0;

    // Pattern 1: Missing closing brace for blocks
    if (content.includes('          }\n        console.log(')) {
      content = content.replace(/          \}\n        console\.log\(/g, '          }\n        }\n\n        console.log(');
      fixesApplied++;
    }

    // Pattern 2: Missing semicolons after expect statements
    const expectMissingSemicolon = /expect\([^)]+\)\.to[A-Za-z]+\([^)]*\)\s*$/gm;
    const expectMatches = content.match(expectMissingSemicolon);
    if (expectMatches) {
      for (const match of expectMatches) {
        content = content.replace(match, match + ';');
        fixesApplied++;
      }
    }

    // Pattern 3: Missing dots in method chains
    content = content.replace(/expect\(([^)]+)\)to([A-Z])/g, 'expect($1).to$2');
    if (content !== originalContent) fixesApplied++;

    // Pattern 4: Missing semicolons at end of variable declarations
    content = content.replace(/const\s+\w+:\s*any\s*=\s*[^;]+$/gm, (match) => {
      if (!match.endsWith(';')) {
        fixesApplied++;
        return match + ';';
      }
      return match;
    });

    // Pattern 5: Missing commas in object/array literals
    content = content.replace(/(\w+)(\s+)(\w+)(\s*):(\s*)(\w+)/g, '$1,$2$3$4:$5$6');

    // Pattern 6: Fix malformed console.log statements
    content = content.replace(/console\.log\([^)]+\)$/gm, (match) => {
      if (!match.endsWith(';')) {
        fixesApplied++;
        return match + ';';
      }
      return match;
    });

    // Pattern 7: Fix missing semicolons after function calls
    content = content.replace(/\)\s*$/gm, (match, offset) => {
      const line = content.substring(content.lastIndexOf('\n', offset) + 1, offset + match.length);
      if (line.trim().includes('(') && !line.trim().endsWith(';') && !line.trim().endsWith('{') && !line.trim().endsWith('}')) {
        fixesApplied++;
        return ');';
      }
      return match;
    });

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      return fixesApplied;
    }
    return 0;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return 0;
  }
}

// Main execution
console.log('🔧 TS1005 Specialized Fixer - Targeting remaining syntax errors');

const errorFiles = getTS1005ErrorFiles();
console.log(`📁 Found ${errorFiles.length} files with TS1005 errors`);

let totalFixes = 0;
let fixedFiles = 0;

for (const file of errorFiles) {
  if (fs.existsSync(file)) {
    const fixes = fixTS1005Patterns(file);
    if (fixes > 0) {
      fixedFiles++;
      totalFixes += fixes;
      console.log(`✅ ${file}: ${fixes} TS1005 fixes applied`);
    }
  }
}

console.log(`\n📈 TS1005 Specialized Fixes Results:`);
console.log(`   Files processed: ${errorFiles.length}`);
console.log(`   Files with fixes: ${fixedFiles}`);
console.log(`   Total fixes applied: ${totalFixes}`);

// Quick validation
try {
  console.log('\n🔍 Running quick validation...');
  const finalErrors = parseInt(execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS"', { encoding: 'utf8' }));
  console.log(`📊 Current total errors: ${finalErrors}`);
} catch (error) {
  console.log('⚠️  Could not validate error count');
}

console.log('\n🎯 TS1005 specialized fixes complete!');