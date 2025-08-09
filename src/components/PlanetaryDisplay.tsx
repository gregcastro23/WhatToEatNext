import React, { useMemo, useCallback } from 'react';

import { PlanetaryPosition } from '@/types/celestial';
import { getTimeFactors, TimeFactors } from '@/types/time';

// Planet symbols lookup
const PLANET_SYMBOLS: { [key: string]: string } = {
  Sun: '☉',
  moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
  NorthNode: '☊',
  SouthNode: '☋',
};

// Planet emojis for time display
const PLANET_EMOJIS: { [key: string]: string } = {
  Sun: '☀️',
  Moon: '🌙',
  Mercury: '☿️',
  Venus: '♀️',
  Mars: '♂️',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '⛢',
  Neptune: '♆',
  Pluto: '♇',
};
interface PlanetaryTimeDisplayProps {
  compact?: boolean;
  className?: string;
}

interface PlanetaryPositionDisplayProps {
  planet: string;
  position: PlanetaryPosition;
}

interface PlanetaryDisplayProps {
  mode: 'position' | 'time' | 'combined';
  // For position mode
  planet?: string;
  position?: PlanetaryPosition;
  // For time mode
  compact?: boolean;
  className?: string;
}

// Helper functions
const formatDegree = (degree: number): string => {
  const wholeDegree = Math.floor(degree);
  const minutes = Math.floor((degree - wholeDegree) * 60);
  return `${wholeDegree}°${minutes}'`;
};

const getPlanetSymbol = (planet: string): string => {
  return PLANET_SYMBOLS[planet.toLowerCase()] || planet;
};

const getPlanetEmoji = (planetName: string): string => {
  return PLANET_EMOJIS[planetName] || '🪐';
};

// Position display component
const PlanetaryPositionDisplay: React.FC<PlanetaryPositionDisplayProps> = ({
  planet,
  position,
}) => {
  const symbol = getPlanetSymbol(planet);
  const displayName = planet.charAt(0).toUpperCase() + planet.slice(1);

  return (
    <div className='flex items-center justify-between py-1'>
      <span className='flex items-center text-gray-300'>
        <span className='mr-2 text-xl'>{symbol}</span>
        {displayName}:
      </span>
      <span className='text-cyan-200'>
        {position.sign.charAt(0).toUpperCase() + position.sign.slice(1)}{' '}
        {formatDegree(position.degree)}
        {position.isRetrograde && <span className='ml-1 text-orange-300'>℞</span>}
      </span>
    </div>
  );
};

// Time display component
const PlanetaryTimeDisplay: React.FC<PlanetaryTimeDisplayProps> = ({
  compact = false,
  className = '',
}) => {
  // Use a stable getTimeFactors function that doesn't cause re-renders
  const getTimeFactorsStable = useCallback(() => {
    try {
      return getTimeFactors();
    } catch (error) {
      console.error('Failed to get time factors:', error);
      // Return default values if there's an error
      return {
        currentDate: new Date(),
        planetaryDay: { day: 'Sunday', planet: 'Sun' },
        planetaryHour: { planet: 'Sun', hourOfDay: 0 },
        weekDay: 'Sunday',
        season: 'Spring',
        timeOfDay: 'Morning',
      };
    }
  }, []);

  // Memoize the time factors to prevent recalculation on every render
  const timeFactors = useMemo(() => getTimeFactorsStable(), [getTimeFactorsStable]);

  if (compact) {
    return (
      <div className={`flex items-center text-sm ${className}`}>
        <span className='mr-2'>{getPlanetEmoji(timeFactors.planetaryDay.planet)}</span>
        <span className='font-medium'>{timeFactors.planetaryDay.planet}</span>
        <span className='mx-2'>|</span>
        <span className='mr-2'>{getPlanetEmoji(timeFactors.planetaryHour.planet)}</span>
        <span className='font-medium'>{timeFactors.planetaryHour.planet}</span>
      </div>
    );
  }

  return (
    <div className={`py-2 ${className}`}>
      <h3 className='text-md mb-2 font-medium'>Cosmic Time Influences</h3>
      <div className='grid grid-cols-1 gap-2 text-sm md:grid-cols-2'>
        <div className='flex items-center'>
          <span className='mr-2'>{getPlanetEmoji(timeFactors.planetaryDay.planet)}</span>
          <span>
            Day: <span className='font-medium'>{timeFactors.weekDay}</span> ruled by{' '}
            <span className='font-medium'>{timeFactors.planetaryDay.planet}</span>
          </span>
        </div>
        <div className='flex items-center'>
          <span className='mr-2'>{getPlanetEmoji(timeFactors.planetaryHour.planet)}</span>
          <span>
            Hour: <span className='font-medium'>{timeFactors.planetaryHour.planet}</span>
          </span>
        </div>
        <div className='flex items-center'>
          <span className='mr-2'>🌡️</span>
          <span>
            Season: <span className='font-medium'>{timeFactors.season}</span>
          </span>
        </div>
        <div className='flex items-center'>
          <span className='mr-2'>🕰️</span>
          <span>
            Time of Day: <span className='font-medium'>{timeFactors.timeOfDay}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

// Main unified component
const PlanetaryDisplay: React.FC<PlanetaryDisplayProps> = ({
  mode,
  planet,
  position,
  compact = false,
  className = '',
}) => {
  // Create stable getTimeFactors function to avoid recreating on every render
  const getTimeFactorsStable = useCallback(() => {
    try {
      return getTimeFactors();
    } catch (error) {
      console.error('Failed to get time factors:', error);
      // Return default values if there's an error
      return {
        currentDate: new Date(),
        planetaryDay: { day: 'Sunday', planet: 'Sun' },
        planetaryHour: { planet: 'Sun', hourOfDay: 0 },
        weekDay: 'Sunday',
        season: 'Spring',
        timeOfDay: 'Morning',
      };
    }
  }, []);

  switch (mode) {
    case 'position':
      if (!planet || !position) {
        return <div className='text-red-400'>Missing planet or position data</div>;
      }
      return <PlanetaryPositionDisplay planet={planet} position={position} />;

    case 'time':
      return <PlanetaryTimeDisplay compact={compact} className={className} />;

    case 'combined':
      // Memoize the time factors to prevent recalculation on every render
      const _timeFactors = useMemo(() => getTimeFactorsStable(), [getTimeFactorsStable]);

      return (
        <div className={`space-y-4 ${className}`}>
          <PlanetaryTimeDisplay compact={compact} />
          {planet && position && (
            <div className='border-t border-gray-600 pt-4'>
              <h4 className='mb-2 text-sm font-medium'>Current Position</h4>
              <PlanetaryPositionDisplay planet={planet} position={position} />
            </div>
          )}
        </div>
      );

    default:
      return <div className='text-red-400'>Invalid display mode</div>;
  }
};

export default PlanetaryDisplay;

// Export individual components for backward compatibility
export { PlanetaryPositionDisplay, PlanetaryTimeDisplay };
