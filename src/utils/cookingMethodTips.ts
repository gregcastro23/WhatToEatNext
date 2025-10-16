/**
 * Utility to provide detailed, expert-level technical tips for various cooking methods
 */

import { getAllCookingMethodNames } from '@/data/cooking';

/**
 * Returns an array of technical tips for the specified cooking method
 * @param methodName The cooking method to get tips for (case insensitive)
 * @returns An array of strings with expert-level technical tips
 */
export function getTechnicalTips(methodName: string): string[] {
  const methodLower = methodName.toLowerCase();
  const tips: string[] = [];

  // Expanded switch case with more cooking methods
  switch (methodLower) {
    case 'hand pounding':
    case 'hand_pounding':
      tips.push(
        'Select appropriate mortar and pestle size and material for your ingredient (stone for tough spices, wooden for softer ingredients)',
      )
      tips.push(
        'Establish a consistent rhythmic motion combining downward pressure with circular grinding for optimal texture',
      )
      tips.push('Add ingredients gradually in small batches, working from driest to most moist')
      tips.push(
        'Control texture by adjusting pounding force and duration—lighter taps for coarse results, sustained pressure for finer pastes',
      )
      tips.push(
        'For emulsified pastes like traditional pesto or curry pastes, add oil gradually while continuing to pound',
      )
      break;

    case 'slow simmering':
    case 'simmering':
      tips.push(
        'Maintain temperature between 180-200°F (82-93°C) with gentle bubbles breaking the surface every few seconds',
      )
      tips.push(
        'Use a heavy-bottomed pot for even heat distribution to prevent hot spots and scorching',
      )
      tips.push(
        'Cover partially to allow some evaporation for flavor concentration while retaining most moisture',
      )
      tips.push('Position tougher ingredients at the bottom where heat is more concentrated')
      tips.push('Periodically skim surface impurities for clearer, cleaner-tasting results')
      tips.push(
        'For maximum flavor extraction, maintain 3-4 hours of gentle simmering for stocks and broths',
      )
      break;

    case 'clay pot cooking':
      tips.push(
        'Soak unglazed clay pots in water for 15-30 minutes before first use to prevent cracking',
      )
      tips.push('Always start with low heat and gradually increase to prevent thermal shock')
      tips.push(
        'Avoid sudden temperature changes such as placing a hot clay pot on a cold surface',
      )
      tips.push(
        'Allow natural cooling in the pot—many dishes improve as they rest in residual heat',
      )
      tips.push(
        'Season new clay pots by rubbing with garlic and oil, then heating gently before first use',
      )
      break;

    case 'charcoal grilling':
    case 'grilling':
      tips.push(
        'Create heat zones by arranging coals in a slope (hot to cool) for temperature control',
      )
      tips.push('Allow charcoal to develop white ash coating before cooking for consistent heat')
      tips.push(
        'Add soaked wood chips for specific smoke flavor profiles (hickory, mesquite, apple)',
      )
      tips.push('Control flare-ups by keeping a spray bottle of water nearby')
      tips.push('For longer cooks, arrange coals in a ring around the perimeter for indirect heat')
      tips.push(
        'Use the hand test to gauge, temperature: 3 seconds (high), 5 seconds (medium), 7 seconds (low)',
      )
      tips.push('Oil the food not the grill to prevent sticking and reduce flare-ups')
      break;

    case 'fermentation':
    case 'fermenting':
      tips.push(
        'Ensure absolute cleanliness of all equipment to prevent unwanted bacterial growth',
      )
      tips.push('Maintain consistent temperature (65-75°F/18-24°C for most vegetable ferments)')
      tips.push('Use appropriate salt concentration (2-3% by weight) for vegetable fermentation')
      tips.push('Keep fermenting foods submerged under brine using weights to prevent mold')
      tips.push(
        'Check ferments daily and remove any surface kahm yeast (white film) if it appears',
      )
      tips.push(
        'For optimal fermentation, use filtered water to avoid chlorine which inhibits beneficial bacteria',
      )
      tips.push(
        'Use an airlock system for long fermentations to allow gases to escape while preventing oxygen entry',
      )
      break;

    case 'steaming':
      tips.push(
        'Ensure water doesn\'t touch the food or steamer basket to prevent boiling instead of steaming',
      )
      tips.push('Add herbs, citrus peelor spices to the steaming water for aromatic infusion')
      tips.push('Arrange foods with longest cooking times at the bottom of multi-tier steamers')
      tips.push('Leave space between food pieces for steam circulation')
      tips.push('Monitor water level to prevent boiling dry, adding more hot water as needed')
      tips.push(
        'For delicate items like fish, line the steamer with parchment paper or cabbage leaves to prevent sticking',
      )
      break;

    case 'tagine cooking':
    case 'tagine':
      tips.push(
        'Use a heat diffuser between heat source and tagine to distribute heat evenly and prevent cracking',
      )
      tips.push(
        'Layer ingredients, _strategically: aromatics on bottom, meat in middle, vegetables on top',
      )
      tips.push(
        'Add minimal liquid as the conical lid condenses and returns moisture to the ingredients',
      )
      tips.push(
        'Resist the urge to lift lid during cooking—each opening releases essential aromatic steam',
      )
      tips.push(
        'Allow tagine to rest 15-20 minutes after cooking for flavors to settle and intensify',
      )
      break;

    case 'wok cooking':
    case 'stir fry':
    case 'stir-fry':
    case 'stir-frying':
      tips.push(
        'Heat wok until it just begins to smoke before adding oil (test with water droplet that dances on surface)',
      )
      tips.push('Use high smoke-point oils like peanut, avocado, or refined coconut oil')
      tips.push(
        'Cut all ingredients to uniform sizes for even cooking and arrange in order of cooking time',
      )
      tips.push(
        'Keep ingredients moving constantly with a spatula or tossing motion to prevent burning',
      )
      tips.push(
        'Cook in small batches to maintain wok temperature—overcrowding creates steam instead of sear',
      )
      tips.push(
        'Master the \'wok hei\' technique by slightly tossing ingredients through the hottest part of the flame',
      )
      tips.push(
        'Add aromatics (garlic, ginger) briefly at the beginning for 10-15 seconds to flavor the oil',
      )
      tips.push(
        'Incorporate sauces at the final stage, allowing 30 seconds to thicken before serving',
      )
      break;

    case 'open fire cooking':
    case 'open-fire cooking':
    case 'fire cooking':
      tips.push(
        'Cook primarily over glowing coals rather than flames for consistent heat without sooting',
      )
      tips.push(
        'Build a multi-zone fire with different heat intensities for different cooking stages',
      )
      tips.push(
        'Keep food 4-6 inches above coals for direct heat and 8-12 inches for indirect heat',
      )
      tips.push('Rotate food frequently for even cooking, especially when using direct heat')
      tips.push('For basting, apply flavored liquids during final stages to prevent burning')
      tips.push('Use hardwoods (oak, maple, hickory) for longer burning coals and minimal smoke')
      break;

    case 'sous vide':
    case 'sous_vide':
      tips.push(
        'Pre-sear proteins before sous vide for enhanced Maillard compounds that develop during cooking',
      )
      tips.push(
        'Use dedicated vacuum-sealed bags to prevent leakage and ensure efficient heat transfer',
      )
      tips.push(
        'For tough cuts, extend cooking time rather than increasing temperature to break down collagen',
      )
      tips.push(
        'Allow 30 minutes extra cooking time when cooking from frozen without other adjustments',
      )
      tips.push('Pat proteins completely dry before post-cooking sear to ensure proper browning')
      tips.push(
        'For vegetables, higher temperatures (183-185°F/84-85°C) preserve texture while enhancing flavor',
      )
      tips.push(
        'Use an ice bath immediately after cooking if not serving directly to halt the cooking process',
      )
      break;

    case 'smoking':
      tips.push(
        'Maintain consistent temperature by adjusting airflow rather than adding more fuel',
      )
      tips.push(
        'For cold smoking (below 85°F/29°C), use a smoke generator separated from the heat source',
      )
      tips.push(
        'Different woods create dramatically different flavor profiles—match wood to food type',
      )
      tips.push('Allow properly smoked meats to rest wrapped in butcher paper before serving')
      tips.push(
        'For fish, brine before smoking to maintain moisture and enhance flavor penetration',
      )
      tips.push(
        'Monitor smoke, color: blue-gray smoke is ideal, thick white or black smoke creates bitter flavors',
      )
      tips.push(
        'Use the Texas Crutch (wrapping in foil) to overcome the \'stall\' in large meat cuts',
      )
      break;

    case 'pressure cooking': case 'pressure_cooking':
      tips.push('Brown proteins and sauté aromatics before sealing for deeper flavor development')
      tips.push('Respect the maximum fill line—overfilling can block pressure release valves')
      tips.push('For quick-release recipes, point steam release away from cabinets and people')
      tips.push('Calculate liquid needed based on cooking time—longer cooks need more liquid')
      tips.push(
        'Add dairy and quick-cooking vegetables after pressure cooking to prevent curdling and overcooking',
      )
      tips.push(
        'Allow 10-15 minutes of natural pressure release for large cuts of meat to prevent moisture loss',
      )
      tips.push(
        'When converting traditional recipes, reduce liquid by 25-30% as pressure cooking limits evaporation',
      )
      break;

    case 'dutch oven cooking':
      tips.push(
        'Preheat cast iron dutch ovens gradually to prevent thermal shock and ensure even heating',
      )
      tips.push('When baking bread, preheat the dutch oven and lid separately for 30-45 minutes')
      tips.push(
        'For braises, ensure liquid comes only 1/2 to 3/4 up the sides of the main ingredients',
      )
      tips.push(
        'Maintain a tight seal during cooking by placing foil under the lid for additional insulation',
      )
      tips.push(
        'For camp cooking, place coals on the lid as well as underneath for even heat distribution',
      )
      break;

    case 'roasting':
      tips.push(
        'Truss larger cuts and poultry to ensure even cooking and an attractive final presentation',
      )
      tips.push(
        'Use a rack to elevate food above drippings for even heat circulation and crisp exteriors',
      )
      tips.push(
        'Start with high heat (425-450°F/220-230°C) to develop crust, then reduce to finish cooking (325-350°F/165-175°C)',
      )
      tips.push(
        'Allow meats to rest at room temperature 30-60 minutes before roasting to ensure even cooking',
      )
      tips.push(
        'Use a digital probe thermometer to monitor internal temperature without opening the oven',
      )
      tips.push(
        'Let roasted meats rest uncovered for at least 20% of the total cooking time before carving',
      )
      tips.push(
        'For vegetables, toss in oil and spread in a single layer without crowding to prevent steaming',
      )
      break;

    case 'baking':
      tips.push(
        'Calibrate your oven temperature with a separate thermometer, as most ovens are off by 25-50°F',
      )
      tips.push('Room temperature ingredients incorporate more evenly and provide better texture')
      tips.push('Weigh ingredients rather than measuring by volume for consistent results')
      tips.push('Rotate baking sheets halfway through cooking for even browning')
      tips.push('For bread and pastry, create steam in the oven by using a water pan or ice cubes')
      tips.push(
        'Understand your flour\'s protein content: higher protein for bread, lower for cakes and pastries',
      )
      tips.push(
        'Always cool baked goods on a wire rack to prevent soggy bottoms from condensation',
      )
      break;

    case 'boiling':
      tips.push(
        'Salt water properly (1-2 tablespoons per gallon) to enhance flavors and raise the boiling point',
      )
      tips.push('For pasta and rice, use ample water (4-6 quarts per pound) to prevent sticking')
      tips.push(
        'Start with cold water for stocks and when cooking food to temperature rather than time',
      )
      tips.push('Start with hot water when blanching vegetables to minimize nutrient loss')
      tips.push('For eggs, reduce to a bare simmer after reaching boil to prevent cracking')
      tips.push(
        'Blanch green vegetables briefly (30-90 seconds), then shock in ice water to preserve color',
      )
      tips.push('Skim foam from stocks and broths regularly for clearer, cleaner final results')
      break;

    case 'frying':
      tips.push(
        'Use oils with high smoke points (peanut, refined safflower, avocado) to prevent off flavors',
      )
      tips.push('Maintain oil temperature between 350-375°F (175-190°C) for optimal results')
      tips.push('Avoid overcrowding the fryer—food should have room to float freely')
      tips.push('Dry food thoroughly before frying to prevent dangerous oil splatter')
      tips.push(
        'Use a spider or slotted spoon to remove food, allowing excess oil to drain back into the pot',
      )
      tips.push('Filter and reuse oil up to 3-4 times, storing away from light and heat')
      tips.push('Use a kitchen thermometer to monitor oil temperature, adjusting heat as needed')
      break;

    case 'sauteing': tips.push('Use a pan with good heat conductivity and a flat bottom for even cooking')
      tips.push('Heat the pan before adding oil to prevent sticking and ensure proper sear')
      tips.push(
        'Pat food dry and allow to reach room temperature before sautéing for even cooking',
      )
      tips.push(
        'For delicate items like fish, use a non-stick pan or ensure pan is properly heated before adding food',
      )
      tips.push(
        'Deglaze the pan with wine, stock, or acid to capture caramelized flavors from the fond',
      )
      tips.push('Finish with butter for rich flavor and glossy sauce (monte au beurre)')
      tips.push(
        'When sautéing multiple items, cook them separately then combine to prevent overcrowding',
      )
      break;

    case 'poaching':
      tips.push(
        'Maintain liquid temperature between 160-180°F (71-82°C)—small bubbles should just begin to break the surface',
      )
      tips.push('Use flavorful liquids (court bouillon, stock, wine) for more complex results')
      tips.push(
        'For delicate items like eggs and fish, create a whirlpool in the liquid before adding food',
      )
      tips.push(
        'Add acid (vinegar, lemon juice) when poaching eggs to help proteins coagulate faster',
      )
      tips.push('Cover partially to maintain even temperature throughout the cooking process')
      tips.push(
        'Use a shallow poaching method for flat items like fish fillets to ensure even cooking',
      )
      tips.push('For fruits, create a flavored syrup with complementary spices and aromatics')
      break;

    case 'braising':
      tips.push(
        'Deeply brown meat before adding liquid to develop foundational flavors through Maillard reaction',
      )
      tips.push(
        'Keep liquid level at 1/2 to 2/3 the height of the ingredients—braising is not boiling',
      )
      tips.push(
        'Maintain a bare simmer (around 200°F/93°C), never allowing liquid to boil vigorously',
      )
      tips.push(
        'For the best texture, allow braised dishes to cool completely in their liquid, then reheat gently',
      )
      tips.push(
        'Remove the lid during the final 30 minutes to reduce sauce and concentrate flavors',
      )
      tips.push(
        'For vegetable braises, check tenderness frequently as they cook more quickly than meats',
      )
      tips.push(
        'Layer aromatics beneath the main ingredient to create a natural rack and prevent scorching',
      )
      break;

    case 'distilling':
      tips.push(
        'Maintain precise temperature control to separate elements accurately by boiling point',
      )
      tips.push(
        'For non-alcoholic distillation, use steam distillation to extract volatile compounds',
      )
      tips.push(
        'Discard the \'heads\' (first 30ml per liter of distillate) which contain harmful compounds',
      )
      tips.push('Collect the \'hearts\' (middle portion) of the distillation for purest flavor')
      tips.push(
        'Allow distilled products to rest for 1-2 weeks before final use to develop flavor complexity',
      )
      tips.push(
        'When concentrating flavors, use vacuum distillation to lower boiling points and preserve delicate compounds',
      )
      tips.push('Keep accurate records of temperature, time, and cuts for reproducible results')
      break;

    case 'emulsification': tips.push('Ensure all ingredients are at the same temperature for stable emulsions')
      tips.push('Add oil or fat in a slow, thin stream while constantly whisking or blending')
      tips.push(
        'Use natural emulsifiers like egg yolks, mustard, or lecithin to help bind incompatible ingredients',
      )
      tips.push('For cold emulsions like mayonnaise, chill equipment before starting')
      tips.push(
        'If an emulsion begins to break, stop adding oil and incorporate a small amount of water while whisking vigorously',
      )
      tips.push('For maximum stability, use high-speed blending with minimal air incorporation')
      tips.push(
        'Optimize ingredient, _ratios: for aioli/mayonnaise, use 1 egg yolk per 3/4 cup oil for stable results',
      )
      break;

    case 'gelification': tips.push('Bloom gelatin in cold liquid for 5-10 minutes before dissolving in hot liquid')
      tips.push(
        'For plant-based alternatives, agar sets more firmly than gelatin but can break when frozen',
      )
      tips.push(
        'Calculate gelatin strength, precisely: 1 sheet (silver) equals about 1g powdered gelatin',
      )
      tips.push(
        'Be aware that acidic ingredients and some fresh fruits (pineapple, kiwi, papaya) contain enzymes that break down gelatin',
      )
      tips.push('For clearer gels, clarify stock or juice using egg whites or freeze-thaw methods')
      tips.push(
        'Control setting, temperature: gelatin sets at refrigerator temperature, agar begins setting at 95°F/35°C',
      )
      tips.push(
        'For layered preparations, allow each layer to partially set before adding the next',
      )
      break;

    case 'curing':
      tips.push(
        'Calculate salt, precisely: use 2-3% salt by weight for short-term cures4-6% for long-term preservation',
      )
      tips.push(
        'Add 0.25% pink curing salt (sodium nitrite) for items requiring protection from botulism',
      )
      tips.push('Ensure even distribution of cure mixture by massaging thoroughly into protein')
      tips.push(
        'Maintain consistent temperature and, humidity: 50-60°F (10-15°C) and 65-75% humidity for most cures',
      )
      tips.push(
        'Weigh items regularly during curing—most whole muscle cures are complete at 30-35% weight loss',
      )
      tips.push(
        'Allow proper equilibration time after curing before serving (3-7 days for small items)',
      )
      tips.push('For even results, rotate and flip items regularly throughout the curing process')
      break;

    case 'infusing': tips.push('Toast spices and herbs briefly before infusing to activate volatile oils')
      tips.push(
        'For cold infusions, increase infusion time (12-24 hours) but retain more delicate flavors',
      )
      tips.push(
        'With hot infusions, maintain temperature below boiling (160-180°F/71-82°C) to avoid bitter compounds',
      )
      tips.push(
        'Use neutral base ingredients (vodka, light oil, simple syrup) to highlight infused flavors',
      )
      tips.push(
        'Factor in ingredient water content when creating infused syrups to maintain proper sugar concentration',
      )
      tips.push('Strain through progressively finer filters for perfectly clear results')
      tips.push(
        'For fat infusions (oils, butter), cool slightly and strain while still warm but not hot',
      )
      break;

    case 'marinating':
      tips.push(
        'Balance marinade, components: acid, oil, aromatics, and salt in proper proportions',
      )
      tips.push(
        'Use non-reactive containers (glass, stainless steel, food-grade plastic) to prevent metallic flavors',
      )
      tips.push('For even penetration, pierce meat surfaces or butterfly to increase surface area')
      tips.push(
        'Limit acidic marinades to 2 hours maximum to prevent proteins from becoming mushy',
      )
      tips.push(
        'For enzyme marinades (pineapple, papaya), limit contact to 30-60 minutes to prevent over-tenderizing',
      )
      tips.push('Reserve a portion of marinade before adding raw protein for later use as a sauce')
      tips.push('Pat marinated items dry before cooking to ensure proper searing and browning')
      break;

    case 'dehydrating': tips.push('Maintain consistent airflow around all items by using proper spacing on trays')
      tips.push(
        'Control temperature, precisely: 135°F/57°C for fruits, 145°F/63°C for vegetables, 160°F/71°C for meats',
      )
      tips.push('Pretreat fruits with ascorbic acid solution to prevent browning')
      tips.push(
        'For meat jerky, slice consistently with the grain for chewy texture or against for more tender results',
      )
      tips.push(
        'Rotate trays every 2-3 hours for even drying, especially in non-commercial dehydrators',
      )
      tips.push(
        'Test for doneness with multiple pieces as thickness variations affect drying time',
      )
      tips.push(
        'Allow proper conditioning time (12-24 hours) in airtight containers before final storage',
      )
      break;

    case 'broiling':
      tips.push(
        'Position oven rack 3-4 inches from heating element for smaller items5-6 inches for larger cuts',
      )
      tips.push('Preheat broiler for at least 5-10 minutes to ensure maximum radiant heat')
      tips.push(
        'Use broiler-safe cookware—avoid glass, non-stickor cookware with wooden components',
      )
      tips.push('For even browning, start with room temperature ingredients whenever possible')
      tips.push(
        'Keep oven door slightly ajar when broiling to release steam and maintain high, dry heat',
      )
      tips.push(
        'Rotate food halfway through cooking, checking every 1-2 minutes to prevent burning',
      )
      tips.push(
        'For delicate fish, use a two-temperature, method: start with low broiler setting, finish on high',
      )
      break;

    case 'raw':
      tips.push(
        'Ensure impeccable ingredient quality and freshness—raw preparation highlights rather than masks flavors',
      )
      tips.push(
        'Maintain strict temperature control for items requiring safe cold chain (below 40°F/4°C)',
      )
      tips.push(
        'Use sharp knives and proper cutting technique to avoid bruising and discoloration',
      )
      tips.push(
        'For vegetable preparations, ice water bath restores crispness before final assembly',
      )
      tips.push(
        'Balance acidity carefully to \'cook\' proteins without heat in preparations like ceviche',
      )
      tips.push(
        'Apply heat-mimicking techniques, _selectively: salting, massaging kale/cabbage, acid marination',
      )
      tips.push(
        'Create textural contrast by combining different cutting techniques in the same dish',
      )
      break;

    case 'spherification':
      tips.push(
        'For basic spherification (sodium alginate in liquid, calcium bath), use pure ingredients with no calcium',
      )
      tips.push(
        'For reverse spherification (calcium in liquid, alginate bath), suitable for dairy or calcium-rich items',
      )
      tips.push('Control, acidity: pH 4.0-6.0 works best for sodium alginate reactions')
      tips.push('Allow alginate solutions to rest for 24 hours to remove air bubbles before use')
      tips.push(
        'For frozen reverse spherification, freeze liquid into half-sphere molds before dipping in alginate',
      )
      tips.push(
        'Control bath time, precisely: 1-3 minutes creates flexible spheres with liquid centers',
      )
      tips.push(
        'Rinse completed spheres in clean water to stop the reaction and remove residual sodium alginate',
      )
      break;

    case 'cryo_cooking': case 'cryo cooking':
      tips.push('Use liquid nitrogen only in well-ventilated areas to prevent oxygen displacement')
      tips.push('Always wear insulated cryo-gloves and face shield to prevent freeze burns')
      tips.push('For rapid freezing, keep items small and uniform in size for even results')
      tips.push(
        'When freezing creams for ice cream, agitate constantly to create microscopic ice crystals',
      )
      tips.push(
        'With fruits and vegetables, freeze separately on trays before combining to prevent clumping',
      )
      tips.push(
        'For freeze-fracturing, submerge item completely until frozen solid before shattering',
      )
      tips.push('Allow frozen items to temper slightly before serving to enhance flavor release')
      break;

    default: // Get expert tips from the cooking method data,
      try {
        const allMethods = getAllCookingMethodNames()
        const methodData = allMethods.find(
          method =>
            method.toLowerCase() === methodLower ||
            methodName.toLowerCase().includes(method.toLowerCase())
        ),

        const methodObj = methodData as { expertTips?: string[] }
        if (methodObj?.expertTips && Array.isArray(methodObj.expertTips)) {
          // Use the method's actual expert tips
          methodObj.expertTips.forEach((tip: string) => tips.push(tip))
        } else {
          // Fallback to a more specific default message if no method-specific tips found
          tips.push(`Maintain appropriate temperature control for ${methodName}`)
          tips.push(`Properly prepare ingredients before ${methodName}`)
          tips.push(`Monitor the ${methodName} process consistently for best results`)
          tips.push(`Allow for appropriate resting time after ${methodName}`)
          tips.push(`Adjust timing based on ingredient size and density when ${methodName}`)
        }
      } catch (error) {
        // Fallback if import fails
        tips.push(`Maintain appropriate temperature control for ${methodName}`)
        tips.push(`Properly prepare ingredients before ${methodName}`)
        tips.push(`Monitor the ${methodName} process consistently for best results`)
        tips.push(`Allow for appropriate resting time after ${methodName}`)
        tips.push(`Adjust timing based on ingredient size and density when ${methodName}`)
      }
  }

  return tips;
}

