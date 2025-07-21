'use client';

import { 
  SlidersHorizontal, 
  Flame, 
  Droplets, 
  Wind, 
  Mountain, 
  Clock, 
  ChefHat, 
  Star, 
  Grid, 
  List, 
  LayoutGrid, 
  LayoutList, 
  Users, 
  Calendar, 
  Tag, 
  CircleDashed, 
  Activity, 
  Sun, 
  Heart, 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc 
} from 'lucide-react';
import React, { useState, useMemo, useEffect } from 'react';

import { ElementalProperties, ThermodynamicMetrics, TimeFactors } from '@/types/alchemy';
import { Recipe } from '@/types/recipe';
import { getTimeFactors } from '@/utils/time';

import { useAlchemical } from '../../contexts/AlchemicalContext';
import { cuisines } from '../../data/cuisines';
import { seasonalData } from '../../data/seasons';
import { zodiacSeasons } from '../../data/zodiacSeasons';
import { useAstrologicalState } from '../../hooks/useAstrologicalState';
import { RecipeElementalService } from '../../services/RecipeElementalService';
import { logger } from '../../utils/logger';
import { enrichRecipeData } from '../../utils/recipe/recipeEnrichment';
import { filterRecipesByIngredientMappings } from '../../utils/recipe/recipeFiltering';

// Enhanced interfaces
interface ScoredRecipe extends Recipe {
  score: number;
  matchPercentage: number;
  elementalState?: ElementalProperties;
  astrologicalCompatibility?: number;
  compatibilityFactors?: string[];
}

interface RecipeGridProps {
  recipes?: ScoredRecipe[];
  selectedCuisine?: string | null;
  mealType?: string;
  cuisineFilter?: string;
}

type SortOption = 'score' | 'time' | 'traditional' | 'elemental' | 'seasonal' | 'calories' | 'name' | 'difficulty' | 'rating';
type ViewOption = 'grid' | 'list' | 'compact';
type ElementalFilter = 'all' | 'Fire' | 'Water' | 'Air' | 'Earth';

