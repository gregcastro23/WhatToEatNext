import type { ElementalProperties } from '@/types/alchemy';

export interface PlanetaryFlavorProfile {
  name: string,
  description: string,
  flavorProfiles: {
    spicy: number,
    sweet: number,
    sour: number,
    bitter: number,
    salty: number,
    umami: number
  },
  elementalInfluence: ElementalProperties,
  complementaryIngredients: string[],
  cookingTechniques: string[],
  idealMealTypes: string[],
  culinaryAffinity: string[], // Cuisines that resonate with this planetary energy
}

export const planetaryFlavorProfiles: Record<string, PlanetaryFlavorProfile> = {
  // Luminaries
  Sun: {
    name: 'Solar',
    description: 'Bold, vibrant flavors that energize and invigorate. Solar cuisine is centered around bright, distinct tastes and golden colors.',
    flavorProfiles: {
      spicy: 0.7,
      sweet: 0.5,
      sour: 0.3,
      bitter: 0.4,
      salty: 0.3,
      umami: 0.2
},
    elementalInfluence: {
      Fire: 0.8,
      Air: 0.2,
      Water: 0.0,
      Earth: 0.0
},
    complementaryIngredients: [
      'saffron',
      'orange',
      'turmeric',
      'honey',
      'sunflower seeds',
      'gold leaf'
    ],
    cookingTechniques: ['grilling', 'roasting', 'flambé'],
    idealMealTypes: ['brunch', 'celebratory feasts', 'summer dishes'],
    culinaryAffinity: ['mediterranean', 'mexican', 'indian']
  },
  Moon: {
    name: 'Lunar',
    description: 'Comforting, nurturing flavors that soothe and calm. Lunar cuisine emphasizes creaminess and subtle, changing flavor profiles.',
    flavorProfiles: {
      spicy: 0.1,
      sweet: 0.6,
      sour: 0.3,
      bitter: 0.1,
      salty: 0.2,
      umami: 0.7
},
    elementalInfluence: {
      Water: 0.8,
      Earth: 0.2,
      Fire: 0.0,
      Air: 0.0
},
    complementaryIngredients: ['milk', 'coconut', 'rice', 'white foods', 'silver', 'cucumber'],
    cookingTechniques: ['steaming', 'poaching', 'fermenting'],
    idealMealTypes: ['evening meals', 'comfort food', 'breakfast'],
    culinaryAffinity: ['japanese', 'scandinavian', 'french']
  },
  // Inner Planets
  Mercury: {
    name: 'Mercurial',
    description: 'Diverse, complex flavor combinations that stimulate the intellect. Mercurial cuisine features contrasting tastes and textures.',
    flavorProfiles: {
      spicy: 0.4,
      sweet: 0.4,
      sour: 0.7,
      bitter: 0.5,
      salty: 0.5,
      umami: 0.3
},
    elementalInfluence: {
      Air: 0.6,
      Earth: 0.3,
      Water: 0.1,
      Fire: 0.0
},
    complementaryIngredients: [
      'mixed herbs',
      'citrus zest',
      'anise',
      'fennel',
      'variety plates',
      'small bites'
    ],
    cookingTechniques: ['quick sautéing', 'flash frying', 'infusing'],
    idealMealTypes: ['appetizers', 'tapas', 'finger foods'],
    culinaryAffinity: ['spanish', 'fusion', 'lebanese']
  },
  Venus: {
    name: 'Venusian',
    description: 'Harmonious, indulgent flavors that delight the senses. Venusian cuisine is luxurious, balanced, and aesthetically pleasing.',
    flavorProfiles: {
      spicy: 0.2,
      sweet: 0.8,
      sour: 0.3,
      bitter: 0.1,
      salty: 0.2,
      umami: 0.5
},
    elementalInfluence: {
      Earth: 0.6,
      Water: 0.3,
      Air: 0.1,
      Fire: 0.0
},
    complementaryIngredients: [
      'vanilla',
      'rose',
      'berries',
      'chocolate',
      'cream',
      'edible flowers'
    ],
    cookingTechniques: ['baking', 'caramelizing', 'layering flavors'],
    idealMealTypes: ['desserts', 'romantic dinners', 'afternoon tea'],
    culinaryAffinity: ['french', 'viennese', 'thai']
  },
  Mars: {
    name: 'Martial',
    description: 'Intense, fiery flavors that energize and excite. Martial cuisine is bold, spicy, and direct in its flavor profile.',
    flavorProfiles: {
      spicy: 0.9,
      sweet: 0.1,
      sour: 0.2,
      bitter: 0.3,
      salty: 0.6,
      umami: 0.4
},
    elementalInfluence: {
      Fire: 0.8,
      Earth: 0.2,
      Water: 0.0,
      Air: 0.0
},
    complementaryIngredients: [
      'chili peppers',
      'ginger',
      'garlic',
      'black pepper',
      'mustard',
      'red meats'
    ],
    cookingTechniques: ['grilling', 'broiling', 'smoking', 'high heat'],
    idealMealTypes: ['protein-rich meals', 'high-energy dishes', 'post-workout food'],
    culinaryAffinity: ['korean', 'sichuanese', 'mexican']
  },
  // Outer Planets
  Jupiter: {
    name: 'Jovian',
    description: 'Abundant, generous flavors that bring joy and expansion. Jovian cuisine is rich, plentiful, and celebratory.',
    flavorProfiles: {
      spicy: 0.4,
      sweet: 0.7,
      sour: 0.3,
      bitter: 0.2,
      salty: 0.4,
      umami: 0.8
},
    elementalInfluence: {
      Fire: 0.4,
      Air: 0.4,
      Earth: 0.2,
      Water: 0.0
},
    complementaryIngredients: [
      'nutmeg',
      'sage',
      'truffle',
      'rich stocks',
      'expensive ingredients',
      'generous portions'
    ],
    cookingTechniques: ['slow cooking', 'braising', 'feast preparation'],
    idealMealTypes: ['holiday feasts', 'celebratory meals', 'banquets'],
    culinaryAffinity: ['italian', 'moroccan', 'turkish']
  },
  Saturn: {
    name: 'Saturnian',
    description: 'Structured, traditional flavors that ground and stabilize. Saturnian cuisine is disciplined, time-tested, and often preserved.',
    flavorProfiles: {
      spicy: 0.2,
      sweet: 0.3,
      sour: 0.5,
      bitter: 0.7,
      salty: 0.7,
      umami: 0.4
},
    elementalInfluence: {
      Earth: 0.8,
      Water: 0.1,
      Air: 0.1,
      Fire: 0.0
},
    complementaryIngredients: [
      'aged ingredients',
      'root vegetables',
      'preserved foods',
      'bone broths',
      'dark greens',
      'ancient grains'
    ],
    cookingTechniques: ['fermenting', 'curing', 'aging', 'preservation methods'],
    idealMealTypes: ['traditional meals', 'winter dishes', 'practical nutrition'],
    culinaryAffinity: ['german', 'nordic', 'russian']
  },
  // Transpersonal Planets
  Uranus: {
    name: 'Uranian',
    description: 'Innovative, unexpected flavor combinations that surprise and revolutionize. Uranian cuisine is experimental and avant-garde.',
    flavorProfiles: {
      spicy: 0.5,
      sweet: 0.5,
      sour: 0.6,
      bitter: 0.5,
      salty: 0.3,
      umami: 0.6
},
    elementalInfluence: {
      Air: 0.7,
      Fire: 0.2,
      Earth: 0.1,
      Water: 0.0
},
    complementaryIngredients: [
      'unusual combinations',
      'molecular gastronomy',
      'unexpected textures',
      'novel ingredients',
      'fusion elements'
    ],
    cookingTechniques: [
      'sous vide',
      'molecular gastronomy',
      'liquid nitrogen',
      'deconstructed preparations'
    ],
    idealMealTypes: ['avant-garde dining', 'food experiences', 'conceptual dishes'],
    culinaryAffinity: ['molecular', 'fusion', 'experimental']
  },
  Neptune: {
    name: 'Neptunian',
    description: 'Ethereal, subtle flavors that transport and transcend. Neptunian cuisine is elusive, dreamy, and often features seafood.',
    flavorProfiles: {
      spicy: 0.1,
      sweet: 0.4,
      sour: 0.3,
      bitter: 0.2,
      salty: 0.5,
      umami: 0.8
},
    elementalInfluence: {
      Water: 0.9,
      Air: 0.1,
      Earth: 0.0,
      Fire: 0.0
},
    complementaryIngredients: [
      'seafood',
      'delicate herbs',
      'alcohol infusions',
      'blue foods',
      'iridescent garnishes',
      'subtle spices'
    ],
    cookingTechniques: ['gentle poaching', 'infusion', 'misting', 'foam making'],
    idealMealTypes: ['seafood feasts', 'mystical dining experiences', 'ethereal desserts'],
    culinaryAffinity: ['coastal mediterranean', 'pacific', 'scandinavian']
  },
  Pluto: {
    name: 'Plutonian',
    description: 'Intense, transformative flavors that challenge and regenerate. Plutonian cuisine is deeply complex and often fermented.',
    flavorProfiles: {
      spicy: 0.6,
      sweet: 0.2,
      sour: 0.6,
      bitter: 0.8,
      salty: 0.5,
      umami: 0.9
},
    elementalInfluence: {
      Water: 0.5,
      Earth: 0.5,
      Fire: 0.0,
      Air: 0.0
},
    complementaryIngredients: [
      'black foods',
      'fermented ingredients',
      'very aged items',
      'strong flavors',
      'offal',
      'strong alcohol'
    ],
    cookingTechniques: ['fermentation', 'long aging', 'smoking', 'buried cooking'],
    idealMealTypes: ['regenerative foods', 'deeply satisfying meals', 'transformative dining'],
    culinaryAffinity: ['korean', 'icelandic', 'peruvian']
  }
}

