import React, { useEffect, useState } from 'react';

import { log } from '@/services/LoggingService';

import { testCookingMethodRecommendations } from '../../utils/testRecommendations';

interface TestResult {
  ingredient: unknown;
  holisticRecommendations: Array<{ method: string; compatibility: number; reason: string }>;
  standardRecommendations: Array<{ method: string; compatibility: number }>;
}

/**
 * AlchemicalDebug - A component to display test results for cooking method recommendations
 */
const AlchemicalDebug: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);

    try {
      log.info('Running cooking method recommendations test...');
      const results = await testCookingMethodRecommendations();
      setTestResults(results);
      log.info('Test complete, results:', results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Test failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='rounded bg-white p-4 shadow dark:bg-gray-800'>
      <h2 className='mb-4 text-xl font-bold'>Alchemical Debug Tools</h2>

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
            {/* Apply surgical type casting with variable extraction */}
            {(() => {
              const ingredientData = testResults.ingredient as any;
              const name = ingredientData?.name;
              const element = ingredientData?.element;
              const elementalCharacter = ingredientData?.elementalCharacter;

              return (
                <>
                  <h4 className='font-bold'>Ingredient: {name}</h4>
                  <p>Element: {element}</p>
                  <p>Elemental Character: {elementalCharacter}</p>
                </>
              );
            })()}
          </div>

          <div className='mb-4'>
            <h4 className='font-bold'>Holistic Recommendations:</h4>
            <ul className='list-inside list-disc'>
              {testResults.holisticRecommendations.map((rec, index) => (
                <li key={`holistic-${index}`}>
                  {rec.method} - {Math.round(rec.compatibility)}% - {rec.reason}
                </li>
              ))}
            </ul>
          </div>

          <div className='mb-4'>
            <h4 className='font-bold'>Standard Recommendations:</h4>
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
  );
};

export default AlchemicalDebug;
