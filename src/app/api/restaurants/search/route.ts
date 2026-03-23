/**
 * Restaurant Search API Route (Foursquare Places API v3 Proxy)
 * GET /api/restaurants/search?query=...&near=...
 * 
 * Proxies requests to Foursquare to keep the API key server-side.
 * Free tier: 10,000 calls/month on Pro endpoints.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

const FOURSQUARE_BASE = 'https://api.foursquare.com/v3/places/search';
const RESTAURANT_CATEGORY_ID = '13065'; // Foursquare "Dining and Drinking" parent category

export async function GET(request: NextRequest) {
  const apiKey = process.env.FOURSQUARE_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        success: false,
        message: 'Foursquare API key not configured. Add FOURSQUARE_API_KEY to your .env.local file.',
        setupUrl: 'https://foursquare.com/developers',
      },
      { status: 501 }
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const near = searchParams.get('near');

  if (!query && !near) {
    return NextResponse.json(
      { success: false, message: 'Please provide a query or location.' },
      { status: 400 }
    );
  }

  try {
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (near) params.set('near', near);
    params.set('categories', RESTAURANT_CATEGORY_ID);
    params.set('fields', 'fsq_id,name,location,categories,rating,distance');
    params.set('limit', '15');

    const response = await fetch(`${FOURSQUARE_BASE}?${params.toString()}`, {
      headers: {
        Authorization: apiKey,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Foursquare API error:', response.status, errorBody);
      return NextResponse.json(
        { success: false, message: 'Failed to search restaurants. Please try again.' },
        { status: 502 }
      );
    }

    const data = await response.json();
    const results = (data.results || []).map((place: any) => ({
      fsq_id: place.fsq_id,
      name: place.name,
      location: {
        formatted_address: place.location?.formatted_address,
        locality: place.location?.locality,
        region: place.location?.region,
        address: place.location?.address,
      },
      categories: (place.categories || []).map((cat: any) => ({
        name: cat.name,
        icon: cat.icon,
      })),
      rating: place.rating,
      distance: place.distance,
    }));

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Restaurant search error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while searching.' },
      { status: 500 }
    );
  }
}
