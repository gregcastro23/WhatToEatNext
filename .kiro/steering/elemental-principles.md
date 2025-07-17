# Elemental Principles Enforcement

## Overview

This document establishes the core principles of the four-element system (Fire, Water, Earth, Air) that governs all ingredient compatibility, cooking method selection, and culinary recommendations within the WhatToEatNext system. These principles ensure consistency and harmony across all astrological calculations.

## Four-Element System Rules

### Core Elemental Philosophy

**Fundamental Principle: Self-Reinforcement**
- Elements work best with themselves
- Same-element combinations have the highest affinity (0.9+ compatibility)
- All elements are individually valuable and beneficial
- No opposing elements exist - all combinations have good compatibility (0.7+ minimum)

**Element Definitions:**
- **Fire**: Energy, spice, quick cooking, transformation, vitality
- **Water**: Cooling, fluid, steaming, nourishment, flow
- **Earth**: Grounding, root vegetables, slow cooking, stability, substance
- **Air**: Light, leafy greens, raw preparations, clarity, movement

### Compatibility Matrix

**Self-Reinforcement Compatibility Scores:**
```typescript
const ELEMENTAL_COMPATIBILITY = {
  Fire: { Fire: 0.9, Water: 0.7, Earth: 0.7, Air: 0.8 },
  Water: { Water: 0.9, Fire: 0.7, Earth: 0.8, Air: 0.7 },
  Earth: { Earth: 0.9, Fire: 0.7, Water: 0.8, Air: 0.7 },
  Air: { Air: 0.9, Fire: 0.8, Water: 0.7, Earth: 0.7 }
};
```

**Key Principles:**
- Same elements: 0.9 compatibility (highest harmony)
- Different elements: 0.7-0.8 compatibility (good harmony)
- No combinations below 0.7 (no opposing elements)
- Fire-Air slightly higher (0.8) due to shared dynamic nature
- Water-Earth slightly higher (0.8) due to shared nurturing nature

## Self-Reinforcement Principles

### Implementation Requirements

**Mandatory Self-Reinforcement Patterns:**
```typescript
// CORRECT: Self-reinforcement implementation
function calculateElementalCompatibility(
  source: ElementalProperties, 
  target: ElementalProperties
): number {
  const sourceDominant = getDominantElement(source);
  const targetDominant = getDominantElement(target);
  
  // Same elements have highest compatibility
  if (sourceDominant === targetDominant) {
    return Math.max(0.9, baseCompatibility);
  }
  
  // All different element combinations have good compatibility
  return Math.max(0.7, baseCompatibility);
}
```

**Prohibited Anti-Patterns:**
```typescript
// WRONG: Opposing element logic
if (element1 === 'Fire' && element2 === 'Water') {
  return 0.3; // Never use low compatibility scores
}

// WRONG: Complex opposition systems
const opposingElements = {
  Fire: 'Water',
  Water: 'Fire',
  Earth: 'Air',
  Air: 'Earth'
};

// WRONG: Negative compatibility
return Math.max(0, compatibility - oppositionPenalty);
```

### Coding Practices to Avoid

**Anti-Pattern 1: Opposition Logic**
```typescript
// NEVER implement opposing element logic
function calculateOpposition(element1: Element, element2: Element): number {
  // This violates our core principles
  const oppositions = { Fire: 'Water', Water: 'Fire' };
  return oppositions[element1] === element2 ? -0.5 : 0;
}
```

**Anti-Pattern 2: Complex Balancing**
```typescript
// AVOID complex balancing that reduces compatibility
function balanceElements(properties: ElementalProperties): ElementalProperties {
  // Don't try to "balance" by reducing strong elements
  const total = Object.values(properties).reduce((sum, val) => sum + val, 0);
  if (total > 1.0) {
    // WRONG: This reduces elemental strength
    return scaleElementalProperties(properties, 1.0 / total);
  }
}
```

**Anti-Pattern 3: Compatibility Penalties**
```typescript
// NEVER apply penalties for elemental combinations
function applyElementalPenalties(score: number, elem1: Element, elem2: Element): number {
  // This violates the "no opposing elements" principle
  if (isDifferentElement(elem1, elem2)) {
    return score * 0.5; // WRONG: Never penalize different elements
  }
  return score;
}
```

## Implementation Guidelines

### Correct Elemental Logic Patterns

**Pattern 1: Self-Reinforcement Calculation**
```typescript
function calculateSelfReinforcement(
  sourceElement: Element, 
  targetElement: Element
): number {
  // Same elements reinforce each other most strongly
  if (sourceElement === targetElement) {
    return 0.9; // Highest compatibility
  }
  
  // All different combinations are still good
  return getElementalCompatibility(sourceElement, targetElement);
}

function getElementalCompatibility(source: Element, target: Element): number {
  const compatibilityMatrix = {
    Fire: { Water: 0.7, Earth: 0.7, Air: 0.8 },
    Water: { Fire: 0.7, Earth: 0.8, Air: 0.7 },
    Earth: { Fire: 0.7, Water: 0.8, Air: 0.7 },
    Air: { Fire: 0.8, Water: 0.7, Earth: 0.7 }
  };
  
  return compatibilityMatrix[source][target] || 0.7;
}
```

