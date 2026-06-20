"use client";

import { motion } from 'framer-motion';
import React from 'react';

/**
 * CosmicVoidBackground.tsx
 * A reusable, performant background component for the "Alchemical Laboratory" design system.
 * Uses Tailwind CSS for styling and Framer Motion for subtle celestial animations.
 */

interface CosmicVoidProps {
  intensity?: 'low' | 'medium';
  className?: string;
}

const CosmicVoidBackground: React.FC<CosmicVoidProps> = ({ 
  intensity = 'low', 
  className = "" 
}) => {
  // Intensity mapping for opacity levels
  const opacityMap = {
    low: {
      grid: 'opacity-[0.02]',
      stars: 0.3,
      nebula: 'opacity-[0.03]',
    },
    medium: {
      grid: 'opacity-[0.04]',
      stars: 0.6,
      nebula: 'opacity-[0.06]',
    }
  };

  const currentOpacity = opacityMap[intensity];

  // Procedural Star Data
  const stars = [
    { id: 1, top: '10%', left: '15%', size: 1, color: 'white', delay: 0 },
    { id: 2, top: '25%', left: '80%', size: 2, color: 'white', delay: 2 },
    { id: 3, top: '45%', left: '30%', size: 1.5, color: 'fire', delay: 1 },
    { id: 4, top: '60%', left: '70%', size: 1, color: 'white', delay: 3 },
    { id: 5, top: '85%', left: '20%', size: 2, color: 'water', delay: 0.5 },
    { id: 6, top: '15%', left: '50%', size: 1, color: 'white', delay: 4 },
    { id: 7, top: '70%', left: '40%', size: 1.5, color: 'earth', delay: 1.5 },
    { id: 8, top: '35%', left: '10%', size: 1, color: 'white', delay: 2.5 },
    { id: 9, top: '50%', left: '90%', size: 2, color: 'air', delay: 3.5 },
    { id: 10, top: '80%', left: '85%', size: 1, color: 'violet', delay: 0.2 },
    { id: 11, top: '5%', left: '75%', size: 1.5, color: 'white', delay: 1.2 },
    { id: 12, top: '90%', left: '55%', size: 1, color: 'white', delay: 2.8 },
    { id: 13, top: '20%', left: '40%', size: 1, color: 'white', delay: 5 },
    { id: 14, top: '65%', left: '15%', size: 2, color: 'copper', delay: 0.8 },
    { id: 15, top: '40%', left: '60%', size: 1, color: 'white', delay: 1.1 },
  ];

  const getColor = (color: string) => {
    switch (color) {
      case 'fire': return 'oklch(0.74 0.17 35)';
      case 'water': return 'oklch(0.74 0.13 230)';
      case 'earth': return 'oklch(0.74 0.11 130)';
      case 'air': return 'oklch(0.85 0.07 90)';
      case 'violet': return 'oklch(0.72 0.18 305)';
      case 'copper': return 'oklch(0.78 0.14 65)';
      default: return '#FFFFFF';
    }
  };

  return (
    <div 
      className={`fixed inset-0 -z-10 overflow-hidden bg-[#07060B] select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {/* 1. The Base: Deep Void with Radial Depth Mask */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,12,22,0.8)_0%,#07060B_100%)]" />

      {/* 2. Astrolabe / Grid Motif (Ancient Navigation Chart) */}
      <div className={`absolute inset-0 flex items-center justify-center ${currentOpacity.grid}`}>
        {/* Large Concentric Circles */}
        <div className="absolute w-[80vw] h-[80vw] border border-white rounded-full" />
        <div className="absolute w-[120vw] h-[120vw] border border-white rounded-full opacity-50" />
        
        {/* Crosshair / Grid Lines */}
        <div className="absolute w-px h-full bg-gradient-to-b from-transparent via-white to-transparent opacity-30" />
        <div className="absolute h-px w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30" />
        
        {/* Diamond Geometric Accent */}
        <div className="absolute w-[40vw] h-[40vw] border border-white rotate-45 opacity-20" />
      </div>

      {/* 3. Nebula Glow (Blurred Atmospheric Pockets) */}
      <motion.div 
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.03, 0.05, 0.03],
          x: [0, 20, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className={`absolute -top-1/4 -left-1/4 w-[70vw] h-[70vw] rounded-full blur-[120px] bg-[oklch(0.72_0.18_305)] ${currentOpacity.nebula}`} 
      />
      
      <motion.div 
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.02, 0.04, 0.02],
          x: [0, -30, 0],
          y: [0, 10, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className={`absolute -bottom-1/4 -right-1/4 w-[60vw] h-[60vw] rounded-full blur-[120px] bg-[oklch(0.78_0.14_65)] ${currentOpacity.nebula}`} 
      />

      {/* 4. Procedural Stardust (Stars) */}
      <div className="absolute inset-0">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            initial={{ opacity: 0.2 }}
            animate={{ 
              opacity: [0.2, currentOpacity.stars, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 4,
              repeat: Infinity,
              delay: star.delay,
              ease: "easeInOut",
            }}
            className="absolute rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)]"
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: getColor(star.color),
              boxShadow: `0 0 ${star.size * 4}px ${getColor(star.color)}`,
            }}
          />
        ))}
      </div>

      {/* 5. Edge Vignette for Focus */}
      <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />
    </div>
  );
};

export default CosmicVoidBackground;
