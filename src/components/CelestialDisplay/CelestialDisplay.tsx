'use client';

import { Star, Wind, Droplets, Flame, Mountain } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

import PlanetaryHoursDisplay from '@/components/PlanetaryHours';
import { useAstrologicalState } from '@/hooks/useAstrologicalState';
import { CelestialPosition, PlanetaryAlignment } from '@/types/celestial';
import { logger } from '@/utils/logger';

const ELEMENT_COLORS = {
  Fire: '#ef4444',
  Earth: '#84cc16',
  Air: '#60a5fa',
  Water: '#06b6d4'
};

const ELEMENT_ICONS = {
  Fire: Flame,
  Earth: Mountain,
  Air: Wind,
  Water: Droplets
};

// Mapping of planet names to their astrological symbols
const PLANET_SYMBOLS = {
  sun: '☉',
  moon: '☽',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇',
  northNode: '☊',
  southNode: '☋'
};

// Mapping of planets to their display colors
const PLANET_COLORS = {
  sun: '#fbbf24',     // Gold/yellow
  moon: '#e5e7eb',    // Silver/white
  mercury: '#94a3b8', // Gray
  venus: '#22c55e',   // Green
  mars: '#ef4444',    // Red
  jupiter: '#3b82f6', // Blue
  saturn: '#6b7280',  // Dark gray
  uranus: '#8b5cf6',  // Purple
  neptune: '#06b6d4', // Cyan
  pluto: '#6b21a8',   // Dark purple
  northNode: '#f97316', // Orange for North Node
  southNode: '#14b8a6'  // Teal for South Node
};

