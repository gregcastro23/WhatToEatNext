#!/usr/bin/env node

/**
 * Custom Explicit-Any Fix Script
 *
 * Targets specific patterns found in the codebase for safe replacement
 */

const fs = require('fs');
const { execSync } = require('child_process');

function getTopExplicitAnyFiles() {
  try {
    const output = execSync(
      'yarn lint --format=unix 2>/dev/null | grep "@typescript-eslint/no-explicit-any" | cut -d: -f1 | sort | uniq -c | sort -nr | head -10',
      { encoding: 'utf8' },
    );
    const files = [];

    output.split('\n').forEach(line => {
      const match = line.trim().match(/^\s*(\d+)\s+(.+)$/);
      if (match) {
        const count = parseInt(match[1]);
        const filePath = match[2].trim();
        files.push({ path: filePath, count });
      }
    });

    return files;
  } catch (error) {
    console.log('Error getting explicit-any files:', error.message);
    return [];
  }
}

function fixExplicitAnyPatterns(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let fixes = 0;
    const originalContent = content;

    // Safe replacements for common patterns
    const replacements = [
      // Jest mock functions - very safe replacement
      {
        pattern: /jest\.MockedFunction<any>/g,
        replacement: 'jest.MockedFunction<(...args: unknown[]) => unknown>',
        description: 'Jest mock function types',
      },
      // Generic any in simple contexts
      {
        pattern: /:\s*any\s*=/g,
        replacement: ': unknown =',
        description: 'Variable assignments',
      },
      // Function return types
      {
        pattern: /\):\s*any\s*{/g,
        replacement: '): unknown {',
        description: 'Function return types',
      },
      // Array types
      {
        pattern: /any\[\]/g,
        replacement: 'unknown[]',
        description: 'Array types',
      },
      // Record types for objects
      {
        pattern: /Record<string,\s*any>/g,
        replacement: 'Record<string, unknown>',
        description: 'Record types',
      },
      // Simple object properties
      {
        pattern: /:\s*any\s*;/g,
        replacement: ': unknown;',
        description: 'Object properties',
      },
      // Union types
      {
        pattern: /:\s*any\s*\|/g,
        replacement: ': unknown |',
        description: 'Union types',
      },
    ];

    for (const { pattern, replacement, description } of replacements) {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        fixes += matches.length;
        console.log(`  ✓ ${description}: ${matches.length} fixes`);
      }
    }

    if (fixes > 0) {
      // Create backup
      const backupPath = `${filePath}.explicit-any-backup-${Date.now()}`;
      fs.writeFileSync(backupPath, originalContent);

      // Write fixed content
      fs.writeFileSync(filePath, content);
      console.log(`📝 Applied ${fixes} fixes to ${filePath.split('/').pop()}`);
      console.log(`   Backup created: ${backupPath}`);
    }

    return fixes;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

console.log('🔧 Custom Explicit-Any Fix Script');
console.log('==================================');

const files = getTopExplicitAnyFiles();
console.log(`📊 Found ${files.length} files with explicit-any issues`);

let totalFixes = 0;
for (const { path: filePath, count } of files.slice(0, 5)) {
  console.log(`\n🎯 Processing ${filePath.split('/').pop()} (${count} issues)`);
  const fixes = fixExplicitAnyPatterns(filePath);
  totalFixes += fixes;
}

console.log(`\n📊 Campaign Summary:`);
console.log(`   Total files processed: ${Math.min(files.length, 5)}`);
console.log(`   Total fixes applied: ${totalFixes}`);

// Check TypeScript compilation
console.log(`\n🧪 Validating TypeScript compilation...`);
try {
  execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
  console.log('✅ TypeScript compilation successful');
} catch (error) {
  console.log('❌ TypeScript compilation failed - consider restoring backups');
}

console.log(`\n🧪 Next steps:`);
console.log(`   1. Run 'yarn lint' to check results`);
console.log(`   2. Run 'make build' to verify stability`);
console.log(`   3. If issues occur, restore from backup files`);
