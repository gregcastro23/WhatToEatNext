# 🌟 WhatToEatNext - Astrological Domain Knowledge Base

## 📋 **Overview**

This document provides comprehensive knowledge about the astrological system implemented in WhatToEatNext. It serves as the authoritative guide for understanding astrological calculations, planetary influences, elemental systems, and testing approaches used throughout the codebase.

**Last Updated**: January 27, 2025  
**Version**: 2.0  
**Status**: Production Ready  

---

## 🎯 **Core Astrological Concepts**

### **1. Planetary System**

#### **Supported Planets (12 Total)**
```typescript
type Planet = 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars' | 
              'Jupiter' | 'Saturn' | 'Uranus' | 'Neptune' | 
              'Pluto' | 'northNode' | 'southNode';
```

#### **Planetary Weights & Influences**
```typescript
const PLANETARY_WEIGHTS = {
  sun: 2.5,      // Most important - represents core identity
  moon: 2.5,     // Most important - represents emotional state
  mercury: 1.5,  // Inner planet - communication & thinking
  venus: 1.5,    // Inner planet - love & beauty
  mars: 1.5,     // Inner planet - action & energy
  jupiter: 1.2,  // Outer planet - expansion & wisdom
  saturn: 1.2,   // Outer planet - structure & discipline
  uranus: 1.0,   // Distant planet - innovation & change
  neptune: 1.0,  // Distant planet - spirituality & dreams
  pluto: 1.0,    // Distant planet - transformation & power
  northNode: 1.0, // Lunar nodes - karmic direction
  southNode: 1.0  // Lunar nodes - past patterns
};
```

### **2. Zodiac System**

#### **Zodiac Signs (12 Total)**
```typescript
type ZodiacSign = 'aries' | 'taurus' | 'gemini' | 'cancer' | 'leo' | 
                  'virgo' | 'libra' | 'scorpio' | 'sagittarius' | 
                  'capricorn' | 'aquarius' | 'pisces';
```

#### **Elemental Associations**
```typescript
const ZODIAC_ELEMENTS: Record<ZodiacSign, ElementType> = {
  // Fire Signs (Cardinal, Fixed, Mutable)
  aries: 'Fire',       // Cardinal Fire
  leo: 'Fire',         // Fixed Fire  
  sagittarius: 'Fire', // Mutable Fire
  
  // Earth Signs (Cardinal, Fixed, Mutable)
  taurus: 'Earth',     // Fixed Earth
  virgo: 'Earth',      // Mutable Earth
  capricorn: 'Earth',  // Cardinal Earth
  
  // Air Signs (Cardinal, Fixed, Mutable)
  gemini: 'Air',       // Mutable Air
  libra: 'Air',        // Cardinal Air
  aquarius: 'Air',     // Fixed Air
  
  // Water Signs (Cardinal, Fixed, Mutable)
  cancer: 'Water',     // Cardinal Water
  scorpio: 'Water',    // Fixed Water
  pisces: 'Water'      // Mutable Water
};
```

### **3. Elemental System**

#### **Core Elements (4 Total)**
```typescript
type ElementType = 'Fire' | 'Water' | 'Earth' | 'Air';
```

#### **Elemental Properties**
- **Fire**: Spirit, energy, transformation, passion
- **Water**: Essence, emotion, intuition, flow  
- **Earth**: Matter, stability, grounding, nourishment
- **Air**: Substance, intellect, communication, movement

#### **CRITICAL: Elemental Logic Principles**
```typescript
// ✅ CORRECT: Elements work best with themselves
const elementCompatibility = {
  Fire: { Fire: 0.9, Water: 0.7, Earth: 0.7, Air: 0.8 },
  Water: { Fire: 0.7, Water: 0.9, Earth: 0.8, Air: 0.7 },
  Earth: { Fire: 0.7, Water: 0.8, Earth: 0.9, Air: 0.7 },
  Air: { Fire: 0.8, Water: 0.7, Earth: 0.7, Air: 0.9 }
};

// ❌ FORBIDDEN: Elements do NOT oppose each other
// Never implement "opposing elements" logic
```

