import @/types  from 'recipe ';
import @/utils  from 'astrologyUtils ';

/**
 * Enriches recipe data with enhanced astrological properties
 */
export function enrichRecipeData(recipe: unknown): Recipe {
  // Create a deep copy to avoid mutating the original
  const enrichedRecipe = JSON.parse(JSON.stringify(recipe));
  
  // Ensure all required properties exist
  enrichedRecipe.id = enrichedRecipe.id || `recipe-${Date.now()}`;
  enrichedRecipe.name = enrichedRecipe.name || 'Unnamed Recipe';
  enrichedRecipe.description = enrichedRecipe.description || '';
  enrichedRecipe.cuisine = enrichedRecipe.cuisine || 'Various';
  enrichedRecipe.timeToMake = enrichedRecipe.timeToMake || '30 minutes';
  enrichedRecipe.numberOfServings = enrichedRecipe.numberOfServings || 4;
  enrichedRecipe.instructions = enrichedRecipe.instructions || [];
  
  // 1. Derive astrological influences from ingredients if not present
  if (!enrichedRecipe.astrologicalInfluences || enrichedRecipe.astrologicalInfluences.length === 0) {
    enrichedRecipe.astrologicalInfluences = deriveAstrologicalInfluencesFromIngredients(enrichedRecipe);
  }
  
  // 2. Derive elemental properties from cuisine and cooking method if not present
  if (!enrichedRecipe.elementalProperties) {
    enrichedRecipe.elementalProperties = deriveElementalProperties(enrichedRecipe);
  }
  
  // 3. Enhance seasonal information with zodiac correspondences
  enrichedRecipe.season = enrichAndNormalizeSeasons(enrichedRecipe.season);
  
  // 4. Add celestial timing recommendations
  enrichedRecipe.celestialTiming = deriveCelestialTiming(enrichedRecipe);
  
  return enrichedRecipe as Recipe;
}

