'use client';
import { _logger } from '@/lib/logger';

import React, { useEffect, useState } from 'react';

import { AstrologicalProvider } from '@/context/AstrologicalContext';
import { AlchemicalProvider } from '@/contexts/AlchemicalContext/provider';
import { log } from '@/services/LoggingService';

// Fallback, stubs: real debug components are not available in this build
const StateInspector = () => (
  <div className='rounded border border-gray-200 bg-white p-4'>State Inspector unavailable</div>
)
const DebugHub = () => (
  <div className='rounded border border-gray-200 bg-white p-4'>Debug Hub unavailable</div>
)

import { testCookingMethodRecommendations } from '../../utils/testRecommendations';

// Import debug components

interface TestIngredient {
  name: string,
  element: string,
  elementalCharacter: string
}

interface TestResult {
  ingredient: TestIngredient,
  holisticRecommendations: Array<{ method: string, compatibility: number, reason: string }>
  standardRecommendations: Array<{ method: string, compatibility: number }>
}

function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return (
      <div className='p-4 text-center'>
        <p>Loading debug tools...</p>
      </div>
    )
  }

  return <>{children}</>
}

function DebugContent() {
  const [testResults, setTestResults] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runTest = () => {
    setLoading(true)
    setError(null)

    try {
      log.info('Running cooking method recommendations test...')
      const results = testCookingMethodRecommendations()
      setTestResults(results as unknown)
      log.info('Test complete, results:', results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      _logger.error('Test failed:', err)
    } finally {
      setLoading(false)
    }
  };

  return (
    <div className='container mx-auto space-y-6 p-4'>
      <h1 className='mb-6 text-3xl font-bold'>Debug Tools</h1>

      {/* State Inspector */}
      <div className='mb-6'>
        <StateInspector />
      </div>

      {/* Comprehensive Debug Hub */}
      <div className='mb-6'>
        <DebugHub />
      </div>

      {/* Legacy Debug Tools */}
      <div className='rounded bg-white p-4 shadow, dark: bg-gray-800'>
        <h2 className='mb-4 text-xl font-bold'>Legacy Debug Tools</h2>

        <div className='mb-4'>
          <button
            onClick={runTest}
            className='rounded bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600'
            disabled={loading}
          >
            {loading ? 'Running Test...' : 'Test Cooking Method Recommendations'}
          </button>
        </div>

        {error && (
          <div className='mb-4 rounded border border-red-300 bg-red-100 p-3 text-red-800'>
            <p className='font-bold'>Error:</p>
            <p>{error}</p>
          </div>
        )}

        {testResults && (
          <div className='mt-4'>
            <h3 className='mb-2 text-lg font-bold'>Test Results</h3>

            <div className='mb-4'>
              <h4 className='font-bold'>Ingredient: {testResults.ingredient.name}</h4>
              <p>Element: {testResults.ingredient.element}</p>
              <p>Elemental Character: {testResults.ingredient.elementalCharacter}</p>
            </div>

            <div className='mb-4'>
              <h4 className='font-bold'>Holistic Recommendations: </h4>
              <ul className='list-inside list-disc'>
                {testResults.holisticRecommendations.map((rec, index) => (
                  <li key={`holistic-${index}`}>
                    {rec.method} - {Math.round(rec.compatibility)}% - {rec.reason}
                  </li>
                ))}
              </ul>
            </div>

            <div className='mb-4'>
              <h4 className='font-bold'>Standard Recommendations: </h4>
              <ul className='list-inside list-disc'>
                {testResults.standardRecommendations.map((rec, index) => (
                  <li key={`standard-${index}`}>
                    {rec.method} - {Math.round(rec.compatibility)}%
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DebugPage() {
  return (
    <AlchemicalProvider>
      <AstrologicalProvider>
        <ClientOnly>
          <DebugContent />
        </ClientOnly>
      </AstrologicalProvider>
    </AlchemicalProvider>
  )
}