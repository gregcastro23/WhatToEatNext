import { 
  ElementalProperties, 
  ZodiacSign, 
  PlanetaryPosition,
  StandardizedAlchemicalResult
} from '../types/alchemy';
import { planetInfo, signs } from '../data/astroData';
import { dignityStrengthModifiers, DignityType } from './alchemicalCalculations';

/**
 * Enhanced matching algorithm to calculate astrological affinity between two signs
 * This integrates multiple data sources including:
 * 1. Decanic compatibility
 * 2. Degree-specific planetary influences
 * 3. Tarot correspondences
 * 4. Modality interactions
 * 
 * @param signA First sun sign
 * @param signB Second sun sign
 * @param planets Optional planetary positions for more accurate calculations
 * @returns Numeric score between 0-1 representing astrological affinity
 */
export function calculateAstrologicalAffinity(
  signA: ZodiacSign,
  signB: ZodiacSign, 
  planets?: Record<string, PlanetaryPosition>
): number {
  // Base elemental compatibility
  const elementA = signs[signA]?.Element;
  const elementB = signs[signB]?.Element;
  
  // Get modalities
  const modalityA = signs[signA]?.Modality;
  const modalityB = signs[signB]?.Modality;
  
  // Start with base elemental compatibility score
  let baseScore = 0.5; // Neutral starting point
  
  // Elemental compatibility matrix
  // Elements are only harmonious with themselves
  // Fire + Fire = Harmonious, Water + Water = Harmonious, etc.
  // Different elements create various interactions based on their character
  if (elementA && elementB) {
    if (elementA === elementB) {
      // Same element - apply modality affinity if available
      if (modalityA && modalityB) {
        // Apply element-modality natural affinity boost
        const modalityCompatibility = compareModalities(modalityA, modalityB, elementA, elementB);
        baseScore = 0.6 + (modalityCompatibility * 0.3); // Scale between 0.6-0.9
      } else {
        baseScore = 0.8; // Default same element without modality info
      }
    } else {
      // Different elements are less harmonious
      baseScore = 0.4;
    }
  }
  
  // Calculate decanic compatibility
  const decanCompat = compareDecanRulers(
    signs[signA]?.["Decan Effects"] || {},
    signs[signB]?.["Decan Effects"] || {}
  );
  
  // Calculate degree-specific influences
  const degreeCompat = calculateDegreeOverlap(
    signs[signA]?.["Degree Effects"] || {},
    signs[signB]?.["Degree Effects"] || {}
  );
  
  // Calculate tarot correspondences influence
  const tarotCompat = compareTarotArcana(
    signs[signA]?.["Major Tarot Card"] || "",
    signs[signB]?.["Major Tarot Card"] || ""
  );
  
  // Calculate modality compatibility with elements
  const modalityCompat = modalityA && modalityB ? 
    compareModalities(modalityA, modalityB, elementA, elementB) : 0.5;
  
  // Calculate rulership compatibility
  const rulerCompat = compareRulers(
    signs[signA]?.Ruler || "",
    signs[signB]?.Ruler || ""
  );
  
  // Weight components based on their relative importance
  return (
    baseScore * 0.35 +         // Element base compatibility (35%)
    decanCompat * 0.15 +       // Decanic influences (15%)
    degreeCompat * 0.15 +      // Degree-specific effects (15%)
    modalityCompat * 0.20 +    // Modality compatibility (20% - increased from 15%)
    rulerCompat * 0.10 +       // Planetary rulership (10% - decreased from 15%)
    tarotCompat * 0.05         // Tarot correspondences (5%)
  );
}

/**
 * Compare decanic rulers between two signs for compatibility
 * 
 * @param decanA First sign's decan effects
 * @param decanB Second sign's decan effects
 * @returns Compatibility score between 0-1
 */
function compareDecanRulers(
  decanA: Record<string, unknown>,
  decanB: Record<string, unknown>
): number {
  let compatibilityScore = 0;
  let comparisons = 0;
  
  // Extract all planetary rulers from both signs' decans
  const extractRulers = (decans: Record<string, unknown>): string[] => {
    const rulers: string[] = [];
    Object.values(decans).forEach(decan => {
      if (Array.isArray(decan)) {
        rulers.push(...decan);
      }
    });
    return rulers;
  };
  
  const rulersA = extractRulers(decanA);
  const rulersB = extractRulers(decanB);
  
  // No rulers found
  if (rulersA.length === 0 || rulersB.length === 0) {
    return 0.5; // Neutral compatibility
  }
  
  // Count matches and harmonious pairs
  rulersA.forEach(rulerA => {
    rulersB.forEach(rulerB => {
      comparisons++;
      
      // Exact match
      if (rulerA === rulerB) {
        compatibilityScore += 1.0;
      } 
      // Harmonious pairs (based on planetary dignities)
      else if (
        (rulerA === 'sun' && rulerB === 'jupiter') ||
        (rulerA === 'jupiter' && rulerB === 'sun') ||
        (rulerA === 'moon' && rulerB === 'venus') ||
        (rulerA === 'venus' && rulerB === 'moon') ||
        (rulerA === 'mercury' && rulerB === 'uranus') ||
        (rulerA === 'uranus' && rulerB === 'mercury') ||
        (rulerA === 'mars' && rulerB === 'pluto') ||
        (rulerA === 'pluto' && rulerB === 'mars') ||
        (rulerA === 'saturn' && rulerB === 'neptune') ||
        (rulerA === 'neptune' && rulerB === 'saturn')
      ) {
        compatibilityScore += 0.75;
      }
      // Neutral pairs
      else {
        compatibilityScore += 0.5;
      }
    });
  });
  
  // Return average compatibility score
  return comparisons > 0 
    ? compatibilityScore / comparisons 
    : 0.5;
}

