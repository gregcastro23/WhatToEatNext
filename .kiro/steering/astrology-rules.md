# Astrological Calculation Guidelines

## Overview

This document establishes the core principles and guidelines for astrological calculations within the WhatToEatNext system. These rules ensure accuracy, reliability, and consistency across all astronomical computations that power our culinary recommendations.

## Planetary Position System

### Primary Calculation Sources

**Hierarchy of Data Sources:**
1. **NASA JPL Horizons API** - Primary source for highest accuracy
2. **Public Astronomy APIs** - Secondary source with Swiss Ephemeris data
3. **TimeAndDate.com API** - Tertiary source with authentication
4. **Local Fallback Data** - Cached positions from March 28, 2025

**Implementation Pattern:**
```typescript
// Always use the reliable astronomy utility
import { getReliablePlanetaryPositions } from '@/utils/reliableAstronomy';

async function calculatePlanetaryInfluences(date: Date = new Date()) {
  try {
    const positions = await getReliablePlanetaryPositions(date);
    return processPositions(positions);
  } catch (error) {
    logger.warn('Using fallback planetary positions', error);
    return processPositions(getMarch2025Positions());
  }
}
```

### Transit Date Validation

**Validation Requirements:**
- All planetary positions MUST be validated against stored transit dates
- Transit dates are stored in `/src/data/planets/[planet].ts` files
- Validation occurs before any culinary calculations
- Invalid dates trigger fallback to cached positions

**Transit Date Structure:**
```typescript
interface TransitDates {
  [sign: string]: {
    Start: string; // ISO date format YYYY-MM-DD
    End: string;   // ISO date format YYYY-MM-DD
  };
  RetrogradePhases?: {
    [phase: string]: {
      Start: string;
      End: string;
      Peak?: string;
    };
  };
}
```

**Validation Implementation:**
```typescript
function validateTransitDate(planet: string, date: Date, sign: string): boolean {
  const planetData = require(`@/data/planets/${planet.toLowerCase()}`);
  const transitDates = planetData.TransitDates;
  
  if (!transitDates || !transitDates[sign]) {
    logger.warn(`No transit data for ${planet} in ${sign}`);
    return false;
  }
  
  const startDate = new Date(transitDates[sign].Start);
  const endDate = new Date(transitDates[sign].End);
  
  return date >= startDate && date <= endDate;
}
```

### Fallback Mechanisms

**Multi-Tier Fallback Strategy:**
1. **API Timeout Fallback** - 5-second timeout on all external API calls
2. **Cache Fallback** - 6-hour cache duration for successful API responses
3. **Local Data Fallback** - Accurate positions from March 28, 2025
4. **Hardcoded Minimal Fallback** - Basic positions for system stability

**Fallback Position Data (March 28, 2025):**
```typescript
const RELIABLE_POSITIONS = {
  sun: { sign: 'aries', degree: 8.5, exactLongitude: 8.5, isRetrograde: false },
  moon: { sign: 'aries', degree: 1.57, exactLongitude: 1.57, isRetrograde: false },
  mercury: { sign: 'aries', degree: 0.85, exactLongitude: 0.85, isRetrograde: true },
  venus: { sign: 'pisces', degree: 29.08, exactLongitude: 359.08, isRetrograde: true },
  mars: { sign: 'cancer', degree: 22.63, exactLongitude: 112.63, isRetrograde: false },
  jupiter: { sign: 'gemini', degree: 15.52, exactLongitude: 75.52, isRetrograde: false },
  saturn: { sign: 'pisces', degree: 24.12, exactLongitude: 354.12, isRetrograde: false },
  uranus: { sign: 'taurus', degree: 24.62, exactLongitude: 54.62, isRetrograde: false },
  neptune: { sign: 'pisces', degree: 29.93, exactLongitude: 359.93, isRetrograde: false },
  pluto: { sign: 'aquarius', degree: 3.5, exactLongitude: 333.5, isRetrograde: false },
  northNode: { sign: 'pisces', degree: 26.88, exactLongitude: 356.88, isRetrograde: true },
  southNode: { sign: 'virgo', degree: 26.88, exactLongitude: 176.88, isRetrograde: true }
};
```

## Calculation Reliability Requirements

### Accuracy Standards

**Positional Accuracy:**
- Planetary positions MUST be accurate to within 0.1 degrees
- Lunar phases MUST be accurate to within 1 hour
- Transit timing MUST be accurate to within 1 day
- Retrograde status MUST be current and validated

**Performance Requirements:**
- All astrological calculations MUST complete within 2 seconds
- API timeouts MUST be set to 5 seconds maximum
- Cache hits MUST return results within 100ms
- Fallback calculations MUST complete within 500ms

**Data Freshness:**
- Cached positions valid for 6 hours maximum
- Transit dates updated monthly or when astronomical events occur
- Retrograde phases validated against multiple sources
- Lunar node positions calculated using Meeus algorithms

