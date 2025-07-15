'use client';

import React from 'react';
import { Grid, Card, CardContent, Typography, Divider } from '@mui/material';
import AlchemicalRecommendations from '@/components/recommendations/AlchemicalRecommendations';
import AlchemicalRecommendationsMigrated from '@/components/recommendations/AlchemicalRecommendations.migrated';

/**
 * Test page for comparing the original AlchemicalRecommendations component
 * with its migrated version using the services architecture.
 */
export default function AlchemicalRecommendationsTestPage() {
  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Typography variant="h4" component="h1" className="mb-6">
        AlchemicalRecommendations Migration Test
      </Typography>

      <Card className="mb-6">
        <CardContent>
          <Typography variant="h6" className="mb-2">
            Migration Notes
          </Typography>
          <Typography variant="body2" className="mb-3">
            This page demonstrates the migration of the AlchemicalRecommendations component
            from using context-based data access to the new service-based architecture.
          </Typography>
          <Typography variant="body2">
            <strong>Key Changes:</strong>
          </Typography>
          <ul className="list-disc pl-6 mb-3">
            <li>Replaced AlchemicalContext with useServices hook</li>
            <li>Uses astrologyService, ingredientService, recommendationService, and alchemicalRecommendationService</li>
            <li>Added proper loading and error states with service initialization checks</li>
            <li>Improved data fetching with proper separation of concerns</li>
            <li>Added better TypeScript typing</li>
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
              <div className="h-[800px] overflow-y-auto">
                <AlchemicalRecommendations />
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
              <div className="h-[800px] overflow-y-auto">
                <AlchemicalRecommendationsMigrated />
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
} 