**Pattern 2: Weighted Elemental Scoring**
```typescript
function calculateWeightedElementalScore(
  sourceProps: ElementalProperties,
  targetProps: ElementalProperties
): number {
  let weightedSum = 0;
  let totalWeight = 0;
  
  const elements: Element[] = ['Fire', 'Water', 'Earth', 'Air'];
  
  for (const element of elements) {
    const sourceStrength = sourceProps[element];
    const targetStrength = targetProps[element];
    
    if (sourceStrength > 0 && targetStrength > 0) {
      // Self-reinforcement: same elements have highest compatibility
      const compatibility = 0.9;
      const weight = Math.min(sourceStrength, targetStrength);
      
      weightedSum += compatibility * weight;
      totalWeight += weight;
    }
  }
  
  // Ensure minimum compatibility of 0.7
  return Math.max(0.7, totalWeight > 0 ? weightedSum / totalWeight : 0.7);
}
```

**Pattern 3: Dominant Element Enhancement**
```typescript
function enhanceDominantElement(properties: ElementalProperties): ElementalProperties {
  const dominant = getDominantElement(properties);
  const enhancedProperties = { ...properties };
  
  // Self-reinforcement: boost the dominant element
  enhancedProperties[dominant] = Math.min(1.0, properties[dominant] * 1.1);
  
  return enhancedProperties;
}
```

### Validation Functions

**Elemental Properties Validation:**
```typescript
function validateElementalProperties(properties: ElementalProperties): boolean {
  const elements: Element[] = ['Fire', 'Water', 'Earth', 'Air'];
  
  // Check all elements are present and non-negative
  for (const element of elements) {
    if (typeof properties[element] !== 'number' || properties[element] < 0) {
      return false;
    }
  }
  
  // Check total doesn't exceed reasonable bounds
  const total = Object.values(properties).reduce((sum, val) => sum + val, 0);
  if (total > 4.0) { // Allow for strong elemental presence
    return false;
  }
  
  return true;
}
```

**Compatibility Score Validation:**
```typescript
function validateCompatibilityScore(score: number): boolean {
  // All compatibility scores must be at least 0.7
  if (score < 0.7) {
    console.error(`Compatibility score ${score} violates minimum 0.7 principle`);
    return false;
  }
  
  // Scores should not exceed 1.0
  if (score > 1.0) {
    console.warn(`Compatibility score ${score} exceeds maximum 1.0`);
    return false;
  }
  
  return true;
}
```

## Examples of Correct Elemental Logic

### Example 1: Ingredient Compatibility

**Correct Implementation:**
```typescript
class IngredientCompatibilityCalculator {
  calculateCompatibility(
    ingredient1: Ingredient, 
    ingredient2: Ingredient
  ): number {
    const props1 = ingredient1.elementalProperties;
    const props2 = ingredient2.elementalProperties;
    
    // Use self-reinforcement principles
    const compatibility = calculateElementalCompatibility(props1, props2);
    
    // Ensure minimum compatibility
    return Math.max(0.7, compatibility);
  }
  
  private findElementalSynergies(
    ingredients: Ingredient[]
  ): Ingredient[] {
    return ingredients.filter(ingredient => {
      // Look for ingredients that reinforce each other
      const dominantElement = getDominantElement(ingredient.elementalProperties);
      
      // Self-reinforcement: prefer ingredients with similar elemental profiles
      return ingredients.some(other => 
        other !== ingredient && 
        getDominantElement(other.elementalProperties) === dominantElement
      );
    });
  }
}
```

### Example 2: Cooking Method Selection

**Correct Implementation:**
```typescript
class CookingMethodSelector {
  selectOptimalMethod(
    ingredients: Ingredient[], 
    desiredElement: Element
  ): CookingMethod {
    const methods = this.getAvailableMethods();
    
    return methods
      .map(method => ({
        method,
        score: this.calculateMethodScore(method, ingredients, desiredElement)
      }))
      .sort((a, b) => b.score - a.score)[0]?.method;
  }
  
  private calculateMethodScore(
    method: CookingMethod,
    ingredients: Ingredient[],
    desiredElement: Element
  ): number {
    const methodElement = method.primaryElement;
    
    // Self-reinforcement: methods matching desired element score highest
    let baseScore = methodElement === desiredElement ? 0.9 : 0.7;
    
    // Bonus for ingredients that harmonize with the method
    const ingredientHarmony = ingredients
      .map(ing => {
        const ingDominant = getDominantElement(ing.elementalProperties);
        return ingDominant === methodElement ? 0.9 : 0.7;
      })
      .reduce((sum, score) => sum + score, 0) / ingredients.length;
    
    return (baseScore + ingredientHarmony) / 2;
  }
}
```

