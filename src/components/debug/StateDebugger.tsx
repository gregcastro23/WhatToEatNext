'use client';

import { useState, useEffect } from 'react';

import { useUnifiedState } from '@/context/UnifiedContext';
import { logger } from '@/utils/logger';

import MoonInfoDisplay from './MoonInfoDisplay';

// Helper to format the timestamp
const formatTimestamp = (date: Date | null) => {
  if (!date) return 'Never';
  return date.toLocaleTimeString();
};

// Helper to copy data to clipboard
const copyToClipboard = async (data: any, label: string) => {
  try {
    const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    await navigator.clipboard.writeText(text);
    logger.info(`Copied ${label} to clipboard`);
    // You could add a toast notification here
  } catch (err) {
    logger.error(`Failed to copy ${label}:`, err);
  }
};

export function StateDebugger() {
  const [isExpanded, setIsExpanded] = useState(true);
  const {
    isLoading,
    error,
    astrologicalData,
    alchemicalData,
    recommendationData,
    lastUpdated,
    refreshData,
  } = useUnifiedState();

  useEffect(() => {
    logger.info('StateDebugger mounted and using UnifiedContext.');
  }, []);

  const sunSign =
    (
      (
        (astrologicalData?._celestialBodies as unknown as Record<string, unknown>).sun as Record<
          string,
          unknown
        >
      ).Sign as Record<string, unknown>
    ).key || 'N/A';
  const chartRuler = alchemicalData?.metadata.chartRuler || 'N/A';
  const dominantElement =
    recommendationData?.dominantElement || alchemicalData?.metadata.dominantElement || 'N/A';

  const statusColor = error ? 'bg-red-800/90' : isLoading ? 'bg-blue-800/90' : 'bg-green-800/90';

  // Safely access nested properties - FIXED to access correct data structure
  const thermodynamics = alchemicalData?.thermodynamicProperties;
  const elementalBalance = alchemicalData?.elementalProperties;
  const kalchm = alchemicalData?.kalchm;
  const monica = alchemicalData?.monica;

  // Extract alchemical tokens from the correct structure
  const alchemicalTokens = {
    spirit: thermodynamics?.heat ? thermodynamics.heat * 0.3 : 0,
    essence: thermodynamics?.entropy ? thermodynamics.entropy * 0.3 : 0,
    matter: thermodynamics?.reactivity ? thermodynamics.reactivity * 0.3 : 0,
    substance: thermodynamics?.gregsEnergy ? Math.abs(thermodynamics.gregsEnergy) * 0.3 : 0,
  };

  return (
    <div
      className={`fixed bottom-4 right-4 ${statusColor} rounded-lg border border-white/20 text-xs text-white shadow-xl transition-all duration-300 ${
        isExpanded ? 'max-w-md p-4' : 'p-2'
      }`}
    >
      <div className='mb-2 flex items-center justify-between'>
        <h3 className='font-bold text-blue-200'>🔮 Unified State Debugger {isLoading && '⏳'}</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className='text-blue-200 transition-colors hover:text-white'
        >
          {isExpanded ? '📉' : '📊'}
        </button>
      </div>

      {isExpanded && (
        <div className='max-h-[80vh] space-y-2 overflow-y-auto'>
          {/* Status Section */}
          <div className='mb-1 flex items-center justify-between'>
            <p className='font-bold text-cyan-200'>API Status:</p>
            <button
              onClick={refreshData}
              disabled={isLoading}
              className='rounded bg-blue-600 px-2 py-1 text-xs transition-colors hover:bg-blue-500 disabled:opacity-50'
            >
              🔄 Refresh
            </button>
          </div>
          <div className='space-y-1 text-xs'>
            <div className='flex justify-between'>
              <span>Last Update:</span>
              <span className='text-cyan-300'>{formatTimestamp(lastUpdated)}</span>
            </div>
            {error && <div className='text-red-300'>Error: {error}</div>}
          </div>

          {/* Core Metrics */}
          <div className='mt-2 rounded bg-purple-900/30 p-2'>
            <p className='mb-1 font-bold text-purple-200'>🌟 Core Metrics:</p>
            <div className='space-y-1 text-xs'>
              <div className='flex justify-between'>
                <span>Sun Sign:</span>
                <span className='font-bold text-purple-300'>{String(sunSign)}</span>
              </div>
              <div className='flex justify-between'>
                <span>Chart Ruler:</span>
                <span className='text-blue-300'>{chartRuler}</span>
              </div>
              <div className='flex justify-between'>
                <span>Dominant Element:</span>
                <span className='text-cyan-300'>{dominantElement}</span>
              </div>
            </div>
          </div>

          {/* Moon Information Display */}
          <div className='mt-3'>
            <MoonInfoDisplay />
          </div>

          {/* Alchemical Tokens (SEMS) */}
          <div className='mt-3 border-t border-white/20 pt-2'>
            <p className='mb-1 font-bold text-yellow-200'>🧪 SEMS - Alchemical Tokens:</p>
            <div className='space-y-1 pl-2'>
              <div className='flex justify-between'>
                <span>⦿ Spirit:</span>
                <span className='text-red-300'>
                  {alchemicalTokens.spirit.toFixed(4) || '0.0000'}
                </span>
              </div>
              <div className='flex justify-between'>
                <span>⦿ Essence:</span>
                <span className='text-blue-300'>
                  {alchemicalTokens.essence.toFixed(4) || '0.0000'}
                </span>
              </div>
              <div className='flex justify-between'>
                <span>⦿ Matter:</span>
                <span className='text-green-300'>
                  {alchemicalTokens.matter.toFixed(4) || '0.0000'}
                </span>
              </div>
              <div className='flex justify-between'>
                <span>⦿ Substance:</span>
                <span className='text-purple-300'>
                  {alchemicalTokens.substance.toFixed(4) || '0.0000'}
                </span>
              </div>
            </div>
          </div>

          {/* Thermodynamic Metrics */}
          <div className='mt-3 border-t border-white/20 pt-2'>
            <p className='mb-1 font-bold text-orange-200'>🔥 Thermodynamic Metrics:</p>
            <div className='space-y-1 pl-2'>
              <div className='flex justify-between'>
                <span>🔥 Heat:</span>
                <span className='text-red-300'>{thermodynamics?.heat.toFixed(4) || '0.0000'}</span>
              </div>
              <div className='flex justify-between'>
                <span>🌀 Entropy:</span>
                <span className='text-cyan-300'>
                  {thermodynamics?.entropy.toFixed(4) || '0.0000'}
                </span>
              </div>
              <div className='flex justify-between'>
                <span>⚡ Reactivity:</span>
                <span className='text-yellow-300'>
                  {thermodynamics?.reactivity.toFixed(4) || '0.0000'}
                </span>
              </div>
              <div className='flex justify-between'>
                <span>💫 Greg's Energy:</span>
                <span className='text-pink-300'>
                  {thermodynamics?.gregsEnergy.toFixed(4) || '0.0000'}
                </span>
              </div>
            </div>
          </div>

          {/* Alchemical Constants */}
          <div className='mt-3 border-t border-yellow-400/40 pt-2'>
            <p className='mb-1 font-bold text-yellow-200'>🧮 Alchemical Constants:</p>
            <div className='space-y-1 pl-2'>
              <div className='flex justify-between'>
                <span>🧮 Kalchm:</span>
                <span className='text-yellow-300'>{kalchm?.toFixed(6) || '1.000000'}</span>
              </div>
              <div className='flex justify-between'>
                <span>👩‍🔬 Monica:</span>
                <span className='text-pink-300'>
                  {isNaN(monica || 0) ? '1.000000' : (monica || 1).toFixed(6)}
                </span>
              </div>
            </div>
          </div>

          {/* Recommendation Engine Output */}
          <div className='mt-3 border-t border-green-400/40 pt-2'>
            <p className='mb-1 font-bold text-green-300'>🎯 Recommendation Engine:</p>
            {recommendationData ? (
              <div className='space-y-1 pl-2 text-xs'>
                <div className='flex justify-between'>
                  <span>Dominant Element:</span>
                  <span className='text-green-200'>{recommendationData.dominantElement}</span>
                </div>
                <p className='mt-2 font-bold'>Recommended Ingredients:</p>
                <ul className='list-inside list-disc text-green-200'>
                  {recommendationData.recommendedIngredients.slice(0, 5).map(ing => (
                    <li key={ing}>{ing}</li>
                  ))}
                </ul>
                <p className='mt-2 font-bold'>Recommended Methods:</p>
                <ul className='list-inside list-disc text-green-200'>
                  {recommendationData.recommendedCookingMethods.slice(0, 3).map(m => (
                    <li key={m.name}>{m.name}</li>
                  ))}
                </ul>
                <p className='mt-2 font-bold'>Warnings:</p>
                <ul className='list-inside list-disc text-yellow-300'>
                  {recommendationData.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className='text-xs text-gray-400'>No recommendation data.</div>
            )}
          </div>

          {/* Raw Data Views with Copy Buttons */}
          <details className='mt-2 border-t border-purple-400/40 pt-2'>
            <summary className='mb-1 flex cursor-pointer items-center justify-between text-xs font-bold text-purple-300'>
              Raw Astrological Data
              <button
                onClick={e => {
                  e.stopPropagation();
                  copyToClipboard(astrologicalData, 'Astrological Data');
                }}
                className='rounded bg-purple-600 px-2 py-1 text-xs transition-colors hover:bg-purple-500'
              >
                📋 Copy
              </button>
            </summary>
            <pre className='max-h-48 overflow-auto rounded bg-black/30 p-1 text-xs'>
              {JSON.stringify(astrologicalData, null, 2)}
            </pre>
          </details>

          <details className='mt-2 border-t border-purple-400/40 pt-2'>
            <summary className='mb-1 flex cursor-pointer items-center justify-between text-xs font-bold text-purple-300'>
              Raw Alchemical Data
              <button
                onClick={e => {
                  e.stopPropagation();
                  copyToClipboard(alchemicalData, 'Alchemical Data');
                }}
                className='rounded bg-purple-600 px-2 py-1 text-xs transition-colors hover:bg-purple-500'
              >
                📋 Copy
              </button>
            </summary>
            <pre className='max-h-48 overflow-auto rounded bg-black/30 p-1 text-xs'>
              {JSON.stringify(alchemicalData, null, 2)}
            </pre>
          </details>

          <details className='mt-2 border-t border-purple-400/40 pt-2'>
            <summary className='mb-1 flex cursor-pointer items-center justify-between text-xs font-bold text-purple-300'>
              Raw Recommendation Data
              <button
                onClick={e => {
                  e.stopPropagation();
                  copyToClipboard(recommendationData, 'Recommendation Data');
                }}
                className='rounded bg-purple-600 px-2 py-1 text-xs transition-colors hover:bg-purple-500'
              >
                📋 Copy
              </button>
            </summary>
            <pre className='max-h-48 overflow-auto rounded bg-black/30 p-1 text-xs'>
              {JSON.stringify(recommendationData, null, 2)}
            </pre>
          </details>

          {/* Quick Copy All Data */}
          <div className='mt-3 border-t border-blue-400/40 pt-2'>
            <button
              onClick={() => {
                const allData = {
                  timestamp: new Date().toISOString(),
                  astrologicalData,
                  alchemicalData,
                  recommendationData,
                  summary: {
                    sunSign,
                    chartRuler,
                    dominantElement,
                    thermodynamics,
                    kalchm,
                    monica,
                  },
                };
                copyToClipboard(allData, 'All Debug Data');
              }}
              className='w-full rounded bg-blue-600 px-3 py-2 text-xs font-bold transition-colors hover:bg-blue-500'
            >
              📋 Copy All Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
