# 🧪 Astronomical Calculations Testing Guide

## Overview

This guide provides comprehensive testing strategies and patterns for
astronomical calculations in WhatToEatNext. It covers unit testing, integration
testing, validation testing, and performance testing for all astrological
computation systems.

## Testing Philosophy

### Core Testing Principles

1. **Accuracy First**: All astronomical calculations must be tested for accuracy
   against known values
2. **Fallback Reliability**: Test that fallback mechanisms work when primary
   data sources fail
3. **Edge Case Coverage**: Test boundary conditions, invalid inputs, and extreme
   scenarios
4. **Performance Validation**: Ensure calculations complete within acceptable
   time limits
5. **Data Integrity**: Validate that all astronomical data maintains consistency

## Unit Testing Patterns

### 1. Planetary Position Testing

```typescript
// src/__tests__/planetaryPositions.test.ts
describe('Planetary Position Calculations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should calculate accurate Sun position for known date', async () => {
    // Test with summer solstice 2024
    const solsticeDate = new Date('2024-06-21T00:00:00Z');
    const positions = await getReliablePlanetaryPositions(solsticeDate);

    // Sun should be at beginning of Cancer (around 0°)
    expect(positions.sun).toBeDefined();
    expect(positions.sun.sign).toBe('cancer');
    expect(positions.sun.degree).toBeCloseTo(0, 1); // Within 1 degree
    expect(positions.sun.exactLongitude).toBeCloseTo(90, 5); // Around 90° longitude
  });

  test('should validate all planetary positions have required properties', async () => {
    const positions = await getReliablePlanetaryPositions();

    const requiredPlanets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

    requiredPlanets.forEach(planet => {
      expect(positions[planet]).toBeDefined();
      expect(positions[planet]).toHaveProperty('sign');
      expect(positions[planet]).toHaveProperty('degree');
      expect(positions[planet]).toHaveProperty('exactLongitude');
      expect(positions[planet]).toHaveProperty('isRetrograde');

      // Validate sign is valid zodiac sign
      const validSigns = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
                          'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
      expect(validSigns).toContain(positions[planet].sign);

      // Validate degree is within valid range
      expect(positions[planet].degree).toBeGreaterThanOrEqual(0);
      expect(positions[planet].degree).toBeLessThan(30);

      // Validate exact longitude is within valid range
      expect(positions[planet].exactLongitude).toBeGreaterThanOrEqual(0);
      expect(positions[planet].exactLongitude).toBeLessThan(360);
    });
  });

  test('should handle retrograde status correctly', async () => {
    const positions = await getReliablePlanetaryPositions();

    // Sun and Moon are never retrograde
    expect(positions.sun.isRetrograde).toBe(false);
    expect(positions.moon.isRetrograde).toBe(false);

    // Other planets can be retrograde
    ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'].forEach(planet => {
      expect(typeof positions[planet].isRetrograde).toBe('boolean');
    });
  });

  test('should handle API failures gracefully', async () => {
    // Mock all API calls to fail
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

    const positions = await getReliablePlanetaryPositions();

    // Should return fallback data
    expect(positions).toBeDefined();
    expect(Object.keys(positions)).toHaveLength(12); // All planets + nodes

    // Fallback data should be valid
    expect(positions.sun.sign).toBe('aries');
    expect(positions.sun.degree).toBe(8.5);
  });
});
```

### 2. Lunar Phase Testing

```typescript
describe('Lunar Phase Calculations', () => {
  test('should calculate correct lunar phase for known new moon', async () => {
    // Known new moon date: January 21, 2023
    const newMoonDate = new Date('2023-01-21T20:53:00Z');
    const phase = await calculateLunarPhase(newMoonDate);

    expect(phase).toBeCloseTo(0, 0.1); // Should be very close to 0 (new moon)
  });

  test('should calculate correct lunar phase for known full moon', async () => {
    // Known full moon date: February 5, 2023
    const fullMoonDate = new Date('2023-02-05T18:29:00Z');
    const phase = await calculateLunarPhase(fullMoonDate);

    expect(phase).toBeCloseTo(0.5, 0.1); // Should be close to 0.5 (full moon)
  });

  test('should handle phase boundaries correctly', () => {
    const testCases = [
      { phase: 0, expected: 'new moon' },
      { phase: 0.01, expected: 'new moon' },
      { phase: 0.125, expected: 'waxing crescent' },
      { phase: 0.25, expected: 'first quarter' },
      { phase: 0.375, expected: 'waxing gibbous' },
      { phase: 0.5, expected: 'full moon' },
      { phase: 0.625, expected: 'waning gibbous' },
      { phase: 0.75, expected: 'last quarter' },
      { phase: 0.875, expected: 'waning crescent' },
      { phase: 0.99, expected: 'waning crescent' }
    ];

    testCases.forEach(({ phase, expected }) => {
      const phaseName = getLunarPhaseName(phase);
      expect(phaseName).toBe(expected);
    });
  });

  test('should use fallback calculation when API fails', async () => {
    // Mock API failure
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('API Error'));

    const phase = await calculateLunarPhase();

    // Should return a valid phase (0-1)
    expect(phase).toBeGreaterThanOrEqual(0);
    expect(phase).toBeLessThanOrEqual(1);
  });
});
```

