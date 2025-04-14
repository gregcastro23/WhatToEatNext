'use client';

import { useState, useEffect } from 'react';
import { CookingMethodsSection } from '@/components/CookingMethodsSection';
import { useAstrologicalState } from '@/hooks/useAstrologicalState';
import { 
  dryCookingMethods, 
  wetCookingMethods, 
  molecularCookingMethods,
  traditionalCookingMethods,
  rawCookingMethods,
  transformationMethods
} from '@/data/cooking/methods';
import { calculateMethodScore } from '@/utils/cookingMethodRecommender';

export default function HomeMethodsComponent() {
  const { currentPlanetaryAlignment, loading } = useAstrologicalState();
  const [methods, setMethods] = useState<any[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<any | null>(null);

  useEffect(() => {
    if (!loading && currentPlanetaryAlignment) {
      // Convert currentPlanetaryAlignment to AstrologicalState format
      const astroState = {
        zodiacSign: currentPlanetaryAlignment.sun?.sign || 'Aries',
        lunarPhase: currentPlanetaryAlignment.moon?.phase || 'New Moon',
        elementalState: {
          Fire: ['Aries', 'Leo', 'Sagittarius'].includes(currentPlanetaryAlignment.sun?.sign || '') ? 0.8 : 0.2,
          Water: ['Cancer', 'Scorpio', 'Pisces'].includes(currentPlanetaryAlignment.sun?.sign || '') ? 0.8 : 0.2,
          Earth: ['Taurus', 'Virgo', 'Capricorn'].includes(currentPlanetaryAlignment.sun?.sign || '') ? 0.8 : 0.2,
          Air: ['Gemini', 'Libra', 'Aquarius'].includes(currentPlanetaryAlignment.sun?.sign || '') ? 0.8 : 0.2
        },
        planets: currentPlanetaryAlignment
      };
      
      // Combine all cooking methods
      const allMethodsObj = {
        ...dryCookingMethods,
        ...wetCookingMethods,
        ...molecularCookingMethods,
        ...traditionalCookingMethods,
        ...rawCookingMethods,
        ...transformationMethods
      };
      
      // Format methods for the component
      const formattedMethods = Object.entries(allMethodsObj).map(([key, method]) => {
        // Calculate score based on astrological state
        const score = calculateMethodScore(method, astroState);
        
        // Format method name
        const name = key.split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        return {
          id: key,
          name,
          description: method.description || '',
          elementalEffect: method.elementalEffect || method.elementalProperties || {
            Fire: Math.random() * 0.5 + 0.3,
            Water: Math.random() * 0.5 + 0.3,
            Earth: Math.random() * 0.5 + 0.3,
            Air: Math.random() * 0.5 + 0.3
          },
          score,
          duration: method.time_range || method.duration || { min: 10, max: 30 },
          suitable_for: method.suitable_for || [],
          benefits: method.benefits || [],
          // Create variations if they exist
          variations: method.variations ? 
            (Array.isArray(method.variations) ? 
              method.variations.map((v: string, i: number) => ({
                id: `${key}_var_${i}`,
                name: v,
                description: `A variation of ${name} with different characteristics.`,
                elementalEffect: method.elementalEffect || method.elementalProperties || {
                  Fire: Math.random() * 0.5 + 0.3,
                  Water: Math.random() * 0.5 + 0.3,
                  Earth: Math.random() * 0.5 + 0.3,
                  Air: Math.random() * 0.5 + 0.3
                },
                score: Math.max(0.1, score - 0.1 + Math.random() * 0.2) // Slightly vary from parent score
              })) : []
            ) : []
        };
      });
      
      // Sort by score and get top 15
      const sortedMethods = formattedMethods.sort((a, b) => b.score - a.score).slice(0, 15);
      setMethods(sortedMethods);
    }
  }, [loading, currentPlanetaryAlignment]);

  const handleSelectMethod = (method: any) => {
    // Toggle selection - if already selected, unselect it
    setSelectedMethod(prevSelected => 
      prevSelected && prevSelected.id === method.id ? null : method
    );
    
    // For logging/debugging
    if (!selectedMethod || selectedMethod.id !== method.id) {
      console.log('Selected method:', method.name);
    } else {
      console.log('Unselected method:', method.name);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading cooking methods...</div>;
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Recommended Cooking Methods</h3>
      <p className="text-sm text-gray-600 mb-6">
        Based on current astrological alignments, these cooking methods are most favorable for your food preparation.
      </p>
      
      {methods.length > 0 ? (
        <CookingMethodsSection 
          methods={methods} 
          onSelectMethod={handleSelectMethod}
          selectedMethodId={selectedMethod?.id || null}
          initiallyExpanded={true}
        />
      ) : (
        <div className="text-center p-4">No cooking methods found</div>
      )}
    </div>
  );
} 