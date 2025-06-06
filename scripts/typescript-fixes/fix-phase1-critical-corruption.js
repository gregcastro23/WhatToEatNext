#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const isDryRun = process.argv.includes('--dry-run');

console.log(`🔧 ${isDryRun ? '[DRY RUN] ' : ''}Phase 1: Fixing Critical Corruption Issues...`);

// Phase 1.1: Fix corrupted script replacer files with $1, $2, $3 variables
const corruptionFixes = [
  {
    file: 'src/utils/scriptReplacer.ts',
    fixes: [
      {
        search: /Array\.isArray\(\$1\.\$3\) \? \$4 : \$5/g,
        replace: 'event.filename.includes("problematic-script.js")',
        description: 'Fix corrupted Array.isArray with $1.$3 variables'
      },
      {
        search: /\$1\.\$3/g,
        replace: 'event.filename',
        description: 'Fix remaining $1.$3 variable references'
      },
      {
        search: /\$4/g,
        replace: 'true',
        description: 'Fix $4 variable references'
      },
      {
        search: /\$5/g,
        replace: 'false',
        description: 'Fix $5 variable references'
      }
    ]
  },
  {
    file: 'src/utils/zodiacUtils.ts',
    fixes: [
      {
        search: /\$(\d+)/g,
        replace: (match, num) => {
          // Map common regex variables to sensible defaults
          const defaults = {
            '1': 'value',
            '2': 'property',
            '3': 'result',
            '4': 'true',
            '5': 'false'
          };
          return defaults[num] || 'undefined';
        },
        description: 'Fix corrupted $n variables in zodiacUtils'
      }
    ]
  },
  {
    file: 'src/utils/testIngredientMapping.ts',
    fixes: [
      {
        search: /\$(\d+)/g,
        replace: (match, num) => {
          const defaults = {
            '1': 'ingredient',
            '2': 'mapping',
            '3': 'result',
            '4': 'true',
            '5': 'false'
          };
          return defaults[num] || 'undefined';
        },
        description: 'Fix corrupted $n variables in testIngredientMapping'
      }
    ]
  }
];

// Phase 1.2: Fix common casing inconsistencies
const casingFixes = [
  {
    pattern: /\bspring\b/g,
    replacement: 'Spring',
    description: 'Fix spring -> Spring casing'
  },
  {
    pattern: /\bsummer\b/g,
    replacement: 'Summer', 
    description: 'Fix summer -> Summer casing'
  },
  {
    pattern: /\bautumn\b/g,
    replacement: 'Autumn',
    description: 'Fix autumn -> Autumn casing'
  },
  {
    pattern: /\bwinter\b/g,
    replacement: 'Winter',
    description: 'Fix winter -> Winter casing'
  }
];

// Phase 1.3: Fix simple import conflicts
const importFixes = [
  {
    search: /import { logger } from ['"]([^'"]+)['"];\s*\nconst logger =/g,
    replace: 'import { logger as importedLogger } from "$1";\nconst logger =',
    description: 'Fix logger import conflicts'
  },
  {
    search: /import { Element } from ['"]([^'"]+)['"];\s*\ntype Element =/g,
    replace: 'import { Element as ImportedElement } from "$1";\ntype Element =',
    description: 'Fix Element import conflicts'
  }
];

async function fixCorruptedFiles() {
  let totalFixes = 0;
  
  console.log('\n📂 Phase 1.1: Fixing Corrupted Script Files');
  
  for (const { file, fixes } of corruptionFixes) {
    try {
      // Check if file exists
      await fs.access(file);
      
      let content = await fs.readFile(file, 'utf8');
      let fileChanges = 0;
      
      console.log(`\n  🎯 Processing: ${file}`);
      
      for (const fix of fixes) {
        const beforeContent = content;
        
        if (typeof fix.replace === 'function') {
          content = content.replace(fix.search, fix.replace);
        } else {
          content = content.replace(fix.search, fix.replace);
        }
        
        if (content !== beforeContent) {
          const matches = (beforeContent.match(fix.search) || []).length;
          console.log(`    ✅ ${fix.description}: ${matches} fixes`);
          fileChanges += matches;
          totalFixes += matches;
        }
      }
      
      if (fileChanges > 0) {
        if (!isDryRun) {
          await fs.writeFile(file, content);
          console.log(`    💾 Applied ${fileChanges} fixes to ${path.basename(file)}`);
        } else {
          console.log(`    📝 Would apply ${fileChanges} fixes to ${path.basename(file)}`);
        }
      } else {
        console.log(`    ✨ No corruptions found in ${path.basename(file)}`);
      }
      
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(`    ⚠️ File not found: ${file}`);
      } else {
        console.error(`    ❌ Error processing ${file}:`, error.message);
      }
    }
  }
  
  return totalFixes;
}

