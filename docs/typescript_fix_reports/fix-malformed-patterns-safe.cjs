#!/usr/bin/env node
/*
  fix-malformed-patterns-safe.cjs
  Purpose: Ultra-constrained, reversible fixes for known malformed tokens causing TS1128 in test files only.
  Patterns fixed (exact substrings only):
    - "sig, n:"  -> "sign:"
    - "severit, y:" -> "severity:"
    - "[ke, y:" (and variants like "[ke, y: string]") -> "[key:" (preserving type annotation if present)

  Usage:
    node fix-malformed-patterns-safe.cjs --dry-run [--limit N]
    node fix-malformed-patterns-safe.cjs --live [--limit N]
*/

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const isLive = args.includes('--live');
const isDryRun = args.includes('--dry-run') || !isLive;
const limitArg = (() => {
  const idx = args.findIndex(a => a === '--limit');
  if (idx !== -1 && args[idx + 1]) {
    const n = Number(args[idx + 1]);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }
  return undefined;
})();

const root = process.cwd();
const backupRoot = path.join(root, `.ts1128-safe-backup-${Date.now()}`);

const TEST_DIR = path.join(root, 'src');

/**
 * Return true if file path is a test file we are allowed to modify.
 */
function isAllowedTestFile(filePath) {
  if (!filePath.endsWith('.test.ts') && !filePath.endsWith('.test.tsx')) return false;
  const rel = path.relative(root, filePath);
  return (
    rel.includes(`${path.sep}__tests__${path.sep}`) ||
    rel.includes(`${path.sep}tests${path.sep}`) ||
    rel.includes(`${path.sep}src${path.sep}__tests__${path.sep}`)
  );
}

/**
 * Recursively collect candidate files under src/.
 */
function* walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile()) {
      yield full;
    }
  }
}

/**
 * Apply minimal replacements. Only exact malformed tokens.
 */
function applyReplacements(source) {
  let changed = false;
  let updated = source;

  // 1) sig, n:  -> sign:
  if (updated.includes('sig, n:')) {
    updated = updated.replace(/sig,\s*n:/g, 'sign:');
    changed = true;
  }

  // 2) severit, y: -> severity:
  if (updated.includes('severit, y:')) {
    updated = updated.replace(/severit,\s*y:/g, 'severity:');
    changed = true;
  }

  // 3) [ke, y: ...] -> [key: ...]
  //   - handle with or without type annotation following
  if (updated.includes('[ke, y:')) {
    // Preserve whatever follows the colon (e.g., " string", " any")
    updated = updated.replace(/\[ke,\s*y:\s*/g, '[key: ');
    changed = true;
  }

  return { changed, updated };
}

function ensureBackupDir(filePath) {
  const rel = path.relative(root, filePath);
  const dest = path.join(backupRoot, path.dirname(rel));
  fs.mkdirSync(dest, { recursive: true });
}

function backupFile(filePath) {
  const rel = path.relative(root, filePath);
  const destDir = path.join(backupRoot, path.dirname(rel));
  const dest = path.join(backupRoot, rel);
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(filePath, dest);
}

function countTs1128() {
  try {
    const { execSync } = require('child_process');
    const out = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS1128" || echo "0"', { stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
    const n = Number(out);
    return Number.isFinite(n) ? n : NaN;
  } catch {
    return NaN;
  }
}

console.log(isDryRun ? '🎯 Malformed Patterns Safe Fixer (DRY RUN)' : '🎯 Malformed Patterns Safe Fixer (LIVE)');
const baseline = countTs1128();
if (Number.isFinite(baseline)) {
  console.log(`📊 Initial TS1128 errors: ${baseline}`);
}

const candidates = [];
for (const file of walk(TEST_DIR)) {
  if (!isAllowedTestFile(file)) continue;
  const text = fs.readFileSync(file, 'utf8');
  if (text.includes('sig, n:') || text.includes('severit, y:') || text.includes('[ke, y:')) {
    candidates.push(file);
  }
}

if (candidates.length === 0) {
  console.log('✅ No candidate files found.');
  process.exit(0);
}

const limited = typeof limitArg === 'number' ? candidates.slice(0, limitArg) : candidates;
console.log(`🔍 Found ${candidates.length} candidate files, processing ${limited.length}`);

let totalChanges = 0;
if (!isDryRun) {
  fs.mkdirSync(backupRoot, { recursive: true });
  console.log(`📁 Backup directory: ${path.basename(backupRoot)}`);
}

for (const filePath of limited) {
  const original = fs.readFileSync(filePath, 'utf8');
  const { changed, updated } = applyReplacements(original);
  if (!changed) continue;

  if (isDryRun) {
    // Count changes by diffing lines quickly
    const beforeCount = (original.match(/sig,\s*n:|severit,\s*y:|\[ke,\s*y:/g) || []).length;
    const afterCount = (updated.match(/sig,\s*n:|severit,\s*y:|\[ke,\s*y:/g) || []).length;
    const delta = beforeCount - afterCount;
    totalChanges += delta > 0 ? delta : 0;
    console.log(`   📝 Would fix ${delta > 0 ? delta : 0} occurrence(s) in ${path.relative(root, filePath)}`);
  } else {
    ensureBackupDir(filePath);
    backupFile(filePath);
    fs.writeFileSync(filePath, updated, 'utf8');
    const fixedCount = (original.match(/sig,\s*n:|severit,\s*y:|\[ke,\s*y:/g) || []).length;
    totalChanges += fixedCount;
    console.log(`   ✅ Fixed ${fixedCount} occurrence(s) in ${path.relative(root, filePath)}`);
  }
}

if (isDryRun) {
  console.log('\n============================================================');
  console.log(`📈 DRY RUN complete. Total would-fix occurrences: ${totalChanges}`);
  console.log('💡 Use --live to apply these changes.');
  process.exit(0);
}

console.log('\n============================================================');
console.log(`📈 LIVE complete. Total fixed occurrences: ${totalChanges}`);
const after = countTs1128();
if (Number.isFinite(after)) {
  console.log(`   TS1128 count: ${baseline} -> ${after}`);
}
console.log('✅ Done.');
