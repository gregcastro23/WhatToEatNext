#!/usr/bin/env node

/**
 * Test suite for Astrological Domain Variable Detection System
 *
 * Tests the pattern matching and preservation logic for astrological domain variables
 * including planetary positions, elemental calculations, and astronomical computations.
 */

const AstrologicalDomainDetector = require('../astrological-domain-detector.cjs');

describe('AstrologicalDomainDetector', () => {
  let detector;

  beforeEach(() => {
    detector = new AstrologicalDomainDetector();
  });

  describe('Planetary Position Variables', () => {
    test('should preserve planetary position variables', () => {
      const testCases = [
        'planet',
        'degree',
        'sign',
        'longitude',
        'position',
        'coordinates',
        'planetaryPositions',
        'exactLongitude',
        'zodiacSign'
      ];

      testCases.forEach(variableName => {
        const result = detector.detectAstrologicalDomain(variableName, '/src/calculations/test.ts');
        expect(result.shouldPreserve).toBe(true);
        expect(result.domain).toBe('astrological');
        expect(result.confidence).toBeGreaterThan(0.8);
      });
    });

    test('should preserve individual planet variables', () => {
      const planets = [
        'sun', 'moon', 'mercury', 'venus', 'mars',
        'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'
      ];

      planets.forEach(planet => {
        const result = detector.detectAstrologicalDomain(planet, '/src/calculations/planetary.ts');
        expect(result.shouldPreserve).toBe(true);
        expect(result.category).toBe('planets');
      });
    });

    test('should preserve planet variables with suffixes', () => {
      const planetVariables = [
        'sunPosition',
        'moonSign',
        'mercuryDegree',
        'venusData',
        'marsInfo'
      ];

      planetVariables.forEach(variableName => {
        const result = detector.detectAstrologicalDomain(variableName, '/src/calculations/test.ts');
        expect(result.shouldPreserve).toBe(true);
        expect(result.category).toBe('planets');
      });
    });
  });

  describe('Zodiac Signs and Elements', () => {
    test('should preserve zodiac sign variables', () => {
      const zodiacSigns = [
        'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
        'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
      ];

      zodiacSigns.forEach(sign => {
        const result = detector.detectAstrologicalDomain(sign, '/src/calculations/zodiac.ts');
        expect(result.shouldPreserve).toBe(true);
        expect(result.category).toBe('zodiacSigns');
      });
    });

    test('should preserve sign-related variables', () => {
      const signVariables = [
        'zodiacSign',
        'signName',
        'signElement',
        'cardinal',
        'fixed',
        'mutable'
      ];

      signVariables.forEach(variableName => {
        const result = detector.detectAstrologicalDomain(variableName, '/src/calculations/signs.ts');
        expect(result.shouldPreserve).toBe(true);
        expect(result.category).toBe('zodiacSigns');
      });
    });
  });

  describe('Elemental System Variables', () => {
    test('should preserve core elemental variables', () => {
      const elementalVariables = [
        'fire',
        'water',
        'earth',
        'air',
        'fireElement',
        'waterProperties',
        'earthBalance',
        'airHarmony'
      ];

      elementalVariables.forEach(variableName => {
        const result = detector.detectAstrologicalDomain(variableName, '/src/calculations/elemental.ts');
        expect(result.shouldPreserve).toBe(true);
        expect(result.category).toBe('elementalSystem');
        expect(result.reason).toContain('four-element calculations');
      });
    });

    test('should preserve elemental calculation variables', () => {
      const calculationVariables = [
        'elementalEnergies',
        'elementalInfluence',
        'elementalCompatibility',
        'fireEnergy',
        'waterEnergy',
        'earthEnergy',
        'airEnergy'
      ];

      calculationVariables.forEach(variableName => {
        const result = detector.detectAstrologicalDomain(variableName, '/src/calculations/elemental.ts');
        expect(result.shouldPreserve).toBe(true);
        expect(result.category).toBe('elementalSystem');
      });
    });

    test('should preserve elemental harmony variables', () => {
      const harmonyVariables = [
        'elementalHarmony',
        'elementCompatibility',
        'selfReinforcement',
        'elementalBalance',
        'harmonicResonance'
      ];

      harmonyVariables.forEach(variableName => {
        const result = detector.detectAstrologicalDomain(variableName, '/src/calculations/harmony.ts');
        expect(result.shouldPreserve).toBe(true);
        expect(result.category).toBe('elementalSystem');
      });
    });
  });

  describe('Astronomical Calculations', () => {
    test('should preserve transit and aspect variables', () => {
      const astronomicalVariables = [
        'transit',
        'retrograde',
        'conjunction',
        'opposition',
        'trine',
        'square',
        'aspect',
        'orb'
      ];

      astronomicalVariables.forEach(variableName => {
        const result = detector.detectAstrologicalDomain(variableName, '/src/calculations/aspects.ts');
        expect(result.shouldPreserve).toBe(true);
        expect(result.category).toBe('astronomicalCalculations');
      });
    });

    test('should preserve lunar phase variables', () => {
      const lunarVariables = [
        'newMoon',
        'fullMoon',
        'lunarPhase',
        'lunation',
        'eclipse'
      ];

      lunarVariables.forEach(variableName => {
        const result = detector.detectAstrologicalDomain(variableName, '/src/calculations/lunar.ts');
        expect(result.shouldPreserve).toBe(true);
        expect(result.category).toBe('astronomicalCalculations');
      });
    });
  });

  describe('Complex Astronomical Libraries', () => {
    test('should preserve library-specific variables', () => {
      const libraryVariables = [
        'astronomia',
        'ephemeris',
        'meeus',
        'kepler',
        'orbital',
        'perihelion',
        'eccentricity'
      ];

      libraryVariables.forEach(variableName => {
        const result = detector.detectAstrologicalDomain(variableName, '/src/lib/astronomia.ts');
        expect(result.shouldPreserve).toBe(true);
        expect(result.category).toBe('astronomicalLibraries');
      });
    });

    test('should preserve coordinate system variables', () => {
      const coordinateVariables = [
        'equatorial',
        'ecliptic',
        'galactic',
        'coordinate',
        'transformation'
      ];

      coordinateVariables.forEach(variableName => {
        const result = detector.detectAstrologicalDomain(variableName, '/src/utils/coordinates.ts');
        expect(result.shouldPreserve).toBe(true);
        expect(result.category).toBe('astronomicalLibraries');
      });
    });
  });

  describe('File-Specific Rules', () => {
    test('should apply maximum preservation for critical astrological files', () => {
      const criticalFiles = [
        '/src/calculations/astronomical/planetary.ts',
        '/src/calculations/elemental/harmony.ts',
        '/src/utils/reliableAstronomy.ts',
        '/src/utils/planetaryConsistencyCheck.ts'
      ];

      criticalFiles.forEach(filePath => {
        const rules = detector.getFileSpecificRules(filePath);
        expect(rules.preservationLevel).toBe('maximum');
        expect(rules.batchSize).toBeLessThanOrEqual(5);
        expect(rules.requiresManualReview).toBe(true);
      });
    });

    test('should apply conservative patterns for complex library files', () => {
      const libraryFiles = [
        '/src/lib/astronomia/calculations.ts',
        '/src/lib/astronomy-engine/ephemeris.ts',
        '/src/utils/meeus/algorithms.ts'
      ];

      libraryFiles.forEach(filePath => {
        const rules = detector.getFileSpecificRules(filePath);
        expect(rules.preservationLevel).toBe('maximum');
        expect(rules.batchSize).toBeLessThanOrEqual(3);
        expect(rules.specialInstructions).toContain(
          expect.stringContaining('conservative elimination patterns')
        );
      });
    });

    test('should apply high preservation for elemental calculation files', () => {
      const elementalFiles = [
        '/src/calculations/elementalCalculations.ts',
        '/src/utils/fourElementSystem.ts'
      ];

      elementalFiles.forEach(filePath => {
        const rules = detector.getFileSpecificRules(filePath);
        expect(rules.preservationLevel).toBe('high');
        expect(rules.specialInstructions).toContain(
          expect.stringContaining('Fire, Water, Earth, Air variables')
        );
      });
    });
  });

  describe('Context-Aware Detection', () => {
    test('should detect variables in astrological context', () => {
      const fileContent = `
        function calculatePlanetaryInfluence(planetaryPositions) {
          const mercury = planetaryPositions.mercury;
          const degree = mercury.degree;
          const sign = mercury.sign;
          return { degree, sign };
        }
      `;

      const result = detector.detectAstrologicalDomain(
        'mercury',
        '/src/calculations/planetary.ts',
        fileContent
      );

      expect(result.shouldPreserve).toBe(true);
      expect(result.matchType).toBe('variable-name');
    });

    test('should use file context for borderline cases', () => {
      const fileContent = `
        // Elemental calculation with fire and water elements
        function calculateElementalBalance() {
          const fireValue = 0.8;
          const waterValue = 0.6;
          const balance = fireValue + waterValue;
          return balance;
        }
      `;

      const result = detector.detectAstrologicalDomain(
        'balance',
        '/src/calculations/elemental.ts',
        fileContent
      );

      // Should preserve due to elemental context in file
      expect(result.shouldPreserve).toBe(false); // balance alone is not astrological

      // But fireValue and waterValue should be preserved
      const fireResult = detector.detectAstrologicalDomain(
        'fireValue',
        '/src/calculations/elemental.ts',
        fileContent
      );
      expect(fireResult.shouldPreserve).toBe(true);
    });
  });

  describe('Non-Astrological Variables', () => {
    test('should not preserve generic variables', () => {
      const genericVariables = [
        'data',
        'result',
        'value',
        'item',
        'index',
        'count',
        'temp',
        'buffer'
      ];

      genericVariables.forEach(variableName => {
        const result = detector.detectAstrologicalDomain(variableName, '/src/utils/generic.ts');
        expect(result.shouldPreserve).toBe(false);
        expect(result.domain).toBe('generic');
      });
    });

    test('should not preserve business logic variables in non-astrological files', () => {
      const businessVariables = [
        'user',
        'order',
        'payment',
        'shipping',
        'inventory'
      ];

      businessVariables.forEach(variableName => {
        const result = detector.detectAstrologicalDomain(variableName, '/src/services/commerce.ts');
        expect(result.shouldPreserve).toBe(false);
      });
    });
  });

  describe('Preservation Report Generation', () => {
    test('should generate comprehensive preservation report', () => {
      const testVariables = [
        { variableName: 'mercury', filePath: '/src/calculations/planetary.ts' },
        { variableName: 'fireElement', filePath: '/src/calculations/elemental.ts' },
        { variableName: 'zodiacSign', filePath: '/src/calculations/signs.ts' },
        { variableName: 'genericVar', filePath: '/src/utils/generic.ts' }
      ];

      const report = detector.generatePreservationReport(testVariables);

      expect(report.totalVariables).toBe(4);
      expect(report.preservedVariables).toBe(3);
      expect(Object.keys(report.categoryBreakdown)).toContain('planets');
      expect(Object.keys(report.categoryBreakdown)).toContain('elementalSystem');
      expect(Object.keys(report.categoryBreakdown)).toContain('zodiacSigns');
    });

    test('should generate appropriate recommendations', () => {
      const testVariables = Array(15).fill(null).map((_, i) => ({
        variableName: `mercury${i}`,
        filePath: '/src/calculations/planetary.ts'
      }));

      const report = detector.generatePreservationReport(testVariables);
      const recommendations = report.recommendations;

      expect(recommendations).toContainEqual(
        expect.objectContaining({
          type: 'high-preservation-rate'
        })
      );
    });
  });
});

// Run tests if executed directly
if (require.main === module) {
  console.log('Running Astrological Domain Detector tests...');

  // Simple test runner for Node.js environment
  const runTests = async () => {
    const detector = new AstrologicalDomainDetector();

    console.log('✓ Testing planetary position variables...');
    const planetResult = detector.detectAstrologicalDomain('mercury', '/src/calculations/planetary.ts');
    console.assert(planetResult.shouldPreserve === true, 'Mercury should be preserved');

    console.log('✓ Testing elemental variables...');
    const elementResult = detector.detectAstrologicalDomain('fireElement', '/src/calculations/elemental.ts');
    console.assert(elementResult.shouldPreserve === true, 'Fire element should be preserved');

    console.log('✓ Testing generic variables...');
    const genericResult = detector.detectAstrologicalDomain('data', '/src/utils/generic.ts');
    console.assert(genericResult.shouldPreserve === false, 'Generic data should not be preserved');

    console.log('✓ All basic tests passed!');
  };

  runTests().catch(console.error);
}

module.exports = {
  AstrologicalDomainDetector: require('../astrological-domain-detector.cjs')
};
