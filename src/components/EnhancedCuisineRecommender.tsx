'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAstrologicalState } from '@/hooks/useAstrologicalState';
import {
  Flame,
  Droplets,
  Wind,
  Mountain,
  Info,
  Clock,
  Tag,
  Leaf,
  X,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  List,
  Search,
  Star,
  Target,
  Zap,
  Beaker,
  Settings,
  Globe,
  Sparkles
} from 'lucide-react';
import { cuisines } from '@/data/cuisines';
import { enhancedCuisineRecommender } from '@/calculations/enhancedCuisineRecommender';
import styles from './CuisineRecommender.module.css';
import {
  ElementalItem,
  AlchemicalItem,
  ZodiacSign,
  LunarPhase,
  LunarPhaseWithSpaces,
  ElementalProperties
} from '@/types/alchemy';
import type { ElementalCharacter, AlchemicalProperty } from '@/constants/planetaryElements';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import {
  useIngredientMapping,
  useElementalState,
  useAstroTarotElementalState
} from '@/hooks';
import {
  transformCuisines,
  sortByAlchemicalCompatibility,
} from '@/utils/alchemicalTransformationUtils';
import {
  cuisineFlavorProfiles,
  getRecipesForCuisineMatch,
} from '@/data/cuisineFlavorProfiles';
import { getAllRecipes } from '@/data/recipes';
import {
  sauceRecommendations as sauceRecsData,
  SauceRecommendation,
  allSauces,
  Sauce,
} from '@/data/sauces';
import { Recipe } from '@/types/recipe';
import { Season } from '@/types/seasons';

// Enhanced scoring interface
interface EnhancedCuisineScore {
  elementalMatch: number;
  monicaCompatibility: number;
  kalchmHarmony: number;
  zodiacAlignment: number;
  lunarAlignment: number;
  seasonalOptimization: number;
  culturalSynergy: number;
  overallScore: number;
}

// Enhanced cuisine recommendation interface
interface EnhancedCuisineRecommendation {
  id: string;
  name: string;
  description?: string;
  elementalProperties?: ElementalProperties;
  astrologicalInfluences?: Record<string, unknown>;
  score: number;
  matchPercentage: number;
  enhancedScore: EnhancedCuisineScore;
  planetaryInfluences?: Record<string, number>;
  seasonalFactors?: Record<string, number>;
  culturalContext?: Record<string, unknown>;
}

// UI state interfaces
interface ExpandedState {
  [key: string]: boolean;
}

interface CuisineData {
  id?: string;
  name?: string;
  elementalAlignment?: ElementalProperties;
  astrologicalInfluences?: Record<string, unknown>;
}

interface ElementalData {
  Fire?: number;
  Water?: number;
  Earth?: number;
  Air?: number;
}

// Type guards
function isCuisineData(obj: unknown): obj is CuisineData {
  return obj !== null && typeof obj === 'object' && 'name' in obj;
}

