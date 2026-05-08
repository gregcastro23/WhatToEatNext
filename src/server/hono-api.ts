import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import Redis from 'ioredis';
import { 
  formatRailwayResponse, 
  calculateLocally 
} from './lib/astrology-utils.js';
import { 
  parseRailwayResponse, 
  PlanetaryRequestSchema 
} from '../lib/validation/railway.js';
import { LocalRecipeService } from '../services/LocalRecipeService.js';
import { RecipeSchema } from '../lib/validation/apiSchemas.js';
import { _recipeRecommender } from '../services/recipeRecommendations.js';
import { sauceRecommender } from '../services/sauceRecommender.js';
import { IngredientService } from '../services/IngredientService.js';
import { UnifiedRecipeService } from '../services/UnifiedRecipeService.js';
import {
  getRecipeCountForIngredient,
  getRecipesByCuisineForIngredient,
  getRecipesForIngredient,
  resolveIngredientSlug,
} from '../data/ingredientRecipeIndex.js';
import { userDatabase } from '../services/userDatabaseService.js';

const app = new Hono();

// Redis setup for caching - optional for local development
const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;
if (!redis) console.warn('[Hono] REDIS_URL not set. Caching is DISABLED.');

app.use('*', logger());
app.use('*', cors());

const RAILWAY_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET;
const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || RAILWAY_URL || 'http://localhost:8000';

app.get('/health', (c) => c.json({ status: 'ok', service: 'hono-gateway', redis: !!redis, timestamp: new Date().toISOString() }));

/** Safely extract cooking methods from a recipe regardless of singular/plural key. */
function getCookingMethods(recipe: Record<string, unknown>): string[] {
  const raw = recipe.cookingMethods ?? recipe.cookingMethod;
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr
    .map((m) =>
      typeof m === "string"
        ? m
        : typeof m === "object" && m !== null && "name" in m
          ? String((m as { name: unknown }).name)
          : "",
    )
    .filter(Boolean);
}

function extractTime(recipe: any, kind: "prep" | "cook"): number | undefined {
  const details = recipe.details;
  if (details) {
    const v = kind === "prep" ? details.prepTimeMinutes : details.cookTimeMinutes;
    if (typeof v === "number") return v;
  }
  const raw = kind === "prep" ? recipe.prepTime : recipe.cookTime;
  if (typeof raw === "string") {
    const m = raw.match(/(\d+)/);
    if (m) return parseInt(m[1], 10);
  }
  return undefined;
}

function buildSubstitutions(
  ingredient: any | undefined,
): Array<{ name: string; rationale: string; type: "complementary" | "direct" }> {
  if (!ingredient) return [];
  const subs: Array<{ name: string; rationale: string; type: "complementary" | "direct" }> = [];

  const pairing = ingredient.pairingRecommendations;

  if (pairing?.complementary) {
    for (const alt of pairing.complementary.slice(0, 5)) {
      subs.push({
        name: alt,
        rationale: `Shares flavor affinity with ${ingredient.name} — works well in similar contexts.`,
        type: "complementary",
      });
    }
  }

  return subs;
}

/**
 * API: User Profile
 */
app.get('/api/user/profile', async (c) => {
  try {
    const userId = c.req.header('x-user-id');
    const internalSecret = c.req.header('x-internal-secret');

    // Basic internal authentication check
    if (INTERNAL_SECRET && internalSecret !== INTERNAL_SECRET) {
      return c.json({ success: false, message: 'Unauthorized internal request' }, 401);
    }

    if (!userId) {
      return c.json({ success: false, message: 'User ID required' }, 400);
    }

    const user = await userDatabase.getUserById(userId);
    if (!user) {
      return c.json({ success: false, message: 'User not found' }, 404);
    }

    // We skip the lazy migration logic here to keep the API gateway clean,
    // but the core profile fetching is intact.
    return c.json({ success: true, profile: user.profile });
  } catch (error) {
    console.error('[Hono] Get Profile Error:', error);
    return c.json({ success: false, message: 'Failed to get profile' }, 500);
  }
});

