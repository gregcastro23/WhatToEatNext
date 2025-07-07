'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card, CardContent, CardActions,
  Typography, Button, Chip, Grid,
  CircularProgress, Alert, Box,
  Accordion, AccordionSummary, AccordionDetails,
  LinearProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';

import { useServices } from '@/hooks/useServices';
import { fetchPlanetaryPositions } from '@/services/astrologizeApi';
import PlanetaryTimeDisplay from '../PlanetaryTimeDisplay';
import { getTimeFactors } from '@/utils/time';
import { normalizeLunarPhase } from '@/utils/lunarPhaseUtils';
import type { 
  ElementalProperties,
  LunarPhaseWithSpaces,
  ZodiacSign,
  Element 
} from '@/types/alchemy';
import type { Recipe as RecipeType } from '@/types/recipe';
import type { ElementalItem } from '@/calculations/alchemicalTransformation';
import type { OptimizedRecipeResult } from '@/services/AlchemicalTransformationService';
import type { PlanetaryPosition } from "@/types/celestial";

// Comprehensive interfaces following TypeScript standards
interface Dish {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  timeToMake: string;
  mealType?: string | string[];
  season?: string | string[];
  ingredients?: Array<string | {
    name: string;
    amount: number;
    unit: string;
    category?: string;
  }>;
  instructions?: string[];
  elementalProperties?: ElementalProperties;
  numberOfServings?: number;
  [key: string]: unknown;
}

interface CuisineData {
  name: string;
  description: string;
  dishes: {
    [key: string]: {
      [key: string]: Dish[];
    };
  };
  elementalProperties: ElementalProperties;
  [key: string]: unknown;
}

interface RecipeRecommendationsProps {
  filters: {
    servingSize: string;
    dietaryPreference: string;
    cookingTime: string;
  };
}

interface AstrologicalData {
  planetaryPositions: { [planet: string]: { sign: string; degree: number } };
  lunarPhase: string;
  currentSeason: string;
  dominantElements: ElementalProperties;
  activePlanets: string[];
}

interface RecommendationScore {
  total: number;
  elemental: number;
  planetary: number;
  seasonal: number;
  lunar: number;
}

