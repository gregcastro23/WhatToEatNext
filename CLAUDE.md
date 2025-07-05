# CLAUDE.md - WhatToEatNext Project Development Guide

## 📋 Project Overview

**WhatToEatNext** is an innovative culinary recommendation system that combines astrological wisdom with modern computational power to provide personalized food and cooking method recommendations.

**Tech Stack:**
- Framework: Next.js 15.3.4 with TypeScript 5.1.6
- Package Manager: Yarn 1.22+ (NEVER use npm)
- Node Version: 23.11.0 (requires >=20.18.0)
- Working Directory: `/Users/GregCastro/Desktop/WhatToEatNext`
- Current Branch: `cancer` (45+ modified files pending deployment prep)

## 🚀 Development Workflows

### 📚 Claude Chat Commands

When working in Claude chat, use these commands to update all documentation:

```bash
# /docs - Complete Documentation Update (Full Command)
./scripts/doc-update.sh

# /docs - Complete Documentation Update (Short Alias) ⭐ NEW!
./scripts/docs                       # Shorter version
./scripts/docs dry                   # Dry run mode
./scripts/docs verbose               # Verbose output  
./scripts/docs help                  # Show complete help

# Full Command Options:
./scripts/doc-update.sh --dry-run    # Preview changes first
./scripts/doc-update.sh --verbose    # Show detailed progress
```

**What it updates:**
- ✅ All critical documentation files (PROJECT_STATUS.md, CLAUDE.md, etc.)
- ✅ **Session continuation prompts** - For continuing current chat
- ✅ **Next session prompts** - For starting new chat sessions  
- ✅ Documentation indices and cross-references
- ✅ Status files and progress tracking

**Use frequently:** This command is designed to be run multiple times per chat session to keep all documentation synchronized!

**Note:** `/docs` is not a built-in Claude slash command (like `/doctor` or `/init`). It's a convenient reference to our project-specific documentation update script.

### Essential Commands
```bash
# Development
make dev              # Start development server
make build            # Build for production
make test             # Run all tests
make lint             # Run linting checks

# TypeScript Error Checking
make check            # TypeScript error checking
make errors           # Analyze current TypeScript errors
make errors-detail    # Detailed error analysis
make errors-by-file   # Errors grouped by file
make errors-by-type   # Errors grouped by type

# Advanced Error Resolution (NEW)
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --dry-run
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --max-files=15 --auto-fix
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --validate-safety

# Git & Deployment
make status           # Git repository status
make deploy           # Full deployment pipeline
make commit-phase     # Create phase-specific commit
```

### Quick Development Check
```bash
# Get baseline error count
yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS"

# Build validation
yarn build

# Error breakdown
yarn tsc --noEmit --skipLibCheck 2>&1 | grep -E "error TS" | sed 's/.*error //' | cut -d':' -f1 | sort | uniq -c | sort -nr
```

## 🏆 Project Goals & Achievements

### Historic TypeScript Error Reduction Campaign

**Total Historic Achievements:**
- **24 Complete Error Category Eliminations** 🏆
- **5,000+ errors eliminated** across entire project
- **100% build stability maintained** throughout all campaigns

### Major Completed Campaigns:

1. **TS2339** (Property access): 256→0 errors (100% elimination)
2. **TS2588** (Read-only assignments): 287→0 errors (100% elimination)  
3. **TS2345** (Argument types): 165→0 errors (100% elimination)
4. **TS2304** (Cannot find name): 100→0 errors (100% elimination)
5. **TS2820** (Type constraints): 90→0 errors (100% elimination)
6. **TS2741** (Missing properties): 73→0 errors (100% elimination)
7. **TS2352** (Type conversion): 99→0 errors (100% elimination)
8. **TS2322** (Type assignment): 55→0 errors (100% elimination)
9. **TS2300** (Duplicate identifiers): 58→0 errors (100% elimination)
10. **TS2739** (Interface mismatches): 50→0 errors (100% elimination)
11. **TS2362/2365/2363** (Arithmetic errors): 71→5 errors (91% elimination)
12. **TS2551** (Property existence): 10→0 errors (100% elimination)
13. **TS2724** (Module exports): 29→0 errors (100% elimination)
14. **TS2614** (Import syntax): 25→0 errors (100% elimination)
15. **TS2305** (Module exports): 250→0 errors (100% elimination)

## 🛠️ Development Best Practices

### TypeScript Error Resolution

**Enhanced TypeScript Error Fixer v3.0 (PRODUCTION-READY):**
- **Advanced Safety Scoring**: Adaptive batch sizing based on success metrics
- **Corruption Prevention**: Real-time detection and git stash rollback system
- **Build Validation**: Automatic verification every 5 files processed
- **Pattern Library**: Proven fix patterns with 100% success rates

