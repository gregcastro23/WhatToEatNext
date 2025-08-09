#!/usr/bin/env node

/**
 * Fix Simple Any Assignments
 *
 * Targets very specific safe patterns like "const value: any = ..."
 */

const fs = require('fs');
const { execSync } = require('child_process');

function fixSimpleAssignments(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let fixes = 0;
    const originalContent = content;

    // Skip test files - they often need any for flexibility
    if (filePath.includes('test.ts') || filePath.includes('__tests__')) {
      console.log(`  🧪 Skipping test file: ${filePath.split('/').pop()}`);
      return 0;
    }

    // Very specific safe patterns
    const replacements = [
      // const variable: any = ... -> const variable: unknown = ...
      {
        pattern: /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*any\s*=/g,
        replacement: 'const $1: unknown =',
        description: 'const assignments',
      },
      // let variable: any = ... -> let variable: unknown = ...
      {
        pattern: /let\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*any\s*=/g,
        replacement: 'let $1: unknown =',
        description: 'let assignments',
      },
    ];

    for (const { pattern, replacement, description } of replacements) {
      const matches = content.match(pattern);
      if (matches) {
        // Check if this is in a safe context (not in complex expressions)
        const newContent = content.replace(pattern, replacement);

        // Only apply if it doesn't break obvious patterns
        if (
          !newContent.includes('unknown = metrics') &&
          !newContent.includes('unknown = data') &&
          !newContent.includes('unknown = config')
        ) {
          content = newContent;
          fixes += matches.length;
          console.log(`  ✓ ${description}: ${matches.length} fixes`);
        }
      }
    }

    if (fixes > 0) {
      // Create backup
      const backupPath = `${filePath}.simple-any-backup-${Date.now()}`;
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

// Get files with simple any assignments
function getFilesWithSimpleAssignments() {
  try {
    const output = execSync('grep -r ":\\s*any\\s*=" src --include="*.ts" --include="*.tsx" -l', {
      encoding: 'utf8',
    });
    return output
      .trim()
      .split('\n')
      .filter(f => f && !f.includes('test'));
  } catch (error) {
    console.log('No files found with simple any assignments');
    return [];
  }
}

console.log('🔧 Fix Simple Any Assignments');
console.log('==============================');

const files = getFilesWithSimpleAssignments();
console.log(`📊 Found ${files.length} files with simple any assignments`);

let totalFixes = 0;
for (const filePath of files.slice(0, 10)) {
  console.log(`\n🎯 Processing ${filePath.split('/').pop()}`);
  const fixes = fixSimpleAssignments(filePath);
  totalFixes += fixes;
}

console.log(`\n📊 Campaign Summary:`);
console.log(`   Total files processed: ${Math.min(files.length, 10)}`);
console.log(`   Total fixes applied: ${totalFixes}`);

// Final check
console.log(`\n🧪 Final validation...`);
try {
  const lintOutput = execSync(
    'yarn lint --max-warnings=10000 2>&1 | grep -E "@typescript-eslint/no-explicit-any" | wc -l',
    { encoding: 'utf8' },
  );
  const remainingIssues = parseInt(lintOutput.trim());
  console.log(`📊 Remaining explicit-any issues: ${remainingIssues}`);
} catch (error) {
  console.log('Could not count remaining issues');
}
