'use client';

import React from 'react';
import CookingMethodsSection from '@/components/CookingMethodsSection';

export function CookingMethodRecommenderDebug() {
  // Mock cooking methods data for debugging
  const mockMethods = [
    {
      id: 'grilling',
      name: 'Grilling',
      description: 'High-heat cooking over direct flame or heat source, creating distinctive char and smoky flavors.',
      score: 0.85,
      culturalOrigin: 'Global',
      elementalEffect: {
        Fire: 0.8,
        Water: 0.1,
        Earth: 0.1,
        Air: 0.0
      },
      duration: { min: 5, max: 30 },
      suitable_for: ['Proteins', 'Vegetables'],
      benefits: ['High heat sealing', 'Smoky flavor development', 'Quick cooking']
    },
    {
      id: 'steaming',
      name: 'Steaming',
      description: 'Gentle cooking using moist heat from boiling water vapor, preserving nutrients and natural flavors.',
      score: 0.75,
      culturalOrigin: 'Asian',
      elementalEffect: {
        Fire: 0.2,
        Water: 0.7,
        Earth: 0.1,
        Air: 0.0
      },
      duration: { min: 10, max: 45 },
      suitable_for: ['Vegetables', 'Fish', 'Dumplings'],
      benefits: ['Nutrient preservation', 'Gentle cooking', 'No added fats']
    }
  ];

  return (
    <div className="border border-purple-500 p-4 rounded-lg">
      <h4 className="text-lg font-bold mb-2 text-purple-400">Cooking Method Recommender</h4>
      <CookingMethodsSection methods={mockMethods} />
    </div>
  );
} 