function deriveAstrologicalInfluencesFromIngredients(recipe: Recipe): string[] {
  const influences: Set<string> = new Set();
  
  // Common astrological correspondences for ingredients
  const ingredientCorrespondences: Record<string, string[]> = {
    // Spices - Enhanced Mars, Sun, and Moon associations
    'cinnamon': ['Sun', 'Mars', 'fire'],
    'nutmeg': ['Jupiter', 'air'],
    'clove': ['Jupiter', 'Mars', 'fire'],
    'ginger': ['Mars', 'fire'],
    'pepper': ['Mars', 'fire'], 
    'chili': ['Mars', 'fire'],
    'cayenne': ['Mars', 'fire'],
    'paprika': ['Mars', 'Sun', 'fire'],
    'turmeric': ['Sun', 'earth'],
    'saffron': ['Sun', 'fire'],
    'cumin': ['Mars', 'earth'],
    'cardamom': ['Moon', 'Venus', 'water'],
    
    // Fruits - Enhanced Sun and Moon associations
    'apple': ['Venus', 'water'],
    'orange': ['Sun', 'fire'],
    'lemon': ['Moon', 'water'],
    'lime': ['Moon', 'water'],
    'grapefruit': ['Sun', 'water'],
    'pomegranate': ['Mars', 'Sun', 'fire'],
    'grape': ['Venus', 'water'],
    'banana': ['Moon', 'water'],
    'coconut': ['Moon', 'water'],
    'mango': ['Sun', 'fire'],
    'watermelon': ['Moon', 'water'],
    
    // Vegetables - Enhanced Mars, Sun, and Moon associations
    'potato': ['Earth', 'Saturn'],
    'carrot': ['Sun', 'Mars', 'earth'], // Added Mars association
    'onion': ['Mars', 'fire'],
    'garlic': ['Mars', 'fire'],
    'tomato': ['Mars', 'fire'],
    'bell pepper': ['Mars', 'fire'],
    'beetroot': ['Mars', 'earth'],
    'radish': ['Mars', 'fire'],
    'cucumber': ['Moon', 'water'],
    'mushroom': ['Moon', 'earth'],
    'corn': ['Sun', 'fire'],
    'pumpkin': ['Sun', 'earth'],
    'squash': ['Sun', 'earth'],
    
    // Grains - Enhanced Sun and Moon associations
    'rice': ['Moon', 'water'],
    'wheat': ['Sun', 'earth'],
    'quinoa': ['Sun', 'earth'],
    'oats': ['Venus', 'earth'],
    'barley': ['Moon', 'earth'],
    'rye': ['Saturn', 'earth'],
    'buckwheat': ['Mars', 'earth'],
    
    // Proteins - Enhanced Mars associations
    'beef': ['Mars', 'fire'],
    'lamb': ['aries', 'Mars', 'fire'],
    'venison': ['Mars', 'aries', 'fire'],
    'chicken': ['Mercury', 'Sun', 'air'], // Added Sun association
    'turkey': ['Jupiter', 'fire'],
    'fish': ['Neptune', 'pisces', 'water'],
    'salmon': ['Moon', 'Neptune', 'water'],
    'tuna': ['Mars', 'water'], // Added Mars association
    'shrimp': ['Moon', 'water'],
    'crab': ['Moon', 'cancer', 'water'],
    'egg': ['Moon', 'water'],
    
    // Herbs - Enhanced Mars, Sun, and Moon associations
    'basil': ['Mars', 'fire'],
    'rosemary': ['Sun', 'fire'],
    'thyme': ['Venus', 'air'],
    'sage': ['Jupiter', 'air'],
    'mint': ['Mercury', 'air'],
    'parsley': ['Mercury', 'air'],
    'cilantro': ['Mercury', 'air'],
    'oregano': ['Mars', 'fire'],
    'bay leaf': ['Sun', 'fire'],
    'dill': ['Mercury', 'air'],
    'tarragon': ['Mars', 'fire'],
    'chives': ['Mars', 'fire'],
    'chamomile': ['Moon', 'water'],
    'lavender': ['Moon', 'Neptune', 'water'],
    
    // Nuts and seeds - new section with Mars, Sun, and Moon associations
    'almond': ['Venus', 'Mercury', 'air'],
    'walnut': ['Jupiter', 'air'],
    'pecan': ['Jupiter', 'earth'],
    'sunflower seed': ['Sun', 'fire'],
    'pumpkin seed': ['Moon', 'water'],
    'sesame seed': ['Saturn', 'earth'],
    'pine nut': ['Mars', 'fire'],
    'flaxseed': ['Moon', 'water'],
    'chia seed': ['Moon', 'Neptune', 'water'],
    
    // Dairy - enhanced Moon associations
    'milk': ['Moon', 'water'],
    'cream': ['Moon', 'Venus', 'water'],
    'butter': ['Moon', 'Venus', 'water'],
    'cheese': ['Moon', 'earth'],
    'yogurt': ['Moon', 'Saturn', 'water'],
    
    // Sweeteners - Sun associations
    'honey': ['Sun', 'Venus', 'fire'],
    'maple syrup': ['Sun', 'Jupiter', 'water'],
    'sugar': ['Venus', 'water'],
    'molasses': ['Saturn', 'earth'],
  };
  
  // Extract ingredient names from recipe
  if (recipe.ingredients) {
    recipe.ingredients.forEach(ingredient => {
      const ingredientName = ingredient.name.toLowerCase();
      
      // Check for exact matches
      for (const [key, correspondences] of Object.entries(ingredientCorrespondences)) {
        if (ingredientName.includes(key)) {
          correspondences.forEach(c => influences.add(c));
        }
      }
    });
  }
  
  // If cooking method is available, add its associations
  if (recipe.cookingMethod) {
    let method = recipe.cookingMethod.toLowerCase();
    
    if (method.includes('roast') || method.includes('grill') || method.includes('bake')) {
      influences.add('Fire');
      influences.add('Mars');
      influences.add('Sun');
    } else if (method.includes('steam') || method.includes('boil') || method.includes('poach')) {
      influences.add('Water');
      influences.add('Moon');
      influences.add('Neptune');
    } else if (method.includes('fry') || method.includes('sauté')) {
      influences.add('Air');
      influences.add('Mercury');
      influences.add('Uranus');
    } else if (method.includes('ferment') || method.includes('pickle') || method.includes('cure')) {
      influences.add('Earth');
      influences.add('Saturn');
    } else if (method.includes('smoke') || method.includes('char')) {
      influences.add('Fire');
      influences.add('Mars');
    } else if (method.includes('marinate') || method.includes('brine')) {
      influences.add('Water');
      influences.add('Moon');
    }
  }
  
  // Add seasonal influences
  if (recipe.season) {
    const seasons = Array.isArray(recipe.season) ? recipe.season : [recipe.season];
    
    seasons.forEach(season => {
      let s = season.toLowerCase();
      if (s === 'spring' || s === 'aries' || s === 'taurus' || s === 'gemini') {
        influences.add('Mars'); // Spring is ruled by Mars (Aries)
      } else if (s === 'summer' || s === 'cancer' || s === 'leo' || s === 'virgo') {
        influences.add('Sun'); // Summer is ruled by Sun (Leo)
      } else if (s === 'fall' || s === 'autumn' || s === 'libra' || s === 'scorpio' || s === 'sagittarius') {
        influences.add('Venus'); // Fall is associated with Venus (Libra)
      } else if (s === 'winter' || s === 'capricorn' || s === 'aquarius' || s === 'pisces') {
        influences.add('Saturn'); // Winter is ruled by Saturn (Capricorn)
      }
    });
  }
  
  return Array.from(influences);
}

