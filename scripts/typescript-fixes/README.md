# TypeScript Fixes Scripts

This directory contains automated scripts for fixing TypeScript errors in the WhatToEatNext project.

## 📚 **Scripts Overview**

### **1. Enhanced Unused Variable Cleaner v4.0** ✅ **ARCHIVED**
- **Status:** Mission accomplished, retired with honors
- **Achievement:** 100% unused variable elimination (1,422→0 errors)
- **Documentation:** See `docs/ENHANCED_UNUSED_VARIABLE_CLEANER_ARCHIVE.md`

### **2. Enhanced TypeScript Error Fixer v2.0** 🚀 **ACTIVE**
- **Status:** Production ready with advanced features
- **Target:** Remaining 195 TypeScript errors
- **Focus:** TS2322, TS2459, TS2740, TS2345, TS2304, TS2339, TS2741, TS2688, TS2820

### **3. Enhanced TypeScript Warning Fixer v1.0** ⚡ **NEW**
- **Status:** Ready for deployment
- **Target:** TypeScript and ESLint warnings
- **Focus:** Unused variables, imports, console statements, explicit any types

---

## 🛠️ **Enhanced TypeScript Error Fixer v2.0**

### **Purpose**
Systematically fix remaining TypeScript errors using proven patterns with advanced safety features and performance optimization.

### **Target Error Types**
| Error Code | Count | Description | Priority |
|------------|-------|-------------|----------|
| TS2322 | 16 | Type assignment errors | HIGH |
| TS2459 | 14 | Import/export issues | HIGH |
| TS2740 | 6 | Missing properties in type | HIGH |
| TS2345 | 6 | Argument type mismatches | HIGH |
| TS2304 | 9 | Cannot find name | MEDIUM |
| TS2339 | 7 | Property does not exist | MEDIUM |
| TS2741 | 3 | Missing properties | MEDIUM |

### **Usage**

#### **Basic Usage**
```bash
# Dry run mode (ALWAYS run first)
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v2.js --dry-run

# Production mode
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v2.js

# Aggressive mode (lower safety threshold)
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v2.js --aggressive

# Custom batch size
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v2.js --max-files=30
```

#### **Configuration Options**
- `--dry-run`: Validate changes without applying (RECOMMENDED first)
- `--auto-fix`: Apply changes automatically
- `--max-files=N`: Set maximum files per batch (default: 20)

### **Safety Features**
- **Pattern Recognition:** Advanced error pattern matching
- **Safety Thresholds:** Different safety levels for different error types
- **Build Validation:** Ensures compilation success after changes
- **Comprehensive Logging:** Detailed operation tracking
- **Rollback Support:** Git-based version control

### **Error Fixing Patterns**

#### **TS2322 - Type Assignment Errors**
```javascript
// Pattern: string[] vs Season[]
// Before: const seasons: string[] = ['spring', 'summer'];
// After:  const seasons: Season[] = ['spring', 'summer'] as Season[];

// Pattern: Object literal vs interface
// Before: const data = { name: 'test' };
// After:  const data = { name: 'test' } as ExpectedType;
```

#### **TS2459 - Import/Export Issues**
```javascript
// Pattern: Missing export
// Before: type Element = 'Fire' | 'Water' | 'Earth' | 'Air';
// After:  export type Element = 'Fire' | 'Water' | 'Earth' | 'Air';
```

#### **TS2740 - Missing Properties**
```javascript
// Pattern: Type missing properties
// Before: type MyType = { name: string };
// After:  type MyType = { name: string; id: string; };
```

### **Safety Levels**
- **High Safety:** Automatic fixes with high confidence (0.85+ confidence)
- **Medium Safety:** Fixes with validation checks (0.70-0.84 confidence)
- **Low Safety:** Manual review recommended (<0.70 confidence)

---

## ⚠️ **Enhanced TypeScript Warning Fixer v1.0**

### **Purpose**
Dedicated script for handling TypeScript and ESLint warnings with intelligent pattern recognition and safe cleanup strategies.

