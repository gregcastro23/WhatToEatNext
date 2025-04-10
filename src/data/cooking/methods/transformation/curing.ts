import type { CookingMethodData } from '@/types/cookingMethod';

/**
 * Curing: A food preservation method that removes moisture and enhances flavor
 * through the addition of salt, sugar, nitrates, or other compounds
 */
export const curing: CookingMethodData = {
  name: 'Curing',
  description: 'A preservation technique that draws moisture out of food through the use of salt, sugar, nitrates, or other compounds, thereby inhibiting bacterial growth and enhancing flavor.',
  history: 'Curing dates back to ancient civilizations where salt was used to preserve meat and fish. It was essential for food preservation before refrigeration and allowed food to be stored and transported over long distances.',
  science: 'Curing works by drawing out moisture through osmosis, creating an environment inhospitable to harmful bacteria. The salt and other curing agents denature proteins and inhibit microbial growth, while also contributing to flavor development through enzymatic reactions.',
  alchemical_properties: {
    element: 'Earth',
    planetary_influence: 'Saturn',
    effect_on_ingredients: 'Stabilizes Matter, enhances Substance, reduces Water element'
  },
  suitable_for: [
    'Meats',
    'Fish',
    'Vegetables',
    'Eggs',
    'Citrus peels'
  ],
  variations: [
    'Dry curing (with salt and spices)',
    'Wet curing/brining (submerged in salt solution)',
    'Equilibrium curing (precise salt percentage)',
    'Sugar curing (using sugar as primary agent)',
    'Nitrate/nitrite curing (using pink salt)'
  ],
  time_range: {
    min: 180, // 3 hours
    max: 8640 // 6 months (in minutes)
  },
  temperature_range: {
    min: 1, // °C (refrigeration temperature)
    max: 18 // °C (cool room temperature)
  },
  tools: [
    'Salt',
    'Curing salts',
    'Airtight containers',
    'Cheesecloth',
    'Hooks for hanging',
    'Weights for pressing',
    'Refrigerator or cool storage'
  ],
  famous_dishes: [
    'Prosciutto',
    'Gravlax',
    'Beef jerky',
    'Corned beef',
    'Salt cod',
    'Preserved lemons',
    'Country ham'
  ],
  health_benefits: [
    'Preservation without artificial additives',
    'Enhanced flavor development',
    'Some fermented cured products contain beneficial probiotics'
  ],
  health_considerations: [
    'High sodium content',
    'Nitrates and nitrites used in some curing may form nitrosamines',
    'Proper technique is essential to prevent harmful bacterial growth'
  ]
}; 