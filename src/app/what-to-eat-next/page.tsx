import React from 'react';
import KalchmRecommender from '@/components/FoodRecommender/KalchmRecommender';
import { AlchemicalProvider } from '@/contexts/AlchemicalContext';

export default function WhatToEatNextPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-3">What to Eat Next</h1>
        <p className="text-xl text-gray-600">
          Personalized ingredient recommendations based on alchemical calculations
        </p>
      </header>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <AlchemicalProvider>
          <KalchmRecommender maxRecommendations={18} />
        </AlchemicalProvider>
      </div>
      
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">About These Recommendations</h2>
        <p className="mb-4">
          Our recommendations are powered by the Kalchm Engine, which uses alchemical principles to suggest ingredients that 
          are in harmony with the current celestial energies.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Understanding Alchemical Metrics</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Heat:</strong> Represents the active energy and transformative potential</li>
              <li><strong>Entropy:</strong> Measures the degree of disorder and potential for change</li>
              <li><strong>Reactivity:</strong> Indicates how quickly substances interact and transform</li>
              <li><strong>Kalchm:</strong> A measure of alchemical equilibrium between the four core properties</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Elemental Harmony</h3>
            <p className="mb-2">Each ingredient has a unique elemental composition that may be more or less in harmony with the current celestial energies.</p>
            <p>Higher elemental harmony suggests ingredients that will be more beneficial and satisfying at this time.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 