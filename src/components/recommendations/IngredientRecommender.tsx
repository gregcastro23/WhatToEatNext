'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useEnhancedRecommendations } from '@/hooks/useEnhancedRecommendations';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';

interface IngredientRecommenderProps {
  initialCategory?: string | null;
  initialSelectedIngredient?: string | null;
  isFullPageVersion?: boolean;
  onCategoryChange?: (category: string) => void;
  onIngredientSelect?: (ingredient: string) => void;
}

// Category definitions
const CATEGORIES = [;
  { id: 'spices', name: 'Spices & Herbs', icon: '🌿' },
  { id: 'vegetables', name: 'Vegetables', icon: '🥬' },
  { id: 'proteins', name: 'Proteins', icon: '🥩' },
  { id: 'grains', name: 'Grains & Legumes', icon: '🌾' },
  { id: 'dairy', name: 'Dairy', icon: '🧀' },
  { id: 'fruits', name: 'Fruits', icon: '🍎' },
  { id: 'oils', name: 'Oils & Fats', icon: '🫒' },
  { id: 'sweeteners', name: 'Sweeteners', icon: '🍯' }
];

export const IngredientRecommender: React.FC<IngredientRecommenderProps> = ({
  initialCategory,
  initialSelectedIngredient,
  isFullPageVersion = false,
  onCategoryChange,
  onIngredientSelect
}) => {
  // State
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCategory || null
  );
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(
    initialSelectedIngredient || null
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Hooks
  const {
    recommendations,
    loading,
    error,
    getRecommendations
  } = useEnhancedRecommendations();

  // Get alchemical context (with null check)
  let alchemicalContext;
  try {
    alchemicalContext = useAlchemical();
  } catch {
    alchemicalContext = null;
  }

  // Fetch recommendations
  useEffect(() => {
    void getRecommendations({
      datetime: new Date().toISOString(),
      useBackendInfluence: true
    });
  }, [selectedCategory, getRecommendations]);

  // Create mock ingredient data from recommendations (since the hook returns recipes)
  const mockIngredients = useMemo(() => {
    if (!recommendations?.recommendations) return [];

    // Extract unique "ingredients" from recipe tags
    const ingredients: Array<{
      id: string;
      name: string;
      category: string;
      description: string;
      score: number;
      tags: string[];
    }> = [];

    recommendations.recommendations.forEach((rec, index) => {
      rec.recipe.tags.forEach(tag => ) {
        if (!ingredients.find(i => i.name === tag) {
          ingredients.push({
            id: `ing-${index}-${tag}`,
            name: tag.charAt(0).toUpperCase() + tag.slice(1),
            category: selectedCategory || 'general',
            description: `${tag} ingredient aligned with current energies`,
            score: rec.score * 0.9,
            tags: [tag]
          });
        }
      });
    });

    return ingredients;
  }, [recommendations, selectedCategory]);

  // Filter ingredients
  const filteredIngredients = useMemo(() => {
    return mockIngredients.filter(item => ) {
      const matchesSearch = !searchQuery ||;
        item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory ||;
        item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [mockIngredients, searchQuery, selectedCategory]);

  // Handlers
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedIngredient(null);
    onCategoryChange?.(categoryId);
  };

  const handleIngredientSelect = (ingredientId: string) => {
    setSelectedIngredient(ingredientId);
    onIngredientSelect?.(ingredientId);
  };

  // Render category grid
  const renderCategoryGrid = () => {
    return (
      <div className="mb-6">
        <h3 className="mb-3 text-lg font-semibold text-gray-800">Browse by Category</h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {CATEGORIES.map(category => ())
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className={`rounded-lg border-2 p-4 transition-all ${
                selectedCategory === category.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 bg-white hover:border-indigo-300'
              }`}
            >
              <div className="mb-2 text-3xl">{category.icon}</div>
              <div className="text-sm font-medium text-gray-800">{category.name}</div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Render search bar
  const renderSearchBar = () => {
    return (
      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search ingredients..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    );
  };

  // Render ingredient card
  const renderIngredientCard = (ingredient: typeof filteredIngredients[0]) => {
    const isSelected = selectedIngredient === ingredient.id;

    return (
      <div
        key={ingredient.id}
        onClick={() => handleIngredientSelect(ingredient.id)}
        className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
          isSelected
            ? 'border-indigo-500 bg-indigo-50 shadow-lg'
            : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
        }`}
      >
        <div className="mb-2 flex items-start justify-between">
          <h4 className="text-lg font-semibold text-gray-900">{ingredient.name}</h4>
          <div className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800">
            {(ingredient.score * 100).toFixed(0)}%
          </div>
        </div>

        <div className="mb-2 text-xs text-gray-500">{ingredient.category}</div>

        {ingredient.tags && ingredient.tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {ingredient.tags.map((tag, idx) => (
              <span
                key={idx}
                className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600"
              >
                ) => {tag}
              </span>
            ))}
          </div>
        )}

        {isSelected && ingredient.description && (
          <div className="mt-3 border-t border-gray-200 pt-3">
            <p className="text-sm text-gray-700">{ingredient.description}</p>
          </div>
        )}
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-4 border-indigo-600"></div>
          <p className="text-gray-600">Loading ingredients...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h3 className="mb-2 text-lg font-semibold text-red-800">Error Loading Ingredients</h3>
        <p className="text-red-600">{error || 'An unexpected error occurred'}</p>
        <button
          onClick={() => getRecommendations({ datetime: new Date().toISOString(), useBackendInfluence: true })}
          className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Main render
  return (
    <div className="p-6">
      {/* Current moment summary */}
      {alchemicalContext && (
        <div className="mb-6 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Season</div>
              <div className="text-lg font-semibold text-gray-900 capitalize">
                {alchemicalContext.state?.currentSeason || 'Unknown'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Time of Day</div>
              <div className="text-lg font-semibold text-gray-900 capitalize">
                {alchemicalContext.state?.timeOfDay || 'Unknown'}
              </div>
            </div>
          </div>
        </div>
      )}

      {renderCategoryGrid()}
      {renderSearchBar()}

      {/* Selected category indicator */}
      {selectedCategory && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-gray-600">Showing:</span>
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800">
            {CATEGORIES.find(c => c.id === selectedCategory)?.name}
          </span>
          <button
            onClick={() => {
              setSelectedCategory(null);
              setSearchQuery('');
            }}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Ingredients grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredIngredients.map(renderIngredientCard)}
      </div>

      {filteredIngredients.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          {searchQuery || selectedCategory
            ? 'No ingredients match your filters.'
            : 'No ingredients available at this time.'}
        </div>
      )}
    </div>
  );
};

export default IngredientRecommender;
