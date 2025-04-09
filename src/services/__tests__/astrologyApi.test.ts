import { getCurrentCelestialPositions } from '../astrologyApi';

describe('Astrology API', () => {
  test('getCurrentCelestialPositions returns valid data', async () => {
    const data = await getCurrentCelestialPositions();
    
    // Check structure
    expect(data).toHaveProperty('sunSign');
    expect(data).toHaveProperty('moonPhase');
    expect(data).toHaveProperty('timestamp');

    // Check sun sign data
    expect(typeof data.sunSign).toBe('string');
    expect(data.sunSign.length).toBeGreaterThan(0);

    // Check timestamp
    expect(typeof data.timestamp).toBe('number');
    expect(data.timestamp).toBeLessThanOrEqual(Date.now());
  });

  test('API response time is reasonable', async () => {
    const startTime = Date.now();
    await getCurrentCelestialPositions();
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
  });
}); 