/**
 * Calculate compatibility based on degree-specific planetary influences
 * 
 * @param degreesA First sign's degree effects
 * @param degreesB Second sign's degree effects
 * @returns Compatibility score between 0-1
 */
function calculateDegreeOverlap(
  degreesA: Record<string, unknown>,
  degreesB: Record<string, unknown>
): number {
  // If no degree data available, return neutral score
  if (
    !degreesA || 
    !degreesB || 
    Object.keys(degreesA).length === 0 || 
    Object.keys(degreesB).length === 0
  ) {
    return 0.5;
  }
  
  let totalPlanets = 0;
  let overlappingPlanets = 0;
  
  // Count planets that appear in both signs' degree effects
  Object.keys(degreesA).forEach(planet => {
    totalPlanets++;
    if (degreesB[planet]) {
      overlappingPlanets++;
    }
  });
  
  Object.keys(degreesB).forEach(planet => {
    if (!degreesA[planet]) {
      totalPlanets++; // Count unique planets in the second sign
    }
  });
  
  // Calculate overlap percentage and convert to a score
  const overlapPercentage = totalPlanets > 0 
    ? overlappingPlanets / totalPlanets 
    : 0;
    
  // Weight shared planetary influences (higher = more compatible)
  return 0.4 + (overlapPercentage * 0.6);
}

/**
 * Compare tarot arcana correspondences for compatibility
 * 
 * @param tarotA First sign's major arcana
 * @param tarotB Second sign's major arcana
 * @returns Compatibility score between 0-1
 */
function compareTarotArcana(tarotA: string, tarotB: string): number {
  // Element-based tarot card groups
  const elementGroups = {
    fire: ["The Emperor", "Strength", "Temperance", "The sun"],
    water: ["The High Priestess", "The Hanged Man", "Death", "The moon"],
    air: ["The Magician", "Justice", "The Star", "The World"],
    earth: ["The Hierophant", "The Hermit", "The Devil", "Judgement"],
    neutral: ["The Fool", "The Chariot", "The Tower", "The Lovers", "The Wheel of Fortune"]
  };
  
  // Determine which groups the cards belong to
  let groupA: string | null = null;
  let groupB: string | null = null;
  
  for (const [element, cards] of Object.entries(elementGroups)) {
    if (cards.includes(tarotA)) {
      groupA = element;
    }
    if (cards.includes(tarotB)) {
      groupB = element;
    }
  }
  
  // Score based on tarot card relationships - corrected to match elemental harmony rules
  if (!groupA || !groupB) {
    return 0.5; // Neutral if cards not found
  }
  
  // Same card = perfect match
  if (tarotA === tarotB) {
    return 1.0;
  }
  
  // Same element group = good match
  if (groupA === groupB) {
    return 0.8;
  }
  
  // Different elements have less harmony
  return 0.4;
}

/**
 * Compare modalities for compatibility, implementing hierarchical elemental modality affinities
 * 
 * @param modalityA First sign's modality
 * @param modalityB Second sign's modality
 * @param elementA First sign's element (optional)
 * @param elementB Second sign's element (optional)
 * @returns Compatibility score between 0-1
 */
