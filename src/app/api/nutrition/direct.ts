import { NextResponse } from 'next/server';


// Phase 10: Calculation Type Interfaces
interface CalculationData {
  value: number;
  weight?: number;
  score?: number;
}

interface ScoredItem {
  score: number;
  [key: string]: unknown;
}

interface ElementalData {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
  [key: string]: unknown;
}

interface CuisineData {
  id: string;
  name: string;
  zodiacInfluences?: string[];
  planetaryDignities?: Record<string, unknown>;
  elementalState?: ElementalData;
  elementalProperties?: ElementalData;
  modality?: string;
  gregsEnergy?: number;
  [key: string]: unknown;
}

interface NutrientData {
  nutrient?: { name?: string };
  nutrientName?: string;
  name?: string;
  vitaminCount?: number;
  data?: unknown;
  [key: string]: unknown;
}

interface MatchingResult {
  score: number;
  elements: ElementalData;
  recipe?: unknown;
  [key: string]: unknown;
}


// USDA FoodData Central API endpoint and key
const USDA_API_BASE = 'https://api.nal.usda.gov/fdc/v1';
const USDA_API_KEY = 'mymNfzEYKEYQoDNDf7hR9O0OdrF3spSeIQBcdMBl';

// Account information for reference
// Email: gregcastro23@gmail.com
// Account ID: bbfc68fd-3519-4136-99fe-59578183fc14

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const foodId = searchParams.get('id');
  
  if (!query && !foodId) {
    return NextResponse.json(
      { error: 'Query or ID parameter is required' },
      { status: 400 }
    );
  }
  
  try {
    // Step 1: If we don't have a food ID, search for it first
    let targetFoodId = foodId;
    
    if (!targetFoodId && query) {
      console.log(`Searching for: ${query}`);
      const searchResponse = await fetch(
        `${USDA_API_BASE}/foods/search?query=${encodeURIComponent(query)}&pageSize=10&dataType=SR%20Legacy,Foundation,Survey%20(FNDDS)&sortBy=dataType.keyword&sortOrder=asc&api_key=${USDA_API_KEY}`,
        { cache: 'no-store' }
      );
      
      if (!searchResponse.ok) {
        throw new Error(`USDA API search error: ${searchResponse.status} ${searchResponse.statusText}`);
      }
      
      const searchData = await searchResponse.json();
      
      if (!searchData.foods || !searchData.foods.length) {
        return NextResponse.json({ error: 'No foods found for the given query' });
      }
      
      // Try to find the best match, preferring SR Legacy or Foundation foods
      let bestMatch = searchData.foods[0];
      for (const food of searchData.foods) {
        if (food.dataType === 'SR Legacy' || food.dataType === 'Foundation') {
          bestMatch = food;
          break;
        }
      }
      
      targetFoodId = bestMatch.fdcId;
      console.log(`Found food: ${bestMatch.description} (${targetFoodId}) [${bestMatch.dataType}]`);
    }
    
    // Step 2: Fetch detailed nutritional data using all available endpoints
    const results: Record<string, unknown> = {};
    
    // Endpoint 1: Regular food endpoint
    try {
      const foodResponse = await fetch(
        `${USDA_API_BASE}/food/${targetFoodId}?api_key=${USDA_API_KEY}`,
        { cache: 'no-store' }
      );
      
      if (foodResponse.ok) {
        const foodData = await foodResponse.json();
        results.foodEndpoint = {
          data: foodData,
          vitaminCount: countVitamins(foodData.foodNutrients || [])
        };
      }
    } catch (error) {
      results.foodEndpoint = { error: 'Failed to fetch from food endpoint' };
    }
    
    // Endpoint 2: Food endpoint with full format
    try {
      const fullResponse = await fetch(
        `${USDA_API_BASE}/food/${targetFoodId}?format=full&api_key=${USDA_API_KEY}`,
        { cache: 'no-store' }
      );
      
      if (fullResponse.ok) {
        const fullData = await fullResponse.json();
        results.fullFormatEndpoint = {
          data: fullData,
          vitaminCount: countVitamins(fullData.foodNutrients || [])
        };
      }
    } catch (error) {
      results.fullFormatEndpoint = { error: 'Failed to fetch from full format endpoint' };
    }
    
    // Endpoint 3: Foods list endpoint with format=abridged
    try {
      const abridgedResponse = await fetch(
        `${USDA_API_BASE}/foods/list?fdcIds=${targetFoodId}&format=abridged&api_key=${USDA_API_KEY}`,
        { cache: 'no-store' }
      );
      
      if (abridgedResponse.ok) {
        const abridgedData = await abridgedResponse.json();
        results.abridgedListEndpoint = {
          data: abridgedData,
          vitaminCount: abridgedData[0] ? countVitamins(abridgedData[0].foodNutrients || []) : 0
        };
      }
    } catch (error) {
      results.abridgedListEndpoint = { error: 'Failed to fetch from abridged list endpoint' };
    }
    
    // Endpoint 4: Foods list endpoint with format=full
    try {
      const fullListResponse = await fetch(
        `${USDA_API_BASE}/foods/list?fdcIds=${targetFoodId}&format=full&api_key=${USDA_API_KEY}`,
        { cache: 'no-store' }
      );
      
      if (fullListResponse.ok) {
        const fullListData = await fullListResponse.json();
        results.fullListEndpoint = {
          data: fullListData,
          vitaminCount: fullListData[0] ? countVitamins(fullListData[0].foodNutrients || []) : 0
        };
      }
    } catch (error) {
      results.fullListEndpoint = { error: 'Failed to fetch from full list endpoint' };
    }
    
    // Return the results
    return NextResponse.json({
      foodId: targetFoodId,
      endpointResults: results,
      summary: {
        bestEndpoint: getBestEndpoint(results),
        totalVitaminsFound: getTotalVitaminsFound(results)
      }
    });
    
  } catch (error) {
    console.error('Error fetching from USDA API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from USDA API' },
      { status: 500 }
    );
  }
}

// Count the number of vitamin entries in a foodNutrients array
function countVitamins(nutrients: NutrientData[]): number {
  return nutrients.filter(n => {
    const name = ((n as any).nutrient?.name || (n as any).nutrientName || (n as any).name || '').toLowerCase();
    return name.includes('vitamin');
  }).length;
}

// Determine which endpoint returned the most vitamin data
function getBestEndpoint(results: Record<string, unknown>): string {
  let bestEndpoint = '';
  let maxVitamins = 0;
  
  for (const [endpoint, data] of Object.entries(results)) {
    if ((data as any).vitaminCount && (data as any).vitaminCount > maxVitamins) {
      maxVitamins = (data as any).vitaminCount;
      bestEndpoint = endpoint;
    }
  }
  
  return bestEndpoint || 'None';
}

// Get total number of unique vitamins found across all endpoints
function getTotalVitaminsFound(results: Record<string, unknown>): number {
  const vitamins = new Set<string>();
  
  for (const data of Object.values(results)) {
    if ((data as any).data) {
      const nutrients = Array.isArray((data as any).data) ? (data as any).data[0]?.foodNutrients : (data as any).data.foodNutrients;
      if (nutrients) {
        nutrients.forEach((n: unknown) => {
          const name = ((n as any).nutrient?.name || (n as any).nutrientName || (n as any).name || '').toLowerCase();
          if (name.includes('vitamin')) {
            vitamins.add(name);
          }
        });
      }
    }
  }
  
  return vitamins.size;
} 