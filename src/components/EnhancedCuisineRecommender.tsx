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
import { ElementalCharacter, AlchemicalProperty } from '@/constants/planetaryElements';
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

  // 6. CULTURAL SYNERGY (Enhanced)
  try {
    const planetaryPositions = astroState?.planetaryPositions || {};
    const planetCount = Object.keys(planetaryPositions).length;
    culturalSynergy = Math.min(0.9, 0.5 + (planetCount * 0.1));
  } catch (error) {
    culturalSynergy = 0.5;
  }

  // Calculate overall enhanced score
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

// Elemental match calculation
function calculateElementalMatch(
  cuisineElements: ElementalProperties,
  astroElements: ElementalProperties
): number {
  try {
    const elements = ['Fire', 'Water', 'Earth', 'Air'] as const;
    let totalMatch = 0;
    let totalWeight = 0;

    elements.forEach(element => {
      const cuisineValue = cuisineElements[element] || 0;
      const astroValue = astroElements[element] || 0;
      const weight = Math.max(cuisineValue, astroValue);
      
      if (weight > 0) {
        const match = 1 - Math.abs(cuisineValue - astroValue) / Math.max(cuisineValue, astroValue);
        totalMatch += match * weight;
        totalWeight += weight;
      }
    });

    return totalWeight > 0 ? totalMatch / totalWeight : 0.5;
  } catch (error) {
    return 0.5;
  }
}

