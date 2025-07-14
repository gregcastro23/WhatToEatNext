'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import FoodRecommender from '@/components/FoodRecommender';
import IngredientRecommender from '@/components/IngredientRecommender';
import { useCookingMethods } from '@/hooks/useCookingMethods';
// Use dynamic import for CookingMethodsSection to avoid chunk loading issues
const DynamicCookingMethodsSection = dynamic(
  () => import('@/components/CookingMethodsSection').then(mod => ({ default: mod.CookingMethodsSection })),
  { ssr: false }
);
import RecipeGeneratorCap from '@/components/FoodRecommender/RecipeGeneratorCap';
import { ChefHat, Sparkles, Utensils, Home as HomeIcon, Globe, Target } from 'lucide-react';
import { RecipeQueueProvider } from '@/contexts/RecipeQueueContext';
import MainRecipeBuilder from '@/components/recipes/MainRecipeBuilder';

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

// Navigation Component
function Navigation() {
  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <ChefHat className="w-8 h-8 text-indigo-600" />
            <span className="font-bold text-xl text-indigo-900">What to Eat Next</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600 transition-colors"
            >
              <HomeIcon className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <Link 
              href="/enhanced-cuisine" 
              className="flex items-center space-x-1 text-gray-700 hover:text-purple-600 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Enhanced Cuisine</span>
            </Link>
            <Link 
              href="/recipe-builder" 
              className="flex items-center space-x-1 text-gray-700 hover:text-orange-600 transition-colors"
            >
              <Utensils className="w-4 h-4" />
              <span>Recipe Builder</span>
            </Link>
            <Link 
              href="/cooking-methods" 
              className="flex items-center space-x-1 text-gray-700 hover:text-green-600 transition-colors"
            >
              <Target className="w-4 h-4" />
              <span>Cooking Methods</span>
            </Link>
            <Link 
              href="/alchm-kitchen" 
              className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 transition-colors font-medium"
            >
              <Globe className="w-4 h-4" />
              <span>Alchm Kitchen</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-700 hover:text-indigo-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
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
  // Add cooking methods hook
  const { methods: cookingMethods, isLoading: cookingMethodsLoading, error: cookingMethodsError, selectMethod } = useCookingMethods();
  const [selectedCookingMethodId, setSelectedCookingMethodId] = useState<string | null>(null);
  const [showFullRecipeGenerator, setShowFullRecipeGenerator] = useState(false);

  // Add error handling for astrological state
  // const [astroError, _setAstroError] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-gray-100 text-gray-800">
      {/* Navigation Bar */}
      <Navigation />
      
      <main>
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
            {/* 1. Regular Cuisine Recommender (Top Component) */}
            <div id="cuisine" className="bg-white rounded-lg shadow-md p-5 w-full">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Celestial Cuisine Guide</h2>
                <p className="text-gray-600 text-sm">
                  Discover cuisines that align with current astrological energies. 
                  <Link href="/enhanced-cuisine" className="text-purple-600 hover:text-purple-700 ml-2 font-medium">
                    Try Enhanced Version →
                  </Link>
                </p>
              </div>
              <ClientOnly>
                <DynamicCuisineRecommender />
              </ClientOnly>
            </div>
            
            {/* 2. Food/Ingredient Recommender */}
            <div id="ingredients" className="bg-white rounded-lg shadow-md p-5 w-full">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Ingredient Recommendations</h2>
                <p className="text-gray-600 text-sm">
                  Get personalized ingredient suggestions based on your astrological profile and current energies.
                </p>
              </div>
              <ClientOnly>
                <IngredientRecommender />
              </ClientOnly>
            </div>
            
            {/* 3. Cooking Methods Section */}
            <div id="cooking-methods" className="bg-white rounded-lg shadow-md p-5 w-full">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Cooking Methods</h2>
                <p className="text-gray-600 text-sm">
                  Discover optimal cooking techniques aligned with current planetary influences.
                </p>
              </div>
              <ClientOnly>
                {cookingMethodsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    <span className="ml-2 text-gray-600">Loading cooking methods...</span>
                  </div>
                ) : cookingMethodsError ? (
                  <div className="text-red-500 text-center py-4">
                    Error loading cooking methods: {cookingMethodsError}
                  </div>
                ) : (
                  <DynamicCookingMethodsSection
                    methods={cookingMethods}
                    onSelectMethod={(method) => {
                      setSelectedCookingMethodId(method.id);
                      selectMethod(method.id);
                    }}
                    selectedMethodId={selectedCookingMethodId}
                    showToggle={true}
                    initiallyExpanded={true}
                  />
                )}
              </ClientOnly>
            </div>
            
            {/* 4. Recipe Generator (Bottom) */}
            <div id="recipes" className="bg-white rounded-lg shadow-md p-5 w-full">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Recipe Generator</h2>
                <p className="text-gray-600 text-sm">
                  Generate complete recipes with celestial guidance. 
                  <Link href="/recipe-builder" className="text-orange-600 hover:text-orange-700 ml-2 font-medium">
                    Try Advanced Builder →
                  </Link>
                </p>
              </div>
              <ClientOnly>
                <RecipeQueueProvider>
                  <MainRecipeBuilder />
                </RecipeQueueProvider>
              </ClientOnly>
            </div>
          </div>
          
          <footer className="mt-12 text-center">
            <PayPalButton />
          </footer>
        </div>
      </main>
    </div>
  );
}
