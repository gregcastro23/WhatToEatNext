// Import the right functions from astronomy-engine
import * as Astronomy from 'astronomy-engine';

// Define zodiac sign boundaries
const ZODIAC_SIGNS = [
  { name: 'Aries', start: 0, end: 30, element: 'Fire' },
  { name: 'Taurus', start: 30, end: 60, element: 'Earth' },
  { name: 'Gemini', start: 60, end: 90, element: 'Air' },
  { name: 'Cancer', start: 90, end: 120, element: 'Water' },
  { name: 'Leo', start: 120, end: 150, element: 'Fire' },
  { name: 'Virgo', start: 150, end: 180, element: 'Earth' },
  { name: 'Libra', start: 180, end: 210, element: 'Air' },
  { name: 'Scorpio', start: 210, end: 240, element: 'Water' },
  { name: 'Sagittarius', start: 240, end: 270, element: 'Fire' },
  { name: 'Capricorn', start: 270, end: 300, element: 'Earth' },
  { name: 'Aquarius', start: 300, end: 330, element: 'Air' },
  { name: 'Pisces', start: 330, end: 360, element: 'Water' }
];

// Get accurate planetary positions
export function getAccuratePlanetaryPositions(date: Date = new Date()) {
  try {
    // Use the date object directly instead of MakeTime
    // astronomy-engine can work with JavaScript Date objects
    const time = new Astronomy.AstroTime(date);
    
    const PLANET_MAPPING = {
      Sun: Astronomy.Body.Sun,
      Moon: Astronomy.Body.Moon,
      Mercury: Astronomy.Body.Mercury,
      Venus: Astronomy.Body.Venus,
      Mars: Astronomy.Body.Mars,
      Jupiter: Astronomy.Body.Jupiter,
      Saturn: Astronomy.Body.Saturn,
      Uranus: Astronomy.Body.Uranus,
      Neptune: Astronomy.Body.Neptune,
      Pluto: Astronomy.Body.Pluto
    };
    
    const positions: Record<string, number> = {};
    
    for (const [planet, body] of Object.entries(PLANET_MAPPING)) {
      try {
        if (planet === 'Sun') {
          // For Sun, use SunPosition
          const solarPosition = Astronomy.SunPosition(time);
          positions[planet] = solarPosition.elon;
        } else {
          // For other planets, use EclipticLongitude
          positions[planet] = Astronomy.EclipticLongitude(body, time);
        }
      } catch (e) {
        console.error(`Error calculating position for ${planet}:`, e);
        positions[planet] = 0;
      }
    }
    
    return positions;
  } catch (error) {
    console.error('Error in accurate planetary calculations:', error);
    return {};
  }
}

// Get zodiac sign for a degree
export function getZodiacSign(degree: number) {
  const normalizedDegree = degree % 360;
  const sign = ZODIAC_SIGNS.find(s => 
    normalizedDegree >= s.start && normalizedDegree < s.end
  );
  return sign || ZODIAC_SIGNS[0]; // Fallback to Aries
}

// Update validation function
export function validatePositions(positions: Record<string, number>) {
  const requiredPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 
                            'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  
  // Check we have all the required planets
  const hasAllPlanets = requiredPlanets.every(planet => {
    const position = positions[planet];
    return typeof position === 'number' && !isNaN(position) && position >= 0 && position < 360;
  });
  
  if (!hasAllPlanets) {
    console.error('Missing or invalid planetary positions:', positions);
    throw new Error('Missing or invalid planetary positions');
  }
}

// Get upcoming transits
export function getUpcomingTransits(daysAhead = 30) {
  const currentDate = new Date();
  const transits = [];
  
  // Check for sign changes
  for (let i = 0; i <= daysAhead; i++) {
    const date = new Date();
    date.setDate(currentDate.getDate() + i);
    
    const positions = getAccuratePlanetaryPositions(date);
    const prevPositions = getAccuratePlanetaryPositions(
      new Date(date.getTime() - 24 * 60 * 60 * 1000)
    );

    for (const planet in positions) {
      const currentSign = getZodiacSign(positions[planet]);
      const prevSign = getZodiacSign(prevPositions[planet]);
      
      if (currentSign.name !== prevSign.name) {
        transits.push({
          date,
          planet,
          from: prevSign,
          to: currentSign
        });
      }
    }
  }
  
  return transits;
} 