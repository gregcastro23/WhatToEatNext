import type { CookingMethodData } from '@/types/cookingMethod';
import type { CookingMethod } from '@/types/shared';

/**
 * Pressure Cooking: A cooking method that uses steam under pressure to cook food
 * quickly while retaining moisture and developing flavors
 */
export const _pressureCooking: CookingMethodData = {
  name: 'Pressure Cooking' as CookingMethod,
  description: 'A cooking method that uses steam pressure in a sealed vessel to cook food quickly. The high pressure raises the boiling point of water, allowing food to cook at higher temperatures and much faster than conventional methods.',
  elementalEffect: {
    Fire: 0.3,
    Water: 0.8,
    Earth: 0.2,
    Air: 0.1
},
  duration: {
    min: 5, // minutes,
    max: 120, // minutes
  },
  suitable_for: [
    'Tough cuts of meat',
    'Dried beans and legumes',
    'Whole grains',
    'Root vegetables',
    'Stocks and broths',
    'Stews and curries',
    'Tough vegetables'
  ],
  benefits: [
    'Preserves more nutrients due to shorter cooking times',
    'Requires less fat for flavor development',
    'Breaks down lectins in beans, making them more digestible',
    'Enables cooking without added sodium or preservatives',
    'Tenderizes tough cuts of meat without excessive fat'
  ],
  history: 'Pressure cooking dates back to the 1600s when French physicist Denis Papin invented the \'steam digester,\' an early pressure cooker. The modern pressure cooker was refined in the early 20th century, with significant home adoption after World War II. Electric programmable pressure cookers like the Instant Pot have revitalized the method in the 21st century.',
  modernVariations: [
    'Stovetop pressure cookers (traditional, manual control)',
    'Electric pressure cookers (programmed, automatic)',
    'Multi-cookers (combine pressure cooking with other functions)',
    'Commercial pressure steamers (high-volume applications)',
    'Low-pressure cooking (gentler, slightly longer process)'
  ],
  optimalTemperatures: {
    lowPressure: 107, // °C (at 5 psi),
    highPressure: 121, // °C (at 15 psi)
  },
  toolsRequired: [
    'Pressure cooker',
    'Pressure release valve',
    'Heat source',
    'Trivet or steamer basket',
    'Timer',
    'Silicone spatula (for non-scratching)'
  ],
  healthConsiderations: [
    'Follow safety instructions carefully to prevent injuries',
    'Not suitable for foods requiring texture from evaporation',
    'Some nutrients sensitive to high heat may be reduced',
    'Not ideal for foods needing monitoring during cooking'
  ]
}
