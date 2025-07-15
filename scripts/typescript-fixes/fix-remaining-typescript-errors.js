import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

// Check if dry-run mode
const isDryRun = process.argv.includes('--dry-run');

// Enhanced syntax error patterns to fix
const SYNTAX_FIXES = [
  // Fix malformed conditional expressions like: || []).length
  { 
    pattern: /(\w+)\s+\|\|\s+\[\]\)\.length/g, 
    replacement: '$1 || []).length',
    description: 'Fix malformed || [] expressions'
  },
  // Fix: searchResults.foods || searchResults.foods || []
  { 
    pattern: /(\w+\.\w+)\s+\|\|\s+\1\s+\|\|\s+\[\]/g, 
    replacement: '$1 || []',
    description: 'Fix redundant || expressions'
  },
  // Fix Array.isArray with malformed conditionals
  { 
    pattern: /Array\.isArray\(\(([^)]+)\)\s+\?\s+\(([^)]+)\s+:\s+\(([^)]+)\)\s+\{/g, 
    replacement: 'Array.isArray($1) ? ($2) : ($3)) {',
    description: 'Fix Array.isArray conditionals'
  },
  // Fix malformed conditionals like: (obj) ? (obj.includes('prop') : (obj === 'prop')
  { 
    pattern: /\((\w+)\)\s+\?\s+\(\1\.includes\('([^']+)'\)\s+:\s+\(\1\s+===\s+'([^']+)'\)\)\s+\{/g, 
    replacement: '($1 && Array.isArray($1) ? $1.includes(\'$2\') : $1 === \'$3\')) {',
    description: 'Fix malformed object conditionals'
  },
  // Fix expressions like: nutritionalProfile.antioxidants || []).length
  { 
    pattern: /(\w+\.\w+)\s+\|\|\s+\[\]\)\.length/g, 
    replacement: '($1 || []).length',
    description: 'Fix object property || [] expressions'
  },
  // Fix Object.(method to Object.method
  { 
    pattern: /Object\.\((\w+)/g, 
    replacement: 'Object.$1',
    description: 'Fix Object method calls'
  },
  // Fix Promise.(method to Promise.method  
  { 
    pattern: /Promise\.\((\w+)/g, 
    replacement: 'Promise.$1',
    description: 'Fix Promise method calls'
  },
  // Fix other method calls with malformed syntax
  { 
    pattern: /(\w+)\.\((\w+)/g, 
    replacement: '$1.$2',
    description: 'Fix general method calls'
  },
  // Fix standalone || []).method patterns
  { 
    pattern: /\|\|\s+\[\]\)\.(\w+)/g, 
    replacement: '|| []).$1',
    description: 'Fix standalone || [] method calls'
  },
  // Fix missing opening parenthesis in conditionals
  { 
    pattern: /if\s+\(!(\w+\.\w+)\s+\|\|\s+\1\s+\|\|\s+\[\]\)\.length\s+===\s+0\)/g, 
    replacement: 'if (!$1 || ($1 || []).length === 0)',
    description: 'Fix conditional expressions'
  },
];

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function fixSyntaxErrors(content, filePath) {
  let fixedContent = content;
  let hasChanges = false;
  const appliedFixes = [];
  
  for (const fix of SYNTAX_FIXES) {
    const originalContent = fixedContent;
    fixedContent = fixedContent.replace(fix.pattern, fix.replacement);
    if (originalContent !== fixedContent) {
      hasChanges = true;
      appliedFixes.push(fix.description);
    }
  }
  
  if (appliedFixes.length > 0) {
    console.log(`  🔧 Applied fixes to ${path.basename(filePath)}:`);
    appliedFixes.forEach(fix => console.log(`    - ${fix}`));
  }
  
  return { content: fixedContent, hasChanges };
}

async function getAllTsFiles() {
  const tsFiles = [];
  const scriptsDirs = [
    'scripts/ingredient-scripts',
    'scripts/typescript-fixes', 
    'scripts/syntax-fixes',
    'scripts/uncategorized'
  ];
  
  for (const dir of scriptsDirs) {
    const dirPath = path.resolve(ROOT_DIR, dir);
    
    if (await fileExists(dirPath)) {
      const files = await fs.readdir(dirPath);
      const dirTsFiles = files
        .filter(f => f.endsWith('.ts'))
        .map(f => path.resolve(dirPath, f));
      
      tsFiles.push(...dirTsFiles);
    }
  }
  
  return tsFiles;
}

async function testTypeScriptFile(filePath) {
  const { spawn } = await import('child_process');
  
  return new Promise((resolve) => {
    const tsc = spawn('npx', ['tsc', '--noEmit', filePath], {
      stdio: 'pipe',
      cwd: ROOT_DIR
    });
    
    let stderr = '';
    tsc.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    tsc.on('close', (code) => {
      resolve({ success: code === 0, errors: stderr });
    });
  });
}

async function main() {
  console.log('🚀 Starting TypeScript syntax error fixes...');
  console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'LIVE'}`);
  
  try {
    const tsFiles = await getAllTsFiles();
    console.log(`\n📝 Found ${tsFiles.length} TypeScript files to process`);
    
    let fixedCount = 0;
    let errorCount = 0;
    
    for (const filePath of tsFiles) {
      const relativePath = path.relative(ROOT_DIR, filePath);
      console.log(`\n📋 Processing: ${relativePath}`);
      
      // Test current state
      const testBefore = await testTypeScriptFile(filePath);
      
      if (testBefore.success) {
        console.log('  ✅ Already valid TypeScript');
        continue;
      }
      
      // Read and fix content
      const content = await fs.readFile(filePath, 'utf8');
      const { content: fixedContent, hasChanges } = await fixSyntaxErrors(content, filePath);
      
      if (hasChanges) {
        if (!isDryRun) {
          await fs.writeFile(filePath, fixedContent, 'utf8');
        }
        
        // Test after fixes
        if (!isDryRun) {
          const testAfter = await testTypeScriptFile(filePath);
          if (testAfter.success) {
            console.log('  ✅ Fixed successfully');
            fixedCount++;
          } else {
            console.log('  ⚠️  Still has errors after fixes');
            console.log('  📋 Remaining errors:');
            const errorLines = testAfter.errors.split('\n').slice(0, 5);
            errorLines.forEach(line => {
              if (line.trim()) console.log(`    ${line.trim()}`);
            });
            errorCount++;
          }
        } else {
          console.log('  📝 Would apply fixes (dry-run)');
        }
      } else {
        console.log('  ℹ️  No syntax patterns matched - manual fix needed');
        console.log('  📋 Current errors:');
        const errorLines = testBefore.errors.split('\n').slice(0, 3);
        errorLines.forEach(line => {
          if (line.trim()) console.log(`    ${line.trim()}`);
        });
        errorCount++;
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`  ✅ Fixed: ${fixedCount} files`);
    console.log(`  ❌ Still need manual fixes: ${errorCount} files`);
    
    if (isDryRun) {
      console.log('\n💡 Run without --dry-run to apply changes');
    } else if (errorCount > 0) {
      console.log('\n🔧 Files needing manual fixes should be reviewed individually');
    }
    
  } catch (error) {
    console.error('❌ Error during TypeScript fixes:', error);
    process.exit(1);
  }
}

main(); 