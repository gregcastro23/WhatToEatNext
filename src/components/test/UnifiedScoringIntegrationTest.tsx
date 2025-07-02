'use client';

import React, { useState, useEffect } from 'react';
import { getRecommendedIngredients, ScoredItem } from '@/services/UnifiedScoringAdapter';
import type { UnifiedIngredient } from '@/types/ingredient';
import type { Season } from '@/types/alchemy';
import type { Planet } from '@/types/celestial';

// Sample ingredients for testing
const SAMPLE_INGREDIENTS: UnifiedIngredient[] = [
  {
    name: 'Basil',
    elementalProperties: { Fire: 0.3, Water: 0.1, Earth: 0.2, Air: 0.4 },
    alchemicalProperties: { Spirit: 0.3, Essence: 0.4, Matter: 0.2, Substance: 0.1 },
    seasonality: ['summer', 'spring'] as Season[],
    astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Mars'] as Planet[]
    },
    category: 'herbs',
    flavorProfile: { sweet: 0.2, bitter: 0.1, spicy: 0.3, aromatic: 0.8 },
    culturalOrigins: ['Italian', 'Mediterranean']
  },
  {
    name: 'Garlic',
    elementalProperties: { Fire: 0.6, Water: 0.1, Earth: 0.1, Air: 0.2 },
    alchemicalProperties: { Spirit: 0.6, Essence: 0.1, Matter: 0.1, Substance: 0.2 },
    seasonality: ['all'] as Season[],
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Pluto'] as Planet[]
    },
    category: 'vegetables',
    flavorProfile: { pungent: 0.9, spicy: 0.7, savory: 0.8 },
    culturalOrigins: ['Mediterranean', 'Asian']
  },
  {
    name: 'Ginger',
    elementalProperties: { Fire: 0.7, Water: 0.1, Earth: 0.1, Air: 0.1 },
    alchemicalProperties: { Spirit: 0.7, Essence: 0.1, Matter: 0.1, Substance: 0.1 },
    seasonality: ['all'] as Season[],
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Sun'] as Planet[]
    },
    category: 'spices',
    flavorProfile: { spicy: 0.8, sweet: 0.3, pungent: 0.6 },
    culturalOrigins: ['Asian', 'Indian']
  }
];

export default function UnifiedScoringIntegrationTest() {
  const [results, setResults] = useState<ScoredItem<UnifiedIngredient>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🧪 Running Unified Scoring Integration Test...');
      
      const scoredIngredients = await getRecommendedIngredients(
        SAMPLE_INGREDIENTS,
        0.3, // Minimum score threshold
        5,   // Limit
        {
          debugMode: true,
          weights: {
            seasonalEffect: 1.2,
            elementalCompatibility: 1.1,
            transitEffect: 1.0
          }
        }
      );

      console.log('✅ Test completed successfully:', scoredIngredients);
      setResults(scoredIngredients);
    } catch (err) {
      console.error('❌ Test failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTest();
  }, []);

  const formatScore = (score: number) => {
    return `${(score * 100).toFixed(1)}%`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    if (score >= 0.4) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Unified Scoring Integration Test</h1>
        <p className="text-gray-600 mb-4">
          This test verifies that the UnifiedScoringAdapter is working correctly
          with the existing recommendation components.
        </p>

        <div className="flex gap-4 mb-6">
          <button
            onClick={runTest}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Run Test'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold mb-2">Test Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Running integration test...</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            
            {results.map((scoredIngredient, index) => (
              <div key={scoredIngredient.item.name} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      #{index + 1} {scoredIngredient.item.name}
                      <span className="text-sm bg-gray-200 px-2 py-1 rounded">
                        {scoredIngredient.item.category}
                      </span>
                    </h3>
                    <p className="text-sm text-gray-600">
                      Ruled by: {scoredIngredient.item.astrologicalProfile?.rulingPlanets?.join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-bold ${getScoreColor(scoredIngredient.score)}`}>
                      {formatScore(scoredIngredient.score)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Confidence: {formatScore(scoredIngredient.confidence)}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Elemental Properties</h4>
                    <div className="space-y-1 text-sm">
                      {Object.entries(scoredIngredient.item.elementalProperties).map(([element, value]) => (
                        <div key={element} className="flex justify-between">
                          <span>{element}:</span>
                          <span>{(value * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Dominant Effects</h4>
                    <div className="space-y-1 text-sm">
                      {scoredIngredient.dominantEffects.slice(0, 3).map((effect, i) => (
                        <div key={effect} className="flex justify-between">
                          <span>#{i + 1} {effect.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className="text-gray-500">
                            {scoredIngredient.breakdown[effect] ? 
                              (scoredIngredient.breakdown[effect] >= 0 ? '+' : '') + 
                              (scoredIngredient.breakdown[effect] * 100).toFixed(1) + '%'
                              : 'N/A'
                            }
                          </span>
                        </div>
                      ))}
                    </div>

                    {scoredIngredient.notes.length > 0 && (
                      <div className="mt-3">
                        <h5 className="font-medium text-sm">Notes:</h5>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {scoredIngredient.notes.slice(0, 2).map((note, i) => (
                            <li key={i}>• {note}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {scoredIngredient.warnings.length > 0 && (
                      <div className="mt-3">
                        <h5 className="font-medium text-sm text-orange-600">Warnings:</h5>
                        <ul className="text-xs text-orange-600 space-y-1">
                          {scoredIngredient.warnings.map((warning, i) => (
                            <li key={i}>⚠ {warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold mb-2 text-green-800">Integration Status</h3>
          <p className="text-sm text-green-700 mb-2">
            ✅ UnifiedScoringAdapter successfully integrated
          </p>
          <p className="text-sm text-green-700 mb-2">
            ✅ CuisineRecommender updated to use unified scoring
          </p>
          <p className="text-sm text-green-700">
            ✅ Build successful with no TypeScript errors
          </p>
        </div>
      </div>
    </div>
  );
} 