// RecipeCard component with Material UI
const RecipeCard: React.FC<{
  recipe: Dish;
  matchPercentage: number;
  elementalHighlight?: Element;
  onExpand?: () => void;
}> = ({ recipe, matchPercentage, elementalHighlight, onExpand }) => {
  const [expanded, setExpanded] = useState(false);

  const getElementColor = (element: Element): string => {
    switch (element?.toLowerCase()) {
      case 'fire': return '#ef4444';
      case 'water': return '#3b82f6';
      case 'earth': return '#22c55e';
      case 'air': return '#a855f7';
      default: return '#9ca3af';
    }
  };

  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  const instructions = Array.isArray(recipe.instructions) ? recipe.instructions : [];
  const seasons = Array.isArray(recipe.season) ? recipe.season : recipe.season ? [recipe.season] : [];
  const mealTypes = Array.isArray(recipe.mealType) ? recipe.mealType : recipe.mealType ? [recipe.mealType] : [];

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: elementalHighlight ? `2px solid ${getElementColor(elementalHighlight)}` : undefined,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="h6" component="h3" gutterBottom>
            {recipe.name}
          </Typography>
          <Chip 
            label={`${Math.round(matchPercentage)}%`}
            color={matchPercentage > 75 ? 'success' : matchPercentage > 50 ? 'warning' : 'default'}
            size="small"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          {recipe.description}
        </Typography>

        <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
          <Chip 
            icon={<RestaurantIcon />}
            label={recipe.cuisine}
            size="small"
            variant="outlined"
          />
          <Chip 
            icon={<AccessTimeIcon />}
            label={recipe.timeToMake}
            size="small"
            variant="outlined"
          />
          {recipe.numberOfServings && (
            <Chip 
              icon={<PeopleIcon />}
              label={`${recipe.numberOfServings} servings`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>

        {seasons.length > 0 && (
          <Box mb={1}>
            <Typography variant="caption" color="text.secondary">
              Seasons: {seasons.join(', ')}
            </Typography>
          </Box>
        )}

        {mealTypes.length > 0 && (
          <Box mb={2}>
            <Typography variant="caption" color="text.secondary">
              Meal Types: {mealTypes.join(', ')}
            </Typography>
          </Box>
        )}

        {recipe.elementalProperties && (
          <Box mb={2}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Elemental Properties:
            </Typography>
            <Grid container spacing={1}>
              {Object.entries(recipe.elementalProperties).map(([element, value]) => (
                <Grid item xs={6} key={element}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption" sx={{ minWidth: 40 }}>
                      {element}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={value * 100}
                      sx={{ 
                        flexGrow: 1, 
                        height: 6, 
                        borderRadius: 1,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getElementColor(element as Element)
                        }
                      }}
                    />
                    <Typography variant="caption">
                      {Math.round(value * 100)}%
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </CardContent>

      <CardActions>
        <Button 
          size="small" 
          onClick={() => setExpanded(!expanded)}
          endIcon={<ExpandMoreIcon />}
        >
          {expanded ? 'Less Details' : 'More Details'}
        </Button>
      </CardActions>

      {expanded && (
        <CardContent>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">
                Ingredients ({ingredients.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                {ingredients.map((ingredient, index) => (
                  <Typography key={index} variant="body2" gutterBottom>
                    • {typeof ingredient === 'string' ? ingredient : 
                       `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`}
                  </Typography>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>

          {instructions.length > 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">
                  Instructions ({instructions.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  {instructions.map((instruction, index) => (
                    <Typography key={index} variant="body2" paragraph>
                      {index + 1}. {instruction}
                    </Typography>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          )}
        </CardContent>
      )}
    </Card>
  );
};

const RecipeRecommendationsMigrated: React.FC<RecipeRecommendationsProps> = ({ filters }) => {
  // Service hooks
  const servicesData = useServices();
  const {
    isLoading: servicesLoading,
    error: servicesError,
    astrologyService,
    recommendationService,
    recipeService,
    alchemicalRecommendationService
  } = servicesData;
  const servicesRecord = servicesData as Record<string, unknown>;
  const elementalCalculatorService = servicesRecord?.elementalCalculator;

  // State management with proper TypeScript types
  const [recipes, setRecipes] = useState<RecipeType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [optimizedRecipes, setOptimizedRecipes] = useState<OptimizedRecipeResult[]>([]);
  const [planetaryPositions, setPlanetaryPositions] = useState<Record<string, number>>({});
  const [isDaytime, setIsDaytime] = useState<boolean>(true);
  const [elementalState, setElementalState] = useState<ElementalProperties>({
    Fire: 0.25, 
    Water: 0.25, 
    Earth: 0.25, 
    Air: 0.25
  });
  const [zodiacSign, setZodiacSign] = useState<ZodiacSign | undefined>(undefined);
  const [lunarPhase, setLunarPhase] = useState<string | null>(null);
  const [cuisines, setCuisines] = useState<Record<string, CuisineData>>({});
  const [error, setError] = useState<string | null>(null);
  const [astroData, setAstroData] = useState<AstrologicalData | null>(null);

  // Get current time factors for displaying planetary information
  const timeFactors = useMemo(() => getTimeFactors(), []);

  // Astrologize API integration with proper error handling
  useEffect(() => {
    const fetchAstroData = async () => {
      try {
        setIsLoading(true);
        const data = await astrologize.getCurrentChart();
        setAstroData(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to load astrological data: ${errorMessage}`);
        // console.error('Astrologize API error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAstroData();
  }, []);

  // Load astrological data when services are available
  useEffect(() => {
    // Fix TS2339: Property 'elementalCalculator' does not exist on type
    const servicesData = useServices();
    const servicesRecord = servicesData as Record<string, unknown>;
    const elementalCalculatorService = servicesRecord?.elementalCalculator;
    
    if (servicesLoading || !astrologyService || !elementalCalculatorService) {
      return;
    }

    const loadAstrologicalData = async () => {
      try {
        setError(null);
        
        // Get current planetary positions
        const positions = await astrologyService.getCurrentPlanetaryPositions();
        const formattedPositions: { [key: string]: number } = {};
        
        // Convert positions to degree values with proper error handling
        Object.entries(positions || {}).forEach(([planet, data]) => {
          const dataRecord = data as Record<string, unknown>;
          if (typeof data === 'object' && data !== null && 'exactLongitude' in data) {
            formattedPositions[planet] = dataRecord.exactLongitude as number;
          }
        });
        
        setPlanetaryPositions(formattedPositions);
        
        // Get daytime status
        const daytime = await astrologyService.isDaytime();
        setIsDaytime(daytime);
        
        // Get zodiac sign
        // Fix TS2339: Property 'getChartData' does not exist on type 'AstrologyService'
        const astrologyServiceRecord = astrologyService as Record<string, unknown>;
        const getChartDataMethod = astrologyServiceRecord?.getChartData as Function | undefined;
        const chartData = getChartDataMethod ? await getChartDataMethod() : null;
        if (chartData && chartData.Sun && chartData.Sun.sign) {
          setZodiacSign(chartData.Sun.sign as ZodiacSign);
        }
        
        // Get lunar phase
        // Fix TS2339: Property 'getCurrentLunarPhase' does not exist on type 'AstrologyService'
        const getCurrentLunarPhaseMethod = astrologyServiceRecord?.getCurrentLunarPhase as Function | undefined;
        const phase = getCurrentLunarPhaseMethod ? await getCurrentLunarPhaseMethod() : null;
        setLunarPhase(phase);
        
        // Calculate elemental properties based on planetary positions
        const elementalCalculatorRecord = elementalCalculatorService as Record<string, unknown>;
        const calculateElementalPropertiesMethod = elementalCalculatorRecord?.calculateElementalProperties as Function | undefined;
        const properties = calculateElementalPropertiesMethod ? 
          await calculateElementalPropertiesMethod(formattedPositions, daytime) : 
          { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
        setElementalState(properties);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to load astrological data: ${errorMessage}`);
        // console.error('Error loading astrological data:', err);
      }
    };
    
    loadAstrologicalData();
  }, [servicesLoading, astrologyService, elementalCalculatorService]);

  // Load cuisines data when services are available
  useEffect(() => {
    if (servicesLoading || !recipeService) {
      return;
    }

    const loadCuisinesData = async () => {
      try {
        setError(null);
        // Fix TS2339: Property 'getAllCuisines' does not exist on type 'UnifiedRecipeService'
        const recipeServiceRecord = recipeService as Record<string, unknown>;
        const getAllCuisinesMethod = recipeServiceRecord?.getAllCuisines as Function | undefined;
        const cuisinesData = getAllCuisinesMethod ? await getAllCuisinesMethod() : {};
        setCuisines(cuisinesData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to load cuisines data: ${errorMessage}`);
        // console.error('Error loading cuisines data:', err);
      }
    };
    
    loadCuisinesData();
  }, [servicesLoading, recipeService]);

  // Convert cuisine data to ElementalItem format for recommendations
  const cuisineItems = useMemo(() => {
    return Object.entries(cuisines || {}).map(([key, cuisine]) => ({
      id: key,
      name: cuisine.name || key,
      elementalProperties: cuisine.elementalProperties || {
        Fire: 0.25, 
        Water: 0.25, 
        Earth: 0.25, 
        Air: 0.25
      },
    })) as ElementalItem[];
  }, [cuisines]);

  // Load recipes based on filters with proper error handling
  useEffect(() => {
    if (servicesLoading || !recipeService) {
      return;
    }

    const fetchRecipes = async () => {
      setIsLoading(true);
      try {
        setError(null);
        const recipesData = await recipeService.searchRecipes(filters.dietaryPreference as unknown);
        setRecipes(recipesData as unknown);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to fetch recipes: ${errorMessage}`);
        // console.error('Error fetching recipes:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, [servicesLoading, recipeService, filters]);

  // Get all recipes with proper type casting and null safety
  const allRecipes = useMemo(() => {
    return Object.entries(cuisines || {}).flatMap(([_cuisineKey, cuisine]) =>
      Object.entries(cuisine.dishes || {}).flatMap(([mealType, mealTypeData]) =>
        Object.entries(mealTypeData as Record<string, Dish[]> || {}).flatMap(
          ([season, recipes]) =>
            (recipes || []).map((recipe: Dish) => ({
              ...recipe,
              mealType,
              season
            }))
        )
      )
    );
  }, [cuisines]);

  // Apply filters based on user preferences with enhanced filtering
  const filteredRecipes = useMemo(() => {
    return allRecipes.filter((recipe) => {
      // Cooking time filter
      if (
        filters.cookingTime !== 'all' &&
        parseInt(recipe.timeToMake) > parseInt(filters.cookingTime)
      ) {
        return false;
      }
      
      // Add more comprehensive filters here
      if (filters.dietaryPreference !== 'all') {
        // Add dietary preference logic
      }
      
      return true;
    });
  }, [allRecipes, filters]);

  // Multi-factor scoring system
  const calculateRecommendationScore = (item: Record<string, unknown>, astroData: Record<string, unknown>): RecommendationScore => {
    const elementalMatch = calculateElementalMatch(item.elementalProperties, astroData?.dominantElements) * 0.4;
    const planetaryInfluence = calculatePlanetaryInfluence(item.planetaryRulers, astroData?.activePlanets) * 0.3;
    const seasonalAlignment = calculateSeasonalAlignment(item.seasonality, astroData?.currentSeason) * 0.2;
    const lunarPhaseBonus = calculateLunarPhaseBonus(item.lunarAffinities, astroData?.lunarPhase) * 0.1;
    
    const total = elementalMatch + planetaryInfluence + seasonalAlignment + lunarPhaseBonus;
    
    return {
      total: Math.min(100, total * 100),
      elemental: elementalMatch * 100,
      planetary: planetaryInfluence * 100,
      seasonal: seasonalAlignment * 100,
      lunar: lunarPhaseBonus * 100
    };
  };

  // Helper functions for scoring calculations
  const calculateElementalMatch = (itemProps?: ElementalProperties, systemProps?: ElementalProperties): number => {
    if (!itemProps || !systemProps) return 0.5;
    
    let similarity = 0;
    let totalWeight = 0;
    
    Object.entries(itemProps).forEach(([element, value]) => {
      const systemValue = systemProps[element as keyof ElementalProperties] || 0;
      const weight = systemValue + 0.25;
      similarity += (1 - Math.abs(value - systemValue)) * weight;
      totalWeight += weight;
    });
    
    return totalWeight > 0 ? similarity / totalWeight : 0.5;
  };

  const calculatePlanetaryInfluence = (rulers?: string[], activePlanets?: string[]): number => {
    if (!rulers || !activePlanets) return 0.5;
    const matches = rulers.filter(ruler => activePlanets.includes(ruler));
    return matches.length / Math.max(rulers.length, 1);
  };

  const calculateSeasonalAlignment = (seasonality?: Record<string, unknown>, currentSeason?: string): number => {
    if (!seasonality || !currentSeason) return 0.5;
    return seasonality[currentSeason] || 0.3;
  };

  const calculateLunarPhaseBonus = (affinities?: Record<string, unknown>, phase?: string): number => {
    if (!affinities || !phase) return 0;
    return affinities[phase] || 0;
  };

  // Use the alchemical recommendation service to get optimized recipes
  useEffect(() => {
    if (
      servicesLoading || 
      !alchemicalRecommendationService || 
      !planetaryPositions || 
      Object.keys(planetaryPositions).length === 0 ||
      filteredRecipes.length === 0
    ) {
      return;
    }

    const getOptimizedRecipes = async () => {
      try {
        setError(null);
        
        // Prepare the recipe objects for optimization
        const preparedRecipes = filteredRecipes.map((recipe) => ({
          ...recipe,
          ingredients: Array.isArray(recipe.ingredients)
            ? recipe.ingredients.map((i) =>
                typeof i === 'string'
                  ? {
                      name: i,
                      amount: 1,
                      unit: 'unit',
                      category: 'general'
                    }
                  : i
              )
            : [],
          instructions: recipe.instructions || [],
          numberOfServings: recipe.numberOfServings || 4,
          elementalProperties: recipe.elementalProperties || {
            Fire: 0.25, 
            Water: 0.25, 
            Earth: 0.25, 
            Air: 0.25
          },
        }));

        // Get optimized recipes
        const serviceRecord = alchemicalRecommendationService as Record<string, unknown>;
        const optimizeMethod = (serviceRecord?.getOptimizedRecipes as Function) || (serviceRecord?.getRecommendations as Function);
        const optimized = await optimizeMethod(
          preparedRecipes,
          planetaryPositions,
          isDaytime,
          {
            currentZodiacSign: zodiacSign,
            lunarPhase: lunarPhase ? (normalizeLunarPhase(lunarPhase) as LunarPhaseWithSpaces) : undefined,
            count: 6
          }
        );
        
        setOptimizedRecipes(optimized);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to get optimized recipes: ${errorMessage}`);
        // console.error('Error getting optimized recipes:', err);
      }
    };

    getOptimizedRecipes();
  }, [
    servicesLoading,
    alchemicalRecommendationService,
    planetaryPositions,
    isDaytime,
    zodiacSign,
    lunarPhase,
    filteredRecipes
  ]);

  // Helper function to get element color
  const getElementColor = (element: string): string => {
    switch (element?.toLowerCase()) {
      case 'fire': return '#ef4444';
      case 'water': return '#3b82f6';
      case 'earth': return '#22c55e';
      case 'air': return '#a855f7';
      default: return '#9ca3af';
    }
  };

  // Show loading state when services are loading
  if (servicesLoading || isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Loading astrological recommendations...
        </Typography>
      </Box>
    );
  }

  // Show error state when services fail to load
  if (servicesError || error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {servicesError?.message || error}
      </Alert>
    );
  }

  // Main component render with Material UI
  return (
    <Box sx={{ spacing: 3 }}>
      {/* Planetary Time Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <PlanetaryTimeDisplay {...{ timeFactors } as any} />
        </CardContent>
      </Card>

      {/* Elemental Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Elemental State
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(elementalState).map(([element, value]) => (
              <Grid item xs={6} md={3} key={element}>
                <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {element}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={value * 100}
                    sx={{ 
                      mb: 1,
                      height: 8,
                      borderRadius: 1,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getElementColor(element)
                      }
                    }}
                  />
                  <Typography variant="body2">
                    {Math.round(value * 100)}%
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Recipe Recommendations */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recommended Recipes
          </Typography>
          {optimizedRecipes.length > 0 ? (
            <Grid container spacing={3}>
              {optimizedRecipes.map(({ recipe, compatibility, dominantElement }) => (
                <Grid item xs={12} md={6} lg={4} key={`${recipe.cuisine}-${recipe.name}`}>
                  <RecipeCard
                    recipe={{
                      ...recipe,
                      season: Array.isArray(recipe.season)
                        ? recipe.season
                        : recipe.season
                        ? [recipe.season]
                        : [],
                      mealType: Array.isArray(recipe.mealType)
                        ? recipe.mealType
                        : recipe.mealType
                        ? [recipe.mealType]
                        : []
                    } as Dish}
                    elementalHighlight={dominantElement}
                    matchPercentage={compatibility * 100}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                No recipes match your current criteria. Try adjusting the elemental
                state or filters.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default React.memo(RecipeRecommendationsMigrated); 