import type { ZodiacSign, ThermodynamicProperties } from "@/types/alchemy";
import type { CookingMethodData } from "@/types/cookingMethod";

/**
 * Raw cooking method
 *
 * Preparation of food without applying heat, preserving natural enzymes and nutrients
 */
export const raw: CookingMethodData = {
  name: "raw",
  description:
    "Preparing and serving food without applying heat, preserving natural enzymes, nutrients, and flavors while utilizing techniques like chopping, blending, dehydrating, fermenting, sprouting, and marinating to create textures and enhance digestibility.",
  elementalEffect: {
    Water: 0.3,
    Air: 0.5,
    Earth: 0.2,
    Fire: 0.0,
  },
  duration: {
    min: 1, // 1 minute for simple preparation
    max: 1440, // 24 hours for dehydration or marination
  },
  suitable_for: [
    "vegetables",
    "fruits",
    "nuts",
    "seeds",
    "sprouts",
    "certain fish",
    "some seafood",
    "some meat (tartare)",
    "herbs",
    "oils",
    "dairy (unpasteurized)",
    "honey",
    "seaweed",
    "mushrooms",
    "cacao",
    "flowers",
    "microgreens",
    "juices",
    "leafy greens",
    "berries",
  ],
  benefits: [
    "enzyme preservation",
    "maximum nutrient retention",
    "natural flavor preservation",
    "vibrant color preservation",
    "phytonutrient conservation",
    "reduced cooking energy use",
    "quick preparation (in many cases)",
    "water content preservation",
    "natural food structure maintenance",
    "texture preservation",
    "antioxidant conservation",
    "living probiotic preservation",
    "heat-sensitive vitamin retention",
    "natural hydration from foods",
    "natural fiber structure preservation",
  ],
  astrologicalInfluences: {
    favorableZodiac: ["gemini", "libra", "aquarius", "virgo"] as any[],
    unfavorableZodiac: ["aries", "leo", "sagittarius"] as any[],
    dominantPlanets: ["Mercury", "Venus", "Moon"],
    lunarPhaseEffect: {
      new_moon: 1.3, // Enhanced purification energy
      full_moon: 0.9, // Slightly reduced energy
      waxing_crescent: 1.2, // Good phase for starting raw preparations
      waning_gibbous: 1.0, // Neutral effect
    },
  },
  toolsRequired: [
    "Sharp knives",
    "Food processor",
    "Blender",
    "Mandoline",
    "Spiralizer",
    "Dehydrator (optional)",
    "Sprouting jars",
    "Nut milk bags",
    "Cold press juicer",
    "Microplane/grater",
    "Glass storage containers",
    "Fermenting equipment",
    "pH test strips",
    "Vacuum sealer (optional)",
    "Fine mesh strainers",
    "Cutting boards (separate for different foods)",
  ],
  commonMistakes: [
    "inadequate food safety precautions",
    "poor quality ingredient selection",
    "improper washing techniques",
    "overcomplicated preparations",
    "ignoring seasonal availability",
    "insufficient flavor development",
    "neglecting texture considerations",
    "poor portion control",
    "improper storage techniques",
    "using dull knives (damages cell structure)",
    "cross-contamination risks",
    "ignoring ripeness levels",
    "unnecessary ingredient processing",
    "inadequate marination for tougher ingredients",
    "ignoring enzyme inhibitors in nuts/seeds",
  ],
  pairingSuggestions: [
    "Cold-pressed oils for richness",
    "Fermented foods for complexity",
    "Fresh herbs for brightness",
    "Sprouted grains for complementary nutrition",
    "Activated nuts for texture contrast",
    "Cultured dairy for creaminess",
    "Spice blends for flavor depth",
    "Aged foods for umami notes",
    "Citrus juices for acid balance",
    "Marine salt for mineral enhancement",
    "Raw honey for natural sweetness",
    "Cold-brewed beverages",
    "Edible flowers for visual appeal",
    "Seaweed for mineral complexity",
    "Cold-infused waters",
  ],
  nutrientRetention: {
    vitamins: 0.98, // Excellent vitamin retention
    minerals: 0.95, // Excellent mineral retention
    antioxidants: 0.99, // Maximum antioxidant preservation
    fiber: 1.0, // Complete fiber retention
    enzymes: 0.99, // Almost complete enzyme preservation
    phytonutrients: 0.98, // Excellent phytonutrient retention
    water_content: 0.98, // High water content preservation
    vitamin_c: 0.99, // Maximum vitamin C retention
    b_vitamins: 0.97, // Excellent B vitamin retention
    vitamin_e: 0.99, // Maximum vitamin E retention
    polyphenols: 0.99, // Excellent polyphenol preservation
    carotenoids: 0.98, // Excellent carotenoid retention
    probiotics: 1.0, // Complete probiotic preservation
    omega_3_fatty_acids: 0.98, // Excellent fatty acid preservation
  },
  optimalTemperatures: {
    general_storage: 40, // Refrigeration temperature (°F)
    serving_temperature: 45, // Ideal serving temperature (°F)
    sprouting: 70, // Ideal sprouting temperature (°F)
    dehydration: 115, // Maximum temperature for 'raw' dehydration (°F)
    nut_activation: 95, // Soaking temperature for nuts (°F)
    fermentation: 72, // Ideal fermentation temperature (°F)
    cold_infusion: 45, // Cold infusion temperature (°F)
    seed_germination: 75, // Seed germination temperature (°F)
    fruit_ripening: 65, // Fruit ripening temperature (°F)
    vegetable_crisping: 34, // Pre-service crisping temperature (°F)
    avocado_ripening: 68, // Avocado ripening temperature (°F)
  },
  regionalVariations: {
    japanese: ["sashimi", "namasu", "tataki"],
    peruvian: ["ceviche", "tiradito", "causa"],
    mediterranean: ["mezze platters", "carpaccio", "crudo"],
    pacific: ["poisson cru", "oka i'a", "kokoda"],
    indian: ["kachumber", "mooli salads", "sprouted legume preparations"],
    caribbean: ["pepper sauces", "chow", "green banana salads"],
  },
  chemicalChanges: {
    enzyme_activity: true,
    oxidation: true,
    cell_rupture: true,
    water_migration: true,
    osmosis: true,
    acid_denaturation: true, // In marinated preparations
    fermentation: true, // In fermented raw preparations
    emulsification: true, // In dressings and sauces
    oil_extraction: true, // From nuts and seeds
    browning_enzymatic: true, // Natural enzymatic browning
    flavor_compound_release: true,
    protein_structure_preservation: true,
    chlorophyll_preservation: true,
    volatile_compound_retention: true,
    phytochemical_preservation: true,
  },
  safetyFeatures: [
    "Proper sourcing from reliable suppliers",
    "Thorough washing of all produce",
    "Separation of animal products from produce",
    "Temperature control below 40°F (4°C) for storage",
    "Regular sanitization of all preparation surfaces and tools",
    "Specific safety protocols for raw animal products",
    "Limited shelf life - consume quickly",
    "pH monitoring for fermented preparations",
    "Special attention to sprout safety (high risk item)",
    "Education on high-risk ingredients",
    "Proper seed and nut storage to prevent rancidity",
    "Understanding of ingredient-specific risks",
    "Cross-contamination prevention",
    "Allergen awareness and separation",
    "Implementation of HACCP principles for raw preparation",
  ],
  thermodynamicProperties: {
    heat: 0.0, // No heat applied
    entropy: 0.3, // Minimal structural disruption
    reactivity: 0.4, // Moderate natural enzymatic reactions
    gregsEnergy: 0.05, // Calculated using heat - (entropy * reactivity)
  } as ThermodynamicProperties,

  // Additional metadata
  history:
    "The practice of eating foods in their natural, uncooked state dates back to the beginning of human existence, predating cooking technologies. Throughout history, various cultures developed sophisticated raw food preparations, from Mediterranean crudo to Polynesian poisson cru and Japanese sashimi. The modern raw food movement emerged in the 1800s with figures like Sylvester Graham advocating for unprocessed foods. Dr. Max Bircher-Benner's raw food sanitarium in the early 1900s popularized therapeutic raw eating (creating muesli in the process). The 1970s saw increased interest in \"living foods\" through Ann Wigmore's work. By the 1990s-2000s, raw food cuisine evolved into a sophisticated culinary approach with chefs like Matthew Kenney elevating raw preparation to fine dining. Today's approach integrates traditional knowledge with modern nutritional science and creative culinary techniques.",

  scientificPrinciples: [
    "Enzyme preservation occurs below ~118°F (48°C) - the threshold at which most food enzymes denature",
    "Mechanical cell disruption through cutting/blending releases nutrients and flavors without heat",
    "Water-soluble vitamins (BC) remain intact without thermal degradation",
    "Phytochemical structures maintain biological activity without heat alteration",
    "Natural antioxidants remain at maximum potency without oxidative thermal stress",
    "Fermentation creates probiotic cultures and transforms nutrients without heat application",
    "Acid-based preparations (like ceviche) denature proteins through pH change rather than heat",
    "Salt and sugar drawing moisture through osmosis creates texture changes without cooking",
    "Sprouting activates natural enzymatic processes that transform nutrients",
    "Plant defensive compounds (some beneficial, some anti-nutritional) remain intact without cooking",
    "Oil-soluble compounds remain in original cell structures unless mechanically extracted",
    "Oxidative reactions occur at slower rates without heat acceleration",
    "Dehydration below critical temperatures preserves enzyme activity while removing water",
    "Cold-pressing techniques extract oils without damaging heat-sensitive compounds",
    "Natural ripening processes involve enzymatic transformation of carbohydrates and softening of tissues",
  ],

  modernVariations: [
    "High-pressure processing (HPP) for safety and shelf-life extension",
    "Sous vide 'raw' (very low temperature water bath preparation)",
    "Cold-smoking techniques (below enzyme denaturation threshold)",
    "Molecular gastronomy applications (spherification, gelification)",
    "Ultrasonic extraction methods for intensified flavors",
    "Precision fermentation with controlled bacterial cultures",
    "Flash-freezing techniques for texture manipulation",
    "Vacuum infusion for rapid flavor penetration",
    "Controlled enzymatic ripening environments",
    "Specialized sprouting and microgreen growing systems",
    "Air blade technology for micro-cutting without heat generation",
    "Cold plasma treatment for surface sterilization",
    "Hydrodynamic preservation techniques",
    "Pulsed electric field processing",
    "Pressure-based juice extraction systems",
    "Advanced dehydration with humidity control",
    "Wild fermentation with native microbes",
    "Nitrogen-assisted cutting and processing",
  ],

  healthConsiderations: [
    "Maximum retention of heat-sensitive vitamins (C and B complex)",
    "Preservation of plant enzymes that may aid digestion",
    "Intact fiber structure supports gut health and microbiome",
    "Some nutrients have higher bioavailability in raw form",
    "Other nutrients have lower bioavailability without cooking",
    "Some plants contain anti-nutritional factors reduced by cooking",
    "Requires robust digestive function for optimal nutrient extraction",
    "Safety concerns with certain raw animal products requires careful handling",
    "Higher water content may support hydration",
    "Sprouting and fermenting can increase nutrient bioavailability",
    "Supports natural phytonutrient intake at maximum levels",
    "Unprocessed oils retain more omega fatty acids",
    "Raw preparation preserves natural food structure",
    "May require more thorough chewing, potentially improving digestion",
    "Consideration needed for individual digestive sensitivities",
  ],

  sustainabilityRating: 0.95, // Extremely high - minimal energy use maximum food integrity

  equipmentComplexity: 0.4, // Moderate - from simple to specialized equipment
};
