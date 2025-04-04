// src/data/cooking/cookingMethods.ts

import type { 
  CookingMethod, 
  ElementalProperties, 
  ZodiacSign, 
  AstrologicalState,
  Element,
  Season,
  ThermodynamicProperties
} from '@/types/alchemy';
import { SEASONAL_MODIFIERS, calculateRecipeSeasonalAlignment } from '@/utils/seasonalCalculations';
import { SEASONAL_MODIFIERS as SeasonalConstantsSeasonalModifiers, BALANCED_ELEMENTS as SeasonalConstantsBalancedElements } from '@/constants/seasonalConstants';

interface CookingMethodData {
  name: CookingMethod;
  description: string;
  elementalEffect: ElementalProperties;
  duration: {
    min: number;
    max: number;
  };
  suitable_for: string[];
  benefits: string[];
  astrologicalInfluences?: {
    favorableZodiac: ZodiacSign[];
    unfavorableZodiac: ZodiacSign[];
    lunarPhaseEffect?: Record<string, number>;
    dominantPlanets?: string[];
    rulingPlanets?: string[];
  };
  thermodynamicProperties?: ThermodynamicProperties;
  toolsRequired?: string[];
  commonMistakes?: string[];
  pairingSuggestions?: string[];
  chemicalChanges?: Record<string, boolean>;
  optimalTemperatures?: Record<string, number>;
  nutrientRetention?: Record<string, number>;
  regionalVariations?: Record<string, string[]>;
  safetyFeatures?: string[];
}