export default function EnhancedCuisineRecommender() {
  // Enhanced state management
  const [cuisineRecommendations, setCuisineRecommendations] = useState<EnhancedCuisineRecommendation[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [sauceRecommendations, setSauceRecommendations] = useState<SauceRecommendation[]>([]);
  const [sauces, setSauces] = useState<Sauce[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>('Initializing enhanced system...');
  
  // Enhanced UI state
  const [expandedRecipes, setExpandedRecipes] = useState<ExpandedState>({});
  const [expandedSauces, setExpandedSauces] = useState<ExpandedState>({});
  const [openSauceCards, setOpenSauceCards] = useState<ExpandedState>({});
  const [showRecipes, setShowRecipes] = useState(true);
  const [showSauces, setShowSauces] = useState(false);
  const [showCuisineDetails, setShowCuisineDetails] = useState(false);
  const [showEnhancedFeatures, setShowEnhancedFeatures] = useState(true);
  const [showPlanetaryInfluences, setShowPlanetaryInfluences] = useState(true);
  const [showSeasonalFactors, setShowSeasonalFactors] = useState(true);
  const [showCulturalContext, setShowCulturalContext] = useState(true);

  // Enhanced elemental profile state
  const [currentMomentElementalProfile, setCurrentMomentElementalProfile] = useState<ElementalProperties | undefined>(
    undefined
  );
  
  // Ref to track loading state and prevent infinite loops
  const lastLoadedStateRef = useRef<string>('');

  // Get astrological state using the astrologize API
  const astrologicalState = useAstrologicalState();
  const alchemicalContext = useAlchemical();
  
  // Get current season
  const currentSeason = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    if (month >= 2 && month <= 4) return 'Spring' as Season;
    if (month >= 5 && month <= 7) return 'Summer' as Season;
    if (month >= 8 && month <= 10) return 'Autumn' as Season;
    return 'Winter' as Season;
  }, []);

  // Enhanced sauce recommendations with Monica/Kalchm integration
  const generateEnhancedSauceRecommendationsForCuisine = useCallback((cuisineName: string) => {
    try {
      if (!cuisineName || !allSauces) return [];

      const saucesArray = Object.values(allSauces);
      const currentElementalProfile = currentMomentElementalProfile || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };

      const saucesWithMatches = saucesArray.map(sauce => {
        try {
          // Enhanced elemental matching
          const sauceElements = sauce.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
          const elementalMatch = calculateElementalMatch(sauceElements, currentElementalProfile);

          // Enhanced Monica/Kalchm scoring
          const astroInfluences = sauce.astrologicalInfluences as Record<string, any> | undefined;
          const planets = astroInfluences?.planets as string[] | undefined;
          const spirit = elementalMatch * 0.4 + (planets?.length || 0) * 0.1;
          const sauceAny = sauce as any;
          const essence = (sauceAny.season?.includes(currentSeason) ? 0.8 : 0.3) + (sauceAny.culturalContext ? 0.2 : 0);
          const matter = 0.5;
          const substance = 0.5;

          const monicaCompatibility = spirit > 0 && essence > 0 ? Math.min(0.95, (spirit * essence) / (matter * substance)) : 0.5;
          const kalchmHarmony = Math.min(0.95, (elementalMatch * monicaCompatibility) / 2);

          // Enhanced match percentage calculation
          const matchPercentage = Math.round(
            (elementalMatch * 0.4 + monicaCompatibility * 0.3 + kalchmHarmony * 0.3) * 100
          );

          return {
            ...sauce,
            matchPercentage,
            enhancedScore: {
              elementalMatch,
              monicaCompatibility,
              kalchmHarmony,
              zodiacAlignment: 0.5,
              lunarAlignment: 0.5,
              seasonalOptimization: (sauce as any).season?.includes(currentSeason) ? 0.9 : 0.3,
              culturalSynergy: (sauce as any).culturalContext ? 0.8 : 0.5,
              overallScore: (elementalMatch + monicaCompatibility + kalchmHarmony) / 3
            }
          };
        } catch (error) {
          return {
            ...sauce,
            matchPercentage: 50,
            enhancedScore: {
              elementalMatch: 0.5,
              monicaCompatibility: 0.5,
              kalchmHarmony: 0.5,
              zodiacAlignment: 0.5,
              lunarAlignment: 0.5,
              seasonalOptimization: 0.5,
              culturalSynergy: 0.5,
              overallScore: 0.5
            }
          };
        }
      });
      
      // Sort sauces by enhanced score and return top matches
      const sortedSauces = saucesWithMatches
        .sort((a, b) => (b.enhancedScore?.overallScore || 0) - (a.enhancedScore?.overallScore || 0))
        .slice(0, 8);
      
      return sortedSauces;
    } catch (error) {
      return [];
    }
  }, [currentMomentElementalProfile, astrologicalState, currentSeason]);

  // Enhanced cuisine recommendations with Monica/Kalchm integration
  const getEnhancedCuisineRecommendations = useCallback((astroState: Record<string, unknown>) => {
    try {
      // Start with all cuisines
      const availableCuisines = cuisineFlavorProfiles ? Object.values(cuisineFlavorProfiles) : [];
      
      if (availableCuisines?.length === 0) {
        return [];
      }
      
      // Create a map of parent cuisines to their regional variants
      const cuisineMap = new Map();
      
      // First pass - identify parent cuisines and standalone cuisines
      availableCuisines.forEach(cuisine => {
        try {
          // Skip regional variants for now
          if (!cuisine.parentCuisine) {
            cuisineMap.set((cuisine as { id?: string })?.id, {
              cuisine: cuisine,
              regionalVariants: []
            });
          }
        } catch (error) {
          // console.warn('Error processing cuisine:', cuisine?.name, error);
        }
      });
      
      // Second pass - add regional variants to their parent cuisines
      availableCuisines.forEach(cuisine => {
        try {
          if (cuisine.parentCuisine) {
            const parent = cuisineMap.get(cuisine.parentCuisine);
            if (parent) {
              parent.regionalVariants.push(cuisine);
            }
          }
        } catch (error) {
          // console.warn('Error processing regional variant:', cuisine?.name, error);
        }
      });
      
      // Calculate enhanced scores for each cuisine
      const transformedCuisines: EnhancedCuisineRecommendation[] = [];
      
      cuisineMap.forEach(({ cuisine, regionalVariants }, cuisineId) => {
        try {
          // Calculate enhanced score for parent cuisine
          const enhancedScore = calculateEnhancedCuisineScore(
            cuisine as Record<string, unknown>,
            astroState,
            currentSeason
          );
          
          // Create enhanced recommendation
          const enhancedRecommendation: EnhancedCuisineRecommendation = {
            id: cuisineId,
            name: (cuisine as { name?: string })?.name || 'Unknown Cuisine',
            description: (cuisine as { description?: string })?.description,
            elementalProperties: (cuisine as { elementalAlignment?: ElementalProperties })?.elementalAlignment,
            astrologicalInfluences: (cuisine as { astrologicalInfluences?: Record<string, unknown> })?.astrologicalInfluences,
            score: enhancedScore.overallScore,
            matchPercentage: Math.round(enhancedScore.overallScore * 100),
            enhancedScore,
            planetaryInfluences: (cuisine as { planetaryInfluences?: Record<string, number> })?.planetaryInfluences,
            seasonalFactors: (cuisine as { seasonalFactors?: Record<string, number> })?.seasonalFactors,
            culturalContext: (cuisine as { culturalContext?: Record<string, unknown> })?.culturalContext
          };
          
          transformedCuisines.push(enhancedRecommendation);
          
          // Add regional variants with enhanced scoring
          regionalVariants.forEach((variant: Record<string, unknown>) => {
            try {
              const variantEnhancedScore = calculateEnhancedCuisineScore(
                variant,
                astroState,
                currentSeason
              );
              
              const variantRecommendation: EnhancedCuisineRecommendation = {
                id: (variant as { id?: string })?.id || `${cuisineId}-${(variant as { name?: string })?.name}`,
                name: (variant as { name?: string })?.name || 'Unknown Variant',
                description: (variant as { description?: string })?.description,
                elementalProperties: (variant as { elementalAlignment?: ElementalProperties })?.elementalAlignment,
                astrologicalInfluences: (variant as { astrologicalInfluences?: Record<string, unknown> })?.astrologicalInfluences,
                score: variantEnhancedScore.overallScore,
                matchPercentage: Math.round(variantEnhancedScore.overallScore * 100),
                enhancedScore: variantEnhancedScore,
                planetaryInfluences: (variant as { planetaryInfluences?: Record<string, number> })?.planetaryInfluences,
                seasonalFactors: (variant as { seasonalFactors?: Record<string, number> })?.seasonalFactors,
                culturalContext: (variant as { culturalContext?: Record<string, unknown> })?.culturalContext
              };
              
              transformedCuisines.push(variantRecommendation);
            } catch (error) {
              // console.warn('Error processing variant scoring:', variant?.name, error);
            }
          });
        } catch (error) {
          // console.warn('Error processing cuisine scoring:', cuisine?.name, error);
        }
      });

      // Sort cuisines by enhanced score in DESCENDING order (best matches first)
      return transformedCuisines
        .sort((a, b) => b.score - a.score)
        .slice(0, 20); // Increased recommendations
    } catch (error) {
      return [];
    }
  }, [currentSeason]);

  const loadCuisines = useCallback(async (
    currentAstroState?: Record<string, unknown>,
    currentElementalProfile?: ElementalProperties,
    season?: Season
  ) => {
    try {
      // Use passed parameters or fall back to current state
      const astroState = currentAstroState || astrologicalState;
      const _elementalProfile = currentElementalProfile || currentMomentElementalProfile;
      const currentSeasonToUse = season || currentSeason;
      
      // Create a stable key to track if we need to reload
      const stateKey = JSON.stringify({
        isReady: astroState?.isReady,
        zodiac: (astroState && typeof astroState === 'object' && 'currentZodiac' in astroState) ? (astroState as Record<string, unknown>).currentZodiac :
          (astroState && typeof astroState === 'object' && 'zodiacSign' in astroState) ? (astroState as Record<string, unknown>).zodiacSign : null,
        lunar: astroState?.lunarPhase,
        season: currentSeasonToUse
      });
      
      // Prevent infinite loops by checking if we've already loaded for this state
      if (lastLoadedStateRef.current === stateKey) {
        return;
      }
      
      lastLoadedStateRef.current = stateKey;
      
      setLoading(true);
      setError(null);
      
      setLoadingStep('Calculating enhanced astrological influences...');
      
      // Get enhanced cuisine recommendations
      const recommendations = getEnhancedCuisineRecommendations(astroState as unknown as Record<string, unknown>);
      
      if (recommendations?.length === 0) {
        setError('No cuisines available at this time. Please try again later.');
        return;
      }
      
      setCuisineRecommendations(recommendations);
      
      setLoadingStep('Loading enhanced recipe database...');
      
      // Load all recipes asynchronously
      const loadAllRecipes = async () => {
        try {
          if (typeof getAllRecipes === 'function') {
            const allRecipes = await getAllRecipes();
            return allRecipes || [];
          } else {
            return [];
          }
        } catch (recipeError) {
          return [];
        }
      };
      
      const allRecipes = await loadAllRecipes();
      
      setLoadingStep('Optimizing Monica/Kalchm constants...');
      
      // If we have a top recommendation, auto-select it and load its recipes
      if (recommendations?.length > 0) {
        const topRecommendation = recommendations[0];
        setSelectedCuisine(topRecommendation.id);
        
        setLoadingStep('Loading enhanced cuisine-specific recipes...');
        
        try {
          // Get recipes for the top cuisine
          const cuisineRecipes = getRecipesForCuisineMatch ? 
            await Promise.resolve(getRecipesForCuisineMatch(topRecommendation.name, allRecipes)) : [];
          
          setRecipes(cuisineRecipes as unknown as Recipe[]);
        } catch (recipeError) {
          setRecipes([]);
        }
        
        setLoadingStep('Generating enhanced sauce pairings...');
        
        try {
          // Generate enhanced sauce recommendations
          const sauceRecs = generateEnhancedSauceRecommendationsForCuisine(topRecommendation.name);
          setSauceRecommendations(sauceRecs as unknown as SauceRecommendation[]);
          setSauces(allSauces ? Object.values(allSauces) : []);
        } catch (sauceError) {
          setSauceRecommendations([]);
          setSauces([]);
        }
      }
      
      setLoadingStep('Finalizing enhanced recommendations...');
      
    } catch (err) {
      setError('Failed to load enhanced cuisine recommendations. Please try again.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  }, [getEnhancedCuisineRecommendations, generateEnhancedSauceRecommendationsForCuisine]);

  // Enhanced cuisine loading with Monica/Kalchm integration
  useEffect(() => {
    if (astrologicalState?.isReady) {
      loadCuisines(astrologicalState as unknown as Record<string, unknown>, currentMomentElementalProfile, currentSeason);
    }
  }, [astrologicalState?.isReady, astrologicalState?.currentZodiac, astrologicalState?.lunarPhase, currentSeason]);

  const handleCuisineSelect = (cuisineId: string) => {
    setSelectedCuisine(cuisineId);
    setShowCuisineDetails(true);
    
    // Find the selected cuisine
    const selectedCuisineData = cuisineRecommendations.find(
      (c) => c.id === cuisineId || c.name === cuisineId
    );
    
    if (!selectedCuisineData) {
      return;
    }
    
    // Load recipes for the selected cuisine
    const loadRecipesForCuisine = async () => {
      try {
        setLoadingStep('Loading enhanced recipes...');
        setLoading(true);
        
        const allRecipes = await getAllRecipes();
        let cuisineRecipes = await Promise.resolve(getRecipesForCuisineMatch(selectedCuisineData.name, allRecipes));
        
        setRecipes(cuisineRecipes as unknown as Recipe[]);
        
        // Generate enhanced sauce recommendations for this cuisine
        const sauceRecs = generateEnhancedSauceRecommendationsForCuisine(selectedCuisineData.name);
        setSauceRecommendations(sauceRecs as unknown as SauceRecommendation[]);
        setSauces((allSauces || []) as unknown as Sauce[]);
        
      } catch (error) {
        setRecipes([]);
      } finally {
        setLoading(false);
        setLoadingStep('');
      }
    };
    
    loadRecipesForCuisine();
  };

  // Enhanced score display component
  const renderEnhancedScore = (score: EnhancedCuisineScore) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
      <div className="bg-red-50 p-2 rounded">
        <div className="font-medium text-red-700">Elemental</div>
        <div className="text-red-600">{Math.round(score.elementalMatch * 100)}%</div>
      </div>
      <div className="bg-purple-50 p-2 rounded">
        <div className="font-medium text-purple-700">Monica</div>
        <div className="text-purple-600">{Math.round(score.monicaCompatibility * 100)}%</div>
      </div>
      <div className="bg-blue-50 p-2 rounded">
        <div className="font-medium text-blue-700">Kalchm</div>
        <div className="text-blue-600">{Math.round(score.kalchmHarmony * 100)}%</div>
      </div>
      <div className="bg-green-50 p-2 rounded">
        <div className="font-medium text-green-700">Overall</div>
        <div className="text-green-600">{Math.round(score.overallScore * 100)}%</div>
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

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Sparkles className="mr-2 text-purple-500" />
          Enhanced Celestial Cuisine Guide
        </h2>
        
        {/* Enhanced features toggles */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowEnhancedFeatures(!showEnhancedFeatures)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              showEnhancedFeatures 
                ? 'bg-purple-500 text-white' 
                : 'bg-white/90 text-purple-600 hover:bg-purple-100'
            }`}
          >
            <Sparkles className="w-3 h-3 inline mr-1" />
            Enhanced
          </button>
          <button
            onClick={() => setShowPlanetaryInfluences(!showPlanetaryInfluences)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              showPlanetaryInfluences 
                ? 'bg-blue-500 text-white' 
                : 'bg-white/90 text-blue-600 hover:bg-blue-100'
            }`}
          >
            <Globe className="w-3 h-3 inline mr-1" />
            Planetary
          </button>
          <button
            onClick={() => setShowSeasonalFactors(!showSeasonalFactors)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              showSeasonalFactors 
                ? 'bg-green-500 text-white' 
                : 'bg-white/90 text-green-600 hover:bg-green-100'
            }`}
          >
            <Leaf className="w-3 h-3 inline mr-1" />
            Seasonal
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{loadingStep}</p>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">
          {error}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Enhanced Cuisine Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cuisineRecommendations.map((cuisine) => (
              <div
                key={cuisine.id}
                className={`bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-md p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                  selectedCuisine === cuisine.id ? 'ring-2 ring-purple-500' : ''
                }`}
                onClick={() => handleCuisineSelect(cuisine.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{cuisine.name}</h3>
                  <div className={`px-2 py-1 rounded-full text-xs font-bold text-white ${getEnhancedMatchScoreClass(cuisine.matchPercentage)}`}>
                    {cuisine.matchPercentage}%
                  </div>
                </div>
                
                {showEnhancedFeatures && cuisine.enhancedScore && (
                  <div className="mb-3">
                    {renderEnhancedScore(cuisine.enhancedScore)}
                  </div>
                )}
                
                {showPlanetaryInfluences && cuisine.planetaryInfluences && (
                  <div className="mb-2">
                    <div className="text-xs font-medium text-gray-600 mb-1">Planetary Influences:</div>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(cuisine.planetaryInfluences).slice(0, 3).map(([planet, influence]) => (
                        <span key={planet} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          {planet}: {Math.round(influence * 100)}%
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {showSeasonalFactors && cuisine.seasonalFactors && (
                  <div className="mb-2">
                    <div className="text-xs font-medium text-gray-600 mb-1">Seasonal Factors:</div>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(cuisine.seasonalFactors).slice(0, 2).map(([season, factor]) => (
                        <span key={season} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                          {season}: {Math.round(factor * 100)}%
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {cuisine.description && (
                  <p className="text-sm text-gray-600 mt-2">{cuisine.description}</p>
                )}
              </div>
            ))}
          </div>

          {/* Enhanced Recipe and Sauce Display */}
          {selectedCuisine && (
            <div className="mt-8">
              <div className="flex space-x-4 mb-4">
                <button
                  onClick={() => setShowRecipes(!showRecipes)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    showRecipes 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Recipes ({recipes.length})
                </button>
                <button
                  onClick={() => setShowSauces(!showSauces)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    showSauces 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Enhanced Sauces ({sauceRecommendations.length})
                </button>
              </div>

              {showRecipes && recipes.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recipes.slice(0, 6).map((recipe, index) => (
                    <div key={index} className="bg-white rounded-lg shadow p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{recipe.name}</h4>
                      {recipe.description && (
                        <p className="text-sm text-gray-600 mb-2">{recipe.description}</p>
                      )}
                      {recipe.ingredients && recipe.ingredients.length > 0 && (
                        <div className="text-xs text-gray-500">
                          {recipe.ingredients.slice(0, 3).join(', ')}
                          {recipe.ingredients.length > 3 && '...'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {showSauces && sauceRecommendations.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sauceRecommendations.slice(0, 6).map((sauce, index) => (
                    <div key={index} className="bg-white rounded-lg shadow p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{(sauce as any).name || (sauce as any).id}</h4>
                        <div className={`px-2 py-1 rounded-full text-xs font-bold text-white ${getEnhancedMatchScoreClass((sauce as any).matchPercentage || 50)}`}>
                          {(sauce as any).matchPercentage || 50}%
                        </div>
                      </div>
                      {(sauce as any).description && (
                        <p className="text-sm text-gray-600 mb-2">{(sauce as any).description}</p>
                      )}
                      {showEnhancedFeatures && (sauce as any).enhancedScore && (
                        <div className="mt-2">
                          {renderEnhancedScore((sauce as any).enhancedScore)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 