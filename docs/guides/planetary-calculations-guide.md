# 🪐 Planetary Calculations Implementation Guide

## Overview

This guide provides detailed instructions for working with planetary
calculations in the WhatToEatNext system. It covers implementation patterns,
calculation methods, and best practices for accurate astrological computations.

## Core Planetary Calculation Functions

### 1. Primary Calculation Function

```typescript
// src/utils/reliableAstronomy.ts
export async function getReliablePlanetaryPositions(date: Date = new Date()): Promise<Record<string, unknown>> {
  try {
    // Format date for cache key
    const dateString = date.toISOString().split('T')[0];

    // Check cache first
    if (positionsCache &&
        positionsCache.date === dateString &&
        (Date.now() - positionsCache.timestamp) < CACHE_DURATION) {
      logger.debug('Using cached planetary positions');
      return positionsCache.positions;
    }

    // Primary: Call NASA JPL Horizons API
    try {
      const positions = await fetchHorizonsData(date);
      if (positions && Object.keys(positions).length > 0) {
        positionsCache = { positions, timestamp: Date.now(), date: dateString };
        return positions;
      }
    } catch (error) {
      logger.error('Error fetching from NASA JPL Horizons:', error);
    }

    // Secondary: Try public API
    try {
      const positions = await fetchPublicApiData(date);
      if (positions && Object.keys(positions).length > 0) {
        positionsCache = { positions, timestamp: Date.now(), date: dateString };
        return positions;
      }
    } catch (error) {
      logger.error('Error fetching from public API:', error);
    }

    // All APIs failed, use fallback
    throw new Error('All API sources failed');
  } catch (error) {
    logger.error('Error fetching planetary positions:', error);
    return getMarch2025Positions(date);
  }
}
```

### 2. Longitude to Zodiac Sign Conversion

```typescript
function getLongitudeToZodiacSign(longitude: number): { sign: string, degree: number } {
  // Normalize longitude to 0-360 range
  const normalized = ((longitude % 360) + 360) % 360;

  // Calculate sign index and degree
  const signIndex = Math.floor(normalized / 30);
  const degree = normalized % 30;

  // Get sign name
  const signs = [
    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
  ];

  return {
    sign: signs[signIndex],
    degree: Math.round(degree * 100) / 100 // Round to 2 decimal places
  };
}
```

### 3. Lunar Node Calculations

```typescript
function calculateLunarNode(date: Date, nodeType: 'northNode' | 'southNode'): unknown {
  try {
    // Calculate lunar nodes using simplified Meeus formula
    const jd = dateToJulian(date);
    const T = (jd - 2451545.0) / 36525;

    // Mean longitude of ascending node (Meeus formula)
    let Omega = 125.04452 - 1934.136261 * T + 0.0020708 * T*T + T*T*T/450000;

    // Normalize to 0-360 range
    Omega = ((Omega % 360) + 360) % 360;

    // North node is opposite of Omega, South node is same as Omega
    const longitude = nodeType === 'northNode' ? (Omega + 180) % 360 : Omega;

    // Get zodiac sign
    const { sign, degree } = getLongitudeToZodiacSign(longitude);

    return {
      sign,
      degree,
      exactLongitude: longitude,
      isRetrograde: true // Both nodes are always retrograde
    };
  } catch (error) {
    logger.error(`Error calculating ${nodeType}:`, error);

    // Return fixed values from March 2025
    if (nodeType === 'northNode') {
      return { sign: 'pisces', degree: 26.54, exactLongitude: 356.54, isRetrograde: true };
    } else {
      return { sign: 'virgo', degree: 26.54, exactLongitude: 176.54, isRetrograde: true };
    }
  }
}
```

## Planetary Dignity Calculations

### 1. Dignity System Implementation