### **4. Alchemical Properties**

#### **Core Alchemical Properties (4 Total)**
```typescript
type AlchemicalProperty = 'Spirit' | 'Essence' | 'Matter' | 'Substance';
```

#### **Planetary Alchemical Mappings**
```typescript
const PLANETARY_ALCHEMICAL_MAPPINGS = {
  Sun: { Spirit: 1, Essence: 0, Matter: 0, Substance: 0 },
  Moon: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
  Mercury: { Spirit: 1, Essence: 0, Matter: 0, Substance: 1 },
  Venus: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
  Mars: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
  Jupiter: { Spirit: 1, Essence: 1, Matter: 0, Substance: 0 },
  Saturn: { Spirit: 1, Essence: 0, Matter: 1, Substance: 0 },
  Uranus: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
  Neptune: { Spirit: 0, Essence: 1, Matter: 0, Substance: 1 },
  Pluto: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 }
};
```

---

## 🔮 **Planetary Position Calculations**

### **1. Data Source Hierarchy**
```typescript
// Priority order for planetary position calculations
const DATA_SOURCE_HIERARCHY = {
  1: 'NASA JPL Horizons API',      // Primary: Highest accuracy
  2: 'Public Astronomy APIs',      // Secondary: Swiss Ephemeris data
  3: 'TimeAndDate.com API',        // Tertiary: With authentication
  4: 'Fallback Cached Data'        // Last resort: Cached positions from March 2025
};
```

### **2. Position Data Structure**
```typescript
interface PlanetaryPosition {
  sign: string;           // Zodiac sign (lowercase)
  degree: number;         // Degree within sign (0-29.99)
  exactLongitude: number; // Absolute longitude (0-359.99)
  isRetrograde?: boolean; // Retrograde status
  phase?: string;         // Lunar phase (for Moon only)
}

interface PlanetaryPositions {
  sun: PlanetaryPosition;
  moon: PlanetaryPosition;
  mercury: PlanetaryPosition;
  venus: PlanetaryPosition;
  mars: PlanetaryPosition;
  jupiter: PlanetaryPosition;
  saturn: PlanetaryPosition;
  uranus: PlanetaryPosition;
  neptune: PlanetaryPosition;
  pluto: PlanetaryPosition;
  northNode: PlanetaryPosition;
  southNode: PlanetaryPosition;
}
```

### **3. Calculation Implementation**
```typescript
// Primary calculation function
async function calculateCurrentPlanetaryPositions(): Promise<PlanetaryPositions> {
  try {
    // 1. Try NASA JPL Horizons API first
    const horizonsPositions = await fetchHorizonsData();
    if (horizonsPositions && validatePositions(horizonsPositions)) {
      return convertToStandardFormat(horizonsPositions);
    }

    // 2. Try public astronomy APIs
    const publicPositions = await fetchPublicApiData();
    if (publicPositions && validatePositions(publicPositions)) {
      return convertToStandardFormat(publicPositions);
    }

    // 3. Use fallback cached data
    return getFallbackPlanetaryPositions();
  } catch (error) {
    logger.error('All planetary position sources failed', error);
    return getFallbackPlanetaryPositions();
  }
}
```

---

## 🌙 **Lunar Phase Calculations**

### **1. Lunar Phase Types**
```typescript
type LunarPhase = 'new moon' | 'waxing crescent' | 'first quarter' | 
                  'waxing gibbous' | 'full moon' | 'waning gibbous' | 
                  'last quarter' | 'waning crescent';
```

### **2. Calculation Methods**

#### **Method 1: Angular Distance (Most Accurate)**
```typescript
async function calculateLunarPhase(date: Date = new Date()): Promise<number> {
  try {
    const positions = await getAccuratePlanetaryPositions(date);
    if (!positions.Sun || !positions.Moon) {
      throw new Error('Sun or Moon position missing');
    }

    // Calculate angular distance between Sun and Moon
    let angularDistance = positions.Moon.exactLongitude - positions.Sun.exactLongitude;
    
    // Normalize to 0-360 range
    angularDistance = ((angularDistance % 360) + 360) % 360;
    
    // Convert to phase percentage (0-1)
    return angularDistance / 360;
  } catch (error) {
    return 0; // Default to new moon
  }
}
```

