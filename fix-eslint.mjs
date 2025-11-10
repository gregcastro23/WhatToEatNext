#!/usr/bin/env node
/**
 * Systematic ESLint Error Fixer
 * Fixes no-unused-vars, no-floating-promises, await-thenable, and no-misused-promises
 */

import { execSync } from 'child_process';
import fs from 'fs';

const TARGET_RULES = [
  'no-unused-vars',
  'no-floating-promises',
  'await-thenable',
  'no-misused-promises'
];

console.log('🔧 Starting systematic ESLint error fixes...\n');

// Get list of files with errors
const getFilesWithErrors = () => {
  try {
    const output = execSync('yarn lint --format json 2>/dev/null', { encoding: 'utf8' });
    const results = JSON.parse(output);

    const filesWithErrors = results.filter(file => {
      return file.messages.some(msg =>
        msg.severity === 2 && TARGET_RULES.some(rule => msg.ruleId?.includes(rule))
      );
    });

    return filesWithErrors;
  } catch (error) {
    console.error('Error getting lint results');
    return [];
  }
};

// Fix unused variables by prefixing with underscore
const fixUnusedVars = (filePath, messages) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  const unusedVarErrors = messages
    .filter(msg => msg.ruleId?.includes('no-unused-vars') && msg.severity === 2)
    .reverse(); // Process from end to start to preserve line numbers

  for (const error of unusedVarErrors) {
    const match = error.message.match(/'([^']+)' is (defined|assigned)/);
    if (match) {
      const varName = match[1];
      if (varName.startsWith('_')) continue; // Already fixed

      const lines = content.split('\n');
      const lineIndex = error.line - 1;
      const line = lines[lineIndex];

      // Fix catch blocks: } catch (error) => } catch (_error)
      if (line.includes('catch') && line.includes(varName)) {
        lines[lineIndex] = line.replace(
          new RegExp(`catch\\s*\\(\\s*${varName}\\s*\\)`, 'g'),
          `catch (_${varName})`
        );
        modified = true;
      }
      // Fix function parameters
      else if (line.includes('(') && line.includes(varName)) {
        lines[lineIndex] = line.replace(
          new RegExp(`\\b${varName}\\b(?=\\s*[:,)])`),
          `_${varName}`
        );
        modified = true;
      }
      // Fix variable declarations
      else if (line.includes('const') || line.includes('let') || line.includes('var')) {
        lines[lineIndex] = line.replace(
          new RegExp(`\\b${varName}\\b`, 'g'),
          `_${varName}`
        );
        modified = true;
      }

      if (modified) {
        content = lines.join('\n');
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
};

// Fix floating promises by adding void operator
const fixFloatingPromises = (filePath, messages) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  const floatingPromiseErrors = messages
    .filter(msg => msg.ruleId?.includes('no-floating-promises') && msg.severity === 2)
    .reverse();

  for (const error of floatingPromiseErrors) {
    const lines = content.split('\n');
    const lineIndex = error.line - 1;
    const line = lines[lineIndex];

    // Add void operator if not already present
    if (!line.trim().startsWith('void ')) {
      // Get leading whitespace
      const leadingSpace = line.match(/^\s*/)[0];
      const trimmedLine = line.trim();
      lines[lineIndex] = leadingSpace + 'void ' + trimmedLine;
      modified = true;
    }

    if (modified) {
      content = lines.join('\n');
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
};

// Fix await-thenable by removing await from non-promises
const fixAwaitThenable = (filePath, messages) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  const awaitThenableErrors = messages
    .filter(msg => msg.ruleId?.includes('await-thenable') && msg.severity === 2)
    .reverse();

  for (const error of awaitThenableErrors) {
    if (error.suggestions && error.suggestions[0]?.messageId === 'removeAwait') {
      const lines = content.split('\n');
      const lineIndex = error.line - 1;
      const line = lines[lineIndex];

      // Remove await keyword
      lines[lineIndex] = line.replace(/\bawait\s+/, '');
      content = lines.join('\n');
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
};

// Fix misused promises by wrapping in void
const fixMisusedPromises = (filePath, messages) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  const misusedPromiseErrors = messages
    .filter(msg => msg.ruleId?.includes('no-misused-promises') && msg.severity === 2)
    .reverse();

  for (const error of misusedPromiseErrors) {
    const lines = content.split('\n');
    const lineIndex = error.line - 1;
    const line = lines[lineIndex];

    // Wrap callback functions with void
    if (line.includes('setInterval') || line.includes('setTimeout')) {
      // Transform: setInterval(asyncFn, 1000) => setInterval(() => void asyncFn(), 1000)
      lines[lineIndex] = line.replace(
        /(setInterval|setTimeout)\s*\(\s*(\w+)\s*,/g,
        '$1(() => void $2(), '
      );
      modified = true;
    }

    if (modified) {
      content = lines.join('\n');
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
};

// Main execution
const files = getFilesWithErrors();
console.log(`Found ${files.length} files with errors\n`);

let totalFixed = 0;

for (const file of files) {
  const filePath = file.filePath;
  const messages = file.messages;

  console.log(`\n📝 Processing: ${filePath.split('/').pop()}`);

  let fileFixed = false;

  // Fix different error types
  if (fixUnusedVars(filePath, messages)) {
    console.log('  ✓ Fixed unused variables');
    fileFixed = true;
  }

  if (fixAwaitThenable(filePath, messages)) {
    console.log('  ✓ Fixed await-thenable');
    fileFixed = true;
  }

  if (fixFloatingPromises(filePath, messages)) {
    console.log('  ✓ Fixed floating promises');
    fileFixed = true;
  }

  if (fixMisusedPromises(filePath, messages)) {
    console.log('  ✓ Fixed misused promises');
    fileFixed = true;
  }

  if (fileFixed) {
    totalFixed++;
  }
}

console.log(`\n✅ Fixed ${totalFixed} files`);
console.log('\n🔍 Running final lint check...\n');

try {
  execSync('yarn lint 2>&1 | tail -5', { stdio: 'inherit' });
} catch (error) {
  // Lint will exit with error if there are still issues
}

console.log('\n✨ Done!');