// Helper functions for working with planetary flavor profiles

/**
 * Calculates the flavor profile for a dish based on its planetary influences
 */
export const calculateFlavorProfile = (planetaryInfluences: Record<string, number>) => {
  const flavorProfile = {
    spicy: 0,
    sweet: 0,
    sour: 0,
    bitter: 0,
    salty: 0,
    umami: 0
}

  let totalInfluence = 0;

  // Calculate weighted flavor profile based on planetary influences
  Object.entries(planetaryInfluences).forEach(([planet, weight]) => {
    if (planetaryFlavorProfiles[planet]) {
      totalInfluence += weight;
      Object.entries(planetaryFlavorProfiles[planet].flavorProfiles).forEach(([flavor, value]) => {
        flavorProfile[flavor as keyof typeof flavorProfile] += value * weight;
      })
    }
  })

  // Normalize values if there are influences
  if (totalInfluence > 0) {
    Object.keys(flavorProfile).forEach(flavor => {
      flavorProfile[flavor as keyof typeof flavorProfile] /= totalInfluence;
    })
  }

  return flavorProfile;
}

/**
 * Returns cuisine types that resonate with a given planetary configuration
 */
export const _getResonantCuisines = (planetaryInfluences: Record<string, number>): string[] => {
  const cuisineScores: Record<string, number> = {}

  // Calculate cuisine scores based on planetary influences
  Object.entries(planetaryInfluences).forEach(([planet, weight]) => {
    if (planetaryFlavorProfiles[planet]) {
      planetaryFlavorProfiles[planet].culinaryAffinity.forEach(cuisine => {,
        if (!cuisineScores[cuisine]) cuisineScores[cuisine] = 0;
        cuisineScores[cuisine] += weight;
      })
    }
  })

  // Sort cuisines by score and return top matches
  return Object.entries(cuisineScores)
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
    .map(([cuisine]) => cuisine)
}