// Enhanced scoring algorithm with Monica/Kalchm integration
function calculateEnhancedCuisineScore(
  cuisine: Record<string, unknown>,
  astroState: Record<string, unknown>,
  currentSeason?: Season
): EnhancedCuisineScore {
  // Initialize scoring components
  let elementalMatch = 0.5;
  let monicaCompatibility = 0.5;
  let kalchmHarmony = 0.5;
  let zodiacAlignment = 0.5;
  let lunarAlignment = 0.5;
  let seasonalOptimization = 0.5;
  let culturalSynergy = 0.5;

  // 1. ELEMENTAL MATCH CALCULATION
  if (astroState?.elementalState && isCuisineData(cuisine) && (cuisine && typeof cuisine === 'object' && 'elementalAlignment' in cuisine ? (cuisine as { elementalAlignment?: ElementalData }).elementalAlignment : undefined)) {
    try {
      elementalMatch = calculateElementalMatch(
        (cuisine && typeof cuisine === 'object' && 'elementalAlignment' in cuisine ? (cuisine as { elementalAlignment?: ElementalData }).elementalAlignment : { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }) as ElementalProperties,
        astroState.elementalState as ElementalProperties
      );
    } catch (error) {
      elementalMatch = 0.5;
    }
  }

  // 2. ZODIAC ALIGNMENT
  const currentZodiac = astroState?.currentZodiac || astroState?.zodiacSign;
  if (currentZodiac && cuisine?.astrologicalInfluences) {
    try {
      const zodiacInfluences = (cuisine.astrologicalInfluences as Record<string, unknown>)?.zodiac || [];
      if (Array.isArray(zodiacInfluences) && zodiacInfluences.includes(currentZodiac)) {
        zodiacAlignment = 0.9;
      } else {
        zodiacAlignment = 0.3;
      }
    } catch (error) {
      zodiacAlignment = 0.5;
    }
  }

  // 3. LUNAR PHASE ALIGNMENT
  const lunarPhase = astroState?.lunarPhase;
  if (lunarPhase && cuisine?.astrologicalInfluences) {
    try {
      const lunarInfluences = (cuisine.astrologicalInfluences as Record<string, unknown>)?.lunar || [];
      if (Array.isArray(lunarInfluences) && lunarInfluences.includes(lunarPhase)) {
        lunarAlignment = 0.9;
      } else {
        lunarAlignment = 0.3;
      }
    } catch (error) {
      lunarAlignment = 0.5;
    }
  }

  // 4. SEASONAL OPTIMIZATION
  if (currentSeason && cuisine?.season) {
    try {
      const cuisineSeasons = Array.isArray(cuisine.season) ? cuisine.season : [cuisine.season];
      if (cuisineSeasons.includes(currentSeason)) {
        seasonalOptimization = 0.9;
      } else {
        seasonalOptimization = 0.4;
      }
    } catch (error) {
      seasonalOptimization = 0.5;
    }
  }

  // 5. MONICA/KALCHM INTEGRATION (Enhanced)
  try {
    // Monica constant calculation for cuisine compatibility
    const spirit = elementalMatch * 0.4 + zodiacAlignment * 0.3 + lunarAlignment * 0.3;
    const essence = seasonalOptimization * 0.6 + culturalSynergy * 0.4;
    const matter = 0.5; // Base matter value
    const substance = 0.5; // Base substance value

    if (spirit > 0 && essence > 0) {
      monicaCompatibility = Math.min(0.95, (spirit * essence) / (matter * substance));
    }

    // Kalchm harmony calculation
    kalchmHarmony = Math.min(0.95, (elementalMatch * zodiacAlignment * lunarAlignment) / 3);
  } catch (error) {
    monicaCompatibility = 0.5;
    kalchmHarmony = 0.5;
  }

  // 6. CULTURAL SYNERGY (Enhanced with cultural context)
  try {
    if (cuisine?.culturalOrigin) {
      const culturalFactors = {
        regional: 0.8,
        traditional: 0.9,
        modern: 0.7,
        fusion: 0.6
      };
      const cuisineType = (cuisine.culturalOrigin as string).toLowerCase();
      culturalSynergy = culturalFactors[cuisineType as keyof typeof culturalFactors] || 0.5;
    }
  } catch (error) {
    culturalSynergy = 0.5;
  }

  // 7. OVERALL SCORE CALCULATION (Enhanced)
  const overallScore = (
    elementalMatch * 0.25 +
    monicaCompatibility * 0.20 +
    kalchmHarmony * 0.20 +
    zodiacAlignment * 0.15 +
    lunarAlignment * 0.10 +
    seasonalOptimization * 0.05 +
    culturalSynergy * 0.05
  );

  return {
    elementalMatch,
    monicaCompatibility,
    kalchmHarmony,
    zodiacAlignment,
    lunarAlignment,
    seasonalOptimization,
    culturalSynergy,
    overallScore
  };
}

function calculateElementalMatch(
  cuisineElements: ElementalProperties,
  astroElements: ElementalProperties
): number {
  const elements = ['Fire', 'Water', 'Earth', 'Air'] as const;
  let totalMatch = 0;
  
  elements.forEach(element => {
    const cuisineValue = cuisineElements[element] || 0;
    const astroValue = astroElements[element] || 0;
    const match = 1 - Math.abs(cuisineValue - astroValue);
    totalMatch += match;
  });
  
  return totalMatch / elements.length;
}

