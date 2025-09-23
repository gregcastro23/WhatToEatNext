import type { ThermodynamicProperties } from '@/types/alchemy';
import type { CookingMethodData } from '@/types/cookingMethod';

/**
 * Braising cooking method
 *
 * Slow cooking method that combines dry and moist heat to tenderize and develop deep flavors.
 * Associated with the alchemical pillar of Dissolution - the breaking down of complex structures
 * into simpler forms through the action of liquid and gentle heat.
 */
export const braising: CookingMethodData = {
  name: 'braising',
  description: 'Slow cooking method where food is first seared at high temperature, then finished in a covered pot with liquid at lower temperature. This dual-stage process transforms tough, collagen-rich ingredients into tender, flavorful dishes through the gradual breakdown of connective tissues and the concentration of flavors. The enclosed environment creates a cycle of evaporation and condensation that continuously bastes the food, while the liquid medium facilitates the exchange of flavors between ingredients.',
  elementalEffect: {
    Water: 0.4, // Primary element - dissolving and transformative
    Fire: 0.3, // Secondary element - initial sear and sustained heat,
    Earth: 0.2, // Tertiary element - grounding and substantive
    Air: 0.1, // Minimal element - small amount of trapped steam
  },
  duration: {
    min: 60,
    max: 480, // Extended maximum time for large, tough cuts
  },
  suitable_for: [
    'tough meats',
    'root vegetables',
    'legumes',
    'hearty greens',
    'poultry thighs',
    'game',
    'short ribs',
    'beef chuck',
    'lamb shanks',
    'pork shoulder',
    'oxtail',
    'chicken thighs',
    'fennel bulbs',
    'leeks',
    'celery root',
    'dried beans',
    'beef cheeks',
    'venison shoulder',
    'octopus',
    'whole duck',
    'artichokes'
  ],
  benefits: [
    'tenderizes tough foods',
    'develops complex flavors',
    'creates rich sauces',
    'minimal monitoring once started',
    'infuses aromatics',
    'converts collagen to gelatin',
    'extracts bone marrow nutrients',
    'concentrates umami compounds',
    'enhances food digestibility',
    'creates deeply layered flavors',
    'maximizes inexpensive cuts of meat',
    'preserves nutritional value',
    'requires minimal active cooking time',
    'balances fat content through emulsification',
    'intensifies aromatics through prolonged contact'
  ],
  astrologicalInfluences: {
    favorableZodiac: ['taurus', 'cancer', 'scorpio', 'capricorn'] as any[], // Earth and water signs enhance patience and depth,
    unfavorableZodiac: ['gemini', 'aquarius', 'libra'] as any[], // Air signs lack patience and grounding,
    dominantPlanets: ['Saturn', 'Moon', 'Pluto', 'Jupiter'], // Saturn (time), Moon (fluctuation), Pluto (transformation), Jupiter (expansion),
    lunarPhaseEffect: {
      full_moon: 0.9, // Reduced effectiveness - too much energy,
      new_moon: 1.2, // Enhanced flavor integration - concentrated energy,
      waning_moon: 1.3, // Best phase for deep flavor development - inward energy,
      waxing_gibbous: 1.0, // Neutral effect,
      first_quarter: 1.1, // Good for initial stages of braising,
      last_quarter: 1.2, // Ideal for finishing and reduction,
      waning_crescent: 1.15, // Excellent for slow transformation
    }
  },
  toolsRequired: [
    'Dutch oven or heavy-bottomed pot with lid',
    'Tongs',
    'Wooden spoon',
    'Aromatics (herbs, spices, mirepoix)',
    'Heat source (oven or stovetop)',
    'Kitchen twine (for tying bundles)',
    'Cheesecloth (for bouquet garni)',
    'Meat thermometer',
    'Fine mesh strainer',
    'Fat separator (for finishing sauce)',
    'Immersion blender (optional for sauce refinement)',
    'Parchment paper lid (cartouche)',
    'Heavy, well-fitting lid'
  ],
  commonMistakes: [
    'too much liquid (should cover only 1/2 to 2/3 of ingredients)',
    'cooking too fast (higher heat toughens protein)',
    'lid not tight-fitting (allows excessive evaporation)',
    'inadequate initial browning (misses Maillard flavors)',
    'underseasoning (slow cooking mutes flavors)',
    'not letting meat rest before serving (texture compromise)',
    'cutting pieces inconsistently (uneven cooking)',
    'overcrowding during searing phase (steaming instead of browning)',
    'not skimming fat and impurities (cloudy sauce)',
    'using lean cuts (insufficient collagen)',
    'insufficient aromatics (flat flavor profile)',
    'adding delicate ingredients too early (disintegration)',
    'frequent lid opening (temperature fluctuation)'
  ],
  pairingSuggestions: [
    'Fresh herb garnishes (parsley, chervil, tarragon)',
    'Acid components for balance (vinegar, citrus, pickled elements)',
    'Creamy polenta or mashed potatoes (sauce absorption)',
    'Crusty bread for sauce (textural contrast)',
    'Bright raw vegetable counterpoint (freshness)',
    'Bitter greens (balances richness)',
    'Gremolata or persillade (aromatic finish)',
    'Full-bodied red wines with mature tannins',
    'Root vegetable purées (complementary earthiness)',
    'Preserved lemon or capers (brightening effect)',
    'Mushroom accompaniments (umami enhancement)',
    'Aged cheese rinds (flavor deepening agent)'
  ],
  nutrientRetention: {
    collagen: 0.95, // Converted to gelatin,
    minerals: 0.85, // Excellent retention in liquid medium,
    vitamins: 0.6, // Some loss of water-soluble vitamins but retained in sauce,
    proteins: 0.9, // Very good protein preservation,
    fat_soluble_nutrients: 0.85, // Good retention in fat emulsion,
    water_soluble_vitamins: 0.75, // Preserved in cooking liquid,
    antioxidants: 0.8, // Many extracted and preserved in liquid,
    amino_acids: 0.92, // Excellent preservation with enhanced bioavailability,
    phenolics: 0.7, // Moderate retention of plant compounds
  },
  optimalTemperatures: {
    initial_sear: 450, // °F, for Maillard reaction development,
    braising_phase: 325, // °F, general braising temperature,
    final_reduction: 350, // °F, for sauce concentration,
    vegetables_only: 300, // °F, gentler for plant matter,
    meat_with_bone: 275, // °F, lower and slower for bone-in cuts,
    legume_braise: 225, // °F, very gentle for beans and pulses,
    poultry_braise: 325, // °F, standard for poultry items,
    collagen_conversion: 320, // °F, optimal for collagen to gelatin,
    fish_braise: 300, // °F, gentle for delicate proteins,
    liquid_simmer: 205, // °F, ideal braising liquid temperature (just below boiling)
  },
  regionalVariations: {
    french: [
      'boeuf bourguignon (beef in red wine)',
      'cassoulet (bean and meat casserole)',
      'daube provençale (beef stew with olives and orange)',
      'navarin d\'agneau (lamb stew with spring vegetables)'
    ],
    italian: [
      'osso buco (veal shanks)',
      'brasato al barolo (beef braised in wine)',
      'pollo alla cacciatora (hunter\'s chicken)'
    ],
    chinese: [
      'hong shao rou (red-braised pork belly)',
      'lu rou (braised minced pork)',
      'dongpo rou (braised pork belly)'
    ],
    mexican: [
      'barbacoa (slow-cooked meat)',
      'chile colorado (red chile braised beef)',
      'pollo en mole (chicken in complex sauce)'
    ],
    moroccan: [
      'tagine (slow-cooked stews)',
      'mrouzia (lamb with honey and spices)',
      'tangia (slow-cooked meat dish)'
    ],
    german: ['sauerbraten (sour roast)', 'rinderrouladen (beef rolls)'],
    jewish: ['cholent (sabbath stew)', 'tzimmes (sweet stew with carrots)'],
    american: ['pot roast', 'yankee pot roast', 'mississippi pot roast']
  },
  chemicalChanges: {
    collagen_breakdown: true, // Conversion of collagen to gelatin via hydrolysis,
    maillard_reaction: true, // Complex browning from amino acids and reducing sugars,
    fat_emulsification: true, // Dispersion of fat particles in liquid medium,
    flavor_concentration: true, // Reduction of water content concentrating soluble compounds,
    starch_thickening: true, // Gelatinization of starch granules for sauce body,
    caramelization: true, // High-temperature sugar transformation,
    protein_denaturation: true, // Restructuring of protein molecules,
    osmosis: true, // Bidirectional flavor exchange between food and liquid,
    aromatic_infusion: true, // Transfer of volatile compounds from herbs and spices,
    acid_tenderization: true, // Breakdown of protein structures through acid action,
    lipid_oxidation: false, // Minimized by liquid environment,
    mineral_transfer: true, // Migration of minerals from bones to liquid
  },
  safetyFeatures: [
    'Handle heavy pot with care (ergonomic lifting)',
    'Use oven mitts for hot lids and handles',
    'Avoid steam burns when opening (direct steam away)',
    'Proper food temperature monitoring (minimum 165°F for safety)',
    'Gradual temperature changes (prevents thermal shock)',
    'Cool large braises properly (within food safety guidelines)',
    'Strain hot liquids carefully (prevent splashing)',
    'Avoid leaving braises at room temperature (bacterial growth)',
    'Proper refrigeration of leftovers (rapid cooling)',
    'Thorough reheating (165°F minimum for leftovers)',
    'Use tempered cookware (prevents cracking)',
    'Keep pot handles turned inward on stovetop (prevents accidents)'
  ],
  thermodynamicProperties: {
    heat: 0.55, // Moderate heat with liquid limiting max temperature,
    entropy: 0.75, // High breakdown of collagen and tough structures,
    reactivity: 0.6, // Good flavor development and Maillard from initial sear,
    gregsEnergy: -14.35, // Calculated using heat - (entropy * reactivity), // Calculated gregsEnergy: heat - (entropy * reactivity)
  } as unknown as ThermodynamicProperties,

  // Additional metadata
  history: 'Braising has ancient origins across many cultures and was particularly refined in French cuisine with dishes like cassoulet and coq au vin. It evolved from the need to tenderize tough, less expensive cuts of meat, making it historically significant for working-class cooking. The technique appears in Roman cookbooks dating to the 1st century AD, with Apicius describing several braised dishes. Medieval European cooking featured braising in lidded clay vessels, while Chinese culture developed master-stock braising dating back to the Zhou dynasty. In colonial America, the \'New England boiled dinner\' emerged as a braised one-pot meal, while French culinary codification in the 18th and 19th centuries established braising among the grand techniques of classical cuisine.',

  scientificPrinciples: [
    'Initial Maillard reaction develops base flavors via high-heat searing',
    'Collagen converts to gelatin at 160°F-180°F when moisture is present',
    'Flavor compounds are both water and fat-soluble, extracted by mixed medium',
    'Low simmer prevents protein toughening while allowing collagen breakdown',
    'Aromatic compounds infuse throughout cooking liquid',
    'Convection currents in liquid distribute flavors evenly',
    'Hydrolysis of connective tissues occurs optimally at 190°F-205°F',
    'Enzymatic breakdown continues until proteins denature around 160°F',
    'Osmotic pressure equalizes, allowing flavors to move bidirectionally',
    'Enclosed environment maintains humidity level near 100%',
    'Cyclic evaporation and condensation creates self-basting effect',
    'Acidic components in liquid medium accelerate collagen breakdown',
    'Gelatinization of starches occurs between 150°F-180°F, contributing to thickening',
    'Fat renders at temperatures above 130°F, contributing flavor compounds'
  ],

  modernVariations: [
    'Pressure braising (faster results with intensified flavors)',
    'Sous vide braising (precise temperature control for texture)',
    'Vacuum-sealed flavor infusion (reduced liquid requirements)',
    'Wine-forward vs. stock-forward techniques (flavor foundation variations)',
    'Deconstructed braises with components separated (modern presentation)',
    'Smoke-infused braising liquid (added dimension)',
    'Ultrasonic tenderization pre-braise (accelerated process)',
    'Enzyme-assisted braising (papain, bromelain pre-treatment)',
    'Microwave-assisted start (initial collagen breakdown)',
    'Controlled enzymatic addition (meat tenderization optimization)',
    'Centrifuge-clarified braising liquids (refined sauces)',
    'Thermostatically controlled braising (precision temperature maintenance)',
    'Cryoconcentration of braising liquids (intensified flavors)'
  ],

  sustainabilityRating: 0.75, // Energy-efficient slow cooking, typically uses less desirable cuts,

  equipmentComplexity: 0.45, // Basic equipment but requires understanding of technique,

  healthConsiderations: [
    'Renders and emulsifies fats into sauce (can be skimmed if desired)',
    'Develops umami flavors without added MSG (natural glutamates)',
    'Can incorporate healthy herbs and vegetables (nutrient addition)',
    'Retains minerals from bones and tough cuts (calcium, iron, magnesium)',
    'Creates satiating dishes with less meat required (protein efficiency)',
    'Collagen conversion improves digestibility (easier nutrient absorption)',
    'Gelatin formation supports joint and gut health (amino acids glycine and proline)',
    'Slow cooking minimizes formation of harmful compounds (fewer heterocyclic amines)',
    'Cooking liquid contains water-soluble nutrients (complete nutrition)',
    'Long cooking times allow phenolic compounds to transfer from herbs (antioxidants)',
    'Leftovers often develop enhanced flavor profiles (flavor compounds continue interacting)',
    'Balanced macronutrient profile when properly composed (protein, fat, carbohydrate)'
  ],

  /**
   * Alchemical aspect - Dissolution Pillar (#3)
   *
   * Braising is associated with the Dissolution pillar in alchemy,
   * which represents the breaking down of complex structures into simpler forms
   * through the action of liquid and gentle heat.
   *
   * Alchemical Effects: Increases Spirit and Essence, decreases Matter and Substance
   * Planetary associations: Moon (fluidity, cycles), Neptune (dissolution, unity)
   * Tarot associations: The Moon (hidden depths), Six of Cups (slow nurturing)
   * Elemental associations: Primary - Water, Secondary - Fire
   */
  alchemicalAspects: {
    pillarName: 'Dissolution',
    pillarNumber: 3,
    alchemicalProcess: 'The breaking down of rigid structures into fluid, interconnected elements through immersion and gentle transformation',
    effects: {
      spirit: 1, // Increases spiritual essence through gentle transformation,
      essence: 1, // Increases essential qualities and concentrates flavors,
      matter: -1, // Decreases rigid material structure through softening,
      substance: -1, // Decreases original substance as it transforms
    },
    symbolicMeaning: 'Represents the alchemical principle of solving et coagula (dissolve and recombine) where elements must be broken down before being reconstructed in more harmonious forms. In braising, tough ingredients are slowly dissolved and transformed into tender, flavorful substances with new properties.',
    associatedElements: {
      primary: 'Water', // Dissolving and transformative,
      secondary: 'Fire', // Catalyst for change and transformation
    }
  }

  /**
   * Extended cooking notes
   */
  extendedNotes: {
    liquids: [
      'Stock (meat, vegetable, or mushroom) provides depth and umami',
      'Wine (red, white, fortified) adds acidity and complex flavors',
      'Beer creates malty depth and slight bitterness',
      'Cider brings fruit notes and gentle acidity',
      'Tomatoes contribute umami and natural acidity',
      'Broth can be enriched with demi-glace for intensity',
      'Coconut milk creates creamy texture and tropical notes',
      'Citrus juices tenderize through acidity but added later prevent bitterness',
      'Combinations often most effective: stock + wine is classic foundation'
    ],

    aromaticBases: [
      'Mirepoix: 2 parts onion1 part carrot1 part celery',
      'Sofrito: onion, garlic, bell pepper, tomato',
      'Holy Trinity: equal parts onion, celery, bell pepper',
      'Suppengrün: leek, carrot, celeriac',
      'Włoszczyzna: leek, carrot, parsley root, celeriac',
      'Battuto: onion, celery, carrot, pancetta',
      'Sachet d\'épices: herbs and spices in cheesecloth with string (removable)'
    ],

    textureConsiderations: [
      'Cut size determines cooking time and final texture',
      'Uniform sizing ensures even cooking throughout',
      'Tough cuts with connective tissue become most tender with slow braising',
      'Root vegetables should be added later if softer texture desired',
      'Cartouche (parchment lid) under regular lid minimizes evaporation',
      'Resting period allows proteins to reabsorb juices',
      'Cooling completely in liquid then reheating improves texture',
      'Gentle simmer (tiny bubbles) rather than boiling prevents toughening',
      'Viscosity of final sauce affected by reduction level and natural gelatin'
    ],

    troubleshooting: [
      'Too tough: Insufficient cooking time or temperature too high',
      'Dry texture: Too little liquid, excessive evaporation, or lean cut used',
      'Greasy sauce: Insufficient skimming or too much fat rendered',
      'Bland flavor: Inadequate initial browning or under-seasoning',
      'Bitter sauce: Wine reduced too much or wrong variety used',
      'Watery sauce: Insufficient reduction or too much liquid used',
      'Vegetables mushy: Added too early in cooking process',
      'Meat falling apart: Slightly overcooked (sometimes desirable)',
      'Cloudy sauce: Boiled rather than simmered or insufficient skimming',
      'Acid balance: Add acid elements later in cooking process to preserve brightness'
    ]
  }
} as unknown as CookingMethodData,
