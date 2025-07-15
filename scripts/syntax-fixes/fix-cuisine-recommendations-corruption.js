#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDryRun = process.argv.includes('--dry-run');

// Target file with corruption
const targetFile = 'src/calculations/culinary/cuisineRecommendations.ts';

function fixCuisineRecommendationsCorruption() {
  const fullPath = path.resolve(targetFile);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${targetFile}`);
    return { fixed: false, changes: 0 };
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;
  let totalChanges = 0;

  console.log(`\n🔍 Processing: ${targetFile}`);

  // Fix the specific corruption patterns
  const patterns = [
    {
      pattern: /\.slice\(0,\s*\(3\)\?\s*\|\|\s*\[\]\)/g,
      replacement: '.slice(0, 3)',
      description: 'Fix corrupted slice(0, (3)? || [])'
    },
    {
      pattern: /elementalCuisines\.cuisines\s+\|\|\s*\[\]\.forEach/g,
      replacement: '(elementalCuisines.cuisines || []).forEach',
      description: 'Fix corrupted elementalCuisines.cuisines array access'
    },
    {
      pattern: /Water:\s*{/g,
      replacement: 'Water: {',
      description: 'Fix water casing to Water'
    },
    {
      pattern: /Earth:\s*{/g,
      replacement: 'Earth: {',
      description: 'Fix earth casing to Earth'
    },
    {
      pattern: /'DAiry'/g,
      replacement: "'Dairy'",
      description: 'Fix DAiry to Dairy'
    },
    {
      pattern: /{ Fire: 0\.25, Water: 0\.25, Air: 0\.25, Earth: 0\.25\s+}/g,
      replacement: '{ Fire: 0.25, Water: 0.25, Air: 0.25, Earth: 0.25 }',
      description: 'Fix object formatting'
    },
    {
      pattern: /{ Fire: 0\.4, Water: 0\.2, Air: 0\.2, Earth: 0\.2\s+}/g,
      replacement: '{ Fire: 0.4, Water: 0.2, Air: 0.2, Earth: 0.2 }',
      description: 'Fix object formatting'
    },
    {
      pattern: /{ Fire: 0\.15, Water: 0\.45, Air: 0\.2, Earth: 0\.2\s+}/g,
      replacement: '{ Fire: 0.15, Water: 0.45, Air: 0.2, Earth: 0.2 }',
      description: 'Fix object formatting'
    },
    {
      pattern: /{ Fire: 0\.2, Water: 0\.2, Air: 0\.4, Earth: 0\.2\s+}/g,
      replacement: '{ Fire: 0.2, Water: 0.2, Air: 0.4, Earth: 0.2 }',
      description: 'Fix object formatting'
    },
    {
      pattern: /{ Fire: 0\.2, Water: 0\.2, Air: 0\.15, Earth: 0\.45\s+}/g,
      replacement: '{ Fire: 0.2, Water: 0.2, Air: 0.15, Earth: 0.45 }',
      description: 'Fix object formatting'
    },
    {
      pattern: /{ Fire: 0\.3, Water: 0\.2, Air: 0\.3, Earth: 0\.2\s+}/g,
      replacement: '{ Fire: 0.3, Water: 0.2, Air: 0.3, Earth: 0.2 }',
      description: 'Fix object formatting'
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
    console.log(`  ℹ️  No corruption patterns found in ${targetFile}`);
    return { fixed: false, changes: 0 };
  }
}

function main() {
  console.log('🚀 Cuisine Recommendations Corruption Fix Script');
  console.log(isDryRun ? '🔍 DRY RUN MODE - No files will be modified' : '✏️  LIVE MODE - Files will be modified');
  
  const result = fixCuisineRecommendationsCorruption();

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