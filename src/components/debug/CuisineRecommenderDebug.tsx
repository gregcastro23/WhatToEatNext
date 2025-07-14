'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAstrologicalState } from '@/hooks/useAstrologicalState';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { 
  getCuisineRecommendations, 
  calculateElementalMatch, 
  calculateElementalProfileFromZodiac,
  calculateElementalContributionsFromPlanets, 
  generateTopSauceRecommendations 
} from '@/utils/cuisineRecommender';
import { cuisines } from '@/data/cuisines';
import { getRecipesForCuisineMatch, cuisineFlavorProfiles } from '@/data/cuisineFlavorProfiles';
import { getAllRecipes } from '@/data/recipes';
import { Recipe, ZodiacSign, LunarPhaseWithSpaces } from '@/types/alchemy';
import { ElementalProperties } from '@/types/celestial';
import { Loader2, ChevronDown, ChevronUp, Info, Flame, Droplets, Wind, Mountain, RefreshCw, Clock, Star, Zap } from 'lucide-react';
import { transformCuisines, sortByAlchemicalCompatibility } from '@/utils/alchemicalTransformationUtils';

type DebugStep = {
  name: string;
  description: string;
  data: Record<string, unknown> | null;
  completed: boolean;
  error?: string;
  timestamp?: string;
  duration?: number;
};

interface StepProps {
  step: DebugStep;
  expanded: boolean;
  onToggle: () => void;
}

