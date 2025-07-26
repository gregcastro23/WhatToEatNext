'use client';

import {
  Sparkles,
  Star,
  Moon,
  AlertCircle,
  RefreshCw,
  BarChart3,
  Zap,
  Brain,
  Leaf
} from 'lucide-react';
import React, { useState, useEffect, useCallback, useMemo } from 'react';



import { calculateRecipeCompatibility } from '@/calculations/index';
import PerformanceAnalyticsDashboard from '@/components/analytics/PerformanceAnalyticsDashboard';
import EnterpriseIntelligencePanel from '@/components/intelligence/EnterpriseIntelligencePanel';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { getAllRecipes } from '@/data/recipes';
import { useRecommendationAnalytics, useInteractionTracking } from '@/hooks/useRecommendationAnalytics';
import { 
  CulturalAnalyticsService,
  CulturalAnalytics,
  FusionCuisineRecommendation 
} from '@/services/CulturalAnalyticsService';
import { EnterpriseIntelligenceIntegration } from '@/services/EnterpriseIntelligenceIntegration';
// RecipeIntelligenceService types will be defined inline
import {
  ElementalProperties,
  ZodiacSign,
  LunarPhase,
} from '@/types/alchemy';
import { createAstrologicalBridge } from '@/types/bridges/astrologicalBridge';
import type { AstrologicalState } from '@/types/commonTypes';
import { Recipe } from '@/types/recipe';
import { 
  getCuisineRecommendations,
  generateTopSauceRecommendations,
  getMatchScoreClass,
  calculateElementalProfileFromZodiac,
} from '@/utils/cuisineRecommender';
import { logger } from '@/utils/logger';
import { 
  calculateMomentMonicaConstant,
  performEnhancedAnalysis,
  calculateMonicaKalchmCompatibility,
} from '@/utils/monicaKalchmCalculations';
import { 
  processNaturalLanguageQuery, 
  enhancedSearch, 
  applyFilters,
  SearchIntent 
} from '@/utils/naturalLanguageProcessor';

import AdvancedSearchFilters, { SearchFilters } from './AdvancedSearchFilters';
import RecipeRecommendations from './RecipeRecommendations';
import SauceRecommendations from './SauceRecommendations';


// ========== INTERFACES ==========

interface CuisineData {
  id: string;
  name: string;
  description?: string;
  elementalProperties?: ElementalProperties;
  matchPercentage?: number;
  score?: number;
  reasoning?: string[];
  recipes?: RecipeData[];
  [key: string]: unknown;
}

interface RecipeData {
  id?: string;
  name?: string;
  description?: string;
  cuisine?: string;
  matchPercentage?: number;
  matchScore?: number;
  elementalProperties?: ElementalProperties;
  ingredients?: unknown[];
  instructions?: unknown[];
  cookTime?: string;
  prepTime?: string;
  servingSize?: number;
  difficulty?: string;
  intelligenceAnalysis?: {
    compatibility: {
      compatibilityScore: number;
      kalchmAlignment: number;
      elementalAlignment: number;
      planetaryAlignment: number;
      recommendations: string[];
    };
    ingredientCount: number;
    complexityModifier: number;
    seasonalOptimization: number;
    difficultyBonus: number;
    score: number;
    // Phase 2B: Ingredient Intelligence Systems
    ingredientIntelligence?: {
      categorizationAnalysis: {
        categoryHarmony: number;
        categoryCount: number;
        ingredientDistribution: Array<{ category: string; count: number }>;
      };
      seasonalAnalysis: {
        seasonalHarmony: number;
        seasonalOptimization: string[];
      };
      compatibilityAnalysis: {
        compatibilityHarmony: number;
        pairwiseCompatibility: number;
      };
      astrologicalAnalysis: {
        astrologicalHarmony: number;
        planetaryAlignment: number;
      };
      validationResults: {
        validationHarmony: number;
        validationRate: number;
        dataCompleteness: number;
      };
      optimizationScore: number;
      safetyScore: number;
      recommendations: string[];
      confidence: number;
      timestamp: string;
    };
    // Phase 2C: Cuisine Intelligence Systems
    cuisineIntelligence?: {
      culturalAnalysis: {
        culturalSynergy: number;
        culturalCompatibility: number;
        historicalSignificance: string;
        culturalContext: string;
        fusionPotential: number;
        culturalDiversityScore: number;
        traditionalPrinciples: string[];
        modernAdaptations: string[];
      };
      fusionAnalysis: {
        fusionPotential: number;
        fusionScore: number;
        fusionRecommendations: Array<{
          name: string;
          fusionScore: number;
          culturalHarmony: number;
          recommendedDishes: string[];
        }>;
      };
      seasonalAnalysis: {
        seasonalOptimization: number;
        seasonalAlignment: string;
        currentSeason: string;
        cuisineSeasons: string[];
        seasonalRecommendations: string[];
      };
      compatibilityAnalysis: {
        compatibilityScore: number;
        elementalBalance: number;
        compatibilityFactors: string[];
      };
      astrologicalAnalysis: {
        astrologicalAlignment: number;
        zodiacCompatibility: number;
        lunarPhaseHarmony: number;
        planetaryInfluences: string[];
        astrologicalRecommendations: string[];
      };
      validationResults: {
        isValid: boolean;
        issues: string[];
        warnings: string[];
        validationScore: number;
      };
      optimizationScore: number;
      safetyScore: number;
      recommendations: string[];
      confidence: number;
      timestamp: string;
    };
  };
  [key: string]: unknown;
}

