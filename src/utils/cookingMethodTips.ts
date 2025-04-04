/**
 * Utility to provide detailed, expert-level technical tips for various cooking methods
 */

/**
 * Returns an array of technical tips for the specified cooking method
 * @param methodName The cooking method to get tips for (case insensitive)
 * @returns An array of strings with expert-level technical tips
 */
export function getTechnicalTips(methodName: string): string[] {
  const methodLower = methodName.toLowerCase();
  const tips: string[] = [];
  
  // Expanded switch case with more cooking methods
  switch(methodLower) {
    case 'hand pounding':
    case 'hand_pounding':
      tips.push("Select appropriate mortar and pestle size and material for your ingredient (stone for tough spices, wooden for softer ingredients)");
      tips.push("Establish a consistent rhythmic motion combining downward pressure with circular grinding for optimal texture");
      tips.push("Add ingredients gradually in small batches, working from driest to most moist");
      tips.push("Control texture by adjusting pounding force and duration—lighter taps for coarse results, sustained pressure for finer pastes");
      tips.push("For emulsified pastes like traditional pesto or curry pastes, add oil gradually while continuing to pound");
      break;
      
    case 'slow simmering':
      tips.push("Maintain temperature just below boiling point (180-200°F/82-93°C) with only occasional small bubbles");
      tips.push("Use a heavy-bottomed pot for even heat distribution to prevent hot spots");
      tips.push("Cover partially to allow some evaporation while retaining most moisture");
      tips.push("Position tougher ingredients at the bottom where heat is more concentrated");
      tips.push("Periodically skim surface impurities for clearer, cleaner-tasting results");
      break;
      
    case 'clay pot cooking':
      tips.push("Soak unglazed clay pots in water for 15-30 minutes before first use to prevent cracking");
      tips.push("Always start with low heat and gradually increase to prevent thermal shock");
      tips.push("Avoid sudden temperature changes such as placing a hot clay pot on a cold surface");
      tips.push("Allow natural cooling in the pot—many dishes improve as they rest in residual heat");
      tips.push("Season new clay pots by rubbing with garlic and oil, then heating gently before first use");
      break;
      
    case 'charcoal grilling':
      tips.push("Create heat zones by arranging coals in a slope (hot to cool) for temperature control");
      tips.push("Allow charcoal to develop white ash coating before cooking for consistent heat");
      tips.push("Add soaked wood chips for specific smoke flavor profiles (hickory, mesquite, apple)");
      tips.push("Control flare-ups by keeping a spray bottle of water nearby");
      tips.push("For longer cooks, arrange coals in a ring around the perimeter for indirect heat");
      break;
      
    case 'fermentation':
      tips.push("Ensure absolute cleanliness of all equipment to prevent unwanted bacterial growth");
      tips.push("Maintain consistent temperature (65-75°F/18-24°C for most vegetable ferments)");
      tips.push("Use appropriate salt concentration (2-3% by weight) for vegetable fermentation");
      tips.push("Keep fermenting foods submerged under brine using weights to prevent mold");
      tips.push("Check ferments daily and remove any surface kahm yeast (white film) if it appears");
      break;
      
    case 'steaming':
      tips.push("Ensure water doesn't touch the food or steamer basket to prevent boiling instead of steaming");
      tips.push("Add herbs, citrus peel, or spices to the steaming water for aromatic infusion");
      tips.push("Arrange foods with longest cooking times at the bottom of multi-tier steamers");
      tips.push("Leave space between food pieces for steam circulation"); 
      tips.push("Monitor water level to prevent boiling dry, adding more hot water as needed");
      break;
      
    case 'tagine cooking':
    case 'tagine':
      tips.push("Use a heat diffuser between heat source and tagine to distribute heat evenly and prevent cracking");
      tips.push("Layer ingredients strategically: aromatics on bottom, meat in middle, vegetables on top");
      tips.push("Add minimal liquid as the conical lid condenses and returns moisture to the ingredients");
      tips.push("Resist the urge to lift lid during cooking—each opening releases essential aromatic steam");
      tips.push("Allow tagine to rest 15-20 minutes after cooking for flavors to settle and intensify");
      break;
      
    case 'wok cooking':
    case 'stir fry':
    case 'stir-fry':
      tips.push("Heat wok until it just begins to smoke before adding oil (test with water droplet that dances on surface)");
      tips.push("Use high smoke-point oils like peanut, avocado, or refined coconut oil");
      tips.push("Cut all ingredients to uniform sizes for even cooking and arrange in order of cooking time");
      tips.push("Keep ingredients moving constantly with a spatula or tossing motion to prevent burning");
      tips.push("Cook in small batches to maintain wok temperature—overcrowding creates steam instead of sear");
      tips.push("Master the 'wok hei' technique by slightly tossing ingredients through the hottest part of the flame");
      break;
      
    case 'open fire cooking':
    case 'open-fire cooking':
    case 'fire cooking':
      tips.push("Cook primarily over glowing coals rather than flames for consistent heat without sooting");
      tips.push("Build a multi-zone fire with different heat intensities for different cooking stages");
      tips.push("Keep food 4-6 inches above coals for direct heat and 8-12 inches for indirect heat");
      tips.push("Rotate food frequently for even cooking, especially when using direct heat");
      tips.push("For basting, apply flavored liquids during final stages to prevent burning");
      tips.push("Use hardwoods (oak, maple, hickory) for longer burning coals and minimal smoke");
      break;
      
    case 'sous vide':
      tips.push("Pre-sear proteins before sous vide for enhanced Maillard compounds that develop during cooking");
      tips.push("Use dedicated vacuum-sealed bags to prevent leakage and ensure efficient heat transfer");
      tips.push("For tough cuts, extend cooking time rather than increasing temperature to break down collagen");
      tips.push("Allow 30 minutes extra cooking time when cooking from frozen without other adjustments");
      tips.push("Pat proteins completely dry before post-cooking sear to ensure proper browning");
      break;
      
    case 'smoking':
      tips.push("Maintain consistent temperature by adjusting airflow rather than adding more fuel");
      tips.push("For cold smoking (below 85°F/29°C), use a smoke generator separated from the heat source");
      tips.push("Different woods create dramatically different flavor profiles—match wood to food type");
      tips.push("Allow properly smoked meats to rest wrapped in butcher paper before serving");
      tips.push("For fish, brine before smoking to maintain moisture and enhance flavor penetration");
      break;
      
    case 'pressure cooking':
      tips.push("Brown proteins and sauté aromatics before sealing for deeper flavor development");
      tips.push("Respect the maximum fill line—overfilling can block pressure release valves");
      tips.push("For quick-release recipes, point steam release away from cabinets and people");
      tips.push("Calculate liquid needed based on cooking time—longer cooks need more liquid");
      tips.push("Add dairy and quick-cooking vegetables after pressure cooking to prevent curdling and overcooking");
      break;
      
    case 'dutch oven cooking':
      tips.push("Preheat cast iron dutch ovens gradually to prevent thermal shock and ensure even heating");
      tips.push("When baking bread, preheat the dutch oven and lid separately for 30-45 minutes");
      tips.push("For braises, ensure liquid comes only 1/2 to 3/4 up the sides of the main ingredients");
      tips.push("Maintain a tight seal during cooking by placing foil under the lid for additional insulation");
      tips.push("For camp cooking, place coals on the lid as well as underneath for even heat distribution");
      break;
      
    default:
      tips.push("Research proper temperature and timing for specific ingredients");
      tips.push("Ensure proper preparation of ingredients before cooking");
      tips.push("Monitor the cooking process regularly for best results");
      tips.push("Allow appropriate resting or cooling time after cooking");
      tips.push("Consider how this method interacts with your specific ingredients");
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
  
  switch(methodLower) {
    case 'hand pounding':
    case 'hand_pounding':
      return "Hand pounding is an ancient culinary technique utilizing a mortar and pestle to crush, grind, and blend ingredients through direct mechanical force. This method releases aromatic compounds and creates unique textures that modern electric processors cannot replicate. Hand pounding preserves traditional knowledge and produces superior textural and flavor profiles in many global cuisines.";
      
    case 'slow simmering':
      return "Slow simmering is a gentle cooking method where ingredients are cooked in liquid maintained just below the boiling point. This technique allows for gradual extraction of flavors and transformation of tough proteins into tender morsels. The gentle, sustained heat breaks down connective tissues while preserving structural integrity, resulting in deeply flavored dishes with exceptional tenderness.";
      
    case 'clay pot cooking':
      return "Clay pot cooking utilizes unglazed or partially glazed earthenware that naturally regulates moisture and temperature. The porous nature of clay allows micro-evaporation that concentrates flavors while keeping ingredients moist. The clay also imparts subtle mineral notes to the food and creates a uniquely even, radiant heating environment that's forgiving and develops deep, complex flavors.";
      
    case 'charcoal grilling':
      return "Charcoal grilling harnesses the intense, dry heat produced by burning hardwood charcoal to quickly cook ingredients while developing complex smoky flavors and distinctive caramelization patterns. This method creates the characteristic grilled appearance through the Maillard reaction and introduces aromatic compounds from both the charcoal itself and drippings that vaporize on contact with the hot coals.";
    
    case 'steaming':
      return "Steaming is a gentle, moist-heat cooking method where ingredients are suspended above boiling water and cooked exclusively by hot vapor. This technique preserves nutrients, color, and texture while minimizing the loss of water-soluble vitamins and minerals. Steaming allows foods to cook in their own juices while absorbing aromatic elements that can be added to the steaming liquid.";
      
    case 'tagine cooking':
    case 'tagine':
      return "Tagine cooking employs a distinctive conical clay vessel designed to create a self-basting environment. The cone-shaped lid captures rising steam, condenses it, and returns moisture to ingredients, allowing for slow, gentle cooking with minimal added liquid. This Moroccan technique excels at developing intense, harmonized flavors while preserving the distinct character of individual ingredients.";
      
    case 'wok cooking':
    case 'stir fry':
    case 'stir-fry':
      return "Wok cooking utilizes a rounded, high-sided pan capable of achieving extremely high temperatures to quickly cook ingredients while preserving texture and nutritional value. The technique relies on the wok's unique thermal properties—intense heat at the bottom that diminishes up the sides—to allow simultaneous cooking at different temperatures. The high heat and constant motion produce 'wok hei', a distinctive smoky flavor prized in Asian cuisines.";
      
    case 'open fire cooking':
    case 'open-fire cooking':
    case 'fire cooking':
      return "Open fire cooking connects with our most primal cooking techniques, utilizing direct flame, radiant heat, and smoke to transform ingredients. This versatile method adapts to various cooking styles from direct searing to low-and-slow roasting. The unpredictable nature of fire requires constant attention and adjustment, rewarding skill with uniquely complex flavors impossible to replicate with modern appliances.";
      
    default:
      return `${methodName} is a cooking technique that transforms ingredients through specific application of heat, pressure, or chemical processes. It's characterized by its unique approach to food preparation that affects texture, flavor, and nutritional properties.`;
  }
}

/**
 * Returns a list of ideal ingredients for the specified cooking method
 * @param methodName The cooking method to get ideal ingredients for
 * @returns An array of strings with ideal ingredients
 */
export function getIdealIngredients(methodName: string): string[] {
  const methodLower = methodName.toLowerCase();
  const ingredients: string[] = [];
  
  switch(methodLower) {
    case 'hand pounding':
    case 'hand_pounding':
      ingredients.push("Fresh herbs like basil, cilantro, and mint for vibrant pastes and sauces");
      ingredients.push("Whole spices requiring crushing (peppercorns, coriander, cumin)");
      ingredients.push("Fibrous aromatics such as lemongrass, galangal, and ginger");
      ingredients.push("Nuts and seeds for pastes and spreads (pine nuts, sesame)");
      ingredients.push("Starchy foods like boiled yams, plantains, and cassava for African fufu");
      break;
      
    case 'slow simmering':
      ingredients.push("Tough, collagen-rich cuts of meat like shanks, shoulders, and oxtail");
      ingredients.push("Root vegetables that benefit from slow flavor development");
      ingredients.push("Dried legumes such as beans, lentils, and chickpeas");
      ingredients.push("Whole grains like barley, farro, and wheat berries");
      ingredients.push("Bone-in proteins that release flavor and gelatin during cooking");
      break;
      
    case 'clay pot cooking':
      ingredients.push("Hearty stews and braises with layered ingredients");
      ingredients.push("Rice dishes that benefit from crispy bottom layer formation");
      ingredients.push("Meat and vegetable combinations with minimal liquid");
      ingredients.push("Seafood that benefits from gentle, even cooking");
      ingredients.push("Dishes with fermented elements like wine, soy, or fish sauce");
      break;
      
    case 'steaming':
      ingredients.push("Delicate seafood like fish fillets, scallops, and shellfish");
      ingredients.push("Dumplings, buns, and other dough-wrapped foods");
      ingredients.push("Custards and puddings requiring gentle, moisture-rich heat");
      ingredients.push("Vegetables that retain color and nutrients (leafy greens, asparagus)");
      ingredients.push("Whole grains like rice, millet, and quinoa");
      break;
      
    default:
      ingredients.push("Ingredients suited to this specific cooking method");
      ingredients.push("Foods that benefit from this method's unique properties");
      ingredients.push("Items traditionally prepared with this technique");
      ingredients.push("Refer to specific recipes for best ingredient pairings");
  }
  
  return ingredients;
} 