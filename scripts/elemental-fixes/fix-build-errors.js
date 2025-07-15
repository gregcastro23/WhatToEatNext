/**
 * fix-build-errors.js
 * 
 * Targeted script to fix specific TypeScript build errors identified in the codebase:
 * - Property name mismatches (preferredSeasons vs seasonalPreferences)
 * - Type property access issues (sign vs sunSign)
 * - Elemental affinity function usage
 * - Parameter naming inconsistencies
 * 
 * Features:
 * - ES modules
 * - Dry-run mode
 * - Targeted fixes for known issues
 * - No backup creation
 * 
 * Usage:
 * node scripts/elemental-fixes/fix-build-errors.js --dry-run
 * node scripts/elemental-fixes/fix-build-errors.js --apply
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

// Define specific fixes for known issues
const FIXES = [
  {
    file: 'src/calculations/alchemicalEngine.ts',
    changes: [
      {
        description: 'Fix preferredSeasons property access',
        find: /tradition\.preferredSeasons/g,
        replace: 'tradition.seasonalPreferences'
      },
      {
        description: 'Fix astrologicalState.sign property access', 
        find: /astrologicalState\.sign/g,
        replace: 'astrologicalState.sunSign'
      },
      {
        description: 'Fix ElementalAffinity return type usage',
        find: /switch\s*\(\s*affinity\s*\)\s*{/g,
        replace: 'switch (affinity.compatibility) {'
      },
      {
        description: 'Fix astrologicalProfile property access',
        find: /\.astrologicalPropertiesProfile/g,
        replace: '.astrologicalProfile'
      },
      {
        description: 'Fix NaturalInfluenceParams season parameter',
        find: /currentSeason:\s*season/g,
        replace: 'season: season'
      }
    ]
  }
];

// Process a single file with specific fixes
function processFile(fileConfig) {
  const { file, changes } = fileConfig;
  const fullPath = path.join(rootDir, file);
  
  if (!fs.existsSync(fullPath)) {
    console.warn(`File not found: ${file}`);
    return { processed: false, changes: [] };
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;
  const appliedChanges = [];
  
  changes.forEach(change => {
    const { description, find, replace } = change;
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

// Validate TypeScript after changes
function validateTypeScript() {
  console.log('\n🔍 Validating TypeScript...');
  
  try {
    const { execSync } = require('child_process');
    const result = execSync('yarn tsc --noEmit', { 
      cwd: rootDir, 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    console.log('✅ TypeScript validation passed!');
    return true;
  } catch (error) {
    console.log('❌ TypeScript validation failed:');
    console.log(error.stdout || error.message);
    return false;
  }
}

// Main execution
function main() {
  console.log('🔧 Build Errors Fix - Targeted Version');
  console.log(`Mode: ${isDryRun ? 'DRY RUN' : shouldApply ? 'APPLY CHANGES' : 'PREVIEW'}`);
  console.log('');
  
  if (!isDryRun && !shouldApply) {
    console.log('⚠️  No action specified. Use --dry-run to preview or --apply to make changes.');
    process.exit(0);
  }
  
  let totalChanges = 0;
  const processedFiles = [];
  
  FIXES.forEach(fileConfig => {
    const result = processFile(fileConfig);
    
    if (result.changes.length > 0) {
      processedFiles.push({ file: fileConfig.file, ...result });
      totalChanges += result.changes.reduce((sum, change) => sum + change.matchCount, 0);
      
      console.log(`📄 ${fileConfig.file} (${result.changes.length} fix types)`);
      result.changes.forEach(change => {
        console.log(`   ✓ ${change.description} (${change.matchCount} instances)`);
        console.log(`     ${change.find} → ${change.replace}`);
      });
      console.log('');
    }
  });
  
  // Summary
  console.log(`\n📊 Summary:`);
  console.log(`   Files processed: ${FIXES.length}`);
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
    
    // Validate TypeScript after changes
    if (!validateTypeScript()) {
      console.log('\n⚠️  TypeScript validation failed. You may need to review the changes.');
    }
  } else if (isDryRun && processedFiles.length > 0) {
    console.log('\n🔍 This was a dry run. Use --apply to make these changes.');
  } else if (processedFiles.length === 0) {
    console.log('\n✨ No changes needed! All targeted issues appear to be resolved.');
  }
}

// Run the script
main(); 