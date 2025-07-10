// Created: 2025-01-02T23:40:00.000Z
// Ingredients Step with auto-complete search and drag-and-drop

'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  IconButton,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Tooltip,
  Badge,
  Collapse,
  Alert,
  CircularProgress
} from '@mui/material';

// Drag and drop functionality will be implemented with native HTML5 API

import {
  Add as AddIcon,
  Remove as RemoveIcon,
  DragIndicator as DragIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  Info as InfoIcon,
  LocalOffer as TagIcon,
  Restaurant as RestaurantIcon,
  Nature as EcoIcon
} from '@mui/icons-material';

import type { 
  Ingredient, 
  ElementalProperties,
  Season,
  DietaryRestriction 
} from '@/types/alchemy';
import type { Ingredient as IngredientWithQualities } from '@/types/ingredient';
import { 
  VALID_CATEGORIES,
  getAllIngredientsByCategory 
} from '@/data/ingredients';

// Types
interface SelectedIngredient extends IngredientWithQualities {
  quantity: string;
  unit: string;
  notes?: string;
  preparation?: string;
  substitutes?: string[];
  id: string;
}

interface IngredientSearchResult extends Ingredient {
  searchScore: number;
  matchReasons: string[];
}

interface IngredientsStepProps {
  state: {
    selectedIngredients: SelectedIngredient[];
    season: Season | '';
    dietaryRestrictions: DietaryRestriction[];
    elementalPreference: Partial<ElementalProperties>;
  };
  setState: (updater: (prev: any) => any) => void;
  searchResults: IngredientSearchResult[];
  isSearching: boolean;
  onSearch: (searchTerm: string) => void;
  onSelect: (ingredient: Ingredient) => void;
  onRemove: (ingredientId: string) => void;
  onUpdate: (ingredientId: string, updates: Partial<SelectedIngredient>) => void;
  onDragEnd: (fromIndex: number, toIndex: number) => void;
  onComplete: () => void;
}

const COMMON_UNITS = [
  'cup', 'cups',
  'tablespoon', 'tablespoons', 'tbsp',
  'teaspoon', 'teaspoons', 'tsp',
  'ounce', 'ounces', 'oz',
  'pound', 'pounds', 'lb', 'lbs',
  'gram', 'grams', 'g',
  'kilogram', 'kilograms', 'kg',
  'milliliter', 'milliliters', 'ml',
  'liter', 'liters', 'l',
  'piece', 'pieces',
  'clove', 'cloves',
  'slice', 'slices',
  'whole', 'half', 'quarter',
  'pinch', 'dash',
  'bunch', 'head', 'stalk'
];

const PREPARATION_METHODS = [
  'chopped', 'diced', 'minced', 'sliced',
  'grated', 'shredded', 'julienned',
  'crushed', 'ground', 'whole',
  'peeled', 'seeded', 'stemmed',
  'blanched', 'roasted', 'toasted'
];

