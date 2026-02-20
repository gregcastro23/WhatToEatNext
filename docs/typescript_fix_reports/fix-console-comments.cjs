#!/usr/bin/env node

/**
 * Fix malformed console comments that are causing syntax errors
 */

const fs = require('fs');
const path = require('path');

function fixConsoleComments() {
  console.log('Fixing malformed console comments...');

  const files = [];

  function walkDir(dir) {
    try {
      const items = fs.readdirSync(dir);

      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() &&
            !item.startsWith('.') &&
            item !== 'node_modules') {
          walkDir(fullPath);
        } else if (stat.isFile() &&
                   (item.endsWith('.ts') || item.endsWith('.tsx')) &&
                   !item.endsWith('.d.ts')) {
          files.push(fullPath);
        }
      });
    } catch (error) {
      // Skip directories we can't read
    }
  }

  walkDir('src');

  let fixedFiles = 0;
  let totalFixes = 0;

  files.forEach(file => {
    try {
      let content = fs.readFileSync(file, 'utf8');
      const originalContent = content;

      // Fix malformed console comments that span multiple lines
      // Pattern: // console.method( // Commented for linting
      //            arg1,
      //            arg2,
      //          );

      const lines = content.split('\n');
      let modified = false;
      let i = 0;

      while (i < lines.length) {
        const line = lines[i];

        // Look for the malformed pattern
        if (line.includes('// console.') && line.includes('( // Commented for linting')) {
          // This is the start of a malformed console comment
          let j = i + 1;
          let commentBlock = [line];

          // Find the end of the console call (look for closing parenthesis and semicolon)
          while (j < lines.length) {
            commentBlock.push(lines[j]);
            if (lines[j].trim().endsWith(');')) {
              break;
            }
            j++;
          }

          // Replace the entire block with a single line comment
          const consoleMethod = line.match(/\/\/ (console\.\w+)\(/)?.[1] || 'console.log';
          const replacement = `        // ${consoleMethod}(...); // Commented for linting`;

          // Remove the old lines and insert the new one
          lines.splice(i, j - i + 1, replacement);
          modified = true;
          totalFixes++;

          // Continue from the new position
          i++;
        } else {
          i++;
        }
      }

      if (modified) {
        content = lines.join('\n');
        fs.writeFileSync(file, content);
        fixedFiles++;
        console.log(`Fixed console comments in: ${file.replace(process.cwd(), '.')}`);
      }

    } catch (error) {
      console.error(`Error processing ${file}: ${error.message}`);
    }
  });

  console.log(`✅ Fixed ${totalFixes} console comments in ${fixedFiles} files`);
}

if (require.main === module) {
  fixConsoleComments();
}

module.exports = { fixConsoleComments };
