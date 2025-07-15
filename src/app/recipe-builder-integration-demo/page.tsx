// Recipe Builder Integration Demo
// Demonstrates the new cuisine database integration functionality

'use client';

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack
} from '@mui/material';
import { getCuisineRecipeStats, recipeCuisineConnector } from '@/services/RecipeCuisineConnector';
import { useCuisineRecipes, useRecipeInspiration } from '@/hooks/useCuisineRecipes';
import EnhancedRecipeBuilder from '@/components/recipes/EnhancedRecipeBuilder';

export default function RecipeBuilderIntegrationDemo() {
  const stats = getCuisineRecipeStats();
  const { recipes: inspirationRecipes } = useRecipeInspiration(6);

  return (
    <Box sx={{ maxWidth: '1400px', mx: 'auto', p: 3 }}>
      {/* Header */}
      <Typography variant="h3" component="h1" gutterBottom>
        Recipe Builder Integration Demo
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        Demonstrating the integration between the Enhanced Recipe Builder and the Cuisine Database
      </Typography>

      {/* Stats Overview */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Cuisine Database Overview
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {stats.totalRecipes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Recipes Available
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {Object.keys(stats.byCuisine).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cuisines Available
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {Object.keys(stats.byMealType).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Meal Types
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {Object.keys(stats.byDietaryInfo).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Dietary Options
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Top Cuisines */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Available Cuisines
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {Object.entries(stats.byCuisine)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 10)
              .map(([cuisine, count]) => (
                <Chip 
                  key={cuisine}
                  label={`${cuisine} (${count})`}
                  variant="outlined"
                  color="primary"
                />
              ))}
          </Stack>
        </Box>

        {/* Meal Types */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Meal Types Available
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {Object.entries(stats.byMealType)
              .sort(([,a], [,b]) => b - a)
              .map(([mealType, count]) => (
                <Chip 
                  key={mealType}
                  label={`${mealType} (${count})`}
                  variant="outlined"
                  color="secondary"
                />
              ))}
          </Stack>
        </Box>

        {/* Dietary Options */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Dietary Options
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {Object.entries(stats.byDietaryInfo)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 8)
              .map(([diet, count]) => (
                <Chip 
                  key={diet}
                  label={`${diet} (${count})`}
                  variant="outlined"
                  color="success"
                />
              ))}
          </Stack>
        </Box>
      </Paper>

      {/* Sample Inspiration Recipes */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Sample Recipe Inspiration
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          These are random recipes from the database that can be imported into the builder
        </Typography>
        <Grid container spacing={2}>
          {inspirationRecipes.slice(0, 6).map(recipe => (
            <Grid item xs={12} sm={6} md={4} key={recipe.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom noWrap>
                    {recipe.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: '40px', overflow: 'hidden' }}>
                    {recipe.description}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip label={recipe.cuisine} size="small" color="primary" variant="outlined" />
                    {recipe.mealType?.slice(0, 1).map(type => (
                      <Chip key={type} label={type} size="small" variant="outlined" />
                    ))}
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {recipe.ingredients.length} ingredients • {recipe.prepTime || 'Quick prep'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Integration Features */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Integration Features Implemented
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom color="primary">
              ✅ Recipe Database Connector
            </Typography>
            <Typography variant="body2" paragraph>
              Service that bridges the cuisine database with the recipe builder, providing search, filtering, and import capabilities.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom color="primary">
              ✅ Recipe Import Component
            </Typography>
            <Typography variant="body2" paragraph>
              Interactive UI for browsing and importing recipes from the extensive cuisine database with advanced filtering.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom color="primary">
              ✅ Enhanced Recipe Builder Integration
            </Typography>
            <Typography variant="body2" paragraph>
              "Import Recipe" button in the builder that opens a modal for selecting and importing existing recipes for modification.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom color="primary">
              ✅ Recipe Inspiration System
            </Typography>
            <Typography variant="body2" paragraph>
              Intelligent recipe suggestions based on random selection, seasonal preferences, and cuisine filters.
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Instructions */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          How to Use the Integration
        </Typography>
        <Box component="ol" sx={{ pl: 2 }}>
          <Box component="li" sx={{ mb: 1 }}>
            <Typography variant="body1">
              <strong>Start the Recipe Builder:</strong> Click on the Enhanced Recipe Builder below
            </Typography>
          </Box>
          <Box component="li" sx={{ mb: 1 }}>
            <Typography variant="body1">
              <strong>Import a Recipe:</strong> Click the "Import Recipe" button in the top-right corner
            </Typography>
          </Box>
          <Box component="li" sx={{ mb: 1 }}>
            <Typography variant="body1">
              <strong>Browse and Filter:</strong> Use the search and filter options to find recipes from {stats.totalRecipes} available recipes
            </Typography>
          </Box>
          <Box component="li" sx={{ mb: 1 }}>
            <Typography variant="body1">
              <strong>Import and Modify:</strong> Click "Import Recipe" on any recipe card to load it into the builder for modification
            </Typography>
          </Box>
          <Box component="li" sx={{ mb: 1 }}>
            <Typography variant="body1">
              <strong>Customize:</strong> Use the builder's advanced features to modify ingredients, instructions, and alchemical properties
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Enhanced Recipe Builder */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Enhanced Recipe Builder with Cuisine Integration
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Try the "Import Recipe" button to browse and import from the cuisine database
        </Typography>
        <EnhancedRecipeBuilder />
      </Paper>
    </Box>
  );
}