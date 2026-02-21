# 🔥 Elemental Fundamental Quantities

**Definitive Guide to Fire, Water, Earth, and Air in the WhatToEatNext Alchemical System**

_Last Updated: January 2025 - Updated for Denormalized System_

## Overview

The four classical elements (Fire, Water, Earth, Air) are **fundamental quantitative properties** that describe the energetic nature of ingredients, recipes, and culinary transformations in our alchemical system. Unlike the alchemical properties (Spirit, Essence, Matter, Substance - ESMS) which are derived from planetary positions, elemental properties are intrinsic qualities that combine with astrological influences to determine the complete alchemical state.

**🚨 CRITICAL UPDATE**: As of the denormalization update, elemental properties are now **raw calculated values** (not normalized to sum to 1.0). This preserves true energetic intensity information, allowing recipes with high-intensity ingredients to express their full energetic signatures. Normalization is now only used for UI display purposes.

---

## 1. Fundamental Definitions

### 🔥 Fire Element

**Type Definition:**

```typescript
type ElementType = "Fire" | "Water" | "Earth" | "Air";

// Raw elemental properties - actual calculated values (NOT normalized)
interface RawElementalProperties {
  Fire: number; // >= 0, no upper bound (preserves true intensity)
  Water: number; // >= 0, no upper bound
  Earth: number; // >= 0, no upper bound
  Air: number; // >= 0, no upper bound
}

// ElementalProperties is now RawElementalProperties by default
type ElementalProperties = RawElementalProperties;
```

**Fundamental Quantities:**

- **Energy**: Transformation, vitality, passion, spirit
- **Qualities**: Hot, dry, expansive
- **Primary Correspondence**: Spirit (alchemical property)
- **Secondary Correspondence**: Air (shared dynamic nature)
- **Culinary Expression**: Spices, peppers, ginger, garlic, onions, heat-driven cooking methods
- **Planetary Correspondences**: Sun (vitality), Mars (action)
- **Zodiac Signs**: Aries (Cardinal Fire), Leo (Fixed Fire), Sagittarius (Mutable Fire)
- **Cooking Methods**: Grilling, sautéing, stir-frying, flambéing

**Mathematical Role:**

- Contributes to **Heat** calculation (numerator: Fire²)
- Contributes to **Entropy** calculation (numerator: Fire²)
- Contributes to **Reactivity** calculation (numerator: Fire²)
- Acts as denominator in thermodynamic formulas (additive with other elements)

---

### 💧 Water Element

**Fundamental Quantities:**

- **Energy**: Emotion, intuition, flow, essence, nourishment
- **Qualities**: Cold, wet, contracting
- **Primary Correspondence**: Essence (alchemical property)
- **Secondary Correspondence**: Earth (shared nurturing nature)
- **Culinary Expression**: Leafy greens, cucumbers, melons, dairy, liquid-based preparations
- **Planetary Correspondences**: Moon (emotions), Neptune (intuition)
- **Zodiac Signs**: Cancer (Cardinal Water), Scorpio (Fixed Water), Pisces (Mutable Water)
- **Cooking Methods**: Steaming, boiling, poaching, braising

**Mathematical Role:**

- Contributes to **Reactivity** calculation (numerator: Water²)
- Acts as denominator in **Heat** calculation (additive)
- Acts as denominator in **Entropy** calculation (additive)
- Does NOT appear in numerator of Heat or Entropy calculations

---

### 🌍 Earth Element

**Fundamental Quantities:**

- **Energy**: Stability, grounding, matter, substance, practical nourishment
- **Qualities**: Cold, dry, stabilizing
- **Primary Correspondence**: Matter (alchemical property)
- **Secondary Correspondence**: Water (shared nurturing nature)
- **Culinary Expression**: Root vegetables, grains, legumes, nuts, substantial foods
- **Planetary Correspondences**: Saturn (structure), Venus (abundance)
- **Zodiac Signs**: Taurus (Fixed Earth), Virgo (Mutable Earth), Capricorn (Cardinal Earth)
- **Cooking Methods**: Roasting, slow cooking, baking, stewing

