'use client';

import { useEffect, useRef, memo } from 'react';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';

const DebugInfoInner = () => {
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

  // Safe access to alchemical values and elemental state
  const alchemicalValues = state?.alchemicalValues || { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 };
  const elementalState = state?.elementalState || { Fire: 0, Water: 0, Earth: 0, Air: 0 };

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg my-4 border border-gray-200 dark:border-gray-700 shadow-sm">
      <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Debug Info</h2>
      <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
        <p><span className="font-medium">Mounted:</span> {hasRenderedRef.current ? 'true' : 'false'}</p>
        <p><span className="font-medium">Renders:</span> {renderCountRef.current}</p>
        <p><span className="font-medium">Current Sign:</span> {planetaryPositions?.sun?.sign || 'unknown'}</p>
        <p><span className="font-medium">Planetary Hour:</span> {state?.planetaryHour || 'Unknown'}</p>
        <p><span className="font-medium">Lunar Phase:</span> {state?.lunarPhase || 'Unknown'}</p>
        
        <h3 className="font-medium mt-3 text-purple-600 dark:text-purple-400">Alchemical Tokens:</h3>
        <ul className="space-y-1 ml-2">
          <li>⦿ Spirit: {alchemicalValues.Spirit.toFixed(4)}</li>
          <li>⦿ Essence: {alchemicalValues.Essence.toFixed(4)}</li>
          <li>⦿ Matter: {alchemicalValues.Matter.toFixed(4)}</li>
          <li>⦿ Substance: {alchemicalValues.Substance.toFixed(4)}</li>
        </ul>
        
        <h3 className="font-medium mt-3 text-orange-600 dark:text-orange-400">Elemental Balance:</h3>
        <ul className="space-y-1 ml-2">
          <li>Fire: {(elementalState.Fire * 100).toFixed(1)}%</li>
          <li>Water: {(elementalState.Water * 100).toFixed(1)}%</li>
          <li>Earth: {(elementalState.Earth * 100).toFixed(1)}%</li>
          <li>Air: {(elementalState.Air * 100).toFixed(1)}%</li>
        </ul>
      </div>
    </div>
  );
};

const DebugInfo = memo(DebugInfoInner);
DebugInfo.displayName = 'DebugInfo';

export default DebugInfo; 
