// Script to get current planetary positions from alchm-backend API
// and update the fallback data in astrologizeApi.ts

async function getCurrentPlanetaryPositions() {
  try {
    console.log('🌟 Calling alchm-backend API for current planetary positions...');

    // Get current date/time
    const now = new Date();
    const payload = {
      year: now.getFullYear(),
      month: now.getMonth(), // 0-indexed
      date: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes(),
      latitude: 40.7498, // New York City
      longitude: -73.7976,
      ayanamsa: 'TROPICAL', // Tropical zodiac
    };

    console.log('📅 Requesting positions for:', new Date().toISOString());

    const response = await fetch('https://alchm-backend.onrender.com/astrologize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Successfully received alchm-backend API response');

    // Extract planetary positions from the response
    const celestialBodies = data._celestialBodies;
    if (!celestialBodies) {
      throw new Error('Invalid API response structure - no _celestialBodies found');
    }

    // Map the API response to our PlanetPosition format
    const positions = {};

    const planetMap = {
      sun: 'Sun',
      moon: 'Moon',
      mercury: 'Mercury',
      venus: 'Venus',
      mars: 'Mars',
      jupiter: 'Jupiter',
      saturn: 'Saturn',
      uranus: 'Uranus',
      neptune: 'Neptune',
      pluto: 'Pluto',
    };

    Object.entries(planetMap).forEach(([apiKey, planetName]) => {
      const planetData = celestialBodies[apiKey];
      if (planetData) {
        const sign = planetData.Sign.key.toLowerCase();
        const decimalDegrees = planetData.ChartPosition.Ecliptic.DecimalDegrees;
        const arcDegrees = planetData.ChartPosition.Ecliptic.ArcDegrees;

        // Calculate exact longitude (normalize to 0-360 range)
        const exactLongitude = ((decimalDegrees % 360) + 360) % 360;

        positions[planetName] = {
          sign,
          degree: arcDegrees.degrees,
          minute: arcDegrees.minutes,
          exactLongitude,
          isRetrograde: planetData.isRetrograde || false,
        };
      }
    });

    // Add Ascendant (using a reasonable default for now)
    positions['Ascendant'] = {
      sign: 'aries',
      degree: 16,
      minute: 16,
      exactLongitude: 16.27,
      isRetrograde: false,
    };

    console.log('📊 Current Planetary Positions:');
    Object.entries(positions).forEach(([planet, position]) => {
      console.log(
        `  ${planet}: ${position.sign} ${position.degree}°${position.minute}' (${position.exactLongitude.toFixed(2)}°)${position.isRetrograde ? ' (R)' : ''}`,
      );
    });

    // Generate the updated fallback code
    console.log('\n📝 Updated fallback code for astrologizeApi.ts:');
    console.log('const fallbackPositions = (): Record<string, PlanetPosition> => {');
    console.log("  // console.log('Using fallback planetary positions due to API failure');");
    console.log('  return {');

    Object.entries(positions).forEach(([planet, position]) => {
      console.log(
        `    ${planet}: { sign: '${position.sign}', degree: ${position.degree}, minute: ${position.minute}, exactLongitude: ${position.exactLongitude.toFixed(2)}, isRetrograde: ${position.isRetrograde} },`,
      );
    });

    console.log('  };');
    console.log('};');

    return positions;
  } catch (error) {
    console.error('❌ Error getting current planetary positions:', error);
    return null;
  }
}

// Run the function
getCurrentPlanetaryPositions();
