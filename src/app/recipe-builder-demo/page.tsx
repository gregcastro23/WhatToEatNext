// Created: 2025-01-02T23:55:00.000Z
// Enhanced Recipe Builder Demo Page

import React from 'react';
import { Container, Typography, Box, Alert } from '@mui/material';
import EnhancedRecipeBuilder from '@/components/recipes/EnhancedRecipeBuilder';

export default function RecipeBuilderDemoPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Enhanced Recipe Builder Demo
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Build recipes with ingredient mapping, auto-complete, validation, and live preview
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Features:</strong> Ingredient auto-complete with elemental properties, 
            drag-and-drop reordering, live validation, Monica optimization, and real-time preview.
          </Typography>
        </Alert>
      </Box>
      
      <EnhancedRecipeBuilder />
    </Container>
  );
} 