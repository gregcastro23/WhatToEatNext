'use client';

import { Container, Typography, Box } from '@mui/material';
import { CookingMethodsSection } from '../../components/CookingMethodsSection';
import { cookingMethods } from '../../data/cooking/cookingMethods';
import { CookingMethod } from '../../types/alchemy';
import type { ElementalProperties } from '../../types/recipe';
import { useEffect, useState } from 'react';

// Define an extended interface for our cooking method data
interface ExtendedCookingMethod {
  id: string;
  name: string;
  description: string;
  elementalEffect: ElementalProperties;
  score?: number;
  duration: { min: number; max: number };
  suitable_for: string[];
  benefits: string[];
  variations: { id: string; name: string; score?: number }[];
  instructions: string[];
  recommendedFoods: string[];
  thermodynamicProperties: {
    heatTransfer: string;
    temperatureRange: string;
  };
}

export default function CookingMethodsDemoPage() {
  const [methods, setMethods] = useState<ExtendedCookingMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<ExtendedCookingMethod | null>(null);

  useEffect(() => {
    // Process all cooking methods from a single source
    const demoMethods = formatMethodsForComponent(cookingMethods, 'cooking');
    
    // Sort by score for a more realistic demo
    demoMethods.sort((a, b) => ((b.score || 0) - (a.score || 0)));
    
    // Limit to 12 methods for the demo
    setMethods(demoMethods.slice(0, 12));
  }, []);

  const formatMethodsForComponent = (methods: Record<string, unknown>, prefix: string): ExtendedCookingMethod[] => {
    return Object.entries(methods).map(([key, method]) => {
      // Format method name
      const name = key.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Generate a realistic score between 0.4 and 1.0
      const score = 0.4 + Math.random() * 0.6;
      
      const typedMethod = method as { 
        description?: string; 
        elementalEffect?: ElementalProperties;
        elementalProperties?: ElementalProperties;
        time_range?: { min: number, max: number };
        duration?: { min: number, max: number };
        suitable_for?: string[];
        benefits?: string[];
        variations?: Record<string, unknown>;
        astrologicalInfluences?: Record<string, unknown>;
      };
      
      return {
        id: `${prefix}_${key}`,
        name,
        description: typedMethod.description || '',
        elementalEffect: typedMethod.elementalEffect || typedMethod.elementalProperties || {
          Fire: Math.random(),
          Water: Math.random(),
          Earth: Math.random(),
          Air: Math.random()
        },
        score,
        duration: typedMethod.time_range || typedMethod.duration || { min: 10, max: 30 },
        suitable_for: typedMethod.suitable_for || [],
        benefits: typedMethod.benefits || [],
        // Create variations if they exist
        variations: typedMethod.variations ? 
          Object.entries(typedMethod.variations).map(([varKey, varData]) => ({
            id: `${prefix}_${key}_${varKey}`,
            name: varKey.replace(/_/g, ' '),
            score: (score - 0.1) + Math.random() * 0.2 // Slightly vary from parent score
          })) : [],
        instructions: ['Apply heat', 'Cook until done'],
        recommendedFoods: ['Various ingredients'],
        thermodynamicProperties: {
          heatTransfer: 'conduction',
          temperatureRange: 'medium'
        }
      };
    });
  };

  const handleSelectMethod = (method: ExtendedCookingMethod) => {
    setSelectedMethod(method);
    console.log('Selected method:', method);
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
            methods={methods as any} 
            onSelectMethod={handleSelectMethod as any}
            selectedMethodId={selectedMethod?.id || null}
            initiallyExpanded={true}
          />
        </Box>
      ) : (
        <Typography align="center">Loading cooking methods...</Typography>
      )}
      
      {selectedMethod && (
        <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2 }}>
          <Typography variant="h5" gutterBottom>
            Selected Method: {selectedMethod.name}
          </Typography>
          <Typography variant="body1" paragraph>
            {selectedMethod.description}
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