const StepCard: React.FC<StepProps> = ({ step, expanded, onToggle }) => {
  return (
    <div className="mb-4 border rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div 
        className={`p-3 flex justify-between items-center cursor-pointer transition-colors ${
          step.completed 
            ? step.error 
              ? 'bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800' 
              : 'bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800' 
            : 'bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800'
        }`}
        onClick={onToggle}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{step.name}</h3>
            {step.duration && (
              <span className="text-xs bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">
                {step.duration}ms
              </span>
            )}
          </div>
          <p className="text-sm opacity-75">{step.description}</p>
          {step.timestamp && (
            <p className="text-xs opacity-60 mt-1">
              <Clock className="w-3 h-3 inline mr-1" />
              {step.timestamp}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {step.completed && !step.error && (
            <Star className="w-4 h-4 text-green-600" />
          )}
          {step.error && (
            <Zap className="w-4 h-4 text-red-600" />
          )}
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>
      
      {expanded && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t">
          {step.error ? (
            <div className="p-3 bg-red-100 dark:bg-red-800 rounded text-red-800 dark:text-red-200">
              <p className="font-bold flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Error:
              </p>
              <p className="mt-1">{step.error}</p>
            </div>
          ) : step.data ? (
            <div>
              <div className="mb-2 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Debug Data
                </span>
                <span className="text-xs text-gray-500">
                  {typeof step.data === 'object' ? Object.keys(step.data).length : 1} properties
                </span>
              </div>
              <pre className="overflow-auto p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs max-h-64">
                {JSON.stringify(step.data, null, 2)}
              </pre>
            </div>
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
    <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg mb-4 shadow-sm">
      {title && <h4 className="font-bold mb-3 text-gray-800 dark:text-gray-200">{title}</h4>}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center justify-between bg-white dark:bg-gray-600 p-2 rounded">
          <div className="flex items-center">
            <Flame className="w-4 h-4 mr-2 text-red-500" />
            <span className="font-medium">Fire</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-16 bg-gray-200 dark:bg-gray-500 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${profile.Fire * 100}%` }}
              />
            </div>
            <span className="text-sm font-mono">{(profile.Fire * 100).toFixed(1)}%</span>
          </div>
        </div>
        <div className="flex items-center justify-between bg-white dark:bg-gray-600 p-2 rounded">
          <div className="flex items-center">
            <Droplets className="w-4 h-4 mr-2 text-blue-500" />
            <span className="font-medium">Water</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-16 bg-gray-200 dark:bg-gray-500 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${profile.Water * 100}%` }}
              />
            </div>
            <span className="text-sm font-mono">{(profile.Water * 100).toFixed(1)}%</span>
          </div>
        </div>
        <div className="flex items-center justify-between bg-white dark:bg-gray-600 p-2 rounded">
          <div className="flex items-center">
            <Mountain className="w-4 h-4 mr-2 text-green-500" />
            <span className="font-medium">Earth</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-16 bg-gray-200 dark:bg-gray-500 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${profile.Earth * 100}%` }}
              />
            </div>
            <span className="text-sm font-mono">{(profile.Earth * 100).toFixed(1)}%</span>
          </div>
        </div>
        <div className="flex items-center justify-between bg-white dark:bg-gray-600 p-2 rounded">
          <div className="flex items-center">
            <Wind className="w-4 h-4 mr-2 text-purple-500" />
            <span className="font-medium">Air</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-16 bg-gray-200 dark:bg-gray-500 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${profile.Air * 100}%` }}
              />
            </div>
            <span className="text-sm font-mono">{(profile.Air * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const MatchScoreBar: React.FC<{ score: number, label?: string }> = ({ score, label }) => {
  let colorClass = "bg-gray-400";
  let bgColorClass = "bg-gray-100";
  
  if (score >= 0.9) {
    colorClass = "bg-green-500";
    bgColorClass = "bg-green-100";
  } else if (score >= 0.7) {
    colorClass = "bg-green-400";
    bgColorClass = "bg-green-50";
  } else if (score >= 0.5) {
    colorClass = "bg-yellow-400";
    bgColorClass = "bg-yellow-50";
  } else if (score >= 0.3) {
    colorClass = "bg-orange-400";
    bgColorClass = "bg-orange-50";
  } else {
    colorClass = "bg-red-400";
    bgColorClass = "bg-red-50";
  }

  return (
    <div className={`p-2 rounded ${bgColorClass} mb-2`}>
      {label && <span className="text-sm font-medium block mb-1">{label}</span>}
      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
        <div 
          className={`${colorClass} h-3 rounded-full transition-all duration-700 ease-out`} 
          style={{ width: `${score * 100}%` }}
        />
      </div>
      <div className="text-xs text-right mt-1 font-mono">{(score * 100).toFixed(1)}%</div>
    </div>
  );
};

export default function CuisineRecommenderDebug() {
  // Enhanced astrological state integration
  const {
    currentZodiac,
    currentPlanetaryAlignment,
    lunarPhase,
    activePlanets,
    domElements,
    isDaytime
  } = useAstrologicalState();
  
  // Alchemical context for additional state
  const alchemicalContext = useAlchemical();
  
  // Extract relevant state from context with enhanced integration
  const planetaryPositions = alchemicalContext?.planetaryPositions ?? currentPlanetaryAlignment ?? {};
  const state = alchemicalContext?.state ?? {
    astrologicalState: {
      zodiacSign: currentZodiac || 'aries' as ZodiacSign,
      lunarPhase: lunarPhase || 'new moon' as LunarPhaseWithSpaces,
    },
  };
  
  // Enhanced local state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
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
      description: "Retrieving zodiac sign, lunar phase, and planetary positions",
      data: null,
      completed: false
    },
    {
      name: "Analyzing Cuisine Database",
      description: "Processing available cuisines and flavor profiles",
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
  const [cuisineAnalysis, setCuisineAnalysis] = useState<any>(null);
  const [flavorProfileAnalysis, setFlavorProfileAnalysis] = useState<any>(null);
  
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
  
  // Update step data and status with enhanced tracking
  const updateStep = (index: number, data: Record<string, unknown> | null, completed: boolean, error?: string) => {
    setSteps(prevSteps => {
      const newSteps = [...prevSteps];
      const timestamp = new Date().toLocaleTimeString();
      const startTime = Date.now();
      
      newSteps[index] = {
        ...newSteps[index],
        data,
        completed,
        error,
        timestamp,
        duration: completed ? Date.now() - startTime : undefined
      };
      return newSteps;
    });
  };
  
  // Enhanced debug process with integrated unused functionality
  const runDebug = useCallback(async () => {
    setLoading(true);
    setError(null);
    setExpandedSteps([]);
    setLastRefresh(new Date());
    
    try {
      const startTime = Date.now();
      
      // Step 1: Get enhanced astrological state
      const astroState = {
        zodiacSign: currentZodiac || state.astrologicalState?.zodiacSign || 'aries' as ZodiacSign,
        lunarPhase: lunarPhase || state.astrologicalState?.lunarPhase || 'new moon' as LunarPhaseWithSpaces,
        planetaryPositions: planetaryPositions,
        activePlanets: activePlanets || [],
        domElements: domElements || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
        isDaytime: isDaytime ?? true
      };
      
      updateStep(0, {
        ...astroState,
        integrationSource: 'useAstrologicalState + AlchemicalContext'
      }, true);
      
      // Step 2: Analyze cuisine database (using previously unused cuisines import)
      const cuisineAnalysisData = {
        totalCuisines: Object.keys(cuisines).length,
        availableCuisines: Object.keys(cuisines),
        flavorProfileCount: Object.keys(cuisineFlavorProfiles).length,
        flavorProfileCuisines: Object.keys(cuisineFlavorProfiles),
        integration: 'cuisines + cuisineFlavorProfiles data integration'
      };
      
      setCuisineAnalysis(cuisineAnalysisData);
      setFlavorProfileAnalysis(cuisineFlavorProfiles);
      updateStep(1, cuisineAnalysisData, true);
      
      // Step 2: Calculate elemental profile
      const elementalProfile = calculateElementalProfileFromZodiac(
        String(astroState.zodiacSign) || 'aries'
      );
      
      updateStep(2, {
        ...elementalProfile,
        calculationMethod: 'zodiac-based elemental mapping'
      }, true);
      
      // Step 3: Calculate planetary contributions (enhanced)
      let planetaryElementContributions;
      try {
        planetaryElementContributions = calculateElementalContributionsFromPlanets(planetaryPositions);
        updateStep(3, {
          ...planetaryElementContributions,
          activePlanetsCount: activePlanets?.length || 0,
          isDaytime: isDaytime,
          integrationMethod: 'planetary position analysis'
        }, true);
      } catch (err) {
        console.error('Error calculating planetary contributions:', err);
        updateStep(3, null, true, err instanceof Error ? err.message : 'Unknown error');
        planetaryElementContributions = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
      }
      
      // Combine the profiles with enhanced normalization
      const combinedProfile = { ...elementalProfile };
      for (const element in planetaryElementContributions) {
        if (element in combinedProfile) {
          combinedProfile[element] += planetaryElementContributions[element];
        }
      }
      
      // Enhanced normalization preserving elemental harmony
      const total = Object.values(combinedProfile).reduce((sum, val) => sum + val, 0);
      for (const element in combinedProfile) {
        combinedProfile[element] = total > 0 ? combinedProfile[element] / total : 0.25;
      }
      
      setUserElementalProfile(combinedProfile);
      
      // Step 4: Get cuisine recommendations
      let recs;
      try {
        recs = getCuisineRecommendations(combinedProfile, astroState as unknown);
        updateStep(4, {
          recommendationCount: recs?.length || 0,
          topRecommendations: recs?.slice(0, 5) || [],
          method: 'enhanced astrological cuisine matching'
        }, true);
      } catch (err) {
        console.error('Error getting cuisine recommendations:', err);
        updateStep(4, null, true, err instanceof Error ? err.message : 'Unknown error');
        recs = [];
      }
      
      // Step 5: Transform cuisines (using previously unused import)
      let transformedCuisines;
      try {
        transformedCuisines = (transformCuisines as unknown as (...args: unknown[]) => unknown)(
          recs, 
          'enhanced', 
          true, 
          {
            lunarPhase: astroState.lunarPhase,
            isDaytime: astroState.isDaytime,
            activePlanets: astroState.activePlanets
          }, 
          15
        );
        updateStep(5, {
          transformedCount: Array.isArray(transformedCuisines) ? transformedCuisines.length : 0,
          transformationMode: 'enhanced alchemical transformation',
          topTransformed: Array.isArray(transformedCuisines) ? transformedCuisines.slice(0, 3) : []
        }, true);
      } catch (err) {
        console.error('Error transforming cuisines:', err);
        updateStep(5, null, true, err instanceof Error ? err.message : 'Unknown error');
        transformedCuisines = recs;
      }
      
      // Step 6: Sort by alchemical compatibility (using previously unused import)
      let sortedCuisines;
      try {
        sortedCuisines = (sortByAlchemicalCompatibility as unknown as (...args: unknown[]) => unknown)(
          transformedCuisines,
          combinedProfile,
          'sophisticated',
          true,
          {
            lunarPhase: astroState.lunarPhase,
            planetaryInfluences: astroState.activePlanets,
            timeOfDay: astroState.isDaytime ? 'day' : 'night'
          }
        );
        
        // Enhanced match scoring with elemental harmony principles
        sortedCuisines = Array.isArray(sortedCuisines) ? sortedCuisines.map((cuisine) => {
          const matchScore = calculateElementalMatch(
            cuisine.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
            combinedProfile
          );
          
          return {
            ...cuisine,
            matchScore,
            matchPercentage: Math.round(matchScore * 100),
            elementalHarmony: 'self-reinforcing elemental alignment',
          };
        }) : [];
        
        updateStep(6, {
          sortedCount: sortedCuisines.length,
          sortingMethod: 'sophisticated alchemical compatibility',
          topMatches: sortedCuisines.slice(0, 3)
        }, true);
        setCuisineRecommendations(sortedCuisines);
      } catch (err) {
        console.error('Error sorting cuisines:', err);
        updateStep(6, null, true, err instanceof Error ? err.message : String(err) || 'Unknown error');
        sortedCuisines = Array.isArray(transformedCuisines) ? transformedCuisines : [];
      }
      
      // Step 7: Enhanced recipe matching
      try {
        const recipes = await getAllRecipes();
        setAllRecipes(recipes as any);
        
        const recipesResult: Record<string, any> = {};
        const topCuisines = Array.isArray(sortedCuisines) ? sortedCuisines.slice(0, 8) : [];
        
        for (const cuisine of topCuisines) {
          try {
            const matchedRecipes = getRecipesForCuisineMatch(
              cuisine.name,
              recipes,
              8 // Enhanced recipe count
            );
            
            // Enhanced recipe scoring with elemental principles
            const scoredRecipes = Array.isArray(matchedRecipes) ? matchedRecipes.map(recipe => {
              const recipeElements = (recipe as any)?.elementalProperties || cuisine.elementalProperties;
              const matchScore = calculateElementalMatch(recipeElements, combinedProfile);
              
              return {
                ...recipe,
                matchScore,
                matchPercentage: Math.round(matchScore * 100),
                elementalAlignment: 'harmonic elemental resonance'
              };
            }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0)) : [];
            
            recipesResult[cuisine.id] = scoredRecipes;
          } catch (e) {
            console.error(`Error matching recipes for ${cuisine.name}:`, e);
            recipesResult[cuisine.id] = { error: e instanceof Error ? e.message : 'Unknown error' };
          }
        }
        
        setCuisineRecipes(recipesResult);
        updateStep(7, {
          cuisineCount: Object.keys(recipesResult).length,
          totalRecipes: Object.values(recipesResult).flat().length,
          enhancedMatching: 'elemental harmony-based recipe scoring'
        }, true);
      } catch (err) {
        console.error('Error matching recipes:', err);
        updateStep(7, null, true, err instanceof Error ? err.message : 'Unknown error');
      }
      
      // Step 8: Enhanced sauce recommendations
      try {
        const sauces = (generateTopSauceRecommendations as unknown as (...args: unknown[]) => unknown)(
          combinedProfile, 
          8, 
          'enhanced', 
          true, 
          {
            lunarPhase: astroState.lunarPhase,
            seasonalAlignment: 'current',
            elementalHarmony: 'self-reinforcing'
          }
        );
        setSauceRecommendations(Array.isArray(sauces) ? sauces : []);
        updateStep(8, {
          sauceCount: Array.isArray(sauces) ? sauces.length : 0,
          enhancedRecommendations: Array.isArray(sauces) ? sauces.slice(0, 4) : [],
          method: 'enhanced sauce-cuisine harmony'
        }, true);
      } catch (err) {
        console.error('Error generating sauce recommendations:', err);
        updateStep(8, null, true, err instanceof Error ? err.message : 'Unknown error');
      }
      
      const totalDuration = Date.now() - startTime;
      console.log(`Debug process completed in ${totalDuration}ms`);
      
    } catch (err) {
      console.error('Error in debug process:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [currentZodiac, lunarPhase, planetaryPositions, activePlanets, domElements, isDaytime, state]);

  // Enhanced auto-refresh with useEffect integration
  useEffect(() => {
    if (autoRefresh && !refreshInterval) {
      const interval = setInterval(() => {
        console.log('Auto-refreshing debug data...');
        runDebug();
      }, 30000); // Refresh every 30 seconds
      
      setRefreshInterval(interval);
    } else if (!autoRefresh && refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [autoRefresh, refreshInterval, runDebug]);

  // Auto-run on astrological state changes
  useEffect(() => {
    if (currentZodiac && lunarPhase) {
      console.log('Astrological state changed, running debug...');
      runDebug();
    }
  }, [currentZodiac, lunarPhase, runDebug]);

  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };
  
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-500" />
            Enhanced Cuisine Recommender Debug
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Phase 14 Enhanced - Real-time astrological cuisine analysis with integrated data sources
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <Clock className="w-3 h-3 inline mr-1" />
              Last: {lastRefresh.toLocaleTimeString()}
            </div>
          )}
          
          <button
            onClick={toggleAutoRefresh}
            className={`px-3 py-1 text-xs rounded-full transition-all ${
              autoRefresh 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            <RefreshCw className={`w-3 h-3 inline mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-refresh
          </button>
          
          <button
            onClick={runDebug}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all shadow-sm"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Enhanced Analysis...
              </span>
            ) : (
              <span className="flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                Run Enhanced Debug
              </span>
            )}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="p-4 mb-6 bg-red-100 border border-red-300 text-red-800 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            <p className="font-bold">Enhanced Debug Error:</p>
          </div>
          <p className="mt-1">{error}</p>
        </div>
      )}
      
      {/* Enhanced Cuisine Database Analysis */}
      {cuisineAnalysis && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 rounded-lg border">
          <h3 className="font-bold mb-3 text-blue-800 dark:text-blue-200 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Integrated Cuisine Database Analysis
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-white dark:bg-gray-700 p-3 rounded shadow-sm">
              <div className="font-semibold text-blue-600 dark:text-blue-400">Total Cuisines</div>
              <div className="text-2xl font-bold">{cuisineAnalysis.totalCuisines}</div>
            </div>
            <div className="bg-white dark:bg-gray-700 p-3 rounded shadow-sm">
              <div className="font-semibold text-purple-600 dark:text-purple-400">Flavor Profiles</div>
              <div className="text-2xl font-bold">{cuisineAnalysis.flavorProfileCount}</div>
            </div>
            <div className="bg-white dark:bg-gray-700 p-3 rounded shadow-sm">
              <div className="font-semibold text-green-600 dark:text-green-400">Integration Status</div>
              <div className="text-sm font-medium text-green-700 dark:text-green-300">✓ Active</div>
            </div>
            <div className="bg-white dark:bg-gray-700 p-3 rounded shadow-sm">
              <div className="font-semibold text-orange-600 dark:text-orange-400">Data Sources</div>
              <div className="text-sm font-medium">Cuisines + Profiles</div>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column for enhanced processing steps */}
        <div>
          <h3 className="font-bold mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Enhanced Processing Steps
          </h3>
          {steps.map((step, index) => (
            <StepCard
              key={`step-${index}`}
              step={step}
              expanded={expandedSteps.includes(index)}
              onToggle={() => toggleStep(index)}
            />
          ))}
        </div>
        
        {/* Right column for enhanced user profile and results */}
        <div>
          <h3 className="font-bold mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Wind className="w-5 h-5 text-purple-500" />
            Enhanced Elemental Profile
          </h3>
          <ElementalProfileDisplay profile={userElementalProfile} />
          
          <h3 className="font-bold mt-6 mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-500" />
            Top Enhanced Cuisine Recommendations
          </h3>
          {cuisineRecommendations.length > 0 ? (
            <div className="space-y-4">
              {cuisineRecommendations.slice(0, 6).map((cuisine) => (
                <div 
                  key={cuisine.id} 
                  className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all ${
                    selectedCuisine === cuisine.id ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900' : 'bg-white dark:bg-gray-700'
                  }`}
                >
                  <div 
                    className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => toggleCuisine(cuisine.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-lg">{cuisine.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-medium">
                            {cuisine.matchPercentage}% match
                          </span>
                          {cuisine.elementalHarmony && (
                            <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                              ✓ Harmonious
                            </span>
                          )}
                        </div>
                      </div>
                      <MatchScoreBar score={cuisine.matchScore} />
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button 
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectCuisine(cuisine.id);
                        }}
                      >
                        <Info size={16} />
                      </button>
                      {expandedCuisines.includes(cuisine.id) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>
                  
                  {expandedCuisines.includes(cuisine.id) && (
                    <div className="p-4 border-t bg-gray-50 dark:bg-gray-800">
                      <ElementalProfileDisplay profile={cuisine.elementalProperties} title="Cuisine Elemental Properties" />
                      
                      {/* Enhanced recipe matches */}
                      {cuisineRecipes[cuisine.id] && cuisineRecipes[cuisine.id].length > 0 && (
                        <div className="mt-4">
                          <h5 className="font-semibold mb-3 flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            Enhanced Recipe Matches
                          </h5>
                          <div className="grid gap-2">
                            {cuisineRecipes[cuisine.id].slice(0, 4).map((recipe, index) => (
                              <div key={`recipe-${index}`} className="p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <span className="font-medium">{(recipe.name as React.ReactNode) || 'Unknown Recipe'}</span>
                                    {recipe.elementalAlignment && (
                                      <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                                        ✓ {recipe.elementalAlignment}
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-sm font-mono bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">
                                    {(recipe.matchPercentage as React.ReactNode) || 'N/A'}%
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Info className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="italic text-gray-500 dark:text-gray-400">
                No recommendations available. Run the enhanced debug to generate data.
              </p>
            </div>
          )}
          
          {/* Enhanced Sauce Recommendations */}
          {sauceRecommendations.length > 0 && (
            <div className="mt-8">
              <h3 className="font-bold mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-500" />
                Enhanced Sauce Recommendations
              </h3>
              <div className="grid gap-3">
                {sauceRecommendations.slice(0, 4).map((sauce, index) => (
                  <div key={`sauce-${index}`} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 rounded-lg border shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">{(sauce.name as React.ReactNode) || 'Unknown Sauce'}</h4>
                      <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-medium">
                        {(sauce.matchPercentage as React.ReactNode) || 'N/A'}% match
                      </span>
                    </div>
                    {sauce.description && (
                      <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">{(sauce.description as React.ReactNode) || ''}</p>
                    )}
                    {sauce.elementalMatchScore && (
                      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-white dark:bg-gray-700 p-2 rounded">
                          <span className="text-gray-500 dark:text-gray-400">Elemental:</span>
                          <div className="font-bold text-blue-600 dark:text-blue-400">{(sauce.elementalMatchScore as React.ReactNode) || 'N/A'}%</div>
                        </div>
                        <div className="bg-white dark:bg-gray-700 p-2 rounded">
                          <span className="text-gray-500 dark:text-gray-400">Planetary:</span>
                          <div className="font-bold text-purple-600 dark:text-purple-400">{(sauce.planetaryDayScore as number) || 0}%</div>
                        </div>
                        <div className="bg-white dark:bg-gray-700 p-2 rounded">
                          <span className="text-gray-500 dark:text-gray-400">Harmony:</span>
                          <div className="font-bold text-green-600 dark:text-green-400">{(sauce.planetaryHourScore as number) || 0}%</div>
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
      
      {/* Enhanced Detailed Analysis for Selected Cuisine */}
      {selectedCuisine && cuisineRecommendations.length > 0 && (
        <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900 rounded-lg border shadow-lg">
          <h3 className="font-bold mb-6 text-xl text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-500" />
            Enhanced Detailed Analysis: {
              (cuisineRecommendations.find(c => c.id === selectedCuisine)?.name as React.ReactNode) || 'Unknown Cuisine'
            }
          </h3>
          
          {(() => {
            const cuisine = cuisineRecommendations.find(c => c.id === selectedCuisine);
            if (!cuisine) return null;
            
            return (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Mountain className="w-5 h-5 text-green-500" />
                    Enhanced Match Analysis
                  </h4>
                  <ElementalProfileDisplay profile={cuisine.elementalProperties} title="Cuisine Elemental Profile" />
                  <ElementalProfileDisplay profile={userElementalProfile} title="User Elemental Profile" />
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg mt-4 shadow-sm">
                    <h5 className="font-medium mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-blue-500" />
                      Enhanced Match Calculation
                    </h5>
                    <MatchScoreBar score={cuisine.matchScore} label="Overall Elemental Harmony" />
                    
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">Fire Alignment:</span>
                        <span className="font-mono">{Math.abs(cuisine.elementalProperties.Fire - userElementalProfile.Fire).toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Water Alignment:</span>
                        <span className="font-mono">{Math.abs(cuisine.elementalProperties.Water - userElementalProfile.Water).toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Earth Alignment:</span>
                        <span className="font-mono">{Math.abs(cuisine.elementalProperties.Earth - userElementalProfile.Earth).toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Air Alignment:</span>
                        <span className="font-mono">{Math.abs(cuisine.elementalProperties.Air - userElementalProfile.Air).toFixed(3)}</span>
                      </div>
                      {cuisine.elementalHarmony && (
                        <div className="mt-3 p-2 bg-green-100 dark:bg-green-800 rounded text-green-800 dark:text-green-200 text-center">
                          ✓ {cuisine.elementalHarmony}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-red-500" />
                    Enhanced Recipe Analysis
                  </h4>
                  {cuisineRecipes[selectedCuisine] && cuisineRecipes[selectedCuisine].length > 0 ? (
                    <div className="space-y-4">
                      {cuisineRecipes[selectedCuisine].slice(0, 4).map((recipe, index) => (
                        <div key={`recipe-detail-${index}`} className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow-sm border">
                          <h5 className="font-medium text-lg">{(recipe.name as React.ReactNode) || 'Unknown Recipe'}</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{(recipe.description as React.ReactNode) || 'No description available'}</p>
                          
                          {recipe.elementalAlignment && (
                            <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                              ✓ {recipe.elementalAlignment}
                            </div>
                          )}
                          
                          <div className="mt-3">
                            <MatchScoreBar score={(recipe.matchScore as number) || 0.5} label="Recipe Harmony Score" />
                          </div>
                          
                          {recipe.elementalProperties && (
                            <div className="mt-3">
                              <h6 className="text-xs font-medium mb-2">Recipe Elemental Properties</h6>
                              <div className="grid grid-cols-4 gap-2 text-xs">
                                <div className="flex items-center bg-red-50 dark:bg-red-900 p-1 rounded">
                                  <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
                                  <span>{(recipe.elementalProperties.Fire * 100).toFixed(0)}%</span>
                                </div>
                                <div className="flex items-center bg-blue-50 dark:bg-blue-900 p-1 rounded">
                                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
                                  <span>{(recipe.elementalProperties.Water * 100).toFixed(0)}%</span>
                                </div>
                                <div className="flex items-center bg-green-50 dark:bg-green-900 p-1 rounded">
                                  <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                                  <span>{(recipe.elementalProperties.Earth * 100).toFixed(0)}%</span>
                                </div>
                                <div className="flex items-center bg-purple-50 dark:bg-purple-900 p-1 rounded">
                                  <div className="w-2 h-2 rounded-full bg-purple-500 mr-1"></div>
                                  <span>{(recipe.elementalProperties.Air * 100).toFixed(0)}%</span>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {recipe.ingredients && recipe.ingredients.length > 0 && (
                            <details className="mt-3 text-xs">
                              <summary className="cursor-pointer font-medium hover:text-blue-600 dark:hover:text-blue-400">
                                Enhanced Ingredients ({recipe.ingredients.length})
                              </summary>
                              <ul className="mt-2 pl-4 list-disc space-y-1">
                                {recipe.ingredients.slice(0, 6).map((ingredient, i) => (
                                  <li key={`ing-${i}`}>{typeof ingredient === 'string' ? ingredient : (ingredient.name as React.ReactNode) || 'Unknown Ingredient'}</li>
                                ))}
                                {recipe.ingredients.length > 6 && <li className="italic text-gray-500">...and {recipe.ingredients.length - 6} more ingredients</li>}
                              </ul>
                            </details>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Info className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="italic text-gray-500 dark:text-gray-400">No enhanced recipes available for this cuisine.</p>
                    </div>
                  )}
                  
                  <h4 className="font-semibold mt-6 mb-4 flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-blue-500" />
                    Enhanced Sauce Pairings
                  </h4>
                  {sauceRecommendations.length > 0 ? (
                    <div className="space-y-3">
                      {sauceRecommendations.slice(0, 3).map((sauce, index) => (
                        <div key={`sauce-detail-${index}`} className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 rounded-lg border">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{(sauce.name as React.ReactNode) || 'Unknown Sauce'}</span>
                            <span className="text-xs bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded font-mono">
                              {(sauce.matchPercentage as React.ReactNode) || 'N/A'}% match
                            </span>
                          </div>
                          
                          {sauce.elementalProperties && (
                            <div className="mt-2 grid grid-cols-4 gap-1 text-xs">
                              <div className="flex items-center bg-red-50 dark:bg-red-900 p-1 rounded">
                                <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
                                <span>{(sauce.elementalProperties.Fire * 100).toFixed(0)}%</span>
                              </div>
                              <div className="flex items-center bg-blue-50 dark:bg-blue-900 p-1 rounded">
                                <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
                                <span>{(sauce.elementalProperties.Water * 100).toFixed(0)}%</span>
                              </div>
                              <div className="flex items-center bg-green-50 dark:bg-green-900 p-1 rounded">
                                <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                                <span>{(sauce.elementalProperties.Earth * 100).toFixed(0)}%</span>
                              </div>
                              <div className="flex items-center bg-purple-50 dark:bg-purple-900 p-1 rounded">
                                <div className="w-2 h-2 rounded-full bg-purple-500 mr-1"></div>
                                <span>{(sauce.elementalProperties.Air * 100).toFixed(0)}%</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Info className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      <p className="italic text-gray-500 dark:text-gray-400">No enhanced sauce recommendations available.</p>
                    </div>
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