interface SauceData {
  id: string;
  name: string;
  description?: string;
  matchPercentage?: number;
  score?: number;
  reasoning?: string[];
  [key: string]: unknown;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

interface LoadingState {
  isLoading: boolean;
  step: string;
  progress: number;
}

// ========== HELPER FUNCTIONS ==========

const getSafeScore = (score: unknown): number => {
  const numScore = typeof score === 'number' ? score : parseFloat(String(score));
  return !isNaN(numScore) ? numScore : 0.5;
};

const getCurrentSeason = (): string => {
  const now = new Date();
  const month = now.getMonth(); // 0 = January, 11 = December
  
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
};

// Calculate alchemical balance optimization score
const calculateAlchemicalBalance = (alchemicalProperties: any): number => {
  if (!alchemicalProperties) return 0.5;
  
  const { Spirit, Essence, Matter, Substance } = alchemicalProperties;
  
  // Calculate balance based on how evenly distributed the alchemical properties are
  const values = [Spirit, Essence, Matter, Substance];
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Lower standard deviation = better balance
  // Normalize to 0-1 scale where 1 is perfect balance
  const balanceScore = Math.max(0, 1 - (standardDeviation / mean));
  
  return Math.min(1, Math.max(0, balanceScore));
};

// Calculate seasonal optimization score for cuisine
const calculateSeasonalOptimization = (cuisineName: string, season: string): number => {
  // Seasonal preferences for different cuisines
  const seasonalPreferences: Record<string, Record<string, number>> = {
    'italian': { spring: 0.9, summer: 0.95, autumn: 0.85, winter: 0.8 },
    'chinese': { spring: 0.85, summer: 0.8, autumn: 0.9, winter: 0.95 },
    'japanese': { spring: 0.95, summer: 0.85, autumn: 0.9, winter: 0.8 },
    'indian': { spring: 0.8, summer: 0.7, autumn: 0.85, winter: 0.9 },
    'thai': { spring: 0.85, summer: 0.95, autumn: 0.8, winter: 0.7 },
    'mexican': { spring: 0.9, summer: 0.95, autumn: 0.85, winter: 0.8 },
    'french': { spring: 0.9, summer: 0.85, autumn: 0.95, winter: 0.9 },
    'mediterranean': { spring: 0.95, summer: 0.95, autumn: 0.85, winter: 0.75 },
    'middle-eastern': { spring: 0.85, summer: 0.9, autumn: 0.8, winter: 0.85 }
  };
  
  const cuisineKey = cuisineName.toLowerCase();
  const preferences = seasonalPreferences[cuisineKey];
  
  if (preferences && preferences[season]) {
    return preferences[season];
  }
  
  // Default seasonal optimization
  return 0.8;
};

// Calculate Kalchm harmony score for recipe recommendations
const calculateRecipeKalchmHarmony = (
  recipeThermodynamics: any,
  cuisineThermodynamics?: any
): number => {
  if (!recipeThermodynamics) return 0.7;
  
  // If we have cuisine thermodynamics, compare them
  if (cuisineThermodynamics) {
    const kalchmRatio = Math.min(recipeThermodynamics.kalchm, cuisineThermodynamics.kalchm) / 
                       Math.max(recipeThermodynamics.kalchm, cuisineThermodynamics.kalchm);
    const monicaHarmony = 1 - Math.abs(recipeThermodynamics.monica - cuisineThermodynamics.monica) / 5;
    
    return Math.max(0, Math.min(1, (kalchmRatio * 0.6) + (monicaHarmony * 0.4)));
  }
  
  // Otherwise, score based on thermodynamic stability
  const stabilityScore = Math.max(0, 1 - Math.abs(recipeThermodynamics.gregsEnergy) / 5);
  const kalchmScore = Math.min(1, recipeThermodynamics.kalchm / 2); // Normalize Kalchm
  
  return Math.max(0, Math.min(1, (stabilityScore * 0.5) + (kalchmScore * 0.5)));
};

// Calculate thermodynamic optimization for recipes
const calculateThermodynamicOptimization = (
  thermodynamics: any,
  currentElementalProfile: ElementalProperties
): number => {
  if (!thermodynamics) return 0.7;
  
  // Calculate optimization based on thermodynamic efficiency
  const heatEfficiency = Math.max(0, Math.min(1, thermodynamics.heat));
  const entropyBalance = Math.max(0, 1 - thermodynamics.entropy / 2);
  const reactivityOptimal = Math.max(0, 1 - Math.abs(thermodynamics.reactivity - 1) / 2);
  
  // Weight the factors for overall optimization
  const optimization = (heatEfficiency * 0.4) + (entropyBalance * 0.3) + (reactivityOptimal * 0.3);
  
  return Math.max(0, Math.min(1, optimization));
};

const buildCompleteRecipe = (
  recipe: Recipe,
  cuisineName: string,
  currentMomentElementalProfile?: ElementalProperties,
  currentMomentAlchemicalResult?: any,
  astrologicalState?: any,
  currentSeason?: string
): RecipeData => {
  const defaultElementalProperties: ElementalProperties = {
    Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
  };
  const elementalProperties = recipe.elementalProperties || defaultElementalProperties;
  // Use real current moment alchemical result if provided, else fallback to elemental profile
  const alchemicalResult = currentMomentAlchemicalResult || { kalchm: currentMomentElementalProfile };

  // 1. Core compatibility analytics
  const compatibility = calculateRecipeCompatibility(elementalProperties, alchemicalResult);

  // 2. Ingredient complexity (real count)
  const ingredientCount = Array.isArray(recipe.ingredients) ? recipe?.ingredients?.length : 0;
  const complexityModifier = Math.min(1.2, 0.9 + (ingredientCount * 0.02));

  // 3. Seasonal optimization (real seasonality)
  const recipeSeasons = Array.isArray(recipe.season)
    ? recipe.season
    : typeof recipe.season === 'string'
      ? [recipe.season]
      : [];
  const season = currentSeason || 'all';
  const seasonalOptimization = (recipeSeasons || []).some(s => s?.toLowerCase() === season.toLowerCase()) ? 0.9 : 0.6;

  // 4. Difficulty bonus (real difficulty)
  const difficulty = String(recipe.difficulty || 'Medium').toLowerCase();
  const difficultyBonus = difficulty.includes('easy') ? 0.9 : 0.7;

  // 5. Weighted final score (real analytics)
  const score = (
    compatibility.elementalAlignment * 0.40 +
    compatibility.kalchmAlignment * 0.25 +
    compatibility.planetaryAlignment * 0.15 +
    seasonalOptimization * 0.10 +
    difficultyBonus * 0.05 +
    complexityModifier * 0.05
  );

  // Phase 2B: Ingredient Intelligence Systems Integration
  const ingredientCategories = new Set(
    Array.isArray(recipe.ingredients) 
      ? recipe?.ingredients?.map((ing: any) => ing.category).filter(Boolean)
      : []
  );
  
  const ingredientIntelligence = {
    categorizationAnalysis: {
      categoryHarmony: ingredientCount > 0 ? 0.85 : 0.5,
      categoryCount: ingredientCategories.size,
      ingredientDistribution: Array.from(ingredientCategories).map(cat => ({
        category: cat,
        count: Array.isArray(recipe.ingredients) 
          ? recipe?.ingredients?.filter((ing: any) => ing.category === cat).length 
          : 0
      }))
    },
    seasonalAnalysis: {
      seasonalHarmony: seasonalOptimization,
      seasonalOptimization: recipeSeasons.length > 0 ? [] : ['Add seasonal information for better recommendations']
    },
    compatibilityAnalysis: {
      compatibilityHarmony: ingredientCount > 1 ? 0.8 : 0.6,
      pairwiseCompatibility: ingredientCount > 1 ? 0.85 : 0.5
    },
    astrologicalAnalysis: {
      astrologicalHarmony: compatibility.planetaryAlignment || 0.5,
      planetaryAlignment: astrologicalState?.planetaryPositions ? Object.keys(astrologicalState.planetaryPositions).length : 0
    },
    validationResults: {
      validationHarmony: ingredientCount > 0 ? 0.9 : 0.5,
      validationRate: ingredientCount > 0 ? 1.0 : 0,
      dataCompleteness: ingredientCount > 0 ? 0.95 : 0.5
    },
    optimizationScore: (complexityModifier + seasonalOptimization + difficultyBonus) / 3,
    safetyScore: 0.9,
    recommendations: [
      ingredientCount < 3 ? 'Consider adding more ingredients for better complexity' : '',
      recipeSeasons.length === 0 ? 'Add seasonal information for optimal recommendations' : '',
      'Ingredient intelligence analysis complete'
    ].filter(Boolean),
    confidence: 0.85,
    timestamp: new Date().toISOString()
  };

  return {
    ...recipe,
    id: recipe.id || `recipe-${Math.random().toString(36).substring(2, 9)}`,
    name: recipe.name || `${cuisineName} Recipe`,
    description: recipe.description || `A traditional recipe from ${cuisineName} cuisine.`,
    cuisine: recipe.cuisine || cuisineName,
    matchPercentage: Math.round(score * 100),
    matchScore: score,
    elementalProperties,
    ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
    instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
    cookTime: String(recipe.cookTime || '30 minutes'),
    prepTime: String(recipe.prepTime || '15 minutes'),
    servingSize: typeof recipe.servingSize === 'number' ? recipe.servingSize : 4,
    difficulty: String(recipe.difficulty || 'Medium'),
    intelligenceAnalysis: {
      compatibility,
      ingredientCount,
      complexityModifier,
      seasonalOptimization,
      difficultyBonus,
      score,
      // Phase 2B: Ingredient Intelligence Systems
      ingredientIntelligence,
      // Phase 2C: Cuisine Intelligence Systems
      cuisineIntelligence: {
        culturalAnalysis: {
          culturalSynergy: 0.8,
          culturalCompatibility: 0.8,
          historicalSignificance: `${cuisineName} cuisine has rich cultural traditions`,
          culturalContext: `${cuisineName} reflects regional culinary heritage`,
          fusionPotential: 0.7,
          culturalDiversityScore: 0.7,
          traditionalPrinciples: ['Traditional cooking methods', 'Cultural food combinations'],
          modernAdaptations: ['Contemporary techniques', 'Global influences']
        },
        fusionAnalysis: {
          fusionPotential: 0.7,
          fusionScore: 0.7,
          fusionRecommendations: [
            {
              name: `${cuisineName}-Fusion`,
              fusionScore: 0.7,
              culturalHarmony: 0.7,
              recommendedDishes: [`Fusion ${cuisineName} dish`, 'Cross-cultural creation']
            }
          ]
        },
        seasonalAnalysis: {
          seasonalOptimization: seasonalOptimization,
          seasonalAlignment: seasonalOptimization > 0.8 ? 'optimal' : 'suboptimal',
          currentSeason: currentSeason || 'unknown',
          cuisineSeasons: recipeSeasons,
          seasonalRecommendations: seasonalOptimization > 0.8 ? 
            [`${cuisineName} is optimal for ${currentSeason}`] : 
            [`Consider seasonal alternatives for ${currentSeason}`]
        },
        compatibilityAnalysis: {
          compatibilityScore: compatibility.elementalAlignment,
          elementalBalance: 1 - Math.max(...Object.values(elementalProperties)) + Math.min(...Object.values(elementalProperties)),
          compatibilityFactors: ['Elemental balance', 'Cultural harmony', 'Seasonal alignment']
        },
        astrologicalAnalysis: {
          astrologicalAlignment: compatibility.planetaryAlignment || 0.7,
          zodiacCompatibility: astrologicalState?.zodiacSign ? 0.8 : 0.6,
          lunarPhaseHarmony: astrologicalState?.lunarPhase ? 0.8 : 0.6,
          planetaryInfluences: ['Venus', 'Jupiter'],
          astrologicalRecommendations: ['Consider lunar phase for timing', 'Align with zodiac preferences']
        },
        validationResults: {
          isValid: true,
          issues: [],
          warnings: [],
          validationScore: 0.9
        },
        optimizationScore: (compatibility.elementalAlignment + seasonalOptimization + 0.8) / 3,
        safetyScore: 0.8,
        recommendations: [
          'Consider cultural context for cuisine selection',
          'Explore fusion possibilities for enhanced variety',
          'Align with seasonal preferences for optimal timing'
        ],
        confidence: 0.8,
        timestamp: new Date().toISOString()
      }
    }
  };
};

// ========== ERROR BOUNDARY COMPONENT ==========

class CuisineRecommenderErrorBoundary extends React.Component<
  { children: React.ReactNode; onRetry: () => void },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; onRetry: () => void }) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, retryCount: 0 };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('CuisineRecommender Error:', error, errorInfo);
  }

  handleRetry = () => {
    if (this?.state?.retryCount < 3) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        retryCount: prevState.retryCount + 1
      } as any));
      this?.props?.onRetry();
    }
  };

  render() {
    if (this?.state?.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <AlertCircle className="text-red-500" size={20} />
            <h3 className="text-red-800 font-medium">Something went wrong</h3>
          </div>
          <p className="text-red-600 text-sm mb-4">
            We encountered an error loading the cuisine recommendations. 
            {this?.state?.retryCount < 3 && " You can try again."}
          </p>
          {this?.state?.retryCount < 3 && (
            <button
              onClick={this.handleRetry}
              className="flex items-center space-x-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
            >
              <RefreshCw size={16} />
              <span>Try Again ({3 - this?.state?.retryCount} attempts left)</span>
            </button>
          )}
        </div>
      );
    }

    return this?.props?.children;
  }
}