// Recipe Card Component
interface RecipeCardProps {
  recipe: ScoredRecipe;
  viewMode: ViewOption;
  elementalHighlight: ElementalFilter;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  viewMode,
  elementalHighlight,
  isFavorite,
  onToggleFavorite,
  isExpanded,
  onToggleExpanded
}) => {
  const getMatchScoreClass = (score: number): string => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-blue-100 text-blue-800';
    if (score >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const renderElementIcon = (properties?: ElementalProperties) => {
    if (!properties) return null;
    
    const elements = [
      { name: 'Fire', icon: Flame, value: properties.Fire || 0 },
      { name: 'Water', icon: Droplets, value: properties.Water || 0 },
      { name: 'Earth', icon: Mountain, value: properties.Earth || 0 },
      { name: 'Air', icon: Wind, value: properties.Air || 0 }
    ];
    
    const dominant = elements.reduce((max, el) => el.value > max.value ? el : max);
    const IconComponent = dominant.icon;
    
    return <IconComponent className="h-4 w-4" />;
  };

  const renderDietaryBadges = () => {
    const badges = [];
    if ((recipe as Record<string, unknown>).isVegetarian) badges.push('Vegetarian');
    if ((recipe as Record<string, unknown>).isVegan) badges.push('Vegan');
    if ((recipe as Record<string, unknown>).isGlutenFree) badges.push('Gluten-Free');
    if ((recipe as Record<string, unknown>).isDairyFree) badges.push('Dairy-Free');
    
    return badges.map(badge => (
      <span key={badge} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
        {badge}
      </span>
    ));
  };

  if (viewMode === 'compact') {
    return (
      <div className="bg-white rounded-lg shadow-sm p-3 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-semibold text-gray-900 truncate flex-1">
            {recipe.name}
          </h3>
          <button
            onClick={onToggleFavorite}
            className={`p-1 ml-2 ${isFavorite ? 'text-red-500' : 'text-gray-400'}`}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 rounded text-xs ${getMatchScoreClass(recipe.matchPercentage)}`}>
            {recipe.matchPercentage}%
          </span>
          {recipe.elementalState && renderElementIcon(recipe.elementalState)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{recipe.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{recipe.description}</p>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMatchScoreClass(recipe.matchPercentage)}`}>
            {recipe.matchPercentage}% Match
          </span>
          <button
            onClick={onToggleFavorite}
            className={`p-1 ${isFavorite ? 'text-red-500' : 'text-gray-400'}`}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
        {recipe.cookTime && (
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {recipe.cookTime}
          </div>
        )}
        {recipe.servings && (
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {recipe.servings as number} servings
          </div>
        )}
        {recipe.cuisine && (
          <div className="flex items-center">
            <ChefHat className="h-4 w-4 mr-1" />
            {recipe.cuisine}
          </div>
        )}
        {recipe.elementalState && (
          <div className="flex items-center">
            {renderElementIcon(recipe.elementalState)}
            <span className="ml-1">Elemental</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {renderDietaryBadges()}
        {recipe.astrologicalCompatibility && recipe.astrologicalCompatibility > 0.5 && (
          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
            Astrologically Favorable
          </span>
        )}
      </div>

      {recipe.compatibilityFactors && recipe.compatibilityFactors.length > 0 && (
        <div className="text-xs text-gray-500 mb-3">
          <strong>Cosmic alignment:</strong> {recipe.compatibilityFactors.join(', ')}
        </div>
      )}

      <div className="pt-3 border-t">
        <button
          onClick={onToggleExpanded}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {isExpanded ? 'Hide Details' : 'View Details'}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t space-y-4">
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Ingredients:</h4>
              <ul className="space-y-1 text-sm">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index}>
                    • {typeof ingredient === 'string' ? ingredient : ingredient?.name || 'Unknown ingredient'}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {recipe.instructions && recipe.instructions.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Instructions:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index}>
                    {typeof instruction === 'string' ? instruction : String((instruction as unknown as Record<string, unknown>)?.step || 'Unknown step')}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const RecipeGrid: React.FC<RecipeGridProps> = ({ 
  recipes: propRecipes = [], 
  selectedCuisine, 
  mealType, 
  cuisineFilter 
}) => {
  const { state } = useAlchemical();
  const { currentPlanetaryAlignment, currentZodiac, activePlanets, isDaytime } = useAstrologicalState();

  // State management
  const [sortBy, setSortBy] = useState<SortOption>('score');
  const [viewMode, setViewMode] = useState<ViewOption>('grid');
  const [elementalFilter, setElementalFilter] = useState<ElementalFilter>('all');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showElementalMenu, setShowElementalMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<ScoredRecipe[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [timeFactors, setTimeFactors] = useState<TimeFactors | null>(null);

  // Additional filters
  const [dietaryFilter, setDietaryFilter] = useState<string[]>([]);
  const [maxPrepTime, setMaxPrepTime] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number>(0);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const recipeElementalService = RecipeElementalService.getInstance();

  // Load time factors
  useEffect(() => {
    const loadTimeFactors = async () => {
      try {
        const factors = await getTimeFactors();
        // ✅ Pattern MM-1: Type assertion to match TimeFactors interface
        setTimeFactors(factors as unknown as TimeFactors);
      } catch (error) {
        logger.error('Error loading time factors:', error);
      }
    };

    loadTimeFactors();
  }, []);

  // Extract recipes from cuisines data if not provided via props
  useEffect(() => {
    if (propRecipes.length > 0) {
      setRecipes(propRecipes);
      return;
    }

    // Extract recipes from the cuisines data structure
    const extractedRecipes: ScoredRecipe[] = [];
    
    if (cuisines) {
      Object.entries(cuisines).forEach(([cuisineId, cuisine]) => {
        // Skip if there's a cuisine filter and this isn't the right cuisine
        if (cuisineFilter && cuisineId.toLowerCase() !== cuisineFilter.toLowerCase()) {
          return;
        }

        // Process each cuisine's dishes - Safe property access
        const cuisineData = cuisine as Record<string, unknown>;
        if (cuisineData.dishes) {
          let recipeIndex = 0;
          Object.entries(cuisineData.dishes).forEach(([mealTypeKey, mealTypeData]) => {
            if (!mealTypeData) return;
            
            Object.entries(mealTypeData).forEach(([season, seasonRecipes]) => {
              if (!seasonRecipes) return;
              
              // Handle array format
              if (Array.isArray(seasonRecipes)) {
                seasonRecipes.forEach((recipe: Recipe) => {
                  if (!recipe) return;
                  
                  recipeIndex++;
                  const baseName = recipe.name ? recipe.name.toLowerCase().replace(/\s+/g, '-') : 'unknown';
                  const uniqueId = `${cuisineId}-${baseName}-${recipeIndex}`;
                  
                  // Extract and enrich recipe data - Safe property access
                  const enrichedRecipe: ScoredRecipe = {
                    ...enrichRecipeData({
                      ...recipe,
                      id: uniqueId,
                      cuisine: cuisineId,
                      mealType: mealTypeKey,
                      season: [season],
                      elementalProperties: recipe.elementalState || cuisineData.elementalState || recipe.elementalProperties
                    }),
                    score: 0.5,
                    matchPercentage: 50
                  };
                  
                  extractedRecipes.push(enrichedRecipe);
                });
              }
            });
          });
        }
      });
    }

    setRecipes(extractedRecipes);
  }, [propRecipes, cuisineFilter]);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('recipe-favorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (error) {
      logger.error('Error loading favorites:', error);
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('recipe-favorites', JSON.stringify(favorites));
    } catch (error) {
      logger.error('Error saving favorites:', error);
    }
  }, [favorites]);

  const getCurrentSeason = (): string => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  };

  const getElementalScore = (recipe: ScoredRecipe, element: ElementalFilter): number => {
    const standardizedRecipe = recipeElementalService.standardizeRecipe(recipe);
    return element === 'all' ? 1 : (standardizedRecipe?.elementalState?.[element] || 0);
  };

  const getSeasonalScore = (recipe: ScoredRecipe): number => {
    const currentSeason = getCurrentSeason();
    if (recipe.season) {
      if (Array.isArray(recipe.season)) {
        if (recipe.season.includes(currentSeason)) return 2;
        if (recipe.season.includes('all')) return 1;
      } else {
        if (recipe.season === currentSeason) return 2;
        if (recipe.season === 'all') return 1;
      }
    }
    return 0;
  };

  const calculateMatchPercentage = (recipe: ScoredRecipe): number => {
    if (!state.elementalPreference) return 50;
    
    const standardizedRecipe = recipeElementalService.standardizeRecipe(recipe);
    let similarity = recipeElementalService.calculateSimilarity(
      standardizedRecipe.elementalState,
      state.elementalPreference
    );
    
    if (similarity === undefined || isNaN(similarity)) {
      similarity = 0.5;
    }
    
    const enhancedScore = similarity < 0.5 ? similarity * 1.5 : 0.75 + (similarity - 0.5) * 0.5;
    return Math.max(Math.round(enhancedScore * 100), 10);
  };

  // Calculate astrological compatibility
  const calculateAstrologicalCompatibility = (recipeList: ScoredRecipe[]): ScoredRecipe[] => {
    if (!currentPlanetaryAlignment || !currentZodiac) return recipeList;
    
    return recipeList.map((recipe) => {
      let compatibilityScore = 0;
      const compatibilityFactors: string[] = [];
      
      // Check zodiac influences
      if ((recipe as Record<string, unknown>).zodiacInfluences) {
        const zodiacInfluences = (recipe as Record<string, unknown>).zodiacInfluences;
        if (Array.isArray(zodiacInfluences) ? zodiacInfluences.includes(currentZodiac) : zodiacInfluences === currentZodiac) {
          compatibilityScore += 0.3;
          compatibilityFactors.push(`Favorable for ${currentZodiac}`);
        }
      }
      
      // Check planetary influences
      if ((recipe as Record<string, unknown>).astrologicalInfluences && activePlanets) {
        const influences = (recipe as unknown as Record<string, unknown>).astrologicalInfluences;
        const favorablePlanets = (influences as string[])?.filter((planet: string) => 
          Array.isArray(activePlanets) ? activePlanets.includes(planet) : activePlanets === planet
        );
        
        if (favorablePlanets.length > 0) {
          compatibilityScore += 0.2 * favorablePlanets.length;
          compatibilityFactors.push(`Enhanced by ${favorablePlanets.join(', ')}`);
        }
      }
      
      return {
        ...recipe,
        astrologicalCompatibility: Math.min(compatibilityScore, 1),
        compatibilityFactors
      };
    });
  };

  const filteredAndSortedRecipes = useMemo(() => {
    let workingRecipes = [...recipes];
    
    // Apply astrological compatibility
    workingRecipes = calculateAstrologicalCompatibility(workingRecipes);
    
    // Standardize elemental properties for all recipes
    const standardizedRecipes = workingRecipes.map((recipe) => ({
      ...recipe,
      ...recipeElementalService.standardizeRecipe(recipe)
    }));
    
    return standardizedRecipes
      .map((recipe) => ({
        ...recipe,
        matchPercentage: calculateMatchPercentage(recipe)
      }))
      .filter((recipe) => {
        if (!recipe) return false;
        
        // Search query filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchesSearch = 
            recipe.name?.toLowerCase().includes(query) ||
            recipe.description?.toLowerCase().includes(query) ||
            recipe.cuisine?.toLowerCase().includes(query) ||
            (recipe.ingredients || []).some((ing: unknown) => 
              typeof ing === 'string' ? ing.toLowerCase().includes(query) : String((ing  as Record<string, unknown>)?.name || '').toLowerCase().includes(query)
            );
          if (!matchesSearch) return false;
        }
        
        // Cuisine filter
        const cuisineMatch = !selectedCuisine || 
          selectedCuisine.toLowerCase() === recipe.cuisine?.toLowerCase() ||
          recipe.cuisine?.toLowerCase().includes(selectedCuisine.toLowerCase());
        
        // Meal type filter
        const mealTypeMatch = !mealType || 
          (recipe.mealType && (
            Array.isArray(recipe.mealType) ? 
              recipe.mealType.includes(mealType) : 
              recipe.mealType === mealType
          ));
        
        // Seasonal filter
        const currentSeason = getCurrentSeason();
        const seasonMatch = !recipe.season || 
          (Array.isArray(recipe.season) ? 
            recipe.season.includes(currentSeason) || recipe.season.includes('all') :
            recipe.season === currentSeason || recipe.season === 'all'
          );
        
        // Elemental filter
        const elementalMatch = elementalFilter === 'all' || 
          (recipe.elementalState && (Number(recipe.elementalState[elementalFilter] || 0)) >= 0.3);
        
        // Dietary filters
        const dietaryMatch = dietaryFilter.length === 0 || dietaryFilter.every(diet => {
          switch (diet) {
            case 'vegetarian': return (recipe as Record<string, unknown>).isVegetarian;
            case 'vegan': return (recipe as Record<string, unknown>).isVegan;
            case 'gluten-free': return (recipe as Record<string, unknown>).isGlutenFree;
            case 'dairy-free': return (recipe as Record<string, unknown>).isDairyFree;
            default: return true;
          }
        });
        
        // Prep time filter
        const prepTimeMatch = !maxPrepTime || 
          (recipe.cookTime && parseInt(recipe.cookTime) <= maxPrepTime);
        
        // Rating filter
        const ratingMatch = !minRating || 
          ((recipe as Record<string, unknown>).rating && (recipe as Record<string, unknown>).rating >= minRating);
        
        // Favorites filter
        const favoritesMatch = !showFavoritesOnly || favorites.includes(recipe.id);
        
        return cuisineMatch && mealTypeMatch && seasonMatch && elementalMatch && 
               dietaryMatch && prepTimeMatch && ratingMatch && favoritesMatch;
      })
      .sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
          case 'score':
            comparison = b.matchPercentage - a.matchPercentage;
            break;
          case 'time':
            comparison = (parseInt(a.cookTime || '0') || 0) - (parseInt(b.cookTime || '0') || 0);
            break;
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'elemental':
            comparison = getElementalScore(b, elementalFilter) - getElementalScore(a, elementalFilter);
            break;
          case 'seasonal':
            comparison = getSeasonalScore(b) - getSeasonalScore(a);
            break;
          case 'calories':
            comparison = (Number((a as unknown as Record<string, unknown>)?.nutrition?.calories || 0)) - (Number((b as unknown as Record<string, unknown>)?.nutrition?.calories || 0));
            break;
          case 'difficulty':
            comparison = (Number((a as unknown as Record<string, unknown>)?.difficulty || 1)) - (Number((b as unknown as Record<string, unknown>)?.difficulty || 1));
            break;
          case 'rating':
            comparison = (Number((b as unknown as Record<string, unknown>)?.rating || 0)) - (Number((a as unknown as Record<string, unknown>)?.rating || 0));
            break;
          default:
            comparison = b.score - a.score;
        }
        
        return sortDirection === 'desc' ? comparison : -comparison;
      })
      .slice(0, viewMode === 'compact' ? 12 : viewMode === 'list' ? 8 : 6);
  }, [
    recipes, selectedCuisine, mealType, state.elementalPreference, sortBy, sortDirection,
    elementalFilter, searchQuery, dietaryFilter, maxPrepTime, minRating, showFavoritesOnly,
    currentPlanetaryAlignment, currentZodiac, activePlanets, favorites
  ]);

  const getViewModeClass = () => {
    switch (viewMode) {
      case 'compact':
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4';
      case 'list':
        return 'grid-cols-1 gap-4';
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8';
    }
  };

  const toggleFavorite = (recipeId: string) => {
    setFavorites(prev => 
      prev.includes(recipeId) ? 
        prev.filter(id => id !== recipeId) : 
        [...prev, recipeId]
    );
  };

  const toggleRecipe = (id: string) => {
    setExpandedRecipeId(expandedRecipeId === id ? null : id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header with Search and View Controls */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search recipes, ingredients, or cuisines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Controls Row */}
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div className="flex gap-2 flex-wrap">
            {/* Sort Button */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-50 border"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Sort By</span>
                {sortDirection === 'desc' ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
              </button>
              
              {showSortMenu && (
                <div className="absolute top-full mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10 border">
                  {[
                    { value: 'score', label: 'Match Score' },
                    { value: 'name', label: 'Name' },
                    { value: 'time', label: 'Prep Time' },
                    { value: 'rating', label: 'Rating' },
                    { value: 'difficulty', label: 'Difficulty' },
                    { value: 'seasonal', label: 'Seasonal' },
                    { value: 'elemental', label: 'Elemental' },
                    { value: 'calories', label: 'Calories' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        if (sortBy === option.value) {
                          setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
                        } else {
                          setSortBy(option.value as SortOption);
                          setSortDirection('desc');
                        }
                        setShowSortMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${
                        sortBy === option.value ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Elemental Filter */}
            <div className="relative">
              <button
                onClick={() => setShowElementalMenu(!showElementalMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-50 border"
              >
                {elementalFilter === 'Fire' && <Flame className="h-4 w-4 text-red-500" />}
                {elementalFilter === 'Water' && <Droplets className="h-4 w-4 text-blue-500" />}
                {elementalFilter === 'Earth' && <Mountain className="h-4 w-4 text-green-500" />}
                {elementalFilter === 'Air' && <Wind className="h-4 w-4 text-gray-500" />}
                {elementalFilter === 'all' && <CircleDashed className="h-4 w-4" />}
                <span>{elementalFilter === 'all' ? 'All Elements' : elementalFilter}</span>
              </button>
              
              {showElementalMenu && (
                <div className="absolute top-full mt-2 w-40 bg-white rounded-lg shadow-lg py-1 z-10 border">
                  {[
                    { value: 'all', label: 'All Elements', icon: CircleDashed, color: 'text-gray-500' },
                    { value: 'Fire', label: 'Fire', icon: Flame, color: 'text-red-500' },
                    { value: 'Water', label: 'Water', icon: Droplets, color: 'text-blue-500' },
                    { value: 'Earth', label: 'Earth', icon: Mountain, color: 'text-green-500' },
                    { value: 'Air', label: 'Air', icon: Wind, color: 'text-gray-500' }
                  ].map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          setElementalFilter(option.value as ElementalFilter);
                          setShowElementalMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 ${
                          elementalFilter === option.value ? 'bg-blue-50 text-blue-600' : ''
                        }`}
                      >
                        <IconComponent className={`h-4 w-4 ${option.color}`} />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow hover:bg-gray-50 border ${
                showFilters ? 'bg-blue-50 text-blue-600' : 'bg-white'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>

            {/* Favorites Toggle */}
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow hover:bg-gray-50 border ${
                showFavoritesOnly ? 'bg-red-50 text-red-600' : 'bg-white'
              }`}
            >
              <Heart className={`h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              <span>Favorites</span>
            </button>
          </div>

          {/* View Mode Controls */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${
                viewMode === 'grid' ? 'bg-white shadow' : 'hover:bg-gray-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${
                viewMode === 'list' ? 'bg-white shadow' : 'hover:bg-gray-200'
              }`}
              title="List View"
            >
              <LayoutList className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`p-2 rounded ${
                viewMode === 'compact' ? 'bg-white shadow' : 'hover:bg-gray-200'
              }`}
              title="Compact View"
            >
              <Grid className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-4 border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Dietary Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dietary Preferences
                </label>
                <div className="space-y-2">
                  {['vegetarian', 'vegan', 'gluten-free', 'dairy-free'].map(diet => (
                    <label key={diet} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={dietaryFilter.includes(diet)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setDietaryFilter(prev => [...prev, diet]);
                          } else {
                            setDietaryFilter(prev => prev.filter(d => d !== diet));
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm capitalize">{diet.replace('-', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Prep Time Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Prep Time (minutes)
                </label>
                <input
                  type="number"
                  value={maxPrepTime || ''}
                  onChange={(e) => setMaxPrepTime(e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="No limit"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value={0}>Any Rating</option>
                  <option value={1}>1+ Stars</option>
                  <option value={2}>2+ Stars</option>
                  <option value={3}>3+ Stars</option>
                  <option value={4}>4+ Stars</option>
                  <option value={5}>5 Stars</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setDietaryFilter([]);
                    setMaxPrepTime(null);
                    setMinRating(0);
                    setSearchQuery('');
                    setElementalFilter('all');
                    setShowFavoritesOnly(false);
                  }}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="mb-4 flex justify-between items-center text-sm text-gray-600">
        <span>
          Showing {filteredAndSortedRecipes.length} recipes
          {searchQuery && ` for "${searchQuery}"`}
          {selectedCuisine && ` in ${selectedCuisine}`}
        </span>
        {timeFactors && (
          <span className="flex items-center gap-1">
            <Sun className="h-4 w-4" />
            Current season: {String((timeFactors as unknown as Record<string, unknown>)?.season || getCurrentSeason())}
          </span>
        )}
      </div>

      {/* Recipe Grid/List */}
      {filteredAndSortedRecipes.length > 0 ? (
        <div className={`grid ${getViewModeClass()}`}>
          {filteredAndSortedRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              viewMode={viewMode}
              elementalHighlight={elementalFilter}
              isFavorite={favorites.includes(recipe.id)}
              onToggleFavorite={() => toggleFavorite(recipe.id)}
              isExpanded={expandedRecipeId === recipe.id}
              onToggleExpanded={() => toggleRecipe(recipe.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes found</h3>
          <p className="text-gray-500">
            Try adjusting your filters or search terms to find more recipes.
          </p>
        </div>
      )}
    </div>
  );
};

export default RecipeGrid;
