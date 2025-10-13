import type { CookingMethodData } from '@/types/cookingMethod';
import type { CookingMethod } from '@/types/shared';

/**
 * Cryo-Cooking: A molecular gastronomy technique that uses extreme cold for cooking,
 * freezing, and creating unique textures with liquid nitrogen or dry ice
 */
export const _cryoCooking: CookingMethodData = {
  name: 'Cryo-Cooking' as CookingMethod,
  description: 'A molecular gastronomy technique that utilizes extreme cold, typically from liquid nitrogen or dry ice to rapidly freeze foods, create unique textures, and prepare novel culinary creations.',
  elementalEffect: {
    Fire: 0.0,
    Water: 0.3,
    Earth: 0.1,
    Air: 0.8
},
  duration: {
    min: 0.5, // 30 seconds,
    max: 10, // 10 minutes
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
  benefits: [
    'Preserves nutrients that might be lost in conventional cooking',
    'Creates novel textures without additional ingredients',
    'Can reduce need for additives in frozen desserts'
  ],
  history: 'Though scientific uses of extreme cold have existed for centuries, cryo-cooking in gastronomy gained prominence in the early 2000s as part of the molecular gastronomy movement. Chefs like Heston Blumenthal and Ferran Adrià pioneered its culinary applications.',
  modernVariations: [
    'Flash freezing (rapid freezing to preserve structure)',
    'Cryo-shattered foods (frozen brittle for unique textures)',
    'Frozen powders (freeze-pulverized ingredients)',
    'Nitrogen-cooled sorbets and ice creams',
    'Cryo-blanching (quick freeze before cooking)',
    'Smoke freezing (capturing frozen smoke)'
  ],
  optimalTemperatures: {
    liquidNitrogen: -196, // °C,
    dryIce: -78, // °C
  },
  toolsRequired: [
    'Liquid nitrogen',
    'Dry ice',
    'Insulated container',
    'Safety gloves',
    'Safety goggles',
    'Metal bowls',
    'Insulated utensils',
    'Anti-griddle (for less extreme applications)'
  ],
  healthConsiderations: [
    'Requires proper safety protocols to prevent burns',
    'All nitrogen must be completely evaporated before consumption',
    'Not suitable for all ingredients or preparations',
    'Should only be performed by trained professionals'
  ]
}
