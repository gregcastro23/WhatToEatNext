'use client';

import React, { useState, useEffect } from 'react';
import { useAstrologicalState } from '@/hooks/useAstrologicalState';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { 
  getCuisineRecommendations, 
  calculateElementalMatch, 
  calculateElementalProfileFromZodiac,
  calculateElementalContributionsFromPlanets
, 
  generateTopSauceRecommendations 
} from '@/utils/cuisineRecommender';
import { cuisines } from '@/data/cuisines';
import { getRecipesForCuisineMatch , cuisineFlavorProfiles } from '@/data/cuisineFlavorProfiles';
import { getAllRecipes } from '@/data/recipes';
import { Recipe, ZodiacSign, LunarPhaseWithSpaces } from '@/types/alchemy';
import { ElementalProperties } from '@/types/celestial';
import { Loader2, ChevronDown, ChevronUp, Info, Flame, Droplets, Wind, Mountain } from 'lucide-react';
import { transformCuisines, sortByAlchemicalCompatibility } from '@/utils/alchemicalTransformationUtils';

type DebugStep = {
  name: string;
  description: string;
  data: Record<string, unknown>;
  completed: boolean;
  error?: string;
};

interface StepProps {
  step: DebugStep;
  expanded: boolean;
  onToggle: () => void;
}

const StepCard: React.FC<StepProps> = ({ step, expanded, onToggle }) => {
  return (
    <div className="mb-4 border rounded-md overflow-hidden">
      <div 
        className={`p-3 flex justify-between items-center cursor-pointer ${
          step.completed 
            ? step.error 
              ? 'bg-red-100 dark:bg-red-900' 
              : 'bg-green-100 dark:bg-green-900' 
            : 'bg-yellow-100 dark:bg-yellow-900'
        }`}
        onClick={onToggle}
      >
        <div>
          <h3 className="font-semibold">{step.name}</h3>
          <p className="text-sm opacity-75">{step.description}</p>
        </div>
        <div>
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>
      
      {expanded && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800">
          {step.error ? (
            <div className="p-3 bg-red-100 dark:bg-red-800 rounded text-red-800 dark:text-red-200">
              <p className="font-bold">Error:</p>
              <p>{step.error}</p>
            </div>
          ) : step.data ? (
            <pre className="overflow-auto p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
              {JSON.stringify(step.data, null, 2)}
            </pre>
          ) : (
            <p className="italic text-gray-500 dark:text-gray-400">No data available</p>
          )}
        </div>
      )}
    </div>
  );
};

