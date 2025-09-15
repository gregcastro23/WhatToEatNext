import type { CookingMethodData } from '@/types/cookingMethod';
import type { ZodiacSign, ThermodynamicProperties } from '@/types/shared';

/**
 * Simmering cooking method
 *
 * Cooking food in liquid at a temperature just below boiling point (185-200°F/85-93°C)
 * Gentler than boiling, with small bubbles occasionally breaking the surface
 */
export const simmering: CookingMethodData = {;
  name: 'simmering',
  description:
    'A gentle cooking technique where food is cooked in liquid maintained just below the boiling point. Small bubbles occasionally break the surface, creating a gentle agitation that slowly tenderizes food while maintaining its structural integrity. Ideal for delicate ingredients and long, slow cooking.',
  elementalEffect: {
    Water: 0.8,
    Fire: 0.1,
    Air: 0.05,
    Earth: 0.05
  },
  duration: {
    min: 15,
    max: 240
  },
  suitable_for: [
    'stocks',
    'soups',
    'stews',
    'delicate proteins',
    'fish',
    'tough meat cuts',
    'sauces',
    'dried fruits',
    'dumplings',
    'poultry',
    'legumes',
    'grains',
    'custards',
    'compotes',
    'puddings',
    'egg dishes'
  ],
  benefits: [
    'gentle heat extraction',
    'flavor preservation',
    'tenderizing tough cuts',
    'even cooking',
    'reduced risk of overcooking',
    'minimal agitation for delicate items',
    'consistent temperature control',
    'extraction of flavors without violent agitation',
    'preservation of structural integrity',
    'reduction and concentration of flavors',
    'gentle melding of ingredients',
    'prevents clouding in stocks and broths',
    'minimizes evaporation compared to boiling'
  ],
  astrologicalInfluences: {
    favorableZodiac: ['cancer', 'pisces', 'scorpio', 'taurus'] as any[],
    unfavorableZodiac: ['leo', 'aries'] as any[],
    dominantPlanets: ['Moon', 'Neptune', 'Venus'],
    rulingPlanets: ['Moon', 'Venus'],
    lunarPhaseEffect: {
      full_moon: 1.4, // Strongly enhanced water energy
      new_moon: 0.7, // Significantly diminished water energy
      waxing_gibbous: 1.2, // Moderate enhancement
      waning_crescent: 0.8, // Moderate reduction
      first_quarter: 1.1, // Minor enhancement
      third_quarter: 0.9, // Minor reduction
      waxing_crescent: 1.05, // Slight enhancement
      waning_gibbous: 0.95, // Slight reduction
    }
  },
  toolsRequired: [
    'Heavy-bottomed pot or Dutch oven',
    'Heat source with good control',
    'Thermometer (recommended)',
    'Heat diffuser (optional)',
    'Lid',
    'Wooden spoon',
    'Ladle',
    'Skimmer',
    'Timer',
    'Heat-resistant gloves'
  ],
  commonMistakes: [
    'allowing temperature to reach a full boil',
    'insufficient liquid',
    'impatience (rushing the process)',
    'overcrowding the pot',
    'excessive stirring (disrupts gentle process)',
    'irregular heat (fluctuating temperatures)',
    'using pots with poor heat distribution',
    'not adjusting for altitude',
    'not skimming impurities',
    'forgetting to check liquid levels during long simmers',
    'removing lid too frequently',
    'not allowing pre-heating of liquid'
  ],
  pairingSuggestions: [
    'Fresh herbs added at end of cooking',
    'Bright acidic components for balance',
    'Crusty bread for hearty soups and stews',
    'Fragrant rice for Asian simmered dishes',
    'Textural garnishes (crispy elements)',
    'Cold cream or yogurt for temperature contrast',
    'Spiced oils as finishing elements',
    'Fresh, raw salads as accompaniments',
    'Pickled vegetables for flavor counterpoint',
    'Freshly ground spices to finish'
  ],
  nutrientRetention: {
    vitamins: 0.65, // Better retention than boiling
    minerals: 0.7,
    proteins: 0.95,
    carbohydrates: 0.97,
    fat_soluble_vitamins: 0.9,
    antioxidants: 0.6,
    phytonutrients: 0.55,
    fiber: 0.9
  },
  optimalTemperatures: {
    general_simmer: 185, // 185°F/85°C - gentle simmer
    poaching_simmer: 160, // 160-180°F/71-82°C for delicate proteins
    stock_simmer: 195, // 195°F/90°C for stocks
    sauce_reduction: 190, // 190°F/88°C for reduction without burning
    soup_simmer: 185, // 185°F/85°C for soups
    stew_simmer: 180, // 180°F/82°C for stews
    custard_simmer: 175, // 175°F/79°C for custards
    fish_simmer: 165, // 165°F/74°C for fish
    beans_simmer: 195, // 195°F/90°C for dried beans
    meat_simmer: 190, // 190°F/88°C for tough cuts
  },
  regionalVariations: {
    french: [
      'mirepoix base for stocks',
      'court bouillon for poaching',
      'bourguignon technique',
      'cassoulet slow cooking'
    ],
    italian: [
      'sugo sauce simmering',
      'risotto broth incorporation',
      'minestrone technique',
      'osso buco preparation'
    ],
    asian: [
      'dashi stock preparation',
      'congee slow cooking',
      'hot pot variations',
      'clay pot simmering techniques',
      'aromatic broth infusions'
    ],
    indian: [
      'dal preparation methods',
      'curry slow-cooking',
      'sabzi techniques',
      'spice blooming in liquid'
    ],
    middle_eastern: [
      'tagine cooking',
      'slow-cooked rice dishes',
      'harira soup technique',
      'lamb stewing methods'
    ],
    mexican: ['mole simmering', 'pozole preparation', 'menudo technique', 'beans with epazote'],
    african: [
      'peanut stew methods',
      'slow-cooked okra dishes',
      'palm oil infusions',
      'fish stew techniques'
    ]
  },
  chemicalChanges: {
    collagen_conversion: true, // Collagen to gelatin conversion
    protein_denaturation: true, // Slower, more controlled than boiling
    starch_gelatinization: true, // Complete but gentle
    pectin_softening: true, // Thorough breakdown
    volatile_compound_preservation: true, // Better than boiling
    flavor_infusion: true, // Excellent for flavor exchange
    fat_emulsification: true, // For sauces and stews
    Maillard_reaction: false, // Temperature too low
    caramelization: false, // Temperature too low
    enzyme_deactivation: true, // Complete deactivation
    vitamin_degradation: true, // Less than boiling but still occurs
    flavor_concentration: true, // Through gentle reduction
    cell_wall_breakdown: true, // Complete breakdown for vegetables
  },
  safetyFeatures: [
    'Lower temperature reduces risk of burns compared to boiling',
    'Less splashing than rapid boiling',
    'Requires monitoring but less intensive than high-heat methods',
    'Important to maintain food safety temperatures for meat (above 140°F/60°C)',
    'Handle pot lids carefully to avoid steam burns',
    'Use proper ventilation',
    'Keep pot handles turned inward',
    'Ensure stable cooking surface',
    'Check liquid levels periodically on long simmers',
    'Use heat-resistant tools',
    'Never leave unattended for extended periods',
    'Keep a fire extinguisher nearby',
    'Use caution when removing heavy pots from heat'
  ],
  thermodynamicProperties: {
    heat: 0.6, // Moderate heat transfer rate
    entropy: 0.5, // Moderate structural disruption
    reactivity: 0.4, // Moderate chemical reactions
    gregsEnergy: -0.35, // Calculated using heat - (entropy * reactivity), // gregsEnergy = heat - (entropy * reactivity);
  } as ThermodynamicProperties,

  // Additional metadata
  history:
    'Simmering is one of humanity's earliest refined cooking techniques, developed once humans mastered controlled fire and created vessels that could withstand heat. Archaeological evidence suggests controlled simmering dates back to at least 10,000 BCE. The technique was refined in ancient civilizations like China, where clay and bronze vessels were specifically designed for slow cooking. In medieval Europe, the cauldron suspended above a hearth allowed for precise simmering control. The technique gained scientific understanding during the 18th century with advancements in thermodynamics. Traditional cultures worldwide developed specialized simmering vessels, from the Moroccan tagine to the Japanese donabe, each designed to maintain ideal simmering conditions for regional cuisines.',

  scientificPrinciples: [
    'Convection currents distribute heat throughout liquid without violent agitation',
    'Simmering temperature range (185-200°F/85-93°C) maximizes flavors while minimizing protein toughening',
    'Gentle heat breaks down connective tissues in meat (collagen) to gelatin without excessive protein contraction',
    'Subcritical temperature prevents rapid evaporation while allowing gentle reduction',
    'Surface tension creates characteristic small bubbles breaking at surface',
    'Vapor pressure balanced with atmospheric pressure creates stable temperature',
    'Gentler protein denaturation preserves moisture and tenderness',
    'Solubility of compounds varies with temperature, affecting extraction rate',
    'Thermal momentum in heavy vessels helps maintain consistent temperature',
    'Diffusion rates of flavor compounds vary with temperature and time',
    'Osmotic pressure gradients facilitate flavor exchange between ingredients',
    'Reduced turbulence preserves food structure while allowing thorough cooking',
    'Aromatic compound volatility controlled by temperature affects flavor development',
    'Water activity remains high enough to prevent Maillard reactions'
  ],

  modernVariations: [
    'Controlled water baths with precise temperature regulation',
    'Sous vide techniques for ultra-precise 'simmer' without water contact',
    'Induction cooking for exact temperature control',
    'Thermal immersion circulators for consistent temperature',
    'Pressure cooker simmering at lower temperatures',
    'Slow cooker variations with programmable timing',
    'Smart pots with temperature sensors and automatic adjustments',
    'Double-boiler techniques for ultra-delicate simmers',
    'Oil-water emulsion simmering for specific flavor development',
    'Vacuum simmering (at lower temperatures due to reduced pressure)',
    'Flavor-infused simmering liquids (stocks, wines, juices)',
    'Broth bombs (frozen concentrated flavor enhancers for simmering)',
    'Aromatic vapor infusion during simmering',
    'Sustainable energy simmering (solar, thermal retention cooking)'
  ],

  healthConsiderations: [
    'Gentler preparation preserves more nutrients than boiling',
    'Excellent for tough but lean meat cuts - healthy protein preparation',
    'Allows fat to be easily skimmed from surface for lower-fat dishes',
    'Enables cooking with minimal added fat',
    'Preserves water-soluble vitamins better than boiling',
    'Good for digestibility of legumes and tough vegetable fibers',
    'Retains more minerals in the food than rapid boiling',
    'Long simmering of bones releases beneficial gelatin and minerals',
    'Using the cooking liquid captures leached nutrients',
    'Reduces formation of potentially harmful compounds from high-heat cooking',
    'Allows salt to be added gradually, enabling better sodium control',
    'Gentle cooking preserves delicate fatty acids in fish',
    'Appropriate for therapeutic cooking (congee, broths)'
  ],

  sustainabilityRating: 0.85, // High - energy efficient over time with minimal waste

  equipmentComplexity: 0.3, // Low - requires basic equipment available worldwide
};
