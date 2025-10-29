import type { ThermodynamicProperties } from '@/types/alchemy';
import type { CookingMethodData } from '@/types/cookingMethod';

/**
 * Sous-vide cooking method
 *
 * Precision cooking using vacuum-sealed bags in temperature-controlled water.
 * Associated with the alchemical pillar of Fixation - stabilizing volatile substances,
 * increasing Matter and Substance while decreasing Essence and Spirit.
 */
export const _sousVide: CookingMethodData = {
  name: 'sous_vide',
  description: 'Precision cooking method where food is vacuum-sealed and immersed in a temperature-controlled water bath for perfect doneness. The method ensures exact temperature control, allowing proteins to be cooked to precise levels of doneness while preserving moisture and enhancing texture.',
  elementalEffect: {
    Water: 0.5, // Primary element - the cooking medium
    Earth: 0.3, // Secondary element - reflects stability and structure,
    Fire: 0.1, // Minimal fire element - low heat application
    Air: 0.1, // Minimal air element - vacuum removes air
  },
  duration: {
    min: 30,
    max: 4320, // Up to 72 hours for certain tough cuts of meat
  },
  suitable_for: [
    'meat',
    'fish',
    'eggs',
    'vegetables',
    'fruits',
    'custards',
    'infusions',
    'tough cuts',
    'delicate proteins',
    'game meats',
    'shellfish'
  ],
  benefits: [
    'precise temperature control',
    'even cooking',
    'enhanced moisture retention',
    'consistent results',
    'hands-off process',
    'exceptional texture development',
    'intensified natural flavors',
    'time flexibility',
    'minimal nutrient loss',
    'transforms tough cuts to tender',
    'perfect doneness every time',
    'eliminates risk of overcooking'
  ],
  astrologicalInfluences: {
    favorableZodiac: ['aquarius', 'virgo', 'capricorn'] as any[], // Earth signs and technological Aquarius,
    unfavorableZodiac: ['aries', 'leo', 'sagittarius'] as any[], // Fire signs prefer more spontaneous cooking methods,
    dominantPlanets: ['Mercury', 'Saturn', 'Uranus'], // Precision (Mercury), stability (Saturn), innovation (Uranus),
    lunarPhaseEffect: {
      full_moon: 0.8, // Less effective - water energies are more chaotic,
      new_moon: 1.3, // Enhanced precision - stability in vacuum environment,
      first_quarter: 1.1, // Good balance,
      third_quarter: 0.9, // Slightly diminished effects
    }
  },
  toolsRequired: [
    'Immersion circulator',
    'Vacuum sealer or resealable bags',
    'Heat-safe food-grade bags',
    'Large container or pot',
    'Thermal immersion probe',
    'Timer',
    'Weights (to keep food submerged)',
    'Finishing tools (cast iron pan, torch, etc.)',
    'Ice bath (for quick chilling)',
    'Insulation for long cooks (lid, towels, etc.)'
  ],
  commonMistakes: [
    'improper sealing (allowing water to enter bag)',
    'wrong temperature setting for desired doneness',
    'inadequate water circulation around bags',
    'overcrowding the water bath',
    'skipping final searing for meats',
    'using too small a water container',
    'not accounting for evaporation in long cooks',
    'using unsafe plastic bags not rated for heat',
    'improper food safety practices for low-temp cooking',
    'not allowing for thermal equilibrium time'
  ],
  pairingSuggestions: [
    'High-heat finishing techniques (searing, grilling, broiling)',
    'Infused finishing oils and compound butters',
    'Molecular garnishes and foams',
    'Textural contrasts (crispy elements)',
    'Fresh herb applications post-cooking',
    'Reduction sauces from bag juices',
    'Cold smoking before sous vide cooking',
    'Cryogenic freezing after (ice cream base)',
    'Fermented accompaniments',
    'Bright acidic components to balance richness'
  ],
  nutrientRetention: {
    proteins: 0.95, // Excellent preservation of protein structure,
    vitamins: 0.9, // Very good retention of water-soluble vitamins,
    minerals: 0.95, // Excellent mineral retention,
    fats: 0.98, // Nearly perfect fat preservation,
    flavor_compounds: 0.96, // Excellent flavor compound retention
  },
  optimalTemperatures: {
    rare_beef: 129, // °F - Juicy, tender, rare beef,
    medium_beef: 135, // °F - Perfect medium doneness,
    chicken_breast: 145, // °F - Safe, juicy chicken breast,
    salmon: 122, // °F - Silky, buttery texture,
    egg: 145, // °F - Perfect soft-cooked egg,
    vegetables: 183, // °F - Tender-crisp vegetables,
    tough_cuts: 165, // °F - For collagen breakdown (24-72 hours),
    pork: 145, // °F - Safe, juicy pork,
    lobster: 140, // °F - Tender, never rubbery,
    duck_breast: 135, // °F - Medium-rare duck,
    game_meats: 131, // °F - Tender wild game,
    custards: 176, // °F - Perfect set without curdling
  },
  regionalVariations: {
    modernist: ['precision cooking', 'time-temperature combinations', 'multi-phase cooking'],
    french: ['low-temperature precision cooking', 'cuisine sous-vide', 'cuisson sous-vide'],
    japanese: ['onsen tamago inspiration', 'precision protein handling'],
    nordic: ['long-duration game cooking', 'foraged ingredient preservation'],
    american: ['bbq-style long cooks', 'modernist home applications'],
    spanish: ['avant-garde cuisine applications', 'textural transformations']
  },
  chemicalChanges: {
    protein_denaturation: true, // Precise unfolding of protein structures,
    enzymatic_breakdown: true, // Controlled enzymatic tenderization,
    vacuum_infusion: true, // Enhanced flavor penetration in vacuum,
    cell_membrane_integrity: true, // Preservation of cellular structure,
    fat_rendering: true, // Controlled melting of fats,
    collagen_conversion: true, // Slow conversion to gelatin in long cooks,
    flavor_compound_preservation: true, // Retention of volatile compounds,
    starch_gelatinization: true, // In vegetables and starches,
    limited_maillard_reaction: false, // Temperature too low for browning
  },
  safetyFeatures: [
    'Monitor water levels to prevent equipment damage',
    'Use only food-grade bags rated for cooking temperatures',
    'Follow pasteurization time-temperature tables for safety',
    'Chill rapidly if not serving immediately',
    'Always use fresh ingredients',
    'Keep bath water clean and changed regularly',
    'Verify equipment calibration regularly',
    'Consider food safety danger zone (40°F-140°F) when planning cooks',
    'Proper handling of bag liquids (juices)',
    'Follow manufacturer guidelines for equipment usage'
  ],
  thermodynamicProperties: {
    heat: 0.3, // Low, precise heat - controlled application,
    entropy: 0.35, // Slow, controlled breakdown of structures,
    reactivity: 0.2, // Minimal reactivity (no Maillard),
    gregsEnergy: -6.35, // Calculated using heat - (entropy * reactivity)
  } as unknown as ThermodynamicProperties,

  // Additional metadata
  history: 'Sous vide (French for \'under vacuum\') was developed in France in the 1970s by chef Georges Pralus to minimize shrinkage in foie gras. However, low-temperature cooking was first described by Benjamin Thompson (Count Rumford) in 1799. The modern technique was refined and popularized by Bruno Goussault, who established time-temperature guidelines for various foods. Sous vide remained primarily in professional kitchens until the 2010s, when affordable immersion circulators made the technique accessible to home cooks.',

  scientificPrinciples: [
    'Thermal equilibrium - food cannot exceed water bath temperature',
    'Precise protein denaturation at specific temperatures',
    'Vacuum environment prevents oxidation and flavor loss',
    'Water\'s high specific heat provides stable cooking environment',
    'Slow enzymatic breakdown for tenderization',
    'Pasteurization through time-temperature combinations',
    'Conduction as primary heat transfer mechanism',
    'Convection currents in water ensure even temperature',
    'Collagen to gelatin conversion at extended low temperatures',
    'Prevention of evaporative moisture loss through sealed environment'
  ],

  modernVariations: [
    'Sous vide followed by torch or cast iron finishing',
    'Oil-poaching sous vide for fatty ingredients',
    'Compression techniques for fruits and vegetables',
    'Enzyme-accelerated aging in vacuum environment',
    'Aroma infusion in sealed environment',
    'Sous vide cocktail infusions',
    'Cryoconcentration followed by sous vide cooking',
    'Sous vide in combi ovens (bagless sous vide)',
    'Staged temperature cooking (incremental temperature increases)',
    'Fermentation acceleration through precise temperature control',
    'Jar-based sous vide for custards and desserts'
  ],

  sustainabilityRating: 0.85, // Highly efficient energy usage,

  equipmentComplexity: 0.7, // Requires specialized equipment but simple operation,

  healthConsiderations: [
    'Minimal oxidation of nutrients due to vacuum environment',
    'Precise control prevents overcooking and nutrient loss',
    'Minimal added fat required for excellent results',
    'Safety concerns with low-temperature cooking without proper pasteurization knowledge',
    'Potential migration of plasticizers from bags (use food-grade only)',
    'Reduced AGE formation (Advanced Glycation End-products) due to low temperatures',
    'Excellent for therapeutic diets requiring precise nutrition',
    'Allows reduction of salt and fat while maintaining flavor',
    'Potential for enhanced digestibility through precise protein cooking',
    'Reduces formation of heterocyclic amines common in high-heat cooking'
  ],

  /**
   * Alchemical aspect - Fixation Pillar (#12)
   *
   * Sous vide is associated with the Fixation pillar in alchemy,
   * which is about stabilizing volatile substances.
   *
   * Alchemical Effects: Increases Matter and Substance, decreases Spirit and Essence
   * Planetary associations: Saturn (structure, time) and Venus (harmony, balance)
   * Tarot associations: 4 of Pentacles (conservation), King of Pentacles (material mastery)
   * Elemental associations: Primary - Earth, Secondary - Air
   */
  alchemicalAspects: {
    pillarName: 'Fixation',
    pillarNumber: 12,
    alchemicalProcess: 'Stabilization of volatile substances through precise temperature control',
    effects: {
      spirit: -1, // Decreases spiritual volatility,
      essence: -1, // Reduces essence through containment,
      matter: 1, // Increases material stability and structure,
      substance: 1, // Enhances substantive qualities and preservation
    },
    symbolicMeaning: 'Represents the perfect balance between technical precision and natural processes, bringing stability to the chaotic elements of cooking',
    associatedElements: {
      primary: 'Earth', // Stability, structure, material reality,
      secondary: 'Air', // Intellectual precision, technological approach
    }
  },

  /**
   * Extended cooking notes
   */
  extendedNotes: {
    timingConsiderations: [
      'Thickness significantly impacts cooking time (roughly squared relationship)',
      'Allow extra time for frozen foods (approximately 50% longer)',
      'Extended cooks (>4 hours) require monitoring of water levels',
      'Thermal equilibrium requires time - small items (15-30 min), large items (1-2 hours)'
    ],

    qualityImprovements: [
      'For meats, brief resting period improves juice retention',
      'Pre-searing can develop some flavors before sous vide cooking',
      'Post-searing should be extremely hot and brief to prevent overcooking',
      'Chilling after cooking before searing can prevent overcooking edge areas',
      'Aromatics in bag should be used sparingly to avoid overwhelming natural flavors'
    ],

    advancedTechniques: [
      'Temperature stepping (starting low, finishing higher) for optimal enzyme activity',
      'Delayed bagging for vegetables to preserve color through enzyme activation',
      'Double-bagging for powerful aromatics or sharp bones',
      'Strategic ice placement for delicate items like fish to prevent overcooking',
      'Rapid chilling in ice bath followed by refrigeration for extended storage safety',
      'Water displacement method as alternative to vacuum sealing'
    ]
  }
} as unknown as CookingMethodData;

// Export without underscore for compatibility
export const sousVide = _sousVide;
