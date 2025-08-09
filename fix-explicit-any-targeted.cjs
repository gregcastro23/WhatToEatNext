#!/usr/bin/env node

/**
 * Targeted Explicit-Any Reduction Script
 *
 * Focused approach to reduce @typescript-eslint/no-explicit-any warnings
 * with domain preservation and safety protocols
 */

const fs = require('fs');
const { execSync } = require('child_process');

function getFilesWithExplicitAny() {
  try {
    const output = execSync(
      'yarn lint --format=unix 2>/dev/null | grep "@typescript-eslint/no-explicit-any"',
      { encoding: 'utf8' },
    );
    const files = {};

    output.split('\n').forEach(line => {
      if (line.includes('@typescript-eslint/no-explicit-any')) {
        const match = line.match(/^([^:]+):/);
        if (match) {
          const filePath = match[1];
          files[filePath] = (files[filePath] || 0) + 1;
        }
      }
    });

    return Object.entries(files)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10); // Top 10 files
  } catch (error) {
    console.log('Error getting explicit-any files:', error.message);
    return [];
  }
}

function fixExplicitAnyInFile(filePath, maxFixes = 5) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let fixes = 0;
    const originalContent = content;

    // Don't touch certain protected files
    if (
      filePath.includes('astronomia') ||
      filePath.includes('types/swe') ||
      filePath.includes('enterpriseIntelligence')
    ) {
      console.log(`🛡️  Skipping protected file: ${filePath}`);
      return 0;
    }

    // Safe explicit-any replacements
    const replacements = [
      // Generic any types in non-critical contexts
      { pattern: /:\s*any\s*=/g, replacement: ': unknown =', context: 'assignment' },
      { pattern: /:\s*any\s*\|/g, replacement: ': unknown |', context: 'union' },
      { pattern: /:\s*any\s*&/g, replacement: ': unknown &', context: 'intersection' },
      // Function return types
      { pattern: /\):\s*any\s*{/g, replacement: '): unknown {', context: 'function_return' },
      // Array types
      { pattern: /Array<any>/g, replacement: 'Array<unknown>', context: 'array' },
      { pattern: /any\[\]/g, replacement: 'unknown[]', context: 'array_shorthand' },
    ];

    for (const { pattern, replacement, context } of replacements) {
      const matches = content.match(pattern);
      if (matches && fixes < maxFixes) {
        content = content.replace(pattern, replacement);
        fixes += matches.length;
        console.log(`  ✓ Fixed ${matches.length} ${context} patterns`);

        if (fixes >= maxFixes) break;
      }
    }

    if (fixes > 0) {
      // Create backup
      const backupPath = `${filePath}.explicit-any-backup`;
      fs.writeFileSync(backupPath, originalContent);

      // Write fixed content
      fs.writeFileSync(filePath, content);
      console.log(`📝 Applied ${fixes} fixes to ${filePath.split('/').pop()}`);
    }

    return fixes;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

console.log('🔧 Targeted Explicit-Any Reduction Campaign');
console.log('==========================================');

const filesWithAny = getFilesWithExplicitAny();
console.log(`📊 Found ${filesWithAny.length} files with explicit-any issues`);

let totalFixes = 0;
for (const [filePath, count] of filesWithAny.slice(0, 5)) {
  // Process top 5 files
  console.log(`\n🎯 Processing ${filePath.split('/').pop()} (${count} issues)`);
  const fixes = fixExplicitAnyInFile(filePath, 3); // Max 3 fixes per file for safety
  totalFixes += fixes;
}

console.log(`\n📊 Campaign Summary:`);
console.log(`   Total files processed: ${Math.min(filesWithAny.length, 5)}`);
console.log(`   Total fixes applied: ${totalFixes}`);
console.log(`\n🧪 Next steps:`);
console.log(`   1. Run 'yarn lint' to check results`);
console.log(`   2. Run 'make build' to verify stability`);
console.log(`   3. If issues occur, restore from .explicit-any-backup files`);
