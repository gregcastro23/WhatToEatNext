#!/usr/bin/env node

/**
 * Fix High Priority Type Issues
 *
 * Targets specific high-priority files with safe type improvements
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🎯 Fixing High Priority Type Issues\n');

const HIGH_PRIORITY_FILES = [
  'src/app/cooking-methods-demo/page.tsx',
  'src/app/cooking-methods/page.tsx'
];

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return false;
  }

  console.log(`📝 Processing: ${filePath}`);

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let changesMade = false;

  // Create backup
  fs.writeFileSync(`${filePath}.backup`, originalContent);

  // Fix 1: Replace (method as any) with proper type assertion
  const methodAsAnyPattern = /\(method as any\)/g;
  if (content.match(methodAsAnyPattern)) {
    content = content.replace(methodAsAnyPattern, '(method as Record<string, unknown>)');
    changesMade = true;
    console.log('  ✅ Fixed: (method as any) → (method as Record<string, unknown>)');
  }

  // Fix 2: Replace array as any with proper typing
  const arrayAsAnyPattern = /(\w+Methods) as any/g;
  const arrayMatches = content.match(arrayAsAnyPattern);
  if (arrayMatches) {
    content = content.replace(arrayAsAnyPattern, '$1 as Record<string, unknown>[]');
    changesMade = true;
    console.log('  ✅ Fixed: array as any → array as Record<string, unknown>[]');
  }

  // Fix 3: Replace function parameter any types
  const functionParamPattern = /\(\s*(\w+):\s*any\s*\)/g;
  if (content.match(functionParamPattern)) {
    content = content.replace(functionParamPattern, '($1: unknown)');
    changesMade = true;
    console.log('  ✅ Fixed: function parameter any → unknown');
  }

  // Fix 4: Replace variable declarations with any
  const varAnyPattern = /:\s*any\s*=/g;
  if (content.match(varAnyPattern)) {
    content = content.replace(varAnyPattern, ': unknown =');
    changesMade = true;
    console.log('  ✅ Fixed: variable any → unknown');
  }

  // Fix 5: Replace return type any
  const returnAnyPattern = /\):\s*any\s*{/g;
  if (content.match(returnAnyPattern)) {
    content = content.replace(returnAnyPattern, '): unknown {');
    changesMade = true;
    console.log('  ✅ Fixed: return type any → unknown');
  }

  if (changesMade) {
    fs.writeFileSync(filePath, content);
    console.log(`  📊 Changes applied to ${filePath}`);
    return true;
  } else {
    // Remove backup if no changes
    fs.unlinkSync(`${filePath}.backup`);
    console.log(`  ⏭️  No changes needed for ${filePath}`);
    return false;
  }
}

function validateBuild() {
  try {
    console.log('\n🔍 Validating build...');
    execSync('yarn build 2>/dev/null', { stdio: 'pipe' });
    console.log('✅ Build successful');
    return true;
  } catch (error) {
    console.log('❌ Build failed');
    return false;
  }
}

function rollbackChanges() {
  console.log('🔄 Rolling back changes...');
  for (const filePath of HIGH_PRIORITY_FILES) {
    const backupPath = `${filePath}.backup`;
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, filePath);
      fs.unlinkSync(backupPath);
      console.log(`  ↩️  Rolled back: ${filePath}`);
    }
  }
}

function cleanupBackups() {
  console.log('🧹 Cleaning up backups...');
  for (const filePath of HIGH_PRIORITY_FILES) {
    const backupPath = `${filePath}.backup`;
    if (fs.existsSync(backupPath)) {
      fs.unlinkSync(backupPath);
    }
  }
}

function checkProgress() {
  try {
    const beforeCount = 2676; // Known count from previous analysis
    const afterCount = parseInt(execSync(`
      yarn lint:quick 2>&1 |
      grep "@typescript-eslint/no-explicit-any" |
      wc -l
    `, { encoding: 'utf8' }).trim());

    const reduction = beforeCount - afterCount;

    console.log('\n📈 Progress Report:');
    console.log(`   Before: ${beforeCount} explicit any warnings`);
    console.log(`   After: ${afterCount} explicit any warnings`);
    console.log(`   Reduction: ${reduction} warnings fixed`);
    console.log(`   Percentage: ${((reduction / beforeCount) * 100).toFixed(1)}%`);

    return { before: beforeCount, after: afterCount, reduction };
  } catch (error) {
    console.log('Could not check progress');
    return null;
  }
}

// Main execution
async function main() {
  let filesModified = 0;

  // Process each high-priority file
  for (const filePath of HIGH_PRIORITY_FILES) {
    const modified = fixFile(filePath);
    if (modified) {
      filesModified++;
    }
  }

  console.log(`\n📊 Summary: ${filesModified} files modified`);

  if (filesModified > 0) {
    // Validate build
    const buildSuccess = validateBuild();

    if (buildSuccess) {
      cleanupBackups();
      const progress = checkProgress();

      console.log('\n✅ HIGH PRIORITY TYPE FIXES COMPLETED');
      console.log('=' .repeat(50));
      console.log(`Files processed: ${HIGH_PRIORITY_FILES.length}`);
      console.log(`Files modified: ${filesModified}`);

      if (progress) {
        console.log(`Warnings reduced: ${progress.reduction}`);
      }

      console.log('\n🎯 Next Steps:');
      console.log('1. Review medium priority files manually');
      console.log('2. Preserve domain-specific any types in calculations/');
      console.log('3. Focus on React component type safety');

    } else {
      rollbackChanges();
      console.log('\n❌ Build failed, changes rolled back');
      console.log('Manual review required for these files');
    }
  } else {
    console.log('\n⏭️  No changes were needed');
  }
}

main().catch(console.error);