### **Target Warning Types**
| Warning Type | Description | Safety Level |
|-------------|-------------|--------------|
| unused-variable | Variables declared but never read | HIGH |
| unused-import | Imports defined but never used | HIGH |
| console-statement | Console.log/warn/error statements | MEDIUM |
| explicit-any | Explicit any type usage | MEDIUM |
| deprecated-api | Deprecated API usage | MEDIUM |
| performance-warning | Performance optimization suggestions | LOW |

### **Usage**

#### **Basic Usage**
```bash
# Dry run mode (ALWAYS run first)
node scripts/typescript-fixes/fix-typescript-warnings-enhanced.js --dry-run

# Production mode
node scripts/typescript-fixes/fix-typescript-warnings-enhanced.js

# Include console statement fixes
node scripts/typescript-fixes/fix-typescript-warnings-enhanced.js --include-console

# Aggressive mode (replace 'any' with 'unknown')
node scripts/typescript-fixes/fix-typescript-warnings-enhanced.js --aggressive

# Custom configuration
node scripts/typescript-fixes/fix-typescript-warnings-enhanced.js --max-files=20 --dry-run
```

#### **Configuration Options**
- `--dry-run`: Validate changes without applying (RECOMMENDED first)
- `--aggressive`: Lower safety threshold, more aggressive fixes
- `--include-console`: Include console statement fixes
- `--max-files=N`: Set maximum files per batch (default: 30)

### **Warning Fixing Patterns**

#### **Unused Variables**
```javascript
// Pattern: Prefix with underscore
// Before: const result = getData();
// After:  const _result = getData();
```

#### **Unused Imports**
```javascript
// Pattern: Remove unused imports
// Before: import { A, B, C } from 'module';
// After:  import { A, C } from 'module';
```

#### **Console Statements** (with --include-console)
```javascript
// Pattern: Comment out console statements
// Before: console.log('debug info');
// After:  // console.log('debug info');
```

#### **Explicit Any Types** (with --aggressive)
```javascript
// Pattern: Replace with unknown
// Before: const data: any = getData();
// After:  const data: unknown = getData();
```

---

## 📊 **Performance Tracking**

### **Metrics File**
- `.typescript-errors-metrics.json` - Performance metrics for the new script

### **Key Metrics**
- Total files processed
- Errors fixed vs. skipped
- Safety violations
- Success rate
- Processing duration

---

## 🔄 **Workflow**

### **Recommended Process**
1. **Analysis:** Review current TypeScript errors
2. **Dry Run:** Test script with `--dry-run` flag
3. **Validation:** Review proposed changes
4. **Execution:** Run with `--auto-fix` flag
5. **Build Test:** Verify `npm run build` still works
6. **Commit:** Commit changes with descriptive message

### **Example Workflow - Error Fixing**
```bash
# 1. Check current errors
npx tsc --noEmit 2>&1 | grep "error TS" | wc -l

# 2. Dry run error fixer
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v2.js --dry-run

# 3. Review output and apply if satisfied
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v2.js

# 4. Validate build
yarn build

# 5. Commit changes
git add -A && git commit -m "Fix TypeScript errors using Enhanced Error Fixer v2.0"
```

### **Example Workflow - Warning Cleanup**
```bash
# 1. Check current warnings (optional)
npx eslint src/ --format=compact | wc -l

# 2. Dry run warning fixer
node scripts/typescript-fixes/fix-typescript-warnings-enhanced.js --dry-run

# 3. Review output and apply if satisfied
node scripts/typescript-fixes/fix-typescript-warnings-enhanced.js

# 4. Validate build
yarn build

# 5. Commit changes
git add -A && git commit -m "Clean up TypeScript warnings using Enhanced Warning Fixer v1.0"
```

---

## 🚨 **Important Notes**

### **Safety First**
- **Always run dry-run first** to validate changes
- **Monitor build status** after each run
- **Review changes** before committing
- **Keep git history clean** for easy rollback

### **Limitations**
- Some errors require manual intervention
- Complex type transformations may need human review
- Context-dependent fixes may be skipped for safety

