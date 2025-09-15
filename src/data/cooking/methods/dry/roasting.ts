import type { CookingMethodData } from '@/types/cookingMethod';
import type { ZodiacSign, ThermodynamicProperties } from '@/types/shared';

/**
 * Roasting cooking method
 *
 * Cooking food with dry heat in an oven or over fire, creating caramelization and browning
 */
export const roasting: CookingMethodData = {;
  name: 'roasting',
  description:
    'Cooking food with dry heat in an oven or over a fire, typically uncovered, creating flavorful browning and caramelization on the exterior while keeping the interior moist',
  elementalEffect: {
    Fire: 0.6,
    Air: 0.2,
    Earth: 0.2,
    Water: 0.0
  },
  duration: {
    min: 15,
    max: 240
  },
  suitable_for: [
    'meat',
    'poultry',
    'fish',
    'vegetables',
    'nuts',
    'seeds',
    'fruits',
    'coffee beans'
  ],
  benefits: [
    'enhances flavor through browning',
    'creates texture contrast',
    'renders fat',
    'tenderizes tough cuts',
    'concentrates flavors',
    'creates appetizing aromas'
  ],
  astrologicalInfluences: {
    favorableZodiac: ['aries', 'leo', 'sagittarius'] as any[],
    unfavorableZodiac: ['pisces', 'cancer', 'scorpio'] as any[],
    dominantPlanets: ['Sun', 'Mars', 'Jupiter'],
    lunarPhaseEffect: {
      full_moon: 1.1, // Slight enhancement
      new_moon: 0.9, // Slight reduction
      waning_gibbous: 1.2, // Enhanced browning
      waxing_crescent: 0.8, // Reduced flavor development
    },
    rulingPlanets: ['Mars', 'Sun']
  },
  toolsRequired: [
    'Oven or fire source',
    'Roasting pan/sheet with rack',
    'Digital meat thermometer',
    'Kitchen twine (for trussing)',
    'Basting brush or bulb',
    'Fat separator for drippings',
    'Carving board with juice groove',
    'Instant-read thermometer',
    'Heavy-duty aluminum foil',
    'Roasting bags (optional)',
    'Cast iron skillet (for searing and finishing)',
    'Basting spoon (for continuous flavor addition)',
    'Butcher paper (for resting large cuts)',
    'Probe thermometer with alarm function',
    'Culinary torch (for finishing and spot caramelization)'
  ],
  commonMistakes: [
    'Oven too hot (causing outer burning before interior cooks)',
    'Not resting meat after roasting (leading to dry texture and juice loss)',
    'Overcrowding the pan (creates steam instead of browning)',
    'Inconsistent piece sizes (results in uneven cooking)',
    'Incorrect temperature monitoring (relying on time only)',
    'Opening the oven door too frequently (causing temperature fluctuations)',
    'Not preheating the oven sufficiently',
    'Roasting cold meat straight from refrigerator',
    'Improper seasoning timing (salt too close to cooking time)',
    'Neglecting to truss irregular shapes (causing uneven cooking)',
    'Basting too frequently (cooling the oven/food)',
    'Using a pan that's too small (restricting airflow)',
    'Placing food directly on pan without rack (preventing heat circulation)',
    'Adding vegetables too early (causing overcooking)',
    'Cutting into meat without proper resting period'
  ],
  pairingSuggestions: [
    'Herb-infused pan sauces from deglazed drippings',
    'Acidic components to cut richness (lemon, vinegar, capers)',
    'Complementary spice rubs with balanced sweet/savory/pungent elements',
    'Root vegetable accompaniments roasted in the same pan',
    'Wine or stock reductions concentrated with roasting juices',
    'Compound butters melting over hot roasted items',
    'Pickled garnishes for brightness contrast',
    'Umami-rich glazes (miso, soy, mushroom)',
    'Smoked salt finishing for enhanced flavor depth',
    'Fermented accompaniments for probiotic contrast',
    'Fresh herb oils drizzled post-roasting',
    'Contrasting temperatures (cold sauces with hot roast)',
    'Textural variations (crispy elements with tender roast)'
  ],
  nutrientRetention: {
    proteins: 0.85,
    fats: 0.7, // Some lost through rendering
    minerals: 0.9,
    vitamins: 0.7,
    antioxidants: 0.75,
    'water-soluble': 0.65,
    'fat-soluble': 0.8,
    polyphenols: 0.65, // Plant antioxidants
    carotenoids: 0.85, // Enhanced bioavailability in some cases
    thiamin: 0.6, // Heat-sensitive B vitamin
    riboflavin: 0.75, // More stable B vitamin
    folate: 0.55, // Heat-sensitive B vitamin
    vitamin_c: 0.5, // Heat and oxidation sensitive
    iron: 0.95, // Highly stable mineral
  },
  optimalTemperatures: {
    whole_chicken: 375, // °F, cook to internal temp of 165°F
    turkey: 325, // °F, cook to internal temp of 165°F
    beef_prime_rib: 225, // °F for first phase, then 500°F for final sear
    beef_tenderloin: 425, // °F, cook to internal temp of 125°F for medium-rare
    pork_loin: 350, // °F, cook to internal temp of 145°F
    lamb_leg: 325, // °F, cook to internal temp of 135°F for medium-rare
    root_vegetables: 425, // °F, until fork-tender and caramelized edges
    fish_whole: 400, // °F, cook to internal temp of 135°F
    nuts_seeds: 325, // °F, until fragrant and golden
    coffee_beans: 350, // °F, varies by desired roast level
    duck: 300, // °F for rendering, then 425°F for crisping
    vegetables_leafy: 400, // °F, until crisp-tender
    vegetables_cruciferous: 425, // °F, until edges brown and interior softens
    fruits_stone: 375, // °F, until caramelized and tender
    game_meats: 275, // °F, lower temperature for wild game to prevent toughening
    goat: 325, // °F, similar to lamb but benefits from slightly lower temp
    venison: 325, // °F, lean meat requires careful temperature monitoring
    veal: 325, // °F, more delicate than beef, requiring gentler heat
    pork_belly: 300, // °F, for proper fat rendering without drying meat
    bison: 250, // °F, extremely lean, requiring lower temp than beef
    quail: 450, // °F, small birds need high heat for short duration
    pheasant: 375, // °F, game bird with moderate fat requiring medium-high heat
  },
  regionalVariations: {
    mediterranean: [
      'herb-infused olive oil roasting',
      'spit roasting with lemon and oregano',
      'clay pot roasting'
    ],
    french: [
      'high-temperature poultry roasting (poulet rôti)',
      'en cocotte with aromatics',
      'gigot d'agneau (leg of lamb with garlic)'
    ],
    chinese: [
      'char siu technique with honey glaze',
      'Peking duck roasting with air-dried skin',
      'clay oven roasting'
    ],
    south_american: [
      'churrasco with rock salt crust',
      'pachamanca earth oven roasting',
      'chicha-marinated roasts'
    ],
    middle_eastern: [
      'slow roasted lamb with sumac and za'atar',
      'pomegranate-glazed poultry',
      'saffron-infused roasting'
    ],
    northern_european: [
      'beer-basted pork roasts',
      'juniper and caraway seed crusting',
      'apple-stuffed game birds'
    ],
    indian: [
      'tandoor roasting with yogurt marinades',
      'whole spice crusting',
      'ghee-basted roasting'
    ],
    japanese: [
      'houba-yaki (magnolia leaf-wrapped roasting)',
      'shichirin charcoal roasting',
      'fish salt-crusting'
    ],
    korean: [
      'ttukbaegi bulgogi (ceramic pot roasting)',
      'gochujang-glazed meats',
      'ssam-style leaf wrapping'
    ],
    southeast_asian: [
      'banana leaf wrapped roasting',
      'lemongrass stuffed proteins',
      'coconut shell smoking-roasting'
    ],
    african: [
      'berbere-spiced slow roasting',
      'piri-piri fire roasting',
      'mechoui (pit roasting whole animals)'
    ],
    caribbean: [
      'jerk technique with pimento wood',
      'rum-soaked fruit roasting',
      'citrus-marinated pit roasting'
    ]
  },
  chemicalChanges: {
    maillard_reaction: true, // Non-enzymatic browning between amino acids and reducing sugars
    caramelization: true, // Direct heating of sugars creating complex flavor compounds
    fat_rendering: true, // Conversion of solid fats to liquid, carrying flavors
    protein_denaturation: true, // Reconfiguration of protein structures affecting texture
    pyrolysis: true, // Decomposition of compounds through intense heat
    moisture_migration: true, // Movement of water from interior to surface
    collagen_hydrolysis: true, // Conversion of tough collagen to gelatin in long roasts
    lipid_oxidation: true, // Development of flavor compounds from fat transformation
    aromatic_volatilization: true, // Release of volatile flavor compounds
    starch_gelatinization: true, // In vegetables and fruits containing starch
    mineral_concentration: true, // Concentration of minerals as moisture is lost
    enzyme_inactivation: true, // Heat deactivation of enzymes that cause deterioration
    vitamin_degradation: true, // Reduction of heat-sensitive vitamins
  },
  safetyFeatures: [
    'Use internal temperature monitoring for proper doneness (poultry 165°F, ground meat 160°F, whole cuts to desired doneness)',
    'Proper ventilation for smoke and fat vapors',
    'Heat-resistant utensils and protection (silicone or high-temp mitts)',
    'Safe oil temperature management (below smoke point)',
    'Prevention of cross-contamination between raw and cooked foods',
    'Proper storage of leftovers within 2 hours',
    'Careful handling of hot roasting pans to prevent burns',
    'Fire extinguisher readily available for grease fires',
    'Avoiding plastic/non-heat-resistant utensils near heat source',
    'Regular oven maintenance to prevent carbon monoxide issues',
    'Using dedicated cutting boards for raw and cooked proteins',
    'Sanitizing thermometers between temperature checks',
    'Ensuring sufficient clearance around heating equipment'
  ],
  thermodynamicProperties: {
    heat: 0.75, // High heat application
    entropy: 0.6, // Moderate-high structural transformations
    reactivity: 0.8, // High chemical reactivity (significant Maillard)
    gregsEnergy: -0.55, // Calculated using heat - (entropy * reactivity), // Calculated using heat - (entropy * reactivity)
  } as ThermodynamicProperties,

  // Additional metadata
  history:
    'Roasting is one of humanity's oldest cooking methods, dating back to the discovery of fire approximately 1.8 million years ago. Archaeological evidence shows spit roasting was common in ancient civilizations throughout Mesopotamia, Egypt, and China. Medieval Europe developed sophisticated roasting techniques, including specialized turnspits operated by servants or even dogs. The 18th century saw innovations like the tin reflector oven, while the 19th century brought reliable temperature-controlled roasting in cast iron stoves. The development of gas and electric ovens in the 20th century standardized roasting temperatures, while the late 20th and early 21st centuries have seen a renewed interest in traditional methods including wood-fired ovens, rotisserie cooking, and precision temperature control with digital technology.',

  scientificPrinciples: [
    'Maillard reaction creates hundreds of flavor compounds at 280°F-330°F through amino acid-sugar interactions',
    'Caramelization of sugars occurs at 320°F-360°F, forming new aromatic compounds',
    'Radiant heat transfer from oven walls to food surface creates gradient cooking',
    'Fat rendering at 130°F-200°F carries flavor compounds and promotes juiciness',
    'Dehydration of surface creates flavor concentration and textural contrast',
    'Collagen conversion to gelatin begins at 160°F in moist heat environments',
    'Convection currents in heated air circulate to promote even cooking',
    'Heat shock proteins activated at specific temperatures contribute to texture changes',
    'Aromatic compound volatilization creates enticing smells during cooking',
    'Thermal conductivity variations between food components create temperature gradients',
    'Water activity reduction through evaporation concentrates flavor compounds',
    'Protein coagulation occurs at different temperatures: myosin at 122°F, collagen at 160°F, actin at 180°F',
    'Surface dehydration creates moisture barrier, trapping interior moisture',
    'Enzymatic activity accelerates until deactivation at specific temperature thresholds'
  ],

  modernVariations: [
    'Reverse searing (low temperature cooking to doneness, then high-heat finish for crust)',
    'Sous vide followed by high-heat roasting for precise doneness control',
    'Controlled humidity roasting environments (combi ovens with steam injection)',
    'Salt-crusted roasting for extreme moisture retention',
    'Cold smoking followed by roasting for complex flavor development',
    'Air fryer roasting for accelerated cooking with less oil',
    'Precision temperature-controlled roasting using PID systems',
    'Rotisserie roasting with continuous basting action',
    'Infusion roasting with aromatic woods and herbs',
    'Kamado ceramic grill-roasting for heat stability and smoke infusion',
    'Computerized probe monitoring with automatic temperature adjustment',
    'Flash roasting at extremely high temperatures (700°F+) for rapid exterior development',
    'Dry-aged roasting leveraging enzymatic pre-tenderization',
    'Ultrasonic tenderization before roasting for improved texture',
    'Liquid nitrogen pre-treatment for crisp exterior development'
  ],

  sustainabilityRating: 0.6, // Moderate energy usage over extended periods

  equipmentComplexity: 0.4, // Basic to moderate equipment needs

  healthConsiderations: [
    'Fat rendering can reduce total fat content compared to raw ingredients',
    'High temperatures may create heterocyclic amines and polycyclic aromatic hydrocarbons',
    'Potential nutrient loss through long cooking, particularly water-soluble vitamins',
    'Antioxidant development in some foods through Maillard reaction products',
    'Can be adjusted for healthier preparation (less oil, lower temp, shorter times)',
    'Acrylamide formation possible in starchy foods roasted at high temperatures',
    'Roasting nuts increases bioavailability of certain nutrients',
    'Roasted vegetables often have higher consumption rates due to enhanced flavor',
    'Lower fat retention compared to frying methods',
    'Potential formation of advanced glycation end products (AGEs) at high temperatures',
    'Enhanced mineral bioavailability in some vegetables through matrix breakdown',
    'Phytochemical changes can either enhance or reduce health benefits',
    'Reduced need for sodium compared to other cooking methods due to flavor development',
    'Fat-soluble vitamin preservation better than water-soluble vitamins'
  ],

  expertTips: [
    'Dry brine large cuts with salt 24-48 hours before roasting for improved moisture retention and flavor penetration',
    'Create a three-zone fire for outdoor roasting: hot zone for searing, medium zone for cooking, cool zone for resting',
    'Let meats come to room temperature for 30-60 minutes before roasting to ensure even cooking',
    'When roasting whole poultry, start breast-side down and flip halfway through for even cooking',
    'Use a V-rack for meats to allow air circulation and prevent sogginess on the bottom',
    'For perfect crackling on pork, ensure the skin is completely dry before roasting and score in a diamond pattern',
    'Add liquid to the bottom of the roasting pan when cooking large cuts to maintain humidity and create sauce base',
    'Rest roasted meats on a warm plate tented with foil for approximately 10 minutes per pound',
    'For crisp-skinned poultry, air-dry uncovered in refrigerator for 12-24 hours before roasting',
    'Brush fruits or vegetables with a mixture of oil and honey for enhanced caramelization',
    'For even cooking of irregular cuts, truss or use skewers to create a uniform shape',
    'Add aromatic vegetables beneath roasting meats in the last 30-45 minutes to capture drippings',
    'Use a two-temperature method for large cuts: start high (450°F) for 20 minutes, then reduce (325°F) until done',
    'Shield thin areas of poultry (wingtips, legs) with foil to prevent burning',
    'Apply glazes in the final 15-20 minutes to prevent burning',
    'For whole birds, separate the skin from the breast meat and insert compound butter directly against the meat',
    'When roasting vegetables, preheat the baking sheet for enhanced browning',
    'Apply different herbs at different stages: woody herbs (rosemary, thyme) from the beginning, tender herbs (parsley, basil) after cooking',
    'Use a torch for finishing under-browned areas without additional cooking',
    'For juicier meat, roast bone-in and skin-on whenever possible'
  ],

  ingredientPreparation: {
    beef: 'Remove from refrigerator 1-2 hours before cooking; dry thoroughly with paper towels; season liberally with salt (1 tsp per pound) 24 hours before cooking. For prime rib, request bone-in, tied but bone cut away from meat for carving ease. Apply coarse black pepper just before roasting. For tenderloin, consider tying at intervals to maintain even shape.',
    poultry:
      'Spatchcock for even cooking; dry brine with salt 12-24 hours in advance; air-dry uncovered in refrigerator overnight for crisp skin. For whole birds, loosen skin and apply butter or herb paste between skin and meat. For turkey, consider removing legs and cooking separately from breast. Truss or clip wings behind back to prevent burning.',
    vegetables:
      'Cut to uniform size (approximately 1-inch pieces); toss with oil and seasonings; arrange in single layer with space between pieces. For dense root vegetables, consider par-boiling for 5-10 minutes before roasting. For high-sugar vegetables like carrots, add a pinch of baking soda to water for faster caramelization. Group vegetables by cooking time on separate trays.',
    nuts: 'Toss raw nuts with small amount of oil and salt; spread in single layer; shake pan every 5 minutes during roasting. Consider soaking in salted water for 30 minutes and drying before roasting for enhanced flavor penetration. For sweet applications, coat lightly with egg white whisked with water before adding sugar or spices.',
    pork: 'For crackling, score skin in diamond pattern; rub with salt and allow to dry uncovered in refrigerator overnight; pat completely dry before roasting. For tenderloin, remove silverskin completely. For shoulder/butt cuts, consider overnight brining. For ribs, remove membrane from bone side. For chops, brine for 4 hours, dry thoroughly.',
    lamb: 'Make incisions and insert garlic slivers and herb sprigs; season with salt and allow to rest uncovered for 2-4 hours before cooking. For leg, tunnel bone for even cooking or butterfly for faster roasting. For rack, french the bones and create uniform thickness. For shoulder, consider slow roasting at 275°F for 4-5 hours.',
    fish: 'Score skin to prevent curling; stuff cavity with aromatics; brush with oil; use parchment or foil sling for easy removal. For whole fish, ensure scales and gills are removed. For fillets, place skin-side down on preheated pan. For delicate white fish, create herb crust for protection. For oily fish, reduce oven temperature by at least 25°F.',
    fruits:
      'Remove pits or cores; cut into uniform pieces; toss with small amount of sugar and spices to enhance caramelization. For apples and pears, treat with lemon water to prevent browning. For stone fruits, roast cut-side up initially, then flip for final caramelization. For citrus, leave peel on for aromatic oils. For bananas, leave in peel and slit one side.'
  },

  timingConsiderations: {
    rest_before:
      'Bring refrigerated meats to room temperature for 30-60 minutes; season 1-48 hours in advance depending on size. Whole poultry: 1 hour per 4 pounds. Roasts: 1 hour per 5 pounds. Vegetables and fruits require no rest period before roasting.',
    rest_after:
      'Rest beef and lamb 10-20 minutes; poultry 15-30 minutes; pork 10-15 minutes to allow juice redistribution. For large prime rib (5+ pounds), rest up to 30-45 minutes in warm area. For tenderloins, 8-10 minutes is sufficient. Tent with foil but don't seal completely to prevent steam softening the crust.',
    carryover_cooking:
      'Internal temperature will rise 5-10°F for small cuts, 10-15°F for large roasts during resting period. Poultry breasts: 5-10°F rise. Beef rib roast: 10-15°F rise. Pork loin: 5-10°F rise. Fish: minimal rise of 2-5°F. Account for this by removing from heat when temperature reads 5-15°F below target.',
    temperature_adjustment:
      'Reduce oven temperature by 25°F when using convection; increase by 25°F when cooking multiple items. Glass or dark metal pans: reduce by 25°F. High altitude (3,000+ feet): increase by 25°F and extend time by 5-10%.',
    timing_by_weight:
      'Calculate roasting time by weight: beef (rare) 15 min/lb, poultry 20 min/lb, pork 20 min/lb at standard temperatures. Precise timing varies by thickness rather than weight: 2-inch thick cuts require different timing than thin, flat cuts of same weight.',
    seasonal_adjustment:
      'Reduce cooking time for summer vegetables by 15%; increase for winter vegetables by 10%. Adjust for humidity: drier environments may require lower temperatures or shorter times. Higher ambient humidity may require extended cooking times.'
  },

  doneness_indicators: {
    beef_rare:
      'Internal temperature 125°F; soft when pressed; bright red center. Finger test: feels like the base of thumb when thumb and index finger make an 'OK' sign. Color is purple-red and warm rather than cool.',
    beef_medium:
      'Internal temperature 135°F; slight resistance when pressed; pink center. Finger test: feels like base of thumb when thumb and middle finger make an 'OK' sign. Color is rosy pink throughout with barely visible fibers.',
    beef_well:
      'Internal temperature 150°F; firm when pressed; brown throughout. Finger test: feels like base of thumb when thumb and pinky make an 'OK' sign. No pink visible and meat fibers are clearly defined.',
    poultry:
      'Internal temperature 165°F in thigh; juices run clear; leg moves easily in socket. Probe inserted between thigh and body should meet minimal resistance. For breast, 155°F with rest will achieve safety while maintaining juiciness.',
    pork: 'Internal temperature 145°F with 3-minute rest; slightly pink center is safe and optimal. Modern pork is safe at lower temperatures than historically recommended. Texture should be firm but yield to gentle pressure.',
    lamb_medium_rare:
      'Internal temperature 130-135°F; springy when pressed; pink center. Color should be rosy with clear juice. For shoulder cuts, 175°F for proper collagen breakdown.',
    vegetables:
      'Fork easily pierces with slight resistance; caramelized edges; vibrant color remains. Edges should show browning but centers should maintain integrity. Green vegetables should remain bright rather than olive-colored.',
    fish: 'Internal temperature 135-140°F; flesh flakes easily but remains moist; opaque throughout. White fish should separate into clear flakes when gentle pressure applied. Oily fish should maintain translucence without appearing raw.',
    nuts: 'Golden brown color; aromatic fragrance; crisp texture when cooled. Will continue to darken and crisp after removal from heat due to residual heat. Should be removed when slightly lighter than desired final color.',
    game_meats:
      'Internal temperature 135-140°F for medium-rare; firmer texture than farmed meats; slightly sweeter aroma. Wild game should never be cooked beyond medium due to low fat content.',
    liver:
      'Internal temperature 140-145°F; center slightly pink; firm but not rigid texture. Overcooked liver becomes grainy and bitter.',
    duck_breast:
      'Internal temperature 135°F; rendered fat on skin side; crisp skin with cross-hatch scoring. Should have visible rendering of subcutaneous fat layer and minimal resistance when sliced.'
  },

  ingredientInteractions: {
    fats_and_aromatics:
      'Fat absorbs and distributes flavor compounds from herbs and spices; baste regularly to enhance distribution. Fat-soluble flavor compounds in herbs (thyme, rosemary) infuse more effectively than water-soluble compounds. Choose fats based on smoke point: butter (350°F), olive oil (375-405°F), avocado oil (520°F).',
    acid_and_protein:
      'Acidic marinades (lemon, vinegar, wine) tenderize surface proteins but can tough them if applied too long. Limit acidic marinades to 2 hours for fish, 4 hours for poultry, 12 hours maximum for beef. Post-cooking acid application brightens flavors.',
    sugars_and_heat:
      'Sugary glazes should be applied in final 15-30 minutes to prevent burning. Honey and maple glazes caramelize faster than granulated sugar. Addition of small amount of acid to sweet glazes prevents crystallization. Natural fruit sugars caramelize effectively at 350-375°F.',
    salt_timing:
      'Early salting (12+ hours) for penetration and moisture retention; last-minute salting for crust only. Kosher salt provides better adhesion than table salt. Salt draws out moisture initially, which is reabsorbed with dissolved proteins for enhanced juiciness.',
    alcohol_evaporation:
      'Wine or spirit additions need sufficient time (45+ minutes) for alcohol to fully evaporate. Alcohol content retention: 15 minutes cooking (40% remains), 30 minutes (35%), 1 hour (25%), 2 hours (10%). Deglaze with alcohol after browning to incorporate fond (browned bits).',
    enzyme_reactions:
      'Bromelain in pineapple or papain in papaya break down proteins and can create mushy texture if overused. Limit enzyme marinades to 30 minutes for seafood, 2 hours for poultry, 4 hours for beef. Heat above 158°F deactivates most enzymes.',
    vegetable_density:
      'Root vegetables require pre-roasting before adding less dense vegetables to ensure even cooking. Stagger addition: dense roots first, cruciferous second, tender vegetables last. Alternatively, cut denser vegetables smaller than less dense ones.',
    starchy_vegetable_browning:
      'Parboil starchy vegetables for 5-10 minutes before roasting for enhanced exterior crispness. Adding 1/2 teaspoon baking soda to parboiling water accelerates surface starch breakdown for improved browning. Thoroughly dry parboiled vegetables before oiling and roasting.',
    protein_structure:
      'Different muscle fibers respond uniquely to heat: fast-twitch muscles (breast meat) cook quickly and easily dry out; slow-twitch muscles (legs, shoulders) require slower cooking for collagen conversion.',
    fat_cap_positioning:
      'Place fat cap up for self-basting effect on lean cuts; place cap down on fatty cuts to render into pan for later use. Shield lean areas with bacon or fatback to prevent drying during extended roasting.',
    aromatic_intensity:
      'Dried herbs should be applied before cooking; fresh herbs partition into early additions (woody types) and finishing herbs (tender varieties). Garlic bitter compounds develop after prolonged high-heat exposure; add halfway through for optimal flavor.'
  },

  technicalNotes: {
    surface_preparation: {
      patting_dry:
        'Essential for proper Maillard reaction; removes surface moisture that would otherwise steam rather than brown.',
      scoring:
        'Creates greater surface area for flavor development and fat rendering; critical for duck breast and pork skin.',
      trussing:
        'Creates uniform shape for even cooking; prevents certain areas from overcooking; use cotton twine for temperatures up to 550°F.',
      rack_position:
        'Elevates food for 360° heat circulation; prevents boiling in released juices; improves air flow for crisping.',
      rubbing:
        'Oil provides better heat transfer than dry surface; helps seasonings adhere; creates vapor barrier that retains moisture.',
      torch_finishing:
        'Provides intense surface heat without additional cooking; targets under-developed areas; uses fat as fuel for flavor.'
    },
    meat_science: {
      collagen_conversion:
        'Tough collagen begins breaking down into gelatin at 160°F; requires extended time at this temperature or higher.',
      protein_denaturation:
        'Myosin (122°F), collagen (160°F), actin (180°F) denature at different temperatures, creating textural changes.',
      'Z-line_breakdown':
        'Structural protein junction dissolves with extended cooking, contributing to tenderness.',
      fat_melting_points:
        'Beef fat (110-115°F), pork fat (95-100°F), poultry fat (90-95°F) require different rendering temperatures.',
      myoglobin_states:
        'Deoxymyoglobin (purple-red, raw), oxymyoglobin (bright red, minimal cooking), metmyoglobin (brown, well done).',
      water_binding:
        'Proteins hold water until heated to specific temperatures, after which they contract and release moisture.'
    },
    oven_dynamics: {
      conventional:
        'Heat rises, creating temperature gradient with hottest area near top; requires rotation for even cooking.',
      convection:
        'Fan circulates hot air, reducing cooking time by 25% and creating more uniform environment.',
      gas_vs_electric:
        'Gas provides more humid environment due to combustion byproducts; electric provides drier heat better for crisping.',
      direct_vs_indirect:
        'Direct heat creates more intense surface reactions; indirect allows gentler cooking for large items.',
      thermal_mass:
        'Heavy pans moderate temperature fluctuations, creating more stable cooking environment.',
      hood_ventilation:
        'Proper ventilation removes smoke and steam, improving ambient cooking conditions and preventing off-flavors.'
    },
    flavor_development: {
      maillard_byproducts:
        'Over 1,000 compounds created through Maillard reactions, including pyrazines, furans, and thiazoles.',
      caramelization_stages:
        'Progressive sugar breakdown: simple caramelization (320°F), complex breakdown (338°F), bitter compounds (355°F+).',
      smoke_point_considerations:
        'Fats break down at specific temperatures, creating flavor compounds and potential bitterness.',
      volatile_compound_retention:
        'Enclosed roasting captures volatile aromatics that would otherwise disperse; creates deeper flavor profile.',
      umami_development:
        'Glutamates concentrate through moisture loss, enhancing savory perception.',
      flavor_precursors:
        'Certain molecules require heat transformation to become perceivable flavors; inosinate in meat converts to recognizable 'meaty' flavors.'
    },
    equipment_selection: {
      roasting_pans:
        'Heavy gauge, 3-inch sides ideal; too deep restricts air circulation; too shallow loses juices.',
      rack_types:
        'V-racks center roasts for even exposure; flat racks provide stable surface for multiple items.',
      probe_thermometers:
        'Continuous monitoring prevents door opening; select models with heat-resistant cables to 700°F.',
      pan_materials:
        'Stainless steel with aluminum core provides durability and heat distribution; avoid non-stick for high-temperature roasting.',
      specialized_equipment:
        'Vertical roasters for poultry maximize skin exposure; rotisseries provide continuous basting action.',
      spit_roasting:
        'Continuous rotation creates self-basting effect; proximity to heat source creates unique flavor development.'
    }
  }
};
