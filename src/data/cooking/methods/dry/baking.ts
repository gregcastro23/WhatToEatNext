import type { 
  ZodiacSign, 
  ThermodynamicProperties
} from '@/types/shared';

import type { CookingMethodData } from '@/types/cookingMethod';

/**
 * Baking cooking method
 * 
 * Cooking by surrounding food with dry heat in an enclosed oven or similar environment
 */
export const baking: CookingMethodData = {
  name: 'baking',
  description: 'Cooking food by exposing it to dry heat in an enclosed space, typically in an oven, producing even heat distribution and caramelization',
  elementalEffect: {
    Fire: 0.4,
    Air: 0.3,
    Earth: 0.2,
    Water: 0.1
  },
  duration: {
    min: 20,
    max: 180
  },
  suitable_for: ['breads', 'pastries', 'casseroles', 'meat', 'vegetables', 'desserts', 'gratins'],
  benefits: ['even cooking', 'develops flavors', 'retains moisture', 'creates textures', 'minimal attention required'],
  astrologicalInfluences: {
    favorableZodiac: ['leo', 'aries', 'sagittarius'] as ZodiacSign[],
    unfavorableZodiac: ['cancer', 'pisces', 'scorpio'] as ZodiacSign[],
    dominantPlanets: ['Sun', 'Mars'],
    lunarPhaseEffect: {
      'full_moon': 1.2, // Enhanced rising 
      'new_moon': 0.8,  // Reduced rising
      'waxing_gibbous': 1.1, // Moderate enhancement
      'waning_gibbous': 0.9  // Slight reduction
    }
  },
  toolsRequired: [
    'Oven',
    'Baking sheet',
    'Baking dish',
    'Parchment paper',
    'Wire rack',
    'Oven thermometer',
    'Digital probe thermometer',
    'Silicone baking mats',
    'Baking stone/steel (for bread and pizza)'
  ],
  commonMistakes: [
    'over-mixing dough (leads to tough gluten development)',
    'incorrect oven temperature (often runs 25°F off from display)',
    'premature door opening (causing temperature fluctuations and collapse)',
    'improper rack positioning (affects browning and heat distribution)',
    'forgetting to preheat (critical for proper rise and texture)',
    'overcrowding the oven (restricts air circulation)',
    'ignoring carryover cooking (food continues cooking after removal)'
  ],
  pairingSuggestions: [
    'Fermented fruit compotes with spiced cakes',
    'Herb-infused honeys with cornbread or scones',
    'Smoked salts on focaccia or roasted vegetables',
    'Compound butters with freshly baked breads',
    'Balsamic reduction with roasted root vegetables',
    'Cultured crème fraîche with fruit cobblers'
  ],
  nutrientRetention: {
    carbohydrates: 0.85,
    proteins: 0.75,
    vitamins: 0.65,
    minerals: 0.80
  },
  optimalTemperatures: {
    'bread': 425, // Begins at 450°F with steam, reduces to 400°F
    'cookies': 350, // Chewy cookies at 325°F, crisp cookies at 375°F
    'cake': 325, // Pound cakes at 350°F, light sponges at 325°F
    'roast vegetables': 400, // Dense root vegetables at 425°F, delicate at 375°F
    'pizza': 500, // Neapolitan style up to 800°F, NY style at 500-550°F
    'fish': 375, // Whole fish at 350°F, fillets at 400°F
    'poultry': 375, // Dark meat at 350°F, white meat at 375°F
    'beef': 350, // Prime rib at 225-250°F, roasts at 350°F
    'pork': 350, // Tenderloin at 400°F, shoulder at 300°F
    'pastry': 400, // Puff pastry at 400°F, shortcrust at 375°F
    'custards': 325, // Never exceed 350°F to prevent curdling
    'meringues': 225, // Slow-dry at 200-225°F for crisp exterior
    'fruit desserts': 350 // Crisps, cobblers, and pies
  },
  regionalVariations: {
    french: ['bain-marie (water bath for custards)', 'en papillote (wrapped in parchment)', 'pâte feuilletée (laminated doughs)'],
    middleEastern: ['tannur oven baking (clay oven)', 'taboon (flatbread baking)', 'kunafa (syrup-soaked pastry technique)'],
    japanese: ['mushipan steaming (hybrid steamed cake)', 'dorayaki (bean-filled pancake)', 'melon pan (textured sweet buns)'],
    italian: ['wood-fired oven baking (for pizza and focaccia)', 'panettone fermentation (enriched holiday bread)', 'biscotti (twice-baked cookies)'],
    nordic: ['rye bread techniques', 'slow fermentation methods', 'cardamom-infused pastries'],
    american: ['sheet pan cooking', 'drop biscuits', 'deep dish pies']
  },
  chemicalChanges: {
    'maillard_reaction': true, // Occurs between 280°F-330°F with proteins and reducing sugars
    'caramelization': true, // Begins around 320°F with simple sugars
    'gelatinization': true, // Starch granules absorb water and swell at 140°F-160°F
    'protein_denaturation': true, // Proteins change structure and set at 140°F-165°F
    'enzymatic_browning': false, // Limited in baking due to heat inactivation
    'hydrolysis': true, // Breaking down of complex molecules in presence of water
    'fermentation': true // In yeast-leavened products before baking
  },
  safetyFeatures: [
    'Monitor internal temperature with thermometer (145°F for whole cuts, 165°F for poultry)',
    'Use oven mitts or heat-resistant gloves to prevent burns',
    'Allow for proper ventilation to avoid moisture buildup',
    'Position racks away from heating elements to prevent fires',
    'Use oven-safe containers and check temperature ratings of equipment',
    'Never leave unattended for extended periods'
  ],
  thermodynamicProperties: {
    heat: 0.65,       // Moderate-high heat penetrating the food
    entropy: 0.55,    // Moderate breakdown of structures, protein denaturation
    reactivity: 0.70, // Significant Maillard reactions, caramelization
    gregsEnergy: 0.65 - (0.55 * 0.70)      // Calculated using heat - (entropy * reactivity)
  } as ThermodynamicProperties,
  
  // Additional metadata
  history: 'Baking is one of the oldest cooking methods, dating back to ancient civilizations that used hot stones and primitive ovens. Egyptian tomb paintings depict bakeries from 2600-2100 BCE, and the Romans elevated bread baking to a sophisticated craft with professional baker guilds (pistores) by 168 BCE. The Industrial Revolution transformed baking with standardized ovens and mechanized mixing. Modern innovations like convection, steam-injection, and computer-controlled ovens have refined the technique further, while artisanal baking has experienced a renaissance, returning to traditional methods and natural fermentation.',
  
  scientificPrinciples: [
    'Convection heat transfer through air (primary method in conventional ovens)',
    'Radiation from heating elements (contributes to surface browning)',
    'Conduction through baking vessels (creates bottom crusts)',
    'Maillard reaction occurs at 280°F-330°F producing browning and complex flavors',
    'Caramelization of sugars at 320°F-360°F creates nutty, sweet compounds',
    'Protein denaturation and coagulation sets structure in egg-based goods at 144°F-180°F',
    'Starch gelatinization in presence of moisture creates structure at 140°F-160°F',
    'Leavening action from chemical agents (CO2 gas formation), yeast fermentation, or steam expansion',
    'Gelatinization of starches in flour creates structure as granules absorb water and swell',
    'Water evaporation creates steam that contributes to rising and texture development',
    'Glass transition of sugar at varying temperatures affects texture and crispness'
  ],
  
  modernVariations: [
    'Convection baking with fan-assisted air circulation (reduces cooking time by 25%)',
    'Steam-injection baking for artisan breads (creates gelatinized crusts)',
    'Sous-vide followed by flash baking for proteins (perfect doneness with surface browning)',
    'Low-temperature overnight baking (typically 200°F-250°F for complex flavor development)',
    'Combi oven baking with controlled humidity levels (precise moisture management)',
    'Microwave-assisted baking for faster cooking with less surface browning',
    'Vacuum baking for reduced-pressure environments (changes boiling points)',
    'Pressure baking in specialized equipment for accelerated cooking',
    'Induction baking with specialized pans for direct energy transfer',
    'Smart ovens with temperature sensors and AI-controlled adjustments',
    'Wood-fired ovens with thermal mass for extended heat retention and unique flavor'
  ],
  
  sustainabilityRating: 0.75, // Relatively efficient in energy usage compared to other cooking methods
  
  equipmentComplexity: 0.45, // Basic ovens are simple, but specialized equipment adds complexity
  
  healthConsiderations: [
    'Lower fat cooking method compared to frying (can reduce calories)',
    'Potential acrylamide formation at high temperatures with starchy foods (temps over 340°F)',
    'Can be adapted for low-fat and whole-grain preparations (reduces refined carbs)',
    'Nutrient preservation in enclosed environment (minimizes oxidation loss)',
    'Sealed environments can reduce nutrient oxidation (vitamin preservation)',
    'Gluten formation considerations for sensitivity and celiac disease',
    'Fat-soluble vitamin preservation (A, D, E, K) enhanced by proper temperature control',
    'Beneficial Maillard compounds provide antioxidant properties in crust formation',
    'Ability to use alternative flours and grains for increased nutritional value',
    'Loss of heat-sensitive nutrients (particularly water-soluble vitamins) with extended baking times'
  ],
  
  expertTips: [
    'Rest dough in refrigerator for 12-24 hours to develop flavor and relax gluten',
    'Use an oven thermometer to verify actual temperature vs. display reading (often 25°F difference)',
    'For even browning, rotate baked goods halfway through cooking time',
    'Create steam for bread by placing a shallow pan of water on bottom rack or spritzing oven walls',
    'Shield edges of pies or delicate items with foil to prevent over-browning',
    'For perfect cookies, remove when edges are set but centers still appear slightly undercooked',
    'Let roasted meats rest for 10-15 minutes per pound to redistribute juices before carving',
    'Cold ingredients straight from refrigerator will increase cooking time by approximately 5-10 minutes',
    'Use light-colored baking sheets for delicate items, dark ones for items needing more browning',
    'Add a cast iron pan to the oven while preheating for better heat stability',
    'Blind bake pie crusts with dry beans or weights to prevent bubbling',
    'For perfect browning, brush enriched dough with egg wash (whole egg for golden, yolk for deep golden, white for shine)',
    'Use a spray bottle of water for artisan bread to create steam during the first 10 minutes',
    'For cake doneness, press lightly with finger - it should spring back without leaving an impression',
    'Use a baking stone or steel preheated for an hour to simulate brick oven conditions'
  ],
  
  ingredientPreparation: {
    'flour': 'Sift to aerate and remove lumps; proper measuring by weight is critical (1 cup ≈ 120-130g). For bread, high protein content (12%+). For pastry, low protein content (8-10%). For enriched doughs, bread flour.',
    'butter': 'For pastry, keep cold (35-40°F) for flakiness; for creaming, soften to 65-68°F. European butter (higher butterfat content) preferred for laminated doughs. Use unsalted for precision control of salt content.',
    'eggs': 'Bring to room temperature (65-70°F) for better volume and incorporation. Size matters - recipes typically assume large eggs (about 50g). Separate while cold, whip whites at room temperature for greater volume.',
    'meat': 'Pat dry thoroughly before roasting; season 1-24 hours in advance for better penetration. Bring to room temperature before baking. Truss or tie roasts for even cooking. Consider dry brining 24-48 hours for improved moisture retention.',
    'vegetables': 'Cut to uniform sizes; toss with oil to promote even browning. Consider parcooking dense vegetables. Higher water content vegetables benefit from salting to remove excess moisture. Roast on preheated sheet pans for better browning.',
    'fruits': 'For pies, macerate with sugar and drain excess juice to prevent soggy bottoms. Toss with acid (lemon juice) to prevent oxidation. For roasting, choose firmer varieties that hold shape. Spices intensify sweetness without added sugar.',
    'leavening agents': 'Test baking powder for activity in warm water; replace every 6 months. Baking soda requires acid to activate. Yeast proofing shows viability - bubbles should form within 10 minutes in warm water with sugar. Store yeast in freezer for extended life.',
    'salt': 'Diamond Crystal kosher salt is half as dense as table salt; adjust measurements accordingly. Salt inhibits yeast activity in direct contact; add after initial fermentation begins for better rise. Fine sea salt distributes evenly in doughs.',
    'sugar': 'Granulated for creaming, superfine for meringues, brown for moisture and molasses flavor. Hygroscopic properties affect texture and moisture retention. Invert sugar (honey, corn syrup) improves browning and extends shelf life.'
  },
  
  timingConsiderations: {
    'rest_before': 'Allow meat to come to room temperature for 30-60 minutes before baking. Rest dough for gluten relaxation: 30 minutes for cookies, 1 hour for pie dough, 8-24 hours for bread dough. Autolyse flour and water 20-30 minutes before adding salt and yeast.',
    'rest_after': 'Rest most proteins for 5-15 minutes after baking to reabsorb juices. Carryover cooking raises internal temperature 5-15°F. For large roasts, tent with foil and rest 30-45 minutes. Bread requires cooling for 1-2 hours before slicing to complete starch gelatinization and prevent gumminess.',
    'cooling_periods': 'Cool cakes in pan for 10 minutes, then on rack; breads until internal temp reaches 90-95°F. Cookies firm up on sheet pan for 2-3 minutes before transferring to rack. Quick breads benefit from aging overnight for flavor development.',
    'carryover_cooking': 'Large roasts temperature will rise 5-15°F after removal from oven. For medium-rare beef, remove at 125-130°F to achieve 135-140°F final temperature. Poultry may rise 5-10°F. Custards continue setting as they cool.',
    'resting_dough': 'Refrigerate cookie dough 24-36 hours for deeper flavor; pizza dough 2-5 days. Sourdough bread benefits from 12-24 hour cold fermentation. Enriched doughs require 8-12 hours refrigeration for flavor development. Pâte feuilletée (puff pastry) requires 30-minute rests between folds.'
  },
  
  doneness_indicators: {
    'bread': 'Internal temperature of 190-210°F; hollow sound when tapped on bottom. For enriched breads, 185-190°F. For crusty artisan loaves, 205-210°F. Golden brown crust, with visible spring and open crumb structure.',
    'cakes': 'Toothpick inserted in center comes out clean or with a few moist crumbs. Sides begin to pull away from pan. Springs back when lightly pressed. Internal temperature 200-205°F for butter cakes, 190-195°F for oil-based cakes.',
    'cookies': 'Edges set but centers slightly soft; will firm upon cooling. Color indicates doneness - golden for shortbread, medium brown for chocolate chip. For chewy cookies, they should look slightly underdone in center when removed.',
    'meats': 'Use digital thermometer: beef medium-rare 130-135°F, chicken 165°F, pork 145°F. Visual cues include color change, juice clarity, and firmness to touch. Beef rare: 120-125°F, medium: 135-145°F, well-done: 150°F+.',
    'vegetables': 'Fork should pierce easily; light caramelization on edges. Visible wrinkling of skin on roasted peppers. Root vegetables should yield easily to knife with slight resistance. Green vegetables remain vibrant with slight darkening.',
    'pastry': 'Puff pastry should have visible layers and golden color. Pie crust golden brown with no translucent areas. Shortcrust pale golden with firm texture. Enriched doughs deep golden with hollow sound when tapped.',
    'custards': 'Slight wobble in center but set edges. Will firm further upon cooling. Should reach internal temperature of 170-175°F for food safety. Visible thickening and coating the back of a spoon when using as sauce base.'
  },
  
  ingredientInteractions: {
    'acids_and_bases': 'Acids inhibit browning; baking soda neutralizes acid and promotes browning. Buttermilk, yogurt, and sour cream provide both moisture and acidity, requiring baking soda for leavening. Citric acid prevents oxidation in fruit fillings.',
    'sugars': 'Increase tenderness and browning; liquid sugar (honey, maple) increases moisture. Competes with flour for liquid, affecting structure. Hygroscopic properties extend shelf life by retaining moisture. Invert sugars (honey, corn syrup) inhibit crystallization.',
    'fats': 'Create flakiness in pastry; enhance mouthfeel; delay gluten formation. Solid fats create distinct layers in laminated doughs. Liquid oils produce more tender crumb but less structure. Fat coats flour particles, limiting gluten development for tenderness.',
    'proteins': 'Set structure when heated; create browning reactions with sugars. Egg proteins coagulate at different temperatures: yolks 149-158°F, whites 140-149°F. Gluten development provides structure and chew, particularly in bread. Milk proteins contribute to browning.',
    'starches': 'Absorb moisture; provide structure; gelatinize when heated with moisture. Different starches gelatinize at different temperatures: wheat 140-158°F, cornstarch 155-158°F. Pre-gelatinized starches (modified) thicken without heat. Starch retrogradation causes staling.',
    'salt': 'Strengthens gluten; enhances flavor; controls yeast activity; affects browning. Salt tightens gluten structure for better gas retention in bread. Inhibits yeast activity when in direct contact. Contributes to flavor perception of sweetness without adding sugars.'
  },
  
  technicalNotes: {
    'oven_types': {
      'conventional': 'Heat from bottom and/or top elements with natural air circulation. Hot spots common, requiring rotation of baked goods.',
      'convection': 'Forced air circulation with fan, producing even heat distribution. Reduces cooking time by 25% and temperature by 25°F from conventional recipes.',
      'gas': 'More humid environment than electric, affecting crust development. Temperature fluctuations common with thermostat cycling.',
      'electric': 'More consistent heat with less moisture than gas. Better for precision baking of delicate items.',
      'combi': 'Combines convection with steam injection for precise humidity control. Professional standard for bread baking.',
      'wood_fired': 'Thermal mass provides heat retention. Temperature gradient from back (hottest) to front. Radiant heat from dome produces rapid surface cooking.',
      'steam_injected': 'Introduces humidity during initial baking phase. Critical for proper expansion and crust development in artisan breads.'
    },
    'flour_types': {
      'bread_flour': '12-14% protein content. High gluten formation for structure in yeasted breads.',
      'all_purpose': '10-12% protein. Versatile for most baking applications.',
      'cake_flour': '7-9% protein. Low gluten, high starch for tender cakes and pastries.',
      'pastry_flour': '8-10% protein. Intermediate between cake and all-purpose flour.',
      'whole_wheat': 'Contains entire wheat kernel. Higher protein but bran particles interrupt gluten development.',
      '00_flour': 'Italian classification for finely ground flour. Variable protein content depending on type.',
      'gluten_free_blends': 'Combinations of rice, tapioca, potato, and other non-wheat flours with stabilizers.'
    },
    'leavening_agents': {
      'baking_soda': 'Sodium bicarbonate (NaHCO3). Requires acid to activate. Acts immediately upon mixing and exposure to heat.',
      'baking_powder': 'Combination of sodium bicarbonate and acid salts. Double-acting reacts at room temperature and again with heat.',
      'yeast': 'Living organism producing CO2 through fermentation. Contributes flavor through fermentation byproducts. Requires proofing time.',
      'steam': 'Physical leavening from water expanding as it converts to gas. Primary agent in puff pastry, choux paste, and popovers.',
      'eggs': 'Mechanical leavening from incorporated air, particularly in whipped whites or whole eggs.'
    },
    'mixing_methods': {
      'creaming': 'Beating fat and sugar to incorporate air before adding remaining ingredients. Creates fine, tender crumb in cakes and cookies.',
      'rubbing': 'Incorporating fat into flour by hand until crumbly. Used for biscuits, scones, and shortcrust pastry.',
      'muffin_method': 'Combining wet and dry ingredients separately, then mixing minimally. Produces coarser crumb with tunnels.',
      'reverse_creaming': 'Coating flour particles with fat before adding liquid. Creates fine, velvety texture with structural strength.',
      'lamination': 'Folding fat between dough layers. Creates distinct, flaky layers in puff pastry, croissants, and Danish pastries.'
    }
  }
}; 