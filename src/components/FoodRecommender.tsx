'use client';

import '../utils/foodRecommenderFix';
import '../utils/scriptReplacer';

import React, { useEffect, useState, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import dynamic from 'next/dynamic';

// Dynamically import the FoodRecommender core with SSR disabled to avoid hydration issues
const FoodRecommenderCore = dynamic(
  () => import('./FoodRecommender/index'),
  { ssr: false, loading: () => <LoadingFallback /> }
);

// Fallback component to show while loading
const LoadingFallback = () => (
  <div className="p-8 text-center">
    <div className="flex justify-center mb-4">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
    <p className="text-gray-600">Loading food recommendations...</p>
  </div>
);

// Error fallback component with TypeScript typing
const ErrorFallback = ({ 
  error, 
  resetErrorBoundary 
}: { 
  error: Error; 
  resetErrorBoundary: () => void;
}) => {
  // Log the error to help with debugging
  console.error("[FoodRecommender] Error caught in boundary:", error);
  
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <h3 className="text-lg font-medium text-red-800">Something went wrong</h3>
      <p className="mt-2 text-sm text-red-600">
        {error.message || "An error occurred while loading recommendations"}
      </p>
      <div className="mt-2 text-xs text-gray-600">
        {error.stack && <details>
          <summary>Error details</summary>
          <pre className="mt-2 whitespace-pre-wrap">{error.stack}</pre>
        </details>}
      </div>
      <button 
        onClick={() => {
          if (typeof window !== 'undefined') {
            // Reload our fixes before resetting
            window.__foodRecommenderFixApplied = false;
            
            // Create a script element to reload our fix
            const script = document.createElement('script');
            script.src = '/_next/static/chunks/foodRecommenderFix.js?' + Date.now();
            script.onload = resetErrorBoundary;
            document.head.appendChild(script);
            
            // If script loading fails, try the reset anyway after a timeout
            setTimeout(resetErrorBoundary, 2000);
          } else {
            resetErrorBoundary();
          }
        }}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Try again
      </button>
    </div>
  );
};

/**
 * This wrapper bypasses the popup.js requirement by directly providing the needed methods
 * and ensures all fixes and mocks are loaded properly
 */
function FoodRecommenderWrapper() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);

  useEffect(() => {
    // Prevent multiple initializations
    if (isInitialized) return;
    
    console.log('[FoodRecommenderWrapper] Initializing with fix providers');
    
    if (typeof window === 'undefined') {
      setIsInitialized(true);
      return;
    }
    
    // Create a minimal implementation of the popup object (backup to our other fixes)
    if (!window.popup) {
      console.log('[FoodRecommenderWrapper] Ensuring popup object is available');
      window.popup = {
        create: function(_options?: any) {
          return {
            show: function() { return this; },
            hide: function() { return this; },
            update: function() { return this; },
            on: function(_event: string, _callback?: any) { 
              return { 
                off: function() {},
                trigger: function(_event: string) { return this; }
              }; 
            },
            trigger: function(_event: string) { return this; }
          };
        },
        show: function() { return this; },
        hide: function() { return this; },
        update: function() { return this; },
        on: function(_event: string, _callback?: any) { 
          return { 
            off: function() {},
            trigger: function(_event: string) { return this; }
          }; 
        },
        trigger: function(_event: string) { return this; }
      };
    }

    // If fixes were applied successfully, mark as initialized
    if (window.__foodRecommenderFixApplied) {
      console.log('[FoodRecommenderWrapper] Fixes are already applied');
      setIsInitialized(true);
      return;
    }
    
    // If not yet fixed, load our fix script and retry
    if (loadAttempts < 2) {
      console.log('[FoodRecommenderWrapper] Loading fixes...');
      
      // Dynamic import in browser context
      import('../utils/foodRecommenderFix')
        .then(() => {
          console.log('[FoodRecommenderWrapper] Successfully loaded fixes');
          setIsInitialized(true);
        })
        .catch((err) => {
          console.error('[FoodRecommenderWrapper] Error loading fixes:', err);
          setLoadAttempts(prev => prev + 1);
        });
    } else {
      // If still not working after attempts, fall back to direct settings
      console.log('[FoodRecommenderWrapper] Using fallback initialization');
      
      // Apply minimal fixes directly 
      window.getElementRanking = window.getElementRanking || function() {
        return { 1: 'Fire' };
      };
      
      window.createElementObject = window.createElementObject || function() {
        return { Fire: 0, Water: 0, Air: 0, Earth: 0 };
      };
      
      window.combineElementObjects = window.combineElementObjects || function() {
        return { Fire: 0, Water: 0, Air: 0, Earth: 0 };
      };
      
      window.getAbsoluteElementValue = window.getAbsoluteElementValue || function() {
        return 0;
      };
      
      window.__foodRecommenderFixApplied = true;
      
      setIsInitialized(true);
    }
  }, [isInitialized, loadAttempts]);

  if (!isInitialized) {
    return <LoadingFallback />;
  }

  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onReset={() => {
        console.log('[FoodRecommenderWrapper] Error boundary reset');
      }}
    >
      <Suspense fallback={<LoadingFallback />}>
        <div className="food-recommender-container">
          <FoodRecommenderCore />
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}

export default FoodRecommenderWrapper;
