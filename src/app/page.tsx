'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import FoodRecommender from '@/components/FoodRecommenderWrapper';
import Link from 'next/link';
import { Button } from '@mui/material';
import { 
  dryCookingMethods, 
  wetCookingMethods, 
  molecularCookingMethods, 
  traditionalCookingMethods, 
  rawCookingMethods,
  transformationMethods
} from '@/data/cooking/methods';
import { capitalizeFirstLetter } from '@/utils/stringUtils';
import { useAstrologicalState } from '@/context/AstrologicalContext';
// Import the getHolisticCookingRecommendations function
import { getHolisticCookingRecommendations } from '@/utils/alchemicalPillarUtils';
import CuisineRecommender from '@/components/CuisineRecommender';

// Use dynamic import with SSR disabled for components that use client-side only features
const DynamicCuisineRecommender = dynamic(
  () => import('@/components/CuisineRecommender'),
  { ssr: false }
);

const DynamicCookingMethodsSection = dynamic(
  () => import('@/components/CookingMethodsSection'),
  { ssr: false }
);

const DynamicPlanetaryTimeDisplay = dynamic(
  () => import('@/components/PlanetaryTimeDisplay'),
  { ssr: false }
);

// A wrapper component that only renders children when client-side
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  if (!hasMounted) {
    return null;
  }
  
  return <>{children}</>;
}

// PayPal Button Component
function PayPalButton() {
  return (
    <div className="mx-auto mb-4" style={{ maxWidth: '250px' }}>
      <form action="https://www.paypal.com/ncp/payment/SVN6Q368TKKLS" method="post" target="_blank">
        <input 
          type="submit" 
          value="HELP" 
          style={{
            textAlign: 'center',
            border: 'none',
            borderRadius: '0.25rem',
            width: '100%',
            padding: '0 2rem',
            height: '2.625rem',
            fontWeight: 'bold',
            backgroundColor: '#FFD140',
            color: '#000000',
            fontFamily: '"Helvetica Neue", Arial, sans-serif',
            fontSize: '1rem',
            lineHeight: '1.25rem',
            cursor: 'pointer'
          }}
        />
      </form>
    </div>
  );
}

// Combined function to get all cooking methods
function getAllCookingMethods() {
  return {
    ...dryCookingMethods,
    ...wetCookingMethods,
    ...molecularCookingMethods,
    ...traditionalCookingMethods,
    ...rawCookingMethods,
    ...transformationMethods
  };
}

// Create a mock ingredient for fallback
const mockIngredient = {
  name: "General Foods",
  element: "Balanced",
  elementalCharacter: "Harmonious",
  elementalProperties: {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
  }
};

