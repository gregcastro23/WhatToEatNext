'use client';

import { useEffect, useRef, useState } from 'react';
import { useAlchemical } from '../../contexts/AlchemicalContext/hooks';
// TODO: Fix import - add what to import from "./UpdateDebugger.ts"

// Define safe stringification functions
const safeStringify = (obj, maxLength = 100): string => {
  try {
    if (!obj) return 'null';
    if (typeof obj !== 'object') return String(obj);
    
    const str = JSON.stringify(obj);
    if ((str || []).length <= maxLength) return str;
    return str?.substring(0, maxLength - 3) + '...';
  } catch (error) {
    return 'Error stringifying object';
  }
};

// This component will display information from the AlchemicalContext
// and track state changes to identify infinite loops
export default function AlchemicalDebugger() {
  const alchemicalContext = useAlchemical();
  const [renderCount, setRenderCount] = useState(0);
  
  // Store previous state for comparison
  const previousStateRef = useRef<string>('');
  const stateChangeCountRef = useRef<number>(0);
  const [stateChangeCount, setStateChangeCount] = useState(0);
  
  // Update on each render
  useEffect(() => {
    setRenderCount(prev => prev + 1);
    
    // Stringify current state for comparison
    const currentState = safeStringify({
      currentZodiac: alchemicalContext?.state?.astrologicalState?.currentZodiacSign,
      elementalState: alchemicalContext?.state?.elementalState,
      isDaytime: alchemicalContext?.isDaytime,
      planetsCount: Object.keys(alchemicalContext?.planetaryPositions || {}).length
    });
    
    // Check if state has changed
    if (currentState !== previousStateRef.current) {
      stateChangeCountRef.current += 1;
      setStateChangeCount(stateChangeCountRef.current);
      previousStateRef.current = currentState;
    }
  }, [alchemicalContext]);
  
  if (!alchemicalContext) {
    return <div className="p-4 bg-red-100 text-red-800">AlchemicalContext not available</div>;
  }
  
  return (
    <div className="border border-blue-300 bg-blue-50 p-4 mb-4 rounded-lg">
      <h2 className="text-lg font-semibold mb-2">AlchemicalContext Debugger</h2>
      
      <div className="grid grid-cols-2 gap-2 mb-2 text-sm">
        <div className="font-medium">Render count:</div>
        <div>{renderCount}</div>
        
        <div className="font-medium">State changes:</div>
        <div>{stateChangeCount}</div>
        
        <div className="font-medium">Current zodiac:</div>
        <div>{(alchemicalContext.state?.astrologicalState?.currentZodiacSign as string) || 'unknown'}</div>
        
        <div className="font-medium">Is daytime:</div>
        <div>{alchemicalContext.isDaytime ? 'Yes' : 'No'}</div>
      </div>
      
      <details className="mt-2">
        <summary className="cursor-pointer text-sm font-medium">State Details</summary>
        <pre className="mt-2 text-xs bg-gray-100 p-2 overflow-auto max-h-40 rounded">
          {safeStringify(alchemicalContext.state, 1000)}
        </pre>
      </details>
      
      <details className="mt-2">
        <summary className="cursor-pointer text-sm font-medium">Planetary Positions</summary>
        <pre className="mt-2 text-xs bg-gray-100 p-2 overflow-auto max-h-40 rounded">
          {safeStringify(alchemicalContext.planetaryPositions, 1000)}
        </pre>
      </details>
      
      {/* Include the generic update debugger */}
      {/* <UpdateDebugger /> */}
    </div>
  );
} 