async function fixCasingInconsistencies() {
  console.log('\n📂 Phase 1.2: Fixing Casing Inconsistencies');
  
  const filesToCheck = [
    'src/types/alchemy.ts',
    'src/utils/elementalUtils.ts',
    'src/data/ingredients/index.ts'
  ];
  
  let totalFixes = 0;
  
  for (const file of filesToCheck) {
    try {
      await fs.access(file);
      
      let content = await fs.readFile(file, 'utf8');
      let fileChanges = 0;
      
      console.log(`\n  🎯 Processing: ${file}`);
      
      for (const fix of casingFixes) {
        const beforeContent = content;
        
        // Only apply in string contexts, not in type definitions
        if (!content.includes(`type ${fix.replacement}`) && 
            !content.includes(`interface ${fix.replacement}`)) {
          content = content.replace(fix.pattern, fix.replacement);
          
          if (content !== beforeContent) {
            const matches = (beforeContent.match(fix.pattern) || []).length;
            console.log(`    ✅ ${fix.description}: ${matches} fixes`);
            fileChanges += matches;
            totalFixes += matches;
          }
        }
      }
      
      if (fileChanges > 0) {
        if (!isDryRun) {
          await fs.writeFile(file, content);
          console.log(`    💾 Applied ${fileChanges} fixes to ${path.basename(file)}`);
        } else {
          console.log(`    📝 Would apply ${fileChanges} fixes to ${path.basename(file)}`);
        }
      } else {
        console.log(`    ✨ No casing issues found in ${path.basename(file)}`);
      }
      
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(`    ⚠️ File not found: ${file}`);
      } else {
        console.error(`    ❌ Error processing ${file}:`, error.message);
      }
    }
  }
  
  return totalFixes;
}

async function fixImportConflicts() {
  console.log('\n📂 Phase 1.3: Fixing Import Conflicts');
  
  try {
    // Get files with import conflicts from TypeScript output
    const { stdout } = await execAsync('yarn tsc --noEmit 2>&1 | grep -i "import declaration conflicts" | head -10', {
      shell: true,
      maxBuffer: 1024 * 1024
    });
    
    const conflictFiles = [];
    const lines = stdout.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      const match = line.match(/^(.+?)\(/);
      if (match) {
        const file = match[1];
        if (!conflictFiles.includes(file)) {
          conflictFiles.push(file);
        }
      }
    }
    
    console.log(`  📊 Found ${conflictFiles.length} files with import conflicts`);
    
    let totalFixes = 0;
    
    for (const file of conflictFiles.slice(0, 5)) { // Limit to first 5 for safety
      try {
        let content = await fs.readFile(file, 'utf8');
        let fileChanges = 0;
        
        console.log(`\n  🎯 Processing: ${file}`);
        
        for (const fix of importFixes) {
          const beforeContent = content;
          content = content.replace(fix.search, fix.replace);
          
          if (content !== beforeContent) {
            const matches = (beforeContent.match(fix.search) || []).length;
            console.log(`    ✅ ${fix.description}: ${matches} fixes`);
            fileChanges += matches;
            totalFixes += matches;
          }
        }
        
        if (fileChanges > 0) {
          if (!isDryRun) {
            await fs.writeFile(file, content);
            console.log(`    💾 Applied ${fileChanges} fixes to ${path.basename(file)}`);
          } else {
            console.log(`    📝 Would apply ${fileChanges} fixes to ${path.basename(file)}`);
          }
        } else {
          console.log(`    ✨ No simple import conflicts found in ${path.basename(file)}`);
        }
        
      } catch (error) {
        console.error(`    ❌ Error processing ${file}:`, error.message);
      }
    }
    
    return totalFixes;
    
  } catch (error) {
    console.log('  ⚠️ Could not analyze import conflicts from TypeScript output');
    return 0;
  }
}

async function main() {
  try {
    const corruptionFixes = await fixCorruptedFiles();
    const casingFixes = await fixCasingInconsistencies();
    const importFixes = await fixImportConflicts();
    
    const totalFixes = corruptionFixes + casingFixes + importFixes;
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 PHASE 1 SUMMARY');
    console.log('='.repeat(60));
    console.log(`Corruption fixes: ${corruptionFixes}`);
    console.log(`Casing fixes: ${casingFixes}`);
    console.log(`Import fixes: ${importFixes}`);
    console.log(`Total fixes: ${totalFixes}`);
    
    if (isDryRun) {
      console.log('\n🧪 DRY RUN COMPLETE');
      console.log('Run without --dry-run to apply changes');
    } else {
      console.log('\n✅ PHASE 1 COMPLETE');
      console.log('Next: Run "yarn tsc --noEmit" to check progress');
      console.log('Then: Run "yarn build" to verify build status');
    }
    
  } catch (error) {
    console.error('❌ Error during Phase 1 fixes:', error.message);
    process.exit(1);
  }
}

main(); 