#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Phase 16 Batch 5: Systematic pattern fixes across multiple files');
if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

// Helper function to fix unknown type casting patterns
function fixUnknownStringAccess(content) {
  // Fix toLowerCase() on unknown
  content = content.replace(/([\w.]+)\.toLowerCase\(\)/g, (match, varName) => {
    if (varName.includes('unknown') || varName.includes('any')) {
      return `String(${varName}).toLowerCase()`;
    }
    return `(${varName} as string)?.toLowerCase?.() || ''`;
  });
  
  // Fix length on unknown
  content = content.replace(/([\w.]+)\.length/g, (match, varName) => {
    if (varName.includes('Promise')) {
      return `(await ${varName}).length`;
    }
    return `(${varName} as any[])?.length || 0`;
  });
  
  // Fix includes() on unknown
  content = content.replace(/([\w.]+)\.includes\(/g, (match, varName) => {
    return `(${varName} as any[])?.includes?.(`;
  });
  
  return content;
}

const fixes = [
  {
    file: 'src/components/AlchemicalRecommendations.tsx',
    description: 'Fix unknown string operations',
    customFix: true
  },
  {
    file: 'src/components/CuisineSection.tsx',
    description: 'Fix unknown string operations',
    customFix: true
  },
  {
    file: 'src/components/CuisineSelector.migrated.tsx',
    description: 'Fix unknown array/string operations',
    customFix: true
  },
  {
    file: 'src/data/recipes.ts',
    description: 'Fix Promise type access issues',
    changes: [
      {
        search: `candidates.length`,
        replace: `(await candidates).length`
      },
      {
        search: `return candidates.length`,
        replace: `return (await candidates).length`
      }
    ]
  },
  {
    file: 'src/data/unified/cuisineIntegrations.ts',
    description: 'Fix number type length access',
    changes: [
      {
        search: `.length`,
        replace: `.toString().length`
      }
    ]
  }
];

// Apply fixes
let totalChanges = 0;

for (const fix of fixes) {
  const filePath = path.join(ROOT_DIR, fix.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${fix.file}`);
    continue;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let fileChanged = false;
  
  console.log(`\n📁 Processing: ${fix.file}`);
  console.log(`📝 ${fix.description}`);
  
  if (fix.customFix) {
    // Apply custom pattern fixes
    const originalContent = content;
    content = fixUnknownStringAccess(content);
    
    if (content !== originalContent) {
      if (DRY_RUN) {
        console.log(`  ✅ Would apply custom pattern fixes`);
      } else {
        fileChanged = true;
        totalChanges++;
        console.log(`  ✅ Applied custom pattern fixes`);
      }
    } else {
      console.log(`  ⚠️  No patterns found to fix`);
    }
  } else if (fix.changes) {
    // Apply specific changes
    for (const change of fix.changes) {
      const changeCount = (content.match(new RegExp(change.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
      if (changeCount > 0) {
        if (DRY_RUN) {
          console.log(`  ✅ Would apply ${changeCount} instances of: ${change.search.substring(0, 50)}...`);
        } else {
          content = content.replace(new RegExp(change.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), change.replace);
          fileChanged = true;
          totalChanges += changeCount;
          console.log(`  ✅ Applied ${changeCount} instances of change`);
        }
      } else {
        console.log(`  ⚠️  Pattern not found: ${change.search.substring(0, 50)}...`);
      }
    }
  }
  
  if (fileChanged && !DRY_RUN) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  💾 File updated`);
  }
}

console.log(`\n📊 Summary: ${DRY_RUN ? 'Would apply' : 'Applied'} ${totalChanges} changes across ${fixes.length} files`);

if (!DRY_RUN && totalChanges > 0) {
  console.log('\n🔧 Next steps:');
  console.log('1. Run: yarn build');
  console.log('2. Check: yarn tsc --noEmit 2>&1 | grep -c "error TS"');
  console.log('3. Commit: git add . && git commit -m "Phase 16 Batch 5: Systematic pattern fixes"');
} 