app.put('/api/user/profile', async (c) => {
  try {
    const userId = c.req.header('x-user-id');
    const internalSecret = c.req.header('x-internal-secret');

    if (INTERNAL_SECRET && internalSecret !== INTERNAL_SECRET) {
      return c.json({ success: false, message: 'Unauthorized internal request' }, 401);
    }

    if (!userId) {
      return c.json({ success: false, message: 'User ID required' }, 400);
    }

    const user = await userDatabase.getUserById(userId);
    if (!user) {
      return c.json({ success: false, message: 'User not found' }, 404);
    }

    const body = await c.req.json();
    const { userId: _bodyUserId, ...profileData } = body;

    const updatedUser = await userDatabase.updateUserProfile(
      userId,
      profileData,
      user.email
    );

    if (!updatedUser) {
      return c.json({ success: false, message: 'User not found during update' }, 404);
    }

    return c.json({ success: true, profile: updatedUser.profile });
  } catch (error) {
    console.error('[Hono] Update Profile Error:', error);
    return c.json({ success: false, message: 'Failed to update profile' }, 500);
  }
});

/**
 * API: Single Ingredient Details
 */
app.get('/api/ingredients/:name', async (c) => {
  try {
    const nameParam = c.req.param('name');
    const ingredientName = decodeURIComponent(nameParam || "").trim();
    if (!ingredientName) {
      return c.json({ success: false, error: "Ingredient name is required" }, 400);
    }

    const ingredientService = IngredientService.getInstance();
    const ingredient = ingredientService.getIngredientByName(ingredientName);

    // Resolve canonical slug for the recipe index
    const canonicalName = ingredient?.name || ingredientName;
    const slug = resolveIngredientSlug(canonicalName) ?? resolveIngredientSlug(ingredientName) ?? canonicalName;

    // Get from pre-computed recipe index
    const matches = getRecipesForIngredient(slug);
    const totalRecipeMatches = getRecipeCountForIngredient(slug);
    const recipesByCuisine = getRecipesByCuisineForIngredient(slug);

    // Enhance the top 24 recipes with detailed timing info for the UI
    const recipeService = UnifiedRecipeService.getInstance();
    const allRecipes = await recipeService.getAllRecipes();
    const recipeMap = new Map(allRecipes.map((r) => [r.id, r]));

    const relatedRecipes = [];
    for (const match of matches) {
      const recipe = recipeMap.get(match.recipeId);
      if (recipe) {
        relatedRecipes.push({
          id: recipe.id,
          name: recipe.name,
          cuisine: recipe.cuisine,
          description: recipe.description,
          prepTime: extractTime(recipe, "prep"),
          cookTime: extractTime(recipe, "cook"),
          servings:
            (recipe as any).baseServingSize ||
            recipe.servingSize ||
            recipe.numberOfServings,
          amount: typeof match.amount === "number" ? match.amount : undefined,
          unit: match.unit,
        });
      } else {
        // Fallback if not loaded in memory
        relatedRecipes.push({
          id: match.recipeId,
          name: match.recipeName,
          cuisine: match.cuisine,
          amount: typeof match.amount === "number" ? match.amount : undefined,
          unit: match.unit,
        });
      }
      if (relatedRecipes.length >= 24) break;
    }

    const substitutions = buildSubstitutions(ingredient);

    return c.json({
      success: true,
      ingredient: ingredient ?? null,
      relatedRecipes,
      recipesByCuisine,
      substitutions,
      totalRecipeMatches,
    });
  } catch (error) {
    console.error("[Hono] Ingredient Error:", error);
    return c.json({ success: false, error: "Failed to fetch ingredient details" }, 500);
  }
});

/**
 * API: Single Recipe Details
 */
