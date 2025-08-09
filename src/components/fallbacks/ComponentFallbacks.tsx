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
  showDetails = false,
}: FallbackProps) {
  return (
    <div className='rounded-lg border border-gray-200 bg-gray-50 p-6 text-center'>
      <AlertCircle className='mx-auto mb-4 h-12 w-12 text-gray-400' />
      <h3 className='mb-2 text-lg font-medium text-gray-900'>{componentName} Unavailable</h3>
      <p className='mb-4 text-gray-600'>
        We're having trouble loading this section. Please try again.
      </p>

      {showDetails && error && (
        <details className='mb-4 text-left'>
          <summary className='mb-2 cursor-pointer text-sm text-gray-500'>Technical Details</summary>
          <div className='rounded bg-gray-100 p-3 font-mono text-xs text-gray-700'>
            {error.message}
          </div>
        </details>
      )}

      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className='inline-flex items-center rounded bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700'
        >
          <RefreshCw className='mr-2 h-4 w-4' />
          Try Again
        </button>
      )}
    </div>
  );
});

// Cuisine Recommender fallback
export const CuisineRecommenderFallback = memo(function CuisineRecommenderFallback({
  onRetry,
  showRetry = true,
}: Omit<FallbackProps, 'componentName'>) {
  return (
    <div className='rounded-lg border border-orange-200 bg-orange-50 p-6'>
      <div className='mb-4 flex items-center justify-center'>
        <Utensils className='h-12 w-12 text-orange-400' />
      </div>
      <h3 className='mb-2 text-center text-lg font-medium text-orange-900'>
        Cuisine Recommendations Unavailable
      </h3>
      <p className='mb-4 text-center text-orange-700'>
        We're having trouble connecting to our culinary database. Here are some popular options
        while we fix this:
      </p>

      {/* Fallback cuisine suggestions */}
      <div className='mb-4 grid grid-cols-2 gap-3 md:grid-cols-3'>
        {['Italian', 'Chinese', 'Mexican', 'Indian', 'Thai', 'Mediterranean'].map(cuisine => (
          <div key={cuisine} className='rounded border bg-white p-3 text-center'>
            <span className='text-sm font-medium text-gray-700'>{cuisine}</span>
          </div>
        ))}
      </div>

      {showRetry && onRetry && (
        <div className='text-center'>
          <button
            onClick={onRetry}
            className='inline-flex items-center rounded bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-700'
          >
            <RefreshCw className='mr-2 h-4 w-4' />
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
  showRetry = true,
}: Omit<FallbackProps, 'componentName'>) {
  return (
    <div className='rounded-lg border border-green-200 bg-green-50 p-6'>
      <div className='mb-4 flex items-center justify-center'>
        <Database className='h-12 w-12 text-green-400' />
      </div>
      <h3 className='mb-2 text-center text-lg font-medium text-green-900'>
        Ingredient Recommendations Unavailable
      </h3>
      <p className='mb-4 text-center text-green-700'>
        Our ingredient database is temporarily unavailable. Here are some versatile ingredients to
        consider:
      </p>

      {/* Fallback ingredient suggestions */}
      <div className='mb-4 grid grid-cols-2 gap-2 md:grid-cols-4'>
        {[
          'Onions',
          'Garlic',
          'Tomatoes',
          'Bell Peppers',
          'Olive Oil',
          'Salt',
          'Black Pepper',
          'Herbs',
        ].map(ingredient => (
          <div key={ingredient} className='rounded border bg-white p-2 text-center'>
            <span className='text-xs font-medium text-gray-700'>{ingredient}</span>
          </div>
        ))}
      </div>

      {showRetry && onRetry && (
        <div className='text-center'>
          <button
            onClick={onRetry}
            className='inline-flex items-center rounded bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700'
          >
            <RefreshCw className='mr-2 h-4 w-4' />
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
  showRetry = true,
}: Omit<FallbackProps, 'componentName'>) {
  return (
    <div className='rounded-lg border border-blue-200 bg-blue-50 p-6'>
      <div className='mb-4 flex items-center justify-center'>
        <ChefHat className='h-12 w-12 text-blue-400' />
      </div>
      <h3 className='mb-2 text-center text-lg font-medium text-blue-900'>
        Cooking Methods Unavailable
      </h3>
      <p className='mb-4 text-center text-blue-700'>
        We're having trouble loading cooking methods. Here are some fundamental techniques:
      </p>

      {/* Fallback cooking methods */}
      <div className='mb-4 grid grid-cols-2 gap-3 md:grid-cols-3'>
        {['Sautéing', 'Roasting', 'Steaming', 'Grilling', 'Braising', 'Stir-frying'].map(method => (
          <div key={method} className='rounded border bg-white p-3 text-center'>
            <span className='text-sm font-medium text-gray-700'>{method}</span>
          </div>
        ))}
      </div>

      {showRetry && onRetry && (
        <div className='text-center'>
          <button
            onClick={onRetry}
            className='inline-flex items-center rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'
          >
            <RefreshCw className='mr-2 h-4 w-4' />
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
  showRetry = true,
}: Omit<FallbackProps, 'componentName'>) {
  return (
    <div className='rounded-lg border border-purple-200 bg-purple-50 p-6'>
      <div className='mb-4 flex items-center justify-center'>
        <BookOpen className='h-12 w-12 text-purple-400' />
      </div>
      <h3 className='mb-2 text-center text-lg font-medium text-purple-900'>
        Recipe Builder Unavailable
      </h3>
      <p className='mb-4 text-center text-purple-700'>
        The recipe builder is temporarily unavailable. You can still plan your cooking manually:
      </p>

      {/* Fallback recipe planning tips */}
      <div className='mb-4 rounded border bg-white p-4'>
        <h4 className='mb-2 font-medium text-gray-900'>Quick Recipe Planning Tips:</h4>
        <ul className='space-y-1 text-sm text-gray-700'>
          <li>• Choose your main protein or vegetable</li>
          <li>• Select complementary seasonings</li>
          <li>• Pick a cooking method that suits your ingredients</li>
          <li>• Consider timing for each component</li>
        </ul>
      </div>

      {showRetry && onRetry && (
        <div className='text-center'>
          <button
            onClick={onRetry}
            className='inline-flex items-center rounded bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700'
          >
            <RefreshCw className='mr-2 h-4 w-4' />
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
  showRetry = true,
}: FallbackProps) {
  return (
    <div className='rounded-lg border border-red-200 bg-red-50 p-6 text-center'>
      <Wifi className='mx-auto mb-4 h-12 w-12 text-red-400' />
      <h3 className='mb-2 text-lg font-medium text-red-900'>Connection Problem</h3>
      <p className='mb-4 text-red-700'>
        We're having trouble connecting to our servers. Please check your internet connection and
        try again.
      </p>

      <div className='mb-4 rounded border bg-white p-3'>
        <p className='text-sm text-gray-600'>
          <strong>Troubleshooting:</strong>
        </p>
        <ul className='mt-1 text-left text-xs text-gray-500'>
          <li>• Check your internet connection</li>
          <li>• Try refreshing the page</li>
          <li>• Disable any ad blockers temporarily</li>
          <li>• Try again in a few minutes</li>
        </ul>
      </div>

      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className='inline-flex items-center rounded bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700'
        >
          <RefreshCw className='mr-2 h-4 w-4' />
          Try Again
        </button>
      )}
    </div>
  );
});

// Loading fallback with skeleton
export const LoadingFallback = memo(function LoadingFallback({
  componentName = 'Content',
}: Pick<FallbackProps, 'componentName'>) {
  return (
    <div className='rounded-lg bg-gray-50 p-6'>
      <div className='animate-pulse'>
        <div className='mb-4 flex items-center'>
          <div className='mr-3 h-8 w-8 rounded-full bg-gray-300'></div>
          <div className='h-4 w-1/4 rounded bg-gray-300'></div>
        </div>

        <div className='space-y-3'>
          <div className='h-4 w-3/4 rounded bg-gray-300'></div>
          <div className='h-4 w-1/2 rounded bg-gray-300'></div>
          <div className='h-4 w-5/6 rounded bg-gray-300'></div>
        </div>

        <div className='mt-6 grid grid-cols-2 gap-4 md:grid-cols-3'>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className='h-20 rounded bg-gray-300'></div>
          ))}
        </div>
      </div>

      <div className='mt-4 text-center'>
        <p className='text-sm text-gray-500'>Loading {componentName}...</p>
      </div>
    </div>
  );
});

// Maintenance mode fallback
export const MaintenanceFallback = memo(function MaintenanceFallback({
  componentName = 'Service',
}: Pick<FallbackProps, 'componentName'>) {
  return (
    <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-center'>
      <div className='mx-auto mb-4 h-12 w-12 text-yellow-400'>🔧</div>
      <h3 className='mb-2 text-lg font-medium text-yellow-900'>Temporary Maintenance</h3>
      <p className='mb-4 text-yellow-700'>
        {componentName} is currently undergoing maintenance. We'll be back shortly!
      </p>

      <div className='rounded border bg-white p-3'>
        <p className='text-sm text-gray-600'>
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
  Maintenance: MaintenanceFallback,
};

export default ComponentFallbacks;
