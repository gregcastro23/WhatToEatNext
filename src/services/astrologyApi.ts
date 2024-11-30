export interface AstrologicalData {
  sunSign: {
    sign: string;
    degree: number;
    minutes: number;
  };
  moonSign: {
    sign: string;
    degree: number;
    minutes: number;
  };
  timestamp: Date;
}

// Using your provided credentials
const ASTRONOMY_API_APP_ID = process.env.NEXT_PUBLIC_ASTRONOMY_API_APP_ID;
const ASTRONOMY_API_APP_SECRET = process.env.NEXT_PUBLIC_ASTRONOMY_API_APP_SECRET;

const BASE_URL = 'https://api.astronomyapi.com/api/v2/bodies/positions';

// Default to New York coordinates - you can adjust these as needed
const DEFAULT_LATITUDE = 40.7128;
const DEFAULT_LONGITUDE = -74.0060;

function getZodiacSign(longitude: number): string {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer',
    'Leo', 'Virgo', 'Libra', 'Scorpio',
    'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  const signIndex = Math.floor(longitude / 30);
  return signs[signIndex >= 0 ? signIndex % 12 : (signIndex % 12 + 12) % 12];
}

function getPositionInSign(longitude: number): { degree: number; minutes: number } {
  const normalizedLongitude = longitude >= 0 ? longitude : 360 + longitude;
  const positionInSign = normalizedLongitude % 30;
  const degree = Math.floor(positionInSign);
  const minutes = Math.floor((positionInSign - degree) * 60);
  return { degree, minutes };
}

export async function getCurrentCelestialPositions(): Promise<AstrologicalData> {
  try {
    const now = new Date();
    const authString = btoa(`${ASTRONOMY_API_APP_ID}:${ASTRONOMY_API_APP_SECRET}`);

    // Format date as YYYY-MM-DD
    const dateStr = now.toISOString().split('T')[0];

    const response = await fetch(`${BASE_URL}?bodies=sun,moon`, {
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response:', data); // For debugging

    // Extract positions from response
    const sunData = data.data.table.rows[0].cells.find((cell: any) => cell.id === 'sun');
    const moonData = data.data.table.rows[0].cells.find((cell: any) => cell.id === 'moon');

    const sunLongitude = parseFloat(sunData.position.apparentLongitude);
    const moonLongitude = parseFloat(moonData.position.apparentLongitude);

    const sunPosition = getPositionInSign(sunLongitude);
    const moonPosition = getPositionInSign(moonLongitude);

    return {
      sunSign: {
        sign: getZodiacSign(sunLongitude),
        degree: sunPosition.degree,
        minutes: sunPosition.minutes
      },
      moonSign: {
        sign: getZodiacSign(moonLongitude),
        degree: moonPosition.degree,
        minutes: moonPosition.minutes
      },
      timestamp: now
    };
  } catch (error) {
    console.error('Error fetching astronomical data:', error);
    // Return fallback data
    return {
      sunSign: {
        sign: 'Capricorn',
        degree: 15,
        minutes: 0
      },
      moonSign: {
        sign: 'Taurus',
        degree: 23,
        minutes: 0
      },
      timestamp: new Date()
    };
  }
}

// Cache management
let cachedData: AstrologicalData | null = null;
let lastFetchTime: Date | null = null;

export async function getCachedCelestialPositions(): Promise<AstrologicalData> {
  const now = new Date();
  
  // Use cached data if less than 5 minutes old
  if (cachedData && lastFetchTime && 
      (now.getTime() - lastFetchTime.getTime()) < 300000) {
    return cachedData;
  }

  const data = await getCurrentCelestialPositions();
  cachedData = data;
  lastFetchTime = now;
  return data;
}
