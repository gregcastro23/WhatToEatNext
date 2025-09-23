import type { ThermodynamicProperties } from '@/types/alchemy';
import type { CookingMethodData } from '@/types/cookingMethod';

/**
 * Poaching cooking method
 *
 * Gentle cooking technique using liquid heated to just below simmering point (160°F-180°F/71°C-82°C).
 * Associated with the alchemical pillar of Coagulation - transforming delicate substances
 * with minimal disruption while preserving their essence.
 */
export const poaching: CookingMethodData = {
  name: 'poaching',
  description: 'Gentle cooking method where food is submerged in liquid heated to just below simmering point (160°F-180°F/71°C-82°C), characterized by small bubbles forming on the bottom of the pan without breaking the surface. This technique delicately cooks food while preserving moisture, texture, and shape, ideal for proteins that might toughen at higher temperatures and delicate ingredients that require subtle flavor infusion.',
  elementalEffect: {
    Water: 0.8, // Primary element - gentle, submersive cooking medium,
    Air: 0.1, // Minor element - subtle convection currents
    Fire: 0.1, // Minor element - very gentle heat application,
    Earth: 0.0, // Minimal earth element
  },
  duration: {
    min: 3,
    max: 45
},
  suitable_for: [
    'fish fillets',
    'shellfish',
    'poultry',
    'eggs',
    'fruits',
    'delicate vegetables',
    'tender cuts of meat',
    'custards',
    'dumplings',
    'whole fish',
    'chicken breasts',
    'pears',
    'apples',
    'quince',
    'peaches',
    'asparagus',
    'fennel',
    'meatballs',
    'quenelles',
    'terrines'
  ],
  benefits: [
    'preserves delicate textures',
    'gentle flavor infusion',
    'minimizes toughening of proteins',
    'retains moisture',
    'reduces shrinkage',
    'preserves shape and integrity',
    'extracts flavor into cooking medium',
    'reduces risk of overcooking',
    'no added fat necessary',
    'clean, pure flavors',
    'promotes tender results',
    'facilitates subtle flavor absorption',
    'creates natural sauces',
    'maintains nutritional value',
    'prevents food from drying out'
  ],
  astrologicalInfluences: {
    favorableZodiac: ['pisces', 'cancer', 'scorpio', 'libra'] as any[], // Water signs and balanced Libra,
    unfavorableZodiac: ['aries', 'leo', 'sagittarius'] as any[], // Fire signs prefer more dynamic cooking methods,
    dominantPlanets: ['Venus', 'Neptune', 'Moon'], // Venus (harmony), Neptune (subtlety), Moon (fluidity),
    rulingPlanets: ['Venus', 'Neptune'], // Primary rulers - gentleness and subtlety,
    lunarPhaseEffect: {
      full_moon: 1.2, // Enhanced subtlety and moisture retention,
      new_moon: 0.9, // Slightly diminished effects,
      waxing_gibbous: 1.15, // Good balance and flavor infusion,
      waning_crescent: 0.95, // Slightly reduced effectiveness,
      first_quarter: 1.05, // Moderate enhancement,
      third_quarter: 0.98, // Slight reduction,
      waxing_crescent: 1.0, // Neutral,
      waning_gibbous: 1.05, // Moderate enhancement
    }
  },
  toolsRequired: [
    'Wide, shallow pan with lid',
    'Slotted spoon or spider',
    'Instant-read thermometer',
    'Kitchen timer',
    'Parchment paper lid (cartouche)',
    'Fine mesh strainer',
    'Fish spatula (for delicate items)',
    'Poaching liquid (court bouillon, stock, wine, milk, water)',
    'Aromatics (herbs, spices, vegetables)',
    'Ladle',
    'Paper towels for draining',
    'Shallow serving dish',
    'Heat diffuser (optional)'
  ],
  commonMistakes: [
    'liquid too hot (causes toughening and shrinkage)',
    'liquid too cool (extends cooking time, safety concerns)',
    'insufficient liquid (uneven cooking)',
    'overcrowding the pan (temperature drops, uneven cooking)',
    'not using acidulated liquid for eggs (whites spread)',
    'boiling instead of poaching (rough texture)',
    'insufficient aromatics (bland result)',
    'not straining poaching liquid (cloudy appearance)',
    'overcooking (dry, tough texture)',
    'not using cartouche when appropriate (evaporation, skin formation)',
    'poaching frozen items without thawing (temperature inconsistency)',
    'not resting proteins after poaching (moisture loss)',
    'incorrect liquid selection for ingredient (flavor clash)',
    'not saving poaching liquid for sauce (flavor waste)'
  ],
  pairingSuggestions: [
    'Beurre blanc sauce (classic with fish)',
    'Hollandaise (traditional with eggs Benedict)',
    'Infused oils (herb, citrus, chili)',
    'Light vinaigrettes (champagne, white wine)',
    'Herb salads (parsley, chervil, tarragon)',
    'Crisp vegetables for texture contrast',
    'Poaching liquid reduced as natural sauce',
    'Light cream sauces (velouté base)',
    'Citrus segments and zest',
    'Pickled components (quick-pickled shallots, cucumbers)',
    'Microgreens and edible flowers',
    'Compound butters (dill, tarragon, lemon)',
    'Crisp toast points or crostini',
    'Salsas verde or mild fruit salsas',
    'Minimally dressed greens (contrasting bitterness)'
  ],
  nutrientRetention: {
    vitamins: 0.85, // Excellent preservation of heat-sensitive vitamins,
    minerals: 0.75, // Some migration to poaching liquid,
    proteins: 0.95, // Very minimal protein loss,
    fats: 0.8, // Some fat rendered into liquid but majority retained,
    antioxidants: 0.9, // Well preserved due to low temperature,
    water_soluble_vitamins: 0.75, // Some B and C vitamins migrate to liquid,
    fat_soluble_vitamins: 0.9, // Excellent AD, EK retention,
    phytonutrients: 0.85, // Good preservation of beneficial plant compounds,
    flavor_compounds: 0.75, // Some transfer to poaching liquid
  },
  optimalTemperatures: {
    delicate_fish: 170, // °F - Perfect for sole, flounder, snapper,
    fatty_fish: 175, // °F - Salmon, trout,
    shellfish: 165, // °F - Shrimp, scallops,
    chicken_breast: 175, // °F - Poultry white meat,
    eggs: 165, // °F - Poached eggs,
    fruits: 160, // °F - Pears, apples, stone fruits,
    vegetables: 180, // °F - Asparagus, artichokes,
    whole_fish: 170, // °F - Small whole fish or fillets with skin,
    custards: 170, // °F - Savory or sweet custards,
    average_temperature: 170, // °F - General poaching temperature,
    maximum_safe: 180, // °F - Upper limit before simmering begins,
    minimum_safe: 160, // °F - Lower limit for food safety,
    milk_poaching: 165, // °F - For milk-based poaching (fish, chicken),
    wine_poaching: 175, // °F - Wine-based poaching liquids,
    court_bouillon: 175, // °F - Classic aromatic poaching liquid
  },
  regionalVariations: {
    french: [
      'poached eggs with meurette sauce (Burgundy)',
      'fish quenelles (Lyon)',
      'poule au pot (classic poached chicken)',
      'pears poached in wine (poires au vin)',
      'court bouillon with white wine and herbs',
      'oeufs en meurette (eggs poached in red wine)',
      'poisson au court-bouillon (fish in aromatic broth)'
    ],
    chinese: [
      'Cantonese steamed fish (subtle poaching)',
      'white-cooked chicken (bai qie ji)',
      'rice wine poached seafood',
      'ginger-scallion fish poaching',
      'chrysanthemum fish (chrysanthemum-infused poaching)',
      'tea-poached fish'
    ],
    italian: [
      'poached seafood for insalata di mare',
      'pesce in carpione (poached then marinated fish)',
      'white wine and herb poaching for branzino',
      'fruit in moscato (peaches, apricots)',
      'uova in camicia (poached eggs Italian style)'
    ],
    nordic: [
      'dill-poached salmon',
      'aquavit-infused poaching liquids',
      'cucumber poaching court bouillon',
      'buttermilk poached cod',
      'spruce tip poaching liquid'
    ],
    japanese: [
      'nimono (simmered/poached dishes)',
      'sakamushi (sake-poached seafood)',
      'yudofu (hot-pot poached tofu)',
      'tamago onsen (hot spring eggs)',
      'kombu-dashi poaching liquid'
    ],
    mexican: [
      'huevos ahogados (drowned eggs)',
      'pescado a la veracruzana (poached fish)',
      'poached fruit in cinnamon and piloncillo',
      'chile-infused poaching liquids',
      'hibiscus flower fruit poaching'
    ],
    indian: [
      'coconut milk poached fish (South Indian)',
      'saffron and cardamom poached chicken',
      'poached fruit in chai tea',
      'yogurt-poached fish (Bengali tradition)',
      'fragrant poaching with whole spices'
    ]
  },
  chemicalChanges: {
    gentle_protein_denaturation: true, // Proteins unfold without toughening,
    collagen_hydration: true, // Collagen absorbs water and softens,
    flavor_infusion: true, // Bidirectional flavor exchange,
    pectin_softening: true, // Fruits and vegetables soften,
    starch_hydration: true, // Starches absorb water and swell,
    minimal_maillard_reaction: false, // Temperature too low for browning,
    enzyme_inactivation: true, // Cooking halts enzymatic activity,
    fat_preservation: true, // Low temperature prevents excessive fat rendering,
    nutrient_migration: true, // Water-soluble compounds move into poaching liquid,
    albumin_coagulation: true, // Egg white proteins set around 145°F,
    vitamin_preservation: true, // Low temperature preserves heat-sensitive vitamins,
    aromatic_compound_extraction: true, // Flavors extracted from herbs and spices,
    mineral_transfer: true, // Bidirectional movement of minerals,
    anthocyanin_preservation: true, // Color compounds in fruits maintained
  },
  safetyFeatures: [
    'Temperature control crucial (use thermometer)',
    'Maintain 160°F minimum for food safety (killing pathogens)',
    'Keep poached items refrigerated if not serving immediately',
    'Use clean, fresh ingredients (especially for seafood)',
    'Acidulated water for eggs helps denature surface proteins (safer)',
    'Avoid cross-contamination between raw and poached items',
    'Cool poaching liquid properly before refrigerating',
    'Handle hot poaching liquid carefully to avoid burns',
    'Ensure proper internal temperature for poultry (165°F)',
    'Use dedicated tools for raw and cooked items',
    'Monitor poaching liquid levels to prevent drying/burning',
    'Follow time guidelines for different ingredients',
    'Cool poached items quickly if not serving immediately',
    'Strain and reuse poaching liquid only once or twice (safety)',
    'Be aware of allergens in aromatic poaching liquids'
  ],
  thermodynamicProperties: {
    heat: 0.4, // Gentle, low heat,
    entropy: 0.3, // Minimal structural disruption,
    reactivity: 0.25, // Limited chemical reactions due to low temperature,
    gregsEnergy: 0.05, // Calculated using heat - (entropy * reactivity), // Calculated gregsEnergy: heat - (entropy * reactivity)
  } as unknown as ThermodynamicProperties,

  // Additional metadata
  history: 'Poaching dates back to ancient times, with written records of gentle liquid cooking in Roman texts from the 1st century AD. The technique was refined in medieval European courts, particularly in France where it became a cornerstone of delicate fish cookery by the 15th century. The 17th century saw the development of court bouillon (short broth) specifically for poaching. In 19th century France, Chef Marie-Antoine Carême standardized poaching techniques and elevated them in haute cuisine, creating elaborate presentations like poached salmon in aspic. In Asian traditions, particularly Chinese cuisine, gentle poaching techniques developed independently with a focus on delicate flavors and textures, as seen in white-cut chicken (bai qie ji). Modern professional kitchens still rely on poaching as the preferred method for delicate ingredients and precision cooking.',

  scientificPrinciples: [
    'Heat transfer primarily through convection in liquid medium',
    'Protein denaturation occurs gradually at 140°F-160°F without contracting/toughening',
    'Osmosis facilitates flavor exchange between poaching liquid and food',
    'Gentle temperature prevents rapid protein coagulation that causes toughening',
    'Constant temperature environment provides even cooking throughout food',
    'Water\'s high specific heat capacity creates stable cooking environment',
    'Aromatic compounds dissolve in poaching liquid creating flavor infusion',
    'Convection currents in liquid distribute heat evenly around food',
    'Acidic poaching liquids denature proteins more readily than neutral liquids',
    'Proteins unfold and coagulate at different temperatures (eggs: 145°F, fish: 140°F)',
    'Poaching below 180°F prevents violent bubbling that can damage delicate foods',
    'Submersion ensures even heat distribution without temperature gradients',
    'Low temperature prevents excessive moisture loss from protein contraction',
    'Fat-soluble flavors remain in food while water-soluble flavors can migrate to liquid',
    'Hydrophilic and hydrophobic interactions influence flavor transfer dynamics'
  ],

  modernVariations: [
    'Temperature-controlled water baths for precise poaching',
    'Vacuum-sealed poaching (sous vide technique)',
    'Oil-poaching (confit) at low temperatures',
    'Flavored poaching liquids (teas, broths, juices, wines)',
    'Smoke-infused poaching liquids',
    'Double-poaching techniques (two different liquids sequentially)',
    'Microwave poaching for rapid results',
    'Pressure cooker poaching (elevated temperature)',
    'Induction-controlled precise poaching',
    'Carbonated liquid poaching for textural effects',
    'Cryoconcentrated flavor infusions for poaching media',
    'Ultra-filtration of poaching liquids for reuse',
    'Centrifuged clarified poaching media',
    'Enzyme-modified poaching liquids for tenderization',
    'Ultrasonic-assisted flavor infusion during poaching'
  ],

  sustainabilityRating: 0.8, // Highly efficient cooking method with liquid reuse potential,

  equipmentComplexity: 0.25, // Simple equipment needs with some technique requirements,

  healthConsiderations: [
    'No added fat required for cooking method',
    'Excellent retention of nutrients due to gentle temperatures',
    'Poaching liquid can be consumed for additional nutrition (vitamins, minerals)',
    'Lower risk of harmful compound formation compared to high-heat methods',
    'Gentle on digestive system (ideal for therapeutic diets)',
    'Can be used with minimal salt for sodium-restricted diets',
    'Preserves omega fatty acids in fish better than high-heat methods',
    'Reduces formation of AGEs (Advanced Glycation End-products)',
    'Ideal for special diets requiring gentle foods',
    'Little to no oxidation of fats during cooking',
    'Helps preserve heat-sensitive nutrients like B vitamins',
    'Allows natural flavors to predominate without additives',
    'Can incorporate aromatic herbs with medicinal properties',
    'Facilitates precise control of sodium and other additives',
    'Creates easily digestible proteins for therapeutic nutrition'
  ],

  /**
   * Alchemical aspect - Coagulation Pillar (#5)
   *
   * Poaching is associated with the Coagulation pillar in alchemy,
   * which involves the solidification of dissolved elements in a gentle medium.
   *
   * Alchemical Effects: Increases Spirit and Essence, balances Matter and Substance
   * Planetary associations: Venus (harmony, beauty) and Moon (fluidity, cycles)
   * Tarot associations: The Empress (nurturing), Queen of Cups (emotional depth)
   * Elemental associations: Primary - Water, Secondary - Air
   */
  alchemicalAspects: {
    pillarName: 'Coagulation',
    pillarNumber: 5,
    alchemicalProcess: 'Gentle transformation of substances through submersion in nurturing liquid',
    effects: {
      spirit: 1, // Increases spiritual refinement,
      essence: 1, // Enhances essential qualities,
      matter: 0, // Neutral effect on material properties,
      substance: 0, // Neutral effect on substantive qualities
    },
    symbolicMeaning: 'Represents the nurturing transformation of ingredients through gentle care and patience, preserving their essential nature while refining their form',
    associatedElements: {
      primary: 'Water', // Fluidity, emotion, nourishment,
      secondary: 'Air', // Subtlety, refinement, delicacy
    }
  }

  /**
   * Extended cooking notes
   */
  expertTips: [
    'For perfectly poached eggs, create a vortex in acidulated water before adding egg',
    'When poaching fish, measure thickness and calculate 10 minutes per inch',
    'Always let poached meats rest before slicing to retain juices',
    'Save and reduce poaching liquid for natural, flavorful sauces',
    'Use a cartouche (parchment paper lid) to prevent surface discoloration',
    'The wider and shallower the poaching vessel, the more even the cooking',
    'For fruit, poach until just tender when pierced (avoid mushiness)',
    'Control poaching temperature precisely with an instant-read thermometer',
    'Add a splash of vinegar to poaching liquid for eggs (1 Tbsp per quart)',
    'For chicken breasts, start in cold liquid and slowly bring to temperature',
    'When poaching fisha court bouillon with acid helps maintain firmness',
    'Let delicate items like fish rest in turned-off poaching liquid for 1-2 minutes',
    'Butter-baste poached items just before serving for added richness',
    'Strain and freeze poaching liquid for future use (label with date and ingredients)'
  ],

  timingConsiderations: {
    eggs: 'Just barely simmering water: 3 minutes for soft yolk4-5 minutes for medium',
    fish_fillets: '8-10 minutes per inch of thickness at 170°F',
    chicken_breasts: 'Start in cold liquid15-20 minutes at 170°F until 165°F internal',
    shellfish: 'Shrimp: 2-3 minutes, Scallops: 3-5 minutes until just opaque',
    pears: '15-25 minutes depending on ripeness (test with knife)',
    apples: '10-15 minutes for slices20-30 minutes for whole',
    stone_fruits: '8-12 minutes depending on ripeness',
    whole_fish: '8-10 minutes per pound at 170°F',
    rest_period: 'Fish: 2-3 minutes in liquid, Chicken: 5-10 minutes in liquid',
    custards: '25-35 minutes at 170°F (verify with jiggle test or thermometer)',
    vegetables: 'Asparagus: 3-5 minutes, Artichokes: 20-30 minutes, test with knife' },
        doneness_indicators: {
    fish: 'Turns from translucent to opaque flesh flakes easily with fork but remains moist',
    chicken: 'No pink remains, internal temperature of 165°F juices run clear',
    eggs: 'Whites fully set but yolk remains soft and runny (or to preference)',
    shellfish: 'Shrimp turn pink and curl into C-shape (not tight O), scallops turn opaque but remain tender',
    pears: 'Knife pierces easily without resistance but fruit maintains shape',
    delicate_vegetables: 'Bright color, tender-crisp texture, slight resistance when bitten',
    custards: 'Set around edges but slight jiggle in center, knife inserted comes out clean',
    meat: 'Reaches target internal temperature but remains juicy and tender' },
        poaching_liquids: {
    court_bouillon: 'Classic aromatic liquid with wine/vinegar, mirepoix, herbs, and spices',
    milk: 'Rich, mild poaching medium that adds creaminess to fish and chicken',
    stock: 'Adds depth of flavor while maintaining clean taste profile',
    wine: 'Adds acidity and complex flavor, often diluted 50/50 with water',
    water: 'Pure, clean medium that preserves natural flavor of delicate ingredients',
    fruit_juice: 'Sweet medium for fruit poaching, often mixed with wine or water',
    tea: 'Adds tannins and aromatics, excellent for fish and fruit',
    infused_water: 'Simple water base enhanced with aromatics (herbs, citrus, spices)',
    coconut_milk: 'Rich tropical medium for seafood and fruit',
    oil: 'Low-temperature poaching in oil (confit method) for rich results' },
        presentation_techniques: {
    chilled_presentation:
      'Poached items served cold with complementary sauces (fish, poultry, eggs)',
    natural_sauce: 'Reduced poaching liquid served as sauce or jus',
    layered_composition: 'Building vertical presentations with poached item as centerpiece',
    nage_service: 'Serving poached item in small amount of its aromatic cooking liquid',
    aspic_presentation: 'Traditional preparation using clarified, gelled poaching liquid',
    sauce_mirror: 'Refined poaching liquid as base for plated presentation',
    fluid_gel_technique: 'Modern application using poaching liquid as textural element',
    paired_temperatures: 'Contrasting warm poached item with cool accompaniments',
    negative_space: 'Contemporary plating with poached item as focal point',
    herb_garnish: 'Fresh herbs that echo poaching aromatics for visual and flavor connection'
}
} as unknown as CookingMethodData,