const ElementalProfileDisplay: React.FC<{ profile: ElementalProperties, title?: string }> = ({ profile, title }) => {
  return (
    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded mb-4">
      {title && <h4 className="font-bold mb-2">{title}</h4>}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center">
          <Flame className="w-4 h-4 mr-2 text-red-500" />
          <span>Fire: {(profile.Fire * 100).toFixed(1)}%</span>
        </div>
        <div className="flex items-center">
          <Droplets className="w-4 h-4 mr-2 text-blue-500" />
          <span>Water: {(profile.Water * 100).toFixed(1)}%</span>
        </div>
        <div className="flex items-center">
          <Mountain className="w-4 h-4 mr-2 text-green-500" />
          <span>Earth: {(profile.Earth * 100).toFixed(1)}%</span>
        </div>
        <div className="flex items-center">
          <Wind className="w-4 h-4 mr-2 text-purple-500" />
          <span>Air: {(profile.Air * 100).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

const MatchScoreBar: React.FC<{ score: number, label?: string }> = ({ score, label }) => {
  let colorClass = "bg-gray-400";
  if (score >= 0.9) colorClass = "bg-green-500";
  else if (score >= 0.7) colorClass = "bg-green-400";
  else if (score >= 0.5) colorClass = "bg-yellow-400";
  else if (score >= 0.3) colorClass = "bg-orange-400";
  else colorClass = "bg-red-400";

  return (
    <div className="mb-2">
      {label && <span className="text-sm">{label}</span>}
      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
        <div 
          className={`${colorClass} h-2.5 rounded-full`} 
          style={{ width: `${score * 100}%` }}
        />
      </div>
      <div className="text-xs text-right">{(score * 100).toFixed(1)}%</div>
    </div>
  );
};

export default function CuisineRecommenderDebug() {
  // Alchemical context for astrological state
  const alchemicalContext = useAlchemical();
  
  // Extract relevant state from context
  const _isDaytime = alchemicalContext?.isDaytime ?? true;
  const planetaryPositions = alchemicalContext?.planetaryPositions ?? {};
  const state = alchemicalContext?.state ?? {
    astrologicalState: {
      zodiacSign: 'aries' as ZodiacSign,
      lunarPhase: 'new moon' as LunarPhaseWithSpaces,
    },
  };
  
  // Local state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userElementalProfile, setUserElementalProfile] = useState<ElementalProperties>({
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
  });
  const [cuisineRecommendations, setCuisineRecommendations] = useState<any[]>([]);
  const [steps, setSteps] = useState<DebugStep[]>([
    {
      name: "Getting Astrological State",
      description: "Retrieving zodiac sign and lunar phase",
      data: null,
      completed: false
    },
    {
      name: "Calculating Elemental Profile",
      description: "Converting astrological data to elemental properties",
      data: null,
      completed: false
    },
    {
      name: "Calculating Planetary Contributions",
      description: "Adding planetary influences to elemental profile",
      data: null,
      completed: false
    },
    {
      name: "Getting Cuisine Recommendations",
      description: "Generating raw cuisine recommendations from astrological state",
      data: null,
      completed: false
    },
    {
      name: "Transforming Cuisines",
      description: "Applying alchemical transformations to cuisines",
      data: null,
      completed: false
    },
    {
      name: "Sorting by Alchemical Compatibility",
      description: "Sorting cuisines by match to user's profile",
      data: null,
      completed: false
    },
    {
      name: "Recipe Matching",
      description: "Finding and scoring recipes for each cuisine",
      data: null,
      completed: false
    },
    {
      name: "Sauce Recommendations",
      description: "Generating sauce recommendations for the profile",
      data: null,
      completed: false
    }
  ]);
  
  const [expandedSteps, setExpandedSteps] = useState<number[]>([]);
  const [expandedCuisines, setExpandedCuisines] = useState<string[]>([]);
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [cuisineRecipes, setCuisineRecipes] = useState<Record<string, Recipe[]>>({});
  const [sauceRecommendations, setSauceRecommendations] = useState<any[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  
  // Toggle step expansion
  const toggleStep = (index: number) => {
    if (expandedSteps.includes(index)) {
      setExpandedSteps(expandedSteps.filter(i => i !== index));
    } else {
      setExpandedSteps([...expandedSteps, index]);
    }
  };
  
  // Toggle cuisine expansion
  const toggleCuisine = (cuisineId: string) => {
    if (expandedCuisines.includes(cuisineId)) {
      setExpandedCuisines(expandedCuisines.filter(id => id !== cuisineId));
    } else {
      setExpandedCuisines([...expandedCuisines, cuisineId]);
    }
  };
  
  // Select cuisine for detailed analysis
  const selectCuisine = (cuisineId: string) => {
    setSelectedCuisine(cuisineId === selectedCuisine ? null : cuisineId);
  };
  
  // Update step data and status
  const updateStep = (index: number, data: Record<string, unknown>, completed: boolean, error?: string) => {
    setSteps(prevSteps => {
      const newSteps = [...prevSteps];
      newSteps[index] = {
        ...newSteps[index],
        data,
        completed,
        error
      };
      return newSteps;
    });
  };
  
  // Run the main debug process
  const runDebug = async () => {
    setLoading(true);
    setError(null);
    setExpandedSteps([]);
    
    try {
      // Step 1: Get astrological state
      const astroState = state.astrologicalState || {
        zodiacSign: 'aries' as ZodiacSign,
        lunarPhase: 'new moon' as LunarPhaseWithSpaces
      };
      
      updateStep(0, astroState, true);
      
      // Step 2: Calculate elemental profile
      const elementalProfile = calculateElementalProfileFromZodiac(
        String(astroState.zodiacSign) || 'aries'
      );
      
      updateStep(1, elementalProfile, true);
      
      // Step 3: Calculate planetary contributions
      let planetaryElementContributions;
      try {
        planetaryElementContributions = calculateElementalContributionsFromPlanets(planetaryPositions);
        updateStep(2, planetaryElementContributions, true);
      } catch (err) {
        console.error('Error calculating planetary contributions:', err);
        updateStep(2, null, true, err instanceof Error ? err.message : 'Unknown error');
        planetaryElementContributions = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
      }
      
      // Combine the profiles
      const combinedProfile = { ...elementalProfile };
      for (const element in planetaryElementContributions) {
        if (element in combinedProfile) {
          combinedProfile[element] += planetaryElementContributions[element];
        }
      }
      
      // Normalize
      const total = Object.values(combinedProfile).reduce((sum, val) => sum + val, 0);
      for (const element in combinedProfile) {
        combinedProfile[element] = combinedProfile[element] / total;
      }
      
      setUserElementalProfile(combinedProfile);
      
      // Step 4: Get cuisine recommendations
      let recs;
      try {
        recs = getCuisineRecommendations(combinedProfile, astroState as unknown);
        updateStep(3, recs.slice(0, 5), true); // Show only first 5 for readability
      } catch (err) {
        console.error('Error getting cuisine recommendations:', err);
        updateStep(3, null, true, err instanceof Error ? err.message : 'Unknown error');
        recs = [];
      }
      
      // Step 5: Transform cuisines
      let transformedCuisines;
      try {
        transformedCuisines = (transformCuisines as unknown)(recs, 'default', true, {}, 10);
        updateStep(4, transformedCuisines.slice(0, 3), true); // Show only first 3
      } catch (err) {
        console.error('Error transforming cuisines:', err);
        updateStep(4, null, true, err instanceof Error ? err.message : 'Unknown error');
        transformedCuisines = recs;
      }
      
      // Step 6: Sort by alchemical compatibility
      let sortedCuisines;
      try {
        sortedCuisines = (sortByAlchemicalCompatibility as unknown)(
          transformedCuisines,
          combinedProfile,
          'default',
          true,
          {}
        );
        
        // Add match scores
        sortedCuisines = sortedCuisines.map((cuisine) => {
          const matchScore = calculateElementalMatch(
            cuisine.elementalProperties,
            combinedProfile
          );
          
          return {
            ...cuisine,
            matchScore,
            matchPercentage: Math.round(matchScore * 100),
          };
        });
        
        updateStep(5, sortedCuisines.slice(0, 3), true);
        setCuisineRecommendations(sortedCuisines);
      } catch (err) {
        console.error('Error sorting cuisines:', err);
        updateStep(5, null, true, err instanceof Error ? err.message : String(err) || 'Unknown error');
        sortedCuisines = transformedCuisines;
      }
      
      // Step 7: Recipe matching
      try {
        const recipes = await getAllRecipes();
        setAllRecipes(recipes as unknown);
        
        const recipesResult: Record<string, any> = {};
        
        for (const cuisine of sortedCuisines.slice(0, 5)) { // Limit to top 5 for performance
          try {
            const matchedRecipes = getRecipesForCuisineMatch(
              cuisine.name,
              recipes,
              5 // Get only 5 recipes per cuisine
            );
            
            // Score recipes against user profile
            const scoredRecipes = matchedRecipes.map(recipe => {
              // Calculate match score if possible
              const recipeElements = (recipe as unknown)?.elementalProperties || cuisine.elementalProperties;
              const matchScore = calculateElementalMatch(recipeElements, combinedProfile);
              
              return {
                ...recipe,
                matchScore,
                matchPercentage: Math.round(matchScore * 100)
              };
            });
            
            recipesResult[cuisine.id] = scoredRecipes;
          } catch (e) {
            console.error(`Error matching recipes for ${cuisine.name}:`, e);
            recipesResult[cuisine.id] = { error: e instanceof Error ? e.message : 'Unknown error' };
          }
        }
        
        setCuisineRecipes(recipesResult);
        updateStep(6, Object.keys(recipesResult).length > 0 ? 
          { cuisineCount: Object.keys(recipesResult).length, sampleCuisine: Object.values(recipesResult)[0]?.slice(0, 2) } : 
          null, 
          true
        );
      } catch (err) {
        console.error('Error matching recipes:', err);
        updateStep(6, null, true, err instanceof Error ? err.message : 'Unknown error');
      }
      
      // Step 8: Sauce recommendations
      try {
        const sauces = (generateTopSauceRecommendations as unknown)(combinedProfile, 5, 'default', true, {});
        setSauceRecommendations(sauces);
        updateStep(7, sauces.slice(0, 3), true);
      } catch (err) {
        console.error('Error generating sauce recommendations:', err);
        updateStep(7, null, true, err instanceof Error ? err.message : 'Unknown error');
      }
      
    } catch (err) {
      console.error('Error in debug process:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded shadow mb-8">
      <h2 className="text-xl font-bold mb-4">Cuisine Recommender Debug</h2>
      
      <div className="mb-6">
        <button
          onClick={runDebug}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Running Debug...
            </span>
          ) : (
            'Test Cuisine Recommendation Algorithm'
          )}
        </button>
      </div>
      
      {error && (
        <div className="p-3 mb-4 bg-red-100 border border-red-300 text-red-800 rounded">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column for steps */}
        <div>
          <h3 className="font-bold mb-3">Processing Steps</h3>
          {steps.map((step, index) => (
            <StepCard
              key={`step-${index}`}
              step={step}
              expanded={expandedSteps.includes(index)}
              onToggle={() => toggleStep(index)}
            />
          ))}
        </div>
        
        {/* Right column for user profile and results */}
        <div>
          <h3 className="font-bold mb-3">User Elemental Profile</h3>
          <ElementalProfileDisplay profile={userElementalProfile} />
          
          <h3 className="font-bold mt-6 mb-3">Top Cuisine Recommendations</h3>
          {cuisineRecommendations.length > 0 ? (
            <div className="space-y-3">
              {cuisineRecommendations.slice(0, 5).map((cuisine) => (
                <div 
                  key={cuisine.id} 
                  className={`border rounded-md overflow-hidden ${
                    selectedCuisine === cuisine.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div 
                    className="p-3 bg-gray-50 dark:bg-gray-700 flex justify-between items-center cursor-pointer"
                    onClick={() => toggleCuisine(cuisine.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{cuisine.name}</h4>
                        <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {cuisine.matchPercentage}% match
                        </span>
                      </div>
                      <MatchScoreBar score={cuisine.matchScore} />
                    </div>
                    <button 
                      className="ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectCuisine(cuisine.id);
                      }}
                    >
                      <Info size={16} />
                    </button>
                    {expandedCuisines.includes(cuisine.id) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                  
                  {expandedCuisines.includes(cuisine.id) && (
                    <div className="p-3 border-t">
                      <ElementalProfileDisplay profile={cuisine.elementalProperties} title="Elemental Properties" />
                      
                      {/* Recipe matches if available */}
                      {cuisineRecipes[cuisine.id] && cuisineRecipes[cuisine.id].length > 0 && (
                        <div className="mt-3">
                          <h5 className="font-semibold mb-2">Top Recipe Matches</h5>
                          <ul className="space-y-2">
                            {cuisineRecipes[cuisine.id].slice(0, 3).map((recipe, index) => (
                              <li key={`recipe-${index}`} className="p-2 bg-gray-100 dark:bg-gray-600 rounded">
                                <div className="flex justify-between">
                                  <span>{(recipe.name as React.ReactNode) || 'Unknown Recipe'}</span>
                                  <span className="text-sm">{(recipe.matchPercentage as React.ReactNode) || 'N/A'}% match</span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="italic text-gray-500 dark:text-gray-400">No recommendations available. Run the debug to generate data.</p>
          )}
          
          {/* Sauce Recommendations */}
          {sauceRecommendations.length > 0 && (
            <div className="mt-6">
              <h3 className="font-bold mb-3">Sauce Recommendations</h3>
              <div className="space-y-2">
                {sauceRecommendations.map((sauce, index) => (
                  <div key={`sauce-${index}`} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold">{(sauce.name as React.ReactNode) || 'Unknown Sauce'}</h4>
                      <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {(sauce.matchPercentage as React.ReactNode) || 'N/A'}% match
                      </span>
                    </div>
                    {sauce.description && (
                      <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">{(sauce.description as React.ReactNode) || ''}</p>
                    )}
                    {sauce.elementalMatchScore && (
                      <div className="mt-2 text-xs">
                        <div className="grid grid-cols-3 gap-1">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Elemental:</span> {(sauce.elementalMatchScore as React.ReactNode) || 'N/A'}%
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Planetary:</span> {(sauce.planetaryDayScore as number) || 0}%
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Flavor:</span> {(sauce.planetaryHourScore as number) || 0}%
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Detailed Analysis for Selected Cuisine */}
      {selectedCuisine && cuisineRecommendations.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="font-bold mb-4">Detailed Analysis: {
            (cuisineRecommendations.find(c => c.id === selectedCuisine)?.name as React.ReactNode) || 'Unknown Cuisine'
          }</h3>
          
          {(() => {
            const cuisine = cuisineRecommendations.find(c => c.id === selectedCuisine);
            if (!cuisine) return null;
            
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Match Analysis</h4>
                  <ElementalProfileDisplay profile={cuisine.elementalProperties} title="Cuisine Elemental Profile" />
                  <ElementalProfileDisplay profile={userElementalProfile} title="User Elemental Profile" />
                  
                  <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-md mt-2">
                    <h5 className="font-medium mb-1">Match Calculation</h5>
                    <MatchScoreBar score={cuisine.matchScore} label="Overall Match" />
                    
                    <div className="mt-3 space-y-1 text-sm">
                      <p><span className="font-medium">Fire Difference:</span> {Math.abs(cuisine.elementalProperties.Fire - userElementalProfile.Fire).toFixed(2)}</p>
                      <p><span className="font-medium">Water Difference:</span> {Math.abs(cuisine.elementalProperties.Water - userElementalProfile.Water).toFixed(2)}</p>
                      <p><span className="font-medium">Earth Difference:</span> {Math.abs(cuisine.elementalProperties.Earth - userElementalProfile.Earth).toFixed(2)}</p>
                      <p><span className="font-medium">Air Difference:</span> {Math.abs(cuisine.elementalProperties.Air - userElementalProfile.Air).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Recipe Matching</h4>
                  {cuisineRecipes[selectedCuisine] && cuisineRecipes[selectedCuisine].length > 0 ? (
                    <div className="space-y-3">
                      {cuisineRecipes[selectedCuisine].map((recipe, index) => (
                        <div key={`recipe-detail-${index}`} className="p-3 bg-gray-100 dark:bg-gray-600 rounded-md">
                          <h5 className="font-medium">{(recipe.name as React.ReactNode) || 'Unknown Recipe'}</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{(recipe.description as React.ReactNode) || 'No description available'}</p>
                          
                          <div className="mt-2">
                            <MatchScoreBar score={(recipe.matchScore as number) || 0.5} label="Match Score" />
                          </div>
                          
                          {recipe.elementalProperties && (
                            <div className="mt-2">
                              <h6 className="text-xs font-medium mb-1">Recipe Elemental Properties</h6>
                              <div className="grid grid-cols-4 gap-1 text-xs">
                                <div className="flex items-center">
                                  <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
                                  <span>{(recipe.elementalProperties.Fire * 100).toFixed(0)}%</span>
                                </div>
                                <div className="flex items-center">
                                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
                                  <span>{(recipe.elementalProperties.Water * 100).toFixed(0)}%</span>
                                </div>
                                <div className="flex items-center">
                                  <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                                  <span>{(recipe.elementalProperties.Earth * 100).toFixed(0)}%</span>
                                </div>
                                <div className="flex items-center">
                                  <div className="w-2 h-2 rounded-full bg-purple-500 mr-1"></div>
                                  <span>{(recipe.elementalProperties.Air * 100).toFixed(0)}%</span>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {recipe.ingredients && recipe.ingredients.length > 0 && (
                            <details className="mt-2 text-xs">
                              <summary className="cursor-pointer font-medium">Ingredients ({recipe.ingredients.length})</summary>
                              <ul className="mt-1 pl-4 list-disc">
                                {recipe.ingredients.slice(0, 5).map((ingredient, i) => (
                                  <li key={`ing-${i}`}>{typeof ingredient === 'string' ? ingredient : (ingredient.name as React.ReactNode) || 'Unknown Ingredient'}</li>
                                ))}
                                {recipe.ingredients.length > 5 && <li className="italic">...and {recipe.ingredients.length - 5} more</li>}
                              </ul>
                            </details>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="italic text-gray-500 dark:text-gray-400">No recipes available for this cuisine.</p>
                  )}
                  
                  <h4 className="font-semibold mt-4 mb-2">Sauce Pairings</h4>
                  {sauceRecommendations.length > 0 ? (
                    <div className="space-y-2">
                      {sauceRecommendations.slice(0, 3).map((sauce, index) => (
                        <div key={`sauce-detail-${index}`} className="p-2 bg-gray-100 dark:bg-gray-600 rounded-md">
                          <div className="flex justify-between">
                            <span className="font-medium">{(sauce.name as React.ReactNode) || 'Unknown Sauce'}</span>
                            <span className="text-xs bg-blue-100 dark:bg-blue-800 px-1 rounded">
                              {(sauce.matchPercentage as React.ReactNode) || 'N/A'}% match
                            </span>
                          </div>
                          
                          {sauce.elementalProperties && (
                            <div className="mt-1 grid grid-cols-4 gap-1 text-xs">
                              <div className="flex items-center">
                                <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
                                <span>{(sauce.elementalProperties.Fire * 100).toFixed(0)}%</span>
                              </div>
                              <div className="flex items-center">
                                <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
                                <span>{(sauce.elementalProperties.Water * 100).toFixed(0)}%</span>
                              </div>
                              <div className="flex items-center">
                                <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                                <span>{(sauce.elementalProperties.Earth * 100).toFixed(0)}%</span>
                              </div>
                              <div className="flex items-center">
                                <div className="w-2 h-2 rounded-full bg-purple-500 mr-1"></div>
                                <span>{(sauce.elementalProperties.Air * 100).toFixed(0)}%</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="italic text-gray-500 dark:text-gray-400">No sauce recommendations available.</p>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
} 