import React, { useMemo } from 'react';
import { getTimeFactors, TimeFactors } from '@/types/time';

interface PlanetaryTimeDisplayProps {
  compact?: boolean;
  className?: string;
}

const PlanetaryTimeDisplay: React.FC<PlanetaryTimeDisplayProps> = ({ 
  compact = false,
  className = ''
}) => {
  const _timeFactors = useMemo(() => getTimeFactors(), []);

  // Get the emoji for each planet
  const getPlanetEmoji = (planetName: string): string => {
    const emojiMap: Record<string, string> = {
      'Sun': '☀️',
      'Moon': '🌙',
      'Mercury': '☿️',
      'Venus': '♀️',
      'Mars': '♂️',
      'Jupiter': '♃',
      'Saturn': '♄',
      'Uranus': '⛢',
      'Neptune': '♆',
      'Pluto': '♇'
    };
    
    return emojiMap[planetName] || '🪐';
  };
  
  if (compact) {
    return (
      <div className={`flex items-center text-sm ${className}`}>
        <span className="mr-2">{getPlanetEmoji(_timeFactors.planetaryDay.planet)}</span>
        <span className="font-medium">{_timeFactors.planetaryDay.planet}</span>
        <span className="mx-2">|</span>
        <span className="mr-2">{getPlanetEmoji(_timeFactors.planetaryHour.planet)}</span>
        <span className="font-medium">{_timeFactors.planetaryHour.planet}</span>
      </div>
    );
  }

  return (
    <div className={`py-2 ${className}`}>
      <h3 className="text-md font-medium mb-2">Cosmic Time Influences</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
        <div className="flex items-center">
          <span className="mr-2">{getPlanetEmoji(_timeFactors.planetaryDay.planet)}</span>
          <span>Day: <span className="font-medium">{_timeFactors.weekDay}</span> ruled by <span className="font-medium">{_timeFactors.planetaryDay.planet}</span></span>
        </div>
        <div className="flex items-center">
          <span className="mr-2">{getPlanetEmoji(_timeFactors.planetaryHour.planet)}</span>
          <span>Hour: <span className="font-medium">{_timeFactors.planetaryHour.planet}</span></span>
        </div>
        <div className="flex items-center">
          <span className="mr-2">🌡️</span>
          <span>Season: <span className="font-medium">{_timeFactors.season}</span></span>
        </div>
        <div className="flex items-center">
          <span className="mr-2">🕰️</span>
          <span>Time of Day: <span className="font-medium">{_timeFactors.timeOfDay}</span></span>
        </div>
      </div>
    </div>
  );
};

export default PlanetaryTimeDisplay; 