import { NextResponse } from 'next/server';
import type { Recipe } from '../../../types/recipe';

// Basic elemental properties type for simplification
interface ElementalProperties {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
}

// Basic fallback recipe that will work without dependencies
const fallbackRecipe: Recipe = {
  id: 'universal-balance',
  name: "Universal Balance Bowl",
  description: "A harmonious blend for any occasion",
  ingredients: [
    { name: 'mixed greens', amount: 2, unit: 'cups', category: 'produce' },
    { name: 'quinoa', amount: 1, unit: 'cup', category: 'grains' },
    { name: 'avocado', amount: 1, unit: 'whole', category: 'produce' },
    { name: 'chickpeas', amount: 1, unit: 'cup', category: 'legumes' },
    { name: 'olive oil', amount: 2, unit: 'tablespoons', category: 'oils' },
    { name: 'lemon juice', amount: 1, unit: 'tablespoon', category: 'produce' },
    { name: 'salt', amount: 1, unit: 'teaspoon', category: 'spices' },
    { name: 'pepper', amount: 1, unit: 'teaspoon', category: 'spices' }
  ],
  instructions: [
    "Cook quinoa according to package instructions and let cool",
    "Rinse and drain chickpeas",
    "Wash and dry mixed greens",
    "Slice avocado",
    "Combine all ingredients in a bowl",
    "Whisk together olive oil, lemon juice, salt, and pepper",
    "Drizzle dressing over the bowl and serve"
  ],
  timeToMake: "20 minutes",
  numberOfServings: 2,
  servingSize: 2,
  nutritionalInfo: {
    calories: 450,
    protein: 15,
    carbs: 40,
    fat: 25,
    fiber: 12,
    sugar: 3
  },
  cuisine: 'international',
  tags: ['balanced', 'vegetarian', 'quick', 'healthy'],
  dietaryAttributes: ['vegetarian', 'dairy-free'],
  astrologicalInfluences: ['balance', 'harmony', 'universality'],
  elementalProperties: {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
  }
};

// Basic celestial influence data
const basicCelestialInfluence = {
  date: new Date().toISOString(),
  zodiacSign: 'libra',
  dominantPlanets: [{ name: 'sun', influence: 0.5 }, { name: 'Moon', influence: 0.5 }],
  lunarPhase: 'full',
  elementalBalance: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
  aspectInfluences: [],
  astrologicalInfluences: ['sun', 'Moon', 'libra', 'all']
};

// Simplified GET endpoint that returns basic recipe data
export async function GET() {
  try {
    // For now, just return the fallback recipe
    const recipes = [fallbackRecipe];
    
    return NextResponse.json({
      recipes,
      meta: {
        total: recipes.length,
        celestialInfluence: basicCelestialInfluence,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    console.error('Recipe API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 400 }
    );
  }
}

// Simplified POST endpoint for adding recipes
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Basic validation
    if (!body || typeof body !== 'object' || !body.name || !Array.isArray(body.ingredients)) {
      return NextResponse.json(
        { error: 'Invalid recipe data' },
        { status: 400 }
      );
    }

    // Create a simple recipe object from the submitted data
    const newRecipe = {
      id: `${body.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      name: body.name,
      description: body.description || '',
      ingredients: body.ingredients || [],
      instructions: body.instructions || [],
      timeToMake: body.timeToMake || '30 minutes',
      numberOfServings: body.numberOfServings || 2,
      elementalProperties: body.elementalProperties || {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25
      },
      cuisine: body.cuisine || 'international',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      recipe: newRecipe,
      message: 'Recipe added successfully'
    });

  } catch (error) {
    console.error('Recipe submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process recipe' },
      { status: 500 }
    );
  }
} 