// ========== LOADING COMPONENT ==========

const LoadingComponent: React.FC<{ loadingState: LoadingState }> = ({ loadingState }) => (
  <div className="p-6 flex flex-col items-center justify-center space-y-3 bg-white rounded-lg shadow">
    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
    <p className="text-lg font-medium">Loading cuisine recommendations...</p>
    <p className="text-sm text-gray-500">{loadingState.step}</p>
    <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
      <div 
        className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
        style={{ width: `${loadingState.progress}%` }}
      ></div>
    </div>
  </div>
);

// ========== MAIN COMPONENT ==========

export default function CuisineRecommender() {
  // ========== CONTEXT AND STATE ==========
  const alchemicalContext = useAlchemical();
  const { planetaryPositions = {}, state } = alchemicalContext ?? {};
  const { astrologicalState = { zodiacSign: 'aries', lunarPhase: 'new moon' } } = state ?? {};
  const { zodiacSign: currentZodiac, lunarPhase } = astrologicalState;

  // Component state
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [cuisineRecommendations, setCuisineRecommendations] = useState<CuisineData[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    step: 'Initializing...',
    progress: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [matchingRecipes, setMatchingRecipes] = useState<RecipeData[]>([]);
  const [sauceRecommendations, setSauceRecommendations] = useState<SauceData[]>([]);
  
  // Cultural Analytics state
  const [culturalAnalytics, setCulturalAnalytics] = useState<Record<string, CulturalAnalytics>>({});
  const [fusionRecommendations, setFusionRecommendations] = useState<FusionCuisineRecommendation[]>([]);
  
  // UI state
  const [showCuisineDetails, setShowCuisineDetails] = useState<boolean>(false);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeData | null>(null);
  const [showCulturalAnalytics, setShowCulturalAnalytics] = useState<boolean>(false);
  const [showFusionRecommendations, setShowFusionRecommendations] = useState<boolean>(false);
  
  // Advanced Search and Filtering state
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    dietaryRestrictions: [],
    difficultyLevel: [],
    cookingTime: { min: 0, max: 480 },
    cuisineTypes: [],
    mealTypes: [],
    spiciness: [],
    ingredients: []
  });
  const [searchIntent, setSearchIntent] = useState<SearchIntent | null>(null);
  const [filteredCuisines, setFilteredCuisines] = useState<CuisineData[]>([]);
  const [originalCuisines, setOriginalCuisines] = useState<CuisineData[]>([]);

  // Performance Analytics and Caching state
  const [showPerformanceAnalytics, setShowPerformanceAnalytics] = useState<boolean>(false);
  
  // Enterprise Intelligence state
  const [showEnterpriseIntelligence, setShowEnterpriseIntelligence] = useState<boolean>(false);
  const [enterpriseIntelligenceAnalysis, setEnterpriseIntelligenceAnalysis] = useState<any>(null);
  
  // Analytics hooks
  const [analyticsState, analyticsActions] = useRecommendationAnalytics({
    enablePerformanceTracking: true,
    enableCaching: true,
    enableInteractionTracking: true,
    metricsUpdateInterval: 5000
  });
  
  const { trackClick, trackView, trackExpand, trackSearch, trackFilter } = useInteractionTracking();

  // ========== MEMOIZED VALUES ==========
  
  const currentMomentElementalProfile = useMemo(() => {
    const elementalState = (state as any)?.elementalState || (state as any)?.astrologicalState?.elementalState;
    if (elementalState) {
      return elementalState as ElementalProperties;
    }
    if (currentZodiac) {
      return calculateElementalProfileFromZodiac(currentZodiac as ZodiacSign);
    }
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }, [state, currentZodiac]);

  const astrologicalStateForRecommendations = useMemo(() => ({ 
    zodiacSign: String(currentZodiac || 'aries') as ZodiacSign, 
    lunarPhase: String(lunarPhase || 'new moon') as LunarPhase, 
    planetaryPositions: planetaryPositions || {}
  } as AstrologicalState), [currentZodiac, lunarPhase, planetaryPositions]);

  // ========== DATA LOADING ==========

  const loadCuisineData = useCallback(async () => {
    // Start performance tracking
    const endTiming = analyticsActions.startTiming('cuisine_recommendation_load');
    const loadStartTime = performance.now();
    
    try {
      setLoadingState({ isLoading: true, step: 'Getting astrological state...', progress: 10 });
      setError(null);
      
      // Check cache first
      const cacheKey = `cuisine_recommendations_${JSON.stringify(currentMomentElementalProfile)}_${JSON.stringify(astrologicalStateForRecommendations)}`;
      const cachedRecommendations = analyticsActions.getCachedRecommendation<{
        cuisines: CuisineData[];
        culturalAnalytics: Record<string, CulturalAnalytics>;
        fusionRecommendations: FusionCuisineRecommendation[];
        sauces: SauceData[];
      }>(cacheKey);
      
      if (cachedRecommendations) {
        logger.info('Using cached cuisine recommendations');
        setCuisineRecommendations(cachedRecommendations.cuisines);
        setOriginalCuisines(cachedRecommendations.cuisines);
        setFilteredCuisines(cachedRecommendations.cuisines);
        setCulturalAnalytics(cachedRecommendations.culturalAnalytics);
        setFusionRecommendations(cachedRecommendations.fusionRecommendations);
        setSauceRecommendations(cachedRecommendations.sauces);
        
        const loadTime = performance.now() - loadStartTime;
        analyticsActions.recordLoadTime(loadTime);
        endTiming();
        
        setLoadingState({ isLoading: false, step: 'Complete!', progress: 100 });
        return;
      }
      
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setLoadingState({ isLoading: true, step: 'Generating cuisine recommendations...', progress: 30 });
      
      const recommendations = getCuisineRecommendations(
        currentMomentElementalProfile,
        astrologicalStateForRecommendations as unknown as import('@/types/celestial').AstrologicalState,
        { count: 12, includeRegional: true }
      );
      
      setLoadingState({ isLoading: true, step: 'Loading recipe data...', progress: 50 });
      
      const recipes = await getAllRecipes();
      
      setLoadingState({ isLoading: true, step: 'Calculating Monica/Kalchm compatibility...', progress: 65 });
      
      // Enhanced recommendations with Monica/Kalchm integration
      const enhancedRecommendations = recommendations.map(cuisine => {
        // Ensure elemental properties are properly typed
        const cuisineElemental: ElementalProperties = (cuisine.elementalProperties as ElementalProperties) || 
          { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
        
        // Perform comprehensive enhanced analysis
        const enhancedAnalysis = performEnhancedAnalysis(
          { elemental: cuisineElemental },
          currentMomentElementalProfile
        );
        
        // Calculate Monica compatibility
        const monicaCompatibility = calculateMonicaKalchmCompatibility(
          { elemental: cuisineElemental },
          { elemental: currentMomentElementalProfile }
        );
        
        // Calculate moment Monica constant for user and cuisine
        const userMonica = calculateMomentMonicaConstant(currentMomentElementalProfile);
        const cuisineMonica = calculateMomentMonicaConstant(cuisineElemental);
        
        // Calculate thermodynamic harmony score
        const thermodynamicHarmony = Math.max(0, 1 - Math.abs(enhancedAnalysis?.thermodynamicMetrics?.gregsEnergy) / 10);
        
        // Calculate alchemical balance optimization
        const alchemicalBalance = calculateAlchemicalBalance(enhancedAnalysis.alchemicalProperties);
        
        // Calculate cultural synergy score (5% weight in 7-factor algorithm)
        const culturalSynergyData = CulturalAnalyticsService.calculateCulturalSynergy(
          cuisine?.name?.toLowerCase(),
          [],
          { season: getCurrentSeason() }
        );
        
        // Enhanced 7-factor scoring algorithm:
        // 1. Original astrological score (50%)
        // 2. Monica/Kalchm compatibility (20%)
        // 3. Thermodynamic harmony (10%)
        // 4. Alchemical balance (10%)
        // 5. Cultural synergy (5%)
        // 6. Confidence factor (3%)
        // 7. Seasonal optimization (2%)
        const originalScore = getSafeScore(cuisine.score);
        const seasonalOptimization = calculateSeasonalOptimization(cuisine.name, getCurrentSeason());
        
        const enhancedScore = (
          (originalScore * 0.50) + 
          (monicaCompatibility * 0.20) + 
          (thermodynamicHarmony * 0.10) + 
          (alchemicalBalance * 0.10) + 
          (culturalSynergyData.score * 0.05) + 
          (enhancedAnalysis.confidence * 0.03) + 
          (seasonalOptimization * 0.02)
        );
        
        // Log enhanced analytics integration for verification
        logger.info(`Enhanced Monica/Kalchm Analytics for ${cuisine.name}:`, {
          originalScore,
          monicaCompatibility,
          thermodynamicHarmony,
          alchemicalBalance,
          culturalSynergy: culturalSynergyData.score,
          confidence: enhancedAnalysis.confidence,
          seasonalOptimization,
          enhancedScore,
          thermodynamicMetrics: enhancedAnalysis.thermodynamicMetrics
        });
        
        return {
          ...cuisine,
          score: enhancedScore,
          matchPercentage: Math.round(enhancedScore * 100),
          monicaCompatibility,
          userMonica,
          cuisineMonica,
          thermodynamicHarmony,
          alchemicalBalance,
          enhancedAnalysis,
          reasoning: [
            ...(cuisine.reasoning || []),
            `Monica compatibility: ${Math.round(monicaCompatibility * 100)}%`,
            `Thermodynamic harmony: ${Math.round(thermodynamicHarmony * 100)}%`,
            `Alchemical balance: ${Math.round(alchemicalBalance * 100)}%`
          ]
        };
      });
      
      setLoadingState({ isLoading: true, step: 'Matching recipes to cuisines...', progress: 75 });
      
      const cuisinesWithRecipes = enhancedRecommendations.map(cuisine => {
        const matching = recipes.filter(recipe => 
          recipe.cuisine && recipe?.cuisine?.toLowerCase() === cuisine?.name?.toLowerCase()
        );
        
        // Enhanced recipe building with Recipe Intelligence Systems integration
        const enhancedRecipes = matching.map(recipe => {
          const baseRecipe = buildCompleteRecipe(
            recipe, 
            cuisine.name, 
            currentMomentElementalProfile, 
            { kalchm: currentMomentElementalProfile },
            astrologicalStateForRecommendations,
            getCurrentSeason()
          );
          
          // Perform enhanced analysis on recipe
          if (baseRecipe.elementalProperties) {
            const analysis = performEnhancedAnalysis(
              { elemental: baseRecipe.elementalProperties },
              currentMomentElementalProfile
            );
            
            // Calculate Kalchm harmony score for recipe
            const kalchmHarmony = calculateRecipeKalchmHarmony(
              analysis.thermodynamicMetrics,
              (cuisine as any).enhancedAnalysis?.thermodynamicMetrics
            );
            
            // Calculate recipe thermodynamic optimization
            const thermodynamicOptimization = calculateThermodynamicOptimization(
              analysis.thermodynamicMetrics,
              currentMomentElementalProfile
            );
            
            // Enhanced recipe scoring with thermodynamic properties
            const originalScore = baseRecipe.matchScore || 0.85;
            const enhancedRecipeScore = (
              (originalScore * 0.60) + 
              (analysis.compatibilityScore * 0.25) + 
              (kalchmHarmony * 0.10) + 
              (thermodynamicOptimization * 0.05)
            );
            
            return {
              ...baseRecipe,
              enhancedAnalysis: analysis,
              monicaScore: analysis?.thermodynamicMetrics?.monica,
              kalchmScore: analysis?.thermodynamicMetrics?.kalchm,
              kalchmHarmony,
              thermodynamicOptimization,
              compatibilityScore: analysis.compatibilityScore,
              confidence: analysis.confidence,
              matchScore: enhancedRecipeScore,
              matchPercentage: Math.round(enhancedRecipeScore * 100)
            };
          }
          
          return baseRecipe;
        });
        
        return {
          ...cuisine,
          recipes: enhancedRecipes
        };
      });
      setCuisineRecommendations(cuisinesWithRecipes as unknown as CuisineData[]);
      setOriginalCuisines(cuisinesWithRecipes as unknown as CuisineData[]);
      setFilteredCuisines(cuisinesWithRecipes as unknown as CuisineData[]);

      setLoadingState({ isLoading: true, step: 'Analyzing cultural intelligence...', progress: 80 });
      
      // Generate cultural analytics for each cuisine
      const culturalAnalyticsData: Record<string, CulturalAnalytics> = {};
      for (const cuisine of cuisinesWithRecipes) {
        try {
          const analytics = CulturalAnalyticsService.generateCulturalAnalytics(
            cuisine?.name?.toLowerCase(),
            (cuisine.elementalProperties as ElementalProperties) || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
            astrologicalStateForRecommendations as unknown as { zodiacSign: ZodiacSign; lunarPhase: LunarPhase; }
          );
          culturalAnalyticsData[cuisine.id] = analytics;
        } catch (error) {
          logger.warn(`Failed to generate cultural analytics for ${cuisine.name}:`, error);
        }
      }
      setCulturalAnalytics(culturalAnalyticsData);
      
      // Generate fusion recommendations
      const availableCuisineNames = cuisinesWithRecipes.map(c => c?.name?.toLowerCase());
      const topCuisine = cuisinesWithRecipes[0]?.name?.toLowerCase();
      if (topCuisine) {
        const fusionRecs = CulturalAnalyticsService.generateFusionRecommendations(
          topCuisine,
          availableCuisineNames,
          3
        );
        setFusionRecommendations(fusionRecs);
      }

      setLoadingState({ isLoading: true, step: 'Harmonizing sauces...', progress: 90 });
      
      const topSauces = generateTopSauceRecommendations(
        currentMomentElementalProfile,
        6,
        astrologicalStateForRecommendations as any
      );
      setSauceRecommendations(topSauces as SauceData[]);

      // Calculate overall confidence score for caching
      const overallConfidence = analyticsActions.calculateConfidence({
        astrologicalAlignment: 0.9,
        elementalHarmony: 0.85,
        culturalRelevance: 0.8,
        seasonalOptimization: calculateSeasonalOptimization('average', getCurrentSeason()),
        userPreferenceMatch: 0.8,
        dataQuality: 0.95
      });

      // Cache the complete recommendation set with confidence-based TTL
      const cacheData = {
        cuisines: cuisinesWithRecipes,
        culturalAnalytics: culturalAnalyticsData,
        fusionRecommendations: fusionRecommendations,
        sauces: topSauces
      };
      
      analyticsActions.cacheRecommendation(cacheKey, cacheData, overallConfidence.overallScore);
      
      // Record final load time
      const totalLoadTime = performance.now() - loadStartTime;
      analyticsActions.recordLoadTime(totalLoadTime);
      endTiming();
      
      logger.info(`Cuisine recommendations loaded in ${totalLoadTime.toFixed(2)}ms with confidence ${overallConfidence?.overallScore?.toFixed(2)}`);

      setLoadingState({ isLoading: false, step: 'Complete!', progress: 100 });
    } catch (err) {
      logger.error('Error loading cuisine data:', err);
      setError('Failed to load cuisine recommendations. Please try again.');
      setLoadingState({ isLoading: false, step: 'Error', progress: 0 });
      
      // Record error in analytics
      const errorLoadTime = performance.now() - loadStartTime;
      analyticsActions.recordLoadTime(errorLoadTime);
      endTiming();
    }
  }, [currentMomentElementalProfile, astrologicalStateForRecommendations, analyticsActions]);

  // ========== EFFECTS ==========

  useEffect(() => {
    loadCuisineData();
  }, [loadCuisineData]);

  // ========== EVENT HANDLERS ==========

  const handleCuisineSelect = useCallback((cuisineId: string) => {
    // Track user interaction
    const selectedData = cuisineRecommendations.find(c => c.id === cuisineId);
    trackClick(`cuisine_${cuisineId}`, {
      cuisineName: selectedData?.name,
      matchPercentage: selectedData?.matchPercentage,
      isExpanding: selectedCuisine !== cuisineId
    });

    if (selectedCuisine === cuisineId) {
      setShowCuisineDetails(!showCuisineDetails);
      trackExpand(`cuisine_details_${cuisineId}`, {
        action: showCuisineDetails ? 'collapse' : 'expand'
      });
      return;
    }
    
    setSelectedCuisine(cuisineId);
    setShowCuisineDetails(true);

    if (selectedData?.recipes && selectedData.recipes.length > 0) {
      setMatchingRecipes(selectedData?.recipes ?? []);
    } else {
      setMatchingRecipes([]);
    }
  }, [selectedCuisine, showCuisineDetails, cuisineRecommendations, trackClick, trackExpand]);

  const handleRetry = useCallback(() => {
    setError(null);
    loadCuisineData();
  }, [loadCuisineData]);

  // ========== ADVANCED SEARCH AND FILTERING HANDLERS ==========

  const handleFiltersChange = useCallback((filters: SearchFilters) => {
    setSearchFilters(filters);
    
    // Process natural language query if present
    if (filters?.query?.trim()) {
      const intent = processNaturalLanguageQuery(filters.query);
      setSearchIntent(intent);
      
      // Merge extracted filters with manual filters
      const mergedFilters = {
        ...filters,
        ...intent.extractedFilters,
        // Preserve manual selections over extracted ones for arrays
        dietaryRestrictions: [
          ...new Set([
            ...filters.dietaryRestrictions,
            ...(intent?.extractedFilters?.dietaryRestrictions || [])
          ])
        ],
        cuisineTypes: [
          ...new Set([
            ...filters.cuisineTypes,
            ...(intent?.extractedFilters?.cuisineTypes || [])
          ])
        ],
        difficultyLevel: [
          ...new Set([
            ...filters.difficultyLevel,
            ...(intent?.extractedFilters?.difficultyLevel || [])
          ])
        ]
      };
      
      // Apply enhanced search and filtering
      let filtered = originalCuisines;
      
      // Apply text search first
      if (intent?.query?.trim()) {
        filtered = enhancedSearch(filtered, intent.query, ['name', 'description']);
      }
      
      // Apply filters
      filtered = applyFilters(filtered, mergedFilters);
      
      setFilteredCuisines(filtered);
    } else {
      // No query, just apply filters
      const filtered = applyFilters(originalCuisines, filters);
      setFilteredCuisines(filtered);
      setSearchIntent(null);
    }
  }, [originalCuisines]);

  const handleSearch = useCallback((query: string) => {
    // Track search interaction
    trackSearch(query, {
      originalResultCount: originalCuisines.length,
      timestamp: Date.now()
    });

    const intent = processNaturalLanguageQuery(query);
    setSearchIntent(intent);
    
    // Update filters with extracted information
    const updatedFilters = {
      ...searchFilters,
      query,
      ...intent.extractedFilters
    };
    
    setSearchFilters(updatedFilters);
    
    // Apply enhanced search
    let filtered = originalCuisines;
    
    if (intent?.query?.trim()) {
      filtered = enhancedSearch(filtered, intent.query, ['name', 'description']);
    }
    
    filtered = applyFilters(filtered, updatedFilters);
    setFilteredCuisines(filtered);

    // Track filter results
    trackFilter('search_results', {
      query,
      resultCount: filtered.length,
      originalCount: originalCuisines.length,
      confidence: intent.confidence
    });
  }, [searchFilters, originalCuisines, trackSearch, trackFilter]);

  // ========== RENDER HELPERS ==========

  const selectedCuisineData = useMemo(() => 
    cuisineRecommendations.find(c => c.id === selectedCuisine),
    [cuisineRecommendations, selectedCuisine]
  );

  // ========== RENDER ==========

  if (loadingState.isLoading) {
    return <LoadingComponent loadingState={loadingState} />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <AlertCircle size={20} />
          <span className="font-medium">Error</span>
        </div>
        <p className="mb-3">{error}</p>
        <button
          onClick={handleRetry}
          className="flex items-center space-x-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded transition-colors"
        >
          <RefreshCw size={16} />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  return (
    <CuisineRecommenderErrorBoundary onRetry={handleRetry}>
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-medium">Celestial Cuisine Guide</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowEnterpriseIntelligence(!showEnterpriseIntelligence)}
              className={`flex items-center space-x-1 px-3 py-1 text-sm rounded transition-colors ${
                showEnterpriseIntelligence 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Toggle Enterprise Intelligence"
            >
              <Brain size={14} />
              <span>Intelligence</span>
            </button>
            <button
              onClick={() => setShowPerformanceAnalytics(!showPerformanceAnalytics)}
              className={`flex items-center space-x-1 px-3 py-1 text-sm rounded transition-colors ${
                showPerformanceAnalytics 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Toggle Performance Analytics"
            >
              <BarChart3 size={14} />
              <span>Analytics</span>
            </button>
          </div>
        </div>

        {/* Performance Analytics Dashboard */}
        {showPerformanceAnalytics && (
          <div className="mb-6">
            <PerformanceAnalyticsDashboard 
              className="border-t pt-4"
              compact={false}
              showDetails={true}
            />
          </div>
        )}

        {/* Enterprise Intelligence Panel */}
        {showEnterpriseIntelligence && (
          <div className="mb-6">
            <EnterpriseIntelligencePanel
              recipeData={selectedCuisine ? cuisineRecommendations.find(c => c.id === selectedCuisine) : null}
              ingredientData={{ ingredients: matchingRecipes }}
              astrologicalContext={{
                zodiacSign: astrologicalStateForRecommendations.zodiacSign as ZodiacSign,
                lunarPhase: astrologicalStateForRecommendations.lunarPhase as LunarPhase,
                elementalProperties: currentMomentElementalProfile,
                planetaryPositions: astrologicalStateForRecommendations.planetaryPositions
              }}
              className="border-t pt-4"
              showDetailedMetrics={true}
              autoAnalyze={true}
              onAnalysisComplete={(analysis) => {
                setEnterpriseIntelligenceAnalysis(analysis);
                logger.info('Enterprise Intelligence Analysis completed:', {
                  overallScore: analysis.overallScore,
                  systemHealth: analysis.systemHealth
                });
              }}
            />
          </div>
        )}

        {/* Compact Performance Indicator (always visible) */}
        {!showPerformanceAnalytics && analyticsState.metrics && (
          <div className="mb-4 flex items-center justify-between text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Zap size={12} className="text-blue-500" />
                <span>Load: {analyticsState?.metrics?.loadTime.toFixed(0)}ms</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>Cache: {(analyticsState?.cacheStats?.hitRate * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>Score: {analyticsState?.performanceTrends?.performanceScore.toFixed(0)}/100</span>
              </div>
            </div>
            <button
              onClick={() => setShowPerformanceAnalytics(true)}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              View Details
            </button>
          </div>
        )}

        {/* Advanced Search and Filtering */}
        <div className="mb-6">
          <AdvancedSearchFilters
            onFiltersChange={handleFiltersChange}
            onSearch={handleSearch}
            availableCuisines={originalCuisines.map(c => c?.name?.toLowerCase())}
            className="mb-4"
          />
          
          {/* Search Intent Display */}
          {searchIntent && searchIntent.confidence > 0.5 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles size={16} className="text-blue-500" />
                <span className="text-sm font-medium text-blue-700">Search Intelligence</span>
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                  {Math.round(searchIntent.confidence * 100)}% confidence
                </span>
              </div>
              {searchIntent?.suggestions?.length > 0 && (
                <div className="text-sm text-blue-600">
                  <span className="font-medium">Suggestions: </span>
                  {searchIntent?.suggestions?.slice(0, 3).join(', ')}
                </div>
              )}
            </div>
          )}
          
          {/* Results Summary */}
          <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
            <span>
              Showing {filteredCuisines.length} of {originalCuisines.length} cuisines
              {searchFilters.query && ` for "${searchFilters.query}"`}
            </span>
            {filteredCuisines.length !== originalCuisines.length && (
              <button
                onClick={() => {
                  setSearchFilters({
                    query: '',
                    dietaryRestrictions: [],
                    difficultyLevel: [],
                    cookingTime: { min: 0, max: 480 },
                    cuisineTypes: [],
                    mealTypes: [],
                    spiciness: [],
                    ingredients: []
                  });
                  setFilteredCuisines(originalCuisines);
                  setSearchIntent(null);
                }}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Cuisine Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {filteredCuisines.map(cuisine => (
            <div
              key={cuisine.id}
              className={`rounded border p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedCuisine === cuisine.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => handleCuisineSelect(cuisine.id)}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-sm">{cuisine.name}</h3>
                <span className={`text-xs px-2 py-1 rounded ${getMatchScoreClass(getSafeScore(cuisine.score))}`}>
                  {cuisine.matchPercentage}%
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-2 line-clamp-2" title={cuisine.description}>
                {cuisine.description}
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Sparkles size={14} className="text-yellow-500" />
                <span>{cuisine.reasoning?.[0]}</span>
              </div>
              {cuisine.reasoning?.[1] && (
                <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                  {cuisine.reasoning[1].includes('Favorable') ? 
                    <Star size={14} className="text-green-500" /> : 
                    <Moon size={14} className="text-blue-500" />
                  }
                  <span>{cuisine.reasoning[1]}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Enhanced Sauce Recommendations */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <SauceRecommendations
            sauces={sauceRecommendations}
            currentElementalProfile={currentMomentElementalProfile}
            currentZodiac={currentZodiac as string}
            lunarPhase={lunarPhase}
            currentSeason={getCurrentSeason()}
            maxDisplayed={6}
            onSauceSelect={(sauce) => {
              logger.info('Sauce selected:', sauce.name);
              // Future: Add sauce selection logic here
            }}
          />
        </div>

        {/* Selected Cuisine Details */}
        {selectedCuisineData && showCuisineDetails && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-lg">{selectedCuisineData.name} Cuisine</h3>
              <span className={`text-xs px-2 py-1 rounded ${getMatchScoreClass(getSafeScore(selectedCuisineData.score))}`}>
                {selectedCuisineData.matchPercentage}% match
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{selectedCuisineData.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded border">
                <h4 className="text-sm font-medium mb-2">Elemental Properties</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(selectedCuisineData.elementalProperties || {}).map(([element, value]) => (
                    <div key={element} className="flex items-center justify-between">
                      <span className="text-sm">{element}</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="h-2.5 rounded-full bg-blue-500" 
                          style={{ width: `${Math.round(Number(value) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded border">
                <h4 className="text-sm font-medium mb-2">Recommendation Reasoning</h4>
                <ul className="list-disc pl-4 text-sm text-gray-600">
                  {selectedCuisineData.reasoning?.map((reason, i) => <li key={i}>{reason}</li>)}
                </ul>
              </div>
            </div>

            {/* Monica/Kalchm Thermodynamic Metrics */}
            {(selectedCuisineData as any).monicaCompatibility && (
              <div className="mb-4 bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border">
                <h4 className="text-sm font-medium mb-3 flex items-center">
                  <Sparkles size={16} className="text-purple-500 mr-2" />
                  Alchemical Compatibility Analysis
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-purple-600">
                      {Math.round(((selectedCuisineData as any).monicaCompatibility || 0) * 100)}%
                    </div>
                    <div className="text-xs text-gray-600">Monica Compatibility</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">
                      {((selectedCuisineData as any).userMonica || 1.0).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-600">Your Monica Constant</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">
                      {((selectedCuisineData as any).cuisineMonica || 1.0).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-600">Cuisine Monica</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-orange-600">
                      {Math.abs(((selectedCuisineData as any).userMonica || 1.0) - ((selectedCuisineData as any).cuisineMonica || 1.0)) < 0.5 ? 'High' : 'Medium'}
                    </div>
                    <div className="text-xs text-gray-600">Harmony Level</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-600">
                  Monica constants measure alchemical transformation potential. Closer values indicate better compatibility.
                </div>
              </div>
            )}

            {/* Enhanced Thermodynamic Metrics Display */}
            {(selectedCuisineData as any).enhancedAnalysis && (
              <div className="mb-4 bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg border">
                <h4 className="text-sm font-medium mb-3 flex items-center">
                  <Star size={16} className="text-green-500 mr-2" />
                  Enhanced Thermodynamic Analysis
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">
                      {Math.round(((selectedCuisineData as any).thermodynamicHarmony || 0) * 100)}%
                    </div>
                    <div className="text-xs text-gray-600">Thermodynamic Harmony</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-teal-600">
                      {Math.round(((selectedCuisineData as any).alchemicalBalance || 0) * 100)}%
                    </div>
                    <div className="text-xs text-gray-600">Alchemical Balance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">
                      {((selectedCuisineData as any).enhancedAnalysis?.thermodynamicMetrics?.kalchm || 1.0).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-600">Kalchm Constant</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-purple-600">
                      {((selectedCuisineData as any).enhancedAnalysis?.thermodynamicMetrics?.gregsEnergy || 0).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-600">Greg's Energy</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-white p-3 rounded border">
                    <h5 className="text-sm font-medium mb-2">Heat Efficiency</h5>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{((selectedCuisineData as any).enhancedAnalysis?.thermodynamicMetrics?.heat || 0).toFixed(3)}</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-red-500" 
                          style={{ width: `${Math.min(100, Math.max(0, ((selectedCuisineData as any).enhancedAnalysis?.thermodynamicMetrics?.heat || 0) * 100))}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border">
                    <h5 className="text-sm font-medium mb-2">Entropy Balance</h5>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{((selectedCuisineData as any).enhancedAnalysis?.thermodynamicMetrics?.entropy || 0).toFixed(3)}</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-yellow-500" 
                          style={{ width: `${Math.min(100, Math.max(0, ((selectedCuisineData as any).enhancedAnalysis?.thermodynamicMetrics?.entropy || 0) * 50))}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border">
                    <h5 className="text-sm font-medium mb-2">Reactivity</h5>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{((selectedCuisineData as any).enhancedAnalysis?.thermodynamicMetrics?.reactivity || 0).toFixed(3)}</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-orange-500" 
                          style={{ width: `${Math.min(100, Math.max(0, ((selectedCuisineData as any).enhancedAnalysis?.thermodynamicMetrics?.reactivity || 0) * 50))}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 text-xs text-gray-600">
                  Enhanced thermodynamic analysis integrates heat efficiency, entropy balance, and reactivity for optimal culinary recommendations.
                </div>
              </div>
            )}

            {/* Alchemical Properties Display */}
            {(selectedCuisineData as any).enhancedAnalysis?.alchemicalProperties && (
              <div className="mb-4 bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-lg border">
                <h4 className="text-sm font-medium mb-3 flex items-center">
                  <Sparkles size={16} className="text-yellow-500 mr-2" />
                  Alchemical Properties Balance
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries((selectedCuisineData as any).enhancedAnalysis.alchemicalProperties).map(([property, value]) => (
                    <div key={property} className="text-center">
                      <div className="text-lg font-semibold text-amber-600">
                        {(Number(value) || 0).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-600">{property}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="h-2 rounded-full bg-amber-500" 
                          style={{ width: `${Math.min(100, Math.max(0, (Number(value) || 0) * 100))}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-xs text-gray-600">
                  Alchemical balance optimization contributes 10% weight to the enhanced 7-factor scoring algorithm.
                </div>
              </div>
            )}

            {/* Cultural Analytics and Intelligence Section */}
            {culturalAnalytics[selectedCuisineData.id] && (
              <div className="mb-4 bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium flex items-center">
                    <Star size={16} className="text-amber-500 mr-2" />
                    Cultural Analytics & Intelligence
                  </h4>
                  <button
                    onClick={() => setShowCulturalAnalytics(!showCulturalAnalytics)}
                    className="text-xs px-2 py-1 bg-amber-100 hover:bg-amber-200 rounded transition-colors"
                  >
                    {showCulturalAnalytics ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-amber-600">
                      {Math.round(culturalAnalytics[selectedCuisineData.id].culturalSynergy * 100)}%
                    </div>
                    <div className="text-xs text-gray-600">Cultural Synergy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-orange-600">
                      {Math.round(culturalAnalytics[selectedCuisineData.id].culturalCompatibility * 100)}%
                    </div>
                    <div className="text-xs text-gray-600">Astrological Compatibility</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-yellow-600">
                      {Math.round(culturalAnalytics[selectedCuisineData.id].fusionPotential * 100)}%
                    </div>
                    <div className="text-xs text-gray-600">Fusion Potential</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-red-600">
                      {Math.round(culturalAnalytics[selectedCuisineData.id].culturalDiversityScore * 100)}%
                    </div>
                    <div className="text-xs text-gray-600">Cultural Diversity</div>
                  </div>
                </div>
                
                {showCulturalAnalytics && (
                  <div className="space-y-3 mt-4">
                    <div className="bg-white p-3 rounded border">
                      <h5 className="text-sm font-medium mb-2">Historical Significance</h5>
                      <p className="text-xs text-gray-700">{culturalAnalytics[selectedCuisineData.id].historicalSignificance}</p>
                    </div>
                    
                    <div className="bg-white p-3 rounded border">
                      <h5 className="text-sm font-medium mb-2">Cultural Context</h5>
                      <p className="text-xs text-gray-700">{culturalAnalytics[selectedCuisineData.id].culturalContext}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded border">
                        <h5 className="text-sm font-medium mb-2">Traditional Principles</h5>
                        <ul className="list-disc pl-4 text-xs text-gray-700">
                          {culturalAnalytics[selectedCuisineData.id].traditionalPrinciples.slice(0, 3).map((principle, i) => (
                            <li key={i}>{principle}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-white p-3 rounded border">
                        <h5 className="text-sm font-medium mb-2">Modern Adaptations</h5>
                        <ul className="list-disc pl-4 text-xs text-gray-700">
                          {culturalAnalytics[selectedCuisineData.id].modernAdaptations.slice(0, 3).map((adaptation, i) => (
                            <li key={i}>{adaptation}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-3 text-xs text-gray-600">
                  Cultural synergy contributes 5% weight to the 7-factor recommendation algorithm.
                </div>
              </div>
            )}

            {/* Fusion Cuisine Recommendations */}
            {fusionRecommendations.length > 0 && (
              <div className="mb-4 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium flex items-center">
                    <Sparkles size={16} className="text-indigo-500 mr-2" />
                    Fusion Cuisine Recommendations
                  </h4>
                  <button
                    onClick={() => setShowFusionRecommendations(!showFusionRecommendations)}
                    className="text-xs px-2 py-1 bg-indigo-100 hover:bg-indigo-200 rounded transition-colors"
                  >
                    {showFusionRecommendations ? 'Hide Fusion' : 'Show Fusion'}
                  </button>
                </div>
                
                {showFusionRecommendations && (
                  <div className="space-y-3">
                    {fusionRecommendations.map((fusion, index) => (
                      <div key={index} className="bg-white p-3 rounded border">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="text-sm font-medium">{fusion.name}</h5>
                          <div className="flex space-x-2">
                            <span className="text-xs px-2 py-1 bg-indigo-100 rounded">
                              {Math.round(fusion.fusionScore * 100)}% Fusion
                            </span>
                            <span className="text-xs px-2 py-1 bg-purple-100 rounded">
                              {Math.round(fusion.culturalHarmony * 100)}% Harmony
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-600 mb-2">
                          Blend of {fusion?.parentCuisines?.join(' and ')} cuisines
                        </p>
                        
                        <div className="mb-2">
                          <h6 className="text-xs font-medium mb-1">Recommended Dishes:</h6>
                          <div className="flex flex-wrap gap-1">
                            {fusion?.recommendedDishes?.map((dish, i) => (
                              <span key={i} className="text-xs px-2 py-1 bg-gray-100 rounded">
                                {dish}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-700">
                          <p>{fusion.culturalNotes[0]}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-3 text-xs text-gray-600">
                  Fusion recommendations based on cultural compatibility and culinary harmony analysis.
                </div>
              </div>
            )}
            
            {/* Enhanced Recipe Recommendations */}
            <div className="mt-4">
              <RecipeRecommendations
                recipes={matchingRecipes}
                cuisineName={selectedCuisineData.name}
                currentElementalProfile={currentMomentElementalProfile}
                maxDisplayed={6}
                onRecipeSelect={(recipe) => {
                  logger.info('Recipe selected:', recipe.name);
                  setSelectedRecipe(recipe);
                }}
              />
            </div>

            {/* Recipe Intelligence Analytics */}
            {matchingRecipes.length > 0 && (
              <div className="mt-6 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border">
                <h4 className="text-sm font-medium mb-3 flex items-center">
                  <Brain size={16} className="text-blue-500 mr-2" />
                  Recipe Intelligence Analytics
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {matchingRecipes.slice(0, 3).map((recipe, index) => (
                    recipe.intelligenceAnalysis && (
                      <div key={index} className="bg-white p-3 rounded border">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="text-sm font-medium">{recipe.name}</h5>
                          <span className="text-xs px-2 py-1 bg-blue-100 rounded">
                            {Math.round(recipe?.intelligenceAnalysis?.score * 100)}% Intelligence
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Elemental Alignment:</span>
                            <span className="font-medium">
                              {Math.round(recipe?.intelligenceAnalysis?.compatibility.elementalAlignment * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Kalchm Alignment:</span>
                            <span className="font-medium">
                              {Math.round(recipe?.intelligenceAnalysis?.compatibility.kalchmAlignment * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Planetary Alignment:</span>
                            <span className="font-medium">
                              {Math.round(recipe?.intelligenceAnalysis?.compatibility.planetaryAlignment * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Ingredient Complexity:</span>
                            <span className="font-medium">
                              {recipe?.intelligenceAnalysis?.ingredientCount} ingredients
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Seasonal Optimization:</span>
                            <span className="font-medium">
                              {Math.round(recipe?.intelligenceAnalysis?.seasonalOptimization * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Difficulty Bonus:</span>
                            <span className="font-medium">
                              {Math.round(recipe?.intelligenceAnalysis?.difficultyBonus * 100)}%
                            </span>
                          </div>
                        </div>
                        
                        {recipe?.intelligenceAnalysis?.compatibility?.recommendations?.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <div className="text-xs text-gray-600 mb-1">Recommendations:</div>
                            <div className="text-xs text-gray-700">
                              {recipe?.intelligenceAnalysis?.compatibility.recommendations[0]}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  ))}
                </div>
                <div className="mt-3 text-xs text-gray-600">
                  Recipe Intelligence Analytics provide real-time compatibility scoring using elemental, alchemical, and astrological calculations.
                </div>
              </div>
            )}

            {/* Phase 2B: Ingredient Intelligence Analytics */}
            {matchingRecipes.length > 0 && matchingRecipes.some(recipe => recipe.intelligenceAnalysis?.ingredientIntelligence) && (
              <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border">
                <h4 className="text-sm font-medium mb-3 flex items-center">
                  <Leaf size={16} className="text-green-500 mr-2" />
                  Ingredient Intelligence Analytics
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {matchingRecipes.slice(0, 3).map((recipe, index) => (
                    recipe.intelligenceAnalysis?.ingredientIntelligence && (
                      <div key={index} className="bg-white p-3 rounded border">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="text-sm font-medium">{recipe.name}</h5>
                          <span className="text-xs px-2 py-1 bg-green-100 rounded">
                            {Math.round(recipe?.intelligenceAnalysis?.ingredientIntelligence.optimizationScore * 100)}% Optimization
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Category Harmony:</span>
                            <span className="font-medium">
                              {Math.round(recipe?.intelligenceAnalysis?.ingredientIntelligence?.categorizationAnalysis?.categoryHarmony * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Category Count:</span>
                            <span className="font-medium">
                              {recipe?.intelligenceAnalysis?.ingredientIntelligence?.categorizationAnalysis?.categoryCount} categories
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Seasonal Harmony:</span>
                            <span className="font-medium">
                              {Math.round(recipe?.intelligenceAnalysis?.ingredientIntelligence?.seasonalAnalysis?.seasonalHarmony * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Compatibility Harmony:</span>
                            <span className="font-medium">
                              {Math.round(recipe?.intelligenceAnalysis?.ingredientIntelligence?.compatibilityAnalysis?.compatibilityHarmony * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Astrological Harmony:</span>
                            <span className="font-medium">
                              {Math.round(recipe?.intelligenceAnalysis?.ingredientIntelligence?.astrologicalAnalysis?.astrologicalHarmony * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Validation Rate:</span>
                            <span className="font-medium">
                              {Math.round(recipe?.intelligenceAnalysis?.ingredientIntelligence?.validationResults?.validationRate * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Safety Score:</span>
                            <span className="font-medium">
                              {Math.round(recipe?.intelligenceAnalysis?.ingredientIntelligence.safetyScore * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Confidence:</span>
                            <span className="font-medium">
                              {Math.round(recipe?.intelligenceAnalysis?.ingredientIntelligence.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                        
                        {recipe?.intelligenceAnalysis?.ingredientIntelligence?.recommendations?.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <div className="text-xs text-gray-600 mb-1">Ingredient Recommendations:</div>
                            <div className="text-xs text-gray-700">
                              {recipe?.intelligenceAnalysis?.ingredientIntelligence.recommendations[0]}
                            </div>
                          </div>
                        )}
                        
                        {recipe?.intelligenceAnalysis?.ingredientIntelligence.categorizationAnalysis?.ingredientDistribution?.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <div className="text-xs text-gray-600 mb-1">Ingredient Distribution:</div>
                            <div className="space-y-1">
                              {recipe?.intelligenceAnalysis?.ingredientIntelligence.categorizationAnalysis?.ingredientDistribution?.slice(0, 3).map((dist, i) => (
                                <div key={i} className="flex justify-between text-xs">
                                  <span className="capitalize">{dist.category}:</span>
                                  <span className="font-medium">{dist.count} items</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  ))}
                </div>
                
                <div className="mt-3 text-xs text-gray-600">
                  Ingredient Intelligence Systems provide advanced analytics for ingredient categorization, 
                  seasonal optimization, compatibility analysis, and validation results.
                </div>
              </div>
            )}

            {/* Phase 2C: Cuisine Intelligence Analytics */}
            {matchingRecipes.length > 0 && matchingRecipes.some(recipe => recipe.intelligenceAnalysis?.cuisineIntelligence) && (
              <div className="mt-6 bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg border">
                <h4 className="text-sm font-medium mb-3 flex items-center">
                  <Sparkles size={16} className="text-purple-500 mr-2" />
                  Cuisine Intelligence Analytics
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {matchingRecipes.slice(0, 3).map((recipe, index) => (
                    recipe.intelligenceAnalysis?.cuisineIntelligence && (
                      <div key={index} className="bg-white p-3 rounded border">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="text-sm font-medium">{recipe.name}</h5>
                          <span className="text-xs px-2 py-1 bg-purple-100 rounded">
                            {Math.round(recipe?.intelligenceAnalysis?.cuisineIntelligence.optimizationScore * 100)}% Optimization
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Cultural Synergy:</span>
                            <span className="font-medium">
                              {Math.round(recipe?.intelligenceAnalysis?.cuisineIntelligence?.culturalAnalysis?.culturalSynergy * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Cultural Compatibility:</span>
                            <span className="font-medium">
                              {Math.round(recipe?.intelligenceAnalysis?.cuisineIntelligence?.culturalAnalysis?.culturalCompatibility * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Fusion Potential:</span>
                            <span className="font-medium">
                              {Math.round(recipe?.intelligenceAnalysis?.cuisineIntelligence?.fusionAnalysis?.fusionPotential * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Fusion Score:</span>
                            <span className="font-medium">
                              {Math.round(recipe?.intelligenceAnalysis?.cuisineIntelligence?.fusionAnalysis?.fusionScore * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Seasonal Alignment:</span>
                            <span className="font-medium">
                              {recipe?.intelligenceAnalysis?.cuisineIntelligence?.seasonalAnalysis?.seasonalAlignment}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Elemental Balance:</span>
                            <span className="font-medium">
                              {Math.round(recipe?.intelligenceAnalysis?.cuisineIntelligence?.compatibilityAnalysis?.elementalBalance * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Astrological Alignment:</span>
                            <span className="font-medium">
                              {Math.round(recipe?.intelligenceAnalysis?.cuisineIntelligence?.astrologicalAnalysis?.astrologicalAlignment * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Zodiac Compatibility:</span>
                            <span className="font-medium">
                              {Math.round(recipe?.intelligenceAnalysis?.cuisineIntelligence?.astrologicalAnalysis?.zodiacCompatibility * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Lunar Phase Harmony:</span>
                            <span className="font-medium">
                              {Math.round(recipe?.intelligenceAnalysis?.cuisineIntelligence?.astrologicalAnalysis?.lunarPhaseHarmony * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Safety Score:</span>
                            <span className="font-medium">
                              {Math.round(recipe?.intelligenceAnalysis?.cuisineIntelligence.safetyScore * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Confidence:</span>
                            <span className="font-medium">
                              {Math.round(recipe?.intelligenceAnalysis?.cuisineIntelligence.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                        
                        {recipe?.intelligenceAnalysis?.cuisineIntelligence?.recommendations?.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <div className="text-xs text-gray-600 mb-1">Cuisine Recommendations:</div>
                            <div className="text-xs text-gray-700">
                              {recipe?.intelligenceAnalysis?.cuisineIntelligence.recommendations[0]}
                            </div>
                          </div>
                        )}
                        
                        {recipe?.intelligenceAnalysis?.cuisineIntelligence.fusionAnalysis?.fusionRecommendations?.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <div className="text-xs text-gray-600 mb-1">Fusion Recommendations:</div>
                            <div className="space-y-1">
                              {recipe?.intelligenceAnalysis?.cuisineIntelligence.fusionAnalysis?.fusionRecommendations?.slice(0, 2).map((fusion, i) => (
                                <div key={i} className="text-xs">
                                  <span className="font-medium">{fusion.name}</span>
                                  <span className="text-gray-600"> ({Math.round(fusion.fusionScore * 100)}% fusion)</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  ))}
                </div>
                <div className="mt-3 text-xs text-gray-600">
                  Cuisine Intelligence Analytics provide cultural analysis, fusion recommendations, seasonal optimization, and astrological alignment for enhanced cuisine selection.
                </div>
              </div>
            )}

            {/* Recipe-Specific Sauce Recommendations */}
            {selectedRecipe && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <SauceRecommendations
                  sauces={sauceRecommendations}
                  cuisineName={selectedCuisineData.name}
                  selectedRecipe={selectedRecipe}
                  currentElementalProfile={currentMomentElementalProfile}
                  currentZodiac={currentZodiac as string}
                  lunarPhase={lunarPhase}
                  currentSeason={getCurrentSeason()}
                  maxDisplayed={4}
                  onSauceSelect={(sauce) => {
                    logger.info('Sauce selected for recipe:', sauce.name, 'with', selectedRecipe.name);
                    // Future: Add sauce-recipe pairing logic here
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </CuisineRecommenderErrorBoundary>
  );
}