### **Best Practices**
- Run in small batches initially
- Monitor success rates and adjust batch sizes
- Document any manual fixes required
- Keep comprehensive logs of all operations

---

## 📚 **Documentation**

### **Related Files**
- `docs/TYPESCRIPT_ERROR_ANALYSIS.md` - Comprehensive error analysis
- `docs/ENHANCED_UNUSED_VARIABLE_CLEANER_ARCHIVE.md` - Archive documentation
- `.unused-variables-metrics.json` - Historical metrics

### **Script Architecture**
Both scripts follow the same proven architecture:
- ES Module structure
- Progressive scaling
- Pattern recognition
- Safety protocols
- Comprehensive logging
- Build validation

---

## 🎯 **Success Criteria**

### **Phase 1 Goals (Week 1)**
- Reduce errors from 88 to <50
- Focus on high-priority errors (TS2322, TS2459, TS2740, TS2345)
- Maintain 100% build success

### **Phase 2 Goals (Week 2)**
- Reduce errors from <50 to <20
- Focus on medium-priority errors (TS2304, TS2339, TS2741)
- Validate all fixes

### **Phase 3 Goals (Week 3)**
- Eliminate remaining errors
- Final validation and testing
- Complete documentation

---

## 🚀 **Future Enhancements**

### **Potential Improvements**
- **Machine Learning:** Pattern learning from manual fixes
- **Semantic Analysis:** Context-aware error resolution
- **Integration Testing:** Automated functionality validation
- **Performance Optimization:** Parallel processing for large codebases

### **Extension Opportunities**
- **Code Style Enforcement:** Automated style corrections
- **Import Optimization:** Import statement cleanup
- **Dead Code Removal:** Unused function detection
- **Type Inference:** Automatic type improvements

---

*"Building on the success of the Enhanced Unused Variable Cleaner v4.0 to achieve complete TypeScript error elimination."*

# TypeScript Error Fix Scripts

This directory contains scripts to systematically fix TypeScript errors in the codebase. These scripts target common patterns and types of errors to reduce the overall TypeScript error count.

## Available Scripts

### Core Fix Scripts

1. **fix-alchemical-properties.js**: Fixes issues with the AlchemicalProperties interface.
   - Ensures property names are lowercase (spirit, essence, matter, substance).

2. **fix-season-type.js**: Standardizes Season type usage.
   - Ensures both 'autumn' and 'fall' variants are properly supported.

3. **fix-planetary-types.js**: Fixes issues with PlanetaryPosition and related types.
   - Adds missing exactLongitude property to PlanetaryPosition.

4. **fix-any-usage.js**: Replaces 'any' being used as values with proper alternatives.
   - Replaces 'any' with {} to resolve type errors.

### Type Mismatch and Property Fix Scripts

5. **fix-type-mismatches.js**: Resolves type mismatch issues for:
   - ElementalAffinity usage (converting strings to objects with 'base' property)
   - ChakraEnergies property mismatches (brow vs thirdEye)
   - RecipeHarmonyResult compatibility issues

6. **fix-missing-properties.js**: Adds missing properties to interfaces, including:
   - RecipeHarmonyResult required properties
   - ChakraEnergies property fixes
   - Other common missing property patterns

7. **fix-import-issues.js**: Fixes import statement problems:
   - Breaking up imports from @/data/planets into individual imports
   - Adding missing imports for hooks and types
   - Fixing other common import pattern issues

8. **fix-component-props.js**: Fixes React component props type issues:
   - Adding missing Props interfaces for components
   - Fixing props type mismatches in component definitions
   - Adding type annotations to functional components

### New Fix Scripts

9. **fix-promise-await.js**: Fixes Promise-related errors:
   - Adds missing `await` keywords before array methods on Promises (.filter, .map, etc.)
   - Prevents "Property 'filter'/'map' does not exist on type 'Promise<T>'" errors
   - Improves async/await usage throughout the codebase

