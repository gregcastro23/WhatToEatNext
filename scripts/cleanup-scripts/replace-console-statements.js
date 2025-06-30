#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = path.resolve(process.cwd(), 'src');
const MAX_FILES = 5;
const TARGET_EXTENSIONS = ['.ts', '.tsx'];
const TEST_FILE_REGEX = /(__tests__|test|\.test\.|\.spec\.|mock|dev|demo|debug)/i;

function findTargetFiles(dir, found = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip scripts, tests, dev, patches, node_modules
      if (/scripts|__tests__|test|dev|patches|node_modules|public|backup|tmp|dist|build|.next|.git/.test(entry.name)) continue;
      findTargetFiles(fullPath, found);
    } else if (
      TARGET_EXTENSIONS.includes(path.extname(entry.name)) &&
      !/\.d\.ts$/.test(entry.name)
    ) {
      found.push(fullPath);
    }
  }
  return found;
}

function processFile(filePath) {
  const isTestFile = TEST_FILE_REGEX.test(filePath);
  const original = fs.readFileSync(filePath, 'utf8');
  let changed = original;
  let changes = [];

  // Replace console.log, warn, error
  changed = changed.replace(/(^|\s)(console\.(log|warn|error))\s*\(([^)]*)\);?/g, (match, pre, method, type, args) => {
    if (isTestFile) {
      changes.push({ before: match, after: pre + '// ' + match.trim() });
      return pre + '// ' + match.trim();
    }
    let loggerMethod = 'logger.debug';
    if (type === 'warn') loggerMethod = 'logger.warn';
    if (type === 'error') loggerMethod = 'logger.error';
    const after = pre + loggerMethod + '(' + args + ');';
    changes.push({ before: match, after });
    return after;
  });

  if (original !== changed && changes.length > 0) {
    return { filePath, changes, changed };
  }
  return null;
}

function main() {
  console.log('🔎 Scanning for console statements in src/ ...');
  const allFiles = findTargetFiles(ROOT_DIR);
  const results = [];
  for (const file of allFiles) {
    const res = processFile(file);
    if (res) results.push(res);
    if (results.length >= MAX_FILES) break;
  }

  if (results.length === 0) {
    console.log('✅ No console statements found to replace.');
    return;
  }

  if (results.length > MAX_FILES) {
    console.warn(`🚨 More than ${MAX_FILES} files would be changed. Aborting for safety.`);
    process.exit(1);
  }

  for (const { filePath, changes } of results) {
    console.log(`\n--- ${filePath} ---`);
    for (const { before, after } of changes) {
      console.log('--- BEFORE ---');
      console.log(before.trim());
      console.log('--- AFTER ----');
      console.log(after.trim());
    }
  }

  if (DRY_RUN) {
    console.log(`\n🏃 DRY RUN: No files were modified. (${results.length} file(s) would be changed)`);
    console.log('To apply these changes, run this script without --dry-run.');
  } else {
    for (const { filePath, changed } of results) {
      fs.writeFileSync(filePath, changed, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
    }
    console.log(`\n✨ All changes applied to ${results.length} file(s).`);
    console.log('Please run: git diff && yarn build to verify.');
  }
}

main(); 