**Mathematical Role:**

- Acts as denominator in **Heat** calculation (additive)
- Acts as denominator in **Entropy** calculation (additive)
- Acts as denominator in **Reactivity** calculation (additive, squared: (Matter + Earth)²)
- Provides grounding/stability in thermodynamic balance

---

### 💨 Air Element

**Fundamental Quantities:**

- **Energy**: Intellect, communication, movement, ideas, clarity, mental stimulation
- **Qualities**: Hot, wet, moving
- **Primary Correspondence**: Substance (alchemical property)
- **Secondary Correspondence**: Fire (shared dynamic nature)
- **Culinary Expression**: Herbs, leafy greens, sprouts, light fruits, aromatic preparations
- **Planetary Correspondences**: Mercury (communication), Uranus (innovation)
- **Zodiac Signs**: Gemini (Mutable Air), Libra (Cardinal Air), Aquarius (Fixed Air)
- **Cooking Methods**: Raw preparation, light sautéing, fresh combinations

**Mathematical Role:**

- Contributes to **Heat** calculation (numerator: Fire² + Air², though Air contributes through Fire-Air synergy)
- Contributes to **Entropy** calculation (numerator: Air²)
- Contributes to **Reactivity** calculation (numerator: Air²)
- Acts as denominator in **Heat** calculation (additive)

---

## 2. Type System Representation

### Core Type Definitions

```typescript
// From src/types/alchemy.ts and src/types/celestial.ts
export type Element = "Fire" | "Water" | "Earth" | "Air";

/**
 * Raw elemental properties - actual calculated values (not normalized)
 * Values can be any positive number representing true energetic intensity
 */
export interface RawElementalProperties {
  Fire: number; // >= 0, no upper bound
  Water: number; // >= 0, no upper bound
  Earth: number; // >= 0, no upper bound
  Air: number; // >= 0, no upper bound
}

/**
 * Normalized elemental properties - percentages (0.0-1.0, sum ≈ 1.0)
 * Used ONLY for display/UI purposes
 */
export interface NormalizedElementalProperties {
  Fire: number; // 0.0-1.0
  Water: number; // 0.0-1.0
  Earth: number; // 0.0-1.0
  Air: number; // 0.0-1.0
}

/**
 * ElementalProperties is now RawElementalProperties by default
 * (Backwards compatible alias)
 */
export type ElementalProperties = RawElementalProperties;

// Zero state - no elemental properties (starting point for calculations)
export const ZERO_ELEMENTAL_PROPERTIES: ElementalProperties = {
  Fire: 0,
  Water: 0,
  Earth: 0,
  Air: 0,
};

// Legacy normalized defaults (for backwards compatibility only)
export const NORMALIZED_DEFAULT_PROPERTIES: NormalizedElementalProperties = {
  Fire: 0.25,
  Water: 0.25,
  Earth: 0.25,
  Air: 0.25,
};
```

### Raw Value System

Elemental properties are **raw calculated values** that:

- Can be any positive number (>= 0, no upper bound)
- Preserve true energetic intensity (not percentages)
- Sum to actual calculated totals (may be > 1.0, < 1.0, or = 1.0)
- Represent actual calculated intensities from ingredients, quantities, and transformations
- Are independent of alchemical properties (ESMS)

**Normalization is now only for display:**

- Use `normalizeForDisplay()` from `@/utils/elemental/normalization` for UI percentages
- Calculations use raw values directly
- Raw values scale correctly with cooking method modifiers

---

## 3. Calculation System

### Hierarchical Calculation Model

**Three-Tier Architecture:**

1. **Tier 1 - Ingredients** (Elemental Only)
   - Store ONLY elemental properties: Fire, Water, Earth, Air
   - Values are **raw calculated intensities** (NOT normalized)
   - NO alchemical properties at ingredient level
   - Rationale: Ingredients lack astrological context for ESMS calculation