### Example 3: Recipe Enhancement

**Correct Implementation:**
```typescript
class RecipeEnhancer {
  enhanceElementalBalance(recipe: Recipe): Recipe {
    const currentBalance = this.calculateElementalBalance(recipe);
    const dominantElement = getDominantElement(currentBalance);
    
    // Self-reinforcement: enhance the dominant element
    const enhancedIngredients = recipe.ingredients.map(ingredient => {
      const ingDominant = getDominantElement(ingredient.elementalProperties);
      
      if (ingDominant === dominantElement) {
        // Boost ingredients that match the dominant element
        return {
          ...ingredient,
          quantity: ingredient.quantity * 1.1,
          elementalProperties: enhanceDominantElement(ingredient.elementalProperties)
        };
      }
      
      return ingredient;
    });
    
    return { ...recipe, ingredients: enhancedIngredients };
  }
  
  private suggestComplementaryIngredients(
    recipe: Recipe
  ): Ingredient[] {
    const dominantElement = getDominantElement(
      this.calculateElementalBalance(recipe)
    );
    
    // Self-reinforcement: suggest ingredients that strengthen the dominant element
    return this.ingredientDatabase
      .filter(ingredient => {
        const ingDominant = getDominantElement(ingredient.elementalProperties);
        return ingDominant === dominantElement;
      })
      .sort((a, b) => {
        // Prefer ingredients with stronger elemental presence
        return b.elementalProperties[dominantElement] - a.elementalProperties[dominantElement];
      })
      .slice(0, 5);
  }
}
```

## Testing and Validation

### Unit Tests for Elemental Principles

**Self-Reinforcement Tests:**
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

**Anti-Pattern Detection Tests:**
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

### Integration Tests

**Recipe Compatibility Tests:**
```typescript
describe('Recipe Elemental Integration', () => {
  test('recipe recommendations follow self-reinforcement', async () => {
    const userPreference = { Fire: 0.8, Water: 0.1, Earth: 0.1, Air: 0.0 };
    const recommendations = await getRecipeRecommendations(userPreference);
    
    recommendations.forEach(recipe => {
      const recipeBalance = calculateElementalBalance(recipe);
      const compatibility = calculateElementalCompatibility(userPreference, recipeBalance);
      
      expect(compatibility).toBeGreaterThanOrEqual(0.7);
      
      // Fire-dominant user should get fire-enhanced recipes
      if (getDominantElement(userPreference) === 'Fire') {
        expect(recipeBalance.Fire).toBeGreaterThan(0.3);
      }
    });
  });
});
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

### Code Review Comments

**Approved Patterns:**
```typescript
// ✅ GOOD: Self-reinforcement implementation
const compatibility = sourceElement === targetElement ? 0.9 : 0.7;

// ✅ GOOD: Minimum compatibility enforcement
return Math.max(0.7, calculatedCompatibility);

// ✅ GOOD: Elemental enhancement
enhancedProperties[dominantElement] *= 1.1;
```

**Rejected Patterns:**
```typescript
// ❌ BAD: Opposition logic
if (isOpposingElement(elem1, elem2)) return 0.3;

// ❌ BAD: Compatibility penalty
score *= isDifferentElement ? 0.5 : 1.0;

// ❌ BAD: Complex balancing
return normalizeToSum(properties, 1.0);
```

## References and Integration Points

### Core Implementation Files
- #[[file:src/utils/elemental/elementalUtils.ts]] - Primary elemental calculation utilities
- #[[file:src/constants/elementalProperties.ts]] - Elemental property constants
- #[[file:src/services/adapters/UnifiedDataAdapter.ts]] - Elemental compatibility calculations

### Data Integration
- #[[file:src/data/unified/flavorProfiles.ts]] - Flavor profiles with elemental self-reinforcement
- #[[file:src/data/unified/unifiedTypes.ts]] - Type definitions for elemental properties
- #[[file:src/data/unified/alchemicalCalculations.ts]] - Alchemical calculations with self-reinforcement

### Service Layer Integration
- #[[file:src/services/AlchemicalRecommendationService.ts]] - Recommendation service using elemental compatibility
- #[[file:src/services/UnifiedRecommendationService.ts]] - Unified recommendation system
- #[[file:src/services/ConsolidatedIngredientService.ts]] - Ingredient service with elemental logic

### Testing and Validation
- #[[file:src/utils/__tests__/]] - Elemental utility function tests
- #[[file:src/services/__tests__/]] - Service layer elemental integration tests
- #[[file:jest.config.js]] - Testing framework configuration for elemental validation