export const cookingMethods: Partial<Record<CookingMethod, CookingMethodData>> = {
  baking: {
    name: 'baking',
    description: 'Cooking food by exposing it to dry heat in an enclosed space, typically in an oven, producing even heat distribution and caramelization',
    elementalEffect: {
      Fire: 0.4,
      Air: 0.3,
      Earth: 0.2,
      Water: 0.1
    },
    duration: {
      min: 20,
      max: 180
    },
    suitable_for: ['breads', 'pastries', 'casseroles', 'meat', 'vegetables', 'desserts', 'gratins'],
    benefits: ['even cooking', 'develops flavors', 'retains moisture', 'creates textures', 'minimal attention required'],
    astrologicalInfluences: {
      favorableZodiac: ['leo', 'aries', 'sagittarius'],
      unfavorableZodiac: ['cancer', 'pisces', 'scorpio'],
      dominantPlanets: ['Sun', 'Mars'],
      lunarPhaseEffect: {
        'full_moon': 1.2, // Enhanced rising 
        'new_moon': 0.8,  // Reduced rising
        'waxing_gibbous': 1.1, // Moderate enhancement
        'waning_gibbous': 0.9  // Slight reduction
      }
    },
    toolsRequired: [
      'Oven',
      'Baking sheet',
      'Baking dish',
      'Parchment paper',
      'Wire rack'
    ],
    commonMistakes: [
      'over-mixing dough',
      'incorrect oven temperature',
      'premature door opening',
      'improper rack positioning',
      'forgetting to preheat'
    ],
    pairingSuggestions: [
      'Fermented fruit compotes',
      'Herb-infused honeys',
      'Smoked salts',
      'Compound butters'
    ],
    nutrientRetention: {
      carbohydrates: 0.85,
      proteins: 0.75,
      vitamins: 0.65,
      minerals: 0.80
    },
    optimalTemperatures: {
      'bread': 425,
      'cookies': 350,
      'cake': 325,
      'roast vegetables': 400,
      'pizza': 500
    },
    regionalVariations: {
      french: ['bain-marie', 'en papillote'],
      middleEastern: ['tannur oven baking'],
      japanese: ['mushipan steaming'],
      italian: ['wood-fired oven baking']
    },
    chemicalChanges: {
      'maillard_reaction': true,
      'caramelization': true,
      'gelatinization': true,
      'protein_denaturation': true
    },
    safetyFeatures: [
      'Monitor internal temperature with thermometer',
      'Use oven mitts or heat-resistant gloves',
      'Allow for proper ventilation'
    ],
    thermodynamicProperties: {
      heat: 0.65,       // Moderate-high heat penetrating the food
      entropy: 0.55,    // Moderate breakdown of structures, protein denaturation
      reactivity: 0.70, // Significant Maillard reactions, caramelization
      energy: 0.60      // Moderate-efficient energy transfer
    }
  },
  
  boiling: {
    name: 'boiling',
    description: 'Cooking food in liquid that is at or near 100°C (212°F) at sea level, characterized by large bubbles and rolling motion',
    elementalEffect: {
      Water: 0.7,
      Fire: 0.3,
      Earth: 0.0,
      Air: 0.0
    },
    duration: {
      min: 5,
      max: 45
    },
    suitable_for: ['pasta', 'rice', 'vegetables', 'eggs', 'legumes', 'dumplings'],
    benefits: ['consistent temperature', 'even cooking', 'water-soluble flavor extraction', 'simple technique'],
    astrologicalInfluences: {
      favorableZodiac: ['cancer', 'pisces', 'scorpio'],
      unfavorableZodiac: ['leo', 'aries', 'sagittarius'],
      dominantPlanets: ['Moon', 'Neptune'],
      lunarPhaseEffect: {
        'full_moon': 1.3, // More vigorous boiling
        'new_moon': 0.7  // Calmer boil
      }
    },
    toolsRequired: [
      'Large pot',
      'Strainer/colander',
      'Heat source',
      'Slotted spoon',
      'Timer'
    ],
    commonMistakes: [
      'overcooking pasta',
      'not salting water',
      'overcrowding the pot',
      'vigorous rather than gentle boil for delicate items',
      'not adjusting for altitude'
    ],
    pairingSuggestions: [
      'Compound butters',
      'Emulsified sauces',
      'Infused oils',
      'Fresh herbs'
    ],
    nutrientRetention: {
      carbohydrates: 0.95,
      proteins: 0.80,
      vitamins: 0.40,
      minerals: 0.35
    },
    optimalTemperatures: {
      'pasta': 212,
      'rice': 212,
      'blanching vegetables': 212,
      'hard eggs': 212,
      'soft eggs': 208
    },
    regionalVariations: {
      italian: ['pasta al dente'],
      japanese: ['nimono', 'hot pot'],
      french: ['blanching'],
      chinese: ['quick boil for dumplings']
    },
    chemicalChanges: {
      'leaching': true,
      'gelatinization': true,
      'protein_denaturation': true,
      'hydration': true
    },
    safetyFeatures: [
      'Handle with caution to prevent splashing',
      'Keep pot handles turned inward',
      'Use large enough pot to prevent boil-over'
    ],
    thermodynamicProperties: {
      heat: 0.50,       // Limited to 100°C (212°F) at sea level
      entropy: 0.65,    // Significant breakdown of cell walls and structures
      reactivity: 0.45, // Moderate hydrolysis reactions
      energy: 0.40      // Some energy lost to evaporation
    }
  },

  sous_vide: {
    name: 'sous_vide',
    description: 'Precision cooking method where food is vacuum-sealed and immersed in a temperature-controlled water bath for perfect doneness',
    elementalEffect: {
      Water: 0.5,
      Fire: 0.1,
      Earth: 0.3,
      Air: 0.1
    },
    duration: {
      min: 30,
      max: 4320 // Up to 72 hours
    },
    suitable_for: ['meat', 'fish', 'eggs', 'vegetables', 'fruits', 'custards', 'infusions'],
    benefits: ['precise temperature control', 'even cooking', 'enhanced moisture retention', 'consistent results', 'hands-off process'],
    astrologicalInfluences: {
      favorableZodiac: ['aquarius', 'virgo', 'capricorn'],
      unfavorableZodiac: ['aries', 'leo', 'sagittarius'],
      dominantPlanets: ['Mercury', 'Saturn', 'Uranus'],
      lunarPhaseEffect: {
        'full_moon': 0.8, // Less effective 
        'new_moon': 1.3,  // Enhanced precision
        'first_quarter': 1.1 // Good balance
      }
    },
    toolsRequired: [
      'Immersion circulator',
      'Vacuum sealer',
      'Heat-safe bags',
      'Large container',
      'Thermal immersion probe'
    ],
    commonMistakes: [
      'improper sealing',
      'wrong temperature setting',
      'inadequate water circulation',
      'overcrowding the bath',
      'skipping final searing'
    ],
    pairingSuggestions: [
      'High-heat finishing techniques',
      'Infused finishing oils',
      'Molecular garnishes',
      'Textural contrasts'
    ],
    nutrientRetention: {
      proteins: 0.95,
      vitamins: 0.90,
      minerals: 0.95,
      fats: 0.98
    },
    optimalTemperatures: {
      'rare_beef': 129,
      'medium_beef': 135,
      'chicken_breast': 145,
      'salmon': 122,
      'egg': 145,
      'vegetables': 183
    },
    regionalVariations: {
      modernist: ['precision cooking', 'time-temperature combinations'],
      french: ['low-temperature precision cooking'],
      japanese: ['onsen tamago inspiration']
    },
    chemicalChanges: {
      'protein_denaturation': true,
      'enzymatic_breakdown': true,
      'vacuum_infusion': true,
      'cell_membrane_integrity': true
    },
    safetyFeatures: [
      'Monitor water levels',
      'Use food-grade bags only',
      'Follow pasteurization time-temperature tables for safety',
      'Chill rapidly if not serving immediately'
    ],
    thermodynamicProperties: {
      heat: 0.30,       // Low, precise heat
      entropy: 0.35,    // Slow, controlled breakdown of structures
      reactivity: 0.20, // Minimal reactivity (no Maillard)
      energy: 0.80      // Highly efficient energy transfer through water
    }
  },

  'stir-frying': {
    name: 'stir-frying',
    description: 'High-heat quick cooking with constant motion',
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
    suitable_for: ['vegetables', 'thin meats', 'noodles', 'tofu'],
    benefits: ['preserves crunch', 'quick nutrient retention', 'wok hei flavor'],
    astrologicalInfluences: {
      favorableZodiac: ['aries', 'leo', 'gemini'],
      unfavorableZodiac: ['cancer', 'pisces', 'scorpio']
    },
    regionalVariations: {
      chinese: ['bao technique', 'yángchǎo'],
      japanese: ['teppanyaki style'],
      thai: ['pad phak']
    }
  },

  fermentation: {
    name: 'fermentation',
    description: 'Biological transformation of food through microbial activity',
    elementalEffect: {
      Water: 0.3,
      Earth: 0.3,
      Air: 0.3,
      Fire: 0.1
    },
    duration: {
      min: 1440, // 24 hours
      max: 10080 // 7 days
    },
    suitable_for: ['vegetables', 'dairy', 'grains', 'beverages'],
    benefits: ['probiotic development', 'enhanced nutrition', 'natural preservation'],
    astrologicalInfluences: {
      favorableZodiac: ['virgo', 'taurus', 'capricorn'],
      unfavorableZodiac: ['gemini', 'libra', 'aquarius'],
      dominantPlanets: ['Venus', 'Pluto'],
      lunarPhaseEffect: {
        'new_moon': 1.2,
        'full_moon': 0.8
      }
    },
    toolsRequired: [
      'pH meter (digital)',
      'Anaerobic chamber',
      'Gram scale (0.01g precision)'
    ],
    commonMistakes: [
      'inadequate sterilization',
      'incorrect salt concentration',
      'oxygen exposure'
    ],
    safetyFeatures: ['pH monitoring', 'anaerobic environment'],
    pairingSuggestions: [
      'Probiotic cultures',
      'Enzyme-enhanced sauces',
      'Ion-exchange purified waters'
    ],
    nutrientRetention: {
      probiotics: 1.2, // Increased through fermentation
      vitamins: 1.15,
      enzymes: 1.3
    },
    regionalVariations: {
      korean: ['kimchi'],
      german: ['sauerkraut'],
      indian: ['dosa batter']
    }
  },

  smoking: {
    name: 'smoking',
    description: 'Preserving and flavoring food with smoke',
    elementalEffect: {
      Fire: 0.4,
      Air: 0.4,
      Earth: 0.2,
      Water: 0
    },
    duration: {
      min: 120,
      max: 720
    },
    suitable_for: ['meats', 'fish', 'cheese', 'vegetables'],
    benefits: ['preservation', 'unique flavor', 'traditional method'],
    astrologicalInfluences: {
      favorableZodiac: ['leo', 'aries', 'sagittarius'],
      unfavorableZodiac: ['cancer', 'pisces', 'scorpio']
    },
    toolsRequired: ['smoker box', 'wood chips', 'meat hooks'],
    commonMistakes: [
      'oversmoking',
      'incorrect wood moisture',
      'temperature fluctuations'
    ],
    pairingSuggestions: ['robust rubs', 'whiskey-based glazes', 'pickled sides'],
    nutrientRetention: {
      proteins: 0.9,
      fats: 0.85,
      antioxidants: 1.1
    },
    regionalVariations: {
      american: ['Texas brisket'],
      scandinavian: ['cold-smoked salmon'],
      japanese: ['katsuobushi']
    },
    thermodynamicProperties: {
      heat: 0.40,       // Low to moderate heat
      entropy: 0.50,    // Moderate breakdown over long periods
      reactivity: 0.75, // High chemical interactions with smoke particles
      energy: 0.30      // Low efficiency with heat loss
    }
  },

  pressure_cooking: {
    name: 'pressure_cooking',
    description: 'High-pressure steam cooking for accelerated results',
    elementalEffect: {
      Water: 0.4,
      Fire: 0.3,
      Air: 0.2,
      Earth: 0.1
    },
    duration: {
      min: 5,
      max: 60
    },
    suitable_for: ['tough cuts', 'beans', 'grains', 'bone broths'],
    benefits: ['time efficiency', 'tenderizes collagen', 'flavor concentration'],
    astrologicalInfluences: {
      favorableZodiac: ['scorpio', 'capricorn', 'virgo'],
      unfavorableZodiac: ['gemini', 'libra', 'aquarius']
    },
    safetyFeatures: ['pressure release valve', 'locking lid'],
    nutrientRetention: {
      vitamins: 0.85,
      minerals: 0.95
    },
    commonMistakes: [
      'overfilling pot',
      'rapid pressure release',
      'ignoring natural release'
    ],
    pairingSuggestions: ['reduced sauces', 'hearty grains', 'braised greens'],
    regionalVariations: {
      indian: ['dal tadka'],
      cuban: ['frijoles negros'],
      chinese: ['hong shao rou']
    },
    thermodynamicProperties: {
      heat: 0.70,       // Higher than boiling point due to pressure
      entropy: 0.80,    // Rapid breakdown of structures
      reactivity: 0.65, // Enhanced reactions under pressure
      energy: 0.85      // Very efficient energy transfer in closed system
    }
  },

  spherification: {
    name: 'spherification',
    description: 'Molecular gastronomy technique that creates caviar-like spheres or larger droplets with thin gel membranes containing liquid centers',
    elementalEffect: {
      Water: 0.6,
      Air: 0.2,
      Earth: 0.1,
      Fire: 0.1
    },
    duration: {
      min: 1,
      max: 10
    },
    suitable_for: ['fruit juices', 'purees', 'liqueurs', 'broths', 'oils', 'yogurt', 'cocktails'],
    benefits: ['dramatic presentation', 'flavor burst', 'textural contrast', 'precise portioning', 'modern aesthetic'],
    astrologicalInfluences: {
      favorableZodiac: ['aquarius', 'gemini', 'pisces'],
      unfavorableZodiac: ['taurus', 'virgo', 'capricorn'],
      dominantPlanets: ['Neptune', 'Uranus', 'Mercury'],
      lunarPhaseEffect: {
        'full_moon': 1.4, // Enhanced spherification
        'new_moon': 0.7  // Difficult to form spheres
      }
    },
    toolsRequired: [
      'Digital scale',
      'Immersion blender',
      'pH meter',
      'Dropper/syringe',
      'Slotted spoon',
      'Calcium bath'
    ],
    commonMistakes: [
      'incorrect pH balance',
      'improper alginate dissolution',
      'wrong calcium concentration',
      'improper timing',
      'temperature issues'
    ],
    pairingSuggestions: [
      'Contrasting textures',
      'Complementary flavor bases',
      'Visual color contrasts',
      'Temperature contrasts'
    ],
    nutrientRetention: {
      vitamins: 0.85,
      minerals: 0.90,
      enzymes: 0.85,
      antioxidants: 0.80
    },
    optimalTemperatures: {
      'alginate_solution': 70,
      'calcium_bath': 39,
      'setting_bath': 39,
      'service': 39
    },
    regionalVariations: {
      spanish: ['modern tapas', 'culinary foams'],
      french: ['modernist cuisine'],
      japanese: ['modern kaiseki']
    },
    chemicalChanges: {
      'ionic_gelation': true,
      'membrane_formation': true,
      'osmotic_pressure': true,
      'selective_permeability': true
    },
    safetyFeatures: [
      'Use food-grade chemicals only',
      'Proper measurement of additives',
      'Follow sanitation protocols'
    ],
    thermodynamicProperties: {
      heat: 0.15,       // Minimal heat involvement
      entropy: 0.40,    // Moderate structural transformation
      reactivity: 0.65, // High chemical reactivity (ionic gelation)
      energy: 0.25      // Low thermal energy, high chemical energy
    }
  },

  gelification: {
    name: 'gelification',
    description: 'Creating edible gels using hydrocolloids like agar-agar and gellan gum',
    elementalEffect: {
      Earth: 0.5,
      Water: 0.4,
      Air: 0.05,
      Fire: 0.05
    },
    duration: {
      min: 10,
      max: 60
    },
    suitable_for: ['fruit purees', 'stock reductions', 'dairy products', 'herbal extracts'],
    benefits: ['temperature-stable structures', 'flavor layering', 'innovative presentations'],
    astrologicalInfluences: {
      favorableZodiac: ['virgo', 'capricorn', 'scorpio'],
      unfavorableZodiac: ['aries', 'leo', 'sagittarius'],
      lunarPhaseEffect: {
        'full_moon': 1.2,
        'waning_crescent': 0.8
      }
    },
    toolsRequired: [
      'Agar-agar (laboratory-grade)',
      'Water bath (precision ±0.1°C)',
      'Agar molds (borosilicate glass)'
    ],
    commonMistakes: [
      'incorrect bloom temperatures',
      'premature gel setting',
      'inadequate hydration time'
    ],
    pairingSuggestions: [
      'Molecular gastronomy foams',
      'Cryo-shocked elements',
      'Edible chemical reactions'
    ],
    nutrientRetention: {
      dietaryFiber: 1.25,
      antioxidants: 0.9
    },
    regionalVariations: {
      french: ['consommé gels', 'foie gras terrines'],
      peruvian: ['tiger\'s milk gels'],
      australian: ['native ingredient hydrogels']
    },
    thermodynamicProperties: {
      heat: 0.35,       // Low-moderate heat for hydration
      entropy: 0.55,    // Significant transformation of structure
      reactivity: 0.60, // Moderate-high chemical reactions
      energy: 0.40      // Moderate energy efficiency
    }
  },

  emulsification: {
    name: 'emulsification',
    description: 'Advanced stabilization of immiscible liquids using lecithin and ultrasonic waves',
    elementalEffect: {
      Water: 0.4,
      Fire: 0.3,
      Air: 0.2,
      Earth: 0.1
    },
    duration: {
      min: 2,
      max: 15
    },
    suitable_for: ['fat-washed spirits', 'essential oil emulsions', 'caviar substitutes'],
    benefits: ['novel textures', 'flavor delivery systems', 'optical clarity'],
    astrologicalInfluences: {
      favorableZodiac: ['pisces', 'cancer', 'scorpio'],
      unfavorableZodiac: ['gemini', 'libra', 'aquarius'],
      lunarPhaseEffect: {
        'first_quarter': 1.15,
        'last_quarter': 0.85
      }
    },
    toolsRequired: [
      'Ultrasonic probe (20kHz)',
      'Lecithin (sunflower-derived)',
      'Micro-pipettes (1-1000μL)'
    ],
    commonMistakes: [
      'incorrect HLB balance',
      'over-processing',
      'temperature abuse'
    ],
    pairingSuggestions: [
      'Deconstructed flavor systems',
      'Nano-encapsulated aromas',
      'Edible surfactant cocktails'
    ],
    nutrientRetention: {
      lipidSolubleNutrients: 1.3,
      volatileCompounds: 0.8
    },
    regionalVariations: {
      modernist: ['OLED edible displays', 'nano-emulsions'],
      japanese: ['umami aerosols'],
      brazilian: ['tropical foam forests']
    },
    thermodynamicProperties: {
      heat: 0.25,       // Low heat involvement
      entropy: 0.70,    // High structural transformation
      reactivity: 0.65, // Significant interfacial reactions
      energy: 0.35      // Moderate-low thermal efficiency, high kinetic input
    }
  },

  cryo_cooking: {
    name: 'cryo_cooking',
    description: 'Ultra-low temperature cooking using liquid nitrogen (-196°C)',
    elementalEffect: {
      Air: 0.6,
      Water: 0.2,
      Earth: 0.1,
      Fire: 0.1
    },
    duration: {
      min: 0.5,
      max: 5
    },
    suitable_for: ['instant freezing', 'texture modification', 'dramatic presentation'],
    benefits: ['rapid phase change', 'preserved volatiles', 'crystalline structures'],
    astrologicalInfluences: {
      favorableZodiac: ['aquarius', 'gemini', 'libra'],
      unfavorableZodiac: ['taurus', 'virgo', 'capricorn'],
      lunarPhaseEffect: {
        'waning_gibbous': 1.4,
        'new_moon': 0.6
      },
      dominantPlanets: ['Saturn', 'Pluto'],
    },
    toolsRequired: [
      'Liquid nitrogen Dewar (ISO-certified)',
      'Anti-static gloves',
      'Insulated silicone molds'
    ],
    commonMistakes: [
      'improper ventilation',
      'thermal shock breakage',
      'frostbite risk'
    ],
    safetyFeatures: [
      'Cryogenic safety protocols',
      'Oxygen deficiency monitors',
      'Emergency ventilation system'
    ],
    pairingSuggestions: [
      'Thermal contrast foams',
      'Edible holograms',
      'Aroma-locked powders'
    ],
    nutrientRetention: {
      heatSensitiveNutrients: 1.45,
      enzymaticActivity: 0.95
    },
    regionalVariations: {
      british: ['nitrogen-frozen desserts'],
      japanese: ['sashimi instant-freeze'],
      mexican: ['chili nitrogen dust']
    },
    thermodynamicProperties: {
      heat: 0.95,       // Extreme temperature differential (very cold)
      entropy: 0.80,    // Dramatic structural change
      reactivity: 0.30, // Low chemical reactivity at low temperatures
      energy: 0.75      // High energy transfer through extreme temperature gradient
    }
  },

  broiling: {
    name: 'broiling',
    description: 'French-inspired intense top-down radiant heat cooking',
    elementalEffect: {
      Fire: 0.6,
      Air: 0.2,
      Earth: 0.1,
      Water: 0.1
    },
    duration: {
      min: 2,
      max: 10
    },
    suitable_for: [
      'gratin toppings',
      'bone marrow',
      'crème brûlée',
      'thin-cut proteins'
    ],
    benefits: [
      'rapid caramelization',
      'maillard reaction control',
      'surface texturization'
    ],
    astrologicalInfluences: {
      favorableZodiac: ['leo', 'aries', 'sagittarius'],
      unfavorableZodiac: ['cancer', 'pisces', 'scorpio'],
      dominantPlanets: ['Sun', 'Mars'],
      lunarPhaseEffect: {
        'full_moon': 1.3,
        'new_moon': 0.7
      }
    },
    toolsRequired: [
      'Salamander broiler (French-made)',
      'Copper-clad au gratin dishes',
      'Infrared thermometer'
    ],
    commonMistakes: [
      'improper rack positioning',
      'premature sugar application',
      'uneven heat distribution'
    ],
    pairingSuggestions: [
      'Béarnaise foam',
      'Cryo-shocked herb dust',
      'Reduction gel spheres'
    ],
    chemicalChanges: {
      maillardReaction: true,
      caramelization: true,
      proteinCrystallization: true
    },
    nutrientRetention: {
      proteins: 0.88,
      caramelizedSugars: 1.25,
      surfaceMinerals: 0.95
    },
    regionalVariations: {
      french: [
        'gratin dauphinois',
        'brûlée technique',
        'en salamandre'
      ],
      modern: [
        'sous-vide then flash-broil',
        'cryo-broiled citrus'
      ]
    },
    thermodynamicProperties: {
      heat: 0.90,       // Extremely high heat from direct flame
      entropy: 0.65,    // Significant breakdown on surface
      reactivity: 0.85, // Very high level of Maillard reactions and carbonization
      energy: 0.60      // Moderate efficiency (heat lost to environment)
    }
  },

  roasting: {
    name: 'roasting',
    description: 'Cooking food with dry heat in an oven or over open fire, usually uncovered to achieve browning and caramelization',
    elementalEffect: {
      Fire: 0.7,
      Air: 0.2, 
      Earth: 0.1,
      Water: 0.0
    },
    duration: {
      min: 20,
      max: 240
    },
    suitable_for: ['meat', 'poultry', 'vegetables', 'nuts', 'seeds', 'coffee beans', 'fruits'],
    benefits: ['enhanced flavor development', 'caramelization', 'textural contrast', 'fat rendering', 'minimal monitoring'],
    astrologicalInfluences: {
      favorableZodiac: ['leo', 'aries', 'sagittarius'],
      unfavorableZodiac: ['cancer', 'pisces', 'scorpio'],
      dominantPlanets: ['Sun', 'Mars', 'Jupiter'],
      lunarPhaseEffect: {
        'full_moon': 1.2, // More active browning
        'new_moon': 0.8  // Less caramelization
      }
    },
    toolsRequired: [
      'Roasting pan',
      'Rack',
      'Meat thermometer',
      'Baster or brush',
      'Carving board'
    ],
    commonMistakes: [
      'improper temperature',
      'insufficient resting time',
      'overcrowding the pan',
      'not trussing poultry',
      'failing to baste'
    ],
    pairingSuggestions: [
      'Herb-infused jus',
      'Reduced wine sauces',
      'Compound butters',
      'Pickled garnishes'
    ],
    nutrientRetention: {
      carbohydrates: 0.80,
      proteins: 0.85,
      vitamins: 0.60,
      minerals: 0.85
    },
    optimalTemperatures: {
      'beef': 375,
      'poultry': 350,
      'pork': 350,
      'vegetables': 425,
      'nuts': 300
    },
    regionalVariations: {
      french: ['rotisserie', 'en cocotte'],
      british: ['sunday roast'],
      middle_eastern: ['mechoui'],
      chinese: ['char siu']
    },
    chemicalChanges: {
      'maillard_reaction': true,
      'caramelization': true,
      'fat_rendering': true,
      'protein_denaturation': true
    },
    safetyFeatures: [
      'Monitor internal temperature with thermometer',
      'Use proper ventilation',
      'Allow adequate cooling time before carving'
    ],
    thermodynamicProperties: {
      heat: 0.80,       // High heat penetrating food from outside in
      entropy: 0.60,    // Moderate-high breakdown of structures
      reactivity: 0.75, // High level of browning reactions
      energy: 0.65      // Good energy transfer through radiation and convection
    }
  },
  
  steaming: {
    name: 'steaming',
    description: 'Cooking food by suspending it over boiling water, using the resulting vapor to cook without direct contact with water',
    elementalEffect: {
      Water: 0.6,
      Air: 0.3,
      Fire: 0.1,
      Earth: 0.0
    },
    duration: {
      min: 5,
      max: 30
    },
    suitable_for: ['vegetables', 'fish', 'dumplings', 'rice', 'delicate desserts', 'custards'],
    benefits: ['preserves nutrients', 'retains colors', 'prevents drying', 'gentle cooking', 'no added fat'],
    astrologicalInfluences: {
      favorableZodiac: ['cancer', 'pisces', 'libra'],
      unfavorableZodiac: ['leo', 'aries', 'capricorn'],
      dominantPlanets: ['Moon', 'Venus', 'Neptune'],
      lunarPhaseEffect: {
        'full_moon': 1.1, // Enhanced moisture retention
        'new_moon': 0.9  // Slight reduction in steam efficacy
      }
    },
    toolsRequired: [
      'Steamer basket',
      'Pot with lid',
      'Heat source',
      'Tongs',
      'Parchment paper'
    ],
    commonMistakes: [
      'not monitoring water level',
      'overcrowding steamer basket',
      'removing lid too frequently',
      'inadequate sealing',
      'oversteaming delicate items'
    ],
    pairingSuggestions: [
      'Citrus-infused oils',
      'Light herb sauces',
      'Delicate vinaigrettes',
      'Dipping sauces'
    ],
    nutrientRetention: {
      carbohydrates: 0.95,
      proteins: 0.90,
      vitamins: 0.85,
      minerals: 0.90
    },
    optimalTemperatures: {
      'vegetables': 212,
      'fish': 212,
      'dumplings': 212,
      'custards': 212
    },
    regionalVariations: {
      chinese: ['dim sum', 'steamed fish'],
      japanese: ['chawanmushi', 'mushimono'],
      thai: ['hor mok', 'steamed curry'],
      french: ['en papillote']
    },
    chemicalChanges: {
      'protein_denaturation': true,
      'hydration': true,
      'leaching': false,
      'enzymatic_browning': false
    },
    safetyFeatures: [
      'Use caution when lifting lid to avoid steam burns',
      'Ensure proper ventilation',
      'Use heat-resistant gloves'
    ],
    thermodynamicProperties: {
      heat: 0.45,       // Limited to 100°C but efficient moisture transfer
      entropy: 0.35,    // Gentle breakdown of structures
      reactivity: 0.30, // Low reactivity, preserves natural state
      energy: 0.55      // Relatively efficient energy transfer
    }
  },

  frying: {
    name: 'frying',
    description: 'Cooking food in hot oil or fat',
    elementalEffect: {
      Fire: 0.6,
      Air: 0.2,
      Earth: 0.1,
      Water: 0.1
    },
    duration: {
      min: 2,
      max: 15
    },
    suitable_for: ['vegetables', 'meats', 'seafood', 'breaded items'],
    benefits: ['quick cooking', 'crispy texture', 'flavor development'],
    astrologicalInfluences: {
      favorableZodiac: ['leo', 'aries', 'sagittarius'],
      unfavorableZodiac: ['cancer', 'pisces', 'scorpio'],
      dominantPlanets: ['Mars', 'Sun']
    },
    toolsRequired: ['deep fryer', 'thermometer', 'spider strainer'],
    commonMistakes: ['oil too cold', 'overcrowding', 'improper draining'],
    nutrientRetention: {
      fats: 1.5, // Increased
      vitamins: 0.7
    },
    regionalVariations: {
      japanese: ['tempura'],
      southern: ['deep-fried chicken'],
      indian: ['pakora']
    },
    thermodynamicProperties: {
      heat: 0.85,       // Very high heat transfer through oil
      entropy: 0.70,    // Rapid breakdown of structures
      reactivity: 0.80, // High reactivity with oil interactions
      energy: 0.75      // Efficient conductive heat transfer
    }
  },
  
  raw: {
    name: 'raw',
    description: 'Preparing food without the application of heat',
    elementalEffect: {
      Water: 0.4,
      Earth: 0.3,
      Air: 0.2,
      Fire: 0.1
    },
    duration: {
      min: 0,
      max: 30 // Preparation time
    },
    suitable_for: ['fruits', 'vegetables', 'certain seafood', 'sprouts'],
    benefits: ['nutrient preservation', 'natural enzymes', 'bright flavors'],
    astrologicalInfluences: {
      favorableZodiac: ['taurus', 'virgo', 'capricorn'],
      unfavorableZodiac: ['leo', 'aries', 'sagittarius']
    },
    toolsRequired: ['sharp knives', 'mandoline', 'juicer'],
    commonMistakes: ['poor ingredient quality', 'improper sanitation', 'incorrect cutting'],
    nutrientRetention: {
      enzymes: 1.0,
      vitamins: 1.0,
      minerals: 1.0
    },
    regionalVariations: {
      japanese: ['sashimi'],
      peruvian: ['ceviche'],
      mediterranean: ['carpaccio']
    },
    thermodynamicProperties: {
      heat: 0.0,        // No heat application
      entropy: 0.10,    // Minimal entropy change
      reactivity: 0.15, // Only from acidic marinades if used
      energy: 0.0       // No energy transfer
    }
  },
  
  braising: {
    name: 'braising',
    description: 'Slow cooking method where food is first seared at high temperature, then finished in a covered pot with liquid at lower temperature',
    elementalEffect: {
      Water: 0.4,
      Fire: 0.3,
      Earth: 0.2,
      Air: 0.1
    },
    duration: {
      min: 60,
      max: 360
    },
    suitable_for: ['tough meats', 'root vegetables', 'legumes', 'hearty greens', 'poultry thighs'],
    benefits: ['tenderizes tough foods', 'develops complex flavors', 'creates rich sauces', 'minimal monitoring once started'],
    astrologicalInfluences: {
      favorableZodiac: ['taurus', 'cancer', 'scorpio', 'capricorn'],
      unfavorableZodiac: ['gemini', 'aquarius', 'libra'],
      dominantPlanets: ['Saturn', 'Moon', 'Pluto'],
      lunarPhaseEffect: {
        'full_moon': 0.9, // Reduced effectiveness
        'new_moon': 1.2,  // Enhanced flavor integration
        'waning_moon': 1.3 // Best phase for deep flavor development
      }
    },
    toolsRequired: [
      'Dutch oven',
      'Heavy-bottomed pot with lid',
      'Tongs',
      'Wooden spoon',
      'Aromatics'
    ],
    commonMistakes: [
      'too much liquid',
      'cooking too fast',
      'lid not tight',
      'inadequate initial browning',
      'underseasoning'
    ],
    pairingSuggestions: [
      'Fresh herb garnishes',
      'Acid components for balance',
      'Creamy polenta',
      'Crusty bread'
    ],
    nutrientRetention: {
      collagen: 0.95,
      minerals: 0.85,
      vitamins: 0.60,
      proteins: 0.90
    },
    optimalTemperatures: {
      'initial_sear': 450,
      'braising_phase': 325,
      'final_reduction': 350
    },
    regionalVariations: {
      french: ['coq au vin', 'boeuf bourguignon'],
      italian: ['osso buco', 'brasato'],
      chinese: ['red-braised pork', 'hong shao rou'],
      mexican: ['birria', 'carnitas']
    },
    chemicalChanges: {
      'collagen_breakdown': true,
      'maillard_reaction': true,
      'fat_emulsification': true,
      'flavor_concentration': true
    },
    safetyFeatures: [
      'Handle heavy pot with care',
      'Use oven mitts for hot lids',
      'Avoid steam burns when opening'
    ],
    thermodynamicProperties: {
      heat: 0.55,       // Moderate heat with liquid limiting max temperature
      entropy: 0.75,    // High breakdown of collagen and tough structures
      reactivity: 0.60, // Good flavor development and Maillard from initial sear
      energy: 0.70      // Efficient energy transfer through multiple mechanisms
    }
  },
  
  grilling: {
    name: 'grilling',
    description: 'Cooking food directly over heat',
    elementalEffect: {
      Fire: 0.7,
      Air: 0.2,
      Earth: 0.1,
      Water: 0
    },
    duration: {
      min: 2,
      max: 30
    },
    suitable_for: ['meats', 'vegetables', 'seafood', 'fruit'],
    benefits: ['char flavor', 'caramelization', 'fat rendering'],
    astrologicalInfluences: {
      favorableZodiac: ['aries', 'leo', 'sagittarius'],
      unfavorableZodiac: ['cancer', 'scorpio', 'pisces']
    },
    toolsRequired: ['grill', 'tongs', 'brush'],
    commonMistakes: ['too high heat', 'constant flipping', 'lid misuse'],
    nutrientRetention: {
      proteins: 0.85,
      vitamins: 0.7
    },
    regionalVariations: {
      argentine: ['asado'],
      korean: ['bulgogi'],
      american: ['bbq']
    },
    thermodynamicProperties: {
      heat: 0.90,       // Extremely high heat from direct flame
      entropy: 0.65,    // Significant breakdown on surface
      reactivity: 0.85, // Very high level of Maillard reactions and carbonization
      energy: 0.60      // Moderate efficiency (heat lost to environment)
    }
  },
};

