import React, { useEffect, useState } from 'react';
import ../../utils  from 'testRecommendations ';

interface TestResult {
  ingredient: unknown;
  holisticRecommendations: Array<{
    method: string;
    compatibility: number;
    reason: string;
  }>;
  standardRecommendations: Array<{ method: string; compatibility: number }>;
}

interface IngredientTestResult {
  elementalProperties: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  balancedRecommendations: Array<{
    name: string;
    element: string;
    balanceScore: number;
  }>;
}

/**
 * AlchemicalDebug - A component to display test results for cooking method recommendations
 */
const AlchemicalDebug: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // States for ingredient recommendation tests
  const [ingredientTestResults, setIngredientTestResults] = useState<IngredientTestResult | null>(null);
  const [ingredientLoading, setIngredientLoading] = useState(false);
  const [ingredientError, setIngredientError] = useState<string | null>(null);

  const runTest = () => {
    setLoading(true);
    setError(null);

    try {
      // console.log('Running cooking method recommendations test...');
      let results = testCookingMethodRecommendations();
      setTestResults(results);
      // console.log('Test complete, results:', results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      // console.error('Test failed:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const runIngredientTest = () => {
    setIngredientLoading(true);
    setIngredientError(null);

    try {
      // Run the ingredient test and store results
      const results = testIngredientRecommendations();
      setIngredientTestResults({
        elementalProperties: results.elementalProperties,
        balancedRecommendations: results.balancedRecommendations?.slice(0, 5) || []
      });
    } catch (err) {
      setIngredientError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIngredientLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Alchemical Debug Tools</h2>

      <div className="mb-4">
        <button
          onClick={runTest}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition mr-2"
          disabled={loading}
        >
          {loading ? 'Running Test...' : 'Test Cooking Method Recommendations'}
        </button>
        
        <button
          onClick={runIngredientTest}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          disabled={ingredientLoading}
        >
          {ingredientLoading ? 'Testing...' : 'Test Ingredient Recommendations'}
        </button>
      </div>

      {error && (
        <div className="p-3 mb-4 bg-red-100 border border-red-300 text-red-800 rounded">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      {ingredientError && (
        <div className="p-3 mb-4 bg-red-100 border border-red-300 text-red-800 rounded">
          <p className="font-bold">Ingredient Test Error:</p>
          <p>{ingredientError}</p>
        </div>
      )}

      {testResults && (
        <div className="mt-4">
          <h3 className="text-lg font-bold mb-2">Cooking Methods Test Results</h3>

          <div className="mb-4">
            <h4 className="font-bold">
              Ingredient: {testResults.ingredient.name}
            </h4>
            <p>Element: {testResults.ingredient.element}</p>
            <p>
              Elemental Character: {testResults.ingredient.elementalCharacter}
            </p>
          </div>

          <div className="mb-4">
            <h4 className="font-bold">Holistic Recommendations:</h4>
            <ul className="list-disc list-inside">
              {testResults.holisticRecommendations.map((rec, index) => (
                <li key={`holistic-${index}`}>
                  {rec.method} - {Math.round(rec.compatibility)}% - {rec.reason}
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-4">
            <h4 className="font-bold">Standard Recommendations:</h4>
            <ul className="list-disc list-inside">
              {testResults.standardRecommendations.map((rec, index) => (
                <li key={`standard-${index}`}>
                  {rec.method} - {Math.round(rec.compatibility)}%
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {ingredientTestResults && (
        <div className="mt-4">
          <h3 className="text-lg font-bold mb-2">Ingredient Test Results</h3>
          
          <div className="mb-4">
            <h4 className="font-bold">Elemental Properties:</h4>
            <ul className="list-disc list-inside">
              {Object.entries(ingredientTestResults.elementalProperties).map(([element, value]) => (
                <li key={element}>
                  {element}: {(value * 100).toFixed(1)}%
                </li>
              ))}
            </ul>
          </div>
          
          {/* Display top recommendations */}
          <div className="mb-4">
            <h4 className="font-bold">Top Balanced Recommendations:</h4>
            <ul className="list-disc list-inside">
              {ingredientTestResults.balancedRecommendations.map((rec, index) => (
                <li key={`balanced-${index}`}>
                  {rec.name} - Element: {rec.element} - Score: {(rec.balanceScore * 100).toFixed(1)}%
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