2. **Tier 2 - Recipes** (Computed - Full Alchemical)
   - **Elemental Properties**: Raw aggregated values from ingredients + zodiac influences
     - `aggregateIngredientElementals()` returns raw totals (no normalization)
     - Cooking method transforms preserve raw intensity (no re-normalization)
     - 70% ingredient weight + 30% zodiac weight applied to raw values
   - **Alchemical Properties**: Calculated from planetary positions via `calculateAlchemicalFromPlanets()`
   - **Thermodynamic Metrics**: Derived from ESMS + raw elementals using formulas below

3. **Tier 3 - Cuisines** (Aggregated - Statistical)
   - Weighted average properties across recipes (using raw values)
   - Cultural signatures (z-score > 1.5σ)
   - Statistical variance and diversity metrics

### Elemental Aggregation Formula

```typescript
// Recipe elemental properties = weighted combination of RAW values
// aggregateIngredientElementals() returns raw totals (no normalization)
const ingredientElementals = aggregateIngredientElementals(ingredients);
const zodiacElementals = aggregateZodiacElementals(planetaryPositions);

// Combine using weighted average (returns raw values)
recipeElementals = {
  Fire: (0.7 × ingredientElementals.Fire) + (0.3 × zodiacElementals.Fire),
  Water: (0.7 × ingredientElementals.Water) + (0.3 × zodiacElementals.Water),
  Earth: (0.7 × ingredientElementals.Earth) + (0.3 × zodiacElementals.Earth),
  Air: (0.7 × ingredientElementals.Air) + (0.3 × zodiacElementals.Air),
}
// Result: Raw elemental values (sum may be > 1.0, preserves intensity)
```

---

## 4. Thermodynamic Calculations

### Formula 1: Heat

**Definition**: Measure of active, transformative energy

**Formula:**

```
Heat = (Spirit² + Fire²) / (Substance + Essence + Matter + Water + Air + Earth)²
```

**Elemental Contributions:**

- **Numerator**: Fire² (squared, amplifying effect)
- **Denominator**: All four elements (Water, Earth, Air) + ESMS properties
- **Interpretation**: High Fire increases Heat; all elements provide grounding

### Formula 2: Entropy

**Definition**: Measure of disorder, chaos, dynamic transformation

**Formula:**

```
Entropy = (Spirit² + Substance² + Fire² + Air²) / (Essence + Matter + Earth + Water)²
```

**Elemental Contributions:**

- **Numerator**: Fire² + Air² (both contribute to dynamic chaos)
- **Denominator**: Earth + Water (stabilizing elements)
- **Interpretation**: Fire and Air increase entropy; Earth and Water decrease it

### Formula 3: Reactivity

**Definition**: Measure of potential for chemical/energetic transformation

**Formula:**

```
Reactivity = (Spirit² + Substance² + Essence² + Fire² + Air² + Water²) / (Matter + Earth)²
```

**Elemental Contributions:**

- **Numerator**: Fire² + Air² + Water² (all active elements contribute)
- **Denominator**: (Matter + Earth)² (squared, strong stabilizing effect)
- **Interpretation**: High Fire/Air/Water with low Earth increases reactivity

### Formula 4: Greg's Energy

**Definition**: Net energetic balance combining heat and entropy effects

**Formula:**

```
Greg's Energy = Heat - (Entropy × Reactivity)
```

**Elemental Influence:**

- Indirect through Heat, Entropy, and Reactivity formulas above
- High Fire generally increases Greg's Energy (via Heat contribution)
- High Earth generally decreases Reactivity (via denominator)

---

## 5. Relationship to Alchemical Properties (ESMS)

### Key Distinction

**Elements (Fire, Water, Earth, Air):**

- Intrinsic properties of ingredients/recipes
- Derived from ingredient characteristics and zodiac influences
- Used in thermodynamic calculations directly

**Alchemical Properties (Spirit, Essence, Matter, Substance):**