#### **Method 2: Synodic Period (Fallback)**
```typescript
function calculateLunarPhaseFallback(date: Date): string {
  const synodicPeriod = 29.53588853; // days
  const knownNewMoon = new Date('2023-01-21T20:53:00Z');
  const daysSinceNewMoon = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const normalizedPhase = (daysSinceNewMoon % synodicPeriod) / synodicPeriod;

  // Phase boundaries
  if (normalizedPhase < 0.025 || normalizedPhase > 0.975) return 'new moon';
  if (normalizedPhase < 0.235) return 'waxing crescent';
  if (normalizedPhase < 0.265) return 'first quarter';
  if (normalizedPhase < 0.485) return 'waxing gibbous';
  if (normalizedPhase < 0.515) return 'full moon';
  if (normalizedPhase < 0.735) return 'waning gibbous';
  if (normalizedPhase < 0.765) return 'last quarter';
  return 'waning crescent';
}
```

### **3. Lunar Phase Modifiers**
```typescript
const LUNAR_PHASE_MODIFIERS: Record<LunarPhase, ElementalProperties> = {
  'new moon': { Fire: 0.1, Water: 0.4, Air: 0.3, Earth: 0.2 },
  'waxing crescent': { Fire: 0.2, Water: 0.3, Air: 0.3, Earth: 0.2 },
  'first quarter': { Fire: 0.3, Water: 0.2, Air: 0.3, Earth: 0.2 },
  'waxing gibbous': { Fire: 0.4, Water: 0.1, Air: 0.3, Earth: 0.2 },
  'full moon': { Fire: 0.4, Water: 0.1, Air: 0.4, Earth: 0.1 },
  'waning gibbous': { Fire: 0.3, Water: 0.2, Air: 0.3, Earth: 0.2 },
  'last quarter': { Fire: 0.2, Water: 0.3, Air: 0.2, Earth: 0.3 },
  'waning crescent': { Fire: 0.1, Water: 0.4, Air: 0.2, Earth: 0.3 }
};
```

---

## ⚗️ **Alchemical Calculations**

### **1. Thermodynamic Metrics**
```typescript
interface ThermodynamicMetrics {
  heat: number;           // Based on Spirit + Fire elements
  entropy: number;        // Based on Spirit + Substance + Fire + Air
  reactivity: number;     // Based on all elements and properties
  gregsEnergy: number;    // heat - (entropy * reactivity)
  kalchm: number;         // (Spirit^Spirit * Essence^Essence) / (Matter^Matter * Substance^Substance)
  monica: number;         // -gregsEnergy / (reactivity * ln(kalchm))
}
```

### **2. Calculation Formulas**
```typescript
function calculateThermodynamicMetrics(
  alchemicalCounts: Record<AlchemicalProperty, number>,
  elementalCounts: Record<ElementType, number>
): ThermodynamicMetrics {
  const { Spirit, Essence, Matter, Substance } = alchemicalCounts;
  const { Fire, Water, Air, Earth } = elementalCounts;

  // Heat calculation
  const heatNum = Math.pow(Spirit, 2) + Math.pow(Fire, 2);
  const heatDen = Math.pow(Substance + Essence + Matter + Water + Air + Earth, 2);
  const heat = heatNum / heatDen;

  // Entropy calculation
  const entropyNum = Math.pow(Spirit, 2) + Math.pow(Substance, 2) + 
                     Math.pow(Fire, 2) + Math.pow(Air, 2);
  const entropyDen = Math.pow(Essence + Matter + Earth + Water, 2);
  const entropy = entropyNum / entropyDen;

  // Reactivity calculation
  const reactivityNum = Math.pow(Spirit, 2) + Math.pow(Substance, 2) + 
                        Math.pow(Essence, 2) + Math.pow(Fire, 2) + 
                        Math.pow(Air, 2) + Math.pow(Water, 2);
  const reactivityDen = Math.pow(Matter + Earth, 2);
  const reactivity = reactivityNum / reactivityDen;

  // Greg's Energy
  const gregsEnergy = heat - (entropy * reactivity);

  // Kalchm constant
  const kalchm = (Math.pow(Spirit, Spirit) * Math.pow(Essence, Essence)) /
                 (Math.pow(Matter, Matter) * Math.pow(Substance, Substance));

  // Monica constant
  let monica = NaN;
  if (kalchm > 0) {
    const lnK = Math.log(kalchm);
    if (lnK !== 0) {
      monica = -gregsEnergy / (reactivity * lnK);
    }
  }

  return { heat, entropy, reactivity, gregsEnergy, kalchm, monica };
}
```