app.get('/api/recipes/:recipeId', async (c) => {
  try {
    const recipeId = c.req.param('recipeId');
    const rawRecipe = await LocalRecipeService.getRecipeById(recipeId);

    if (!rawRecipe) {
      return c.json({ success: false, error: "Recipe not found" }, 404);
    }

    const parsed = RecipeSchema.safeParse(rawRecipe);
    if (!parsed.success) {
      console.warn(`[Hono] Recipe ${recipeId} has unexpected shape:`, parsed.error.flatten());
    }
    const recipe = parsed.success ? parsed.data : rawRecipe;

    // Ingredient classification
    const proteins = recipe.ingredients
      .filter((i: any) => i.category === "protein")
      .map((i: any) => i.name);
    const vegetables = recipe.ingredients
      .filter((i: any) => i.category === "vegetable")
      .map((i: any) => i.name);

    const cookingMethods = getCookingMethods(recipe as Record<string, unknown>);

    const recommendedSauces = await sauceRecommender.recommendSauce(recipe.cuisine ?? "", {
      protein: proteins[0],
      vegetable: vegetables[0],
      cookingMethod: cookingMethods[0],
    });

    const allRecipes = await LocalRecipeService.getAllRecipes();
    const recommendedRecipes = await _recipeRecommender.recommendSimilarRecipes(
      rawRecipe as any,
      allRecipes,
    );

    return c.json({ success: true, recipe, recommendedSauces, recommendedRecipes });
  } catch (error) {
    console.error("[Hono] Single Recipe Error:", error);
    return c.json({ success: false, error: "Failed to fetch recipe details" }, 500);
  }
});

/**
 * API: Recipes Catalog
 * Replaces Next.js /api/recipes route.
 */
