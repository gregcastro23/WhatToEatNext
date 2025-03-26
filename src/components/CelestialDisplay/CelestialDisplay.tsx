'use client';

import React, { useEffect, useRef } from 'react';
import { useAlchemical } from '@/contexts/AlchemicalContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Star, Wind, Droplets, Flame, Mountain } from 'lucide-react';
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

export default function CelestialDisplay() {
  const { state } = useAlchemical();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw celestial chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Set dimensions
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) - 20;

      // Draw zodiac wheel
      drawZodiacWheel(ctx, centerX, centerY, radius);

      // Draw celestial bodies
      if (state.celestialPositions.sun) {
        drawCelestialBody(ctx, centerX, centerY, radius, 
          state.celestialPositions.sun.degree, '#fbbf24', 'sun');
      }
      if (state.celestialPositions.moon) {
        drawCelestialBody(ctx, centerX, centerY, radius, 
          state.celestialPositions.moon.degree, '#94a3b8', 'moon');
      }
    } catch (error) {
      logger.error('Error drawing celestial chart:', error);
    }
  }, [state.celestialPositions]);

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
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Star className="text-yellow-500" />
        Celestial Influences
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Celestial Chart */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            className="w-full"
          />
          <div className="absolute top-2 left-2 flex gap-2">
            <div className="flex items-center text-sm text-gray-600">
              <Sun className="w-4 h-4 text-yellow-500 mr-1" />
              {state.celestialPositions.sun?.sign}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Moon className="w-4 h-4 text-gray-400 mr-1" />
              {state.celestialPositions.moon?.sign}
            </div>
          </div>
        </div>

        {/* Elemental Balance */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Current Elemental Balance</h3>
          <div className="space-y-3">
            {Object.entries(state.elementalBalance).map(([element, value]) => {
              const Icon = ELEMENT_ICONS[element as keyof typeof ELEMENT_ICONS];
              return (
                <div key={element} className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Icon 
                        className="w-4 h-4"
                        style={{ color: ELEMENT_COLORS[element as keyof typeof ELEMENT_COLORS] }}
                      />
                      <span className="text-sm font-medium">{element}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {(value * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${value * 100}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full rounded-full"
                      style={{ 
                        backgroundColor: ELEMENT_COLORS[element as keyof typeof ELEMENT_COLORS]
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Last Update */}
      <div className="mt-4 text-sm text-gray-500 flex justify-end">
        Last updated: {new Date(state.lastUpdate).toLocaleTimeString()}
      </div>
    </div>
  );
} 