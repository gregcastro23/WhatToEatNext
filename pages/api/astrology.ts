import type { NextApiRequest, NextApiResponse } from 'next';
import { AstrologyService } from '@/services/AstrologyService';
import { createLogger } from '@/utils/logger';

const logger = createLogger('AstrologyAPI');

type ResponseData = {
  success: boolean;
  data?: unknown;
  error?: string;
};

/**
 * API endpoint for astrology-related data
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const { method } = req;

  try {
    // Initialize the astrology service using getInstance
    const astrologyService = AstrologyService.getInstance();
    
    switch (method) {
      case 'GET': {
        // Handle GET requests
        const { lat, lng, date } = req.query;
        
        if (!lat || !lng) {
          return res.status(400).json({ 
            success: false, 
            error: 'Missing required parameters: lat and lng' 
          });
        }
        
        // Parse date or use current date
        const targetDate = date ? new Date(date as string) : new Date();
        
        // Calculate planetary positions
        const positions = await astrologyService.calculatePlanetaryPositions({
          latitude: parseFloat(lat as string),
          longitude: parseFloat(lng as string),
          date: targetDate
        });
        
        // Calculate current sign and other astrological data
        const currentSign = astrologyService.getCurrentSign(positions);
        const planetaryHour = astrologyService.getPlanetaryHour(targetDate);
        const lunarPhase = astrologyService.getLunarPhase(targetDate);
        
        return res.status(200).json({
          success: true,
          data: {
            positions,
            currentSign,
            planetaryHour,
            lunarPhase
          }
        });
      }
        
      case 'POST': {
        // Handle POST requests for custom calculations
        const { latitude, longitude, timestamp, calculation } = req.body;
        
        if (!latitude || !longitude) {
          return res.status(400).json({ 
            success: false, 
            error: 'Missing required parameters: latitude and longitude' 
          });
        }
        
        // Parse timestamp or use current time
        const calcDate = timestamp ? new Date(timestamp) : new Date();
        
        // Determine which calculation to perform
        let result;
        switch (calculation) {
          case 'elementalBalance': {
            result = await astrologyService.calculateElementalState({
              latitude,
              longitude,
              date: calcDate
            });
            break;
          }
            
          case 'planetaryPositions':
          default: {
            result = await astrologyService.calculatePlanetaryPositions({
              latitude,
              longitude,
              date: calcDate
            });
            break;
          }
        }
        
        return res.status(200).json({
          success: true,
          data: result
        });
      }
        
      default: {
        // Method not allowed
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ 
          success: false, 
          error: `Method ${method} Not Allowed` 
        });
      }
    }
  } catch (error) {
    logger.error('Error in astrology API:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    });
  }
} 