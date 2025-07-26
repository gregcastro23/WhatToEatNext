'use client'

import React, { useState, useEffect, useRef } from 'react';
interface InfiniteLoopDetectorProps {
  threshold?: any;
  timeWindow?: any;
  reportOnly?: any;
  children: unknown;
}


interface Props {
  threshold?: number; // Number of renders in a short time that indicates a loop
  timeWindow?: number; // Time window in ms to consider for detecting loops
  reportOnly?: boolean; // If true, only logs to console without visual indication
  children?: React.ReactNode;
}

/**
 * Component that detects infinite render loops by monitoring render frequency
 * Can be wrapped around any component that's suspected to have infinite loops
 */
export function InfiniteLoopDetector({
  threshold = 30,
  timeWindow = 1000,
  reportOnly = false,
  children
}: Props) {
  const renderCount = useRef(0);
  const lastResetTime = useRef(Date.now());
  const [isLooping, setIsLooping] = useState(false);
  const loopDetectedRef = useRef(false);
  
  // We use a ref for the component stack to avoid triggering re-renders
  const componentStackRef = useRef<string>('');
  
  // Get the component stack trace - helps identify which component is causing the loop
  useEffect(() => {
    try {
      // Create an error to get stack trace
      const err = new Error('Loop detection trace');
      componentStackRef.current = err.stack || '';
    } catch (e) {
      // Ignore errors from stack trace generation
    }
  }, []);

  // Increment render count and check for loops
  useEffect(() => {
    renderCount.current += 1;
    
    const now = Date.now();
    const timeElapsed = now - lastResetTime.current;
    
    // Only check for loops after the component has had time to stabilize
    if (timeElapsed > 100) {
      if (timeElapsed < timeWindow && renderCount.current > threshold) {
        if (!loopDetectedRef.current) {
          loopDetectedRef.current = true;
          
          // Create a simplified stack trace that's easier to read
          const errorLocation = new Error()?.stack
            ?.split('\n')
            .slice(2, 3)
            .map(line => line?.trim())
            .join(' ');
          
          console.error(
            `⚠️ INFINITE LOOP DETECTED: ${renderCount.current} renders in ${timeElapsed}ms`,
            {
              renderCount: renderCount.current,
              timeElapsed,
              rendersPerSecond: (renderCount.current / timeElapsed) * 1000,
              componentStack: componentStackRef.current,
              suspectedComponent: errorLocation
            }
          );
          
          if (!reportOnly) {
            setIsLooping(true);
          }
          
          // Add a hook to React DevTools
          if ((window as unknown as Record<string, any>).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
            (window as unknown as Record<string, any>).__REACT_DEVTOOLS_GLOBAL_HOOK__.__INFINITE_LOOP_DETECTED__ = {
              componentStack: componentStackRef.current,
              rendersPerSecond: (renderCount.current / timeElapsed) * 1000,
              timestamp: new Date()?.toISOString()
            };
          }
        }
      }
    }
    
    // Reset counters if enough time has passed
    if (timeElapsed > timeWindow) {
      lastResetTime.current = now;
      renderCount.current = 0;
      loopDetectedRef.current = false;
    }
  });
  
  // If loop detected and not in report-only mode, show warning
  if (isLooping && !reportOnly) {
    return (
      <div className="p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
        <h3 className="font-bold">Infinite Loop Detected!</h3>
        <p>This component is re-rendering too frequently, indicating an infinite loop.</p>
        <details>
          <summary className="cursor-pointer text-sm mt-2">Technical details</summary>
          <pre className="text-xs mt-2 p-2 bg-gray-100 overflow-auto max-h-40">
            {componentStackRef.current}
          </pre>
        </details>
      </div>
    );
  }
  
  // Otherwise, render children normally
  return <>{children}</>;
}

export default InfiniteLoopDetector; 