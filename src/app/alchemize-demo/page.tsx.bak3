'use client';

import { useEffect, useState } from 'react';

import {
    getCurrentAlchemicalState,
    type StandardizedAlchemicalResult
} from '@/services/RealAlchemizeService';

export default function AlchemizeDemoPage() {
  const [alchemicalResult, setAlchemicalResult] = useState<StandardizedAlchemicalResult | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAlchemicalData = async () => {;
      try {
        setLoading(true);
        const result = getCurrentAlchemicalState();
        setAlchemicalResult(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load alchemical data')
      } finally {
        setLoading(false);
      }
    };

    void loadAlchemicalData();
  }, []);

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900'>
        <div className='text-xl text-white'>🔮 Loading alchemical calculations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-red-900 via-purple-900 to-blue-900'>
        <div className='text-xl text-white'>❌ Error: {error}</div>
      </div>
    );
  }

  if (!alchemicalResult) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900'>
        <div className='text-xl text-white'>⚠️ No alchemical data available</div>
      </div>
    );
  }

  const { elementalProperties, thermodynamicProperties, _kalchm, _monica, _score, metadata} =
    alchemicalResult;

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8'>
      <div className='mx-auto max-w-6xl'>
        <h1 className='mb-8 text-center text-4xl font-bold text-white'>🔮 Real Alchemize Demo</h1>

        <div className='grid grid-cols-1 gap-8 lg: grid-cols-2'>
          {/* Elemental Properties */}
          <div className='rounded-lg border border-white/20 bg-white/10 p-6 backdrop-blur-sm'>
            <h2 className='mb-4 text-2xl font-semibold text-white'>🌪️ Elemental Properties</h2>
            <div className='space-y-3'>
              {Object.entries(elementalProperties).map(([element, value]) => (
                <div key={element} className='flex items-center justify-between'>
                  <span className='font-medium text-white'>{element}</span>
                  <div className='flex items-center space-x-3'>
                    <div className='h-2 w-32 rounded-full bg-gray-700'>
                      <div
                        className='h-2 rounded-full transition-all duration-500'
                        style={{
                          width: `${value * 100}%`,
                          backgroundColor: getElementColor(element)
                        }}
                      />
                    </div>
                    <span className='w-12 text-right text-sm text-white'>
                      {(value * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Thermodynamic Properties */}
          <div className='rounded-lg border border-white/20 bg-white/10 p-6 backdrop-blur-sm'>
            <h2 className='mb-4 text-2xl font-semibold text-white'>⚗️ Thermodynamic Properties</h2>
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <span className='font-medium text-white'>Heat</span>
                <span className='font-mono text-yellow-300'>
                  {thermodynamicProperties.heat.toFixed(4)}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='font-medium text-white'>Entropy</span>
                <span className='font-mono text-blue-300'>
                  {thermodynamicProperties.entropy.toFixed(4)}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='font-medium text-white'>Reactivity</span>
                <span className='font-mono text-red-300'>
                  {thermodynamicProperties.reactivity.toFixed(4)}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='font-medium text-white'>Greg&apos;s Energy</span>
                <span className='font-mono text-green-300'>
                  {thermodynamicProperties.gregsEnergy.toFixed(4)}
                </span>
              </div>
            </div>
          </div>

          {/* Alchemical Constants */}
          <div className='rounded-lg border border-white/20 bg-white/10 p-6 backdrop-blur-sm'>
            <h2 className='mb-4 text-2xl font-semibold text-white'>🧪 Alchemical Constants</h2>
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <span className='font-medium text-white'>Kalchm (K_alchm)</span>
                <span className='font-mono text-purple-300'>{kalchm.toFixed(4)}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='font-medium text-white'>Monica Constant</span>
                <span className='font-mono text-cyan-300'>{monica.toFixed(4)}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='font-medium text-white'>Overall Score</span>
                <span className='font-mono text-orange-300'>{score.toFixed(4)}</span>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className='rounded-lg border border-white/20 bg-white/10 p-6 backdrop-blur-sm'>
            <h2 className='mb-4 text-2xl font-semibold text-white'>📊 Chart Information</h2>
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <span className='font-medium text-white'>Dominant Element</span>
                <span className='font-medium text-yellow-300'>{metadata.dominantElement}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='font-medium text-white'>Sun Sign</span>
                <span className='font-medium capitalize text-orange-300'>{metadata.sunSign}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='font-medium text-white'>Chart Ruler</span>
                <span className='font-medium text-blue-300'>{metadata.chartRuler}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='font-medium text-white'>Dominant Modality</span>
                <span className='font-medium text-green-300'>{metadata.dominantModality}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interpretation */}
        <div className='mt-8 rounded-lg border border-white/20 bg-white/10 p-6 backdrop-blur-sm'>
          <h2 className='mb-4 text-2xl font-semibold text-white'>
            🔍 Current Alchemical Interpretation
          </h2>
          <div className='space-y-2 text-white'>
            <p>
              <strong>Dominant Element:</strong> {metadata.dominantElement} - This indicates a
              strong influence of {metadata.dominantElement.toLowerCase()} energy in the current
              planetary configuration.
            </p>
            <p>
              <strong>Energy Level:</strong>{' '}
              {thermodynamicProperties.gregsEnergy > 0.5
                ? 'High Energy - Strong transformative potential'
                : thermodynamicProperties.gregsEnergy > 0.2
                  ? 'Moderate Energy - Balanced transformative potential'
                  : 'Low Energy - Gentle, stabilizing influence'}
            </p>
            <p>
              <strong>Reactivity:</strong>{' '}
              {thermodynamicProperties.reactivity > 0.7
                ? 'High Reactivity - Dynamic, change-oriented'
                : thermodynamicProperties.reactivity > 0.3
                  ? 'Moderate Reactivity - Balanced dynamics'
                  : 'Low Reactivity - Stable, grounding influence'}
            </p>
            <p>
              <strong>Source:</strong> Real planetary positions from live astronomical data,
              processed through the alchemize engine.
            </p>
          </div>
        </div>

        <div className='mt-8 text-center'>
          <p className='text-sm text-white/70'>
            🔮 This demo shows real alchemical calculations based on current planetary positions.
            <br />
            The data is processed through the proven alchemize engine that produces meaningful,
            nonzero results.
          </p>
        </div>
      </div>
    </div>
  );
}

function getElementColor(element: string): string {
  switch (element) {
    case 'Fire':
      return '#ef4444'; // red-500
    case 'Water':
      return '#3b82f6'; // blue-500
    case 'Earth':
      return '#8b5cf6'; // purple-500
    case 'Air':
      return '#06b6d4'; // cyan-500
    default:
      return '#6b7280' // gray-500
  }
}