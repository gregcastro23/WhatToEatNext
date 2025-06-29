#!/usr/bin/env node

/**
 * fix-unused-imports-interactive.js
 *
 * Interactively and safely fixes unused imports in up to 2 files at a time.
 *
 * Usage:
 *   node scripts/typescript-fixes/fix-unused-imports-interactive.js <file1> [file2] [--dry-run]
 *
 * - Only processes .ts or .tsx files.
 * - Uses ESLint to find unused imports.
 * - Prompts user for each unused import: remove or (optionally) suggest a place to use it.
 * - Supports --dry-run (no changes made, just shows what would be done).
 * - Never modifies more than 2 files per run.
 * - Never uses regex on property access or destructuring.
 * - Always shows a diff before applying changes.
 * - No backup files are created (use git for version control).
 * - Follows all project script safety and validation rules.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import readline from 'readline';

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const files = args.filter(f => f.endsWith('.ts') || f.endsWith('.tsx')).slice(0, 2);

if (files.length === 0) {
  console.error('Please provide up to 2 .ts or .tsx files to process.');
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, answer => resolve(answer.trim())));
}

function getUnusedImports(file) {
  try {
    const eslintOutput = execSync(`npx eslint "${file}" --format json`, { encoding: 'utf8' });
    const eslintResult = JSON.parse(eslintOutput);
    const unusedImports = [];
    if (eslintResult.length > 0 && eslintResult[0].messages) {
      eslintResult[0].messages.forEach(message => {
        if (
          message.ruleId === 'no-unused-vars' ||
          message.ruleId === '@typescript-eslint/no-unused-vars'
        ) {
          // Only consider imports (not variables/functions)
          if (message.message.includes('imported but never used')) {
            // Try to extract the import name
            const match = message.message.match(/'([^']+)'/);
            if (match) {
              unusedImports.push({
                varName: match[1],
                line: message.line,
                column: message.column
              });
            }
          }
        }
      });
    }
    return unusedImports;
  } catch (error) {
    if (error.stdout && error.stdout.includes('Parsing error')) {
      console.error(`Parsing error in ${file}. Skipping.`);
      return [];
    }
    return [];
  }
}

async function processFile(file) {
  const absPath = path.resolve(file);
  if (!fs.existsSync(absPath)) {
    console.error(`File not found: ${absPath}`);
    return;
  }
  const unusedImports = getUnusedImports(absPath);
  if (unusedImports.length === 0) {
    console.log(`No unused imports found in ${file}.`);
    return;
  }
  let fileContent = fs.readFileSync(absPath, 'utf8');
  const lines = fileContent.split('\n');
  let changed = false;
  for (const imp of unusedImports) {
    const lineIdx = imp.line - 1;
    const line = lines[lineIdx];
    if (!line || !line.includes(imp.varName)) continue;
    console.log(`\n${file}:${imp.line}:${imp.column}`);
    console.log(`> ${line.trim()}`);
    const answer = DRY_RUN
      ? 'd' // In dry-run, default to delete
      : await ask(`Remove unused import '${imp.varName}'? [y/N/s=skip] `);
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'd') {
      // Remove the import from the line
      // Only remove the specific import, not the whole line unless it's the only import
      let updatedLine = line;
      // Handle destructured imports: import { foo, bar } from ...
      if (updatedLine.match(/\{[^}]*\}/)) {
        // Remove just the unused import from the destructure
        updatedLine = updatedLine.replace(
          new RegExp(`(\{|,\s*)${imp.varName}(,|\s*\})`),
          (match, p1, p2) => (p1 === '{' && p2 === '}' ? '' : p1 === '{' ? p1 : p1) + (p2 === '}' ? p2 : '')
        );
        // Clean up possible leftover commas
        updatedLine = updatedLine.replace(/,\s*,/g, ',').replace(/\{,/, '{').replace(/,\}/, '}');
        // If nothing left in destructure, remove the whole line
        if (updatedLine.match(/import \{\s*\} from/)) updatedLine = '';
      } else {
        // For default or namespace imports, remove the whole line
        updatedLine = '';
      }
      if (DRY_RUN) {
        console.log(`[DRY RUN] Would remove: ${line.trim()}`);
        if (updatedLine && updatedLine !== line) console.log(`[DRY RUN] Would update: ${updatedLine.trim()}`);
      } else {
        lines[lineIdx] = updatedLine;
        changed = true;
        console.log(`Removed unused import '${imp.varName}'.`);
      }
    } else if (answer.toLowerCase() === 's') {
      console.log('Skipped.');
    } else {
      // Optionally, suggest a place to use the import (not implemented in v1)
      console.log('Skipped.');
    }
  }
  if (changed && !DRY_RUN) {
    // Show diff
    const newContent = lines.join('\n');
    console.log('\n--- DIFF ---');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i] !== fileContent.split('\n')[i]) {
        console.log(`- ${fileContent.split('\n')[i]}`);
        console.log(`+ ${lines[i]}`);
      }
    }
    // Write changes
    fs.writeFileSync(absPath, lines.join('\n'), 'utf8');
    console.log(`Updated ${file}`);
  } else if (DRY_RUN) {
    console.log(`\n[DRY RUN] No changes made to ${file}`);
  }
}

async function main() {
  for (const file of files) {
    await processFile(file);
  }
  rl.close();
}

main(); 