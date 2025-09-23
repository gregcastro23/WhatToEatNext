import type { CookingMethodData } from '@/types/cookingMethod';
import type { ZodiacSign, ThermodynamicProperties } from '@/types/shared';

/**
 * Broiling cooking method
 *
 * Cooking food with intense heat from above, typically in an oven broiler
 */
export const broiling: CookingMethodData = {
  name: 'broiling',
  description:
    'Cooking food by exposing it to direct radiant heat from above, typically in an oven broiler, creating a browned exterior while maintaining moisture inside',
  elementalEffect: {
    Fire: 0.8,
    Air: 0.1,
    Earth: 0.1,
    Water: 0.0
  }
  duration: {
    min: 3,
    max: 15
  }
  suitable_for: [
    'steaks',
    'chops',
    'fish',
    'chicken',
    'shellfish',
    'vegetables',
    'flatbreads',
    'casserole toppings',
    'fruit desserts'
  ],
  benefits: [
    'creates crisp exterior',
    'seals in juices',
    'quick cooking',
    'browns food surface',
    'develops flavor',
    'minimal equipment needed',
    'melts and browns toppings'
  ],

  astrologicalInfluences: {
    favorableZodiac: ['aries', 'leo', 'sagittarius'] as any[],
    unfavorableZodiac: ['cancer', 'pisces', 'scorpio'] as any[],
    dominantPlanets: ['Mars', 'Sun', 'Mercury'],
    lunarPhaseEffect: {
      full_moon: 1.25, // Enhanced browning effects
      new_moon: 0.75, // Reduced intensity
      waxing_crescent: 0.9,
      waning_gibbous: 1.1
    }
  }

  toolsRequired: [
    'Oven with broiler element',
    'Broiler pan or sheet pan',
    'Tongs or spatula',
    'Meat thermometer',
    'Oven mitts',
    'Timer'
  ],

  commonMistakes: [
    'placing food too close to heating element',
    'not preheating the broiler',
    'overcooking',
    'neglecting to watch food closely',
    'using the wrong cookware',
    'broiling foods with high fat content without monitoring',
    'not patting food dry before broiling'
  ],

  pairingSuggestions: [
    'Fresh herb compounds',
    'Citrus-based marinades',
    'Light sauces that will not mask broiled flavor',
    'Crisp salads as contrast',
    'Roasted vegetables',
    'Wine reductions'
  ],

  nutrientRetention: {
    proteins: 0.9,
    vitamins: 0.65,
    minerals: 0.85,
    fats: 0.7
  }

  optimalTemperatures: {
    steaks: 500,
    poultry: 450,
    fish: 425,
    vegetables: 475,
    fruit: 400,
    'melting cheese': 475,
    toasting: 450
  }

  regionalVariations: {
    american: ['steakhouse broiling', 'lobster broiling'],
    italian: ['gratinata', 'bruschetta finishing'],
    japanese: ['aburi-style sushi', 'miso-glazed fish'],
    french: ['gratin dishes', 'crème brûlée finishing'],
    mediterranean: ['broiled seafood', 'vegetable mezze']
  }

  chemicalChanges: {
    maillard_reaction: true,
    caramelization: true,
    moisture_evaporation: true,
    fat_rendering: true,
    protein_denaturation: true,
    surface_dehydration: true
  }

  safetyFeatures: [
    'Constant monitoring',
    'Proper distance from heat element',
    'Using appropriate cookware',
    'Temperature monitoring',
    'Avoiding flammable materials near broiler',
    'Proper ventilation'
  ],

  thermodynamicProperties: {
    heat: 0.95, // Very high localized heat
    entropy: 0.7, // Significant surface transformation
    reactivity: 0.8, // High chemical reactivity on food surface
    gregsEnergy: -0.75, // Calculated using heat - (entropy * reactivity), // Calculated using heat - (entropy * reactivity)
  } as ThermodynamicProperties,

  // Additional metadata
  history:
    'Broiling evolved from ancient cooking methods where food was placed near open fires, but as a distinct technique with overhead heatit became refined with the development of modern ovens in the 19th century. It gained particular popularity in American steakhouses in the 20th century as a way to quickly prepare steaks with a charred exterior while maintaining a juicy interior.',

  scientificPrinciples: [
    'Radiant heat transfer from element directly to food surface',
    'Infrared radiation penetrates food surface',
    'Maillard reaction creates complex flavor compounds',
    'Surface dehydration creates textural contrast',
    'Temperature gradient forms from exterior to interior',
    'Rapid protein coagulation on surface seals moisture inside',
    'Caramelization of sugars enhances browning and flavor',
    'Convection currents in the broiler compartment affect cooking rate'
  ],

  modernVariations: [
    'Salamander broilers in professional kitchens',
    'Infrared broilers for more intense heat',
    'Double-sided broiling',
    'Flash broiling as finishing technique',
    'Broiling with flavored butters or glazes',
    'Combination convection-broil methods'
  ],

  sustainabilityRating: 0.7, // Generally energy efficient due to short cooking times

  equipmentComplexity: 0.3, // Very simple, uses existing oven equipment

  healthConsiderations: [
    'Minimal added fat required',
    'High heat can create potentially carcinogenic compounds on charred surfaces',
    'Allows fat to drain away from meat during cooking',
    'Quick cooking preserves many nutrients',
    'Can create smoke if fat splatters on heating element',
    'May require monitoring sodium in marinades and rubs'
  ],

  expertTips: [
    'Position rack 3-6 inches from heating element depending on food thickness',
    'Pat food dry before broiling to promote browning',
    'Use broiler-safe cookware (no wooden, plastic, or non-tempered glass handles)',
    'Preheat broiler for 5-10 minutes before cooking',
    'Leave oven door slightly ajar when broiling if manufacturer recommends it',
    'Flip food halfway through cooking for even browning',
    'Allow meat to rest after broiling to redistribute juices',
    'Apply thin layers of oil to prevent sticking and promote browning',
    'Watch food constantly as broiling can go from perfect to burnt in seconds',
    'Marinate lean cuts to maintain moisture during broiling'
  ],

  ingredientPreparation: {
    meats:
      'Bring to room temperature for 30 minutes before broiling. Season generously. Pat dry for better browning.',
    fish: 'Ensure fish is completely dry on surface. Brush with oil. Season just before broiling to prevent moisture release.',
    vegetables:
      'Cut to uniform thickness. Toss with olive oil and seasonings. Arrange in single layer.',
    'cheese dishes':
      'Apply cheese in final minutes of cooking. Use cheeses with good melting properties.',
    fruits: 'Sprinkle with sugar for better caramelization. Cut to uniform sizes for even cooking.',
    bread:
      'Slightly dry bread works better than very fresh. Apply thin layer of fat to prevent burning.'
  }

  timingConsiderations: {
    'thin cuts': 'About 3-5 minutes per side. Look for sizzling and browning before flipping.',
    'thick cuts': '5-8 minutes per side. Use thermometer to check doneness rather than time alone.',
    vegetables: '2-4 minutes per side, looking for slight char and tenderness.',
    'finishing dishes': '1-3 minutes total, watching constantly for desired browning level.',
    'delicate items': 'As little as 1-2 minutes total. Position further from heat element.'
  }

  doneness_indicators: {
    'visual cues': 'Surface browning, bubbling, caramelization, or slight charring on edges.',
    'textural signs': 'Firm exterior with give when pressed. Visible juices for meats.',
    'aroma markers': 'Rich, toasted smell without acrid burning odors.',
    'temperature readings':
      'For meats, follow standard temperature guidelines (e.g., 135°F for medium-rare steak).',
    'timing benchmarks':
      'Thin items (≤1/2 inch): 2-4 minutes total, Medium items (1 inch): 8-10 minutes total, Thick items (>1 inch): 12-15 minutes total.'
  }

  ingredientInteractions: {
    sugars: 'Caramelize quickly and can burn easily add sweet glazes in final minutes only.',
    proteins: 'Form a protective barrier when heated quickly, sealing moisture inside.',
    fats: 'Render out and may cause flare-ups, trim excess fat or score fat cap on meats.',
    marinades: 'High sugar content marinades can burn, wipe excess marinade before broiling.',
    herbs: 'Fresh herbs may burn, use in compound butters or apply after cooking.',
    acids: 'Can denature proteins before cooking, limit marinating time for acidic marinades.'
  }

  technicalNotes: {
    'equipment variations': {
      'gas broilers': 'More consistent heat distribution but typically less intense than electric.',
      'electric broilers': 'More intense heat, may have hot spots that require repositioning food.',
      'salamander broilers':
        'Professional equipment allowing precise control and higher temperatures.',
      'drawer broilers':
        'Located below oven in some models, typically smaller capacity but good heat.'
    }
    'distance effects': {
      'close positioning': 'Faster cooking, more external browning, less interior cooking.',
      'distant positioning': 'Slower cooking, more even heating throughout the food.',
      'variable positioning':
        'Moving food closer or further during cooking allows for controlled browning.'
    }
    'surface treatments': {
      'oil application': 'Thin layer conducts heat better and prevents sticking.',
      'dry rubs': 'Apply before cooking, high sugar content rubs may burn.',
      'wet marinades': 'Pat dry before broiling to prevent steaming instead of browning.',
      basting: 'Apply during cooking to add flavor and prevent drying.'
    }
  }
}
