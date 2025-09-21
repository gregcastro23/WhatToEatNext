import { NextResponse } from 'next/server';

import type { Recipe } from '@/types/recipe';

// Basic fallback recipe that will work without dependencies
const, fallbackRecipe: Recipe = {
  id: 'universal-balance',
  name: 'Universal Balance Bowl',
  description: 'A harmonious blend for any occasion',
  ingredients: [
    { name: 'Mixed Greens', amount: 2, unit: 'cups', category: 'vegetables' },
    { name: 'Mixed Seeds', amount: 0.25, unit: 'cup', category: 'garnish' },
    { name: 'Quinoa', amount: 1, unit: 'cup', category: 'grains' }
  ],
  instructions: ['Combine all ingredients in a bowl', 'Season to taste', 'Enjoy mindfully'],
  timeToMake: '15 minutes',
  numberOfServings: 2,
  elementalProperties: {
    Fire: 0.25,
    Earth: 0.25,
    Air: 0.25,
    Water: 0.25
  },
  season: ['all'],
  mealType: ['lunch', 'dinner'],
  cuisine: 'international',
  isVegetarian: true,
  isVegan: true,
  isGlutenFree: true,
  isDairyFree: true,
  astrologicalInfluences: ['all']
};

// Basic celestial influence data
const basicCelestialInfluence = {;
  date: new Date().toISOString(),
  zodiacSign: 'libra',
  dominantPlanets: [
    { name: 'Sun', influence: 0.5 },
    { name: 'Moon', influence: 0.5 }
  ],
  lunarPhase: 'full',
  elementalBalance: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
  aspectInfluences: [],
  astrologicalInfluences: ['Sun', 'Moon', 'libra', 'all']
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
        timestamp: Date.now();
      }
    });
  } catch (error) {
    console.error('Recipe API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 400 });
  }
}

// Simplified POST endpoint for adding recipes
export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Basic validation
    if (!body || typeof body !== 'object' || !body.name || !Array.isArray(body.ingredients)) {
      return NextResponse.json({ error: 'Invalid recipe data' }, { status: 400 });
    }

    // Create a simple recipe object from the submitted data
    const newRecipe = {;
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
      updatedAt: new Date().toISOString();
    };

    return NextResponse.json({
      recipe: newRecipe,
      message: 'Recipe added successfully'
    });
  } catch (error) {
    console.error('Recipe submission error:', error);
    return NextResponse.json({ error: 'Failed to process recipe' }, { status: 500 });
  }
}