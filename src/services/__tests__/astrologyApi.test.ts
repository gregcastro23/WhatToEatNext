import { getCurrentCelestialPositions, getCachedCelestialPositions } from '../astrologyApi';

describe('Astrology API', () => {
  test('getCurrentCelestialPositions returns valid data', async () => {
    const data = await getCurrentCelestialPositions();
    
    // Check structure
    expect(data).toHaveProperty('sunSign');
    expect(data).toHaveProperty('moonSign');
    expect(data).toHaveProperty('timestamp');

    // Check sun sign data
    expect(data.sunSign).toHaveProperty('sign');
    expect(data.sunSign).toHaveProperty('degree');
    expect(data.sunSign).toHaveProperty('minutes');

    // Check moon sign data
    expect(data.moonSign).toHaveProperty('sign');
    expect(data.moonSign).toHaveProperty('degree');
    expect(data.moonSign).toHaveProperty('minutes');

    // Validate degrees and minutes
    expect(data.sunSign.degree).toBeGreaterThanOrEqual(0);
    expect(data.sunSign.degree).toBeLessThan(30);
    expect(data.sunSign.minutes).toBeGreaterThanOrEqual(0);
    expect(data.sunSign.minutes).toBeLessThan(60);

    expect(data.moonSign.degree).toBeGreaterThanOrEqual(0);
    expect(data.moonSign.degree).toBeLessThan(30);
    expect(data.moonSign.minutes).toBeGreaterThanOrEqual(0);
    expect(data.moonSign.minutes).toBeLessThan(60);

    // Check zodiac signs
    const validSigns = [
      'Aries', 'Taurus', 'Gemini', 'Cancer',
      'Leo', 'Virgo', 'Libra', 'Scorpio',
      'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    expect(validSigns).toContain(data.sunSign.sign);
    expect(validSigns).toContain(data.moonSign.sign);
  });

  test('getCachedCelestialPositions caches data', async () => {
    // First call
    const firstCall = await getCachedCelestialPositions();
    const firstTimestamp = firstCall.timestamp;

    // Immediate second call should return cached data
    const secondCall = await getCachedCelestialPositions();
    const secondTimestamp = secondCall.timestamp;

    expect(firstTimestamp).toEqual(secondTimestamp);
  });

  test('API response time is reasonable', async () => {
    const startTime = Date.now();
    await getCurrentCelestialPositions();
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
  });
}); 