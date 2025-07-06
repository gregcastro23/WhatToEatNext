/**
 * Returns the current planetary day and hour information
 */
export function getTimeFactors() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const planetaryDayMap = {
    'Sunday': 'Sun',
    'Monday': 'Moon',
    'Tuesday': 'Mars',
    'Wednesday': 'Mercury',
    'Thursday': 'Jupiter',
    'Friday': 'Venus',
    'Saturday': 'Saturn'
  };
  
  // Get current date information
  const now = new Date();
  const dayOfWeek = days[now.getDay()];
  const hour = now.getHours();
  
  // Calculate planetary hour (simplified implementation)
  const dayHours = [
    'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars',
    'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars',
    'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars',
    'Sun', 'Venus', 'Mercury', 'Moon'
  ];
  
  const nightHours = [
    'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn',
    'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn',
    'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn',
    'Jupiter', 'Mars', 'Sun', 'Venus'
  ];
  
  // Determine if it's day or night (simplified)
  const _isDaytime = hour >= 6 && hour < 18;
  const isDaytime = _isDaytime; // Backward-compatibility alias
  const hourIndex = hour % 24;
  const planetaryHour = isDaytime ? dayHours[hourIndex] : nightHours[hourIndex];
  
  return {
    planetaryDay: {
      day: dayOfWeek,
      planet: planetaryDayMap[dayOfWeek]
    },
    planetaryHour: {
      hourOfDay: hour,
      planet: planetaryHour
    },
    isDaytime
  };
}

// Additional time utility functions can be added as needed 