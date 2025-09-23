/**
 * Enhanced Recommendation Engine Component - Minimal Recovery Version
 *
 * Provides sophisticated recipe recommendations with dietary restrictions,
 * cuisine preferences, and alchemical compatibility scoring.
 */

'use client';

import React from 'react';

interface RecommendationFilters {
  dietaryRestrictions: string[],
  cuisinePreferences: string[];
}

interface Recipe {
  id: string,
  name: string,
  cuisine: string,
  description: string,
  cookingTime: number,
  difficulty: 'Easy' | 'Medium' | 'Hard'
  rating: number,
  tags: string[];
}

interface RecommendationResult {
  recipe: Recipe,
  score: number,
  matchReasons: string[],
  alchemicalCompatibility: number;
}

interface EnhancedRecommendationEngineProps {
  filters?: RecommendationFilters,
  maxRecommendations?: number,
  showScoring?: boolean,
  className?: string;
}

const DIETARY_OPTIONS = [
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'nut-free',
  'keto',
  'paleo',
  'low-carb',
  'low-sodium'
] as const;

const CUISINE_OPTIONS = [
  'italian',
  'chinese',
  'indian',
  'mexican',
  'thai',
  'japanese',
  'french',
  'mediterranean',
  'american',
  'korean'
] as const;

// Mock recipes data
const MOCK_RECIPES: Recipe[] = [
  {
    id: '1',
    name: 'Margherita Pizza',
    cuisine: 'italian',
    description: 'Classic Italian pizza with fresh tomatoes, mozzarella, and basil',
    cookingTime: 25,
    difficulty: 'Medium',
    rating: 4.5,
    tags: ['vegetarian', 'italian', 'comfort-food']
  },
  {
    id: '2',
    name: 'Chicken Tikka Masala',
    cuisine: 'indian',
    description: 'Creamy tomato-based curry with tender chicken pieces',
    cookingTime: 40,
    difficulty: 'Medium',
    rating: 4.7,
    tags: ['indian', 'spicy', 'curry']
  },
  {
    id: '3',
    name: 'Caesar Salad',
    cuisine: 'american',
    description: 'Fresh romaine lettuce with parmesan cheese and croutons',
    cookingTime: 10,
    difficulty: 'Easy',
    rating: 4.2,
    tags: ['vegetarian', 'salad', 'quick']
  },
  {
    id: '4',
    name: 'Pad Thai',
    cuisine: 'thai',
    description: 'Stir-fried rice noodles with vegetables and peanut sauce',
    cookingTime: 20,
    difficulty: 'Medium',
    rating: 4.6,
    tags: ['thai', 'vegan', 'noodles']
  },
  {
    id: '5',
    name: 'Sushi Bowl',
    cuisine: 'japanese',
    description: 'Deconstructed sushi with rice, fish, and vegetables',
    cookingTime: 15,
    difficulty: 'Easy',
    rating: 4.4,
    tags: ['japanese', 'healthy', 'gluten-free']
  }
];