```typescript
// src/calculations/core/planetaryInfluences.ts
export const PLANETARY_DIGNITIES = {
  Sun: {
    rulership: ['leo'],
    exaltation: ['aries'],
    detriment: ['aquarius'],
    fall: ['libra']
  },
  moon: {
    rulership: ['cancer'],
    exaltation: ['taurus'],
    detriment: ['capricorn'],
    fall: ['scorpio']
  },
  Mercury: {
    rulership: ['gemini', 'virgo'],
    exaltation: ['virgo'],
    detriment: ['sagittarius', 'pisces'],
    fall: ['pisces']
  },
  Venus: {
    rulership: ['taurus', 'libra'],
    exaltation: ['pisces'],
    detriment: ['aries', 'scorpio'],
    fall: ['virgo']
  },
  Mars: {
    rulership: ['aries', 'scorpio'],
    exaltation: ['capricorn'],
    detriment: ['taurus', 'libra'],
    fall: ['cancer']
  },
  Jupiter: {
    rulership: ['sagittarius', 'pisces'],
    exaltation: ['cancer'],
    detriment: ['gemini', 'virgo'],
    fall: ['capricorn']
  },
  Saturn: {
    rulership: ['capricorn', 'aquarius'],
    exaltation: ['libra'],
    detriment: ['cancer', 'leo'],
    fall: ['aries']
  }
};

export function calculatePlanetaryDignity(planet: string, sign: string): {
  type: 'rulership' | 'exaltation' | 'detriment' | 'fall' | 'neutral';
  modifier: number;
} {
  const planetKey = planet?.toLowerCase();
  const signKey = sign?.toLowerCase();
  const dignities = PLANETARY_DIGNITIES[planetKey as keyof typeof PLANETARY_DIGNITIES];

  if (!dignities) {
    return { type: 'neutral', modifier: 1.0 };
  }

  if (dignities.rulership?.includes(signKey)) {
    return { type: 'rulership', modifier: 1.5 };
  }
  if (dignities.exaltation?.includes(signKey)) {
    return { type: 'exaltation', modifier: 1.3 };
  }
  if (dignities.detriment?.includes(signKey)) {
    return { type: 'detriment', modifier: 0.7 };
  }
  if (dignities.fall?.includes(signKey)) {
    return { type: 'fall', modifier: 0.5 };
  }

  return { type: 'neutral', modifier: 1.0 };
}
```

### 2. Planetary Strength Calculation

```typescript
export function calculatePlanetaryStrength(
  planet: string,
  position: PlanetaryPosition,
  aspects?: Array<{ planet1: string; planet2: string; type: string; orb: number }>
): number {
  let strength = 1.0;

  // Base strength from dignity
  if (position.sign) {
    const dignity = calculatePlanetaryDignity(planet, position.sign);
    strength *= dignity.modifier;
  }

  // Adjust for retrograde motion
  if (position.isRetrograde) {
    strength *= 0.8;
  }

  // Adjust for aspects (if provided)
  if (aspects) {
    const planetAspects = aspects.filter(aspect =>
      aspect.planet1?.toLowerCase() === planet?.toLowerCase() ||
      aspect.planet2?.toLowerCase() === planet?.toLowerCase()
    );

    planetAspects.forEach(aspect => {
      switch (aspect.type) {
        case 'conjunction':
          strength *= 1.2;
          break;
        case 'trine':
          strength *= 1.15;
          break;
        case 'sextile':
          strength *= 1.1;
          break;
        case 'square':
          strength *= 0.9;
          break;
        case 'opposition':
          strength *= 0.85;
          break;
      }
    });
  }

  return Math.max(0.3, Math.min(2.0, strength));
}
```

## Elemental Influence Calculations

### 1. Planetary Elemental Mappings

```typescript
export const PLANETARY_ELEMENTAL_MAPPINGS = {
  diurnal: {
    Sun: 'Fire',
    moon: 'Water',
    Mercury: 'Air',
    Venus: 'Water',
    Mars: 'Fire',
    Jupiter: 'Air',
    Saturn: 'Air',
    Uranus: 'Water',
    Neptune: 'Water',
    Pluto: 'Earth'
  },
  nocturnal: {
    Sun: 'Fire',
    moon: 'Water',
    Mercury: 'Earth',
    Venus: 'Earth',
    Mars: 'Water',
    Jupiter: 'Fire',
    Saturn: 'Earth',
    Uranus: 'Air',
    Neptune: 'Water',
    Pluto: 'Water'
  }
} as const;

export function getPlanetaryElementalInfluence(
  planet: string,
  isDaytime: boolean = true
): keyof ElementalProperties {
  const planetKey = planet?.toLowerCase();
  const timeKey = isDaytime ? 'diurnal' : 'nocturnal';

  return PLANETARY_ELEMENTAL_MAPPINGS[timeKey][planetKey as keyof typeof PLANETARY_ELEMENTAL_MAPPINGS.diurnal] as keyof ElementalProperties || 'Fire';
}
```

