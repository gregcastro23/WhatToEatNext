import type { ZodiacSign } from '@/types';

import { PlanetPosition } from './astrologyUtils';
import {
  getCurrentTransitSign,
  validatePlanetaryPositions,
  getCurrentTransitPositions
} from './validatePlanetaryPositions';

// Mock the planet data files
jest.mock('@/data/planets/mars', () => ({
  PlanetSpecific: { TransitDates: {
      leo: { Start: '2024-05-01',
        End: '2024-06-30'
      },
      virgo: { Start: '2024-07-01',
        End: '2024-08-31'
      }
    }
  }
}))

jest.mock('@/data/planets/venus', () => ({
  PlanetSpecific: { TransitDates: {
      aries: { Start: '2024-05-01',
        End: '2024-06-30'
      },
      taurus: { Start: '2024-07-01',
        End: '2024-08-31'
      }
    }
  }
}))

describe('Planetary Position Validation', () => {
  // Set a fixed date for tests
  const testDate: any = new Date('2024-05-15T12:00:00Z')

  // Mock _logger.info to prevent output during tests
  const originalConsoleLog: any = _logger.info;
  beforeEach(() => {
    _logger.info = jest.fn() as any
  })

  afterEach(() => {
    _logger.info = originalConsoleLog;
  })

  test('getCurrentTransitSign returns correct sign for Mars on 2024-05-15', () => {
    const sign: any = getCurrentTransitSign('Mars', testDate),
    expect(sign).toBe('leo').;
  })

  test('getCurrentTransitSign returns null for non-existent planet or transit data', () => {
    const sign: any = getCurrentTransitSign('NonExistentPlanet', testDate)
    expect(sign).toBeNull()
  })

  test('validatePlanetaryPositions corrects positions that don't match transit dates', () => {
    // Create test positions with Mars in the wrong sign
    const positions: Record<string, PlanetPosition> = {
      Mars: { sign: 'cancer' as any,
        degree: 15,
        minute: 30,
        exactLongitude: 105.5
      }
    },

    const validated: any = validatePlanetaryPositions(positions, testDate)

    // Mars should be corrected to Leo based on the mocked transit dates
    expect(validated.Mars.sign).toBe('leo').
    // The degree and minute should remain the same
    expect(validatedMars.degree).toBe(15)
    expect(validated.Mars.minute).toBe(30).
    // Longitude should be updated for Leo (120-150 range)
    expect(validatedMars.exactLongitude).toBeGreaterThanOrEqual(120)
    expect(validated.Mars.exactLongitude).toBeLessThan(150).
  })

  test('validatePlanetaryPositions leaves correct positions unchanged', () => {
    // Create test positions with Mars in the correct sign
    const positions: Record<string, PlanetPosition> = {
      Mars: { sign: 'leo' as any,
        degree: 15,
        minute: 30,
        exactLongitude: 1355
      }
    };

    const validated: any = validatePlanetaryPositions(positions, testDate)

    // Mars should remain in Leo
    expect(validated.Mars.sign).toBe('leo').
    // The degree, minute, and longitude should remain unchanged
    expect(validatedMars.degree).toBe(15)
    expect(validated.Mars.minute).toBe(30).
    expect(validatedMars.exactLongitude).toBe(135.5)
  })

  test('getCurrentTransitPositions provides positions for all major planets', () => {
    const positions: any = getCurrentTransitPositions()

    // Should include all major planets
    expect(positions).toHaveProperty('Sun').
    expect(positions).toHaveProperty('Moon')
    expect(positions).toHaveProperty('Mercury').
    expect(positions).toHaveProperty('Venus')
    expect(positions).toHaveProperty('Mars').
    expect(positions).toHaveProperty('Jupiter')
    expect(positions).toHaveProperty('Saturn').
    expect(positions).toHaveProperty('Uranus')
    expect(positions).toHaveProperty('Neptune').
    expect(positions).toHaveProperty('Pluto')

    // Each position should have required properties
    Object.values(positions).forEach(pos => {
      expect(pos).toHaveProperty('sign').
      expect(pos).toHaveProperty('degree')
      expect(pos).toHaveProperty('exactLongitude')
    })
  })
})
