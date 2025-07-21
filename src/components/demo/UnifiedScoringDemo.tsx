'use client';

import React, { useState, useEffect } from 'react';

import type { Season, Planet } from '@/types/shared';

import { scoreRecommendation, ScoringContext, ScoringResult } from '../../services/UnifiedScoringService';

interface ScoringTestItem {
  name: string;
  type: 'ingredient' | 'recipe' | 'cuisine' | 'cooking_method';
  elementalProperties: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  seasonality?: string[];
  planetaryRulers?: string[];
  description: string;
}

const TEST_ITEMS: ScoringTestItem[] = [
  {
    name: 'Basil',
    type: 'ingredient',
    elementalProperties: { Fire: 0.3, Water: 0.1, Earth: 0.2, Air: 0.4 },
    seasonality: ['summer', 'spring'],
    planetaryRulers: ['Mercury', 'Mars'],
    description: 'Fresh herb with Mercury/Mars ruling and strong Air element'
  },
  {
    name: 'Grilling',
    type: 'cooking_method',
    elementalProperties: { Fire: 0.8, Water: 0.05, Earth: 0.1, Air: 0.05 },
    seasonality: ['summer'],
    planetaryRulers: ['Mars', 'Sun'],
    description: 'High-heat cooking method ruled by Mars and Sun'
  },
  {
    name: 'Mushroom Risotto',
    type: 'recipe',
    elementalProperties: { Fire: 0.2, Water: 0.3, Earth: 0.4, Air: 0.1 },
    seasonality: ['autumn', 'winter'],
    planetaryRulers: ['Moon', 'Saturn'],
    description: 'Earthy comfort food with lunar and saturnine influences'
  },
  {
    name: 'Japanese Cuisine',
    type: 'cuisine',
    elementalProperties: { Fire: 0.15, Water: 0.4, Earth: 0.25, Air: 0.2 },
    seasonality: ['spring', 'summer', 'autumn', 'winter'],
    planetaryRulers: ['Moon', 'Mercury'],
    description: 'Balanced cuisine emphasizing water element and subtle flavors'
  }
];