function compareModalities(
  modalityA: string, 
  modalityB: string,
  elementA?: string,
  elementB?: string
): number {
  // Same modality = higher compatibility
  if (modalityA === modalityB) {
    // If we have elements, apply element-modality affinity bonus
    if (elementA && elementB) {
      // Same element has highest compatibility
      if (elementA === elementB) {
        // The specific modality matters for same-element combinations
        if (modalityA === 'Cardinal') {
          // Cardinal + Cardinal of same element has equal resonance for all elements
          return 0.9;
        } else if (modalityA === 'Fixed') {
          // Fixed + Fixed follows hierarchy: Earth > Water > Fire > Air
          if (elementA === 'Earth') return 0.95;
          if (elementA === 'Water') return 0.9;
          if (elementA === 'Fire') return 0.85;
          if (elementA === 'Air') return 0.8;
        } else if (modalityA === 'Mutable') {
          // Mutable + Mutable follows hierarchy: Air > Water > Fire > Earth
          if (elementA === 'Air') return 0.95;
          if (elementA === 'Water') return 0.9;
          if (elementA === 'Fire') return 0.85;
          if (elementA === 'Earth') return 0.8;
        }
      } else {
        // Different elements - get individual element-modality affinities
        const affinityA = getElementModalityAffinity(elementA, modalityA);
        const affinityB = getElementModalityAffinity(elementB, modalityA);
        
        // Average the affinities
        return (affinityA + affinityB) / 2;
      }
    }
    return 0.8; // Same modality without element information
  }
  
  // Different modalities
  
  // Cardinal and Fixed combinations
  if (
    (modalityA === 'Cardinal' && modalityB === 'Fixed') ||
    (modalityA === 'Fixed' && modalityB === 'Cardinal')
  ) {
    // If we have elements, check natural affinities
    if (elementA && elementB) {
      if (elementA === elementB) {
        // Same element
        if (elementA === 'Earth') return 0.75; // Earth bridges Cardinal-Fixed well
        if (elementA === 'Water') return 0.7;
        if (elementA === 'Fire') return 0.65;
        if (elementA === 'Air') return 0.6;
      } else {
        // Different elements - calculate average of their modal affinities
        const cardinalModality = modalityA === 'Cardinal' ? modalityA : modalityB;
        const fixedModality = modalityA === 'Fixed' ? modalityA : modalityB;
        
        const elementACardinal = getElementModalityAffinity(elementA, cardinalModality);
        const elementBCardinal = getElementModalityAffinity(elementB, cardinalModality);
        const elementAFixed = getElementModalityAffinity(elementA, fixedModality);
        const elementBFixed = getElementModalityAffinity(elementB, fixedModality);
        
        return (elementACardinal + elementBCardinal + elementAFixed + elementBFixed) / 4;
      }
    }
    return 0.5; // Without element information
  }
  
  // Cardinal and Mutable combinations
  if (
    (modalityA === 'Cardinal' && modalityB === 'Mutable') ||
    (modalityA === 'Mutable' && modalityB === 'Cardinal')
  ) {
    // If we have elements, check natural affinities
    if (elementA && elementB) {
      if (elementA === elementB) {
        // Same element
        if (elementA === 'Air') return 0.75; // Air bridges Cardinal-Mutable well
        if (elementA === 'Water') return 0.7;
        if (elementA === 'Fire') return 0.65;
        if (elementA === 'Earth') return 0.6;
      } else {
        // Different elements - calculate average of their modal affinities
        const cardinalModality = modalityA === 'Cardinal' ? modalityA : modalityB;
        const mutableModality = modalityA === 'Mutable' ? modalityA : modalityB;
        
        const elementACardinal = getElementModalityAffinity(elementA, cardinalModality);
        const elementBCardinal = getElementModalityAffinity(elementB, cardinalModality);
        const elementAMutable = getElementModalityAffinity(elementA, mutableModality);
        const elementBMutable = getElementModalityAffinity(elementB, mutableModality);
        
        return (elementACardinal + elementBCardinal + elementAMutable + elementBMutable) / 4;
      }
    }
    return 0.6; // Without element information
  }
  
  // Fixed and Mutable combinations (typically challenging)
  if (
    (modalityA === 'Fixed' && modalityB === 'Mutable') ||
    (modalityA === 'Mutable' && modalityB === 'Fixed')
  ) {
    // If we have elements, check natural affinities
    if (elementA && elementB) {
      if (elementA === elementB) {
        // Same element
        if (elementA === 'Water') return 0.7; // Water bridges Fixed-Mutable best
        if (elementA === 'Fire') return 0.6; 
        if (elementA === 'Earth' || elementA === 'Air') return 0.5;
      } else {
        // Different elements - calculate average of their modal affinities
        const fixedModality = modalityA === 'Fixed' ? modalityA : modalityB;
        const mutableModality = modalityA === 'Mutable' ? modalityA : modalityB;
        
        const elementAFixed = getElementModalityAffinity(elementA, fixedModality);
        const elementBFixed = getElementModalityAffinity(elementB, fixedModality);
        const elementAMutable = getElementModalityAffinity(elementA, mutableModality);
        const elementBMutable = getElementModalityAffinity(elementB, mutableModality);
        
        return (elementAFixed + elementBFixed + elementAMutable + elementBMutable) / 4;
      }
    }
    return 0.4; // Without element information
  }
  
  return 0.5; // Default neutral score
}

/**
 * Calculate element-modality natural affinity
 * Uses the hierarchical affinities:
 * - Mutability: Air > Water > Fire > Earth
 * - Fixed: Earth > Water > Fire > Air
 * - Cardinal: Equal for all elements
 * 
 * @param element Element to check
 * @param modality Modality to check
 * @returns Affinity score between 0-1
 */
