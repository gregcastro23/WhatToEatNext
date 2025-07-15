import fetch from 'node-fetch';

async function getCurrentPlanetaryPositions() {
  // Use specific current date for July 2, 2025 at noon
  const payload = {
    year: 2025,
    month: 6, // July (0-indexed)
    date: 2,
    hour: 12,
    minute: 0,
    latitude: 40.7498,
    longitude: -73.7976,
    ayanamsa: 'TROPICAL'
  };

  console.log('Getting planetary positions for:', {
    date: `${payload.year}-${String(payload.month + 1).padStart(2, '0')}-${String(payload.date).padStart(2, '0')}`,
    time: `${String(payload.hour).padStart(2, '0')}:${String(payload.minute).padStart(2, '0')}`
  });

  try {
    const response = await fetch('https://alchm-backend.onrender.com/astrologize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    // Get planets from correct location
    const planets = data.astrology_info?.horoscope_parameters?.planets;
    
    if (!planets) {
      console.error('No planets found in astrology_info.horoscope_parameters!');
      return;
    }

    console.log('Found planets:', Object.keys(planets));

    // Convert to our format
    const positions = {};
    
    // Map planet names to our format
    const planetMapping = {
      'Sun': 'Sun',
      'Moon': 'Moon', 
      'Mercury': 'Mercury',
      'Venus': 'Venus',
      'Mars': 'Mars',
      'Jupiter': 'Jupiter',
      'Saturn': 'Saturn',
      'Uranus': 'Uranus',
      'Neptune': 'Neptune',
      'Pluto': 'Pluto'
    };

    for (const [planetKey, planetName] of Object.entries(planetMapping)) {
      const planet = planets[planetKey];
      if (planet && planet.sign && planet.degree !== undefined) {
        positions[planetName] = {
          sign: planet.sign.toLowerCase(),
          degree: Math.floor(planet.degree),
          minute: Math.floor((planet.degree % 1) * 60),
          isRetrograde: planet.isRetrograde || false
        };
      }
    }

    // Add Ascendant if available
    const ascendant = data.astrology_info?.horoscope_parameters?.cusps?.houses?.[1];
    if (ascendant && ascendant.sign) {
      positions.Ascendant = {
        sign: ascendant.sign.toLowerCase(),
        degree: Math.floor(ascendant.degree || 0),
        minute: Math.floor(((ascendant.degree || 0) % 1) * 60),
        isRetrograde: false
      };
    }

    console.log('\n🌟 CURRENT PLANETARY POSITIONS FOR TYPESCRIPT DEFAULTS:\n');
    console.log('const currentPlanetaryPositions: Record<Planet, PlanetaryPosition> = {');
    
    Object.entries(positions).forEach(([planet, pos]) => {
      console.log(`  ${planet}: { sign: '${pos.sign}', degree: ${pos.degree} },`);
    });
    
    console.log('};');
    
    console.log('\n📋 COPY-PASTE READY:');
    console.log(JSON.stringify(positions, null, 2));
    
    return positions;
  } catch (error) {
    console.error('Error fetching current positions:', error);
  }
}

getCurrentPlanetaryPositions(); 