#!/usr/bin/env node

/**
 * Enhance Recipes with Astrological Timing
 *
 * Script to add astrological timing recommendations to existing recipes
 * in the hierarchical culinary data system.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const RECIPE_DIRECTORIES = [
  'src/data/cuisines',
  // Add other recipe directories as needed
];

const OUTPUT_DIR = 'src/data/enhanced_recipes';

// Planetary position templates for optimal recipe timing
const ASTROLOGICAL_TIMING_TEMPLATES = {
  // Fire-dominant recipes (grilling, spicy foods)
  fire_dominant: {
    optimalPositions: {
      Sun: 'Leo',      // Sun in Leo enhances fire energy
      Mars: 'Aries',   // Mars in Aries for action and heat
      Jupiter: 'Sagittarius' // Jupiter in Sagittarius for expansion
    },
    rationale: 'Fire-dominant recipes thrive when solar and martial energies are strong, amplifying heat and transformation.',
    alternativePositions: [
      {
        positions: { Sun: 'Aries', Mars: 'Leo', Jupiter: 'Leo' },
        suitability: 0.85,
        notes: 'Alternative fire timing with Aries Sun for initiation energy'
      }
    ]
  },

  // Water-dominant recipes (soups, stews, braising)
  water_dominant: {
    optimalPositions: {
      Moon: 'Cancer',  // Moon in Cancer enhances emotional, nurturing water
      Venus: 'Pisces', // Venus in Pisces for harmony and dissolution
      Neptune: 'Pisces' // Neptune in Pisces for intuition and fluidity
    },
    rationale: 'Water-dominant recipes benefit from lunar and venusian influences that enhance moisture and tenderness.',
    alternativePositions: [
      {
        positions: { Moon: 'Pisces', Venus: 'Cancer', Neptune: 'Cancer' },
        suitability: 0.82,
        notes: 'Piscean water timing emphasizes intuition and flow'
      }
    ]
  },

  // Earth-dominant recipes (baking, slow-cooking, root vegetables)
  earth_dominant: {
    optimalPositions: {
      Venus: 'Taurus', // Venus in Taurus for sensual, grounding earth
      Saturn: 'Capricorn', // Saturn in Capricorn for structure and stability
      Moon: 'Taurus'  // Moon in Taurus for nourishment and substance
    },
    rationale: 'Earth-dominant recipes excel with venusian and saturnine energies that provide stability and richness.',
    alternativePositions: [
      {
        positions: { Venus: 'Capricorn', Saturn: 'Taurus', Moon: 'Capricorn' },
        suitability: 0.88,
        notes: 'Capricorn earth timing for structured, traditional preparations'
      }
    ]
  },

  // Air-dominant recipes (light cooking, salads, fermentations)
  air_dominant: {
    optimalPositions: {
      Mercury: 'Gemini',   // Mercury in Gemini for communication and lightness
      Uranus: 'Aquarius',  // Uranus in Aquarius for innovation
      Venus: 'Libra'      // Venus in Libra for balance and harmony
    },
    rationale: 'Air-dominant recipes thrive with mercurial and uranian energies that promote lightness and creativity.',
    alternativePositions: [
      {
        positions: { Mercury: 'Aquarius', Uranus: 'Gemini', Venus: 'Aquarius' },
        suitability: 0.80,
        notes: 'Aquarian air timing for innovative, unconventional approaches'
      }
    ]
  },

  // Balanced recipes (general cooking, complex dishes)
  balanced: {
    optimalPositions: {
      Sun: 'Libra',       // Sun in Libra for balance and harmony
      Jupiter: 'Pisces',  // Jupiter in Pisces for expansion and intuition
      Venus: 'Libra'     // Venus in Libra for aesthetic and relational harmony
    },
    rationale: 'Balanced recipes benefit from harmonious planetary alignments that support complex flavor interactions.',
    alternativePositions: [
      {
        positions: { Sun: 'Pisces', Jupiter: 'Libra', Venus: 'Pisces' },
        suitability: 0.85,
        notes: 'Piscean balance timing emphasizes intuition and flow'
      }
    ]
  }
};

// Lunar phase recommendations
const LUNAR_PHASE_RECOMMENDATIONS = {
  new_moon: ['planting', 'beginning', 'fermentation', 'pickling'],
  waxing_crescent: ['growth', 'building', 'marinating', 'slow-cooking'],
  first_quarter: ['action', 'transformation', 'grilling', 'frying'],
  waxing_gibbous: ['refinement', 'seasoning', 'garnishing', 'presentation'],
  full_moon: ['culmination', 'celebration', 'rich', 'decadent'],
  waning_gibbous: ['sharing', 'preservation', 'canning', 'freezing'],
  last_quarter: ['release', 'simplification', 'clean', 'light'],
  waning_crescent: ['rest', 'preparation', 'planning', 'minimal']
};

// Seasonal recommendations
const SEASONAL_RECOMMENDATIONS = {
  spring: ['fresh', 'green', 'light', 'cleansing', 'vegetable-forward'],
  summer: ['grilled', 'cold', 'fresh', 'hydrating', 'fruit-based'],
  autumn: ['roasted', 'warm', 'comforting', 'preservation', 'root-based'],
  winter: ['slow-cooked', 'hearty', 'warming', 'comfort', 'protein-rich']
};

/**
 * Determine recipe category based on elemental properties and cooking methods
 */