export function EnhancedRecommendationEngine({
  filters = { dietaryRestrictions: [], cuisinePreferences: [] },
  maxRecommendations = 5,
  showScoring = true,
  className = ''
}: EnhancedRecommendationEngineProps) {
  const [currentFilters, setCurrentFilters] = React.useState<RecommendationFilters>(filters);
  const [recommendations, setRecommendations] = React.useState<RecommendationResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  // Mock function for alchemical compatibility
  const calculateAlchemicalCompatibility = (recipe: Recipe): number => {
    // Simple mock calculation based on cuisine and tags
    let compatibility = 0.5;
    if (recipe.tags.includes('healthy')) compatibility += 0.2;
    if (recipe.tags.includes('vegetarian')) compatibility += 0.1;
    if (recipe.cuisine === 'italian') compatibility += 0.1;
    if (recipe.cuisine === 'indian') compatibility += 0.15;
    return Math.min(compatibility, 1.0);
  };

  // Generate recommendations based on filters
  const generateRecommendations = React.useCallback(async () => {
    setIsLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    let filteredRecipes = MOCK_RECIPES;

    // Apply dietary restrictions
    if (currentFilters.dietaryRestrictions.length > 0) {
      filteredRecipes = filteredRecipes.filter(recipe =>
        currentFilters.dietaryRestrictions.some(restriction =>
          recipe.tags.includes(restriction)
        )
      );
    }

    // Apply cuisine preferences
    if (currentFilters.cuisinePreferences.length > 0) {
      filteredRecipes = filteredRecipes.filter(recipe =>
        currentFilters.cuisinePreferences.includes(recipe.cuisine)
      );
    }

    // Calculate scores and compatibility
    const results: RecommendationResult[] = filteredRecipes.map(recipe => {
      const alchemicalCompatibility = calculateAlchemicalCompatibility(recipe);
      const baseScore = recipe.rating / 5.0;
      const difficultyBonus = recipe.difficulty === 'Easy' ? 0.1 : 0;
      const timeBonus = recipe.cookingTime <= 20 ? 0.1 : 0,

      const score = Math.min(baseScore + difficultyBonus + timeBonus + (alchemicalCompatibility * 0.2), 1.0);

      const matchReasons: string[] = [],
      if (currentFilters.dietaryRestrictions.some(r => recipe.tags.includes(r))) {
        matchReasons.push('Meets dietary requirements');
      }
      if (currentFilters.cuisinePreferences.includes(recipe.cuisine)) {
        matchReasons.push('Preferred cuisine');
      }
      if (recipe.rating >= 4.5) {
        matchReasons.push('Highly rated');
      }
      if (recipe.cookingTime <= 20) {
        matchReasons.push('Quick to prepare');
      }

      return {
        recipe,
        score,
        matchReasons,
        alchemicalCompatibility
      };
    });

    // Sort by score and limit results
    const sortedResults = results
      .sort((a, b) => b.score - a.score)
      .slice(0, maxRecommendations);

    setRecommendations(sortedResults);
    setIsLoading(false);
  }, [currentFilters, maxRecommendations]);

  React.useEffect(() => {
    generateRecommendations();
  }, [generateRecommendations]);

  const handleDietaryChange = (restriction: string, checked: boolean) => {
    setCurrentFilters(prev => ({
      ...prev,
      dietaryRestrictions: checked
        ? [...prev.dietaryRestrictions, restriction]
        : prev.dietaryRestrictions.filter(r => r !== restriction)
    }));
  };

  const handleCuisineChange = (cuisine: string, checked: boolean) => {
    setCurrentFilters(prev => ({
      ...prev,
      cuisinePreferences: checked
        ? [...prev.cuisinePreferences, cuisine]
        : prev.cuisinePreferences.filter(c => c !== cuisine)
    }));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#22c55e',
      case 'Medium': return '#f59e0b',
      case 'Hard': return '#ef4444',
      default: return '#6b7280';
    }
  };

  return (
    <div className={`enhanced-recommendation-engine ${className}`} style={{
      padding: '24px',
      backgroundColor: '#fff',
      borderRadius: '12px',
      border: '1px solid #e0e0e0'
}}>
      <h2 style={{
        margin: '0 0 20px 0',
        fontSize: '24px',
        fontWeight: '600',
        color: '#333'
}}>
        🍳 Enhanced Recipe Recommendations
      </h2>

      {/* Filters Section */}
      <div style={{
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
}}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '16px',
          fontWeight: '600',
          color: '#333'
}}>
          Filters
        </h3>

        <div style={{ marginBottom: '16px' }}>
          <h4 style={{
            margin: '0 0 8px 0',
            fontSize: '14px',
            fontWeight: '500',
            color: '#666'
}}>
            Dietary Restrictions
          </h4>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
}}>
            {DIETARY_OPTIONS.map(option => (
              <label key={option} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                cursor: 'pointer',
                padding: '4px 8px',
                backgroundColor: currentFilters.dietaryRestrictions.includes(option) ? '#e0f2fe' : '#fff',
                border: '1px solid #ddd',
                borderRadius: '4px'
}}>
                <input
                  type="checkbox"
                  checked={currentFilters.dietaryRestrictions.includes(option)}
                  onChange={(e) => handleDietaryChange(option, e.target.checked)}
                  style={{ margin: 0 }}
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        <div>
          <h4 style={{
            margin: '0 0 8px 0',
            fontSize: '14px',
            fontWeight: '500',
            color: '#666'
}}>
            Cuisine Preferences
          </h4>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
}}>
            {CUISINE_OPTIONS.map(option => (
              <label key={option} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                cursor: 'pointer',
                padding: '4px 8px',
                backgroundColor: currentFilters.cuisinePreferences.includes(option) ? '#e0f2fe' : '#fff',
                border: '1px solid #ddd',
                borderRadius: '4px'
}}>
                <input
                  type="checkbox"
                  checked={currentFilters.cuisinePreferences.includes(option)}
                  onChange={(e) => handleCuisineChange(option, e.target.checked)}
                  style={{ margin: 0 }}
                />
                {option}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
}}>
          <h3 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '600',
            color: '#333'
}}>
            Recommendations
          </h3>
          <button
            onClick={generateRecommendations}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1
}}
          >
            {isLoading ? 'Generating...' : 'Refresh'}
          </button>
        </div>

        {isLoading ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666'
}}>
            Generating personalized recommendations...
          </div>
        ) : recommendations.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666'
}}>
            No recipes found matching your criteria. Try adjusting your filters.
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
}}>
            {recommendations.map((result, index) => (
              <div key={result.recipe.id} style={{
                padding: '16px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                backgroundColor: '#fff'
}}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '8px'
}}>
                  <div>
                    <h4 style={{
                      margin: '0 0 4px 0',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#333'
}}>
                      #{index + 1} {result.recipe.name}
                    </h4>
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      color: '#666',
                      lineHeight: '1.4'
}}>
                      {result.recipe.description}
                    </p>
                  </div>
                  {showScoring && (
                    <div style={{
                      textAlign: 'right',
                      minWidth: '80px'
}}>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#22c55e'
}}>
                        {(result.score * 100).toFixed(0)}%
                      </div>
                      <div style={{
                        fontSize: '10px',
                        color: '#666'
}}>
                        Match Score
                      </div>
                    </div>
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
}}>
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    fontSize: '12px',
                    color: '#666'
}}>
                    <span>🍽️ {result.recipe.cuisine}</span>
                    <span>⏱️ {result.recipe.cookingTime}min</span>
                    <span style={{ color: getDifficultyColor(result.recipe.difficulty) }}>
                      ⭐ {result.recipe.difficulty}
                    </span>
                    <span>⭐ {result.recipe.rating}/5</span>
                  </div>
                </div>

                {showScoring && result.matchReasons.length > 0 && (
                  <div style={{
                    marginTop: '8px',
                    padding: '8px',
                    backgroundColor: '#f0f9ff',
                    borderRadius: '4px'
}}>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#0369a1',
                      marginBottom: '4px'
}}>
                      Why this matches:
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#0369a1'
}}>
                      {result.matchReasons.join(' • ')}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#0369a1',
                      marginTop: '4px'
}}>
                      Alchemical Compatibility: {(result.alchemicalCompatibility * 100).toFixed(0)}%
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EnhancedRecommendationEngine;