// Helper functions for astrological integration
export const getAstrologicalEffect = (
  method: CookingMethod,
  astroState: AstrologicalState
): number => {
  const methodData = cookingMethods[method];
  if (!methodData || !methodData.astrologicalInfluences) return 1.0;

  let effect = 1.0;
  
  // Check for zodiac sign compatibility
  if (astroState.sunSign && methodData.astrologicalInfluences.favorableZodiac) {
    // Strong zodiac match bonus
    const zodiacExactMatch = methodData.astrologicalInfluences.favorableZodiac.includes(astroState.sunSign);
    effect *= zodiacExactMatch ? 2 : 0.8; // More drastic multiplier
  }

  // Planetary dominance scoring
  const planetBoost = methodData?.astrologicalInfluences?.dominantPlanets?.filter(p => 
    astroState.activePlanets.includes(p)
  )?.length ?? 0;
  effect += planetBoost * 0.25; // Increased from 0.1

  // Check for planetary ruler match
  let decanRulerMatch = 1.0;
  
  // Use currentPlanetaryAlignment instead of planetaryAlignment
  if (astroState.currentPlanetaryAlignment && astroState.activePlanets && astroState.activePlanets.length > 0) {
    // Just a basic check for active planets
    decanRulerMatch = 1.2;
  }

  effect *= decanRulerMatch;

  return Math.min(effect, 2.5); // Higher max cap
};

