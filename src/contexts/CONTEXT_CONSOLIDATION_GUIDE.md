# Context Directory Consolidation Guide

## Overview

The context directory has been successfully consolidated to eliminate
redundancy, enhance functionality, and implement proper elemental
self-reinforcement principles. This guide provides comprehensive migration
instructions and best practices.

## Consolidation Summary

### ✅ Consolidated Contexts

| Legacy Context            | Status         | Consolidated Into            |
| ------------------------- | -------------- | ---------------------------- |
| `AstrologicalContext.tsx` | **Deprecated** | Enhanced `AlchemicalContext` |
| `CurrentChartContext.tsx` | **Deprecated** | Enhanced `AlchemicalContext` |
| `ChartContext.tsx`        | **Deprecated** | Enhanced `AlchemicalContext` |

### ✅ Maintained Contexts

| Context             | Status         | Purpose                                                   |
| ------------------- | -------------- | --------------------------------------------------------- |
| `AlchemicalContext` | **Enhanced**   | Unified astrological, alchemical, and chart functionality |
| `PopupContext`      | **Maintained** | Specialized UI popup management                           |
| `ThemeContext`      | **Maintained** | Specialized theme management                              |

## Enhanced Features

### 🔥 Elemental Self-Reinforcement Implementation

```typescript
// Enhanced elemental compatibility
const ELEMENT_COMPATIBILITY = {
  fire: { fire: 0.9, water: 0.7, earth: 0.7, Air: 0.7 },
  water: { fire: 0.7, water: 0.9, earth: 0.7, Air: 0.7 },
  earth: { fire: 0.7, water: 0.7, earth: 0.9, Air: 0.7 },
  Air: { fire: 0.7, water: 0.7, earth: 0.7, Air: 0.9 },
};

// Same elements have highest compatibility (0.9)
// All element combinations have good compatibility (0.7+)
// No "opposing" element logic
```

### ⚡ Performance Optimizations

- **Memoized Context Values**: Prevents unnecessary re-renders
- **Selective State Updates**: Only updates changed values
- **Efficient Planetary Position Caching**: Reduces calculation overhead
- **Optimized Chart SVG Generation**: Enhanced visual performance

### 🎯 Enhanced Functionality

- **Unified State Management**: Single source of truth for all astrological data
- **Comprehensive Chakra Energy Calculations**: Following alchemical energy
  state rules
- **Enhanced Chart Generation**: SVG charts with elemental visualization
- **Zodiac Energy Calculations**: Integrated with planetary positions
- **Improved Error Handling**: Graceful fallbacks and detailed logging

## Migration Guide

### Phase 1: Immediate Compatibility (Zero Breaking Changes)

Replace legacy imports with backward-compatible aliases:

```typescript
// ❌ Before (Legacy)
import { AstrologicalProvider, useAstrologicalState } from '@/context/AstrologicalContext';
import { CurrentChartProvider, useCurrentChart } from '@/context/CurrentChartContext';

// ✅ After (Immediate Compatibility)
import { AstrologicalProvider, useAstrologicalState } from '@/contexts';
import { CurrentChartProvider, useCurrentChart } from '@/contexts';

// Component usage remains exactly the same
const MyComponent = () => {
  const { chakraEnergies, planetaryPositions, currentZodiac } = useAstrologicalState();
  const { chart, loading, refreshChart } = useCurrentChart();

  // Existing code works without changes
  return <div>{/* existing JSX */}</div>;
};
```

### Phase 2: Provider Consolidation (Recommended)

Remove redundant provider wrapping:

```typescript
// ❌ Before (Multiple Providers)
<AstrologicalProvider>
  <CurrentChartProvider>
    <MyApp />
  </CurrentChartProvider>
</AstrologicalProvider>

// ✅ After (Single Provider)
<AlchemicalProvider>
  <MyApp />
</AlchemicalProvider>
```

### Phase 3: Enhanced Hook Migration (Optional)

Leverage enhanced functionality:

```typescript
// ✅ Enhanced Usage
import { useAlchemical, useEnhancedChart, useEnhancedAstrological } from '@/contexts';

const EnhancedComponent = () => {
  // Unified context access
  const {
    state,
    planetaryPositions,
    astrologicalState,
    chartData
  } = useAlchemical();

  // Enhanced chart functionality
  const {
    getElementalCompatibility,
    getDominantElement
  } = useEnhancedChart();

  // Enhanced astrological functionality
  const {
    getZodiacCompatibility,
    getChakraElementAlignment
  } = useEnhancedAstrological();

  // Use enhanced features
  const compatibility = getElementalCompatibility('fire', 'water'); // 0.7
  const sameElementCompatibility = getElementalCompatibility('fire', 'fire'); // 0.9

  return (
    <div>
      <p>fire-water Compatibility: {compatibility}</p>
      <p>fire-fire Compatibility: {sameElementCompatibility}</p>
    </div>
  );
};
```

## API Reference

### Core Hooks

#### `useAlchemical()`

Unified access to all alchemical functionality:

```typescript
const {
  state, // Enhanced alchemical state
  planetaryPositions, // Current planetary positions
  isDaytime, // Day/night status
  astrologicalState: {
    // Astrological functionality
    chakraEnergies,
    zodiacEnergies,
    currentZodiac,
    isLoading,
    error,
    refreshData,
  },
  chartData: {
    // Chart functionality
    chart,
    loading,
    error,
    refreshChart,
    createChartSvg,
  },
} = useAlchemical();
```

#### `useEnhancedChart()`

Advanced chart utilities with elemental principles:

```typescript
const {
  chart, // Current chart data
  loading, // Loading state
  error, // Error state
  refreshChart, // Refresh function
  createChartSvg, // SVG generation
  getElementalCompatibility, // Element compatibility calculator
  getDominantElement, // Dominant element analyzer
  elementalBalance, // Current elemental balance
} = useEnhancedChart();
```

#### `useEnhancedAstrological()`

Enhanced astrological utilities:

```typescript
const {
  chakraEnergies, // Chakra energy data
  zodiacEnergies, // Zodiac energy data
  currentZodiac, // Current zodiac sign
  getZodiacCompatibility, // Zodiac compatibility calculator
  getChakraElementAlignment, // Chakra-element mapping
  planetaryPositions, // Planetary positions
  elementalState, // Current elemental state
  alchemicalValues, // Alchemical property values
} = useEnhancedAstrological();
```

### Backward Compatibility Hooks

#### `useAstrologicalState()` (Legacy Compatible)

```typescript
const {
  chakraEnergies, // ChakraEnergies | null
  planetaryPositions, // Record<string, unknown> | null
  zodiacEnergies, // Record<string, number> | null
  currentZodiac, // string | null
  isLoading, // boolean
  error, // string | null
  refreshData, // () => Promise<void>
} = useAstrologicalState();
```

#### `useCurrentChart()` (Legacy Compatible)

```typescript
const {
  chart, // CurrentChart
  loading, // boolean
  error, // string | null
  refreshChart, // () => Promise<void>
  createChartSvg, // () => ChartSvgResult
} = useCurrentChart();
```

## Elemental Self-Reinforcement Principles

### Core Principles

1. **No Opposing Elements**: Elements don't "cancel out" or "oppose" each other
2. **Self-Reinforcement**: Same elements work best together (0.9 compatibility)
3. **Universal Compatibility**: All element combinations work well (0.7+
   compatibility)
4. **Individual Value**: Each element contributes unique qualities

### Implementation Examples

```typescript
// ✅ Correct: Elements reinforce themselves
const getElementalHarmony = (element1: string, element2: string) => {
  if (element1 === element2) return 0.9; // Same element = highest harmony
  return 0.7; // Different elements = good harmony
};

// ❌ Incorrect: No opposing element logic
const getBadElementalHarmony = (element1: string, element2: string) => {
  if (element1 === "fire" && element2 === "water") return 0.1; // Wrong!
  // This violates elemental self-reinforcement principles
};
```

### Chakra-Element Alignment

