'use client';

import React, { useState } from 'react';
import { testCookingMethodRecommendations } from '../../utils/testRecommendations';

interface TestIngredient {
  name: string;
  element: string;
  elementalCharacter: string;
}

interface TestResult {
  ingredient: TestIngredient;
  holisticRecommendations: Array<{ method: string, compatibility: number, reason: string }>;
  standardRecommendations: Array<{ method: string, compatibility: number }>;
}

export default function DebugPage() {
  const [testResults, setTestResults] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Running cooking method recommendations test...');
      const results = await testCookingMethodRecommendations();
      
      // Validate the results structure
      if (!results || !results.ingredient) {
        throw new Error('Invalid test results structure');
      }
      
      setTestResults(results as unknown);
      console.log('Test complete, results:', results);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Test failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Debug Tools</h1>
      
      <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Alchemical Debug Tools</h2>
        
        <div className="mb-4">
          <button 
            onClick={runTest}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            disabled={loading}
          >
            {loading ? 'Running Test...' : 'Test Cooking Method Recommendations'}
          </button>
        </div>
        
        {error && (
          <div className="p-3 mb-4 bg-red-100 border border-red-300 text-red-800 rounded">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        )}
        
        {testResults && testResults.ingredient && (
          <div className="mt-4">
            <h3 className="text-lg font-bold mb-2">Test Results</h3>
            
            <div className="mb-4">
              <h4 className="font-bold">Ingredient: {testResults.ingredient.name}</h4>
              <p>Element: {testResults.ingredient.element}</p>
              <p>Elemental Character: {testResults.ingredient.elementalCharacter}</p>
            </div>
            
            <div className="mb-4">
              <h4 className="font-bold">Holistic Recommendations:</h4>
              <ul className="list-disc list-inside">
                {testResults.holisticRecommendations?.map((rec, index) => (
                  <li key={`holistic-${index}`}>
                    {rec.method} - {Math.round(rec.compatibility)}% - {rec.reason}
                  </li>
                )) || <li>No holistic recommendations available</li>}
              </ul>
            </div>
            
            <div className="mb-4">
              <h4 className="font-bold">Standard Recommendations:</h4>
              <ul className="list-disc list-inside">
                {testResults.standardRecommendations?.map((rec, index) => (
                  <li key={`standard-${index}`}>
                    {rec.method} - {Math.round(rec.compatibility)}%
                  </li>
                )) || <li>No standard recommendations available</li>}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 