function deriveElementalProperties(recipe: Recipe): {Fire: number, Water: number, Earth: number, Air: number} {
  // Default balanced elemental properties
  const properties = {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
  };
  
  // Check cooking method
  if (recipe.cookingMethod) {
    const method = recipe.cookingMethod.toLowerCase();
    
    if (method.includes('roast') || method.includes('grill') || method.includes('bake')) {
      properties.Fire += 0.2;
      properties.Earth += 0.1;
      properties.Water -= 0.2;
      properties.Air -= 0.1;
    } else if (method.includes('steam') || method.includes('boil') || method.includes('poach')) {
      properties.Water += 0.2;
      properties.Fire -= 0.2;
    } else if (method.includes('fry') || method.includes('sauté')) {
      properties.Fire += 0.1;
      properties.Air += 0.2;
      properties.Water -= 0.1;
      properties.Earth -= 0.1;
    }
  }
  
  // Adjust based on cuisine type
  if (recipe.cuisine) {
    const cuisine = recipe.cuisine.toLowerCase();
    
    if (['mexican', 'thai', 'indian', 'cajun'].includes(cuisine)) {
      // Spicy cuisines - more Fire
      properties.Fire += 0.1;
    } else if (['japanese', 'cantonese'].includes(cuisine)) {
      // Delicate cuisines - more Water and Air
      properties.Water += 0.1;
      properties.Air += 0.05;
      properties.Fire -= 0.05;
    } else if (['french', 'italian'].includes(cuisine)) {
      // Balanced cuisines
      properties.Earth += 0.05;
      properties.Water += 0.05;
    } else if (['german', 'russian', 'english'].includes(cuisine)) {
      // Hearty cuisines - more Earth
      properties.Earth += 0.15;
      properties.Air -= 0.05;
    }
  }
  
  // Normalize values between 0 and 1
  const total = properties.Fire + properties.Water + properties.Earth + properties.Air;
  
  return {
    Fire: Math.max(0, Math.min(1, properties.Fire / (total || 1))),
    Water: Math.max(0, Math.min(1, properties.Water / (total || 1))),
    Earth: Math.max(0, Math.min(1, properties.Earth / (total || 1))),
    Air: Math.max(0, Math.min(1, properties.Air / (total || 1)))
  };
}

function enrichAndNormalizeSeasons(seasons?: string[]): string[] {
  if (!seasons || seasons.length === 0) {
    return ['all'];
  }
  
  const normalizedSeasons = new Set<string>();
  
  seasons.forEach(season => {
    const normalized = season.toLowerCase();
    
    // Add the base season
    normalizedSeasons.add(normalized);
    
    // Add zodiac correspondences
    if (normalized === 'spring') {
      normalizedSeasons.add('aries');
      normalizedSeasons.add('taurus');
      normalizedSeasons.add('gemini');
    } else if (normalized === 'summer') {
      normalizedSeasons.add('cancer');
      normalizedSeasons.add('leo');
      normalizedSeasons.add('virgo');
    } else if (normalized === 'autumn' || normalized === 'fall') {
      normalizedSeasons.add('libra');
      normalizedSeasons.add('scorpio');
      normalizedSeasons.add('sagittarius');
    } else if (normalized === 'winter') {
      normalizedSeasons.add('capricorn');
      normalizedSeasons.add('aquarius');
      normalizedSeasons.add('pisces');
    }
  });
  
  return Array.from(normalizedSeasons);
}

function deriveCelestialTiming(recipe: Recipe): {
  optimalMoonPhase?: string;
  optimalPlanetaryHour?: string;
  bestZodiacSeason?: string;
} {
  const timing: { optimalMoonPhase?: string; optimalPlanetaryHour?: string; bestZodiacSeason?: string } = {};
  
  // Derive optimal moon phase based on recipe properties
  if (recipe.elementalProperties) {
    // Dominant element suggests optimal moon phase
    const elements = Object.entries(recipe.elementalProperties).sort((a, b) => b[1] - a[1]);
    const dominantElement = elements[0][0];
    
    switch (dominantElement) {
      case 'Fire':
        timing.optimalMoonPhase = 'Full Moon';
        timing.optimalPlanetaryHour = 'Sun';
        break;
      case 'Water':
        timing.optimalMoonPhase = 'New Moon';
        timing.optimalPlanetaryHour = 'Moon';
        break;
      case 'Earth':
        timing.optimalMoonPhase = 'Waning Moon';
        timing.optimalPlanetaryHour = 'Saturn';
        break;
      case 'Air':
        timing.optimalMoonPhase = 'Waxing Moon';
        timing.optimalPlanetaryHour = 'Mercury';
        break;
    }
  }
  
  // Determine best zodiac season from astrologicalInfluences if available
  if (recipe.astrologicalInfluences && recipe.astrologicalInfluences.length > 0) {
    const zodiacSigns = [
      'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
      'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
    ];
    
    // Find mentions of zodiac signs in influences
    for (const influence of recipe.astrologicalInfluences) {
      const lowerInfluence = influence.toLowerCase();
      
      for (const sign of zodiacSigns) {
        if (lowerInfluence.includes(sign)) {
          timing.bestZodiacSeason = sign;
          break;
        }
      }
      
      if (timing.bestZodiacSeason) break;
    }
  }
  
  return timing;
} 