```typescript
// Enhanced chakra-element mapping following alchemical energy states
const CHAKRA_ELEMENT_MAPPING = {
  crown: { fire: 0.6, Air: 0.4, water: 0.0, earth: 0.0 }, // spirit
  throat: { Air: 0.6, earth: 0.4, fire: 0.0, water: 0.0 }, // substance
  heart: { fire: 0.4, Air: 0.4, water: 0.1, earth: 0.1 }, // Transition
  solarPlexus: { fire: 0.5, water: 0.3, Air: 0.1, earth: 0.1 }, // essence
  sacral: { water: 0.5, fire: 0.3, Air: 0.1, earth: 0.1 }, // essence
  brow: { water: 0.4, Air: 0.3, fire: 0.2, earth: 0.1 }, // essence
  root: { water: 0.5, earth: 0.5, fire: 0.0, Air: 0.0 }, // matter
};
```

## Performance Best Practices

### 1. Use Memoized Context Values

The enhanced context automatically memoizes values to prevent unnecessary
re-renders:

```typescript
// ✅ Automatically optimized
const { state, chartData } = useAlchemical();
```

### 2. Selective Hook Usage

Use specific hooks for targeted functionality:

```typescript
// ✅ Use specific hooks when you only need chart functionality
const { chart, refreshChart } = useEnhancedChart();

// ❌ Avoid using full context when you only need specific data
const { chartData } = useAlchemical(); // Less efficient if you only need chart
```

### 3. Conditional Refreshing

Leverage the enhanced refresh mechanisms:

```typescript
const { refreshChart, refreshData } = useAlchemical();

// Refresh only when needed
useEffect(() => {
  if (someCondition) {
    refreshChart();
  }
}, [someCondition, refreshChart]);
```

## Error Handling

### Enhanced Error Boundaries

```typescript
const MyComponent = () => {
  const { astrologicalState, chartData } = useAlchemical();

  // Handle astrological errors
  if (astrologicalState.error) {
    return <div>Astrological Error: {astrologicalState.error}</div>;
  }

  // Handle chart errors
  if (chartData.error) {
    return <div>Chart Error: {chartData.error}</div>;
  }

  // Handle loading states
  if (astrologicalState.isLoading || chartData.loading) {
    return <div>Loading...</div>;
  }

  return <div>{/* Normal rendering */}</div>;
};
```

## Testing

### Mock Enhanced Context

```typescript
// Test utilities for enhanced context
const mockAlchemicalContext = {
  state: mockAlchemicalState,
  planetaryPositions: mockPositions,
  astrologicalState: {
    chakraEnergies: mockChakraEnergies,
    zodiacEnergies: mockZodiacEnergies,
    currentZodiac: "aries",
    isLoading: false,
    error: null,
    refreshData: jest.fn(),
  },
  chartData: {
    chart: mockChart,
    loading: false,
    error: null,
    refreshChart: jest.fn(),
    createChartSvg: jest.fn(),
  },
};
```

## Troubleshooting

### Common Migration Issues

1. **Import Errors**: Update import paths from `@/context/` to `@/contexts/`
2. **Provider Wrapping**: Remove redundant provider nesting
3. **Type Mismatches**: Use enhanced types from the consolidated context
4. **Missing Functionality**: Check if functionality moved to enhanced hooks

### Debug Logging

The enhanced context includes comprehensive logging:

```typescript
// Enable debug logging
localStorage.setItem("debug", "AlchemicalProvider");
```

## Success Criteria

✅ **Reduced Complexity**: 3 legacy contexts consolidated into 1 enhanced
context  
✅ **Enhanced Performance**: Memoized values and selective updates  
✅ **Maintained Functionality**: All existing features preserved and enhanced  
✅ **Improved Developer Experience**: Cleaner APIs and comprehensive
documentation  
✅ **Elemental Compliance**: Proper self-reinforcement implementation
throughout  
✅ **Backward Compatibility**: Existing components continue working without
changes  
✅ **Future-Ready**: Scalable architecture for continued development

## Next Steps

1. **Immediate**: Update import paths to use consolidated context
2. **Short-term**: Remove redundant provider wrapping
3. **Medium-term**: Migrate to enhanced hooks for new features
4. **Long-term**: Leverage advanced elemental self-reinforcement capabilities

For questions or issues, refer to the enhanced context implementation in
`src/contexts/AlchemicalContext/`.
