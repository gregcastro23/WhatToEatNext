# Automated Parsing Error Fix - Safe Script Generation Prompt

## Context

This prompt is for creating SAFE, TESTED, and TARGETED scripts to fix the remaining 245 TypeScript/JavaScript parsing errors in the WhatToEatNext project. Manual fixes have been completed on critical Tier 1-2 files, and clear patterns have been identified.

## Project Status

- **Total Parsing Errors**: 245 (down from original 437)
- **Files Already Fixed Manually**: 31 files (Tier 1-2 critical path + some Tier 3)
- **Files Remaining**: ~214 files with parsing errors
- **Build Status**: Stable (critical files are error-free)
- **Working Directory**: `/Users/GregCastro/Desktop/WhatToEatNext`

## Verified Error Patterns from Manual Fixes

Based on 31 files successfully fixed manually, these are the **CONFIRMED** patterns:

### Pattern 1: Missing Opening Parenthesis in Function Definitions

**Frequency**: 15+ instances
**Error Message**: "Parsing error: Expression expected" or "Type expected"

```typescript
// ❌ BROKEN
export function calculateSomething()
  param1: string,
  param2: number
): ReturnType {

// ✅ FIXED
export function calculateSomething(
  param1: string,
  param2: number
): ReturnType {
```

**Detection Regex**:

```javascript
/export (function|const) (\w+)\(\)\s*\n\s*(\w+):/gm;
```

**Safe Fix Strategy**:

- Only fix if line ends with `()` followed by newline with parameter
- Preserve all whitespace and indentation
- Replace `()` with `(`

---

### Pattern 2: Malformed Template Literal Syntax

**Frequency**: 18+ instances
**Error Message**: "Parsing error: Expression expected"

```typescript
// ❌ BROKEN
console.log(`Message: $) {variable}`);
logger.info(`Count: $) {items.length}`);

// ✅ FIXED
console.log(`Message: ${variable}`);
logger.info(`Count: ${items.length}`);
```

**Detection Regex**:

```javascript
/\$\)\s*\{/g;
```

**Safe Fix Strategy**:

- Simple string replacement: `$) {` → `${`
- Very low risk - this is an obvious typo

---

### Pattern 3: Malformed Object Syntax (Parenthesis Before Brace)

**Frequency**: 12+ instances
**Error Message**: "Parsing error: Expression expected"

```typescript
// ❌ BROKEN
this.debug(message, ) { component, args });
metadata: ) { key: 'value' }

// ✅ FIXED
this.debug(message, { component, args });
metadata: { key: 'value' }
```

**Detection Regex**:

```javascript
/\)\s*\{/g;
```

**Safe Fix Strategy**:

- Replace `) {` with `{`
- **EXCEPTION**: Do NOT replace in function definitions like `): ReturnType {`
- Check that it's not preceded by `)` or `]`

---

### Pattern 4: Semicolon Instead of Comma in Type Definitions

**Frequency**: 14+ instances
**Error Message**: "Parsing error: ',' expected" or "';' expected"

```typescript
// ❌ BROKEN
interface MyType {
  name: string;
  age: number;
  RecipeSeason;
}

import {
  Type1,
  Type2;
} from './module';

// ✅ FIXED
interface MyType {
  name: string;
  age: number;
  RecipeSeason
}

import {
  Type1,
  Type2
} from './module';
```

**Detection Regex**:

```javascript
// In imports - last item before closing brace
/(\w+);(\s*\n\s*\})/gm

// In type definitions
/:\s*\w+;(\s*\n\s*\})/gm
```

**Safe Fix Strategy**:

- Only fix semicolons immediately before `}` in imports/types
- Check context is import or interface/type definition
- Replace `;` with nothing (remove it)

---

### Pattern 5: Comma Instead of Colon in Type Properties

**Frequency**: 8+ instances
**Error Message**: "Parsing error: Property or signature expected"

```typescript
// ❌ BROKEN
type Config = {
  upper;
  number;
  marginOfError;
  number;
};

// ✅ FIXED
type Config = {
  upper: number;
  marginOfError: number;
};
```

**Detection Regex**:

```javascript
/(\w+),\s*(number|string|boolean|\w+\[\])/g;
```

**Safe Fix Strategy**:

- Only in type/interface definitions
- Replace `, type` with `: type`

---

### Pattern 6: Missing Closing Parenthesis

**Frequency**: 9+ instances
**Error Message**: "Parsing error: ')' expected"

