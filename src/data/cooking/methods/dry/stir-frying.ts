import type { 
  ZodiacSign, 
  ThermodynamicProperties
} from '@/types/shared';

import type { CookingMethodData } from '@/types/cookingMethod';

/**
 * Stir-frying cooking method
 * 
 * High-heat quick cooking method with constant motion in a wok or pan
 */
export const stirFrying: CookingMethodData = {
  name: 'stir-frying',
  description: 'High-heat, quick cooking technique where food is rapidly tossed and stirred in a wok or pan, preserving texture and creating complex flavors',
  elementalEffect: {
    Fire: 0.5,
    Air: 0.3,
    Earth: 0.1,
    Water: 0.1
  },
  duration: {
    min: 3,
    max: 10
  },
  suitable_for: ['vegetables', 'thin meats', 'tofu', 'noodles', 'seafood', 'poultry', 'quick-cooking grains'],
  benefits: ['preserves crunch', 'quick nutrient retention', 'wok hei flavor', 'minimal oil usage', 'color preservation', 'caramelization'],
  astrologicalInfluences: {
    favorableZodiac: ['aries', 'leo', 'gemini'] as ZodiacSign[],
    unfavorableZodiac: ['cancer', 'pisces', 'scorpio'] as ZodiacSign[],
    dominantPlanets: ['Mercury', 'Mars', 'Sun'],
    lunarPhaseEffect: {
      'full_moon': 1.3, // Enhanced wok hei flavor
      'new_moon': 0.9,  // Slightly diminished effect
      'first_quarter': 1.1, // Good balance
      'third_quarter': 0.95 // Slight reduction
    }
  },
  toolsRequired: [
    'Wok or high-sided pan',
    'Spatula or wok ladle',
    'High-heat burner',
    'Prep bowls for ingredients',
    'Sharp knife for thin cutting'
  ],
  commonMistakes: [
    'overcrowding the wok',
    'inconsistent cutting sizes',
    'inadequate preheating',
    'stirring too seldom',
    'improper ingredient staging'
  ],
  pairingSuggestions: [
    'Steamed rice or noodles',
    'Fresh herbs (cilantro, Thai basil)',
    'Aromatic sauces',
    'Contrasting textures',
    'Pickled vegetables'
  ],
  nutrientRetention: {
    vitamins: 0.85,
    minerals: 0.90,
    proteins: 0.95,
    antioxidants: 0.80
  },
  optimalTemperatures: {
    'vegetables': 450,
    'meat': 475,
    'seafood': 450,
    'preheating_wok': 500,
    'aromatics': 400
  },
  regionalVariations: {
    chinese: ['bao technique', 'yángchǎo', 'Cantonese quick-fry'],
    japanese: ['teppanyaki style', 'yakisoba technique'],
    thai: ['pad phak', 'pad see ew technique'],
    korean: ['bokkeum', 'chapchae preparation']
  },
  chemicalChanges: {
    'maillard_reaction': true,
    'caramelization': true,
    'protein_denaturation': true,
    'enzyme_deactivation': true,
    'minimal_nutrient_leaching': true
  },
  safetyFeatures: [
    'Use proper ventilation',
    'Keep handle positioned safely',
    'Use heat-resistant gloves',
    'Beware of oil splatter',
    'Proper wok handling techniques'
  ],
  thermodynamicProperties: {
    heat: 0.90,       // Very high heat application
    entropy: 0.55,    // Moderate structural breakdown
    reactivity: 0.85, // High reactivity (Maillard, caramelization)
    energy: 0.70      // Good energy transfer through conduction
  } as ThermodynamicProperties,
  
  // Additional metadata
  history: 'Stir-frying originated in China during the Han dynasty (206 BCE–220 CE) as a technique to cook food quickly while conserving fuel. The wok\'s rounded shape and the continuous stirring motion allow for rapid, even cooking and the development of "wok hei" (breath of the wok) - a complex smoky flavor.',
  
  scientificPrinciples: [
    'Thermal conductivity of thin metal wok allows rapid heat transfer',
    'Continuous motion prevents burning while promoting browning',
    'Steep sides facilitate tossing without spilling',
    'Sequential ingredient addition based on cooking time',
    'Maillard reaction at high temperature creates complex flavors',
    'Quick cooking preserves texture and nutrients'
  ],
  
  modernVariations: [
    'Flat-bottom woks for modern stoves',
    'Induction wok cooking for precision',
    'Sous vide then flash stir-fry finish',
    'Vacuum-pressure marination before stir-frying',
    'Smoke-point engineered oils for higher temperatures'
  ],
  
  sustainabilityRating: 0.80, // Efficient quick cooking with minimal energy usage
  
  equipmentComplexity: 0.50, // Requires specific equipment but relatively simple technique
  
  healthConsiderations: [
    'Minimal oil compared to deep frying',
    'Quick cooking preserves heat-sensitive nutrients',
    'High-heat cooking may create some harmful compounds',
    'Low moisture loss preserves natural food quality',
    'Can adjust oil and salt content for health needs'
  ]
}; 