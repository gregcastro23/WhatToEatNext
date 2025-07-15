# Elemental Principles Guide

## Core Philosophy

Our alchemical system is built on the principle that each element (Fire, Water, Earth, Air) is valuable in its own right. This document outlines our approach to elemental logic and provides implementation guidelines.

## Key Principles

### 1. All Elements Are Valuable

- ❌ **INCORRECT**: Treating some elements as "better" than others
- ✅ **CORRECT**: Each element contributes unique and valuable qualities

### 2. No Opposing Elements

- ❌ **INCORRECT**: Treating Fire as opposing Water, or Earth as opposing Air
- ✅ **CORRECT**: Elements don't "cancel out" or "oppose" each other

### 3. Self-Reinforcement

- ❌ **INCORRECT**: Seeking to "balance" elements with their "opposite"
- ✅ **CORRECT**: Elements work best with themselves - like reinforces like

### 4. Universal Compatibility

- ❌ **INCORRECT**: Assigning low compatibility scores to certain element pairs
- ✅ **CORRECT**: All element combinations have good compatibility (0.7+)
- ✅ **CORRECT**: Same-element combinations have highest affinity (0.9+)

## Implementation Guidelines

### Compatibility Calculations

```typescript
// Element compatibility function
function getElementalCompatibility(element1: Element, element2: Element): number {
  // Same element has highest compatibility
  if (element1 === element2) {
    return 0.9; // Same element has highest compatibility
  }
  
  // All different element combinations have good compatibility
  return 0.7; // Different elements have good compatibility
}
```

### Self-Reinforcement

```typescript
// Each element reinforces itself
function getComplementaryElement(element: Element): Element {
  return element; // Each element complements itself
}
```

### Coding Practices to Avoid

1. Variables or objects named `opposites`
2. Functions named `getOpposingElement` or similar
3. Conditional logic that assigns low scores to certain element combinations
4. References to "balancing" Fire with Water or Earth with Air
5. Testing for "opposing" elements

## Why This Matters

By treating all elements as individually valuable, our system creates more consistent and holistic recommendations that better reflect the nuanced nature of culinary alchemy. This approach also aligns with our testing framework and ensures consistent behavior across the application. 