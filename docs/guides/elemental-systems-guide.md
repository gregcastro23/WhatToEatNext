# 🔥 Elemental Systems Implementation Guide

## Overview

This guide provides comprehensive instructions for working with the four-element system (Fire, Water, Earth, Air) in WhatToEatNext. It covers elemental calculations, compatibility logic, and the critical self-reinforcement principles that govern all elemental interactions.

## Core Elemental Principles

### 1. The Four Elements

```typescript
type ElementType = 'Fire' | 'Water' | 'Earth' | 'Air';

interface ElementalProperties {
  Fire: number;   // Energy, transformation, passion, spirit
  Water: number;  // Emotion, intuition, flow, essence
  Earth: number;  // Stability, grounding, matter, substance
  Air: number;    // Intellect, communication, movement, ideas
}
```

### 2. Self-Reinforcement Principle

**CRITICAL**: Elements work best with themselves. This is the fundamental principle that governs all elemental calculations.

```typescript
// ✅ CORRECT: Self-reinforcement compatibility matrix
const ELEMENTAL_COMPATIBILITY = {
  Fire: { Fire: 0.9, Water: 0.7, Earth: 0.7, Air: 0.8 },
  Water: { Water: 0.9, Fire: 0.7, Earth: 0.8, Air: 0.7 },
  Earth: { Earth: 0.9, Fire: 0.7, Water: 0.8, Air: 0.7 },
  Air: { Air: 0.9, Fire: 0.8, Water: 0.7, Earth: 0.7 }
};

// Key principles:
// - Same elements: 0.9 compatibility (highest harmony)
// - Different elements: 0.7-0.8 compatibility (good harmony)
// - No combinations below 0.7 (no opposing elements)
// - Fire-Air slightly higher (0.8) due to shared dynamic nature
// - Water-Earth slightly higher (0.8) due to shared nurturing nature
```

### 3. Forbidden Anti-Patterns

```typescript
// ❌ FORBIDDEN: Opposition logic
const opposingElements = {
  Fire: 'Water',  // WRONG - elements don't oppose each other
  Water: 'Fire',  // WRONG - elements don't oppose each other
  Earth: 'Air',   // WRONG - elements don't oppose each other
  Air: 'Earth'    // WRONG - elements don't oppose each other
};

// ❌ FORBIDDEN: Compatibility penalties
function calculateCompatibility(elem1: Element, elem2: Element): number {
  if (elem1 !== elem2) {
    return 0.3; // WRONG - never penalize different elements
  }
  return 0.9;
}

// ❌ FORBIDDEN: Balancing against elements
function balanceElements(properties: ElementalProperties): ElementalProperties {
  // WRONG - don't try to balance elements against each other
  if (properties.Fire > 0.5) {
    properties.Water += 0.3; // This violates self-reinforcement
  }
  return properties;
}
```

## Elemental Calculation Functions

### 1. Base Elemental Properties Calculation

```typescript
// src/calculations/core/elementalCalculations.ts
export function calculateBaseElementalProperties(
  planetaryPositions: { [key: string]: PlanetaryPosition }
): ElementalProperties {
  const elements: ElementalProperties = { Fire: 0, Water: 0, Air: 0, Earth: 0 };

  // Process each planet's contribution
  Object.entries(planetaryPositions || {}).forEach(([planet, position]) => {
    if (!position.sign) return;

    const element = ZODIAC_ELEMENTS[position.sign?.toLowerCase() as ZodiacSign];
    if (!element) return;

    // Weight by planet importance
    let weight = 1.0;
    const planetLower = planet?.toLowerCase();
    
    if (planetLower === 'sun' || planetLower === 'moon') {
      weight = 2.5;
    } else if (['mercury', 'venus', 'mars'].includes(planetLower)) {
      weight = 1.5;
    } else if (['jupiter', 'saturn'].includes(planetLower)) {
      weight = 1.2;
    }

    // Apply dignity modifiers
    const dignityModifier = getDignityModifier(planet, position.sign);
    weight *= dignityModifier;

    elements[element] += weight;
  });

  // Normalize to sum to 1.0
  return normalizeElementalProperties(elements);
}
```

### 2. Elemental Compatibility Calculation

