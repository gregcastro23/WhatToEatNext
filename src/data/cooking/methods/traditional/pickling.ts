import type { CookingMethodData } from "@/types/cookingMethod";
import type { ThermodynamicProperties } from "@/types/shared";

/**
 * Pickling cooking method
 *
 * Preservation of food through immersion in an acidic solution (vinegar or brine)
 */
export const pickling: CookingMethodData = {
  name: "pickling",
  description:
    "The preservation and flavoring of foods through immersion in an acidic solution, typically vinegar (quick pickling) or through fermentation in salt brine (fermented pickling), creating tangy, preserved foods with distinctive flavors and extended shelf life.",
  elementalEffect: {
    Water: 0.5,
    Earth: 0.2,
    Air: 0.2,
    Fire: 0.1,
  },
  duration: {
    min: 60, // 1 hour for quick pickles
    max: 4320, // 3 days for some fermented pickles
  },
  suitable_for: [
    "vegetables",
    "fruits",
    "eggs",
    "fish",
    "meat",
    "roots",
    "peppers",
    "cucumbers",
    "onions",
    "garlic",
    "carrots",
    "cauliflower",
    "radishes",
    "cabbage",
    "green beans",
    "mushrooms",
    "beets",
    "ginger",
    "watermelon rinds",
    "lemons",
  ],
  benefits: [
    "preservation",
    "flavor enhancement",
    "texture development",
    "color preservation",
    "reduced food waste",
    "shelf stability",
    "enhanced umami flavors",
    "probiotic development (in fermented pickles)",
    "reduced sugar content",
    "antioxidant preservation",
    "improved digestibility",
    "seasonal food extension",
    "reduction of harmful bacteria",
    "portable food creation",
    "fast flavor transformation",
    "enhanced vitamin bioavailability (in fermented pickles)",
  ],
  astrologicalInfluences: {
    favorableZodiac: ["cancer", "scorpio", "pisces", "virgo"] as any[],
    unfavorableZodiac: ["leo", "aries"] as any[],
    dominantPlanets: ["Venus", "Mercury", "Saturn"],
    lunarPhaseEffect: {
      full_moon: 1.2, // Enhanced preservation properties
      new_moon: 0.9, // Slightly reduced activity
      waxing_crescent: 1.1, // Good phase to begin pickling
      waning_gibbous: 1.0, // Neutral effect
    },
  },
  toolsRequired: [
    "Glass jars with lids",
    "Non-reactive pot (for vinegar)",
    "Canning equipment (optional)",
    "Knife and cutting board",
    "Measuring cups/spoons",
    "pH test strips (optional)",
    "Mandoline or slicer",
    "Fermentation weights (for fermented pickles)",
    "Sterilization equipment",
    "Spice grinder",
    "Canning funnel",
    "Strainer",
    "Garlic press",
    "Vegetable brush",
    "Vinegar (various types)",
    "Non-iodized salt",
    "Pickling spices",
    "Airlock lids (for fermented pickles)",
  ],
  commonMistakes: [
    "using reactive metal containers",
    "improper sterilization",
    "incorrect vinegar concentration",
    "using iodized salt",
    "incorrect salt concentration for fermented pickles",
    "inconsistent vegetable size",
    "improper sealing",
    "overprocessing (loss of crispness)",
    "inadequate brining time",
    "overcrowding containers",
    "using chlorinated water",
    "unnecessary refrigeration for shelf-stable pickles",
    "incorrect spice balance",
    "inconsistent vegetable quality",
    "using old vinegar with reduced acidity",
  ],
  pairingSuggestions: [
    "Rich, fatty meats for contrast",
    "Cheese boards for acidity balance",
    "Sandwiches for texture and flavor",
    "Grain bowls for brightness",
    "Roasted vegetables for complementary flavors",
    "Grilled fish for acidity balance",
    "Eggs for flavor enhancement",
    "Rice dishes for texture contrast",
    "Charcuterie for palate cleansing",
    "Curries for temperature and flavor contrast",
    "Tacos for bright acidity",
    "Burgers for crunch and tang",
    "Savory pastries for flavor complexity",
    "Rich stews for acidic balance",
    "Legume dishes for flavor enhancement",
  ],
  nutrientRetention: {
    vitamins: 0.85, // Good vitamin retention
    minerals: 0.9, // Excellent mineral retention
    antioxidants: 0.75, // Good retention
    fiber: 0.95, // Excellent fiber retention
    enzymes: 0.3, // Low in quick pickles, higher in fermented
    probiotics: 0.7, // Only in fermented pickles
    phytonutrients: 0.8, // Good retention
    vitamin_c: 0.65, // Moderate retention
    vitamin_a: 0.85, // Good retention
    b_vitamins: 0.75, // Moderate retention
    polyphenols: 0.8, // Good retention
    carotenoids: 0.7, // Moderate retention
    flavonoids: 0.75, // Moderate retention
    organic_acids: 1.2, // Increased through pickling process
  },
  optimalTemperatures: {
    quick_pickle_brine: 190, // Near boiling for vinegar brine (°F)
    fermented_pickle_storage: 68, // Room temperature for fermentation (°F)
    long_term_storage: 50, // Cool storage for shelf-stable pickles (°F)
    refrigerator_pickles: 38, // Standard refrigeration (°F)
    pasteurization: 180, // For canned pickles (°F)
    cool_fermentation: 60, // For slow fermented pickles (°F)
    warm_fermentation: 75, // For faster fermented pickles (°F)
    vinegar_preparation: 170, // For infusing vinegar with spices (°F)
    salt_brine: 70, // Room temperature for salt brine (°F)
    vegetable_blanching: 190, // For certain pickles that require pre-cooking (°F)
    consumption: 45, // Chilled for serving (°F)
  },
  regionalVariations: {
    eastern_european: ["sauerkraut", "pickled beets", "dill pickles"],
    asian: ["kimchi", "tsukemono", "achar", "do chua"],
    middle_eastern: ["torshi", "pickled turnips", "olives", "pickled lemons"],
    indian: ["achaar", "pickled lime", "amla pickle", "nimbu ka achaar"],
    american: [
      "dill pickles",
      "bread & butter pickles",
      "pickled okra",
      "watermelon rind",
    ],
    scandinavian: ["pickled herring", "pickled beets", "lingonberries"],
    latin_american: ["curtido", "pickled jalapeños", "escabeche"],
    british: ["pickled onions", "piccalilli", "branston pickle"],
    mediterranean: ["giardiniera", "pickled capers", "olives"],
    african: ["pickled chilies", "achaar", "moroccan preserved lemons"],
    caribbean: [
      "pickled pineapple",
      "escovitch",
      "pickled scotch bonnet peppers",
    ],
  },
  chemicalChanges: {
    acid_penetration: true,
    cell_wall_breakdown: true,
    pigment_stabilization: true,
    enzyme_deactivation: true,
    salt_osmosis: true,
    flavor_compound_development: true,
    texture_transformation: true,
    pathogen_inhibition: true,
    lactic_acid_production: true, // In fermented pickles
    vitamin_preservation: true,
    pectin_modification: true,
    antioxidant_release: true,
    flavor_compound_infusion: true,
    vegetable_dehydration: true,
    protein_denaturation: true, // In pickled proteins
    pH_reduction: true,
  },
  safetyFeatures: [
    "Pathogen inhibition through acidity",
    "Long-term preservation without refrigeration",
    "pH below 4.6 prevents botulism growth",
    "Salt concentration inhibits harmful bacteria",
    "Fermented pickles produce antimicrobial compounds",
    "Proper canning prevents spoilage",
    "Vinegar provides natural preservation",
    "Visual indicators of spoilage are easily detected",
    "Heat processing for vinegar pickles ensures safety",
    "Proper fermentation promotes beneficial bacteria",
    "Salt draws out water, creating inhospitable environment for pathogens",
    "Acid environment prevents growth of most harmful microorganisms",
    "Properly sealed containers prevent contamination",
    "Sterilization of equipment reduces contamination risk",
    "Clear visual indicators when pickle is unsafe to consume",
  ],
  thermodynamicProperties: {
    heat: 0.25, // Low heat, often ambient temperature
    entropy: 0.6, // Moderate transformation through chemical or biological activity
    reactivity: 0.7, // Significant acid-base reactions and biochemical changes
    gregsEnergy: -0.55, // Calculated using heat - (entropy * reactivity) // gregsEnergy = heat - (entropy * reactivity);
  } as any,

  // Additional metadata
  history:
    "Pickling has been practiced for at least 4,000 years, originating as a necessity for food preservation before refrigeration. Ancient Mesopotamians pickled foods in brineas documented in cuneiform tablets from 2400 BCE. The word 'pickle' derives from the Dutch 'pekel' or German 'pökel,' referring to salt or brine. In ancient times, pickling was essential for long sea voyages and military campaigns. Cleopatra attributed her beauty to a diet of pickles. Throughout history, sailors consumed pickled foods to prevent scurvy. During the 17th and 18th centuries, pickled vegetables were vital for long ocean voyages. The Industrial Revolution standardized pickling processes, with companies like Heinz mass-producing pickled products by the late 19th century. In the 20th century, refrigeration reduced dependency on pickling for preservation, but cultural traditions and flavors have kept the method relevant worldwide.",

  scientificPrinciples: [
    "Acid preservation lowers pH, inhibiting microbial growth",
    "Salt in fermented pickles creates selective environment for beneficial bacteria",
    "Osmotic pressure draws water from vegetables, aiding preservation",
    "Lactic acid bacteria convert sugars to acids in fermented pickles",
    "Acetic acid from vinegar penetrates cell membranes for preservation",
    "Antioxidants in spices help preserve color and nutrients",
    "Heat processing in canning destroys enzymes that cause spoilage",
    "Vacuum sealing prevents oxidation and contamination",
    "Competing beneficial bacteria exclude pathogens in fermented pickles",
    "Salt concentration affects osmosis rate and texture development",
    "Acid concentration determines preservation effectiveness and flavor intensity",
    "Spice volatile compounds infuse through acidic medium",
    "Sugar balances acidity and contributes to flavor development",
    "Temperature affects fermentation rate and microbial selection",
    "Vegetable cell structure determines pickling liquid absorption rate",
  ],

  modernVariations: [
    "Quick refrigerator pickles (ready in hours)",
    "Sous vide pickling for precise temperature control",
    "Molecular gastronomy pickling spheres",
    "Vacuum infusion for rapid acid penetration",
    "Controlled fermentation chambers for consistent results",
    "Low-sodium pickling alternatives",
    "Flash-pickled garnishes for fine dining",
    "Kombucha-based pickling liquids",
    "Ultrasonic-assisted rapid pickling",
    "Targeted probiotic strain fermentation",
    "Smoked pickled vegetables",
    "Wine and beer-based pickling liquids",
    "Fruit juice pickling for natural sweetness",
    "Nitro-infused pickles for texture transformation",
    "Freeze-dried pickles for texture contrast",
    "CBD or herb-infused pickling solutions",
    "Color-changing pH-reactive pickles",
    "Air-dried pickled vegetables for concentrated flavor",
  ],

  healthConsiderations: [
    "Fermented pickles provide probiotic benefits for gut health",
    "Vinegar pickles may help regulate blood sugar",
    "High sodium content should be considered for those monitoring salt intake",
    "Pickled vegetables retain many of their original nutrients",
    "Fermented pickles may improve digestibility of certain compounds",
    "Polyphenols in pickled foods offer antioxidant benefits",
    "Pickling can increase bioavailability of certain nutrients",
    "Some pickle types contain significant amounts of vitamins K and A",
    "Moderate consumption recommended due to sodium and acidity",
    "Fermented pickles may support immune system function",
    "May assist with appetite regulation through sour taste profiles",
    "Can help maintain electrolyte balance (in moderation)",
    "Some pickled foods like kimchi associated with longevity in studies",
    "Quick vinegar pickles are low in calories and can aid weight management",
    "Some compounds formed during fermentation have potential anti-cancer properties",
  ],

  sustainabilityRating: 0.9, // Very high - preserves seasonal abundance, low energy use

  equipmentComplexity: 0.35, // Low-moderate - basic equipment with some specialized items
};
