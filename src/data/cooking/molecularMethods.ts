import type { CookingMethodData, CookingMethod } from '@/types/alchemy';

export const molecularCookingMethods: Partial<Record<CookingMethod, CookingMethodData>> = {
  spherification: {
    name: 'spherification',
    description: 'Creating small, caviar-like spheres with liquid centers by dropping flavored liquid into a setting bath',
    elementalEffect: {
      Water: 0.8,
      Air: 0.1,
      Earth: 0.1,
      Fire: 0.0
    },
    duration: {
      min: 2,
      max: 5
    },
    suitable_for: ['fruit juices', 'purees', 'sauces', 'liqueurs', 'yogurt'],
    benefits: ['burst-in-mouth sensation', 'visual appeal', 'flavor encapsulation'],
    astrologicalInfluences: {
      favorableZodiac: ['aquarius', 'pisces', 'gemini'],
      unfavorableZodiac: ['virgo', 'taurus', 'capricorn'],
      dominantPlanets: ['Neptune', 'Uranus']
    },
    chemicalChanges: {
      'ionic_gelation': true,
      'selective_permeability': true,
      'osmotic_pressure': true
    },
    toolsRequired: [
      'Digital scale',
      'Sodium alginate',
      'Calcium chloride/lactate',
      'Pipettes/droppers',
      'pH meter'
    ],
    optimalTemperatures: {
      'base_solution': 70,
      'calcium_bath': 39
    }
  },
  
  gelification: {
    name: 'gelification',
    description: 'Creating gels with specific textures using hydrocolloids like agar, gelatin, or carrageenan',
    elementalEffect: {
      Water: 0.5,
      Earth: 0.4,
      Air: 0.1,
      Fire: 0.0
    },
    duration: {
      min: 15,
      max: 240
    },
    suitable_for: ['consommés', 'fruit purees', 'dairy', 'herb infusions'],
    benefits: ['unique textures', 'shape control', 'flavor concentration', 'temperature stability'],
    astrologicalInfluences: {
      favorableZodiac: ['scorpio', 'capricorn', 'virgo'],
      unfavorableZodiac: ['aries', 'leo', 'sagittarius'],
      dominantPlanets: ['Pluto', 'Saturn']
    },
    chemicalChanges: {
      'hydrogen_bonding': true,
      'helix_formation': true,
      'thermoreversible_gelation': true
    },
    toolsRequired: [
      'Precision scale',
      'Immersion blender',
      'Silicone molds',
      'Temperature-controlled water bath',
      'Strainer'
    ],
    optimalTemperatures: {
      'agar_dissolution': 205,
      'gelatin_bloom': 40,
      'setting': 36
    }
  },
  
  emulsification: {
    name: 'emulsification',
    description: 'Creating stable mixtures of normally immiscible liquids using emulsifiers or mechanical processes',
    elementalEffect: {
      Water: 0.4,
      Air: 0.3,
      Earth: 0.2,
      Fire: 0.1
    },
    duration: {
      min: 5,
      max: 30
    },
    suitable_for: ['sauces', 'foams', 'dressings', 'creams', 'butters'],
    benefits: ['smooth textures', 'flavor integration', 'visual appeal', 'stability'],
    astrologicalInfluences: {
      favorableZodiac: ['libra', 'gemini', 'aquarius'],
      unfavorableZodiac: ['cancer', 'scorpio', 'pisces'],
      dominantPlanets: ['Venus', 'Mercury']
    },
    chemicalChanges: {
      'interfacial_tension_reduction': true,
      'micelle_formation': true,
      'steric_hindrance': true
    },
    toolsRequired: [
      'High-speed blender',
      'Homogenizer',
      'Lecithin',
      'Xanthan gum',
      'Iota carrageenan'
    ],
    optimalTemperatures: {
      'hot_emulsion': 160,
      'cold_emulsion': 40
    }
  },
  
  cryo_cooking: {
    name: 'cryo_cooking',
    description: 'Using extreme cold (often liquid nitrogen) for rapid freezing, texture modification, or dramatic presentation',
    elementalEffect: {
      Water: 0.1,
      Air: 0.1,
      Earth: 0.3,
      Fire: 0.5
    },
    duration: {
      min: 1,
      max: 15
    },
    suitable_for: ['ice creams', 'sorbets', 'cocktails', 'herbs', 'fruits'],
    benefits: ['instant freezing', 'minimal ice crystals', 'theatrical presentation', 'texture preservation'],
    astrologicalInfluences: {
      favorableZodiac: ['aquarius', 'scorpio', 'capricorn'],
      unfavorableZodiac: ['leo', 'aries', 'cancer'],
      dominantPlanets: ['Uranus', 'Pluto', 'Saturn']
    },
    chemicalChanges: {
      'vitrification': true,
      'cellular_structure_preservation': true,
      'phase_change': true
    },
    toolsRequired: [
      'Liquid nitrogen',
      'Insulated container',
      'Cryogenic gloves',
      'Metal bowls',
      'Face shield'
    ],
    optimalTemperatures: {
      'liquid_nitrogen': -321,
      'service': 0
    },
    safetyFeatures: [
      'Proper ventilation essential',
      'Never use sealed containers',
      'Protective equipment required',
      'Never touch with bare skin'
    ]
  }
}; 