- Derived EXCLUSIVELY from planetary positions
- Calculated via `calculateAlchemicalFromPlanets()`
- NOT approximations from elements
- Combined with elements in thermodynamic formulas

### Alchemical-Elemental Mapping

```typescript
// From src/constants/alchemicalPillars.ts
export const _ALCHEMICAL_PROPERTY_ELEMENTS = {
  Spirit: { primary: "Fire", secondary: "Air" }, // Fire-Air bridge
  Essence: { primary: "Fire", secondary: "Water" }, // Fire-Water bridge
  Matter: { primary: "Earth", secondary: "Water" }, // Earth-Water bridge
  Substance: { primary: "Air", secondary: "Earth" }, // Air-Earth bridge
};
```

**Note**: This mapping is conceptual (showing relationships), not computational. ESMS values come from planetary positions, not elemental approximations.

---

## 6. Self-Reinforcement Principle

### Core Principle

**Elements work best with themselves** - this is the fundamental principle governing elemental interactions.

### Compatibility Matrix

```typescript
const ELEMENTAL_COMPATIBILITY = {
  Fire: { Fire: 0.9, Water: 0.7, Earth: 0.7, Air: 0.8 },
  Water: { Water: 0.9, Fire: 0.7, Earth: 0.8, Air: 0.7 },
  Earth: { Earth: 0.9, Fire: 0.7, Water: 0.8, Air: 0.7 },
  Air: { Air: 0.9, Fire: 0.8, Water: 0.7, Earth: 0.7 },
};

// Key principles:
// - Same elements: 0.9 compatibility (highest harmony)
// - Different elements: 0.7-0.8 compatibility (good harmony)
// - No combinations below 0.7 (NO opposing elements)
// - Fire-Air: 0.8 (shared dynamic nature)
// - Water-Earth: 0.8 (shared nurturing nature)
```

### Forbidden Patterns

❌ **NEVER implement opposition logic:**

- Fire does NOT oppose Water
- Earth does NOT oppose Air
- Elements do NOT cancel each other out

❌ **NEVER penalize different elements:**

- All element combinations have good compatibility (≥0.7)
- Different elements enhance each other, not diminish

---

## 7. Practical Usage Examples

### Example 1: Ingredient Elemental Assignment (Raw Values)

```typescript
// Spicy ingredient (high Fire intensity)
const chiliPepper: ElementalProperties = {
  Fire: 2.5, // Raw intensity value (not percentage)
  Water: 0.3,
  Earth: 0.2,
  Air: 0.15,
};
// Total = 3.15 (preserves true Fire intensity)

// Cooling ingredient (high Water)
const cucumber: ElementalProperties = {
  Fire: 0.2,
  Water: 1.8, // Raw intensity value
  Earth: 0.3,
  Air: 0.1,
};
// Total = 2.4

// Grounding ingredient (high Earth)
const potato: ElementalProperties = {
  Fire: 0.3,
  Water: 0.5,
  Earth: 2.0, // Raw intensity value
  Air: 0.15,
};
// Total = 2.95

// Light aromatic (high Air)
const mint: ElementalProperties = {
  Fire: 0.25,
  Water: 0.4,
  Earth: 0.2,
  Air: 1.5, // Raw intensity value
};
// Total = 2.35
```

### Example 2: Recipe Elemental Calculation (Raw Aggregation)

```typescript
// Aggregate from ingredients - returns RAW values (no normalization)
const ingredients = [
  {
    elementalProperties: { Fire: 2.5, Water: 0.3, Earth: 0.2, Air: 0.15 },
    amount: 100,
  },
  {
    elementalProperties: { Fire: 0.3, Water: 0.5, Earth: 2.0, Air: 0.15 },
    amount: 200,
  },
];

// aggregateIngredientElementals() returns raw totals
const recipeElementals = aggregateIngredientElementals(ingredients);
// Result: { Fire: 3.67, Water: 1.17, Earth: 2.87, Air: 0.45 }
// Total = 8.16 (raw intensity, NOT normalized to 1.0)

// For display only, normalize to percentages:
import { normalizeForDisplay } from "@/utils/elemental/normalization";
const displayPercentages = normalizeForDisplay(recipeElementals);
// Result: { Fire: 0.45, Water: 0.14, Earth: 0.35, Air: 0.06 }
```

