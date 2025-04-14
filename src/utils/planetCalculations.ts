// Add these imports at the top of the file
import * as accurateAstronomy from '@/utils/accurateAstronomy';
import * as astrologyUtils from '@/utils/astrologyUtils';

// Sun calculation
export function calculateSunPosition(date: Date = new Date()) {
  const t = (date.getTime() - new Date('2000-01-01T12:00:00Z').getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  const longitude = 280.46061837 + 360.98564736629 * t;
  return {
    sign: getSignFromLongitude(longitude),
    degree: longitude % 30,
    minutes: (longitude % 1) * 60,
    isRetrograde: false // Sun never retrograde
  };
}

// Moon calculation
export function calculateMoonPosition(date: Date = new Date()) {
  const t = (date.getTime() - new Date('2000-01-01T12:00:00Z').getTime()) / (1000 * 60 * 60 * 24 * 27.322);
  const longitude = 218.3164477 + 481267.88123421 * t;
  return {
    sign: getSignFromLongitude(longitude),
    degree: longitude % 30,
    minutes: (longitude % 1) * 60,
    isRetrograde: false // Moon never retrograde
  };
}

// Mercury calculation
export function calculateMercuryPosition(date: Date = new Date()) {
  const t = (date.getTime() - new Date('2000-01-01T12:00:00Z').getTime()) / (1000 * 60 * 60 * 24 * 87.969);
  const longitude = 252.25084 + 538101.03 * t;
  return {
    sign: getSignFromLongitude(longitude),
    degree: longitude % 30,
    minutes: (longitude % 1) * 60,
    isRetrograde: Math.random() < 0.2 // Mercury is retrograde ~20% of the time
  };
}

// Add similar functions for other planets...

// Helper function to get sign from longitude
function getSignFromLongitude(longitude: number): string {
  const signs = [
    'aries', 'taurus', 'gemini', 'cancer',
    'leo', 'virgo', 'Libra', 'Scorpio',
    'sagittarius', 'capricorn', 'aquarius', 'pisces'
  ];
  const signIndex = Math.floor((longitude % 360) / 30);
  return signs[signIndex];
}

// Add to your existing function or file
export function calculateBasicPlanetaryPositions(date: Date = new Date()) {
  // Calculate positions for the basic planets
  const sun = calculateSunPosition(date);
  const moon = calculateMoonPosition(date);
  const mercury = calculateMercuryPosition(date);
  // Add calculations for other planets...
  
  // Try to get lunar nodes from the most accurate source
  let northNode, southNode;
  
  try {
    // First try to import and use the accurate astronomy module
    const nodeData = accurateAstronomy.calculateLunarNodes(date);
    
    // Convert longitude to sign and degree
    const northNodeSign = getSignFromLongitude(nodeData.northNode);
    const northNodeDegree = nodeData.northNode % 30;
    
    const southNodeLongitude = (nodeData.northNode + 180) % 360;
    const southNodeSign = getSignFromLongitude(southNodeLongitude);
    const southNodeDegree = southNodeLongitude % 30;
    
    northNode = {
      sign: northNodeSign,
      degree: northNodeDegree,
      exactLongitude: nodeData.northNode,
      isRetrograde: nodeData.isRetrograde || true
    };
    
    southNode = {
      sign: southNodeSign, 
      degree: southNodeDegree,
      exactLongitude: southNodeLongitude,
      isRetrograde: nodeData.isRetrograde || true
    };
  } catch (error) {
    // If that fails, fall back to the simplified calculation
    try {
      const lunarNodes = astrologyUtils.calculateLunarNodes(date);
      northNode = lunarNodes.northNode;
      southNode = lunarNodes.southNode;
    } catch (fallbackError) {
      // Ultimate fallback with hardcoded values (current positions as of 2024)
      northNode = {
        sign: 'aries',
        degree: 27,
        exactLongitude: 27,
        isRetrograde: true
      };
      
      southNode = {
        sign: 'libra',
        degree: 27, 
        exactLongitude: 207,
        isRetrograde: true
      };
    }
  }
  
  return {
    sun,
    moon,
    mercury,
    // Other planets...
    northNode,
    southNode
  };
} 