app.get('/api/recipes', async (c) => {
  const element = c.req.query('element');
  const cuisine = c.req.query('cuisine');
  const search = c.req.query('q') || c.req.query('search');
  const limit = Math.min(parseInt(c.req.query('limit') || '20', 10), 50);
  const offset = parseInt(c.req.query('offset') || '0', 10);

  try {
    let recipes = [];
    if (cuisine) {
      recipes = await LocalRecipeService.getRecipesByCuisine(cuisine);
    } else if (search) {
      recipes = await LocalRecipeService.searchRecipes(search);
    } else {
      recipes = await LocalRecipeService.getAllRecipes();
    }

    if (element) {
      const lowerElement = element.toLowerCase();
      recipes = recipes.filter((recipe) => {
        const ep = recipe.elementalProperties;
        if (!ep) return false;
        let dom = '';
        let max = -1;
        for (const k of ['Fire', 'Water', 'Earth', 'Air'] as const) {
          if (typeof ep[k] === 'number' && ep[k] > max) {
            max = ep[k];
            dom = k.toLowerCase();
          }
        }
        return dom.includes(lowerElement);
      });
    }

    const total = recipes.length;
    const slicedRecipes = recipes.slice(offset, offset + limit);

    return c.json({
      success: true,
      recipes: slicedRecipes,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('[Hono] Recipe fetch error:', error);
    return c.json({ success: false, error: 'Failed to fetch recipes' }, 500);
  }
});

app.post('/api/recipes', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { element, cuisine, search, limit = 20, offset = 0 } = body;
    
    let recipes = [];
    if (cuisine) {
      recipes = await LocalRecipeService.getRecipesByCuisine(cuisine);
    } else if (search) {
      recipes = await LocalRecipeService.searchRecipes(search);
    } else {
      recipes = await LocalRecipeService.getAllRecipes();
    }

    if (element) {
      const lowerElement = element.toLowerCase();
      recipes = recipes.filter((recipe) => {
        const ep = recipe.elementalProperties;
        if (!ep) return false;
        let dom = '';
        let max = -1;
        for (const k of ['Fire', 'Water', 'Earth', 'Air'] as const) {
          if (typeof ep[k] === 'number' && ep[k] > max) {
            max = ep[k];
            dom = k.toLowerCase();
          }
        }
        return dom.includes(lowerElement);
      });
    }

    const total = recipes.length;
    const slicedRecipes = recipes.slice(offset, offset + limit);

    return c.json({
      success: true,
      recipes: slicedRecipes,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('[Hono] Recipe POST error:', error);
    return c.json({ success: false, error: 'Invalid request' }, 400);
  }
});

/**
 * API: Astrologize (Hybrid with Redis Caching)
 * Migrated from Next.js API route to Hono for performance and unified stack.
 */
app.post('/api/astrologize', zValidator('json', PlanetaryRequestSchema), async (c) => {
  const params = c.req.valid('json');
  
  // Create a stable cache key including all relevant parameters
  const cacheKey = `astrology:pos:${params.year}:${params.month}:${params.date || params.day}:${params.hour}:${params.minute}:${params.latitude?.toFixed(2)}:${params.longitude?.toFixed(2)}:${params.zodiacSystem}`;
  
  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log(`[Hono] Cache hit for ${cacheKey}`);
        const result = JSON.parse(cached);
        result.cache = 'hit';
        return c.json(result);
      }
    } catch (err) {
      console.error('[Hono] Redis error:', err);
    }
  }

  let result;
  
  // 1. Try Python backend for high-precision pyswisseph
  try {
    console.log(`[Hono] Calling Python backend at ${PYTHON_BACKEND_URL}/internal/astrology/positions`);
    const response = await fetch(`${PYTHON_BACKEND_URL}/internal/astrology/positions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(INTERNAL_SECRET ? { "X-Internal-Secret": INTERNAL_SECRET } : {}),
      },
      body: JSON.stringify({
        year: params.year,
        month: params.month,
        day: params.date ?? params.day,
        hour: params.hour,
        minute: params.minute,
        latitude: params.latitude,
        longitude: params.longitude,
        zodiacSystem: params.zodiacSystem
      }),
      signal: AbortSignal.timeout(10000),
    });
    
    if (response.ok) {
      const raw = await response.json();
      const railwayData = parseRailwayResponse(raw);
      if (railwayData) {
        result = formatRailwayResponse(railwayData, params);
        result.source = 'hono-python-swisseph';
      }
    } else {
      console.warn(`[Hono] Python backend returned ${response.status}`);
    }
  } catch (err) {
    console.error('[Hono] Python backend failed, falling back to local:', err instanceof Error ? err.message : 'Unknown error');
  }

  // 2. Fallback to local astronomy-engine if Python fails
  if (!result) {
    console.log('[Hono] Using local astronomy-engine fallback');
    result = calculateLocally(params);
    result.source = 'hono-local-astronomy-engine';
  }

  // 3. Cache the result for 1 hour (3600s)
  if (redis && result) {
    try {
      await redis.set(cacheKey, JSON.stringify(result), 'EX', 3600);
    } catch (err) {
      console.error('[Hono] Failed to set cache:', err);
    }
  }

  return c.json(result);
});

/**
 * API: Outer Planet Epoch Echoes
 * specialized endpoint for finding historical dates of similar planetary positions.
 */
const epochSchema = z.object({
  planet: z.enum(['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']),
  target_longitude: z.number(),
  max_lookback_years: z.number().optional().default(200),
});

app.post('/api/astrology/outer-epochs', zValidator('json', epochSchema), async (c) => {
  const body = c.req.valid('json');
  const cacheKey = `astrology:epochs:${body.planet}:${body.target_longitude.toFixed(4)}`;
  
  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const result = JSON.parse(cached);
        result.cache = 'hit';
        return c.json(result);
      }
    } catch (err) {
      console.error('[Hono] Redis error:', err);
    }
  }

  try {
    console.log(`[Hono] Fetching outer-epochs for ${body.planet} at ${body.target_longitude}°`);
    const response = await fetch(`${PYTHON_BACKEND_URL}/internal/astrology/outer-epochs`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(INTERNAL_SECRET ? { "X-Internal-Secret": INTERNAL_SECRET } : {}),
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });
    
    if (!response.ok) throw new Error(`Python microservice returned ${response.status}`);
    
    const data = await response.json();
    
    // Cache outer planet epochs for 30 days as they are extremely stable
    if (redis) {
      try {
        await redis.set(cacheKey, JSON.stringify(data), 'EX', 86400 * 30);
      } catch (err) {
         console.error('[Hono] Failed to set cache:', err);
      }
    }
    
    return c.json(data);
  } catch (err) {
    console.error('[Hono] Epoch calculation failed:', err);
    return c.json({ 
      error: 'Failed to calculate epoch echoes', 
      details: err instanceof Error ? err.message : 'Unknown error' 
    }, 500);
  }
});

const port = Number(process.env.PORT) || 3001;
console.log(`🚀 Alchm.kitchen Hono API Gateway running on port ${port}`);

serve({
  fetch: app.fetch,
  port
});
