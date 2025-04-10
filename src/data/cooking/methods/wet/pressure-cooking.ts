import type { CookingMethodData } from '@/types/cookingMethod';
import type { ThermodynamicProperties } from '@/types/alchemy';

/**
 * Pressure Cooking: A cooking method that uses steam under pressure to cook food
 * quickly while retaining moisture and developing flavors
 */
export const pressureCooking: CookingMethodData = {
  name: 'Pressure Cooking',
  description: 'A cooking method that uses steam pressure in a sealed vessel to cook food quickly. The high pressure raises the boiling point of water, allowing food to cook at higher temperatures and much faster than conventional methods.',
  history: 'Pressure cooking dates back to the 1600s when French physicist Denis Papin invented the "steam digester," an early pressure cooker. The modern pressure cooker was refined in the early 20th century, with significant home adoption after World War II. Electric programmable pressure cookers like the Instant Pot have revitalized the method in the 21st century.',
  science: 'Pressure cookers work by trapping steam, which increases the pressure inside the vessel. This raises the boiling point of water above 100°C (212°F)—typically to about 120°C (250°F)—allowing for faster cooking. The high pressure also forces moisture into the food, making it ideal for tenderizing tough cuts of meat and cooking dense foods quickly.',
  alchemical_properties: {
    element: 'Water',
    planetary_influence: 'Mars',
    effect_on_ingredients: 'Rapidly transforms Matter, intensifies Essence, accelerates alchemical processes'
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
  variations: [
    'Stovetop pressure cookers (traditional, manual control)',
    'Electric pressure cookers (programmed, automatic)',
    'Multi-cookers (combine pressure cooking with other functions)',
    'Commercial pressure steamers (high-volume applications)',
    'Low-pressure cooking (gentler, slightly longer process)'
  ],
  time_range: {
    min: 5, // minutes
    max: 120 // minutes
  },
  temperature_range: {
    min: 107, // °C (at 5 psi)
    max: 121 // °C (at 15 psi)
  },
  tools: [
    'Pressure cooker',
    'Pressure release valve',
    'Heat source',
    'Trivet or steamer basket',
    'Timer',
    'Silicone spatula (for non-scratching)'
  ],
  famous_dishes: [
    'Black beans',
    'Pulled pork',
    'Beef stew',
    'Rice pudding',
    'Congee',
    'Risotto',
    'Bone broth'
  ],
  health_benefits: [
    'Preserves more nutrients due to shorter cooking times',
    'Requires less fat for flavor development',
    'Breaks down lectins in beans, making them more digestible',
    'Enables cooking without added sodium or preservatives',
    'Tenderizes tough cuts of meat without excessive fat'
  ],
  health_considerations: [
    'Follow safety instructions carefully to prevent injuries',
    'Not suitable for foods requiring texture from evaporation',
    'Some nutrients sensitive to high heat may be reduced',
    'Not ideal for foods needing monitoring during cooking'
  ],
  thermodynamicProperties: {
    heat: 0.7,       // High heat transfer rate
    entropy: 0.5,    // Moderate structural disruption
    reactivity: 0.6, // Moderate-high chemical reactions
    energy: 0.8      // Highly efficient energy transfer
  } as ThermodynamicProperties,
  
  scientificPrinciples: [
    'Elevated boiling point due to increased pressure (Gay-Lussac\'s law)',
    'Rapid heat transfer through pressurized steam',
    'Forced moisture penetration into food',
    'Accelerated hydrolysis of collagen in meat',
    'Rapid starch gelatinization',
    'Reduced cooking time proportional to pressure increase',
    'Sealed environment preventing volatile compound loss',
    'Minimal oxidation due to reduced air exposure',
    'Pressure-induced cellular breakdown in dense foods',
    'Accelerated Maillard reactions at higher temperatures'
  ],
  
  cookingTips: [
    'Brown proteins before pressure cooking for deeper flavor',
    'Account for additional cooking during pressure release',
    'Use natural release for meats to prevent toughening',
    'Add quick-cooking vegetables after pressure cooking',
    'Dairy ingredients should be added after pressure cooking',
    'Thicken sauces after pressure cooking is complete',
    'Never fill pressure cooker beyond 2/3 capacity',
    'Use at least 1/2 cup liquid to create necessary steam',
    'Adjust cooking times for high altitude (add 5% per 1000 ft above sea level)',
    'Allow frozen foods to partially thaw before pressure cooking'
  ]
}; 