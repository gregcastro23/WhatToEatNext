import type { 
  ZodiacSign, 
  ThermodynamicProperties
} from '@/types/alchemy';

import type { CookingMethodData } from '@/types/cookingMethod';

/**
 * Frying cooking method
 * 
 * Cooking food in hot oil or fat, creating crispy exterior and juicy interior.
 * Associated with the alchemical pillar of Calcination - the reduction of substances 
 * through intense heat, increasing Essence and Matter while decreasing Spirit and Substance.
 */
export const frying: CookingMethodData = {
  name: 'frying',
  description: 'Cooking food in hot oil or fat, creating a crispy exterior while keeping the interior moist and tender. The high-temperature process rapidly dehydrates the food surface through the expulsion of moisture, creating a protective barrier that seals in flavors while developing complex browning reactions that enhance taste and texture.',
  elementalEffect: {
    Fire: 0.6,  // Primary element - intense heat is essential
    Air: 0.2,   // Secondary element - creates space between molecules
    Earth: 0.1, // Minimal earth element - provides structure
    Water: 0.1  // Minimal water element - actively removed in process
  },
  duration: {
    min: 2,
    max: 15
  },
  suitable_for: [
    'vegetables', 
    'meats', 
    'seafood', 
    'breaded items', 
    'dough', 
    'potatoes', 
    'fritters', 
    'tempura',
    'battered fish',
    'chicken',
    'calamari',
    'falafel',
    'spring rolls',
    'croquettes',
    'arancini',
    'cheese curds',
    'tofu',
    'plantains',
    'candy bars',
    'ice cream',
    'herbs',
    'eggs',
    'dumplings',
    'seaweed',
    'fruits',
    'olives',
    'mushrooms',
    'shrimp',
    'oysters'
  ],
  benefits: [
    'quick cooking', 
    'crispy texture', 
    'flavor development', 
    'heat distribution', 
    'sensory appeal', 
    'caramelization',
    'maillard reaction intensification',
    'moisture retention inside food',
    'textural contrast',
    'flavor concentration',
    'browning development',
    'aroma enhancement',
    'extended shelf life',
    'enhanced digestibility of certain foods',
    'improved bioavailability of fat-soluble compounds',
    'rapid protein coagulation',
    'starch transformation',
    'flavor compound development',
    'consistent cooking temperature',
    'scalability for quantity cooking'
  ],
  astrologicalInfluences: {
    favorableZodiac: ['leo', 'aries', 'sagittarius'] as ZodiacSign[], // Fire signs amplify the transformative heat
    unfavorableZodiac: ['cancer', 'pisces', 'scorpio'] as ZodiacSign[], // Water signs oppose the fire element
    dominantPlanets: ['Mars', 'Sun', 'Saturn'], // Mars (heat), Sun (transformation), Saturn (structure)
    lunarPhaseEffect: {
      'full_moon': 1.2, // Enhanced crispiness, intensifies fire element
      'new_moon': 0.8,  // Reduced oil absorption, calmer energy
      'waxing_gibbous': 1.1, // Good balance of texture and flavor
      'waning_crescent': 0.9, // Slightly reduced effectiveness
      'first_quarter': 1.0, // Neutral effect
      'last_quarter': 0.9  // Slightly diminished results
    }
  },
  toolsRequired: [
    'Deep fryer or deep pan',
    'Thermometer (oil/candy)',
    'Spider strainer or slotted spoon',
    'Paper towels or wire rack',
    'Heat-resistant gloves',
    'Fire extinguisher',
    'Timer',
    'Long tongs',
    'Oil filter (for reusing oil)',
    'Temperature-controlled fryer',
    'Splatter screen',
    'Metal skimmer',
    'Dutch oven (for stovetop frying)',
    'Oil funnel with filter',
    'Dry-wet batter station setup',
    'Deep-frying basket',
    'Infrared thermometer (for surface temperature)',
    'Clip-on thermometer',
    'Heat diffuser (for stovetop frying)',
    'Oil storage container',
    'Fryer hook tools (for commercial equipment)',
    'Carbonation injector (for beer batter)'
  ],
  commonMistakes: [
    'oil temperature too low (causes greasiness)',
    'oil temperature too high (causes burning)',
    'overcrowding the fryer (lowers oil temperature)',
    'improper draining (causes sogginess)',
    'not maintaining oil temperature between batches',
    'using wrong oil type (wrong smoke point)',
    'improper breading technique (causes coating to fall off)',
    'neglecting to season immediately after frying',
    'adding wet food to hot oil (causes splattering)',
    'reusing oil too many times (creates off-flavors)',
    'insufficient oil depth (requires turning food)',
    'not allowing food to rest before serving',
    'using dirty oil (transfers flavors and accelerates degradation)',
    'failing to maintain the cold temperature chain in batter',
    'moving food too early (disrupts crust formation)',
    'improper food size (too large cooks unevenly, too small overcooks)',
    'wrong breading-to-food ratio (unbalanced texture)',
    'inadequate post-fry draining technique',
    'direct salting during frying (causes oil breakdown)',
    'double-dipping partially cooked food in batter',
    'using reactive metal vessels with acidic foods',
    'sudden temperature changes in oil (adding frozen food)',
    'improper storage of fried foods (traps steam, causes sogginess)'
  ],
  pairingSuggestions: [
    'Acidic components (lemon, vinegar, pickles) to cut richness',
    'Fresh herbs for aromatic contrast',
    'Light salads with vinaigrette',
    'Dipping sauces (aioli, remoulade, sweet chili)',
    'Pickled vegetables for tang and crunch',
    'Cold beverages to balance the heat',
    'Fermented sides for probiotic balance',
    'Cooling yogurt-based accompaniments',
    'Spicy components to complement richness',
    'Fresh vegetables for textural contrast',
    'Bitter greens to cut through fatty mouth-feel',
    'Sparkling beverages to cleanse palate',
    'Fruit-based sauces for sweet-savory contrast',
    'Toasted nuts for complementary crunch',
    'Herb-infused oils as finishing touch',
    'Cultured dairy for temperature and flavor contrast',
    'Microgreens for visual appeal and freshness',
    'Umami-rich components to enhance savory notes',
    'Citrus zest for aromatic brightness'
  ],
  nutrientRetention: {
    proteins: 0.85,  // Good protein retention but some denaturation
    vitamins: 0.70,  // Moderate loss of water-soluble vitamins
    minerals: 0.80,  // Good mineral retention
    fats: 1.5,       // Increased due to oil absorption
    antioxidants: 0.65, // Some loss of delicate compounds
    flavor_compounds: 0.90, // Enhanced through Maillard reaction
    carotenoids: 1.2, // Enhanced bioavailability through fat incorporation
    vitamin_e: 1.3, // Increased from oil absorption
    vitamin_a: 1.1, // Better retained in oil medium
    vitamin_c: 0.55, // Significant loss due to heat sensitivity
    b_vitamins: 0.65, // Moderate losses of water-soluble B vitamins
    polyphenols: 0.70, // Partial retention depending on compound
    fiber: 0.90 // Minimal impact on fiber content
  },
  optimalTemperatures: {
    'french_fries_first_fry': 325, // °F, blanching stage
    'french_fries_second_fry': 375, // °F, crisping stage
    'breaded_chicken': 350, // °F, cooks thoroughly without burning coating
    'fish': 375, // °F, quick cooking to prevent dryness
    'vegetables': 375, // °F, quick cooking to maintain nutrients
    'doughnuts': 350, // °F, allows even cooking without burning
    'tempura': 340, // °F, light and crispy batter
    'fritters': 360, // °F, even cooking of batter and filling
    'potato_chips': 350, // °F, even browning
    'calamari': 365, // °F, prevents toughening
    'falafel': 350, // °F, browns exterior while cooking interior
    'churros': 360, // °F, creates crisp exterior with soft interior
    'shrimp': 375, // °F, quick cooking for delicate protein
    'chicken_wings': 375, // °F, renders fat while crisping skin
    'onion_rings': 360, // °F, allows sweetness to develop
    'corn_dogs': 360, // °F, cooks batter while heating interior
    'spring_rolls': 350, // °F, crisps wrapper without burning
    'samosas': 355, // °F, even cooking of pastry and filling
    'chicken_tenders': 350, // °F, cooks meat through without burning coating
    'whole_turkey': 325, // °F, for deep-fried turkey, lower temperature for even cooking
    'candy_bars': 375, // °F, quick sealing of coating before melting center
    'ice_cream': 390, // °F, ultra-fast frying to create crust before melting
    'pickle_chips': 365, // °F, quick cooking to maintain crunch
    'mozzarella_sticks': 350 // °F, melts cheese while browning coating
  },
  regionalVariations: {
    japanese: ['tempura (light, airy batter)', 'karaage (double-fried chicken)', 'korokke (potato croquettes)'],
    southern_us: ['deep-fried chicken', 'hushpuppies', 'chicken-fried steak', 'corn fritters'],
    indian: ['pakora (vegetable fritters)', 'samosa (filled pastry)', 'bhajji (spiced fritters)', 'puri (fried bread)'],
    mexican: ['churros (ridged dough pastry)', 'chiles rellenos (stuffed peppers)', 'flautas (rolled tacos)', 'sopapillas (fried dough)'],
    middle_eastern: ['falafel (chickpea fritters)', 'kibbeh (meat and bulgur croquettes)', 'sambousek (filled pastries)'],
    italian: ['arancini (rice balls)', 'fritto misto (mixed fry)', 'panzerotti (filled pastries)'],
    spanish: ['croquetas (béchamel fritters)', 'calamares a la romana (battered squid)'],
    chinese: ['spring rolls', 'zha jiang (fried sauce noodles)', 'you tiao (fried dough sticks)'],
    thai: ['tod mun (fish cakes)', 'pla tod (whole fried fish)', 'por pia tod (spring rolls)'],
    scottish: ['deep-fried Mars bar', 'haggis fritters', 'fish and chips', 'deep-fried pizza'],
    dutch: ['bitterballen (meat ragout balls)', 'kroketten (croquettes)', 'oliebollen (donut-like dumplings)'],
    filipino: ['lumpia (spring rolls)', 'ukoy (shrimp fritters)', 'camaron rebosado (battered shrimp)'],
    vietnamese: ['banh goi (fried pastry)', 'cha gio (spring rolls)', 'banh xeo (crispy pancakes)'],
    nigerian: ['akara (bean fritters)', 'puff puff (fried dough)', 'chin chin (fried pastry)'],
    korean: ['kimchi jeon (kimchi pancake)', 'twigim (various fritters)', 'korean fried chicken (double-fried)'],
    brazilian: ['pastéis (filled pastries)', 'acarajé (black-eyed pea fritters)', 'bolinho de bacalhau (cod fritters)']
  },
  chemicalChanges: {
    'maillard_reaction': true,      // Non-enzymatic browning between amino acids and sugars
    'caramelization': true,         // Direct heating of sugars creating complex flavor compounds
    'protein_denaturation': true,   // Restructuring of proteins affecting texture
    'starch_gelatinization': true,  // Transformation of starch molecules with heat and moisture
    'oil_absorption': true,         // Replacement of water with oil in surface layers
    'water_evaporation': true,      // Rapid release of moisture creating steam barrier
    'fat_rendering': true,          // Melting of solid fats in the food
    'flavor_compound_development': true, // Creation of new aromatic molecules
    'crust_formation': true,        // Development of protective dehydrated layer
    'vitamin_degradation': true,     // Loss of heat-sensitive vitamins
    'emulsion_breakdown': true,     // Separation of water and oil phases in batters
    'protein_coagulation': true,    // Setting of proteins into gel networks
    'gluten_network_formation': true, // Development of structural proteins in flour-based batters
    'lipid_oxidation': true,        // Oxidative changes in fats during heating
    'moisture_barrier_formation': true, // Creation of dehydrated surface preventing further oil absorption
    'air_pocket_creation': true,    // Formation of steam pockets that create texture
    'pyrolysis': true,             // Decomposition of compounds under extreme heat
    'hydrolysis': true             // Breakdown of structures through water interaction
  },
  safetyFeatures: [
    'Use oils with high smoke points (peanut, sunflower, canola, rice bran)',
    'Keep water away from hot oil to prevent dangerous splattering',
    'Monitor oil temperature constantly with thermometer',
    'Keep fire extinguisher (Class K) nearby, never use water on oil fires',
    'Never leave hot oil unattended',
    'Allow sufficient headspace in fryer (oil expands and bubbles)',
    'Pat food dry before frying to prevent splattering',
    'Add food slowly and away from yourself',
    'Turn off heat immediately if oil smokes or smells acrid',
    'Cool oil completely before filtering or storing',
    'Use proper ventilation to remove oil particles from air',
    'Keep handles of pans turned inward to prevent accidental tipping',
    'Use properly stabilized equipment on level surfaces',
    'Keep electrical components away from water and oil',
    'Maintain clear workspace around frying area',
    'Use insulated, heat-resistant tools designed for frying',
    'Allow adequate cool-down time for oil before handling',
    'Wear appropriate protection (long sleeves, closed shoes, no dangling items)',
    'Avoid overcrowding fryer to prevent overflow',
    'Use oils before they reach smoke point to prevent aerosolized toxins',
    'Keep children and pets away from frying area',
    'Have burn treatment supplies readily available',
    'Never attempt to move hot oil containers'
  ],
  thermodynamicProperties: {
    heat: 0.85,       // Very high heat transfer through oil conduction
    entropy: 0.70,    // Rapid breakdown of structures and reorganization
    reactivity: 0.80, // High reactivity with numerous chemical changes
    energy: 0.75      // Efficient conductive heat transfer
  } as ThermodynamicProperties,
  
  // Additional metadata
  history: 'Frying dates back to ancient Egypt around 2500 BCE, with evidence of oil-cooking vessels and depictions in tomb paintings. The technique spread throughout the Mediterranean and was later refined in Asia and Europe. Deep-frying became especially popular during medieval times in Europe, while tempura was introduced to Japan by Portuguese traders in the 16th century. Modern industrialization in the 20th century, particularly the rise of fast-food chains, has made fried foods a global phenomenon. Throughout the centuries, different cultures developed unique approaches—from the light tempura batters of Japan to the seasoned cornmeal coatings of Southern American cuisine. In the late 20th and early 21st centuries, technological innovations like vacuum fryers, pressure fryers, and air fryers have attempted to address health concerns while maintaining the appealing characteristics of traditional frying.',
  
  scientificPrinciples: [
    'Conduction transfers heat from oil to food surface rapidly and efficiently',
    'Steam barrier forms between food and oil, creating bubble shield',
    'Maillard reaction creates hundreds of flavor compounds at high temperatures',
    'Dehydration of surface creates crispy texture through structural changes',
    'Vapor pressure inside food prevents oil penetration into the center',
    'Oil serves as efficient heat transfer medium (better than air or water)',
    'Surface temperature reaches 300-400°F while interior cooks at 212°F maximum',
    'Protein denaturation and starch gelatinization occur simultaneously',
    'Viscosity of oil changes with temperature, affecting heat transfer rate',
    'Food with higher moisture content absorbs less oil due to stronger steam barrier',
    'Breading and batters create porous structures that absorb oil during cooling phase',
    'Oil\'s higher boiling point than water allows temperatures above 212°F',
    'Fat polymerization creates networks that affect viscosity during repeated use',
    'Browning reactions accelerate exponentially with temperature increases',
    'Thermal conductivity of oil is approximately 10x that of air, resulting in faster heat transfer',
    'Hydrogen bonding in starches breaks under heat, allowing water absorption and swelling',
    'Protein molecules unfold (denature) and reform into new structures during heating',
    'Oil quality changes as polar compounds increase with repeated use',
    'Oil degradation accelerates with temperature, time, and presence of food particles',
    'Bubble formation and movement around food enhances heat and mass transfer',
    'Heat shock creates rapid expansion that affects cellular structures',
    'Food moisture creates localized cooling effect around items being fried'
  ],
  
  modernVariations: [
    'Air frying (convection with minimal oil coating)',
    'Vacuum frying (lower temperature, reduces acrylamide formation)',
    'Pressure frying (faster cooking, juicier results, used for fried chicken)',
    'Double frying technique (Korean/French methods for extra crispiness)',
    'Flash frying (extremely high heat, minimal time for delicate items)',
    'Cold oil frying (starting food in cold oil, reduces oil absorption)',
    'Oil-water emulsion frying (reduces fat content)',
    'Ultrasonic-assisted frying (improved texture, reduced oil uptake)',
    'Nitrogen gas-assisted frying (more uniform bubbles, crispier texture)',
    'Electrostatic coating (more uniform breading application)',
    'Centrifugal frying (spinning to remove excess oil immediately)',
    'Microwave-assisted frying (pre-cooking interior before frying)',
    'Oil-free microwave frying (using specific receptacle technologies)',
    'Superheated steam frying (combines steaming and frying principles)',
    'Oil blending technologies (modified thermal properties and health profiles)',
    'Multilayer coating systems (engineered moisture barriers)',
    'Enzyme-modified batters (improved adhesion and texture development)',
    'Infusion frying (incorporating flavors into the frying medium)',
    'Pulsed electric field pre-treatment (cellular modification before frying)',
    'Nanoemulsion technologies (reduced oil uptake with modified interfaces)'
  ],
  
  sustainabilityRating: 0.40, // Higher energy usage, oil disposal issues
  
  equipmentComplexity: 0.60, // Moderate complexity with temperature control needs
  
  healthConsiderations: [
    'Higher fat content due to oil absorption (5-40% by weight)',
    'May create acrylamide at high temperatures (potential carcinogen)',
    'Can be modified with healthier oils (higher in unsaturated fats)',
    'Proper temperature reduces oil absorption (too low = greasy food)',
    'Minimal water-soluble nutrient loss compared to boiling',
    'Trans fat formation possible with repeated oil use at high temperatures',
    'Possible formation of advanced glycation end products (AGEs)',
    'Oil filtration and proper storage extends oil life and quality',
    'Some studies suggest consuming fried foods 4+ times per week increases health risks',
    'Some nutrients become more bioavailable through frying process',
    'Polar compounds increase with repeated oil use (linked to adverse health effects)',
    'Fat-soluble vitamins may be better preserved than water-soluble vitamins',
    'Pre-treatments (blanching, coating) can reduce acrylamide formation',
    'Oil type significantly impacts health profile (omega ratio, saturated fat content)',
    'Breading and batters increase carbohydrate content and glycemic load',
    'Heterocyclic amines may form in protein-rich foods at high temperatures',
    'Effects on gut microbiome differ from other cooking methods',
    'Carotenoid bioavailability often increases through fat incorporation',
    'Oxidative stability of oil affects downstream health implications',
    'Shorter frying times generally produce healthier outcomes'
  ],
  
  /**
   * Alchemical aspect - Calcination Pillar (#7)
   * 
   * Frying is associated with the Calcination pillar in alchemy,
   * which represents the reduction of a substance through intense heat.
   * 
   * Alchemical Effects: Increases Essence and Matter, decreases Spirit and Substance
   * Planetary associations: Mars (energy, heat) and Saturn (structure, boundaries)
   * Tarot associations: Tower (transformation), King of Wands (mastery of fire)
   * Elemental associations: Primary - Fire, Secondary - Earth
   */
  alchemicalAspects: {
    pillarName: 'Calcination',
    pillarNumber: 7,
    alchemicalProcess: 'Transformation through intense heat that breaks down original structures and builds new ones',
    effects: {
      spirit: -1,      // Decreases spiritual essence through intense transformation
      essence: 1,      // Increases essential qualities and concentrated flavors
      matter: 1,       // Increases material substance and structural stability
      substance: -1    // Decreases raw substance through dehydration and breakdown
    },
    symbolicMeaning: 'Represents the purifying fire that burns away impurities and transforms raw materials into more refined substances, paralleling how frying transforms raw ingredients into more flavorful and texturally complex foods',
    associatedElements: {
      primary: 'Fire',
      secondary: 'Earth'
    }
  },
  
  expertTips: [
    'Use fine table salt for immediate post-fry seasoning (adheres better than coarse salt)',
    'For extra-crispy batter, add a small amount (1 tsp per cup) of rice flour or cornstarch',
    'Double-bread items with a rest period between coatings for thicker, more substantial crust',
    'Add a small amount of baking powder to dry coatings for increased bubbling and surface area',
    'For extremely crisp results, replace 10-20% of water in batter with vodka (evaporates faster)',
    'When deep-frying large batches, maintain oil temperature with small additions between batches',
    'Use carbonated liquid (beer, seltzer) in batter to create additional bubbles and lightness',
    'Never cover freshly fried foods; steam condenses and destroys crispness',
    'For Korean-style double frying, cool items completely between fryings for structural reinforcement',
    'Pre-blanch starchy vegetables (potatoes) in water to remove excess starch before frying',
    'For delicate fish, dust with rice flour before battering to improve adhesion',
    'Maintain proper "cold chain" in breading station (keep batter cold, work quickly with seafood)',
    'Filter oil through fine mesh and cheesecloth after each use to remove particles',
    'Test oil readiness with wooden chopstick or bread cube (should bubble steadily, not violently)',
    'Drain fried items on wire racks instead of paper towels to prevent steam softening',
    'For tempura, do not overmix batter; lumps create lighter, crispier texture',
    'Add a pinch of bicarbonate of soda to batters for enhanced browning',
    'When frying doughs, proof until just underproofed (they expand considerably during frying)',
    'For flavor infusion, filter and cool oil, then steep with herbs, spices, or aromatics',
    'Apply glazes or sauces immediately after draining for better adherence',
    'For sweet batters, add a small amount of ground nori or MSG to enhance flavor dimensionality'
  ],
  
  ingredientPreparation: {
    'breading': 'Use standard flour-egg-crumb method, pressing crumbs firmly for adhesion. Rest breaded items 20-30 minutes in refrigerator before frying to set coating. For extra crispness, add 10-20% cornstarch to flour. For Southern-style coating, use buttermilk instead of eggs and season flour heavily.',
    'batter': 'Keep ingredients cold to inhibit gluten development. For tempura, use ice water and minimal mixing for lumps. For beer batter, use 1:1 ratio of flour to cold beer, add 1 tbsp cornstarch per cup for crispness. Rest some batters (like Korean pancake batter) but use others immediately (tempura).',
    'vegetables': 'Cut uniform sizes for even cooking. Blanch dense vegetables briefly. For maximum crispness, soak potatoes for french fries in cold water for 1-2 hours to remove starch, then thoroughly dry. Salt vegetables with high water content 30 minutes before frying to draw out moisture.',
    'seafood': 'Pat completely dry before coating. For squid/calamari, soak in buttermilk for 30 minutes to tenderize. For delicate fish, use light tempura rather than heavy breading. Keep shellfish very cold until the moment of cooking.',
    'chicken': 'For Southern fried chicken, brine with 3% salt solution for 4-12 hours. For boneless pieces, pound to uniform thickness. For Korean fried chicken, remove as much skin fat as possible for better crispiness in second frying.',
    'dough': 'For donuts, proof until doubled but still firm. For churros, cook dough before piping to develop structure. For beignets, refrigerate dough for easier handling. For fritters, fold in ingredients gently to maintain air pockets.',
    'coatings': 'For panko breadcrumbs, toast lightly before use for enhanced crispiness. For gluten-free coatings, combine rice flour, cornstarch, and potato starch. For flavor enhancement, add powdered dried mushrooms, seaweed, or toasted ground spices to dry coatings.',
    'spice_infusions': 'For flavor-infused frying oil, heat gently with whole spices (star anise, cinnamon, bay), then strain and cool before using. For Indian pakoras, add toasted and ground spices directly to gram flour batter.',
    'dairy': 'For fried cheese, freeze briefly for 15-20 minutes before coating. For ice cream frying, freeze hard for at least 4 hours, then dip in batter with additional egg whites for quick-setting crust.',
    'pre_cooking': 'For twice-cooked methods, par-fry at lower temperature (325-335°F) until items are cooked but not browned, cool completely, then finish at higher temperature (365-375°F) for service.'
  },
  
  timingConsiderations: {
    'rest_before': 'Allow breaded/battered items to rest 15-30 minutes for coating adhesion. Bring refrigerated items to cool room temperature (except ice cream/frozen items). For large proteins, temper for 30-60 minutes before frying.',
    'cooking_duration': 'Small items (2-3 minutes), medium items (4-7 minutes), bone-in chicken pieces (12-14 minutes). Starchy items like potatoes require double frying with cooling period between stages. Temperature affects timing - higher temperature generally means shorter cook time.',
    'rest_after': 'Allow 1-2 minutes on rack for excess oil drainage. Season immediately after removal from oil. For large items, rest 5 minutes before serving to allow residual heat to complete cooking without oil contact.',
    'oil_recovery': 'Allow 30-60 seconds between batches for oil temperature to recover. For continuous frying, adjust heat higher between additions. Use smaller batches for better temperature maintenance.',
    'storage_considerations': 'Most fried items deteriorate rapidly; consume within 15-30 minutes of cooking. For maintaining crispness during holding, use warming oven with rack (never covered or stacked). Some items (Korean fried chicken) can be refrigerated and refried successfully.',
    'service_window': 'Optimal texture and flavor peak at 2-5 minutes after draining. Crispy coatings begin degrading immediately, accelerating after 15 minutes. Timing of sauce application affects texture duration (immediate saucing shortens crisp window).'
  },
  
  doneness_indicators: {
    'color': 'Golden brown for most items; medium amber for tempura; deep golden for breaded items. Color development accelerates rapidly at final cooking stage - remove items when slightly lighter than desired final color.',
    'surface_texture': 'Firm, crisp exterior with audible crackling sound when pressed lightly. Bubbling around food diminishes as moisture content decreases. Surface appears dry rather than oily.',
    'internal_temperature': 'Chicken (165°F), fish (145°F), vegetables (internal temperature with slight resistance), doughs (190-200°F for complete cooking).',
    'float_test': 'Many items rise to surface when done due to moisture loss and structural changes. Donuts and similar doughs should float immediately when ready to flip.',
    'bubble_activity': 'Vigorous bubbling indicates moisture release; diminished bubbling signals reduced moisture and approaching doneness. Complete cessation of bubbling often indicates overcooked state.',
    'sound_changes': 'Bubbling sound decreases in volume and frequency as moisture content decreases. Distinctive quieting of oil indicates approaching doneness.',
    'visual_cues': 'For tempura, batter turns semi-transparent and crisp. For breaded items, coating develops small surface bubbles when perfectly done. For churros, surface ridges develop golden highlights while valleys remain lighter.',
    'structural_integrity': 'Properly fried items maintain shape when lifted from oil. Coatings adhere firmly without detachment. Battered items develop rigid shell that maintains form.'
  },
  
  ingredientInteractions: {
    'protein_fat': 'Proteins in meat or fish contract with heat, potentially ejecting moisture into hot oil. Higher fat content meats remain juicier as fat slowly renders, basting internally. Skin-on proteins develop better texture than skinless due to fat layer protection.',
    'starch_oil': 'Starch gelatinizes in the presence of moisture, then dehydrates in hot oil creating crisp structure. Rice flour produces distinctly different texture than wheat flour due to amylose/amylopectin ratio differences. Pre-gelatinized starches (par-cooked potatoes) create superior texture in final frying.',
    'sugar_heat': 'Sugars caramelize rapidly in frying temperatures, creating distinctive flavors. High-sugar batters brown excessively fast; requiring lower temperature frying (325-335°F). Simple sugars promote more browning than complex carbohydrates.',
    'acid_protein': 'Acids in marinades or batters (buttermilk, vinegar) break down proteins, creating tenderness but potentially affecting coating adhesion. Acid-modified proteins cook faster than untreated proteins.',
    'alcohol_water': 'Alcohol in batters (beer, vodka) evaporates more rapidly than water, creating additional crispness through faster moisture removal. Lower boiling point creates more violent initial steam reaction.',
    'salt_timing': 'Salt applied before frying draws out moisture, potentially improving crispness but affecting juiciness. Salt applied immediately after frying adheres better due to residual oil surface. Salt in batter or coating must be balanced against post-cooking salting.',
    'coating_moisture': 'Dry-wet-dry standard breading procedure creates multiple layers that expand differently during frying. Egg proteins in middle layer coagulate, binding inner and outer coatings. Double-coating with setting time between applications creates significantly thicker crust.',
    'leavening_expansion': 'Chemical leaveners (baking powder) or biological agents (yeast) create carbon dioxide bubbles that expand dramatically in hot oil. Pre-expansion through fermentation or whipping creates initial air cells that further expand during frying.',
    'oil_quality_changes': 'Fresh oil has different frying characteristics than used oil. Moderate use (3-4 times) often improves flavor development in certain applications. High-polyunsaturated oils degrade faster than more saturated fats during repeated use.'
  },
  
  technicalNotes: {
    'oil_characteristics': {
      'smoke_point': 'Temperature at which oil begins breaking down and producing acrid smoke and flavors. Peanut (450°F), canola (400°F), sunflower (450°F), rice bran (450°F), clarified butter (450°F), refined coconut (450°F).',
      'flavor_neutrality': 'Some oils impart distinctive flavors (olive, sesame, coconut) while others remain relatively neutral (canola, sunflower, peanut). Match oil flavor profile to application.',
      'stability': 'Resistance to oxidation during repeated heating. Monounsaturated fats (olive, peanut) generally more stable than polyunsaturated (soybean, corn). Antioxidants in some oils (rice bran) enhance stability.',
      'cooling_rate': 'Oils cool at different rates due to specific heat capacity differences. Higher viscosity oils (palm, coconut) maintain temperature longer than thinner oils.',
      'oil_blending': 'Combining oils can optimize properties: high-heat tolerance oils with flavor-enhancing oils. Common commercial blend: 80% neutral oil with 20% flavor-enhancing oil.'
    },
    'batter_science': {
      'gluten_development': 'Minimal gluten development desired for most batters. Inhibited by: minimal mixing, cold temperature, alcohol addition, fat incorporation, acid addition, or substituting non-gluten flours.',
      'carbonation': 'Carbon dioxide bubbles create nucleation sites for steam formation, resulting in lighter texture. Most effective when batter used immediately after mixing with carbonated liquid.',
      'protein_content': 'Higher protein flours (bread flour) create stronger but potentially tougher coating; lower protein flours (cake flour) create more delicate coating.',
      'viscosity': 'Thicker batters create thicker coatings but may trap more steam; thinner batters create lacier, crispier coatings. Optimal viscosity depends on application: thin for tempura, moderate for fish, thick for fritters.',
      'temperature_effects': 'Cold batter creates more contrast between exterior and interior temperatures, generating more steam pressure and creating crispier results.'
    },
    'equipment_considerations': {
      'thermal_mass': 'Heavier vessels maintain temperature better during food addition. Cast iron retains heat exceptionally well but reacts slowly to temperature adjustments.',
      'heating_element': 'Electric elements provide more consistent heat but respond slowly; gas provides rapid response but may create hot spots. Induction offers precision with rapid adjustment capability.',
      'temperature_recovery': 'Professional equipment recovers temperature within 15-30 seconds; home equipment may take 1-3 minutes to recover after food addition.',
      'vessel_shape': 'Deeper vessels minimize oil surface area (reducing oxidation) but require more oil volume. Wider vessels improve capacity but increase surface oxidation.',
      'filtration_capabilities': 'Integrated filtration systems extend oil life by removing food particles that accelerate degradation. Double-filtration (coarse then fine) most effective.'
    },
    'physical_transformations': {
      'moisture_barrier': 'Steam released from food creates protective barrier temporarily limiting oil absorption. Most oil absorption occurs during cooling phase as steam pressure subsides.',
      'crust_formation': 'Progressive dehydration and protein coagulation creates semi-permeable barrier with specific textural properties. Rate of formation affects final structure.',
      'bubble_mechanics': 'Smaller, more numerous bubbles create more uniform heat transfer. Bubble size affected by oil viscosity, temperature, surface tension, and impurity content.',
      'cooling_dynamics': 'Rapid cooling after removal from oil creates increased oil absorption as vacuum effect draws oil into microstructure. Draining at higher temperature reduces final oil content.',
      'structural_expansion': 'Thermal expansion combined with steam pressure creates substantial volume increase in many fried items. Expansion rate influences final texture; too rapid causes structural failure.'
    }
  }
}; 