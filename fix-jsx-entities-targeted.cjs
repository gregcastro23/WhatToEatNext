#!/usr/bin/env node

/**
 * Targeted JSX Entity Fixes - Conservative Approach
 *
 * This script fixes the remaining JSX entity issues by targeting specific
 * unescaped apostrophes in JSX text content while avoiding template literals
 * and other complex patterns that could cause syntax errors.
 */

const fs = require('fs');
const path = require('path');

// Files with JSX entity issues (from lint output)
const FILES_TO_FIX = [
  'src/app/[...not-found]/error.tsx',
  'src/app/alchemize-demo/page.tsx',
  'src/app/not-found.tsx',
  'src/app/test/migrated-components/recipe-filters/page.tsx',
  'src/pages/cuisines/[id].tsx',
  'src/pages/recipes/[id].tsx',
  'src/pages/sauces/[cuisine]/[id].tsx'
];

// Specific patterns to fix - very conservative approach
const JSX_ENTITY_FIXES = [
  // Pattern: "doesn't" in JSX text content
  {
    pattern: /(\s+)doesn't(\s+)/g,
    replacement: '$1doesn&apos;t$2',
    description: "doesn't -> doesn&apos;t"
  },
  // Pattern: "you're" in JSX text content
  {
    pattern: /(\s+)you're(\s+)/g,
    replacement: '$1you&apos;re$2',
    description: "you're -> you&apos;re"
  },
  // Pattern: "looking for doesn't exist" - specific case
  {
    pattern: /looking for doesn't exist/g,
    replacement: 'looking for doesn&apos;t exist',
    description: "looking for doesn't exist -> looking for doesn&apos;t exist"
  },
  // Pattern: "doesn't exist or" - specific case
  {
    pattern: /doesn't exist or/g,
    replacement: 'doesn&apos;t exist or',
    description: "doesn't exist or -> doesn&apos;t exist or"
  }
];

function fixJSXEntitiesInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modifiedContent = content;
    let changesMade = 0;

    // Apply each fix pattern
    for (const fix of JSX_ENTITY_FIXES) {
      const beforeCount = (modifiedContent.match(fix.pattern) || []).length;
      modifiedContent = modifiedContent.replace(fix.pattern, fix.replacement);
      const afterCount = (modifiedContent.match(fix.pattern) || []).length;
      const fixesApplied = beforeCount - afterCount;

      if (fixesApplied > 0) {
        console.log(`  ✓ Applied ${fixesApplied} fixes: ${fix.description}`);
        changesMade += fixesApplied;
      }
    }

    // Only write if changes were made
    if (changesMade > 0) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
      console.log(`✅ Fixed ${changesMade} JSX entity issues in ${filePath}`);
      return changesMade;
    } else {
      console.log(`⚪ No JSX entity issues found in ${filePath}`);
      return 0;
    }

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

function main() {
  console.log('🔧 Starting targeted JSX entity fixes...\n');

  let totalFixes = 0;
  let filesProcessed = 0;
  let filesWithFixes = 0;

  for (const filePath of FILES_TO_FIX) {
    if (fs.existsSync(filePath)) {
      console.log(`\n📄 Processing: ${filePath}`);
      const fixes = fixJSXEntitiesInFile(filePath);
      totalFixes += fixes;
      filesProcessed++;
      if (fixes > 0) {
        filesWithFixes++;
      }
    } else {
      console.log(`⚠️  File not found: ${filePath}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 JSX Entity Fixes Summary:');
  console.log(`   Files processed: ${filesProcessed}`);
  console.log(`   Files with fixes: ${filesWithFixes}`);
  console.log(`   Total fixes applied: ${totalFixes}`);

  if (totalFixes > 0) {
    console.log('\n✅ JSX entity fixes completed successfully!');
    console.log('🔍 Run yarn lint to verify the fixes.');
  } else {
    console.log('\n⚪ No JSX entity issues found to fix.');
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixJSXEntitiesInFile, JSX_ENTITY_FIXES };
