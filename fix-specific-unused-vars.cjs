#!/usr/bin/env node

/**
 * Targeted Unused Variable Fix Script
 * Fixes specific unused variable patterns found in linting output
 */

const fs = require('fs');
const { execSync } = require('child_process');

// Get files with unused variables
function getFilesWithUnusedVars() {
  try {
    const lintOutput = execSync('yarn lint 2>&1', { encoding: 'utf8' });
    const lines = lintOutput.split('\n');

    const fileMap = new Map();
    let currentFile = null;

    lines.forEach(line => {
      // Check if this is a file path line
      if (line.startsWith('/') && (line.includes('.ts') || line.includes('.tsx'))) {
        currentFile = line.trim();
        return;
      }

      // Check if this is an unused variable error
      if (line.includes('no-unused-vars') && currentFile) {
        const lineMatch = line.match(/^\s*(\d+):(\d+)\s+error\s+'([^']+)'/);
        if (lineMatch) {
          const [, lineNum, , varName] = lineMatch;

          if (!fileMap.has(currentFile)) {
            fileMap.set(currentFile, []);
          }
          fileMap.get(currentFile).push({
            line: parseInt(lineNum),
            variable: varName,
            fullLine: line,
          });
        }
      }
    });

    return fileMap;
  } catch (error) {
    console.log('No unused variables found or error getting lint output');
    return new Map();
  }
}

// Fix unused variables in a file
function fixUnusedVariables(filePath, unusedVars) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let modified = false;
    let fixCount = 0;

    // Sort by line number descending to avoid line number shifts
    unusedVars.sort((a, b) => b.line - a.line);

    unusedVars.forEach(({ line, variable }) => {
      const lineIndex = line - 1;
      if (lineIndex >= 0 && lineIndex < lines.length) {
        const originalLine = lines[lineIndex];

        // Skip if already prefixed
        if (variable.startsWith('_') || variable.startsWith('UNUSED_')) {
          return;
        }

        // Different patterns for different variable types
        let newLine = originalLine;

        // Array destructuring pattern: [var1, var2] =
        if (
          originalLine.includes('[') &&
          originalLine.includes(']') &&
          originalLine.includes('=')
        ) {
          newLine = originalLine.replace(new RegExp(`\\b${variable}\\b`), `_${variable}`);
        }
        // Regular variable declaration: const/let/var variable =
        else if (originalLine.match(new RegExp(`\\b(const|let|var)\\s+${variable}\\b`))) {
          newLine = originalLine.replace(new RegExp(`\\b${variable}\\b`), `_${variable}`);
        }
        // Function parameter
        else if (originalLine.includes('(') && originalLine.includes(variable)) {
          newLine = originalLine.replace(new RegExp(`\\b${variable}\\b`), `_${variable}`);
        }
        // General case
        else {
          newLine = originalLine.replace(new RegExp(`\\b${variable}\\b`), `_${variable}`);
        }

        if (newLine !== originalLine) {
          lines[lineIndex] = newLine;
          modified = true;
          fixCount++;
          console.log(`  Fixed: ${variable} → _${variable}`);
        }
      }
    });

    if (modified) {
      // Create backup
      const backupPath = `${filePath}.unused-vars-backup`;
      fs.writeFileSync(backupPath, content);

      // Write fixed content
      fs.writeFileSync(filePath, lines.join('\n'));
      console.log(`✅ Fixed ${fixCount} unused variables in ${filePath}`);
      return fixCount;
    } else {
      console.log(`✓ No fixes needed in ${filePath}`);
      return 0;
    }
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return 0;
  }
}

// Main execution
function main() {
  console.log('🔧 Targeted Unused Variable Fix Script');
  console.log('=====================================');

  const filesWithUnusedVars = getFilesWithUnusedVars();

  if (filesWithUnusedVars.size === 0) {
    console.log('✅ No unused variables found!');
    return;
  }

  console.log(`📁 Found unused variables in ${filesWithUnusedVars.size} files`);
  console.log('');

  let totalFixes = 0;
  let filesFixed = 0;

  // Process first 10 files to be safe
  const filesToProcess = Array.from(filesWithUnusedVars.entries()).slice(0, 10);

  filesToProcess.forEach(([filePath, unusedVars]) => {
    console.log(`📝 Processing ${filePath} (${unusedVars.length} unused variables):`);
    const fixes = fixUnusedVariables(filePath, unusedVars);
    if (fixes > 0) {
      filesFixed++;
      totalFixes += fixes;
    }
    console.log('');
  });

  console.log('📊 Summary:');
  console.log(`   Files processed: ${filesToProcess.length}`);
  console.log(`   Files fixed: ${filesFixed}`);
  console.log(`   Total fixes: ${totalFixes}`);

  if (totalFixes > 0) {
    console.log('');
    console.log('🧪 Next steps:');
    console.log(
      '   1. Check unused variable count: yarn lint 2>&1 | grep "no-unused-vars" | wc -l',
    );
    console.log('   2. Verify build: yarn tsc --noEmit --skipLibCheck');
    console.log('   3. If issues occur, restore from .unused-vars-backup files');
  }
}

main();