### Example 3: Thermodynamic Calculation (Raw Values)

```typescript
// Given recipe with raw elemental and alchemical properties
const elemental = { Fire: 5.2, Water: 3.1, Earth: 1.8, Air: 1.2 }; // Raw values
const alchemical = { Spirit: 4, Essence: 7, Matter: 6, Substance: 2 };

// Calculate Heat
const heat =
  (Math.pow(alchemical.Spirit, 2) + Math.pow(elemental.Fire, 2)) /
  Math.pow(
    alchemical.Substance +
      alchemical.Essence +
      alchemical.Matter +
      elemental.Water +
      elemental.Air +
      elemental.Earth,
    2,
  );

// Calculate Entropy
const entropy =
  (Math.pow(alchemical.Spirit, 2) +
    Math.pow(alchemical.Substance, 2) +
    Math.pow(elemental.Fire, 2) +
    Math.pow(elemental.Air, 2)) /
  Math.pow(
    alchemical.Essence + alchemical.Matter + elemental.Earth + elemental.Water,
    2,
  );

// Calculate Reactivity
const reactivity =
  (Math.pow(alchemical.Spirit, 2) +
    Math.pow(alchemical.Substance, 2) +
    Math.pow(alchemical.Essence, 2) +
    Math.pow(elemental.Fire, 2) +
    Math.pow(elemental.Air, 2) +
    Math.pow(elemental.Water, 2)) /
  Math.pow(alchemical.Matter + elemental.Earth, 2);

// Calculate Greg's Energy
const gregsEnergy = heat - entropy * reactivity;
```

---

## 8. Quantitative Ranges and Utilities

### Raw Value Utilities

```typescript
// Get total elemental intensity (sum of all elements)
import { getTotalIntensity } from "@/utils/elemental/normalization";

const props = { Fire: 5.2, Water: 3.1, Earth: 1.8, Air: 1.2 };
const total = getTotalIntensity(props); // Result: 11.3

// Get dominant element by absolute intensity (not percentage)
import { getDominantElementByIntensity } from "@/utils/elemental/normalization";
const dominant = getDominantElementByIntensity(props); // Result: "Fire"

// Normalize for display only (UI percentages)
import { normalizeForDisplay } from "@/utils/elemental/normalization";
const displayProps = normalizeForDisplay(props);
// Result: { Fire: 0.46, Water: 0.27, Earth: 0.16, Air: 0.11 } (sum = 1.0)
```

### Elemental Thresholds (Relative to Total Intensity)

```typescript
// For raw values, thresholds are relative to total intensity
const totalIntensity = getTotalIntensity(properties);
const firePercentage = properties.Fire / totalIntensity;

export const ELEMENTAL_THRESHOLDS = {
  dominant: 0.4, // Element is >= 40% of total intensity
  significant: 0.25, // Element is >= 25% of total intensity
  present: 0.1, // Element is >= 10% of total intensity
  trace: 0.05, // Element is >= 5% of total intensity
};

// Example usage:
if (firePercentage >= ELEMENTAL_THRESHOLDS.dominant) {
  // Fire is dominant element
}
```

### Display Normalization (UI Only)

```typescript
/**
 * Normalize raw elemental properties to percentages (0.0-1.0) for display
 * Used ONLY for UI display purposes, NOT for calculations
 */
import { normalizeForDisplay } from "@/utils/elemental/normalization";

const rawProps = { Fire: 5.2, Water: 3.1, Earth: 1.8, Air: 1.2 };
const displayProps = normalizeForDisplay(rawProps);
// Result: { Fire: 0.46, Water: 0.27, Earth: 0.16, Air: 0.11 }
// Use displayProps for UI charts, percentage displays, etc.
```

