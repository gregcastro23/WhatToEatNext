#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

// Fix import ordering and resolution issues
function fixImportIssues(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix import ordering - add empty line between import groups
    const importOrderFix = content.replace(
      /(import .+ from ['"][^'"]+['"];)\n(import .+ from ['"]\.)/g,
      '$1\n\n$2',
    );

    if (importOrderFix !== content) {
      content = importOrderFix;
      modified = true;
      console.log(`  ✅ Fixed import ordering in ${filePath}`);
    }

    // Fix common import resolution issues
    const importFixes = [
      // Fix relative path imports
      {
        from: /import (.+) from ['"]\.\.\/\.\.\/utils\/(.+)['"];/g,
        to: "import $1 from '@/utils/$2';",
        description: 'Convert relative utils imports to @/ alias',
      },
      {
        from: /import (.+) from ['"]\.\.\/\.\.\/components\/(.+)['"];/g,
        to: "import $1 from '@/components/$2';",
        description: 'Convert relative components imports to @/ alias',
      },
      {
        from: /import (.+) from ['"]\.\.\/\.\.\/services\/(.+)['"];/g,
        to: "import $1 from '@/services/$2';",
        description: 'Convert relative services imports to @/ alias',
      },
      {
        from: /import (.+) from ['"]\.\.\/\.\.\/types\/(.+)['"];/g,
        to: "import $1 from '@/types/$2';",
        description: 'Convert relative types imports to @/ alias',
      },
    ];

    importFixes.forEach(fix => {
      if (fix.from.test(content)) {
        content = content.replace(fix.from, fix.to);
        modified = true;
        console.log(`  ✅ ${fix.description} in ${filePath}`);
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}: ${error.message}`);
    return false;
  }
}

// Get files with import issues
function getFilesWithImportIssues() {
  try {
    const output = execSync('yarn lint --format json', { encoding: 'utf8', stdio: 'pipe' });
    const results = JSON.parse(output);
    const filesWithImportIssues = new Set();

    results.forEach(result => {
      if (result.messages) {
        result.messages.forEach(msg => {
          if (
            msg.ruleId &&
            (msg.ruleId.includes('import/') ||
              msg.ruleId === 'import/order' ||
              msg.ruleId === 'import/no-unresolved')
          ) {
            filesWithImportIssues.add(result.filePath.replace(process.cwd() + '/', ''));
          }
        });
      }
    });

    return Array.from(filesWithImportIssues);
  } catch (error) {
    console.error('Error getting files with import issues:', error.message);
    return [];
  }
}

// Get TypeScript files to process
function getTypeScriptFiles() {
  const files = [];

  function scanDir(dir) {
    try {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = `${dir}/${item}`;
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.next')) {
          scanDir(fullPath);
        } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
          files.push(fullPath);
        }
      });
    } catch (error) {
      // Ignore errors
    }
  }

  scanDir('src');
  return files.slice(0, 50); // Limit to first 50 files
}

function main() {
  console.log('🚀 Import Resolution Optimization');
  console.log('=================================');

  // Try to get files with import issues from ESLint
  console.log('📊 Analyzing import issues...');
  let filesToProcess = getFilesWithImportIssues();

  if (filesToProcess.length === 0) {
    console.log('📁 No specific import issues found, processing TypeScript files...');
    filesToProcess = getTypeScriptFiles();
  }

  console.log(`Found ${filesToProcess.length} files to process`);

  let totalFixed = 0;

  // Apply fixes
  filesToProcess.forEach(file => {
    if (fixImportIssues(file)) {
      totalFixed++;
    }
  });

  // Validate build
  console.log('\n📋 Validating TypeScript compilation...');
  try {
    execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
    console.log('✅ TypeScript compilation successful');
  } catch (error) {
    console.error('❌ Build failed after fixes');
    console.error('Rolling back changes...');
    execSync('git restore .', { stdio: 'inherit' });
    return;
  }

  // Check improvement
  console.log('\n📊 Checking improvement...');
  try {
    const importIssues = execSync('yarn lint 2>&1 | grep -E "(import|export)" | wc -l', {
      encoding: 'utf8',
    });
    console.log(`📈 Remaining import-related warnings: ${parseInt(importIssues.trim())}`);
  } catch (error) {
    console.log('Could not count remaining import issues');
  }

  console.log(`\n📊 Summary: Fixed import issues in ${totalFixed} files`);
  console.log('\n📌 Next Steps:');
  console.log('1. Review changes with git diff');
  console.log('2. Run yarn lint to see updated issue count');
  console.log('3. Update TypeScript path aliases if needed');
  console.log('4. Commit changes when satisfied');
}

main();
