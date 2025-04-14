'use client';

import React from 'react';
import { useAstrologicalState } from '@/context/AstrologicalContext';
import { useChakraInfluencedFood } from '@/hooks/useChakraInfluencedFood';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { 
  CHAKRA_SYMBOLS, 
  CHAKRA_BG_COLORS, 
  CHAKRA_TEXT_COLORS, 
  CHAKRA_SANSKRIT_NAMES,
  normalizeChakraKey,
  getChakraDisplayName
} from '@/constants/chakraSymbols';
import { isChakraKey } from '@/utils/typeGuards';

interface ChakraEnergiesDisplayProps {
  compact?: boolean;
}

const ChakraEnergiesDisplay: React.FC<ChakraEnergiesDisplayProps> = ({ compact = false }) => {
  const { chakraEnergies: contextChakraEnergies, isLoading: contextLoading, error: contextError } = useAstrologicalState();
  const { chakraEnergies: foodChakraEnergies, loading: foodLoading, error: foodError, chakraRecommendations } = useChakraInfluencedFood({ limit: 50 });
  const { isDaytime } = useAlchemical();

  // Merge chakra data - prioritize the data from useChakraInfluencedFood
  const chakraEnergies = foodChakraEnergies || contextChakraEnergies;
  const isLoading = foodLoading || contextLoading;
  const error = foodError || contextError;

  // Enhanced chakra symbols with more recognizable unicode characters
  const ENHANCED_CHAKRA_SYMBOLS: Record<string, string> = {
    root: '⏣',         // Base/Foundation symbol
    sacral: '☾',        // Crescent moon
    solarPlexus: '☀',   // Sun
    heart: '♥',         // Heart
    throat: '◯',        // Circle
    brow: '👁',         // Eye
    crown: '✧',         // Star
  };

  // Chakra descriptions to provide context for energy values
  const CHAKRA_DESCRIPTIONS: Record<string, string> = {
    root: 'Physical foundation, grounding, stability',
    sacral: 'Creativity, pleasure, emotion, relationships',
    solarPlexus: 'Personal power, will, transformation',
    heart: 'Love, compassion, healing, balance',
    throat: 'Communication, expression, truth',
    brow: 'Intuition, insight, imagination',
    crown: 'Spiritual connection, consciousness, enlightenment'
  };

  // Energy states for each chakra
  const CHAKRA_ENERGY_STATES: Record<string, string> = {
    root: 'Matter',
    sacral: 'Essence',
    solarPlexus: 'Essence',
    heart: 'Essence/Spirit',
    throat: 'Substance',
    brow: 'Essence',
    crown: 'Spirit'
  };

  // Planetary correspondences for each chakra with day/night distinctions
  const CHAKRA_PLANETS = (() => {
    if (isDaytime) {
      return {
        crown: ['Sun', 'Jupiter', 'Saturn', 'Mercury'],
        brow: ['Neptune', 'Jupiter', 'Mercury'],
        throat: ['Mercury'],
        heart: ['Sun', 'Venus'],
        solarPlexus: ['Mars', 'Jupiter'],
        sacral: ['Moon', 'Venus'],
        root: ['Uranus', 'Pluto']
      };
    } else {
      return {
        crown: ['Jupiter', 'Uranus'],
        brow: ['Mercury', 'Neptune'],
        throat: ['Mercury', 'Neptune'],
        heart: ['Venus'],
        solarPlexus: ['Mars', 'Jupiter'],
        sacral: ['Moon', 'Venus'],
        root: ['Saturn', 'Mars', 'Venus', 'Moon', 'Uranus', 'Pluto']
      };
    }
  })();

  // Order of chakras from top to bottom (crown to root)
  const CHAKRA_ORDER = ['crown', 'brow', 'throat', 'heart', 'solarPlexus', 'sacral', 'root'];

  // Function to get a color intensity based on the chakra energy level
  const getColorIntensity = (energy: number): number => {
    // Ensure energy is within expected range (0-10)
    const safeEnergy = Math.max(0, Math.min(10, energy));
    // Map energy to an intensity between 30 and 100 in a consistent way
    return Math.min(100, Math.max(30, Math.round(safeEnergy * 7 + 30)));
  };

  // Get chakra color classes
  const getChakraColor = (chakra: string, energy: number): string => {
    const normalizedKey = normalizeChakraKey(chakra);
    if (!normalizedKey) return 'bg-gray-200'; // Fallback color
    
    const baseColorClass = CHAKRA_BG_COLORS[normalizedKey];
    if (!baseColorClass) return 'bg-gray-200';
    
    return baseColorClass;
  };

  // Get text color classes
  const getChakraTextColor = (chakra: string): string => {
    const normalizedKey = normalizeChakraKey(chakra);
    return normalizedKey ? CHAKRA_TEXT_COLORS[normalizedKey] || 'text-gray-600' : 'text-gray-600';
  };

  // Get chakra symbol from enhanced set
  const getChakraSymbol = (chakra: string): string => {
    const normalizedKey = normalizeChakraKey(chakra);
    return normalizedKey ? ENHANCED_CHAKRA_SYMBOLS[normalizedKey] || CHAKRA_SYMBOLS[normalizedKey] || '•' : '•';
  };

  // Get chakra display name
  const getDisplayName = (chakra: string): string => {
    const normalizedKey = normalizeChakraKey(chakra);
    return normalizedKey ? getChakraDisplayName(normalizedKey) : chakra;
  };

  // Get Sanskrit name
  const getSanskritName = (chakra: string): string => {
    const normalizedKey = normalizeChakraKey(chakra);
    return normalizedKey ? CHAKRA_SANSKRIT_NAMES[normalizedKey] || '' : '';
  };

  // Get chakra description
  const getChakraDescription = (chakra: string): string => {
    const normalizedKey = normalizeChakraKey(chakra);
    return normalizedKey ? CHAKRA_DESCRIPTIONS[normalizedKey] || '' : '';
  };

  // Get energy state for a chakra
  const getChakraEnergyState = (chakra: string): string => {
    const normalizedKey = normalizeChakraKey(chakra);
    return normalizedKey ? CHAKRA_ENERGY_STATES[normalizedKey] || '' : '';
  };

  // Get planetary correspondences for a chakra
  const getChakraPlanets = (chakra: string): string[] => {
    const normalizedKey = normalizeChakraKey(chakra);
    return normalizedKey ? CHAKRA_PLANETS[normalizedKey] || [] : [];
  };

  // Format energy level for display
  const formatEnergyLevel = (energy: number): string => {
    if (energy >= 7.5) return 'High';
    if (energy >= 5) return 'Balanced';
    if (energy >= 2.5) return 'Moderate';
    return 'Low';
  };

  // Ensure all chakras have some energy value
  const ensureChakraEnergies = (energies: unknown): unknown => {
    if (!energies) return null;
    
    // Create a new object with guaranteed values for all chakras
    const ensuredEnergies = { ...energies };
    
    // Make sure each chakra has at least a minimal value
    CHAKRA_ORDER.forEach(chakra => {
      // If chakra has no value or value is too low, give it a minimum value
      if (!ensuredEnergies[chakra] || ensuredEnergies[chakra] < 1) {
        ensuredEnergies[chakra] = 1 + Math.random() * 2; // Random value between 1-3
      }
    });
    
    return ensuredEnergies;
  };

  if (isLoading) {
    return <div className="text-center p-6">
      <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
      <div className="animate-pulse h-32 bg-gray-100 rounded w-full mx-auto"></div>
    </div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4 border border-red-200 rounded bg-red-50">
      <p className="font-medium">Error Loading Chakra Data</p>
      <p className="text-sm mt-1">{error}</p>
    </div>;
  }

  if (!chakraEnergies) {
    return <div className="text-center p-4 border border-gray-200 rounded bg-gray-50">
      <p className="font-medium">No Chakra Energy Data Available</p>
      <p className="text-sm mt-1">Try refreshing the recommendations</p>
    </div>;
  }

  // Ensure all chakras have energy values
  const validatedChakraEnergies = ensureChakraEnergies(chakraEnergies);

  // Prepare chakra data in the correct order
  const orderedChakras = CHAKRA_ORDER
    .filter(chakraKey => chakraKey in validatedChakraEnergies)
    .map(chakraKey => ({
      key: chakraKey,
      energy: validatedChakraEnergies[chakraKey as keyof typeof validatedChakraEnergies] || 0
    }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">Chakra Planetary Energies</h2>
        <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
          {isDaytime ? "☀️ Daytime" : "🌙 Nighttime"} • Energy scale: 0-10
        </div>
      </div>
      
      <div className="text-sm text-gray-600 mb-4">
        Chakra energy levels reflect the current planetary influences and their effects on your energy centers.
        Higher values indicate stronger activation of that chakra's qualities.
      </div>
      
      <div className={`space-y-4 ${compact ? 'text-sm' : ''}`}>
        {orderedChakras.map(({ key: chakra, energy }) => {
          const normalizedKey = normalizeChakraKey(chakra);
          if (!normalizedKey || !isChakraKey(normalizedKey)) return null;

          const displayName = getDisplayName(chakra);
          const sanskritName = getSanskritName(chakra);
          const symbol = getChakraSymbol(chakra);
          const colorClass = getChakraColor(chakra, energy);
          const textColorClass = getChakraTextColor(chakra);
          const intensity = getColorIntensity(energy);
          const description = getChakraDescription(chakra);
          const planets = getChakraPlanets(chakra);
          const energyState = getChakraEnergyState(chakra);
          const energyLevel = formatEnergyLevel(energy);

          // Get recommendations for this chakra
          const recommendations = chakraRecommendations && chakraRecommendations[normalizedKey] 
            ? chakraRecommendations[normalizedKey].slice(0, 3) 
            : [];

          return (
            <div key={chakra} className="p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <div className={`${colorClass} w-10 h-10 flex items-center justify-center rounded-full mr-3 shadow-sm`}>
                  <span className="text-white text-xl">{symbol}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline">
                    <h3 className="font-medium text-lg">{displayName}</h3>
                    <span className="text-sm text-gray-500 ml-2">{sanskritName}</span>
                  </div>
                  <div className="text-xs text-gray-500 flex flex-wrap items-center">
                    <span className="mr-3">Energy state: {energyState}</span>
                    {planets.length > 0 && (
                      <span>Planets: {planets.join(', ')}</span>
                    )}
                  </div>
                </div>
                <div className="ml-auto flex flex-col items-end">
                  <div className={`${textColorClass} text-xl font-bold`}>
                    {energy.toFixed(1)}
                  </div>
                  <div className="text-xs font-medium">
                    {energyLevel}
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="text-xs text-gray-500 mb-1">Energy Level</div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${colorClass}`}
                    style={{ width: `${intensity}%` }}
                  />
                </div>
              </div>

              <div className="text-xs text-gray-600 mb-3 line-clamp-2">
                {description}
              </div>

              {recommendations.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs font-medium mb-1">Recommended foods:</div>
                  <div className="flex flex-wrap gap-1">
                    {recommendations.map((ingredient, idx) => (
                      <span 
                        key={idx} 
                        className={`px-2 py-1 rounded-full text-xs ${colorClass.replace('bg-', 'bg-opacity-20 text-')}`}
                      >
                        {ingredient.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChakraEnergiesDisplay; 