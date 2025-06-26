'use client';

import { useState, useEffect, useRef, memo } from 'react';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';

const DebugInfo = memo(function DebugInfo() {
  const renderCountRef = useRef(1); // Initialize with 1 for the first render
  const hasRenderedRef = useRef(false);
  const { planetaryPositions, state } = useAlchemical();

  // Only run once to mark component as mounted
  useEffect(() => {
    if (!hasRenderedRef.current) {
      hasRenderedRef.current = true;
    }
    
    // Cleanup function to prevent memory leaks
    return () => {
      hasRenderedRef.current = false;
    };
  }, []);

  // Only increment for renders after the initial one
  if (hasRenderedRef.current) {
    renderCountRef.current += 1;
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg my-4">
      <h2 className="text-lg font-semibold mb-2">Debug Info</h2>
      <div className="space-y-2 text-sm">
        <p>Mounted: {hasRenderedRef.current ? 'true' : 'false'}</p>
        <p>Renders: {renderCountRef.current}</p>
        <p>Current Sign: {(planetaryPositions?.sun as unknown)?.sign || 'unknown'}</p>
        <p>Planetary Hour: {(state?.astrologicalState?.planetaryHour as string) || 'Unknown'}</p>
        <p>Lunar Phase: {state?.lunarPhase || 'Unknown'}</p>
        
        <h3 className="font-medium mt-3">Alchemical Tokens:</h3>
        <ul className="space-y-1">
          <li>⦿ Spirit: {state?.alchemicalValues?.Spirit.toFixed(4) || '0.0000'}</li>
          <li>⦿ Essence: {state?.alchemicalValues?.Essence.toFixed(4) || '0.0000'}</li>
          <li>⦿ Matter: {state?.alchemicalValues?.Matter.toFixed(4) || '0.0000'}</li>
          <li>⦿ Substance: {state?.alchemicalValues?.Substance.toFixed(4) || '0.0000'}</li>
        </ul>
        
        <h3 className="font-medium mt-3">Elemental Balance:</h3>
        <ul className="space-y-1">
          <li>Fire: {(state?.elementalState?.Fire * 100).toFixed(1)}%</li>
          <li>Water: {(state?.elementalState?.Water * 100).toFixed(1)}%</li>
          <li>Earth: {(state?.elementalState?.Earth * 100).toFixed(1)}%</li>
          <li>Air: {(state?.elementalState?.Air * 100).toFixed(1)}%</li>
        </ul>
      </div>
    </div>
  );
});

export default DebugInfo; 