---

## 9. Implementation Files

### Core Type Definitions

- `src/types/celestial.ts` - Element type and ElementalProperties interface
- `src/types/alchemy.ts` - ElementalPropertiesType interface

### Constants and Mappings

- `src/constants/elements.ts` - Elemental qualities, seasons, tastes, colors
- `src/constants/elementalCore.ts` - Core element constants and defaults
- `src/constants/alchemicalPillars.ts` - Alchemical-elemental mapping

### Calculation Functions

- `src/utils/elemental/core.ts` - Elemental aggregation (raw values)
- `src/utils/elemental/normalization.ts` - Display normalization utilities (UI only)
- `src/utils/elemental/compatibility.ts` - Backwards compatibility layer
- `src/utils/elementalUtils.ts` - Elemental utility functions
- `src/utils/hierarchicalRecipeCalculations.ts` - Recipe-level calculations (raw values)
- `src/data/unified/alchemicalCalculations.ts` - Thermodynamic calculations

### Documentation

- `docs/guides/elemental-systems-guide.md` - Comprehensive implementation guide
- `docs/getting-started/architecture-guide.md` - System architecture overview

---

## 10. Key Principles Summary

### ✅ Fundamental Truths

1. **Elements are raw calculated values** (>= 0, no upper bound, preserves true intensity)
2. **Normalization is for display only** (use `normalizeForDisplay()` for UI percentages)
3. **Elements are independent of ESMS** (calculated separately)
4. **Elements combine with ESMS** in thermodynamic formulas (using raw values)
5. **Self-reinforcement governs compatibility** (same elements = 0.9)
6. **No elements oppose each other** (all combinations ≥ 0.7)
7. **Ingredients have elementals only** (no ESMS at ingredient level)
8. **Recipes have both** (raw elementals from ingredients + ESMS from planets)
9. **Raw values scale correctly** with cooking method modifiers (no re-normalization needed)

### ❌ Forbidden Practices

1. Normalizing elemental values for calculations (only normalize for UI display)
2. Calculating ESMS from elements (ESMS comes ONLY from planetary positions)
3. Implementing opposition logic (Fire vs Water, etc.)
4. Penalizing different element combinations (< 0.7 compatibility)
5. Balancing elements against each other (elements reinforce themselves)
6. Using elements as substitutes for ESMS calculations
7. Assuming elemental values sum to 1.0 (they're raw calculated intensities)

---

## Conclusion

Fire, Water, Earth, and Air are **fundamental quantitative properties** that describe the energetic nature of culinary elements. With the denormalization update, these values are now **raw calculated intensities** (not normalized percentages), preserving true energetic signatures that were previously lost. They combine with alchemical properties (derived from planetary positions) to calculate thermodynamic metrics that guide personalized food recommendations. The self-reinforcement principle ensures that elements work harmoniously together, with no opposition or cancellation between different elements.

**Key Benefits of Raw Values:**

- **Preserves intensity information**: High-intensity recipes (Fire = 5.2) are distinguishable from low-intensity (Fire = 1.8)
- **True scaling**: Cooking method modifiers work correctly with raw values
- **Meaningful calculations**: Thermodynamic formulas receive actual intensities, not percentages
- **Better differentiation**: Recipes with similar percentage profiles but different intensities are now distinguishable

**Next Steps:**

- Review `docs/guides/elemental-systems-guide.md` for implementation patterns
- See `docs/getting-started/architecture-guide.md` for system architecture
- See `docs/guides/denormalization-plan.md` for migration details
- Use `normalizeForDisplay()` from `@/utils/elemental/normalization` for UI percentages
- Examine calculation functions in `src/utils/elemental/` for practical examples

---

_For questions or clarifications, refer to the comprehensive documentation in `docs/guides/` or review the implementation in `src/utils/elemental/` and `src/calculations/`._
