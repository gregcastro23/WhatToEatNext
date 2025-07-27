'use client';

import { useEffect, useRef, useState } from 'react';

export default function UpdateDebugger() {
  const renderCount = useRef(0);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [renderTimes, setRenderTimes] = useState<string[]>([]);
  
  // Track render count
  useEffect(() => {
    renderCount.current += 1;
    const now = new Date();
    setLastUpdate(now);
    
    // Keep last 10 render times
    setRenderTimes(prev => {
      const newTimes = [...prev, now.toISOString()];
      return newTimes.slice(-10);
    });
    
    // Check for rapid renders that might indicate an infinite loop
    if ((renderTimes || []).length > 5) {
      const recentRenders = renderTimes.slice(-5);
      const times = (recentRenders || []).map(time => new Date(time).getTime());
      const intervals = times.slice(1).map((time, i) => time - times[i]);
      
      // If we have multiple renders in less than 100ms each, likely an infinite loop
      const rapidRenders = (intervals || []).filter(interval => interval < 100).length;
      if (rapidRenders >= 3) {
        console.error('POSSIBLE INFINITE LOOP DETECTED - RAPID RENDER SEQUENCE');
        console.table({
          renderCount: renderCount.current,
          renderTimes: recentRenders,
          intervals
        });
      }
    }
  }, [renderTimes]);
  
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      right: 0,
      zIndex: 9999,
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      width: '300px',
      maxHeight: '200px',
      overflow: 'auto'
    }}>
      <div>Render count: {renderCount.current}</div>
      <div>Last render: {lastUpdate.toLocaleTimeString()}</div>
      <div style={{ marginTop: '8px' }}>Recent renders:</div>
      <ul style={{ margin: '4px 0', padding: '0 0 0 20px' }}>
        {(renderTimes || []).map((time, i) => (
          <li key={i}>
            {new Date(time).toLocaleTimeString()}.{new Date(time).getMilliseconds()}
          </li>
        ))}
      </ul>
    </div>
  );
} 