function getElementModalityAffinity(element: string, modality: string): number {
  // Mutability hierarchy (high to low): Air > Water > Fire > Earth
  if (modality === 'Mutable') {
    switch (element) {
      case 'Air': return 0.9;
      case 'Water': return 0.8;
      case 'Fire': return 0.7;
      case 'Earth': return 0.5;
      default: return 0.5;
    }
  }
  
  // Fixed hierarchy (high to low): Earth > Water > Fire > Air
  if (modality === 'Fixed') {
    switch (element) {
      case 'Earth': return 0.9;
      case 'Water': return 0.8;
      case 'Fire': return 0.6;
      case 'Air': return 0.5;
      default: return 0.5;
    }
  }
  
  // Cardinality is equal for all elements
  if (modality === 'Cardinal') {
    return 0.8;
  }
  
  return 0.5; // Default
}

/**
 * Compare planetary rulers for compatibility
 * 
 * @param rulerA First sign's planetary ruler
 * @param rulerB Second sign's planetary ruler
 * @returns Compatibility score between 0-1
 */
function compareRulers(rulerA: string, rulerB: string): number {
  // Same ruler = strong compatibility
  if (rulerA === rulerB) {
    return 0.9;
  }
  
  // Define ruler pairs that work well together
  const harmonious: [string, string][] = [
    ['sun', 'jupiter'],
    ['jupiter', 'sun'],
    ['moon', 'venus'],
    ['venus', 'moon'],
    ['mercury', 'uranus'],
    ['uranus', 'mercury'],
    ['mars', 'pluto'],
    ['pluto', 'mars'],
    ['saturn', 'neptune'],
    ['neptune', 'saturn']
  ];
  
  // Define ruler pairs that create tension
  const challenging: [string, string][] = [
    ['sun', 'saturn'],
    ['saturn', 'sun'],
    ['moon', 'mars'],
    ['mars', 'moon'],
    ['venus', 'pluto'],
    ['pluto', 'venus'],
    ['mercury', 'jupiter'],
    ['jupiter', 'mercury']
  ];
  
  // Check if rulers are in harmonious pairs
  if (harmonious.some(([a, b]) => a === rulerA && b === rulerB)) {
    return 0.8;
  }
  
  // Check if rulers are in challenging pairs
  if (challenging.some(([a, b]) => a === rulerA && b === rulerB)) {
    return 0.3;
  }
  
  return 0.5; // Default neutral score
}

/**
 * Evaluate alchemical compatibility between two recipes or ingredients
 * This function integrates multiple data sources for a comprehensive match
 * 
 * @param elementalPropertiesA First recipe/ingredient's elemental properties
 * @param elementalPropertiesB Second recipe/ingredient's elemental properties
 * @param sunSignA Optional sun sign association for first item
 * @param sunSignB Optional sun sign association for second item
 * @returns Match score between 0 and 1
 */
export function calculateAlchemicalCompatibility(
  elementalPropertiesA: ElementalProperties,
  elementalPropertiesB: ElementalProperties,
  sunSignA?: ZodiacSign,
  sunSignB?: ZodiacSign
): number {
  // Calculate elemental compatibility using cosine similarity
  // This measures how similar the "direction" of the elemental vectors are
  // regardless of their magnitude
  const elements = ['Fire', 'Water', 'Earth', 'Air'];
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;
  
  for (const element of elements) {
    const valueA = elementalPropertiesA[element as keyof ElementalProperties] || 0;
    const valueB = elementalPropertiesB[element as keyof ElementalProperties] || 0;
    
    dotProduct += valueA * valueB;
    magnitudeA += valueA * valueA;
    magnitudeB += valueB * valueB;
  }
  
  // Prevent division by zero
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0.5; // Neutral score if either has no elemental properties
  }
  
  // Calculate cosine similarity (ranges from 0 to 1 for positive values)
  const cosineSimilarity = dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
  
  // Element-specific synergy calculations following the principles that
  // each element is independently valuable and elements don't oppose each other
  let synergisticBonus = 0;
  
  for (const element of elements) {
    const valueA = elementalPropertiesA[element as keyof ElementalProperties] || 0;
    const valueB = elementalPropertiesB[element as keyof ElementalProperties] || 0;
    
    // Higher values of the same element create stronger harmony
    // Calculate the synergistic effect (higher when both have high values)
    // The product represents the combined strength of this element
    const elementSynergy = valueA * valueB * 0.5;
    synergisticBonus += elementSynergy;
  }
  
  // Scale the synergistic bonus to ensure it remains in a reasonable range
  synergisticBonus = Math.min(0.2, synergisticBonus);
  
  // Base elemental compatibility score is combination of similarity and synergy
  const elementalScore = 0.7 * cosineSimilarity + 0.3 * (1 + synergisticBonus);
  
  // Calculate sun sign compatibility if provided
  let sunSignScore = 0.5; // Default neutral value
  
  if (sunSignA && sunSignB) {
    sunSignScore = calculateAstrologicalAffinity(sunSignA, sunSignB);
    
    // Element-based harmony bonus for sun signs
    if (sunSignA && sunSignB) {
      const signElementA = getZodiacElement(sunSignA);
      const signElementB = getZodiacElement(sunSignB);
      
      // Same element signs have highest compatibility
      if (signElementA === signElementB) {
        sunSignScore = Math.max(sunSignScore, 0.9);
      } else {
        // Different elements still have good compatibility
        sunSignScore = Math.max(sunSignScore, 0.7);
      }
    }
  }
  
  // Weight elemental properties more than sun sign association
  const finalScore = elementalScore * 0.7 + sunSignScore * 0.3;
  
  return Math.min(1, Math.max(0, finalScore)); // Ensure result is between 0 and 1
}

