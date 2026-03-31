'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAstrologicalState } from '@/hooks/useAstrologicalState';
import { Flame, Droplets, Mountain, Wind, Clock, Users, Utensils, Calendar, Tag, CircleDashed, Activity, Sun, MoonStar } from 'lucide-react';
import { cuisines } from '@/data/cuisines'; // Import the actual cuisines data
import { enrichRecipeData } from '@/utils/recipeEnrichment';
import RecipeCard from './RecipeCard';
import type { Recipe } from '@/types/recipe'; // Import the Recipe type
import { PlanetaryHourCalculator } from '@/lib/PlanetaryHourCalculator';
import type { Planet } from '@/types/alchemy';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { logger } from '@/utils/logger';
import { recipeFilter } from '@/utils/recipeFilters';
import { zodiacSeasons } from '@/data/zodiacSeasons';

interface RecipeListProps {
  cuisineFilter?: string;
}

export default function RecipeList({ cuisineFilter }: RecipeListProps = {}) {
  const { currentPlanetaryAlignment, currentZodiac, activePlanets, isDaytime } = useAstrologicalState();
  const [planetaryHour, setPlanetaryHour] = useState<Planet | null>(null);
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  // Use the calculator directly
  useEffect(() => {
    const calculator = new PlanetaryHourCalculator();
    const hourInfo = calculator.getCurrentPlanetaryHour();
    setPlanetaryHour(hourInfo.planet);
  }, []);

  useEffect(() => {
    // Extract recipes from the cuisines data structure
    const extractedRecipes: Recipe[] = [];
    
    Object.entries(cuisines).forEach(([cuisineId, cuisine]) => {
      // Skip if there's a cuisine filter and this isn't the right cuisine
      if (cuisineFilter && cuisineId.toLowerCase() !== cuisineFilter.toLowerCase()) {
        return;
      }
      
      // Process each cuisine's dishes
      if (cuisine.dishes) {
        // Track indices for unique IDs
        let recipeIndex = 0;
        
        Object.entries(cuisine.dishes).forEach(([mealType, mealTypeData]) => {
          if (!mealTypeData) return; // Skip if mealTypeData is undefined
          
          Object.entries(mealTypeData).forEach(([season, seasonRecipes]) => {
            if (!seasonRecipes) return; // Skip if seasonRecipes is undefined
            
            // Handle both array and object formats
            if (Array.isArray(seasonRecipes)) {
            seasonRecipes.forEach((recipe: unknown) => {
                if (!recipe) return; // Skip if recipe is undefined
                
                // Create a unique ID with an index to ensure uniqueness
                recipeIndex++;
                const baseName = recipe.name ? recipe.name.toLowerCase().replace(/\s+/g, '-') : 'unknown';
                const uniqueId = `${cuisineId}-${baseName}-${recipeIndex}`;
                
                extractedRecipes.push({
                  ...recipe,
                  id: uniqueId,
                  cuisine: cuisineId,
                  mealType,
                  season: [season],
                  // Normalize instructions field
                  instructions: recipe.instructions || recipe.preparationSteps || [],
                  // Normalize cooking methods field
                  cookingMethod: recipe.cookingMethod || (recipe.cookingMethods ? recipe.cookingMethods.join(', ') : undefined),
                  // Add elemental properties based on culinary traditions if not present
                  elementalProperties: recipe.elementalProperties || 
                    (cuisine.elementalState ? { 
                      Fire: cuisine.elementalState.Fire || 0,
                      Water: cuisine.elementalState.Water || 0, 
                      Earth: cuisine.elementalState.Earth || 0,
                      Air: cuisine.elementalState.Air || 0
                    } : undefined)
                });
              });
            } else if (typeof seasonRecipes === 'object' && seasonRecipes !== null) {
              // If seasonRecipes is a single object
              recipeIndex++;
              const recipe = seasonRecipes;
              const baseName = recipe.name ? recipe.name.toLowerCase().replace(/\s+/g, '-') : 'unknown';
              const uniqueId = `${cuisineId}-${baseName}-${recipeIndex}`;
              
              extractedRecipes.push({
        ...recipe,
                id: uniqueId,
                cuisine: cuisineId,
                mealType,
                season: [season],
                instructions: recipe.instructions || recipe.preparationSteps || [],
                cookingMethod: recipe.cookingMethod || (recipe.cookingMethods ? recipe.cookingMethods.join(', ') : undefined),
                elementalProperties: recipe.elementalProperties || 
                  (cuisine.elementalState ? { 
                    Fire: cuisine.elementalState.Fire || 0,
                    Water: cuisine.elementalState.Water || 0, 
                    Earth: cuisine.elementalState.Earth || 0,
                    Air: cuisine.elementalState.Air || 0
                  } : undefined)
              });
            } else {
              console.warn(`Unexpected format for seasonRecipes in ${cuisineId}/${mealType}/${season}`);
            }
          });
        });
      }
    });
    
    // Enrich all recipes with enhanced astrological data
    const enrichedRecipes = extractedRecipes.map(recipe => enrichRecipeData(recipe));
    
    // Calculate astrological compatibility for each recipe
    const scoredRecipes = calculateAstrologicalCompatibility(enrichedRecipes);
    
    // Sort recipes by compatibility score in descending order
    const sortedRecipes = scoredRecipes.sort((a, b) => 
      (b.compatibilityScore || 0) - (a.compatibilityScore || 0)
    );
    
    setRecipes(sortedRecipes);
  }, [cuisineFilter, currentPlanetaryAlignment, currentZodiac, activePlanets, isDaytime]);

  // Enhanced astrological compatibility calculation with day/night effects and planetary hours
  const calculateAstrologicalCompatibility = (recipeList: Recipe[]): Recipe[] => {
    return recipeList.map(recipe => {
      try {
        let score = 50; // Base score
        
        // Make sure elemental properties are valid for calculation
        const safeElementalProps = {
          Fire: recipe.elementalProperties?.Fire || 0,
          Water: recipe.elementalProperties?.Water || 0,
          Earth: recipe.elementalProperties?.Earth || 0,
          Air: recipe.elementalProperties?.Air || 0
        };
        
        // 1. Element compatibility with current zodiac
        if (currentZodiac) {
          const zodiacElementMap: Record<string, keyof typeof safeElementalProps> = {
            'aries': 'Fire',
            'leo': 'Fire',
            'sagittarius': 'Fire',
            'taurus': 'Earth',
            'virgo': 'Earth',
            'capricorn': 'Earth',
            'gemini': 'Air',
            'libra': 'Air',
            'aquarius': 'Air',
            'cancer': 'Water',
            'scorpio': 'Water',
            'pisces': 'Water'
          };
          
          const currentElement = zodiacElementMap[currentZodiac.toLowerCase()];
          if (currentElement && safeElementalProps[currentElement] !== undefined) {
            const elementValue = safeElementalProps[currentElement];
            // Safely add to score, ensuring we don't add NaN
            if (!isNaN(elementValue)) {
              score += elementValue * 20; // Up to 20 points for elemental match
            }
          }
        }
        
        // 2. Zodiac-based seasonal compatibility (more precise than general seasons)
        if (recipe.season && currentZodiac) {
          // Map zodiac signs to traditional seasons for compatibility with recipe data
          const zodiacToSeason: Record<string, string> = {
            // Spring signs
            'aries': 'spring',
            'taurus': 'spring',
            'gemini': 'spring',
            
            // Summer signs
            'cancer': 'summer',
            'leo': 'summer',
            'virgo': 'summer',
            
            // Fall/Autumn signs
            'libra': 'autumn',
            'scorpio': 'autumn',
            'sagittarius': 'autumn',
            
            // Winter signs
            'capricorn': 'winter',
            'aquarius': 'winter',
            'pisces': 'winter'
          };
          
          const currentSeason = zodiacToSeason[currentZodiac.toLowerCase()];
          
          // Check if recipe is appropriate for current astrological season
          if (recipe.season && Array.isArray(recipe.season) && recipe.season.some(s => 
            s.toLowerCase() === currentSeason || 
            s.toLowerCase() === 'all'
          )) {
            score += 15; // 15 points for seasonal match
          } else if (recipe.season && typeof recipe.season === 'string' && 
            (recipe.season.toLowerCase() === currentSeason || 
             recipe.season.toLowerCase() === 'all')) {
            score += 15; // 15 points for seasonal match
          }
          
          // Give additional bonus points for recipes that match the specific zodiac sign
          if (recipe.astrologicalInfluences?.some(influence => 
            influence.toLowerCase().includes(currentZodiac.toLowerCase())
          )) {
            score += 10; // Extra points for specific zodiac match
          }
        }
        
        // 3. Day/Night effects on meal type suitability
        if (recipe.mealType) {
          const mealTypes = Array.isArray(recipe.mealType) 
            ? recipe.mealType.map(m => m.toLowerCase()) 
            : [typeof recipe.mealType === 'string' ? recipe.mealType.toLowerCase() : ''];
          
          // Daytime favors breakfast & lunch, nighttime favors dinner
          if (isDaytime) {
            // During day, breakfast and lunch get a boost
            if (mealTypes.some(m => m.includes('breakfast') || m.includes('lunch') || m.includes('brunch'))) {
              score += 12; // Strong bonus for day-appropriate meals
            } else if (mealTypes.some(m => m.includes('dessert') || m.includes('snack'))) {
              score += 6; // Moderate bonus for flexible meals
            }
            
            // Element affinity during day: Fire and Air elements are stronger
            score += (safeElementalProps.Fire * 5) + (safeElementalProps.Air * 5);
          } else {
            // During night, dinner gets a boost
            if (mealTypes.some(m => m.includes('dinner') || m.includes('supper'))) {
              score += 12; // Strong bonus for night-appropriate meals
            } else if (mealTypes.some(m => m.includes('dessert') || m.includes('snack'))) {
              score += 6; // Moderate bonus for flexible meals
            }
            
            // Element affinity during night: Water and Earth elements are stronger
            score += (safeElementalProps.Water * 5) + (safeElementalProps.Earth * 5);
          }
        }
        
        // 4. Time of day compatibility
        if (recipe.mealType) {
          const hour = new Date().getHours();
          const isBreakfastTime = hour >= 6 && hour < 11;
          const isLunchTime = hour >= 11 && hour < 15;
          const isDinnerTime = hour >= 17 && hour < 22;
          
          const mealTypes = Array.isArray(recipe.mealType) 
            ? recipe.mealType.map(m => m.toLowerCase()) 
            : [typeof recipe.mealType === 'string' ? recipe.mealType.toLowerCase() : ''];
          
          if ((isBreakfastTime && mealTypes.some(m => m.includes('breakfast'))) ||
              (isLunchTime && mealTypes.some(m => m.includes('lunch'))) ||
              (isDinnerTime && mealTypes.some(m => m.includes('dinner') || m.includes('supper')))) {
            score += 10; // 10 points for time of day match
          }
        }
        
        // 5. Planetary hour compatibility
        if (recipe.astrologicalInfluences) {
          // Map planetary hour influences to recipe qualities
          const planetaryInfluenceMap: Record<string, string[]> = {
            'Sun': ['energizing', 'vitality', 'strength', 'warming', 'sunny', 'bright', 'radiant', 'gold', 'orange'],
            'Moon': ['comforting', 'nourishing', 'cooling', 'calming', 'silver', 'white', 'creamy', 'milky'],
            'Mercury': ['light', 'quick', 'diverse', 'mixed', 'fusion', 'colorful', 'varied'],
            'Venus': ['sweet', 'harmonious', 'balanced', 'pleasant', 'delicate', 'fragrant', 'pink', 'green'],
            'Mars': ['spicy', 'hot', 'bold', 'intense', 'stimulating', 'red', 'energetic'],
            'Jupiter': ['abundant', 'generous', 'festive', 'celebratory', 'rich', 'purple', 'blue'],
            'Saturn': ['traditional', 'preserved', 'aged', 'structured', 'earthy', 'black', 'brown']
          };
          
          const hourKeywords = planetaryInfluenceMap[recipe.astrologicalInfluences[0]] || [];
          
          // Check if recipe has any influences matching the current planetary hour
          const matchingInfluences = recipe.astrologicalInfluences.filter(influence => 
            hourKeywords.some(keyword => influence.toLowerCase().includes(keyword.toLowerCase()))
          );
          
          if (matchingInfluences.length > 0) {
            score += matchingInfluences.length * 8; // Strong bonus for planetary hour match
          }
        }
        
        // 6. Astrological influences
        if (recipe.astrologicalInfluences && recipe.astrologicalInfluences.length > 0) {
          // Check if recipe has influences related to active planets
          const activePlanetsArray = Array.isArray(activePlanets) ? activePlanets as string[] : [];
          const matchingInfluences = activePlanetsArray.filter(planet => 
            recipe.astrologicalInfluences?.some(influence => 
              typeof influence === 'string' &&
              influence.toLowerCase().includes(planet.toLowerCase())
            )
          );
          
          if (matchingInfluences && matchingInfluences.length > 0) {
            score += matchingInfluences.length * 5; // 5 points per matching planet
          }
        }
        
        // NEW: Enhanced planetary positioning influences
        if (currentPlanetaryAlignment && recipe.astrologicalInfluences) {
          // Check all planets, not just Sun position
          const planetaryPositions = [
            { planet: 'Sun', sign: (currentPlanetaryAlignment as any)?.sun?.sign, degree: (currentPlanetaryAlignment as any)?.sun?.degree },
            { planet: 'Moon', sign: (currentPlanetaryAlignment as any)?.moon?.sign, degree: (currentPlanetaryAlignment as any)?.moon?.degree },
            { planet: 'Mercury', sign: (currentPlanetaryAlignment as any)?.mercury?.sign, degree: (currentPlanetaryAlignment as any)?.mercury?.degree },
            { planet: 'Venus', sign: (currentPlanetaryAlignment as any)?.venus?.sign, degree: (currentPlanetaryAlignment as any)?.venus?.degree },
            { planet: 'Mars', sign: (currentPlanetaryAlignment as any)?.mars?.sign, degree: (currentPlanetaryAlignment as any)?.mars?.degree },
            { planet: 'Jupiter', sign: (currentPlanetaryAlignment as any)?.jupiter?.sign, degree: (currentPlanetaryAlignment as any)?.jupiter?.degree },
            { planet: 'Saturn', sign: (currentPlanetaryAlignment as any)?.saturn?.sign, degree: (currentPlanetaryAlignment as any)?.saturn?.degree }
          ].filter(p => p.sign); // Filter out undefined positions
          
          // Planet in dominant house gives stronger influence
          const dominantPlanets = planetaryPositions.filter(p => {
            // Planets in angular houses (1, 4, 7, 10) have stronger influence
            // This is a simplified calculation - we could use actual house positions
            const degree = p.degree || 0;
            return (degree >= 0 && degree < 10) || 
                   (degree >= 90 && degree < 100) || 
                   (degree >= 180 && degree < 190) || 
                   (degree >= 270 && degree < 280);
          });
          
          // Score recipes that match planetary sign placements
          planetaryPositions.forEach(planet => {
            if (!planet.sign) return;
            
            // Check if recipe has influences related to this planet's sign
            const matchesPlanetSign = recipe.astrologicalInfluences?.some(influence => 
              typeof influence === 'string' && influence.toLowerCase().includes(planet.sign?.toLowerCase() || '')
            ) || false;
            
            if (matchesPlanetSign) {
              // Base points for matching
              let points = 3;
              
              // Bonus points for dominant planets
              if (dominantPlanets.some(p => p.planet === planet.planet)) {
                points += 2;
              }
              
              // Extra bonus for luminaries (Sun and Moon)
              if (planet.planet === 'Sun' || planet.planet === 'Moon') {
                points += 2;
              }
              
              score += points;
            }
          });
          
          // Check for special aspect patterns - planets in harmonious aspects
          const harmonicPairs = checkHarmonicAspects(currentPlanetaryAlignment);
          if (harmonicPairs.length > 0) {
            // If recipe matches the energy of harmonic pairs, boost score
            harmonicPairs.forEach(pair => {
              const matchesHarmonicPair = recipe.astrologicalInfluences?.some(influence => 
                typeof influence === 'string' &&
                influence.toLowerCase().includes(pair.planet1.toLowerCase()) && 
                influence.toLowerCase().includes(pair.planet2.toLowerCase())
              ) || false;
              
              if (matchesHarmonicPair) {
                score += 5; // Strong boost for matching harmonic energy
              }
            });
          }
        }
        
        // Ensure the score is always a valid number between 0-100
        if (isNaN(score) || !isFinite(score)) {
          score = 50; // Default to neutral if calculation went wrong
        }
        
        // Clamp the score between 0 and 100
        score = Math.max(0, Math.min(100, score));
        
        // Compute compatibility percentage (always a number between 0-100)
        const compatibilityPercentage = Math.round(score);
        
        return {
          ...recipe,
          compatibilityScore: compatibilityPercentage
        };
      } catch (error) {
        console.error(`Error calculating compatibility for ${recipe.name}:`, error);
        // Return recipe with default score if there's an error
        return {
          ...recipe,
          compatibilityScore: 50
        };
      }
    });
  };

  // Helper function to identify harmonious planetary aspects
  const checkHarmonicAspects = (alignment: unknown): Array<{planet1: string, planet2: string, aspect: string}> => {
    const aspects: Array<{planet1: string, planet2: string, aspect: string}> = [];
    
    // Use zodiac data from the imported zodiacSeasons
    if (alignment.sun && alignment.jupiter) {
      const sunSign = alignment.sun.sign.toLowerCase();
      const jupiterSign = alignment.jupiter.sign.toLowerCase();
      
      // Get sign elements from zodiacSeasons
      const getElement = (sign: string): string => {
        const signData = zodiacSeasons.find(s => s.sign.toLowerCase() === sign);
        return signData?.element || '';
      };
      
      const sunElement = getElement(sunSign);
      const jupiterElement = getElement(jupiterSign);
      
      // Check if planets are in signs of the same element (trine)
      if (sunElement && jupiterElement && sunElement === jupiterElement) {
        aspects.push({ planet1: 'Sun', planet2: 'Jupiter', aspect: 'trine' });
      }
    }
    
    // Additional aspect checks would go here
    
    return aspects;
  };

  // Toggle recipe expansion
  const toggleRecipe = (id: string) => {
    setExpandedRecipeId(expandedRecipeId === id ? null : id);
  };

  // Render element icon based on dominance
  const renderElementIcon = (properties: Recipe['elementalProperties']) => {
    if (!properties) return null;
    
    const elements = Object.entries(properties).sort((a, b) => b[1] - a[1]);
    const dominantElement = elements[0];
    
    if (dominantElement[1] <= 0) return null;
    
    switch (dominantElement[0]) {
      case 'Fire': return <Flame className="w-4 h-4 text-red-500" />;
      case 'Water': return <Droplets className="w-4 h-4 text-blue-500" />;
      case 'Earth': return <Mountain className="w-4 h-4 text-green-500" />;
      case 'Air': return <Wind className="w-4 h-4 text-purple-500" />;
      default: return null;
    }
  };

  // Display dietary restrictions as badges
  const renderDietaryBadges = (recipe: Recipe) => {
    const badges = [];
    
    if (recipe.isVegetarian) {
      badges.push(
        <span key="vegetarian" className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded mr-1">
          Vegetarian
        </span>
      );
    }
    
    if (recipe.isVegan) {
      badges.push(
        <span key="vegan" className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded mr-1">
          Vegan
        </span>
      );
    }
    
    if (recipe.isGlutenFree) {
      badges.push(
        <span key="gluten-free" className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded mr-1">
          Gluten Free
        </span>
      );
    }
    
    if (recipe.isDairyFree) {
      badges.push(
        <span key="dairy-free" className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded mr-1">
          Dairy Free
        </span>
      );
    }
    
    return badges.length > 0 ? (
      <div className="flex flex-wrap mt-2">
        {badges}
      </div>
    ) : null;
  };

  if (recipes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No recipes found for this cuisine.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Astrological Context Display */}
      <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
        <h3 className="font-medium text-lg mb-2">Current Astrological Context</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="flex items-center">
            <span className="font-medium mr-2">Sign:</span>
            <span>{currentZodiac ? currentZodiac.charAt(0).toUpperCase() + currentZodiac.slice(1) : 'Unknown'}</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium mr-2">Time:</span>
            <span className="flex items-center">
              {isDaytime ? (
                <>
                  <Sun className="w-4 h-4 mr-1 text-amber-500" />
                  Day
                </>
              ) : (
                <>
                  <MoonStar className="w-4 h-4 mr-1 text-indigo-700" />
                  Night
                </>
              )}
            </span>
          </div>
          <div className="flex items-center">
            <span className="font-medium mr-2">Active Planets:</span>
            <span>{activePlanets?.join(', ') || 'None'}</span>
          </div>
        </div>
      </div>
      
      {/* Recipe Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map(recipe => (
        <div 
          key={recipe.id}
            className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
          <div 
              className="p-4 cursor-pointer" 
              onClick={() => toggleRecipe(recipe.id)}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold">{recipe.name}</h3>
                {renderElementIcon(recipe.elementalProperties)}
                
                {/* Compatibility Score Badge */}
                {recipe.compatibilityScore !== undefined && !isNaN(recipe.compatibilityScore) && (
                  <span className={`px-2 py-1 text-xs rounded ${
                    recipe.compatibilityScore > 75 
                      ? "bg-green-100 text-green-800" 
                      : recipe.compatibilityScore > 50 
                        ? "bg-yellow-100 text-yellow-800" 
                        : "bg-gray-100 text-gray-800"
                  }`}>
                    {Math.round(recipe.compatibilityScore)}% match
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">{recipe.description}</p>
              
              <div className="flex items-center mt-3 text-sm text-gray-500">
                {recipe.prepTime && (
                  <span className="flex items-center mr-4">
                    <Clock className="w-4 h-4 mr-1" />
                    {recipe.prepTime}
                  </span>
                )}
                {recipe.servingSize && (
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    Serves {recipe.servingSize}
              </span>
                )}
              </div>
              
              {/* Display dietary badges */}
              {renderDietaryBadges(recipe)}
            </div>
            
            {expandedRecipeId === recipe.id && (
              <div className="p-4 border-t bg-gray-50">
                {/* Recipe Details */}
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center">
                      <Utensils className="w-4 h-4 mr-2 text-gray-500" />
                      <span>Meal Type: {recipe.mealType || 'Any'}</span>
                    </div>
                    
                    {recipe.cookingMethod && (
                      <div className="flex items-center">
                        <Activity className="w-4 h-4 mr-2 text-gray-500" />
                        <span>Method: {recipe.cookingMethod}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                      <span>Season: {recipe.season 
                        ? (Array.isArray(recipe.season) 
                            ? recipe.season.join(', ') 
                            : recipe.season)
                        : 'All'}</span>
                    </div>
                  </div>

                  {/* Nutrition Information */}
                  {recipe.nutrition && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Nutrition</h4>
                      <div className="grid grid-cols-4 gap-2 bg-white p-2 rounded border text-sm">
                        {recipe.nutrition.calories !== undefined && (
                          <div className="text-center">
                            <div className="font-medium">Calories</div>
                            <div>{recipe.nutrition.calories}</div>
                          </div>
                        )}
                        
                        {recipe.nutrition.protein !== undefined && (
                          <div className="text-center">
                            <div className="font-medium">Protein</div>
                            <div>{recipe.nutrition.protein}g</div>
                          </div>
                        )}
                        
                        {recipe.nutrition.carbs !== undefined && (
                          <div className="text-center">
                            <div className="font-medium">Carbs</div>
                            <div>{recipe.nutrition.carbs}g</div>
                          </div>
                        )}
                        
                        {recipe.nutrition.fat !== undefined && (
                          <div className="text-center">
                            <div className="font-medium">Fat</div>
                            <div>{recipe.nutrition.fat}g</div>
                          </div>
                        )}
                      </div>
                      
                      {/* Vitamins and Minerals */}
                      <div className="mt-2 text-sm">
                        {recipe.nutrition.vitamins && recipe.nutrition.vitamins.length > 0 && (
                          <div className="mb-1">
                            <span className="font-medium">Vitamins: </span>
                            <span>{recipe.nutrition.vitamins.join(', ')}</span>
                          </div>
                        )}
                        
                        {recipe.nutrition.minerals && recipe.nutrition.minerals.length > 0 && (
                          <div>
                            <span className="font-medium">Minerals: </span>
                            <span>{recipe.nutrition.minerals.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Astrological Influences */}
                  {recipe.astrologicalInfluences && recipe.astrologicalInfluences.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Astrological Influences</h4>
                      <div className="flex flex-wrap gap-1">
                        {recipe.astrologicalInfluences.map((influence: string, idx: number) => (
                          <span key={idx} className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">
                            {influence}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Tags */}
                  {recipe.tags && recipe.tags.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {recipe.tags.map((tag: string, idx: number) => (
                          <span key={idx} className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ingredients */}
                  {recipe.ingredients && recipe.ingredients.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Ingredients</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {recipe.ingredients.map((ingredient, idx: number) => (
                          <li key={idx} className={ingredient.optional ? 'text-gray-500' : ''}>
                            {ingredient.amount && `${ingredient.amount} `}
                            {ingredient.unit && `${ingredient.unit} `}
                            {ingredient.name}
                            {ingredient.preparation && ` (${ingredient.preparation})`}
                            {ingredient.optional && ' (optional)'}
                            {ingredient.notes && <div className="text-xs text-gray-500 ml-5">{ingredient.notes}</div>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Procedure */}
                  {recipe.instructions && recipe.instructions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Procedure</h4>
                      <ol className="list-decimal list-inside space-y-2 text-sm">
                        {recipe.instructions.map((step: string, idx: number) => (
                          <li key={idx} className="leading-relaxed">{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ),
      )}
      </div>
    </div>
  );
} 