export default function Home() {
  const [cookingMethods, setCookingMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const { elementalProperties, currentZodiac, activePlanets } = useAstrologicalState();
  
  // Load cooking methods when astrological state is available
  useEffect(() => {
    const loadCookingMethods = async () => {
      try {
        setLoading(true);
        
        // Get all available cooking methods
        const allMethods = getAllCookingMethods();
        
        // Check if we have elemental properties from astrological state
        const hasElementalData = elementalProperties && 
                                Object.keys(elementalProperties).length > 0 &&
                                (elementalProperties.Fire !== undefined || 
                                 elementalProperties.Water !== undefined ||
                                 elementalProperties.Earth !== undefined || 
                                 elementalProperties.Air !== undefined);
        
        let formattedMethods = [];
        
        if (hasElementalData) {
          // Create an ingredient-like object with the current elemental properties
          const currentIngredient = {
            name: "Current Cosmic Influence",
            element: Object.entries(elementalProperties)
                      .sort((a, b) => b[1] - a[1])[0][0], // Dominant element
            elementalCharacter: "Cosmic",
            elementalProperties: {
              Fire: elementalProperties.Fire || 0.25,
              Water: elementalProperties.Water || 0.25,
              Earth: elementalProperties.Earth || 0.25,
              Air: elementalProperties.Air || 0.25
            }
          };
          
          // Use getHolisticCookingRecommendations for better scoring
          const methodScores = getHolisticCookingRecommendations(currentIngredient);
          
          // Convert to the format expected by CookingMethodsSection
          formattedMethods = methodScores.map(recommendation => {
            const methodName = recommendation.method;
            const methodData = allMethods[methodName.toLowerCase()];
            
            return {
              id: methodName.toLowerCase().replace(/\s+/g, '_'),
              name: capitalizeFirstLetter(methodName),
              description: methodData?.description || recommendation.reason || 'A cooking method based on current cosmic influences',
              elementalEffect: methodData?.elementalEffect || methodData?.elementalProperties || {
                Fire: 0.25,
                Water: 0.25,
                Earth: 0.25,
                Air: 0.25
              },
              duration: methodData?.time_range || methodData?.duration || { min: 10, max: 30 },
              suitable_for: methodData?.suitable_for || [],
              benefits: methodData?.benefits || [],
              score: recommendation.score || recommendation.compatibility || 0.5
            };
          });
        } else {
          // Fallback to using the test functionality if no astrological data
          try {
            const methodScores = getHolisticCookingRecommendations(mockIngredient);
            
            formattedMethods = methodScores.map(recommendation => {
              const methodName = recommendation.method;
              const methodData = allMethods[methodName.toLowerCase()];
              
              return {
                id: methodName.toLowerCase().replace(/\s+/g, '_'),
                name: capitalizeFirstLetter(methodName),
                description: methodData?.description || recommendation.reason || 'A cooking method for food preparation',
                elementalEffect: methodData?.elementalEffect || methodData?.elementalProperties || {
                  Fire: 0.25,
                  Water: 0.25,
                  Earth: 0.25,
                  Air: 0.25
                },
                duration: methodData?.time_range || methodData?.duration || { min: 10, max: 30 },
                suitable_for: methodData?.suitable_for || [],
                benefits: methodData?.benefits || [],
                score: recommendation.score || recommendation.compatibility || 0.5
              };
            });
          } catch (error) {
            console.error('Error using holistic recommendations, falling back to simple methods', error);
            
            // Very simple fallback if even the test functionality fails
            formattedMethods = Object.entries(allMethods)
              .map(([id, method]) => ({
                id,
                name: capitalizeFirstLetter(id.replace(/_/g, ' ')),
                description: method.description || 'A cooking method for food preparation',
                elementalEffect: method.elementalEffect || method.elementalProperties || {
                  Fire: 0.25,
                  Water: 0.25,
                  Earth: 0.25,
                  Air: 0.25
                },
                duration: method.time_range || method.duration || { min: 10, max: 30 },
                suitable_for: method.suitable_for || [],
                benefits: method.benefits || [],
                score: 0.5 + (Math.random() * 0.3) // Random score between 0.5-0.8
              }))
              .sort((a, b) => b.score - a.score)
              .slice(0, 15);
          }
        }
        
        setCookingMethods(formattedMethods);
      } catch (error) {
        console.error('Error loading cooking methods:', error);
        // Ensure we have something to display even if errors occur
        setCookingMethods([]);
      } finally {
        setLoading(false);
      }
    };
    
    // Always try to load cooking methods, with or without astrological data
    loadCookingMethods();
  }, [elementalProperties, currentZodiac, activePlanets]);
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-gray-100 text-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-indigo-900">What to Eat Next</h1>
          <p className="text-indigo-600 mb-4">
            Food recommendations based on the current celestial energies
          </p>
          
          {/* Display planetary day and hour information */}
          <ClientOnly>
            <div className="inline-block bg-white px-4 py-2 rounded-lg shadow-sm">
              <DynamicPlanetaryTimeDisplay compact={true} />
            </div>
          </ClientOnly>
        </header>
        
        {/* Navigation Jump Links */}
        <nav className="flex flex-wrap justify-center gap-4 mb-8 bg-white rounded-lg shadow-md p-4 sticky top-2 z-10">
          <a href="#cuisine" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Cuisine Recommendations
          </a>
          <a href="#ingredients" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Ingredient Recommendations
          </a>
          <a href="#methods" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Cooking Methods
          </a>
        </nav>
        
        <div className="flex flex-col gap-6 max-w-6xl mx-auto">
          <div id="cuisine" className="bg-white rounded-lg shadow-md p-5 w-full">
            <ClientOnly>
              <CuisineRecommender />
            </ClientOnly>
          </div>
          
          <div id="ingredients" className="bg-white rounded-lg shadow-md p-5 w-full">
            <ClientOnly>
              <FoodRecommender />
            </ClientOnly>
          </div>
          
          <div id="methods" className="bg-white rounded-lg shadow-md p-5 w-full">
            <h2 className="text-2xl font-bold mb-6">Alchemical Cooking Methods</h2>
            <ClientOnly>
              {loading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
              ) : cookingMethods.length > 0 ? (
                <DynamicCookingMethodsSection 
                  methods={cookingMethods}
                  showToggle={true}
                  initiallyExpanded={true}
                />
              ) : (
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded text-center">
                  <p>No cooking methods found. Please refresh the page to try again.</p>
                </div>
              )}
            </ClientOnly>
          </div>
        </div>
        
        <footer className="mt-12 text-center">
          <PayPalButton />
        </footer>
      </div>
    </main>
  );
}
