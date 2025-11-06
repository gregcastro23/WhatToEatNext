# Automated Parsing Error Fix Scripts

**Status**: Ready for testing
**Last Updated**: October 30, 2025
**Current Parsing Errors**: 245

## Overview

Three safe, tested scripts to automatically fix common TypeScript/JavaScript parsing errors in the WhatToEatNext project. Each script includes comprehensive safety measures including backups, verification, and automatic rollback.

## Scripts

### 1. fix-pattern-2-template-literals.cjs

**Fixes**: Malformed template literal syntax `$) {` → `${`
**Target**: ~18 files
**Risk Level**: 🟢 Very Low (simple string replacement)

### 2. fix-pattern-1-function-parens.cjs

**Fixes**: Missing opening parenthesis in function definitions
**Target**: ~15 files
**Risk Level**: 🟡 Low (context-aware replacement)

### 3. fix-pattern-3-5-type-syntax.cjs

**Fixes**: Object syntax and type definition errors (3 sub-patterns)
**Target**: ~25 files
**Risk Level**: 🟡 Low-Medium (multiple pattern types)

## Safety Features

All scripts include:

✅ **Automatic backups** - Creates timestamped backup before any changes
✅ **Dry-run mode** - Default mode shows what would change without modifying files
✅ **Verification** - Runs lint after each fix to verify errors decreased
✅ **Auto-rollback** - Automatically restores backup if errors increase
✅ **Detailed logging** - Complete log file with timestamps for each operation
✅ **Single-file testing** - Test on one file before running on entire codebase

## Quick Start

### Step 1: Test on a Single File (Recommended)

```bash
# Create test file
mkdir -p /tmp/parsing-fix-test
cat > /tmp/parsing-fix-test/test.ts << 'EOF'
export function testFunction()
  param1: string
): void {
  console.log(`Test: $) {param1}`);
  const obj = ) { key: 'value' };
}
EOF

# Dry run on test file
node scripts/fix-pattern-2-template-literals.cjs --file=/tmp/parsing-fix-test/test.ts

# Apply fix to test file
node scripts/fix-pattern-2-template-literals.cjs --apply --file=/tmp/parsing-fix-test/test.ts

# Verify fix worked
cat /tmp/parsing-fix-test/test.ts
```

### Step 2: Dry Run on Codebase

```bash
# See what would be changed (no modifications)
node scripts/fix-pattern-2-template-literals.cjs
```

Review the output carefully. Check the log file for details.

### Step 3: Apply to One Real File

```bash
# Find a file with the pattern
yarn lint 2>&1 | grep -B 1 "Parsing error" | head -5

# Apply fix to that file
node scripts/fix-pattern-2-template-literals.cjs --apply --file=/path/to/file.ts

# Check if it worked
yarn lint /path/to/file.ts
```

### Step 4: Apply to All Files

```bash
# Only after successful single-file test!
node scripts/fix-pattern-2-template-literals.cjs --apply
```

### Step 5: Verify Results

```bash
# Check parsing error count
yarn lint 2>&1 | grep "Parsing error" | wc -l

# Review the log file
ls -lt fix-log-pattern-*.txt | head -1 | awk '{print $NF}' | xargs cat
```

## Recommended Execution Order

Run in this order for best results:

1. **Pattern 2 (Template Literals)** - Safest, most obvious fixes
2. **Pattern 1 (Function Parens)** - Moderate complexity
3. **Pattern 3-5 (Type Syntax)** - Most complex, multiple sub-patterns

## Command Reference

### Dry Run (Default - No Changes)

```bash
node scripts/fix-pattern-2-template-literals.cjs
```

### Apply Changes

```bash
node scripts/fix-pattern-2-template-literals.cjs --apply
```

### Single File Test

```bash
node scripts/fix-pattern-2-template-literals.cjs --file=/path/to/file.ts
node scripts/fix-pattern-2-template-literals.cjs --apply --file=/path/to/file.ts
```

### View Logs

```bash
# Latest log
ls -lt fix-log-pattern-*.txt | head -1 | awk '{print $NF}' | xargs cat

# All logs
ls -lt fix-log-pattern-*.txt
```

## What Each Pattern Fixes

### Pattern 1: Missing Opening Parenthesis