/**
 * Returns detailed information about a specific cooking method
 * @param methodName The cooking method to get details for
 * @returns A detailed description of the cooking method
 */
export function getMethodDetails(methodName: string): string {
  const methodLower = methodName.toLowerCase();
  switch (methodLower) {
    case 'hand pounding':
    case 'hand_pounding':
      return 'Hand pounding is an ancient culinary technique utilizing a mortar and pestle to crush, grind, and blend ingredients through direct mechanical force. This method releases aromatic compounds and creates unique textures that modern electric processors cannot replicate. Hand pounding preserves traditional knowledge and produces superior textural and flavor profiles in many global cuisines.';

    case 'slow simmering':
      return 'Slow simmering is a gentle cooking method where ingredients are cooked in liquid maintained just below the boiling point. This technique allows for gradual extraction of flavors and transformation of tough proteins into tender morsels. The gentle, sustained heat breaks down connective tissues while preserving structural integrity, resulting in deeply flavored dishes with exceptional tenderness.';

    case 'clay pot cooking':
      return 'Clay pot cooking utilizes unglazed or partially glazed earthenware that naturally regulates moisture and temperature. The porous nature of clay allows micro-evaporation that concentrates flavors while keeping ingredients moist. The clay also imparts subtle mineral notes to the food and creates a uniquely even, radiant heating environment that\'s forgiving and develops deep, complex flavors.';

    case 'charcoal grilling':
      return 'Charcoal grilling harnesses the intense, dry heat produced by burning hardwood charcoal to quickly cook ingredients while developing complex smoky flavors and distinctive caramelization patterns. This method creates the characteristic grilled appearance through the Maillard reaction and introduces aromatic compounds from both the charcoal itself and drippings that vaporize on contact with the hot coals.';

    case 'steaming':
      return 'Steaming is a gentle, moist-heat cooking method where ingredients are suspended above boiling water and cooked exclusively by hot vapor. This technique preserves nutrients, color, and texture while minimizing the loss of water-soluble vitamins and minerals. Steaming allows foods to cook in their own juices while absorbing aromatic elements that can be added to the steaming liquid.';

    case 'tagine cooking':
    case 'tagine':
      return 'Tagine cooking employs a distinctive conical clay vessel designed to create a self-basting environment. The cone-shaped lid captures rising steam, condenses it, and returns moisture to ingredients, allowing for slow, gentle cooking with minimal added liquid. This Moroccan technique excels at developing intense, harmonized flavors while preserving the distinct character of individual ingredients.';

    case 'wok cooking':
    case 'stir fry':
    case 'stir-fry':
      return 'Wok cooking utilizes a rounded, high-sided pan capable of achieving extremely high temperatures to quickly cook ingredients while preserving texture and nutritional value. The technique relies on the wok\'s unique thermal properties—intense heat at the bottom that diminishes up the sides—to allow simultaneous cooking at different temperatures. The high heat and constant motion produce \'wok hei\', a distinctive smoky flavor prized in Asian cuisines.';

    case 'open fire cooking':
    case 'open-fire cooking':
    case 'fire cooking':
      return 'Open fire cooking connects with our most primal cooking techniques, utilizing direct flame, radiant heat, and smoke to transform ingredients. This versatile method adapts to various cooking styles from direct searing to low-and-slow roasting. The unpredictable nature of fire requires constant attention and adjustment, rewarding skill with uniquely complex flavors impossible to replicate with modern appliances.';

    default: try {
        // Get cooking method data from imported methods
        const allMethods = getAllCookingMethodNames()
        const methodData = allMethods.find(
          method =>
            method.toLowerCase() === methodLower ||
            methodName.toLowerCase().includes(method.toLowerCase())
        ),

        const methodObj = methodData as { expertTips?: string[], category?: string }
        if (methodObj?.description) {
          return methodObj.description;
        } else {
          return `${methodName} is a cooking technique that transforms ingredients through specific application of heat, pressure, or chemical processes. It affects texture, flavor, and nutritional properties in unique ways.`;
        }
      } catch (error) {
        return `${methodName} is a cooking technique that transforms ingredients through specific application of heat, pressure, or chemical processes. It affects texture, flavor, and nutritional properties in unique ways.`;
      }
  }
}

