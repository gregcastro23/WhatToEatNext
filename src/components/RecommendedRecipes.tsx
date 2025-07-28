import { AccessTime, Restaurant, WbSunny } from '@mui/icons-material';
import { Box, Card, CardContent, CardMedia, Typography, Grid, Chip, Divider } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { AstrologicalState } from '../types/alchemy';
import { Recipe } from '../types/recipe';
import { getTimeFactors } from '../types/time';
import { getRecommendedRecipes, explainRecommendation } from '../utils/recommendationEngine';

interface RecommendedRecipesProps {
  recipes: Recipe[];
  astrologicalState: AstrologicalState;
  count?: number;
}

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
      const recommendedRecipes = getRecommendedRecipes(recipes, astrologicalState, count, timeFactors);
      setRecommendations(recommendedRecipes);
      
      // Generate explanations for each recommendation
      const newExplanations: Record<string, string> = {};
      recommendedRecipes.forEach(recipe => {
        newExplanations[recipe.id] = explainRecommendation(recipe, astrologicalState, timeFactors);
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
        <WbSunny sx={{ mr: 1 }} />
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
              {Boolean(recipe.image) && (
                <CardMedia
                  component="img"
                  height="140"
                  image={String(recipe.image || '')}
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
                    {Number(recipe.prepTime ?? 0) + Number(recipe.cookTime ?? 0)} mins
                  </Typography>
                  <Restaurant fontSize="small" sx={{ ml: 1.5, mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    {recipe.mealType}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 1.5 }}>
                  {(recipe.tags ?? []).slice(0, 3).map((tag) => (
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
                  {explanations[recipe.id]}
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