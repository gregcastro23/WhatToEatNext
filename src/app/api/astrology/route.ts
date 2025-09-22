import { NextResponse } from 'next/server';

export async function GET(_request: Request) {
  // Return a simple mock response for now
  return NextResponse.json({
    status: 'success',
    message: 'API temporarily disabled for maintenance',
    mockData: {
      sunSign: 'leo',
      moonSign: 'cancer',
      lunarPhase: 'full moon',
      planetaryPositions: {
        sun: { sign: 'leo', degree: 15 },
        moon: { sign: 'cancer', degree: 10 },
        mercury: { sign: 'leo', degree: 5 },
        venus: { sign: 'virgo', degree: 2 },
        mars: { sign: 'libra', degree: 8 },
        jupiter: { sign: 'taurus', degree: 19 },
        saturn: { sign: 'pisces', degree: 27 }
      }
    }
  })
}