/**
 * Helper function to get the element associated with a zodiac sign
 */
function getZodiacElement(sign: ZodiacSign): string {
  const elementMap: Record<ZodiacSign, string> = {
    aries: 'Fire',
    taurus: 'Earth',
    gemini: 'Air',
    cancer: 'Water',
    leo: 'Fire',
    virgo: 'Earth',
    libra: 'Air',
    scorpio: 'Water',
    sagittarius: 'Fire',
    capricorn: 'Earth',
    aquarius: 'Air',
    pisces: 'Water'
  };
  
  return elementMap[sign] || 'Fire'; // Default to Fire if sign not found
}

/**
 * Enhanced meal recommendation algorithm based on multiple influences
 * 
 * @param astroResult The calculated alchemical result
 * @param userPreferences Optional user dietary preferences/restrictions
 * @param season Optional current season
 * @returns Recommended meal components with reasoning
 */
export function generateEnhancedRecommendation(
  astroResult: StandardizedAlchemicalResult,
  userPreferences?: string[],
  season?: string
): {
  mainIngredient: string;
  secondaryIngredient: string;
  flavor: string;
  cookingMethod: string;
  reasoning: {
    elementalInfluence: string;
    decanic: string;
    planetary: string;
    seasonal: string;
    modalityInfluence: string;
  }
} {
  // Extract dominant element and modality from the standard properties
  const dominantElement = astroResult.dominantElement || 'Fire';
  const dominantModality = astroResult['Dominant Modality'] || 'Cardinal';
  
  // Calculate natural element-modality affinity
  const modalityAffinity = getElementModalityAffinity(dominantElement, dominantModality);

  // Extract the most prominent planet
  const dominantPlanet = astroResult['Chart Ruler'] || 'sun';
  
  // Get seasonal information if provided
  const currentSeason = season ? season.toLowerCase() : 'spring';
  const { boost: seasonalBoosts, avoid: seasonalAvoids } = getSeasonalAdjustments(currentSeason, dominantElement);
  
  // Calculate alchemical influences based on spirit, essence, matter, substance
  // These could be used for more nuanced recommendations
  const spiritInfluence = astroResult.spirit || 0.25;
  const essenceInfluence = astroResult.essence || 0.25;
  const matterInfluence = astroResult.matter || 0.25;
  const substanceInfluence = astroResult.substance || 0.25;
  
  // Base recommendations on dominant element with modality influence
  const elementRecommendations = {
    Fire: {
      ingredients: ['chicken', 'lamb', 'peppers', 'chili'],
      flavors: ['spicy', 'sour', 'aromatic'],
      methods: dominantModality === 'Mutable' ? 
        ['stir-frying', 'grilling', 'quick roasting'] : 
        dominantModality === 'Fixed' ? 
        ['slow roasting', 'smoking', 'ember cooking'] :
        ['grilling', 'roasting', 'flame cooking']
    },
    Water: {
      ingredients: ['fish', 'shellfish', 'cucumber', 'melon'],
      flavors: ['salty', 'subtle', 'aromatic'],
      methods: dominantModality === 'Mutable' ? 
        ['poaching', 'steaming', 'marinating'] : 
        dominantModality === 'Fixed' ? 
        ['slow simmering', 'fermenting', 'curing'] :
        ['steaming', 'poaching', 'chilling']
    },
    Earth: {
      ingredients: ['beef', 'root vegetables', 'mushrooms', 'grains'],
      flavors: ['savory', 'umami', 'bitter'],
      methods: dominantModality === 'Mutable' ? 
        ['baking', 'roasting', 'toasting'] : 
        dominantModality === 'Fixed' ? 
        ['slow-cooking', 'clay pot cooking', 'pressure cooking'] :
        ['braising', 'baking', 'pressure cooking']
    },
    Air: {
      ingredients: ['poultry', 'leafy greens', 'legumes', 'seeds'],
      flavors: ['light', 'aromatic', 'tangy'],
      methods: dominantModality === 'Mutable' ? 
        ['whipping', 'aerating', 'cold infusing'] : 
        dominantModality === 'Fixed' ? 
        ['aging', 'curing', 'fermenting'] :
        ['quick-cooking', 'raw preparation', 'infusing']
    }
  };
  
  // Use elemental balance to adjust ingredient recommendations
  // Get the elemental balance and use it to influence the recommendations
  const elementalBalance = astroResult.elementalBalance || {
    fire: 0.25,
    water: 0.25,
    earth: 0.25,
    air: 0.25
  };
  
  // Modality influences cooking preparation style with element consideration
  const modalityInfluence = {
    Cardinal: {
      style: `${dominantElement === 'Fire' || dominantElement === 'Air' ? 
        'quick, energetic' : 'direct, purposeful'} preparations with clear flavors`,
      ingredients: ['fresh seasonal produce', 'simple proteins']
    },
    Fixed: {
      style: `${dominantElement === 'Earth' || dominantElement === 'Water' ? 
        'deep, substantial' : 'lasting, concentrated'} dishes with depth of flavor`,
      ingredients: ['preserved items', 'slow-cooked components']
    },
    Mutable: {
      style: `${dominantElement === 'Air' || dominantElement === 'Water' ? 
        'fluid, adaptable' : 'transformative, versatile'} dishes with multiple elements`,
      ingredients: ['fusion ingredients', 'diverse textures']
    }
  };
  
  // Season adjusts the recommendations
  const seasonalInfluence = season ? getSeasonalAdjustments(season, dominantElement) : {
    boost: [] as string[],
    avoid: [] as string[]
  };
  
  // Select recommendations based on dominant element
  const eleRecs = elementRecommendations[dominantElement as keyof typeof elementRecommendations];
  const modRecs = modalityInfluence[dominantModality as keyof typeof modalityInfluence];
  
  // Filter based on user preferences if available
  const filteredIngredients = userPreferences 
    ? eleRecs.ingredients.filter(i => !userPreferences.some(p => i.includes(p)))
    : eleRecs.ingredients;
  
  // Select ingredients with seasonal adjustments
  let mainIngredient = filteredIngredients[0];
  let secondaryIngredient = filteredIngredients[1];
  
  // Adjust based on seasonal boosts
  if (seasonalInfluence.boost.length > 0) {
    const boostedOptions = filteredIngredients.filter(i => 
      seasonalInfluence.boost.some(boost => i.includes(boost))
    );
    if (boostedOptions.length > 0) {
      mainIngredient = boostedOptions[0];
    }
  }
  
  // Avoid seasonally inappropriate ingredients
  if (seasonalInfluence.avoid.length > 0) {
    const avoidList = seasonalInfluence.avoid;
    
    if (avoidList.some(avoid => mainIngredient.includes(avoid))) {
      const alternatives = filteredIngredients.filter(i => 
        !avoidList.some(avoid => i.includes(avoid))
      );
      if (alternatives.length > 0) {
        mainIngredient = alternatives[0];
      }
    }
    
    if (avoidList.some(avoid => secondaryIngredient.includes(avoid))) {
      const alternatives = filteredIngredients.filter(i => 
        i !== mainIngredient && 
        !avoidList.some(avoid => i.includes(avoid))
      );
      if (alternatives.length > 0) {
        secondaryIngredient = alternatives[0];
      }
    }
  }
  
  // Select flavor and cooking method
  const flavor = eleRecs.flavors[0];
  const cookingMethod = eleRecs.methods[0];
  
  // Use alchemical properties to refine recommendation
  const alchemicalInfluence = `${spiritInfluence > 0.3 ? 'spiritual' : 'practical'} and ${
    essenceInfluence > 0.3 ? 'flavorful' : 'substantial'}`;
  
  // Generate reasoning with added modality influence
  return {
    mainIngredient,
    secondaryIngredient,
    flavor,
    cookingMethod,
    reasoning: {
      elementalInfluence: `${dominantElement} element (${Math.round(
        (dominantElement === 'Fire' ? elementalBalance.fire : 
         dominantElement === 'Water' ? elementalBalance.water :
         dominantElement === 'Earth' ? elementalBalance.earth : 
         elementalBalance.air) * 100)}%) suggests ${eleRecs.methods[0]} ${mainIngredient}`,
      decanic: `Current ${alchemicalInfluence} influences favor ${flavor} flavors`,
      planetary: `${dominantPlanet} influence suggests ${modRecs.style}`,
      seasonal: season ? `${season.charAt(0).toUpperCase() + season.slice(1)} calls for ${seasonalInfluence.boost.join(', ')}` : 'No seasonal data provided',
      modalityInfluence: `${dominantModality} ${dominantElement} particularly favors ${modalityAffinity > 0.7 ? 'strong' : 'moderate'} ${cookingMethod} techniques`
    }
  };
}