### 3. Elemental Calculation Testing

```typescript
describe('Elemental Calculations', () => {
  test('should calculate elemental properties from planetary positions', () => {
    const mockPositions = {
      sun: { sign: 'leo', degree: 15, exactLongitude: 135, isRetrograde: false },
      moon: { sign: 'cancer', degree: 5, exactLongitude: 95, isRetrograde: false },
      mercury: { sign: 'virgo', degree: 10, exactLongitude: 160, isRetrograde: false }
    };

    const elements = calculateBaseElementalProperties(mockPositions);

    // Should have all four elements
    expect(elements).toHaveProperty('Fire');
    expect(elements).toHaveProperty('Water');
    expect(elements).toHaveProperty('Earth');
    expect(elements).toHaveProperty('Air');

    // Should sum to 1.0 (normalized)
    const sum = Object.values(elements).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 3);

    // Fire should be dominant (Leo Sun)
    expect(elements.Fire).toBeGreaterThan(elements.Water);
    expect(elements.Fire).toBeGreaterThan(elements.Earth);
    expect(elements.Fire).toBeGreaterThan(elements.Air);
  });

  test('should respect elemental compatibility principles', () => {
    // Test self-reinforcement
    const fireProps1 = { Fire: 0.8, Water: 0.1, Earth: 0.1, Air: 0.0 };
    const fireProps2 = { Fire: 0.7, Water: 0.2, Earth: 0.1, Air: 0.0 };

    const sameElementCompatibility = calculateElementalCompatibility(fireProps1, fireProps2);
    expect(sameElementCompatibility).toBeGreaterThanOrEqual(0.9);

    // Test different elements still have good compatibility
    const waterProps = { Fire: 0.1, Water: 0.8, Earth: 0.1, Air: 0.0 };
    const differentElementCompatibility = calculateElementalCompatibility(fireProps1, waterProps);
    expect(differentElementCompatibility).toBeGreaterThanOrEqual(0.7);
    expect(differentElementCompatibility).toBeLessThan(sameElementCompatibility);
  });

  test('should never return compatibility below 0.7', () => {
    // Test extreme opposite combinations
    const extremeCombinations = [
      [{ Fire: 1, Water: 0, Earth: 0, Air: 0 }, { Fire: 0, Water: 1, Earth: 0, Air: 0 }],
      [{ Fire: 0, Water: 0, Earth: 1, Air: 0 }, { Fire: 0, Water: 0, Earth: 0, Air: 1 }]
    ];

    extremeCombinations.forEach(([props1, props2]) => {
      const compatibility = calculateElementalCompatibility(props1, props2);
      expect(compatibility).toBeGreaterThanOrEqual(0.7);
    });
  });
});
```

### 4. Alchemical Calculation Testing

```typescript
describe('Alchemical Calculations', () => {
  test('should calculate thermodynamic metrics correctly', () => {
    const alchemicalCounts = { Spirit: 3, Essence: 2, Matter: 2, Substance: 1 };
    const elementalCounts = { Fire: 3, Water: 2, Earth: 2, Air: 1 };

    const metrics = calculateThermodynamicMetrics(alchemicalCounts, elementalCounts);

    // All metrics should be positive numbers
    expect(metrics.heat).toBeGreaterThan(0);
    expect(metrics.entropy).toBeGreaterThan(0);
    expect(metrics.reactivity).toBeGreaterThan(0);
    expect(metrics.kalchm).toBeGreaterThan(0);

    // Greg's Energy can be negative
    expect(typeof metrics.gregsEnergy).toBe('number');

    // Monica constant should be a number (can be NaN in edge cases)
    expect(typeof metrics.monica).toBe('number');
  });

  test('should handle zero values gracefully', () => {
    const zeroCounts = { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 };
    const zeroElements = { Fire: 0, Water: 0, Earth: 0, Air: 0 };

    expect(() => {
      const metrics = calculateThermodynamicMetrics(zeroCounts, zeroElements);
      // Should not throw errors
      expect(typeof metrics.heat).toBe('number');
      expect(typeof metrics.entropy).toBe('number');
      expect(typeof metrics.reactivity).toBe('number');
    }).not.toThrow();
  });

  test('should calculate Kalchm constant correctly', () => {
    const alchemicalCounts = { Spirit: 2, Essence: 1, Matter: 1, Substance: 1 };
    const elementalCounts = { Fire: 2, Water: 1, Earth: 1, Air: 1 };

    const metrics = calculateThermodynamicMetrics(alchemicalCounts, elementalCounts);

    // Kalchm = (Spirit^Spirit * Essence^Essence) / (Matter^Matter * Substance^Substance)
    // = (2^2 * 1^1) / (1^1 * 1^1) = 4 / 1 = 4
    expect(metrics.kalchm).toBeCloseTo(4, 2);
  });
});
```

