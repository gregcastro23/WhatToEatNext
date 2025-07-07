// Created: 2025-01-02T23:50:00.000Z
// Live Preview Sidebar for recipe building

'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Alert,
  Paper,
  Grid
} from '@mui/material';

import {
  Restaurant as RestaurantIcon,
  Timer as TimerIcon,
  People as PeopleIcon,
  Star as StarIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

import type { 
  ElementalProperties,
  Season,
  CuisineType,
  DietaryRestriction 
} from '@/types/alchemy';

interface SelectedIngredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  category: string;
  elementalProperties?: ElementalProperties;
}

interface RecipeInstruction {
  id: string;
  step: number;
  instruction: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: Array<{ message: string; severity: string }>;
  warnings: Array<{ message: string }>;
  suggestions: Array<{ message: string }>;
  score: number;
}

interface LivePreviewSidebarProps {
  state: {
    name: string;
    description: string;
    cuisine: CuisineType | '';
    mealType: string[];
    servings: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    dietaryRestrictions: DietaryRestriction[];
    selectedIngredients: SelectedIngredient[];
    instructions: RecipeInstruction[];
    prepTime: number;
    cookTime: number;
    totalTime: number;
    elementalPreference: Partial<ElementalProperties>;
  };
  validationResult?: ValidationResult | null;
  generatedRecipe?: any;
}

