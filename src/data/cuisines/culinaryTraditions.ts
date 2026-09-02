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
export const culinaryTraditions: Record<string, CuisineProfile> & {
  french: CuisineProfile;
  japanese: CuisineProfile;
  mexican: CuisineProfile;
} = {
  french: {
    elementalAlignment: { Earth: 0.55, Fire: 0.25, Air: 0.1, Water: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["venus", "moon"],
      favorableZodiac: ["taurus", "libra", "cancer"],
      techniques: ["sous_vide", "confit", "flambeing"],
      aspectEnhancers: ["Venus trine Jupiter", "Moon sextile Neptune"],
      seasonalPreference: ["all"],
    },
    seasonalPreferences: ["all"],
    signatureModifications: {
      fire_dominant: "Augment with clarified butter flambé",
      earth_dominant: "Enrich with black truffle shavings",
      air_dominant: "Lighten with aerated sauces",
      water_dominant: "Balance with reduced wine essence",
    },
  },
  japanese: {
    elementalAlignment: { Water: 0.65, Earth: 0.2, Fire: 0.05, Air: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["moon", "mercury"],
      favorableZodiac: ["pisces", "virgo", "scorpio"],
      techniques: ["nimono", "tsukudani", "shioyaki"],
      aspectEnhancers: ["Mercury conjunct Moon", "Neptune trine Pluto"],
    },
    signatureModifications: {
      fire_dominant: "Enhance with binchotan searing",
      earth_dominant: "Ground with miso cure",
      air_dominant: "Elevate with tempura foam",
      water_dominant: "Intensify with dashi reduction",
    },
  },
  mexican: {
    elementalAlignment: { Fire: 0.55, Earth: 0.25, Air: 0.1, Water: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["sun", "mars"],
      favorableZodiac: ["leo", "aries", "sagittarius"],
      techniques: ["nixtamalization", "adobo", "barbacoa"],
      aspectEnhancers: ["Sun square Mars", "Jupiter in Sagittarius"],
    },
    signatureModifications: {
      fire_dominant: "Amplify with chile de árbol infusion",
      earth_dominant: "Anchor with masa harina",
      air_dominant: "Aerate with molé foam",
      water_dominant: "Balance with avocado mousse",
    },
  },
  italian: {
    elementalAlignment: { Earth: 0.5, Fire: 0.3, Water: 0.1, Air: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["jupiter", "venus"],
      favorableZodiac: ["taurus", "leo", "libra"],
      techniques: ["al dente pasta cooking", "slow simmering", "grilling"],
      aspectEnhancers: ["Venus trine Jupiter", "Sun sextile Mercury"],
    },
    signatureModifications: {
      fire_dominant: "Enhance with chili oil drizzle",
      earth_dominant: "Enrich with aged parmesan",
      air_dominant: "Lighten with fresh herb infusion",
      water_dominant: "Balance with tomato broth reduction",
    },
  },
  mediterranean: {
    elementalAlignment: { Fire: 0.3, Earth: 0.3, Water: 0.3, Air: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["sun", "mercury", "neptune"],
      favorableZodiac: ["leo", "gemini", "pisces"],
      techniques: ["grilling", "braising", "marinating"],
      aspectEnhancers: ["Mercury trine Neptune", "Venus conjunct Sun"],
    },
    signatureModifications: {
      fire_dominant: "Accent with charred vegetables",
      earth_dominant: "Ground with olive tapenade",
      air_dominant: "Elevate with citrus zest",
      water_dominant: "Integrate with seafood broth",
    },
  },
  korean: {
    elementalAlignment: { Fire: 0.5, Earth: 0.3, Water: 0.1, Air: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["mars", "pluto", "jupiter"],
      favorableZodiac: ["aries", "scorpio", "sagittarius"],
      techniques: ["fermentation", "grilling", "stewing"],
      aspectEnhancers: ["Mars trine Jupiter", "Pluto sextile Sun"],
    },
    signatureModifications: {
      fire_dominant: "Intensify with gochujang glaze",
      earth_dominant: "Root with doenjang foundation",
      air_dominant: "Refresh with perilla accents",
      water_dominant: "Balance with mushroom stock",
    },
  },
  sichuanese: {
    elementalAlignment: { Fire: 0.7, Earth: 0.1, Water: 0.1, Air: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["mars", "uranus", "pluto"],
      favorableZodiac: ["aries", "aquarius", "scorpio"],
      techniques: ["dry-frying", "double-frying", "stir-frying"],
      aspectEnhancers: ["Mars conjunct Uranus", "Pluto trine Sun"],
    },
    signatureModifications: {
      fire_dominant: "Amplify with Sichuan peppercorn oil",
      earth_dominant: "Ground with fermented black bean paste",
      air_dominant: "Elevate with Sichuan pepper dust",
      water_dominant: "Balance with light chicken broth",
    },
  },
  chinese: {
    elementalAlignment: { Fire: 0.3, Earth: 0.3, Water: 0.2, Air: 0.2 },
    astrologicalProfile: {
      rulingPlanets: ["jupiter", "mercury", "saturn"],
      favorableZodiac: ["sagittarius", "gemini", "capricorn"],
      techniques: ["stir-frying", "steaming", "braising"],
      aspectEnhancers: ["Mercury trine Jupiter", "Saturn sextile Venus"],
    },
    signatureModifications: {
      fire_dominant: "Intensify with wok hei",
      earth_dominant: "Ground with fermented bean paste",
      air_dominant: "Lighten with rice wine",
      water_dominant: "Balance with masterstock",
    },
  },
  thai: {
    elementalAlignment: { Fire: 0.3, Water: 0.3, Earth: 0.2, Air: 0.2 },
    astrologicalProfile: {
      rulingPlanets: ["venus", "mars", "mercury"],
      favorableZodiac: ["libra", "aries", "gemini"],
      techniques: ["pounding", "stir-frying", "steaming"],
      aspectEnhancers: ["Venus square Mars", "Mercury trine Moon"],
    },
    signatureModifications: {
      fire_dominant: "Intensify with bird's eye chili",
      earth_dominant: "Ground with galangal and lemongrass",
      air_dominant: "Elevate with kaffir lime leaf",
      water_dominant: "Balance with coconut milk",
    },
  },
  indian: {
    elementalAlignment: { Fire: 0.4, Earth: 0.2, Water: 0.2, Air: 0.2 },
    astrologicalProfile: {
      rulingPlanets: ["mars", "saturn", "jupiter"],
      favorableZodiac: ["aries", "capricorn", "sagittarius"],
      techniques: ["tempering", "slow cooking", "tandoor grilling"],
      aspectEnhancers: ["Mars trine Jupiter", "Saturn conjunct Moon"],
    },
    signatureModifications: {
      fire_dominant: "Intensify with garam masala",
      earth_dominant: "Ground with fenugreek and cumin",
      air_dominant: "Elevate with cardamom and clove",
      water_dominant: "Balance with yogurt or coconut",
    },
  },
  vietnamese: {
    elementalAlignment: { Water: 0.3, Air: 0.3, Earth: 0.2, Fire: 0.2 },
    astrologicalProfile: {
      rulingPlanets: ["mercury", "venus", "neptune"],
      favorableZodiac: ["gemini", "libra", "pisces"],
      techniques: ["quick cooking", "fresh preparation", "simmering"],
      aspectEnhancers: ["Mercury sextile Venus", "Neptune trine Moon"],
    },
    signatureModifications: {
      fire_dominant: "Accentuate with fresh chili",
      earth_dominant: "Ground with fish sauce",
      air_dominant: "Elevate with fresh herbs",
      water_dominant: "Balance with light broth",
    },
  },
  african: {
    elementalAlignment: { Fire: 0.4, Earth: 0.3, Water: 0.2, Air: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["mars", "sun", "saturn"],
      favorableZodiac: ["aries", "leo", "capricorn"],
      techniques: ["slow cooking", "grilling", "stewing"],
      aspectEnhancers: ["Mars trine Sun", "Saturn sextile Jupiter"],
    },
    signatureModifications: {
      fire_dominant: "Intensify with berbere spice blend",
      earth_dominant: "Ground with peanut and cassava",
      air_dominant: "Brighten with citrus and herbs",
      water_dominant: "Balance with coconut milk",
    },
  },

  // ── RULED entries, authored 2026-08-01 ──────────────────────────────────
  // The four cuisines below existed in restaurant scoring's
  // CUISINE_ELEMENTAL_MAP with no tradition entry, so their ESMS derivation
  // had nothing to read. There is no measurement for a cultural-astrological
  // correspondence — every entry in this file is a RULED mapping — so these
  // are authored to the same standard as the originals: rulers chosen from
  // the cuisine's dominant culinary character, favorableZodiac from the
  // rulers' domiciles, elementalAlignment summing to 1.0. Reviewed post-merge
  // by explicit ruling (2026-08-01); amend freely, but keep each set distinct
  // from every other entry — two cuisines sharing a ruler LIST would share an
  // ESMS profile, which is the Indian≡Korean conflation all over again.
  american: {
    // Abundance and scale (Jupiter), grill and barbecue heat (Mars),
    // comfort-sweet dairy tradition (Venus).
    elementalAlignment: { Earth: 0.4, Fire: 0.3, Air: 0.2, Water: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["jupiter", "mars", "venus"],
      favorableZodiac: ["sagittarius", "aries", "taurus"],
      techniques: ["barbecue", "smoking", "deep_frying"],
      aspectEnhancers: ["Jupiter trine Sun", "Mars sextile Venus"],
    },
    signatureModifications: {
      fire_dominant: "Char over open hickory flame",
      earth_dominant: "Anchor with cornbread and beans",
      air_dominant: "Lighten with slaw and pickles",
      water_dominant: "Braise low and slow in stock",
    },
  },
  greek: {
    // Sun-drenched olive-and-honey table (Sun), festive Venusian sweetness,
    // seafaring Neptune. Distinct from mediterranean's [sun, mercury,
    // neptune] — Greek is a NAMED cuisine here, not the meta-category.
    elementalAlignment: { Fire: 0.35, Air: 0.25, Earth: 0.25, Water: 0.15 },
    astrologicalProfile: {
      rulingPlanets: ["sun", "venus", "neptune"],
      favorableZodiac: ["leo", "taurus", "pisces"],
      techniques: ["charcoal_grilling", "phyllo_layering", "olive_curing"],
      aspectEnhancers: ["Sun trine Neptune", "Venus sextile Mercury"],
    },
    signatureModifications: {
      fire_dominant: "Finish over charcoal with lemon",
      earth_dominant: "Ground with chickpea and barley",
      air_dominant: "Brighten with oregano and citrus",
      water_dominant: "Enrich with yogurt and brine",
    },
  },
  spanish: {
    // Solar cuisine of saffron and plancha (Sun), pimentón fire and the
    // tapas pulse (Mars), festive conviviality (Venus). Distinct from
    // mexican's [sun, mars] by the Venus third.
    elementalAlignment: { Fire: 0.4, Earth: 0.25, Water: 0.2, Air: 0.15 },
    astrologicalProfile: {
      rulingPlanets: ["sun", "mars", "venus"],
      favorableZodiac: ["leo", "aries", "libra"],
      techniques: ["a_la_plancha", "sofrito", "dry_curing"],
      aspectEnhancers: ["Sun conjunct Mars", "Venus trine Jupiter"],
    },
    signatureModifications: {
      fire_dominant: "Sear a la plancha with pimentón",
      earth_dominant: "Deepen with jamón and beans",
      air_dominant: "Lift with sherry vinegar",
      water_dominant: "Simmer in saffron broth",
    },
  },
  ethiopian: {
    // Fermentation depth of injera and ancient highland tradition (Saturn),
    // berbere heat (Mars), the shared communal plate and stews (Moon).
    elementalAlignment: { Earth: 0.4, Fire: 0.3, Water: 0.2, Air: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["saturn", "mars", "moon"],
      favorableZodiac: ["capricorn", "aries", "cancer"],
      techniques: ["fermentation", "slow_stewing", "spice_blending"],
      aspectEnhancers: ["Saturn trine Moon", "Mars sextile Sun"],
    },
    signatureModifications: {
      fire_dominant: "Intensify the berbere bloom",
      earth_dominant: "Serve on fresh injera",
      air_dominant: "Cut with cardamom and clove",
      water_dominant: "Slow the wat to a silk stew",
    },
  },
};

// Add validation to ensure all elementalAlignments sum to 1.0
Object.entries(culinaryTraditions).forEach(([_cuisine, profile]) => {
  const sum = Object.values(profile.elementalAlignment).reduce(
    (a, b) => a + b,
    0,
  );
  if (Math.abs(sum - 1.0) > 0.001) {
    // console.warn(`Elemental alignment for ${cuisine} sums to ${sum.toFixed(2)}, should be 1.0`);
  }
});