10. **fix-unknown-types.js**: Fixes 'unknown' type issues:
    - Adds type assertions for properties with 'unknown' type
    - Handles common patterns like `intensity: ingredient.intensity || 0.5`
    - Adds proper type assertions for array properties

11. **fix-interface-properties.js**: Fixes interface property issues:
    - Adds missing 'energy' property to BasicThermodynamicProperties
    - Updates CelestialPosition interface to include 'exactLongitude'
    - Fixes ZodiacSign type issues with proper type assertions
    - Adds missing properties to PlanetaryAspect objects

12. **fix-duplicate-properties.js**: Fixes duplicate property issues in object literals:
    - Targets the backup-unified/ingredients.ts file with 100+ duplicate property errors
    - Removes redundant property declarations in object literals
    - Preserves the first occurrence of each property
    - Resolves TS1117: "An object literal cannot have multiple properties with the same name"

13. **fix-basic-thermodynamic-properties.js**: Fixes thermodynamic property issues:
    - Adds missing 'energy' property to BasicThermodynamicProperties objects
    - Fixes empty ElementalProperties objects with proper values
    - Replaces 'any' usage in seasonalAdjustments.ts with actual elemental values
    - Ensures consistent thermodynamic property calculation throughout the codebase

14. **fix-unknown-object-access.js**: Fixes 'unknown' type object access errors:
    - Adds type assertions for accessing properties on objects with 'unknown' type
    - Fixes recipe property access errors (elementalProperties, season, tags, etc.)
    - Adds proper type assertions for elementalEffect property access
    - Adds missing type imports for Recipe interfaces
    - Resolves "Property does not exist on type 'unknown'" errors

15. **fix-syntax-errors.js**: Fixes syntax errors in problematic files:
    - RepAirs malformed class and method declarations in ChakraAlchemyService.ts
    - Fixes broken object literals with misplaced energy properties in FoodAlchemySystem.ts
    - Corrects syntax errors in alchemy.ts type definitions
    - Resolves parser errors that prevent TypeScript from compiling

16. **fix-multiple-issues.js**: Comprehensive script that fixes multiple issues.

### Utility Scripts

17. **run-all-fixes.js**: Runs all scripts in sequence, tracking error count reduction.

## Usage

### Running All Fixes

The simplest approach is to run all fixes in sequence:

```bash
# Dry run (no changes will be made)
yarn fix:typescript:dry

# Apply all fixes
yarn fix:typescript

# Verbose mode (show detailed output)
yarn fix:typescript:verbose
```

### Running Individual Scripts

You can also run individual scripts if you want to target specific types of issues:

```bash
# Dry run with a specific script
node scripts/typescript-fixes/fix-type-mismatches.js --dry-run

# Apply fixes from a specific script
node scripts/typescript-fixes/fix-import-issues.js
```

## Options

All scripts support the following command-line options:

- `--dry-run`: Run the script without making any changes to files
- `--verbose`: Show detailed output, including all file modifications

## Results

The scripts report the number of errors at the start and end of the process, as well as the number of files modified. When running all scripts with `run-all-fixes.js`, you'll see error count changes after each individual script runs.

## Safety

These scripts are designed to be safe and conservative:

1. They make targeted changes to specific patterns
2. They maintain code structure and only modify what's necessary
3. All changes can be previewed with `--dry-run` before applying
4. The scripts avoid making changes when patterns are ambiguous

## Best Practices

1. Always run with `--dry-run` first to see what changes would be made
2. After fixing errors, run `yarn tsc --noEmit` to check remaining errors
3. Consider running fixes in smaller batches rather than on the entire codebase at once
4. Back up your codebase before running the scripts (or use version control)

## Future Improvements

1. Add more specific fixes for remaining error patterns
2. Create more targeted fixes for component-specific issues
3. Add ability to fix a specific file or directory
4. Add more sophisticated type inference

# Unified Ingredients TypeScript Fix

This directory contains scripts to fix TypeScript issues in the WhatToEatNext project.

## Unified Ingredients Refactoring

### Problem

The original `src/data/unified/ingredients.ts` file was causing 595 TypeScript errors due to:

1. Duplicating ingredient data that already exists in the `data/ingredients` subdirectories
2. Using incorrect TypeScript interfaces that conflicted with the rest of the codebase
3. Containing duplicate keys in the object literal (as shown by linter errors)
4. Being excessively large (601,909 bytes / ~27,000 lines)

### Solution

We've created a completely new implementation that:

1. Acts as an enhancer/adapter for existing ingredient data instead of duplicating it
2. Properly calculates Kalchm and Monica values for all ingredients
3. Uses proper TypeScript interfaces from `unifiedTypes.ts`
4. Provides useful utility functions for working with the unified ingredients

### Implementation Details

The new implementation:

1. Imports ingredient data from its original sources in `data/ingredients/`
2. Enhances each ingredient with calculated Kalchm and Monica values
3. Provides utility functions for finding ingredients by various criteria
4. Maintains compatibility with existing code that uses `unifiedIngredients`

### How to Apply the Fix

1. We've created a new implementation at `src/data/unified/ingredients.ts.new`
2. Run the replacement script to safely update the file:

```bash
# Navigate to the scripts directory
cd scripts/typescript-fixes

# Install dependencies if needed
yarn install

# Run the replacement script
npm run replace-ingredients
```

The script will:
- Create a backup of the original file at `src/data/unified/ingredients.ts.bak`
- Replace the original file with our new implementation
- Remove the temporary `.new` file

### Verification

After running the script, you should:

1. Run the TypeScript compiler to verify that errors are reduced
2. Test the application to ensure all functionality works correctly
3. Check that Kalchm and Monica values are properly calculated

## Other TypeScript Fixes

This directory will be extended with additional scripts to fix other TypeScript issues in the codebase.

# Enhanced TypeScript Error & Warning Fixers

## 🚀 Latest Versions with Advanced Safety Scoring

### **Enhanced TypeScript Error Fixer v3.0** ⭐ NEW
- **File:** `fix-typescript-errors-enhanced-v3.js`
- **Major Upgrade:** Advanced safety scoring system based on proven unused variables template
- **Features:** Adaptive batch sizing, comprehensive corruption detection, AST validation, Git integration
- **Safety Score:** Builds confidence over time, automatically scales from 3→50 files based on success rate
- **Target Errors:** TS2322, TS2459, TS2304, TS2345, TS2740, TS2339, TS2741, TS2688, TS2820, TS2588

### **Enhanced TypeScript Warning Fixer v2.0** ⭐ NEW  
- **File:** `fix-typescript-warnings-enhanced-v2.js`
- **Major Upgrade:** Advanced safety scoring with intelligent warning pattern recognition
- **Features:** Safe unused variable prefixing, intelligent import cleanup, optional console management
- **Safety Score:** Scales from 5→50 files based on validation history
- **Target Warnings:** unused-variable, unused-import, explicit-any, console-statement, deprecated-api

## 📊 Safety Scoring System

Both enhanced scripts use a sophisticated safety validation system:

### **Safety Score Calculation**
```
Safety Score = (Success Rate × 0.35) + 
               (Error Avoidance × 0.25) + 
               (Corruption Prevention × 0.25) + 
               (Build Stability × 0.10) + 
               (Experience Bonus × 0.05)
```

### **Adaptive Batch Sizing**
- **Safety Score ≥ 95%:** Up to 50 files (requires 8+ successful runs)
- **Safety Score ≥ 90%:** Up to 35 files (requires 6+ successful runs)
- **Safety Score ≥ 85%:** Up to 25 files (requires 4+ successful runs)
- **Safety Score ≥ 75%:** Up to 20 files (requires 3+ successful runs)
- **Safety Score ≥ 60%:** Up to 15 files (requires 2+ successful runs)
- **Safety Score < 60%:** Conservative 5-10 files

### **Metrics Storage**
- **Error Fixer:** `.typescript-errors-metrics.json`
- **Warning Fixer:** `.typescript-warnings-metrics.json`

## 🎯 Quick Start Guide