## Integration Testing

### 1. End-to-End Astrological Flow Testing

```typescript
describe('Astrological Integration Flow', () => {
  test('should complete full astrological calculation flow', async () => {
    // Test the complete flow from planetary positions to recommendations
    const testDate = new Date('2024-06-21T12:00:00Z'); // Summer solstice

    // Step 1: Get planetary positions
    const positions = await getReliablePlanetaryPositions(testDate);
    expect(positions).toBeDefined();

    // Step 2: Calculate elemental properties
    const elementalProps = calculateBaseElementalProperties(positions);
    expect(elementalProps).toBeDefined();
    expect(Object.values(elementalProps).reduce((a, b) => a + b, 0)).toBeCloseTo(1.0, 3);

    // Step 3: Calculate alchemical properties
    const alchemicalCounts = calculateAlchemicalCounts(positions);
    const elementalCounts = convertElementalPropsToCount(elementalProps);
    const metrics = calculateThermodynamicMetrics(alchemicalCounts, elementalCounts);
    expect(metrics).toBeDefined();

    // Step 4: Generate recommendations
    const astrologicalState = {
      planetaryPositions: positions,
      elementalProperties: elementalProps,
      thermodynamicMetrics: metrics
    };

    const recommendations = await generateAstrologicalRecommendations(astrologicalState);
    expect(recommendations).toBeDefined();
    expect(recommendations.ingredients).toBeInstanceOf(Array);
    expect(recommendations.cookingMethods).toBeInstanceOf(Array);
  });

  test('should handle partial data gracefully', async () => {
    // Test with incomplete planetary data
    const partialPositions = {
      sun: { sign: 'leo', degree: 15, exactLongitude: 135, isRetrograde: false },
      moon: { sign: 'cancer', degree: 5, exactLongitude: 95, isRetrograde: false }
      // Missing other planets
    };

    const elementalProps = calculateBaseElementalProperties(partialPositions);
    expect(elementalProps).toBeDefined();

    // Should still produce valid results
    const sum = Object.values(elementalProps).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 3);
  });
});
```

### 2. API Integration Testing

```typescript
describe('API Integration', () => {
  test('should handle NASA JPL Horizons API correctly', async () => {
    // Mock successful API response
    const mockHorizonsResponse = {
      result: `
        Date__(UT)__HR:MN     R.A._____(ICRF)_____DEC    APmag   S-brt             delta      deldot     S-O-T /r     S-T-O  Sky_motion  Sky_mot_PA  RelVel-ANG  Lun_Sky_Brt  sky_SNR
        2024-Jun-21 00:00     05 59 58.31 +23 26 21.4   -26.74    4.63  1.01602424205   0.0000000   0.0000 /T   0.0000   n.a.        n.a.         n.a.           n.a.     n.a.
      `
    };

    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockHorizonsResponse)
    } as Response);

    const positions = await fetchHorizonsData(new Date('2024-06-21'));
    expect(positions).toBeDefined();
  });

  test('should fallback when all APIs fail', async () => {
    // Mock all API calls to fail
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

    const positions = await getReliablePlanetaryPositions();

    // Should return fallback data
    expect(positions).toBeDefined();
    expect(positions.sun).toBeDefined();
    expect(positions.sun.sign).toBe('aries'); // Fallback position
  });

  test('should respect API timeout limits', async () => {
    // Mock slow API response
    jest.spyOn(global, 'fetch').mockImplementation(() =>
      new Promise(resolve => setTimeout(resolve, 10000)) // 10 second delay
    );

    const startTime = Date.now();
    const positions = await getReliablePlanetaryPositions();
    const duration = Date.now() - startTime;

    // Should timeout and use fallback within 5 seconds
    expect(duration).toBeLessThan(6000);
    expect(positions).toBeDefined();
  });
});
```

