'use client';

import { Flame, Droplets, Mountain, Wind, RefreshCw, Sparkles } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { AlchemicalProperties } from "@/types/alchemy";

import { useAlchemical } from '../../contexts/AlchemicalContext/hooks';
import styles from '../ElementalEnergyDisplay.module.css';

// Types
interface AlchemicalPropertiesDisplayProps {
  showDebug?: boolean;
}

interface ChakraEnergiesDisplayProps {
  compact?: boolean;
}

interface ElementalEnergyDisplayProps {
  showDebug?: boolean;
}

// Alchemical Properties Display Component
export const AlchemicalPropertiesDisplay: React.FC<AlchemicalPropertiesDisplayProps> = ({ showDebug = false }) => {
  const { state } = useAlchemical();
  const { alchemicalValues = { Spirit: 0.25, Essence: 0.25, Matter: 0.25, Substance: 0.25 } } = state || {};

  // Helper function to format values as decimals instead of percentages
  const formatValue = (value: number = 0) => {
    return value.toFixed(2);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">Alchemical Properties</h3>
      
      {showDebug && (
        <div className="mb-2 p-2 bg-gray-100 rounded text-xs">
          <p>Context state available: {state ? 'Yes' : 'No'}</p>
          <p>Values defined: {alchemicalValues ? 'Yes' : 'No'}</p>
        </div>
      )}
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
            <span className="text-sm">Spirit</span>
          </div>
          <span className="text-sm font-medium">{formatValue(alchemicalValues.Spirit)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
            <span className="text-sm">Essence</span>
          </div>
          <span className="text-sm font-medium">{formatValue(alchemicalValues.Essence)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-amber-600 mr-2"></div>
            <span className="text-sm">Matter</span>
          </div>
          <span className="text-sm font-medium">{formatValue(alchemicalValues.Matter)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
            <span className="text-sm">Substance</span>
          </div>
          <span className="text-sm font-medium">{formatValue(alchemicalValues.Substance)}</span>
        </div>
      </div>
    </div>
  );
};

// Chakra Energies Display Component
export const ChakraEnergiesDisplay: React.FC<ChakraEnergiesDisplayProps> = ({ compact = false }) => {
  const { state } = useAlchemical();
  const chakraEnergies = (state as any)?.chakraEnergies || null;

  const getColorIntensity = (energy: number): number => {
    return Math.min(Math.max(energy * 100, 10), 100);
  };

  const getChakraColor = (chakra: string, energy: number): string => {
    const colors = {
      root: `hsl(0, 70%, ${50 + getColorIntensity(energy) / 4}%)`,
      sacral: `hsl(25, 70%, ${50 + getColorIntensity(energy) / 4}%)`,
      solar: `hsl(50, 70%, ${50 + getColorIntensity(energy) / 4}%)`,
      heart: `hsl(120, 70%, ${50 + getColorIntensity(energy) / 4}%)`,
      throat: `hsl(200, 70%, ${50 + getColorIntensity(energy) / 4}%)`,
      third_eye: `hsl(240, 70%, ${50 + getColorIntensity(energy) / 4}%)`,
      crown: `hsl(280, 70%, ${50 + getColorIntensity(energy) / 4}%)`
    };
    return colors[chakra as keyof typeof colors] || '#888';
  };

  const getChakraSymbol = (chakra: string): string => {
    const symbols = {
      root: '🔴', sacral: '🟠', solar: '🟡',
      heart: '💚', throat: '🔵', third_eye: '🟣', crown: '⚪'
    };
    return symbols[chakra as keyof typeof symbols] || '⚫';
  };

  if (!chakraEnergies) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2">Chakra Energies</h3>
        <p className="text-gray-500">Loading chakra data...</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">Chakra Energies</h3>
      <div className={`grid ${compact ? 'grid-cols-7 gap-2' : 'grid-cols-1 gap-3'}`}>
        {Object.entries(chakraEnergies || {}).map(([chakra, energy]) => (
          <div key={chakra} className={`flex ${compact ? 'flex-col items-center' : 'items-center justify-between'}`}>
            <div className="flex items-center">
              <span className="text-lg mr-2">{getChakraSymbol(chakra)}</span>
              {!compact && <span className="text-sm capitalize">{chakra.replace('_', ' ')}</span>}
            </div>
            <div className={`${compact ? 'w-full mt-1' : 'flex-1 mx-3'}`}>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${getColorIntensity(energy as number)}%`,
                    backgroundColor: getChakraColor(chakra, energy as number)
                  }}
                />
              </div>
            </div>
            {!compact && (
              <span className="text-sm font-medium">{((energy as number) * 100).toFixed(0)}%</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Elemental Energy Display Component
export const ElementalEnergyDisplay: React.FC<ElementalEnergyDisplayProps> = ({ showDebug = false }) => {
  const { state } = useAlchemical();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Mock refresh functionality
      await new Promise(resolve => setTimeout(resolve, 500));
    } finally {
      setIsRefreshing(false);
    }
  };

  const getElementIcon = (element: string) => {
    switch (element) {
      case 'Fire': return <Flame className="w-4 h-4" />;
      case 'Water': return <Droplets className="w-4 h-4" />;
      case 'Earth': return <Mountain className="w-4 h-4" />;
      case 'Air': return <Wind className="w-4 h-4" />;
      // Four element system only - no Aether case
      default: return null;
    }
  };

  const getElementColor = (element: string): string => {
    switch (element) {
      case 'Fire': return '#ef4444';
      case 'Water': return '#06b6d4';
      case 'Earth': return '#84cc16';
      case 'Air': return '#60a5fa';
      // Four element system only - no Aether color
      default: return '#6b7280';
    }
  };

  const formatPercentage = (value: number): string => {
    return `${Math.round(value * 100)}%`;
  };

  if (!state?.elementalState) {
    return (
      <div className={styles.container}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Elemental Energies</h3>
          <p className="text-gray-500">Loading elemental data...</p>
        </div>
      </div>
    );
  }

  const { elementalState, alchemicalValues } = state;
  const thermodynamicMetrics = (state as any)?.thermodynamicMetrics || null;

  return (
    <div className={styles.container}>
      {/* Elemental Section */}
      <div className={styles.elementSection}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={styles.sectionTitle}>Elemental Balance</h3>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={styles.refreshButton}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        <div className={styles.elementBars}>
          {Object.entries(elementalState || {}).filter(([key]) => 
            ['Fire', 'Water', 'Earth', 'Air'].includes(key)
           || []).map(([element, value]) => (
            <div key={element} className={styles.elementBar}>
              <div className={styles.elementLabel}>
                <div className={styles.elementIcon} style={{ color: getElementColor(element) }}>
                  {getElementIcon(element)}
                </div>
                <span>{element}</span>
              </div>
              <div className={styles.barContainer}>
                <div 
                  className={`${styles.barFill} ${styles[`${element?.toLowerCase()}Fill`]}`}
                  style={{ width: formatPercentage(value ) }}
                />
              </div>
              <span className={styles.percentage}>{formatPercentage(value )}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Alchemical Section */}
      {alchemicalValues && (
        <div className={styles.alchemicalSection}>
          <h3 className={styles.sectionTitle}>Alchemical Properties</h3>
          <div className={styles.alchemicalBars}>
            {Object.entries(alchemicalValues || {}).map(([property, value]) => (
              <div key={property} className={styles.alchemicalBar}>
                <div className={styles.alchemicalLabel}>
                  <span>{property}</span>
                </div>
                <div className={styles.barContainer}>
                  <div 
                    className={`${styles.barFill} ${styles[`${property?.toLowerCase()}Fill`]}`}
                    style={{ width: formatPercentage(value ) }}
                  />
                </div>
                <span className={styles.percentage}>{formatPercentage(value )}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Thermodynamic Section */}
      {thermodynamicMetrics && (
        <div className={styles.energySection}>
          <h3 className={styles.sectionTitle}>Thermodynamic Metrics</h3>
          <div className={styles.energyBars}>
            {Object.entries(thermodynamicMetrics || {}).map(([metric, value]) => (
              <div key={metric} className={styles.energyBar}>
                <div className={styles.energyLabel}>
                  <span>{metric}</span>
                </div>
                <div className={styles.barContainer}>
                  <div 
                    className={`${styles.barFill} ${styles[`${metric?.toLowerCase()}Fill`]}`}
                    style={{ width: `${Math.min(Math.abs(value as number) * 100, 100)}%` }}
                  />
                </div>
                <span className={styles.percentage}>{(value as number).toFixed(3)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showDebug && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
          <h4 className="font-semibold mb-2">Debug Info</h4>
          <pre>{JSON.stringify({ elementalState, alchemicalValues, thermodynamicMetrics }, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

// Export default for backward compatibility
export default ElementalEnergyDisplay; 