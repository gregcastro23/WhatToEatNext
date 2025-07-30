'use client';

import { RefreshCw, AlertCircle, Wifi, Database, Utensils, ChefHat, BookOpen } from 'lucide-react';
import React, { memo } from 'react';

interface FallbackProps {
  onRetry?: () => void;
  error?: Error;
  componentName?: string;
  showRetry?: boolean;
  showDetails?: boolean;
}

// Generic fallback component
export const GenericFallback = memo(function GenericFallback({
  onRetry,
  error,
  componentName = 'Component',
  showRetry = true,
  showDetails = false
}: FallbackProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
      <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {componentName} Unavailable
      </h3>
      <p className="text-gray-600 mb-4">
        We&apos;re having trouble loading this section. Please try again.
      </p>
      
      {showDetails &amp;&amp; error &amp;&amp; (
        <details className="mb-4 text-left">
          <summary className="cursor-pointer text-gray-500 text-sm mb-2">
            Technical Details
          </summary>
          <div className="bg-gray-100 p-3 rounded text-xs font-mono text-gray-700">
            {error.message}
          </div>
        </details>
      )}
      
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </button>
      )}
    </div>
  );
});

// Cuisine Recommender fallback
export const CuisineRecommenderFallback = memo(function CuisineRecommenderFallback({
  onRetry,
  showRetry = true
}: Omit<FallbackProps, 'componentName'>) {
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
      <div className="flex items-center justify-center mb-4">
        <Utensils className="h-12 w-12 text-orange-400" />
      </div>
      <h3 className="text-lg font-medium text-orange-900 text-center mb-2">
        Cuisine Recommendations Unavailable
      </h3>
      <p className="text-orange-700 text-center mb-4">
        We're having trouble connecting to our culinary database. Here are some popular options while we fix this:
      </p>
      
      {/* Fallback cuisine suggestions */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {['Italian', 'Chinese', 'Mexican', 'Indian', 'Thai', 'Mediterranean'].map(cuisine => (
          <div key={cuisine} className="bg-white p-3 rounded border text-center">
            <span className="text-sm font-medium text-gray-700">{cuisine}</span>
          </div>
        ))}
      </div>
      
      {showRetry && onRetry && (
        <div className="text-center">
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reload Recommendations
          </button>
        </div>
      )}
    </div>
  );
});

// Ingredient Recommender fallback
export const IngredientRecommenderFallback = memo(function IngredientRecommenderFallback({
  onRetry,
  showRetry = true
}: Omit<FallbackProps, 'componentName'>) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
      <div className="flex items-center justify-center mb-4">
        <Database className="h-12 w-12 text-green-400" />
      </div>
      <h3 className="text-lg font-medium text-green-900 text-center mb-2">
        Ingredient Recommendations Unavailable
      </h3>
      <p className="text-green-700 text-center mb-4">
        Our ingredient database is temporarily unavailable. Here are some versatile ingredients to consider:
      </p>
      
      {/* Fallback ingredient suggestions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        {[
          'Onions', 'Garlic', 'Tomatoes', 'Bell Peppers',
          'Olive Oil', 'Salt', 'Black Pepper', 'Herbs'
        ].map(ingredient => (
          <div key={ingredient} className="bg-white p-2 rounded border text-center">
            <span className="text-xs font-medium text-gray-700">{ingredient}</span>
          </div>
        ))}
      </div>
      
      {showRetry && onRetry && (
        <div className="text-center">
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reload Ingredients
          </button>
        </div>
      )}
    </div>
  );
});

// Cooking Methods fallback
export const CookingMethodsFallback = memo(function CookingMethodsFallback({
  onRetry,
  showRetry = true
}: Omit<FallbackProps, 'componentName'>) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-center justify-center mb-4">
        <ChefHat className="h-12 w-12 text-blue-400" />
      </div>
      <h3 className="text-lg font-medium text-blue-900 text-center mb-2">
        Cooking Methods Unavailable
      </h3>
      <p className="text-blue-700 text-center mb-4">
        We're having trouble loading cooking methods. Here are some fundamental techniques:
      </p>
      
      {/* Fallback cooking methods */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {[
          'Sautéing', 'Roasting', 'Steaming',
          'Grilling', 'Braising', 'Stir-frying'
        ].map(method => (
          <div key={method} className="bg-white p-3 rounded border text-center">
            <span className="text-sm font-medium text-gray-700">{method}</span>
          </div>
        ))}
      </div>
      
      {showRetry && onRetry && (
        <div className="text-center">
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reload Methods
          </button>
        </div>
      )}
    </div>
  );
});

