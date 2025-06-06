# Elemental Logic Principles Guide

## Core Principle: Elements Are Individually Valuable

In our alchemical system, each element (Fire, water, earth, Air) should be treated as independently valuable and contributing its own unique qualities. This guide explains the correct approach to elemental logic.

## Key Principles to Follow

### 1. No Opposing Elements

- ❌ **INCORRECT**: Treating Fire as opposing water, or earth as opposing Air
- ✅ **CORRECT**: Each element brings its own unique qualities
  
Elements do not "cancel each other out" or "oppose" each other. They each contribute their own energy and qualities.

### 2. Elements Reinforce Themselves

- ❌ **INCORRECT**: Seeking to "balance" elements with their opposite
- ✅ **CORRECT**: Elements work best with themselves - like reinforces like

When working with elemental properties, higher values of the same element create stronger harmony.

### 3. All Element Combinations Can Work Together

- ❌ **INCORRECT**: Assigning low compatibility scores to certain element pAirs
- ✅ **CORRECT**: All element combinations have good compatibility (0.7+)

Different elements can work harmoniously together, with same-element combinations having the highest affinity (0.9).

### 4. No Elemental "Balancing"

- ❌ **INCORRECT**: Trying to balance Fire with water, or earth with Air 
- ✅ **CORRECT**: Match elements based on their individual qualities

Don't write code that attempts to "balance" elements against each other. Instead, consider each element's individual contribution.

## Code Implementation Examples

### Element Compatibility Function

```javascript
// CORRECT IMPLEMENTATION
function getElementalCompatibility(element1, element2) {
  // Same element has highest compatibility
  if (element1 === element2) {
    return 0.9; // Same element has high compatibility
  }
  
  // All different element combinations have good compatibility
  return 0.7; // Different elements have good compatibility
}
```

### "Complementary" Elements Function

```javascript
// CORRECT IMPLEMENTATION
function getComplementaryElement(element) {
  // Each element complements itself most strongly
  const complementary = {
    Fire: 'Fire',  // Fire reinforces itself
    water: 'water', // water reinforces itself
    earth: 'earth', // earth reinforces itself
    Air: 'Air'     // Air reinforces itself
  };
  return complementary[element];
}
```

### Elemental Properties Display

```javascript
// CORRECT IMPLEMENTATION
function displayElementalProperties(properties) {
  // Show each element individually, with its own value
  return (
    <div className="elemental-properties">
      <div className="element fire">Fire: {properties.Fire * 100}%</div>
      <div className="element water">water: {properties.water * 100}%</div>
      <div className="element earth">earth: {properties.earth * 100}%</div>
      <div className="element Air">Air: {properties.Air * 100}%</div>
    </div>
  );
}
```

## Identifying and Fixing Problematic Code

Run our automated script to scan for and fix issues:

```bash
node fix-elemental-logic.js
```

### Common Issues to Watch For:

1. Variables or objects named `opposites` that map elements to their "opposites"
2. Conditional logic that assigns low scores to certain element combinations
3. Functions named `getOpposingElement` or similar
4. References to "balancing" Fire with water or earth with Air
5. Variables named `firewater` or `earthAir` that group elements as pAirs

## Why This matters

Our alchemical system is built on the principle that each element is valuable in its own right. When we incorrectly implement "opposing" elements, we create inconsistent and contradictory results that make our recommendations less effective and harder to explain.

By following these principles, we create a more coherent and powerful system where each element can fully express its unique qualities. 