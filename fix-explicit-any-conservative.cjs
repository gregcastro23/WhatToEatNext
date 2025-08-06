#!/usr/bin/env node

/**
 * Conservative Explicit-Any Fix Script
 *
 * Only fixes the safest patterns to avoid TypeScript compilation errors
 */

const fs = require('fs');
const { execSync } = require('child_process');

function fixSafePatterns(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let fixes = 0;
    const originalContent = content;

    // Only the safest replacements
    const replacements = [
      // Record<string, any> -> Record<string, unknown>
      {
        pattern: /Record<string,\s*any>/g,
        replacement: 'Record<string, unknown>',
        description: 'Record types'
      },
      // : any[] -> : unknown[]
      {
        pattern: /:\s*any\[\]/g,
        replacement: ': unknown[]',
        description: 'Array types'
      },
      // : any = -> : unknown =
      {
        pattern: /:\s*any\s*=/g,
        replacement: ': unknown =',
        description: 'Variable assignments'
      }
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
      const backupPath = `${filePath}.conservative-backup-${Date.now()}`;
      fs.writeFileSync(backupPath, originalContent);

      // Write fixed content
      fs.writeFileSync(filePath, content);
      console.log(`📝 Applied ${fixes} fixes to ${filePath.split('/').pop()}`);

      // Test TypeScript compilation immediately
      try {
        execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
        console.log('✅ TypeScript compilation successful');
        return fixes;
      } catch (error) {
        console.log('❌ TypeScript compilation failed - restoring backup');
        fs.writeFileSync(filePath, originalContent);
        return 0;
      }
    }

    return fixes;

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

function getTopFiles() {
  try {
    const output = execSync('yarn lint --format=unix 2>/dev/null | grep "@typescript-eslint/no-explicit-any" | cut -d: -f1 | sort | uniq -c | sort -nr | head -10', { encoding: 'utf8' });
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
    console.log('Error getting files:', error.message);
    return [];
  }
}

console.log('🔧 Conservative Explicit-Any Fix Script');
console.log('========================================');

const files = getTopFiles();
console.log(`📊 Found ${files.length} files with explicit-any issues`);

let totalFixes = 0;
for (const { path: filePath, count } of files.slice(0, 10)) {
  console.log(`\n🎯 Processing ${filePath.split('/').pop()} (${count} issues)`);
  const fixes = fixSafePatterns(filePath);
  totalFixes += fixes;
}

console.log(`\n📊 Campaign Summary:`);
console.log(`   Total files processed: ${Math.min(files.length, 10)}`);
console.log(`   Total fixes applied: ${totalFixes}`);

// Final check
console.log(`\n🧪 Final validation...`);
try {
  const lintOutput = execSync('yarn lint --max-warnings=10000 2>&1 | grep -E "@typescript-eslint/no-explicit-any" | wc -l', { encoding: 'utf8' });
  const remainingIssues = parseInt(lintOutput.trim());
  console.log(`📊 Remaining explicit-any issues: ${remainingIssues}`);
} catch (error) {
  console.log('Could not count remaining issues');
}
