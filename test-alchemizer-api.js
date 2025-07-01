import fetch from 'node-fetch';

async function testAlchemizerApi() {
  const now = new Date();
  const payload = {
    year: now.getFullYear(),
    month: now.getMonth(), // 0-indexed
    date: now.getDate(),
    hour: now.getHours(),
    minute: now.getMinutes(),
    latitude: 40.7498,
    longitude: -73.7976,
    ayanamsa: 'TROPICAL'
  };

  console.log('Sending payload:', payload);

  const response = await fetch('https://alchm-backend.onrender.com/astrologize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  console.log('API response received.');

  // Extract planetary positions in alchemize format
  const celestial = data._celestialBodies;
  if (!celestial) {
    console.error('No _celestialBodies found in response! Full response:');
    console.dir(data, { depth: null });
    return;
  }

  // Map to { planet: { sign, degree, minute, isRetrograde } }
  const planetKeys = [
    'sun', 'moon', 'mercury', 'venus', 'mars',
    'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'ascendant'
  ];
  const positions = {};
  for (const key of planetKeys) {
    const p = celestial[key];
    if (p && p.Sign && p.ChartPosition && p.ChartPosition.Ecliptic && p.ChartPosition.Ecliptic.ArcDegrees) {
      positions[key.charAt(0).toUpperCase() + key.slice(1)] = {
        sign: p.Sign.key.toLowerCase(),
        degree: p.ChartPosition.Ecliptic.ArcDegrees.degrees,
        minute: p.ChartPosition.Ecliptic.ArcDegrees.minutes,
        isRetrograde: p.isRetrograde || false
      };
    }
  }

  console.log('\nPlanetary positions for alchemize:');
  console.dir(positions, { depth: null });

  // Optionally, print as JSON for copy-paste
  console.log('\nCopy-paste for TS:');
  console.log(JSON.stringify(positions, null, 2));
}

testAlchemizerApi().catch(console.error); 