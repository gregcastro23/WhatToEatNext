'use client';

import { Box, Container, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

// Use the test/demo component path that exists
import CookingMethodsSection from '@/app/test/migrated-components/cooking-methods-section/page';
import {
    dryCookingMethods,
    molecularCookingMethods,
    wetCookingMethods,
} from '@/data/cooking/methods';

export default function CookingMethodsDemoPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- High-risk domain requiring flexibility
  const [methods, setMethods] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- High-risk domain requiring flexibility
  const [selectedMethod, setSelectedMethod] = useState<any | null>(null);

  useEffect(() => {
    // Prepare demo data by formatting methods from different categories
    const demoMethods = [
      ..._formatMethodsForComponent(dryCookingMethods as Record<string, unknown>, 'dry'),
      ..._formatMethodsForComponent(wetCookingMethods as Record<string, unknown>, 'wet'),
      ..._formatMethodsForComponent(
        molecularCookingMethods as Record<string, unknown>,
        'molecular',
      ),
    ];

    // Sort by score for a more realistic demo
    demoMethods.sort((a, b) => (b.score || 0) - (a.score || 0));

    // Limit to 12 methods for the demo
    setMethods(demoMethods.slice(0, 12));
  }, []);

  const _formatMethodsForComponent = (methodsObj: Record<string, unknown>, prefix: string) => {
    return Object.entries(methodsObj).map(([key, method]) => {
      // Format method name
      const name = key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Generate a realistic score between 0.4 and 1.0
      const score = 0.4 + Math.random() * 0.6;

      return {
        id: `${prefix}_${key}`,
        name,
        description: (method as Record<string, unknown>).description || '',
        elementalEffect: (method as Record<string, unknown>).elementalEffect ||
          (method as Record<string, unknown>).elementalProperties || {
            Fire: Math.random(),
            Water: Math.random(),
            Earth: Math.random(),
            Air: Math.random(),
          },
        score,
        duration: (method as Record<string, unknown>).time_range ||
          (method as Record<string, unknown>).duration || { min: 10, max: 30 },
        suitable_for: (method as Record<string, unknown>).suitable_for || [],
        benefits: (method as Record<string, unknown>).benefits || [],
        // Create variations if they exist
        variations: (method as Record<string, unknown>).variations
          ? Array.isArray((method as Record<string, unknown>).variations)
            ? ((method as Record<string, unknown>).variations as string[]).map(
                (v: string, i: number) => ({
                  id: `${prefix}_${key}_var_${i}`,
                  name: v,
                  description: `A variation of ${name} with different characteristics.`,
                  elementalEffect: {
                    Fire: Math.random(),
                    Water: Math.random(),
                    Earth: Math.random(),
                    Air: Math.random(),
                  },
                  score: score - 0.1 + Math.random() * 0.2, // Slightly vary from parent score
                }),
              )
            : []
          : [],
      };
    });
  };

  const handleSelectMethod = (method: unknown) => {
    setSelectedMethod(method);
  };

  return (
    <Container maxWidth='lg' sx={{ py: 6 }}>
      <Typography variant='h2' component='h1' gutterBottom align='center' sx={{ mb: 4 }}>
        Cooking Methods Component Demo
      </Typography>

      <Typography variant='body1' paragraph align='center' sx={{ mb: 5 }}>
        This page demonstrates the CookingMethodsSection component with updated styling to match the
        ingredient recommender.
      </Typography>

      {methods.length > 0 ? (
        <Box sx={{ mb: 6 }}>
          <CookingMethodsSection
            methods={methods}
            onSelectMethod={handleSelectMethod}
            selectedMethodId={
              selectedMethod && typeof selectedMethod === 'object' && 'id' in selectedMethod
                ? selectedMethod.id
                : null
            }
            initiallyExpanded={true}
          />
        </Box>
      ) : (
        <Typography align='center'>Loading cooking methods...</Typography>
      )}

      {selectedMethod && (
        <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2 }}>
          <Typography variant='h5' gutterBottom>
            Selected Method:{' '}
            {selectedMethod && typeof selectedMethod === 'object' && 'name' in selectedMethod
              ? String(selectedMethod.name)
              : 'Unknown'}
          </Typography>
          <Typography variant='body1' paragraph>
            {selectedMethod && typeof selectedMethod === 'object' && 'description' in selectedMethod
              ? String(selectedMethod.description)
              : 'No description available'}
          </Typography>
          <Box
            component='pre'
            sx={{
              p: 2,
              bgcolor: 'rgba(0,0,0,0.05)',
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.8rem',
            }}
          >
            {JSON.stringify(selectedMethod, null, 2)}
          </Box>
        </Box>
      )}
    </Container>
  );
}
