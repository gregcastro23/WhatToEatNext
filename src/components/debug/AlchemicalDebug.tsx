'use client';

import React, { useEffect, useState } from 'react';
import { useAlchemical } from '../../contexts/AlchemicalContext/hooks';
import { testCookingMethodRecommendations } from '../../utils/testRecommendations';

interface AlchemicalItem {
  name: string;
  element: string;
  elementalCharacter: string;
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
  water: number;
  fire: number;
  earth: number;
  air: number;
  [key: string]: any;
}

interface TestResult {
  ingredient: AlchemicalItem;
  holisticRecommendations: Array<{ method: string, compatibility: number, reason: string }>;
  standardRecommendations: Array<{ method: string, compatibility: number }>;
}

interface AlchemicalToken {
  name: string;
  value: number;
  description: string;
  color: string;
}

/**
 * Enhanced AlchemicalDebug - A comprehensive debugging component for the alchemical system
 */
const AlchemicalDebug: React.FC = () => {
  const { state } = useAlchemical();
  const [testResults, setTestResults] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'test' | 'tokens' | 'elements'>('overview');
  const [historyData, setHistoryData] = useState<Array<{
    timestamp: number;
    elementalState: Record<string, number>;
    alchemicalValues: Record<string, number>;
  }>>([]);

  // Define alchemical tokens with descriptions
  const alchemicalTokens: AlchemicalToken[] = [
    {
      name: 'Spirit',
      value: state?.alchemicalValues?.Spirit || 0,
      description: 'Represents the essence of life force and consciousness',
      color: 'bg-purple-500'
    },
    {
      name: 'Essence',
      value: state?.alchemicalValues?.Essence || 0,
      description: 'The refined extract that contains core properties',
      color: 'bg-blue-500'
    },
    {
      name: 'Matter',
      value: state?.alchemicalValues?.Matter || 0,
      description: 'Physical substance and material components',
      color: 'bg-green-500'
    },
    {
      name: 'Substance',
      value: state?.alchemicalValues?.Substance || 0,
      description: 'The medium through which transformations occur',
      color: 'bg-amber-500'
    }
  ];

  // Track state history for visualizing changes
  useEffect(() => {
    if (state?.elementalState && state?.alchemicalValues) {
      const newEntry = {
        timestamp: Date.now(),
        elementalState: { ...state.elementalState },
        alchemicalValues: { ...state.alchemicalValues }
      };
      
      setHistoryData(prev => {
        // Keep only the last 20 entries
        const newHistory = [...prev, newEntry];
        if (newHistory.length > 20) {
          return newHistory.slice(-20);
        }
        return newHistory;
      });
    }
  }, [state]);

  const runTest = () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Running cooking method recommendations test...');
      const results = testCookingMethodRecommendations();
      setTestResults(results);
      console.log('Test complete, results:', results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Test failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format relative time
  const formatTimeAgo = (timestamp: number | Date) => {
    const timestampMs = timestamp instanceof Date ? timestamp.getTime() : timestamp;
    const seconds = Math.floor((Date.now() - timestampMs) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  // Render a progress bar
  const renderProgressBar = (value: number, color: string) => {
    const percentage = Math.min(Math.max(value * 100, 0), 100);
    return (
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  // Calculate the dominant element
  const getDominantElement = () => {
    if (!state?.elementalState) return null;
    
    const elements = Object.entries(state.elementalState)
      .sort(([_, a], [__, b]) => b - a);
    
    if (elements.length === 0) return null;
    
    return {
      name: elements[0][0],
      value: elements[0][1]
    };
  };

  // Calculate the dominant alchemical token
  const getDominantToken = () => {
    if (!state?.alchemicalValues) return null;
    
    const tokens = Object.entries(state.alchemicalValues)
      .sort(([_, a], [__, b]) => b - a);
    
    if (tokens.length === 0) return null;
    
    return {
      name: tokens[0][0],
      value: tokens[0][1]
    };
  };

  // Render the overview tab
  const renderOverviewTab = () => {
    const dominantElement = getDominantElement();
    const dominantToken = getDominantToken();

  return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Current Alchemical State */}
          <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-3 dark:text-gray-200">Current Alchemical State</h3>
            
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Dominant Element</span>
                <span className="text-sm">{dominantElement ? `${dominantElement.name} (${(dominantElement.value * 100).toFixed(1)}%)` : 'None'}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Dominant Token</span>
                <span className="text-sm">{dominantToken ? `${dominantToken.name} (${dominantToken.value.toFixed(3)})` : 'None'}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Calculation Time</span>
                <span className="text-sm">{state?.lastUpdated ? formatTimeAgo(state.lastUpdated) : 'Unknown'}</span>
              </div>
            </div>
            
            {/* Elemental Balance */}
            <h4 className="font-medium mb-2 text-sm">Elemental Balance</h4>
            <div className="space-y-2 mb-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-red-500">Fire</span>
                  <span className="text-xs">{((state?.elementalState?.Fire || 0) * 100).toFixed(1)}%</span>
                </div>
                {renderProgressBar(state?.elementalState?.Fire || 0, 'bg-red-500')}
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-blue-500">Water</span>
                  <span className="text-xs">{((state?.elementalState?.Water || 0) * 100).toFixed(1)}%</span>
                </div>
                {renderProgressBar(state?.elementalState?.Water || 0, 'bg-blue-500')}
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-green-500">Earth</span>
                  <span className="text-xs">{((state?.elementalState?.Earth || 0) * 100).toFixed(1)}%</span>
                </div>
                {renderProgressBar(state?.elementalState?.Earth || 0, 'bg-green-500')}
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-purple-500">Air</span>
                  <span className="text-xs">{((state?.elementalState?.Air || 0) * 100).toFixed(1)}%</span>
                </div>
                {renderProgressBar(state?.elementalState?.Air || 0, 'bg-purple-500')}
              </div>
            </div>
            
            {/* Alchemical Tokens */}
            <h4 className="font-medium mb-2 text-sm">Alchemical Tokens</h4>
            <div className="space-y-2">
              {alchemicalTokens.map(token => (
                <div key={token.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{token.name}</span>
                    <span className="text-xs">{token.value.toFixed(4)}</span>
                  </div>
                  {renderProgressBar(token.value, token.color)}
                </div>
              ))}
            </div>
          </div>
          
          {/* Current Environment Factors */}
          <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-3 dark:text-gray-200">Environment Factors</h3>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
              <div className="text-sm font-medium">Time of Day:</div>
              <div className="text-sm">{state?.timeOfDay || 'Unknown'}</div>
              
              <div className="text-sm font-medium">Season:</div>
              <div className="text-sm">{state?.currentSeason || 'Unknown'}</div>
              
              <div className="text-sm font-medium">Lunar Phase:</div>
              <div className="text-sm">{state?.lunarPhase || 'Unknown'}</div>
              
              <div className="text-sm font-medium">Planetary Hour:</div>
              <div className="text-sm">{state?.astrologicalState?.planetaryHour || 'Unknown'}</div>
            </div>
            
            <h4 className="font-medium mb-2 text-sm">Astrological Influences</h4>
            <div className="text-xs space-y-1">
              {state?.astrologicalState?.activePlanets && state.astrologicalState.activePlanets.length > 0 ? (
                <ul className="list-disc list-inside">
                  {state.astrologicalState.activePlanets.map((planet: string | any) => (
                    <li key={typeof planet === 'string' ? planet : String(planet)}>
                      {typeof planet === 'string' ? planet : 
                       (typeof planet === 'object' && planet && 'name' in planet) ? planet.name : String(planet)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No astrological influences detected</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => console.log('Full State:', state)}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Log State to Console
          </button>
          <button
            onClick={runTest}
            className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
          >
            Run Test Recommendations
          </button>
        </div>
      </div>
    );
  };

  // Render the test results tab
  const renderTestTab = () => {
    return (
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-4">
      <div className="mb-4">
        <button 
          onClick={runTest}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-50"
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
      
      {testResults && (
        <div className="mt-4">
            <h3 className="text-lg font-bold mb-2 dark:text-gray-200">Test Results</h3>
          
            <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-600 rounded">
            <h4 className="font-bold">Ingredient: {testResults.ingredient.name}</h4>
              <p><span className="font-medium">Element:</span> {testResults.ingredient.element}</p>
              <p><span className="font-medium">Elemental Character:</span> {testResults.ingredient.elementalCharacter}</p>
          </div>
          
          <div className="mb-4">
            <h4 className="font-bold">Holistic Recommendations:</h4>
              <div className="mt-2 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-500">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Method</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Compatibility</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
              {testResults.holisticRecommendations.map((rec, index) => (
                      <tr key={`holistic-${index}`} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : ''}>
                        <td className="px-3 py-2 text-sm whitespace-nowrap">{rec.method}</td>
                        <td className="px-3 py-2 text-sm whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-2 bg-gray-200 dark:bg-gray-600 mr-2 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500" 
                                style={{ width: `${Math.round(rec.compatibility)}%` }}
                              ></div>
                            </div>
                            <span>{Math.round(rec.compatibility)}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-sm">{rec.reason}</td>
                      </tr>
              ))}
                  </tbody>
                </table>
              </div>
          </div>
          
          <div className="mb-4">
            <h4 className="font-bold">Standard Recommendations:</h4>
              <div className="mt-2 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-500">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Method</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Compatibility</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
              {testResults.standardRecommendations.map((rec, index) => (
                      <tr key={`standard-${index}`} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : ''}>
                        <td className="px-3 py-2 text-sm whitespace-nowrap">{rec.method}</td>
                        <td className="px-3 py-2 text-sm whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-2 bg-gray-200 dark:bg-gray-600 mr-2 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-500" 
                                style={{ width: `${Math.round(rec.compatibility)}%` }}
                              ></div>
                            </div>
                            <span>{Math.round(rec.compatibility)}%</span>
                          </div>
                        </td>
                      </tr>
              ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render the tokens tab with detailed information
  const renderTokensTab = () => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alchemicalTokens.map(token => (
            <div key={token.name} className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium dark:text-gray-200">{token.name}</h3>
                <span className="text-sm font-mono bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                  {token.value.toFixed(4)}
                </span>
              </div>
              
              {renderProgressBar(token.value, token.color)}
              
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{token.description}</p>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Value History</h4>
                <div className="h-24 relative bg-gray-100 dark:bg-gray-600 rounded">
                  {historyData.length > 1 && (
                    <svg className="w-full h-full" viewBox={`0 0 ${historyData.length - 1} 100`} preserveAspectRatio="none">
                      <polyline
                        points={historyData.map((entry, i) => {
                          const value = entry.alchemicalValues[token.name] || 0;
                          return `${i}, ${100 - (value * 100)}`;
                        }).join(' ')}
                        stroke={token.color.replace('bg-', 'stroke-')}
                        strokeWidth="2"
                        fill="none"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render the elements tab with detailed information
  const renderElementsTab = () => {
    const elements = [
      { name: 'Fire', color: 'bg-red-500', textColor: 'text-red-500' },
      { name: 'Water', color: 'bg-blue-500', textColor: 'text-blue-500' },
      { name: 'Earth', color: 'bg-green-500', textColor: 'text-green-500' },
      { name: 'Air', color: 'bg-purple-500', textColor: 'text-purple-500' }
    ];
    
    return (
      <div className="space-y-4">
        <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-3 dark:text-gray-200">Elemental Analysis</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {elements.map(element => (
              <div key={element.name} className="p-3 border rounded">
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-medium ${element.textColor}`}>{element.name}</span>
                  <span className="text-sm">{((state?.elementalState?.[element.name] || 0) * 100).toFixed(1)}%</span>
                </div>
                {renderProgressBar(state?.elementalState?.[element.name] || 0, element.color)}
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <h4 className="font-medium mb-2">Historical Balance</h4>
            <div className="h-40 relative bg-gray-100 dark:bg-gray-600 rounded">
              {historyData.length > 1 && (
                <svg className="w-full h-full" viewBox={`0 0 ${historyData.length - 1} 100`} preserveAspectRatio="none">
                  {elements.map(element => (
                    <polyline
                      key={element.name}
                      points={historyData.map((entry, i) => {
                        const value = entry.elementalState[element.name] || 0;
                        return `${i}, ${100 - (value * 100)}`;
                      }).join(' ')}
                      stroke={element.color.replace('bg-', 'stroke-')}
                      strokeWidth="2"
                      fill="none"
                    />
                  ))}
                </svg>
              )}
            </div>
            <div className="flex justify-center mt-2 space-x-4">
              {elements.map(element => (
                <div key={element.name} className="flex items-center">
                  <span className={`inline-block w-3 h-3 ${element.color} rounded-full mr-1`}></span>
                  <span className="text-xs">{element.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold dark:text-white">Alchemical Debugger</h2>
        
        <div className="flex space-x-1">
          <button 
            onClick={() => setHistoryData([])}
            className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Clear History
          </button>
        </div>
      </div>
      
      {/* Navigation tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'overview' 
              ? 'border-b-2 border-blue-500 text-blue-500' 
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'test' 
              ? 'border-b-2 border-blue-500 text-blue-500' 
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
          onClick={() => setActiveTab('test')}
        >
          Test Results
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'tokens' 
              ? 'border-b-2 border-blue-500 text-blue-500' 
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
          onClick={() => setActiveTab('tokens')}
        >
          Tokens
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'elements' 
              ? 'border-b-2 border-blue-500 text-blue-500' 
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
          onClick={() => setActiveTab('elements')}
        >
          Elements
        </button>
      </div>
      
      {/* Tab content */}
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'test' && renderTestTab()}
      {activeTab === 'tokens' && renderTokensTab()}
      {activeTab === 'elements' && renderElementsTab()}
    </div>
  );
};

export default AlchemicalDebug; 