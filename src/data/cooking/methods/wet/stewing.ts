import type { ZodiacSign, ThermodynamicProperties } from '@/types/alchemy';
import type { CookingMethodData } from '@/types/cookingMethod';

/**
 * Stewing cooking method
 *
 * Slow cooking ingredients in liquid at low temperature for extended periods
 */
export const stewing: CookingMethodData = {
  name: 'stewing',
  description: 'A slow cooking method where ingredients are submerged in liquid and cooked at a low temperature for extended periods, allowing flavors to meld while gently tenderizing foods. Similar to braising but typically uses smaller, uniform ingredient cuts and more liquid.',
  elementalEffect: {
    Water: 0.6,
    Fire: 0.2,
    Earth: 0.2,
    Air: 0.0
  },
  duration: {
    min: 45, // 45 minutes
    max: 480 // 8 hours
  },
  suitable_for: [
    'tough meat cuts',
    'root vegetables',
    'legumes',
    'fibrous vegetables',
    'large cuts of poultry',
    'game meats',
    'fruit compotes',
    'whole spices',
    'dense seafood',
    'hearty grains'
  ],
  benefits: [
    'flavor concentration',
    'tenderizes tough ingredients',
    'nutrient retention in cooking liquid',
    'develops complex flavors',
    'economical cooking method',
    'minimal attention required',
    'one-pot meal preparation',
    'improves with reheating',
    'enzymatic transformation of proteins',
    'extracts flavor from aromatics'
  ],

  astrologicalInfluences: {
    favorableZodiac: ['cancer', 'scorpio', 'taurus'] as any[],
    unfavorableZodiac: ['aries', 'leo', 'gemini'] as any[],
    dominantPlanets: ['Moon', 'Saturn', 'Neptune'],
    lunarPhaseEffect: {
      full_moon: 1.15, // Enhanced flavor development
      new_moon: 0.9, // Subdued flavor profile
      waxing_crescent: 1.05, // Good for initiating stews
      waning_gibbous: 0.95 // Less optimal
    }
  },
  toolsRequired: [
    'Heavy-bottomed pot with lid',
    'Wooden or silicone spoon',
    'Sharp knife',
    'Cutting board',
    'Measuring cups/spoons',
    'Heat diffuser (optional)',
    'Slow cooker (alternative)',
    'Dutch oven',
    'Ladle',
    'Fine mesh strainer',
    'Fat separator (optional)',
    'Kitchen timer'
  ],

  commonMistakes: [
    'cooking temperature too high',
    'insufficient liquid',
    'overcrowding the pot',
    'ingredients cut irregularly',
    'adding all ingredients simultaneously',
    'insufficient initial browning',
    'lifting lid too frequently',
    'inadequate seasoning layering',
    'not skimming surface impurities',
    'using lean cuts for meat stews',
    'adding delicate ingredients too early',
    'improper thickening technique'
  ],

  pairingSuggestions: [
    'Crusty bread or dumplings',
    'Fresh herb garnishes',
    'Acid components (vinegar, citrus)',
    'Pickled vegetables for contrast',
    'Root vegetable purées',
    'Polenta or creamy grains',
    'Full-bodied red wines',
    'Mashed potatoes',
    'Fresh green salad for contrast',
    'Aromatic rice varieties'
  ],

  nutrientRetention: {
    water_soluble_vitamins: 0.8, // Good - retained in cooking liquid
    fat_soluble_vitamins: 0.9, // Very good
    minerals: 0.95, // Excellent - remain in cooking liquid
    proteins: 0.95, // Excellent transformation
    fiber: 0.9, // Very good
    phytonutrients: 0.85, // Good
    antioxidants: 0.85 // Good - many remain in cooking liquid
  },
  optimalTemperatures: {
    meat_stews: 180, // Low simmer
    vegetable_stews: 185, // Slightly higher
    fruit_compotes: 175, // Lower temperature
    legume_stews: 190, // Higher temperature needed
    seafood_stews: 170, // Lower to prevent toughening
    poultry_stews: 185, // Medium temperature
    browning_stage: 350, // Initial browning temperature
    reduction_phase: 200 // For reducing and concentrating
  },
  regionalVariations: {
    mediterranean: ['ratatouille', 'cioppino', 'bouillabaisse'],
    french: ['beef bourguignon', 'cassoulet', 'coq au vin'],
    middle_eastern: ['tagine', 'ghormeh sabzi', 'harira'],
    indian: ['korma', 'rogan josh', 'dal'],
    east_asian: ['nikujaga', 'galbi jjim', 'hong shao rou'],
    african: ['groundnut stew', 'yassa', 'doro wat'],
    caribbean: ['callaloo', 'pepper pot', 'sancocho'],
    eastern_european: ['goulash', 'bigos', 'cholent'],
    north_american: ['brunswick stew', 'burgoo', 'chili']
  },
  chemicalChanges: {
    protein_denaturation: true,
    collagen_conversion: true,
    maillard_reactions: true,
    caramelization: true,
    gelatinization: true,
    emulsification: true,
    flavor_compound_extraction: true,
    enzymatic_browning: true,
    lipid_oxidation: false,
    starch_gelatinization: true,
    acid_hydrolysis: true,
    pectin_breakdown: true
},
  safetyFeatures: [
    'consistent heat distribution',
    'pathogen elimination through time-temperature combination',
    'natural preservation through reduction',
    'acid development inhibits bacterial growth',
    'reduced risk of burning or scorching',
    'clear visual monitoring of cooking state',
    'reduced splatter compared to high-heat methods',
    'minimal fire risk due to low temperature',
    'ease of maintaining food above danger zone',
    'ability to cool safely in cooking vessel'
  ],

  thermodynamicProperties: {
    heat: 0.35, // Low to moderate heat
    entropy: 0.6, // Significant transformation over time
    reactivity: 0.45, // Moderate chemical reactions
    gregsEnergy: -0.55 // Calculated using heat - (entropy * reactivity)
  } as unknown as ThermodynamicProperties,

  // Additional metadata
  history: 'Stewing has ancient origins dating back to the earliest pottery, approximately 10,000 BCE, when humans first could sustain long cooking periods in liquid. Archaeological evidence shows stewing was common in Mesopotamian, Egyptian, Roman, and Chinese ancient cuisines. Medieval European peasant cooking relied heavily on stewing to tenderize tough meats and extend limited resources. Indigenous cultures worldwide developed stewing techniques using available materials—from earth ovens to clay pots. During the 18th century, advances in cookware and controlled heating improved stewing precision. The industrial revolution introduced dedicated stewing and slow-cooking appliances. In the 20th century, the development of electric slow cookers revolutionized stewing for busy households. Throughout history, stewing has remained a fundamental technique for resource maximization and flavor development, with regional variations reflecting local ingredients and cultural preferences.',

  scientificPrinciples: [
    'Slow hydrolysis of collagen into gelatin tenderizes tough cuts',
    'Osmosis gradually equalizes concentration of flavor compounds',
    'Convection currents in liquid distribute heat evenly',
    'Solubility of compounds increases with time and temperature',
    'Enzymatic breakdown occurs in early stages before denaturation',
    'Maillard reactions develop complex flavors through amino acid-sugar interactions',
    'Selective diffusion allows flavors to meld while maintaining structural integrity',
    'Low temperature prevents rapid moisture loss from proteins',
    'Phase transitions in fats enhance mouthfeel and flavor distribution',
    'Acid development through prolonged cooking helps tenderize tough fibers',
    'Thermal degradation of cell structures releases bound flavors',
    'Pectin solubilization creates desirable texture in plant materials'
  ],

  modernVariations: [
    'Sous vide stewing for precision temperature control',
    'Pressure cooker adaptations for accelerated results',
    'Temperature-controlled slow cookers with timing functions',
    'Combi-oven stewing with humidity control',
    'Induction cooking for precise temperature maintenance',
    'Vacuum-sealed ingredient preparation for intensified flavors',
    'Flash-chilled and reheated stews for flavor development',
    'Single-portion stewing techniques for restaurant service',
    'Molecular gastronomy adaptations with textural modifications',
    'Smart-appliance monitoring and remote control',
    'Stewing with recirculating liquid for enhanced extraction'
  ],

  sustainabilityRating: 0.9, // Very high - efficient, utilizes tough cuts one-pot cooking

  equipmentComplexity: 0.25, // Low - basic equipment with some specialized items optional

  healthConsiderations: [
    'Complete cooking ensures food safety through pathogen destruction',
    'Cooking liquid contains water-soluble nutrients',
    'Fat can be easily separated after cooling',
    'Long cooking breaks down some anti-nutritional factors',
    'Enhances digestibility of tough proteins and fibers',
    'Reduces need for added fats through self-basting',
    'Intensified flavors can reduce salt requirements',
    'Allows for easy incorporation of diverse vegetables',
    'Cooking at low temperatures minimizes formation of potentially harmful compounds',
    'Sequential cooking allows for strategic nutrient preservation',
    'One-pot approach provides balanced nutritional profile',
    'Suitable for incorporating medicinal herbs and adaptogens'
  ],

  expertTips: [
    'Sear proteins before stewing to develop depth through Maillard reaction',
    'Add vegetables in stages according to their cooking times',
    'For richest flavor, cool completed stew and reheat the following day',
    'Use umami-rich ingredients (tomato paste, mushrooms) for depth',
    'Thicken only in final 30 minutes to prevent burning',
    'Create a bouquet garni for easy removal of woody herbs',
    'Reserve delicate herbs until final 10 minutes of cooking',
    'Rest meat for 10 minutes before cutting for stewing',
    'Deglaze browning pan with wine or stock to capture all flavors',
    'For clearer broth, blanch bones or meat briefly before stewing',
    'Use a cartouche (parchment paper lid) for gentle evaporation',
    'Toast spices before adding to release aromatic compounds',
    'Cool stew uncovered before refrigerating to prevent condensation',
    'Cut ingredients to similar size for even cooking',
    'Add acid (wine, vinegar, citrus) to balance richness'
  ],

  ingredientPreparation: {
    tough_meats:
      'Cut into uniform 1-2 inch cubes against the grain. Season with salt and pepper, then dredge lightly in flour if desired. Brown in small batches over medium-high heat, ensuring space between pieces to avoid steaming. Use bones if available for enhanced flavor and body. For large cuts (3-4 lb), leave whole and extend cooking time by 1-2 hours. Game meats benefit from overnight marination in wine or buttermilk before stewing. Rest browned meat for 10 minutes before adding cooking liquid. For oily meats like lamb, consider par-boiling briefly and discarding first water before proper stewing.',
    root_vegetables: 'Peel if skins are tough or dirty. Cut into uniform 1-inch pieces for even cooking. For mixed vegetable stews, consider size differences for adding time: dense roots (carrots, parsnips, turnips) early, medium-density vegetables (potatoes) midway, and quick-cooking vegetables (peas, corn) in final 15-30 minutes. Toast root vegetables briefly in oil before adding liquid for enhanced caramelization. Some vegetables (potatoes, Jerusalem artichokes) release starch that naturally thickens the stew. Avoid cutting roots too small as they may disintegrate during long cooking.',
    aromatics: 'For mirepoix (onion, carrot, celery), dice finely for full flavor integration or larger for distinct pieces. Sauté aromatics after browning meat in the same pot to capture fond. Garlic should be added after other aromatics to prevent burning. Create two aromatic stages: foundational (mirepoix, garlic, bay leaves) at beginning, and fresh (parsley, thyme, chives) at end. For Indian stews, bloom whole spices in hot oil before adding liquid. For Mediterranean stews, consider sofrito base (slowly cooked aromatics) for deeper flavor development.',
    liquids: 'Use stock rather than water when possible for enhanced flavor depth. Combine different liquids for complexity: stock + wine, beer + stock, cider + stock. Add enough liquid to just cover ingredients—excessive liquid dilutes flavor. For wine, use same quality you would drink, and reduce by half before adding other liquids for alcohol evaporation and concentration. For tomato-based stews, add paste and brown briefly before adding liquid. For dairy-based stews, add towards end of cooking and maintain temperature below simmering to prevent curdling.',
    legumes: 'Most dried legumes should be soaked 8-12 hours before stewing. Discard soaking water to reduce indigestible compounds. Add salt only after legumes have softened. Avoid acidic ingredients until legumes are partially softened as acid toughens skins and extends cooking time. Cook times vary significantly: lentils (25-45 minutes), beans (1-3 hours), chickpeas (2-4 hours). For mixed bean stews, either cook varieties separately before combining or select varieties with similar cooking times. Consider adding 1/4 teaspoon baking soda to soaking water to soften very hard water.',
    thickening_agents: 'For flour thickening, either dredge meat before browning or make beurre manié (equal parts butter and flour kneaded together) added 30 minutes before completion. For cornstarch, create slurry with cold water and add during final 10 minutes, then maintain gentle simmer. For reduction thickening, remove lid during final 30-45 minutes. For vegetable thickening, purée a portion of the cooked vegetables and return to pot. For traditional thickening, use bread crumbs, crushed crackers, or grated potato. For gluten-free options, consider arrowroot (add at end) or reduction methods.';
},
  timingConsiderations: {
    meat_cooking:
      'Beef, chuck: 2.5-3 hours at 180°F; Oxtail: 3-4 hours Lamb, shoulder: 2-3 hours Pork, shoulder: 2.5-3 hours, Chicken thighs (bone-in): 1-1.5 hours, Game meats: 2-4 hours depending on type and age. Maximum collagen conversion occurs between 160-180°F maintained for extended periods. Meat is done when fork-tender but still maintaining structure. Extended cooking past optimal point can result in dry, stringy texture as moisture is expelled from protein structures. Large cuts require longer cooking times but often yield more succulent results than small cubes.',
    vegetable_integration: 'Add vegetables according to density and cooking time requirements. Standard sequence: 1) Aromatics and foundational vegetables in beginning, 2) Dense root vegetables after meat has cooked 1 hour, 3) Medium-density vegetables (potatoes) with 45-60 minutes remaining, 4) Quick-cooking vegetables (peas, leafy greens) in final 10-15 minutes. Pre-roasting some vegetables separately and adding during final 30 minutes provides textural contrast. Extended cooking causes some vegetables to dissolve (enhancing body) while others maintain integrity—strategic selection creates multilayered texture.',
    flavoring_timeline: 'Foundational herbs (bay leaf, thyme stems, rosemary) add during initial cooking. Whole spices add at beginning. Ground spices bloom in oil or add mid-cooking. Delicate herbs add in final 15 minutes. Acidic components (vinegar, citrus juice) add in final 30 minutes to brighten without extended cooking. Adjust salt gradually throughout cooking process with final adjustment after concentration. Compounds from whole spices require minimum 45 minutes of simmering for full extraction. Some flavor compounds become volatile and dissipate with extended cooking—balance between extraction and preservation affects final profile.',
    stew_maturation: 'Optimal flavor development continues after cooking completes. Allowing stew to cool completely and refrigerating overnight permits flavor compounds to distribute more evenly. Stews generally reach peak flavor 24-72 hours after cooking. During resting period, fat solidifies for easy removal if desired. Stews with high collagen content (oxtail, short rib) develop superior texture and mouthfeel after cooling and reheating as gelatin sets and remelts. Reheating should be gentle (180°F) to prevent protein toughening and maintain developed textures.',
    seasonal_adjustments: 'Summer stews require less cooking time due to younger, fresher ingredients. Winter stews benefit from longer cooking and higher aromatic content. Humidity affects evaporation rate—in dry environments, check liquid levels more frequently. Altitude affects cooking times and temperatures—above 3,000 feet, increase cooking time by approximately 10% per 1,000 feet and maintain slightly higher temperature to compensate for lower boiling point. Seasonal ingredients dramatically affect stew character: spring (young vegetables, lighter profiles), summer (abundant herbs), autumn (mushrooms, root vegetables), winter (preserved ingredients, deeper flavors).',
    equipment_factors: 'Dutch ovens retain heat excellently with minimal temperature fluctuation. Stainless steel pots may require more frequent monitoring for consistent temperature. Slow cookers typically operate between 170-280°F depending on setting, high setting approximates simmering. Electric pressure cookers reduce cooking time by 60-70% while maintaining tenderization properties. Clay pot cooking creates more gradual temperature changes beneficial for delicate stews. Induction cooking provides most precise temperature control for stewing. Flat, wide pots increase evaporation and concentration, tall, narrow pots minimize evaporation for more liquid stews.'
  },
  doneness_indicators: {
    protein_texture:
      'Properly stewed meat should retain its structure but separate easily with gentle pressure. Collagen-rich cuts develop spoon-tender quality. Poultry separates cleanly from bone. Fish and seafood maintain discrete flakes without becoming mushy. Meat fibers should separate easily but not disintegrate completely. Fork should penetrate with minimal resistance. In long-cooked stews, well-rendered fat integrates with liquid instead of pooling separately. Overcooked proteins appear dry despite liquid environment and may become stringy or mealy in texture.',
    liquid_body: 'Properly developed stew liquid coats the back of a spoon with slight viscosity. When stirred, liquid should show \'trail\' effect rather than immediate leveling. Bubbles become smaller and more frequent as stew develops body. Natural gelatin creates silky mouthfeel without added thickeners. Cooled stew with sufficient collagen develops soft gel consistency. Reduced liquid should have concentrated flavor without becoming overly salt-forward. Light should not penetrate stew liquid completely, indicating suspended solids and emulsified fats.',
    aromatic_integration: 'Individual aromatic ingredients surrender their distinct character to create unified flavor profile. Volatile oil compounds from herbs fully distribute throughout. Sharp notes from wine or spirits mellow completely. Raw allium flavors transform to sweet, rounded notes. Harsh tannins from red wine convert to smooth richness. Early seared flavors integrate with liquid components. Whole spices have fully released their essential oils. Taste profile shows depth with sequential flavor notes rather than singular impact.',
    color_development: 'Beef stews develop mahogany-brown color. Poultry stews show golden undertones. Tomato-based stews deepen from bright red to brick red or russet. Clear broths develop amber hue. Green vegetables will dull in extended cooking (unavoidable color change). Surface may show small spheres of emulsified fat with desirable glossy appearance. Stew edges may develop darker caramelization. Cloudy appearance becomes clearer as proteins fully denature.',
    aroma_profile: 'Complex layering of aromas replaces singular ingredient notes. Sharp alcoholic scent from wine or spirits completely dissipates. Harmonious integration of aromatics without individual domination. Developed stews exhibit savory roundness rather than raw ingredient character. Gentle steam carries full aromatic bouquet. Well-developed stews show distinct volatile compound release when lid is removed after resting period. Aromatic herbs added late maintain distinctive high notes above bass notes of long-cooked ingredients.',
    vegetable_integrity: 'Properly stewed vegetables maintain structural identity while fully tender. Root vegetables should offer slight resistance to utensil but yield easily. Cell structure remains intact but fully tenderized. Legumes fully hydrated with creamy interior while maintaining skin integrity. Some vegetable integration into liquid body enhances thickness and flavor. Strategic addition timing creates intentional texture gradient from fully integrated to distinct pieces. Fibrous vegetables (celery, leeks) should retain no stringiness.'
  },
  ingredientInteractions: {
    protein_liquid_exchange:
      'Protein releases water-soluble flavor compounds (glutamates, inosines) into liquid through slow extraction. Collagen converts to gelatin at 160-180°F when maintained for sufficient time, creating body in liquid and tenderness in meat. Salt accelerates protein extraction through mild denaturing effect. Acidic components (wine, tomatoes) help break down connective tissue but can toughen proteins if added too early in high concentration. Browning meat before stewing creates water-insoluble flavor compounds that slowly release during cooking. Protein structures initially tighten in heat, then gradually relax with extended time, allowing reabsorption of flavored liquid.',
    fat_integration: 'Fat renders slowly from meats, carrying fat-soluble flavor compounds. Emulsification occurs gradually as mechanical action and natural emulsifiers integrate fat into liquid. Rendered fat provides mouthfeel and flavor retention (fat-soluble compounds). Collagen-derived gelatin helps stabilize fat emulsion. Animal fats develop richness through extended cooking, vegetable oils remain more neutral. Temperature control critical—too high causes fat separation, too low prevents proper rendering. Some fat loss desirable in game meats to reduce strong flavors. Cooling and reheating allows for fat removal if desired for dietary considerations.',
    acid_effects: 'Acids denature proteins, affecting texture development—high initial acidity can toughen meat. Add acidic components (wine, vinegar, citrus, tomatoes) after protein has begun to tenderize for optimal texture. Acidity balances rich, fatty flavors through contrast effect. Acid helps break down cell walls in vegetables. Acid reduces perception of overall fat content. Enzymatic browning inhibited by acidic environment. Acidic ingredients lose sharpness during long cooking, becoming rounder in flavor profile. Acidity can inhibit softening of legumes and should be added after they have begun to tenderize.',
    sweet_component_transformation: 'Natural sugars in vegetables caramelize during initial browning phase. Maillard reactions between sugars and proteins create hundreds of new flavor compounds. Sweetness balances acidic and bitter components in complex stews. Extended cooking breaks complex carbohydrates into simpler sugars, developing natural sweetness. Sweet root vegetables (carrots, parsnips) provide subtle sweetness that balances savory elements. Adding small amount of sugar, honey, or fruit can round sharp flavors in acidic stews. Caramelization compounds provide rich undertones that support meat flavors.',
    starch_behavior: 'Flour-dredged meat provides gradual thickening as starch granules gelatinize. Potatoes and root vegetables release starch naturally during cooking. Starch gelatinization occurs between 140-180°F, creating thickening effect. Excessive starch can create gumminess—balance is critical. Acid slows starch gelatinization, affecting thickening timeline. Reheating causes some starch retrogradation, slightly thinning texture. Continuous gentle stirring helps prevent starch from settling and scorching. Rice, barley, and other grains absorb liquid while releasing starch, creating both thickening and textural components.',
    aromatic_diffusion: 'Fat-soluble aromatic compounds require sufficient fat for full extraction and expression. Water-soluble compounds extract more readily in aqueous phase. Extended cooking allows for full diffusion of flavor compounds between ingredients. Herbs with volatile oils (basil, cilantro) lose character in long cooking and should be added later. Whole spices require extended simmering for full extraction. Ground spices release flavor more quickly but can become bitter with extended cooking. Aromatic roots (ginger, galangal) release flavor gradually and maintain presence throughout cooking.',
    umami_development: 'Glutamates and inosinates develop and concentrate through extended cooking, creating depth. Combining multiple umami sources (meat, mushrooms, tomatoes, aged cheese) creates synergistic flavor enhancement greater than individual ingredients. Browning reactions create significant umami compounds. Natural MSG development occurs in long-cooked protein-based stews. Fermented ingredients (fish sauce, miso, soy sauce) provide immediate umami foundation that integrates during cooking. Proper salt levels essential for maximum umami perception.'
  },
  technicalNotes: {
    heat_management: {
      temperature_stability:
        'Stewing operates ideally between 160-190°F (71-88°C), below simmering point. Temperature fluctuations negatively impact texture development—stable heat source critical. Heavy-bottomed vessels provide thermal mass for stability. Heat diffusers useful on direct flame for maintaining low temperatures. Oven stewing (275-325°F/135-163°C) provides excellent temperature stability with even heat distribution. Gentle bubbling (1-2 bubbles per second breaking surface) indicates proper temperature. Digital thermometers can verify liquid temperature for precision.',
      energy_efficiency: 'Low temperature cooking reduces energy consumption significantly compared to high-heat methods. Thermal efficiency improved by matching pot size to heating element. Retained heat cooking (bringing to temperature then insulating) can reduce energy use by 50-70%. Pre-heating ingredients to target temperature before extended cooking reduces total energy requirements. Induction cooking provides 85-90% energy efficiency compared to 40% for gas flame. Pressure cooking reduces energy use through shortened cook time while achieving similar tenderization.',
      recovery_dynamics: 'Adding room temperature ingredients causes temporary temperature drop—stagger additions to maintain stability. Minimize lid removal to reduce heat loss (each removal extends cooking time by approximately 5 minutes). Larger volumes recover more slowly but maintain better stability. Preheating additions (liquids, vegetables) maintains better temperature curve. Recovery rate directly impacts protein texture—rapid temperature changes can cause toughening. Proper temperature recovery critical after stirring or ingredient addition.',
      gradient_formation: 'Natural temperature gradients form in stewing vessels—slightly higher at bottom, cooler at top. Strategic ingredient placement can leverage gradient for texture control. Surface exposure creates concentration through evaporation at liquid-air interface. Convection currents distribute heat but not uniformly through dense ingredients. Slow rotation of ingredients during cooking ensures even exposure to temperature zones. Extended cooking gradually minimizes gradient effects as flavors and temperatures equilibrate.'
    },
    fluid_dynamics: {
      convection_currents:
        'Natural convection distributes heat and flavor compounds through stewing liquid. Gentle bubbling creates controlled circulation without excessive agitation. Viscosity increases gradually, slowing convection but improving flavor cohesion. Vessel shape affects current formation—wider vessels create more surface evaporation, taller vessels create stronger vertical currents. Excessive stirring disrupts protein structure in tender ingredients, rely on natural convection when possible. Ingredients blocking liquid movement create uneven cooking zones.',
      surface_phenomena: 'Evaporation at surface concentrates flavors and reduces volume gradually. Surface tension changes as proteins and fats integrate into liquid. Partial lid coverage controls evaporation rate for desired concentration. Film formation (proteins, fats) at surface can be incorporated through occasional gentle stirring. Strategic deglazing of vessel sides incorporates concentrated flavors. Surface area to volume ratio directly impacts evaporation rate and concentration timeline.',
      osmotic_pressure: 'Salt creates osmotic pressure gradient, drawing moisture from ingredients while allowing flavor compounds to penetrate. Cellular membranes become increasingly permeable during extended cooking. Equilibration occurs gradually between ingredients and surrounding liquid. Seasoning throughout cooking maintains optimal osmotic gradient for flavor exchange. Osmotic pressure affects perceived texture of ingredients—too much salt early can draw excessive moisture from proteins.',
      emulsion_stability: 'Gelatin provides natural emulsification of rendered fats into cooking liquid. Gentle agitation through convection currents creates and maintains emulsion without breaking protein structures. Stable emulsions form gradually over extended cooking periods. Temperature drops can destabilize emulsions, causing fat separation. Acidic components help maintain emulsion stability. Reheating previously cooled stews requires gentle temperature increase to re-emulsify fats.'
    },
    collagen_dynamics: {
      conversion_kinetics:
        'Collagen triple helix begins unwinding around 140°F (60°C). Conversion to gelatin accelerates between 160-180°F (71-82°C). Rate follows logarithmic curve—initial conversion rapid, then slowing as available collagen decreases. Different animal tissues contain varying collagen types with different conversion rates. Age of animal significantly impacts collagen density and conversion timeline. Conversion requires both sufficient temperature and time—neither can be sacrificed without affecting result.',
      gelatin_functionality: 'Converted gelatin provides body, mouthfeel, and glossy appearance to stewing liquid. Gelatin concentration of 1.5-3% creates ideal texture without excessive viscosity. Cooling causes gelatin molecules to interlink, creating semi-solid structure, reheating reverses process. Gelatin serves as natural thickener, often eliminating need for added starch. Gelatin helps emulsify fats into water phase, creating unified mouthfeel. Protein structure in gelatin binds water molecules, preventing separation during storage.',
      texture_development: 'Optimal tenderness achieved when sufficient collagen converts while maintaining muscle fiber integrity. Overcooked collagen can dissolve structure completely, creating mushy texture. Collagen-rich cuts (shoulder, shank, oxtail) develop superior texture compared to lean cuts. Temperature control critical—excessive heat toughens proteins before collagen can convert. Different tissues within same cut convert at different rates, creating texture gradient. Connective tissue membranes soften but may remain identifiable in properly stewed meats.',
      visual_indicators: 'Successful collagen conversion creates distinctive glossy sheen in liquid. Meat fibers separate easily but maintain structural identity. Connective tissue transforms from white/silvery to translucent. Bubbling behavior changes as gelatin concentration increases—bubbles become smaller and more persistent. Liquid developing body that coats spoon indicates proper gelatin development. Color deepens as conversion progresses.'
    },
    flavor_chemistry {
      compound_creation:
        'Maillard reactions during initial browning create hundreds of new flavor compounds not present in raw ingredients. Slow hydrolysis of proteins creates free amino acids that enhance flavor complexity and umami. Caramelization of sugars produces furans, maltols, and other compounds contributing depth. Lipid oxidation creates desirable flavor compounds in controlled amounts. Extended cooking allows enzymatic activity to create flavor precursors before heat deactivation. Reactions continue throughout cooking as new compounds form and interact.',
      precursor_interactions: 'Initial flavor compounds serve as precursors for secondary and tertiary reactions. Thiols, furans, pyrazines from browning interact with aromatics creating multi-layered flavor. Amino acid-sugar interactions continue at low rates even during slow cooking. Fat-soluble flavor compounds concentrate as moisture reduces. Volatile compound retention varies by molecular weight and polarity. Temperature control critical for optimal reaction pathways—too high creates bitter compounds, too low limits beneficial reactions.',
      taste_perception: 'Properly developed stews stimulate all five basic tastes plus umami. Metallic, astringent notes should diminish through extended cooking. Flavor compounds bind to proteins and fats, creating lingering mouthfeel and perception. Temperature affects taste perception significantly—same stew tastes different at various serving temperatures. Cooled and reheated stews present more integrated flavor profile due to continued passive compound interaction during resting period. Salt perception changes throughout cooking as it integrates into cellular structures.',
      aromatic_evolution: 'Volatile compounds continue transforming throughout cooking process. Primary aromas from raw ingredients yield to secondary and tertiary notes. Sulfur compounds from alliums transform from sharp to sweet notes. Terpenoids from herbs partially volatilize while integrating into fat phase. Aromatic alcohols convert to esters during extended cooking, creating fruity undertones. Phenolic compounds from browned meat create foundational aromatic base. Complex spice blends develop orchestrated aromatic profile as cooking progresses.'
    },
    vegetable_transformations: {
      cell_wall_dynamics:
        'Pectin between plant cells begins solubilizing around 183°F (84°C), creating tender texture while maintaining structure. Hemicellulose breaks down more readily than cellulose, explaining why some vegetables soften more uniformly than others. Cellular turgor pressure decreases through extended cooking. Acid slows pectin breakdown—acidic environments maintain firmer vegetable texture. Calcium helps maintain cell wall integrity even during extended cooking. Cell membranes become increasingly permeable, allowing flavor exchange while maintaining structure.',
      starch_transformations: 'Starch gelatinization occurs between 150-180°F (65-82°C), creating thickening and absorption of flavored liquid. Amylose leaches into cooking liquid, creating body and viscosity. Retrograded starch during cooling periods creates resistant starch with different textural properties. Extended cooking can break down gelatinized starch, reducing thickening power. Different botanical sources of starch exhibit varying gelatinization properties and stability profiles. Flour-based thickeners maintain stability better than pure starches in extended cooking.',
      flavor_compound_release: 'Vegetables release water-soluble flavor compounds readily, fat-soluble compounds require lipid phase for full expression. Enzymatic activity creates flavor precursors before heat deactivation. Longer cooking creates Maillard reactions between vegetable sugars and proteins in cooking liquid. Sulfur compounds in alliums and brassicas transform dramatically during extended cooking. Carotenoid degradation creates terpenoid derivatives contributing to aroma profile. Flavor compound solubility changes with cooking temperature, affecting release kinetics.',
      texture_spectrum: 'Strategic addition timing creates intentional texture gradient from soft to firm. Cellular structure transformation follows predictable timeline for each vegetable type. Perfect stewed vegetables maintain identity while integrating with surrounding flavors. Dense root vegetables develop external tenderness while maintaining slight firmness at center. Gradient cooking creates multiple texture experiences within single vegetable piece. Stewing creates tendency toward uniform texture unless strategically managed through addition timing.'
    }
  }
} as unknown as CookingMethodData;
