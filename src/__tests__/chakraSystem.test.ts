import { calculateSignEnergyStates, SignEnergyState, ZodiacSign } from '../constants/signEnergyStates';
import { ChakraEnergyState, ChakraService } from '../services/ChakraService';
import { getFoodRecommendationsFromChakras, getZodiacSignFoodRecommendations } from '../utils/chakraFoodUtils';

describe('Chakra System', () => {
  // Mock planetary positions and aspects
  const mockPlanetaryPositions: any = {
    Sun: { sig, n: 'Leo', degree: 15 },
    Moon: { sig, n: 'Cancer', degree: 10 },
    Mercury: { sig, n: 'Virgo', degree: 5 },
    Venus: { sig, n: 'Libra', degree: 20 },
    Mars: { sig, n: 'Aries', degree: 8 },
    Jupiter: { sig, n: 'Sagittarius', degree: 12 },
    Saturn: { sig, n: 'Capricorn', degree: 25 },
    Uranus: { sig, n: 'Aquarius', degree: 3 },
    Neptune: { sig, n: 'Pisces', degree: 18 },
    Pluto: { sig, n: 'Scorpio', degree: 22 },
  };

  const mockAspects: any = [
    { planet1: 'Sun', planet2: 'Moon', type: 'sextile' },
    { planet1: 'Mars', planet2: 'Jupiter', type: 'trine' },
    { planet1: 'Venus', planet2: 'Saturn', type: 'square' },
  ];

  let signEnergyStates: SignEnergyState[];
  let chakraService: ChakraService;
  let chakraEnergyStates: ChakraEnergyState[];

  beforeAll(() => {
    // Calculate sign energy states
    signEnergyStates = calculateSignEnergyStates(mockPlanetaryPositions, mockAspects);

    // Create chakra service
    chakraService = new ChakraService();

    // Calculate chakra energy states
    chakraEnergyStates = chakraService.calculateChakraEnergyStates(signEnergyStates);
  });

  test('Sign energy states are calculated correctly', () => {
    expect(signEnergyStates).toBeDefined();
    expect(signEnergyStates.length).toBe(12); // All zodiac signs

    // Check that each sign has the required properties
    signEnergyStates.forEach(state => {
      expect(state).toHaveProperty('sign');
      expect(state).toHaveProperty('baseEnergy');
      expect(state).toHaveProperty('planetaryModifiers');
      expect(state).toHaveProperty('currentEnergy');
    });

    // Energy levels should be between 0.1 and 1.0
    signEnergyStates.forEach(state => {
      expect(state.currentEnergy).toBeGreaterThanOrEqual(0.1);
      expect(state.currentEnergy).toBeLessThanOrEqual(1.0);
    });
  });

  test('Chakra energy states are calculated correctly', () => {
    expect(chakraEnergyStates).toBeDefined();
    expect(chakraEnergyStates.length).toBe(7); // All chakras

    // Check that each chakra has the required properties
    chakraEnergyStates.forEach(state => {
      expect(state).toHaveProperty('chakra');
      expect(state).toHaveProperty('energyLevel');
      expect(state).toHaveProperty('properties');
      expect(state).toHaveProperty('balanceState');
      expect(state).toHaveProperty('relatedSigns');
    });
  });

  test('Food recommendations are generated from chakra energy states', () => {
    // Artificially set some chakras to underactive to generate recommendations
    const modifiedChakraStates: any = chakraEnergyStates.map(state => ({
      ...state,
      energyLevel: 0.3, // Set to underactive;
      balanceState: 'underactive' as const,
    }));

    const recommendations: any = getFoodRecommendationsFromChakras(modifiedChakraStates);

    expect(recommendations).toHaveProperty('primaryFoods');
    expect(recommendations).toHaveProperty('secondaryFoods');
    expect(recommendations).toHaveProperty('avoidFoods');
    expect(recommendations).toHaveProperty('balancingMeals');

    // At least some recommendations should be present
    expect(recommendations.primaryFoods.length).toBeGreaterThan(0);
    expect(recommendations.balancingMeals.length).toBeGreaterThan(0);
  });

  test('Zodiac sign food recommendations', () => {
    const zodiacSigns: any[] = [
      'aries',
      'taurus',
      'gemini',
      'cancer',
      'leo',
      'virgo',
      'libra',
      'scorpio',
      'sagittarius',
      'capricorn',
      'aquarius',
      'pisces',
    ];

    zodiacSigns.forEach(sign => {
      const recommendations: any = getZodiacSignFoodRecommendations(sign);
      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
    });
  });

  test('Chakra service provides dietary suggestions', () => {
    // Artificially set some chakras to underactive to generate recommendations
    const modifiedChakraStates: any = chakraEnergyStates.map((state: any, index: any) => ({
      ...state,
      energyLevel: index % 3 === 0 ? 0.3 : 0.6, // Set some to underactive;
      balanceState: index % 3 === 0 ? ('underactive' as const) : ('balanced' as const),
    }));

    const suggestions: any = chakraService.suggestDietaryAdjustments(modifiedChakraStates);

    expect(suggestions).toBeDefined();
    expect(Array.isArray(suggestions)).toBe(true);
    expect(suggestions.length).toBeGreaterThan(0);
  });
});
