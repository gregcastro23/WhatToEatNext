import { NextResponse } from 'next/server';


// Interfaces for nutrition data handling
interface NutrientData {
  nutrient?: { name?: string };
  nutrientName?: string;
  name?: string;
  vitaminCount?: number;
  data?: unknown;
  [key: string]: unknown;
}


// USDA FoodData Central API endpoint and key
const USDA_API_BASE = 'https://api.nal.usda.gov/fdc/v1';
const USDA_API_KEY = 'mymNfzEYKEYQoDNDf7hR9O0OdrF3spSeIQBcdMBl';

// Account information
// Email: gregcastro23@gmail.com
// Account ID: bbfc68fd-3519-4136-99fe-59578183fc14

/**
 * List of complete nutrient IDs to request explicitly
 * This includes all vitamins, minerals, macronutrients
 */
const NUTRIENT_IDS = [
  // Macronutrients
  1003, 1004, 1005, 1008, 1051, 1079, 
  // Vitamins
  1106, 1107, 1108, 1109, 1114, 1120, 1162, 1165, 1166, 1167, 1175, 1176, 1177, 1178, 1180, 1183, 1184, 1185, 1187,
  // Minerals
  1087, 1088, 1089, 1090, 1091, 1092, 1093, 1094, 1095, 1096, 1097, 1098, 1101, 1102, 1103
].join(',');

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  
  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    );
  }
  
  try {
    console.log(`Fetching nutritional data for: ${query}`);
    
    // Step 1: First search for foods matching the query with more specific format parameters
    const searchResponse = await fetch(
      `${USDA_API_BASE}/foods/search?query=${encodeURIComponent(query)}&pageSize=5&dataType=SR%20Legacy,Foundation,Survey%20(FNDDS)&sortBy=dataType.keyword&sortOrder=asc&api_key=${USDA_API_KEY}`,
      { cache: 'no-store' }
    );
    
    if (!searchResponse.ok) {
      throw new Error(`USDA API search error: ${searchResponse.status} ${searchResponse.statusText}`);
    }
    
    const searchData = await searchResponse.json();
    
    // No results found
    if (!searchData.foods || !searchData.foods.length) {
      console.log(`No results found for: ${query}`);
      return NextResponse.json({ foods: [] });
    }
    
    // Find the best food by data type - prioritize SR Legacy and Foundation foods
    let bestMatchFood = null;
    // First try SR Legacy
    bestMatchFood = searchData.foods.find(f => f.dataType === 'SR Legacy');
    // If not found, try Foundation
    if (!bestMatchFood) {
      bestMatchFood = searchData.foods.find(f => f.dataType === 'Foundation');
    }
    // If still not found, use the first result
    if (!bestMatchFood) {
      bestMatchFood = searchData.foods[0];
    }
    
    const fdcId = bestMatchFood.fdcId;
    console.log(`Found food: ${bestMatchFood.description} (${fdcId}) [${bestMatchFood.dataType}]`);
    
    // Try multiple endpoints to get the most complete data
    // 1. First try the foods/list endpoint with the specific food id, which often has more vitamins
    try {
      const listResponse = await fetch(
        `${USDA_API_BASE}/foods/list?fdcIds=${fdcId}&format=full&nutrients=${NUTRIENT_IDS}&api_key=${USDA_API_KEY}`,
        { cache: 'no-store' }
      );
      
      if (listResponse.ok) {
        const listData = await listResponse.json();
        if (listData && listData.length > 0) {
          const vitamins = countVitamins(listData[0].foodNutrients || []);
          console.log(`foods/list endpoint found ${vitamins} vitamins`);
          
          if (vitamins > 0) {
            console.log(`Using data from foods/list endpoint (${vitamins} vitamins found)`);
            return NextResponse.json({
              foods: [listData[0]]
            });
          }
        }
      }
    } catch (error) {
      console.warn('Error fetching from foods/list endpoint:', error);
    }
    
    // 2. Next try food/{fdcId} with the format=full parameter, this sometimes gives more nutrients
    try {
      const fullResponse = await fetch(
        `${USDA_API_BASE}/food/${fdcId}?format=full&nutrients=${NUTRIENT_IDS}&api_key=${USDA_API_KEY}`,
        { cache: 'no-store' }
      );
      
      if (fullResponse.ok) {
        const fullData = await fullResponse.json();
        if (fullData && fullData.foodNutrients) {
          const vitamins = countVitamins(fullData.foodNutrients);
          console.log(`food endpoint with format=full found ${vitamins} vitamins`);
          
          if (vitamins > 0) {
            console.log(`Using data from food endpoint with format=full (${vitamins} vitamins found)`);
            return NextResponse.json({
              foods: [fullData]
            });
          }
        }
      }
    } catch (error) {
      console.warn('Error fetching from food endpoint with format=full:', error);
    }
    
    // 3. Try the basic food endpoint (sometimes it has different data)
    try {
      const basicResponse = await fetch(
        `${USDA_API_BASE}/food/${fdcId}?api_key=${USDA_API_KEY}`,
        { cache: 'no-store' }
      );
      
      if (basicResponse.ok) {
        const basicData = await basicResponse.json();
        if (basicData && basicData.foodNutrients) {
          const vitamins = countVitamins(basicData.foodNutrients);
          console.log(`basic food endpoint found ${vitamins} vitamins`);
          
          if (vitamins > 0) {
            console.log(`Using data from basic food endpoint (${vitamins} vitamins found)`);
            return NextResponse.json({
              foods: [basicData]
            });
          }
        }
      }
    } catch (error) {
      console.warn('Error fetching from basic food endpoint:', error);
    }
    
    // 4. As a last resort, return the search result directly
    // This is useful for Branded foods which sometimes don't have detailed endpoints
    console.log('Using original search result (no detailed vitamin data found in specialized endpoints)');
    return NextResponse.json({
      foods: [bestMatchFood]
    });
    
  } catch (error) {
    console.error('Error fetching from USDA API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from USDA API' },
      { status: 500 }
    );
  }
}

// Helper function to count vitamins in a foodNutrients array
function countVitamins(nutrients: NutrientData[]): number {
  return nutrients.filter(n => {
    const name = (n.nutrient?.name || n.nutrientName || n.name || '').toLowerCase();
    return name.includes('vitamin');
  }).length;
} 