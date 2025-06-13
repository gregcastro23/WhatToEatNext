import React, { useState, useMemo, useEffect } from 'react';
import type { 
  ElementalProperties, 
  ThermodynamicMetrics, 
  ZodiacSign, 
  LunarPhase,
  LunarPhaseWithSpaces,
  PlanetaryAspect,
  AstrologicalState,
  Element,
  Recipe
} from '@/types/alchemy';
import type { TimeFactors } from '@/types/time';
import { getTimeFactors } from '@/types/time';

import { 
  Box, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Grid, 
  Chip, 
  Divider, 
  Tabs, 
  Tab,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { 
  AccessTime, 
  Restaurant, 
  WbSunny, 
  ExpandMore, 
  ExpandLess 
} from '@mui/icons-material';

// Core Types and Constants
import { RulingPlanet } from '@/constants/planets';
import { ElementalCharacter, AlchemicalProperty } from '@/constants/planetaryElements';
import type { Ingredient, Modality } from '@/data/ingredients/types';

// Hooks and Context
import { useAlchemicalRecommendations } from '@/hooks/useAlchemicalRecommendations';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';

// Data Sources
import allIngredients from '@/data/ingredients';
import { cookingMethods } from '@/data/cooking/cookingMethods';
import { cuisines } from '@/data/cuisines';

// Utils
import { determineIngredientModality } from '@/utils/ingredientUtils';
import { createElementalProperties } from '@/utils/elemental/elementalUtils';

// Transformation Types
import { ElementalItem, AlchemicalItem } from '@/calculations/alchemicalTransformation';

interface AlchemicalRecommendationsProps {
  planetPositions?: Record<RulingPlanet, number>;
  isDaytime?: boolean;
  currentZodiac?: ZodiacSign | null;
  lunarPhase?: LunarPhaseWithSpaces;
  tarotElementBoosts?: Record<ElementalCharacter, number>;
  tarotPlanetaryBoosts?: { [key: string]: number };
  aspects?: PlanetaryAspect[];
  recipes?: Recipe[];
  recipeCount?: number;
}

interface RecommendationExplanation {
  totalScore: number;
  elementalMatch: number;
  planetaryInfluence: number;
  seasonalAlignment: number;
  lunarPhaseAlignment: number;
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

const getRecommendedRecipes = (
  recipes: Recipe[],
  astroState: AstrologicalState,
  count: number,
  timeFactors: TimeFactors | null
): Recipe[] => {
  if (!recipes?.length || !timeFactors) return [];
  
  const scoredRecipes = recipes.map(recipe => {
    const explanation = calculateRecommendationScore(recipe, timeFactors, astroState);
    return {
      ...recipe,
      matchScore: explanation.totalScore,
      matchPercentage: Math.round(explanation.totalScore * 100)
    };
  });
  
  return scoredRecipes
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
    .slice(0, count);
};

const calculateRecommendationScore = (
  recipe: Recipe,
  timeFactors: TimeFactors,
  astroState: AstrologicalState
): RecommendationExplanation => {
  const recipeElements = validateElementalProperties(recipe.elementalProperties);
  
  // Current elemental profile based on time factors
  const currentProfile = {
    Fire: 0.25 + (timeFactors.season === 'summer' ? 0.2 : 0),
    Water: 0.25 + (timeFactors.season === 'winter' ? 0.2 : 0),
    Earth: 0.25 + (timeFactors.season === 'autumn' ? 0.2 : 0),
    Air: 0.25 + (timeFactors.season === 'spring' ? 0.2 : 0)
  };
  
  const elementalMatch = calculateElementalSimilarity(recipeElements, currentProfile);
  const planetaryMatch = 0.7; // Simplified for now
  const seasonalScore = 0.8; // Simplified for now
  const lunarScore = 0.6; // Simplified for now
  
  const totalScore = 
    (elementalMatch * 0.4) +
    (planetaryMatch * 0.3) +
    (seasonalScore * 0.2) +
    (lunarScore * 0.1);

  return {
    totalScore,
    elementalMatch,
    planetaryInfluence: planetaryMatch,
    seasonalAlignment: seasonalScore,
    lunarPhaseAlignment: lunarScore,
    breakdown: {
      elemental: {
        score: elementalMatch,
        weight: 0.4,
        explanation: 'Elemental harmony with current astrological profile'
      },
      planetary: {
        score: planetaryMatch,
        weight: 0.3,
        explanation: 'Alignment with current planetary influences'
      },
      seasonal: {
        score: seasonalScore,
        weight: 0.2,
        explanation: 'Seasonal appropriateness and ingredient availability'
      },
      lunar: {
        score: lunarScore,
        weight: 0.1,
        explanation: 'Lunar phase energy alignment'
      }
    }
  };
};

const explainRecommendation = (
  recipe: Recipe,
  astroState: AstrologicalState,
  timeFactors: TimeFactors | null
): string => {
  if (!timeFactors) return 'Recommended based on alchemical properties.';
  
  const explanation = calculateRecommendationScore(recipe, timeFactors, astroState);
  const topReason = Object.entries(explanation.breakdown)
    .sort(([,a], [,b]) => b.score - a.score)[0];
  
  return `${Math.round(explanation.totalScore * 100)}% match. ${topReason[1].explanation}`;
};

export default function AlchemicalRecommendations({
  planetPositions,
  isDaytime = true,
  currentZodiac,
  lunarPhase,
  tarotElementBoosts,
  tarotPlanetaryBoosts,
  aspects = [],
  recipes = [],
  recipeCount = 3
}: AlchemicalRecommendationsProps) {
  // State Management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<{[key: string]: boolean}>({});
  const [activeTab, setActiveTab] = useState(0);
  const [targetElement, setTargetElement] = useState<ElementalCharacter | undefined>(undefined);
  const [targetProperty, setTargetProperty] = useState<AlchemicalProperty | undefined>(undefined);
  const [modalityFilter, setModalityFilter] = useState<Modality | 'all'>('all');
  
  // Time Factors Integration
  const [timeFactors, setTimeFactors] = useState<TimeFactors | null>(null);
  const [recipeRecommendations, setRecipeRecommendations] = useState<Recipe[]>([]);
  const [recipeExplanations, setRecipeExplanations] = useState<Record<string, string>>({});
  
  // Context Integration
  const alchemicalContext = useAlchemical();
  
  useEffect(() => {
    const loadTimeFactors = async () => {
      try {
        setLoading(true);
        const factors = await getTimeFactors();
        setTimeFactors(factors);
      } catch (err) {
        setError('Failed to load astrological data');
      } finally {
        setLoading(false);
      }
    };
    loadTimeFactors();
  }, []);

  // Resolve context values with fallbacks
  const resolvedPlanetaryPositions = useMemo(() => {
    if (planetPositions) return planetPositions;
    
    if (alchemicalContext.planetaryPositions) {
      const positions: Record<RulingPlanet, number> = {
        Sun: 0, Moon: 0, Mercury: 0, Venus: 0, Mars: 0,
        Jupiter: 0, Saturn: 0, Uranus: 0, Neptune: 0, Pluto: 0
      };
      
      Object.entries(alchemicalContext.planetaryPositions || {}).forEach(([planet, data]) => {
        if (planet in positions && data && typeof data === 'object' && 'degree' in data) {
          positions[planet as RulingPlanet] = (data as any).degree || 0;
        }
      });
      
      return positions;
    }
    
    return {
      Sun: 0, Moon: 0, Mercury: 0, Venus: 0, Mars: 0,
      Jupiter: 0, Saturn: 0, Uranus: 0, Neptune: 0, Pluto: 0
    };
  }, [planetPositions, alchemicalContext.planetaryPositions]);

  const resolvedIsDaytime = isDaytime !== undefined ? isDaytime : (alchemicalContext?.isDaytime ?? true);
  const resolvedCurrentZodiac = currentZodiac || 
    (alchemicalContext.state?.astrologicalState?.currentZodiacSign as ZodiacSign) || null;
  const resolvedLunarPhase: LunarPhaseWithSpaces = lunarPhase || 
    (alchemicalContext.state?.astrologicalState?.lunarPhase as LunarPhaseWithSpaces) || 'new moon';

  // Create astrological state
  const astrologicalState = useMemo(() => ({
    lunarPhase: resolvedLunarPhase,
    currentZodiacSign: resolvedCurrentZodiac,
    celestialEvents: [],
    aspects: aspects,
    retrograde: []
  } as AstrologicalState), [resolvedLunarPhase, resolvedCurrentZodiac, aspects]);

  // Recipe recommendations effect
  useEffect(() => {
    if (recipes?.length && astrologicalState && timeFactors) {
      const recommendedRecipes = getRecommendedRecipes(recipes, astrologicalState, recipeCount, timeFactors);
      setRecipeRecommendations(recommendedRecipes);
      
      const newExplanations: { [key: string]: string } = {};
      recommendedRecipes.forEach(recipe => {
        if (recipe?.id) {
          newExplanations[recipe.id] = explainRecommendation(recipe, astrologicalState, timeFactors);
        }
      });
      setRecipeExplanations(newExplanations);
    }
  }, [recipes, astrologicalState, recipeCount, timeFactors]);

  // Transform ingredients to ElementalItem array
  const ingredientsArray = useMemo(() => {
    return Object.entries(allIngredients || {}).map(([key, ingredient]) => {
      let elementalProps: ElementalProperties;
      
      if (ingredient && typeof ingredient === 'object' && 'elementalProperties' in ingredient && 
          ingredient.elementalProperties && typeof ingredient.elementalProperties === 'object') {
        elementalProps = validateElementalProperties(ingredient.elementalProperties);
      } else {
        const category = ingredient && typeof ingredient === 'object' && 'category' in ingredient ? 
          String(ingredient.category || '') : '';
        
        elementalProps = createElementalProperties({ Fire: 0, Water: 0, Earth: 0, Air: 0 });
        
        // Adjust by category
        if (category.toLowerCase().includes('vegetable')) {
          elementalProps.Earth += 0.5;
          elementalProps.Water += 0.3;
        } else if (category.toLowerCase().includes('fruit')) {
          elementalProps.Water += 0.4;
          elementalProps.Air += 0.3;
        } else if (category.toLowerCase().includes('protein') || category.toLowerCase().includes('meat')) {
          elementalProps.Fire += 0.4;
          elementalProps.Earth += 0.3;
        } else if (category.toLowerCase().includes('grain')) {
          elementalProps.Earth += 0.5;
          elementalProps.Air += 0.2;
        } else if (category.toLowerCase().includes('herb') || category.toLowerCase().includes('spice')) {
          elementalProps.Fire += 0.3;
          elementalProps.Air += 0.4;
        }
        
        // Normalize
        const total = Object.values(elementalProps).reduce((sum, val) => sum + val, 0);
        if (total > 0) {
          Object.keys(elementalProps).forEach(element => {
            elementalProps[element as keyof ElementalProperties] /= total;
          });
        }
      }
      
      const qualities = ingredient && typeof ingredient === 'object' && 'qualities' in ingredient ? 
        (ingredient.qualities as string[] || []) : [];
      const modality = determineIngredientModality(elementalProps, qualities);
      
      return {
        id: key,
        name: ingredient && typeof ingredient === 'object' && 'name' in ingredient ? 
          String(ingredient.name || key) : key,
        elementalProperties: elementalProps,
        modality,
        qualities
      } as ElementalItem;
    });
  }, []);

  // Transform cooking methods
  const cookingMethodsArray = useMemo(() => {
    return Object.entries(cookingMethods || {}).map(([key, method]) => {
      let elementalEffect: ElementalProperties;
      
      if (method && typeof method === 'object' && 'elementalEffect' in method && 
          method.elementalEffect && typeof method.elementalEffect === 'object') {
        elementalEffect = validateElementalProperties(method.elementalEffect);
      } else {
        const methodName = method && typeof method === 'object' && 'name' in method ? 
          String(method.name || key).toLowerCase() : key.toLowerCase();
        
        elementalEffect = createElementalProperties({ Fire: 0, Water: 0, Earth: 0, Air: 0 });
        
        // Categorize cooking methods with proper syntax
        if (methodName.includes('grill') || methodName.includes('roast') || 
            methodName.includes('bake') || methodName.includes('broil') || 
            methodName.includes('fry')) {
          elementalEffect.Fire += 0.6;
          elementalEffect.Air += 0.3;
        } else if (methodName.includes('steam') || methodName.includes('boil') || 
                   methodName.includes('poach') || methodName.includes('simmer')) {
          elementalEffect.Water += 0.6;
          elementalEffect.Earth += 0.2;
        } else if (methodName.includes('sauté') || methodName.includes('stir-fry')) {
          elementalEffect.Fire += 0.4;
          elementalEffect.Air += 0.4;
        } else if (methodName.includes('braise') || methodName.includes('stew')) {
          elementalEffect.Water += 0.4;
          elementalEffect.Earth += 0.4;
        } else if (methodName.includes('smoke') || methodName.includes('cure')) {
          elementalEffect.Air += 0.5;
          elementalEffect.Earth += 0.3;
        } else if (methodName.includes('ferment') || methodName.includes('pickle')) {
          elementalEffect.Water += 0.3;
          elementalEffect.Earth += 0.5;
        } else {
          // Default balanced method
          elementalEffect = createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 });
        }
      }
      
      return {
        id: key,
        name: method && typeof method === 'object' && 'name' in method ? 
          String(method.name || key) : key,
        elementalProperties: elementalEffect
      } as ElementalItem;
    });
  }, []);

  // Transform cuisines
  const cuisinesArray = useMemo(() => {
    return Object.entries(cuisines || {}).map(([key, cuisine]) => {
      let elementalState: ElementalProperties;
      
      if (cuisine && typeof cuisine === 'object' && 'elementalProperties' in cuisine && 
          cuisine.elementalProperties && typeof cuisine.elementalProperties === 'object') {
        elementalState = validateElementalProperties(cuisine.elementalProperties);
      } else {
        const cuisineName = cuisine && typeof cuisine === 'object' && 'name' in cuisine ? 
          String(cuisine.name || key).toLowerCase() : key.toLowerCase();
        
        elementalState = createElementalProperties({ Fire: 0, Water: 0, Earth: 0, Air: 0 });
        
        // Categorize cuisines with proper syntax
        if (cuisineName.includes('indian') || cuisineName.includes('thai') || 
            cuisineName.includes('mexican') || cuisineName.includes('cajun')) {
          elementalState.Fire += 0.5;
          elementalState.Air += 0.2;
        } else if (cuisineName.includes('japanese') || cuisineName.includes('nordic') || 
                   cuisineName.includes('korean')) {
          elementalState.Water += 0.4;
          elementalState.Earth += 0.3;
          elementalState.Air += 0.2;
        } else if (cuisineName.includes('french') || cuisineName.includes('italian')) {
          elementalState.Earth += 0.4;
          elementalState.Fire += 0.3;
          elementalState.Water += 0.2;
        } else if (cuisineName.includes('mediter')) {
          elementalState.Earth += 0.3;
          elementalState.Air += 0.3;
          elementalState.Fire += 0.2;
        } else if (cuisineName.includes('greek') || cuisineName.includes('spanish')) {
          elementalState.Earth += 0.3;
          elementalState.Fire += 0.3;
          elementalState.Air += 0.2;
        } else {
          elementalState.Earth += 0.3;
          elementalState.Water += 0.3;
          elementalState.Fire += 0.2;
          elementalState.Air += 0.2;
        }
        
        // Normalize
        const total = Object.values(elementalState).reduce((sum, val) => sum + val, 0);
        if (total > 0) {
          Object.keys(elementalState).forEach(element => {
            elementalState[element as keyof ElementalProperties] /= total;
          });
        }
      }
      
      return {
        id: key,
        name: cuisine && typeof cuisine === 'object' && 'name' in cuisine ? 
          String(cuisine.name || key) : key,
        elementalProperties: elementalState
      } as ElementalItem;
    });
  }, []);

  // Filter ingredients by modality
  const filteredIngredientsArray = useMemo(() => {
    if (modalityFilter === 'all') return ingredientsArray;
    return ingredientsArray.filter(ingredient => ingredient.modality === modalityFilter);
  }, [ingredientsArray, modalityFilter]);

  // Get recommendations using hook
  const {
    recommendations,
    transformedIngredients,
    transformedMethods,
    transformedCuisines,
    loading: recommendationsLoading,
    error: recommendationsError,
    energeticProfile
  } = useAlchemicalRecommendations({
    ingredients: filteredIngredientsArray,
    cookingMethods: cookingMethodsArray,
    cuisines: cuisinesArray,
    planetPositions: resolvedPlanetaryPositions,
    isDaytime: resolvedIsDaytime,
    targetElement,
    targetAlchemicalProperty: targetProperty,
    count: 5,
    currentZodiac: resolvedCurrentZodiac,
    lunarPhase: resolvedLunarPhase,
    tarotElementBoosts,
    tarotPlanetaryBoosts,
    aspects
  });

  // Expansion toggle handler
  const toggleExpansion = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Error handling
  if (error || recommendationsError) {
    return (
      <Alert severity="error">
        {error || recommendationsError?.message || 'An error occurred'}
      </Alert>
    );
  }

  // Loading state
  if (loading || recommendationsLoading || !timeFactors) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Loading alchemical recommendations...
        </Typography>
      </Box>
    );
  }

  // Render expandable card helper
  const renderExpandableCard = (item: any, index: number, type: 'ingredient' | 'method' | 'cuisine') => (
    <Card 
      key={item.id || index}
      sx={{ 
        mb: 2, 
        border: expandedItems[item.id] ? '2px solid #1976d2' : '1px solid #e0e0e0',
        transition: 'all 0.3s ease'
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{item.name}</Typography>
          <Button
            onClick={() => toggleExpansion(item.id)}
            startIcon={expandedItems[item.id] ? <ExpandLess /> : <ExpandMore />}
            size="small"
          >
            {expandedItems[item.id] ? 'Less' : 'More'}
          </Button>
        </Box>

        {/* Elemental Properties Display */}
        <Box sx={{ mt: 1 }}>
          <Grid container spacing={1}>
            {Object.entries(item.elementalProperties || item.elementalState || {}).map(([element, value]) => (
              <Grid item xs={3} key={element}>
                <Chip 
                  label={`${element}: ${Math.round((value as number) * 100)}%`}
                  size="small"
                  color={element.toLowerCase() as any}
                  variant="outlined"
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Expandable content */}
        {expandedItems[item.id] && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            {item.modality && (
              <Typography variant="body2">
                <strong>Modality:</strong> {item.modality}
              </Typography>
            )}
            {item.qualities && (
              <Typography variant="body2">
                <strong>Qualities:</strong> {item.qualities.join(', ')}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Alchemical Recommendations
      </Typography>

      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Alchemical Analysis" />
        <Tab label="Recipe Recommendations" />
      </Tabs>

      {activeTab === 0 && (
        <Box>
          {/* Energetic Profile */}
          {energeticProfile && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Current Energetic Profile</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Dominant Element:</strong> {energeticProfile.dominantElement}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Dominant Property:</strong> {energeticProfile.dominantAlchemicalProperty}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Recommendations Sections */}
          <Grid container spacing={3}>
            {/* Ingredients */}
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>Recommended Ingredients</Typography>
              {recommendations?.topIngredients?.map((item, index) => 
                renderExpandableCard(item, index, 'ingredient')
              )}
            </Grid>

            {/* Cooking Methods */}
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>Recommended Methods</Typography>
              {recommendations?.topMethods?.map((item, index) => 
                renderExpandableCard(item, index, 'method')
              )}
            </Grid>

            {/* Cuisines */}
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>Recommended Cuisines</Typography>
              {recommendations?.topCuisines?.map((item, index) => 
                renderExpandableCard(item, index, 'cuisine')
              )}
            </Grid>
          </Grid>
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>Recipe Recommendations</Typography>
          <Grid container spacing={3}>
            {recipeRecommendations.map((recipe, index) => (
              <Grid item xs={12} sm={6} md={4} key={recipe.id || index}>
                <Card>
                  {recipe.image && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={recipe.image}
                      alt={recipe.name}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6" component="div">
                      {recipe.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {recipe.cuisine}
                    </Typography>
                    
                    <Box sx={{ mb: 1 }}>
                      {recipe.mealType && (
                        <Chip 
                          icon={<Restaurant />}
                          label={Array.isArray(recipe.mealType) ? recipe.mealType[0] : recipe.mealType}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      )}
                      
                      {recipe.cookTime && (
                        <Chip 
                          icon={<AccessTime />}
                          label={`${recipe.cookTime} min`}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      )}
                      
                      {recipe.matchPercentage && (
                        <Chip 
                          label={`${recipe.matchPercentage}% Match`}
                          color="primary"
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      )}
                    </Box>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    {recipe.id && recipeExplanations[recipe.id] && (
                      <Typography variant="body2">
                        {recipeExplanations[recipe.id]}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {!recipeRecommendations.length && (
            <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>
              No recipe recommendations available. Try adjusting your filters or adding more recipes.
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
} 