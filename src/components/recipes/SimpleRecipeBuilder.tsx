'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Alert,
  LinearProgress,
  Divider,
  Badge,
  IconButton,
  Tooltip
} from '@mui/material';

import {
  Restaurant as RestaurantIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  AutoFixHigh as GenerateIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

import type { 
  ElementalProperties,
  Season 
} from '@/types/alchemy';

import {
  getAllVegetables,
  getAllProteins,
  getAllHerbs,
  getAllSpices,
  getAllGrains,
  getAllIngredientsByCategory,
  ingredientsMap
} from '@/data/ingredients';

import { allOils } from '@/data/ingredients/oils';

import { cuisinesMap } from '@/data/cuisines';
import { generateMonicaOptimizedRecipe } from '@/data/unified/recipeBuilding';

// Types
interface SelectedIngredient {
  name: string;
  category: string;
  elementalProperties?: ElementalProperties;
  score?: number;
}

interface CategoryData {
  name: string;
  ingredients: any[];
  color: string;
  icon: string;
}

interface GeneratedRecipe {
  name: string;
  description: string;
  ingredients: SelectedIngredient[];
  instructions: string[];
  cuisine?: string;
  elementalBalance: ElementalProperties;
  monicaScore: number;
  confidence: number;
}

export default function SimpleRecipeBuilder() {
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([]);
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Helper functions to get ingredients by category
  const getDairyIngredients = () => getAllIngredientsByCategory('dairy');
  const getOilIngredients = () => Object.values(allOils).filter(oil => oil.category === 'oil');

  // Category configuration
  const categories: CategoryData[] = [
    {
      name: 'Proteins',
      ingredients: getAllProteins(),
      color: '#ef4444',
      icon: '🥩'
    },
    {
      name: 'Vegetables',
      ingredients: getAllVegetables(),
      color: '#22c55e',
      icon: '🥬'
    },
    {
      name: 'Grains',
      ingredients: getAllGrains(),
      color: '#f59e0b',
      icon: '🌾'
    },
    {
      name: 'Herbs',
      ingredients: getAllHerbs(),
      color: '#10b981',
      icon: '🌿'
    },
    {
      name: 'Spices',
      ingredients: getAllSpices(),
      color: '#f97316',
      icon: '🌶️'
    },
    {
      name: 'Dairy',
      ingredients: getDairyIngredients(),
      color: '#3b82f6',
      icon: '🧀'
    },
    {
      name: 'Oils',
      ingredients: getOilIngredients(),
      color: '#8b5cf6',
      icon: '🫒'
    }
  ];

  // Calculate ingredient scores based on elemental properties
  const calculateIngredientScore = (ingredient: any): number => {
    if (!ingredient.elementalProperties) return 0.5;
    
    const props = ingredient.elementalProperties;
    // Score based on elemental balance and intensity
    const total = props.Fire + props.Water + props.Earth + props.Air;
    const balance = 1 - Math.abs(0.25 - Math.max(props.Fire, props.Water, props.Earth, props.Air) / total);
    const intensity = total / 4;
    
    return Math.min(1, (balance + intensity) / 2);
  };

  // Sort ingredients by score within each category
  const getSortedIngredients = (ingredients: any[]) => {
    return ingredients
      .map(ingredient => ({
        ...ingredient,
        score: calculateIngredientScore(ingredient)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 12); // Limit to top 12 per category
  };

  // Handle ingredient selection
  const handleIngredientSelect = (ingredient: any, category: string) => {
    const newIngredient: SelectedIngredient = {
      name: ingredient.name,
      category,
      elementalProperties: ingredient.elementalProperties,
      score: calculateIngredientScore(ingredient)
    };

    setSelectedIngredients(prev => {
      // Check if already selected
      const existing = prev.find(item => item.name === ingredient.name);
      if (existing) return prev;
      
      return [...prev, newIngredient];
    });
  };

  // Remove ingredient
  const handleIngredientRemove = (ingredientName: string) => {
    setSelectedIngredients(prev => 
      prev.filter(item => item.name !== ingredientName)
    );
  };

  // Clear all ingredients
  const handleClearAll = () => {
    setSelectedIngredients([]);
    setGeneratedRecipe(null);
  };

  // Calculate total elemental properties
  const totalElementalProperties = useMemo(() => {
    if (selectedIngredients.length === 0) {
      return { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    }

    const totals = selectedIngredients.reduce(
      (acc, ingredient) => {
        if (ingredient.elementalProperties) {
          acc.Fire += ingredient.elementalProperties.Fire;
          acc.Water += ingredient.elementalProperties.Water;
          acc.Earth += ingredient.elementalProperties.Earth;
          acc.Air += ingredient.elementalProperties.Air;
        }
        return acc;
      },
      { Fire: 0, Water: 0, Earth: 0, Air: 0 }
    );

    // Normalize
    const sum = totals.Fire + totals.Water + totals.Earth + totals.Air;
    if (sum === 0) return totals;

    return {
      Fire: totals.Fire / sum,
      Water: totals.Water / sum,
      Earth: totals.Earth / sum,
      Air: totals.Air / sum
    };
  }, [selectedIngredients]);

  // Generate recipe using existing cuisine database and Monica optimization
  const handleGenerateRecipe = async () => {
    if (selectedIngredients.length < 3) {
      return;
    }

    setIsGenerating(true);

    try {
      // Analyze ingredients to determine best cuisine match
      const cuisineScores = Object.entries(cuisinesMap).map(([name, cuisine]) => {
        const score = calculateCuisineMatch(selectedIngredients, cuisine);
        return { name, score, cuisine };
      }).sort((a, b) => b.score - a.score);

      const bestCuisine = cuisineScores[0];

      // Use the unified recipe building system
      const criteria = {
        requiredIngredients: selectedIngredients.map(ing => ing.name),
        cuisine: bestCuisine.name,
        elementalPreference: totalElementalProperties,
        servings: 4,
        skillLevel: 'intermediate' as const
      };

      const result = generateMonicaOptimizedRecipe(criteria);

      // Create our simplified recipe format
      const recipe: GeneratedRecipe = {
        name: result.recipe.name || generateRecipeName(selectedIngredients, bestCuisine.name),
        description: result.recipe.description || generateRecipeDescription(selectedIngredients, bestCuisine.name),
        ingredients: selectedIngredients,
        instructions: generateInstructions(selectedIngredients, bestCuisine.name),
        cuisine: bestCuisine.name,
        elementalBalance: totalElementalProperties,
        monicaScore: result.recipe.monicaOptimization?.optimizedMonica || 1.0,
        confidence: result.confidence
      };

      setGeneratedRecipe(recipe);
    } catch (error) {
      console.error('Recipe generation failed:', error);
      // Fallback to simple recipe generation
      generateSimpleRecipe();
    } finally {
      setIsGenerating(false);
    }
  };

  // Fallback simple recipe generation
  const generateSimpleRecipe = () => {
    const recipe: GeneratedRecipe = {
      name: generateRecipeName(selectedIngredients),
      description: generateRecipeDescription(selectedIngredients),
      ingredients: selectedIngredients,
      instructions: generateInstructions(selectedIngredients),
      elementalBalance: totalElementalProperties,
      monicaScore: 1.0,
      confidence: 0.8
    };
    setGeneratedRecipe(recipe);
  };

  // Helper functions for recipe generation
  const calculateCuisineMatch = (ingredients: SelectedIngredient[], cuisine: any): number => {
    // Simple scoring based on common ingredients in the cuisine
    let score = 0;
    const cuisineIngredients = extractCuisineIngredients(cuisine);
    
    ingredients.forEach(ingredient => {
      if (cuisineIngredients.includes(ingredient.name.toLowerCase())) {
        score += 1;
      }
    });

    return score / ingredients.length;
  };

  const extractCuisineIngredients = (cuisine: any): string[] => {
    const ingredients: string[] = [];
    
    try {
      // Extract ingredients from all recipes in the cuisine
      Object.values(cuisine.dishes || {}).forEach((mealType: any) => {
        Object.values(mealType || {}).forEach((seasonRecipes: any) => {
          if (Array.isArray(seasonRecipes)) {
            seasonRecipes.forEach((recipe: any) => {
              if (recipe.ingredients) {
                recipe.ingredients.forEach((ing: any) => {
                  if (ing.name) {
                    ingredients.push(ing.name.toLowerCase());
                  }
                });
              }
            });
          }
        });
      });
    } catch (error) {
      console.error('Error extracting cuisine ingredients:', error);
    }

    return [...new Set(ingredients)];
  };

  const generateRecipeName = (ingredients: SelectedIngredient[], cuisine?: string): string => {
    const proteins = ingredients.filter(i => i.category === 'Proteins');
    const vegetables = ingredients.filter(i => i.category === 'Vegetables');
    const grains = ingredients.filter(i => i.category === 'Grains');

    let name = '';
    
    if (proteins.length > 0) {
      name += proteins[0].name;
    }
    
    if (vegetables.length > 0) {
      name += (name ? ' and ' : '') + vegetables[0].name;
    }
    
    if (grains.length > 0) {
      name += (name ? ' with ' : '') + grains[0].name;
    }

    if (!name) {
      name = ingredients.slice(0, 2).map(i => i.name).join(' and ');
    }

    if (cuisine) {
      name = `${cuisine}-Style ${name}`;
    }

    return name || 'Custom Recipe';
  };

  const generateRecipeDescription = (ingredients: SelectedIngredient[], cuisine?: string): string => {
    const cuisineDesc = cuisine ? `A delicious ${cuisine.toLowerCase()} dish featuring ` : 'A harmonious blend of ';
    const ingredientList = ingredients.slice(0, 3).map(i => i.name).join(', ');
    return `${cuisineDesc}${ingredientList} with perfectly balanced elemental properties.`;
  };

  const generateInstructions = (ingredients: SelectedIngredient[], cuisine?: string): string[] => {
    const proteins = ingredients.filter(i => i.category === 'Proteins');
    const vegetables = ingredients.filter(i => i.category === 'Vegetables');
    const spices = ingredients.filter(i => i.category === 'Spices');
    const herbs = ingredients.filter(i => i.category === 'Herbs');

    const instructions = [
      'Prepare all ingredients by washing, chopping, and measuring as needed.'
    ];

    if (spices.length > 0 || herbs.length > 0) {
      instructions.push('Toast whole spices and prepare herb mixtures for maximum flavor.');
    }

    if (proteins.length > 0) {
      instructions.push(`Season and prepare ${proteins.map(p => p.name).join(' and ')} according to your preferred cooking method.`);
    }

    if (vegetables.length > 0) {
      instructions.push(`Cook ${vegetables.map(v => v.name).join(' and ')} until tender and properly seasoned.`);
    }

    instructions.push('Combine all ingredients, adjusting seasoning and cooking time as needed.');
    instructions.push('Serve hot and enjoy your alchemically balanced meal!');

    return instructions;
  };

  const getElementColor = (element: string) => {
    const colors = {
      Fire: '#ef4444',
      Water: '#3b82f6',
      Earth: '#22c55e',
      Air: '#8b5cf6'
    };
    return colors[element as keyof typeof colors] || '#6b7280';
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Simple Recipe Builder
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Select ingredients from each category to build your recipe. Our system will analyze your selections and generate an optimized recipe using our cuisine database.
      </Typography>

      {/* Selected Ingredients Summary */}
      {selectedIngredients.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Selected Ingredients ({selectedIngredients.length})
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleGenerateRecipe}
                  disabled={selectedIngredients.length < 3 || isGenerating}
                  startIcon={isGenerating ? <LinearProgress /> : <GenerateIcon />}
                >
                  {isGenerating ? 'Generating...' : 'Generate Recipe'}
                </Button>
                <IconButton onClick={handleClearAll} color="error">
                  <ClearIcon />
                </IconButton>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {selectedIngredients.map((ingredient, index) => (
                <Chip
                  key={index}
                  label={`${ingredient.name} (${Math.round((ingredient.score || 0) * 100)}%)`}
                  onDelete={() => handleIngredientRemove(ingredient.name)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>

            {/* Elemental Balance Display */}
            <Typography variant="subtitle2" gutterBottom>
              Elemental Balance:
            </Typography>
            {Object.entries(totalElementalProperties).map(([element, value]) => (
              <Box key={element} sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">{element}</Typography>
                  <Typography variant="body2">{Math.round(value * 100)}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={value * 100}
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

      {/* Ingredient Categories */}
      <Grid container spacing={3}>
        {categories.map((category) => {
          const sortedIngredients = getSortedIngredients(category.ingredients);
          
          return (
            <Grid item xs={12} md={6} lg={4} key={category.name}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Typography variant="h6" component="span">
                      {category.icon}
                    </Typography>
                    <Typography variant="h6">
                      {category.name}
                    </Typography>
                    <Badge 
                      badgeContent={sortedIngredients.length} 
                      color="primary" 
                      sx={{ ml: 'auto' }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {sortedIngredients.map((ingredient, index) => {
                      const isSelected = selectedIngredients.some(
                        item => item.name === ingredient.name
                      );
                      const score = Math.round(ingredient.score * 100);

                      return (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1,
                            border: 1,
                            borderColor: isSelected ? category.color : 'divider',
                            borderRadius: 1,
                            backgroundColor: isSelected ? `${category.color}20` : 'transparent',
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: `${category.color}10`
                            }
                          }}
                          onClick={() => !isSelected && handleIngredientSelect(ingredient, category.name)}
                        >
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {ingredient.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Score: {score}%
                            </Typography>
                          </Box>
                          
                          {isSelected ? (
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleIngredientRemove(ingredient.name);
                              }}
                              sx={{ color: 'error.main' }}
                            >
                              <RemoveIcon />
                            </IconButton>
                          ) : (
                            <IconButton 
                              size="small"
                              sx={{ color: category.color }}
                            >
                              <AddIcon />
                            </IconButton>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Generated Recipe Display */}
      {generatedRecipe && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Generated Recipe: {generatedRecipe.name}
            </Typography>
            
            <Typography variant="body1" paragraph>
              {generatedRecipe.description}
            </Typography>

            {generatedRecipe.cuisine && (
              <Chip 
                label={`${generatedRecipe.cuisine} Cuisine`} 
                color="primary" 
                sx={{ mb: 2 }} 
              />
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Instructions:
            </Typography>
            <Box component="ol" sx={{ pl: 2 }}>
              {generatedRecipe.instructions.map((step, index) => (
                <Box component="li" key={index} sx={{ mb: 1 }}>
                  <Typography variant="body2">{step}</Typography>
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Monica Score:</Typography>
                <Typography variant="body2">
                  {Math.round(generatedRecipe.monicaScore * 100)}%
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Confidence:</Typography>
                <Typography variant="body2">
                  {Math.round(generatedRecipe.confidence * 100)}%
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      {selectedIngredients.length === 0 && (
        <Alert severity="info" sx={{ mt: 3 }}>
          Start by selecting ingredients from the categories above. Each ingredient is scored based on its elemental properties and nutritional value. Once you have at least 3 ingredients, you can generate a recipe!
        </Alert>
      )}

      {selectedIngredients.length > 0 && selectedIngredients.length < 3 && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          Select at least 3 ingredients to generate a recipe. Try to include ingredients from different categories for the best results.
        </Alert>
      )}
    </Box>
  );
} 