---

## 🧪 **Elemental Calculations**

### **1. Elemental Balance Calculation**
```typescript
function calculateElementalBalance(planetaryPositions: PlanetaryPositions): ElementalProperties {
  const elements: ElementalProperties = { Fire: 0, Water: 0, Earth: 0, Air: 0 };

  // Process each planet's contribution
  Object.entries(planetaryPositions).forEach(([planet, position]) => {
    if (!position.sign) return;

    const element = ZODIAC_ELEMENTS[position.sign.toLowerCase() as ZodiacSign];
    if (!element) return;

    // Weight by planet importance
    let weight = 1.0;
    const planetLower = planet.toLowerCase();
    
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

### **2. Planetary Dignity System**
```typescript
const PLANETARY_DIGNITIES = {
  Sun: { 
    rulership: ['leo'], 
    exaltation: ['aries'], 
    detriment: ['aquarius'], 
    fall: ['libra'] 
  },
  Moon: { 
    rulership: ['cancer'], 
    exaltation: ['taurus'], 
    detriment: ['capricorn'], 
    fall: ['scorpio'] 
  },
  // ... other planets
};

function getDignityModifier(planet: string, sign: string): number {
  const planetData = PLANETARY_DIGNITIES[planet as keyof typeof PLANETARY_DIGNITIES];
  if (!planetData) return 1.0;

  const signKey = sign.toLowerCase();
  
  if (planetData.rulership?.includes(signKey)) return 1.5;
  if (planetData.exaltation?.includes(signKey)) return 1.3;
  if (planetData.detriment?.includes(signKey)) return 0.7;
  if (planetData.fall?.includes(signKey)) return 0.5;
  
  return 1.0;
}
```

---

## 🧪 **Testing Approaches**

### **1. Planetary Position Testing**
```typescript
describe('Planetary Position Calculations', () => {
  test('should calculate accurate Sun position', async () => {
    const positions = await calculateCurrentPlanetaryPositions();
    
    // Validate Sun position
    expect(positions.sun).toBeDefined();
    expect(positions.sun.sign).toMatch(/^(aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces)$/);
    expect(positions.sun.degree).toBeGreaterThanOrEqual(0);
    expect(positions.sun.degree).toBeLessThan(30);
    expect(positions.sun.exactLongitude).toBeGreaterThanOrEqual(0);
    expect(positions.sun.exactLongitude).toBeLessThan(360);
  });

  test('should handle API failures gracefully', async () => {
    // Mock API failure
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('API Error'));
    
    const positions = await calculateCurrentPlanetaryPositions();
    
    // Should return fallback data
    expect(positions).toBeDefined();
    expect(Object.keys(positions)).toHaveLength(12);
  });
});
```

### **2. Lunar Phase Testing**
```typescript
describe('Lunar Phase Calculations', () => {
  test('should calculate correct lunar phase for known dates', () => {
    // Known new moon date
    const newMoonDate = new Date('2023-01-21T20:53:00Z');
    const phase = calculateLunarPhase(newMoonDate);
    expect(phase).toBeCloseTo(0, 1); // Should be close to 0 (new moon)
  });

  test('should handle phase boundaries correctly', () => {
    const testCases = [
      { phase: 0, expected: 'new moon' },
      { phase: 0.125, expected: 'waxing crescent' },
      { phase: 0.25, expected: 'first quarter' },
      { phase: 0.375, expected: 'waxing gibbous' },
      { phase: 0.5, expected: 'full moon' },
      { phase: 0.625, expected: 'waning gibbous' },
      { phase: 0.75, expected: 'last quarter' },
      { phase: 0.875, expected: 'waning crescent' }
    ];

    testCases.forEach(({ phase, expected }) => {
      const phaseName = getLunarPhaseName(phase);
      expect(phaseName).toBe(expected);
    });
  });
});
```

### **3. Elemental Calculation Testing**
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
    const compatibility = getElementalCompatibility('Fire', 'Water');
    expect(compatibility).toBeGreaterThan(0.6); // Should be harmonious

    // Test that same elements have highest compatibility
    const sameElement = getElementalCompatibility('Fire', 'Fire');
    const differentElement = getElementalCompatibility('Fire', 'Earth');
    expect(sameElement).toBeGreaterThan(differentElement);
  });
});
```