export default function CelestialDisplay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useAstrologicalState();
  const planetaryAlignment = state.currentPlanetaryAlignment;

  useEffect(() => {
    if (!canvasRef.current || !planetaryAlignment) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const containerWidth = canvas.clientWidth;
    const containerHeight = canvas.clientHeight;
    canvas.width = containerWidth;
    canvas.height = containerHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, containerWidth, containerHeight);
    
    // Calculate center and radius
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    try {
      // Draw the celestial chart
      drawZodiacWheel(ctx, centerX, centerY, radius);
      
      // Type assertion for planetaryAlignment
      const alignment = planetaryAlignment as PlanetaryAlignment;
      
      // Get all planets from the alignment (excluding nodes)
      const planets = Object.entries(alignment)
        .filter(([name]) => name !== 'northNode' && name !== 'southNode' && name !== '_retrogrades')
        .sort((a, b) => {
          // Sort by importance (sun and moon first, then inner planets, then outer planets)
          const order = {
            sun: 1, moon: 2, 
            mercury: 3, venus: 4, mars: 5, 
            jupiter: 6, saturn: 7, uranus: 8, neptune: 9, pluto: 10
          };
          return (order[a[0] as keyof typeof order] || 99) - (order[b[0] as keyof typeof order] || 99);
        });

      // Draw celestial bodies at different distances from center to avoid crowding
      planets.forEach(([planet, position], _index) => {
        // Use proper typing instead of type assertions
        const pos = position as CelestialPosition;
        if (!pos || typeof pos.exactLongitude !== 'number') return;
        
        // Calculate distance from center based on traditional orbital distance
        // Inner planets closer to center, outer planets further out
        let distanceFactor;
        switch (planet) {
          case 'sun': distanceFactor = 0.3; break;
          case 'moon': distanceFactor = 0.35; break;
          case 'mercury': distanceFactor = 0.4; break;
          case 'venus': distanceFactor = 0.45; break;
          case 'mars': distanceFactor = 0.5; break;
          case 'jupiter': distanceFactor = 0.6; break;
          case 'saturn': distanceFactor = 0.65; break;
          case 'uranus': distanceFactor = 0.7; break;
          case 'neptune': distanceFactor = 0.75; break;
          case 'pluto': distanceFactor = 0.8; break;
          default: distanceFactor = 0.5;
        }
        
        drawCelestialBody(
          ctx, centerX, centerY, radius, 
          pos.exactLongitude, 
          PLANET_COLORS[planet as keyof typeof PLANET_COLORS] || '#ffffff',
          planet,
          distanceFactor
        );
      });
      
      // Draw lunar nodes outside the zodiac wheel if they exist
      const northNode = alignment.northNode as CelestialPosition;
      const southNode = alignment.southNode as CelestialPosition;
      
      if (northNode && typeof northNode.exactLongitude === 'number') {
        drawLunarNode(
          ctx, centerX, centerY, radius, 
          northNode.exactLongitude, 
          PLANET_COLORS.northNode,
          'northNode',
          1.1 // Outside the wheel
        );
      }
      
      if (southNode && typeof southNode.exactLongitude === 'number') {
        drawLunarNode(
          ctx, centerX, centerY, radius, 
          southNode.exactLongitude, 
          PLANET_COLORS.southNode,
          'southNode',
          1.1 // Outside the wheel
        );
      }
      
    } catch (error) {
      logger.error('Error drawing celestial chart:', error);
    }
  }, [planetaryAlignment]);

  const drawZodiacWheel = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number
  ) => {
    // Draw zodiac circle with subtle glow
    ctx.shadowColor = 'rgba(255, 255, 255, 0.2)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Draw inner circle for aesthetic
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.92, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(229, 231, 235, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Zodiac symbols and colors for each sign
    const symbols = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
    const elementColors = {
      fire: 'rgba(239, 68, 68, 0.6)', // Fire - aries, leo, sagittarius (0, 4, 8)
      earth: 'rgba(132, 204, 22, 0.6)', // Earth - taurus, virgo, capricorn (1, 5, 9)
      air: 'rgba(96, 165, 250, 0.6)', // Air - gemini, Libra, aquarius (2, 6, 10)
      water: 'rgba(6, 182, 212, 0.6)' // Water - cancer, Scorpio, pisces (3, 7, 11)
    };
    
    // Draw zodiac divisions
    for (let i = 0; i < 12; i++) {
      const startAngle = (i * 30) * Math.PI / 180;
      const endAngle = ((i + 1) * 30) * Math.PI / 180;
      const midAngle = (startAngle + endAngle) / 2;
      
      // Draw dividing lines
      const x1 = centerX + (radius - 10) * Math.cos(startAngle);
      const y1 = centerY + (radius - 10) * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(startAngle);
      const y2 = centerY + radius * Math.sin(startAngle);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      // Draw segments with element-based color
      let elementColor;
      if (i % 4 === 0) elementColor = elementColors.fire;
      else if (i % 4 === 1) elementColor = elementColors.earth;
      else if (i % 4 === 2) elementColor = elementColors.air;
      else elementColor = elementColors.water;
      
      // Draw colored arc for segment
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.96, startAngle, endAngle);
      ctx.arc(centerX, centerY, radius * 0.92, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = elementColor;
      ctx.fill();
      
      // Add zodiac symbols at the edge of the wheel
      const symbolRadius = radius + 18;
      const symbolX = centerX + symbolRadius * Math.cos(midAngle);
      const symbolY = centerY + symbolRadius * Math.sin(midAngle);
      
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 3;
      ctx.font = '14px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(symbols[i], symbolX, symbolY);
      ctx.shadowBlur = 0;
      
      // Add degree markers every 10 degrees
      for (let deg = 0; deg < 30; deg += 10) {
        if (deg === 0) continue; // Skip 0 as we already have the main division
        
        const markerAngle = (i * 30 + deg) * Math.PI / 180;
        const markerLength = deg % 30 === 0 ? 10 : 5; // Longer markers at 0, 30, 60...
        
        const mx1 = centerX + (radius - markerLength) * Math.cos(markerAngle);
        const my1 = centerY + (radius - markerLength) * Math.sin(markerAngle);
        const mx2 = centerX + radius * Math.cos(markerAngle);
        const my2 = centerY + radius * Math.sin(markerAngle);
        
        ctx.beginPath();
        ctx.moveTo(mx1, my1);
        ctx.lineTo(mx2, my2);
        ctx.strokeStyle = 'rgba(229, 231, 235, 0.5)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }
  };

  const drawCelestialBody = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    longitude: number,
    color: string,
    planet: string,
    distanceFactor = 0.8
  ) => {
    // Convert longitude to angle (0° longitude = 90° in canvas coordinates)
    const angle = ((longitude - 90) % 360) * Math.PI / 180;
    const distance = radius * distanceFactor;
    const x = centerX + distance * Math.cos(angle);
    const y = centerY + distance * Math.sin(angle);
    
    // Get size based on planet importance
    let size = 10;
    if (planet === 'sun' || planet === 'moon') size = 12;
    else if (planet === 'mercury' || planet === 'venus' || planet === 'mars') size = 10;
    else size = 9; // Slightly smaller for outer planets
    
    // Draw a circle background with dark glow for better visibility
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Draw colored ring
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = planet === 'sun' || planet === 'moon' ? 2.5 : 2;
    ctx.stroke();
    
    // Draw the symbol
    ctx.font = `${planet === 'sun' || planet === 'moon' ? 15 : 13}px Arial`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(PLANET_SYMBOLS[planet as keyof typeof PLANET_SYMBOLS] || planet.charAt(0).toUpperCase(), x, y);
    
    // Add small label below for better identification (only for major planets)
    if (['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'].includes(planet)) {
      const labelDistance = distance + (size / radius) * 0.3;
      const labelX = centerX + radius * labelDistance * Math.cos(angle);
      const labelY = centerY + radius * labelDistance * Math.sin(angle);
      
      ctx.font = '8px Arial';
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(planet.charAt(0).toUpperCase(), labelX, labelY);
    }
  };
  
  // Adjust lunar nodes rendering to make them more distinct
  const drawLunarNode = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    longitude: number,
    color: string,
    nodeType: 'northNode' | 'southNode',
    distanceFactor = 1.1
  ) => {
    // Convert longitude to angle (0° longitude = 90° in canvas coordinates)
    const angle = ((longitude - 90) % 360) * Math.PI / 180;
    const distance = radius * distanceFactor;
    const x = centerX + distance * Math.cos(angle);
    const y = centerY + distance * Math.sin(angle);

    // Draw a larger background for nodes to make them stand out
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fill();
    
    // Draw colored ring
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3; // Make line thicker
    ctx.stroke();
    
    // Draw the node symbol
    const symbol = nodeType === 'northNode' ? '☊' : '☋';
    ctx.font = '18px Arial'; // Larger font
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbol, x, y);
    
    // Draw a line connecting to the wheel
    ctx.beginPath();
    ctx.moveTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5; // Slightly thicker line
    ctx.setLineDash([3, 3]); // More visible dash pattern
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Add small label
    const labelRadius = radius * (distanceFactor + 0.08);
    const labelX = centerX + labelRadius * Math.cos(angle);
    const labelY = centerY + labelRadius * Math.sin(angle);
    
    ctx.font = '9px Arial';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(nodeType === 'northNode' ? 'N.Node' : 'S.Node', labelX, labelY);
  };

  return (
    <div className="relative p-4 bg-gray-900 bg-opacity-75 rounded-lg shadow-md overflow-hidden">
      <h3 className="text-lg font-medium text-white mb-3 flex items-center">
        <Star className="w-5 h-5 mr-2 text-yellow-500" />
        Celestial Positions
      </h3>
      
      <div className="aspect-square relative">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full"
          style={{ background: 'rgba(13, 17, 23, 0.7)' }}
        ></canvas>
        <div className="absolute bottom-1 left-1 right-1 bg-gray-900 bg-opacity-90 p-2 rounded flex justify-between">
          <div className="flex flex-col text-xs space-y-1">
            <div className="flex items-center text-gray-200">
              <span className="font-medium mr-1">Current Sign:</span> 
              <span className="text-yellow-400 capitalize">{state.currentZodiac}</span>
            </div>
            <div className="flex flex-wrap gap-x-3">
              <div className="flex items-center text-sm text-gray-400">
                <span className="text-yellow-500 mr-1">{PLANET_SYMBOLS.sun}</span>
                <span className="capitalize">
                  {(planetaryAlignment as PlanetaryAlignment).Sun?.sign}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <span className="text-gray-300 mr-1">{PLANET_SYMBOLS.moon}</span>
                <span className="capitalize">
                  {(planetaryAlignment as PlanetaryAlignment).Moon?.sign}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <span className="text-orange-500 mr-1">{PLANET_SYMBOLS.northNode}</span>
                <span className="capitalize">
                  {(planetaryAlignment as PlanetaryAlignment).northNode?.sign}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col text-xs text-gray-400">
            <span className="text-gray-300 text-xs mb-1">Elements:</span>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${ELEMENT_COLORS['Fire']}`}></div>
                <span>Fire</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${ELEMENT_COLORS['Earth']}`}></div>
                <span>Earth</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${ELEMENT_COLORS['Air']}`}></div>
                <span>Air</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${ELEMENT_COLORS['Water']}`}></div>
                <span>Water</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add planetary hours display in compact mode */}
      <div className="mt-4">
        <PlanetaryHoursDisplay compact={true} />
      </div>
    </div>
  );
} 