### Error Handling Standards

**Graceful Degradation:**
```typescript
async function safeAstrologicalCalculation<T>(
  calculation: () => Promise<T>,
  fallback: T,
  validator: (result: T) => boolean
): Promise<T> {
  try {
    const result = await calculation();
    if (validator(result)) {
      return result;
    } else {
      logger.warn('Calculation result failed validation, using fallback');
      return fallback;
    }
  } catch (error) {
    logger.error('Astrological calculation failed', error);
    return fallback;
  }
}
```

**Validation Functions:**
```typescript
function validatePlanetaryPositions(positions: Record<string, unknown>): boolean {
  const requiredPlanets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
  
  for (const planet of requiredPlanets) {
    if (!positions[planet]) return false;
    
    const pos = positions[planet] as any;
    if (!pos.sign || typeof pos.degree !== 'number') return false;
    if (pos.degree < 0 || pos.degree >= 30) return false;
  }
  
  return true;
}
```

## Testing Approaches

### Unit Testing Requirements

**Planetary Position Tests:**
```typescript
describe('Planetary Position Calculations', () => {
  test('validates transit dates against stored data', async () => {
    const testDate = new Date('2024-05-16');
    const positions = await getReliablePlanetaryPositions(testDate);
    
    expect(positions).toBeDefined();
    expect(validatePlanetaryPositions(positions)).toBe(true);
  });
  
  test('handles API failures gracefully', async () => {
    // Mock API failure
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('API Error'));
    
    const positions = await getReliablePlanetaryPositions();
    expect(positions).toEqual(expect.objectContaining({
      sun: expect.objectContaining({ sign: expect.any(String) })
    }));
  });
});
```

**Transit Validation Tests:**
```typescript
describe('Transit Date Validation', () => {
  test('validates current Mars transit in Cancer', () => {
    const currentDate = new Date('2024-07-15');
    const isValid = validateTransitDate('mars', currentDate, 'cancer');
    expect(isValid).toBe(true);
  });
  
  test('rejects invalid transit combinations', () => {
    const testDate = new Date('2024-01-01');
    const isValid = validateTransitDate('mars', testDate, 'aquarius');
    expect(isValid).toBe(false);
  });
});
```

### Integration Testing

**End-to-End Calculation Tests:**
```typescript
describe('Astrological Integration', () => {
  test('complete recommendation flow with real planetary data', async () => {
    const recommendations = await generateAstrologicalRecommendations();
    
    expect(recommendations).toBeDefined();
    expect(recommendations.ingredients).toHaveLength(expect.any(Number));
    expect(recommendations.timing).toBeDefined();
    expect(recommendations.elementalBalance).toBeDefined();
  });
});
```

**Performance Testing:**
```typescript
describe('Performance Requirements', () => {
  test('calculations complete within 2 seconds', async () => {
    const startTime = Date.now();
    await getReliablePlanetaryPositions();
    const duration = Date.now() - startTime;
    
    expect(duration).toBeLessThan(2000);
  });
});
```

## Astronomical Edge Case Handling

### Retrograde Motion

**Detection and Handling:**
- All planets can be retrograde except Sun and Moon
- Retrograde status affects elemental calculations
- Mercury retrograde requires special communication considerations
- Venus retrograde affects relationship and harmony calculations

**Implementation:**
```typescript
function adjustForRetrograde(planet: string, baseInfluence: number, isRetrograde: boolean): number {
  if (!isRetrograde) return baseInfluence;
  
  const retrogradeModifiers = {
    mercury: 0.7,  // Reduced communication clarity
    venus: 0.8,    // Reduced harmony influence
    mars: 1.2,     // Increased intensity when retrograde
    jupiter: 0.9,  // Reduced expansion
    saturn: 1.1,   // Increased restriction
    uranus: 1.3,   // Increased unpredictability
    neptune: 0.6,  // Reduced clarity
    pluto: 1.1     // Increased transformation intensity
  };
  
  return baseInfluence * (retrogradeModifiers[planet] || 1.0);
}
```

### Sign Changes and Ingresses

**Critical Timing Considerations:**
- Planet changing signs affects all recommendations
- Ingress timing must be accurate to the hour
- Recommendations should adapt immediately after sign changes
- Cache invalidation required during ingress periods

**Ingress Detection:**
```typescript
function detectUpcomingIngress(planet: string, currentPosition: any): Date | null {
  const currentDegree = currentPosition.degree;
  const currentSign = currentPosition.sign;
  
  // If planet is within 1 degree of sign boundary
  if (currentDegree >= 29.0) {
    // Calculate approximate time to next sign
    const dailyMotion = getPlanetaryDailyMotion(planet);
    const degreesToGo = 30 - currentDegree;
    const daysToIngress = degreesToGo / dailyMotion;
    
    return new Date(Date.now() + (daysToIngress * 24 * 60 * 60 * 1000));
  }
  
  return null;
}
```

