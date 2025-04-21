import React, { useEffect, useState } from 'react';
import { Recipe } from '../types/recipe';
import { AstrologicalState } from '../types/state';
import { getTimeFactors } from '../utils/timeUtils';
import { getRecommendedRecipes, explainRecommendation } from '../utils/recommendationEngine';
import { Box, Card, CardContent, CardMedia, Typography, Grid, Chip, Divider } from '@mui/material';
import { AccessTime, Restaurant, Wbsunny } from '@mui/icons-material';
import { convertToAlchemyRecipe, convertToRecipeType } from '../utils/recipeTypeBridge';
import { AstrologicalState as AlchemyAstrologicalState, PlanetName, Planet } from '../types/alchemy';

interface RecommendedRecipesProps {
  recipes: Recipe[];
  astrologicalState: AstrologicalState;
  count?: number;
}

// Helper function to convert state.AstrologicalState to alchemy.AstrologicalState
const convertToAlchemyAstrologicalState = (state: AstrologicalState): AlchemyAstrologicalState => {
  // Create a new object without spreading state to avoid type conflicts
  const alchemyState: Partial<AlchemyAstrologicalState> = {};
  
  // Map the activePlanets from string[] to PlanetName[]
  alchemyState.activePlanets = state.activePlanets?.map(planet => planet as PlanetName) || [];
  
  // Handle dominantPlanets separately - format from string[] to Planet[]
  if (state.dominantPlanets) {
    alchemyState.dominantPlanets = state.dominantPlanets.map(planet => ({
      name: planet as PlanetName,
      influence: 1
    }));
  }
  
  // Copy other necessary properties
  alchemyState.sunSign = state.sunSign;
  alchemyState.moonSign = state.moonSign;
  alchemyState.lunarPhase = state.lunarPhase;
  alchemyState.dominantElement = state.dominantElement;
  alchemyState.zodiacSign = state.currentZodiac;
  
  // Handle elementalState and elementalProfile with default values if not present
  const defaultElementalProps = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  alchemyState.elementalProfile = defaultElementalProps;
  
  // Copy error and loading state
  alchemyState.error = state.error;
  alchemyState.loading = state.loading;
  
  return alchemyState as AlchemyAstrologicalState;
};

const RecommendedRecipes: React.FC<RecommendedRecipesProps> = ({ 
  recipes, 
  astrologicalState, 
  count = 3 
}) => {
  const [recommendations, setRecommendations] = useState<Recipe[]>([]);
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const timeFactors = getTimeFactors();

  useEffect(() => {
    if (recipes.length > 0 && astrologicalState) {
      // Convert recipes to alchemy format for the recommendation engine
      const alchemyRecipes = recipes.map(convertToAlchemyRecipe);
      
      // Convert AstrologicalState to the format expected by getRecommendedRecipes
      const alchemyAstrologicalState = convertToAlchemyAstrologicalState(astrologicalState);
      
      // Get recommendations using the alchemy recipes
      const recommendedAlchemyRecipes = getRecommendedRecipes(alchemyRecipes, alchemyAstrologicalState, count, timeFactors);
      
      // Convert back to Recipe type
      const recommendedRecipes = recommendedAlchemyRecipes.map(convertToRecipeType);
      
      // Update state
      setRecommendations(recommendedRecipes);
      
      // Generate explanations for each recommendation
      const newExplanations: Record<string, string> = {};
      recommendedRecipes.forEach((recipe, index) => {
        const alchemyRecipe = recommendedAlchemyRecipes[index];
        newExplanations[recipe.id] = explainRecommendation(alchemyRecipe, alchemyAstrologicalState, timeFactors);
      });
      setExplanations(newExplanations);
    }
  }, [recipes, astrologicalState, count]);

  if (recommendations.length === 0) {
    return (
      <Box sx={{ mt: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Cosmic Recommendations
        </Typography>
        <Typography variant="body1">
          Loading personalized recommendations for {timeFactors.timeOfDay.toLowerCase()}...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Wbsunny sx={{ mr: 1 }} />
        <Typography variant="h5">
          Cosmic Recommendations for {timeFactors.timeOfDay}
        </Typography>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1">
          Based on {timeFactors.planetaryDay.day}'s {timeFactors.planetaryDay.planet} influence and the {timeFactors.season} season
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {recommendations.map((recipe) => (
          <Grid item xs={12} md={4} key={recipe.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {recipe.image && typeof recipe.image === 'string' && (
                <CardMedia
                  component="img"
                  height="140"
                  image={recipe.image}
                  alt={recipe.name}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {recipe.name}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccessTime fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    {typeof recipe.prepTime === 'number' && typeof recipe.cookTime === 'number' 
                      ? recipe.prepTime + recipe.cookTime 
                      : recipe.timeToMake} mins
                  </Typography>
                  <Restaurant fontSize="small" sx={{ ml: 1.5, mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    {Array.isArray(recipe.mealType) ? recipe.mealType.join(', ') : recipe.mealType}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 1.5 }}>
                  {recipe.tags && Array.isArray(recipe.tags) && recipe.tags.slice(0, 3).map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
                
                <Divider sx={{ mb: 1.5 }} />
                
                <Typography variant="body2" color="text.secondary">
                  {explanations[recipe.id] || 'A cosmic recommendation for your day.'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RecommendedRecipes; 