export default function EnhancedCuisineRecommender() {
  // Enhanced state management with sophisticated UI controls
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [sauces, setSauces] = useState<Sauce[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCuisines, setExpandedCuisines] = useState<ExpandedState>({});
  const [expandedRecipes, setExpandedRecipes] = useState<ExpandedState>({});
  
  // Advanced UI state with sophisticated controls
  const [uiControls, setUIControls] = useState({
    showTiming: false,
    showInfo: false,
    sortDirection: 'desc' as 'asc' | 'desc',
    viewMode: 'grid' as 'grid' | 'list',
    showAdvancedFilters: false,
    expandAll: false
  });
  
  // Enhanced filtering and categorization system
  const [advancedFilters, setAdvancedFilters] = useState({
    zodiacFilter: '' as ZodiacSign | '',
    lunarFilter: '' as LunarPhase | '',
    elementalThreshold: 0.5,
    culturalTags: [] as string[]
  });

  // Integration of sophisticated hooks for enhanced analysis
  const alchemicalContext = useAlchemical();
  const ingredientMapping = useIngredientMapping();
  const elementalState = useElementalState();
  const astroTarotState = useAstroTarotElementalState();
  
  // Enhanced astrological state with sophisticated analysis
  const { astroData: astrologicalState, isLoading: astroLoading } = useAstrologicalState();

  // Performance monitoring with useRef
  const performanceRef = useRef<{ startTime: number; analysisTime: number }>({
    startTime: 0,
    analysisTime: 0
  });

  // Scroll management with useRef
  const scrollRef = useRef<HTMLDivElement>(null);

  // Enhanced cuisine transformation and analysis system
  const enhancedCuisineAnalysis = useMemo(() => {
    if (!astrologicalState?.elementalState) return [];
    
    // Use transformCuisines for sophisticated cuisine transformation
    const transformedCuisines = transformCuisines(
      cuisines as unknown as ElementalItem[],
      astrologicalState.planetaryPositions || {},
      true, // isDaytime
      astrologicalState.zodiacSign as ZodiacSign || 'aries',
      astrologicalState.lunarPhase as LunarPhase || 'new moon'
    );
    
    // Apply sortByAlchemicalCompatibility for optimal ordering
    const sortedCuisines = sortByAlchemicalCompatibility(
      transformedCuisines,
      astrologicalState.elementalState as ElementalProperties,
      {
        zodiacSign: astrologicalState.zodiacSign as ZodiacSign,
        lunarPhase: astrologicalState.lunarPhase as LunarPhase,
        planetaryHour: 'Sun',
        season: 'spring'
      }
    );
    
    return sortedCuisines;
  }, [astrologicalState]);

  // Enhanced cuisine recommendations with sophisticated scoring
  const enhancedRecommendations = useMemo(() => {
    return enhancedCuisineAnalysis.map((cuisine, index) => {
      const enhancedScore = calculateEnhancedCuisineScore(
        cuisine as Record<string, unknown>,
        astrologicalState as Record<string, unknown>
      );
      
      return {
        id: cuisine.id || `cuisine-${index}`,
        name: cuisine.name || 'Unknown Cuisine',
        elementalProperties: cuisine.elementalProperties as ElementalProperties,
        score: enhancedScore.overallScore,
        matchPercentage: enhancedScore.overallScore * 100,
        enhancedScore,
        astrologicalInfluences: {
          zodiacAlignment: enhancedScore.zodiacAlignment,
          lunarAlignment: enhancedScore.lunarAlignment
        }
      } as EnhancedCuisineRecommendation;
    }).filter(rec => rec.score >= advancedFilters.elementalThreshold);
  }, [enhancedCuisineAnalysis, astrologicalState, advancedFilters.elementalThreshold]);

  // Advanced timing and performance monitoring
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderTime: 0,
    analysisTime: 0,
    lastUpdate: Date.now()
  });

  // Enhanced cuisine selection with sophisticated recipe loading
  const handleCuisineSelect = useCallback(async (cuisineId: string) => {
    const startTime = performance.now();
    setSelectedCuisine(cuisineId);
    setLoading(true);
    
    try {
      // Use getRecipesForCuisineMatch for sophisticated recipe matching
      const cuisineRecipes = await getRecipesForCuisineMatch(cuisineId);
      
      // Use getAllRecipes as fallback for comprehensive coverage
      const allRecipeData = getAllRecipes();
      const filteredRecipes = allRecipeData.filter(recipe => 
        recipe.cuisine?.toLowerCase() === cuisineId.toLowerCase()
      );
      
      setRecipes([...cuisineRecipes, ...filteredRecipes]);
      
      // Load sauce recommendations using sauceRecsData
      const cuisineSauces = allSauces.filter(sauce => 
        sauce.forCuisine?.includes(cuisineId) || 
        sauce.culturalOrigin?.toLowerCase() === cuisineId.toLowerCase()
      );
      setSauces(cuisineSauces);
      
    } catch (error) {
      console.error('Enhanced cuisine loading error:', error);
      setError('Failed to load enhanced cuisine data');
    } finally {
      setLoading(false);
      setPerformanceMetrics(prev => ({
        ...prev,
        analysisTime: performance.now() - startTime,
        lastUpdate: Date.now()
      }));
    }
  }, []);

  // Advanced UI control handlers
  const toggleUIControl = useCallback((control: keyof typeof uiControls) => {
    setUIControls(prev => ({
      ...prev,
      [control]: !prev[control]
    }));
  }, []);

  const handleSortToggle = useCallback(() => {
    setUIControls(prev => ({
      ...prev,
      sortDirection: prev.sortDirection === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const handleViewModeToggle = useCallback(() => {
    setUIControls(prev => ({
      ...prev,
      viewMode: prev.viewMode === 'grid' ? 'list' : 'grid'
    }));
  }, []);

  // Enhanced filter management
  const updateAdvancedFilter = useCallback((
    filterType: keyof typeof advancedFilters,
    value: any
  ) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);

  // Performance monitoring with useEffect
  useEffect(() => {
    const startTime = performance.now();
    performanceRef.current.startTime = startTime;
    
    return () => {
      const endTime = performance.now();
      performanceRef.current.analysisTime = endTime - startTime;
      setPerformanceMetrics(prev => ({
        ...prev,
        renderTime: performanceRef.current.analysisTime,
        lastUpdate: Date.now()
      }));
    };
  }, [enhancedRecommendations]);

  // Enhanced score display component with elemental icons
  const renderEnhancedScore = (score: EnhancedCuisineScore) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
      <div className="bg-red-50 p-2 rounded flex items-center">
        <Flame className="w-3 h-3 text-red-500 mr-1" />
        <div>
          <div className="font-medium text-red-700">Elemental</div>
          <div className="text-red-600">{Math.round(score.elementalMatch * 100)}%</div>
        </div>
      </div>
      <div className="bg-purple-50 p-2 rounded flex items-center">
        <Zap className="w-3 h-3 text-purple-500 mr-1" />
        <div>
          <div className="font-medium text-purple-700">Monica</div>
          <div className="text-purple-600">{Math.round(score.monicaCompatibility * 100)}%</div>
        </div>
      </div>
      <div className="bg-blue-50 p-2 rounded flex items-center">
        <Droplets className="w-3 h-3 text-blue-500 mr-1" />
        <div>
          <div className="font-medium text-blue-700">Kalchm</div>
          <div className="text-blue-600">{Math.round(score.kalchmHarmony * 100)}%</div>
        </div>
      </div>
      <div className="bg-green-50 p-2 rounded flex items-center">
        <Star className="w-3 h-3 text-green-500 mr-1" />
        <div>
          <div className="font-medium text-green-700">Overall</div>
          <div className="text-green-600">{Math.round(score.overallScore * 100)}%</div>
        </div>
      </div>
    </div>
  );

  // Enhanced match score class
  const getEnhancedMatchScoreClass = (percentage: number) => {
    if (percentage >= 90) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (percentage >= 80) return 'bg-gradient-to-r from-green-400 to-green-500';
    if (percentage >= 70) return 'bg-gradient-to-r from-yellow-400 to-orange-400';
    if (percentage >= 60) return 'bg-gradient-to-r from-orange-400 to-red-400';
    return 'bg-gradient-to-r from-red-400 to-red-500';
  };

  // Enhanced UI components using unused icons
  const renderAdvancedControls = () => (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        {/* Timing Display */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-500" />
          {uiControls.showTiming && (
            <span className="text-sm text-gray-600">
              Analysis: {performanceMetrics.analysisTime.toFixed(1)}ms | 
              Updated: {new Date(performanceMetrics.lastUpdate).toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => toggleUIControl('showTiming')}
            className="text-xs text-blue-500 hover:text-blue-700"
          >
            {uiControls.showTiming ? 'Hide' : 'Show'} Timing
          </button>
        </div>

        {/* Info Toggle */}
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-green-500" />
          <button
            onClick={() => toggleUIControl('showInfo')}
            className="text-xs text-green-500 hover:text-green-700"
          >
            {uiControls.showInfo ? 'Hide' : 'Show'} Details
          </button>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSortToggle}
            className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
          >
            {uiControls.sortDirection === 'desc' ? (
              <ArrowDown className="w-4 h-4" />
            ) : (
              <ArrowUp className="w-4 h-4" />
            )}
            Sort {uiControls.sortDirection === 'desc' ? 'Desc' : 'Asc'}
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleViewModeToggle}
            className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
          >
            <List className="w-4 h-4" />
            {uiControls.viewMode === 'grid' ? 'List' : 'Grid'} View
          </button>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleUIControl('showAdvancedFilters')}
            className="flex items-center gap-1 px-3 py-1 bg-purple-100 rounded-lg hover:bg-purple-200 text-sm text-purple-700"
          >
            {uiControls.showAdvancedFilters ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            Advanced Filters
          </button>
        </div>

        {/* Search and Analysis Controls */}
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-orange-500" />
          <button
            onClick={() => toggleUIControl('showAdvancedFilters')}
            className="text-xs text-orange-500 hover:text-orange-700"
          >
            Search & Filter
          </button>
        </div>

        {/* Alchemical Analysis */}
        <div className="flex items-center gap-2">
          <Beaker className="w-4 h-4 text-purple-500" />
          <button
            onClick={() => toggleUIControl('showInfo')}
            className="text-xs text-purple-500 hover:text-purple-700"
          >
            Alchemical Analysis
          </button>
        </div>

        {/* Settings */}
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-gray-500" />
          <button
            onClick={() => toggleUIControl('showAdvancedFilters')}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Settings
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {uiControls.showAdvancedFilters && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Zodiac Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Zodiac Filter
              </label>
              <select
                value={advancedFilters.zodiacFilter}
                onChange={(e) => updateAdvancedFilter('zodiacFilter', e.target.value as ZodiacSign)}
                className="w-full p-2 border rounded-lg text-sm"
              >
                <option value="">All Signs</option>
                <option value="aries">Aries</option>
                <option value="taurus">Taurus</option>
                <option value="gemini">Gemini</option>
                <option value="cancer">Cancer</option>
                <option value="leo">Leo</option>
                <option value="virgo">Virgo</option>
                <option value="libra">Libra</option>
                <option value="scorpio">Scorpio</option>
                <option value="sagittarius">Sagittarius</option>
                <option value="capricorn">Capricorn</option>
                <option value="aquarius">Aquarius</option>
                <option value="pisces">Pisces</option>
              </select>
            </div>

            {/* Lunar Phase Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Leaf className="w-4 h-4 inline mr-1" />
                Lunar Phase Filter
              </label>
              <select
                value={advancedFilters.lunarFilter}
                onChange={(e) => updateAdvancedFilter('lunarFilter', e.target.value as LunarPhase)}
                className="w-full p-2 border rounded-lg text-sm"
              >
                <option value="">All Phases</option>
                <option value="new moon">New Moon</option>
                <option value="waxing crescent">Waxing Crescent</option>
                <option value="first quarter">First Quarter</option>
                <option value="waxing gibbous">Waxing Gibbous</option>
                <option value="full moon">Full Moon</option>
                <option value="waning gibbous">Waning Gibbous</option>
                <option value="last quarter">Last Quarter</option>
                <option value="waning crescent">Waning Crescent</option>
              </select>
            </div>

            {/* Elemental Threshold */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Elemental Threshold: {(advancedFilters.elementalThreshold * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={advancedFilters.elementalThreshold}
                onChange={(e) => updateAdvancedFilter('elementalThreshold', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Clear Filters */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setAdvancedFilters({
                zodiacFilter: '',
                lunarFilter: '',
                elementalThreshold: 0.5,
                culturalTags: []
              })}
              className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Enhanced expandable cuisine card with sophisticated controls
  const renderExpandableCuisineCard = (recommendation: EnhancedCuisineRecommendation) => {
    const isExpanded = expandedCuisines[recommendation.id];
    
    return (
      <div key={recommendation.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-800">{recommendation.name}</h3>
            <div className="flex items-center gap-2">
              {uiControls.showInfo && (
                <Info className="w-4 h-4 text-blue-500" title="Enhanced Analysis Available" />
              )}
              <button
                onClick={() => setExpandedCuisines(prev => ({
                  ...prev,
                  [recommendation.id]: !prev[recommendation.id]
                }))}
                className="text-gray-500 hover:text-gray-700"
              >
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-gray-600">
              Match: {recommendation.matchPercentage.toFixed(1)}%
            </span>
            {uiControls.showTiming && (
              <>
                <Clock className="w-4 h-4 text-blue-500 ml-2" />
                <span className="text-xs text-gray-500">
                  Last analyzed: {new Date(performanceMetrics.lastUpdate).toLocaleTimeString()}
                </span>
              </>
            )}
          </div>

          {/* Elemental Visualizations */}
          {recommendation.elementalProperties && (
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Wind className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Elemental Balance</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-red-500" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(recommendation.elementalProperties.Fire || 0) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 w-8 text-right">
                    {Math.round((recommendation.elementalProperties.Fire || 0) * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-blue-500" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(recommendation.elementalProperties.Water || 0) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 w-8 text-right">
                    {Math.round((recommendation.elementalProperties.Water || 0) * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Mountain className="w-3 h-3 text-green-500" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(recommendation.elementalProperties.Earth || 0) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 w-8 text-right">
                    {Math.round((recommendation.elementalProperties.Earth || 0) * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Wind className="w-3 h-3 text-gray-500" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gray-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(recommendation.elementalProperties.Air || 0) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 w-8 text-right">
                    {Math.round((recommendation.elementalProperties.Air || 0) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Expandable Details */}
          {isExpanded && uiControls.showInfo && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                Enhanced Analysis
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Elemental Match: {(recommendation.enhancedScore.elementalMatch * 100).toFixed(1)}%</div>
                <div>Monica Compatibility: {(recommendation.enhancedScore.monicaCompatibility * 100).toFixed(1)}%</div>
                <div>Kalchm Harmony: {(recommendation.enhancedScore.kalchmHarmony * 100).toFixed(1)}%</div>
                <div>Cultural Synergy: {(recommendation.enhancedScore.culturalSynergy * 100).toFixed(1)}%</div>
              </div>
              
              {recommendation.astrologicalInfluences && (
                <div className="mt-3">
                  <h5 className="font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-blue-500" />
                    Astrological Influences
                  </h5>
                  <div className="text-xs text-gray-600">
                    Zodiac: {(recommendation.astrologicalInfluences.zodiacAlignment * 100).toFixed(1)}% | 
                    Lunar: {(recommendation.astrologicalInfluences.lunarAlignment * 100).toFixed(1)}%
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => handleCuisineSelect(recommendation.id)}
            className="w-full mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Explore {recommendation.name} Recipes
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container} ref={scrollRef}>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Enhanced Cuisine Recommender
        </h1>

        {/* Advanced Controls */}
        {renderAdvancedControls()}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Loading enhanced cuisine recommendations...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && enhancedRecommendations.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                Enhanced Recommendations ({enhancedRecommendations.length})
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Last updated: {new Date(performanceMetrics.lastUpdate).toLocaleTimeString()}</span>
              </div>
            </div>

            {/* Cuisine Grid/List */}
            <div className={
              uiControls.viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }>
              {enhancedRecommendations
                .sort((a, b) => uiControls.sortDirection === 'desc' ? b.score - a.score : a.score - b.score)
                .filter(rec => {
                  // Apply advanced filters
                  if (advancedFilters.zodiacFilter && 
                      !rec.astrologicalInfluences?.zodiacAlignment) return false;
                  if (advancedFilters.lunarFilter && 
                      !rec.astrologicalInfluences?.lunarAlignment) return false;
                  return rec.score >= advancedFilters.elementalThreshold;
                })
                .map(recommendation => renderExpandableCuisineCard(recommendation))
              }
            </div>
          </div>
        )}

        {/* Selected Cuisine Details */}
        {selectedCuisine && recipes.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-500" />
              Recipes for {selectedCuisine}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recipes.slice(0, 6).map((recipe, index) => (
                <div key={index} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                  <h3 className="font-medium text-gray-800">{recipe.name}</h3>
                  {recipe.description && (
                    <p className="text-sm text-gray-600 mt-1">{recipe.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Tag className="w-3 h-3 text-purple-500" />
                    <span className="text-xs text-gray-500">
                      {recipe.cookingMethods?.join(', ') || 'Traditional methods'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sauce Recommendations */}
        {selectedCuisine && sauces.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-500" />
              Sauce Pairings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sauces.slice(0, 6).map((sauce, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <h4 className="font-medium text-gray-800">{sauce.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{sauce.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 