```typescript
// ❌ BROKEN
if (condition {
for (const item of items) {
Object.entries(data).reduce((acc, val) => {...}, 0

// ✅ FIXED
if (condition) {
for (const item of items)) {
Object.entries(data).reduce((acc, val) => {...}, 0)
```

**Detection Regex**:

```javascript
// This is CONTEXT-SENSITIVE - harder to automate safely
```

**Safe Fix Strategy**:

- **DO NOT AUTOMATE THIS ONE** - too risky
- Requires AST parsing or manual review

---

## Task Requirements

### Primary Goal

Create **THREE SEPARATE, SAFE, TESTED SCRIPTS** that:

1. **Script 1**: Fix Pattern 1 (Missing opening paren in functions)
2. **Script 2**: Fix Pattern 2 (Malformed template literals)
3. **Script 3**: Fix Patterns 3-5 combined (Object syntax + type definition issues)

### Safety Requirements

Each script MUST:

1. ✅ **Create backup before any changes**

   ```bash
   cp file.ts file.ts.backup-$(date +%s)
   ```

2. ✅ **Dry-run mode by default**
   - Show what WOULD be changed
   - Require explicit `--apply` flag to actually modify files

3. ✅ **Detailed logging**
   - Log every file examined
   - Log every match found
   - Log every change made
   - Save log to file with timestamp

4. ✅ **Verification after each fix**
   - Run `yarn lint <file>` after modification
   - If errors INCREASE, automatically restore from backup
   - Report success/failure for each file

5. ✅ **Incremental processing**
   - Process files one at a time
   - Stop on first failure
   - Allow resume from last successful file

6. ✅ **Context validation**
   - Don't fix inside strings (except for Pattern 2 which IS fixing strings)
   - Don't fix inside comments
   - Validate surrounding context matches expected pattern

### Script Structure Template

```javascript
#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// ===== CONFIGURATION =====
const DRY_RUN = !process.argv.includes("--apply");
const BACKUP_DIR = path.join(__dirname, "../.backups");
const LOG_FILE = path.join(__dirname, `../fix-log-${Date.now()}.txt`);

// ===== SAFETY FUNCTIONS =====
function createBackup(filePath) {
  const timestamp = Date.now();
  const backupPath = `${filePath}.backup-${timestamp}`;
  fs.copyFileSync(filePath, backupPath);
  log(`✓ Backup created: ${backupPath}`);
  return backupPath;
}

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(LOG_FILE, logMessage + "\n");
}

function getParsingErrorCount(filePath) {
  try {
    const output = execSync(`yarn lint ${filePath} 2>&1`, { encoding: "utf8" });
    const matches = output.match(/Parsing error/g);
    return matches ? matches.length : 0;
  } catch (e) {
    return 0;
  }
}

function restoreBackup(backupPath, originalPath) {
  fs.copyFileSync(backupPath, originalPath);
  log(`✓ Restored from backup: ${backupPath}`);
}

// ===== PATTERN FIXING FUNCTION =====
function fixPattern(content, filePath) {
  let modified = content;
  let changeCount = 0;

  // YOUR SPECIFIC PATTERN FIX HERE
  // Example for Pattern 2:
  const pattern = /\$\)\s*\{/g;
  const matches = content.match(pattern);

  if (matches) {
    log(`  Found ${matches.length} instances of pattern in ${filePath}`);
    modified = content.replace(pattern, "${");
    changeCount = matches.length;
  }

  return { modified, changeCount };
}

// ===== MAIN EXECUTION =====
function main() {
  log("===== STARTING AUTOMATED FIX =====");
  log(`Mode: ${DRY_RUN ? "DRY RUN" : "APPLY CHANGES"}`);

  // Get list of files with parsing errors
  const output = execSync("yarn lint 2>&1", { encoding: "utf8" });
  const fileMatches = output.match(/\/Users\/.*?\.ts/g);
  const uniqueFiles = [...new Set(fileMatches)];

  log(`Found ${uniqueFiles.length} files with parsing errors`);

  let successCount = 0;
  let failCount = 0;

  for (const filePath of uniqueFiles) {
    log(`\n--- Processing: ${filePath} ---`);

    const errorsBefore = getParsingErrorCount(filePath);
    log(`  Parsing errors before: ${errorsBefore}`);

    const content = fs.readFileSync(filePath, "utf8");
    const { modified, changeCount } = fixPattern(content, filePath);

    if (changeCount === 0) {
      log(`  No changes needed`);
      continue;
    }

    if (DRY_RUN) {
      log(`  [DRY RUN] Would make ${changeCount} changes`);
      continue;
    }

    // Apply changes with safety
    const backup = createBackup(filePath);
    fs.writeFileSync(filePath, modified, "utf8");

    const errorsAfter = getParsingErrorCount(filePath);
    log(`  Parsing errors after: ${errorsAfter}`);

    if (errorsAfter > errorsBefore) {
      log(`  ❌ ERRORS INCREASED - Restoring backup`);
      restoreBackup(backup, filePath);
      failCount++;
    } else {
      log(`  ✓ Success! Errors: ${errorsBefore} → ${errorsAfter}`);
      successCount++;
    }
  }

  log("\n===== SUMMARY =====");
  log(`Successful fixes: ${successCount}`);
  log(`Failed fixes: ${failCount}`);
  log(`Mode: ${DRY_RUN ? "DRY RUN (no changes made)" : "CHANGES APPLIED"}`);
}

main();
```

