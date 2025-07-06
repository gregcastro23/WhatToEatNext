'use client'

import React, { useEffect, useState } from 'react';
import { useAlchemical } from '../../contexts/AlchemicalContext/hooks';
import { logger } from '../../utils/logger';
import { PlanetaryHourCalculator } from '../../lib/PlanetaryHourCalculator';
import { _calculateLunarPhase, getLunarPhaseName } from '../../utils/astrology/core';
import { testCookingMethodRecommendations } from '../../utils/testRecommendations';

import { _Element } from "@/types/alchemy";
interface TestResult {
  ingredient: { name: string; dominantElement?: string; [key: string]: any };
  holisticRecommendations: Array<{ method: string, compatibility: number, reason?: string }>;
  standardRecommendations: Array<{ method: string, compatibility: number }>;
}

interface UnifiedDebugProps {
  mode?: 'compact' | 'full';
  showTabs?: boolean;
}

export function UnifiedDebug({ mode = 'compact', showTabs = true }: UnifiedDebugProps) {
  const { state, planetaryPositions } = useAlchemical();
  const [mounted, setMounted] = useState(false);
  const [renderCount, setRenderCount] = useState(0);
  const [planetaryHour, setPlanetaryHour] = useState('Unknown');
  const [lunarPhase, setLunarPhase] = useState('Unknown');
  const [activeTab, setActiveTab] = useState<'state' | 'alchemical' | 'cuisine'>('state');
  
  // Alchemical debug states
  const [testResults, setTestResults] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    logger.info('UnifiedDebug mounted');
    
    // Calculate current planetary hour
    try {
      const hourCalculator = new PlanetaryHourCalculator();
      
      if (typeof hourCalculator.getPlanetaryHour === 'function') {
        const currentHour = hourCalculator.getPlanetaryHour(new Date());
        setPlanetaryHour(currentHour.planet || 'Unknown');
      } else if (typeof hourCalculator.calculatePlanetaryHour === 'function') {
        const currentHour = hourCalculator.calculatePlanetaryHour(new Date());
        setPlanetaryHour(String(currentHour) || 'Unknown');
      } else {
        // Fallback to time of day
        const hour = new Date()?.getHours();
        let timeBasedPlanet = 'Sun';
        
        if (hour >= 0 && hour < 3) timeBasedPlanet = 'Saturn';
        else if (hour >= 3 && hour < 6) timeBasedPlanet = 'Jupiter';
        else if (hour >= 6 && hour < 9) timeBasedPlanet = 'Mars';
        else if (hour >= 9 && hour < 12) timeBasedPlanet = 'Sun';
        else if (hour >= 12 && hour < 15) timeBasedPlanet = 'Venus';
        else if (hour >= 15 && hour < 18) timeBasedPlanet = 'Mercury';
        else if (hour >= 18 && hour < 21) timeBasedPlanet = 'Moon';
        else timeBasedPlanet = 'Saturn';
        
        setPlanetaryHour(timeBasedPlanet);
      }
    } catch (error) {
      console.error('Error calculating planetary hour:', error);
      setPlanetaryHour('Unknown');
    }
    
    // Calculate current lunar phase
    try {
      const phaseValue = calculateLunarPhase(new Date());
      
      if (phaseValue instanceof Promise) {
        phaseValue.then(value => {
          const phaseName = getLunarPhaseName(value);
          setLunarPhase(phaseName);
        }).catch(err => {
          console.error('Error calculating lunar phase:', err);
          setLunarPhase('Unknown');
        });
      } else {
        const phaseName = getLunarPhaseName(Number(phaseValue));
        setLunarPhase(phaseName);
      }
    } catch (error) {
      console.error('Error calculating lunar phase:', error);
      setLunarPhase('Unknown');
    }
  }, []);

  useEffect(() => { setRenderCount(prev => prev + 1);
    logger.info('State updated:', {
      currentSeason: state.currentSeason,
      timeOfDay: state.timeOfDay,astrologicalState: state.astrologicalState,
      currentEnergy: state.currentEnergy });
  }, [state]);

  const runAlchemicalTest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Running cooking method recommendations test...');
      const results = await testCookingMethodRecommendations();
      setTestResults(results);
      console.log('Test complete, results:', results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Test failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Extract alchemical values if available
  let spiritValue = 0;
  let essenceValue = 0;
  let matterValue = 0;
  let substanceValue = 0;

  if (state.alchemicalValues) {
    spiritValue = state.alchemicalValues?.Spirit || 0;
    essenceValue = state.alchemicalValues?.Essence || 0;
    matterValue = state.alchemicalValues?.Matter || 0;
    substanceValue = state.alchemicalValues?.Substance || 0;
  }
  
  const tokenSymbol = '⦿';

  const renderStateDebug = () => (
    <div>
      <h4 className="font-bold mb-2">State Debug</h4>
      <div className="space-y-1">
        <p>Mounted: {String(mounted)}</p>
        <p>Renders: {renderCount}</p>
        <p>Current Sign: {(state.astrologicalState?.currentZodiacSign as string) || (state.astrologicalState?.sunSign as string) || 'unknown'}</p>
        <p>Planetary Hour: {planetaryHour}</p>
        <p>Lunar Phase: {lunarPhase}</p>
        <div>
          <p className="font-bold">Alchemical Tokens:</p>
          <ul className="pl-4 space-y-1">
            <li>{tokenSymbol} Spirit: {spiritValue.toFixed(4)}</li>
            <li>{tokenSymbol} Essence: {essenceValue.toFixed(4)}</li>
            <li>{tokenSymbol} Matter: {matterValue.toFixed(4)}</li>
            <li>{tokenSymbol} Substance: {substanceValue.toFixed(4)}</li>
          </ul>
        </div>
        <div>
          <p className="font-bold">Elemental Balance:</p>
          <ul className="pl-4 space-y-1">
            {Object.entries(state.elementalPreference || {}).map(([element, value]) => (
              <li key={element}>{element}: {(value * 100).toFixed(1)}%</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  const renderAlchemicalDebug = () => (
    <div>
      <h4 className="font-bold mb-2">Alchemical Debug</h4>
      
      <div className="mb-4">
        <button 
          onClick={runAlchemicalTest}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-xs"
          disabled={loading}
        >
          {loading ? 'Running Test...' : 'Test Cooking Methods'}
        </button>
      </div>
      
      {error && (
        <div className="p-2 mb-2 bg-red-100 border border-red-300 text-red-800 rounded text-xs">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      {testResults && (
        <div className="space-y-2">
          <div>
            <h5 className="font-bold text-xs">Ingredient: {testResults.ingredient.name}</h5>
            <p className="text-xs">Element: {testResults.ingredient.dominantElement || 'Unknown'}</p>
          </div>
          
          <div>
            <h5 className="font-bold text-xs">Holistic Recommendations:</h5>
            <ul className="list-disc list-inside text-xs space-y-1">
              {testResults.holisticRecommendations?.slice(0, 3)?.map((rec, index) => (
                <li key={`holistic-${index}`}>
                  {rec.method} - {Math.round(rec.compatibility)}%
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  if (mode === 'compact') {
    return (
      <div className="fixed bottom-4 right-4 p-3 bg-black/80 text-white rounded-lg text-xs max-w-sm overflow-auto max-h-96">
        {showTabs ? (
          <>
            <div className="flex mb-2 space-x-2">
              <button
                onClick={() => setActiveTab('state')}
                className={`px-2 py-1 rounded text-xs ${
                  activeTab === 'state' ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                State
              </button>
              <button
                onClick={() => setActiveTab('alchemical')}
                className={`px-2 py-1 rounded text-xs ${
                  activeTab === 'alchemical' ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                Alchemical
              </button>
            </div>
            
            {activeTab === 'state' && renderStateDebug()}
            {activeTab === 'alchemical' && renderAlchemicalDebug()}
          </>
        ) : (
          renderStateDebug()
        )}
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
      <h3 className="text-lg font-bold mb-4">Debug Tools</h3>
      
      {showTabs && (
        <div className="flex mb-4 space-x-2">
          <button
            onClick={() => setActiveTab('state')}
            className={`px-4 py-2 rounded ${
              activeTab === 'state' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            State Debug
          </button>
          <button
            onClick={() => setActiveTab('alchemical')}
            className={`px-4 py-2 rounded ${
              activeTab === 'alchemical' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            Alchemical Debug
          </button>
        </div>
      )}
      
      {activeTab === 'state' && renderStateDebug()}
      {activeTab === 'alchemical' && renderAlchemicalDebug()}
    </div>
  );
}

// Export individual components for backward compatibility

export default UnifiedDebug; 