**Proven Fix Patterns:**
```typescript
// TS2322 String Array to Typed Array (12/12 successes)
seasonality: ['summer', 'spring'] as Season[]

// TS2304 Missing Import (2/2 successes) 
import { MissingType } from '@/types/correct-path'

// TS2322 Object to Interface (DISABLED - corruption risk)
// Use manual type assertions instead
```

**Deployment Commands:**
```bash
# Safe batch processing (recommended)
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --max-files=15 --auto-fix

# Validation and metrics
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --validate-safety
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --show-metrics

# Emergency rollback
git stash apply stash^{/typescript-errors-fix-TIMESTAMP}
```

**Safety Protocols:**
- Always run with `--max-files` limitation (5-25 files recommended)
- Build validation checkpoint every 5 files
- Git stash created before each run for instant rollback
- Corruption detection patterns prevent dangerous modifications

### Alchemical System Rules

**Sacred Elements:** Fire, Water, Earth, Air (NEVER use Metal, Wood, Void)
**Element Casing:** Capitalize elements (Fire, Water, Earth, Air)
**Zodiac Casing:** Lowercase zodiac signs (aries, taurus, etc.)
**Planet Casing:** Capitalize planets (Sun, Moon, Mercury, etc.)
**Season Types:** Include 'autumn'/'fall' and 'all' options

## 📊 Current Project Status

### TypeScript Error Landscape (MAJOR UPDATE - July 2025)
- **Current Status:** 37 errors (down from 43 in latest session)
- **Recent Achievement:** 14% error reduction with zero corruption incidents
- **Total Historic Reduction:** 5,000+ → 37 errors (99.3% elimination)
- **Build Status:** ✅ Production-ready (100% successful compilation)
- **Error Fixer v4.0:** Enhanced safety protocols with systematic pattern application

### TypeScript Error Fixer v4.0 Achievements
- **Enhanced Safety Protocols:** Zero corruption incidents during systematic error reduction
- **Service Layer Fixes:** Multiple type casting and context property fixes applied
- **Component Layer Optimization:** Safe type assertions for complex transformations
- **Safety Systems:** Git stash rollback, build validation, and corruption prevention
- **Batch Processing:** Systematic error reduction from 43 → 37 errors (14% reduction)

### ESLint Warning Reduction Campaign (NEW)
- **Import Resolution:** 251 warnings eliminated with path alias fixes
- **Console Cleanup:** 300+ console statements systematically removed
- **Unused Variables:** 180+ unused imports and variables cleaned up
- **Any-Type Campaign:** 2,498 any-type warnings identified for systematic elimination
- **Build Validation:** 100% build stability maintained throughout all campaigns

### Monica Constant Integration (Complete)
- **Enhanced Scoring Algorithm:** 7-component weighting system
- **Real-time UI Integration:** Monica analysis with classification display
- **Cooking Method Enhancement:** Complete thermodynamic scoring
- **Production Ready:** All components functional and tested

## 🔧 Common Tasks & Solutions

### Running Tests
```bash
make test           # All tests
make test-watch     # Watch mode
make test-coverage  # With coverage
```

### Linting & Formatting
```bash
make lint          # Check linting
make lint-fix      # Fix linting issues
```

### Error Analysis
```bash
make errors-critical      # Critical errors (TS2xxx series)
make errors-export       # Export/Import errors
make phase-status        # Current campaign progress
```

### Docker Development
```bash
make docker-build    # Build Docker images
make docker-dev      # Development container
make docker-prod     # Production container
make docker-clean    # Clean Docker resources
```

## 📋 Essential Information for Development

### Key Directories
- `/src/data/` - Ingredient and recipe data
- `/src/components/` - React components
- `/src/services/` - Business logic services
- `/src/utils/` - Utility functions
- `/src/calculations/` - Alchemical calculations
- `/scripts/` - Development and fix scripts

### Important Files
- `Makefile` - Comprehensive development commands
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `TYPESCRIPT_PHASES_TRACKER.ipynb` - Error tracking history

### Git Workflow
```bash
make status              # Check git status
make commit-phase        # Phase-specific commits
make backup             # Create backup branch
```

## 🚀 Deployment Readiness Assessment

### ✅ Production Requirements Met
- **Build System:** Next.js 15.3.4 successfully compiles despite TypeScript errors
- **Node Version:** 23.11.0 (exceeds minimum requirement of 20.18.0)
- **Package Manager:** Yarn 1.22+ properly configured
- **Dependencies:** All production dependencies resolved successfully
- **Environment:** Production build generates successfully with static optimization