### **4. Alchemical Calculation Testing**
```typescript
describe('Alchemical Calculations', () => {
  test('should calculate thermodynamic metrics correctly', () => {
    const alchemicalCounts = { Spirit: 2, Essence: 1, Matter: 1, Substance: 0 };
    const elementalCounts = { Fire: 2, Water: 1, Earth: 1, Air: 0 };
    
    const metrics = calculateThermodynamicMetrics(alchemicalCounts, elementalCounts);
    
    expect(metrics.heat).toBeGreaterThan(0);
    expect(metrics.entropy).toBeGreaterThan(0);
    expect(metrics.reactivity).toBeGreaterThan(0);
    expect(metrics.kalchm).toBeGreaterThan(0);
    expect(typeof metrics.monica).toBe('number');
  });

  test('should handle edge cases gracefully', () => {
    const zeroCounts = { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 };
    const zeroElements = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    
    const metrics = calculateThermodynamicMetrics(zeroCounts, zeroElements);
    
    // Should not throw errors and should return reasonable defaults
    expect(metrics.heat).toBeGreaterThanOrEqual(0);
    expect(metrics.entropy).toBeGreaterThanOrEqual(0);
    expect(metrics.reactivity).toBeGreaterThanOrEqual(0);
  });
});
```

---

## 🔧 **Implementation Patterns**

### **1. Safe Property Access Pattern**
```typescript
// ✅ CORRECT: Safe property access with type guards
function processPlanetaryData(data: unknown): PlanetaryPosition | null {
  if (!data || typeof data !== 'object') return null;
  
  const position = data as Record<string, unknown>;
  
  if (!position.sign || typeof position.sign !== 'string') return null;
  if (!position.degree || typeof position.degree !== 'number') return null;
  if (!position.exactLongitude || typeof position.exactLongitude !== 'number') return null;
  
  return {
    sign: position.sign.toLowerCase(),
    degree: position.degree,
    exactLongitude: position.exactLongitude,
    isRetrograde: Boolean(position.isRetrograde)
  };
}
```

### **2. Fallback Pattern**
```typescript
// ✅ CORRECT: Always provide fallbacks
async function getAstrologicalState(): Promise<AstrologicalState> {
  try {
    const positions = await calculateCurrentPlanetaryPositions();
    const lunarPhase = await calculateLunarPhase();
    
    return {
      sunSign: positions.sun?.sign || 'aries',
      moonSign: positions.moon?.sign || 'cancer',
      lunarPhase: getLunarPhaseName(lunarPhase) || 'new moon',
      planetaryPositions: positions,
      dominantElement: calculateDominantElement(positions) || 'Fire'
    };
  } catch (error) {
    logger.error('Astrological calculation failed', error);
    
    // Return default state
    return {
      sunSign: 'aries',
      moonSign: 'cancer',
      lunarPhase: 'new moon',
      planetaryPositions: getFallbackPositions(),
      dominantElement: 'Fire'
    };
  }
}
```

