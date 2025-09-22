import type { IngredientMapping } from '@/data/ingredients/types';
import type { _, ZodiacSign } from '@/types/alchemy';
import type { Season } from '@/types/seasons';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawVinegars = {
  rice_vinegar: {
    name: 'Rice Vinegar',
    category: 'vinegar',
    subCategory: 'grain',
    elementalProperties: {
      Water: 0.4,
      Air: 0.3,
      Earth: 0.2,
      Fire: 0.1
    },
    qualities: ['mild', 'balanced', 'clean'],
    origin: ['Asian', 'Japanese'],
    nutritionalProfile: {
      calories: 0,
      carbs_g: 0,
      acidity: '4-5%',
      notes: 'Very mild and versatile'
    },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Mercury'],
      favorableZodiac: ['cancer', 'virgo', 'pisces'] as any[],
      elementalAffinity: {
        base: 'Water',
        secondary: 'Air'
      }
    },
    season: ['all'] as Season[],
    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced'],
        secondary: ['versatile'],
        notes: 'Versatile rice vinegar for various uses'
      },
      uses: ['sushi', 'salad dressing', 'marinades', 'pickling'],
      pairings: ['sesame oil', 'ginger', 'soy sauce']
    },
    storage: {
      temperature: 'cool, dry place',
      duration: '2+ years',
      notes: 'Keep tightly sealed'
    }
  },
  apple_cider_vinegar: {
    name: 'Apple Cider Vinegar',
    category: 'vinegar',
    subCategory: 'fruit',
    elementalProperties: {
      Water: 0.3,
      Fire: 0.3,
      Earth: 0.2,
      Air: 0.2
    },
    qualities: ['tangy', 'fruity', 'complex'],
    origin: ['American', 'European'],
    nutritionalProfile: {
      calories: 3,
      carbs_g: 0.1,
      acidity: '5-6%',
      notes: 'Contains beneficial enzymes when unfiltered'
    },
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Sun'],
      favorableZodiac: ['taurus', 'leo', 'libra'] as any[],
      elementalAffinity: {
        base: 'Fire',
        secondary: 'Water'
      }
    },
    season: ['autumn', 'winter'] as Season[],
    culinaryProfile: {
      flavorProfile: {
        primary: ['tangy'],
        secondary: ['fruity'],
        notes: 'Apple-forward with pleasant acidity'
      },
      uses: ['salad dressing', 'marinades', 'health tonic', 'baking'],
      pairings: ['honey', 'dijon mustard', 'olive oil']
    },
    storage: {
      temperature: 'room temperature',
      duration: '2+ years',
      notes: 'Unfiltered versions may develop sediment'
    }
  },
  balsamic_vinegar: {
    name: 'Balsamic Vinegar',
    category: 'vinegar',
    subCategory: 'wine',
    elementalProperties: {
      Water: 0.3,
      Fire: 0.4,
      Earth: 0.2,
      Air: 0.1
    },
    qualities: ['sweet', 'complex', 'aged'],
    origin: ['Italian', 'Modena'],
    nutritionalProfile: {
      calories: 5,
      carbs_g: 1,
      acidity: '6%',
      notes: 'Contains natural sugars from grape must'
    },
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Jupiter'],
      favorableZodiac: ['taurus', 'libra', 'sagittarius'] as any[],
      elementalAffinity: {
        base: 'Fire',
        secondary: 'Water'
      }
    },
    season: ['all'] as Season[],
    culinaryProfile: {
      flavorProfile: {
        primary: ['sweet'],
        secondary: ['complex'],
        notes: 'Rich, sweet-tart flavor from aging'
      },
      uses: ['salad dressing', 'reduction sauce', 'cheese pairing', 'fruit'],
      pairings: ['olive oil', 'strawberries', 'mozzarella', 'arugula']
    },
    storage: {
      temperature: 'room temperature',
      duration: 'indefinite when properly stored',
      notes: 'Quality improves with age'
    }
  },
  red_wine_vinegar: {
    name: 'Red Wine Vinegar',
    category: 'vinegar',
    subCategory: 'wine',
    elementalProperties: {
      Water: 0.4,
      Fire: 0.3,
      Earth: 0.2,
      Air: 0.1
    },
    qualities: ['robust', 'tangy', 'fruity', 'complex'],
    origin: ['Mediterranean', 'European'],
    nutritionalProfile: {
      calories: 2,
      carbs_g: 0.4,
      acidity: '6-7%',
      notes: 'Contains antioxidants from red wine'
    },
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Venus'],
      favorableZodiac: ['aries', 'taurus', 'scorpio'] as any[],
      elementalAffinity: {
        base: 'Fire',
        secondary: 'Water'
      }
    },
    season: ['all'] as Season[],
    culinaryProfile: {
      flavorProfile: {
        primary: ['tangy'],
        secondary: ['robust'],
        notes: 'Bold, wine-forward flavor'
      },
      uses: ['vinaigrettes', 'marinades', 'sauces', 'braising'],
      pairings: ['olive oil', 'shallots', 'herbs', 'red meat']
    },
    storage: {
      temperature: 'room temperature',
      duration: '2+ years',
      notes: 'May develop sediment over time'
    }
  },
  white_wine_vinegar: {
    name: 'White Wine Vinegar',
    category: 'vinegar',
    subCategory: 'wine',
    elementalProperties: {
      Water: 0.4,
      Air: 0.3,
      Fire: 0.2,
      Earth: 0.1
    },
    qualities: ['crisp', 'clean', 'bright'],
    origin: ['French', 'European'],
    nutritionalProfile: {
      calories: 1,
      carbs_g: 0.3,
      acidity: '6%',
      notes: 'Light and clean flavor'
    },
    astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Venus'],
      favorableZodiac: ['gemini', 'libra', 'aquarius'] as any[],
      elementalAffinity: {
        base: 'Air',
        secondary: 'Water'
      }
    },
    season: ['spring', 'summer'] as Season[],
    culinaryProfile: {
      flavorProfile: {
        primary: ['crisp'],
        secondary: ['clean'],
        notes: 'Light, clean acidity perfect for delicate dishes'
      },
      uses: ['light vinaigrettes', 'white sauces', 'fish marinades', 'herb infusions'],
      pairings: ['herbs', 'shallots', 'white wine', 'light oils']
    },
    storage: {
      temperature: 'room temperature',
      duration: '2+ years',
      notes: 'Keep away from direct light'
    }
  }
},

// Fix the ingredient mappings to ensure they have all required properties
export const _vinegars: Record<string, IngredientMapping> = fixIngredientMappings(
  rawVinegars as unknown as Record<string, Partial<IngredientMapping>>,
)