export default function UnifiedScoringDemo() {
  const [results, setResults] = useState<Array<{ item: ScoringTestItem; result: ScoringResult }>>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: 'America/New_York'
  });
  const [debugMode, setDebugMode] = useState(false);

  const runScoring = async () => {
    setLoading(true);
    setResults([]);

    try {
      const scoringResults = await Promise.all(
        TEST_ITEMS.map(async (item) => {
          const context: ScoringContext = {
            dateTime: new Date(),
            location: {
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
              timezone: selectedLocation.timezone
            },
            item: {
              name: item.name,
              type: item.type,
              elementalProperties: item.elementalProperties,
              seasonality: (item.seasonality || []) as Season[],
              planetaryRulers: (item.planetaryRulers || []) as Planet[],
              flavorProfile: {},
              culturalOrigins: []
            },
            options: {
              debugMode
            }
          };

          const result = await scoreRecommendation(context);
          return { item, result };
        })
      );

      // Sort by score descending
      scoringResults.sort((a, b) => b.result.score - a.result.score);
      setResults(scoringResults);
    } catch (error) {
      console.error('Error running scoring:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runScoring();
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

  const getElementColor = (element: string) => {
    switch (element) {
      case 'Fire': return 'text-red-500';
      case 'Water': return 'text-blue-500';
      case 'Earth': return 'text-green-500';
      case 'Air': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Unified Scoring System Demo</h1>
        <p className="text-gray-600 mb-6">
          This demo showcases the comprehensive scoring system that evaluates culinary recommendations
          based on astrological, alchemical, and contextual factors.
        </p>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Location:</label>
            <select
              value={selectedLocation.timezone}
              onChange={(e) => {
                const locations = {
                  'America/New_York': { latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' },
                  'America/Los_Angeles': { latitude: 34.0522, longitude: -118.2437, timezone: 'America/Los_Angeles' },
                  'Asia/Tokyo': { latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' },
                  'Europe/London': { latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' }
                };
                setSelectedLocation(locations[e.target.value as keyof typeof locations]);
              }}
              className="border rounded px-3 py-1"
            >
              <option value="America/New_York">New York City</option>
              <option value="America/Los_Angeles">Los Angeles</option>
              <option value="Asia/Tokyo">Tokyo</option>
              <option value="Europe/London">London</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">
              <input
                type="checkbox"
                checked={debugMode}
                onChange={(e) => setDebugMode(e.target.checked)}
                className="mr-1"
              />
              Debug Mode
            </label>
          </div>

          <button
            onClick={runScoring}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Scoring...' : 'Run Scoring'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Calculating scores...</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold mb-4">Scoring Results</h2>
          
          {results.map(({ item, result }, index) => (
            <div key={item.name} className="border rounded-lg p-6 bg-white shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    #{index + 1} {item.name}
                    <span className="text-sm bg-gray-200 px-2 py-1 rounded">
                      {item.type.replace('_', ' ')}
                    </span>
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                    {formatScore(result.score)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Confidence: {formatScore(result.confidence)}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Elemental Properties</h4>
                  <div className="space-y-1 text-sm">
                    {Object.entries(item.elementalProperties).map(([element, value]) => (
                      <div key={element} className="flex justify-between">
                        <span className={getElementColor(element)}>{element}:</span>
                        <span>{(value * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                  
                  {item.planetaryRulers && item.planetaryRulers.length > 0 && (
                    <div className="mt-3">
                      <h5 className="font-medium text-sm">Planetary Rulers:</h5>
                      <p className="text-sm text-gray-600">{item.planetaryRulers.join(', ')}</p>
                    </div>
                  )}
                  
                  {item.seasonality && item.seasonality.length > 0 && (
                    <div className="mt-2">
                      <h5 className="font-medium text-sm">Seasonality:</h5>
                      <p className="text-sm text-gray-600">{item.seasonality.join(', ')}</p>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Dominant Effects</h4>
                  <div className="space-y-1 text-sm">
                    {result.metadata.dominantEffects.slice(0, 3).map((effect, i) => (
                      <div key={effect} className="flex justify-between">
                        <span>#{i + 1} {effect.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="text-gray-500">
                          {result.breakdown[effect] ? 
                            (result.breakdown[effect] >= 0 ? '+' : '') + 
                            (result.breakdown[effect] * 100).toFixed(1) + '%'
                            : 'N/A'
                          }
                        </span>
                      </div>
                    ))}
                  </div>

                  {result.notes.length > 0 && (
                    <div className="mt-3">
                      <h5 className="font-medium text-sm">Notes:</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {result.notes.slice(0, 2).map((note, i) => (
                          <li key={i}>• {note}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.metadata.warnings.length > 0 && (
                    <div className="mt-3">
                      <h5 className="font-medium text-sm text-orange-600">Warnings:</h5>
                      <ul className="text-xs text-orange-600 space-y-1">
                        {result.metadata.warnings.map((warning, i) => (
                          <li key={i}>⚠ {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {debugMode && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-600">
                    Debug Information
                  </summary>
                  <div className="mt-2 p-3 bg-gray-50 rounded text-xs">
                    <div className="mb-2">
                      <strong>Full Breakdown:</strong>
                      <pre className="mt-1 text-xs overflow-x-auto">
                        {JSON.stringify(result.breakdown, null, 2)}
                      </pre>
                    </div>
                    <div className="mb-2">
                      <strong>Sources:</strong> {result.sources.join(', ')}
                    </div>
                    <div>
                      <strong>Timestamp:</strong> {result.metadata.timestamp.toISOString()}
                    </div>
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">About the Scoring System</h3>
        <p className="text-sm text-gray-700 mb-2">
          The Unified Scoring System evaluates recommendations based on:
        </p>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• <strong>Elemental Compatibility:</strong> How well item elements align with current astrological state</li>
          <li>• <strong>Transit Effects:</strong> Current planetary movements affecting the item's ruling planets</li>
          <li>• <strong>Seasonal Alignment:</strong> Whether the item is in season</li>
          <li>• <strong>Location Influences:</strong> Geographic planetary effects</li>
          <li>• <strong>Thermodynamic State:</strong> Current alchemical energy levels</li>
          <li>• <strong>And more...</strong> Including lunar phases, planetary dignity, and retrograde effects</li>
        </ul>
      </div>
    </div>
  );
} 