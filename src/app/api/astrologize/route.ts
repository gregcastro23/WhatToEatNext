import { NextResponse } from 'next/server';

const ASTROLOGIZE_API_URL = 'https://alchm-backend.onrender.com/astrologize';

// Interface for the API request
interface AstrologizeRequest {
  year: number;
  month: number; // 0-indexed (January = 0, February = 1, etc.)
  date: number;
  hour: number;
  minute: number;
  latitude: number;
  longitude: number;
  ayanamsa?: string; // Optional parameter for zodiac system
}

// Default location (New York City)
const DEFAULT_LOCATION = {
  latitude: 40.7498,
  longitude: -73.7976
};

/**
 * Handle POST requests - calculate astrological positions for a specific date/time/location
 */
export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json();
    
    // Extract parameters from request or use defaults
    const {
      year = new Date().getFullYear(),
      month = new Date().getMonth() + 1, // Convert from conventional 1-indexed to our expected format
      date = new Date().getDate(),
      hour = new Date().getHours(),
      minute = new Date().getMinutes(),
      latitude = DEFAULT_LOCATION.latitude,
      longitude = DEFAULT_LOCATION.longitude,
      zodiacSystem = 'tropical' // Default to tropical zodiac
    } = body;

    // Convert conventional month (1-12) to 0-indexed month (0-11) for the API
    const apiMonth = typeof month === 'number' ? month - 1 : month;

    // Prepare the API request payload
    const apiPayload: AstrologizeRequest = {
      year,
      month: apiMonth, // Use 0-indexed month
      date,
      hour,
      minute,
      latitude,
      longitude,
      ayanamsa: zodiacSystem.toUpperCase() === 'TROPICAL' ? 'TROPICAL' : 'LAHIRI' // Default to Lahiri for sidereal
    };

    // console.log('Making API call to astrologize with payload:', apiPayload);

    // Make the API call
    const response = await fetch(ASTROLOGIZE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiPayload),
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    // console.error('Error calling astrologize API:', error);
    return NextResponse.json(
      { error: 'Failed to get astrological data' },
      { status: 500 }
    );
  }
}

/**
 * Handle GET requests - calculate astrological positions for current time
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Extract query parameters
  const latitude = parseFloat(searchParams.get('latitude') || String(DEFAULT_LOCATION.latitude));
  const longitude = parseFloat(searchParams.get('longitude') || String(DEFAULT_LOCATION.longitude));
  const zodiacSystem = searchParams.get('zodiacSystem') || 'tropical';
  
  // Use current date/time
  const now = new Date();
  
  const payload = {
    year: now.getFullYear(),
    month: now.getMonth(), // Send 0-indexed month directly since POST handler expects this format
    date: now.getDate(),
    hour: now.getHours(),
    minute: now.getMinutes(),
    latitude,
    longitude,
    zodiacSystem
  };

  // Forward to POST handler
  return POST(new Request(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }));
} 