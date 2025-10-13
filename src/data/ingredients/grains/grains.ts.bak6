import type { IngredientMapping } from '@/data/ingredients/types';
import { fixIngredientMappings } from '@/utils/elementalUtils';

// Grains ingredients extracted from cuisine files
const rawGrains: Record<string, Partial<IngredientMapping>> = {
  flour: {
    name: 'flour',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  rice: {
    name: 'rice',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  all_purpose_flour: {
    name: 'all-purpose flour',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  whole_grain_bread: {
    name: 'whole grain bread',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  steel_cut_oats: {
    name: 'steel-cut oats',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  breadcrumbs: {
    name: 'breadcrumbs',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  arborio_rice: {
    name: 'arborio rice',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  bread_stuffing: {
    name: 'bread stuffing',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  cheong_fun__rice_noodle_rolls_: {
    name: 'cheong fun (rice noodle rolls)',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  glutinous_rice: {
    name: 'glutinous rice',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  rustic_bread: {
    name: 'rustic bread',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  white_sandwich_bread: {
    name: 'white sandwich bread',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  idli_rice: {
    name: 'idli rice',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  flattened_rice: {
    name: 'flattened rice',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  basmati_rice: {
    name: 'basmati rice',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  steamed_rice: {
    name: 'steamed rice',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  sushi_rice: {
    name: 'sushi rice',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  short_grain_rice: {
    name: 'short grain rice',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  sliced_rice_cakes: {
    name: 'sliced rice cakes',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  rice_cakes: {
    name: 'rice cakes',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  rice_flour: {
    name: 'rice flour',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  flatbread: {
    name: 'flatbread',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  jasmine_rice: {
    name: 'jasmine rice',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  glass_noodles: {
    name: 'glass noodles',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  rice_noodles: {
    name: 'rice noodles',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  sticky_rice: {
    name: 'sticky rice',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  tapioca_flour: {
    name: 'tapioca flour',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  glutinous_rice_flour: {
    name: 'glutinous rice flour',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  thick_rice_noodles: {
    name: 'thick rice noodles',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  broken_rice: {
    name: 'broken rice',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
};

// Export processed ingredients
export const grainsIngredients = fixIngredientMappings(rawGrains);
