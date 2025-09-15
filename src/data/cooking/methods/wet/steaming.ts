import type { ZodiacSign, ThermodynamicProperties } from '@/types/alchemy';
import type { CookingMethodData } from '@/types/cookingMethod';

/**
 * Steaming cooking method
 *
 * Cooking food by surrounding it with hot water vapor, allowing gentle, moisture-rich heat transfer
 */
export const steaming: CookingMethodData = {
  name: 'steaming',
  description:
    'Cooking food by suspending it above simmering water where rising vapor gently cooks the food, preserving nutrients and moisture',
  elementalEffect: {
    Water: 0.6,
    Air: 0.3,
    Fire: 0.1,
    Earth: 0.0
  },
  duration: {
    min: 5,
    max: 45
  },
  suitable_for: [
    'vegetables',
    'fish',
    'shellfish',
    'dumplings',
    'rice',
    'custards',
    'puddings',
    'breads',
    'buns',
    'cakes',
    'eggs',
    'poultry',
    'meat',
    'tofu',
    'seitan',
    'tempeh'
  ],
  benefits: [
    'nutrient retention',
    'preserves color',
    'maintains moisture',
    'gentle cooking',
    'no added fat',
    'prevents oxidation',
    'preserves delicate textures',
    'natural flavor enhancement',
    'reduced risk of overcooking',
    'consistent results'
  ],
  astrologicalInfluences: {
    favorableZodiac: ['cancer', 'pisces', 'libra'] as any[],
    unfavorableZodiac: ['leo', 'aries', 'virgo'] as any[],
    dominantPlanets: ['Moon', 'Venus', 'Neptune'],
    lunarPhaseEffect: {
      full_moon: 1.25, // Enhanced moisture retention
      new_moon: 0.85, // Diminished vapor production
      waxing_crescent: 1.1, // Slight enhancement
      waning_gibbous: 0.9, // Slight reduction
    }
  },
  toolsRequired: [
    'Steamer basket/insert (stainless steel or silicone)',
    'Pot with tight-fitting lid',
    'Heat source (stovetop, induction)',
    'Bamboo steamer (traditional Chinese style)',
    'Parchment paper/cabbage leaves (to prevent sticking)',
    'Temperature probe (for larger items)',
    'Digital timer',
    'Heat-resistant gloves',
    'Tongs or spider for removal',
    'Lid with steam vents',
    'Steamer mats (silicone or cloth)',
    'Steamer liners (for delicate foods)'
  ],
  commonMistakes: [
    'Letting water boil away (causing scorching and damage to equipment)',
    'Overcrowding steamer basket (prevents proper steam circulation)',
    'Not allowing enough steam circulation (placing food too close together)',
    'Opening lid too frequently (releases accumulated steam and extends cooking time)',
    'Steaming for too long (results in mushy textures and nutrient loss)',
    'Using too little water (requires constant monitoring)',
    'Forgetting to preheat the steamer (leads to inconsistent cooking)',
    'Steaming incompatible foods together (flavors can transfer)',
    'Allowing condensation to drip back onto food (can cause waterlogging)',
    'Using salt directly on vegetables before steaming (draws out moisture)',
    'Not considering altitude adjustments (higher altitudes require longer times)'
  ],
  pairingSuggestions: [
    'Infused dipping sauces (soy-ginger, garlic-chili, citrus-herb)',
    'Aromatic herbs in steaming liquid (lemongrass, kaffir lime, bay leaf)',
    'Citrus finishing spritz (yuzu, meyer lemon, kalamansi)',
    'Light vinaigrettes (rice wine, champagne, herb-infused)',
    'Compound butters for richness (miso butter, herb butter, citrus butter)',
    'Delicate herb oils (basil oil, cilantro oil, chive oil)',
    'Cold sesame sauce for dumplings and vegetables',
    'Fragrant teas as steaming medium (jasmine, earl grey, lapsang souchong)',
    'Fermented bean sauces for Asian steamed dishes',
    'Yogurt-based sauces for steamed vegetables'
  ],
  nutrientRetention: {
    vitamins: 0.9, // Excellent retention of water-soluble vitamins
    minerals: 0.95, // Minimal loss to cooking medium
    proteins: 0.95, // Gentle denaturation preserves structure
    antioxidants: 0.9, // Limited oxidation
    color_compounds: 0.85, // Good chlorophyll preservation
    water_soluble_vitamins: 0.85, // Some B and C vitamins retained
    fat_soluble_vitamins: 0.95, // A, D, E, K vitamins well preserved
    phytochemicals: 0.9, // Beneficial plant compounds mostly intact
  },
  optimalTemperatures: {
    water_base: 212, // °F - Boiling water to produce steam at sea level
    food_chamber: 200, // °F - Approximate temperature reaching food
    dim_sum_dumplings: 210, // °F - Traditional Chinese dumpling temperature
    fish_fillets: 185, // °F - Delicate white fish optimal temperature
    vegetables_leafy: 200, // °F - Spinach, chard, collards
    vegetables_root: 205, // °F - Carrots, beets, turnips
    custards: 180, // °F - Egg-based mixtures to prevent curdling
    poultry: 200, // °F - Chicken breasts, duck
    whole_fish: 190, // °F - Preserves moisture in larger items
    sticky_rice: 205, // °F - For proper glutinous rice cooking
    bao_buns: 210, // °F - Chinese steamed buns
    puddings: 190, // °F - Sweet or savory pudding mixtures
  },
  regionalVariations: {
    chinese: [
      'bamboo steamer techniques (stacked for multiple items)',
      'dim sum preparation (har gow, siu mai)',
      'lotus leaf wrapping (lo mai gai)',
      'whole fish steaming with ginger and scallion'
    ],
    french: [
      'en papillote style steaming (parchment packets)',
      'bain-marie for custards (crème caramel)',
      'fish en papillote (with herbs and wine)'
    ],
    southeast_asian: [
      'banana leaf wrapping (Malaysian otak-otak, Thai hor mok)',
      'sticky rice steaming in cone-shaped baskets',
      'Vietnamese banh cuon (rice rolls)',
      'Indonesian tumpeng rice cones'
    ],
    nordic: [
      'fish steaming with herbs (dill, fennel)',
      'root vegetable steam-roasting',
      'steamed berry puddings'
    ],
    japanese: [
      'chawanmushi (savory egg custard)',
      'mushimono technique',
      'rice cake steaming',
      'tea-steamed fish',
      'koimo steamed taro'
    ],
    indian: [
      'idli (fermented rice cakes)',
      'dhokla (fermented gram flour cakes)',
      'patra (colocasia leaf rolls)',
      'momo dumplings'
    ],
    middle_eastern: ['couscous steaming', 'stuffed vegetable steaming', 'fish with aromatic herbs'],
    south_american: [
      'tamales in corn husks',
      'humitas (fresh corn dumplings)',
      'Chilean curanto (pit steaming)'
    ]
  },
  chemicalChanges: {
    gentle_protein_denaturation: true, // Proteins unfold without toughening at 140-165°F
    starch_hydration: true, // Water absorption into starch granules
    water_soluble_vitamin_preservation: true, // Limited leaching of B and C vitamins
    minimal_lipid_oxidation: true, // Low-temperature prevents fat rancidity
    chlorophyll_retention: true, // Green color preserved in vegetables
    enzyme_inactivation: true, // Beneficial for certain root vegetables
    carotenoid_preservation: true, // Orange/yellow pigments maintain integrity
    gelatinization: true, // Proper cooking of rice and starchy foods
    anthocyanin_stability: true, // Preservation of blue/purple plant pigments
  },
  safetyFeatures: [
    'No risk of burning food (temperature cannot exceed 212°F at sea level)',
    'Consistent gentle cooking temperature (self-regulating system)',
    'No hot oil splatter (reduced burn risk)',
    'Use caution with escaping steam (can cause severe burns)',
    'Keep handles positioned away from heat source',
    'Ensure adequate ventilation to prevent excess condensation',
    'Use heat-resistant gloves when removing lid to prevent steam burns',
    'Allow sufficient cooling time before handling steamer components',
    'Ensure food reaches proper internal temperature (especially poultry at 165°F)'
  ],
  thermodynamicProperties: {
    heat: 0.6, // Moderate heat transfer rate
    entropy: 0.45, // Gentle structural transformations
    reactivity: 0.3, // Low chemical reactivity (minimal browning)
    gregsEnergy: -8.35, // Calculated using heat - (entropy * reactivity), // gregsEnergy = heat - (entropy * reactivity),
  } as ThermodynamicProperties,

  // Additional metadata
  history:
    'Steaming dates back to ancient Chinese cooking techniques from at least 5000 BCE, where bamboo steamers were developed for rice and dumplings. Archaeological evidence shows pottery steamers from the Banpo Neolithic settlement (4800-4200 BCE) in China\'s Yellow River Valley. The technique spread throughout Asia and eventually worldwide. In 18th century Europe, 'bain-marie' steaming became fashionable in French cuisine. Modern pressure steamers were developed in the early 20th century, while contemporary high-tech combi-ovens with precision steam control represent the latest evolution.',

  scientificPrinciples: [
    'Latent heat of vaporization releases 540 cal/g of energy when steam condenses on food surface',
    'Steam carries approximately 6 times more thermal energy than water at the same temperature',
    'Gentle heat transfer prevents cellular rupture, maintaining food integrity',
    'Moist environment prevents surface dehydration and maintains juiciness',
    'Minimal leaching of water-soluble compounds compared to boiling or simmering',
    'Naturally pressurized system in enclosed steamers increases efficiency',
    'Convection currents in steam ensure even heat distribution',
    'Vacuum effect when cooling draws flavors deeper into food',
    'Hydration of starches occurs efficiently in steam environment',
    'Proteins denature without excessive contraction that causes toughness'
  ],

  modernVariations: [
    'Pressure steaming for faster cooking (reduces time by 50-70%)',
    'Flavored steam with herbs, wine, tea, or citrus for aromatic infusion',
    'Combi-oven steaming with precise humidity control (1-100%)',
    'Multi-tiered stackable steamers for complete meal components',
    'Steam-convection combination cooking for moist interior/crisper exterior',
    'Sous-vide followed by flash-steaming for texture control',
    'Specialized electric steamers with programmable settings',
    'Microwave steam containers for quick results',
    'Industrial steam-injection ovens for commercial baking',
    'Flash-steaming for vegetables to maintain crispness'
  ],

  sustainabilityRating: 0.85, // Highly efficient energy and water usage

  equipmentComplexity: 0.3, // Basic equipment with some specialized options

  healthConsiderations: [
    'Preserves more nutrients than most other cooking methods (particularly water-soluble vitamins)',
    'No added fat required for cooking (beneficial for low-fat diets)',
    'Gentle cooking prevents formation of harmful compounds like acrylamide and HCAs',
    'Ideal for delicate proteins and vegetables that might be damaged by other methods',
    'Helps maintain natural food moisture and prevents drying out',
    'Reduces need for salt during cooking phase (can be added after for better control)',
    'Beneficial for easier digestion of certain foods (particularly legumes and grains)',
    'Preserves antioxidant content better than high-heat methods',
    'Reduces AGE (Advanced Glycation End-products) formation compared to dry heat methods',
    'Beneficial for low-sodium cooking approach'
  ],

  expertTips: [
    'Use salted slices of lemon under fish to elevate it and prevent sticking while adding flavor',
    'For leafy greens, steam them just until they turn bright green and begin to wilt (usually 1-2 minutes)',
    'When steaming layered dishes in bamboo steamers, place longest-cooking items in bottom layer',
    'Wrap fatty fish like salmon in parchment or banana leaves to capture rendered fat and prevent dripping',
    'Line bamboo steamers with cabbage leaves or parchment for delicate dumplings to prevent sticking',
    'Add fresh herbs to the steaming water for subtle aromatic infusion into delicate proteins',
    'Pre-heat steamers before adding food to ensure immediate and even cooking',
    'For crisp-tender vegetables, immediately transfer to ice bath after steaming',
    'Use citrus slices under fish to create a natural barrier and add subtle flavor',
    'For whole fish, score the thickest parts to ensure even cooking',
    'Maintain at least 1 inch of water in the steaming pot at all times to prevent burning',
    'For perfect steamed eggs, strain the beaten eggs before steaming to remove chalaza',
    'Use a needle to poke small holes in sausages before steaming to prevent bursting'
  ],

  ingredientPreparation: {
    vegetables:
      'Clean thoroughly; cut into uniform sizes (smaller for dense vegetables, larger for tender ones); arrange with space between pieces for steam circulation',
    fish_fillets:
      'Pat dry; season lightly; place on heat-proof plate that fits in steamer; add aromatics; score thicker portions for even cooking',
    whole_fish:
      'Scale, clean and gut; score sides at 1-inch intervals to ensure even cooking; stuff cavity with aromatics; place on heat-proof plate',
    dumplings:
      'Arrange with 1/2 inch space between; line steamer with parchment, cabbage leaves or cloth to prevent sticking; avoid overcrowding',
    rice: 'Rinse until water runs clear to remove excess starch; soak glutinous rice for 1-4 hours before steaming; use 1:1 ratio of rice to water',
    custards:
      'Strain mixture to remove lumps; cover with foil to prevent condensation dripping; place in water bath for gentle heating',
    chicken:
      'Cut joints and score thick portions for even cooking; marinate prior to steaming for flavor penetration; arrange in single layer',
    eggs: 'For whole eggs, prick wider end with pin to prevent cracking; for custards, filter mixture through fine mesh',
    layered_dishes:
      'Place longer-cooking ingredients at bottom, delicate ingredients at top; consider flavor migration between layers',
    roots_tubers:
      'Peel if necessary, cut to uniform sizes (1-2 inch pieces), pre-soak very dense vegetables for 10-15 minutes',
    greens:
      'Wash thoroughly, remove tough stems, leave whole for easy removal or chop for inclusion in dishes'
  },

  timingConsiderations: {
    preheating:
      'Always preheat the steamer with lid on until vigorous steam appears before adding food (usually 5-8 minutes)',
    leafy_greens:
      'Steam for 1-3 minutes until bright green and just wilted; immediately remove to prevent overcooking',
    root_vegetables:
      'Small pieces (1-inch): 10-15 minutes; medium pieces (2-inch): 15-20 minutes; test with knife for tenderness',
    fish_fillets:
      'Thin fillets (1/2 inch): 5-7 minutes; medium (1 inch): 8-10 minutes; thick (1 1/2+ inches): 12-15 minutes',
    whole_fish:
      '10 minutes per inch of thickness measured at thickest point; check for flaky texture',
    chicken_breast:
      'Boneless: 12-15 minutes; bone-in: 20-25 minutes; verify 165°F internal temperature',
    dumplings:
      'Small (1 inch): 6-8 minutes; medium (1.5-2 inch): 8-10 minutes; large (2.5+ inch): 12-15 minutes',
    shellfish:
      'Shrimp: 3-5 minutes; clams/mussels: 5-7 minutes (until shells open); crab: 12-15 minutes (per pound)',
    eggs: 'Soft-cooked: 6-7 minutes; medium: 8-9 minutes; hard-cooked: 10-12 minutes; custards: 30-35 minutes',
    rice: 'White rice: 30-35 minutes; glutinous/sticky rice: 25-30 minutes, brown rice: 45-50 minutes',
    rest_after:
      'Fish: 2-3 minutes, chicken: 5-10 minutes, vegetables: serve immediately, rice: 5-10 minutes'
  },

  doneness_indicators: {
    fish: 'Flesh turns from translucent to opaque; flakes easily with fork; internal temperature 145°F',
    chicken: 'No pink remains; juices run clear; internal temperature 165°F at thickest part',
    eggs_soft: 'Whites set firm but yolks remain runny; whites not translucent',
    eggs_hard: 'Yolks fully set but still moist; avoid green ring around yolk',
    custards: 'Edges set but center retains slight jiggle; knife inserted comes out clean',
    green_vegetables: 'Bright vibrant color; crisp-tender texture; slight resistance when bitten',
    root_vegetables:
      'Knife or skewer penetrates with slight resistance; maintains shape but not crunchy',
    rice: 'All water absorbed; grains separate easily; tender without hardness in center',
    dumplings:
      'Wrappers become translucent, filling reaches appropriate temperature (meat 165°F), dough not sticky',
    bao_buns:
      'Dough springs back when touched lightly, increase in size by 50%, no raw dough in center'
  },

  ingredientInteractions: {
    stacking_effects:
      'Flavors from upper layers can drip onto lower items; arrange complementary flavors together or use barriers',
    aromatics_infusion:
      'Fresh herbs, spices, and citrus in steaming water infuse subtle flavors; stronger in closed systems',
    color_transfers:
      'Strongly colored ingredients (beets, turmeric) can tint adjacent foods; separate for visual appeal',
    moisture_management:
      'Drier ingredients placed below moister ones benefit from natural basting; leafy greens below can wilt from dripping',
    condensation_control:
      'Covering custards prevents water spots; some items benefit from direct condensation (bao buns)',
    salt_timing:
      'Salt draws moisture from vegetables; better added after steaming for crisp texture; fish benefits from light pre-salting',
    acid_effects:
      'Acidic marinades partially cook proteins before steaming, reduce steaming time accordingly',
    sugar_interactions:
      'Sugar in marinades accelerates browning in post-steam finishing techniques, enhances caramelization',
    oil_applications:
      'Light oil on food surface prevents sticking and carries fat-soluble flavors, apply before steaming',
    alcohol_evaporation:
      'Alcohol in steaming liquid (wine, sake) imparts flavor but alcohol largely evaporates, use in well-ventilated area'
  }
};
