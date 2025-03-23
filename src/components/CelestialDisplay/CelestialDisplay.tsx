'use client';

import React, { useEffect, useRef } from 'react';
import { useAstrologicalState } from '@/hooks/useAstrologicalState';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Star, Wind, Droplets, Flame, Mountain, Info } from 'lucide-react';
import { logger } from '@/utils/logger';
import PlanetaryHoursDisplay from '@/components/PlanetaryHours';

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

      // Draw celestial bodies
      if (planetaryAlignment.sun) {
        drawCelestialBody(ctx, centerX, centerY, radius, 
          planetaryAlignment.sun.degree, '#fbbf24', 'sun');
      }
      if (planetaryAlignment.moon) {
        drawCelestialBody(ctx, centerX, centerY, radius, 
          planetaryAlignment.moon.degree, '#94a3b8', 'moon');
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
    // Draw zodiac circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw zodiac divisions
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30) * Math.PI / 180;
      const x1 = centerX + (radius - 10) * Math.cos(angle);
      const y1 = centerY + (radius - 10) * Math.sin(angle);
      const x2 = centerX + radius * Math.cos(angle);
      const y2 = centerY + radius * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  };

  const drawCelestialBody = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    degree: number,
    color: string,
    type: 'sun' | 'moon'
  ) => {
    const angle = (degree - 90) * Math.PI / 180;
    const x = centerX + radius * 0.8 * Math.cos(angle);
    const y = centerY + radius * 0.8 * Math.sin(angle);

    ctx.beginPath();
    ctx.arc(x, y, type === 'sun' ? 8 : 6, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  };

  return (
    <div className="relative p-4 bg-gray-900 bg-opacity-75 rounded-lg shadow-md overflow-hidden">
      <h3 className="text-lg font-medium text-white mb-3">Celestial Chart</h3>
      
      <div className="aspect-square relative">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full"
          style={{ background: 'rgba(13, 17, 23, 0.7)' }}
        ></canvas>
        <div className="absolute bottom-1 left-1 right-1 bg-gray-900 bg-opacity-80 p-2 rounded flex justify-between">
          <div className="flex flex-col text-xs space-y-1">
            <div className="flex items-center text-gray-200">
              <span className="font-medium mr-1">Current Sign:</span> 
              <span className="text-yellow-400">{state.currentZodiac}</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center text-sm text-gray-600">
                <Sun className="w-4 h-4 text-yellow-500 mr-1" />
                {planetaryAlignment?.sun?.sign}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Moon className="w-4 h-4 text-gray-400 mr-1" />
                {planetaryAlignment?.moon?.sign}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col text-xs text-gray-400">
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
      
      {/* Add planetary hours display in compact mode */}
      <div className="mt-4">
        <PlanetaryHoursDisplay compact={true} />
      </div>
    </div>
  );
} 