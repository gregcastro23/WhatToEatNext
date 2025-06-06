/**
 * fix-remaining-casing.js
 * 
 * Targeted script to fix remaining casing issues that weren't caught
 * by the main elemental casing script.
 * 
 * Usage:
 * node scripts/elemental-fixes/fix-remaining-casing.js --dry-run
 * node scripts/elemental-fixes/fix-remaining-casing.js --apply
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const shouldApply = args.includes('--apply');

// Specific fixes for remaining issues
const TARGETED_FIXES = [
  {
    file: 'src/calculations/alchemicalCalculations.ts',
    fixes: [
      {
        description: 'Fix elementalBalance object property casing',
        find: /Earth:\s*elementalBalance\.Earth/g,
        replace: 'Earth: elementalBalance.Earth'
      },
      {
        description: 'Fix Water property access in elementalBalance',
        find: /Water:\s*elementalBalance\.Water/g,
        replace: 'Water: elementalBalance.Water'
      },
      {
        description: 'Fix earth property access in elemental checks',
        find: /elem === 'Earth'/g,
        replace: "elem === 'Earth'"
      },
      {
        description: 'Fix water property access in elemental checks', 
        find: /elem === 'Water'/g,
        replace: "elem === 'Water'"
      },
      {
        description: 'Fix elementalBalance object key references',
        find: /elementalBalance\[elem as keyof typeof elementalBalance\]/g,
        replace: 'elementalBalance[elem.charAt(0).toUpperCase() + elem.slice(1) as keyof typeof elementalBalance]'
      }
    ]
  }
];

// Process a single file with targeted fixes
function processFileWithFixes(fileConfig) {
  const { file, fixes } = fileConfig;
  const fullPath = path.join(rootDir, file);
  
  if (!fs.existsSync(fullPath)) {
    console.warn(`File not found: ${file}`);
    return { processed: false, changes: [] };
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;
  const appliedChanges = [];
  
  fixes.forEach(fix => {
    const { description, find, replace } = fix;
    const matches = content.match(find);
    
    if (matches) {
      content = content.replace(find, replace);
      appliedChanges.push({
        description,
        matchCount: matches.length,
        find: find.toString(),
        replace
      });
    }
  });
  
  return {
    processed: content !== originalContent,
    changes: appliedChanges,
    originalContent,
    newContent: content
  };
}

// Main execution
function main() {
  console.log('🔧 Remaining Casing Issues Fix');
  console.log(`Mode: ${isDryRun ? 'DRY RUN' : shouldApply ? 'APPLY CHANGES' : 'PREVIEW'}`);
  console.log('');
  
  if (!isDryRun && !shouldApply) {
    console.log('⚠️  No action specified. Use --dry-run to preview or --apply to make changes.');
    process.exit(0);
  }
  
  let totalChanges = 0;
  const processedFiles = [];
  
  TARGETED_FIXES.forEach(fileConfig => {
    const result = processFileWithFixes(fileConfig);
    
    if (result.changes.length > 0) {
      processedFiles.push({ file: fileConfig.file, ...result });
      totalChanges += result.changes.reduce((sum, change) => sum + change.matchCount, 0);
      
      console.log(`📄 ${fileConfig.file} (${result.changes.length} fix types)`);
      result.changes.forEach(change => {
        console.log(`   ✓ ${change.description} (${change.matchCount} instances)`);
      });
      console.log('');
    }
  });
  
  // Summary
  console.log(`\n📊 Summary:`);
  console.log(`   Files processed: ${TARGETED_FIXES.length}`);
  console.log(`   Files with changes: ${processedFiles.length}`);
  console.log(`   Total changes: ${totalChanges}`);
  
  // Apply changes if requested
  if (shouldApply && processedFiles.length > 0) {
    console.log('\n✅ Applying changes...');
    processedFiles.forEach(({ file, newContent }) => {
      const fullPath = path.join(rootDir, file);
      fs.writeFileSync(fullPath, newContent, 'utf8');
      console.log(`   ✓ ${file}`);
    });
    console.log(`\n🎉 Applied changes to ${processedFiles.length} files!`);
  } else if (isDryRun && processedFiles.length > 0) {
    console.log('\n🔍 This was a dry run. Use --apply to make these changes.');
  } else if (processedFiles.length === 0) {
    console.log('\n✨ No changes needed! All targeted issues appear to be resolved.');
  }
}

// Run the script
main(); 