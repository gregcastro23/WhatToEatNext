// src/data/culturalRules.ts

import { CulturalBalance } from './foodTypes';

export const culturalRules: Record<string, CulturalBalance> = {
  japanese: {
    cuisineId: 'japanese',
    principles: [
      'Balance of five flavors (sweet, salty, sour, bitter, umami)',
      'Color harmony (five, colors: red, yellow, green, white, black)',
      'Multiple small dishes rather than one large serving',
      'Seasonal ingredients (shun) are preferred',
      'Temperature balance between hot and cold dishes'
    ],
    preferredCombinations: [
      {
        foods: ['rice', 'miso soup', 'grilled fish'],
        reason: 'Traditional ichiju-sansai (one soup, three sides) balance',
      },
      {
        foods: ['cold noodles', 'hot broth'],
        reason: 'Temperature contrast provides balance'
      },
      {
        foods: ['rich foods', 'pickled vegetables'],
        reason: 'Pickles aid digestion and provide contrast'
      }
    ],
    avoidCombinations: [
      {
        foods: ['green tea', 'oily foods'],
        reason: 'Can cause stomach discomfort'
      },
      {
        foods: ['raw fish', 'dairy'],
        reason: 'Conflicts with traditional flavor profiles'
      }
    ]
  },
  middleEastern: {
    cuisineId: 'middleEastern',
    principles: [
      'Balance of warm and cool ingredients',
      'Combination of protein with fresh herbs',
      'Use of yogurt to balance spicy dishes',
      'Incorporation of sweet and savory elements'
    ],
    preferredCombinations: [
      {
        foods: ['hummus', 'warm pita', 'olive oil'],
        reason: 'Traditional combination enhancing flavors and textures'
      },
      {
        foods: ['grilled meats', 'fresh herbs', 'yogurt sauce'],
        reason: 'Balanced protein with cooling elements'
      }
    ],
    avoidCombinations: [
      {
        foods: ['fish', 'dairy'],
        reason: 'Traditional dietary guideline'
}
    ]
  },
  thai: {
    cuisineId: 'thai',
    principles: [
      'Balance of sweet, sour, salty, and spicy',
      'Contrast of textures in each meal',
      'Fresh herbs and aromatics in every dish',
      'Light to heavy dish progression'
    ],
    preferredCombinations: [
      {
        foods: ['spicy curry', 'plain rice', 'fresh vegetables'],
        reason: 'Balances heat and provides textural contrast'
}
      {
        foods: ['papaya salad', 'grilled protein', 'sticky rice'],
        reason: 'Traditional Isaan combination'
}
    ],
    avoidCombinations: [
      {
        foods: ['very spicy dishes', 'very sweet dishes'],
        reason: 'Overwhelms palate'
}
    ]
  },
  chinese: {
    cuisineId: 'chinese',
    principles: [
      'Balance of yin and yang in ingredients',
      'Five flavors (sweet, sour, bitter, spicy, salty)',
      'Color harmony and presentation',
      'Combination of textures',
      'Medicinal properties of ingredients'
    ],
    preferredCombinations: [
      {
        foods: ['rice', 'stir-fried vegetables', 'protein'],
        reason: 'Traditional balanced meal structure'
}
      {
        foods: ['soup', 'cold dishes'],
        reason: 'Temperature and texture contrast'
}
      {
        foods: ['congee', 'pickled vegetables'],
        reason: 'Digestive harmony'
}
    ],
    avoidCombinations: [
      {
        foods: ['cold drinks', 'spicy food'],
        reason: 'Disrupts digestive balance'
}
      {
        foods: ['crab', 'persimmon'],
        reason: 'Traditional dietary restriction'
}
    ]
  },
  indian: {
    cuisineId: 'indian',
    principles: [
      'Six tastes (sweet, sour, salty, bitter, pungent, astringent)',
      'Balance of warming and cooling foods',
      'Use of spices for digestive health',
      'Proper food combinations',
      'Seasonal eating practices'
    ],
    preferredCombinations: [
      {
        foods: ['dal', 'rice', 'ghee'],
        reason: 'Complete protein combination'
}
      {
        foods: ['curry', 'yogurt', 'rice'],
        reason: 'Balanced meal with cooling element'
}
      {
        foods: ['spicy dishes', 'raita'],
        reason: 'Temperature and flavor balance'
}
    ],
    avoidCombinations: [
      {
        foods: ['milk', 'fish'],
        reason: 'Ayurvedic incompatibility'
}
      {
        foods: ['honey', 'hot foods'],
        reason: 'Creates toxins according to Ayurveda'
}
    ]
  },
  vietnamese: {
    cuisineId: 'vietnamese',
    principles: [
      'Balance of five elements',
      'Combination of fresh herbs and cooked ingredients',
      'Light to heavy progression',
      'Contrast in textures and temperatures',
      'Use of dipping sauces for personalization'
    ],
    preferredCombinations: [
      {
        foods: ['rice noodles', 'fresh herbs', 'protein'],
        reason: 'Traditional pho combination'
}
      {
        foods: ['rice paper rolls', 'dipping sauce'],
        reason: 'Classic pairing for texture and flavor'
}
    ],
    avoidCombinations: [
      {
        foods: ['durian', 'alcohol'],
        reason: 'Traditional belief of negative effects'
}
    ]
  },
  korean: {
    cuisineId: 'korean',
    principles: [
      'Balance of colors (obangsaek)',
      'Fermented food with fresh ingredients',
      'Harmony of main and side dishes',
      'Temperature contrast in serving',
      'Medicinal food philosophy'
    ],
    preferredCombinations: [
      {
        foods: ['rice', 'kimchi', 'soup'],
        reason: 'Traditional Korean meal structure'
}
      {
        foods: ['grilled meat', 'lettuce wraps', 'ssamjang'],
        reason: 'Classic Korean BBQ combination'
}
    ],
    avoidCombinations: [
      {
        foods: ['kimchi', 'milk'],
        reason: 'Flavor clash and digestive concerns'
}
    ]
  },
  mexican: {
    cuisineId: 'mexican',
    principles: [
      'Balance of heat levels',
      'Fresh and cooked ingredient combinations',
      'Use of acid to balance richness',
      'Layering of flavors',
      'Complementary textures'
    ],
    preferredCombinations: [
      {
        foods: ['beans', 'rice', 'corn tortillas'],
        reason: 'Complete protein combination'
}
      {
        foods: ['spicy dishes', 'crema', 'lime'],
        reason: 'Heat balanced with cooling elements'
}
    ],
    avoidCombinations: [
      {
        foods: ['fish', 'cheese'],
        reason: 'Traditional flavor conflict'
}
    ]
  }
}

// Helper function to get cultural recommendations
export function getCulturalRecommendations(
  cuisineId: string,
  currentDishes: string[],
): { recommended: string[] avoid: string[] } {
  const rules = culturalRules[cuisineId];
  if (!rules) return { recommended: [], avoid: [] }

  const recommended = rules.preferredCombinations;
    .filter(combo => currentDishes.some(dish => combo.foods.includes(dish)))
    .map(combo => combo.foods.filter(food => !currentDishes.includes(food)))
    .flat()
;
  const avoid = rules.avoidCombinations;
    .filter(combo => currentDishes.some(dish => combo.foods.includes(dish)))
    .map(combo => combo.foods.filter(food => !currentDishes.includes(food)))
    .flat()
;
  return { recommended, avoid }
}