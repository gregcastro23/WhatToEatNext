import { 
  ALCHEMICAL_PILLARS, 
  COOKING_METHOD_PILLAR_MAPPING,
  getCookingMethodPillar
} from '../constants/alchemicalPillars';
import {
  calculateCookingMethodCompatibility,
  applyPillarTransformation,
  getRecommendedCookingMethods
} from '../utils/alchemicalPillarUtils';
import { CookingMethod } from '../types/alchemy';

describe('Alchemical Pillars', () => {
  test('All 14 pillars are defined', () => {
    expect(ALCHEMICAL_PILLARS).toBeDefined();
    expect(ALCHEMICAL_PILLARS.length).toBe(14);
  });

  test('Each pillar has effects on Spirit, Essence, Matter, and Substance', () => {
    ALCHEMICAL_PILLARS.forEach(pillar => {
      expect(pillar.effects).toBeDefined();
      expect(pillar.effects.Spirit).toBeDefined();
      expect(pillar.effects.Essence).toBeDefined();
      expect(pillar.effects.Matter).toBeDefined();
      expect(pillar.effects.Substance).toBeDefined();
    });
  });

  test('Cooking methods are mapped to pillars', () => {
    expect(COOKING_METHOD_PILLAR_MAPPING).toBeDefined();
    expect(Object.keys(COOKING_METHOD_PILLAR_MAPPING).length).toBeGreaterThan(0);
  });

  test('getCookingMethodPillar returns correct pillar for a cooking method', () => {
    const bakingPillar = getCookingMethodPillar('baking');
    expect(bakingPillar).toBeDefined();
    expect(bakingPillar?.name).toBe('Calcination');

    const fermenting = getCookingMethodPillar('fermenting');
    expect(fermenting).toBeDefined();
    expect(fermenting?.name).toBe('Fermentation');
  });

  test('calculateCookingMethodCompatibility returns a score between 0 and 1', () => {
    const score = calculateCookingMethodCompatibility('baking', 'roasting');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  test('Compatible cooking methods have higher scores', () => {
    // Baking and roasting should be highly compatible (both are Calcination)
    const similarScore = calculateCookingMethodCompatibility('baking', 'roasting');
    
    // Baking and fermenting should be less compatible (Calcination vs Fermentation)
    const differentScore = calculateCookingMethodCompatibility('baking', 'fermenting');
    
    expect(similarScore).toBeGreaterThan(differentScore);
  });

  test('applyPillarTransformation transforms an item based on cooking method', () => {
    const testItem = {
      id: 'test',
      name: 'Test Item',
      elementalProperties: {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25
      },
      spirit: 0.5,
      essence: 0.5,
      matter: 0.5,
      substance: 0.5,
      heat: 0.5,
      entropy: 0.5,
      reactivity: 0.5
    };
    
    const transformed = applyPillarTransformation(testItem, 'baking');
    
    // Baking is Calcination which increases Essence and Matter, decreases Spirit and Substance
    expect(transformed.spirit).toBeLessThan(testItem.spirit);
    expect(transformed.essence).toBeGreaterThan(testItem.essence);
    expect(transformed.matter).toBeGreaterThan(testItem.matter);
    expect(transformed.substance).toBeLessThan(testItem.substance);
  });

  test('getRecommendedCookingMethods returns cooking methods sorted by compatibility', () => {
    const testItem = {
      id: 'test',
      name: 'Test Item',
      elementalProperties: {
        Fire: 0.7,  // High fire - should recommend methods that balance this
        Water: 0.1,
        Earth: 0.1,
        Air: 0.1
      },
      spirit: 0.7,
      essence: 0.4,
      matter: 0.2,
      substance: 0.3,
      heat: 0.8,
      entropy: 0.4,
      reactivity: 0.6
    };
    
    const availableMethods: CookingMethod[] = ['baking', 'boiling', 'steaming', 'grilling', 'raw'];
    const recommendations = getRecommendedCookingMethods(testItem, availableMethods, 3);
    
    expect(recommendations.length).toBe(3);
    expect(recommendations[0].compatibility).toBeGreaterThanOrEqual(recommendations[1].compatibility);
    expect(recommendations[1].compatibility).toBeGreaterThanOrEqual(recommendations[2].compatibility);
  });
}); 