```typescript
export function calculateElementalCompatibility(
  properties1: ElementalProperties,
  properties2: ElementalProperties
): number {
  let compatibility = 0;
  let totalWeight = 0;

  // Calculate weighted compatibility for each element
  Object.keys(properties1 || {}).forEach(element => {
    const key = element as keyof ElementalProperties;
    const value1 = properties1[key];
    const value2 = properties2[key];
    const weight = (value1 + value2) / 2;

    // Self-reinforcement: same elements have highest compatibility
    const elementCompatibility = key === getDominantElement(properties2) ? 0.9 : 0.7;
    
    compatibility += elementCompatibility * weight;
    totalWeight += weight;
  });

  // Ensure minimum compatibility of 0.7
  return Math.max(0.7, totalWeight > 0 ? compatibility / totalWeight : 0.7);
}
```

### 3. Dominant Element Detection

```typescript
export function getDominantElement(properties: ElementalProperties): keyof ElementalProperties {
  return Object.entries(properties)
    .reduce((a, b) => properties[a[0] as keyof ElementalProperties] > properties[b[0] as keyof ElementalProperties] ? a : b)[0] as keyof ElementalProperties;
}
```

### 4. Elemental Balance Calculation

```typescript
export function calculateElementalBalance(properties: ElementalProperties): number {
  const values = Object.values(properties);
  const average = values.reduce((sum, val) => sum + val, 0) / values.length;
  
  return values.reduce((acc, val) => acc + Math.abs(val - average), 0) / values.length;
}
```

### 5. Property Normalization

```typescript
export function normalizeElementalProperties(properties: ElementalProperties): ElementalProperties {
  const total = Object.values(properties).reduce((sum, val) => sum + val, 0);
  
  if (total === 0) {
    return { Fire: 0.25, Water: 0.25, Air: 0.25, Earth: 0.25 };
  }

  return {
    Fire: properties.Fire / total,
    Water: properties.Water / total,
    Air: properties.Air / total,
    Earth: properties.Earth / total
  };
}
```

## Seasonal and Lunar Modifiers

### 1. Seasonal Elemental Modifiers

```typescript
export const SEASONAL_MODIFIERS: { [key: string]: ElementalProperties } = {
  spring: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
  summer: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
  autumn: { Fire: 0.2, Water: 0.2, Air: 0.3, Earth: 0.3 },
  fall: { Fire: 0.2, Water: 0.2, Air: 0.3, Earth: 0.3 }, // Alias for autumn
  winter: { Fire: 0.1, Water: 0.4, Air: 0.2, Earth: 0.3 }
};

export function applySeasonalAdjustments(
  baseProperties: ElementalProperties,
  season: string
): ElementalProperties {
  const seasonalMod = SEASONAL_MODIFIERS[season?.toLowerCase()] || SEASONAL_MODIFIERS.spring;
  
  return {
    Fire: baseProperties.Fire * (1 + seasonalMod.Fire * 0.2),
    Water: baseProperties.Water * (1 + seasonalMod.Water * 0.2),
    Air: baseProperties.Air * (1 + seasonalMod.Air * 0.2),
    Earth: baseProperties.Earth * (1 + seasonalMod.Earth * 0.2)
  };
}
```

### 2. Lunar Phase Elemental Modifiers

```typescript
export const LUNAR_PHASE_MODIFIERS: { [key: string]: ElementalProperties } = {
  'new moon': { Fire: 0.25, Water: 0.25, Air: 0.25, Earth: 0.25 },
  'waxing crescent': { Fire: 0.25, Water: 0.25, Air: 0.25, Earth: 0.25 },
  'first quarter': { Fire: 0.25, Water: 0.25, Air: 0.25, Earth: 0.25 },
  'waxing gibbous': { Fire: 0.25, Water: 0.25, Air: 0.25, Earth: 0.25 },
  'full moon': { Fire: 0.25, Water: 0.25, Air: 0.25, Earth: 0.25 },
  'waning gibbous': { Fire: 0.25, Water: 0.25, Air: 0.25, Earth: 0.25 },
  'last quarter': { Fire: 0.25, Water: 0.25, Air: 0.25, Earth: 0.25 },
  'waning crescent': { Fire: 0.1, Water: 0.4, Air: 0.2, Earth: 0.3 }
};

export function applyLunarPhaseAdjustments(
  baseProperties: ElementalProperties,
  lunarPhase: string
): ElementalProperties {
  const lunarMod = LUNAR_PHASE_MODIFIERS[lunarPhase?.toLowerCase()] || LUNAR_PHASE_MODIFIERS['full moon'];
  
  return {
    Fire: baseProperties.Fire * (1 + lunarMod.Fire * 0.15),
    Water: baseProperties.Water * (1 + lunarMod.Water * 0.15),
    Air: baseProperties.Air * (1 + lunarMod.Air * 0.15),
    Earth: baseProperties.Earth * (1 + lunarMod.Earth * 0.15)
  };
}
```

