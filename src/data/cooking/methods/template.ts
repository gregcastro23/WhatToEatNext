import type { CookingMethodData } from '@/types/cookingMethod';
import type { ZodiacSign, ThermodynamicProperties } from '@/types/shared';

/**
 * Template for creating a cooking method file
 *
 * This file serves as a template for creating new cooking method files.
 * Copy this file, rename it to your method name (kebab-case), and fill in the data.
 */

export const _methodName: CookingMethodData = {
  name: 'method_name', // Use snake_case for the name property
  description: 'Description of the cooking method and how it works, including key characteristics and effects on food',
  elementalEffect: {
    Fire: 0.0, // Fire element (0.0-1.0)
    Water: 0.0, // Water element (0.0-1.0)
    Earth: 0.0, // Earth element (0.0-1.0)
    Air: 0.0, // Air element (0.0-1.0)
  },
  duration: {
    min: 0, // Minimum cooking time in minutes
    max: 0, // Maximum cooking time in minutes
  },
  suitable_for: ['ingredient1', 'ingredient2', 'ingredient3', 'ingredient4', 'ingredient5'], // Types of ingredients this method works well with
  benefits: ['benefit1', 'benefit2', 'benefit3', 'benefit4', 'benefit5'], // Advantages of this cooking method

  astrologicalInfluences: {
    favorableZodiac: ['zodiac1', 'zodiac2', 'zodiac3'] as unknown as any[], // Zodiac signs that enhance this method
    unfavorableZodiac: ['zodiac4', 'zodiac5', 'zodiac6'] as unknown as any[], // Zodiac signs that diminish this method
    dominantPlanets: ['Planet1', 'Planet2', 'Planet3'],
    lunarPhaseEffect: {
      full_moon: 0.0, // Effect during full moon (multiplier)
      new_moon: 0.0, // Effect during new moon (multiplier)
      waxing_crescent: 0.0,
      waning_gibbous: 0.0,
      // Other lunar phases can be added
    }
  },
  toolsRequired: [
    'Tool1',
    'Tool2',
    'Tool3',
    'Tool4',
    'Tool5',
    'Tool6',
    'Tool7',
    'Tool8',
    'Tool9',
    'Tool10'
  ],

  commonMistakes: [
    'mistake1',
    'mistake2',
    'mistake3',
    'mistake4',
    'mistake5',
    'mistake6',
    'mistake7',
    'mistake8'
  ],

  pairingSuggestions: [
    'pairing1',
    'pairing2',
    'pairing3',
    'pairing4',
    'pairing5',
    'pairing6',
    'pairing7'
  ],

  nutrientRetention: {
    nutrient1: 0.0, // Retention ratio (0.0-1.0or >1.0 for increase)
    nutrient2: 0.0,
    nutrient3: 0.0,
    nutrient4: 0.0,
    nutrient5: 0.0,
    nutrient6: 0.0
},
  optimalTemperatures: {
    application1: 0, // Temperature in Fahrenheit
    application2: 0,
    application3: 0,
    application4: 0,
    application5: 0,
    application6: 0,
    application7: 0,
    application8: 0
},
  regionalVariations: {
    region1: ['variation1', 'variation2', 'variation3'],
    region2: ['variation4', 'variation5', 'variation6'],
    region3: ['variation7', 'variation8', 'variation9'],
    region4: ['variation10', 'variation11', 'variation12'],
    region5: ['variation13', 'variation14', 'variation15']
  },
  chemicalChanges: {
    change1: true,
    change2: true,
    change3: true,
    change4: true,
    change5: true,
    change6: true,
    change7: true,
    change8: true
},
  safetyFeatures: ['safety1', 'safety2', 'safety3', 'safety4', 'safety5', 'safety6', 'safety7'],

  thermodynamicProperties: {
    heat: 0.0, // Heat level (0.0-1.0)
    entropy: 0.0, // Entropy/chaos/transformation level (0.0-1.0)
    reactivity: 0.0, // Chemical reactivity level (0.0-1.0)
    gregsEnergy: 0.0, // Greg's Energy (heat - entropy * reactivity)
  } as ThermodynamicProperties,

  // Additional metadata
  history: 'Detailed history of the cooking method, including its origins, evolution through different time periods, significant cultural developments, and key innovations throughout history.',

  scientificPrinciples: [
    'principle1',
    'principle2',
    'principle3',
    'principle4',
    'principle5',
    'principle6',
    'principle7',
    'principle8',
    'principle9',
    'principle10'
  ],

  modernVariations: [
    'variation1',
    'variation2',
    'variation3',
    'variation4',
    'variation5',
    'variation6',
    'variation7',
    'variation8',
    'variation9'
  ],

  sustainabilityRating: 0.0, // 0.0-1.0 rating of environmental sustainability

  equipmentComplexity: 0.0, // 0.0-1.0 rating of equipment complexity

  healthConsiderations: [
    'consideration1',
    'consideration2',
    'consideration3',
    'consideration4',
    'consideration5',
    'consideration6',
    'consideration7',
    'consideration8',
    'consideration9',
    'consideration10'
  ],

  expertTips: [
    'tip1',
    'tip2',
    'tip3',
    'tip4',
    'tip5',
    'tip6',
    'tip7',
    'tip8',
    'tip9',
    'tip10',
    'tip11',
    'tip12',
    'tip13',
    'tip14',
    'tip15'
  ],

  ingredientPreparation: {
    ingredient1:
      'Detailed preparation instructions for ingredient1, including specific techniques, measurements, and timing considerations.',
    ingredient2: 'Detailed preparation instructions for ingredient2, including specific techniques, measurements, and timing considerations.',
    ingredient3: 'Detailed preparation instructions for ingredient3, including specific techniques, measurements, and timing considerations.',
    ingredient4: 'Detailed preparation instructions for ingredient4, including specific techniques, measurements, and timing considerations.',
    ingredient5: 'Detailed preparation instructions for ingredient5, including specific techniques, measurements, and timing considerations.',
    ingredient6: 'Detailed preparation instructions for ingredient6, including specific techniques, measurements, and timing considerations.' },
        timingConsiderations: {
    aspect1:
      'Detailed timing information for aspect1, including specific duration, indicators, and adjustments based on conditions.',
    aspect2: 'Detailed timing information for aspect2, including specific duration, indicators, and adjustments based on conditions.',
    aspect3: 'Detailed timing information for aspect3, including specific duration, indicators, and adjustments based on conditions.',
    aspect4: 'Detailed timing information for aspect4, including specific duration, indicators, and adjustments based on conditions.',
    aspect5: 'Detailed timing information for aspect5, including specific duration, indicators, and adjustments based on conditions.',
    aspect6: 'Detailed timing information for aspect6, including specific duration, indicators, and adjustments based on conditions.' },
        doneness_indicators: {
    indicator1:
      'Detailed description of indicator1, including visual cues, textural changes, and objective measurements.',
    indicator2: 'Detailed description of indicator2, including visual cues, textural changes, and objective measurements.',
    indicator3: 'Detailed description of indicator3, including visual cues, textural changes, and objective measurements.',
    indicator4: 'Detailed description of indicator4, including visual cues, textural changes, and objective measurements.',
    indicator5: 'Detailed description of indicator5, including visual cues, textural changes, and objective measurements.',
    indicator6: 'Detailed description of indicator6, including visual cues, textural changes, and objective measurements.' },
        ingredientInteractions: {
    interaction1:
      'Detailed explanation of interaction1, including chemical basis, practical implications, and tips for leveraging or avoiding.',
    interaction2: 'Detailed explanation of interaction2, including chemical basis, practical implications, and tips for leveraging or avoiding.',
    interaction3: 'Detailed explanation of interaction3, including chemical basis, practical implications, and tips for leveraging or avoiding.',
    interaction4: 'Detailed explanation of interaction4, including chemical basis, practical implications, and tips for leveraging or avoiding.',
    interaction5: 'Detailed explanation of interaction5, including chemical basis, practical implications, and tips for leveraging or avoiding.',
    interaction6: 'Detailed explanation of interaction6, including chemical basis, practical implications, and tips for leveraging or avoiding.' },
        technicalNotes: {
    category1: {
      subcategory1:
        'Detailed technical information about subcategory1, including specific parameters, scientific principles, and practical applications.',
      subcategory2: 'Detailed technical information about subcategory2, including specific parameters, scientific principles, and practical applications.',
      subcategory3: 'Detailed technical information about subcategory3, including specific parameters, scientific principles, and practical applications.',
      subcategory4: 'Detailed technical information about subcategory4, including specific parameters, scientific principles, and practical applications.' },
        category2: {
      subcategory1:
        'Detailed technical information about subcategory1, including specific parameters, scientific principles, and practical applications.',
      subcategory2: 'Detailed technical information about subcategory2, including specific parameters, scientific principles, and practical applications.',
      subcategory3: 'Detailed technical information about subcategory3, including specific parameters, scientific principles, and practical applications.',
      subcategory4: 'Detailed technical information about subcategory4, including specific parameters, scientific principles, and practical applications.' },
        category3: {
      subcategory1:
        'Detailed technical information about subcategory1, including specific parameters, scientific principles, and practical applications.',
      subcategory2: 'Detailed technical information about subcategory2, including specific parameters, scientific principles, and practical applications.',
      subcategory3: 'Detailed technical information about subcategory3, including specific parameters, scientific principles, and practical applications.',
      subcategory4: 'Detailed technical information about subcategory4, including specific parameters, scientific principles, and practical applications.' },
        category4: {
      subcategory1:
        'Detailed technical information about subcategory1, including specific parameters, scientific principles, and practical applications.',
      subcategory2: 'Detailed technical information about subcategory2, including specific parameters, scientific principles, and practical applications.',
      subcategory3: 'Detailed technical information about subcategory3, including specific parameters, scientific principles, and practical applications.',
      subcategory4: 'Detailed technical information about subcategory4, including specific parameters, scientific principles, and practical applications.' },
        category5: {
      subcategory1:
        'Detailed technical information about subcategory1, including specific parameters, scientific principles, and practical applications.',
      subcategory2: 'Detailed technical information about subcategory2, including specific parameters, scientific principles, and practical applications.',
      subcategory3: 'Detailed technical information about subcategory3, including specific parameters, scientific principles, and practical applications.',
      subcategory4: 'Detailed technical information about subcategory4, including specific parameters, scientific principles, and practical applications.';
}
  }
}
