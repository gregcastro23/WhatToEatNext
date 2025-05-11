import React, { useMemo } from 'react';
import { PlanetaryHour, PlanetaryDay, getLunarPhase } from '@/types/time';

interface PlanetaryTimeDisplayProps {
  compact?: boolean;
  className?: string;
}

// Add the missing getTimeFactors function
function getTimeFactors() {
  // Get current date and day of week
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const hour = now.getHours();
  
  // Map day of week to planetary day
  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const planetaryDays = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  
  // Map hour to planetary hour (simplified)
  const planetaryHourRulers = [
    'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars', // 0-6
    'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars', // 7-13 
    'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'  // 14-20
  ];
  
  // Determine season
  const month = now.getMonth();
  let season = 'Spring';
  if (month >= 2 && month <= 4) season = 'Spring';
  else if (month >= 5 && month <= 7) season = 'Summer';
  else if (month >= 8 && month <= 10) season = 'Autumn';
  else season = 'Winter';
  
  // Determine time of day
  let timeOfDay = 'Day';
  if (hour < 6) timeOfDay = 'Night';
  else if (hour < 12) timeOfDay = 'Morning';
  else if (hour < 18) timeOfDay = 'Afternoon';
  else timeOfDay = 'Evening';
  
  return {
    weekDay: weekDays[dayOfWeek],
    planetaryDay: { 
      planet: planetaryDays[dayOfWeek],
      element: getPlanetElement(planetaryDays[dayOfWeek])
    },
    planetaryHour: {
      planet: planetaryHourRulers[hour % 21],
      element: getPlanetElement(planetaryHourRulers[hour % 21])
    },
    season,
    timeOfDay,
    hour
  };
}

// Helper function for planetary elements
function getPlanetElement(planet: string) {
  const elementMap: Record<string, string> = {
    'Sun': 'Fire',
    'Moon': 'Water',
    'Mercury': 'Air',
    'Venus': 'Water',
    'Mars': 'Fire',
    'Jupiter': 'Air',
    'Saturn': 'Earth',
    'Uranus': 'Air',
    'Neptune': 'Water',
    'Pluto': 'Earth'
  };
  
  return elementMap[planet] || 'Air';
}

const PlanetaryTimeDisplay: React.FC<PlanetaryTimeDisplayProps> = ({ 
  compact = false,
  className = ''
}) => {
  let timeFactors = useMemo(() => getTimeFactors(), []);

  // Get the emoji for each planet
  let getPlanetEmoji = (planetName: string): string => {
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
        <span className="mr-2">{getPlanetEmoji(timeFactors.planetaryDay.planet)}</span>
        <span className="font-medium">{timeFactors.planetaryDay.planet}</span>
        <span className="mx-2">|</span>
        <span className="mr-2">{getPlanetEmoji(timeFactors.planetaryHour.planet)}</span>
        <span className="font-medium">{timeFactors.planetaryHour.planet}</span>
      </div>
    );
  }

  return (
    <div className={`py-2 ${className}`}>
      <h3 className="text-md font-medium mb-2">Cosmic Time Influences</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
        <div className="flex items-center">
          <span className="mr-2">{getPlanetEmoji(timeFactors.planetaryDay.planet)}</span>
          <span>Day: <span className="font-medium">{timeFactors.weekDay}</span> ruled by <span className="font-medium">{timeFactors.planetaryDay.planet}</span></span>
        </div>
        <div className="flex items-center">
          <span className="mr-2">{getPlanetEmoji(timeFactors.planetaryHour.planet)}</span>
          <span>Hour: <span className="font-medium">{timeFactors.planetaryHour.planet}</span></span>
        </div>
        <div className="flex items-center">
          <span className="mr-2">🌡️</span>
          <span>Season: <span className="font-medium">{timeFactors.season}</span></span>
        </div>
        <div className="flex items-center">
          <span className="mr-2">🕰️</span>
          <span>Time of Day: <span className="font-medium">{timeFactors.timeOfDay}</span></span>
        </div>
      </div>
    </div>
  );
};

export default PlanetaryTimeDisplay; 