## Advanced Elemental Intelligence Systems

### 1. Elemental Analysis Intelligence

```typescript
export const ELEMENTAL_ANALYSIS_INTELLIGENCE = {
  performElementalAnalysis: (
    planetaryPositions: { [key: string]: PlanetaryPosition },
    context: string = 'general',
    preferences: Record<string, any> = {}
  ) => {
    // Calculate base elemental properties
    const baseProperties = calculateBaseElementalProperties(planetaryPositions);
    
    // Context-specific elemental adjustments
    const contextElementalMultipliers = {
      ingredient: { Fire: 1.1, Water: 1.05, Earth: 1.0, Air: 1.1 },
      recipe: { Fire: 1.15, Water: 1.1, Earth: 1.05, Air: 1.15 },
      cuisine: { Fire: 1.2, Water: 1.15, Earth: 1.1, Air: 1.2 },
      cooking: { Fire: 1.05, Water: 1.0, Earth: 1.0, Air: 1.05 }
    };
    
    const elementalMultipliers = contextElementalMultipliers[context as keyof typeof contextElementalMultipliers] || contextElementalMultipliers.ingredient;
    const preferenceMultiplier = preferences.intensity || 1.0;
    
    // Apply context-specific adjustments
    const adjustedProperties = {
      Fire: Math.min(1.0, baseProperties.Fire * elementalMultipliers.Fire * preferenceMultiplier),
      Water: Math.min(1.0, baseProperties.Water * elementalMultipliers.Water * preferenceMultiplier),
      Earth: Math.min(1.0, baseProperties.Earth * elementalMultipliers.Earth * preferenceMultiplier),
      Air: Math.min(1.0, baseProperties.Air * elementalMultipliers.Air * preferenceMultiplier)
    };
    
    // Normalize adjusted properties
    const normalizedProperties = normalizeElementalProperties(adjustedProperties);
    
    // Calculate elemental balance and harmony
    const balance = calculateElementalBalance(normalizedProperties);
    const dominantElement = getDominantElement(normalizedProperties);
    const harmony = calculateElementalHarmony(normalizedProperties);
    
    return {
      context,
      preferences,
      baseProperties,
      adjustedProperties: normalizedProperties,
      analysis: {
        balance,
        dominantElement,
        harmony,
        stability: calculateElementalStability(normalizedProperties),
        efficiency: calculateElementalEfficiency(normalizedProperties, balance)
      }
    };
  },

  calculateElementalHarmony: (properties: ElementalProperties): number => {
    const values = Object.values(properties);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length;
    return 1 / (1 + variance);
  }
};
```

### 2. Seasonal Elemental Intelligence

