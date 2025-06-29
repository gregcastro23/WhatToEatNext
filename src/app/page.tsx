'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import FoodRecommender from '@/components/FoodRecommender';
import IngredientRecommender from '@/components/IngredientRecommender';
import { AstrologicalProvider } from '@/context/AstrologicalContext';
import Link from 'next/link';
import { Button } from '@mui/material';

// Use dynamic import with SSR disabled for components that use client-side only features
const DynamicCuisineRecommender = dynamic(
  () => import('@/components/CuisineRecommender'),
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

export default function Home() {
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
        
        {/* Mission Statement */}
        <div className="mb-8 bg-gradient-to-r from-indigo-100 via-purple-100 to-indigo-100 rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-bold mb-4 text-indigo-900">Our Mission</h2>
          <p className="text-lg text-indigo-700 leading-relaxed max-w-4xl mx-auto mb-4">
            Culinary knowledge is humanity's most precious inheritance—a bridge between science, culture, and the cosmos. 
            Through decades of studying science, astrology, and culinary arts, combined with the power of AI, 
            I've unlocked a wealth of knowledge that should belong to everyone. This platform represents the fusion 
            of ancient wisdom with modern technology, making the art of cooking accessible to all who seek to 
            nourish both body and soul.
          </p>
          <p className="text-md text-indigo-600 italic max-w-3xl mx-auto">
            Whether you're planning your next home-cooked masterpiece or just trying to figure out which cuisine to order 
            when you don't feel like cooking, we've got you covered with celestial guidance for every culinary decision.
          </p>
        </div>
        
        <div className="flex flex-col gap-6 max-w-6xl mx-auto">
          <div id="cuisine" className="bg-white rounded-lg shadow-md p-5 w-full">
            <ClientOnly>
              <DynamicCuisineRecommender />
            </ClientOnly>
          </div>
          
          <div id="ingredients" className="bg-white rounded-lg shadow-md p-5 w-full">
            <ClientOnly>
              <IngredientRecommender />
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