/**
 * Returns the dominant flavor in a planetary configuration
 */
export const _getDominantFlavor = (planetaryInfluences: Record<string, number>): string => {
  const flavorProfile = calculateFlavorProfile(planetaryInfluences);
  return Object.entries(flavorProfile).sort(([, valueA], [, valueB]) => valueB - valueA)[0][0]
}

/**
 * Enhances recipe match calculation using planetary influence on flavor profiles
 */
export const _calculatePlanetaryFlavorMatch = (
  recipeFlavors: Record<string, number>,
  planetaryInfluences: Record<string, number>,
): number => {
  const astrologicalFlavorProfile = calculateFlavorProfile(planetaryInfluences);
  let matchScore = 0;
  let totalWeight = 0

  // Compare recipe flavors to astrological flavor profile;
  Object.entries(recipeFlavors).forEach(([flavor, recipeValue]) => {
    const astroValue =
      astrologicalFlavorProfile[flavor as keyof typeof astrologicalFlavorProfile] || 0,

    // Calculate similarity with exponential weighting - rewards closer matches
    // The closer the match, the higher the score
    const _diff = Math.abs(recipeValue - astroValue);
    const similarity = Math.pow(1 - diff, 2); // Squared to emphasize closer matches

    // Weight by the importance of the flavor in the astrological profile
    // More significant weighting for dominant flavors
    let weight = 1;
    if (astroValue > 0.7)
      weight = 3; // Very dominant flavor
    else if (astroValue > 0.5)
      weight = 2; // Significant flavor
    else if (astroValue > 0.3) weight = 1.5; // Moderate flavor

    // Additional boost for planetary emphasis on the flavor
    // Check if any planets with strong influence emphasize this flavor
    Object.entries(planetaryInfluences).forEach(([planet, strength]) => {
      if (strength > 0.6 && planetaryFlavorProfiles[planet]) {
        const planetaryEmphasis = planetaryFlavorProfiles[planet].flavorProfiles[
          flavor as keyof (typeof planetaryFlavorProfiles)[typeof planet]['flavorProfiles']
        ] as unknown as numberif (planetaryEmphasis && planetaryEmphasis > 0.6) {;
          weight += strength * 0.5, // Add bonus based on planet strength
        }
      }
    })

    matchScore += similarity * weight;
    totalWeight += weight;
  })

  // Calculate elemental resonance between recipe and planetary influences
  let elementalResonance = 0;
  let elementalTotal = 0;

  // Get the recipe's elemental properties if available
  if (recipeFlavors.elementalProperties) {
    const recipeElements = recipeFlavors.elementalProperties as unknown as Record<string, number>,

    // Get the elemental profile from planetary influences
    const elementalProfile = {
      Fire: 0,
      Water: 0,
      Air: 0,
      Earth: 0
}

    // Calculate weighted elemental influence from planets
    Object.entries(planetaryInfluences).forEach(([planet, strength]) => {
      const planetData = planetaryFlavorProfiles[planet];
      if (planetData?.elementalInfluence) {
        Object.entries(planetData.elementalInfluence).forEach(([element, value]) => {
          elementalProfile[element as keyof typeof elementalProfile] += value * strength;
        })
      }
    })

    // Normalize elemental profile
    const elementalSum = Object.values(elementalProfile).reduce((sum, val) => sum + val0)
    if (elementalSum > 0) {
      Object.keys(elementalProfile).forEach(element => {
        elementalProfile[element as keyof typeof elementalProfile] /= elementalSum;
      })
    }

    // Calculate elemental resonance
    Object.entries(recipeElements).forEach(([element, value]) => {
      const planetaryElement = elementalProfile[element as keyof typeof elementalProfile] || 0;
      const similarity = 1 - Math.abs(value - planetaryElement);
      const weight = planetaryElement > 0.5 ? 2: 1;

      elementalResonance += similarity * weight;
      elementalTotal += weight
    })
  }

  // Combined, score: flavor match (70%) + elemental resonance (30%)
  const flavorMatchScore = totalWeight > 0 ? matchScore / totalWeight: 0;
  const elementalMatchScore = elementalTotal > 0 ? elementalResonance / elementalTotal: 0;

  return flavorMatchScore * 0.7 + elementalMatchScore * 0.3
}
