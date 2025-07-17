'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Users, 
  BarChart3,
  Star,
  Sparkles
} from 'lucide-react';
import { ElementalProperties } from '@/types/alchemy';
import { calculateElementalMatch, getMatchScoreClass } from '@/utils/cuisineRecommender';

// ========== INTERFACES ==========

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
  tags?: string[];
  [key: string]: unknown;
}

interface RecipeRecommendationsProps {
  recipes: RecipeData[];
  cuisineName: string;
  currentElementalProfile: ElementalProperties;
  maxDisplayed?: number;
  showExpandedByDefault?: boolean;
  onRecipeSelect?: (recipe: RecipeData) => void;
}

interface ScoredRecipe extends RecipeData {
  astrologicalScore: number;
  elementalScore: number;
  overallScore: number;
  scoringReasons: string[];
}

// ========== HELPER FUNCTIONS ==========

const calculateAstrologicalScore = (recipe: RecipeData): number => {
  // Simple astrological scoring based on recipe properties
  let score = 0.5; // Base score
  
  // Check for astrological tags or properties
  if (recipe.tags) {
    const astrologicalTags = ['lunar', 'solar', 'planetary', 'celestial', 'zodiac'];
    const hasAstrologicalTags = recipe.tags.some(tag => 
      astrologicalTags.some(astroTag => 
        tag.toLowerCase().includes(astroTag)
      )
    );
    if (hasAstrologicalTags) score += 0.2;
  }
  
  // Check cooking time alignment with current moment
  if (recipe.cookTime) {
    const cookTimeStr = recipe.cookTime.toLowerCase();
    const now = new Date();
    const hour = now.getHours();
    
    // Quick cooking for busy times, slow cooking for relaxed times
    if (hour >= 17 && hour <= 20) { // Dinner time
      if (cookTimeStr.includes('quick') || cookTimeStr.includes('15') || cookTimeStr.includes('20')) {
        score += 0.15;
      }
    } else if (hour >= 10 && hour <= 16) { // Relaxed time
      if (cookTimeStr.includes('slow') || cookTimeStr.includes('60') || cookTimeStr.includes('hour')) {
        score += 0.15;
      }
    }
  }
  
  return Math.min(1, score);
};

const scoreRecipe = (recipe: RecipeData, currentElementalProfile: ElementalProperties): ScoredRecipe => {
  // Calculate elemental match score
  const elementalScore = recipe.elementalProperties 
    ? calculateElementalMatch(recipe.elementalProperties, currentElementalProfile)
    : 0.5;
  
  // Calculate astrological score
  const astrologicalScore = calculateAstrologicalScore(recipe);
  
  // Calculate overall score (weighted combination)
  const overallScore = (elementalScore * 0.6) + (astrologicalScore * 0.4);
  
  // Generate scoring reasons
  const scoringReasons: string[] = [];
  
  if (elementalScore > 0.7) {
    scoringReasons.push(`Excellent elemental harmony (${Math.round(elementalScore * 100)}%)`);
  } else if (elementalScore > 0.5) {
    scoringReasons.push(`Good elemental match (${Math.round(elementalScore * 100)}%)`);
  }
  
  if (astrologicalScore > 0.6) {
    scoringReasons.push('Aligned with current celestial energies');
  }
  
  if (recipe.difficulty === 'Easy' || recipe.difficulty === 'easy') {
    scoringReasons.push('Perfect for beginners');
  }
  
  if (recipe.cookTime && recipe.cookTime.includes('30')) {
    scoringReasons.push('Quick preparation time');
  }
  
  return {
    ...recipe,
    elementalScore,
    astrologicalScore,
    overallScore,
    scoringReasons,
    matchPercentage: Math.round(overallScore * 100)
  };
};

// ========== RECIPE CARD COMPONENT ==========

