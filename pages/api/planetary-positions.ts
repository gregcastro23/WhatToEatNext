import type { NextApiRequest, NextApiResponse } from 'next';
import { calculatePlanetaryPositions, calculateAspects } from '@/utils/astrologyUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { date } = JSON.parse(req.body);
    const targetDate = new Date(date);
    
    // Get positions using our local function instead of swisseph
    const positions = await calculatePlanetaryPositions(targetDate);
    
    // Validate positions before calculating aspects
    if (!positions || Object.keys(positions).length === 0) {
      return res.status(500).json({ message: 'Failed to calculate planetary positions' });
    }
    
    // Check for valid position structure
    const hasValidPositions = Object.values(positions).every(
      position => position && typeof position === 'object' && 'sign' in position
    );
    
    if (!hasValidPositions) {
      console.warn("Some planetary positions are invalid or incomplete");
    }
    
    const aspects = calculateAspects(positions);
    
    res.status(200).json({ 
      positions,
      aspects,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error calculating planetary positions:', error);
    res.status(500).json({ 
      message: 'Error calculating planetary positions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 