# 🚀 Enhanced Scripts Quick Reference (v3.0 & v2.0)

## ⭐ NEW: Advanced Safety Scoring System

Both enhanced scripts now include sophisticated safety validation based on the proven `fix-unused-variables-interactive.js` template:

- **Adaptive Batch Sizing:** Automatically scales from 3→50 files based on success history
- **Safety Score Tracking:** Comprehensive metrics with confidence building over time  
- **Corruption Prevention:** Multi-level detection and automatic rollback
- **Build Validation:** Real-time checks with automatic stash points
- **Performance Monitoring:** File processing times and optimization tracking

## 🎯 Primary Scripts (Latest Versions)

### **1. Enhanced TypeScript Error Fixer v3.0** ⭐ NEW
```bash
# File: scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js

# Quick start (recommended for first use)
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --dry-run

# Interactive mode (builds confidence)
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --interactive

# Auto-fix mode (after safety score ≥ 80%)
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --auto-fix

# View safety metrics and recommended batch size
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --show-metrics

# Force specific batch size (testing/validation)
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --max-files=5
```

**Target Errors:** TS2322, TS2459, TS2304, TS2345, TS2740, TS2339, TS2741, TS2688, TS2820, TS2588  
**Safety Features:** AST validation, corruption detection, Git integration, adaptive scaling  
**Batch Range:** 3→50 files (based on safety score)

### **2. Enhanced TypeScript Warning Fixer v2.0** ⭐ NEW
```bash
# File: scripts/typescript-fixes/fix-typescript-warnings-enhanced-v2.js

# Quick start (recommended)
node scripts/typescript-fixes/fix-typescript-warnings-enhanced-v2.js --dry-run

# Interactive mode
node scripts/typescript-fixes/fix-typescript-warnings-enhanced-v2.js --interactive

# Auto-fix mode (standard warnings)
node scripts/typescript-fixes/fix-typescript-warnings-enhanced-v2.js --auto-fix

# Include console statement cleanup (optional)
node scripts/typescript-fixes/fix-typescript-warnings-enhanced-v2.js --auto-fix --include-console

# View safety metrics
node scripts/typescript-fixes/fix-typescript-warnings-enhanced-v2.js --show-metrics
```

**Target Warnings:** unused-variable, unused-import, explicit-any, console-statement, deprecated-api  
**Safety Features:** Safe underscore prefixing, intelligent import cleanup, build validation  
**Batch Range:** 5→50 files (based on safety score)

## 📊 Safety Score Quick Guide

### **Understanding Safety Scores**
- **≥ 95%:** Expert level - can handle 50 files safely
- **≥ 90%:** Advanced level - can handle 35 files
- **≥ 85%:** Intermediate level - can handle 25 files  
- **≥ 75%:** Developing level - can handle 20 files
- **≥ 60%:** Basic level - can handle 15 files
- **< 60%:** Conservative level - 5-10 files only

### **Building Safety Score**
```bash
# Start conservatively
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --interactive --max-files=3

# Check progress
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --show-metrics

# Gradually increase as safety score improves
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --auto-fix --max-files=10

# Eventually reach full automation
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --auto-fix  # Uses recommended batch size
```

## 🎯 Recommended Workflow

### **Phase 1: Initial Setup (Safety Score 0→60%)**
```bash
# 1. Start with error fixer (dry-run)
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --dry-run

# 2. Run interactively to build confidence
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --interactive --max-files=3

# 3. Check build after each run
yarn build

# 4. View metrics progress
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --show-metrics
```

### **Phase 2: Confidence Building (Safety Score 60→85%)**
```bash
# 1. Increase batch sizes gradually
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --auto-fix --max-files=5
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --auto-fix --max-files=10

# 2. Add warning fixer to workflow
node scripts/typescript-fixes/fix-typescript-warnings-enhanced-v2.js --interactive --max-files=5

# 3. Monitor safety scores for both
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --show-metrics
node scripts/typescript-fixes/fix-typescript-warnings-enhanced-v2.js --show-metrics
```

### **Phase 3: Full Automation (Safety Score ≥85%)**
```bash
# 1. Use recommended batch sizes (automatic scaling)
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --auto-fix

# 2. Run warning fixer with larger batches
node scripts/typescript-fixes/fix-typescript-warnings-enhanced-v2.js --auto-fix --max-files=25

# 3. Optional: Include console cleanup
node scripts/typescript-fixes/fix-typescript-warnings-enhanced-v2.js --auto-fix --include-console
```

## 🛡️ Safety Commands

### **Pre-flight Checks**
```bash
# Check git status
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --check-git-status

# Validate safety before large runs
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --validate-safety

# View current metrics
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --show-metrics
node scripts/typescript-fixes/fix-typescript-warnings-enhanced-v2.js --show-metrics
```

### **Emergency Procedures**
```bash
# If corruption detected or build fails:

# 1. Check git status
git status

# 2. Rollback using automatic stash (script will show command)
git stash apply stash^{/typescript-errors-fix-TIMESTAMP}

# 3. Or manual rollback
git checkout -- .

# 4. Validate build works
yarn build

# 5. Start over with smaller batch
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --max-files=3
```

## 📈 Performance Targets

