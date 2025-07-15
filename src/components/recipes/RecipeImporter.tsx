// Recipe Importer Component
// Allows users to browse and import recipes from the cuisine database into the recipe builder

'use client';

import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Collapse,
  IconButton,
  Divider,
  Tooltip,
  Stack,
  Badge
} from '@mui/material';
import {
  Search as SearchIcon,
  ImportExport as ImportIcon,
  Restaurant as RestaurantIcon,
  AccessTime as TimeIcon,
  LocalDining as DiningIcon,
  Shuffle as ShuffleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Info as InfoIcon
} from '@mui/icons-material';

import { useCuisineRecipes, useRecipeInspiration } from '@/hooks/useCuisineRecipes';
import type { CuisineRecipe, RecipeSearchFilters } from '@/services/RecipeCuisineConnector';
import type { Recipe } from '@/types/recipe';

interface RecipeImporterProps {
  onImportRecipe: (recipe: Recipe) => void;
  onClose?: () => void;
  maxHeight?: string;
}

interface RecipeCardProps {
  recipe: CuisineRecipe;
  onImport: (recipe: CuisineRecipe) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onImport }) => {
  const [expanded, setExpanded] = useState(false);

  const handleImport = () => {
    onImport(recipe);
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h3" gutterBottom noWrap>
          {recipe.name}
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: expanded ? 'none' : 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {recipe.description}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip 
            label={recipe.cuisine} 
            size="small" 
            color="primary" 
            variant="outlined"
            icon={<RestaurantIcon />}
          />
          {recipe.mealType?.slice(0, 2).map(type => (
            <Chip 
              key={type}
              label={type} 
              size="small" 
              variant="outlined"
              icon={<DiningIcon />}
            />
          ))}
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          {recipe.prepTime && (
            <Chip 
              label={recipe.prepTime} 
              size="small" 
              color="info"
              variant="outlined"
              icon={<TimeIcon />}
            />
          )}
          {recipe.servingSize && (
            <Chip 
              label={`Serves ${recipe.servingSize}`} 
              size="small" 
              color="success"
              variant="outlined"
            />
          )}
        </Stack>

        <Collapse in={expanded}>
          <Divider sx={{ my: 2 }} />
          
          {recipe.ingredients.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Key Ingredients:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {recipe.ingredients.slice(0, 5).map(ing => ing.name).join(', ')}
                {recipe.ingredients.length > 5 && '...'}
              </Typography>
            </Box>
          )}

          {recipe.dietaryInfo?.length ? (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Dietary Info:
              </Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                {recipe.dietaryInfo.map(info => (
                  <Chip key={info} label={info} size="small" color="success" />
                ))}
              </Stack>
            </Box>
          ) : null}

          {recipe.allergens?.length ? (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Contains:
              </Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                {recipe.allergens.map(allergen => (
                  <Chip key={allergen} label={allergen} size="small" color="warning" />
                ))}
              </Stack>
            </Box>
          ) : null}

          {recipe.nutrition && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Nutrition (per serving):
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {recipe.nutrition.calories} cal • 
                {recipe.nutrition.protein}g protein • 
                {recipe.nutrition.carbs}g carbs • 
                {recipe.nutrition.fat}g fat
              </Typography>
            </Box>
          )}

          {recipe.culturalNotes && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Cultural Notes:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {recipe.culturalNotes}
              </Typography>
            </Box>
          )}
        </Collapse>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <IconButton 
            onClick={() => setExpanded(!expanded)}
            size="small"
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
          
          <Button
            variant="contained"
            size="small"
            startIcon={<ImportIcon />}
            onClick={handleImport}
          >
            Import Recipe
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export const RecipeImporter: React.FC<RecipeImporterProps> = ({
  onImportRecipe,
  onClose,
  maxHeight = '600px'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [importAlert, setImportAlert] = useState<{
    type: 'success' | 'warning' | 'error';
    message: string;
  } | null>(null);

  const {
    recipes,
    totalCount,
    cuisineList,
    stats,
    filters,
    updateFilter,
    clearFilters,
    importRecipe,
    loading,
    error
  } = useCuisineRecipes({
    autoLoad: true,
    maxResults: 20
  });

  const {
    recipes: inspirationRecipes,
    loading: inspirationLoading,
    refresh: refreshInspiration
  } = useRecipeInspiration(6);

  const handleImportRecipe = useCallback((cuisineRecipe: CuisineRecipe) => {
    const result = importRecipe(cuisineRecipe.id);
    
    if (result.success && result.recipe) {
      onImportRecipe(result.recipe);
      setImportAlert({
        type: 'success',
        message: `Successfully imported "${cuisineRecipe.name}"`
      });
      
      if (onClose) {
        setTimeout(onClose, 1500); // Auto-close after success
      }
    } else {
      setImportAlert({
        type: 'error',
        message: result.errors?.[0] || 'Failed to import recipe'
      });
    }

    // Clear alert after 5 seconds
    setTimeout(() => setImportAlert(null), 5000);
  }, [importRecipe, onImportRecipe, onClose]);

  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
    updateFilter('ingredients', query ? [query] : undefined);
  };

  return (
    <Box sx={{ maxHeight, display: 'flex', flexDirection: 'column' }}>
      {/* Header with Stats */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Import Recipe from Cuisine Database
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Browse and import from {totalCount} recipes across {cuisineList.length} cuisines
        </Typography>
        
        {importAlert && (
          <Alert 
            severity={importAlert.type} 
            sx={{ mt: 2 }}
            onClose={() => setImportAlert(null)}
          >
            {importAlert.message}
          </Alert>
        )}
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 3 }}>
        <Stack spacing={2}>
          <TextField
            fullWidth
            placeholder="Search recipes by ingredient, name, or cuisine..."
            value={searchQuery}
            onChange={(e) => handleSearchQueryChange(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => setShowFilters(!showFilters)}
              startIcon={showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            >
              Advanced Filters
            </Button>
            
            <Box>
              <Button
                variant="outlined"
                size="small"
                onClick={clearFilters}
                sx={{ mr: 1 }}
              >
                Clear All
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ShuffleIcon />}
                onClick={refreshInspiration}
                disabled={inspirationLoading}
              >
                Random
              </Button>
            </Box>
          </Box>

          <Collapse in={showFilters}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Cuisine</InputLabel>
                  <Select
                    value={filters.cuisine || ''}
                    onChange={(e) => updateFilter('cuisine', e.target.value || undefined)}
                    label="Cuisine"
                  >
                    <MenuItem value="">All Cuisines</MenuItem>
                    {cuisineList.map(cuisine => (
                      <MenuItem key={cuisine} value={cuisine}>
                        <Badge badgeContent={stats.byCuisine[cuisine]} color="primary">
                          {cuisine}
                        </Badge>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Meal Type</InputLabel>
                  <Select
                    value={filters.mealType || ''}
                    onChange={(e) => updateFilter('mealType', e.target.value || undefined)}
                    label="Meal Type"
                  >
                    <MenuItem value="">All Meals</MenuItem>
                    {Object.entries(stats.byMealType).map(([mealType, count]) => (
                      <MenuItem key={mealType} value={mealType}>
                        <Badge badgeContent={count} color="primary">
                          {mealType}
                        </Badge>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Season</InputLabel>
                  <Select
                    value={filters.season || ''}
                    onChange={(e) => updateFilter('season', e.target.value || undefined)}
                    label="Season"
                  >
                    <MenuItem value="">All Seasons</MenuItem>
                    {Object.entries(stats.bySeason).map(([season, count]) => (
                      <MenuItem key={season} value={season}>
                        <Badge badgeContent={count} color="primary">
                          {season}
                        </Badge>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Dietary</InputLabel>
                  <Select
                    value={filters.dietaryRestrictions?.[0] || ''}
                    onChange={(e) => updateFilter('dietaryRestrictions', e.target.value ? [e.target.value] : undefined)}
                    label="Dietary"
                  >
                    <MenuItem value="">All Diets</MenuItem>
                    {Object.entries(stats.byDietaryInfo).map(([diet, count]) => (
                      <MenuItem key={diet} value={diet}>
                        <Badge badgeContent={count} color="primary">
                          {diet}
                        </Badge>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Collapse>
        </Stack>
      </Box>

      {/* Results */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Typography>Loading recipes...</Typography>
        ) : (
          <>
            {/* Recipe Inspiration Section */}
            {!searchQuery && !Object.keys(filters).length && (
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    Recipe Inspiration
                  </Typography>
                  <Tooltip title="Random selection of popular recipes">
                    <IconButton size="small">
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Grid container spacing={2}>
                  {inspirationRecipes.map(recipe => (
                    <Grid item xs={12} sm={6} md={4} key={recipe.id}>
                      <RecipeCard recipe={recipe} onImport={handleImportRecipe} />
                    </Grid>
                  ))}
                </Grid>
                <Divider sx={{ my: 3 }} />
              </Box>
            )}

            {/* Search Results */}
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                {searchQuery || Object.keys(filters).length 
                  ? `Search Results (${recipes.length})` 
                  : `All Recipes (${recipes.length})`}
              </Typography>
            </Box>

            {recipes.length === 0 ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No recipes found matching your criteria. Try adjusting your search or filters.
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {recipes.map(recipe => (
                  <Grid item xs={12} sm={6} md={4} key={recipe.id}>
                    <RecipeCard recipe={recipe} onImport={handleImportRecipe} />
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};