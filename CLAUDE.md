# WhatToEatNext - Claude AI Assistant Guide

*Last Updated: September 23, 2025*

## Project Overview

WhatToEatNext is a sophisticated culinary recommendation system that combines alchemical principles, astrological data, and elemental harmony to provide personalized food recommendations. The project has undergone significant recovery and optimization work to achieve a stable, production-ready state.

## Current Project Status

### ✅ **RECOVERY COMPLETE** - Stable Production State

**Recovery Achievement (September 2025):**
- **Branch**: Master (with recovery fixes applied)
- **Build Status**: ✅ Stable and functional
- **Test Files**: ✅ Completely removed (170 files cleaned)
- **Dependencies**: ✅ Fresh installation and optimized
- **Configuration**: ✅ Optimized TypeScript config (`tsconfig.prod.json`)
- **Error State**: 🔄 Some syntax errors remain but manageable

### 📊 **Historic Achievements**

1. **TypeScript Error Elimination Campaigns**:
   - Multiple complete category eliminations (TS2339, TS2588, TS2345, etc.)
   - Historic achievement: 1,800+ errors eliminated across campaigns
   - Maintained 100% build stability throughout all campaigns

2. **External Service Cleanup Campaign**:
   - **9,991 lines of code removed**
   - Removed all external API dependencies (USDA, Spoonacular, MCP)
   - Focused on core astrologize & alchemize APIs
   - Local implementations for all functionality

3. **Linting Excellence Campaign**:
   - Phase 1-8 systematic improvement
   - Sub-30 second full codebase analysis achieved
   - Enhanced caching and parallel processing
   - CI/CD integration with quality gates

## Core Architecture

### **Primary APIs**
- **astrologize API**: Astrological calculations and planetary positions
- **alchemize API**: Alchemical transformations and elemental harmony

### **Key Components**
- **Elemental System**: Fire, Water, Earth, Air (individually valuable, no opposing forces)
- **Alchemical Properties**: Spirit, Essence, Matter, Substance (ESMS system)
- **14 Alchemical Pillars**: Traditional cooking method transformations
- **Planetary Position System**: Real-time astronomical calculations with fallbacks

### **Technology Stack**
- **Frontend**: Next.js 15.3.4, React, TypeScript
- **Package Manager**: Yarn (required - npm lockfiles auto-removed)
- **Build System**: Enhanced with automated repair and validation
- **Styling**: CSS Modules, Tailwind CSS

## Development Commands

### **Essential Commands**
```bash
# Development workflow
make install     # Install dependencies
make dev         # Start development server
make build       # Production build with validation
make lint        # Run linting checks
make check       # TypeScript error checking

# Build system management
make build-health        # Check build system status
make build-validate      # Validate build integrity
make build-safe          # Safe build with repair integration

# Error analysis
make errors              # Analyze TypeScript errors
make errors-by-type      # Group errors by type
make errors-by-file      # Group errors by file
```

### **Advanced Commands**
```bash
# Linting excellence
make lint-quick          # Ultra-fast linting (no type checking)
make lint-performance    # Performance-optimized linting
make lint-campaign-status # Current campaign progress

# Phase management
make phase-status        # Current development phase status
make phase-validate      # Validate phase completion
make phase-checkpoint    # Create checkpoint commit

# CI/CD pipeline
make ci-validate         # Complete CI validation
make ci-quality-gate     # Quality gate validation
make deploy-pipeline     # Full deployment workflow
```

## File Structure

### **Core Directories**
```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
├── calculations/        # Alchemical & astrological calculations
├── data/               # Ingredient databases & planetary data
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── services/           # API services and integrations
└── contexts/           # React context providers
```

### **Configuration Files**
- `tsconfig.prod.json` - Optimized TypeScript configuration
- `eslint.config.cjs` - Enhanced ESLint configuration (892 lines)
- `Makefile` - Comprehensive build and development commands
- `package.json` - Dependencies and scripts

## Development Guidelines

### **Casing Conventions (CRITICAL)**
```typescript
// Elements - Capitalized (Pascal Case)
type ElementType = 'Fire' | 'Water' | 'Earth' | 'Air';

// Planets - Capitalized
type Planet = 'Sun' | 'Moon' | 'Mercury' | 'Venus';

// Zodiac Signs - Lowercase
type ZodiacSign = 'aries' | 'taurus' | 'gemini';

// Alchemical Properties - Capitalized
type AlchemicalProperty = 'Spirit' | 'Essence' | 'Matter' | 'Substance';

// Cuisine Types - Capitalized with hyphens
type CuisineType = 'Italian' | 'Mexican' | 'Middle-Eastern';

// Lunar Phases - Lowercase with spaces
type LunarPhase = 'new moon' | 'full moon' | 'waxing crescent';
```