const DECAN_MODIFIERS = {
  Sun: 0.15,
  Moon: 0.12,
  Mercury: 0.1,
  // ... other planets ...
};

export const calculateModifiedElementalEffect = (
  method: CookingMethod,
  astroState: AstrologicalState,
  duration: number,
  temperature?: number,
  currentSeason?: Season
): ElementalProperties => {
  const methodData = cookingMethods[method];
  if (!methodData) {
    throw new Error(`Invalid cooking method: ${method}`);
  }

  const baseEffect = methodData.elementalEffect;
  const astroEffect = getAstrologicalEffect(method, astroState);
  const durationEffect = Math.min(duration / methodData.duration.max, 2);
  const tempEffect = temperature ? Math.min(temperature / 250, 1.5) : 1;
  
  const seasonKey = (currentSeason as string) === 'fall' ? 'autumn' : currentSeason;
  
  // Create a default seasonal effect for undefined seasons
  let seasonalEffect: Record<keyof ElementalProperties, number>;
  
  if (!seasonKey || !SEASONAL_MODIFIERS[seasonKey as keyof typeof SEASONAL_MODIFIERS]) {
    // Default balanced effect when season is undefined
    seasonalEffect = SeasonalConstantsBalancedElements;
  } else {
    // Use the defined seasonal modifiers
    seasonalEffect = SEASONAL_MODIFIERS[seasonKey as keyof typeof SEASONAL_MODIFIERS];
  }

  return Object.entries(baseEffect || {}).reduce((acc, [element, value]) => {
    return {
      ...acc,
      [element]: value * astroEffect * durationEffect * tempEffect * 
        (seasonalEffect[element as keyof ElementalProperties] || 1)
    };
  }, {} as ElementalProperties);
};

