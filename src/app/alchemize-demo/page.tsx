'use client';

import { useState, useEffect } from 'react';

import { getCurrentAlchemicalState, type StandardizedAlchemicalResult } from '@/services/RealAlchemizeService';

export default function AlchemizeDemoPage() {
  const [alchemicalResult, setAlchemicalResult] = useState<StandardizedAlchemicalResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAlchemicalData = async () => {
      try {
        setLoading(true);
        const result = getCurrentAlchemicalState();
        setAlchemicalResult(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load alchemical data');
      } finally {
        setLoading(false);
      }
    };

    void loadAlchemicalData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">🔮 Loading alchemical calculations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">❌ Error: {error}</div>
      </div>
    );
  }

  if (!alchemicalResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">⚠️ No alchemical data available</div>
      </div>
    );
  }

  const { elementalProperties, thermodynamicProperties, kalchm, monica, score, metadata } = alchemicalResult;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          🔮 Real Alchemize Demo
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Elemental Properties */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-4">🌪️ Elemental Properties</h2>
            <div className="space-y-3">
              {Object.entries(elementalProperties).map(([element, value]) => (
                <div key={element} className="flex justify-between items-center">
                  <span className="text-white font-medium">{element}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${value * 100}%`,
                          backgroundColor: getElementColor(element)
                        }}
                      />
                    </div>
                    <span className="text-white text-sm w-12 text-right">
                      {(value * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Thermodynamic Properties */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-4">⚗️ Thermodynamic Properties</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">Heat</span>
                <span className="text-yellow-300 font-mono">{thermodynamicProperties.heat.toFixed(4)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">Entropy</span>
                <span className="text-blue-300 font-mono">{thermodynamicProperties.entropy.toFixed(4)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">Reactivity</span>
                <span className="text-red-300 font-mono">{thermodynamicProperties.reactivity.toFixed(4)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">Greg's Energy</span>
                <span className="text-green-300 font-mono">{thermodynamicProperties.gregsEnergy.toFixed(4)}</span>
              </div>
            </div>
          </div>

          {/* Alchemical Constants */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-4">🧪 Alchemical Constants</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">Kalchm (K_alchm)</span>
                <span className="text-purple-300 font-mono">{kalchm.toFixed(4)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">Monica Constant</span>
                <span className="text-cyan-300 font-mono">{monica.toFixed(4)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">Overall Score</span>
                <span className="text-orange-300 font-mono">{score.toFixed(4)}</span>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-4">📊 Chart Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">Dominant Element</span>
                <span className="text-yellow-300 font-medium">{metadata.dominantElement}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">Sun Sign</span>
                <span className="text-orange-300 font-medium capitalize">{metadata.sunSign}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">Chart Ruler</span>
                <span className="text-blue-300 font-medium">{metadata.chartRuler}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">Dominant Modality</span>
                <span className="text-green-300 font-medium">{metadata.dominantModality}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interpretation */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-4">🔍 Current Alchemical Interpretation</h2>
          <div className="text-white space-y-2">
            <p>
              <strong>Dominant Element:</strong> {metadata.dominantElement} - This indicates a strong influence of {metadata.dominantElement.toLowerCase()} energy in the current planetary configuration.
            </p>
            <p>
              <strong>Energy Level:</strong> {thermodynamicProperties.gregsEnergy > 0.5 ? 'High Energy - Strong transformative potential' : 
                thermodynamicProperties.gregsEnergy > 0.2 ? 'Moderate Energy - Balanced transformative potential' : 
                'Low Energy - Gentle, stabilizing influence'}
            </p>
            <p>
              <strong>Reactivity:</strong> {thermodynamicProperties.reactivity > 0.7 ? 'High Reactivity - Dynamic, change-oriented' : 
                thermodynamicProperties.reactivity > 0.3 ? 'Moderate Reactivity - Balanced dynamics' : 
                'Low Reactivity - Stable, grounding influence'}
            </p>
            <p>
              <strong>Source:</strong> Real planetary positions from live astronomical data, processed through the alchemize engine.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-white/70 text-sm">
            🔮 This demo shows real alchemical calculations based on current planetary positions.
            <br />
            The data is processed through the proven alchemize engine that produces meaningful, nonzero results.
          </p>
        </div>
      </div>
    </div>
  );
}

function getElementColor(element: string): string {
  switch (element) {
    case 'Fire': return '#ef4444'; // red-500
    case 'Water': return '#3b82f6'; // blue-500
    case 'Earth': return '#8b5cf6'; // purple-500
    case 'Air': return '#06b6d4'; // cyan-500
    default: return '#6b7280'; // gray-500
  }
} 