```typescript
export const SEASONAL_ELEMENTAL_INTELLIGENCE = {
  analyzeSeasonalElementalProperties: (season: string, context: string, preferences: Record<string, any> = {}) => {
    const baseSeasonalModifiers = SEASONAL_MODIFIERS;
    const normalizedSeason = season.toLowerCase();
    const baseModifier = baseSeasonalModifiers[normalizedSeason as keyof typeof baseSeasonalModifiers] || baseSeasonalModifiers.spring;
    
    // Context-specific seasonal adjustments
    const contextSeasonalMultipliers = {
      food: { enhancementFactor: 1.2, categoryBoost: 0.15 },
      cooking: { enhancementFactor: 1.1, categoryBoost: 0.1 },
      recipe: { enhancementFactor: 1.15, categoryBoost: 0.12 },
      nutrition: { enhancementFactor: 1.25, categoryBoost: 0.2 }
    };
    
    const contextMod = contextSeasonalMultipliers[context as keyof typeof contextSeasonalMultipliers] || contextSeasonalMultipliers.food;
    
    // Enhanced seasonal modifiers with contextual adjustments
    const enhancedSeasonalModifier = {
      Fire: baseModifier.Fire * contextMod.enhancementFactor,
      Water: baseModifier.Water * contextMod.enhancementFactor,
      Earth: baseModifier.Earth * contextMod.enhancementFactor,
      Air: baseModifier.Air * contextMod.enhancementFactor
    };
    
    // Normalize enhanced modifiers
    const totalElemental = Object.values(enhancedSeasonalModifier).reduce((sum, val) => sum + val, 0);
    const normalizedSeasonalModifier = Object.entries(enhancedSeasonalModifier).reduce((acc, [element, value]) => {
      acc[element as keyof typeof enhancedSeasonalModifier] = value / totalElemental;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      season: normalizedSeason,
      context,
      baseModifier,
      enhancedModifier: normalizedSeasonalModifier,
      analysis: {
        dominantElement: Object.entries(normalizedSeasonalModifier).reduce((a, b) => a[1] > b[1] ? a : b)[0],
        seasonalStrength: Math.max(...Object.values(normalizedSeasonalModifier))
      }
    };
  }
};
```

## Testing Elemental Systems

### 1. Basic Elemental Tests

```typescript
describe('Elemental Calculations', () => {
  test('should normalize elemental properties correctly', () => {
    const unbalanced = { Fire: 2, Water: 1, Earth: 1, Air: 0 };
    const normalized = normalizeElementalProperties(unbalanced);
    
    const sum = Object.values(normalized).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 3);
    expect(normalized.Fire).toBeGreaterThan(normalized.Water);
  });

  test('should respect elemental logic principles', () => {
    // Test that elements don't oppose each other
    const compatibility = calculateElementalCompatibility(
      { Fire: 0.8, Water: 0.1, Earth: 0.1, Air: 0.0 },
      { Fire: 0.1, Water: 0.8, Earth: 0.1, Air: 0.0 }
    );
    expect(compatibility).toBeGreaterThan(0.6); // Should be harmonious

    // Test that same elements have highest compatibility
    const sameElement = calculateElementalCompatibility(
      { Fire: 0.8, Water: 0.1, Earth: 0.1, Air: 0.0 },
      { Fire: 0.7, Water: 0.2, Earth: 0.1, Air: 0.0 }
    );
    const differentElement = calculateElementalCompatibility(
      { Fire: 0.8, Water: 0.1, Earth: 0.1, Air: 0.0 },
      { Fire: 0.1, Water: 0.1, Earth: 0.8, Air: 0.0 }
    );
    expect(sameElement).toBeGreaterThan(differentElement);
  });
});
```

### 2. Self-Reinforcement Tests

```typescript
describe('Elemental Self-Reinforcement', () => {
  test('same elements have highest compatibility', () => {
    const fireProps = { Fire: 0.8, Water: 0.1, Earth: 0.1, Air: 0.0 };
    const otherFireProps = { Fire: 0.7, Water: 0.2, Earth: 0.1, Air: 0.0 };
    
    const compatibility = calculateElementalCompatibility(fireProps, otherFireProps);
    expect(compatibility).toBeGreaterThanOrEqual(0.9);
  });
  
  test('different elements have good compatibility', () => {
    const fireProps = { Fire: 0.8, Water: 0.1, Earth: 0.1, Air: 0.0 };
    const waterProps = { Fire: 0.1, Water: 0.8, Earth: 0.1, Air: 0.0 };
    
    const compatibility = calculateElementalCompatibility(fireProps, waterProps);
    expect(compatibility).toBeGreaterThanOrEqual(0.7);
    expect(compatibility).toBeLessThan(0.9);
  });
  
  test('no compatibility scores below 0.7', () => {
    const testCombinations = [
      [{ Fire: 1, Water: 0, Earth: 0, Air: 0 }, { Fire: 0, Water: 1, Earth: 0, Air: 0 }],
      [{ Fire: 0, Water: 1, Earth: 0, Air: 0 }, { Fire: 0, Water: 0, Earth: 1, Air: 0 }],
      [{ Fire: 0, Water: 0, Earth: 1, Air: 0 }, { Fire: 0, Water: 0, Earth: 0, Air: 1 }],
      [{ Fire: 0, Water: 0, Earth: 0, Air: 1 }, { Fire: 1, Water: 0, Earth: 0, Air: 0 }]
    ];
    
    testCombinations.forEach(([props1, props2]) => {
      const compatibility = calculateElementalCompatibility(props1, props2);
      expect(compatibility).toBeGreaterThanOrEqual(0.7);
    });
  });
});
```

