import React, { useMemo } from 'react';

import { getTimeFactors, TimeFactors } from '@/types/time';

interface PlanetaryTimeDisplayProps {
  compact?: boolean;
  className?: string;
}

const PlanetaryTimeDisplay: React.FC<PlanetaryTimeDisplayProps> = ({
  compact = false,
  className = '',
}) => {
  const timeFactors = useMemo(() => getTimeFactors(), []);

  // Get the emoji for each planet
  const getPlanetEmoji = (planetName: string): string => {
    const emojiMap: Record<string, string> = {
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

    return emojiMap[planetName] || '🪐';
  };

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

export default PlanetaryTimeDisplay;
