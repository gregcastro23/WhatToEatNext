'use client';

import { useState, useEffect } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { CookingMethodsSection } from '@/components/CookingMethodsSection';
import { 
  dryCookingMethods, 
  wetCookingMethods, 
  molecularCookingMethods
} from '@/data/cooking/methods';

export default function CookingMethodsDemoPage() {
  const [methods, setMethods] = useState<any[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<any | null>(null);

  useEffect(() => {
    // Prepare demo data by formatting methods from different categories
    const demoMethods = [
      ...formatMethodsForComponent(dryCookingMethods, 'dry'),
      ...formatMethodsForComponent(wetCookingMethods, 'wet'),
      ...formatMethodsForComponent(molecularCookingMethods, 'molecular')
    ];
    
    // Sort by score for a more realistic demo
    demoMethods.sort((a, b) => (b.score || 0) - (a.score || 0));
    
    // Limit to 12 methods for the demo
    setMethods(demoMethods.slice(0, 12));
  }, []);

  const formatMethodsForComponent = (methodsObj: Record<string, unknown>, prefix: string) => {
    return Object.entries(methodsObj).map(([key, method]) => {
      // Format method name
      const name = key.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Generate a realistic score between 0.4 and 1.0
      const score = 0.4 + Math.random() * 0.6;
      
      return {
        id: `${prefix}_${key}`,
        name,
        description: (method as unknown).description || '',
        elementalEffect: (method as unknown).elementalEffect || (method as unknown).elementalProperties || {
          Fire: Math.random(),
          Water: Math.random(),
          Earth: Math.random(),
          Air: Math.random()
        },
        score,
        duration: (method as unknown).time_range || (method as unknown).duration || { min: 10, max: 30 },
        suitable_for: (method as unknown).suitable_for || [],
        benefits: (method as unknown).benefits || [],
        // Create variations if they exist
        variations: (method as unknown).variations ? 
          (Array.isArray((method as unknown).variations) ? 
            (method as unknown).variations.map((v: string, i: number) => ({
              id: `${prefix}_${key}_var_${i}`,
              name: v,
              description: `A variation of ${name} with different characteristics.`,
              elementalEffect: {
                Fire: Math.random(),
                Water: Math.random(),
                Earth: Math.random(),
                Air: Math.random()
              },
              score: (score - 0.1) + Math.random() * 0.2 // Slightly vary from parent score
            })) : []
          ) : []
      };
    });
  };

  const handleSelectMethod = (method: unknown) => {
    setSelectedMethod(method);
    // console.log('Selected method:', method);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h2" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        Cooking Methods Component Demo
      </Typography>
      
      <Typography variant="body1" paragraph align="center" sx={{ mb: 5 }}>
        This page demonstrates the CookingMethodsSection component with updated styling to match the ingredient recommender.
      </Typography>
      
      {methods.length > 0 ? (
        <Box sx={{ mb: 6 }}>
          <CookingMethodsSection 
            methods={methods} 
            onSelectMethod={handleSelectMethod}
            selectedMethodId={(selectedMethod as unknown)?.id || null}
            initiallyExpanded={true}
          />
        </Box>
      ) : (
        <Typography align="center">Loading cooking methods...</Typography>
      )}
      
      {selectedMethod && (
        <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2 }}>
          <Typography variant="h5" gutterBottom>
            Selected Method: {(selectedMethod as unknown).name}
          </Typography>
          <Typography variant="body1" paragraph>
            {(selectedMethod as unknown).description}
          </Typography>
          <Box component="pre" sx={{ 
            p: 2, 
            bgcolor: 'rgba(0,0,0,0.05)', 
            borderRadius: 1,
            overflow: 'auto',
            fontSize: '0.8rem'
          }}>
            {JSON.stringify(selectedMethod, null, 2)}
          </Box>
        </Box>
      )}
    </Container>
  );
} 