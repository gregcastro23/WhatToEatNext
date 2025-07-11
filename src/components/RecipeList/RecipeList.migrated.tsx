'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card, CardContent, CardActions,
  Typography, Button, Chip, Grid,
  CircularProgress, Alert, Box,
  TextField, FormControl, InputLabel,
  Select, MenuItem, Checkbox, FormControlLabel,
  Accordion, AccordionSummary, AccordionDetails,
  Pagination, IconButton, InputAdornment,
  Rating, LinearProgress
} from '@mui/material';
import {
  Search, ExpandMore, Restaurant, AccessTime, 
  People, Star, FilterList, Clear
} from '@mui/icons-material';

import { Recipe } from '@/types/recipe';
import { useServices } from '@/hooks/useServices';
import { fetchPlanetaryPositions } from '@/services/astrologizeApi';
import { logger } from '@/utils/logger';
import type { CuisineType, DietaryRestriction, ElementalProperties } from '@/types/alchemy';

// Comprehensive interfaces
interface FilterState {
  search: string;
  cuisineTypes: CuisineType[];
  mealType: string[];
  dietary: DietaryRestriction[];
  maxTime: number | undefined;
  spiciness: string | null;
  complexity: string | null;
  minRating: number;
}

interface AstrologicalData {
  planetaryPositions: { [planet: string]: { sign: string; degree: number } };
  lunarPhase: string;
  currentSeason: string;
  dominantElements: ElementalProperties;
  activePlanets: string[];
}

interface RecipeScore {
  total: number;
  elemental: number;
  planetary: number;
  seasonal: number;
  popularity: number;
}

interface EnhancedRecipe {
  id: string;
  name: string;
  description?: string;
  cuisine?: string;
  cookTime?: number;
  servings?: number;
  rating?: number;
  ingredients?: any[];
  instructions?: string[];
  tags?: string[];
  elementalProperties?: ElementalProperties;
  season?: string | string[];
  score?: RecipeScore;
  matchPercentage?: number;
}

const initialFilters: FilterState = {
  search: '',
  cuisineTypes: [],
  mealType: [],
  dietary: [],
  maxTime: undefined,
  spiciness: null,
  complexity: null,
  minRating: 0
};

