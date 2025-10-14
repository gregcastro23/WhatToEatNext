# WhatToEatNext - Claude AI Assistant Guide

*Last Updated: October 13, 2025*

## Project Overview

WhatToEatNext is a sophisticated culinary recommendation system that combines alchemical principles, astrological data, and elemental harmony to provide personalized food recommendations.

## Current Project Status (October 2025)

### 🎯 **Active Campaign: Systematic Parsing Error Elimination**
- **Current Errors**: 437 parsing errors (down from 440)
- **Target**: <42 errors (90% reduction)
- **Progress**: 3 fixed (alchemicalPillars.ts, linting test files, CampaignSystemMocks.ts)
- **Status**: In progress - systematic file-by-file approach

### ✅ **Build Status**
- **Branch**: master
- **Build**: ✅ Stable and functional
- **Dependencies**: ✅ Optimized (Yarn required)
- **Configuration**: ✅ TypeScript optimized (`tsconfig.prod.json`)

### 📊 **Error Metrics**
- **Total ESLint Issues**: 4,852 (724 errors, 4,128 warnings)
- **Parsing Errors**: 437 (priority focus)
- **Auto-fixable**: 36 errors

## Core Architecture

### **Hierarchical Culinary Data System**

**Three-Tier Architecture:**

1. **Tier 1 - Ingredients** (Elemental Only)
   - Store ONLY elemental properties: Fire, Water, Earth, Air (normalized to 1.0)
   - NO alchemical properties at ingredient level
   - Rationale: Ingredients lack astrological context for ESMS

2. **Tier 2 - Recipes** (Computed - Full Alchemical)
   - Alchemical properties from planetary positions via `calculateAlchemicalFromPlanets()`
   - Elemental properties: 70% ingredients + 30% zodiac signs
   - Thermodynamic metrics from ESMS + elementals
   - Kinetic properties (P=IV circuit model)

3. **Tier 3 - Cuisines** (Aggregated - Statistical)
   - Weighted average properties across recipes
   - Cultural signatures (z-score > 1.5σ)
   - Statistical variance and diversity metrics

**Key Modules:**
- `src/utils/planetaryAlchemyMapping.ts` - Authoritative ESMS calculation
- `src/utils/hierarchicalRecipeCalculations.ts` - Recipe computation
- `src/utils/cuisineAggregations.ts` - Statistical signatures
- `src/types/celestial.ts` - Core type definitions

### **Primary APIs**
- **astrologize API**: Astrological calculations and planetary positions
- **alchemize API**: Alchemical transformations and elemental harmony

### **Key Components**
- **Elemental System**: Fire, Water, Earth, Air (no opposing forces)
- **Alchemical Properties**: Spirit, Essence, Matter, Substance (ESMS)
  - ⚠️ **CRITICAL**: ESMS ONLY from planetary positions, NOT elemental approximations
- **14 Alchemical Pillars**: Cooking method transformations
- **Planetary System**: Real-time astronomical calculations

### **Technology Stack**
- **Frontend**: Next.js 15.3.4, React 19, TypeScript 5.7.3
- **Package Manager**: Yarn (required)
- **Build**: Webpack with enhanced validation
- **Styling**: CSS Modules, Tailwind CSS

## Development Commands

### **Essential Workflow**
```bash
make install     # Install dependencies
make dev         # Start development server
make build       # Production build
make lint        # Run ESLint
make check       # TypeScript type checking

# Error analysis
make errors              # All TypeScript errors
make errors-by-type      # Group by error type
make errors-by-file      # Group by file
```

### **Linting**
```bash
make lint-quick          # Fast (no type checking)
make lint-performance    # Performance optimized
yarn lint --fix          # Auto-fix issues
```

## Development Guidelines

### **Casing Conventions (CRITICAL)**
```typescript
// Elements - Capitalized
type Element = 'Fire' | 'Water' | 'Earth' | 'Air';

// Planets - Capitalized
type Planet = 'Sun' | 'Moon' | 'Mercury' | 'Venus';

// Zodiac Signs - Lowercase
type ZodiacSign = 'aries' | 'taurus' | 'gemini';

// Alchemical Properties - Capitalized
type AlchemicalProperty = 'Spirit' | 'Essence' | 'Matter' | 'Substance';

// Cuisine Types - Capitalized with hyphens
type CuisineType = 'Italian' | 'Mexican' | 'Middle-Eastern';
```

### **Alchemical Calculation Rules**

**The ONLY Correct Way to Calculate ESMS:**

```typescript
// ✅ CORRECT - Planetary Alchemy Mapping
import { calculateAlchemicalFromPlanets } from '@/utils/planetaryAlchemyMapping';

const alchemical = calculateAlchemicalFromPlanets({
  Sun: 'Gemini',
  Moon: 'Leo',
  Mercury: 'Taurus',
  // ... other planets
});
// Result: { Spirit: 4, Essence: 7, Matter: 6, Substance: 2 }
```

