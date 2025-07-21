'use client';

import { Grid, Card, CardContent, Typography, Divider } from '@mui/material';
import React from 'react';

import FoodRecommender from '@/components/FoodRecommender';
import FoodRecommenderMigrated from '@/components/FoodRecommender/FoodRecommender.migrated';

/**
 * Test page for comparing the original FoodRecommender component
 * with its migrated version using the services architecture.
 */
export default function FoodRecommenderTestPage() {
  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Typography variant="h4" component="h1" className="mb-6">
        FoodRecommender Migration Test
      </Typography>

      <Card className="mb-6">
        <CardContent>
          <Typography variant="h6" className="mb-2">
            Migration Notes
          </Typography>
          <Typography variant="body2" className="mb-3">
            This page demonstrates the migration of the FoodRecommender component
            from using context-based data access to the new service-based architecture.
          </Typography>
          <Typography variant="body2">
            <strong>Key Changes:</strong>
          </Typography>
          <ul className="list-disc pl-6 mb-3">
            <li>Replaced useAstrologicalState hook with useServices hook</li>
            <li>Uses astrologyService, elementalCalculator, and recommendationService</li>
            <li>Added proper loading and error states with service initialization checks</li>
            <li>Migrated IngredientDisplay subcomponent to services architecture</li>
            <li>Added empty state handling</li>
            <li>Improved TypeScript typing throughout the component</li>
          </ul>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Original Component (Context-based)
              </Typography>
              <Divider className="mb-4" />
              <div className="h-[600px] overflow-y-auto">
                <FoodRecommender />
              </div>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Migrated Component (Service-based)
              </Typography>
              <Divider className="mb-4" />
              <div className="h-[600px] overflow-y-auto">
                <FoodRecommenderMigrated />
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
} 