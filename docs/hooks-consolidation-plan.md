# Hooks Directory Consolidation Plan

## Executive Summary

This plan consolidates 5 problematic hook files into a well-organized, functional hook system that eliminates redundancy, restores complete functionality, and maximizes computational capabilities following elemental self-reinforcement principles.

## Current State Analysis

### Problematic Files
1. `useChakraInfluencedFood.ts` (418 lines) - Chakra-based food recommendations with complex alchemical calculations
2. `useClientEffect.ts` (3 lines) - Simple client-side effect utility
3. `useCurrentChart.ts` (326 lines) - Astrological chart data management
4. `useFoodRecommendations.ts` (129 lines) - Basic food recommendations (overlaps with useAlchemicalRecommendations)
5. `useIngredientMapping.ts` (134 lines) - Ingredient mapping service wrapper

### Core Issues
- **Recommendation Duplication**: Three separate recommendation hooks with overlapping functionality
- **Chart Data Fragmentation**: Chart functionality split across multiple hooks
- **Service Wrapper Redundancy**: Simple service wrappers that could be integrated
- **Inconsistent Patterns**: Different approaches to similar functionality
- **Import Complexity**: Complex dependencies between hooks

## Consolidation Strategy

### Phase 1: Recommendation Hooks Consolidation
**Target**: Merge `useFoodRecommendations.ts` and `useChakraInfluencedFood.ts` into enhanced `useAlchemicalRecommendations.ts`

**Actions**:
- Integrate chakra calculation logic into alchemical recommendations
- Add food recommendation patterns from useFoodRecommendations
- Create unified recommendation interface with multiple calculation modes
- Implement elemental self-reinforcement principles throughout
- Delete redundant recommendation hooks

### Phase 2: Chart and State Consolidation
**Target**: Enhance `useCurrentChart.ts` with astrological state management

**Actions**:
- Integrate chart visualization with state management
- Consolidate chart data processing
- Improve SVG generation with elemental principles
- Maintain compatibility with existing components

### Phase 3: Utility Integration
**Target**: Integrate `useClientEffect.ts` and `useIngredientMapping.ts` into appropriate hooks

**Actions**:
- Move client effect utility to a shared utilities file
- Integrate ingredient mapping into the main recommendation hook
- Remove standalone utility hooks

### Phase 4: Service Integration
**Target**: Reduce service wrapper complexity

**Actions**:
- Integrate service calls directly into consolidated hooks
- Remove unnecessary abstraction layers
- Improve error handling and loading states

## Implementation Details

### Enhanced Alchemical Recommendations (useAlchemicalRecommendations.ts)
```typescript
// Consolidated recommendation hook with multiple calculation modes
export interface RecommendationMode {
  type: 'alchemical' | 'chakra' | 'basic' | 'combined';
  options?: {
    chakraWeighting?: number;
    elementalFocus?: ElementalCharacter;
    includeThermodynamics?: boolean;
  };
}

export const useAlchemicalRecommendations = ({
  mode = { type: 'combined' },
  ingredients,
  cookingMethods,
  cuisines,
  // ... other props
}: UseAlchemicalRecommendationsProps): AlchemicalRecommendationResults => {
  // Consolidated logic from all three recommendation hooks
  // Implements elemental self-reinforcement principles
  // Includes chakra calculations when mode includes chakra
  // Provides unified interface for all recommendation types
};
```

### Enhanced Chart Hook (useCurrentChart.ts)
```typescript
// Enhanced chart hook with integrated state management
export const useCurrentChart = (options?: {
  includeVisualization?: boolean;
  chartSize?: number;
  elementalColoring?: boolean;
}) => {
  // Consolidated chart data management
  // Enhanced SVG generation following elemental principles
  // Integrated astrological state tracking
  // Improved error handling and loading states
};
```

### Integrated Utilities
```typescript
// Move useClientEffect to utils/clientEffect.ts
export const useClientEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// Integrate ingredient mapping into recommendation hooks
// Remove standalone useIngredientMapping hook
```

## Elemental Self-Reinforcement Implementation

### 1. Chakra-Element Alignment
Following alchemical energy state principles:

```typescript
// Crown (spirit): (+) Heat, (+) Entropy, (+) Reactivity - Fire and Air (NOT water)
// Throat (substance): (-) Heat, (+) Entropy, (+) Reactivity - Air and earth (NOT Fire)
// Brow/Solar Plexus/Sacral (essence): (-) Heat, (-) Entropy, (+) Reactivity - Fire and water region
// Root (matter): (-) Heat, (-) Entropy, (-) Reactivity - water and earth (NOT Fire)

const chakraElementMapping = {
  crown: { Fire: 0.6, Air: 0.4, water: 0.0, earth: 0.0 },
  throat: { Air: 0.6, earth: 0.4, Fire: 0.0, water: 0.0 },
  heart: { Fire: 0.4, Air: 0.4, water: 0.1, earth: 0.1 },
  solarPlexus: { Fire: 0.5, water: 0.3, Air: 0.1, earth: 0.1 },
  sacral: { water: 0.5, Fire: 0.3, Air: 0.1, earth: 0.1 },
  brow: { water: 0.4, Air: 0.3, Fire: 0.2, earth: 0.1 },
  root: { water: 0.5, earth: 0.5, Fire: 0.0, Air: 0.0 }
};
```