function determineRecipeCategory(recipe) {
  const elementals = recipe.elementalProperties || {};
  const cookingMethods = recipe.cookingMethod || [];

  // Find dominant element
  const elements = ['Fire', 'Water', 'Earth', 'Air'];
  const dominantElement = elements.reduce((max, el) =>
    (elementals[el] || 0) > (elementals[max] || 0) ? el : max
  );

  // Check elemental balance
  const values = elements.map(el => elementals[el] || 0);
  const maxDiff = Math.max(...values) - Math.min(...values);

  if (maxDiff < 0.2) {
    return 'balanced';
  }

  return `${dominantElement.toLowerCase()}_dominant`;
}

/**
 * Generate astrological timing for a recipe
 */
function generateAstrologicalTiming(recipe) {
  const category = determineRecipeCategory(recipe);
  const template = ASTROLOGICAL_TIMING_TEMPLATES[category];

  if (!template) {
    console.warn(`No timing template for category: ${category}`);
    return null;
  }

  // Add lunar phase recommendations based on recipe type
  const optimalLunarPhases = [];
  const cookingMethods = recipe.cookingMethod || [];

  for (const [phase, keywords] of Object.entries(LUNAR_PHASE_RECOMMENDATIONS)) {
    if (keywords.some(keyword =>
      cookingMethods.some(method => method.toLowerCase().includes(keyword)) ||
      recipe.name.toLowerCase().includes(keyword)
    )) {
      optimalLunarPhases.push(phase.replace('_', ' '));
    }
  }

  // Add seasonal recommendations
  const optimalSeasons = [];
  const season = recipe.season || [];

  for (const [seasonName, keywords] of Object.entries(SEASONAL_RECOMMENDATIONS)) {
    if (keywords.some(keyword =>
      recipe.name.toLowerCase().includes(keyword) ||
      recipe.description?.toLowerCase().includes(keyword) ||
      season.some(s => s.toLowerCase().includes(seasonName))
    )) {
      optimalSeasons.push(seasonName);
    }
  }

  return {
    ...template,
    optimalLunarPhases: optimalLunarPhases.length > 0 ? optimalLunarPhases : undefined,
    optimalSeasons: optimalSeasons.length > 0 ? optimalSeasons : undefined
  };
}

/**
 * Enhance a single recipe with astrological timing
 */
