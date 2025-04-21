import {
  isElement,
  isZodiacSign,
  isPlanetName,
  isLunarPhase,
  isCookingMethod,
  isElementalProperties,
  isPlanetaryPosition,
  isPlanetaryAspect,
  isAstrologicalProfile,
  isChakraEnergies,
  isRecordOf,
  isArrayOf,
  isISODateString,
  hasRequiredProperties,
  validateNestedObject
} from '../enhancedTypeGuards';

import { Element, ZodiacSign, PlanetName, LunarPhase, CookingMethod } from '../types/constants';

// Mock the constants if they don't exist in the test environment
jest.mock('../types/constants', () => ({
  Element: {
    Fire: 'Fire',
    Water: 'Water',
    Earth: 'Earth',
    Air: 'Air'
  },
  ZodiacSign: {
    Aries: 'aries',
    Taurus: 'taurus',
    Gemini: 'gemini',
    Cancer: 'cancer',
    Leo: 'leo',
    Virgo: 'virgo',
    Libra: 'libra',
    Scorpio: 'scorpio',
    Sagittarius: 'sagittarius',
    Capricorn: 'capricorn',
    Aquarius: 'aquarius',
    Pisces: 'pisces'
  },
  PlanetName: {
    Sun: 'sun',
    Moon: 'moon',
    Mercury: 'mercury',
    Venus: 'venus',
    Mars: 'mars',
    Jupiter: 'jupiter',
    Saturn: 'saturn',
    Uranus: 'uranus',
    Neptune: 'neptune',
    Pluto: 'pluto'
  },
  LunarPhase: {
    New: 'new_moon',
    WaxingCrescent: 'waxing_crescent',
    FirstQuarter: 'first_quarter',
    WaxingGibbous: 'waxing_gibbous',
    Full: 'full_moon',
    WaningGibbous: 'waning_gibbous',
    ThirdQuarter: 'third_quarter',
    WaningCrescent: 'waning_crescent'
  },
  CookingMethod: {
    Bake: 'bake',
    Grill: 'grill',
    Boil: 'boil',
    Fry: 'fry',
    Roast: 'roast',
    Saute: 'saute',
    Steam: 'steam'
  }
}));

describe('Basic Type Guards', () => {
  describe('isElement', () => {
    test('should return true for valid elements', () => {
      expect(isElement('Fire')).toBe(true);
      expect(isElement('Water')).toBe(true);
      expect(isElement('Earth')).toBe(true);
      expect(isElement('Air')).toBe(true);
    });

    test('should return false for invalid elements', () => {
      expect(isElement('Lightning')).toBe(false);
      expect(isElement(123)).toBe(false);
      expect(isElement(null)).toBe(false);
      expect(isElement(undefined)).toBe(false);
    });
  });

  describe('isZodiacSign', () => {
    test('should return true for valid zodiac signs', () => {
      expect(isZodiacSign('aries')).toBe(true);
      expect(isZodiacSign('libra')).toBe(true);
      expect(isZodiacSign('pisces')).toBe(true);
    });

    test('should return false for invalid zodiac signs', () => {
      expect(isZodiacSign('Aries')).toBe(false); // Case sensitive
      expect(isZodiacSign('Ophiuchus')).toBe(false);
      expect(isZodiacSign(123)).toBe(false);
    });
  });

  describe('isPlanetName', () => {
    test('should return true for valid planet names', () => {
      expect(isPlanetName('sun')).toBe(true);
      expect(isPlanetName('mars')).toBe(true);
      expect(isPlanetName('pluto')).toBe(true);
    });

    test('should return false for invalid planet names', () => {
      expect(isPlanetName('Sun')).toBe(false); // Case sensitive
      expect(isPlanetName('Earth')).toBe(false); // Not an astrological planet
      expect(isPlanetName(null)).toBe(false);
    });
  });

  describe('isLunarPhase', () => {
    test('should return true for valid lunar phases', () => {
      expect(isLunarPhase('new_moon')).toBe(true);
      expect(isLunarPhase('full_moon')).toBe(true);
      expect(isLunarPhase('waning_crescent')).toBe(true);
    });

    test('should return false for invalid lunar phases', () => {
      expect(isLunarPhase('super_moon')).toBe(false);
      expect(isLunarPhase(123)).toBe(false);
      expect(isLunarPhase(undefined)).toBe(false);
    });
  });

  describe('isCookingMethod', () => {
    test('should return true for valid cooking methods', () => {
      expect(isCookingMethod('bake')).toBe(true);
      expect(isCookingMethod('grill')).toBe(true);
      expect(isCookingMethod('steam')).toBe(true);
    });

    test('should return false for invalid cooking methods', () => {
      expect(isCookingMethod('microwave')).toBe(false);
      expect(isCookingMethod('Bake')).toBe(false); // Case sensitive
      expect(isCookingMethod({})).toBe(false);
    });
  });
});