### **3. Validation Pattern**
```typescript
// ✅ CORRECT: Validate all inputs and outputs
function validateElementalProperties(properties: unknown): properties is ElementalProperties {
  if (!properties || typeof properties !== 'object') return false;
  
  const props = properties as Record<string, unknown>;
  const requiredElements = ['Fire', 'Water', 'Earth', 'Air'];
  
  for (const element of requiredElements) {
    if (typeof props[element] !== 'number') return false;
    if (props[element] < 0 || props[element] > 1) return false;
  }
  
  const sum = requiredElements.reduce((total, element) => total + (props[element] as number), 0);
  return Math.abs(sum - 1) < 0.001; // Allow for floating point error
}
```

---

## 🚫 **Common Pitfalls & Anti-Patterns**

### **1. Elemental Logic Violations**
```typescript
// ❌ FORBIDDEN: Opposing elements
const opposingElements = {
  Fire: 'Water',  // WRONG - elements don't oppose each other
  Earth: 'Air'    // WRONG - elements don't oppose each other
};

// ❌ FORBIDDEN: Elemental balancing
function balanceElements(fire: number, water: number) {
  // WRONG - don't try to balance elements against each other
  return { fire: 0.5, water: 0.5 };
}
```

### **2. Type Safety Violations**
```typescript
// ❌ FORBIDDEN: Unsafe type casting
const data = response as any;
const sign = data.planets.sun.sign; // Unsafe!

// ❌ FORBIDDEN: Missing validation
function processData(data: unknown) {
  return data.planets.sun.sign; // No validation!
}
```

### **3. Calculation Errors**
```typescript
// ❌ FORBIDDEN: Hardcoded values
function getLunarPhase() {
  return 'full moon'; // WRONG - should calculate dynamically
}

// ❌ FORBIDDEN: Missing error handling
async function getPlanetaryPositions() {
  const response = await fetch('/api/astrologize');
  return response.json(); // No error handling!
}
```

---

## 📚 **Key Files & Functions**

### **Core Calculation Files**
- `src/calculations/alchemicalEngine.ts` - Main alchemical calculations
- `src/calculations/core/elementalCalculations.ts` - Elemental balance calculations
- `src/calculations/core/planetaryInfluences.ts` - Planetary influence calculations
- `src/calculations/culinaryAstrology.ts` - Culinary astrology integration
- `src/utils/reliableAstronomy.ts` - Reliable planetary position calculations

### **Type Definitions**
- `src/types/alchemy.ts` - Alchemical type definitions
- `src/types/celestial.ts` - Celestial type definitions
- `src/types/astrology.ts` - Astrological type definitions

### **Data Files**
- `src/data/planets/` - Planetary transit data
- `src/data/transits/` - Transit date mappings
- `src/constants/planetaryElements.ts` - Planetary element mappings

### **Testing Files**
- `src/__tests__/alchemicalPillars.test.ts` - Core alchemical tests
- `src/__tests__/astrologize-integration.test.ts` - API integration tests
- `src/__tests__/culinaryAstrology.test.ts` - Culinary astrology tests
- `src/utils/__tests__/planetaryValidation.test.ts` - Planetary validation tests

---

## 🎯 **Best Practices Summary**

1. **Always use safe property access** with type guards
2. **Provide fallbacks** for all calculations
3. **Validate inputs and outputs** thoroughly
4. **Respect elemental logic principles** (no opposing elements)
5. **Use the data source hierarchy** for planetary positions
6. **Test edge cases** and error conditions
7. **Log errors appropriately** for debugging
8. **Maintain type safety** throughout the system
9. **Use established calculation patterns** from existing code
10. **Follow the casing conventions** (elements capitalized, signs lowercase)

---

## 🔗 **Related Documentation**

- [Elemental Logic Principles](./elemental-principles-guide.md)
- [Astrological Integration Guide](./ASTROLOGICAL_INTEGRATION.md)
- [Planetary System Guide](./planetary-system.md)
- [Alchemical Pillars Guide](./alchemical-pillars.md)

---

*This knowledge base should be updated whenever new astrological features are added or existing calculations are modified.*