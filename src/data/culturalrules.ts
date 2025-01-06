// src/data/culturalRules.ts

import { CulturalBalance } from './foodTypes';

export const culturalRules: Record<string, CulturalBalance> = {
  japanese: {
    cuisineId: 'japanese',
    principles: [
      "Balance of five flavors (sweet, salty, sour, bitter, umami)",
      "Color harmony (five colors: red, yellow, green, white, black)",
      "Multiple small dishes rather than one large serving",
      "Seasonal ingredients (shun) are preferred",
      "Temperature balance between hot and cold dishes"
    ],
    preferredCombinations: [
      {
        foods: ['rice', 'miso soup', 'grilled fish'],
        reason: 'Traditional ichiju-sansai (one soup, three sides) balance'
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
      "Balance of warm and cool ingredients",
      "Combination of protein with fresh herbs",
      "Use of yogurt to balance spicy dishes",
      "Incorporation of sweet and savory elements"
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
      "Balance of sweet, sour, salty, and spicy",
      "Contrast of textures in each meal",
      "Fresh herbs and aromatics in every dish",
      "Light to heavy dish progression"
    ],
    preferredCombinations: [
      {
        foods: ['spicy curry', 'plain rice', 'fresh vegetables'],
        reason: 'Balances heat and provides textural contrast'
      },
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
  // Add other cuisines following the same pattern
};

// Helper function to get cultural recommendations
export function getCulturalRecommendations(
  cuisineId: string,
  currentDishes: string[]
): { recommended: string[]; avoid: string[] } {
  const rules = culturalRules[cuisineId];
  if (!rules) return { recommended: [], avoid: [] };

  const recommended = rules.preferredCombinations
    .filter(combo => 
      currentDishes.some(dish => combo.foods.includes(dish))
    )
    .map(combo => combo.foods.filter(food => !currentDishes.includes(food)))
    .flat();

  const avoid = rules.avoidCombinations
    .filter(combo => 
      currentDishes.some(dish => combo.foods.includes(dish))
    )
    .map(combo => combo.foods.filter(food => !currentDishes.includes(food)))
    .flat();

  return { recommended, avoid };
}