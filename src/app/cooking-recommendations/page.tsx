"use client";

import React, { useState, useEffect } from 'react';
import { CookingMethodsSection } from '@/components/CookingMethodsSection';
import { getRecommendedCookingMethods } from '@/utils/cookingMethodRecommender';
import type { CookingMethodData } from '@/types/cooking';

export default function CookingRecommendationsPage() {
  const [recommendedMethods, setRecommendedMethods] = useState<CookingMethodData[]>([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      // Use actual parameters - for now dummy
      const elemental = { Fire: 0.5, Water: 0.5, Earth: 0.5, Air: 0.5 };
      const recs = await getRecommendedCookingMethods(elemental);
      setRecommendedMethods(recs);
    };
    fetchRecommendations();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Recommended Cooking Methods</h1>
      <CookingMethodsSection 
        methods={recommendedMethods}
        showToggle={false}
        initiallyExpanded={true}
      />
    </div>
  );
} 