### 2. Element Compatibility Matrix
```typescript
// Same elements have highest compatibility (0.9)
// All different element combinations have good compatibility (0.7)
const elementCompatibility = {
  Fire: { Fire: 0.9, water: 0.7, earth: 0.7, Air: 0.7 },
  water: { Fire: 0.7, water: 0.9, earth: 0.7, Air: 0.7 },
  earth: { Fire: 0.7, water: 0.7, earth: 0.9, Air: 0.7 },
  Air: { Fire: 0.7, water: 0.7, earth: 0.7, Air: 0.9 }
};
```

### 3. Thermodynamic Scoring
```typescript
// Apply alchemical energy state rules to ingredient scoring
const calculateThermodynamicScore = (properties: ThermodynamicProperties, targetChakra: string) => {
  const { heat, entropy, reactivity } = properties;
  
  switch (targetChakra) {
    case 'crown':
      return (heat > 0.6 && entropy > 0.6 && reactivity > 0.6) ? 0.9 : 0.5;
    case 'throat':
      return (heat < 0.4 && entropy > 0.6 && reactivity > 0.6) ? 0.9 : 0.5;
    case 'essence': // brow, solarPlexus, sacral
      return (heat < 0.4 && entropy < 0.4 && reactivity > 0.6) ? 0.9 : 0.5;
    case 'root':
      return (heat < 0.4 && entropy < 0.4 && reactivity < 0.4) ? 0.9 : 0.5;
    default:
      return 0.5;
  }
};
```

## Migration Script Requirements

### Script Features
- **ES Modules**: Use modern ES module syntax
- **Dry Run Mode**: Test changes before applying
- **Comprehensive Logging**: Track all changes made
- **Error Handling**: Graceful failure recovery
- **Import Updates**: Automatically update all import statements
- **Component Compatibility**: Ensure existing components continue working

### Script Structure
```typescript
// hooks-consolidation-script.mjs
export class HooksConsolidator {
  constructor(options = {}) {
    this.dryRun = options.dryRun !== false; // Default to dry run
    this.verbose = options.verbose || false;
  }

  async consolidateRecommendationHooks() {
    // Merge useFoodRecommendations and useChakraInfluencedFood into useAlchemicalRecommendations
  }

  async enhanceChartHook() {
    // Enhance useCurrentChart with additional functionality
  }

  async integrateUtilities() {
    // Move useClientEffect to utils, integrate useIngredientMapping
  }

  async updateImports() {
    // Update all import statements across codebase
  }

  async run() {
    // Execute full consolidation
  }
}
```

## Expected Outcomes

### File Reduction
- **Before**: 8 hook files (including useAstrologicalState.ts)
- **After**: 4 well-organized hook files
- **Eliminated**: 4 redundant/utility files

### Improved Organization
- **Recommendations**: Single comprehensive recommendation hook with multiple modes
- **Chart Management**: Enhanced chart hook with integrated state management
- **Utilities**: Moved to appropriate shared locations
- **State Management**: Consolidated astrological state handling

### Enhanced Functionality
- **Unified Recommendation API**: Single hook for all recommendation types
- **Elemental Self-Reinforcement**: Proper elemental logic throughout
- **Improved Performance**: Reduced hook complexity and re-renders
- **Better Error Handling**: Comprehensive error states and recovery

### Maintainability Improvements
- **Clear Separation**: Logical grouping of related functionality
- **Reduced Complexity**: Simplified hook dependencies
- **Better Testing**: Easier to test consolidated functionality
- **Consistent Patterns**: Unified approach to similar operations

## Component Impact Analysis

### Components Using Recommendation Hooks
- `FoodRecommender` components
- `IngredientRecommender` components
- `CelestialDisplay` components
- `ElementalDisplay` components

### Required Updates
- Update import statements to use consolidated hooks
- Adjust prop interfaces where needed
- Ensure backward compatibility for existing functionality
- Update component tests

## Validation Checklist

### Pre-Consolidation
- [ ] Backup current hooks directory
- [ ] Document current component dependencies
- [ ] Verify build status (`yarn build`)
- [ ] Run component tests

### Post-Consolidation
- [ ] Verify `yarn build` completes successfully
- [ ] Confirm all components still function correctly
- [ ] Test recommendation functionality across all modes
- [ ] Validate chart visualization works properly
- [ ] Run comprehensive test suite

## Risk Mitigation

### Backup Strategy
- Create full backup of hooks directory before changes
- Maintain git history for easy rollback
- Test changes in isolated environment first

### Incremental Approach
- Consolidate one hook pAir at a time
- Verify component functionality after each consolidation
- Update imports incrementally

### Testing Strategy
- Run dry-run mode first for all changes
- Test each consolidated hook independently
- Verify component integration after consolidation

## Timeline

### Phase 1: Recommendation Consolidation (Day 1)
- Merge recommendation hooks
- Update core recommendation logic
- Test recommendation functionality

### Phase 2: Chart Enhancement (Day 1)
- Enhance chart hook
- Integrate state management
- Test chart visualization

### Phase 3: Utility Integration (Day 1)
- Move utility hooks
- Update import statements
- Clean up dependencies

### Phase 4: Testing & Validation (Day 1)
- Comprehensive testing
- Component integration verification
- Documentation updates

This consolidation plan will transform the fragmented hooks system into a well-organized, fully functional foundation that supports the application's computational capabilities while following elemental self-reinforcement principles throughout the recommendation and chart management systems. 