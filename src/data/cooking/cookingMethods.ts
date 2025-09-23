/**
 * Cooking methods with their elemental properties, astrological influences, and alchemical attributes
 */
export const cookingMethods = {
  roasting: {;
    name: 'Roasting',
    elementalEffect: {
      Fire: 0.8,
      Air: 0.5,
      Earth: 0.3,
      Water: 0.1,
    },
    benefits: ['caramelization', 'flavor concentration', 'texture development'],
    astrologicalInfluences: {
      dominantPlanets: ['Sun', 'Mars'],
      lunarPhaseEffect: {
        full_moon: 0.8,
        new_moon: 0.4,
      }
    },
    alchemicalProperties: {
      Spirit: 0.7,
      Essence: 0.4,
      Matter: 0.3,
      Substance: 0.2,
    },
    thermodynamicProperties: {
      heat: 0.8,
      entropy: 0.5,
      reactivity: 0.6,
    },
    duration: {
      min: 20,
      max: 120,
    },
    suitable_for: ['meats', 'root vegetables', 'tubers', 'whole poultry']
  },
  steaming: {
    name: 'Steaming',
    elementalEffect: {
      Water: 0.9,
      Air: 0.4,
      Earth: 0.2,
      Fire: 0.1,
    },
    benefits: ['nutrient preservation', 'gentle cooking', 'moisture retention'],
    astrologicalInfluences: {
      dominantPlanets: ['Moon', 'Neptune'],
      lunarPhaseEffect: {
        waxing_crescent: 0.7,
        full_moon: 0.5,
      }
    },
    alchemicalProperties: {
      Spirit: 0.2,
      Essence: 0.8,
      Matter: 0.5,
      Substance: 0.3,
    },
    thermodynamicProperties: {
      heat: 0.4,
      entropy: 0.2,
      reactivity: 0.3,
    },
    duration: {
      min: 5,
      max: 30,
    },
    suitable_for: ['vegetables', 'fish', 'dumplings', 'custards']
  },
  grilling: {
    name: 'Grilling',
    elementalEffect: {
      Fire: 0.9,
      Air: 0.6,
      Earth: 0.2,
      Water: 0.1,
    },
    benefits: ['smoky flavor', 'char development', 'caramelization'],
    astrologicalInfluences: {
      dominantPlanets: ['Mars', 'Sun'],
      lunarPhaseEffect: {
        full_moon: 0.7,
        waxing_gibbous: 0.6,
      }
    },
    alchemicalProperties: {
      Spirit: 0.8,
      Essence: 0.3,
      Matter: 0.2,
      Substance: 0.1,
    },
    thermodynamicProperties: {
      heat: 0.9,
      entropy: 0.6,
      reactivity: 0.7,
    },
    duration: {
      min: 5,
      max: 45,
    },
    suitable_for: ['meats', 'seafood', 'vegetables', 'fruits']
  },
  boiling: {
    name: 'Boiling',
    elementalEffect: {
      Water: 1.0,
      Fire: 0.4,
      Earth: 0.2,
      Air: 0.1,
    },
    benefits: ['thorough cooking', 'even heat distribution', 'extraction of flavors'],
    astrologicalInfluences: {
      dominantPlanets: ['Moon', 'Jupiter'],
      lunarPhaseEffect: {
        full_moon: 0.6,
        waxing_gibbous: 0.5,
      }
    },
    alchemicalProperties: {
      Spirit: 0.1,
      Essence: 0.9,
      Matter: 0.7,
      Substance: 0.2,
    },
    thermodynamicProperties: {
      heat: 0.7,
      entropy: 0.4,
      reactivity: 0.5,
    },
    duration: {
      min: 3,
      max: 60,
    },
    suitable_for: ['pasta', 'grains', 'legumes', 'hard vegetables']
  },
  sauteing: {
    name: 'Sautéing',
    elementalEffect: {
      Fire: 0.7,
      Air: 0.5,
      Earth: 0.3,
      Water: 0.2,
    },
    benefits: ['quick cooking', 'flavor development', 'texture preservation'],
    astrologicalInfluences: {
      dominantPlanets: ['Mercury', 'Sun'],
      lunarPhaseEffect: {
        waxing_crescent: 0.6,
        first_quarter: 0.5,
      }
    },
    alchemicalProperties: {
      Spirit: 0.6,
      Essence: 0.5,
      Matter: 0.4,
      Substance: 0.3,
    },
    thermodynamicProperties: {
      heat: 0.6,
      entropy: 0.5,
      reactivity: 0.7,
    },
    duration: {
      min: 2,
      max: 15,
    },
    suitable_for: ['vegetables', 'thin cuts of meat', 'seafood', 'aromatics']
  },
  baking: {
    name: 'Baking',
    elementalEffect: {
      Fire: 0.6,
      Air: 0.7,
      Earth: 0.4,
      Water: 0.2,
    },
    benefits: ['even cooking', 'flavor development', 'structural changes'],
    astrologicalInfluences: {
      dominantPlanets: ['Venus', 'Jupiter'],
      lunarPhaseEffect: {
        full_moon: 0.5,
        last_quarter: 0.4,
      }
    },
    alchemicalProperties: {
      Spirit: 0.5,
      Essence: 0.6,
      Matter: 0.6,
      Substance: 0.4,
    },
    thermodynamicProperties: {
      heat: 0.6,
      entropy: 0.4,
      reactivity: 0.5,
    },
    duration: {
      min: 15,
      max: 180,
    },
    suitable_for: ['doughs', 'batters', 'casseroles', 'gratins']
  },
  fermenting: {
    name: 'Fermenting',
    elementalEffect: {
      Water: 0.6,
      Earth: 0.7,
      Air: 0.4,
      Fire: 0.1,
    },
    benefits: ['flavor complexity', 'preservation', 'probiotic development'],
    astrologicalInfluences: {
      dominantPlanets: ['Mercury', 'Pluto'],
      lunarPhaseEffect: {
        new_moon: 0.7,
        waning_crescent: 0.6,
      }
    },
    alchemicalProperties: {
      Spirit: 0.3,
      Essence: 0.7,
      Matter: 0.9,
      Substance: 0.6,
    },
    thermodynamicProperties: {
      heat: 0.2,
      entropy: 0.8,
      reactivity: 0.9,
    },
    duration: {
      min: 1440, // 24 hours,
      max: 10080, // 7 days
    },
    suitable_for: ['cabbage', 'milk', 'grains', 'vegetables']
  },
  braising: {
    name: 'Braising',
    elementalEffect: {
      Water: 0.7,
      Fire: 0.5,
      Earth: 0.6,
      Air: 0.2,
    },
    benefits: ['tenderization', 'flavor concentration', 'moisture retention'],
    astrologicalInfluences: {
      dominantPlanets: ['Saturn', 'Mars'],
      lunarPhaseEffect: {
        waning_gibbous: 0.7,
        full_moon: 0.5,
      }
    },
    alchemicalProperties: {
      Spirit: 0.4,
      Essence: 0.7,
      Matter: 0.8,
      Substance: 0.5,
    },
    thermodynamicProperties: {
      heat: 0.5,
      entropy: 0.3,
      reactivity: 0.4,
    },
    duration: {
      min: 60,
      max: 240,
    },
    suitable_for: ['tough cuts of meat', 'root vegetables', 'hardy greens']
  },
  poaching: {
    name: 'Poaching',
    elementalEffect: {
      Water: 0.8,
      Fire: 0.3,
      Air: 0.3,
      Earth: 0.2,
    },
    benefits: ['gentle cooking', 'flavor infusion', 'moisture preservation'],
    astrologicalInfluences: {
      dominantPlanets: ['Moon', 'Venus'],
      lunarPhaseEffect: {
        waxing_crescent: 0.8,
        first_quarter: 0.6,
      }
    },
    alchemicalProperties: {
      Spirit: 0.2,
      Essence: 0.9,
      Matter: 0.4,
      Substance: 0.3,
    },
    thermodynamicProperties: {
      heat: 0.3,
      entropy: 0.2,
      reactivity: 0.2,
    },
    duration: {
      min: 3,
      max: 20,
    },
    suitable_for: ['eggs', 'fish', 'fruit', 'delicate proteins']
  },
  smoking: {
    name: 'Smoking',
    elementalEffect: {
      Fire: 0.6,
      Air: 0.8,
      Earth: 0.4,
      Water: 0.2,
    },
    benefits: ['flavor infusion', 'preservation', 'aromatic complexity'],
    astrologicalInfluences: {
      dominantPlanets: ['Neptune', 'Pluto'],
      lunarPhaseEffect: {
        waning_gibbous: 0.6,
        new_moon: 0.7,
      }
    },
    alchemicalProperties: {
      Spirit: 0.7,
      Essence: 0.4,
      Matter: 0.5,
      Substance: 0.8,
    },
    thermodynamicProperties: {
      heat: 0.4,
      entropy: 0.6,
      reactivity: 0.7,
    },
    duration: {
      min: 30,
      max: 720,
    },
    suitable_for: ['meats', 'fish', 'cheese', 'vegetables']
  },
  dehydrating: {
    name: 'Dehydrating',
    elementalEffect: {
      Air: 0.9,
      Fire: 0.4,
      Earth: 0.5,
      Water: 0.1,
    },
    benefits: ['preservation', 'flavor concentration', 'textural transformation'],
    astrologicalInfluences: {
      dominantPlanets: ['Saturn', 'Uranus'],
      lunarPhaseEffect: {
        new_moon: 0.8,
        waning_crescent: 0.7,
      }
    },
    alchemicalProperties: {
      Spirit: 0.6,
      Essence: 0.3,
      Matter: 0.7,
      Substance: 0.9,
    },
    thermodynamicProperties: {
      heat: 0.3,
      entropy: 0.4,
      reactivity: 0.2,
    },
    duration: {
      min: 240,
      max: 1440,
    },
    suitable_for: ['fruits', 'herbs', 'vegetables', 'meats']
  },
  pressure_cooking: {
    name: 'Pressure Cooking',
    elementalEffect: {
      Fire: 0.5,
      Water: 0.7,
      Earth: 0.6,
      Air: 0.3,
    },
    benefits: ['fast cooking', 'flavor infusion', 'tenderization'],
    astrologicalInfluences: {
      dominantPlanets: ['Mars', 'Uranus'],
      lunarPhaseEffect: {
        full_moon: 0.6,
        first_quarter: 0.7,
      }
    },
    alchemicalProperties: {
      Spirit: 0.5,
      Essence: 0.8,
      Matter: 0.7,
      Substance: 0.4,
    },
    thermodynamicProperties: {
      heat: 0.8,
      entropy: 0.5,
      reactivity: 0.6,
    },
    duration: {
      min: 5,
      max: 60,
    },
    suitable_for: ['tough cuts of meat', 'beans', 'grains', 'root vegetables']
  },
  sous_vide: {
    name: 'Sous Vide',
    elementalEffect: {
      Water: 0.8,
      Earth: 0.4,
      Air: 0.2,
      Fire: 0.2,
    },
    benefits: ['precise cooking', 'moisture retention', 'texture control'],
    astrologicalInfluences: {
      dominantPlanets: ['Mercury', 'Saturn'],
      lunarPhaseEffect: {
        first_quarter: 0.7,
        waxing_crescent: 0.6,
      }
    },
    alchemicalProperties: {
      Spirit: 0.3,
      Essence: 0.5,
      Matter: 0.6,
      Substance: 0.4,
    },
    thermodynamicProperties: {
      heat: 0.3,
      entropy: 0.1,
      reactivity: 0.2,
    },
    duration: {
      min: 30,
      max: 1440,
    },
    suitable_for: ['meats', 'eggs', 'fish', 'vegetables']
  },
  pickling: {
    name: 'Pickling',
    elementalEffect: {
      Water: 0.7,
      Earth: 0.5,
      Fire: 0.1,
      Air: 0.3,
    },
    benefits: ['preservation', 'flavor development', 'textural changes'],
    astrologicalInfluences: {
      dominantPlanets: ['Saturn', 'Mercury'],
      lunarPhaseEffect: {
        waning_crescent: 0.8,
        new_moon: 0.6,
      }
    },
    alchemicalProperties: {
      Spirit: 0.2,
      Essence: 0.6,
      Matter: 0.7,
      Substance: 0.8,
    },
    thermodynamicProperties: {
      heat: 0.2,
      entropy: 0.7,
      reactivity: 0.8,
    },
    duration: {
      min: 720,
      max: 4320,
    },
    suitable_for: ['vegetables', 'fruits', 'eggs', 'ginger']
  }
}

// Export as default as well
export default cookingMethods,
