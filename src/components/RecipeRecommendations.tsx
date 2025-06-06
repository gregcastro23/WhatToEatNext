

// Phase 10: Calculation Type Interfaces
interface CalculationData {
  value: number;
  weight?: number;
  score?: number;
}

interface ScoredItem {
  score: number;
  [key: string]: unknown;
}

interface ElementalData {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
  [key: string]: unknown;
}

interface CuisineData {
  id: string;
  name: string;
  zodiacInfluences?: string[];
  planetaryDignities?: Record<string, unknown>;
  elementalState?: ElementalData;
  elementalProperties?: ElementalData;
  modality?: string;
  gregsEnergy?: number;
  [key: string]: unknown;
}

interface NutrientData {
  nutrient?: { name?: string };
  nutrientName?: string;
  name?: string;
  vitaminCount?: number;
  data?: unknown;
  [key: string]: unknown;
}

interface MatchingResult {
  score: number;
  elements: ElementalData;
  recipe?: unknown;
  [key: string]: unknown;
}

'use client';

import React, { useState, useEffect } from 'react';
import type { 
  Recipe, 
  ElementalProperties,
  ZodiacSign
} from '@/types/alchemy';
import type { TimeFactors } from '@/types/time';
import { getTimeFactors } from '@/types/time';

import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Chip, 
  Alert, 
  CircularProgress,
  Button,
  Divider,
  LinearProgress
} from '@mui/material';
import { 
  Restaurant, 
  AccessTime, 
  Star, 
  ExpandMore, 
  ExpandLess 
} from '@mui/icons-material';

import { useServices } from '@/hooks/useServices';

// Types
type Season = 'spring' | 'summer' | 'autumn' | 'winter';

interface ScoredRecipe {
  recipe: Recipe;
  score: number;
  explanation?: string;
}

interface RecommendationExplanation {
  totalScore: number;
  elementalMatch: number;
  seasonalAlignment: number;
  breakdown: {
    [key: string]: {
      score: number;
      weight: number;
      explanation: string;
    };
  };
}

// Helper Functions
const validateElementalProperties = (props: any): ElementalProperties => {
  const defaultProps = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  
  if (!props || typeof props !== 'object') return defaultProps;
  
  return {
    Fire: Math.max(0, Math.min(1, props.Fire || 0)),
    Water: Math.max(0, Math.min(1, props.Water || 0)),
    Earth: Math.max(0, Math.min(1, props.Earth || 0)),
    Air: Math.max(0, Math.min(1, props.Air || 0))
  };
};

const calculateElementalSimilarity = (
  props1: ElementalProperties,
  props2: ElementalProperties
): number => {
  const weights = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  
  let similarity = 0;
  (Object.keys(weights) as Array<keyof ElementalProperties>).forEach(element => {
    const diff = Math.abs(props1[element] - props2[element]);
    similarity += weights[element] * (1 - diff);
  });
  
  return Math.max(0, Math.min(1, similarity));
};

const getSeasonalElementalProfile = (season: Season): ElementalProperties => {
  const profiles: Record<Season, ElementalProperties> = {
    spring: { Fire: 0.2, Water: 0.3, Earth: 0.2, Air: 0.3 },
    summer: { Fire: 0.4, Water: 0.1, Earth: 0.2, Air: 0.3 },
    autumn: { Fire: 0.2, Water: 0.2, Earth: 0.4, Air: 0.2 },
    winter: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 }
  };
  
  return profiles[season];
};

const calculateRecommendationScore = (
  recipe: Recipe,
  season: Season,
  timeFactors: TimeFactors | null
): RecommendationExplanation => {
  const recipeElements = validateElementalProperties(recipe.elementalProperties || recipe.elementalState);
  const seasonalProfile = getSeasonalElementalProfile(season);
  
  const elementalMatch = calculateElementalSimilarity(recipeElements, seasonalProfile);
  const seasonalScore = 0.8; // Simplified for now
  
  const totalScore = (elementalMatch * 0.7) + (seasonalScore * 0.3);

  return {
    totalScore,
    elementalMatch,
    seasonalAlignment: seasonalScore,
    breakdown: {
      elemental: {
        score: elementalMatch,
        weight: 0.7,
        explanation: `Elemental harmony with ${season} season`
      },
      seasonal: {
        score: seasonalScore,
        weight: 0.3,
        explanation: `Seasonal appropriateness for ${season}`
      }
    }
  };
};