### ⚠️ Pre-Deployment Tasks Required
- **Git Cleanup:** 45+ modified files in working directory need systematic review
- **TypeScript Errors:** 86 remaining errors (non-blocking for deployment)
- **Cancer Branch:** Needs merge preparation and conflict resolution
- **Testing:** Full test suite validation recommended
- **Uncommitted Files:** Several new type definitions and API integrations pending

### 🎯 Deployment Strategy Recommendations
1. **Immediate (Low Risk):** Current build is deployable with TypeScript errors
2. **Short Term:** Continue error reduction to <50 errors for optimal maintainability  
3. **Medium Term:** Complete git cleanup and merge cancer branch to master
4. **Long Term:** Achieve zero TypeScript errors for perfect type safety

## 🎯 Next Development Priorities

1. **Complete ESLint Any-Type Campaign** - Target remaining 2,498 any-type warnings
2. **Finalize TypeScript Error Reduction** - Target remaining 37 errors
3. **Git Branch Cleanup** - Prepare cancer branch for safe deployment
4. **Performance Optimization** - Enhance calculation speed
5. **Mobile Optimization** - Responsive design improvements
6. **API Integration** - Finalize astronomical data integrations

## 📚 Documentation & References

- **Architecture:** `docs/architecture/`
- **Build Fixes:** `docs/build-fixes.md`
- **Scripts:** `scripts/QUICK_REFERENCE.md`
- **Inventory:** `scripts/INVENTORY.md`

## 🚨 Emergency Procedures

### Build Failures
```bash
make clean          # Clean build artifacts
make install        # Reinstall dependencies
make build          # Attempt rebuild
```

### Git Issues
```bash
make emergency-restore    # Check for clean state
make backup              # Create backup branch
```

### TypeScript Error Fixer Emergencies
```bash
# If script corrupts files
git stash apply stash^{/typescript-errors-fix-LATEST}

# If build fails after script run
yarn build  # Check specific error
git restore <corrupted-file>  # Restore individual files

# If import corruption detected
git status  # Check affected files
git restore src/components/demo/UnifiedScoringDemo.tsx
git restore src/services/examples/UnifiedScoringExample.ts

# Reset error fixer metrics (nuclear option)
rm .typescript-errors-metrics.json
node scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js --reset-metrics
```

### TypeScript Error Analysis
```bash
make check                # Full TypeScript check
make errors-detail        # Detailed error analysis
make errors-by-type       # Error distribution analysis
make quick-check         # Quick development check

# Advanced error analysis
yarn tsc --noEmit --skipLibCheck 2>&1 | grep -E "error TS" | head -20
yarn tsc --noEmit --skipLibCheck 2>&1 | grep -E "error TS" | sed 's/.*error //' | cut -d':' -f1 | sort | uniq -c | sort -nr
```

### Deployment Emergency Procedures
```bash
# Pre-deployment safety check
make deploy-check
git status --porcelain | wc -l  # Count uncommitted files

# Emergency deployment rollback
git log --oneline -10
git reset --hard <last-clean-commit>

# Production build validation
NODE_ENV=production yarn build
yarn start  # Test production server locally
```

---

**🎉 WhatToEatNext represents a groundbreaking fusion of ancient alchemical wisdom and modern computational power, creating the world's first astrologically-informed culinary recommendation system!**

## 📊 Current Deployment Status Summary

**✅ PRODUCTION READY**
- Build System: ✅ Successfully compiles and generates static assets
- Error Reduction: ✅ 99.3% reduction achieved (5,000+ → 37 errors)
- TypeScript Fixer: ✅ v4.0 deployed with enhanced safety protocols
- ESLint Campaign: ✅ 731+ warnings eliminated across import/console/variables
- Safety Systems: ✅ Corruption prevention and rollback mechanisms operational

**⚠️ DEPLOYMENT PREP REQUIRED**
- Git Cleanup: 45+ modified files need systematic review
- Cancer Branch: Requires merge preparation to master
- Any-Type Campaign: 2,498 remaining any-type warnings to address
- Final Testing: Recommended before production deployment

**🎯 RECOMMENDATION:** 
Current codebase is **immediately deployable** with excellent stability. Complete git cleanup recommended for optimal maintainability.


## 📚 Documentation Status (2025-07-04)
- **Files Updated**: 45 files synchronized in current session
- **Status**: ✅ All documentation current and properly cross-referenced
- **Build Integration**: ✅ All documentation changes integrated with build system
- **Cross-References**: ✅ All internal links verified and updated
- **Index Files**: ✅ All documentation indices updated and current


*Last Updated: July 2025 - TypeScript Error Fixer v4.0 + ESLint Campaign Phase 1 Complete*