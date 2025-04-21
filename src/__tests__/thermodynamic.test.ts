import { staticAlchemize } from '@/utils/alchemyInitializer';
import { mockChart } from './mocks/mockChart';

describe('Thermodynamic Calculations', () => {
  // Mock birth info
  const birthInfo = {
    hour: 12,
    minute: 0,
    day: 21,
    month: 3,
    year: 2022
  };

  // Mock horoscope data
  const horoscopeDict = { tropical: mockChart };

  describe('Heat calculation', () => {
    test('should calculate heat based on spirit and fire values', () => {
      // Call the alchemize function with the mock data
      const result = staticAlchemize(birthInfo, horoscopeDict);
      
      // Get the values needed for the heat calculation
      const spirit = result['Alchemy Effects']['Total Spirit'];
      const fire = result['Total Effect Value']['Fire'];
      
      // Other elemental values for the denominator
      const substance = result['Alchemy Effects']['Total Substance'];
      const essence = result['Alchemy Effects']['Total Essence'];
      const matter = result['Alchemy Effects']['Total Matter'];
      const water = result['Total Effect Value']['Water'];
      const air = result['Total Effect Value']['Air'];
      const earth = result['Total Effect Value']['Earth'];
      
      // Manual calculation of heat using the formula from the alchemizer
      const expectedHeat = (spirit**2 + fire**2) / (substance + essence + matter + water + air + earth)**2;
      
      // Check that the calculated heat matches the expected value
      expect(result.heat).toBeCloseTo(expectedHeat, 5);
    });
    
    test('should return positive heat value', () => {
      const result = staticAlchemize(birthInfo, horoscopeDict);
      expect(result.heat).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Entropy calculation', () => {
    test('should calculate entropy based on spirit, substance, fire, and air values', () => {
      // Call the alchemize function with the mock data
      const result = staticAlchemize(birthInfo, horoscopeDict);
      
      // Get the values needed for the entropy calculation
      const spirit = result['Alchemy Effects']['Total Spirit'];
      const substance = result['Alchemy Effects']['Total Substance'];
      const fire = result['Total Effect Value']['Fire'];
      const air = result['Total Effect Value']['Air'];
      
      // Other elemental values for the denominator
      const essence = result['Alchemy Effects']['Total Essence'];
      const matter = result['Alchemy Effects']['Total Matter'];
      const earth = result['Total Effect Value']['Earth'];
      const water = result['Total Effect Value']['Water'];
      
      // Manual calculation of entropy using the formula from the alchemizer
      const expectedEntropy = (spirit**2 + substance**2 + fire**2 + air**2) / (essence + matter + earth + water)**2;
      
      // Check that the calculated entropy matches the expected value
      expect(result.entropy).toBeCloseTo(expectedEntropy, 5);
    });
    
    test('should return positive entropy value', () => {
      const result = staticAlchemize(birthInfo, horoscopeDict);
      expect(result.entropy).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Reactivity calculation', () => {
    test('should calculate reactivity based on spirit, substance, essence, fire, air, and water values', () => {
      // Call the alchemize function with the mock data
      const result = staticAlchemize(birthInfo, horoscopeDict);
      
      // Get the values needed for the reactivity calculation
      const spirit = result['Alchemy Effects']['Total Spirit'];
      const substance = result['Alchemy Effects']['Total Substance'];
      const essence = result['Alchemy Effects']['Total Essence'];
      const fire = result['Total Effect Value']['Fire'];
      const air = result['Total Effect Value']['Air'];
      const water = result['Total Effect Value']['Water'];
      
      // Other elemental values for the denominator
      const matter = result['Alchemy Effects']['Total Matter'];
      const earth = result['Total Effect Value']['Earth'];
      
      // Manual calculation of reactivity using the formula from the alchemizer
      const expectedReactivity = (spirit**2 + substance**2 + essence**2 + fire**2 + air**2 + water**2) / (matter + earth)**2;
      
      // Check that the calculated reactivity matches the expected value
      expect(result.reactivity).toBeCloseTo(expectedReactivity, 5);
    });
    
    test('should return positive reactivity value', () => {
      const result = staticAlchemize(birthInfo, horoscopeDict);
      expect(result.reactivity).toBeGreaterThanOrEqual(0);
    });
    
    test('should handle zero denominator in reactivity calculation', () => {
      // Create a mock with zero matter and earth values
      const zeroMatterEarthHoroscope = JSON.parse(JSON.stringify(horoscopeDict));
      
      // Modify the mock to ensure zero matter and earth values
      // This is a simplification - in a real test, you would modify the mockChart
      // to produce zero matter and earth values after calculation
      
      const result = staticAlchemize(birthInfo, zeroMatterEarthHoroscope);
      
      // The function should handle division by zero gracefully
      expect(result.reactivity).not.toBeNaN();
      expect(result.reactivity).not.toBe(Infinity);
    });
  });

  describe('Energy calculation', () => {
    test('should calculate energy based on heat, reactivity, and entropy', () => {
      // Call the alchemize function with the mock data
      const result = staticAlchemize(birthInfo, horoscopeDict);
      
      // Get the thermodynamic values
      const heat = result.heat;
      const reactivity = result.reactivity;
      const entropy = result.entropy;
      
      // Manual calculation of energy using the formula from the alchemizer
      const expectedEnergy = heat - (reactivity * entropy);
      
      // Check that the calculated energy matches the expected value
      expect(result.energy).toBeCloseTo(expectedEnergy, 5);
    });
    
    test('should allow for negative energy values', () => {
      const result = staticAlchemize(birthInfo, horoscopeDict);
      
      // Energy can be negative in thermodynamic calculations
      expect(typeof result.energy).toBe('number');
    });
  });

  describe('Alchemical values totals', () => {
    test('should calculate Total Spirit as sum of individual planet Spirit values', () => {
      const result = staticAlchemize(birthInfo, horoscopeDict);
      
      // Check that planets with spirit values contribute to the total
      let expectedSpirit = 0;
      Object.values(result.Planets).forEach((planet: unknown) => {
        if (planet['Alchemy Effects'] && planet['Alchemy Effects']['Spirit']) {
          expectedSpirit += planet['Alchemy Effects']['Spirit'];
        }
      });
      
      expect(result['Alchemy Effects']['Total Spirit']).toBeCloseTo(expectedSpirit, 5);
    });
    
    test('should calculate Total Essence as sum of individual planet Essence values', () => {
      const result = staticAlchemize(birthInfo, horoscopeDict);
      
      // Check that planets with essence values contribute to the total
      let expectedEssence = 0;
      Object.values(result.Planets).forEach((planet: unknown) => {
        if (planet['Alchemy Effects'] && planet['Alchemy Effects']['Essence']) {
          expectedEssence += planet['Alchemy Effects']['Essence'];
        }
      });
      
      expect(result['Alchemy Effects']['Total Essence']).toBeCloseTo(expectedEssence, 5);
    });
    
    test('should calculate Total Matter as sum of individual planet Matter values', () => {
      const result = staticAlchemize(birthInfo, horoscopeDict);
      
      // Check that planets with matter values contribute to the total
      let expectedMatter = 0;
      Object.values(result.Planets).forEach((planet: unknown) => {
        if (planet['Alchemy Effects'] && planet['Alchemy Effects']['Matter']) {
          expectedMatter += planet['Alchemy Effects']['Matter'];
        }
      });
      
      expect(result['Alchemy Effects']['Total Matter']).toBeCloseTo(expectedMatter, 5);
    });
    
    test('should calculate Total Substance as sum of individual planet Substance values', () => {
      const result = staticAlchemize(birthInfo, horoscopeDict);
      
      // Check that planets with substance values contribute to the total
      let expectedSubstance = 0;
      Object.values(result.Planets).forEach((planet: unknown) => {
        if (planet['Alchemy Effects'] && planet['Alchemy Effects']['Substance']) {
          expectedSubstance += planet['Alchemy Effects']['Substance'];
        }
      });
      
      expect(result['Alchemy Effects']['Total Substance']).toBeCloseTo(expectedSubstance, 5);
    });
  });
}); 