### **1. Error Fixing (v3.0)**
```bash
# Start with dry-run to see what would be fixed
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --dry-run

# Interactive mode (recommended for first runs)
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --interactive

# Auto-fix mode (after building confidence)
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --auto-fix

# View safety metrics
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --show-metrics

# Force specific batch size (for testing)
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --max-files=5
```

### **2. Warning Fixing (v2.0)**
```bash
# Start with dry-run
node scripts/typescript-fixes/fix-typescript-warnings-enhanced-v2.js --dry-run

# Interactive mode
node scripts/typescript-fixes/fix-typescript-warnings-enhanced-v2.js --interactive

# Auto-fix with console statements included
node scripts/typescript-fixes/fix-typescript-warnings-enhanced-v2.js --auto-fix --include-console

# View safety metrics
node scripts/typescript-fixes/fix-typescript-warnings-enhanced-v2.js --show-metrics
```

## 🛡️ Enhanced Safety Features

### **Corruption Detection**
- Pattern A corruption (underscore variable mismatches)
- Regex replacement artifacts (`$1`, `$2`)
- Malformed syntax patterns
- Duplicate declarations
- Excessive nesting

### **Build Validation**
- Real-time build checks every 5-10 files
- Automatic rollback on build failures
- Performance monitoring
- Timeout protection (60-90 seconds)

### **Git Integration**
- Automatic git stash creation
- Clean working directory validation
- Easy rollback instructions
- Commit-friendly batch processing

### **AST Validation**
- Babel parser integration for syntax validation
- TypeScript/JSX support with decorators
- Error recovery mode
- Real-time syntax checking

## 📈 Performance Metrics

### **Error Fixer v3.0 Achievements**
- **Target:** 195+ TypeScript errors → 0 errors
- **Batch Scaling:** 3 files → 50 files (based on safety score)
- **Error Types:** 14 different TS error categories
- **Pattern Library:** 10+ proven fix patterns with confidence scoring

### **Warning Fixer v2.0 Achievements**
- **Target:** 4,625+ warnings reduction
- **Focus Areas:** Unused variables/imports, type safety, console cleanup
- **Safe Approach:** Underscore prefixing instead of deletion
- **Pattern Success:** 95% confidence for unused variables, 85% for imports

## 🔧 Advanced Configuration

### **Error Fixer Configuration**
```javascript
const DEFAULT_CONFIG = {
  // File processing limits (scales with safety)
  minFiles: 3,
  maxFiles: 5,
  maxFilesWithValidation: 25,
  
  // Safety and validation
  requireCleanGit: true,
  createGitStash: true,
  enableCorruptionDetection: true,
  enableASTValidation: true,
  
  // Error targeting and priority
  highPriorityErrors: ['TS2322', 'TS2459', 'TS2304'],
  mediumPriorityErrors: ['TS2345', 'TS2740', 'TS2339', 'TS2741'],
  lowPriorityErrors: ['TS2820', 'TS2588', 'TS2300', 'TS2352'],
  
  // Performance monitoring
  buildValidationInterval: 5,
  enableMetrics: true,
  performanceMonitoring: true
};
```

### **Warning Fixer Configuration**
```javascript
const DEFAULT_CONFIG = {
  // File processing limits
  minFiles: 5,
  maxFiles: 10,
  maxFilesWithValidation: 50,
  
  // Warning targeting (configurable)
  targetWarnings: {
    unusedVariable: true,      // Safe underscore prefixing
    unusedImport: true,        // Intelligent removal
    consoleStatement: false,   // Optional (use --include-console)
    explicitAny: true,         // Convert to 'unknown'
    deprecatedApi: true,       // Update to modern alternatives
    performanceWarning: true   // Optimization patterns
  },
  
  // Build validation
  buildValidationInterval: 10,
  validateBuild: true
};
```

## 🎯 Systematic Workflow

### **Phase 1: Error Elimination (Build Confidence)**
```bash
# Target: 195 → 100 errors
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --dry-run
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --interactive
# Repeat until safety score ≥ 80%
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --auto-fix --max-files=15
```