## Performance Testing

### 1. Calculation Speed Tests

```typescript
describe('Performance Tests', () => {
  test('planetary position calculations should complete within 2 seconds', async () => {
    const startTime = Date.now();
    const positions = await getReliablePlanetaryPositions();
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(2000);
    expect(positions).toBeDefined();
  });

  test('elemental calculations should be fast', () => {
    const mockPositions = generateMockPlanetaryPositions();

    const startTime = performance.now();
    const elements = calculateBaseElementalProperties(mockPositions);
    const duration = performance.now() - startTime;

    expect(duration).toBeLessThan(100); // Should complete in under 100ms
    expect(elements).toBeDefined();
  });

  test('alchemical calculations should handle large datasets', () => {
    const largeCounts = { Spirit: 1000, Essence: 1000, Matter: 1000, Substance: 1000 };
    const largeElements = { Fire: 1000, Water: 1000, Earth: 1000, Air: 1000 };

    const startTime = performance.now();
    const metrics = calculateThermodynamicMetrics(largeCounts, largeElements);
    const duration = performance.now() - startTime;

    expect(duration).toBeLessThan(50); // Should complete quickly even with large numbers
    expect(metrics).toBeDefined();
    expect(isFinite(metrics.heat)).toBe(true);
    expect(isFinite(metrics.entropy)).toBe(true);
  });
});
```

### 2. Memory Usage Tests

```typescript
describe('Memory Usage Tests', () => {
  test('should not leak memory during repeated calculations', async () => {
    const initialMemory = process.memoryUsage().heapUsed;

    // Perform many calculations
    for (let i = 0; i < 1000; i++) {
      const positions = await getReliablePlanetaryPositions();
      const elements = calculateBaseElementalProperties(positions);
      // Force garbage collection opportunity
      if (i % 100 === 0 && global.gc) {
        global.gc();
      }
    }

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;

    // Memory increase should be reasonable (less than 50MB)
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
  });
});
```

## Validation Testing

### 1. Data Consistency Tests

```typescript
describe('Data Consistency Validation', () => {
  test('should validate lunar nodes are opposite', async () => {
    const positions = await getReliablePlanetaryPositions();

    const northNode = positions.northNode;
    const southNode = positions.southNode;

    expect(northNode).toBeDefined();
    expect(southNode).toBeDefined();

    // Nodes should be approximately 180 degrees apart
    const longitudeDiff = Math.abs(northNode.exactLongitude - southNode.exactLongitude);
    const oppositeDiff = Math.min(longitudeDiff, 360 - longitudeDiff);
    expect(oppositeDiff).toBeCloseTo(180, 5); // Within 5 degrees
  });

  test('should validate planetary positions are within valid ranges', async () => {
    const positions = await getReliablePlanetaryPositions();

    Object.entries(positions).forEach(([planet, position]) => {
      // Degree should be 0-29.99
      expect(position.degree).toBeGreaterThanOrEqual(0);
      expect(position.degree).toBeLessThan(30);

      // Exact longitude should be 0-359.99
      expect(position.exactLongitude).toBeGreaterThanOrEqual(0);
      expect(position.exactLongitude).toBeLessThan(360);

      // Sign should be valid
      const validSigns = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
                          'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
      expect(validSigns).toContain(position.sign);
    });
  });

  test('should validate elemental properties sum to 1.0', () => {
    const mockPositions = generateMockPlanetaryPositions();
    const elements = calculateBaseElementalProperties(mockPositions);

    const sum = Object.values(elements).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 6); // Very precise check
  });
});
```

### 2. Edge Case Testing

```typescript
describe('Edge Case Testing', () => {
  test('should handle date at epoch boundaries', async () => {
    const epochDates = [
      new Date('1970-01-01T00:00:00Z'), // Unix epoch
      new Date('2000-01-01T00:00:00Z'), // Y2K
      new Date('2038-01-19T03:14:07Z')  // 32-bit timestamp limit
    ];

    for (const date of epochDates) {
      const positions = await getReliablePlanetaryPositions(date);
      expect(positions).toBeDefined();
      expect(Object.keys(positions)).toHaveLength(12);
    }
  });

  test('should handle extreme future dates', async () => {
    const futureDate = new Date('2100-12-31T23:59:59Z');
    const positions = await getReliablePlanetaryPositions(futureDate);

    expect(positions).toBeDefined();
    // Should use fallback data for extreme dates
    expect(positions.sun.sign).toBe('aries');
  });

  test('should handle invalid input gracefully', () => {
    const invalidInputs = [null, undefined, {}, [], 'invalid', NaN];

    invalidInputs.forEach(input => {
      expect(() => {
        calculateBaseElementalProperties(input as any);
      }).not.toThrow();
    });
  });
});
```