### Eclipse and Conjunction Handling

**Special Astronomical Events:**
- Solar and lunar eclipses require modified calculations
- Planetary conjunctions intensify combined influences
- Grand trines and squares affect elemental balance
- New and full moons in specific signs alter recommendations

**Eclipse Detection:**
```typescript
function isEclipsePeriod(date: Date): boolean {
  // Check if date falls within known eclipse periods
  const eclipsePeriods = [
    { start: '2024-04-08', end: '2024-04-10' }, // Solar eclipse
    { start: '2024-09-17', end: '2024-09-19' }, // Lunar eclipse
    // Add more eclipse periods as needed
  ];
  
  const dateStr = date.toISOString().split('T')[0];
  return eclipsePeriods.some(period => 
    dateStr >= period.start && dateStr <= period.end
  );
}
```

### Lunar Node Calculations

**North and South Node Handling:**
- Nodes are always retrograde
- Calculated using Meeus algorithms
- 18.6-year cycle consideration
- Karmic implications for ingredient selection

**Node Calculation:**
```typescript
function calculateLunarNodes(date: Date): { northNode: any, southNode: any } {
  const jd = dateToJulian(date);
  const T = (jd - 2451545.0) / 36525;
  
  // Mean longitude of ascending node (Meeus formula)
  let Omega = 125.04452 - 1934.136261 * T + 0.0020708 * T*T + T*T*T/450000;
  Omega = ((Omega % 360) + 360) % 360;
  
  const northNodeLongitude = (Omega + 180) % 360;
  const southNodeLongitude = Omega;
  
  return {
    northNode: {
      ...getLongitudeToZodiacSign(northNodeLongitude),
      exactLongitude: northNodeLongitude,
      isRetrograde: true
    },
    southNode: {
      ...getLongitudeToZodiacSign(southNodeLongitude),
      exactLongitude: southNodeLongitude,
      isRetrograde: true
    }
  };
}
```

## Data Consistency Requirements

### Cross-Validation

**Multiple Source Verification:**
- Compare results from different APIs when available
- Flag discrepancies greater than 0.5 degrees
- Log inconsistencies for manual review
- Prefer NASA JPL data when conflicts arise

**Consistency Checks:**
```typescript
function validatePositionConsistency(
  primary: Record<string, any>, 
  secondary: Record<string, any>
): boolean {
  const tolerance = 0.5; // degrees
  
  for (const planet in primary) {
    if (secondary[planet]) {
      const diff = Math.abs(primary[planet].exactLongitude - secondary[planet].exactLongitude);
      if (diff > tolerance && diff < (360 - tolerance)) {
        logger.warn(`Position inconsistency for ${planet}: ${diff} degrees`);
        return false;
      }
    }
  }
  
  return true;
}
```

### Data Integrity Monitoring

**Automated Validation:**
- Daily consistency checks against known ephemeris data
- Automated alerts for calculation anomalies
- Performance monitoring for calculation speed
- Error rate tracking and reporting

**Monitoring Implementation:**
```typescript
class AstronomicalDataMonitor {
  private errorCount = 0;
  private lastValidation = new Date();
  
  async performDailyValidation(): Promise<void> {
    try {
      const positions = await getReliablePlanetaryPositions();
      const isValid = validatePlanetaryPositions(positions);
      
      if (!isValid) {
        this.errorCount++;
        logger.error('Daily validation failed', { errorCount: this.errorCount });
      } else {
        this.errorCount = 0;
        logger.info('Daily validation passed');
      }
      
      this.lastValidation = new Date();
    } catch (error) {
      logger.error('Validation process failed', error);
    }
  }
}
```

## References and Integration Points

### Core Calculation Files
- #[[file:src/utils/reliableAstronomy.ts]] - Primary astronomical calculation utility
- #[[file:src/utils/planetaryConsistencyCheck.ts]] - Validation and consistency checking
- #[[file:src/calculations/culinary/]] - Culinary astrology integration
- #[[file:src/data/planets/]] - Transit date and planetary data storage

### Testing and Validation
- #[[file:src/calculations/__tests__/]] - Astrological calculation test suites
- #[[file:src/utils/__tests__/]] - Utility function testing
- #[[file:jest.config.js]] - Testing framework configuration

### Error Handling and Monitoring
- #[[file:src/utils/logger.ts]] - Centralized logging system
- #[[file:src/services/PerformanceMonitoringService.ts]] - Performance tracking
- #[[file:src/components/debug/ConsolidatedDebugInfo.tsx]] - Debug information display

### Campaign System Integration
- #[[file:src/services/campaign/]] - Automated quality improvement systems
- #[[file:src/services/campaign/TypeScriptErrorAnalyzer.ts]] - Error analysis and tracking
- #[[file:src/services/campaign/PerformanceMonitoringSystem.ts]] - System performance monitoring