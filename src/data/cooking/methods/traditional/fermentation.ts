import type { CookingMethodData } from '@/types/cookingMethod';
import type { ThermodynamicProperties } from '@/types/shared';

/**
 * Fermentation cooking method
 *
 * Biological transformation of food through microbial activity
 */
export const fermentation: CookingMethodData = {;
  name: 'fermentation',
  description:
    'Biological transformation of food through controlled microbial activity, creating complex flavors, preserving foods, and enhancing nutritional value',
  elementalEffect: {
    Water: 0.3,
    Earth: 0.3,
    Air: 0.3,
    Fire: 0.1
  },
  duration: {
    min: 1440, // 24 hours
    max: 10080, // 7 days (or more for some ferments)
  },
  suitable_for: [
    'vegetables',
    'dairy',
    'grains',
    'beverages',
    'fruits',
    'meat',
    'beans',
    'soy',
    'fish',
    'tea',
    'cacao',
    'honey',
    'coffee',
    'herbs',
    'flowers',
    'spices',
    'nuts',
    'seeds',
    'root vegetables',
    'eggs'
  ],
  benefits: [
    'probiotic development',
    'enhanced nutrition',
    'natural preservation',
    'complex flavor development',
    'improved digestibility',
    'reduced anti-nutrients',
    'bioactive compound production',
    'extended shelf life',
    'reduced sugar content',
    'improved texture',
    'enzyme production',
    'reduced food waste',
    'efficient preservation without refrigeration',
    'sustainable food processing',
    'increased vitamin content',
    'antimicrobial compound production'
  ],
  astrologicalInfluences: {
    favorableZodiac: ['virgo', 'taurus', 'capricorn'] as any[],
    unfavorableZodiac: ['gemini', 'libra', 'aquarius'] as any[],
    dominantPlanets: ['Venus', 'Pluto', 'Saturn'],
    lunarPhaseEffect: {
      new_moon: 1.2, // Enhanced microbial activity
      full_moon: 0.8, // Reduced activity
      waxing_crescent: 1.1, // Good phase to begin fermentation
      waning_gibbous: 0.9, // Slowed activity
    }
  },
  toolsRequired: [
    'Fermentation vessels (glass/ceramic)',
    'Airlocks or weights',
    'pH meter',
    'Salt/brine',
    'Starter cultures (optional)',
    'Temperature control',
    'Non-reactive utensils',
    'Digital scale (1g accuracy)',
    'Fermentation weights',
    'Cheesecloth/breathable covers',
    'Thermometer',
    'Hydrometer (for alcoholic ferments)',
    'Fermentation locks',
    'Muslin bags',
    'Glass weights',
    'Siphon equipment',
    'Brewing hydrometer',
    'Mandoline (for even vegetable slicing)',
    'Food processor',
    'Ceramic crocks with water seal'
  ],
  commonMistakes: [
    'inadequate sterilization',
    'incorrect salt concentration',
    'oxygen exposure for anaerobic ferments',
    'improper temperature',
    'contamination with unwanted microbes',
    'inconsistent monitoring',
    'incorrect starter culture',
    'premature termination of fermentation process',
    'using chlorinated water',
    'using iodized salt',
    'using reactive metal equipment',
    'insufficient headspace in vessels',
    'exposure to direct sunlight',
    'inconsistent temperature environment',
    'inadequate vessel sealing',
    'improper vegetable preparation',
    'neglecting to burp containers',
    'using antibacterial soaps near ferments'
  ],
  pairingSuggestions: [
    'Fresh, raw elements for contrast',
    'Fatty components to balance acidity',
    'Herbs for brightness',
    'Complementary fermented beverages',
    'Grilled or roasted proteins',
    'Whole grains to complement enzymes',
    'Aged cheeses with vegetable ferments',
    'Nuts for textural contrast',
    'Naturally sweet elements to balance acidity',
    'Umami-rich accompaniments',
    'Fresh fruits with tangy fermented drinks',
    'Neutral starches with intensely fermented foods',
    'Crisp vegetables with creamy fermented products',
    'Fresh seafood with grain-based ferments',
    'Pungent spices with mild ferments'
  ],
  nutrientRetention: {
    probiotics: 1.2, // Increased through fermentation
    vitamins: 1.15, // Often increased, especially B vitamins
    enzymes: 1.3, // Increased
    minerals: 1.1, // More bioavailable
    antioxidants: 1.05, // Sometimes increased
    peptides: 1.25, // Increased through protein breakdown
    amino_acids: 1.15, // Enhanced through proteolysis
    b12: 1.3, // Significantly increased in some ferments
    folate: 1.4, // Increased in many vegetable ferments
    k2: 1.5, // Substantially increased
    bioactive_compounds: 1.2, // Enhanced
    organic_acids: 1.7, // Substantially increased
    bioavailable_iron: 1.2, // Enhanced absorption
    zinc: 1.1, // More bioavailable
    phenolic_compounds: 1.15, // Often increased
  },
  optimalTemperatures: {
    lacto_fermentation: 68, // In Fahrenheit
    yogurt: 110,
    kombucha: 75,
    sourdough: 75,
    kimchi: 65,
    tempeh: 86,
    kefir: 72,
    miso: 60,
    sauerkraut: 65,
    vinegar: 80,
    beer: 65,
    wine: 60,
    natto: 100,
    fish_sauce: 95,
    injera: 78,
    idli: 82,
    koji: 85,
    traditional_pickles: 68,
    cheese: 55,
    salami: 58
  },
  regionalVariations: {
    korean: ['kimchi', 'gochujang', 'doenjang'],
    european: ['sauerkraut', 'kefir', 'cheese'],
    japanese: ['miso', 'shoyu', 'natto', 'sake'],
    indian: ['dosa batter', 'idli', 'kanji'],
    middle_eastern: ['yogurt', 'kishk', 'torshi'],
    chinese: ['doubanjiang', 'suan cai', 'baijiu', 'douchi'],
    african: ['injera', 'ogi', 'kenkey', 'gari'],
    southeast_asian: ['fish sauce', 'tempeh', 'tape', 'prahok'],
    nordic: ['gravlax', 'surströmming', 'filmjölk'],
    central_american: ['tepache', 'pulque', 'pozol'],
    eastern_european: ['kvass', 'beet kvass', 'kiseli kupus'],
    caucasian: ['matsoni', 'tarhana', 'boza'],
    south_american: ['chicha', 'kefir de agua', 'manioc beer']
  },
  chemicalChanges: {
    lactic_acid_production: true,
    alcohol_production: true,
    protein_breakdown: true,
    acetic_acid_formation: true,
    carbohydrate_conversion: true,
    enzymatic_activity: true,
    volatile_compound_development: true,
    biogenic_amine_formation: true,
    gas_production: true,
    phenolic_transformation: true,
    lipid_oxidation: true,
    vitamin_synthesis: true,
    'anti-nutrient_reduction': true,
    bacteriocin_production: true,
    melanoidin_formation: true
  },
  safetyFeatures: [
    'pH monitoring',
    'Proper salt concentration',
    'Anaerobic environment for many ferments',
    'Clean equipment and workspace',
    'Controlled temperature',
    'Regular inspection for unwanted molds',
    'Appropriate vessel headspace',
    'Cross-contamination prevention',
    'Careful starter culture handling',
    'Hygiene during sampling',
    'Proper storage post-fermentation',
    'Monitoring for off-odors or abnormal appearance',
    'Absence of metal contamination',
    'Appropriate vessel pressure management',
    'Avoiding excessive fermentation times',
    'Using food-grade ingredients'
  ],
  thermodynamicProperties: {
    heat: 0.2, // Low heat, often ambient temperature
    entropy: 0.7, // High transformation through biological activity
    reactivity: 0.65, // Significant biochemical reactions
    gregsEnergy: -0.75, // Calculated using heat - (entropy * reactivity), // Calculated using heat - (entropy * reactivity)
  } as ThermodynamicProperties,

  // Additional metadata
  history:
    'Fermentation is one of humanity\'s oldest food preservation methods, dating back at least 10,000 years. Every culture developed fermentation techniques, from wine and beer to bread, cheese, and preserved vegetables. It was critical for food security before refrigeration. Archaeological evidence suggests that fermented beverages predate agriculture, with fermented honey drinks (mead) possibly being one of the earliest alcoholic beverages. The scientific understanding of fermentation began with Antonie van Leeuwenhoek\'s microscopic observations in the 17th century, followed by Louis Pasteur\'s groundbreaking work in the 19th century that identified microorganisms as the agents of fermentation. The 20th century saw industrialization of many fermentation processes, while the 21st century has brought renewed interest in traditional fermentation techniques and their health benefits.',

  scientificPrinciples: [
    'Microbial conversion of sugars to acids, alcohols, or gases',
    'Selective pressure through environmental conditions (saltpH, oxygen)',
    'Competitive inhibition of pathogenic bacteria',
    'Enzymatic breakdown of complex molecules',
    'Succession of microbial communities over time',
    'Production of flavor compounds through metabolic pathways',
    'Anaerobic vs. aerobic metabolic processes',
    'Substrate-specific microbial selection',
    'pH reduction as protective mechanism',
    'Antimicrobial compound production by beneficial microbes',
    'Proteolysis improving protein digestibility',
    'Biological detoxification of harmful compounds',
    'Secondary metabolite production',
    'Biofilm formation in microbial communities',
    'Cross-feeding between microbial species',
    'Enzymatic conversion of phenolic compounds',
    'Symbiotic relationships between yeasts and bacteria'
  ],

  modernVariations: [
    'Controlled starter cultures for consistency',
    'Temperature-controlled fermentation chambers',
    'Novel vessel designs for oxygen control',
    'pH and Brix monitoring for precision',
    'Fermentation of non-traditional ingredients',
    'Accelerated fermentation through specialized cultures',
    'Precision-controlled humidity environments',
    'Molecular analysis for microbial profile verification',
    'Biofortification through specific strains',
    'Co-fermentation of multiple substrates',
    'Sequential inoculation techniques',
    'Customized fermentation for medicinal properties',
    'Designer microbial communities for specific attributes',
    'Integration with other preservation techniques',
    'Continuous fermentation systems',
    'Vacuum-sealed fermentation',
    'Pressure-regulated fermentation vessels'
  ],

  sustainabilityRating: 0.95, // Very high - low energy, traditional preservation method

  equipmentComplexity: 0.4, // Basic equipment needed but knowledge is critical

  healthConsiderations: [
    'Increases probiotic content supporting gut health',
    'Improves bioavailability of nutrients',
    'Reduces anti-nutrients in some foods',
    'May help with food sensitivities and digestion',
    'Can produce histamines which some people are sensitive to',
    'Supports immune system function',
    'Potential to improve metabolic health',
    'May reduce inflammation in the digestive tract',
    'Can contribute to healthier microbiome diversity',
    'Generates bioactive peptides with health benefits',
    'Some ferments produce vitamin K2 and B12',
    'May improve mineral absorption, particularly iron and zinc',
    'Can help regulate appetite and satiety',
    'Potential role in brain-gut axis communication',
    'May reduce foodborne pathogens in properly fermented foods',
    'Can contribute to reduced glycemic response'
  ],

  expertTips: [
    'For vegetable ferments, use 2% salt by weight for optimal fermentation',
    'Maintain temperature of 65-72°F (18-22°C) for balanced flavor development in most vegetable ferments',
    'For kefir, avoid metal utensils which can damage the SCOBY',
    'In sourdough, maintain starter at equal weights of flour and water for balanced acidity',
    'When making miso, ensure salt concentration is at least 5% to prevent unwanted microbes',
    'For kimchi, short fermentation (3-5 days) at room temperature followed by refrigeration creates balanced flavors',
    'Use non-chlorinated, non-distilled water for fermentation to provide necessary minerals',
    'For kombucha, maintain a pH between 2.5-3.5 for best flavor and safety',
    'Weigh ferments down below brine level to maintain anaerobic conditions',
    'Ferment chili peppers with 3-5% salt to develop complex hot sauce flavors',
    'For kefir, optimum culturing occurs at 68-74°F (20-23°C) for 24 hours',
    'In cheese making, maintaining specific humidity levels is as important as temperature',
    'For tempeh, maintain 85-88°F (29-31°C) with adequate ventilation for proper mycelium growth',
    'Use wooden rather than plastic tools for sourdough to nurture beneficial microbial environment',
    'For yogurt, pre-heat milk to 180°F (82°C) before cooling to incubation temperature to denature proteins',
    'When making sauerkraut, core removal and fine shredding promote better juice extraction',
    'For koji, maintain 80-85% humidity for optimal enzyme development'
  ],

  ingredientPreparation: {
    vegetables:
      'For lacto-fermentation, shred finely for sauerkraut-style or cut into uniform pieces for pickles. Remove cores, stems, and damaged areas. Salt at 2-2.5% by vegetable weight. Massage salt into vegetables until enough brine is released to submerge. For harder vegetables, consider pre-slicing or grating to increase surface area. Add 1 cabbage leaf on top to keep smaller pieces submerged.',
    dairy:
      'For yogurt, heat milk to 180°F (82°C) for 30 minutes to denature proteins, then cool to 110°F (43°C) before adding culture. Maintain temperature for 4-12 hours. For cheese, use non-homogenized milk when possible. For kefir, use milk at room temperature and add 2-3 tablespoons of grains per quart. UHT/ultra-pasteurized milk is not ideal as it lacks certain proteins.',
    grains:
      'For sourdough, maintain starter with equal weights flour and water (100% hydration). Feed every 12-24 hours at room temperature or weekly in refrigerator. For koji, steam rice until core is no longer hard but maintains integrity, cool to 100°F (38°C) before inoculating with spores. For tempeh, partially cook beans, cool, add vinegar, and inoculate with starter.',
    fruits:
      'For fruit wines, crush fruits and test brix level, adjusting sugar if needed. Add pectic enzyme to break down cell walls. For fruit vinegars, ferment to alcohol first, then introduce mother of vinegar. For fruit-based ferments, lower salt content (1-1.5%) than vegetable ferments is often appropriate.',
    meats:
      'For salami, grind meat while partially frozen, add 2.5-3% salt, cure #2, and appropriate starter cultures. Maintain 85-90% humidity during fermentation. For fish sauce, layer fresh fish with 20-30% salt by weight. Maintain anaerobic conditions for months. Keep fermentation temperature under 100°F (38°C) for safety.',
    beverages:
      'For kombucha, brew tea, add 5-10% sugar, cool to room temperature, add SCOBY and 10-20% mature kombucha as starter. For kefir, maintain grains with regular transfers to fresh milk. For natural wines, avoid sulfites and maintain careful cleanliness rather than sterilization.',
    legumes:
      'For tempeh, boil beans, cool, add vinegar to acidify, inoculate with Rhizopus cultures. For miso, cook beans until soft, combine with koji and salt (5-12% depending on intended aging time). For doenjang, form blocks first, allow to grow mold, then soak in brine.',
    sourdough:
      'Maintain starter at peak activity (doubled in size, domed top). Use 20% starter in dough for balanced flavor. Autolyse flour and water before adding starter and salt. Cold fermentation (38-42°F/3-6°C) for 12-24 hours develops flavor complexity without excessive acidity.'
  },

  timingConsiderations: {
    vegetable_ferments:
      'Sauerkraut: 1-4 weeks at 65-72°F (18-22°C); kimchi: 3-7 days at room temperature then refrigerate; pickles: 1-2 weeks. Monitor daily at first, less frequently after pH drops below 4.0. Warmer temperatures accelerate acid production but may develop less complex flavors. Full flavor development often takes months in cool storage.',
    dairy_ferments:
      'Yogurt: 4-12 hours; kefir: 12-48 hours depending on temperature; cheese: varies widely from 30 minutes (fresh cheese) to years (aged cheese). Temperature control critical: higher causes faster acidification but potential off-flavors, lower develops richer flavors but takes longer.',
    alcoholic_ferments:
      'Beer: primary 1-2 weeks, secondary 2-12 weeks; wine: primary 1-3 weeks, aging 3 months to years; mead: 2-4 weeks primary, months to years aging. Lager requires cool fermentation (45-55°F/7-13°C) for extended period; ales ferment warmer (60-72°F/15-22°C) more quickly.',
    grain_ferments:
      'Sourdough: starter maintenance every 12-24 hours at room temperature; dough proof 3-5 hours or 12-18 hours refrigerated; koji: 36-48 hours at 86°F (30°C); tempeh: 24-48 hours at 86-88°F (30-31°C).',
    maturation_periods:
      'Miso: 3 months to 3+ years, soy sauce: 6 months to 3+ years, vinegar: 2-6 months, aged salami: 1-6 months. Long maturation at cool temperatures develops deeper, more complex flavors through slow enzymatic activity. Accelerated high-temperature fermentation often results in simpler flavor profiles.',
    seasonal_considerations:
      'Spring and fall offer moderate temperatures ideal for many fermentations. Summer requires more cooling control, winter may require warming. Humidity impacts evaporation rate and mold development, particularly for surface-ripened ferments. Traditional timing often aligned with harvest seasons for optimal ingredient quality.'
  },

  doneness_indicators: {
    taste_profile:
      'Balance of acid, sweetness, salt, and umami; absence of yeasty, putrid, or overly alcoholic notes; complexity rather than one-dimensional flavor. Development of desired aromatic compounds specific to the ferment type.',
    texture_changes:
      'Vegetables maintain crispness with translucent appearance; bread dough increases in elasticity and gas retention; dairy thickens appropriately; meat develops firm texture with appropriate moisture loss in dry curing.',
    visual_cues:
      'Active bubbling during initial fermentation, appropriate color development; clear liquid with settled sediment in many liquid ferments; surface changes specific to ferment type (bloom on cheese, pellicle on kombucha).',
    pH_levels:
      'Vegetable ferments: below 4.0 for safety, typically 3.4-3.8 for flavor balance; dairy ferments: yogurt 4.0-4.5, cheese varies by type, sourdough: 3.8-4.5, kombucha: 2.5-3.5.',
    aroma_development:
      'Complex, often fruity, dairy, floral or umami notes replacing raw material smells, absence of putrid, overly alcoholic, or cleaning chemical smells. Specific desirable aromatic compounds for each ferment.',
    acidity_balance:
      'Lactic acid provides roundness and depth, acetic acid provides sharpness and higher notes, butyric acid (when appropriate) provides richness. Balance depends on ferment type and regional preferences.',
    microbial_succession:
      'Progression through expected phases of fermentation: initial rapid growth phase, followed by slowing activity, and finally maturation phase with minimal visible activity but continued enzymatic processes.'
  },

  ingredientInteractions: {
    salt_effects:
      'Creates selective pressure favoring salt-tolerant microbes like Lactobacillus while inhibiting pathogens. Above 10% primarily favors yeast activity. Traditional ranges: vegetables (1.5-3%), cheese (1-5%), bread (1.8-2.2% of flour weight), meat ferments (2.5-3.5%).',
    sugar_concentration:
      'Provides food for microbes, influencing rate of fermentation and final product. Higher concentrations (above 55%) become preservative, inhibiting most microbial activity. In vegetable ferments, natural sugars are converted to acidsin beverages, determines potential alcohol content.',
    protein_breakdown:
      'Proteolysis during fermentation breaks proteins into peptides and amino acids, enhancing digestibility and flavor (especially umami). Particularly important in soy, dairy, and meat ferments. Different microbial strains produce distinct proteolytic enzyme profiles.',
    tannin_impact:
      'Tannins from tea, grape skins, etc. can inhibit certain microbes while encouraging others. Provide structure in fermented beverages. Can bind to proteins, affecting texture development in both positive and negative ways depending on concentration.',
    spice_influence:
      'Many spices have antimicrobial properties that selectively inhibit certain organisms. Examples: garlic inhibits some yeasts, cloves affect gram-negative bacteria, cinnamon has broad antimicrobial effects. Can significantly alter microbial succession patterns.',
    acidity_development:
      'Progressive acid development inhibits less acid-tolerant organisms, creating succession of microbial communities. Initial pH of substrate influences which organisms dominate first. Buffering capacity of ingredients affects rate of perceived acidity change.',
    vegetable_enzyme_activity:
      'Natural plant enzymes remain active in early fermentation, contributing to texture and flavor before microbial activity dominates. Some vegetables (cabbage, garlic) contain more naturally beneficial compounds for fermentation.',
    mineral_availability:
      'Minerals act as cofactors for microbial enzymes. Calcium strengthens cell walls in vegetable ferments maintaining crispness. Traditional use of mineral-rich water sources (spring water) can affect fermentation outcomes.',
    oxygen_exposure:
      'Determines whether aerobic or anaerobic processes dominate. Surface yeasts and molds require oxygen, lactic acid bacteria are facultative anaerobes, acetobacter requires oxygen for converting alcohol to acetic acid.',
    phenolic_compounds:
      'Present in many plant materials, can be transformed during fermentation into more bioavailable forms with enhanced health benefits. Some inhibit certain microbes while encouraging others, acting as natural selectors.'
  },

  technicalNotes: {
    microbial_communities: {
      lactic_acid_bacteria:
        'Lactobacillus, Leuconostoc, Pediococcus, and others convert sugars primarily to lactic acid. Key in vegetable ferments, dairy, sourdough, and many traditional fermentations. Homofermentative species produce primarily lactic acid, heterofermentative produce lactic acid plus carbon dioxide and acetic acid/ethanol.',
      yeasts:
        'Saccharomyces, Brettanomyces, Candida, and others convert sugars to alcohol and carbon dioxide. Important in bread, beer, wine, kefir, kombucha. Different strains contribute distinct flavor profiles and alcohol tolerance levels.',
      acetic_acid_bacteria:
        'Acetobacter and Gluconobacter convert alcohol to acetic acid. Essential for vinegar production, contribute to kombucha, natural wine complexity, and some traditional foods. Require oxygen for metabolism.',
      molds:
        'Aspergillus, Penicillium, Rhizopus, and others grow on surfaces providing enzymatic activity. Critical for koji, cheese (blue, Camembert), tempeh, traditional meat curing. Some produce mycotoxins, so specific food-safe strains are essential.',
      bacillus:
        'Alkaline-tolerant bacteria important in foods like natto, traditional fish ferments, and some African alkaline grain ferments. Produce sticky biofilms and distinctive strong flavors.'
    },
    equipment_considerations: {
      vessel_materials:
        'Glass and food-grade ceramics are non-reactive and preferred for most ferments. Wood adds microbial complexity through porous surface harboring cultures. Avoid reactive metals (aluminum, copper) which can be corroded by acids and affect flavor.',
      airlock_systems:
        'Water-sealed crocks, one-way valve systems, or simple weighted lids maintain anaerobic environment while allowing gas escape. Critical for vegetable fermentation and some alcoholic ferments.',
      temperature_control:
        'Dedicated fermentation chambers with heating/cooling capability, water bath systems; insulated containers, traditional root cellars or spring houses. Temperature stability often more important than exact value.',
      humidity_regulation:
        'Critical for surface-ripened cheeses, mold-based ferments, and dry-cured meats. Traditional solutions include limestone caves, modern approaches use humidity-controlled chambers.',
      measuring_tools:
        'pH meters, acid titration kits, hydrometers for sugar/alcohol content, thermometers, salinity refractometers. Improve consistency and safety across batches.'
    },
    fermentation_phases: {
      initiation:
        'First 24-72 hours when preferred microbes establish dominance. Often characterized by pH shift, carbon dioxide production, and visible activity. Critical period for success or failure of the ferment.',
      primary_fermentation:
        'Main active phase when bulk of sugar-to-acid or sugar-to-alcohol conversion occurs. Typically 3-14 days for many ferments. Most dramatic flavor and texture changes occur here.',
      secondary_fermentation:
        'Slower phase after initial nutrient sources depleted. More subtle flavor development through enzymatic activity and microbial byproduct reactions. Can last weeks to months.',
      maturation:
        'Final phase with minimal active fermentation but continued enzymatic activity and flavor compound development. Critical for complexity in aged products. Months to years depending on product.'
    },
    safety_parameters: {
      acidity_control:
        'pH below 4.6 inhibits Clostridium botulinum and most pathogens. Most successful ferments achieve pH 3.5-4.2. Regular monitoring especially important in early stages.',
      competitive_exclusion:
        'Establishing desired microbes quickly creates environment inhibiting pathogens through competition for resources, production of antimicrobial compounds, and rapid pH change.',
      moisture_regulation:
        'Water activity (aw) below 0.85 inhibits most pathogenic bacteria. Critical parameter in dry-cured products. Salt concentration affects available water.',
      salt_concentration:
        'Minimum inhibitory levels: 2% for most vegetables, 3.5% for most protein-rich substrates. Traditional ranges established empirically over centuries for each food type.',
      cross_contamination:
        'Physical separation of raw ingredients from active ferments. Dedicated utensils and equipment. Proper cleaning protocols between batches.'
    },
    preserving_cultures: {
      mother_cultures:
        'Maintaining continuous living cultures (sourdough starter, kombucha SCOBY, kefir grains) through regular feeding/transfer. Traditional approach passed through generations.',
      freezing:
        'Effective for many bacterial cultures and yeasts. Mix with glycerol for best viability. Quick freezing at -20°C or lower preferred.',
      drying:
        'Traditional technique for sourdough starters, yogurt cultures. Spread thin layer on parchment and dry at low temperature, then store in airtight container.',
      rotation_system:
        'Maintaining multiple backups of important cultures, regularly refreshing each. Common in professional and traditional settings.',
      commercial_starters:
        'Freeze-dried or frozen pure or mixed cultures with defined properties. Ensure viability by checking production date and proper storage.'
    }
  }
};