describe('Complex Type Guards', () => {
  describe('isElementalProperties', () => {
    test('should return true for valid elemental properties', () => {
      expect(isElementalProperties({
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25
      })).toBe(true);
    });

    test('should return false for invalid elemental properties', () => {
      expect(isElementalProperties({
        Fire: 0.25,
        Water: 0.25,
        // Missing Earth and Air
      })).toBe(false);

      expect(isElementalProperties({
        Fire: 0.25,
        Water: 0.25,
        Earth: 'high', // Wrong type
        Air: 0.25
      })).toBe(false);

      expect(isElementalProperties(null)).toBe(false);
      expect(isElementalProperties('elements')).toBe(false);
    });
  });

  describe('isPlanetaryPosition', () => {
    test('should return true for valid planetary position', () => {
      expect(isPlanetaryPosition({
        planet: 'mars',
        sign: 'aries',
        degree: 15
      })).toBe(true);

      expect(isPlanetaryPosition({
        planet: 'venus',
        sign: 'taurus',
        degree: 8,
        isRetrograde: true
      })).toBe(true);
    });

    test('should return false for invalid planetary position', () => {
      expect(isPlanetaryPosition({
        planet: 'mars',
        sign: 'invalid',
        degree: 15
      })).toBe(false);

      expect(isPlanetaryPosition({
        planet: 'mars',
        sign: 'aries',
        // Missing degree
      })).toBe(false);

      expect(isPlanetaryPosition({
        planet: 'mars',
        sign: 'aries',
        degree: 'midpoint' // Wrong type
      })).toBe(false);
    });
  });

  describe('isPlanetaryAspect', () => {
    test('should return true for valid planetary aspect', () => {
      expect(isPlanetaryAspect({
        planetA: 'sun',
        planetB: 'moon',
        aspect: 'conjunction',
        orb: 3,
        influence: 'harmonious'
      })).toBe(true);
    });

    test('should return false for invalid planetary aspect', () => {
      expect(isPlanetaryAspect({
        planetA: 'sun',
        planetB: 'moon',
        aspect: 'conjunction',
        orb: 3,
        influence: 'super-positive' // Invalid influence
      })).toBe(false);

      expect(isPlanetaryAspect({
        planetA: 'sun',
        // Missing planetB
        aspect: 'conjunction',
        orb: 3,
        influence: 'harmonious'
      })).toBe(false);
    });
  });

  describe('isAstrologicalProfile', () => {
    test('should return true for valid astrological profile', () => {
      expect(isAstrologicalProfile({
        zodiac: ['aries', 'taurus'],
        lunar: ['new_moon', 'full_moon'],
        planetary: [
          {
            planet: 'mars',
            sign: 'aries',
            degree: 15
          }
        ]
      })).toBe(true);

      // Empty profile is also valid
      expect(isAstrologicalProfile({})).toBe(true);
    });

    test('should return false for invalid astrological profile', () => {
      expect(isAstrologicalProfile({
        zodiac: ['invalid_sign'],
        lunar: ['new_moon']
      })).toBe(false);

      expect(isAstrologicalProfile({
        planetary: [
          {
            planet: 'mars',
            sign: 'aries',
            // Missing degree
          }
        ]
      })).toBe(false);

      expect(isAstrologicalProfile(null)).toBe(false);
    });
  });

  describe('isChakraEnergies', () => {
    test('should return true for valid chakra energies', () => {
      expect(isChakraEnergies({
        root: 0.5,
        sacral: 0.6,
        solarPlexus: 0.7,
        heart: 0.8,
        throat: 0.7,
        brow: 0.6,
        crown: 0.5
      })).toBe(true);
    });

    test('should return false for invalid chakra energies', () => {
      expect(isChakraEnergies({
        root: 0.5,
        sacral: 0.6,
        // Missing other chakras
      })).toBe(false);

      expect(isChakraEnergies({
        root: 0.5,
        sacral: 0.6,
        solarPlexus: 0.7,
        heart: 'high', // Wrong type
        throat: 0.7,
        brow: 0.6,
        crown: 0.5
      })).toBe(false);
    });
  });
});

