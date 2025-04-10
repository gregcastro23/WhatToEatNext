import type { CookingMethodData } from '@/types/cookingMethod';

/**
 * Cryo-Cooking: A molecular gastronomy technique that uses extreme cold for cooking,
 * freezing, and creating unique textures with liquid nitrogen or dry ice
 */
export const cryoCooking: CookingMethodData = {
  name: 'Cryo-Cooking',
  description: 'A molecular gastronomy technique that utilizes extreme cold, typically from liquid nitrogen or dry ice, to rapidly freeze foods, create unique textures, and prepare novel culinary creations.',
  history: 'Though scientific uses of extreme cold have existed for centuries, cryo-cooking in gastronomy gained prominence in the early 2000s as part of the molecular gastronomy movement. Chefs like Heston Blumenthal and Ferran Adrià pioneered its culinary applications.',
  science: 'Cryo-cooking works by rapidly freezing foods at extremely low temperatures (-196°C for liquid nitrogen), which forms smaller ice crystals than conventional freezing. This preserves cellular structure better and creates unique textures. The extreme cold can also transform liquids into powders or create dramatic visual effects.',
  alchemical_properties: {
    element: 'Air',
    planetary_influence: 'Uranus',
    effect_on_ingredients: 'Transforms States, preserves Essence, suspends Matter'
  },
  suitable_for: [
    'Creams',
    'Mousses',
    'Fruits',
    'Herbs',
    'Alcohol-based mixtures',
    'Sauces',
    'Custards'
  ],
  variations: [
    'Flash freezing (rapid freezing to preserve structure)',
    'Cryo-shattered foods (frozen brittle for unique textures)',
    'Frozen powders (freeze-pulverized ingredients)',
    'Nitrogen-cooled sorbets and ice creams',
    'Cryo-blanching (quick freeze before cooking)',
    'Smoke freezing (capturing frozen smoke)'
  ],
  time_range: {
    min: 0.5, // 30 seconds
    max: 10   // 10 minutes
  },
  temperature_range: {
    min: -196, // °C (liquid nitrogen)
    max: -78   // °C (dry ice)
  },
  tools: [
    'Liquid nitrogen',
    'Dry ice',
    'Insulated container',
    'Safety gloves',
    'Safety goggles',
    'Metal bowls',
    'Insulated utensils',
    'Anti-griddle (for less extreme applications)'
  ],
  famous_dishes: [
    'Nitro-scrambled ice cream',
    'Dragon\'s breath (liquid nitrogen-infused cereal)',
    'Frozen herb dust',
    'Instant sorbets',
    'Cryo-spheres with liquid centers',
    'Frozen cocktail pearls'
  ],
  health_benefits: [
    'Preserves nutrients that might be lost in conventional cooking',
    'Creates novel textures without additional ingredients',
    'Can reduce need for additives in frozen desserts'
  ],
  health_considerations: [
    'Requires proper safety protocols to prevent burns',
    'All nitrogen must be completely evaporated before consumption',
    'Not suitable for all ingredients or preparations',
    'Should only be performed by trained professionals'
  ]
}; 