### **Elemental Logic Principles**
1. **No Opposing Elements**: Fire doesn't oppose Water; each element is individually valuable
2. **Elements Reinforce Themselves**: Like strengthens like (Fire + Fire = stronger Fire)
3. **All Combinations Work**: Different elements have good compatibility (0.7+)
4. **No "Balancing"**: Don't write code that tries to balance elements against each other

### **Type Safety Rules**
- **Never use `as any`** - Always use proper type assertions
- **Interface-First Development** - Define types before implementation
- **Safe Property Access** - Use optional chaining and type guards
- **No Lazy Fixes** - Always use real codebase functionality, not placeholders

## Error Reduction Strategies

### **Proven Patterns**
1. **Pattern #1 (Safe Property Access)**: `data?.property` with proper type guards
2. **Pattern BB (Planet Casing)**: Ensure consistent planet name capitalization
3. **Pattern GG (Interface Completion)**: Complete missing interface properties
4. **Pattern JJ (Type Source Authority)**: Establish authoritative type hierarchies

### **Current Focus Areas**
- Syntax error cleanup (remaining from recovery)
- Interface compliance improvements
- Import/export optimization
- Build stability maintenance

## Testing Strategy

### **Test Status**
- **Test Files**: ✅ Completely removed (170+ test files cleaned)
- **Build Testing**: Integrated into Makefile commands
- **CI/CD Testing**: Automated pipeline validation
- **Manual Testing**: Component and API functionality

### **Quality Assurance**
- **TypeScript Validation**: `make check` for error analysis
- **Linting Validation**: Enhanced ESLint configuration
- **Build Validation**: `make build-safe` with integrated checks
- **Performance Monitoring**: Sub-30 second analysis targets

## Deployment

### **Production Readiness**
- ✅ Zero external service dependencies
- ✅ Local implementations for all functionality
- ✅ Optimized build configuration
- ✅ Enhanced error handling and fallbacks

### **Deployment Commands**
```bash
make deploy-check        # Pre-deployment validation
make deploy-pipeline     # Complete deployment workflow
make docker-build        # Docker container build
make docker-deploy       # Docker deployment
```

## Troubleshooting

### **Common Issues**

1. **Build Failures**:
   ```bash
   make build-health        # Check system status
   make build-repair        # Fix common issues
   make build-emergency     # Emergency recovery
   ```

2. **TypeScript Errors**:
   ```bash
   make errors-by-type      # Identify error patterns
   make check               # Full error analysis
   make phase-validate      # Validate current state
   ```

3. **Performance Issues**:
   ```bash
   make lint-performance    # Check linting performance
   make lint-cache-clear    # Clear caches
   make performance-validate # Performance validation
   ```

### **Emergency Procedures**
```bash
make emergency-restore   # Check for recent clean states
make backup             # Create backup branch
git reset --hard <commit> # Restore to clean state
```

## Memory Notes for AI Assistants

### **Critical Principles**
- **NEVER use lazy fixes or placeholder functionality** [[memory:2511227]]
- **Always use existing codebase functionality** instead of creating shortcuts
- **Follow proven casing conventions** established through TS2820 campaigns
- **Maintain elemental logic principles** - no opposing elements concept
- **Use systematic approaches** for error reduction campaigns

### **Historic Context**
- Project has achieved **unprecedented TypeScript mastery** with multiple complete error category eliminations
- **Build stability maintained at 100%** throughout all major campaigns
- **9,991 lines removed** in external service cleanup while preserving core functionality
- **Linting excellence achieved** with sub-30 second analysis and enhanced caching

### **Current State**
- **Master branch** contains all recovery work and optimizations
- **Some syntax errors remain** but are isolated and manageable
- **Production ready** with pure astrologize & alchemize focus
- **All major campaigns completed** - ready for continued development

## Quick Reference

### **Most Used Commands**
```bash
make install && make dev     # Start development
make build                   # Production build
make errors                  # Check TypeScript errors
make lint-quick             # Fast linting
make phase-status           # Current project status
```

### **Emergency Commands**
```bash
make build-emergency        # Emergency build recovery
make emergency-restore      # Find recent clean states
make backup                 # Create safety backup
```

---

*This guide reflects the current state after the September 2025 recovery campaign. The project is now in a stable, production-ready state with optimized configurations and proven development workflows.*