### 2. Comprehensive Planetary Influences

```typescript
export function calculatePlanetaryInfluences(
  planetaryPositions: { [key: string]: PlanetaryPosition },
  isDaytime: boolean = true,
  currentDate?: Date
): {
  alchemicalInfluences: { [key: string]: number };
  elementalInfluences: { [key: string]: number };
  dominantPlanets: Array<{ planet: string; strength: number; element: Element }>;
  planetaryHours?: { dayRuler: string; hourRuler: string; influence: number };
} {
  const alchemicalInfluences: { [key: string]: number } = {
    Spirit: 0,
    Essence: 0,
    Matter: 0,
    Substance: 0
  };

  const elementalInfluences: { [key: string]: number } = {
    Fire: 0, Water: 0, Air: 0, Earth: 0
  };

  const dominantPlanets: Array<{ planet: string; strength: number; element: Element }> = [];

  // Process each planet
  Object.entries(planetaryPositions || {}).forEach(([planet, position]) => {
    const planetKey = planet?.toLowerCase();
    const mapping = PLANETARY_ALCHEMICAL_MAPPINGS[planetKey as keyof typeof PLANETARY_ALCHEMICAL_MAPPINGS];

    if (mapping) {
      // Calculate planetary strength
      const strength = calculatePlanetaryStrength(planet, position);

      // Add to alchemical influences
      alchemicalInfluences.Spirit += mapping.Spirit * strength;
      alchemicalInfluences.Essence += mapping.Essence * strength;
      alchemicalInfluences.Matter += mapping.Matter * strength;
      alchemicalInfluences.Substance += mapping.Substance * strength;

      // Get elemental influence
      const element = getPlanetaryElementalInfluence(planet, isDaytime);
      elementalInfluences[element] += strength;

      // Add to dominant planets list
      dominantPlanets.push({
        planet,
        strength,
        element: element as Element
      });
    }
  });

  // Sort dominant planets by strength
  dominantPlanets.sort((a, b) => b.strength - a.strength);

  // Calculate planetary hours if date provided
  let planetaryHours;
  if (currentDate) {
    planetaryHours = calculatePlanetaryHoursInfluence(currentDate);
  }

  return {
    alchemicalInfluences,
    elementalInfluences,
    dominantPlanets,
    planetaryHours
  };
}
```

## Testing Planetary Calculations

### 1. Position Validation Tests

```typescript
describe('Planetary Position Validation', () => {
  test('should validate planetary positions correctly', async () => {
    const positions = await getReliablePlanetaryPositions();

    // Check all required planets are present
    const requiredPlanets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
    requiredPlanets.forEach(planet => {
      expect(positions[planet]).toBeDefined();
      expect(positions[planet].sign).toMatch(/^(aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces)$/);
      expect(positions[planet].degree).toBeGreaterThanOrEqual(0);
      expect(positions[planet].degree).toBeLessThan(30);
      expect(positions[planet].exactLongitude).toBeGreaterThanOrEqual(0);
      expect(positions[planet].exactLongitude).toBeLessThan(360);
    });
  });

  test('should handle retrograde status correctly', async () => {
    const positions = await getReliablePlanetaryPositions();

    // Mercury can be retrograde
    if (positions.mercury?.isRetrograde !== undefined) {
      expect(typeof positions.mercury.isRetrograde).toBe('boolean');
    }

    // Sun and Moon are never retrograde
    expect(positions.sun?.isRetrograde).toBeFalsy();
    expect(positions.moon?.isRetrograde).toBeFalsy();
  });
});
```

### 2. Dignity Calculation Tests

```typescript
describe('Planetary Dignity Calculations', () => {
  test('should calculate dignity modifiers correctly', () => {
    // Test rulership
    const sunInLeo = calculatePlanetaryDignity('Sun', 'leo');
    expect(sunInLeo.type).toBe('rulership');
    expect(sunInLeo.modifier).toBe(1.5);

    // Test exaltation
    const sunInAries = calculatePlanetaryDignity('Sun', 'aries');
    expect(sunInAries.type).toBe('exaltation');
    expect(sunInAries.modifier).toBe(1.3);

    // Test detriment
    const sunInAquarius = calculatePlanetaryDignity('Sun', 'aquarius');
    expect(sunInAquarius.type).toBe('detriment');
    expect(sunInAquarius.modifier).toBe(0.7);

    // Test fall
    const sunInLibra = calculatePlanetaryDignity('Sun', 'libra');
    expect(sunInLibra.type).toBe('fall');
    expect(sunInLibra.modifier).toBe(0.5);
  });
});
```

