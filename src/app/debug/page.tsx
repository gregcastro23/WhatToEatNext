'use client';

import React, { useState } from 'react';
import { testCookingMethodRecommendations } from '../../utils/testRecommendations';
import CuisineRecommenderDebug from '../../components/debug/CuisineRecommenderDebug';
import { Zap, Settings, Info, Star } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'cuisine' | 'cooking-methods'>('cuisine');

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
      
      setTestResults(results as unknown as TestResult);
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
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-3">
          <Settings className="w-8 h-8 text-blue-500" />
          WhatToEatNext Debug Tools
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Phase 14 Enhanced - Comprehensive debugging and analysis tools for the culinary astrological recommendation system
        </p>
      </div>
      
      {/* Enhanced Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8" aria-label="Debug Tools">
            <button
              onClick={() => setActiveTab('cuisine')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'cuisine'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Enhanced Cuisine Recommender
              </div>
            </button>
            <button
              onClick={() => setActiveTab('cooking-methods')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'cooking-methods'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                Cooking Method Analysis
              </div>
            </button>
          </nav>
        </div>
      </div>
      
      {/* Enhanced Tab Content */}
      {activeTab === 'cuisine' && (
        <div>
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
                  Enhanced Cuisine Recommender Debug
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  This tool provides comprehensive debugging for the cuisine recommendation system. It integrates 
                  real-time astrological state, analyzes cuisine databases, applies alchemical transformations, 
                  and provides detailed scoring breakdowns with elemental harmony principles.
                </p>
              </div>
            </div>
          </div>
          <CuisineRecommenderDebug />
        </div>
      )}
      
      {activeTab === 'cooking-methods' && (
        <div>
          <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900 rounded-lg border border-purple-200 dark:border-purple-700">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-1">
                  Cooking Method Analysis
                </h3>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Test the alchemical cooking method recommendation algorithm with ingredient compatibility analysis,
                  elemental character evaluation, and holistic vs standard recommendation comparison.
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Star className="w-5 h-5 text-purple-500" />
              Alchemical Cooking Method Analysis
            </h2>
            
            <div className="mb-6">
              <button 
                onClick={runTest}
                className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all shadow-sm font-medium"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Running Analysis...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    Test Cooking Method Recommendations
                  </span>
                )}
              </button>
            </div>
            
            {error && (
              <div className="p-4 mb-6 bg-red-100 border border-red-300 text-red-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  <p className="font-bold">Analysis Error:</p>
                </div>
                <p className="mt-1">{error}</p>
              </div>
            )}
            
            {testResults && testResults.ingredient && (
              <div className="mt-6 space-y-6">
                <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900 dark:to-blue-900 rounded-lg border">
                  <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">Analysis Results</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                      <h4 className="font-bold text-purple-600 dark:text-purple-400">Test Ingredient</h4>
                      <p className="text-lg font-semibold">{testResults.ingredient.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Element: {testResults.ingredient.element}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Character: {testResults.ingredient.elementalCharacter}</p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                      <h4 className="font-bold text-blue-600 dark:text-blue-400">Holistic Recommendations</h4>
                      <p className="text-2xl font-bold">{testResults.holisticRecommendations?.length || 0}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Enhanced methods</p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                      <h4 className="font-bold text-green-600 dark:text-green-400">Standard Recommendations</h4>
                      <p className="text-2xl font-bold">{testResults.standardRecommendations?.length || 0}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Basic methods</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                      <h4 className="font-bold mb-4 text-blue-600 dark:text-blue-400 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Enhanced Holistic Recommendations
                      </h4>
                      {testResults.holisticRecommendations?.length > 0 ? (
                        <div className="space-y-3">
                          {testResults.holisticRecommendations.map((rec, index) => (
                            <div key={`holistic-${index}`} className="p-3 bg-blue-50 dark:bg-blue-900 rounded border-l-4 border-blue-500">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-medium">{rec.method}</span>
                                <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded font-mono">
                                  {Math.round(rec.compatibility)}%
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{rec.reason}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="italic text-gray-500 dark:text-gray-400">No holistic recommendations available</p>
                      )}
                    </div>
                    
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                      <h4 className="font-bold mb-4 text-green-600 dark:text-green-400 flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        Standard Recommendations
                      </h4>
                      {testResults.standardRecommendations?.length > 0 ? (
                        <div className="space-y-3">
                          {testResults.standardRecommendations.map((rec, index) => (
                            <div key={`standard-${index}`} className="p-3 bg-green-50 dark:bg-green-900 rounded border-l-4 border-green-500">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{rec.method}</span>
                                <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded font-mono">
                                  {Math.round(rec.compatibility)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="italic text-gray-500 dark:text-gray-400">No standard recommendations available</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 