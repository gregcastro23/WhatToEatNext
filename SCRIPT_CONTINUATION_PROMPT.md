# 🚀 CLAUDE CODE UNUSED VARIABLES SCRIPT CONTINUATION PROMPT

## Context: WhatToEatNext TypeScript Cleanup Project

You are continuing work on the **WhatToEatNext** project - an alchemical food
recommendation system built with Next.js and TypeScript. We need to continue
systematic unused variable cleanup using our enhanced script while building on
lessons learned from previous attempts.

## 📊 Current Project Status

### ✅ Major Achievements Already Completed

- **Phase 24 TypeScript Error Reduction**: Successfully reduced from 214→195
  errors (19 eliminated)
- **Corruption Pattern Recovery**: Fixed manual revert issues that had undone
  previous systematic work
- **Build Stability**: 100% production success maintained throughout all phases
- **Script Performance**: Enhanced Unused Variable Cleaner v2.1 with 100% safety
  score achieved

### 🎯 Current Challenge: Unused Variables Cleanup

- **Script Location**:
  `scripts/typescript-fixes/fix-unused-variables-interactive.js`
- **Current Status**: Script has proven track record but needs careful execution
- **Last Attempt Result**: API error during execution (JSON parsing issue in
  large output)
- **Safety Record**: 985 files processed successfully with 100% safety score

## 🚫 Critical Issues from Previous Failed Attempt

### Problem 1: API Response Size Limit

**Issue**: The script output became too large (233KB+) causing JSON parsing
errors **Evidence from transcript**:

```
API Error: 400 {"type":"error","error":{"type":"invalid_request_error","message":"The request body is not valid JSON: no low surrogate in string: line 1 column 233126 (char 233125)"}}
```

### Problem 2: Git Working Directory State

**Issue**: Script requires clean git state but working directory had uncommitted
changes **Evidence from transcript**:

```
⚠️  Git working directory has uncommitted changes:
 M .enhanced-unused-variables-metrics.json
 M TYPESCRIPT_PHASES_TRACKER.ipynb
 [... 45+ files modified]
```

### Problem 3: Large Batch Size Overload

**Issue**: Attempting to process 65 files at once generated excessive output
**Evidence**: Script found 986 unused variable candidates and processed massive
amounts of data

## 🛡️ Required Safety Approach

### Pre-Execution Requirements

1. **Clean Git State**: Commit or stash all changes before running script
2. **Smaller Batch Sizes**: Use `--max-files=15` instead of 65+ to limit output
3. **Dry Run First**: Always use `--dry-run` to validate before applying changes
4. **Progressive Batching**: Start small (10-15 files) and increase gradually

### Execution Strategy

```bash
# STEP 1: Clean git state
git add -A
git commit -m "Pre-script state for unused variables cleanup"

# STEP 2: Start with conservative batch size
node scripts/typescript-fixes/fix-unused-variables-interactive.js --dry-run --max-files=15

# STEP 3: If dry-run successful, apply changes
node scripts/typescript-fixes/fix-unused-variables-interactive.js --max-files=15

# STEP 4: Validate build
yarn build

# STEP 5: Progressive scaling (only if previous batch succeeded)
node scripts/typescript-fixes/fix-unused-variables-interactive.js --dry-run --max-files=25
```

## 📋 Script Capabilities & Features

### Enhanced Safety Features

- **Safety Score Tracking**: 100% safety score achieved in previous runs
- **Batch Size Recommendations**: Script provides optimal batch size suggestions
- **Git Integration**: Automatic stash creation and rollback capabilities
- **Build Validation**: Comprehensive safety checks and metrics tracking
- **Progress Monitoring**: Real-time feedback on files processed and safety
  metrics

### Script Arguments Reference

```bash
# Show current metrics and batch recommendations
--show-metrics

# Validate safety status before running
--validate-safety

# Dry run mode (preview changes without applying)
--dry-run

# Set maximum files to process in one batch
--max-files=N

# Auto-fix mode (skip interactive prompts)
--auto-fix
```

## 🎯 Recommended Execution Plan

### Phase 1: Metrics & Planning (5 minutes)

```bash
# Check current safety metrics
node scripts/typescript-fixes/fix-unused-variables-interactive.js --show-metrics

# Validate safety status
node scripts/typescript-fixes/fix-unused-variables-interactive.js --validate-safety
```

### Phase 2: Conservative Dry Run (10 minutes)

```bash
# Clean git state first
git status
# If dirty: git add -A && git commit -m "Pre-cleanup state"

# Conservative dry run
node scripts/typescript-fixes/fix-unused-variables-interactive.js --dry-run --max-files=15 --auto-fix
```

### Phase 3: Careful Application (15 minutes)

```bash
# Apply if dry run looked good
node scripts/typescript-fixes/fix-unused-variables-interactive.js --max-files=15 --auto-fix

# Immediate build validation
yarn build

# Check for any issues
git status
git diff --stat
```

### Phase 4: Progressive Scaling (ongoing)

Only proceed if Phase 3 was completely successful:

```bash
# Gradually increase batch size
node scripts/typescript-fixes/fix-unused-variables-interactive.js --dry-run --max-files=25 --auto-fix
```

## ⚠️ Critical Warnings

### What NOT to Do

- ❌ **Never** run without checking git status first
- ❌ **Never** use batch sizes >30 files without testing smaller batches first
- ❌ **Never** skip dry-run mode on the first attempt
- ❌ **Never** ignore build failures after script execution

### Early Warning Signs to Stop

- Script output becomes extremely verbose (>1000 lines)
- Git status shows unexpected file modifications
- Build time increases dramatically after script execution
- Any error messages about AST parsing or file corruption

## 🎯 Success Criteria

### Immediate Success Indicators

- Clean git status before and after execution
- Build completes successfully (`yarn build` passes)
- Error count maintained or reduced
- No new TypeScript compilation errors

### Safety Validation

- No unexpected file modifications
- Original functionality preserved
- Performance maintained
- Script metrics show continued 100% safety score

## 📞 Communication Protocol

### Progress Reporting

Please provide updates at each major step:

1. Git status check and cleanup results
2. Dry-run results and safety assessment
3. Application results and build validation
4. Final metrics and recommendations for next batch

### Problem Escalation

If any issues occur:

1. **Stop immediately** - don't continue with larger batches
2. **Check git status** - identify any unexpected changes
3. **Run yarn build** - verify no build regressions
4. **Report specific error messages** - include relevant logs
5. **Consider git reset** - if changes look problematic

## 🚀 Ready to Execute

You have all the context, safety procedures, and proven methodologies needed to
continue the unused variables cleanup work successfully. The script has a
perfect safety record when used correctly - the key is following the
conservative approach and not rushing into large batch sizes.

**Primary Goal**: Clean up unused variables systematically while maintaining
100% build stability and safety record.

**Secondary Goal**: Establish optimal batch size for future large-scale cleanup
sessions.

Please proceed with Phase 1 (metrics check) and work through the phases
systematically.
