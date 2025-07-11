'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Globe, Leaf } from 'lucide-react';

// Use dynamic import with SSR disabled for the enhanced cuisine recommender
const DynamicEnhancedCuisineRecommender = dynamic(
  () => import('@/components/EnhancedCuisineRecommender'),
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

export default function EnhancedCuisinePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 via-indigo-50 to-gray-100 text-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation Header */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Page Header */}
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-purple-500 mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold text-purple-900">Enhanced Cuisine Recommender</h1>
            <Sparkles className="w-8 h-8 text-purple-500 ml-3" />
          </div>
          <p className="text-xl text-purple-700 mb-6 max-w-4xl mx-auto">
            Advanced celestial cuisine matching with Monica/Kalchm integration, planetary influences, 
            and enhanced seasonal optimization for the most sophisticated culinary recommendations.
          </p>
          
          {/* Feature highlights */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <div className="flex items-center bg-purple-100 px-4 py-2 rounded-full">
              <Sparkles className="w-4 h-4 text-purple-600 mr-2" />
              <span className="text-purple-700 font-medium">Monica/Kalchm Integration</span>
            </div>
            <div className="flex items-center bg-blue-100 px-4 py-2 rounded-full">
              <Globe className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-blue-700 font-medium">Planetary Influences</span>
            </div>
            <div className="flex items-center bg-green-100 px-4 py-2 rounded-full">
              <Leaf className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-green-700 font-medium">Seasonal Optimization</span>
            </div>
          </div>
        </header>

        {/* Enhanced Cuisine Recommender Component */}
        <div className="max-w-7xl mx-auto">
          <ClientOnly>
            <DynamicEnhancedCuisineRecommender />
          </ClientOnly>
        </div>

        {/* Additional Information */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About Enhanced Cuisine Matching</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-purple-700 mb-2">Monica/Kalchm Integration</h3>
              <p className="text-gray-600">
                Our enhanced system incorporates the Monica constant and Kalchm harmony calculations 
                to provide deeper alchemical compatibility scores that go beyond basic elemental matching.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-700 mb-2">Planetary Influences</h3>
              <p className="text-gray-600">
                Each cuisine is analyzed for its planetary affinities, considering the current 
                positions of all major planets and their dignities in relation to culinary traditions.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-700 mb-2">Seasonal Optimization</h3>
              <p className="text-gray-600">
                Recommendations are enhanced with seasonal factors, ensuring that cuisines 
                are matched not just to celestial energies but also to the current season.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-orange-700 mb-2">Cultural Context</h3>
              <p className="text-gray-600">
                The system considers cultural and historical contexts of cuisines, 
                providing richer recommendations that honor traditional wisdom.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <footer className="mt-12 text-center">
          <div className="flex justify-center space-x-4">
            <Link 
              href="/" 
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Back to Home
            </Link>
            <Link 
              href="/recipe-builder" 
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Recipe Builder
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
} 