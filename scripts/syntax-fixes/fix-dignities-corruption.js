#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDryRun = process.argv.includes('--dry-run');

// Target file with dignities corruption
const targetFile = 'src/calculations/core/planetaryInfluences.ts';

function fixDignitiesCorruption() {
  const fullPath = path.resolve(targetFile);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${targetFile}`);
    return { fixed: false, changes: 0 };
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;
  let totalChanges = 0;

  console.log(`\n🔍 Processing: ${targetFile}`);

  // Fix the specific dignities corruption patterns
  const patterns = [
    {
      pattern: /dignities\.\(Array\.isArray\(rulership\)\s*\?\s*rulership\.includes\(signKey\)\s*:\s*rulership\s*===\s*signKey\)\)/g,
      replacement: '(Array.isArray(dignities.rulership) ? dignities.rulership.includes(signKey) : dignities.rulership === signKey)',
      description: 'Fix dignities.rulership corruption'
    },
    {
      pattern: /dignities\.\(Array\.isArray\(exaltation\)\s*\?\s*exaltation\.includes\(signKey\)\s*:\s*exaltation\s*===\s*signKey\)\)/g,
      replacement: '(Array.isArray(dignities.exaltation) ? dignities.exaltation.includes(signKey) : dignities.exaltation === signKey)',
      description: 'Fix dignities.exaltation corruption'
    },
    {
      pattern: /dignities\.\(Array\.isArray\(detriment\)\s*\?\s*detriment\.includes\(signKey\)\s*:\s*detriment\s*===\s*signKey\)\)/g,
      replacement: '(Array.isArray(dignities.detriment) ? dignities.detriment.includes(signKey) : dignities.detriment === signKey)',
      description: 'Fix dignities.detriment corruption'
    },
    {
      pattern: /dignities\.\(Array\.isArray\(fall\)\s*\?\s*fall\.includes\(signKey\)\s*:\s*fall\s*===\s*signKey\)\)/g,
      replacement: '(Array.isArray(dignities.fall) ? dignities.fall.includes(signKey) : dignities.fall === signKey)',
      description: 'Fix dignities.fall corruption'
    }
  ];

  for (const { pattern, replacement, description } of patterns) {
    const matches = content.match(pattern);
    if (matches) {
      console.log(`  ✓ Found ${matches.length} instances of: ${description}`);
      content = content.replace(pattern, replacement);
      totalChanges += matches.length;
    }
  }

  if (totalChanges > 0) {
    if (!isDryRun) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`  ✅ Applied ${totalChanges} fixes to ${targetFile}`);
    } else {
      console.log(`  🔍 Would apply ${totalChanges} fixes to ${targetFile}`);
    }
    return { fixed: true, changes: totalChanges };
  } else {
    console.log(`  ℹ️  No dignities corruption patterns found in ${targetFile}`);
    return { fixed: false, changes: 0 };
  }
}

function main() {
  console.log('🚀 Dignities Corruption Fix Script');
  console.log(isDryRun ? '🔍 DRY RUN MODE - No files will be modified' : '✏️  LIVE MODE - Files will be modified');
  
  const result = fixDignitiesCorruption();

  console.log('\n📊 Summary:');
  console.log(`  Files processed: 1`);
  console.log(`  Files with fixes: ${result.fixed ? 1 : 0}`);
  console.log(`  Total fixes applied: ${result.changes}`);
  
  if (isDryRun) {
    console.log('\n🔍 This was a dry run. Use without --dry-run to apply fixes.');
  } else {
    console.log('\n✅ All fixes have been applied!');
  }
}

main(); 