/**
 * Get seasonal adjustments for food recommendations
 * 
 * @param season Current season
 * @param dominantElement Dominant element from astrological calculation
 * @returns Lists of ingredients to boost or avoid
 */
function getSeasonalAdjustments(
  season: string,
  dominantElement: string
): { boost: string[], avoid: string[] } {
  const normalizedSeason = season.toLowerCase();
  
  // Base seasonal recommendations
  const seasonalFoods = {
    spring: {
      boost: ['asparagus', 'peas', 'strawberries', 'leafy greens', 'sprouts'],
      avoid: ['heavy stews', 'root vegetables', 'preserved foods']
    },
    summer: {
      boost: ['tomatoes', 'peppers', 'berries', 'stone fruits', 'fresh herbs'],
      avoid: ['slow-cooked', 'braised dishes', 'heavy sauces']
    },
    fall: {
      boost: ['squash', 'apples', 'pears', 'mushrooms', 'root vegetables'],
      avoid: ['cooling foods', 'raw preparations', 'tropical fruits']
    },
    autumn: {
      boost: ['squash', 'apples', 'pears', 'mushrooms', 'root vegetables'],
      avoid: ['cooling foods', 'raw preparations', 'tropical fruits']
    },
    winter: {
      boost: ['citrus', 'winter greens', 'preserved foods', 'warming spices'],
      avoid: ['raw preparations', 'cooling foods', 'summery dishes']
    }
  };
  
  // Default to winter if season not recognized
  const seasonKey = (normalizedSeason === 'spring' || 
                    normalizedSeason === 'summer' || 
                    normalizedSeason === 'autumn' || 
                    normalizedSeason === 'fall' ||
                    normalizedSeason === 'winter')
                    ? (normalizedSeason === 'fall' ? 'autumn' : normalizedSeason)
                    : 'winter';
  
  // Adjust based on element-season harmony
  const elementalAdjustment = {
    Fire: {
      spring: { extraBoost: ['radishes', 'arugula'], extraAvoid: ['cooling melons'] },
      summer: { extraBoost: ['chili peppers', 'garlic'], extraAvoid: [] },
      autumn: { extraBoost: ['ginger', 'warming spices'], extraAvoid: ['raw greens'] },
      winter: { extraBoost: ['warming spices', 'chilis'], extraAvoid: [] }
    },
    Water: {
      spring: { extraBoost: ['fresh fish', 'herbs'], extraAvoid: [] },
      summer: { extraBoost: ['cucumber', 'watermelon'], extraAvoid: ['heating spices'] },
      autumn: { extraBoost: ['pears', 'apples'], extraAvoid: [] },
      winter: { extraBoost: ['citrus', 'broths'], extraAvoid: [] }
    },
    Earth: {
      spring: { extraBoost: ['new potatoes', 'spring onions'], extraAvoid: [] },
      summer: { extraBoost: ['corn', 'beans'], extraAvoid: ['heavy stews'] },
      autumn: { extraBoost: ['root vegetables', 'squash'], extraAvoid: [] },
      winter: { extraBoost: ['preserved roots', 'slow-cooked dishes'], extraAvoid: ['raw foods'] }
    },
    Air: {
      spring: { extraBoost: ['herbs', 'sprouts'], extraAvoid: [] },
      summer: { extraBoost: ['berries', 'light grains'], extraAvoid: ['heavy sauces'] },
      autumn: { extraBoost: ['nuts', 'seeds'], extraAvoid: [] },
      winter: { extraBoost: ['aromatic spices', 'citrus zest'], extraAvoid: [] }
    }
  };
  
  // Get base seasonal adjustments
  const baseAdjust = seasonalFoods[seasonKey as keyof typeof seasonalFoods] || {
    boost: [],
    avoid: []
  };
  
  // Add elemental-seasonal adjustments
  const elementKey = dominantElement as keyof typeof elementalAdjustment;
  const seasonKeyTyped = seasonKey as keyof (typeof elementalAdjustment)[typeof elementKey];
  
  const elementAdjust = elementalAdjustment[elementKey] && 
                       elementalAdjustment[elementKey][seasonKeyTyped]
                       ? elementalAdjustment[elementKey][seasonKeyTyped]
                       : { extraBoost: [], extraAvoid: [] };
  
  return {
    boost: [...baseAdjust.boost, ...elementAdjust.extraBoost],
    avoid: [...baseAdjust.avoid, ...elementAdjust.extraAvoid]
  };
}