## Mock Data and Test Utilities

### 1. Mock Data Generators

```typescript
// Test utilities for generating mock data
export function generateMockPlanetaryPositions(): Record<string, PlanetaryPosition> {
  return {
    sun: { sign: 'leo', degree: 15.5, exactLongitude: 135.5, isRetrograde: false },
    moon: { sign: 'cancer', degree: 8.2, exactLongitude: 98.2, isRetrograde: false },
    mercury: { sign: 'virgo', degree: 22.1, exactLongitude: 172.1, isRetrograde: true },
    venus: { sign: 'libra', degree: 5.7, exactLongitude: 185.7, isRetrograde: false },
    mars: { sign: 'scorpio', degree: 12.3, exactLongitude: 222.3, isRetrograde: false },
    jupiter: { sign: 'sagittarius', degree: 28.9, exactLongitude: 268.9, isRetrograde: false },
    saturn: { sign: 'capricorn', degree: 3.4, exactLongitude: 273.4, isRetrograde: false },
    uranus: { sign: 'aquarius', degree: 18.6, exactLongitude: 318.6, isRetrograde: false },
    neptune: { sign: 'pisces', degree: 25.1, exactLongitude: 355.1, isRetrograde: false },
    pluto: { sign: 'aries', degree: 1.8, exactLongitude: 1.8, isRetrograde: false },
    northNode: { sign: 'taurus', degree: 14.2, exactLongitude: 44.2, isRetrograde: true },
    southNode: { sign: 'scorpio', degree: 14.2, exactLongitude: 224.2, isRetrograde: true }
  };
}

export function generateMockElementalProperties(): ElementalProperties {
  return { Fire: 0.3, Water: 0.25, Earth: 0.25, Air: 0.2 };
}
```

### 2. Test Assertion Helpers

```typescript
// Custom Jest matchers for astronomical testing
expect.extend({
  toBeValidZodiacSign(received: string) {
    const validSigns = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
                        'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
    const pass = validSigns.includes(received);

    return {
      message: () => `expected ${received} to be a valid zodiac sign`,
      pass
    };
  },

  toBeValidDegree(received: number) {
    const pass = received >= 0 && received < 30;

    return {
      message: () => `expected ${received} to be a valid degree (0-29.99)`,
      pass
    };
  },

  toBeNormalizedElementalProperties(received: ElementalProperties) {
    const sum = Object.values(received).reduce((a, b) => a + b, 0);
    const pass = Math.abs(sum - 1.0) < 0.001;

    return {
      message: () => `expected elemental properties to sum to 1.0, got ${sum}`,
      pass
    };
  }
});
```

## Test Configuration

### 1. Jest Configuration for Astronomical Tests

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testTimeout: 30000, // 30 seconds for API calls
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  collectCoverageFrom: [
    'src/calculations/**/*.ts',
    'src/utils/**/*.ts',
    '!**/*.d.ts',
    '!**/__tests__/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### 2. Test Setup File

```typescript
// src/setupTests.ts
import { jest } from '@jest/globals';

// Mock console methods to reduce test noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Mock fetch for API tests
global.fetch = jest.fn();

// Setup test timeout
jest.setTimeout(30000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
```

## Continuous Integration Testing

### 1. GitHub Actions Configuration

```yaml
# .github/workflows/astronomical-tests.yml
name: Astronomical Calculations Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run astronomical calculation tests
      run: npm run test:astronomical

    - name: Run integration tests
      run: npm run test:integration

    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
```

## Best Practices Summary

1. **Test Known Values**: Always test against known astronomical events and
   dates
2. **Mock External APIs**: Use mocks for external API calls to ensure test
   reliability
3. **Test Edge Cases**: Include boundary conditions and invalid inputs
4. **Performance Testing**: Ensure calculations complete within acceptable time
   limits
5. **Data Validation**: Validate all astronomical data for consistency and
   accuracy
6. **Fallback Testing**: Test that fallback mechanisms work when primary sources
   fail
7. **Integration Testing**: Test complete flows from data input to final
   recommendations
8. **Continuous Testing**: Run tests automatically on code changes

## Related Files

- `src/__tests__/culinaryAstrology.test.ts` - Culinary astrology tests
- `src/__tests__/astrologize-integration.test.ts` - API integration tests
- `src/utils/__tests__/planetaryValidation.test.ts` - Planetary validation tests
- `src/__tests__/utils/elementalCompatibility.test.ts` - Elemental compatibility
  tests
