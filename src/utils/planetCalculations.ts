// Sun calculation
export function calculateSunPosition(date: Date = new Date()) {
  const t = (date.getTime() - new Date('2000-01-01T12:00:00Z').getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  const longitude = 280.46061837 + 360.98564736629 * t;
  return {
    sign: getSignFromLongitude(longitude),
    degree: longitude % 30,
    minutes: (longitude % 1) * 60,
    isRetrograde: false // Sun never retrograde
  };
}

// Moon calculation
export function calculateMoonPosition(date: Date = new Date()) {
  const t = (date.getTime() - new Date('2000-01-01T12:00:00Z').getTime()) / (1000 * 60 * 60 * 24 * 27.322);
  const longitude = 218.3164477 + 481267.88123421 * t;
  return {
    sign: getSignFromLongitude(longitude),
    degree: longitude % 30,
    minutes: (longitude % 1) * 60,
    isRetrograde: false // Moon never retrograde
  };
}

// Mercury calculation
export function calculateMercuryPosition(date: Date = new Date()) {
  const t = (date.getTime() - new Date('2000-01-01T12:00:00Z').getTime()) / (1000 * 60 * 60 * 24 * 87.969);
  const longitude = 252.25084 + 538101.03 * t;
  return {
    sign: getSignFromLongitude(longitude),
    degree: longitude % 30,
    minutes: (longitude % 1) * 60,
    isRetrograde: Math.random() < 0.2 // Mercury is retrograde ~20% of the time
  };
}

// Add similar functions for other planets...

// Helper function to get sign from longitude
function getSignFromLongitude(longitude: number): string {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer',
    'Leo', 'Virgo', 'Libra', 'Scorpio',
    'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  const signIndex = Math.floor((longitude % 360) / 30);
  return signs[signIndex];
} 