### **Error Fixer v3.0 Targets**
- **Current State:** ~195 TypeScript errors
- **Target:** 0 errors (100% elimination)
- **Success Criteria:** Safety score ≥ 90%, batch size ≥ 25 files

### **Warning Fixer v2.0 Targets**  
- **Current State:** 4,625+ warnings
- **Target:** <1,000 warnings (75% reduction)
- **Focus:** Unused variables/imports, type safety
- **Success Criteria:** Safety score ≥ 95%, batch size ≥ 35 files

## 🔧 Advanced Options

### **JSON Output (for automation)**
```bash
# Get JSON results for CI/CD integration
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --json --silent --auto-fix --max-files=5

# Parse exit codes
# 0 = success, 1 = error, 2 = partial success
```

### **Specific Error Type Targeting**
```bash
# Focus on high-priority errors first
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --auto-fix --max-files=10
# Automatically prioritizes TS2322, TS2459, TS2304

# Focus on specific warning types
node scripts/typescript-fixes/fix-typescript-warnings-enhanced-v2.js --auto-fix
# Targets unused-variable, unused-import, explicit-any by default
```

### **Performance Monitoring**
```bash
# View detailed performance metrics
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --show-metrics --json | jq '.safetyMetrics.performanceMetrics'

# Track average file processing time
node scripts/typescript-fixes/fix-typescript-warnings-enhanced-v2.js --show-metrics | grep "Average File Time"
```

## 🏆 Success Indicators

### **Green Light Indicators (Safe to Scale Up)**
- ✅ Safety score ≥ 80%
- ✅ 5+ successful runs without corruption
- ✅ Build passes consistently
- ✅ No Pattern A corruption detected
- ✅ Average file time < 500ms

### **Yellow Light Indicators (Proceed with Caution)**
- ⚠️ Safety score 60-80%
- ⚠️ 1-2 corruption incidents detected
- ⚠️ Occasional build failures
- ⚠️ Processing time increasing

### **Red Light Indicators (Stop and Investigate)**
- 🚨 Safety score < 60%
- 🚨 Multiple corruption incidents
- 🚨 Consistent build failures
- 🚨 High error rates
- 🚨 File processing taking > 1000ms

## 📚 Legacy Reference

### **Archived Scripts (Historical Reference)**
- `fix-unused-variables-interactive.js` - ✅ COMPLETED (template for safety system)
- `fix-typescript-errors-enhanced-v2.js` - Superseded by v3.0
- `fix-typescript-warnings-enhanced.js` - Superseded by v2.0

### **Migration from Legacy Scripts**
If using older versions, migrate to enhanced versions:
```bash
# Replace old error fixer
# OLD: node scripts/typescript-fixes/fix-typescript-errors-enhanced-v2.js
# NEW: node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js

# Replace old warning fixer  
# OLD: node scripts/typescript-fixes/fix-typescript-warnings-enhanced.js
# NEW: node scripts/typescript-fixes/fix-typescript-warnings-enhanced-v2.js
```

## 🎯 Quick Decision Tree

**"Which script should I run?"**

1. **First time user?** → Start with `--dry-run` on error fixer v3.0
2. **Have TypeScript errors?** → Use error fixer v3.0 
3. **Only have warnings?** → Use warning fixer v2.0
4. **Safety score < 80%?** → Use `--interactive` mode with small batches
5. **Safety score ≥ 80%?** → Use `--auto-fix` with recommended batch sizes
6. **Want to include console cleanup?** → Add `--include-console` to warning fixer
7. **Need automation/CI?** → Use `--json --silent` flags

**"What batch size should I use?"**

- **Safety score unknown:** Start with `--max-files=3`
- **Safety score < 60%:** Use `--max-files=5` 
- **Safety score 60-80%:** Use `--max-files=10`
- **Safety score ≥ 80%:** Let script choose (omit `--max-files`)

Remember: The enhanced scripts will automatically recommend safe batch sizes based on your success history!

---

## Overview

This directory contains enhanced TypeScript error and warning fixing scripts with advanced safety scoring systems. These scripts are designed to systematically clean up TypeScript errors and warnings while maintaining 100% build stability and preventing corruption.

### **Key Features**
- **Adaptive batch sizing** based on safety score and success history
- **Comprehensive corruption detection** to prevent dangerous changes
- **Real-time build validation** with automatic rollback capabilities
- **Git integration** with automatic stash creation and rollback instructions
- **Performance monitoring** with file processing time tracking
- **JSON output mode** for CI/CD integration and automation

### **Safety Philosophy**
These scripts prioritize safety over speed, learning from each run to build confidence and automatically scale batch sizes. They're designed to prevent the "script terror" that can occur with aggressive automated fixes.

### **Success Metrics**
- **Error Fixer:** Target 195+ TypeScript errors → 0 errors (100% elimination)
- **Warning Fixer:** Target 4,625+ warnings → <1,000 warnings (75% reduction)
- **Safety Score:** Build confidence to ≥90% for errors, ≥95% for warnings
- **Performance:** Average file processing time <500ms, batch sizes up to 50 files

### **Usage Philosophy**
Start conservatively with small batches and interactive mode, then gradually scale up as the safety score improves. The scripts will automatically recommend optimal batch sizes based on your success history. 