// Updated synergy analysis for modern techniques
export const analyzeMethodSynergy = (
  method1: CookingMethod,
  method2: CookingMethod,
  ingredients: ElementalProperties
): { score: number; notes: string[] } => {
  const method1Data = cookingMethods[method1];
  const method2Data = cookingMethods[method2];
  
  // Fix indexing with proper type assertions
  const score = Object.keys(ingredients).reduce((total, element) => {
    const elementKey = element as keyof ElementalProperties;
    const elementScore = (method1Data?.elementalEffect[elementKey] || 0) + 
                        (method2Data?.elementalEffect[elementKey] || 0);
    return total + (ingredients[elementKey] * elementScore);
  }, 0);

  const notes: string[] = [];
  
  // Check for tool compatibility
  const sharedTools = method1Data?.toolsRequired?.filter(tool => 
    method2Data?.toolsRequired?.includes(tool)
  );
  if (sharedTools?.length) {
    notes.push(`Shared tools: ${sharedTools.join(', ')} enable workflow synergy`);
  }

  // Check for mistake prevention
  const mistakeCoverage = method1Data?.commonMistakes?.some(mistake => 
    method2Data?.benefits?.some(benefit => benefit.includes(mistake))
  );
  if (mistakeCoverage) {
    notes.push('Complementary methods reduce common preparation errors');
  }

  // Modern technique synergies
  if ([method1, method2].some(m => m.includes('cryo') || m.includes('spherification'))) {
    notes.push('Molecular techniques require precise environmental controls');
  }

  if (method1Data?.toolsRequired?.some(t => t.includes('nitrogen')) && 
      method2Data?.toolsRequired?.some(t => t.includes('ultrasonic'))) {
    notes.push('Phase-change cooking enables novel texture engineering');
  }

  // Add scientific pairing logic
  if (method1Data?.pairingSuggestions?.some(p => p.includes('nano')) &&
      method2Data?.pairingSuggestions?.some(p => p.includes('enzyme'))) {
    notes.push('Nanoscale delivery systems enhance enzymatic reactions');
  }

  // Fix broiling comparison - check if the string matches instead of using ===
  if (method1.includes('broil') || method2.includes('broil')) {
    notes.push('Broiling benefits from pre-treatment with sous-vide or brining');
    
    if (method1.includes('cryo') || method2.includes('cryo')) {
      notes.push('Flash freezing before broiling creates dramatic texture contrasts');
    }
  }

  // Fix regionalVariations French check
  if ((method1Data?.regionalVariations?.french?.length ?? 0) > 0 || 
      (method2Data?.regionalVariations?.french?.length ?? 0) > 0) {
    notes.push('Classic French techniques enhance flavor layering');
  }

  return { score, notes };
};

export default cookingMethods;