```typescript
// BEFORE
export function calculateSomething()
  param1: string,
  param2: number
): ReturnType {

// AFTER
export function calculateSomething(
  param1: string,
  param2: number
): ReturnType {
```

### Pattern 2: Malformed Template Literals

```typescript
// BEFORE
console.log(`Message: $) {variable}`);
logger.info(`Count: $) {items.length}`);

// AFTER
console.log(`Message: ${variable}`);
logger.info(`Count: ${items.length}`);
```

### Pattern 3: Malformed Object Syntax

```typescript
// BEFORE
this.debug(message, ) { component, args });
metadata: ) { key: 'value' }

// AFTER
this.debug(message, { component, args });
metadata: { key: 'value' }
```

### Pattern 4: Semicolon in Type Definitions

```typescript
// BEFORE
import { Type1, Type2; } from './module';
interface MyType { name: string; RecipeSeason; }

// AFTER
import { Type1, Type2 } from './module';
interface MyType { name: string; RecipeSeason }
```

### Pattern 5: Comma Instead of Colon

```typescript
// BEFORE
type Config = {
  upper;
  number;
  marginOfError;
  number;
};

// AFTER
type Config = {
  upper: number;
  marginOfError: number;
};
```

## Troubleshooting

### Script Fails to Run

```bash
# Make scripts executable
chmod +x scripts/*.cjs

# Verify Node.js is available
node --version  # Should be v16+
```

### "File not found" errors

```bash
# Scripts expect to be run from project root
cd /Users/GregCastro/Desktop/WhatToEatNext
node scripts/fix-pattern-2-template-literals.cjs
```

### Lint command times out

```bash
# The scripts handle this - check the log file for details
# You may need to increase timeout in script (currently 2 minutes)
```

### Errors increased after fix

The script automatically restores from backup. Check log file for details:

```bash
ls -lt fix-log-*.txt | head -1 | awk '{print $NF}' | xargs cat | grep "ERRORS INCREASED"
```

### Restore from backup manually

```bash
# Backups are in same directory as original file
ls -lt /path/to/file.ts.backup-* | head -1
cp /path/to/file.ts.backup-1234567890 /path/to/file.ts
```

## Expected Results

After running all three scripts successfully:

- **Pattern 1**: ~15 files fixed (function parens)
- **Pattern 2**: ~18 files fixed (template literals)
- **Pattern 3-5**: ~25 files fixed (type syntax)
- **Total**: ~58 files fixed automatically
- **Error Reduction**: 245 → ~187 errors (24% reduction)

## Safety Checklist

Before running scripts:

- [ ] Read this README completely
- [ ] Understand what each pattern fixes
- [ ] Have clean git state (optional but recommended)
- [ ] Run dry-run mode first
- [ ] Review dry-run output
- [ ] Test on single file
- [ ] Verify single file fix worked

When applying:

- [ ] Run one script at a time
- [ ] Review logs after each script
- [ ] Verify error count decreased
- [ ] Check git diff for changes
- [ ] Run build to ensure stability

## Emergency Rollback

If something goes wrong:

```bash
# Option 1: Git reset (if committed)
git status
git diff
git checkout -- .

# Option 2: Restore from script backups
find . -name "*.backup-*" -type f | sort -r | head -20

# Option 3: Manual restore
cp file.ts.backup-1234567890 file.ts
```

## Success Criteria

Each script run should:

- ✅ Complete without fatal errors
- ✅ Show "Successful fixes" > 0
- ✅ Show "Failed fixes" = 0
- ✅ Reduce total parsing error count
- ✅ Not break the build (`yarn build` still works)

## Support

- **Project Docs**: [CLAUDE.md](../CLAUDE.md)
- **Parsing Error Context**: [PARSING_ERROR_FIX_PROMPT.md](../PARSING_ERROR_FIX_PROMPT.md)
- **Current Errors**: Run `yarn lint 2>&1 | grep "Parsing error" | wc -l`

## Change Log

- **2025-10-30**: Initial creation of automated fix scripts
- **2025-10-30**: Added comprehensive safety features and logging
- **2025-10-30**: Tested structure with dry-run capabilities

---

**Remember**: Always run in dry-run mode first, test on single files, and verify results before proceeding to full codebase application.