### **Phase 2: Warning Cleanup (Scale Up)**
```bash
# Target: 4,625 → 2,000 warnings
node scripts/typescript-fixes/fix-typescript-warnings-enhanced-v2.js --dry-run
node scripts/typescript-fixes/fix-typescript-warnings-enhanced-v2.js --interactive
# Scale up as safety score improves
node scripts/typescript-fixes/fix-typescript-warnings-enhanced-v2.js --auto-fix --max-files=25
```

### **Phase 3: Final Polish (Full Automation)**
```bash
# Target: Complete cleanup
# Alternate between error and warning fixers
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --auto-fix --max-files=50
node scripts/typescript-fixes/fix-typescript-warnings-enhanced-v2.js --auto-fix --include-console --max-files=50
```

## 📊 Monitoring and Metrics

### **View Current Metrics**
```bash
# Error fixer metrics
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --show-metrics

# Warning fixer metrics  
node scripts/typescript-fixes/fix-typescript-warnings-enhanced-v2.js --show-metrics

# JSON output for automation
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --show-metrics --json
```

### **Safety Validation**
```bash
# Check if it's safe to run larger batches
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --validate-safety

# Git status check
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --check-git-status
```

## 🚨 Emergency Procedures

### **Rollback Instructions**
```bash
# If script created a stash (automatic)
git stash apply stash^{/typescript-errors-fix-TIMESTAMP}

# Manual rollback (if needed)
git checkout -- .
git reset --hard HEAD

# Check what changed
git diff HEAD~1
```

### **Build Failure Recovery**
```bash
# Immediate build check
yarn build

# If build fails, rollback and investigate
git stash apply stash^{/typescript-errors-fix-TIMESTAMP}
yarn build

# Investigate specific files that failed
npx tsc --noEmit | head -20
```

### **Corruption Detection Response**
```bash
# If corruption detected, stop immediately
# Check the corrupted files manually
git diff

# Rollback corrupted files
git checkout -- path/to/corrupted/file.ts

# Run with smaller batch size
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --max-files=3
```

## 🔄 Integration with CI/CD

### **JSON Output Mode**
```bash
# For automated environments
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --json --silent --auto-fix --max-files=5

# Parse results in CI
if [ $? -eq 0 ]; then
  echo "TypeScript errors fixed successfully"
else
  echo "TypeScript error fixing failed"
  exit 1
fi
```

### **Pre-commit Hook Integration**
```bash
#!/bin/sh
# .git/hooks/pre-commit

# Run error fixer with conservative settings
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --auto-fix --max-files=3 --silent

if [ $? -ne 0 ]; then
  echo "TypeScript error fixing failed. Please review changes."
  exit 1
fi

# Validate build still works
yarn build
```

## 🏆 Success Criteria

### **Error Fixer Targets**
- **Safety Score:** Achieve ≥ 90% within 10 runs
- **Error Reduction:** 195 → 0 errors (100% elimination)
- **Build Stability:** 100% build success rate maintained
- **Batch Scaling:** Successfully scale to 25+ files per run

### **Warning Fixer Targets**
- **Safety Score:** Achieve ≥ 95% within 15 runs  
- **Warning Reduction:** 4,625 → 1,000 warnings (75% reduction)
- **Pattern Success:** ≥ 90% success rate for unused variables
- **Build Stability:** 100% build success rate maintained

### **Combined Campaign Success**
- **Total Cleanup:** Achieve clean TypeScript compilation
- **Development Ready:** Maintain 100% development server functionality
- **Performance:** Average file processing time < 500ms
- **Reliability:** Zero corruption incidents across all runs

## 📚 Legacy Scripts (Reference Only)

- `fix-typescript-errors-enhanced-v2.js` - Previous version (superseded by v3.0)
- `fix-typescript-warnings-enhanced.js` - Previous version (superseded by v2.0)
- `fix-unused-variables-interactive.js` - Template script (completed, archived)

**Note:** Always use the latest enhanced versions (v3.0 for errors, v2.0 for warnings) for optimal safety and performance. 