function enhanceRecipe(recipe) {
  const enhanced = { ...recipe };

  // Add astrological timing
  const astrologicalTiming = generateAstrologicalTiming(recipe);
  if (astrologicalTiming) {
    enhanced.astrologicalTiming = astrologicalTiming;
  }

  // Add cooking method sequence
  enhanced.cookingMethodSequence = recipe.cookingMethod || [];

  // Add recipe metadata
  enhanced.cuisineCategory = recipe.cuisine || 'general';
  enhanced.mealType = determineMealType(recipe);
  enhanced.difficulty = determineDifficulty(recipe);
  enhanced.preparationTime = estimatePreparationTime(recipe);
  enhanced.cookingTime = estimateCookingTime(recipe);

  // Add ingredient IDs
  enhanced.ingredientIds = (recipe.ingredients || []).map(ing =>
    generateIngredientId(ing.name || '')
  );

  return enhanced;
}

/**
 * Determine meal type from recipe data
 */
function determineMealType(recipe) {
  const mealType = recipe.mealType || recipe.course || [];

  if (Array.isArray(mealType) && mealType.length > 0) {
    const primaryType = mealType[0].toLowerCase();
    if (['breakfast', 'lunch', 'dinner', 'snack', 'dessert'].includes(primaryType)) {
      return primaryType;
    }
  }

  // Infer from time of day or course
  const course = recipe.course || [];
  if (course.some(c => c.toLowerCase().includes('appetizer') || c.toLowerCase().includes('starter'))) {
    return 'snack';
  }
  if (course.some(c => c.toLowerCase().includes('dessert'))) {
    return 'dessert';
  }
  if (course.some(c => c.toLowerCase().includes('main'))) {
    return 'dinner';
  }

  return 'dinner'; // Default
}

/**
 * Determine recipe difficulty
 */
function determineDifficulty(recipe) {
  const skills = recipe.skillsRequired || [];
  const time = recipe.prepTime || recipe.totalTime || '30 minutes';

  // Parse time
  const timeMatch = time.match(/(\d+)/);
  const timeMinutes = timeMatch ? parseInt(timeMatch[1]) : 30;

  // Complex cooking methods indicate higher difficulty
  const complexMethods = ['sous-vide', 'molecular', 'advanced'];
  const hasComplexMethods = skills.some(skill =>
    complexMethods.some(method => skill.toLowerCase().includes(method))
  );

  if (hasComplexMethods || skills.length > 3 || timeMinutes > 120) {
    return 'hard';
  } else if (skills.length > 1 || timeMinutes > 60) {
    return 'medium';
  } else {
    return 'easy';
  }
}

/**
 * Estimate preparation time
 */
function estimatePreparationTime(recipe) {
  const time = recipe.prepTime || recipe.totalTime || '30 minutes';
  const timeMatch = time.match(/(\d+)/);
  return timeMatch ? parseInt(timeMatch[1]) : 30;
}

/**
 * Estimate cooking time
 */
function estimateCookingTime(recipe) {
  const time = recipe.cookTime || '0 minutes';
  const timeMatch = time.match(/(\d+)/);
  return timeMatch ? parseInt(timeMatch[1]) : 0;
}

/**
 * Generate ingredient ID from name
 */
function generateIngredientId(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

/**
 * Load recipes from a directory
 */
function loadRecipesFromDirectory(dirPath) {
  const recipes = [];

  if (!fs.existsSync(dirPath)) {
    console.warn(`Directory not found: ${dirPath}`);
    return recipes;
  }

  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);

    if (!file.endsWith('.ts') && !file.endsWith('.js')) continue;

    try {
      // Note: This is a simplified approach. In a real implementation,
      // you'd need proper TypeScript compilation or AST parsing
      const content = fs.readFileSync(filePath, 'utf8');

      // Extract recipe objects (simplified regex approach)
      const recipeMatches = content.match(/export const \w+ = ({[\s\S]*?});/g);

      if (recipeMatches) {
        for (const match of recipeMatches) {
          try {
            // This is a very simplified approach - real implementation would need proper parsing
            const recipeName = match.match(/export const (\w+) =/)?.[1];
            if (recipeName) {
              console.log(`Found recipe: ${recipeName} in ${file}`);
              // In a real implementation, you'd parse the actual recipe object
            }
          } catch (e) {
            console.warn(`Failed to parse recipe in ${file}: ${e.message}`);
          }
        }
      }
    } catch (e) {
      console.warn(`Failed to read file ${file}: ${e.message}`);
    }
  }

  return recipes;
}

