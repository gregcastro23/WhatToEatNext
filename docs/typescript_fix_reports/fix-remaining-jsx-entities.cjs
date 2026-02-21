#!/usr/bin/env node

/**
 * Fix Remaining JSX Entity Issues
 *
 * This script fixes the final 3 JSX entity issues that were missed by the previous script.
 */

const fs = require('fs');

// Specific fixes for remaining issues
const REMAINING_FIXES = [
  {
    file: 'src/app/alchemize-demo/page.tsx',
    pattern: /Greg's Energy/g,
    replacement: 'Greg&apos;s Energy',
    description: "Greg's Energy -> Greg&apos;s Energy"
  },
  {
    file: 'src/app/test/migrated-components/recipe-filters/page.tsx',
    pattern: /We've extracted/g,
    replacement: 'We&apos;ve extracted',
    description: "We've extracted -> We&apos;ve extracted"
  }
];

function applySpecificFixes() {
  console.log('🔧 Applying remaining JSX entity fixes...\n');

  let totalFixes = 0;

  for (const fix of REMAINING_FIXES) {
    try {
      if (!fs.existsSync(fix.file)) {
        console.log(`⚠️  File not found: ${fix.file}`);
        continue;
      }

      const content = fs.readFileSync(fix.file, 'utf8');
      const beforeCount = (content.match(fix.pattern) || []).length;
      const modifiedContent = content.replace(fix.pattern, fix.replacement);
      const afterCount = (modifiedContent.match(fix.pattern) || []).length;
      const fixesApplied = beforeCount - afterCount;

      if (fixesApplied > 0) {
        fs.writeFileSync(fix.file, modifiedContent, 'utf8');
        console.log(`✅ Fixed ${fixesApplied} issues in ${fix.file}: ${fix.description}`);
        totalFixes += fixesApplied;
      } else {
        console.log(`⚪ No matches found in ${fix.file} for: ${fix.description}`);
      }

    } catch (error) {
      console.error(`❌ Error processing ${fix.file}:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 Applied ${totalFixes} remaining JSX entity fixes`);

  if (totalFixes > 0) {
    console.log('✅ All remaining JSX entity fixes completed!');
  }
}

if (require.main === module) {
  applySpecificFixes();
}