export default function LivePreviewSidebar({ 
  state, 
  validationResult, 
  generatedRecipe 
}: LivePreviewSidebarProps) {
  
  // Calculate completion percentage
  const completionScore = React.useMemo(() => {
    let score = 0;
    const maxScore = 100;
    
    // Basic info (30 points)
    if (state.name.trim()) score += 15;
    if (state.description.trim()) score += 15;
    
    // Ingredients (40 points)
    if (state.selectedIngredients.length > 0) score += 20;
    if (state.selectedIngredients.length >= 3) score += 20;
    
    // Instructions (20 points)
    if (state.instructions.length > 0) score += 10;
    if (state.instructions.length >= 3) score += 10;
    
    // Additional details (10 points)
    if (state.cuisine) score += 5;
    if (state.mealType.length > 0) score += 5;
    
    return Math.min(score, maxScore);
  }, [state]);

  // Calculate elemental balance
  const elementalBalance = React.useMemo(() => {
    if (state.selectedIngredients.length === 0) return null;
    
    const totals = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    let count = 0;
    
    state.selectedIngredients.forEach(ingredient => {
      if (ingredient.elementalProperties) {
        Object.entries(ingredient.elementalProperties).forEach(([element, value]) => {
          totals[element as keyof ElementalProperties] += value as number;
          count++;
        });
      }
    });
    
    if (count === 0) return null;
    
    // Normalize
    const sum = Object.values(totals).reduce((a, b) => a + b, 0);
    if (sum === 0) return null;
    
    return {
      Fire: (totals.Fire / sum) * 100,
      Water: (totals.Water / sum) * 100,
      Earth: (totals.Earth / sum) * 100,
      Air: (totals.Air / sum) * 100
    };
  }, [state.selectedIngredients]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  const getElementColor = (element: string) => {
    switch (element) {
      case 'Fire': return '#ff5722';
      case 'Water': return '#2196f3';
      case 'Earth': return '#4caf50';
      case 'Air': return '#9c27b0';
      default: return '#757575';
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Recipe Overview */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recipe Preview
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              {state.name || 'Untitled Recipe'}
            </Typography>
            {state.description && (
              <Typography variant="body2" color="text.secondary" paragraph>
                {state.description.length > 100 
                  ? `${state.description.substring(0, 100)}...` 
                  : state.description
                }
              </Typography>
            )}
          </Box>

          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PeopleIcon fontSize="small" color="action" />
                <Typography variant="body2">{state.servings} servings</Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimerIcon fontSize="small" color="action" />
                <Typography variant="body2">{state.totalTime} min</Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {state.cuisine && (
              <Chip size="small" label={state.cuisine} />
            )}
            <Chip 
              size="small" 
              label={state.difficulty} 
              color={getDifficultyColor(state.difficulty) as any}
            />
            {state.dietaryRestrictions.map(restriction => (
              <Chip 
                key={restriction} 
                size="small" 
                label={restriction} 
                variant="outlined"
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Completion Progress */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <TrendingUpIcon fontSize="small" />
            <Typography variant="h6">
              Completion
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {completionScore}% complete
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={completionScore} 
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Basic Info</Typography>
              <Typography variant="body2" color={state.name && state.description ? 'success.main' : 'text.secondary'}>
                {state.name && state.description ? '✓' : '○'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Ingredients</Typography>
              <Typography variant="body2" color={state.selectedIngredients.length > 0 ? 'success.main' : 'text.secondary'}>
                {state.selectedIngredients.length > 0 ? '✓' : '○'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Instructions</Typography>
              <Typography variant="body2" color={state.instructions.length > 0 ? 'success.main' : 'text.secondary'}>
                {state.instructions.length > 0 ? '✓' : '○'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Ingredients Summary */}
      {state.selectedIngredients.length > 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <RestaurantIcon fontSize="small" />
              <Typography variant="h6">
                Ingredients ({state.selectedIngredients.length})
              </Typography>
            </Box>
            
            <List dense>
              {state.selectedIngredients.slice(0, 5).map(ingredient => (
                <ListItem key={ingredient.id} sx={{ px: 0, py: 0.5 }}>
                  <ListItemText
                    primary={
                      <Typography variant="body2">
                        {ingredient.quantity} {ingredient.unit} {ingredient.name}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {ingredient.category}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
              {state.selectedIngredients.length > 5 && (
                <ListItem sx={{ px: 0, py: 0.5 }}>
                  <ListItemText
                    primary={
                      <Typography variant="body2" color="text.secondary">
                        +{state.selectedIngredients.length - 5} more ingredients
                      </Typography>
                    }
                  />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Elemental Balance */}
      {elementalBalance && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Elemental Balance
            </Typography>
            
            {Object.entries(elementalBalance).map(([element, percentage]) => (
              <Box key={element} sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">{element}</Typography>
                  <Typography variant="body2">{Math.round(percentage)}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={percentage} 
                  sx={{ 
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getElementColor(element)
                    }
                  }}
                />
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Validation Results */}
      {validationResult && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              {validationResult.isValid ? (
                <CheckCircleIcon fontSize="small" color="success" />
              ) : (
                <WarningIcon fontSize="small" color="warning" />
              )}
              <Typography variant="h6">
                Validation
              </Typography>
            </Box>
            
            <Typography variant="body2" gutterBottom>
              Recipe Score: {Math.round(validationResult.score * 100)}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={validationResult.score * 100} 
              color={validationResult.isValid ? 'success' : 'warning'}
              sx={{ mb: 2 }}
            />
            
            {validationResult.errors.length > 0 && (
              <Alert severity="error" sx={{ mb: 1 }}>
                {validationResult.errors.length} error{validationResult.errors.length !== 1 ? 's' : ''}
              </Alert>
            )}
            
            {validationResult.warnings.length > 0 && (
              <Alert severity="warning" sx={{ mb: 1 }}>
                {validationResult.warnings.length} warning{validationResult.warnings.length !== 1 ? 's' : ''}
              </Alert>
            )}
            
            {validationResult.suggestions.length > 0 && (
              <Alert severity="info">
                {validationResult.suggestions.length} suggestion{validationResult.suggestions.length !== 1 ? 's' : ''}
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Generated Recipe Preview */}
      {generatedRecipe && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Generated Recipe
            </Typography>
            <Alert severity="success">
              Recipe successfully generated with Monica optimization!
            </Alert>
          </CardContent>
        </Card>
      )}
    </Box>
  );
} 