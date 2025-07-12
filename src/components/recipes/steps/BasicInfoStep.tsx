// Created: 2025-01-02T23:45:00.000Z
// Basic Info Step for recipe name, cuisine, and basic details

'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  Slider,
  Switch,
  FormControlLabel,
  Autocomplete,
  Alert,
  Divider
} from '@mui/material';

import type { 
  Season,
  CuisineType,
  DietaryRestriction 
} from '@/types/alchemy';

interface BasicInfoStepProps {
  state: {
    name: string;
    description: string;
    cuisine: CuisineType | '';
    mealType: string[];
    servings: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    dietaryRestrictions: DietaryRestriction[];
    allergens: string[];
    season: Season | '';
  };
  setState: (updater: (prev: any) => any) => void;
  onComplete: () => void;
}

const CUISINE_OPTIONS: CuisineType[] = [
  'Italian', 'Mexican', 'Chinese', 'Japanese', 'Thai', 'Indian', 
  'French', 'Greek', 'Spanish', 'Korean', 'Vietnamese',
  'Moroccan', 'Ethiopian', 'Brazilian', 
  'American', 'Middle-Eastern'
];

const MEAL_TYPE_OPTIONS = [
  'breakfast', 'brunch', 'lunch', 'dinner', 'snack', 'dessert',
  'appetizer', 'main course', 'side dish', 'soup', 'salad', 'beverage'
];

const DIETARY_RESTRICTION_OPTIONS: DietaryRestriction[] = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free',
  'Keto', 'Paleo', 'Low-Carb', 'Low-Fat', 'Halal', 'Kosher'
];

const SEASON_OPTIONS: Season[] = ['spring', 'summer', 'autumn', 'winter'];

const ALLERGEN_OPTIONS = [
  'milk', 'eggs', 'fish', 'shellfish', 'tree nuts', 'peanuts',
  'wheat', 'soybeans', 'sesame', 'sulfites', 'mustard', 'celery'
];

export default function BasicInfoStep({ state, setState, onComplete }: BasicInfoStepProps) {
  
  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev: any) => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSelectChange = (field: string) => (event: any) => {
    setState((prev: any) => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleMultiSelectChange = (field: string) => (event: any, value: any) => {
    setState((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSliderChange = (field: string) => (event: any, value: number | number[]) => {
    setState((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  // Check if basic info is complete enough to proceed
  const isComplete = state.name.trim().length > 0 && state.description.trim().length > 0;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Basic Recipe Information
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Start by giving your recipe a name and describing what makes it special.
      </Typography>

      <Grid container spacing={3}>
        {/* Recipe Basics */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recipe Details
              </Typography>

              {/* Recipe Name */}
              <TextField
                fullWidth
                label="Recipe Name"
                value={state.name}
                onChange={handleInputChange('name')}
                placeholder="e.g., Spicy Thai Basil Stir Fry"
                sx={{ mb: 3 }}
                required
              />

              {/* Description */}
              <TextField
                fullWidth
                label="Description"
                value={state.description}
                onChange={handleInputChange('description')}
                placeholder="Describe your recipe, its origins, or what makes it special..."
                multiline
                rows={3}
                sx={{ mb: 3 }}
                required
              />

              {/* Cuisine and Meal Type */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={CUISINE_OPTIONS}
                    value={state.cuisine || null}
                    onChange={(_, value) => setState((prev: any) => ({ ...prev, cuisine: value || '' }))}
                    renderInput={(params) => (
                      <TextField {...params} label="Cuisine Type" />
                    )}
                    freeSolo
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    multiple
                    options={MEAL_TYPE_OPTIONS}
                    value={state.mealType}
                    onChange={handleMultiSelectChange('mealType')}
                    renderInput={(params) => (
                      <TextField {...params} label="Meal Type" />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip variant="outlined" label={option} {...getTagProps({ index })} key={option} />
                      ))
                    }
                  />
                </Grid>
              </Grid>

              {/* Servings and Difficulty */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Typography gutterBottom>
                    Servings: {state.servings}
                  </Typography>
                  <Slider
                    value={state.servings}
                    onChange={handleSliderChange('servings')}
                    min={1}
                    max={12}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Difficulty Level</InputLabel>
                    <Select
                      value={state.difficulty}
                      onChange={handleSelectChange('difficulty')}
                      label="Difficulty Level"
                    >
                      <MenuItem value="beginner">Beginner</MenuItem>
                      <MenuItem value="intermediate">Intermediate</MenuItem>
                      <MenuItem value="advanced">Advanced</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Season Preference */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Seasonal Preference (Optional)</InputLabel>
                <Select
                  value={state.season}
                  onChange={handleSelectChange('season')}
                  label="Seasonal Preference (Optional)"
                >
                  <MenuItem value="">Any Season</MenuItem>
                  {SEASON_OPTIONS.map(season => (
                    <MenuItem key={season} value={season}>
                      {season.charAt(0).toUpperCase() + season.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* Dietary Preferences */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Dietary Preferences
              </Typography>

              {/* Dietary Restrictions */}
              <Autocomplete
                multiple
                options={DIETARY_RESTRICTION_OPTIONS}
                value={state.dietaryRestrictions}
                onChange={handleMultiSelectChange('dietaryRestrictions')}
                renderInput={(params) => (
                  <TextField {...params} label="Dietary Restrictions" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} key={option} />
                  ))
                }
                sx={{ mb: 3 }}
              />

              {/* Allergens */}
              <Autocomplete
                multiple
                options={ALLERGEN_OPTIONS}
                value={state.allergens}
                onChange={handleMultiSelectChange('allergens')}
                renderInput={(params) => (
                  <TextField {...params} label="Contains Allergens" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} key={option} color="warning" />
                  ))
                }
              />

              <Divider sx={{ my: 3 }} />

              {/* Recipe Summary */}
              <Typography variant="subtitle2" gutterBottom>
                Recipe Summary
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2">
                  <strong>Name:</strong> {state.name || 'Not set'}
                </Typography>
                <Typography variant="body2">
                  <strong>Cuisine:</strong> {state.cuisine || 'Not specified'}
                </Typography>
                <Typography variant="body2">
                  <strong>Serves:</strong> {state.servings} people
                </Typography>
                <Typography variant="body2">
                  <strong>Difficulty:</strong> {state.difficulty}
                </Typography>
                {state.season && (
                  <Typography variant="body2">
                    <strong>Season:</strong> {state.season}
                  </Typography>
                )}
                {state.dietaryRestrictions.length > 0 && (
                  <Typography variant="body2">
                    <strong>Dietary:</strong> {state.dietaryRestrictions.join(', ')}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Completion Status */}
          {isComplete && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Basic information is complete! You can proceed to select ingredients.
            </Alert>
          )}
        </Grid>
      </Grid>
    </Box>
  );
} 