**Planetary Alchemy Values:**
```typescript
Sun:     { Spirit: 1, Essence: 0, Matter: 0, Substance: 0 }
Moon:    { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 }
Mercury: { Spirit: 1, Essence: 0, Matter: 0, Substance: 1 }
Venus:   { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 }
Mars:    { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 }
Jupiter: { Spirit: 1, Essence: 1, Matter: 0, Substance: 0 }
Saturn:  { Spirit: 1, Essence: 0, Matter: 1, Substance: 0 }
Uranus:  { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 }
Neptune: { Spirit: 0, Essence: 1, Matter: 0, Substance: 1 }
Pluto:   { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 }
```

**Thermodynamic Formulas:**
```typescript
Heat = (Spirit² + Fire²) / (Substance + Essence + Matter + Water + Air + Earth)²
Entropy = (Spirit² + Substance² + Fire² + Air²) / (Essence + Matter + Earth + Water)²
Reactivity = (Spirit² + Substance² + Essence² + Fire² + Air² + Water²) / (Matter + Earth)²
GregsEnergy = Heat - (Entropy × Reactivity)
Kalchm = (Spirit^Spirit × Essence^Essence) / (Matter^Matter × Substance^Substance)
Monica = -GregsEnergy / (Reactivity × ln(Kalchm)) if Kalchm > 0, else 1.0
```

### **Common Parsing Error Patterns**

**Pattern 1: Semicolon in Arrow Function Filter**
```typescript
// ❌ WRONG
const errors = messages.filter(msg => msg.ruleId === 'error';)

// ✅ CORRECT
const errors = messages.filter(msg => msg.ruleId === 'error')
```

**Pattern 2: Comma Instead of Semicolon in Class Properties**
```typescript
// ❌ WRONG
class MyClass {
  private config: Config,
  private state: State = null;
}

// ✅ CORRECT
class MyClass {
  private config: Config;
  private state: State = null;
}
```

**Pattern 3: Apostrophe Escaping**
```typescript
// ❌ WRONG
'The region's cuisine'

// ✅ CORRECT
'The region\'s cuisine'
// OR
"The region's cuisine"
```

**Pattern 4: Comma After Statements**
```typescript
// ❌ WRONG
const result = fetchData(),
logger.debug('Done'),

// ✅ CORRECT
const result = fetchData();
logger.debug('Done');
```

**Detection Commands:**
```bash
# Find semicolon in filter functions
grep -r "=> msg.ruleId.*;" src/

# Find comma-terminated class properties
grep -n "private.*:.*," src/

# Check brace balance
grep -o "{" file.ts | wc -l
grep -o "}" file.ts | wc -l
```

### **Type Safety Rules**
- Never use `as any` - use proper type assertions
- Remove `as any` with proper typing (e.g., remove unnecessary casts)
- Prefix unused variables with underscore: `_unusedVar`
- Use `@/` path aliases for imports
- Interface-first development

### **Elemental Logic Principles**
1. **No Opposing Elements**: Fire doesn't oppose Water
2. **Elements Reinforce Themselves**: Like strengthens like
3. **All Combinations Work**: Good compatibility (0.7+)
4. **No "Balancing"**: Don't balance elements against each other

## File Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # UI components
├── calculations/        # Alchemical & astrological calculations
├── constants/           # Alchemical pillars, elements, zodiac
├── data/               # Ingredient databases, planetary data
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── services/           # API services
└── contexts/           # React context providers
```

**Key Files:**
- `src/types/celestial.ts` - Core types (Planet, Element, AlchemicalProperty, ZodiacSign)
- `src/constants/alchemicalPillars.ts` - 14 alchemical cooking transformations
- `src/utils/planetaryAlchemyMapping.ts` - ESMS calculation authority

## Troubleshooting

### **Parsing Errors**
```bash
# Count parsing errors
yarn lint 2>&1 | grep "Parsing error" | wc -l

# List files with parsing errors
yarn lint 2>&1 | grep -B 1 "Parsing error" | grep "^/"

# Get specific parsing errors
yarn lint src/path/to/file.ts --format json | jq
```

### **Build Issues**
```bash
make build-health        # Check system status
make check               # TypeScript errors
yarn install            # Refresh dependencies
```

## Memory Notes for AI Assistants

### **Critical Principles**
- **NEVER use lazy fixes or placeholder functionality**
- **Always use existing codebase functionality**
- **Follow proven casing conventions**
- **No opposing elements concept**
- **Use systematic approaches** for error campaigns

### **Current Campaign Context**
- **Active**: Systematic Parsing Error Elimination
- **Approach**: File-by-file manual fixes with pattern recognition
- **Progress Tracking**: Use TodoWrite for multi-file campaigns
- **Common Patterns**: Semicolon-in-filter, comma-in-class-properties, apostrophe escaping

### **Historic Achievements**
- Multiple complete TypeScript error category eliminations
- 9,991 lines removed in external service cleanup
- Sub-30 second linting achieved
- 100% build stability maintained

## Quick Reference

```bash
# Start development
make install && make dev

# Check errors
make lint              # ESLint
make check            # TypeScript
make errors           # Detailed analysis

# Fix common issues
yarn lint --fix       # Auto-fix ESLint
rm -rf node_modules && yarn install  # Refresh deps
```

---

*Updated October 13, 2025 - Reflects current parsing error elimination campaign and streamlined for active development.*
