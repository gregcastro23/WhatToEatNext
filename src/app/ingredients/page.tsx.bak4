'use client';

import { ArrowLeft, Home } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import IngredientRecommender from '@/components/IngredientRecommender';
import { useNavigationContext, useScrollPreservation } from '@/hooks/useStatePreservation';

export default function IngredientsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(null);

  // Use enhanced state preservation hooks
  const { preserveContext, restoreContext } = useNavigationContext();
  const { restoreScrollPosition } = useScrollPreservation('ingredients-page');

  // Restore context from URL parameters or enhanced state preservation
  useEffect(() => {
    // Check URL parameters first
    const categoryParam = searchParams?.get('category');
    const ingredientParam = searchParams?.get('ingredient');
    
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    
    if (ingredientParam) {
      setSelectedIngredient(ingredientParam);
    }
    
    // If no URL params, try to restore from enhanced state preservation
    if (!categoryParam && !ingredientParam) {
      const restoredContext = restoreContext();
      if (restoredContext) {
        if (restoredContext.selectedIngredientCategory) {
          setSelectedCategory(restoredContext.selectedIngredientCategory);
        }
        if (restoredContext.selectedIngredient) {
          setSelectedIngredient(restoredContext.selectedIngredient);
        }
      }
    }

    // Restore scroll position after a short delay
    setTimeout(() => {
      restoreScrollPosition();
    }, 100);
  }, [searchParams, restoreContext, restoreScrollPosition]);

  // Handle navigation back to main page with enhanced context preservation
  const handleBackToMain = () => {
    // Preserve current context using enhanced system
    preserveContext({
      fromPage: 'ingredients',
      selectedItems: selectedIngredient ? [selectedIngredient] : [],
      activeSection: 'ingredients',
      scrollPosition: window.scrollY,
      timestamp: Date.now()
    });
    
    // Navigate with smooth transition
    router.push('/#ingredients');
  };

  // Handle navigation to home
  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header with navigation */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToMain}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium px-3 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                <ArrowLeft size={20} />
                Back to Main
              </button>
              
              <button
                onClick={handleGoHome}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Home size={20} />
                Home
              </button>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-indigo-900">
              Ingredient Recommendations
            </h1>
            <p className="text-indigo-600 mb-4">
              Explore ingredients aligned with current celestial energies
            </p>
            
            {/* Context indicators */}
            {(selectedCategory || selectedIngredient) && (
              <div className="inline-flex items-center gap-4 bg-white px-4 py-2 rounded-lg shadow-sm">
                {selectedCategory && (
                  <span className="text-sm text-gray-600">
                    Category: <span className="font-medium text-indigo-600">{selectedCategory}</span>
                  </span>
                )}
                {selectedIngredient && (
                  <span className="text-sm text-gray-600">
                    Selected: <span className="font-medium text-indigo-600">{selectedIngredient}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <IngredientRecommender 
              initialCategory={selectedCategory}
              initialSelectedIngredient={selectedIngredient}
              isFullPageVersion={true}
            />
          </div>
        </main>
      </div>
    </div>
  );
}