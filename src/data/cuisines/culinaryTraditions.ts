// Define the CuisineProfile interface to match the type needed for culinary traditions
export interface CuisineProfile {
  elementalAlignment: Record<string, number>;
  description?: string; // Add optional description field
  astrologicalProfile: {
    rulingPlanets: string[];
    favorableZodiac: string[];
    techniques: string[];
    aspectEnhancers: string[];
    seasonalPreference?: string[];
  };
  signatureModifications: Record<string, string>;
  seasonalPreferences?: string[];
}

// The simplified culinary traditions profiles
export const culinaryTraditions: Record<string, CuisineProfile> = {
  french: {
    elementalAlignment: { Earth: 0.55, Fire: 0.25, Air: 0.1, Water: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Moon'],
      favorableZodiac: ['Taurus', 'Libra', 'Cancer'],
      techniques: ['sous_vide', 'confit', 'flambeing'],
      aspectEnhancers: ['Venus trine Jupiter', 'Moon sextile Neptune'],
      seasonalPreference: ['all']
    },
    seasonalPreferences: ['all'],
    signatureModifications: {
      fire_dominant: 'Augment with clarified butter flambé',
      earth_dominant: 'Enrich with black truffle shavings',
      air_dominant: 'Lighten with aerated sauces',
      water_dominant: 'Balance with reduced wine essence'
    }
  },
  japanese: {
    elementalAlignment: { Water: 0.65, Earth: 0.2, Fire: 0.05, Air: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Mercury'],
      favorableZodiac: ['Pisces', 'Virgo', 'Scorpio'],
      techniques: ['nimono', 'tsukudani', 'shioyaki'],
      aspectEnhancers: ['Mercury conjunct Moon', 'Neptune trine Pluto']
    },
    signatureModifications: {
      fire_dominant: 'Enhance with binchotan searing',
      earth_dominant: 'Ground with miso cure',
      air_dominant: 'Elevate with tempura foam',
      water_dominant: 'Intensify with dashi reduction'
    }
  },
  mexican: {
    elementalAlignment: { Fire: 0.55, Earth: 0.25, Air: 0.1, Water: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Sun', 'Mars'],
      favorableZodiac: ['Leo', 'Aries', 'Sagittarius'],
      techniques: ['nixtamalization', 'adobo', 'barbacoa'],
      aspectEnhancers: ['Sun square Mars', 'Jupiter in Sagittarius']
    },
    signatureModifications: {
      fire_dominant: 'Amplify with chile de árbol infusion',
      earth_dominant: 'Anchor with masa harina',
      air_dominant: 'Aerate with molé foam',
      water_dominant: 'Balance with avocado mousse'
    }
  },
  italian: {
    elementalAlignment: { Earth: 0.5, Fire: 0.3, Water: 0.1, Air: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Jupiter', 'Venus'],
      favorableZodiac: ['Taurus', 'Leo', 'Libra'],
      techniques: ['al dente pasta cooking', 'slow simmering', 'grilling'],
      aspectEnhancers: ['Venus trine Jupiter', 'Sun sextile Mercury']
    },
    signatureModifications: {
      fire_dominant: 'Enhance with chili oil drizzle',
      earth_dominant: 'Enrich with aged parmesan',
      air_dominant: 'Lighten with fresh herb infusion',
      water_dominant: 'Balance with tomato broth reduction'
    }
  },
  mediterranean: {
    elementalAlignment: { Fire: 0.3, Earth: 0.3, Water: 0.3, Air: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Sun', 'Mercury', 'Neptune'],
      favorableZodiac: ['Leo', 'Gemini', 'Pisces'],
      techniques: ['grilling', 'braising', 'marinating'],
      aspectEnhancers: ['Mercury trine Neptune', 'Venus conjunct Sun']
    },
    signatureModifications: {
      fire_dominant: 'Accent with charred vegetables',
      earth_dominant: 'Ground with olive tapenade',
      air_dominant: 'Elevate with citrus zest',
      water_dominant: 'Integrate with seafood broth'
    }
  },
  korean: {
    elementalAlignment: { Fire: 0.5, Earth: 0.3, Water: 0.1, Air: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Pluto', 'Jupiter'],
      favorableZodiac: ['Aries', 'Scorpio', 'Sagittarius'],
      techniques: ['fermentation', 'grilling', 'stewing'],
      aspectEnhancers: ['Mars trine Jupiter', 'Pluto sextile Sun']
    },
    signatureModifications: {
      fire_dominant: 'Intensify with gochujang glaze',
      earth_dominant: 'Root with doenjang foundation',
      air_dominant: 'Refresh with perilla accents',
      water_dominant: 'Balance with mushroom stock'
    }
  },
  sichuanese: {
    elementalAlignment: { Fire: 0.7, Earth: 0.1, Water: 0.1, Air: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Uranus', 'Pluto'],
      favorableZodiac: ['Aries', 'Aquarius', 'Scorpio'],
      techniques: ['dry-frying', 'double-frying', 'stir-frying'],
      aspectEnhancers: ['Mars conjunct Uranus', 'Pluto trine Sun']
    },
    signatureModifications: {
      fire_dominant: 'Amplify with Sichuan peppercorn oil',
      earth_dominant: 'Ground with fermented black bean paste',
      air_dominant: 'Elevate with Sichuan pepper dust',
      water_dominant: 'Balance with light chicken broth'
    }
  },
  chinese: {
    elementalAlignment: { Fire: 0.3, Earth: 0.3, Water: 0.2, Air: 0.2 },
    astrologicalProfile: {
      rulingPlanets: ['Jupiter', 'Mercury', 'Saturn'],
      favorableZodiac: ['Sagittarius', 'Gemini', 'Capricorn'],
      techniques: ['stir-frying', 'steaming', 'braising'],
      aspectEnhancers: ['Mercury trine Jupiter', 'Saturn sextile Venus']
    },
    signatureModifications: {
      fire_dominant: 'Intensify with wok hei',
      earth_dominant: 'Ground with fermented bean paste',
      air_dominant: 'Lighten with rice wine',
      water_dominant: 'Balance with masterstock'
    }
  },
  thai: {
    elementalAlignment: { Fire: 0.3, Water: 0.3, Earth: 0.2, Air: 0.2 },
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Mars', 'Mercury'],
      favorableZodiac: ['Libra', 'Aries', 'Gemini'],
      techniques: ['pounding', 'stir-frying', 'steaming'],
      aspectEnhancers: ['Venus square Mars', 'Mercury trine Moon']
    },
    signatureModifications: {
      fire_dominant: "Intensify with bird's eye chili",
      earth_dominant: 'Ground with galangal and lemongrass',
      air_dominant: 'Elevate with kaffir lime leaf',
      water_dominant: 'Balance with coconut milk'
    }
  },
  indian: {
    elementalAlignment: { Fire: 0.4, Earth: 0.2, Water: 0.2, Air: 0.2 },
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Saturn', 'Jupiter'],
      favorableZodiac: ['Aries', 'Capricorn', 'Sagittarius'],
      techniques: ['tempering', 'slow cooking', 'tandoor grilling'],
      aspectEnhancers: ['Mars trine Jupiter', 'Saturn conjunct Moon']
    },
    signatureModifications: {
      fire_dominant: 'Intensify with garam masala',
      earth_dominant: 'Ground with fenugreek and cumin',
      air_dominant: 'Elevate with cardamom and clove',
      water_dominant: 'Balance with yogurt or coconut'
    }
  },
  vietnamese: {
    elementalAlignment: { Water: 0.3, Air: 0.3, Earth: 0.2, Fire: 0.2 },
    astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Venus', 'Neptune'],
      favorableZodiac: ['Gemini', 'Libra', 'Pisces'],
      techniques: ['quick cooking', 'fresh preparation', 'simmering'],
      aspectEnhancers: ['Mercury sextile Venus', 'Neptune trine Moon']
    },
    signatureModifications: {
      fire_dominant: 'Accentuate with fresh chili',
      earth_dominant: 'Ground with fish sauce',
      air_dominant: 'Elevate with fresh herbs',
      water_dominant: 'Balance with light broth'
    }
  },
  african: {
    elementalAlignment: { Fire: 0.4, Earth: 0.3, Water: 0.2, Air: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Sun', 'Saturn'],
      favorableZodiac: ['Aries', 'Leo', 'Capricorn'],
      techniques: ['slow cooking', 'grilling', 'stewing'],
      aspectEnhancers: ['Mars trine Sun', 'Saturn sextile Jupiter']
    },
    signatureModifications: {
      fire_dominant: 'Intensify with berbere spice blend',
      earth_dominant: 'Ground with peanut and cassava',
      air_dominant: 'Brighten with citrus and herbs',
      water_dominant: 'Balance with coconut milk'
    }
  }
};

// Add validation to ensure all elementalAlignments sum to 1.0
Object.entries(culinaryTraditions).forEach(([cuisine, profile]) => {
  const sum = Object.values(profile.elementalAlignment).reduce((a, b) => a + b, 0);
  if (Math.abs(sum - 1.0) > 0.001) {
    console.warn(`Elemental alignment for ${cuisine} sums to ${sum.toFixed(2)}, should be 1.0`);
  }
}); 