/**
 * Enhanced validation function to test if algorithms are using all data sources
 * 
 * @returns Validation results with test outcomes
 */
export function validateAlgorithms(): {
  success: boolean;
  results: Array<{ test: string; passed: boolean; info?: string }>;
} {
  const testResults = [];
  
  // Test 1: Verify decanic compatibility calculation
  const decanTest = {
    test: "Decanic influence calculation",
    passed: false,
    info: ""
  };
  
  try {
    const decanA = { "1st Decan": ["mars"], "2nd Decan": ["sun"], "3rd Decan": ["venus"] };
    const decanB = { "1st Decan": ["venus"], "2nd Decan": ["mercury"], "3rd Decan": ["saturn"] };
    const decanScore = compareDecanRulers(decanA, decanB);
    
    decanTest.passed = typeof decanScore === 'number' && decanScore >= 0 && decanScore <= 1;
    decanTest.info = `Score: ${decanScore}`;
  } catch (error) {
    decanTest.info = `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
  
  testResults.push(decanTest);
  
  // Test 2: Verify degree-specific calculation
  const degreeTest = {
    test: "Degree-specific influence calculation",
    passed: false,
    info: ""
  };
  
  try {
    const degreeA = { "mercury": [15, 21], "venus": [7, 14], "mars": [22, 26] };
    const degreeB = { "mercury": [9, 15], "venus": [1, 8], "mars": [27, 30] };
    const degreeScore = calculateDegreeOverlap(degreeA, degreeB);
    
    degreeTest.passed = typeof degreeScore === 'number' && degreeScore >= 0 && degreeScore <= 1;
    degreeTest.info = `Score: ${degreeScore}`;
  } catch (error) {
    degreeTest.info = `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
  
  testResults.push(degreeTest);
  
  // Test 3: Verify tarot correspondence calculation
  const tarotTest = {
    test: "Tarot correspondence calculation",
    passed: false,
    info: ""
  };
  
  try {
    const tarotScore = compareTarotArcana("The Emperor", "The Chariot");
    
    tarotTest.passed = typeof tarotScore === 'number' && tarotScore >= 0 && tarotScore <= 1;
    tarotTest.info = `Score: ${tarotScore}`;
  } catch (error) {
    tarotTest.info = `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
  
  testResults.push(tarotTest);
  
  // Test 4: Verify modality calculation
  const modalityTest = {
    test: "Modality compatibility calculation",
    passed: false,
    info: ""
  };
  
  try {
    const modalityScore = compareModalities("Cardinal", "Mutable");
    
    modalityTest.passed = typeof modalityScore === 'number' && modalityScore >= 0 && modalityScore <= 1;
    modalityTest.info = `Score: ${modalityScore}`;
  } catch (error) {
    modalityTest.info = `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
  
  testResults.push(modalityTest);
  
  // Test 5: Verify planetary ruler calculation
  const rulerTest = {
    test: "Planetary ruler compatibility calculation",
    passed: false,
    info: ""
  };
  
  try {
    const rulerScore = compareRulers("mars", "venus");
    
    rulerTest.passed = typeof rulerScore === 'number' && rulerScore >= 0 && rulerScore <= 1;
    rulerTest.info = `Score: ${rulerScore}`;
  } catch (error) {
    rulerTest.info = `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
  
  testResults.push(rulerTest);
  
  // Test 6: Verify enhanced recipe recommendation
  const recipeTest = {
    test: "Enhanced recipe recommendation generation",
    passed: false,
    info: ""
  };
  
  try {
    const mockResult: StandardizedAlchemicalResult = {
      // Core elemental properties
      elementalBalance: {
        fire: 0.4,
        earth: 0.2,
        air: 0.2,
        water: 0.2
      },
      
      // Core alchemical properties
      spirit: 0.3,
      essence: 0.3,
      matter: 0.2,
      substance: 0.2,
      
      // Result summary
      dominantElement: 'Fire',
      
      // Using the 'Total Effect Value' for backward compatibility
      'Total Effect Value': {
        Fire: 0.4,
        Water: 0.2,
        Earth: 0.2,
        Air: 0.2
      },
      
      // Add modality information
      '#Cardinal': 3,
      '#Fixed': 2,
      '#Mutable': 1,
      '%Cardinal': 0.5,
      '%Fixed': 0.3,
      '%Mutable': 0.2,
      'Dominant Modality': 'Cardinal',
      
      // Add the original mock data under 'additional properties'
      elements: { Fire: 0.4, Water: 0.2, Earth: 0.2, Air: 0.2 },
      modalities: { Cardinal: 0.5, Fixed: 0.3, Mutable: 0.2 },
      qualities: { Hot: 0.6, Dry: 0.4, Cold: 0.2, Wet: 0.2 },
      dominant: {
        element: 'Fire',
        modality: 'Cardinal',
        quality: 'Hot'
      }
    };
    
    const recommendation = generateEnhancedRecommendation(mockResult, [], 'summer');
    
    recipeTest.passed = Boolean(
      recommendation &&
      recommendation.mainIngredient &&
      recommendation.cookingMethod &&
      recommendation.reasoning
    );
    
    recipeTest.info = `Main ingredient: ${recommendation.mainIngredient}`;
  } catch (error) {
    recipeTest.info = `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
  
  testResults.push(recipeTest);
  
  // Overall validation result
  const success = testResults.every(test => test.passed);
  
  return {
    success,
    results: testResults
  };
} 