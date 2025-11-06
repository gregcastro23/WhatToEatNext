import type { ThermodynamicProperties } from "@/types/alchemy";
import type { CookingMethodData } from "@/types/cookingMethod";

/**
 * Boiling cooking method
 *
 * Cooking food by immersing it in water or liquid that has reached its boiling point (212°F/100°C at sea level)
 * One of the fundamental wet cooking techniques with applications across world cuisines
 */
export const boiling: CookingMethodData = {
  name: "boiling",
  description:
    "Cooking food by immersing it in water or other liquid that has reached a rapid, rolling boil, quickly transferring heat and creating fast, even cooking. The rapid bubbling action and convection currents ensure consistent temperature throughout the cooking medium.",
  elementalEffect: {
    Water: 0.7,
    Fire: 0.2,
    Air: 0.1,
    Earth: 0.0,
  },
  duration: {
    min: 3,
    max: 120,
  },
  suitable_for: [
    "pasta",
    "rice",
    "grains",
    "eggs",
    "vegetables",
    "potatoes",
    "legumes",
    "dumplings",
    "seafood",
    "stocks",
    "broths",
    "custards (water bath)",
    "certain meat cuts",
    "noodles",
    "gnocchi",
    "corn",
  ],
  benefits: [
    "quick cooking",
    "even heat distribution",
    "precise timing",
    "nutrient extraction into broth",
    "sterilization",
    "consistent results",
    "requires minimal attention",
    "ideal for hydrating dry ingredients",
    "no added fat necessary",
    "gelatinizes starches efficiently",
    "removes astringency from certain ingredients",
    "can concentrate flavors (reduction)",
    "creates natural thickening agents through starch release",
  ],
  astrologicalInfluences: {
    favorableZodiac: ["cancer", "pisces", "scorpio"] as any[],
    unfavorableZodiac: ["leo", "aries", "sagittarius"] as any[],
    dominantPlanets: ["Moon", "Neptune", "Jupiter"],
    rulingPlanets: ["Moon", "Neptune"],
    lunarPhaseEffect: {
      full_moon: 1.3, // Enhanced water energy
      new_moon: 0.8, // Diminished water energy
      waxing_gibbous: 1.1, // Moderate enhancement
      waning_crescent: 0.9, // Slight reduction
      first_quarter: 1.05, // Minor enhancement
      third_quarter: 0.95, // Minor reduction
      waxing_crescent: 1.0, // Neutral
      waning_gibbous: 1.0, // Neutral
    },
  },
  toolsRequired: [
    "Large pot or stockpot",
    "Heat source",
    "Strainer/colander",
    "Slotted spoon",
    "Timer",
    "Lid",
    "Thermometer (optional)",
    "Spider strainer",
    "Skimmer",
    "Wooden spoon (to prevent boil-overs)",
    "Heat-resistant gloves",
  ],
  commonMistakes: [
    "overcooking vegetables",
    "insufficient water volume",
    "not salting pasta water",
    "overcrowding the pot",
    "boiling when simmering is better",
    "not using a large enough pot",
    "lifting lid unnecessarily (losing heat and extending cooking time)",
    "not accounting for altitude adjustments",
    "not skimming impurities from stocks and broths",
    "stirring pasta too frequently",
    "not shocking vegetables after blanching",
    "starting with cold water for some items that require hot water start",
    "adding food before water reaches full boil",
  ],
  pairingSuggestions: [
    "Herb-infused finishing oils",
    "Compound butters",
    "Acidic dressings for balance",
    "Roasted elements for textural contrast",
    "Fresh herbs for color and aroma contrast",
    "Cold sauces (like aioli) for temperature contrast",
    "Crunchy toppings (breadcrumbs, nuts) for texture contrast",
    "Fermented accompaniments for flavor complexity",
    "Smoked ingredients for depth",
    "Pickled elements for brightness",
  ],
  nutrientRetention: {
    vitamins: 0.5, // Water-soluble vitamins leach into cooking water
    minerals: 0.65,
    proteins: 0.9,
    carbohydrates: 0.95,
    fat_soluble_vitamins: 0.85,
    antioxidants: 0.4,
    phytonutrients: 0.45,
    fiber: 0.85,
  },
  optimalTemperatures: {
    rolling_boil: 212, // 212°F/100°C at sea level
    high_altitude_boil: 203, // Approximate for 5000ft elevation
    blanching: 212,
    eggs_soft_boiled: 212,
    eggs_hard_boiled: 212,
    pasta_al_dente: 212,
    rice: 212,
    legumes: 212,
    potato: 212,
    root_vegetables: 212,
    leafy_greens: 212,
    dumplings: 212,
    custard_water_bath: 180, // Gentle boil for water bath
  },
  regionalVariations: {
    italian: [
      "pasta al dente technique",
      "risotto absorption method",
      "salt concentration for pasta (as salty as the Mediterranean)",
      "double boiler for zabaglione",
    ],
    asian: [
      "quick blanching for vegetables",
      "hot pot cooking",
      "noodle cooking with cold shock",
      "controlling doneness with ice baths",
      "alkaline water for ramen noodles",
      "rice washing and soaking before boiling",
    ],
    middle_eastern: [
      "rice pilaf technique",
      "legume cooking",
      "grain absorption methods",
      "aromatic broths for couscous",
    ],
    french: [
      "blanch and shock method",
      "court bouillon for seafood",
      "bain-marie for delicate sauces",
      "varying boiling temperatures for different custards",
    ],
    latin_american: [
      "corn nixtamalization",
      "sofrito base for bean cooking",
      "yuca and plantain preparation",
    ],
    indian: [
      "parallel spice infusion methods",
      "layered cooking for biryanis",
      "precise timing for various lentil types",
    ],
    african: [
      "fufu preparation techniques",
      "pounded yam methods",
      "bean cake preparation",
    ],
  },
  chemicalChanges: {
    starch_gelatinization: true,
    protein_denaturation: true,
    cell_wall_breakdown: true,
    pectin_softening: true,
    enzyme_deactivation: true,
    albumin_coagulation: true,
    leaching_of_water_soluble_compounds: true,
    hydrolysis: true,
    tannin_extraction: true,
    flavor_compound_volatilization: true,
    mineral_release: true,
    collagen_conversion: true,
  },
  safetyFeatures: [
    "Water boils at a consistent temperature (100°C at sea level)",
    "Kills most pathogens and bacteria when held at full boil for sufficient time",
    "Use handles and lids to prevent steam burns",
    "Allow proper ventilation",
    "Position pot handles away from edge of stove",
    "Use splash guards when appropriate",
    "Never leave boiling liquids unattended",
    "Be cautious when adding ingredients to prevent splashing",
    "Use proper lifting techniques for heavy stockpots",
    "Keep flammable items away from boiling processes",
    "Respect the capacity limits of pots (no more than 2/3 full)",
    "Use timers to prevent overcooking and boil-overs",
    "Have fire safety equipment nearby",
    "Be aware of altitude effects on boiling point and cooking times",
  ],
  thermodynamicProperties: {
    heat: 0.8, // High heat transfer rate
    entropy: 0.65, // Moderate-high structural disruption
    reactivity: 0.45, // Moderate chemical reactions (no Maillard)
    gregsEnergy: -12.35, // Calculated using heat - (entropy * reactivity) // gregsEnergy = heat - (entropy * reactivity);
  } as ThermodynamicProperties,

  // Additional metadata
  history:
    "Boiling is one of humanity's oldest cooking methods, dating back to the discovery of fire-resistant containers around 5000 BCE. Evidence of boiling has been found in archaeological sites worldwide, with specialized pottery for boiling developed in many cultures. The advent of pottery and the hearth revolutionized human nutrition by making grains, legumes, and tough plant materials digestible. In ancient Rome, the 'foculus' was specifically designed for boiling. Medieval cooking heavily relied on boiling, as evidenced in cookbooks like 'The Forme of Cury.' Industrial revolution brought standardized cooking equipment, and the development of pressure cooking in the 17th century by Denis Papin revolutionized boiling by raising the boiling point of water through pressure.",

  scientificPrinciples: [
    "Water maintains consistent 100°C temperature while boiling at sea level",
    "Thermal energy transfer through conduction (water to food contact)",
    "Convection currents distribute heat evenly throughout liquid",
    "Pressure affects boiling point (lower at high altitudes)",
    "Dissolved solutes raise boiling point (colligative properties)",
    "Rapid protein denaturation and starch gelatinization",
    "Phase transition energy requirements create thermal plateau",
    "Evaporative cooling balances heat input at boiling point",
    "Dissolved oxygen content decreases with continued boiling",
    "Nucleation sites affect bubble formation dynamics",
    "Surface tension changes with temperature and additives",
    "Polarity of water enables dissolution of hydrophilic compounds",
    "Boiling point elevation follows Raoult's law with dissolved solutes",
    "Heat transfer efficiency varies with food surface area and composition",
  ],

  modernVariations: [
    "Pressure cooking (higher temperature through increased pressure)",
    "Flavored cooking liquids (stocks, broths, wine, milk)",
    "Sous vide followed by quick boil finishing",
    "Controlled temperature circulators for precise temperatures below boiling",
    "Induction technology for precise boiling control",
    "Smart pot sensors that detect boil and adjust heat automatically",
    "Vacuum cooking to lower boiling point for delicate ingredients",
    "Multi-layer boiling systems for simultaneous preparation",
    "Herbal and aromatic infusions during boiling",
    "Ultrasonic-assisted boiling for improved efficiency",
    "Molecular gastronomy applications (spherification of boiled flavors)",
    "Microwave-assisted boiling for energy efficiency",
  ],

  advancedTechniques: [
    "Staged temperature progression for precise doneness",
    "Double boiler method for temperature-sensitive preparations",
    "Infusion boiling for flavor extraction",
    "Aromatic lid-steaming for dual flavor incorporation",
    "Cold-start vs. hot-start principles for different ingredients",
    "Boil-and-steam combination techniques",
    "Interval boiling for textural control",
    "Mineral water boiling for subtle flavor enhancement",
    "Pressure regulation for altitude compensation",
    "Salt percentage gradients for different applications",
    "Flavor stratification in stocks and broths",
  ],

  culturalSignificance: [
    "Communal cooking traditions centered around boiling pots",
    "Ceremonial significance of boiled offerings in many cultures",
    "Medicinal broths and decoctions in traditional medicine systems",
    "Symbol of hearth and home in many societies",
    "Preservation of cultural heritage through specific boiling techniques",
    "Foundational cooking method for many cultural staples and comfort foods",
  ],

  sustainabilityRating: 0.65, // Moderate energy usage, but can be efficient with lid use

  equipmentComplexity: 0.2, // Simple equipment requirements

  healthConsiderations: [
    "Leaching of water-soluble vitamins (BC) into cooking water",
    "No added fat required for cooking",
    "Softens fiber for easier digestion",
    "Using cooking water captures leached nutrients",
    "High temperatures destroy heat-sensitive compounds",
    "Gelatinized starches offer different glycemic response than raw",
    "Denatured proteins can be more bioavailable",
    "Can reduce anti-nutrients in legumes and certain vegetables",
    "May reduce oxalates in leafy greens",
    "Cooking water from vegetables makes mineral-rich base for soups",
    "Can reduce pesticide residues on produce surface",
    "Blanching helps preserve nutrient content for freezing",
  ],
} as CookingMethodData;
