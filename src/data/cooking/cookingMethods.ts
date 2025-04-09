// src/data/cooking/cookingMethods.ts

import type { 
  CookingMethod, 
  ElementalProperties, 
  ZodiacSign, 
  AstrologicalState 
} from '@/types/alchemy';

interface CookingMethodData {
  name: CookingMethod;
  description: string;
  elementalEffect: ElementalProperties;
  duration: {
    min: number;
    max: number;
  };
  suitable_for: string[];
  benefits: string[];
  astrologicalInfluences?: {
    favorableZodiac: ZodiacSign[];
    unfavorableZodiac: ZodiacSign[];
    lunarPhaseEffect?: Record<string, number>;
  };
}

export const cookingMethods: Record<CookingMethod, CookingMethodData> = {
  baking: {
    name: 'baking',
    description: 'Cooking food by exposing it to dry heat in an enclosed space',
    elementalEffect: {
      Fire: 0.4,
      Air: 0.3,
      Earth: 0.2,
      Water: 0.1
    },
    duration: {
      min: 20,
      max: 180
    },
    suitable_for: ['breads', 'pastries', 'casseroles', 'meat', 'vegetables'],
    benefits: ['even cooking', 'develops flavors', 'retains moisture'],
    astrologicalInfluences: {
      favorableZodiac: ['leo', 'aries', 'sagittarius'],
      unfavorableZodiac: ['cancer', 'pisces', 'scorpio']
    }
  },
  
  boiling: {
    name: 'boiling',
    description: 'Cooking food in water or liquid at high heat',
    elementalEffect: {
      Water: 0.5,
      Fire: 0.3,
      Air: 0.1,
      Earth: 0.1
    },
    duration: {
      min: 5,
      max: 120
    },
    suitable_for: ['pasta', 'rice', 'vegetables', 'eggs', 'dumplings'],
    benefits: ['quick cooking', 'consistent results', 'retains nutrients'],
    astrologicalInfluences: {
      favorableZodiac: ['cancer', 'scorpio', 'pisces'],
      unfavorableZodiac: ['leo', 'aries', 'sagittarius']
    }
  },

  // ... (your existing methods with added astrological influences)

  fermentation: {
    name: 'fermentation',
    description: 'Biological transformation of food through microbial activity',
    elementalEffect: {
      Water: 0.3,
      Earth: 0.3,
      Air: 0.3,
      Fire: 0.1
    },
    duration: {
      min: 1440, // 24 hours
      max: 10080 // 7 days
    },
    suitable_for: ['vegetables', 'dairy', 'grains', 'beverages'],
    benefits: ['probiotic development', 'enhanced nutrition', 'natural preservation'],
    astrologicalInfluences: {
      favorableZodiac: ['virgo', 'taurus', 'capricorn'],
      unfavorableZodiac: ['gemini', 'libra', 'aquarius'],
      lunarPhaseEffect: {
        'new_moon': 1.2,
        'full_moon': 0.8
      }
    }
  },

  smoking: {
    name: 'smoking',
    description: 'Preserving and flavoring food with smoke',
    elementalEffect: {
      Fire: 0.4,
      Air: 0.4,
      Earth: 0.2
    },
    duration: {
      min: 120,
      max: 720
    },
    suitable_for: ['meats', 'fish', 'cheese', 'vegetables'],
    benefits: ['preservation', 'unique flavor', 'traditional method'],
    astrologicalInfluences: {
      favorableZodiac: ['leo', 'aries', 'sagittarius'],
      unfavorableZodiac: ['cancer', 'pisces', 'scorpio']
    }
  }
};

// Helper functions for astrological integration
export const getAstrologicalEffect = (
  method: CookingMethod,
  astroState: AstrologicalState
): number => {
  const methodData = cookingMethods[method];
  if (!methodData.astrologicalInfluences) return 1;

  let effect = 1;

  // Zodiac influence
  if (methodData.astrologicalInfluences.favorableZodiac.includes(astroState.sunSign)) {
    effect *= 1.2;
  }
  if (methodData.astrologicalInfluences.unfavorableZodiac.includes(astroState.sunSign)) {
    effect *= 0.8;
  }

  // Lunar phase influence
  const lunarEffect = methodData.astrologicalInfluences.lunarPhaseEffect?.[astroState.lunarPhase];
  if (lunarEffect) {
    effect *= lunarEffect;
  }

  return effect;
};

export const calculateModifiedElementalEffect = (
  method: CookingMethod,
  astroState: AstrologicalState,
  duration: number,
  temperature?: number
): ElementalProperties => {
  const baseEffect = cookingMethods[method].elementalEffect;
  const astroEffect = getAstrologicalEffect(method, astroState);
  const durationEffect = Math.min(duration / cookingMethods[method].duration.max, 2);
  const tempEffect = temperature ? Math.min(temperature / 200, 1.5) : 1;

  return Object.entries(baseEffect).reduce((acc, [element, value]) => ({
    ...acc,
    [element]: value * astroEffect * durationEffect * tempEffect
  }), {} as ElementalProperties);
};

export default cookingMethods;