// RecipeCard component with Material UI
const RecipeCard: React.FC<{
  recipe: EnhancedRecipe;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ recipe, isExpanded, onToggle }) => {
  const getElementColor = (element: string): string => {
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
  const tags = Array.isArray(recipe.tags) ? recipe.tags : [];

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
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
          {recipe.matchPercentage && (
            <Chip 
              label={`${Math.round(recipe.matchPercentage)}%`}
              color={recipe.matchPercentage > 75 ? 'success' : recipe.matchPercentage > 50 ? 'warning' : 'default'}
              size="small"
            />
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          {recipe.description}
        </Typography>

        <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
          {recipe.cuisine && (
            <Chip 
              icon={<Restaurant />}
              label={recipe.cuisine}
              size="small"
              variant="outlined"
            />
          )}
          {recipe.cookTime && (
            <Chip 
              icon={<AccessTime />}
              label={`${recipe.cookTime} min`}
              size="small"
              variant="outlined"
            />
          )}
          {recipe.servings && (
            <Chip 
              icon={<People />}
              label={`${recipe.servings} servings`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>

        {recipe.rating && (
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Rating 
              value={recipe.rating as number} 
              precision={0.5} 
              size="small" 
              readOnly 
            />
            <Typography variant="caption">
              {recipe.rating}/5
            </Typography>
          </Box>
        )}

        {tags?.length > 0 && (
          <Box mb={2}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Tags:
            </Typography>
            <Box display="flex" gap={0.5} flexWrap="wrap" mt={0.5}>
              {tags.slice(0, 3).map((tag, index) => (
                <Chip 
                  key={index}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              ))}
              {tags?.length > 3 && (
                <Chip 
                  label={`+${tags.length - 3} more`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              )}
            </Box>
          </Box>
        )}

        {recipe.elementalProperties && (
          <Box mb={2}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Elemental Balance:
            </Typography>
            <Grid container spacing={1}>
              {Object.entries(recipe.elementalProperties).map(([element, value]) => (
                <Grid item xs={6} key={element}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption" sx={{ minWidth: 30, fontSize: '0.7rem' }}>
                      {element}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(value as number) * 100}
                      sx={{ 
                        flexGrow: 1, 
                        height: 4, 
                        borderRadius: 1,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getElementColor(element)
                        }
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {recipe.score && (
          <Box mb={2}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Astrological Match: {Math.round(recipe.score.total)}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={recipe.score.total}
              sx={{ height: 6, borderRadius: 1 }}
            />
          </Box>
        )}
      </CardContent>

      <CardActions>
        <Button 
          size="small" 
          onClick={onToggle}
          endIcon={<ExpandMore sx={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }} />}
        >
          {isExpanded ? 'Less Details' : 'More Details'}
        </Button>
      </CardActions>

      {isExpanded && (
        <CardContent>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle2">
                Ingredients ({ingredients.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                {ingredients.map((ingredient, index) => (
                  <Typography key={index} variant="body2" gutterBottom>
                    • {typeof ingredient === 'string' ? ingredient : 
                       `${ingredient.amount || ''} ${ingredient.unit || ''} ${ingredient.name || ingredient}`}
                  </Typography>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>

          {instructions?.length > 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
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

          {recipe.score && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle2">
                  Score Breakdown
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption">Elemental:</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={recipe.score.elemental}
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption">Planetary:</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={recipe.score.planetary}
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption">Seasonal:</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={recipe.score.seasonal}
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption">Popularity:</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={recipe.score.popularity}
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          )}
        </CardContent>
      )}
    </Card>
  );
};

/**
 * RecipeList Component - Enhanced with Material UI and Astrological Integration
 */
export default function RecipeListMigrated() {
  const { recipeService } = useServices();
  
  // State management
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [enhancedRecipes, setEnhancedRecipes] = useState<EnhancedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [astroData, setAstroData] = useState<AstrologicalData | null>(null);

  // Pagination settings
  const limit = 12;

  // Available filter options
  const availableCuisines: CuisineType[] = ['Italian', 'Chinese', 'Mexican', 'Indian', 'Thai', 'Japanese', 'French', 'Mediterranean'];
  const availableMealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'];
  const availableDietary: DietaryRestriction[] = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'];

  // Astrologize API integration
  useEffect(() => {
    const fetchAstroData = async () => {
      try {
        const positions = await fetchPlanetaryPositions();
        const astroData: AstrologicalData = {
          planetaryPositions: positions || {},
          lunarPhase: 'new',
          currentSeason: 'summer',
          dominantElements: { Fire: 0.3, Water: 0.2, Earth: 0.3, Air: 0.2 },
          activePlanets: ['Sun', 'Moon', 'Mercury']
        };
        setAstroData(astroData);
      } catch (err) {
        // console.error('Failed to load astrological data:', err);
      }
    };
    fetchAstroData();
  }, []);

  // Fetch recipes
  useEffect(() => {
    fetchRecipes();
  }, [page]);

  // Enhanced recipes with scoring
  useEffect(() => {
    if (recipes?.length > 0) {
      const enhanced = recipes.map(recipe => ({
        ...recipe,
        score: calculateRecipeScore(recipe, astroData),
        matchPercentage: calculateRecipeScore(recipe, astroData)?.total || 0
      }));
      setEnhancedRecipes(enhanced);
    }
  }, [recipes, astroData]);

  /**
   * Multi-factor scoring system for recipes
   */
  const calculateRecipeScore = (recipe: EnhancedRecipe, astroData: AstrologicalData | null): RecipeScore => {
    if (!astroData) {
      return {
        total: 50,
        elemental: 50,
        planetary: 50,
        seasonal: 50,
        popularity: recipe.rating ? Number(recipe.rating) * 20 : 50
      };
    }

    // Calculate elemental match
    // Pattern KK-10: Final Arithmetic Elimination for recipe calculations
    const elementalMatch = calculateElementalMatch(recipe.elementalProperties, astroData.dominantElements) || 0;
    const elementalScore = Number(elementalMatch) * 100;
    
    // Calculate planetary influence
    const planetaryMatch = calculatePlanetaryInfluence(recipe.tags || [], astroData.activePlanets) || 0;
    const planetaryScore = Number(planetaryMatch) * 100;
    
    // Calculate seasonal alignment
    const seasonalScore = calculateSeasonalAlignment(recipe.season, astroData.currentSeason) * 100;
    
    // Popularity score based on rating
    const popularityScore = recipe.rating ? Number(recipe.rating) * 20 : 50;
    
    // Weighted total score
    const total = (
      elementalScore * 0.3 + 
      planetaryScore * 0.25 + 
      seasonalScore * 0.25 + 
      popularityScore * 0.2
    );

    return {
      total: Math.min(100, total),
      elemental: elementalScore,
      planetary: planetaryScore,
      seasonal: seasonalScore,
      popularity: popularityScore
    };
  };

  // Helper functions for scoring
  const calculateElementalMatch = (recipeProps?: ElementalProperties, systemProps?: ElementalProperties): number => {
    if (!recipeProps || !systemProps) return 0.5;
    
    let similarity = 0;
    let totalWeight = 0;
    
    Object.entries(recipeProps).forEach(([element, value]) => {
      const systemValue = systemProps[element as keyof ElementalProperties] || 0;
      const weight = systemValue + 0.25;
      similarity += (1 - Math.abs(value - systemValue)) * weight;
      totalWeight += weight;
    });
    
    return totalWeight > 0 ? similarity / totalWeight : 0.5;
  };

  const calculatePlanetaryInfluence = (tags: string[], activePlanets: string[]): number => {
    if (!tags.length || !activePlanets.length) return 0.5;
    
    const planetKeywords = {
      Sun: ['bright', 'golden', 'citrus', 'energizing'],
      moon: ['comfort', 'dairy', 'soft', 'nurturing'],
      Mars: ['spicy', 'hot', 'fiery', 'bold'],
      Venus: ['sweet', 'beautiful', 'romantic', 'indulgent'],
      Mercury: ['light', 'quick', 'versatile', 'mixed'],
      Jupiter: ['abundant', 'rich', 'festive', 'generous'],
      Saturn: ['traditional', 'structured', 'preserved', 'aged']
    };

    let matches = 0;
    let totalChecks = 0;

    activePlanets.forEach(planet => {
      const keywords = planetKeywords[planet as keyof typeof planetKeywords] || [];
      keywords.forEach(keyword => {
        totalChecks++;
        if (tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))) {
          matches++;
        }
      });
    });

    return totalChecks > 0 ? matches / totalChecks : 0.5;
  };

  const calculateSeasonalAlignment = (recipeSeason?: string | string[], currentSeason?: string): number => {
    if (!recipeSeason || !currentSeason) return 0.5;
    
    const seasons = Array.isArray(recipeSeason) ? recipeSeason : [recipeSeason];
    return seasons.some(season => season.toLowerCase() === currentSeason.toLowerCase()) ? 1.0 : 0.3;
  };

  /**
   * Fetch recipes with proper error handling
   */
  const fetchRecipes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await (recipeService.getAllRecipes as unknown)();
      
      // Apply safe type casting for response property access
      const responseData = response as Record<string, unknown>;
      
      if (responseData?.success) {
        setRecipes((responseData.data as unknown) || []);
        
        const metadataRecord = responseData?.metadata as Record<string, unknown>;
        if (metadataRecord) {
          setTotalPages((metadataRecord.totalPages as number) || 1);
        }
      } else {
        const errorRecord = responseData?.error as Record<string, unknown>;
        setError((errorRecord?.message as string) || 'Failed to fetch recipes');
        setRecipes([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to load recipes: ${errorMessage}`);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Apply filters to recipes
   */
  const filteredRecipes = useMemo(() => {
    return enhancedRecipes.filter(recipe => {
      // Search filter
      if (filters.search && !recipe.name.toLowerCase().includes(filters.search.toLowerCase()) &&
          !recipe.description?.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Cuisine filter
      if (filters.cuisineTypes?.length > 0 && !filters.cuisineTypes.includes(recipe.cuisine as CuisineType)) {
        return false;
      }

      // Max time filter
      // Pattern KK-10: Final Arithmetic Elimination for comparison operations
      if (filters.maxTime) {
        const numericCookTime = Number(recipe.cookTime) || 0;
        const numericMaxTime = Number(filters.maxTime) || 0;
        if (numericCookTime > 0 && numericCookTime > numericMaxTime) {
          return false;
        }
      }

      // Rating filter
      if (filters.minRating) {
        const numericRating = Number(recipe.rating) || 0;
        const numericMinRating = Number(filters.minRating) || 0;
        if (numericRating === 0 || numericRating < numericMinRating) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
  }, [enhancedRecipes, filters]);

  /**
   * Handle filter changes
   */
  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filters change
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setFilters(initialFilters);
    setPage(1);
  };

  /**
   * Toggle recipe expansion
   */
  const toggleRecipe = (id: string) => {
    setExpandedRecipeId(expandedRecipeId === id ? null : id);
  };

  // Render loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Loading recipes...
        </Typography>
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Button 
          color="inherit" 
          size="small" 
          onClick={fetchRecipes}
          sx={{ ml: 2 }}
        >
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Header and Search */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Recipe Collection
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            placeholder="Search recipes..."
            variant="outlined"
            size="small"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: filters.search && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => handleFilterChange('search', '')}
                  >
                    <Clear />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ minWidth: 250 }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
        </Box>
      </Box>

      {/* Filters Section */}
      {showFilters && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Cuisine</InputLabel>
                  <Select
                    multiple
                    value={filters.cuisineTypes}
                    onChange={(e) => handleFilterChange('cuisineTypes', e.target.value)}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as CuisineType[]).map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {availableCuisines.map((cuisine) => (
                      <MenuItem key={cuisine} value={cuisine}>
                        <Checkbox checked={filters.cuisineTypes.includes(cuisine)} />
                        {cuisine}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Max Cook Time (min)"
                  value={filters.maxTime || ''}
                  onChange={(e) => handleFilterChange('maxTime', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Minimum Rating
                  </Typography>
                  <Rating
                    value={filters.minRating}
                    onChange={(_, value) => handleFilterChange('minRating', value || 0)}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={3}>
                <Box display="flex" alignItems="center" height="100%">
                  <Button 
                    variant="outlined" 
                    color="secondary"
                    onClick={clearFilters}
                    fullWidth
                  >
                    Clear Filters
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Showing {filteredRecipes.length} recipes
        {astroData && ' (sorted by astrological compatibility)'}
      </Typography>

      {/* Recipe Grid */}
      {filteredRecipes?.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {filteredRecipes.map((recipe) => (
              <Grid item xs={12} md={6} lg={4} key={recipe.id}>
                <RecipeCard
                  recipe={recipe}
                  isExpanded={expandedRecipeId === recipe.id}
                  onToggle={() => toggleRecipe(recipe.id)}
                />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      ) : (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No recipes found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your filters or search terms
          </Typography>
        </Box>
      )}
    </Box>
  );
} 