### 3. Anti-Pattern Detection Tests

```typescript
describe('Anti-Pattern Detection', () => {
  test('detects opposition logic violations', () => {
    const codeSnippet = `
      if (element1 === 'Fire' && element2 === 'Water') {
        return 0.3; // Opposition logic detected
      }
    `;
    
    expect(() => validateCodeForOppositionLogic(codeSnippet))
      .toThrow('Opposition logic detected');
  });
  
  test('detects compatibility penalties', () => {
    const codeSnippet = `
      return baseScore * (isDifferentElement ? 0.5 : 1.0);
    `;
    
    expect(() => validateCodeForPenalties(codeSnippet))
      .toThrow('Compatibility penalty detected');
  });
});
```

## Elemental Enhancement Patterns

### 1. Ingredient Enhancement

```typescript
function enhanceIngredientElementally(
  ingredient: Ingredient,
  targetElement: ElementType
): Ingredient {
  const currentProperties = ingredient.elementalProperties;
  const dominantElement = getDominantElement(currentProperties);
  
  // Self-reinforcement: enhance if target matches dominant
  if (dominantElement === targetElement) {
    return {
      ...ingredient,
      elementalProperties: {
        ...currentProperties,
        [targetElement]: Math.min(1.0, currentProperties[targetElement] * 1.2)
      }
    };
  }
  
  // Gentle enhancement for different elements
  return {
    ...ingredient,
    elementalProperties: {
      ...currentProperties,
      [targetElement]: Math.min(1.0, currentProperties[targetElement] * 1.1)
    }
  };
}
```

### 2. Recipe Elemental Balancing

```typescript
function balanceRecipeElementally(recipe: Recipe): Recipe {
  const currentBalance = calculateElementalBalance(recipe.ingredients);
  const dominantElement = getDominantElement(currentBalance);
  
  // Self-reinforcement: enhance the dominant element
  const enhancedIngredients = recipe.ingredients.map(ingredient => {
    const ingDominant = getDominantElement(ingredient.elementalProperties);
    
    if (ingDominant === dominantElement) {
      // Boost ingredients that match the dominant element
      return {
        ...ingredient,
        quantity: ingredient.quantity * 1.1,
        elementalProperties: enhanceElementalProperties(ingredient.elementalProperties, dominantElement)
      };
    }
    
    return ingredient;
  });
  
  return { ...recipe, ingredients: enhancedIngredients };
}
```

## Code Review Guidelines

### Checklist for Elemental Code Reviews

**Required Checks:**
- [ ] No opposition logic (Fire vs Water, Earth vs Air)
- [ ] All compatibility scores ≥ 0.7
- [ ] Same-element combinations score ≥ 0.9
- [ ] Self-reinforcement principles applied
- [ ] No penalties for different element combinations
- [ ] Proper validation of elemental properties
- [ ] Consistent use of elemental utility functions

**Red Flags to Watch For:**
- Hardcoded opposition relationships
- Compatibility scores below 0.7
- Complex balancing that reduces elemental strength
- Negative modifiers for elemental combinations
- Missing validation of elemental properties
- Direct manipulation of elemental values without utilities

## Related Files

- `src/calculations/core/elementalCalculations.ts` - Core elemental calculations
- `src/utils/elemental/elementalUtils.ts` - Elemental utility functions
- `src/constants/elementalProperties.ts` - Elemental constants and mappings
- `src/__tests__/utils/elementalCompatibility.test.ts` - Elemental compatibility tests