describe('Utility Type Guards', () => {
  describe('isRecordOf', () => {
    test('should return true for valid record', () => {
      const isValidKey = (key: string): key is string => key.startsWith('item');
      const isValidValue = (value: unknown): value is number => typeof value === 'number';
      
      expect(isRecordOf(
        { item1: 1, item2: 2 },
        isValidKey,
        isValidValue
      )).toBe(true);
    });

    test('should return false for invalid record', () => {
      const isValidKey = (key: string): key is string => key.startsWith('item');
      const isValidValue = (value: unknown): value is number => typeof value === 'number';
      
      expect(isRecordOf(
        { item1: 1, other: 2 }, // Invalid key
        isValidKey,
        isValidValue
      )).toBe(false);
      
      expect(isRecordOf(
        { item1: 1, item2: 'two' }, // Invalid value
        isValidKey,
        isValidValue
      )).toBe(false);
      
      expect(isRecordOf(
        null,
        isValidKey,
        isValidValue
      )).toBe(false);
    });
  });

  describe('isArrayOf', () => {
    test('should return true for valid array', () => {
      const isValidItem = (value: unknown): value is number => typeof value === 'number';
      
      expect(isArrayOf([1, 2, 3], isValidItem)).toBe(true);
    });

    test('should return false for invalid array', () => {
      const isValidItem = (value: unknown): value is number => typeof value === 'number';
      
      expect(isArrayOf([1, '2', 3], isValidItem)).toBe(false);
      expect(isArrayOf(null, isValidItem)).toBe(false);
      expect(isArrayOf({}, isValidItem)).toBe(false);
    });
  });

  describe('isISODateString', () => {
    test('should return true for valid ISO date strings', () => {
      expect(isISODateString('2023-01-01T12:30:45Z')).toBe(true);
      expect(isISODateString('2023-01-01T12:30:45.123Z')).toBe(true);
    });

    test('should return false for invalid ISO date strings', () => {
      expect(isISODateString('2023-01-01')).toBe(false);
      expect(isISODateString('January 1, 2023')).toBe(false);
      expect(isISODateString(new Date())).toBe(false);
    });
  });

  describe('hasRequiredProperties', () => {
    test('should return true when object has all required properties', () => {
      expect(hasRequiredProperties(
        { id: 1, name: 'Test', optional: true },
        ['id', 'name']
      )).toBe(true);
    });

    test('should return false when object is missing required properties', () => {
      expect(hasRequiredProperties(
        { id: 1, optional: true }, // Missing name
        ['id', 'name']
      )).toBe(false);
      
      expect(hasRequiredProperties(
        null,
        ['id', 'name']
      )).toBe(false);
    });
  });

  describe('validateNestedObject', () => {
    const isSimpleObject = (obj: unknown): obj is { id: number } => 
      typeof obj === 'object' && obj !== null && 
      'id' in obj && typeof (obj as any).id === 'number';
    
    test('should validate simple objects', () => {
      expect(validateNestedObject({ id: 1 }, isSimpleObject).valid).toBe(true);
      expect(validateNestedObject(null, isSimpleObject).valid).toBe(false);
    });
    
    test('should validate arrays of objects', () => {
      expect(validateNestedObject(
        [{ id: 1 }, { id: 2 }],
        isSimpleObject
      ).valid).toBe(true);
      
      expect(validateNestedObject(
        [{ id: 1 }, { name: 'Invalid' }],
        isSimpleObject
      ).valid).toBe(false);
    });
    
    test('should validate nested objects', () => {
      expect(validateNestedObject(
        { nested: { id: 1 } },
        isSimpleObject
      ).valid).toBe(true);
      
      expect(validateNestedObject(
        { nested: { name: 'Invalid' } },
        isSimpleObject
      ).valid).toBe(false);
    });
    
    test('should report correct path for validation failures', () => {
      const result = validateNestedObject(
        { nested: { innerArray: [{ id: 1 }, { name: 'Invalid' }] } },
        isSimpleObject
      );
      
      expect(result.valid).toBe(false);
      expect(result.path).toContain('nested');
      expect(result.path).toContain('innerArray');
      expect(result.path).toContain('1'); // Second array element
    });
  });
}); 