/**
 * Save enhanced recipes to output directory
 */
function saveEnhancedRecipes(recipes, outputDir) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const output = {
    enhancedRecipes: recipes,
    metadata: {
      totalRecipes: recipes.length,
      enhancementDate: new Date().toISOString(),
      version: '1.0'
    }
  };

  const outputPath = path.join(outputDir, 'enhanced_recipes.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log(`Saved ${recipes.length} enhanced recipes to ${outputPath}`);
}

/**
 * Main enhancement function
 */
function enhanceAllRecipes() {
  console.log('Starting recipe enhancement with astrological timing...');

  let allRecipes = [];

  // Load recipes from all directories
  for (const dir of RECIPE_DIRECTORIES) {
    console.log(`Loading recipes from ${dir}...`);
    const recipes = loadRecipesFromDirectory(dir);
    allRecipes = allRecipes.concat(recipes);
  }

  console.log(`Loaded ${allRecipes.length} recipes total`);

  // For demonstration, create some sample enhanced recipes
  // In a real implementation, this would process actual recipe data
  const sampleRecipes = [
    {
      id: 'sample_grilled_salmon',
      name: 'Grilled Salmon with Herbs',
      description: 'Fresh salmon fillet grilled to perfection',
      ingredients: [
        { name: 'salmon fillet', amount: 6, unit: 'oz' },
        { name: 'olive oil', amount: 2, unit: 'tbsp' },
        { name: 'lemon', amount: 1, unit: 'whole' },
        { name: 'fresh herbs', amount: 0.25, unit: 'cup' }
      ],
      instructions: [
        'Preheat grill to medium-high heat',
        'Brush salmon with olive oil',
        'Season with salt and pepper',
        'Grill for 4-5 minutes per side',
        'Serve with lemon wedges and herbs'
      ],
      elementalProperties: { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 },
      cookingMethod: ['grilling', 'seasoning']
    },
    {
      id: 'sample_beef_stew',
      name: 'Hearty Beef Stew',
      description: 'Slow-cooked beef stew with root vegetables',
      ingredients: [
        { name: 'beef chuck', amount: 2, unit: 'lb' },
        { name: 'carrots', amount: 4, unit: 'whole' },
        { name: 'potatoes', amount: 4, unit: 'whole' },
        { name: 'onions', amount: 2, unit: 'whole' },
        { name: 'beef broth', amount: 4, unit: 'cup' }
      ],
      instructions: [
        'Brown beef in a large pot',
        'Add vegetables and broth',
        'Simmer for 2-3 hours',
        'Season to taste',
        'Serve hot'
      ],
      elementalProperties: { Fire: 0.2, Water: 0.4, Earth: 0.3, Air: 0.1 },
      cookingMethod: ['braising', 'simmering']
    }
  ];

  // Enhance recipes
  const enhancedRecipes = sampleRecipes.map(recipe => {
    console.log(`Enhancing recipe: ${recipe.name}`);
    return enhanceRecipe(recipe);
  });

  // Save enhanced recipes
  saveEnhancedRecipes(enhancedRecipes, OUTPUT_DIR);

  console.log('Recipe enhancement complete!');
  console.log(`Enhanced ${enhancedRecipes.length} recipes with astrological timing`);
}

// Run the enhancement
if (require.main === module) {
  enhanceAllRecipes();
}

module.exports = {
  enhanceRecipe,
  generateAstrologicalTiming,
  determineRecipeCategory
};
