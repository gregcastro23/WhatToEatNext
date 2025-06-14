import type { 
  ZodiacSign, 
  ThermodynamicProperties
} from '@/types/shared';

import type { CookingMethodData } from '@/types/cookingMethod';

/**
 * Spherification cooking method
 * 
 * Molecular gastronomy technique for creating caviar-like spheres 
 * with thin gel membranes containing liquid centers
 */
export const spherification: CookingMethodData = {
  name: 'spherification',
  description: 'Molecular gastronomy technique that creates caviar-like spheres or larger droplets with thin gel membranes containing liquid centers',
  elementalEffect: {
    Water: 0.6,
    Air: 0.2,
    Earth: 0.1,
    Fire: 0.1
  },
  duration: {
    min: 1,
    max: 10
  },
  suitable_for: ['fruit juices', 'purees', 'liqueurs', 'broths', 'oils', 'yogurt', 'cocktails', 'sauces', 'vegetable essences', 'herbal infusions', 'dairy products'],
  benefits: ['dramatic presentation', 'flavor burst', 'textural contrast', 'precise portioning', 'modern aesthetic', 'controlled flavor release', 'interactive dining experience', 'preservation of volatile flavors'],
  astrologicalInfluences: {
    favorableZodiac: ['aquarius', 'gemini', 'pisces'] as ZodiacSign[],
    unfavorableZodiac: ['taurus', 'virgo', 'capricorn'] as ZodiacSign[],
    dominantPlanets: ['Neptune', 'Uranus', 'Mercury'],
    lunarPhaseEffect: {
      'full_moon': 1.4, // Enhanced spherification
      'new_moon': 0.7,  // Difficult to form spheres
      'waxing_gibbous': 1.2, // Good membrane formation
      'waning_crescent': 0.8 // Unstable membranes
    }
  },
  toolsRequired: [
    'Digital scale (precision to 0.1g)',
    'Immersion blender (for dissolving hydrocolloids)',
    'pH meter or pH test strips (range 2-10)',
    'Dropper/syringe (various sizes from 1ml to 60ml)',
    'Slotted spoon (fine mesh)',
    'Silicone hemisphere molds (for larger spheres)',
    'Calcium baths (wide, shallow containers)',
    'Vacuum chamber (for removing air bubbles)',
    'Calibrated pipettes (for precise dosing)',
    'Fine-mesh strainers',
    'Rinsing bowls',
    'Non-reactive metal spoons',
    'Silicone tubing for specialized applications',
    'Magnetic stirrer for consistent hydration'
  ],
  commonMistakes: [
    'Incorrect pH balance (most liquids need pH 4.0-6.0 for optimal reaction)',
    'Improper alginate dissolution (creating lumps or air bubbles)',
    'Wrong calcium concentration (too strong creates thick membranes, too weak creates fragile spheres)',
    'Improper timing (too short for insufficient gelation, too long for solid spheres)',
    'Temperature issues (too cold slows reaction, too hot degrades hydrocolloids)',
    'Inadequate hydration time (alginate needs 4-24 hours for complete hydration)',
    'Using liquids with high calcium content for basic spherification',
    'Failing to strain alginate solutions before use',
    'Inadequate rinsing after calcium bath',
    'Using metal tools that can interfere with gelation',
    'Storing spheres in water (causes osmotic imbalance)'
  ],
  pairingSuggestions: [
    'Contrasting textures (crisp tuiles with soft spheres)',
    'Complementary flavor bases (savory spheres on sweet bases)',
    'Visual color contrasts (vibrant spheres on neutral backgrounds)',
    'Temperature contrasts (frozen spheres with warm elements)',
    'Tomato water spheres with mozzarella foam',
    'Melon spheres with prosciutto dust',
    'Olive oil spheres with balsamic pearls',
    'Yogurt spheres with honey caviar',
    'Coffee spheres with condensed milk foam',
    'Cucumber water spheres with gin granita'
  ],
  nutrientRetention: {
    vitamins: 0.85,
    minerals: 0.90,
    enzymes: 0.85,
    antioxidants: 0.80,
    flavor_compounds: 0.95,
    volatile_aromatics: 0.90,
    color_pigments: 0.85
  },
  optimalTemperatures: {
    'alginate_hydration': 70, // 70°F/21°C - room temperature
    'alginate_solution': 40, // 40°F/4°C - refrigerated for removing air bubbles
    'calcium_bath': 39, // 39°F/4°C - cold for best spherification
    'setting_bath': 39, // 39°F/4°C - cold inhibits continued gelation
    'service_cold': 39, // 39°F/4°C - for cold presentations
    'service_room': 68, // 68°F/20°C - for immediate consumption
    'working_environment': 68 // 68°F/20°C - ideal room temperature
  },
  regionalVariations: {
    spanish: ['modern tapas applications', 'culinary foams with spheres', 'savory olive spheres', 'liquid paella spherifications'],
    french: ['modernist cuisine applications', 'wine reductions as spheres', 'classical sauce spherifications'],
    japanese: ['modern kaiseki presentations', 'dashi spheres', 'sake pearls'],
    nordic: ['fermented flavor spheres', 'smoked liquid encapsulations', 'foraged essence spherifications'],
    latin_american: ['tropical fruit spheres', 'leche de tigre pearls', 'chili-infused micro-spheres'],
    middle_eastern: ['aromatic tea spheres', 'rosewater pearls', 'tahini-based applications']
  },
  chemicalChanges: {
    'ionic_gelation': true, // Cross-linking of alginate polymers with calcium ions
    'membrane_formation': true, // Development of semi-permeable membrane
    'osmotic_pressure': true, // Liquid exchange across membrane
    'selective_permeability': true, // Controlled diffusion of molecules
    'polymer_chain_reorganization': true, // Structural changes in alginate
    'diffusion_limitation': true, // Limited ion movement after initial shell formation
    'sol_gel_transition': true, // Change from liquid solution to semi-solid state
    'hydrocolloid_hydration': true // Water binding to polysaccharide chains
  },
  safetyFeatures: [
    'Use food-grade chemicals only (USP or equivalent grade)',
    'Proper measurement of additives (1% sodium alginate = 10g per 1L)',
    'Follow sanitation protocols (sterile tools and work surfaces)',
    'Proper labeling of all chemical solutions',
    'Keep spherified products refrigerated if not serving immediately',
    'Discard spheres after 2-4 hours at room temperature',
    'Use mineral water if tap water has high calcium content',
    'Avoid cross-contamination between calcium and alginate solutions'
  ],
  thermodynamicProperties: {
    heat: 0.15,       // Minimal heat involvement
    entropy: 0.40,    // Moderate structural transformation
    reactivity: 0.65, // High chemical reactivity (ionic gelation)
    energy: 0.25      // Low thermal energy, high chemical energy
  } as ThermodynamicProperties,
  
  // Additional metadata
  history: 'Spherification was pioneered by Chef Ferran Adrià at elBulli restaurant in Spain in the early 2000s, though the underlying chemical principles were known in the food industry since the 1950s. Adrià and his team refined the technique into a culinary application, first serving olive oil spheres that resembled olive shapes in 2003. The technique revolutionized molecular gastronomy and inspired a generation of chefs to explore science-based cooking techniques. Chef Adrià closed elBulli in 2011, but spherification has been adopted worldwide as a staple technique in avant-garde cuisine.',
  
  scientificPrinciples: [
    'Ionic gelation between negatively charged sodium alginate and positively charged calcium ions (Ca2+)',
    'Formation of semi-permeable membranes through cross-linking of polymer chains',
    'Diffusion of calcium ions into alginate solution following concentration gradient',
    'Cross-linking of alginate polymer chains creates "egg-box" molecular structure',
    'Osmotic pressure equilibrium determines membrane thickness',
    'pH-dependent reaction kinetics (optimal in mildly acidic to neutral pH)',
    'Temperature affects diffusion rates and reaction speed',
    'Viscosity of solution affects sphere formation and shape retention',
    'Gelation occurs from the outside inward due to contact pattern',
    'Divalent cations (Ca2+) are necessary for effective cross-linking'
  ],
  
  modernVariations: [
    'Reverse spherification (calcium in interior, for liquids naturally high in calcium)',
    'Frozen reverse spherification for thicker membranes and delayed reaction',
    'Multi-layer spheres with different flavors and textural elements',
    'Encapsulation of alcoholic liquids using xanthan gum stabilizers',
    'Flavored setting baths for surface flavor development',
    'Carbonated spherification (encapsulating carbonated liquids)',
    'Sous-vide infused liquids for spherification',
    'Co-extruded double spherification with two flavors',
    'Suspended spherification (spheres suspended in compatible liquids)',
    'Color-changing spheres (using pH-sensitive natural colors)'
  ],
  
  sustainabilityRating: 0.40, // Chemicals and precise measurements create waste
  
  equipmentComplexity: 0.85, // Requires specialized ingredients and precise measurements
  
  healthConsiderations: [
    'Uses approved food additives in small quantities (sodium alginate is derived from seaweed)',
    'Minimal nutrient loss in process due to cold preparation',
    'Preservation of heat-sensitive nutrients and volatile compounds',
    'Can create enhanced sensory experiences with reduced quantities of ingredients',
    'May contain sodium from sodium alginate (consideration for low-sodium diets)',
    'Alginate may provide beneficial dietary fiber properties',
    'Potential for reduced use of salt, sugar, or fat due to intense flavor delivery',
    'Some chemicals like calcium chloride can impart bitter flavors if not thoroughly rinsed'
  ],
  
  // More detailed technical information
  technicalNotes: {
    basicProcedure: 'Dissolve sodium alginate in flavored liquid (0.5-1% by weight), rest 24 hours to hydrate and remove air bubbles, then drop into calcium bath (0.5-1% calcium chloride) to form spheres',
    reverseProcedure: 'Mix calcium salt (calcium lactate gluconate 1-2%) into flavored liquid, then drop into sodium alginate bath (0.5% solution) for spheres with liquid centers',
    requiredAdditives: {
      'sodium_alginate': '0.5-1% by weight of liquid (higher % = firmer membrane)',
      'calcium_chloride': '0.5-1% by weight of bath (higher % = faster reaction)',
      'calcium_lactate_gluconate': '1-2% for reverse spherification (milder taste than calcium chloride)',
      'sodium_citrate': '0.25-0.5% for acidic liquids (buffers pH above 4.0)',
      'xanthan_gum': '0.1-0.2% to stabilize alcohol or increase viscosity',
      'calcium_lactate': '0.5-1% alternative to calcium chloride with less bitter taste',
      'sodium_hexametaphosphate': '0.1% to sequester existing calcium in liquids'
    },
    pHRequirements: {
      idealRange: '4.0-6.0 (alginate won\'t gel properly below pH 3.8)',
      acidicSolutions: 'May require sodium citrate to adjust pH; test with pH meter',
      alcoholicSolutions: 'May require xanthan gum stabilizer (0.1-0.2%) to prevent separation',
      highCalciumLiquids: 'Use sodium hexametaphosphate to sequester calcium before basic spherification'
    },
    shelf_life: {
      basicSpheres: '1-2 hours before membrane continues to thicken',
      reverseSpheres: '2-4 days when stored in original liquid, refrigerated',
      frozen: 'Up to 1 week when prepared using frozen reverse spherification'
    }
  },
  
  expertTips: [
    'For perfectly clear spheres, filter all solutions through fine-mesh strainer or cheesecloth twice',
    'Rest alginate solutions for 24 hours in refrigerator to fully hydrate and remove air bubbles',
    'Use a vacuum chamber to degas alginate solutions for absolutely clear spheres',
    'For alcohol spherification, add 0.15% xanthan gum to prevent ingredient separation',
    'Create a "wash bath" of clean water to rinse spheres after calcium bath to remove bitter taste',
    'For extremely thin membranes, limit bath time to 20-30 seconds with immediate washing',
    'Use calcium lactate gluconate instead of calcium chloride for better taste in reverse spherification',
    'Freeze flavored liquids in silicone molds before reverse spherification for perfect shapes',
    'Test all liquids for calcium content before attempting basic spherification',
    'For stable colored spheres, use oil-soluble natural colors that won\'t diffuse through membrane',
    'Use flavored oils to coat finished spheres and prevent them from sticking together',
    'For spheres with perfect round bottoms, drop liquid into a bath with deeper depth (4+ inches)',
    'Use spray bottle with water to mist spheres occasionally during service to maintain moisture',
    'Create neutral flavored "carrier spheres" that can be injected with different flavors before service'
  ],
  
  ingredientPreparation: {
    'alginate_solution': 'Blend sodium alginate with 1/5 of the total liquid to create a vortex, then add remaining liquid. Rest 4-24 hours in refrigerator to fully hydrate and remove air bubbles.',
    'calcium_bath': 'Dissolve calcium chloride or calcium lactate in cold water. Allow to chill to 39°F/4°C before use. Replace after producing 200-300 spheres or if becoming cloudy.',
    'acidic_juices': 'Mix with sodium citrate (0.25-0.5%) to raise pH above 4.0 before adding alginate. Verify with pH meter.',
    'dairy_products': 'For basic spherification, treat with sodium hexametaphosphate (0.1%) to sequester natural calcium, or use reverse spherification method.',
    'alcoholic_liquids': 'Add xanthan gum (0.1-0.3%) to stabilize alcohol. For liquids with >20% alcohol, dilute or reduce alcohol through gentle heating.',
    'purees': 'Strain through fine-mesh sieve to remove all solids before adding hydrocolloids. Adjust water content if too thick.',
    'oils': 'Mix with lecithin (1%) to create emulsion that can accept alginate or calcium.',
    'high_sugar_liquids': 'May require reduced alginate percentage (0.4-0.5%) due to binding competition with sugars.'
  },
  
  timingConsiderations: {
    'alginate_hydration': 'Allow 4-24 hours for complete hydration of sodium alginate in refrigerator.',
    'bath_duration': 'For basic spherification: 30 seconds to 3 minutes depending on desired membrane thickness.',
    'reverse_bath_duration': 'For reverse spherification: 30 seconds to 2 minutes based on sphere size.',
    'rest_after_forming': 'Rest spheres in neutral liquid for 2-5 minutes before service to stabilize membrane.',
    'service_window': 'Basic spheres: serve within 15-20 minutes. Reverse spheres: can hold 1-2 hours in appropriate liquid.',
    'freezing_considerations': 'Frozen reverse spheres must thaw at least 50% before serving for proper texture.',
    'prep_timing': 'Prepare solutions at least 24 hours before service; actual spherification should be done 10-30 minutes before serving.'
  },
  
  doneness_indicators: {
    'basic_spheres': 'Membrane holds shape when gently lifted with slotted spoon; liquid center moves freely inside.',
    'reverse_spheres': 'Shape holds when rolled on flat surface; membrane is elastic but doesn\'t break under light pressure.',
    'caviar': 'Individual spheres remain separate and don\'t merge; bounce slightly when dropped.',
    'large_spheres': 'Surface tension creates slight resistance when touched; membrane is continuous with no weak spots.',
    'over_gelled': 'Sphere feels firm throughout with reduced liquid center; membrane too thick.',
    'under_gelled': 'Membrane breaks easily when handled; sphere loses shape outside of liquid.'
  },
  
  ingredientInteractions: {
    'calcium_and_alginate': 'Primary interaction creating gel membrane; ratio determines thickness and strength.',
    'acids_and_alginate': 'pH below 3.8 prevents proper alginate gelation; use sodium citrate to buffer.',
    'alcohol_and_hydrocolloids': 'High alcohol content (>20%) inhibits proper hydration; use stabilizers or reduce alcohol.',
    'fats_and_spherification': 'Pure oils/fats cannot be directly spherified; must be emulsified first with lecithin.',
    'proteins_and_calcium': 'Some proteins compete with alginate for calcium binding; may require increased calcium concentration.',
    'salts_and_gelation': 'High salt content slows gelation process; may require longer bath times.',
    'sugar_and_alginate': 'High sugar concentration competes with alginate hydration; may need adjustment of percentages.',
    'natural_calcium_content': 'Ingredients like dairy naturally high in calcium will begin to gel immediately with alginate; use reverse method.'
  }
}; 