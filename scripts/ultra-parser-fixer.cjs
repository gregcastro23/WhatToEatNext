#!/usr/bin/env node
/**
 * Ultra Parser Fixer - Targets the most stubborn remaining parsing errors
 */

const fs = require('fs');
const { execSync } = require('child_process');

function getParsingErrorFiles() {
  try {
    const output = execSync(
      'yarn lint 2>&1 | grep -B 1 "Parsing error" | grep "^/" | sed "s/:$//" | sort -u',
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
    );
    return output.trim().split('\n').filter(Boolean);
  } catch (error) {
    return [];
  }
}

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const original = content;
    let fixes = [];

    // Fix 1: Add missing _logger import if logger/log is used without import
    if ((content.includes('_logger.') || content.includes('logger.')) &&
        !content.includes("import { _logger }") &&
        !content.includes("import { log }")) {
      // Check if it's using logger or _logger
      if (content.includes('_logger.')) {
        content = "import { _logger } from '@/lib/logger';\n" + content;
        fixes.push('added _logger import');
      }
    }

    // Fix 2: Missing semicolons after return statements
    content = content.replace(/return ([^;\n]+)\n\s*}/g, 'return $1;\n}');

    // Fix 3: Missing semicolons in variable declarations
    content = content.replace(/const\s+(\w+)\s*=\s*([^;\n]+)\n(?!\s*;)/g, 'const $1 = $2;\n');
    content = content.replace(/let\s+(\w+)\s*=\s*([^;\n]+)\n(?!\s*;)/g, 'let $1 = $2;\n');

    // Fix 4: Comma instead of semicolon at end of line
    content = content.replace(/([^,{]\s*),\s*\n\s*}/g, '$1;\n}');
    content = content.replace(/([^,{]\s*),\s*\n\s*;/g, '$1;\n;');

    // Fix 5: Missing closing paren before opening brace (all contexts)
    content = content.replace(/\)\s*\(\s*{/g, ') {');
    content = content.replace(/\w+\(([^)]*[^)]\s*){/g, (match, group) => {
      // Only fix if we're clearly missing a closing paren
      if (!match.includes('))')) {
        return match.replace(/{$/, ') {');
      }
      return match;
    });

    // Fix 6: Semicolon instead of colon in object types
    content = content.replace(/(:\s*\w+);(\s*})/g, '$1$2');

    // Fix 7: Comma after type instead of semicolon
    content = content.replace(/(private\s+\w+:\s*[^,;\n]+),(\s*\n)/g, '$1;$2');
    content = content.replace(/(public\s+\w+:\s*[^,;\n]+),(\s*\n)/g, '$1;$2');

    // Fix 8: Missing closing paren in function calls
    content = content.replace(/(\w+)\(([^()]*[^)]\s*;)/g, '$1($2)');

    // Fix 9: Stray semicolons in JSX
    content = content.replace(/;\s*>/g, '>');
    content = content.replace(/<\s*;/g, '<');

    // Fix 10: Missing equals in property initializers
    content = content.replace(/(\w+):\s+(\w+)\s+{/g, '$1: $2 = {');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf-8');
      return { fixed: true, fixes };
    }
    return { fixed: false, fixes: [] };
  } catch (error) {
    return { fixed: false, error: error.message };
  }
}

function main() {
  console.log('🚀 Ultra Parser Fixer\n');

  const files = getParsingErrorFiles();
  console.log(`Found ${files.length} files with parsing errors\n`);

  if (files.length === 0) {
    console.log('✅ No parsing errors!\n');
    return;
  }

  let fixedCount = 0;

  files.forEach(file => {
    const relativePath = file.replace(process.cwd() + '/', '');
    process.stdout.write(`Fixing ${relativePath}... `);

    const result = fixFile(file);

    if (result.error) {
      console.log(`❌ ${result.error}`);
    } else if (result.fixed) {
      fixedCount++;
      console.log(`✅`);
    } else {
      console.log('⚠️');
    }
  });

  console.log(`\n📊 Fixed: ${fixedCount}/${files.length} files\n`);
}

main();