const RecipeCard: React.FC<{
  recipe: ScoredRecipe;
  isExpanded: boolean;
  onToggle: () => void;
  onSelect?: (recipe: RecipeData) => void;
}> = ({ recipe, isExpanded, onToggle, onSelect }) => {
  const handleCardClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle();
  }, [onToggle]);

  const handleSelectClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(recipe);
    }
  }, [onSelect, recipe]);

  return (
    <div className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow cursor-pointer">
      <div onClick={handleCardClick}>
        {/* Recipe Header */}
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium text-base text-gray-900 flex-1 mr-2">
            {recipe.name}
          </h4>
          <div className="flex items-center space-x-2">
            <span className={`text-xs px-2 py-1 rounded-full ${getMatchScoreClass(recipe.overallScore)}`}>
              {recipe.matchPercentage}%
            </span>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>

        {/* Recipe Meta Info */}
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
          {recipe.cookTime && (
            <div className="flex items-center space-x-1">
              <Clock size={14} />
              <span>{recipe.cookTime}</span>
            </div>
          )}
          {recipe.servingSize && (
            <div className="flex items-center space-x-1">
              <Users size={14} />
              <span>{recipe.servingSize} servings</span>
            </div>
          )}
          {recipe.difficulty && (
            <div className="flex items-center space-x-1">
              <BarChart3 size={14} />
              <span>{recipe.difficulty}</span>
            </div>
          )}
        </div>

        {/* Scoring Reasons */}
        {recipe.scoringReasons.length > 0 && (
          <div className="mb-2">
            <div className="flex items-center space-x-1 text-xs text-blue-600">
              <Sparkles size={12} />
              <span>{recipe.scoringReasons[0]}</span>
            </div>
          </div>
        )}

        {/* Short Description */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
          {recipe.description}
        </p>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {/* Full Description */}
          {recipe.description && (
            <div className="mb-4">
              <h5 className="font-medium text-sm mb-2">Description</h5>
              <p className="text-sm text-gray-600">{recipe.description}</p>
            </div>
          )}

          {/* Detailed Scores */}
          <div className="mb-4">
            <h5 className="font-medium text-sm mb-2">Compatibility Scores</h5>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 p-2 rounded">
                <div className="text-xs text-blue-600 font-medium">Elemental Match</div>
                <div className="text-sm font-semibold text-blue-800">
                  {Math.round(recipe.elementalScore * 100)}%
                </div>
              </div>
              <div className="bg-purple-50 p-2 rounded">
                <div className="text-xs text-purple-600 font-medium">Astrological</div>
                <div className="text-sm font-semibold text-purple-800">
                  {Math.round(recipe.astrologicalScore * 100)}%
                </div>
              </div>
            </div>
          </div>

          {/* All Scoring Reasons */}
          {recipe.scoringReasons.length > 1 && (
            <div className="mb-4">
              <h5 className="font-medium text-sm mb-2">Why This Recipe?</h5>
              <ul className="list-disc pl-4 space-y-1">
                {recipe.scoringReasons.map((reason, index) => (
                  <li key={index} className="text-xs text-gray-600">{reason}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Ingredients Preview */}
          {recipe.ingredients && Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 && (
            <div className="mb-4">
              <h5 className="font-medium text-sm mb-2">Key Ingredients</h5>
              <div className="flex flex-wrap gap-1">
                {recipe.ingredients.slice(0, 8).map((ing, index) => (
                  <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {typeof ing === 'string' ? ing : (ing as any).name || 'ingredient'}
                  </span>
                ))}
                {recipe.ingredients.length > 8 && (
                  <span className="text-xs text-gray-500">+{recipe.ingredients.length - 8} more</span>
                )}
              </div>
            </div>
          )}

          {/* Action Button */}
          {onSelect && (
            <button
              onClick={handleSelectClick}
              className="w-full mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Star size={16} />
              <span>Select This Recipe</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ========== MAIN COMPONENT ==========

export const RecipeRecommendations: React.FC<RecipeRecommendationsProps> = ({
  recipes,
  cuisineName,
  currentElementalProfile,
  maxDisplayed = 6,
  showExpandedByDefault = false,
  onRecipeSelect
}) => {
  const [expandedRecipes, setExpandedRecipes] = useState<Record<string, boolean>>({});
  const [showAllRecipes, setShowAllRecipes] = useState(false);

  // Score and sort recipes
  const scoredRecipes = useMemo(() => {
    return recipes
      .map(recipe => scoreRecipe(recipe, currentElementalProfile))
      .sort((a, b) => b.overallScore - a.overallScore);
  }, [recipes, currentElementalProfile]);

  // Determine which recipes to display
  const displayedRecipes = useMemo(() => {
    return showAllRecipes ? scoredRecipes : scoredRecipes.slice(0, maxDisplayed);
  }, [scoredRecipes, showAllRecipes, maxDisplayed]);

  const toggleRecipeExpansion = useCallback((recipeId: string) => {
    setExpandedRecipes(prev => ({
      ...prev,
      [recipeId]: !prev[recipeId]
    }));
  }, []);

  const toggleShowAll = useCallback(() => {
    setShowAllRecipes(prev => !prev);
  }, []);

  if (scoredRecipes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No recipes found for {cuisineName} cuisine.</p>
        <p className="text-sm mt-1">Try exploring other cuisines or check back later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          {cuisineName} Recipe Recommendations
        </h3>
        <span className="text-sm text-gray-500">
          {scoredRecipes.length} recipe{scoredRecipes.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id || recipe.name}
            recipe={recipe}
            isExpanded={expandedRecipes[recipe.id || recipe.name || ''] || showExpandedByDefault}
            onToggle={() => toggleRecipeExpansion(recipe.id || recipe.name || '')}
            onSelect={onRecipeSelect}
          />
        ))}
      </div>

      {/* Show More/Less Button */}
      {scoredRecipes.length > maxDisplayed && (
        <div className="text-center">
          <button
            onClick={toggleShowAll}
            className="inline-flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
          >
            {showAllRecipes ? (
              <>
                <ChevronUp size={16} />
                <span>Show Less</span>
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                <span>Show All {scoredRecipes.length} Recipes</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default RecipeRecommendations;