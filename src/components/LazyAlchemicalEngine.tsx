/**
 * Lazy-loaded Alchemical Engine Component
 *
 * This component demonstrates performance optimization through lazy loading
 * of the heavy alchemical calculation engine.
 */

import React, { Suspense, useState } from 'react';
import { createLazyComponent } from '@/utils/lazyLoading';

// Lazy load the alchemical calculation engine
const AlchemicalCalculator = createLazyComponent(
  () => import('@/calculations/alchemicalEngine').then(module => ({
    default: React.memo((props: any) => {
      // This would wrap the actual calculation logic
      return (
        <div className="alchemical-calculator">
          <h3>Alchemical Calculation Engine</h3>
          <p>Performing complex elemental calculations...</p>
          {/* Calculation results would be rendered here */}
        </div>
      )
    })
  })),
  // Custom loading component
  () => (
    <div className="flex items-center justify-center p-6 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-full bg-purple-400 h-12 w-12"></div>
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-purple-400 rounded w-3/4"></div>
          <div className="h-4 bg-purple-300 rounded w-1/2"></div>
        </div>
      </div>
      <span className="ml-4 text-purple-700 font-medium">
        Loading Alchemical Engine...
      </span>
    </div>
  )
)

interface LazyAlchemicalEngineProps {
  ingredients?: string[],
  calculationType?: 'elemental' | 'thermodynamic' | 'energy',
  onCalculationComplete?: (result: any) => void,
}

export const LazyAlchemicalEngine: React.FC<LazyAlchemicalEngineProps> = ({
  ingredients = [],
  calculationType = 'elemental',
  onCalculationComplete,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [shouldPreload, setShouldPreload] = useState(false)

  // Preload the module when user hovers over the trigger
  const handlePreloadHover = () => {
    if (!shouldPreload) {
      setShouldPreload(true)
      // Trigger preload
      import('@/calculations/alchemicalEngine')
    }
  },

  return (
    <div className="lazy-alchemical-engine">
      {/* Trigger button with preload on hover */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        onMouseEnter={handlePreloadHover}
        className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-lg"
      >
        {isVisible ? 'Hide' : 'Show'} Alchemical Calculator
        {shouldPreload && (
          <span className="ml-2 text-xs opacity-75">(Preloaded)</span>
        )}
      </button>

      {/* Lazy-loaded calculator component */}
      {isVisible && (
        <div className="mt-4 border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
          <Suspense fallback={
            <div className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          }>
            <AlchemicalCalculator
              ingredients={ingredients}
              calculationType={calculationType}
              onComplete={onCalculationComplete}
            />
          </Suspense>
        </div>
      )}

      {/* Performance indicator */}
      <div className="mt-2 text-xs text-gray-500">
        {isVisible ? '✓ Engine loaded' : '○ Engine ready to load'}
        {shouldPreload && !isVisible && ' (Preloaded)'}
      </div>
    </div>
  )
},

export default LazyAlchemicalEngine,