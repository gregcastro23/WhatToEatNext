/**
 * Test script to verify planetary position calculations
 */
const Astronomy = require('astronomy-engine');

function longitudeToZodiacPosition(longitude) {
  // Normalize to 0-360 range
  const normalizedLongitude = ((longitude % 360) + 360) % 360;

  // Each sign is 30 degrees
  const signIndex = Math.floor(normalizedLongitude / 30);
  const degreeInSign = normalizedLongitude % 30;
  const degree = Math.floor(degreeInSign);
  const minute = Math.floor((degreeInSign - degree) * 60);

  const signs = [
    "aries", "taurus", "gemini", "cancer",
    "leo", "virgo", "libra", "scorpio",
    "sagittarius", "capricorn", "aquarius", "pisces"
  ];

  return {
    sign: signs[signIndex],
    degree,
    minute,
    exactLongitude: normalizedLongitude
  };
}

// Test with current date/time
const now = new Date();
console.log(`\n===== Planetary Positions for ${now.toISOString()} =====\n`);

const planets = [
  { name: "Sun", body: Astronomy.Body.Sun },
  { name: "Moon", body: Astronomy.Body.Moon },
  { name: "Mercury", body: Astronomy.Body.Mercury },
  { name: "Venus", body: Astronomy.Body.Venus },
  { name: "Mars", body: Astronomy.Body.Mars },
  { name: "Jupiter", body: Astronomy.Body.Jupiter },
  { name: "Saturn", body: Astronomy.Body.Saturn },
  { name: "Uranus", body: Astronomy.Body.Uranus },
  { name: "Neptune", body: Astronomy.Body.Neptune },
  { name: "Pluto", body: Astronomy.Body.Pluto },
];

for (const planet of planets) {
  try {
    // Get ecliptic coordinates
    const ecliptic = Astronomy.Ecliptic(planet.body, now);
    const longitude = ecliptic.elon;

    // Convert to zodiac position
    const zodiacPos = longitudeToZodiacPosition(longitude);

    console.log(`${planet.name.padEnd(10)} - ${zodiacPos.sign.padEnd(12)} ${zodiacPos.degree}° ${zodiacPos.minute}' (Longitude: ${longitude.toFixed(2)}°)`);
  } catch (error) {
    console.error(`Error calculating ${planet.name}:`, error.message);
  }
}

console.log("\n");
