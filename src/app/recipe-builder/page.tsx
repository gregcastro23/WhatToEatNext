'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, ChefHat, Utensils, Clock, Users } from 'lucide-react';

// Use dynamic import with SSR disabled for the recipe builder
const DynamicRecipeBuilder = dynamic(
  () => import('@/components/recipes/RecipeBuilder'),
  { ssr: false }
);

// A wrapper component that only renders children when client-side
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = React.useState(false);
  
  React.useEffect(() => {
    setHasMounted(true);
  }, []);
  
  if (!hasMounted) {
    return null;
  }
  
  return <>{children}</>;
}

export default function RecipeBuilderPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 via-yellow-50 to-gray-100 text-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation Header */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-orange-600 hover:text-orange-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Page Header */}
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <ChefHat className="w-8 h-8 text-orange-500 mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold text-orange-900">Recipe Builder</h1>
            <Utensils className="w-8 h-8 text-orange-500 ml-3" />
          </div>
          <p className="text-xl text-orange-700 mb-6 max-w-4xl mx-auto">
            Create personalized recipes with celestial guidance. Our intelligent recipe builder 
            combines your preferences with astrological influences to craft the perfect dish.
          </p>
          
          {/* Feature highlights */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <div className="flex items-center bg-orange-100 px-4 py-2 rounded-full">
              <ChefHat className="w-4 h-4 text-orange-600 mr-2" />
              <span className="text-orange-700 font-medium">Celestial Guidance</span>
            </div>
            <div className="flex items-center bg-yellow-100 px-4 py-2 rounded-full">
              <Clock className="w-4 h-4 text-yellow-600 mr-2" />
              <span className="text-yellow-700 font-medium">Time Optimization</span>
            </div>
            <div className="flex items-center bg-green-100 px-4 py-2 rounded-full">
              <Users className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-green-700 font-medium">Personalized</span>
            </div>
          </div>
        </header>

        {/* Recipe Builder Component */}
        <div className="max-w-7xl mx-auto">
          <ClientOnly>
            <DynamicRecipeBuilder />
          </ClientOnly>
        </div>

        {/* Additional Information */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About Our Recipe Builder</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-orange-700 mb-2">Celestial Guidance</h3>
              <p className="text-gray-600">
                Our recipe builder considers current planetary positions, lunar phases, and 
                astrological influences to suggest ingredients and cooking methods that align 
                with the cosmic energies of the moment.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-700 mb-2">Time Optimization</h3>
              <p className="text-gray-600">
                Recipes are optimized for the current time of day, season, and planetary hours, 
                ensuring that your cooking aligns with the most favorable celestial conditions.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-700 mb-2">Personalized Preferences</h3>
              <p className="text-gray-600">
                Build recipes based on your dietary restrictions, taste preferences, and 
                available ingredients, all while maintaining celestial harmony.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-700 mb-2">Alchemical Integration</h3>
              <p className="text-gray-600">
                Our system incorporates alchemical principles and elemental balance to create 
                recipes that nourish both body and spirit in perfect harmony.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <footer className="mt-12 text-center">
          <div className="flex justify-center space-x-4">
            <Link 
              href="/" 
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Back to Home
            </Link>
            <Link 
              href="/enhanced-cuisine" 
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Enhanced Cuisine
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
} 