### 3. Edge Case Testing

```typescript
describe('Planetary Calculation Edge Cases', () => {
  test('should handle missing planet data gracefully', () => {
    const emptyPositions = {};
    const influences = calculatePlanetaryInfluences(emptyPositions);

    expect(influences.alchemicalInfluences.Spirit).toBe(0);
    expect(influences.elementalInfluences.Fire).toBe(0);
    expect(influences.dominantPlanets).toHaveLength(0);
  });

  test('should handle invalid longitude values', () => {
    const invalidLongitude = 400; // Invalid - should be 0-360
    const result = getLongitudeToZodiacSign(invalidLongitude);

    expect(result.sign).toMatch(/^(aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces)$/);
    expect(result.degree).toBeGreaterThanOrEqual(0);
    expect(result.degree).toBeLessThan(30);
  });
});
```

## Best Practices

### 1. Always Use Fallbacks

```typescript
// ✅ CORRECT: Always provide fallback data
async function safeGetPlanetaryPositions(): Promise<PlanetaryPositions> {
  try {
    const positions = await getReliablePlanetaryPositions();
    return validateAndConvertPositions(positions);
  } catch (error) {
    logger.error('Failed to get planetary positions, using fallback', error);
    return getFallbackPositions();
  }
}
```

### 2. Validate All Inputs

```typescript
// ✅ CORRECT: Validate planetary position data
function validatePlanetaryPosition(position: unknown): position is PlanetaryPosition {
  if (!position || typeof position !== 'object') return false;

  const pos = position as Record<string, unknown>;

  return (
    typeof pos.sign === 'string' &&
    typeof pos.degree === 'number' &&
    typeof pos.exactLongitude === 'number' &&
    pos.degree >= 0 && pos.degree < 30 &&
    pos.exactLongitude >= 0 && pos.exactLongitude < 360
  );
}
```

### 3. Cache Expensive Calculations

```typescript
// ✅ CORRECT: Cache planetary calculations
const positionCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

function getCachedPositions(date: Date): any | null {
  const key = date.toISOString().split('T')[0];
  const cached = positionCache.get(key);

  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }

  return null;
}
```

## Common Pitfalls to Avoid

### 1. Don't Hardcode Planetary Positions

```typescript
// ❌ WRONG: Hardcoded positions
function getCurrentSunSign(): string {
  return 'leo'; // This will be wrong most of the time!
}

// ✅ CORRECT: Calculate dynamically
async function getCurrentSunSign(): Promise<string> {
  const positions = await getReliablePlanetaryPositions();
  return positions.sun?.sign || 'aries';
}
```

### 2. Don't Ignore Retrograde Status

```typescript
// ❌ WRONG: Ignoring retrograde
function calculatePlanetaryInfluence(planet: string, position: PlanetaryPosition): number {
  return 1.0; // Same influence regardless of retrograde
}

// ✅ CORRECT: Account for retrograde
function calculatePlanetaryInfluence(planet: string, position: PlanetaryPosition): number {
  let influence = 1.0;
  if (position.isRetrograde) {
    influence *= 0.8; // Reduce influence when retrograde
  }
  return influence;
}
```

### 3. Don't Skip Error Handling

```typescript
// ❌ WRONG: No error handling
async function getPlanetaryData(): Promise<any> {
  const response = await fetch('/api/planets');
  return response.json();
}

// ✅ CORRECT: Proper error handling
async function getPlanetaryData(): Promise<any> {
  try {
    const response = await fetch('/api/planets');
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    logger.error('Failed to fetch planetary data', error);
    return getFallbackPlanetaryData();
  }
}
```

## Related Files

- `src/utils/reliableAstronomy.ts` - Main planetary calculation functions
- `src/calculations/core/planetaryInfluences.ts` - Planetary influence
  calculations
- `src/utils/__tests__/planetaryValidation.test.ts` - Planetary validation tests
- `src/data/planets/` - Planetary transit data files
