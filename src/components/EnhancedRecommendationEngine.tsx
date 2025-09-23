'use client';

import React from 'react';
import { alchmAPI, type RecommendationRequest, type Recipe } from '@/lib/api/alchm-client';
import { logger } from '@/lib/logger';

interface RecommendationEngineProps {
  onRecipeSelect?: (recipe: Recipe) => void,
  className?: string,
}

interface RecommendationState {
  loading: boolean,
  recipes: Recipe[],
  error: string | null,
  ingredients: string[],
  dietaryRestrictions: string[],
  cuisinePreferences: string[],
}

const DIETARY_OPTIONS = [
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'nut-free',
  'keto',
  'paleo',
  'low-sodium',
] as const,

const CUISINE_OPTIONS = [
  'italian',
  'chinese',
  'indian',
  'mexican',
  'japanese',
  'thai',
  'french',
  'mediterranean',
  'american',
  'korean',
] as const,

export function EnhancedRecommendationEngine({ onRecipeSelect, className = '' }: RecommendationEngineProps) {
  const [state, setState] = React.useState<RecommendationState>({
    loading: false,
    recipes: [],
    error: null,
    ingredients: [],
    dietaryRestrictions: [],
    cuisinePreferences: [],
  })

  const [newIngredient, setNewIngredient] = React.useState('')

  const addIngredient = () => {
    if (newIngredient.trim() && !state.ingredients.includes(newIngredient.trim())) {
      setState(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, newIngredient.trim()]
      }))
      setNewIngredient('')
    }
  }

  const removeIngredient = (ingredient: string) => {
    setState(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(i => i !== ingredient)
    }))
  }

  const toggleDietaryRestriction = (restriction: string) => {
    setState(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(restriction)
        ? prev.dietaryRestrictions.filter(r => r !== restriction)
        : [...prev.dietaryRestrictions, restriction]
    }))
  }

  const toggleCuisinePreference = (cuisine: string) => {
    setState(prev => ({
      ...prev,
      cuisinePreferences: prev.cuisinePreferences.includes(cuisine)
        ? prev.cuisinePreferences.filter(c => c !== cuisine)
        : [...prev.cuisinePreferences, cuisine]
    }))
  }

  const getRecommendations = async () => {
    if (state.ingredients.length === 0) {
      setState(prev => ({ ...prev, error: 'Please add at least one ingredient' }))
      return,
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const request: RecommendationRequest = {
        ingredients: state.ingredients,
        dietaryRestrictions: state.dietaryRestrictions,
        cuisinePreferences: state.cuisinePreferences,
      }

      logger.info('EnhancedRecommendationEngine requesting recommendations', request)

      const recipes = await alchmAPI.getRecommendations(request)

      setState(prev => ({
        ...prev,
        loading: false,
        recipes,
        error: null
      }))

      logger.debug('EnhancedRecommendationEngine received recommendations', { count: recipes.length })
    } catch (error) {
      logger.error('EnhancedRecommendationEngine failed to get recommendations', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to get recommendations'
      }))
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addIngredient()
    }
  }

  return (
    <div className={`enhanced-recommendation-engine ${className}`}
         style={{
           border: '1px solid #ddd',
           borderRadius: '8px',
           padding: '20px',
           maxWidth: '600px',
           backgroundColor: '#fff'
         }}>
      <h2 style={{
        margin: '0 0 20px 0',
        color: '#333',
        fontSize: '24px',
        fontWeight: '600'
      }}>
        🔮 Alchemical Recipe Recommendations
      </h2>

      {/* Ingredients Input */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontWeight: '500',
          color: '#555'
        }}>
          Ingredients:
        </label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input
            type="text"
            value={newIngredient}
            onChange={(e) => setNewIngredient(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter an ingredient..."
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          <button
            onClick={addIngredient}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Add
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {state.ingredients.map(ingredient => (
            <span
              key={ingredient}
              style={{
                backgroundColor: '#e9ecef',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {ingredient}
              <button
                onClick={() => removeIngredient(ingredient)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: 0
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Dietary Restrictions */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontWeight: '500',
          color: '#555'
        }}>
          Dietary Restrictions:
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {DIETARY_OPTIONS.map(option => (
            <label key={option} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '14px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={state.dietaryRestrictions.includes(option)}
                onChange={() => toggleDietaryRestriction(option)}
              />
              {option}
            </label>
          ))}
        </div>
      </div>

      {/* Cuisine Preferences */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontWeight: '500',
          color: '#555'
        }}>
          Cuisine Preferences:
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {CUISINE_OPTIONS.map(option => (
            <label key={option} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '14px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={state.cuisinePreferences.includes(option)}
                onChange={() => toggleCuisinePreference(option)}
              />
              {option}
            </label>
          ))}
        </div>
      </div>

      {/* Get Recommendations Button */}
      <button
        onClick={getRecommendations}
        disabled={state.loading || state.ingredients.length === 0}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: state.loading ? '#6c757d' : '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: state.loading ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          fontWeight: '500',
          marginBottom: '20px'
        }}
      >
        {state.loading ? 'Getting Recommendations...' : 'Get Alchemical Recommendations'}
      </button>

      {/* Error Display */}
      {state.error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          {state.error}
        </div>
      )}

      {/* Recipes Display */}
      {state.recipes.length > 0 && (
        <div>
          <h3 style={{
            margin: '0 0 16px 0',
            color: '#333',
            fontSize: '18px',
            fontWeight: '600'
          }}>
            Recommended Recipes ({state.recipes.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {state.recipes.map((recipe, index) => (
              <div
                key={recipe.id || index}
                style={{
                  border: '1px solid #e9ecef',
                  borderRadius: '6px',
                  padding: '16px',
                  backgroundColor: '#f8f9fa',
                  cursor: onRecipeSelect ? 'pointer' : 'default'
                }}
                onClick={() => onRecipeSelect?.(recipe)}
              >
                <h4 style={{
                  margin: '0 0 8px 0',
                  color: '#007bff',
                  fontSize: '16px',
                  fontWeight: '500'
                }}>
                  {recipe.name}
                </h4>
                {recipe.url && (
                  <a
                    href={recipe.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#6c757d',
                      fontSize: '14px',
                      textDecoration: 'none'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Recipe →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {state.recipes.length === 0 && !state.loading && !state.error && state.ingredients.length > 0 && (
        <div style={{
          textAlign: 'center',
          color: '#6c757d',
          fontSize: '14px',
          fontStyle: 'italic'
        }}>
          No recommendations yet. Click "Get Alchemical Recommendations" to discover recipes!
        </div>
      )}
    </div>
  )
}