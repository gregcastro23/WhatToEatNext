// src/components/recipe/RecipeGrid.tsx

import { useState, useMemo } from 'react';
import { RecipeCard } from './RecipeCard';
import { getCurrentSeason } from '@/data/seasons';
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
  List
} from 'lucide-react';
import type { ScoredRecipe } from '@/types/recipe';
import { useAlchemical } from '@/contexts/AlchemicalContext';

interface RecipeGridProps {
  recipes: ScoredRecipe[];
  selectedCuisine: string | null;
  mealType: string;
}

type SortOption = 'score' | 'time' | 'traditional' | 'elemental' | 'seasonal' | 'calories';
type ViewOption = 'grid' | 'list' | 'compact';
type ElementalFilter = 'all' | 'Fire' | 'Water' | 'Air' | 'Earth';

export const RecipeGrid: React.FC<RecipeGridProps> = ({ 
  recipes, 
  selectedCuisine, 
  mealType 
}) => {
  const { state } = useAlchemical();
  const [sortBy, setSortBy] = useState<SortOption>('score');
  const [viewMode, setViewMode] = useState<ViewOption>('grid');
  const [elementalFilter, setElementalFilter] = useState<ElementalFilter>('all');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showElementalMenu, setShowElementalMenu] = useState(false);
  const currentSeason = getCurrentSeason();

  const getElementalScore = (recipe: ScoredRecipe, element: ElementalFilter) => {
    return recipe.elementalProperties?.[element] || 0;
  };

  const getSeasonalScore = (recipe: ScoredRecipe) => {
    if (recipe.season?.includes(currentSeason)) return 2;
    if (recipe.season?.includes('all')) return 1;
    return 0;
  };

  const calculateMatchPercentage = (recipe: ScoredRecipe): number => {
    if (!recipe.elementalProperties || !state.elementalState) return 0;

    const elements = ['Fire', 'Water', 'Earth', 'Air'] as const;
    
    // Calculate similarity for each element
    const similarities = elements.map(element => {
      const recipeValue = recipe.elementalProperties[element] || 0;
      const balanceValue = state.elementalState[element] || 0;
      
      // Calculate how close the values are (0 = perfect match)
      const difference = Math.abs(recipeValue - balanceValue);
      return 1 - difference;
    });

    // Average the similarities and convert to percentage
    const matchScore = similarities.reduce((sum, sim) => sum + sim, 0) / elements.length;
    return Math.round(matchScore * 100);
  };

  const filteredAndSortedRecipes = useMemo(() => {
    return recipes
      .map(recipe => ({
        ...recipe,
        matchPercentage: calculateMatchPercentage(recipe)
      }))
      .filter(recipe => {
        if (!recipe) return false;
        
        const cuisineMatch = !selectedCuisine || 
          selectedCuisine.toLowerCase() === recipe.cuisine?.split(' ')[0].toLowerCase() || 
          recipe.cuisine?.toLowerCase().includes(selectedCuisine.toLowerCase());
        
        const mealTypeMatch = !mealType || 
          (recipe.mealType && recipe.mealType.includes(mealType));
        
        const seasonMatch = !recipe.season || 
          recipe.season.includes(currentSeason) || 
          recipe.season.includes('all');

        const elementalMatch = elementalFilter === 'all' || 
          (recipe.elementalProperties && 
           recipe.elementalProperties[elementalFilter] >= 0.3);

        return cuisineMatch && mealTypeMatch && seasonMatch && elementalMatch;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'score':
            return b.matchPercentage - a.matchPercentage;
          case 'time':
            return (parseInt(a.timeToMake) || 0) - (parseInt(b.timeToMake) || 0);
          case 'traditional':
            return (b.traditional || 0) - (a.traditional || 0);
          case 'elemental':
            return getElementalScore(b, elementalFilter) - getElementalScore(a, elementalFilter);
          case 'seasonal':
            return getSeasonalScore(b) - getSeasonalScore(a);
          case 'calories':
            return (a.nutrition?.calories || 0) - (b.nutrition?.calories || 0);
          default:
            return (b.totalScore || 0) - (a.totalScore || 0);
        }
      })
      .slice(0, viewMode === 'compact' ? 9 : 6);
  }, [recipes, selectedCuisine, mealType, state.elementalState, sortBy]);

  const getViewModeClass = () => {
    switch (viewMode) {
      case 'compact':
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4';
      case 'list':
        return 'grid-cols-1 gap-4';
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Controls */}
      <div className="mb-6 flex flex-wrap gap-4 justify-between items-center">
        <div className="flex gap-2">
          {/* Sort Button */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-50"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Sort By</span>
            </button>
            
            {showSortMenu && (
              <div className="absolute top-full mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
                <button
                  onClick={() => { setSortBy('score'); setShowSortMenu(false); }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                >
                  <Star className="h-4 w-4" /> Best Match
                </button>
                <button
                  onClick={() => { setSortBy('time'); setShowSortMenu(false); }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" /> Cooking Time
                </button>
                {/* Add other sort options */}
              </div>
            )}
          </div>

          {/* Elemental Filter */}
          <div className="relative">
            <button
              onClick={() => setShowElementalMenu(!showElementalMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-50"
            >
              {elementalFilter === 'Fire' && <Flame className="h-4 w-4 text-red-500" />}
              {elementalFilter === 'Water' && <Droplets className="h-4 w-4 text-blue-500" />}
              {elementalFilter === 'Air' && <Wind className="h-4 w-4 text-sky-500" />}
              {elementalFilter === 'Earth' && <Mountain className="h-4 w-4 text-amber-700" />}
              {elementalFilter}
            </button>

            {showElementalMenu && (
              <div className="absolute top-full mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
                {['all', 'Fire', 'Water', 'Air', 'Earth'].map((element) => (
                  <button
                    key={element}
                    onClick={() => { 
                      setElementalFilter(element as ElementalFilter); 
                      setShowElementalMenu(false); 
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100"
                  >
                    {element}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {(['grid', 'list', 'compact'] as const).map((
            viewOption, index
          ) => (
            <button
              key={viewOption}
              onClick={() => setViewMode(viewOption as ViewOption)}
              className={`w-10 h-10 flex items-center justify-center rounded-lg ${
                viewMode === viewOption ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-200'
              }`}
            >
              {viewOption === 'grid' && <LayoutGrid className="h-4 w-4" />}
              {viewOption === 'list' && <LayoutList className="h-4 w-4" />}
              {viewOption === 'compact' && <Grid className="h-4 w-4" />}
            </button>
          ))}
        </div>
      </div>

      {/* Recipe Grid */}
      {filteredAndSortedRecipes.length > 0 ? (
        <div className={`grid ${getViewModeClass()}`}>
          {filteredAndSortedRecipes.map((recipe, index) => (
            <div
              key={`${recipe.name}-${index}`}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <RecipeCard 
                recipe={recipe} 
                viewMode={viewMode}
                elementalHighlight={elementalFilter}
                matchPercentage={recipe.matchPercentage}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No recipes found for {selectedCuisine ? `${selectedCuisine} cuisine` : 'selected filters'}.
            <br />
            <span className="text-sm opacity-75">
              Try adjusting the elemental filter or changing the meal type.
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default RecipeGrid;