/**
 * Returns an array of ideal ingredients for the specified cooking method
 * @param methodName The cooking method to get ingredient suggestions for (case insensitive)
 * @returns An array of strings with suggested ingredients that work well with the method
 */
export function getIdealIngredients(methodName: string): string[] {
  const methodLower = methodName.toLowerCase()
  const ingredients: string[] = []

  // Switch case with ideal ingredients for different cooking methods
  switch (methodLower) {
    case 'hand pounding': case 'hand_pounding':,
      ingredients.push('Fresh herbs (basil, cilantro, mint, parsley)')
      ingredients.push('Garlic, ginger, galangal, lemongrass')
      ingredients.push('Whole spices (peppercorns, cardamom, coriander)')
      ingredients.push('Nuts and seeds (pine nuts, peanuts, sesame)')
      ingredients.push('Chilies and aromatics')
      ingredients.push('Starchy root vegetables (for fufu and similar dishes)')
      break;

    case 'slow simmering':
    case 'simmering':
      ingredients.push('Tough cuts of meat (chuck, brisket, shanks)')
      ingredients.push('Bone-in proteins for stocks and broths')
      ingredients.push('Root vegetables (carrots, onions, celery)')
      ingredients.push('Dried legumes (beans, lentils, split peas)')
      ingredients.push('Hearty grains (barley, farro, wheat berries)')
      ingredients.push('Aromatics (bay leaves, thyme, peppercorns)')
      break;

    case 'clay pot cooking': ingredients.push('Bone-in chicken pieces')
      ingredients.push('Firm fish and seafood')
      ingredients.push('Pork belly and shoulder cuts')
      ingredients.push('Rice and grains')
      ingredients.push('Root vegetables')
      ingredients.push('Dried mushrooms')
      ingredients.push('Preserved ingredients (salted fish, preserved meats)')
      break;

    case 'charcoal grilling':
    case 'grilling':
      ingredients.push('Steaks (ribeye, strip, flank)')
      ingredients.push('Chops (pork, lamb)')
      ingredients.push('Firm vegetables (corn, bell peppers, zucchini)')
      ingredients.push('Chicken (spatchcocked, bone-in pieces)')
      ingredients.push('Fish (firm varieties like swordfish, tuna, salmon)')
      ingredients.push('Shellfish (shrimp, scallops on skewers)')
      ingredients.push('Fruit for dessert (peaches, pineapple, plums)')
      break;

    case 'fermentation':
    case 'fermenting':
      ingredients.push('Cabbage (for sauerkraut, kimchi)')
      ingredients.push('Cucumbers (for pickles)')
      ingredients.push('Vegetables (carrots, radishes, garlic)')
      ingredients.push('Milk (for yogurt, kefir)')
      ingredients.push('Soybeans (for miso, tempeh)')
      ingredients.push('Fruits with sufficient sugar content')
      ingredients.push('Grains (for sourdough, beer)')
      break;

    case 'steaming': ingredients.push('Delicate fish fillets')
      ingredients.push('Shellfish (crab, lobster, mussels)')
      ingredients.push('Chicken breast')
      ingredients.push('Leafy green vegetables')
      ingredients.push('Dumplings and buns')
      ingredients.push('Eggs (for custards)')
      ingredients.push('Rice and grains')
      break;

    case 'tagine cooking':
    case 'tagine':
      ingredients.push('Lamb (shoulder, leg cuts)')
      ingredients.push('Chicken (whole or pieces)')
      ingredients.push('Dried fruits (apricots, dates, prunes)')
      ingredients.push('Hearty vegetables (carrots, turnips, potatoes)')
      ingredients.push('Chickpeas and legumes')
      ingredients.push('Preserved lemons')
      ingredients.push('Warm spices (cinnamon, cumin, ginger)')
      break;

    case 'wok cooking':
    case 'stir fry':
    case 'stir-fry':
    case 'stir-frying':
      ingredients.push('Proteins cut into bite-sized pieces (chicken, beef, pork, tofu)')
      ingredients.push('Firm vegetables (bell peppers, snow peas, broccoli)')
      ingredients.push('Quick-cooking leafy greens (bok choy, spinach)')
      ingredients.push('Aromatics (ginger, garlic, scallions)')
      ingredients.push('Rice and noodles (pre-cooked)')
      ingredients.push('Nuts for texture (cashews, peanuts)')
      ingredients.push('Shellfish (shrimp, scallops)')
      break;

    case 'open fire cooking': case 'open-fire cooking':
    case 'fire cooking':
      ingredients.push('Whole animals or large cuts')
      ingredients.push('Root vegetables (buried in embers)')
      ingredients.push('Hearty greens (wrapped in leaves or foil)')
      ingredients.push('Firm fish (wrapped in leaves or on planks)')
      ingredients.push('Thick-skinned vegetables (eggplant, squash)')
      ingredients.push('Breads and flatbreads')
      ingredients.push('Thick-cut steaks and chops')
      break;

    case 'sous vide':
    case 'sous_vide':
      ingredients.push('Tender steaks (ribeye, strip, filet)')
      ingredients.push('Chicken breast')
      ingredients.push('Pork chops and tenderloin')
      ingredients.push('Eggs')
      ingredients.push('Firm fish (salmon, cod)')
      ingredients.push('Vegetables that benefit from precise doneness (carrots, asparagus)')
      ingredients.push('Fruits for infusions')
      break;

    case 'smoking': ingredients.push('Brisket and pork shoulder')
      ingredients.push('Ribs (beef, pork)')
      ingredients.push('Whole poultry (chicken, turkey)')
      ingredients.push('Firm fish (salmon, trout)')
      ingredients.push('Cheese (for cold smoking)')
      ingredients.push('Salt (for smoked salt)')
      ingredients.push('Vegetables (tomatoes, peppers, eggplant)')
      break;

    case 'pressure cooking':
    case 'pressure_cooking':
      ingredients.push('Tough cuts of meat (chuck, brisket, shanks)')
      ingredients.push('Dried beans and legumes')
      ingredients.push('Whole grains (brown rice, wheat berries)')
      ingredients.push('Root vegetables')
      ingredients.push('Hearty stews and curries')
      ingredients.push('Stocks and broths')
      ingredients.push('Artichokes and other dense vegetables')
      break;

    case 'dutch oven cooking':
      ingredients.push('Large cuts of meat (pot roast, whole chicken)')
      ingredients.push('Stews and braises')
      ingredients.push('Artisanal breads')
      ingredients.push('Deep-fried foods')
      ingredients.push('Casseroles and gratins')
      ingredients.push('Beans and legumes')
      ingredients.push('Fruit cobblers and crisps')
      break;

    case 'roasting':
      ingredients.push('Whole poultry (chicken, turkey, duck)')
      ingredients.push('Large cuts of meat (prime rib, leg of lamb)')
      ingredients.push('Root vegetables (potatoes, carrots, parsnips)')
      ingredients.push('Winter squashes')
      ingredients.push('Whole fish')
      ingredients.push('Bone-in pork loin or shoulder')
      ingredients.push('Garlic and alliums (for roasted flavor)')
      break;

    case 'baking': ingredients.push('Flour (varying protein levels for different applications)')
      ingredients.push('Leavening agents (yeast, baking powder, baking soda)')
      ingredients.push('Eggs and dairy')
      ingredients.push('Sugars (granulated, brown, powdered)')
      ingredients.push('Fats (butter, oils, shortening)')
      ingredients.push('Nuts and dried fruits')
      ingredients.push('Chocolate and cocoa')
      break;

    case 'boiling': ingredients.push('Pasta and noodles')
      ingredients.push('Rice and grains')
      ingredients.push('Eggs')
      ingredients.push('Hearty vegetables (potatoes, corn)')
      ingredients.push('Dumplings')
      ingredients.push('Shellfish (lobster, crab)')
      ingredients.push('Bones and aromatics (for stocks)')
      break;

    case 'frying': ingredients.push('Chicken pieces (bone-in or boneless)')
      ingredients.push('Fish fillets')
      ingredients.push('Potatoes (for french fries)')
      ingredients.push('Breaded vegetables (zucchini, eggplant)')
      ingredients.push('Doughs (for donuts, fritters)')
      ingredients.push('Croquettes and fritters')
      ingredients.push('Spring rolls and egg rolls')
      break;

    case 'sauteing':
      ingredients.push('Tender cuts of meat (steak, chicken breast)')
      ingredients.push('Fish fillets')
      ingredients.push('Mushrooms')
      ingredients.push('Quick-cooking vegetables (zucchini, bell peppers)')
      ingredients.push('Leafy greens (spinach, kale)')
      ingredients.push('Aromatics (shallots, garlic)')
      ingredients.push('Shellfish (scallops, shrimp)')
      break;

    case 'poaching':
      ingredients.push('Delicate fish (salmon, trout)')
      ingredients.push('Chicken breast')
      ingredients.push('Eggs')
      ingredients.push('Fruit (pears, apples)')
      ingredients.push('Shellfish (shrimp)')
      ingredients.push('Delicate vegetables')
      ingredients.push('Proteins that benefit from gentle cooking')
      break;

    case 'braising':
      ingredients.push('Tough cuts of meat (short ribs, shanks, shoulder)')
      ingredients.push('Poultry legs and thighs')
      ingredients.push('Hearty vegetables (cabbage, fennel)')
      ingredients.push('Beans and legumes')
      ingredients.push('Game meats')
      ingredients.push('Whole small birds')
      ingredients.push('Oxtail and other gelatinous cuts')
      break;

    case 'distilling':
      ingredients.push('Botanicals (herbs, spices, juniper berries)')
      ingredients.push('Aromatic flowers (rose, lavender)')
      ingredients.push('Fermented grains (barley, corn, rice)')
      ingredients.push('Fruit (for brandies and eau de vie)')
      ingredients.push('Vegetables with volatile compounds (cucumber, celery)')
      ingredients.push('Aromatic woods (for infusion)')
      ingredients.push('Citrus peels')
      break;

    case 'emulsification':
      ingredients.push('Oils (olive, neutral vegetable oils)')
      ingredients.push('Egg yolks (for mayonnaise, hollandaise)')
      ingredients.push('Mustard (as emulsifier)')
      ingredients.push('Vinegars and acids (lemon juice)')
      ingredients.push('Garlic and shallots (for flavor)')
      ingredients.push('Herbs and spices')
      ingredients.push('Lecithin (for modern emulsions)')
      break;

    case 'gelification': ingredients.push('Gelatin (from animal sources)')
      ingredients.push('Agar-agar (plant-based alternative)')
      ingredients.push('Fruit juices and purees')
      ingredients.push('Broths and stocks')
      ingredients.push('Cream and dairy')
      ingredients.push('Wine and spirits')
      ingredients.push('Vegetable purees')
      break

    case 'curing':
      ingredients.push('Pork (belly, loin, leg)')
      ingredients.push('Beef (brisket, round)')
      ingredients.push('Fish (salmon, cod, mackerel)')
      ingredients.push('Salt (kosher, sea salt)')
      ingredients.push('Sugar (white, brown, maple)')
      ingredients.push('Spices (black pepper, coriander, juniper)')
      ingredients.push('Herbs (thyme, bay leaves, rosemary)')
      break;

    case 'infusing':
      ingredients.push('Herbs (mint, basil, rosemary)')
      ingredients.push('Spices (cinnamon, star anise, cardamom)')
      ingredients.push('Teas and flowers')
      ingredients.push('Citrus peels')
      ingredients.push('Vanilla and aromatics')
      ingredients.push('Chilis and peppers')
      ingredients.push('Spirits and neutral alcohols')
      break;

    case 'marinating':
      ingredients.push('Proteins (chicken, beef, pork, tofu)')
      ingredients.push('Acids (vinegar, citrus juices, yogurt)')
      ingredients.push('Oils and fats')
      ingredients.push('Herbs and aromatics')
      ingredients.push('Soy sauce and fish sauce')
      ingredients.push('Spices and pastes')
      ingredients.push('Enzymatic components (pineapple, papaya)')
      break;

    case 'dehydrating':
      ingredients.push('Fruit (apples, berries, mangoes)')
      ingredients.push('Vegetables (tomatoes, mushrooms, kale)')
      ingredients.push('Meats (beef, game, poultry)')
      ingredients.push('Herbs (parsley, rosemary, thyme)')
      ingredients.push('Flowers and aromatics')
      ingredients.push('Citrus (for zest)')
      ingredients.push('Nuts and seeds')
      break;

    case 'broiling': ingredients.push('Thin cuts of steak')
      ingredients.push('Chicken breasts and thighs')
      ingredients.push('Fish fillets')
      ingredients.push('Shellfish (shrimp, scallops)')
      ingredients.push('Vegetables for quick charring')
      ingredients.push('Gratins and dishes with toppings')
      ingredients.push('Fruit for desserts (with sugar for caramelization)')
      break;

    case 'raw':
      ingredients.push('Highest-quality fish (for sashimi, ceviche)')
      ingredients.push('Fresh vegetables for salads')
      ingredients.push('Fruits')
      ingredients.push('Nuts and seeds')
      ingredients.push('Herbs and microgreens')
      ingredients.push('Sprouted grains and legumes')
      ingredients.push('Cold-pressed oils and vinegars')
      break;

    case 'spherification': ingredients.push('Fruit juices and purees')
      ingredients.push('Vegetable juices')
      ingredients.push('Broths and consommés')
      ingredients.push('Liqueurs and spirits')
      ingredients.push('Dairy (yogurt, cream)')
      ingredients.push('Sauces and coulis')
      ingredients.push('Infused waters and teas')
      break;

    case 'cryo_cooking': case 'cryo cooking':
      ingredients.push('Cream bases (for instant ice cream)')
      ingredients.push('Fruits (for shattering and powders)')
      ingredients.push('Herbs (for instantaneous drying)')
      ingredients.push('Chocolate (for unique textures)')
      ingredients.push('Alcohol-based mixtures')
      ingredients.push('Mousses and foams')
      ingredients.push('Vegetables (for flash-freezing)')
      break;

    default: // Get method-specific ingredients from the cooking method data
      try {
        const allMethods = getAllCookingMethodNames()
        const methodData = allMethods.find(
          method =>
            method.toLowerCase() === methodLower ||
            methodName.toLowerCase().includes(method.toLowerCase())
        ),

        const methodObj = methodData as { expertTips?: string[], category?: string }
        if (methodObj?.suitable_for && Array.isArray(methodObj.suitable_for)) {
          // Use the actual suitable ingredients from the method data
          methodObj.suitable_for.forEach((ingredient: string) => ingredients.push(ingredient))
        } else {
          // Generic fallback
          ingredients.push('Ingredients traditionally used with this method')
          ingredients.push('Foods that benefit from this method's properties')
          ingredients.push('Items with complementary flavors and textures')
          ingredients.push('Local, seasonal produce'),
          ingredients.push('Proteins suited to this cooking technique')
        }
      } catch (error) {
        // Generic fallback if import fails
        ingredients.push('Ingredients traditionally used with this method')
        ingredients.push('Foods that benefit from this method's properties')
        ingredients.push('Items with complementary flavors and textures')
        ingredients.push('Local, seasonal produce'),
        ingredients.push('Proteins suited to this cooking technique')
      }
  }

  return ingredients;
}