const explainRecommendation = (
  recipe: Recipe,
  season: Season,
  timeFactors: TimeFactors | null
): string => {
  const explanation = calculateRecommendationScore(recipe, season, timeFactors);
  const topReason = Object.entries(explanation.breakdown)
    .sort(([,a], [,b]) => b.score - a.score)[0];
  
  return `${Math.round(explanation.totalScore * 100)}% match. ${topReason[1].explanation}`;
};

/**
 * RecipeRecommendations Component
 * 
 * This component demonstrates using multiple services together to provide
 * recipe recommendations based on current astrological conditions.
 */
export default function RecipeRecommendations() {
  // State Management
  const [recipes, setRecipes] = useState<ScoredRecipe[]>([]);
  const [currentSeason, setCurrentSeason] = useState<Season>('spring');
  const [planetaryPositions, setPlanetaryPositions] = useState<Record<string, string>>({});
  const [isLoadingRecipes, setIsLoadingRecipes] = useState<boolean>(false);
  const [expandedItems, setExpandedItems] = useState<{[key: string]: boolean}>({});
  const [error, setError] = useState<string | null>(null);
  
  // Time Factors Integration
  const [timeFactors, setTimeFactors] = useState<TimeFactors | null>(null);
  
  // Access services through the useServices hook
  const {
    isLoading: servicesLoading,
    error: servicesError,
    astrologyService,
    recipeService,
    recommendationService,
    alchemicalRecommendationService
  } = useServices();

  useEffect(() => {
    const loadTimeFactors = async () => {
      try {
        const factors = await getTimeFactors();
        setTimeFactors(factors);
        setCurrentSeason(factors.season as Season || 'spring');
      } catch (err) {
        setError('Failed to load astrological data');
      }
    };
    loadTimeFactors();
  }, []);

  // Load data when services are ready
  useEffect(() => {
    if (servicesLoading || servicesError || !astrologyService || !recipeService || !timeFactors) {
      return;
    }

    const loadData = async () => {
      try {
        setIsLoadingRecipes(true);
        setError(null);
        
        // Get current planetary positions
        const positions = await astrologyService.getCurrentPlanetaryPositions();
        
        // Convert positions to the format needed by recommendation services
        const formattedPositions: { [key: string]: string } = {};
        Object.entries(positions || {}).forEach(([planet, data]) => {
          if (data && typeof data === 'object' && 'sign' in data) {
            formattedPositions[planet] = String(data.sign);
          }
        });
        
        setPlanetaryPositions(formattedPositions);
        
        // Get seasonal recipes
        const seasonalRecipes = await recipeService.getRecipesBySeason(currentSeason);
        
        // Get recommendations
        const recommendations = await getRecommendedRecipes(seasonalRecipes, formattedPositions);
        setRecipes(recommendations);
      } catch (err) {
        console.error('Error loading recipe recommendations:', err);
        setError('Failed to load recipe recommendations');
      } finally {
        setIsLoadingRecipes(false);
      }
    };

    loadData();
  }, [servicesLoading, servicesError, astrologyService, recipeService, currentSeason, timeFactors]);

  /**
   * Get recommended recipes using the recommendation services
   */
  const getRecommendedRecipes = async (
    availableRecipes: Recipe[],
    positions: { [key: string]: string }
  ): Promise<ScoredRecipe[]> => {
    if (!recommendationService || !alchemicalRecommendationService || !availableRecipes?.length) {
      return [];
    }

    try {
      const scoredRecipes: ScoredRecipe[] = [];

      for (const recipe of availableRecipes.slice(0, 10)) { // Limit to 10 recipes for performance
        if (!recipe) continue;
        
        // Calculate recommendation score
        const explanation = calculateRecommendationScore(recipe, currentSeason, timeFactors);
        const recommendationText = explainRecommendation(recipe, currentSeason, timeFactors);

        scoredRecipes.push({
          recipe,
          score: explanation.totalScore,
          explanation: recommendationText
        });
      }

      // Sort by score (descending)
      return scoredRecipes.sort((a, b) => (a as ScoredItem).score - (b as ScoredItem).score).slice(0, 5);
    } catch (err) {
      console.error('Error calculating recipe recommendations:', err);
      return [];
    }
  };

  // Expansion toggle handler
  const toggleExpansion = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Error handling
  if (error || servicesError) {
    return (
      <Alert severity="error">
        {error || servicesError?.message || 'An error occurred'}
      </Alert>
    );
  }

  // Loading state
  if (servicesLoading || !timeFactors) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Loading services...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Recipe Recommendations
      </Typography>
      
      {/* Current Season Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Season: {currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Based on Sun in {planetaryPositions.Sun || 'unknown'}
          </Typography>
          {timeFactors && (
            <Box sx={{ mt: 1 }}>
              <Chip 
                label={`Planetary Day: ${timeFactors.planetaryDay}`}
                size="small"
                sx={{ mr: 1 }}
              />
              <Chip 
                label={`Time: ${timeFactors.timeOfDay}`}
                size="small"
              />
            </Box>
          )}
        </CardContent>
      </Card>
      
      {/* Recommendations */}
      <Typography variant="h6" gutterBottom>
        Recommended Recipes
        {isLoadingRecipes && (
          <CircularProgress size={20} sx={{ ml: 2 }} />
        )}
      </Typography>
      
      {recipes.length > 0 ? (
        <Grid container spacing={3}>
          {recipes.map(({ recipe, score, explanation }, index) => (
            <Grid item xs={12} md={6} lg={4} key={recipe.id || index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Typography variant="h6" component="div">
                      {recipe.name}
                    </Typography>
                    <Chip 
                      icon={<Star />}
                      label={`${Math.round(score * 100)}% match`}
                      color="primary"
                      size="small"
                    />
                  </Box>
                  
                  {recipe.cuisine && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Cuisine: {recipe.cuisine}
                    </Typography>
                  )}
                  
                  {recipe.description && (
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {recipe.description}
                    </Typography>
                  )}
                  
                  {/* Recipe Details */}
                  <Box sx={{ mb: 2 }}>
                    {recipe.cookTime && (
                      <Chip 
                        icon={<AccessTime />}
                        label={`${recipe.cookTime} min`}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    )}
                    
                    {recipe.servings && (
                      <Chip 
                        icon={<Restaurant />}
                        label={`Serves ${recipe.servings}`}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    )}
                  </Box>
                  
                  {/* Elemental Properties */}
                  {(recipe.elementalProperties || recipe.elementalState) && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Elemental Properties:
                      </Typography>
                      <Grid container spacing={1}>
                        {Object.entries(validateElementalProperties(recipe.elementalProperties || recipe.elementalState)).map(([element, value]) => (
                          <Grid item xs={6} key={element}>
                            <Box>
                              <Typography variant="caption">
                                {element}: {Math.round((value as number) * 100)}%
                              </Typography>
                              <LinearProgress 
                                variant="determinate" 
                                value={(value as number) * 100} 
                                sx={{ height: 4, borderRadius: 2 }}
                              />
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                  
                  {/* Explanation */}
                  {explanation && (
                    <Box sx={{ mt: 2 }}>
                      <Divider sx={{ mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        <strong>Why this works:</strong> {explanation}
                      </Typography>
                    </Box>
                  )}
                  
                  {/* Expandable Details */}
                  <Box sx={{ mt: 2 }}>
                    <Button
                      onClick={() => toggleExpansion(recipe.id || `recipe-${index}`)}
                      startIcon={expandedItems[recipe.id || `recipe-${index}`] ? <ExpandLess /> : <ExpandMore />}
                      size="small"
                      fullWidth
                    >
                      {expandedItems[recipe.id || `recipe-${index}`] ? 'Less Details' : 'More Details'}
                    </Button>
                  </Box>
                  
                  {/* Expanded Content */}
                  {expandedItems[recipe.id || `recipe-${index}`] && (
                    <Box sx={{ mt: 2 }}>
                      <Divider sx={{ mb: 2 }} />
                      
                      {recipe.ingredients && recipe.ingredients.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Ingredients:
                          </Typography>
                          <Typography variant="body2">
                            {Array.isArray(recipe.ingredients) 
                              ? recipe.ingredients.slice(0, 8).join(', ') + (recipe.ingredients.length > 8 ? '...' : '')
                              : String(recipe.ingredients).substring(0, 100) + '...'
                            }
                          </Typography>
                        </Box>
                      )}
                      
                      {recipe.instructions && recipe.instructions.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Instructions:
                          </Typography>
                          <Typography variant="body2">
                            {Array.isArray(recipe.instructions) 
                              ? recipe.instructions[0]?.substring(0, 150) + '...'
                              : String(recipe.instructions).substring(0, 150) + '...'
                            }
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="body1" textAlign="center" color="text.secondary">
              {isLoadingRecipes 
                ? 'Loading recipe recommendations...' 
                : 'No recipe recommendations available at this time.'
              }
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
} 