### Testing Protocol

Before running on ANY files:

1. **Create test file**:

   ```bash
   mkdir -p /tmp/parsing-fix-test
   cat > /tmp/parsing-fix-test/test.ts << 'EOF'
   export function testFunction()
     param1: string
   ): void {
     console.log(`Test: $) {param1}`);
   }
   EOF
   ```

2. **Run script in dry-run**:

   ```bash
   node fix-script.js --dry-run
   ```

3. **Verify output shows correct detection**

4. **Run with --apply on test file ONLY**

5. **Verify test file is correctly fixed**

6. **Only then run on real codebase**

### File List for Scripts

Get current list of files with parsing errors:

```bash
yarn lint 2>&1 | grep -B 1 "Parsing error" | grep "^/" | sed "s/:$//" | sort -u > /tmp/parsing-error-files.txt
```

### Success Criteria

Each script should:

- ✅ Fix at least 20 files without increasing errors
- ✅ Have ZERO cases where errors increase
- ✅ Complete dry-run showing exactly what will change
- ✅ Generate complete log file
- ✅ Create backups that can be restored

### Deliverables

Please create:

1. **`fix-pattern-1-function-parens.js`** - Fix missing opening parens
2. **`fix-pattern-2-template-literals.js`** - Fix malformed template literals
3. **`fix-pattern-3-5-type-syntax.js`** - Fix object/type syntax issues
4. **`README-AUTOMATED-FIXES.md`** - Instructions for running safely
5. **Test suite** for each script

### Example Usage

```bash
# Step 1: Dry run to see what would change
node scripts/fix-pattern-2-template-literals.js --dry-run

# Step 2: Review the dry-run output and log file

# Step 3: Apply to ONE file first
node scripts/fix-pattern-2-template-literals.js --apply --file src/utils/logger.ts

# Step 4: If successful, apply to all
node scripts/fix-pattern-2-template-literals.js --apply

# Step 5: Check results
yarn lint 2>&1 | grep "Parsing error" | wc -l
```

### Important Constraints

**DO NOT**:

- Fix multiple patterns in one script (separation of concerns)
- Modify files without backup
- Apply changes without dry-run verification
- Continue if errors increase
- Use complex regex that might have false positives

**DO**:

- Test extensively on sample files first
- Log everything
- Verify before and after
- Restore on any error increase
- Keep scripts simple and focused

### Context Files Available

- **CLAUDE.md** - Project conventions and architecture
- **PARSING_ERROR_FIX_PROMPT.md** - Complete error list and manual fix history
- **Current error count**: Run `yarn lint 2>&1 | grep "Parsing error" | wc -l`

## Expected Outcome

After running all three scripts successfully:

- Pattern 1 fixes: ~15 files (missing function parens)
- Pattern 2 fixes: ~18 files (template literals)
- Pattern 3-5 fixes: ~25 files (type syntax)
- **Total**: ~58 files fixed automatically
- **Remaining**: ~187 files for manual review or additional patterns
- **Error reduction**: 245 → ~187 errors

This should bring us to **~75% completion** of the parsing error elimination campaign.

---

## Summary

Use this prompt to create SAFE, TESTED automation scripts that fix the most common parsing error patterns. Each script should be conservative, well-logged, and include automatic rollback on any increase in errors. Test thoroughly on sample files before running on the codebase.