// Recipe Builder fallback
export const RecipeBuilderFallback = memo(function RecipeBuilderFallback({
  onRetry,
  showRetry = true
}: Omit<FallbackProps, 'componentName'>) {
  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
      <div className="flex items-center justify-center mb-4">
        <BookOpen className="h-12 w-12 text-purple-400" />
      </div>
      <h3 className="text-lg font-medium text-purple-900 text-center mb-2">
        Recipe Builder Unavailable
      </h3>
      <p className="text-purple-700 text-center mb-4">
        The recipe builder is temporarily unavailable. You can still plan your cooking manually:
      </p>
      
      {/* Fallback recipe planning tips */}
      <div className="bg-white p-4 rounded border mb-4">
        <h4 className="font-medium text-gray-900 mb-2">Quick Recipe Planning Tips:</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Choose your main protein or vegetable</li>
          <li>• Select complementary seasonings</li>
          <li>• Pick a cooking method that suits your ingredients</li>
          <li>• Consider timing for each component</li>
        </ul>
      </div>
      
      {showRetry && onRetry && (
        <div className="text-center">
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reload Recipe Builder
          </button>
        </div>
      )}
    </div>
  );
});

// Network error fallback
export const NetworkErrorFallback = memo(function NetworkErrorFallback({
  onRetry,
  componentName = 'Content',
  showRetry = true
}: FallbackProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <Wifi className="mx-auto h-12 w-12 text-red-400 mb-4" />
      <h3 className="text-lg font-medium text-red-900 mb-2">
        Connection Problem
      </h3>
      <p className="text-red-700 mb-4">
        We&apos;re having trouble connecting to our servers. Please check your internet connection and try again.
      </p>
      
      <div className="bg-white p-3 rounded border mb-4">
        <p className="text-sm text-gray-600">
          <strong>Troubleshooting:</strong>
        </p>
        <ul className="text-xs text-gray-500 mt-1 text-left">
          <li>• Check your internet connection</li>
          <li>• Try refreshing the page</li>
          <li>• Disable any ad blockers temporarily</li>
          <li>• Try again in a few minutes</li>
        </ul>
      </div>
      
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </button>
      )}
    </div>
  );
});

// Loading fallback with skeleton
export const LoadingFallback = memo(function LoadingFallback({
  componentName = 'Content'
}: Pick<FallbackProps, 'componentName'>) {
  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="animate-pulse">
        <div className="flex items-center mb-4">
          <div className="rounded-full bg-gray-300 h-8 w-8 mr-3"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
        </div>
        
        <div className="space-y-3">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          <div className="h-4 bg-gray-300 rounded w-5/6"></div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-20 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>
      
      <div className="text-center mt-4">
        <p className="text-gray-500 text-sm">Loading {componentName}...</p>
      </div>
    </div>
  );
});

// Maintenance mode fallback
export const MaintenanceFallback = memo(function MaintenanceFallback({
  componentName = 'Service'
}: Pick<FallbackProps, 'componentName'>) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
      <div className="mx-auto h-12 w-12 text-yellow-400 mb-4">
        🔧
      </div>
      <h3 className="text-lg font-medium text-yellow-900 mb-2">
        Temporary Maintenance
      </h3>
      <p className="text-yellow-700 mb-4">
        {componentName} is currently undergoing maintenance. We'll be back shortly!
      </p>
      
      <div className="bg-white p-3 rounded border">
        <p className="text-sm text-gray-600">
          Expected completion: <strong>Within 15 minutes</strong>
        </p>
      </div>
    </div>
  );
});

// Export all fallbacks
export const ComponentFallbacks = {
  Generic: GenericFallback,
  CuisineRecommender: CuisineRecommenderFallback,
  IngredientRecommender: IngredientRecommenderFallback,
  CookingMethods: CookingMethodsFallback,
  RecipeBuilder: RecipeBuilderFallback,
  NetworkError: NetworkErrorFallback,
  Loading: LoadingFallback,
  Maintenance: MaintenanceFallback
};

export default ComponentFallbacks;