export default function IngredientsStep({
  state,
  setState,
  searchResults,
  isSearching,
  onSearch,
  onSelect,
  onRemove,
  onUpdate,
  onDragEnd,
  onComplete
}: IngredientsStepProps) {
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedIngredient, setExpandedIngredient] = useState<string | null>(null);

  // Category-based ingredient suggestions
  const categoryIngredients = useMemo(() => {
    if (selectedCategory === 'all') return [];
    return getAllIngredientsByCategory(selectedCategory).slice(0, 10);
  }, [selectedCategory]);

  // Handle search input
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  // Handle ingredient selection from autocomplete
  const handleIngredientSelect = (ingredient: Ingredient) => {
    onSelect(ingredient);
    setSearchTerm('');
  };

  // Handle category selection
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category !== 'all') {
      setSearchTerm('');
    }
  };

  // Render ingredient card
  const renderIngredientCard = (ingredient: SelectedIngredient, index: number) => (
    <Card
      key={ingredient.id}
      sx={{
        mb: 2,
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 2
        }
      }}
    >
      <CardContent sx={{ pb: '16px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          {/* Move Up/Down Controls */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: 'text.secondary'
            }}
          >
            <IconButton
              size="small"
              onClick={() => index > 0 && onDragEnd(index, index - 1)}
              disabled={index === 0}
            >
              <DragIcon style={{ transform: 'rotate(-90deg)' }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => index < state.selectedIngredients.length - 1 && onDragEnd(index, index + 1)}
              disabled={index === state.selectedIngredients.length - 1}
            >
              <DragIcon style={{ transform: 'rotate(90deg)' }} />
            </IconButton>
          </Box>

              {/* Ingredient Info */}
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="h6" component="h3">
                    {ingredient.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => onRemove(ingredient.id)}
                    color="error"
                  >
                    <RemoveIcon />
                  </IconButton>
                </Box>

                {/* Quantity and Unit */}
                <Box sx={{ display: 'flex', gap: 2, mt: 1, mb: 1 }}>
                  <TextField
                    size="small"
                    label="Quantity"
                    value={ingredient.quantity}
                    onChange={(e) => onUpdate(ingredient.id, { quantity: e.target.value })}
                    sx={{ width: '120px' }}
                  />
                  <Autocomplete
                    size="small"
                    options={COMMON_UNITS}
                    value={ingredient.unit}
                    onChange={(_, value) => onUpdate(ingredient.id, { unit: value || 'cup' })}
                    renderInput={(params) => (
                      <TextField {...params} label="Unit" sx={{ width: '140px' }} />
                    )}
                    freeSolo
                  />
                </Box>

                {/* Ingredient Tags */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                  <Chip size="small" label={ingredient.category} icon={<TagIcon />} />
                  {ingredient.elementalProperties && (
                    <Tooltip title="Dominant Element">
                      <Chip
                        size="small"
                        label={getDominantElement(ingredient.elementalProperties)}
                        icon={<EcoIcon />}
                        color="primary"
                        variant="outlined"
                      />
                    </Tooltip>
                  )}
                  {ingredient.qualities && ingredient.qualities.length > 0 && (
                    <Chip
                      size="small"
                      label={`${ingredient.qualities.length} qualities`}
                      variant="outlined"
                    />
                  )}
                </Box>

                {/* Expandable Details */}
                <Box>
                  <Button
                    size="small"
                    onClick={() => setExpandedIngredient(
                      expandedIngredient === ingredient.id ? null : ingredient.id
                    )}
                    endIcon={expandedIngredient === ingredient.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  >
                    {expandedIngredient === ingredient.id ? 'Less Details' : 'More Details'}
                  </Button>

                  <Collapse in={expandedIngredient === ingredient.id}>
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      {/* Preparation Method */}
                      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                        <InputLabel>Preparation</InputLabel>
                        <Select
                          value={ingredient.preparation || ''}
                          onChange={(e) => onUpdate(ingredient.id, { preparation: e.target.value })}
                          label="Preparation"
                        >
                          <MenuItem value="">None</MenuItem>
                          {PREPARATION_METHODS.map(method => (
                            <MenuItem key={method} value={method}>{method}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {/* Notes */}
                      <TextField
                        fullWidth
                        size="small"
                        label="Notes"
                        value={ingredient.notes || ''}
                        onChange={(e) => onUpdate(ingredient.id, { notes: e.target.value })}
                        multiline
                        rows={2}
                        sx={{ mb: 2 }}
                      />

                      {/* Elemental Properties */}
                      {ingredient.elementalProperties && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Elemental Properties
                          </Typography>
                          <Grid container spacing={1}>
                            {Object.entries(ingredient.elementalProperties).map(([element, value]) => (
                              <Grid item xs={3} key={element}>
                                <Box sx={{ textAlign: 'center' }}>
                                  <Typography variant="caption" color="text.secondary">
                                    {element}
                                  </Typography>
                                  <Typography variant="body2" fontWeight="bold">
                                    {Math.round((value as number) * 100)}%
                                  </Typography>
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}
                    </Box>
                  </Collapse>
                </Box>
              </Box>
                      </Box>
        </CardContent>
      </Card>
  );

  // Render search result
  const renderSearchResult = (ingredient: IngredientSearchResult) => (
    <ListItem
      key={ingredient.name}
      button
      onClick={() => handleIngredientSelect(ingredient)}
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        mb: 1,
        '&:hover': {
          bgcolor: 'action.hover'
        }
      }}
    >
      <ListItemText
        primary={ingredient.name}
        secondary={
          <Box>
            <Typography variant="body2" color="text.secondary">
              {ingredient.category} • Score: {Math.round(ingredient.searchScore * 100)}%
            </Typography>
            {ingredient.matchReasons.length > 0 && (
              <Typography variant="caption" color="primary">
                Matches: {ingredient.matchReasons.join(', ')}
              </Typography>
            )}
          </Box>
        }
      />
      <ListItemSecondaryAction>
        <IconButton edge="end" onClick={() => handleIngredientSelect(ingredient)}>
          <AddIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );

  // Get dominant element
  const getDominantElement = (elementalProperties: ElementalProperties): string => {
    return Object.entries(elementalProperties)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0][0];
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Select Ingredients
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Search for ingredients or browse by category. Drag and drop to reorder.
      </Typography>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search ingredients..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  endAdornment: isSearching && <CircularProgress size={20} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {VALID_CATEGORIES.map(category => (
                    <MenuItem key={category} value={category}>
                      {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setShowFilters(!showFilters)}
                startIcon={<FilterIcon />}
              >
                Filters
              </Button>
            </Grid>
          </Grid>

          {/* Advanced Filters */}
          <Collapse in={showFilters}>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Filter by Properties
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" gutterBottom>
                    Seasonal Preference: {state.season || 'Any'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" gutterBottom>
                    Dietary Restrictions: {state.dietaryRestrictions.length || 'None'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Search Results / Category Browse */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {searchTerm ? 'Search Results' : selectedCategory !== 'all' ? 'Category Ingredients' : 'Popular Ingredients'}
              </Typography>

              {/* Search Results */}
              {searchTerm && (
                <Box>
                  {isSearching ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                      <CircularProgress />
                    </Box>
                  ) : searchResults.length > 0 ? (
                    <List>
                      {searchResults.map(renderSearchResult)}
                    </List>
                  ) : (
                    <Alert severity="info">
                      No ingredients found for "{searchTerm}"
                    </Alert>
                  )}
                </Box>
              )}

              {/* Category Browse */}
              {!searchTerm && selectedCategory !== 'all' && (
                <List>
                  {categoryIngredients.map(ingredient => (
                    <ListItem
                      key={ingredient.name}
                      button
                      onClick={() => handleIngredientSelect(ingredient)}
                    >
                      <ListItemText
                        primary={ingredient.name}
                        secondary={ingredient.category}
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" onClick={() => handleIngredientSelect(ingredient)}>
                          <AddIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}

              {/* Default State */}
              {!searchTerm && selectedCategory === 'all' && (
                <Typography variant="body2" color="text.secondary">
                  Start typing to search for ingredients or select a category to browse.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Selected Ingredients */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Selected Ingredients
                  <Badge badgeContent={state.selectedIngredients.length} color="primary" sx={{ ml: 1 }} />
                </Typography>
                {state.selectedIngredients.length > 0 && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={onComplete}
                  >
                    Continue to Instructions
                  </Button>
                )}
              </Box>

              {state.selectedIngredients.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
                  <RestaurantIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No ingredients selected
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Search for ingredients above to get started
                  </Typography>
                </Paper>
              ) : (
                <Box>
                  {state.selectedIngredients.map((ingredient, index) =>
                    renderIngredientCard(ingredient, index)
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 